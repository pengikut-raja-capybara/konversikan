import type { MatchResult, MataKuliah } from '../types'

export function buildEffectiveResults(
  results: MatchResult[],
  manualSelections: Record<number, number>,
  customSelections: Record<number, MataKuliah>,
): MatchResult[] {
  return results.map((r, idx) => {
    const manualCourse = customSelections[idx]
    if (manualCourse) {
      return {
        ...r,
        match: manualCourse,
        score: 0,
        method: 'manual_custom',
      }
    }

    const selectedRecIdx = manualSelections[idx]
    if (selectedRecIdx === undefined) return r

    if (selectedRecIdx === -1) {
      return {
        ...r,
        match: undefined,
        score: 0,
        method: 'manual_unmatched',
      }
    }

    const selectedRec = r.recommendations?.[selectedRecIdx]
    if (!selectedRec) return r

    return {
      ...r,
      match: selectedRec.match,
      score: selectedRec.score,
      method: 'manual',
    }
  })
}
