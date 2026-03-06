import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, type ColDef, type RowClassParams, type ValueFormatterParams, themeBalham } from "ag-grid-community";
import type { MataKuliah, MatchResult } from "../types";
import * as XLSX from "xlsx";

ModuleRegistry.registerModules([AllCommunityModule]);

interface ResultsTableProps {
  results: MatchResult[];
  selectedRecommendations: Record<number, number>;
  customSelections: Record<number, MataKuliah>;
  availableCourses: MataKuliah[];
  onSelectRecommendation: (resultIndex: number, recommendationIndex: number) => void;
  onSelectManualCourse: (resultIndex: number, course: MataKuliah) => void;
  onClearManualCourse: (resultIndex: number) => void;
  onBulkSetUnmatched: (indices: number[]) => void;
}

interface ResultsTableRow {
  rowIndex: number;
  sortBucket: number;
  sortLabel: string;
  targetKey: string;
  duplicateGroupSize: number;
  transcriptName: string;
  grade: string;
  transcriptSks: number | null;
  targetName: string;
  targetSks: number | null;
  scorePercent: number | null;
  statusText: string;
  statusCls: string;
  isDuplicate: boolean;
  result: MatchResult;
  manualSelected: boolean;
}

function getStatusBadge(method: string, hasMatch: boolean, score: number): { text: string; cls: string } {
  switch (method) {
    case "competency":
      return { text: "Setara", cls: "bg-emerald-100 text-emerald-800" };
    case "similarity":
      return { text: "Setara", cls: "bg-blue-100 text-blue-800" };
    case "fuzzy":
      return { text: "Setara", cls: "bg-cyan-100 text-cyan-800" };
    case "semantic":
      if (score < 0.7) return { text: "Setara", cls: "bg-amber-100 text-amber-800" };
      return { text: "Setara", cls: "bg-teal-100 text-teal-800" };
    case "best_score":
      if (score < 0.7) return { text: "Setara", cls: "bg-amber-100 text-amber-800" };
      return { text: "Setara", cls: "bg-sky-100 text-sky-800" };
    case "blacklisted":
      return { text: "Dikecualikan", cls: "bg-gray-200 text-gray-600" };
    case "grade_invalid":
      return { text: "Nilai Rendah", cls: "bg-orange-100 text-orange-800" };
    case "manual":
      if (score < 0.7) return { text: "Manual", cls: "bg-yellow-100 text-yellow-800" };
      return { text: "Manual", cls: "bg-violet-100 text-violet-800" };
    case "manual_custom":
      return { text: "Manual", cls: "bg-fuchsia-100 text-fuchsia-800" };
    case "manual_unmatched":
      return { text: "Tidak Setara", cls: "bg-rose-100 text-rose-800" };
    default:
      return hasMatch ? { text: "Setara", cls: "bg-green-100 text-green-800" } : { text: "Tidak Setara", cls: "bg-red-100 text-red-800" };
  }
}

function getSortPriorityMeta(method: string, hasMatch: boolean): { bucket: number; label: string } {
  if (method === "manual_custom") return { bucket: 1, label: "Manual" };
  if (method === "manual") return { bucket: 2, label: "Rekomendasi" };
  if (method === "semantic") return { bucket: 3, label: "AI" };
  if (method === "manual_unmatched") return { bucket: 4, label: "Tidak Cocok Manual" };

  if (!hasMatch) {
    if (method === "unmatched" || method === "blacklisted" || method === "grade_invalid") {
      return { bucket: 5, label: "Tidak Cocok AI" };
    }
    return { bucket: 5, label: "Tidak Cocok AI" };
  }

  // Hasil pencocokan otomatis berbasis aturan masuk kelompok rekomendasi.
  return { bucket: 2, label: "Rekomendasi" };
}

export default function ResultsTable({
  results,
  selectedRecommendations,
  customSelections,
  availableCourses,
  onSelectRecommendation,
  onSelectManualCourse,
  onClearManualCourse,
  onBulkSetUnmatched,
}: ResultsTableProps) {
  const [activeManualSelectionRow, setActiveManualSelectionRow] = useState<number | null>(null);
  const [courseSearchKeyword, setCourseSearchKeyword] = useState("");
  const [exportBlockingMessage, setExportBlockingMessage] = useState<string>("");
  const [autoResolveMessage, setAutoResolveMessage] = useState<string>("");
  const [isAutoResolveDialogOpen, setIsAutoResolveDialogOpen] = useState(false);
  const manualPickerDialogRef = useRef<HTMLDivElement | null>(null);
  const manualPickerSearchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (activeManualSelectionRow === null) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Pastikan fokus keyboard langsung masuk ke modal saat dibuka.
    setTimeout(() => {
      manualPickerSearchInputRef.current?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveManualSelectionRow(null);
        return;
      }

      if (e.key !== "Tab" || !manualPickerDialogRef.current) return;

      const focusable = manualPickerDialogRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [activeManualSelectionRow]);

  const duplicateTargetGroups = useMemo(() => {
    const map = new Map<string, { name: string; indices: number[] }>();

    for (let i = 0; i < results.length; i++) {
      const matchedCourse = results[i].match;
      if (!matchedCourse) continue;
      const key = `${matchedCourse.kode ?? ""}::${matchedCourse.nama.toLowerCase()}`;
      const prev = map.get(key);
      if (prev) {
        prev.indices.push(i);
        continue;
      }
      map.set(key, { name: matchedCourse.nama, indices: [i] });
    }

    return Array.from(map.values()).filter((g) => g.indices.length > 1);
  }, [results]);

  const duplicateResultRowSet = useMemo(() => {
    const set = new Set<number>();
    for (const group of duplicateTargetGroups) {
      for (const idx of group.indices) set.add(idx);
    }
    return set;
  }, [duplicateTargetGroups]);

  const filteredAvailableCourses = useMemo(() => {
    const q = courseSearchKeyword.trim().toLowerCase();
    const list = q ? availableCourses.filter((course) => `${course.kode ?? ""} ${course.nama}`.toLowerCase().includes(q)) : availableCourses;

    return list.slice(0, 40);
  }, [availableCourses, courseSearchKeyword]);

  const gridRows = useMemo<ResultsTableRow[]>(() => {
    const targetCount = new Map<string, number>();

    for (let i = 0; i < results.length; i++) {
      const matchedCourse = results[i].match;
      if (!matchedCourse) continue;
      const key = `${matchedCourse.kode ?? ""}::${matchedCourse.nama.toLowerCase()}`;
      targetCount.set(key, (targetCount.get(key) ?? 0) + 1);
    }

    const rows = results.map((r, i) => {
      const label = getStatusBadge(r.method, Boolean(r.match), r.score);
      const sortMeta = getSortPriorityMeta(r.method, Boolean(r.match));
      const targetKey = r.match ? `${r.match.kode ?? ""}::${r.match.nama.toLowerCase()}` : `unmatched::${i}`;
      const duplicateGroupSize = targetCount.get(targetKey) ?? 1;
      return {
        rowIndex: i,
        sortBucket: sortMeta.bucket,
        sortLabel: sortMeta.label,
        targetKey,
        duplicateGroupSize,
        transcriptName: r.transcript.nama,
        grade: r.transcript.nilai || "-",
        transcriptSks: r.transcript.sks ?? null,
        targetName: r.match?.nama ?? "—",
        targetSks: r.match?.sks ?? null,
        scorePercent: r.score > 0 ? Math.max(0, Math.min(100, Math.round(r.score * 100))) : null,
        statusText: label.text,
        statusCls: label.cls,
        isDuplicate: duplicateResultRowSet.has(i),
        result: r,
        manualSelected: Boolean(customSelections[i]),
      };
    });

    rows.sort((a, b) => {
      if (a.sortBucket !== b.sortBucket) return a.sortBucket - b.sortBucket;

      const aDup = a.duplicateGroupSize > 1;
      const bDup = b.duplicateGroupSize > 1;
      if (aDup !== bDup) return aDup ? -1 : 1;

      if (a.targetKey !== b.targetKey) {
        if (a.result.match && b.result.match) {
          return a.targetName.localeCompare(b.targetName, "id");
        }
        return a.transcriptName.localeCompare(b.transcriptName, "id");
      }

      return (b.scorePercent ?? -1) - (a.scorePercent ?? -1);
    });

    return rows;
  }, [results, duplicateResultRowSet, customSelections]);

  const columnDefs = useMemo<ColDef<ResultsTableRow>[]>(() => {
    return [
      {
        headerName: "#",
        valueGetter: (p) => (p.node?.rowIndex !== null && p.node?.rowIndex !== undefined ? p.node.rowIndex + 1 : ""),
        width: 55,
        sortable: false,
        pinned: "left",
      },
      {
        headerName: "Nama Mata Kuliah Asal",
        field: "transcriptName",
        width: 250,
        flex: 1,
        pinned: "left",
      },
      {
        headerName: "Nilai",
        field: "grade",
        width: 50,
        pinned: "left",
      },
      {
        headerName: "SKS",
        field: "transcriptSks",
        width: 50,
        valueFormatter: (p: ValueFormatterParams<ResultsTableRow, number | null>) => (p.value !== null && p.value !== undefined ? String(p.value) : "-"),
        pinned: "left",
      },
      {
        headerName: "Nama Mata Kuliah Tujuan",
        field: "targetName",
        width: 250,
        flex: 1,
        cellRenderer: (p: { data?: ResultsTableRow; value?: string }) => {
          const d = p.data;
          if (!d) return null;
          return (
              p.value
          );
        },
      },
      {
        headerName: "SKS",
        field: "targetSks",
        width: 50,
        valueFormatter: (p: ValueFormatterParams<ResultsTableRow, number | null>) => (p.value !== null && p.value !== undefined ? String(p.value) : "-"),
      },
      {
        headerName: "Rekomendasi",
        width: 250,
        sortable: false,
        cellRenderer: (p: { data?: ResultsTableRow }) => {
          const d = p.data;
          if (!d) return null;
          const selected = selectedRecommendations[d.rowIndex];
          return (
            <select
              value={selected !== undefined ? String(selected) : ""}
              onChange={(e) => {
                if (e.target.value === "") return;
                onSelectRecommendation(d.rowIndex, Number(e.target.value));
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
            >
              <option value="">Pilih rekomendasi...</option>
              <option value="-1">Tetapkan Tidak Setara</option>
              {(d.result.recommendations ?? []).map((rec, idx) => (
                <option key={`${rec.match.kode ?? idx}-${rec.match.nama}`} value={String(idx)}>
                  {rec.match.nama} ({Math.round(rec.score * 100)}%)
                </option>
              ))}
            </select>
          );
        },
      },
      {
        headerName: "Aksi",
        width: 100,
        sortable: false,
        cellRenderer: (p: { data?: ResultsTableRow }) => {
          const d = p.data;
          if (!d) return null;
          return (
            <div className="flex flex-col gap-1 py-1">
              <button
                type="button"
                onClick={() => {
                  setActiveManualSelectionRow(d.rowIndex);
                  setCourseSearchKeyword("");
                }}
                className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
              >
                Pilih Manual
              </button>
              {d.manualSelected && (
                <button
                  type="button"
                  onClick={() => onClearManualCourse(d.rowIndex)}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Hapus Manual
                </button>
              )}
            </div>
          );
        },
      },
      {
        headerName: "Skor",
        field: "scorePercent",
        width: 50,
        valueFormatter: (p: ValueFormatterParams<ResultsTableRow, number | null>) => (p.value !== null ? `${p.value}%` : "-"),
        pinned: "right",
      },
      {
        headerName: "Status",
        width: 75,
        cellRenderer: (p: { data?: ResultsTableRow }) => {
          const d = p.data;
          if (!d) return null;
          return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${d.statusCls}`}>{d.statusText}</span>;
        },
        pinned: "right",
      },
    ];
  }, [onClearManualCourse, onSelectRecommendation, selectedRecommendations]);

  const defaultColumnDef = useMemo<ColDef<ResultsTableRow>>(() => {
    return {
      resizable: true,
      sortable: true,
      filter: false,
      suppressHeaderMenuButton: true,
    };
  }, []);

  const gridRowClassRules = useMemo(() => {
    return {
      "bg-red-50/40": (p: RowClassParams<ResultsTableRow>) => !p.data?.result.match,
      "bg-amber-50": (p: RowClassParams<ResultsTableRow>) => Boolean(p.data?.isDuplicate),
    };
  }, []);

  const getGridRowStyle = useCallback((p: RowClassParams<ResultsTableRow>) => {
    if (p.data?.isDuplicate) {
      return { backgroundColor: "#fef3c7" };
    }

    if (!p.data?.result.match) {
      return { backgroundColor: "#fee2e2" };
    }

    return undefined;
  }, []);

  function handleOpenAutoResolveDialog() {
    if (duplicateTargetGroups.length === 0) return;
    setIsAutoResolveDialogOpen(true);
  }

  function handleConfirmAutoResolveDuplicates() {
    setIsAutoResolveDialogOpen(false);

    const indicesToSetUnmatched: number[] = [];

    for (const group of duplicateTargetGroups) {
      const sortedIndicesByScoreDesc = [...group.indices].sort((a, b) => {
        const scoreDiff = results[b].score - results[a].score;
        if (scoreDiff !== 0) return scoreDiff;

        // Penentu seri yang konsisten: pertahankan indeks baris paling awal.
        return a - b;
      });
      for (let i = 1; i < sortedIndicesByScoreDesc.length; i++) indicesToSetUnmatched.push(sortedIndicesByScoreDesc[i]);
    }

    if (indicesToSetUnmatched.length > 0) {
      onBulkSetUnmatched(indicesToSetUnmatched);
      setAutoResolveMessage("Penanganan otomatis selesai. Sistem menyisakan skor tertinggi per grup duplikat, tetapi hasil bisa tidak akurat. Harap cek kembali.");
      return;
    }

    setAutoResolveMessage("Tidak ada baris yang perlu diubah oleh penanganan otomatis.");
  }

  const duplicateRowsCount = useMemo(() => {
    return duplicateTargetGroups.reduce((total, group) => total + group.indices.length, 0);
  }, [duplicateTargetGroups]);

  function handleExportToExcel() {
    if (duplicateTargetGroups.length > 0) {
      setExportBlockingMessage("Ekspor diblokir: masih ada duplikat mata kuliah tujuan. Rapikan dulu duplikatnya.");
      return;
    }

    setExportBlockingMessage("");
    const rows = gridRows.map((r, idx) => ({
      No: idx + 1,
      "Nama Mata Kuliah": r.transcriptName,
      Nilai: r.grade,
      "SKS Asal": r.transcriptSks ?? "-",
      "Nama Mata Kuliah Tujuan": r.targetName === "—" ? "-" : r.targetName,
      "SKS Tujuan": r.targetSks ?? "-",
      Skor: r.scorePercent !== null ? `${r.scorePercent}%` : "-",
      Status: r.statusText,
      Metode: r.sortLabel,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Hasil Konversi");
    XLSX.writeFile(wb, "hasil_konversi_unsia.xlsx");
  }

  if (results.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_28px_rgba(30,41,59,0.09)]">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Hasil Konversi Mata Kuliah</h2>
        </div>
        <div className="px-6 py-12 text-center text-slate-400">
          <p>Unggah transkrip untuk menampilkan hasil konversi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_28px_rgba(30,41,59,0.09)]">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Hasil Konversi Mata Kuliah</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleExportToExcel} className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-200">
              Ekspor Excel
            </button>
            {duplicateTargetGroups.length > 0 && (
              <button
                type="button"
                onClick={handleOpenAutoResolveDialog}
                className="rounded-lg border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-200"
              >
                Atur Otomatis Duplikat
              </button>
            )}
          </div>
        </div>
      </div>

      {duplicateTargetGroups.length > 0 && (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-xs text-amber-900">
          <p className="font-semibold">Ditemukan {duplicateTargetGroups.length} hasil konversi duplikat (1 mata kuliah tujuan dipakai lebih dari 1 baris).</p>
          <p className="mt-1">Baris berwarna kuning menandakan duplikat. Klik "Atur Otomatis Duplikat" untuk mempertahankan skor tertinggi dan menandai sisanya tidak setara.</p>
        </div>
      )}

      {exportBlockingMessage && <div className="border-b border-rose-200 bg-rose-50 px-6 py-2.5 text-xs font-medium text-rose-700">{exportBlockingMessage}</div>}

      {autoResolveMessage && <div className="border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-xs font-medium text-amber-800">{autoResolveMessage}</div>}

      <div className="p-4 h-[400px] md:h-[500px]">
        <AgGridReact<ResultsTableRow>
          theme={themeBalham}
          rowData={gridRows}
          columnDefs={columnDefs}
          defaultColDef={defaultColumnDef}
          rowHeight={30}
          headerHeight={40}
          animateRows
          rowClassRules={gridRowClassRules}
          getRowStyle={getGridRowStyle}
          suppressCellFocus
        />
      </div>

      {activeManualSelectionRow !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/55 p-4">
            <div ref={manualPickerDialogRef} role="dialog" aria-modal="true" className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">Pilih Mata Kuliah Manual</h3>
                    <p className="text-xs text-slate-500">
                      Baris #{activeManualSelectionRow + 1}: {results[activeManualSelectionRow].transcript.nama}
                    </p>
                  </div>
                  <button type="button" onClick={() => setActiveManualSelectionRow(null)} className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">
                    Tutup
                  </button>
                </div>
                <input
                  ref={manualPickerSearchInputRef}
                  value={courseSearchKeyword}
                  onChange={(e) => setCourseSearchKeyword(e.target.value)}
                  placeholder="Cari kode atau nama mata kuliah..."
                  className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                />
              </div>

              <div className="max-h-[56vh] overflow-y-auto px-3 py-3">
                <div className="mb-2 flex items-center justify-between px-2 text-xs text-slate-500">
                  <span>{filteredAvailableCourses.length} hasil ditampilkan</span>
                  <span>Maksimal 40 hasil per pencarian</span>
                </div>
                <div className="space-y-2">
                  {filteredAvailableCourses.map((course, idx) => (
                    <button
                      type="button"
                      key={`${course.kode ?? idx}-${course.nama}`}
                      onClick={() => {
                        onSelectManualCourse(activeManualSelectionRow, course);
                        setActiveManualSelectionRow(null);
                      }}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <span className="truncate pr-3 text-sm text-slate-800">{course.nama}</span>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {course.kode ?? "TANPA-KODE"} | {course.sks} SKS
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {isAutoResolveDialogOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[10000] overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="fixed inset-0 bg-slate-900/60 transition-opacity" aria-hidden="true" onClick={() => setIsAutoResolveDialogOpen(false)} />

              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="auto-resolve-title"
                className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:p-6"
              >
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                    </svg>
                  </div>

                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 id="auto-resolve-title" className="text-base font-semibold text-slate-900">
                      Konfirmasi Penanganan Otomatis Duplikat
                    </h3>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <p>
                        Proses ini akan menyisakan <span className="font-semibold text-slate-800">1 baris dengan skor tertinggi</span> di setiap grup duplikat.
                      </p>
                      <p>
                        Grup duplikat: <span className="font-semibold text-slate-800">{duplicateTargetGroups.length}</span>
                        <br />
                        Total baris duplikat: <span className="font-semibold text-slate-800">{duplicateRowsCount}</span>
                      </p>
                      <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                        Hasil penanganan otomatis dapat tidak akurat. Harap cek kembali hasil konversi setelah proses selesai.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmAutoResolveDuplicates}
                    className="inline-flex w-full justify-center rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-500 sm:w-auto"
                  >
                    Lanjutkan Penanganan Otomatis
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAutoResolveDialogOpen(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 ring-inset hover:bg-slate-50 sm:mt-0 sm:w-auto"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
