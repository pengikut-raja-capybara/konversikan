import { useEffect, useState } from "react";
import VersionOnePage from "./pages/VersionOnePage";
import VersionTwoPage from "./pages/VersionTwoPage";

function App() {
  const [activeVersion, setActiveVersion] = useState<"v1" | "v2">("v1");
  const [theme, setTheme] = useState<"day" | "night">("day");
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const isNightMode = theme === "night";
  const unsiaLogoSrc = `${import.meta.env.BASE_URL}UNSIA-LOGO.png`;

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="app-shell relative min-h-screen overflow-hidden px-4 py-8 md:px-6 md:py-10">
      <span className="float-orb left-[-60px] top-[-30px] h-44 w-44 bg-[#A7C6E8]" />
      <span className="float-orb bottom-[-70px] right-[-40px] h-52 w-52 bg-[#F5D54A]/70" />
      <span className="float-orb left-[40%] top-[10%] h-32 w-32 bg-[#9BC3E8]/60" />

      <div className="mx-auto w-full max-w-[1280px]">
        <div
          className={`fade-up relative mb-7 overflow-hidden rounded-3xl border px-6 py-7 backdrop-blur md:px-9 md:py-8 ${
            isNightMode ? "border-[#3E6A93]/45 bg-slate-900/75 shadow-[0_14px_45px_rgba(5,10,30,0.55)]" : "border-[#C3D8EC] bg-white/80 shadow-[0_14px_45px_rgba(16,74,124,0.14)]"
          }`}
        >
          <div className="pointer-events-none absolute inset-x-6 top-0 h-20 bg-gradient-to-r from-[#2A6A9B]/30 via-[#8FB9E2]/20 to-[#F4D112]/30 blur-2xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden h-16 w-16 items-center justify-center rounded-2xl border border-[#C7D9EA] bg-white/90 shadow-md sm:flex">
                <img src={unsiaLogoSrc} alt="Logo UNSIA" className="h-12 w-12 object-contain" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#C6D8EA] bg-[#EFF5FC]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#124D80]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E6BE00]" />
                  Suite Konversi SKS UNSIA [UNOFFICIAL]
                </div>
                <h1 className="brand-heading mt-1 text-4xl font-extrabold text-[var(--brand-ink)] md:text-5xl">konversikan</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                  Platform simulasi konversi SKS mahasiswa pindahan Universitas Siber Asia, dengan dua mesin penilaian: berbasis aturan dan AI semantik.
                </p>

                <div className="mt-4 flex flex-wrap gap-2.5 text-xs font-semibold">
                  <span className="rounded-full border border-[#BFD4E9] bg-[#EDF4FC] px-3 py-1 text-[#134E81]">Konversi Otomatis</span>
                  <span className="rounded-full border border-[#C9DBEC] bg-[#F2F7FD] px-3 py-1 text-[#1E5D90]">Pemetaan Manual</span>
                  <span className="rounded-full border border-[#F2D866] bg-[#FFF8DB] px-3 py-1 text-[#9A7400]">Ekspor Excel</span>
                </div>
              </div>
            </div>

            <div className="glass-panel fade-up-delay-1 w-full rounded-2xl px-4 py-3 text-xs text-slate-600 sm:max-w-sm lg:w-[360px]">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Mesin aktif</span>
                <span className="rounded-full bg-[#E9F2FC] px-2.5 py-1 font-semibold text-[#134E81]">{activeVersion === "v1" ? "Mesin Berbasis Aturan" : "Mesin AI Semantik"}</span>
              </div>

              <div className={`mb-3 rounded-xl border px-3 py-2 ${isNightMode ? "border-[#3E6A93]/45 bg-slate-900/50" : "border-[#CEDDEC] bg-white/80"}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Tema tampilan</p>
                <p className="mt-1 text-xs text-slate-600">Atur kontras layar agar nyaman untuk siang atau malam.</p>
              </div>

              <button
                type="button"
                onClick={() => setTheme((prev) => (prev === "day" ? "night" : "day"))}
                className={`w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                  isNightMode ? "border-[#3E6A93]/45 bg-slate-900/50 text-slate-100 hover:bg-slate-800/70" : "border-[#BCD1E8] bg-white text-[#114A7B] hover:bg-[#F4F8FD]"
                }`}
              >
                {isNightMode ? "Kembali ke Mode Terang" : "Aktifkan Mode Gelap"}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`fade-up-delay-2 mb-6 flex flex-wrap justify-center gap-2 rounded-2xl p-2 backdrop-blur ${
            isNightMode ? "bg-slate-900/60 shadow-[0_8px_30px_rgba(2,6,23,0.45)]" : "bg-white/70 shadow-sm"
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveVersion("v1")}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeVersion === "v1" ? "bg-gradient-to-r from-[#104A7C] to-[#1F6296] text-white shadow-lg shadow-[#9ABDE0]/60" : "bg-white text-[#114A7B] hover:bg-[#F1F7FD]"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-current/80" />
              Versi 1 • Berbasis Aturan
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveVersion("v2")}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeVersion === "v2" ? "bg-gradient-to-r from-[#D4AB00] to-[#F4D112] text-[#1F3A57] shadow-lg shadow-[#EFD97A]/60" : "bg-white text-[#8C6A00] hover:bg-[#FFF9E2]"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-current/80" />
              Versi 2 • AI Semantik
            </span>
          </button>
        </div>

        <div className="fade-up-delay-3">{activeVersion === "v1" ? <VersionOnePage /> : <VersionTwoPage />}</div>

        {/* small footer text */}
        <footer className={`mt-6 text-center text-xs ${isNightMode ? "text-slate-500" : "text-slate-400"}`}>
          © 2026 dibuat oleh{" "}
          <span onClick={() => setIsCreditModalOpen(true)} className="font-semibold cursor-pointer text-slate-600 underline transition hover:text-slate-800">
            Pengikut Raja Capybara
          </span>
        </footer>

        {isCreditModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60" onClick={() => setIsCreditModalOpen(false)} aria-hidden="true" />

            <div
              className={`relative w-full max-w-xl rounded-2xl border p-5 shadow-2xl sm:p-6 ${
                isNightMode ? "border-[#3E6A93]/45 bg-slate-900 text-slate-100" : "border-[#C6D8EA] bg-white text-slate-800"
              }`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="credit-disclaimer-title"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 id="credit-disclaimer-title" className="text-lg font-semibold">
                  Credit & Disclaimer
                </h3>
              </div>

              <div className="mt-4 space-y-3 text-sm leading-relaxed">
                <p>
                  Aplikasi ini dikembangkan oleh mahasiswa Universitas Siber Asia (UNSIA) sebagai sarana pembelajaran dan alat bantu untuk mensimulasikan proses konversi SKS bagi mahasiswa pindahan.
                </p>
                <div>Tim pengembang:</div>
                <div className="font-medium">Angga Alfiansah (240101010032) &amp; Raja Capybara yang berbudi luhur.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
