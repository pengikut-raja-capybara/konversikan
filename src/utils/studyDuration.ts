import type { StudyEstimation } from '../types'

/**
 * Estimate how many additional semesters the student needs to complete,
 * given the number of SKS already acknowledged.
 *
 * Uses the same rule as the reference implementation:
 *  - First semester: max 20 SKS
 *  - Subsequent semesters: max 24 SKS each
 */
export function calculateStudyDuration(
  sksDiakui: number,
  totalWajib = 144,
): StudyEstimation {
  const remainingSKS = Math.max(0, totalWajib - sksDiakui)
  if (remainingSKS === 0) return { estSemesters: 0, remainingSKS: 0 }

  let semesters = 0
  let currentLoad = remainingSKS

  // semester 1: max 20 SKS
  if (currentLoad > 0) {
    semesters++
    currentLoad -= 20
  }

  // subsequent semesters: max 24 SKS
  while (currentLoad > 0) {
    semesters++
    currentLoad -= 24
  }

  return { estSemesters: semesters, remainingSKS }
}
