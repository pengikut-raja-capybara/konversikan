import { useEffect, useState } from 'react'
import VersionOnePage from './pages/VersionOnePage'
import VersionTwoPage from './pages/VersionTwoPage'

function App() {
  const [activeVersion, setActiveVersion] = useState<'v1' | 'v2'>('v1')
  const [theme, setTheme] = useState<'day' | 'night'>('day')

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="app-shell relative min-h-screen overflow-hidden px-4 py-8 md:py-10">
      <span className="float-orb left-[-60px] top-[-30px] h-44 w-44 bg-indigo-200" />
      <span className="float-orb bottom-[-70px] right-[-40px] h-52 w-52 bg-emerald-200" />

      <div className="mx-auto w-full">
        <div className={`fade-up mb-8 rounded-3xl border px-6 py-7 backdrop-blur md:px-9 ${
          theme === 'night'
            ? 'border-indigo-300/20 bg-slate-900/70 shadow-[0_14px_45px_rgba(5,10,30,0.55)]'
            : 'border-indigo-100 bg-white/75 shadow-[0_14px_45px_rgba(41,69,183,0.12)]'
        }`}>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-sm font-extrabold tracking-widest text-white shadow-md sm:flex">
                U
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-500">
                  Suite Konversi SKS UNSIA
                </p>
                <h1 className="brand-heading mt-1 text-4xl font-extrabold text-[var(--brand-ink)] md:text-5xl">
                  konversikan
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                  Platform simulasi konversi SKS mahasiswa pindahan Universitas Siber Asia,
                  dengan dua mesin penilaian: berbasis aturan dan AI semantik.
                </p>
              </div>
            </div>

            <div className="glass-panel fade-up-delay-1 w-full max-w-sm rounded-2xl px-4 py-3 text-xs text-slate-600 md:w-auto md:min-w-80">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Mode aktif</span>
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 font-semibold text-indigo-700">
                  {activeVersion === 'v1' ? 'Mesin Berbasis Aturan' : 'Mesin AI Semantik'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTheme((prev) => (prev === 'day' ? 'night' : 'day'))}
                className={`w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                  theme === 'night'
                    ? 'border-indigo-300/20 bg-slate-900/50 text-slate-100 hover:bg-slate-800/70'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {theme === 'day' ? 'Aktifkan Mode Gelap' : 'Kembali ke Mode Terang'}
              </button>
            </div>
          </div>
        </div>

        <div className={`fade-up-delay-2 mb-6 flex flex-wrap justify-center gap-2 rounded-2xl p-2 backdrop-blur ${
          theme === 'night' ? 'bg-slate-900/60 shadow-[0_8px_30px_rgba(2,6,23,0.45)]' : 'bg-white/70 shadow-sm'
        }`}>
          <button
            type="button"
            onClick={() => setActiveVersion('v1')}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeVersion === 'v1'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-300/60'
                : 'bg-white text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            Versi 1 • Berbasis Aturan
          </button>
          <button
            type="button"
            onClick={() => setActiveVersion('v2')}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeVersion === 'v2'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-300/60'
                : 'bg-white text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Versi 2 • AI Semantik
          </button>
        </div>

        <div className="fade-up-delay-3">
          {activeVersion === 'v1' ? (
          <VersionOnePage />
        ) : (
          <VersionTwoPage />
        )}
        </div>
      </div>
    </div>
  )
}

export default App
