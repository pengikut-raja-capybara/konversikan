import * as XLSX from 'xlsx'
import type { ParseResult, TranscriptCourse } from '../types'

/** Safely trim a cell value to string */
function cleanStr(v: unknown): string {
  if (v == null) return ''
  return String(v).trim()
}

/**
 * Parse an uploaded file (JSON / CSV / XLS / XLSX) into a ParseResult.
 *
 * For spreadsheets we try the "template" layout first:
 *  - Row 1: Nama Mahasiswa  |  [value]
 *  - Row 2: Asal Kampus     |  [value]
 *  - Row 3: Jurusan Asal    |  [value]
 *  - Row 7: headers (No, Kode_MK_Asal, Nama_Mata_Kuliah_Asal, SKS_Asal, Nilai_Huruf)
 *  - Row 8+: data
 *
 * Falls back to reading headers from row 1 and mapping common column names.
 */
export function parseFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

    // ── JSON ───────────────────────────────────────────────────────────
    if (ext === 'json') {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const raw = JSON.parse(reader.result as string)
          const courses: TranscriptCourse[] = Array.isArray(raw) ? raw : []
          resolve({ courses })
        } catch {
          reject(new Error('JSON tidak valid'))
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
      return
    }

    // ── CSV / XLS / XLSX  (SheetJS) ────────────────────────────────────
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]

        // Try extracting template metadata from first 3 rows
        let studentName: string | undefined
        let asalKampus: string | undefined
        let asalJurusan: string | undefined

        const rawHeader = XLSX.utils.sheet_to_json<unknown[]>(ws, {
          header: 1,
          range: 0,
        }) as unknown[][]

        if (rawHeader.length >= 3) {
          const n = cleanStr(rawHeader[0]?.[1])
          const k = cleanStr(rawHeader[1]?.[1])
          const j = cleanStr(rawHeader[2]?.[1])
          if (n && !n.startsWith('[')) studentName = n
          if (k && !k.startsWith('[')) asalKampus = k
          if (j && !j.startsWith('[')) asalJurusan = j
        }

        // First try reading from row 7 (template format, 0-indexed range=6)
        let rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { range: 6 })
        if (rows.length === 0) {
          // Fallback: read from very beginning
          rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)
        }

        const courses: TranscriptCourse[] = []

        for (const r of rows) {
          const nama = cleanStr(
            r['Nama_Mata_Kuliah_Asal'] ?? r['Nama Mata Kuliah'] ??
            r['Mata Kuliah'] ?? r['Nama MK'] ?? r['Course'] ??
            r['nama'] ?? r['Nama'] ?? r['NAMA'] ?? r['nama_mk'],
          )
          if (!nama) continue  // skip empty rows

          const kode = cleanStr(
            r['Kode_MK_Asal'] ?? r['Kode MK'] ?? r['Kode'] ??
            r['kode'] ?? r['KODE'] ?? r['Code'],
          ) || undefined

          const sksRaw = Number(
            r['SKS_Asal'] ?? r['SKS'] ?? r['sks'] ?? r['Sks'] ?? r['Credit'] ?? 0,
          )
          const sks = sksRaw > 0 ? sksRaw : undefined

          const nilai = cleanStr(
            r['Nilai_Huruf'] ?? r['Nilai'] ?? r['Grade'] ??
            r['Huruf'] ?? r['nilai'] ?? r['grade'],
          ).toUpperCase() || undefined

          courses.push({ kode, nama, sks, nilai })
        }

        resolve({ courses, studentName, asalKampus, asalJurusan })
      } catch {
        reject(new Error('Gagal membaca file spreadsheet'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Generate and download an Excel template that students can fill in.
 */
export function downloadTemplate(): void {
  const wb = XLSX.utils.book_new()

  const header = [
    ['Nama Mahasiswa', '[Isi Nama Lengkap]'],
    ['Asal Kampus', '[Isi Asal Kampus]'],
    ['Jurusan Asal', '[Isi Jurusan]'],
    [],
    ['Petunjuk: Isi data mulai dari baris 8. Kolom Nilai_Huruf diisi huruf mutu (A, B+, B, C, dsb).'],
    [],
    ['No', 'Kode_MK_Asal', 'Nama_Mata_Kuliah_Asal', 'SKS_Asal', 'Nilai_Huruf'],
    [1, '', '', '', ''],
    [2, '', '', '', ''],
    [3, '', '', '', ''],
  ]

  const ws = XLSX.utils.aoa_to_sheet(header)

  // column widths
  ws['!cols'] = [
    { wch: 5 },
    { wch: 18 },
    { wch: 40 },
    { wch: 10 },
    { wch: 14 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Transkrip')
  XLSX.writeFile(wb, 'template_transkrip_konversi.xlsx')
}
