import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import VersionOnePage from "./pages/VersionOnePage";
import VersionTwoPage from "./pages/VersionTwoPage";
import VersionThreePage from "./pages/VersionThreePage";

function App() {
  const [activeVersion, setActiveVersion] = useState<"v1" | "v2" | "v3">("v1");
  const [theme, setTheme] = useState<"day" | "night">("day");
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const isNightMode = theme === "night";
  const unsiaLogoSrc = `${import.meta.env.BASE_URL}UNSIA-LOGO.png`;

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="app-shell relative min-h-screen overflow-hidden p-4">
      <span className="float-orb left-[-60px] top-[-30px] h-44 w-44 bg-[#A7C6E8]" />
      <span className="float-orb bottom-[-70px] right-[-40px] h-52 w-52 bg-[#F5D54A]/70" />
      <span className="float-orb left-[40%] top-[10%] h-32 w-32 bg-[#9BC3E8]/60" />

      <div className="mx-auto w-full max-w-[1280px]">
        <div
          className={`fade-up relative mb-5 overflow-hidden rounded-3xl border p-4 backdrop-blur ${
            isNightMode ? "border-[#3E6A93]/45 bg-slate-900/75 shadow-[0_14px_45px_rgba(5,10,30,0.55)]" : "border-[#C3D8EC] bg-white/80 shadow-[0_14px_45px_rgba(16,74,124,0.14)]"
          }`}
        >
          <div className="pointer-events-none absolute inset-x-6 top-0 h-20 bg-gradient-to-r from-[#2A6A9B]/30 via-[#8FB9E2]/20 to-[#F4D112]/30 blur-2xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
            <div className="flex items-start gap-4">
              <div>
                <div className="flex flex-row gap-4 items-center">
                  <div className="hidden h-16 w-16 items-center justify-center rounded-2xl border border-[#C7D9EA] bg-white/90 shadow-md sm:flex">
                    <img src={unsiaLogoSrc} alt="Logo UNSIA" className="h-16 w-16 object-contain" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#C6D8EA] bg-[#EFF5FC]/90 px-3 py-1 text-[.5em] font-semibold uppercase tracking-[0.18em] text-[#124D80]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E6BE00]" />
                      Suite Konversi SKS UNSIA [UNOFFICIAL]
                    </div>
                    <h1 className="brand-heading mt-1 font-extrabold text-[var(--brand-ink)] md:text-4xl">konversikan</h1>
                  </div>
                </div>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Platform simulasi konversi SKS mahasiswa pindahan Universitas Siber Asia, dengan tiga mesin penilaian: berbasis aturan, AI semantik lokal, dan AI semantik Ollama.
                </p>

                <div className="mt-4 flex flex-wrap gap-2.5 text-xs font-semibold">
                  <span className="rounded-full border border-[#BFD4E9] bg-[#EDF4FC] px-3 py-1 text-[#134E81]">Konversi Otomatis</span>
                  <span className="rounded-full border border-[#C9DBEC] bg-[#F2F7FD] px-3 py-1 text-[#1E5D90]">Pemetaan Manual</span>
                  <span className="rounded-full border border-[#F2D866] bg-[#FFF8DB] px-3 py-1 text-[#9A7400]">Ekspor Excel</span>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col justify-between gap-3 self-stretch lg:w-auto lg:items-end">
                <button
                  type="button"
                  onClick={() => setTheme((prev) => (prev === "day" ? "night" : "day"))}
                  className={`flex items-center justify-between rounded-xl border px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                    isNightMode ? "border-[#3E6A93]/45 bg-slate-900/50 text-slate-100 hover:bg-slate-800/70" : "border-[#BCD1E8] bg-white text-[#114A7B] hover:bg-[#F4F8FD]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${isNightMode ? "bg-slate-800 text-yellow-300" : "bg-[#EEF5FD] text-[#114A7B]"}`}>
                      {isNightMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                    </span>
                    {isNightMode ? "Mode Terang" : "Mode Gelap"}
                  </span>
                   </button>

              <div className="w-full sm:max-w-[480px] lg:w-auto">
                <p className={`mb-1 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${isNightMode ? "text-slate-300" : "text-slate-500"}`}>
                  Pilih Versi
                </p>
              <div
                className={`fade-up-delay-2 flex flex-wrap justify-start gap-2 overflow-x-auto rounded-2xl border p-2 backdrop-blur ${
                  isNightMode ? "border-[#3E6A93]/45 bg-slate-900/60 shadow-[0_8px_30px_rgba(2,6,23,0.45)]" : "border-[#C3D8EC] bg-white/70 shadow-sm"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveVersion("v1")}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition whitespace-nowrap ${
                    activeVersion === "v1"
                      ? "border-[#1F6296] bg-gradient-to-r from-[#104A7C] to-[#1F6296] text-white shadow-lg shadow-[#9ABDE0]/60"
                      : "border-[#C3D8EC] bg-white text-[#114A7B] hover:bg-[#F1F7FD]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-current/80" />
                    Berbasis Aturan
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVersion("v2")}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition whitespace-nowrap ${
                    activeVersion === "v2"
                      ? "border-[#D4AB00] bg-gradient-to-r from-[#D4AB00] to-[#F4D112] text-[#1F3A57] shadow-lg shadow-[#EFD97A]/60"
                      : "border-[#E8D59B] bg-white text-[#8C6A00] hover:bg-[#FFF9E2]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-current/80" />
                    AI Semantik
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVersion("v3")}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition whitespace-nowrap ${
                    activeVersion === "v3"
                      ? "border-[#E17800] bg-gradient-to-r from-[#E17800] to-[#F0A000] text-white shadow-lg shadow-[#F0C98A]/60"
                      : "border-[#E8C49B] bg-white text-[#8A5200] hover:bg-[#FFF1E1]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-current/80" />
                    Ollama API
                  </span>
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fade-up-delay-3">
          {activeVersion === "v1" && <VersionOnePage />}
          {activeVersion === "v2" && <VersionTwoPage />}
          {activeVersion === "v3" && <VersionThreePage />}
        </div>

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

              <div className="mt-2 space-y-3 text-sm leading-relaxed">
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
