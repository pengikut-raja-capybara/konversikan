import { cos_sim } from '@huggingface/transformers'
import type { Curriculum, MatchResult, MataKuliah, Recommendation, TranscriptCourse } from '../types'
import type {
  FeatureExtractor,
  ProgressStage,
  SemanticMatchOptions,
  SemanticProgress,
} from '../types/semantic'
import { flattenMK } from './matching'
import { calculateSimilarity } from './similarity'

const MODEL_ID = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2'
const SEMANTIC_THRESHOLD = 0.55

const BLACKLIST = [
  'tugas akhir', 'skripsi', 'thesis', 'kerja praktek', 'kerja praktik',
  'magang', 'pkl', 'kkn', 'non-akademik', 'ekstrakurikuler',
  'kerja profesi', 'proyek akhir',
]

const VALID_GRADES = new Set([
  'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'AB', 'BC', 'CB',
])

let extractorPromise: Promise<FeatureExtractor> | null = null
let modelReady = false
const embeddingCache = new Map<string, number[]>()

export function isSemanticModelReady(): boolean {
  return modelReady
}

function isBlacklisted(tc: TranscriptCourse): boolean {
  const norm = (tc.nama ?? '').toLowerCase()
  return BLACKLIST.some((bl) => norm.includes(bl))
}

function hasValidGrade(tc: TranscriptCourse): boolean {
  if (!tc.nilai) return true
  return VALID_GRADES.has(tc.nilai.trim().toUpperCase())
}

function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

function emitProgress(
  onProgress: SemanticMatchOptions['onProgress'],
  stage: ProgressStage,
  processed: number,
  total: number,
  message: string,
  extra: Pick<SemanticProgress, 'cacheHits' | 'cacheMisses'> = {},
) {
  if (!onProgress) return

  const safeTotal = total <= 0 ? 1 : total
  const percent = Math.max(0, Math.min(100, Math.round((processed / safeTotal) * 100)))
  onProgress({ stage, processed, total, percent, message, ...extra })
}

async function getExtractor(): Promise<FeatureExtractor> {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const mod = await import('@huggingface/transformers') as { pipeline: (...args: unknown[]) => Promise<unknown> }
      const loaded = await mod.pipeline('feature-extraction', MODEL_ID)
      modelReady = true
      return loaded as FeatureExtractor
    })()
  }
  const extractor = await extractorPromise
  modelReady = true
  return extractor
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

function tensorRowsToMatrix(output: unknown): number[][] {
  if (!output || typeof output !== 'object') return []

  const maybeTensor = output as {
    data?: Float32Array | number[]
    dims?: number[]
    tolist?: () => unknown
  }

  if (typeof maybeTensor.tolist === 'function') {
    const listed = maybeTensor.tolist()
    if (Array.isArray(listed) && Array.isArray(listed[0])) {
      return listed as number[][]
    }
    if (Array.isArray(listed)) {
      return [listed as number[]]
    }
  }

  if (!maybeTensor.data || !maybeTensor.dims) return []

  const data = Array.from(maybeTensor.data)
  const dims = maybeTensor.dims

  if (dims.length === 1) return [data]
  if (dims.length !== 2) return []

  const [rows, cols] = dims
  const matrix: number[][] = []
  for (let r = 0; r < rows; r++) {
    matrix.push(data.slice(r * cols, (r + 1) * cols))
  }
  return matrix
}

async function embedTexts(
  texts: string[],
  stage: ProgressStage,
  onProgress?: SemanticMatchOptions['onProgress'],
): Promise<number[][]> {
  if (texts.length === 0) return []

  const normalized = texts.map(normalizeText)
  const resultVectors: Array<number[] | undefined> = new Array(normalized.length)

  let cacheHits = 0
  const missingTexts: string[] = []
  const seenMissing = new Set<string>()

  normalized.forEach((text, idx) => {
    const cached = embeddingCache.get(text)
    if (cached) {
      resultVectors[idx] = cached
      cacheHits += 1
      return
    }

    if (!seenMissing.has(text)) {
      seenMissing.add(text)
      missingTexts.push(text)
    }
  })

  const cacheMisses = missingTexts.length
  emitProgress(
    onProgress,
    stage,
    cacheHits,
    normalized.length,
    cacheMisses === 0 ? 'Semua embedding diambil dari cache.' : 'Menggunakan cache embedding dan encoding data baru...',
    { cacheHits, cacheMisses },
  )

  if (cacheMisses > 0) {
    const extractor = await getExtractor()

    const batches = chunkArray(missingTexts, 24)
    let encodedCount = 0

    for (const batch of batches) {
      const output = await extractor(batch, {
      pooling: 'mean',
      normalize: true,
    })

      const matrix = tensorRowsToMatrix(output)
      matrix.forEach((vec, i) => {
        const text = batch[i]
        if (!text) return
        embeddingCache.set(text, vec)
      })

      encodedCount += batch.length
      emitProgress(
        onProgress,
        stage,
        cacheHits + encodedCount,
        normalized.length,
        'Menghitung embedding semantic...',
        { cacheHits, cacheMisses },
      )
    }
  }

  for (let i = 0; i < normalized.length; i++) {
    const vector = embeddingCache.get(normalized[i])
    resultVectors[i] = vector ?? []
  }

  return resultVectors.map((v) => v ?? [])
}

function topRecommendations(
  sourceText: string,
  sourceVec: number[],
  targetVecs: number[][],
  allMK: MataKuliah[],
  limit = 5,
): Recommendation[] {
  const normalizeScore = (value: number) => Math.max(0, Math.min(1, value))

  const ranked = targetVecs
    .map((vec, idx) => ({
      match: allMK[idx],
      score: (() => {
        const semanticScore = normalizeScore(cos_sim(sourceVec, vec))
        const lexicalScore = calculateSimilarity(sourceText, allMK[idx].nama)

        // Hybrid scoring: keep semantic power but don't miss obvious lexical overlap.
        return Math.max(semanticScore, lexicalScore)
      })(),
    }))
    .filter((item) => Number.isFinite(item.score))
    .sort((a, b) => b.score - a.score)

  const deduped: Recommendation[] = []
  const seen = new Set<string>()

  for (const item of ranked) {
    const key = `${item.match.kode ?? ''}::${item.match.nama}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(item)
    if (deduped.length >= limit) break
  }

  return deduped
}

export async function matchTranscriptSemantic(
  transcript: TranscriptCourse[],
  curriculum: Curriculum,
  options: SemanticMatchOptions = {},
): Promise<MatchResult[]> {
  const { onProgress } = options

  const firstLoad = !isSemanticModelReady()
  emitProgress(
    onProgress,
    'loading_model',
    0,
    1,
    firstLoad
      ? 'Pertama kali: mengunduh model AI semantic...'
      : 'Menyiapkan model AI semantic dari cache lokal...',
  )
  await getExtractor()
  emitProgress(
    onProgress,
    'loading_model',
    1,
    1,
    firstLoad
      ? 'Model AI selesai diunduh dan siap digunakan.'
      : 'Model AI siap digunakan.',
  )

  const allMK = flattenMK(curriculum)
  const sourceTexts = transcript.map((t) => t.nama)
  const targetTexts = allMK.map((m) => m.nama)

  const [sourceEmbeddings, targetEmbeddings] = await Promise.all([
    embedTexts(sourceTexts, 'encoding_source', onProgress),
    embedTexts(targetTexts, 'encoding_target', onProgress),
  ])

  const total = transcript.length

  const results = transcript.map((tc, idx) => {
    emitProgress(onProgress, 'scoring', idx + 1, total, 'Menghitung kecocokan semantic...')

    const recommendations = topRecommendations(
      tc.nama,
      sourceEmbeddings[idx] ?? [],
      targetEmbeddings,
      allMK,
    )

    if (isBlacklisted(tc)) {
      return { transcript: tc, score: 0, method: 'blacklisted', recommendations }
    }

    if (!hasValidGrade(tc)) {
      return { transcript: tc, score: 0, method: 'grade_invalid', recommendations }
    }

    const best = recommendations[0]
    if (!best || best.score < SEMANTIC_THRESHOLD) {
      return { transcript: tc, score: 0, method: 'unmatched', recommendations }
    }

    return {
      transcript: tc,
      match: best.match,
      score: best.score,
      method: 'semantic',
      recommendations,
    }
  })

  emitProgress(onProgress, 'done', total, total, 'Semantic matching selesai.')

  return results
}
