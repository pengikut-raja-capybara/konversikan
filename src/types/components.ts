import type { RefObject } from 'react'
import type { Curriculum, MatchResult, MataKuliah, ParseResult, TranscriptCourse } from './domain'

export interface FileUploaderHandle {
  reset: () => void
}

export interface FileUploaderProps {
  onParsed: (result: ParseResult, fileName: string) => void
  fileName: string
  courseCount: number
  studentName?: string
  asalKampus?: string
  resetRef?: RefObject<FileUploaderHandle | null>
}

export interface ProdiSelectorProps {
  curricula: Record<string, Curriculum>
  selectedKey: string
  onChange: (key: string) => void
}

export interface SummaryCardsProps {
  matchedCount: number
  unmatchedCount: number
  totalSKS: number
  estSemesters: number
  remainingSKS: number
  totalSKSWajib: number
}

export interface ResultsTableProps {
  results: MatchResult[]
  selectedRecommendations: Record<number, number>
  customSelections: Record<number, MataKuliah>
  availableCourses: MataKuliah[]
  onSelectRecommendation: (resultIndex: number, recommendationIndex: number) => void
  onSelectManualCourse: (resultIndex: number, course: MataKuliah) => void
  onClearManualCourse: (resultIndex: number) => void
  onBulkSetUnmatched: (indices: number[]) => void
  originalTranscript?: TranscriptCourse[]
  studentName?: string
  asalKampus?: string
}

export interface ResultsTableRow {
  rowIndex: number
  sortBucket: number
  sortLabel: string
  targetKey: string
  duplicateGroupSize: number
  transcriptName: string
  grade: string
  transcriptSks: number | null
  targetName: string
  targetSks: number | null
  scorePercent: number | null
  statusText: string
  statusCls: string
  isDuplicate: boolean
  result: MatchResult
  manualSelected: boolean
}
