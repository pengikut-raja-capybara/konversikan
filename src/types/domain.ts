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
  nilai?: string
}

export interface MatchResult {
  transcript: TranscriptCourse
  match?: MataKuliah
  score: number
  method: string
  recommendations?: Recommendation[]
}

export interface Recommendation {
  match: MataKuliah
  score: number
}

export interface StudyEstimation {
  estSemesters: number
  remainingSKS: number
}

export interface ParseResult {
  courses: TranscriptCourse[]
  studentName?: string
  asalKampus?: string
  asalJurusan?: string
}
