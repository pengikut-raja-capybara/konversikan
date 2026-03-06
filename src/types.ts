// ── Domain Types ─────────────────────────────────────────────────────────

export interface MataKuliah {
  kode?: string
  nama: string
  sks: number
  area?: string
  status?: string
  opsi_label?: string
  opsi?: MataKuliah[]
  peminatan?: string
}

export interface Semester {
  semester: number
  mata_kuliah: MataKuliah[]
}

export interface Curriculum {
  kurikulum: string
  total_sks_lulus: number
  data_semester: Semester[]
}

export interface TranscriptCourse {
  kode?: string
  nama: string
  sks?: number
  nilai?: string  // grade: A, A-, B+, B, B-, C+, C, etc.
}

// ── Result type returned by the matching util ────────────────────────────

export interface MatchResult {
  transcript: TranscriptCourse
  match?: MataKuliah
  score: number       // 0..1 confidence score
  method: string      // e.g. "competency", "exact", "similarity", "unmatched"
  recommendations?: Recommendation[]
}

export interface Recommendation {
  match: MataKuliah
  score: number
}

// ── Study duration estimation ────────────────────────────────────────────

export interface StudyEstimation {
  estSemesters: number
  remainingSKS: number
}

// ── Parse result includes optional metadata from template ────────────────

export interface ParseResult {
  courses: TranscriptCourse[]
  studentName?: string
  asalKampus?: string
  asalJurusan?: string
}
