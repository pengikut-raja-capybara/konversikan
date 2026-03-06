import type { MatchResult } from '../types'

interface Props {
  results: MatchResult[]
  selectedRecommendations: Record<number, number>
  onSelectRecommendation: (resultIndex: number, recommendationIndex: number) => void
}

function confidenceText(score: number): string {
  if (score >= 0.85) return 'Sangat Yakin'
  if (score >= 0.7) return 'Yakin'
  return 'Ragu-ragu'
}

function methodLabel(method: string, hasMatch: boolean, score: number): { text: string; cls: string } {
  switch (method) {
    case 'competency':
      return { text: 'Cocok (Map Kompetensi)', cls: 'bg-emerald-100 text-emerald-800' }
    case 'similarity':
      return { text: `Cocok (${confidenceText(score)})`, cls: 'bg-blue-100 text-blue-800' }
    case 'fuzzy':
      return { text: `Cocok Fuzzy (${confidenceText(score)})`, cls: 'bg-cyan-100 text-cyan-800' }
    case 'semantic':
      if (score < 0.7) {
        return { text: 'Cocok (AI - Ragu-ragu)', cls: 'bg-amber-100 text-amber-800' }
      }
      return { text: `Cocok (AI - ${confidenceText(score)})`, cls: 'bg-teal-100 text-teal-800' }
    case 'best_score':
      if (score < 0.7) {
        return { text: 'Cocok (Skor Tertinggi - Ragu-ragu)', cls: 'bg-amber-100 text-amber-800' }
      }
      return { text: `Cocok (Skor Tertinggi - ${confidenceText(score)})`, cls: 'bg-sky-100 text-sky-800' }
    case 'blacklisted':
      return { text: 'Dikecualikan', cls: 'bg-gray-200 text-gray-600' }
    case 'grade_invalid':
      return { text: 'Nilai Rendah', cls: 'bg-orange-100 text-orange-800' }
    case 'manual':
      if (score < 0.7) {
        return { text: 'Manual (Ragu-ragu)', cls: 'bg-yellow-100 text-yellow-800' }
      }
      return { text: `Manual (${confidenceText(score)})`, cls: 'bg-violet-100 text-violet-800' }
    case 'manual_unmatched':
      return { text: 'Manual (Tidak Cocok)', cls: 'bg-rose-100 text-rose-800' }
    default:
      return hasMatch
        ? { text: `Cocok (${confidenceText(score)})`, cls: 'bg-green-100 text-green-800' }
        : { text: 'Tidak Cocok', cls: 'bg-red-100 text-red-800' }
  }
}

export default function ResultsTable({
  results,
  selectedRecommendations,
  onSelectRecommendation,
}: Props) {
  const toPercent = (score: number) => Math.max(0, Math.min(100, Math.round(score * 100)))

  if (results.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_28px_rgba(30,41,59,0.09)]">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Hasil Konversi Mata Kuliah</h2>
        </div>
        <div className="px-6 py-12 text-center text-slate-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-3 h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>Unggah transkrip untuk menampilkan hasil konversi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_28px_rgba(30,41,59,0.09)]">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-800">Hasil Konversi Mata Kuliah</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gradient-to-r from-indigo-50 to-cyan-50 text-xs uppercase tracking-wide text-indigo-700">
            <tr>
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">Nama MK Asal</th>
              <th className="px-3 py-3">Nilai</th>
              <th className="px-3 py-3">SKS</th>
              <th className="px-3 py-3">→</th>
              <th className="px-3 py-3">Nama MK Tujuan</th>
              <th className="px-3 py-3">SKS</th>
              <th className="px-3 py-3">Skor</th>
              <th className="px-3 py-3">Rekomendasi</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.map((r, i) => {
              const label = methodLabel(r.method, Boolean(r.match), r.score)
              return (
                <tr
                  key={i}
                  className={
                    r.match
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-red-50/40 hover:bg-red-50'
                  }
                >
                  <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2.5">{r.transcript.nama}</td>
                  <td className="px-3 py-2.5 text-center font-medium">
                    {r.transcript.nilai || '-'}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {r.transcript.sks ?? '-'}
                  </td>
                  <td className="px-3 py-2.5 text-gray-300">→</td>
                  <td className="px-3 py-2.5">
                    {r.match?.nama || (
                      <span className="italic text-red-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center font-medium">
                    {r.match?.sks ?? '-'}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-xs">
                    {r.score > 0 ? `${toPercent(r.score)}%` : '-'}
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      value={selectedRecommendations[i] !== undefined ? String(selectedRecommendations[i]) : ''}
                      onChange={(e) => {
                        if (e.target.value === '') return
                        onSelectRecommendation(i, Number(e.target.value))
                      }}
                      className="w-56 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700"
                    >
                      <option value="">Pilih rekomendasi kesetaraan...</option>
                      <option value="-1">Tetapkan Tidak Setara</option>
                      {(r.recommendations ?? []).map((rec, recIdx) => (
                        <option
                          key={`${rec.match.kode ?? recIdx}-${rec.match.nama}`}
                          value={String(recIdx)}
                        >
                          {rec.match.nama} ({toPercent(rec.score)}%)
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${label.cls}`}
                    >
                      {label.text}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
