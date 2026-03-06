# konversikan

`konversikan` adalah aplikasi web untuk simulasi konversi transkrip mahasiswa pindahan ke kurikulum program studi tujuan di UNSIA (Universitas Siber Asia).

## Fitur Utama
- Dua mesin pencocokan:
  - `Versi 1` (rule-based): competency map + similarity + fuzzy.
  - `Versi 2` (semantic AI): embedding multilingual dengan `@huggingface/transformers`.
- Upload transkrip dari beragam format: `JSON`, `CSV`, `XLS`, `XLSX`.
- Download template transkrip siap isi.
- Ringkasan otomatis:
  - SKS diakui
  - Sisa SKS
  - Jumlah MK terkonversi/tidak cocok
  - Estimasi semester
- Dropdown rekomendasi per mata kuliah dengan persentase kecocokan.
- Override manual:
  - pilih rekomendasi tertentu
  - atau tandai manual sebagai tidak setara
- Progress semantic engine + cache embedding untuk proses lebih cepat pada pemakaian berikutnya.
- Tema `Kampus Day` dan `Kampus Night`.

## Teknologi
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- SheetJS (`xlsx`) untuk parsing CSV/Excel
- Hugging Face Transformers JS untuk semantic embedding

## Menjalankan Proyek
### Prasyarat
- Node.js 18+
- Bun (direkomendasikan pada proyek ini) atau npm

### Install Dependensi
```bash
bun install
```

Jika memakai npm:
```bash
npm install
```

### Jalankan Development Server
```bash
bun run dev
```

Alternatif npm:
```bash
npm run dev
```

### Build Production
```bash
bun run build
```

### Preview Build
```bash
bun run preview
```

## Format Data
### Kurikulum
- Simpan file kurikulum di `src/kurikulum/*.json`.
- Struktur mengikuti file contoh yang sudah ada di folder tersebut.

### Transkrip Upload
- Diterima: `json`, `csv`, `xls`, `xlsx`.
- Kolom utama yang dibaca:
  - `nama`
  - `sks`
  - `nilai`
  - `kode` (opsional)

Aplikasi juga mendukung template Excel internal yang memuat metadata mahasiswa (nama, asal kampus, asal jurusan).

## Catatan Semantic AI (Versi 2)
- Pada penggunaan pertama, model AI akan diunduh terlebih dahulu.
- Setelah model tersedia lokal, proses berikutnya jauh lebih cepat.
- Embedding hasil encode disimpan pada cache in-memory selama sesi aplikasi berjalan.

## Struktur Folder Ringkas
```text
src/
  components/          # Komponen UI (selector, uploader, summary, table)
  kurikulum/           # Data kurikulum per program studi
  pages/               # Halaman Versi 1 dan Versi 2
  utils/               # Matching, similarity, parsing, semantic, dll
  App.tsx              # Shell utama + switch versi + theme
```

## Status dan Interpretasi Hasil
- `Cocok (Map Kompetensi)`: kesetaraan kuat dari competency map.
- `Cocok (AI - Yakin/Ragu-ragu)`: hasil semantic dengan confidence bertingkat.
- `Manual (...)`: hasil ditetapkan melalui pilihan manual pengguna.
- `Tidak Cocok`: tidak ditemukan kesetaraan yang layak pada threshold aktif.

## Lisensi
Saat ini belum ditetapkan secara eksplisit. Tambahkan file `LICENSE` bila diperlukan kebijakan distribusi formal.
