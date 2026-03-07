/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Curriculum, MataKuliah, MatchResult, TranscriptCourse } from "../types";
import type { OllamaEmbeddingConfig, SemanticProgress } from "../types/semantic";
import ProdiSelector from "../components/ProdiSelector";
import FileUploader from "../components/FileUploader";
import SummaryCards from "../components/SummaryCards";
import ResultsTable from "../components/ResultsTable";
import { buildEffectiveResults } from "../utils/effectiveResults";
import { calculateStudyDuration } from "../utils/studyDuration";
import { flattenMK } from "../utils/matching";
import { isOllamaModelReady, matchTranscriptSemanticOllama, testOllamaConnection } from "../utils/semanticMatchingOllama";
import { applyParsedFile, bulkSetUnmatchedSelections, clearManualCourseSelection, resetUploaderAndSelections, setManualCourseSelection, setRecommendationSelection } from "../utils/selectionHandlers";
import { Check, Settings, X } from "lucide-react";

const DEFAULT_OLLAMA_URL = "http://localhost:11434";
const DEFAULT_OLLAMA_MODEL = "bge-m3";
const OLLAMA_CONFIG_STORAGE_KEY = "konversikan:ollama-config-v1";

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function runOllamaMatchProcess(
  transcript: TranscriptCourse[],
  curr: Curriculum,
  config: OllamaEmbeddingConfig,
  setIsProcessing: (value: boolean) => void,
  setErrorMessage: (message: string) => void,
  setSemanticProgress: (progress: SemanticProgress | null | ((prev: SemanticProgress | null) => SemanticProgress | null)) => void,
  setModelReady: (value: boolean) => void,
  setResults: (next: MatchResult[]) => void,
  setManualSelections: (next: Record<number, number>) => void,
  setCustomSelections: (next: Record<number, MataKuliah>) => void,
  isCancelled: () => boolean,
) {
  try {
    setIsProcessing(true);
    setErrorMessage("");
    setSemanticProgress({
      stage: "loading_model",
      processed: 0,
      total: 1,
      percent: 0,
      message: "Menyiapkan koneksi Ollama...",
    });

    const next = await matchTranscriptSemanticOllama(transcript, curr, config, {
      onProgress: (progress) => {
        if (!isCancelled()) setSemanticProgress(progress);
        if (!isCancelled() && progress.stage === "loading_model" && progress.percent >= 100) {
          setModelReady(true);
        }
      },
    });

    if (!isCancelled()) {
      setResults(next);
      setManualSelections({});
      setCustomSelections({});
    }
  } catch (err) {
    if (!isCancelled()) {
      console.error(err);
      setResults([]);
      setErrorMessage("Gagal terhubung ke Ollama. Pastikan server aktif, URL benar, model tersedia, dan CORS diizinkan.");
    }
  } finally {
    if (!isCancelled()) {
      setIsProcessing(false);
      setTimeout(() => {
        setSemanticProgress((prev) => (prev?.stage === "done" ? null : prev));
      }, 1200);
    }
  }
}

export default function VersionThreePage() {
  const [curricula, setCurricula] = useState<Record<string, Curriculum>>({});
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [transcript, setTranscript] = useState<TranscriptCourse[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [manualSelections, setManualSelections] = useState<Record<number, number>>({});
  const [customSelections, setCustomSelections] = useState<Record<number, MataKuliah>>({});
  const [fileName, setFileName] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [asalKampus, setAsalKampus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [connectionMessage, setConnectionMessage] = useState<string>("");
  const [semanticProgress, setSemanticProgress] = useState<SemanticProgress | null>(null);
  const [modelReady, setModelReady] = useState<boolean>(isOllamaModelReady());

  const [serverUrlInput, setServerUrlInput] = useState<string>(DEFAULT_OLLAMA_URL);
  const [modelInput, setModelInput] = useState<string>(DEFAULT_OLLAMA_MODEL);
  const [config, setConfig] = useState<OllamaEmbeddingConfig>({
    serverUrl: DEFAULT_OLLAMA_URL,
    model: DEFAULT_OLLAMA_MODEL,
  });
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const uploaderRef = useRef<{ reset: () => void } | null>(null);
  const hasAutoCheckedConnectionRef = useRef(false);

  useEffect(() => {
    const modules = import.meta.glob("../kurikulum/*.json", {
      eager: true,
    }) as Record<string, { default: Curriculum }>;

    const loaded: Record<string, Curriculum> = {};
    for (const [path, mod] of Object.entries(modules)) {
      const name =
        path
          .split("/")
          .pop()
          ?.replace(/\.json$/, "") ?? path;
      loaded[name] = mod.default;
    }

    setCurricula(loaded);
    const keys = Object.keys(loaded);
    if (keys.length > 0) setSelectedKey(keys[0]);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(OLLAMA_CONFIG_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<OllamaEmbeddingConfig>;
      const serverUrl = (parsed.serverUrl ?? "").trim();
      const model = (parsed.model ?? "").trim();
      if (!serverUrl || !model || !isValidHttpUrl(serverUrl)) return;

      setServerUrlInput(serverUrl);
      setModelInput(model);
      setConfig({ serverUrl, model });
    } catch {
      // Ignore invalid localStorage payload.
    }
  }, []);

  useEffect(() => {
    const curr = curricula[selectedKey];
    if (!curr || transcript.length === 0) {
      setResults([]);
      setManualSelections({});
      setCustomSelections({});
      setIsProcessing(false);
      setErrorMessage("");
      setSemanticProgress(null);
      return;
    }

    let cancelled = false;

    void runOllamaMatchProcess(transcript, curr, config, setIsProcessing, setErrorMessage, setSemanticProgress, setModelReady, setResults, setManualSelections, setCustomSelections, () => cancelled);

    return () => {
      cancelled = true;
    };
  }, [transcript, selectedKey, curricula, config]);

  const effectiveResults = buildEffectiveResults(results, manualSelections, customSelections);

  const matchedCount = effectiveResults.filter((r) => r.match).length;
  const unmatchedCount = effectiveResults.length - matchedCount;
  const totalSKS = effectiveResults.reduce((sum, r) => sum + (r.match?.sks ?? 0), 0);
  const totalSKSWajib = curricula[selectedKey]?.total_sks_lulus ?? 144;
  const allTargetCourses = curricula[selectedKey] ? flattenMK(curricula[selectedKey]) : [];
  const { estSemesters, remainingSKS } = calculateStudyDuration(totalSKS, totalSKSWajib);

  const executeConnectionTest = async (serverUrl: string, model: string, showStatusMessage: boolean) => {
    setIsTestingConnection(true);
    setErrorMessage("");
    if (showStatusMessage) setConnectionMessage("Menguji koneksi Ollama...");

    try {
      await testOllamaConnection({ serverUrl, model });
      setModelReady(true);
      if (showStatusMessage) {
        setConnectionMessage(`Koneksi berhasil. Ollama siap di ${serverUrl} dengan model ${model}.`);
      } else {
        setConnectionMessage("");
      }
      return true;
    } catch (error) {
      console.error(error);
      setModelReady(false);
      setConnectionMessage("");
      if (showStatusMessage) {
        setErrorMessage("Tes koneksi gagal. Pastikan Ollama aktif, model tersedia, dan CORS diizinkan.");
      }
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  const applyConfig = async () => {
    const trimmedUrl = serverUrlInput.trim();
    const trimmedModel = modelInput.trim();

    if (!isValidHttpUrl(trimmedUrl)) {
      setErrorMessage("URL Ollama tidak valid. Contoh: http://localhost:11434");
      return;
    }

    if (!trimmedModel) {
      setErrorMessage("Nama model Ollama tidak boleh kosong.");
      return;
    }

    setErrorMessage("");
    setConnectionMessage("");
    const isConnected = await executeConnectionTest(trimmedUrl, trimmedModel, true);
    if (!isConnected) return;

    const nextConfig = { serverUrl: trimmedUrl, model: trimmedModel };
    setConfig(nextConfig);
    localStorage.setItem(OLLAMA_CONFIG_STORAGE_KEY, JSON.stringify(nextConfig));
    setIsConfigModalOpen(false);
  };

  useEffect(() => {
    if (hasAutoCheckedConnectionRef.current) return;
    hasAutoCheckedConnectionRef.current = true;

    const trimmedUrl = config.serverUrl.trim();
    const trimmedModel = config.model.trim();
    if (!isValidHttpUrl(trimmedUrl) || !trimmedModel) {
      setModelReady(false);
      return;
    }

    void executeConnectionTest(trimmedUrl, trimmedModel, false);
  }, [config.serverUrl, config.model]);

  return (
    <div className="glass-panel rounded-3xl  p-4">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="w-full rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 text-xs md:text-sm font-medium text-orange-700 whitespace-nowrap">
          <span className="block truncate">Versi 3: Evaluasi AI semantik via Ollama API (default model: {DEFAULT_OLLAMA_MODEL})</span>
        </div>
        <button
          type="button"
          title="Buka pengaturan Ollama"
          aria-label="Buka pengaturan Ollama"
          onClick={() => setIsConfigModalOpen(true)}
          className="relative inline-flex px-4 py-3 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-700 transition hover:bg-orange-100"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
          {modelReady && (
            <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-3 w-3" aria-hidden="true" />
            </span>
          )}
        </button>
      </div>

      {isConfigModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60" onClick={() => setIsConfigModalOpen(false)} aria-hidden="true" />
            <div className="relative w-full max-w-2xl rounded-3xl border border-orange-200 bg-white p-5 shadow-2xl sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Pengaturan Ollama</h2>
                  <p className="mt-1 text-sm text-slate-500">Atur endpoint server dan model embedding yang ingin dipakai.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                  aria-label="Tutup pengaturan Ollama"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  URL server Ollama
                  <input
                    type="url"
                    value={serverUrlInput}
                    onChange={(event) => setServerUrlInput(event.target.value)}
                    placeholder={DEFAULT_OLLAMA_URL}
                    className="mt-1.5 w-full rounded-lg border border-orange-200 px-3 py-2.5 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                  />
                </label>

                <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Nama model
                  <input
                    type="text"
                    value={modelInput}
                    onChange={(event) => setModelInput(event.target.value)}
                    placeholder={DEFAULT_OLLAMA_MODEL}
                    className="mt-1.5 w-full rounded-lg border border-orange-200 px-3 py-2.5 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => void applyConfig()}
                  disabled={isTestingConnection || isProcessing}
                  className="rounded-lg border border-orange-300 bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-800 transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isTestingConnection ? "Menyimpan..." : "Simpan Konfigurasi"}
                </button>
              </div>

              {connectionMessage && <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{connectionMessage}</div>}

              <p className="mt-3 text-xs text-slate-500">
                Konfigurasi aktif: <code>{config.serverUrl}</code> • model <code>{config.model}</code>
              </p>
            </div>
          </div>,
          document.body,
        )}

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <ProdiSelector
          curricula={curricula}
          selectedKey={selectedKey}
          onChange={(key) => {
            resetUploaderAndSelections(setSelectedKey, key, setResults, setTranscript, setFileName, setStudentName, setAsalKampus, setManualSelections, setCustomSelections, uploaderRef);
            setIsProcessing(false);
            setErrorMessage("");
            setSemanticProgress(null);
          }}
        />
        <FileUploader
          onParsed={(parsed, name) => {
            applyParsedFile(parsed, name, setTranscript, setFileName, setStudentName, setAsalKampus, setManualSelections, setCustomSelections);
            setErrorMessage("");
            setSemanticProgress(null);
          }}
          fileName={fileName}
          courseCount={transcript.length}
          studentName={studentName}
          asalKampus={asalKampus}
          resetRef={uploaderRef}
        />
      </div>

      {isProcessing && (
        <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          <p className="font-medium">{semanticProgress?.message || "Sedang memproses pencocokan semantik via Ollama, mohon tunggu..."}</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-orange-100">
            <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${semanticProgress?.percent ?? 0}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-orange-800/90">
            <span>{semanticProgress?.percent ?? 0}%</span>
            <span>Tahap: {semanticProgress?.stage ?? "-"}</span>
            {semanticProgress?.cacheHits !== undefined && <span>Cache ditemukan: {semanticProgress.cacheHits}</span>}
            {semanticProgress?.cacheMisses !== undefined && <span>Cache tidak ditemukan: {semanticProgress.cacheMisses}</span>}
          </div>
        </div>
      )}

      {errorMessage && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>}

      {effectiveResults.length > 0 && !isProcessing && (
        <SummaryCards matchedCount={matchedCount} unmatchedCount={unmatchedCount} totalSKS={totalSKS} estSemesters={estSemesters} remainingSKS={remainingSKS} totalSKSWajib={totalSKSWajib} />
      )}

      <ResultsTable
        results={effectiveResults}
        selectedRecommendations={manualSelections}
        customSelections={customSelections}
        availableCourses={allTargetCourses}
        onSelectRecommendation={(resultIndex, recommendationIndex) => setRecommendationSelection(resultIndex, recommendationIndex, setManualSelections, setCustomSelections)}
        onSelectManualCourse={(resultIndex, course) => setManualCourseSelection(resultIndex, course, setManualSelections, setCustomSelections)}
        onClearManualCourse={(resultIndex) => clearManualCourseSelection(resultIndex, setCustomSelections)}
        onBulkSetUnmatched={(indices) => bulkSetUnmatchedSelections(indices, setManualSelections, setCustomSelections)}
        originalTranscript={transcript}
        studentName={studentName}
        asalKampus={asalKampus}
      />
    </div>
  );
}
