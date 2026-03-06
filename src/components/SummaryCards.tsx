interface Props {
  matchedCount: number
  unmatchedCount: number
  totalSKS: number
  estSemesters: number
  remainingSKS: number
  totalSKSWajib: number
}

export default function SummaryCards({
  matchedCount, unmatchedCount, totalSKS, estSemesters, remainingSKS, totalSKSWajib,
}: Props) {
  const cards = [
    { label: 'SKS Diakui', value: String(totalSKS), accent: 'from-indigo-500 to-blue-500', text: 'text-indigo-700' },
    { label: 'Sisa SKS', value: String(remainingSKS), accent: 'from-amber-400 to-orange-400', text: 'text-amber-700' },
    { label: 'Terkonversi', value: String(matchedCount), accent: 'from-emerald-500 to-teal-500', text: 'text-emerald-700' },
    { label: 'Tidak Cocok', value: String(unmatchedCount), accent: 'from-rose-500 to-red-500', text: 'text-rose-700' },
    { label: `Est. Semester (dari ${totalSKSWajib} SKS)`, value: `~${estSemesters}`, accent: 'from-fuchsia-500 to-violet-500', text: 'text-violet-700' },
  ]

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 text-center md:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_6px_20px_rgba(30,41,59,0.08)]">
          <div className={`mx-auto mb-2 h-1.5 w-14 rounded-full bg-gradient-to-r ${card.accent}`} />
          <p className={`text-2xl font-extrabold ${card.text}`}>{card.value}</p>
          <p className="mt-1 text-[11px] text-slate-500">{card.label}</p>
        </div>
      ))}
    </div>
  )
}
