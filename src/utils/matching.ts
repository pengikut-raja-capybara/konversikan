import type {
  Curriculum,
  MataKuliah,
  MatchResult,
  Recommendation,
  TranscriptCourse,
} from '../types'
import { competencyMap } from './competencyMap'
import { calculateSimilarity, expandAbbr } from './similarity'

// ── constants ────────────────────────────────────────────────────────────

/** Courses that should never be matched (final project, internship, etc.) */
const BLACKLIST = [
  'tugas akhir', 'skripsi', 'thesis', 'kerja praktek', 'kerja praktik',
  'magang', 'pkl', 'kkn', 'non-akademik', 'ekstrakurikuler',
  'kerja profesi', 'proyek akhir',
]

/** Only these letter grades are accepted for transfer credit */
const VALID_GRADES = new Set([
  'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'AB', 'BC', 'CB',
])

/** Minimum similarity score to accept a fuzzy match */
const SIMILARITY_THRESHOLD = 0.60

// ── helpers ──────────────────────────────────────────────────────────────

/**
 * Flatten every mata_kuliah (including nested opsi choices) from a
 * curriculum into a single flat array so they can all be searched.
 */
export function flattenMK(curr: Curriculum): MataKuliah[] {
  const list: MataKuliah[] = []
  for (const sem of curr.data_semester) {
    for (const mk of sem.mata_kuliah) {
      if (mk.opsi) {
        list.push(...mk.opsi)
      } else {
        list.push(mk)
      }
    }
  }
  return list
}

/** Check whether a transcript course should be excluded (blacklisted) */
function isBlacklisted(tc: TranscriptCourse): boolean {
  const norm = (tc.nama ?? '').toLowerCase()
  return BLACKLIST.some((bl) => norm.includes(bl))
}

/** Check whether the grade is acceptable for credit transfer */
function hasValidGrade(tc: TranscriptCourse): boolean {
  if (!tc.nilai) return true               // no grade → assume valid
  return VALID_GRADES.has(tc.nilai.trim().toUpperCase())
}

/** Return best candidate courses as recommendations for a source course */
function getRecommendations(
  source: TranscriptCourse,
  allMK: MataKuliah[],
  limit = 5,
): Recommendation[] {
  const expandedSource = expandAbbr(source.nama)

  const candidates = allMK
    .map((target) => {
      let score = calculateSimilarity(source.nama, target.nama)

      // Boost if competency map explicitly connects this pair.
      const equivalents = competencyMap[target.nama]
      if (equivalents?.some((eq) => expandedSource.includes(eq.toLowerCase()))) {
        score = Math.max(score, 1.0)
      }

      return { match: target, score }
    })
    .filter((item) => item.score > 0.30)
    .sort((a, b) => b.score - a.score)

  const deduped: Recommendation[] = []
  const seen = new Set<string>()

  for (const item of candidates) {
    const key = `${item.match.kode ?? ''}::${item.match.nama}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(item)
    if (deduped.length >= limit) break
  }

  return deduped
}

// ── 2-pass matching algorithm ────────────────────────────────────────────

/**
 * Match every transcript course against a target curriculum using the
 * same 2-pass algorithm as the reference implementation:
 *
 * **Pre-filter**: exclude blacklisted courses and courses with invalid grades.
 *
 * **Pass 1** — for each *target* curriculum course:
 *   1a. Competency map lookup (score 1.0)
 *   1b. High-confidence similarity > threshold (best score)
 *
 * **Pass 2** — for remaining unmatched targets, fuzzy match against
 *             remaining (unmatched) source courses > threshold.
 *
 * The result array follows the order of the input `transcript`.
 */
export function matchTranscript(
  transcript: TranscriptCourse[],
  curriculum: Curriculum,
): MatchResult[] {
  const allMK = flattenMK(curriculum)

  // Pre-filter transcript courses
  const validSources = transcript.map((tc, idx) => ({
    tc,
    idx,
    valid: !isBlacklisted(tc) && hasValidGrade(tc),
  }))

  // Track which source & target have been matched
  const matchedSourceIdx = new Set<number>()
  const matchedTargetIdx = new Set<number>()

  // Output map: transcript index → { match, score, method }
  const resultMap = new Map<number, { match: MataKuliah; score: number; method: string }>()

  // ── Pass 1: for each TARGET course, try to find a source match ──────
  for (let ti = 0; ti < allMK.length; ti++) {
    if (matchedTargetIdx.has(ti)) continue
    const target = allMK[ti]
    const targetName = target.nama

    let bestSource: { idx: number; score: number; method: string } | null = null

    for (const { tc, idx, valid } of validSources) {
      if (!valid || matchedSourceIdx.has(idx)) continue
      const sourceName = tc.nama

      // 1a. Competency map lookup
      const equivalents = competencyMap[targetName]
      if (equivalents) {
        const expandedSource = expandAbbr(sourceName)
        if (equivalents.some((eq) => expandedSource.includes(eq.toLowerCase()))) {
          bestSource = { idx, score: 1.0, method: 'competency' }
          break  // perfect match, stop searching
        }
      }

      // 1b. High similarity
      const sim = calculateSimilarity(sourceName, targetName)
      if (sim > SIMILARITY_THRESHOLD) {
        if (!bestSource || sim > bestSource.score) {
          bestSource = { idx, score: sim, method: 'similarity' }
        }
      }
    }

    if (bestSource) {
      matchedSourceIdx.add(bestSource.idx)
      matchedTargetIdx.add(ti)
      resultMap.set(bestSource.idx, {
        match: target,
        score: bestSource.score,
        method: bestSource.method,
      })
    }
  }

  // ── Pass 2: for remaining unmatched targets, try remaining sources ──
  for (let ti = 0; ti < allMK.length; ti++) {
    if (matchedTargetIdx.has(ti)) continue
    const target = allMK[ti]

    let bestSource: { idx: number; score: number } | null = null

    for (const { tc, idx, valid } of validSources) {
      if (!valid || matchedSourceIdx.has(idx)) continue
      const sim = calculateSimilarity(tc.nama, target.nama)
      if (sim > SIMILARITY_THRESHOLD) {
        if (!bestSource || sim > bestSource.score) {
          bestSource = { idx, score: sim }
        }
      }
    }

    if (bestSource) {
      matchedSourceIdx.add(bestSource.idx)
      matchedTargetIdx.add(ti)
      resultMap.set(bestSource.idx, {
        match: target,
        score: bestSource.score,
        method: 'fuzzy',
      })
    }
  }

  // ── Build final results in transcript order ────────────────────────
  return transcript.map((tc, idx) => {
    const hit = resultMap.get(idx)
    const recommendations = getRecommendations(tc, allMK)

    // Determine reason
    if (isBlacklisted(tc)) {
      return { transcript: tc, score: 0, method: 'blacklisted', recommendations }
    }
    if (!hasValidGrade(tc)) {
      return { transcript: tc, score: 0, method: 'grade_invalid', recommendations }
    }

    // Ensure final auto-match follows the strongest candidate shown in recommendations.
    const bestRecommendation = recommendations[0]
    if (bestRecommendation) {
      if (!hit) {
        if (bestRecommendation.score >= SIMILARITY_THRESHOLD) {
          return {
            transcript: tc,
            match: bestRecommendation.match,
            score: bestRecommendation.score,
            method: 'best_score',
            recommendations,
          }
        }
      }

      if (hit && bestRecommendation.score > hit.score) {
        return {
          transcript: tc,
          match: bestRecommendation.match,
          score: bestRecommendation.score,
          method: 'best_score',
          recommendations,
        }
      }
    }

    if (hit) {
      return {
        transcript: tc,
        match: hit.match,
        score: hit.score,
        method: hit.method,
        recommendations,
      }
    }

    return { transcript: tc, score: 0, method: 'unmatched', recommendations }
  })
}
