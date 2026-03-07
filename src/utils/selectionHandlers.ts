import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import type { MatchResult, MataKuliah, ParseResult, TranscriptCourse } from '../types'

export function applyParsedFile(
  parsed: ParseResult,
  name: string,
  setTranscript: Dispatch<SetStateAction<TranscriptCourse[]>>,
  setFileName: Dispatch<SetStateAction<string>>,
  setStudentName: Dispatch<SetStateAction<string>>,
  setAsalKampus: Dispatch<SetStateAction<string>>,
  setManualSelections: Dispatch<SetStateAction<Record<number, number>>>,
  setCustomSelections: Dispatch<SetStateAction<Record<number, MataKuliah>>>,
) {
  setTranscript(parsed.courses)
  setFileName(name)
  setStudentName(parsed.studentName ?? '')
  setAsalKampus(parsed.asalKampus ?? '')
  setManualSelections({})
  setCustomSelections({})
}

export function resetUploaderAndSelections(
  setSelectedKey: Dispatch<SetStateAction<string>>,
  key: string,
  setResults: Dispatch<SetStateAction<MatchResult[]>>,
  setTranscript: Dispatch<SetStateAction<TranscriptCourse[]>>,
  setFileName: Dispatch<SetStateAction<string>>,
  setStudentName: Dispatch<SetStateAction<string>>,
  setAsalKampus: Dispatch<SetStateAction<string>>,
  setManualSelections: Dispatch<SetStateAction<Record<number, number>>>,
  setCustomSelections: Dispatch<SetStateAction<Record<number, MataKuliah>>>,
  uploaderRef: MutableRefObject<{ reset: () => void } | null>,
) {
  setSelectedKey(key)
  setResults([])
  setTranscript([])
  setFileName('')
  setStudentName('')
  setAsalKampus('')
  setManualSelections({})
  setCustomSelections({})
  uploaderRef.current?.reset()
}

export function setRecommendationSelection(
  resultIndex: number,
  recommendationIndex: number,
  setManualSelections: Dispatch<SetStateAction<Record<number, number>>>,
  setCustomSelections: Dispatch<SetStateAction<Record<number, MataKuliah>>>,
) {
  setManualSelections((prev) => ({
    ...prev,
    [resultIndex]: recommendationIndex,
  }))
  setCustomSelections((prev) => {
    const next = { ...prev }
    delete next[resultIndex]
    return next
  })
}

export function setManualCourseSelection(
  resultIndex: number,
  course: MataKuliah,
  setManualSelections: Dispatch<SetStateAction<Record<number, number>>>,
  setCustomSelections: Dispatch<SetStateAction<Record<number, MataKuliah>>>,
) {
  setCustomSelections((prev) => ({
    ...prev,
    [resultIndex]: course,
  }))
  setManualSelections((prev) => {
    const next = { ...prev }
    delete next[resultIndex]
    return next
  })
}

export function clearManualCourseSelection(
  resultIndex: number,
  setCustomSelections: Dispatch<SetStateAction<Record<number, MataKuliah>>>,
) {
  setCustomSelections((prev) => {
    const next = { ...prev }
    delete next[resultIndex]
    return next
  })
}

export function bulkSetUnmatchedSelections(
  indices: number[],
  setManualSelections: Dispatch<SetStateAction<Record<number, number>>>,
  setCustomSelections: Dispatch<SetStateAction<Record<number, MataKuliah>>>,
) {
  setManualSelections((prev) => {
    const next = { ...prev }
    for (const idx of indices) next[idx] = -1
    return next
  })

  setCustomSelections((prev) => {
    const next = { ...prev }
    for (const idx of indices) delete next[idx]
    return next
  })
}
