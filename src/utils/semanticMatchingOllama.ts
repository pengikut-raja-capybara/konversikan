import type {
  Curriculum,
  MatchResult,
  MataKuliah,
  Recommendation,
  TranscriptCourse,
} from '../types'
import type {
  OllamaEmbeddingConfig,
  ProgressStage,
  SemanticMatchOptions,
  SemanticProgress,
} from '../types/semantic'
import { flattenMK } from './matching'
import { calculateSimilarity } from './similarity'

const SEMANTIC_THRESHOLD = 0.55

const BLACKLIST = [
  'tugas akhir', 'skripsi', 'thesis', 'kerja praktek', 'kerja praktik',
  'magang', 'pkl', 'kkn', 'non-akademik', 'ekstrakurikuler',
  'kerja profesi', 'proyek akhir',
]

const VALID_GRADES = new Set([
  'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'AB', 'BC', 'CB',
])

const embeddingCache = new Map<string, number[]>()
let ollamaReady = false

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

export function isOllamaModelReady(): boolean {
  return ollamaReady
}

export async function testOllamaConnection(config: OllamaEmbeddingConfig): Promise<void> {
  // Warm-up call to validate server and model availability.
  await embedTextsWithOllama(['tes koneksi model'], config, 'loading_model')
  ollamaReady = true
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

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

function toBaseUrl(serverUrl: string): string {
  const trimmed = serverUrl.trim()
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

function buildCacheKey(config: OllamaEmbeddingConfig, text: string): string {
  return `${toBaseUrl(config.serverUrl)}::${config.model.trim()}::${text}`
}

interface OllamaEmbedResponse {
  embeddings?: number[][]
}

interface OllamaLegacyEmbeddingResponse {
  embedding?: number[]
}

async function requestEmbedBatch(
  config: OllamaEmbeddingConfig,
  inputs: string[],
): Promise<number[][]> {
  const baseUrl = toBaseUrl(config.serverUrl)
  const response = await fetch(`${baseUrl}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      input: inputs,
    }),
  })

  if (!response.ok) {
    throw new Error(`OLLAMA_EMBED_FAILED:${response.status}`)
  }

  const data = await response.json() as OllamaEmbedResponse
  if (!Array.isArray(data.embeddings) || data.embeddings.length !== inputs.length) {
    throw new Error('OLLAMA_EMBED_INVALID_RESPONSE')
  }

  return data.embeddings
}

async function requestLegacyEmbedding(config: OllamaEmbeddingConfig, text: string): Promise<number[]> {
  const baseUrl = toBaseUrl(config.serverUrl)
  const response = await fetch(`${baseUrl}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      prompt: text,
    }),
  })

  if (!response.ok) {
    throw new Error(`OLLAMA_EMBEDDINGS_FAILED:${response.status}`)
  }

  const data = await response.json() as OllamaLegacyEmbeddingResponse
  if (!Array.isArray(data.embedding)) {
    throw new Error('OLLAMA_EMBEDDINGS_INVALID_RESPONSE')
  }

  return data.embedding
}

async function encodeMissingTexts(
  config: OllamaEmbeddingConfig,
  missingTexts: string[],
  onProgress?: SemanticMatchOptions['onProgress'],
  stage: ProgressStage = 'encoding_source',
  totalItems = missingTexts.length,
  cacheHits = 0,
  cacheMisses = missingTexts.length,
): Promise<void> {
  if (missingTexts.length === 0) return

  const batches = chunkArray(missingTexts, 24)
  let encodedCount = 0

  for (const batch of batches) {
    try {
      const embeddings = await requestEmbedBatch(config, batch)
      embeddings.forEach((vec, i) => {
        const text = batch[i]
        if (!text) return
        embeddingCache.set(buildCacheKey(config, text), vec)
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_OLLAMA_ERROR'
      if (!message.startsWith('OLLAMA_EMBED_FAILED:404')) {
        throw error
      }

      // Fallback for older Ollama versions using /api/embeddings endpoint.
      for (const text of batch) {
        const embedding = await requestLegacyEmbedding(config, text)
        embeddingCache.set(buildCacheKey(config, text), embedding)
      }
    }

    encodedCount += batch.length
    emitProgress(
      onProgress,
      stage,
      cacheHits + encodedCount,
      totalItems,
      'Menghitung embedding via Ollama...',
      { cacheHits, cacheMisses },
    )
  }
}

async function embedTextsWithOllama(
  texts: string[],
  config: OllamaEmbeddingConfig,
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
    const cached = embeddingCache.get(buildCacheKey(config, text))
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
    cacheMisses === 0
      ? 'Semua embedding Ollama diambil dari cache.'
      : 'Menggunakan cache embedding dan encoding data baru via Ollama...',
    { cacheHits, cacheMisses },
  )

  await encodeMissingTexts(
    config,
    missingTexts,
    onProgress,
    stage,
    normalized.length,
    cacheHits,
    cacheMisses,
  )

  for (let i = 0; i < normalized.length; i++) {
    const vector = embeddingCache.get(buildCacheKey(config, normalized[i]))
    resultVectors[i] = vector ?? []
  }

  return resultVectors.map((vector) => vector ?? [])
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
        const semanticScore = normalizeScore(cosineSimilarity(sourceVec, vec))
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

export async function matchTranscriptSemanticOllama(
  transcript: TranscriptCourse[],
  curriculum: Curriculum,
  config: OllamaEmbeddingConfig,
  options: SemanticMatchOptions = {},
): Promise<MatchResult[]> {
  const { onProgress } = options

  emitProgress(
    onProgress,
    'loading_model',
    0,
    1,
    `Menghubungkan ke Ollama (${toBaseUrl(config.serverUrl)}) dengan model ${config.model}...`,
  )

  await testOllamaConnection(config)

  emitProgress(onProgress, 'loading_model', 1, 1, 'Koneksi Ollama siap digunakan.')

  const allMK = flattenMK(curriculum)
  const sourceTexts = transcript.map((course) => course.nama)
  const targetTexts = allMK.map((course) => course.nama)

  const [sourceEmbeddings, targetEmbeddings] = await Promise.all([
    embedTextsWithOllama(sourceTexts, config, 'encoding_source', onProgress),
    embedTextsWithOllama(targetTexts, config, 'encoding_target', onProgress),
  ])

  const total = transcript.length

  const results = transcript.map((tc, idx) => {
    emitProgress(onProgress, 'scoring', idx + 1, total, 'Menghitung kecocokan semantic via Ollama...')

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
      method: 'semantic_ollama',
      recommendations,
    }
  })

  emitProgress(onProgress, 'done', total, total, 'Semantic matching Ollama selesai.')

  return results
}
