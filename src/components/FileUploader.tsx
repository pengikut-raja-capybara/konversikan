import { type ChangeEvent, type RefObject, useImperativeHandle, useRef } from "react";
import { downloadTemplate, parseFile } from "../utils/parseFile";
import type { FileUploaderProps } from "../types/components";

async function handleUploaderChange(e: ChangeEvent<HTMLInputElement>, onParsed: FileUploaderProps["onParsed"], inputRef: RefObject<HTMLInputElement | null>) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const result = await parseFile(file);
    onParsed(result, file.name);
  } catch (err) {
    console.error(err);
    alert("Format file tidak valid. Harap unggah file Excel (XLS atau XLSX) " + "dengan kolom: kode / nama / sks / nilai");
  } finally {
    // reset input so the same file can be uploaded again without getting ignored
    if (inputRef.current) inputRef.current.value = "";
  }
}

export default function FileUploader({ onParsed, fileName, courseCount, studentName, asalKampus, resetRef }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(resetRef, () => ({
    reset() {
      if (inputRef.current) inputRef.current.value = "";
    },
  }));

  return (
    <div className="rounded-2xl border border-emerald-100 bg-[var(--surface)] p-6 shadow-[0_8px_28px_rgba(5,150,105,0.08)]">
      <div className="mb-3 flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">Unggah Transkrip Akademik</label>
        <button
          type="button"
          onClick={downloadTemplate}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-emerald-600 hover:to-teal-600"
        >
          ⬇ Unduh Template
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xls,.xlsx"
        onChange={(e) => void handleUploaderChange(e, onParsed, inputRef)}
        className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-700"
      />
      <p className="mt-2 text-xs text-slate-500">
        Format berkas: <span className="font-medium">XLS, XLSX</span> — kolom: <code className="rounded bg-slate-100 text-black px-1">nama</code>,{" "}
        <code className="rounded bg-slate-100 text-black px-1">sks</code>, <code className="rounded bg-slate-100 text-black px-1">nilai</code>
      </p>
      {fileName && (
        <div className="mt-2 space-y-0.5">
          <p className="text-xs text-green-600">
            ✓ Berkas dimuat: {fileName} ({courseCount} mata kuliah)
          </p>
          {studentName && (
            <p className="text-xs text-gray-500">
              Nama: <span className="font-medium">{studentName}</span>
            </p>
          )}
          {asalKampus && (
            <p className="text-xs text-gray-500">
              Asal Kampus: <span className="font-medium">{asalKampus}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
