/**
 * Text‐similarity utilities duplicated from the reference implementation.
 *
 * This module provides:
 * - expandAbbr()          – normalizes and expands common abbreviations
 * - calculateSimilarity() – 3-tier scoring: exact → token → bigram
 */

// ── abbreviation mappings ────────────────────────────────────────────────

const ABBREVIATIONS: Record<string, string> = {
  peng: 'pengantar',
  mnj: 'manajemen',
  bhs: 'bahasa',
  tek: 'teknologi',
  sis: 'sistem',
  info: 'informasi',
  kom: 'komputer',
  akt: 'akuntansi',
  eko: 'ekonomi',
  pkn: 'pancasila kewarganegaraan',
  kwu: 'kewirausahaan',
  rpl: 'rekayasa perangkat lunak',
  pbo: 'pemrograman berorientasi objek',
  imk: 'interaksi manusia komputer',
  ai: 'kecerdasan buatan',
  sdm: 'sumber daya manusia',
  sim: 'sistem informasi manajemen',
  jk: 'jaringan komputer',
  so: 'sistem operasi',
  si: 'sistem informasi',
  ti: 'teknologi informasi',
  bd: 'basis data',
  db: 'database',
  alg: 'algoritma',
  prog: 'pemrograman',
  pemrog: 'pemrograman',
  lab: 'laboratorium',
  prak: 'praktikum',
  prakt: 'praktikum',
  mat: 'matematika',
  stat: 'statistika',
  prob: 'probabilitas',
  kalk: 'kalkulus',
  fisik: 'fisika',
  kimia: 'kimia',
  bio: 'biologi',
  inggris: 'inggris',
  ind: 'indonesia',
  mgt: 'management',
  mgmt: 'management',
  akun: 'akuntansi',
  pjk: 'perpajakan',
  keu: 'keuangan',
  mku: 'mata kuliah umum',
  gis: 'geographic information system',
  erp: 'enterprise resource planning',
  crm: 'customer relationship management',
  iot: 'internet of things',
  ml: 'machine learning',
  dl: 'deep learning',
  nlp: 'natural language processing',
  cv: 'computer vision',
  hci: 'human computer interaction',
  oop: 'object oriented programming',
  se: 'software engineering',
  os: 'operating system',
  ds: 'data structure',
  dsa: 'data structure and algorithm',
  dss: 'decision support system',
  spk: 'sistem pendukung keputusan',
  sbd: 'sistem basis data',
  pas: 'pengauditan',
}

// ── public functions ─────────────────────────────────────────────────────

/**
 * Normalize a course name: lowercase, strip parenthesised text and special
 * chars, then expand known abbreviations.
 */
export function expandAbbr(str: string | undefined | null): string {
  if (!str) return ''
  let s = String(str).toLowerCase().trim()
  s = s.replace(/\(.*?\)/g, '')           // remove (...)
  s = s.replace(/[^a-z0-9\s]/g, ' ')     // keep letters, digits, spaces
  return s
    .split(/\s+/)
    .map((w) => ABBREVIATIONS[w] ?? w)
    .join(' ')
    .trim()
}

/**
 * Calculate similarity between two course names.
 *
 * Returns 0–1 using three strategies (highest wins):
 * 1. Exact / inclusion match (1.0 / 0.95)
 * 2. Token (Jaccard-like) match
 * 3. Bigram character overlap
 */
export function calculateSimilarity(source: string, target: string): number {
  const cleanSource = expandAbbr(source)
  const cleanTarget = expandAbbr(target)

  const s = cleanSource.replace(/[^a-z0-9]/g, '')
  const t = cleanTarget.replace(/[^a-z0-9]/g, '')

  // 1. exact / inclusion
  if (s === t) return 1.0
  if (s.includes(t) || t.includes(s)) return 0.95

  // 2. token matching
  const sourceWords = cleanSource.split(' ').filter((w) => w.length > 1)
  const targetWords = cleanTarget.split(' ').filter((w) => w.length > 1)

  if (sourceWords.length === 0 || targetWords.length === 0) return 0

  let matches = 0
  for (const tw of targetWords) {
    if (sourceWords.some((sw) => sw.includes(tw) || tw.includes(sw))) {
      matches++
    }
  }

  const precision = matches / targetWords.length
  const recall = matches / sourceWords.length
  const tokenScore = (precision + recall) / 2

  // 3. bigram fallback
  const bigrams1 = new Set<string>()
  for (let i = 0; i < s.length - 1; i++) bigrams1.add(s.substring(i, i + 2))

  let intersection = 0
  for (let i = 0; i < t.length - 1; i++) {
    if (bigrams1.has(t.substring(i, i + 2))) intersection++
  }
  const denominator = s.length + t.length - 2
  const bigramScore = denominator > 0 ? (2.0 * intersection) / denominator : 0

  const raw = Math.max(tokenScore, bigramScore)
  return Math.max(0, Math.min(1, raw))
}
