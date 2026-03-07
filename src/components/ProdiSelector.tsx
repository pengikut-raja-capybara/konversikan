import type { ChangeEvent } from 'react'
import type { ProdiSelectorProps } from '../types/components'

function handleProdiSelectChange(e: ChangeEvent<HTMLSelectElement>, onChange: ProdiSelectorProps['onChange']) {
  onChange(e.target.value)
}

export default function ProdiSelector({ curricula, selectedKey, onChange }: ProdiSelectorProps) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-[var(--surface)] p-6 shadow-[0_8px_28px_rgba(30,64,175,0.08)]">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Program Studi Tujuan
      </label>
      <select
        value={selectedKey}
        onChange={(e) => handleProdiSelectChange(e, onChange)}
        className="w-full rounded-xl border border-indigo-100 bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
      >
        {Object.keys(curricula).map((k) => (
          <option key={k} value={k}>
            {curricula[k].kurikulum}
          </option>
        ))}
      </select>
      {curricula[selectedKey] && (
        <p className="mt-2 text-xs text-slate-500">
          Total SKS lulus:{' '}
          <span className="font-medium">
            {curricula[selectedKey].total_sks_lulus}
          </span>
        </p>
      )}
    </div>
  )
}
