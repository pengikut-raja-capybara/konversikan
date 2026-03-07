# konversikan

> **Disclaimer:** Aplikasi ini merupakan prototipe edukasi yang dikembangkan oleh mahasiswa UNSIA sebagai sarana pembelajaran dan simulasi. Bukan produk resmi Universitas Siber Asia.

`konversikan` adalah aplikasi web untuk simulasi konversi transkrip mahasiswa pindahan ke kurikulum program studi tujuan di UNSIA (Universitas Siber Asia).

## Fitur Utama

### Tiga Mesin Pencocokan
- **Versi 1 — Berbasis Aturan**: peta kompetensi (200+ mapping) + kemiripan teks (3 tingkat: exact/inclusion, token, bigram) + fuzzy matching. Threshold kemiripan: 0.60.
- **Versi 2 — AI Semantik**: embedding multilingual `Xenova/paraphrase-multilingual-MiniLM-L12-v2` via `@huggingface/transformers`. Skor hybrid (semantic cosine + lexical). Threshold: 0.55. Batch encoding 24 teks, in-memory cache embedding, progress bar real-time.
- **Versi 3 — AI Semantik Ollama (Custom Model)**: embedding via API Ollama (default URL `http://localhost:11434`, default model `bge-m3`). URL server dan nama model dapat diatur pengguna agar fleksibel, dengan beban komputasi tetap di sisi pengguna.

### Upload & Template
- Upload transkrip dari format Excel: `XLS`, `XLSX`.
- Upload ulang file yang sama tanpa harus refresh halaman.
- Download template Excel siap isi (`template_transkrip_konversi.xlsx`) dengan metadata mahasiswa (nama, asal kampus, jurusan asal).

### Tabel Hasil (AG Grid)
- Sorting, filtering, dan pagination.
- Kolom: No, Nama MK Asal, Nilai, SKS, Nama MK Tujuan, SKS Tujuan, Rekomendasi (dropdown max 5), Aksi, Skor (%), Status.
- Dropdown rekomendasi per mata kuliah dengan opsi "Tetapkan Tidak Setara".

### Status Konversi
| Status | Keterangan |
|---|---|
| `Setara` | Kecocokan ditemukan (via competency map, similarity, fuzzy, semantic, atau best_score) |
| `Manual` | Ditetapkan secara manual oleh pengguna |
| `Tidak Setara` | Tidak ditemukan kecocokan yang memenuhi threshold |
| `Dikecualikan` | Mata kuliah masuk daftar hitam (skripsi, magang, PKL, KKN, dsb.) |
| `Nilai Rendah` | Nilai tidak memenuhi syarat (harus ≥ C: A, A−, B+, B, B−, C+, C, AB, BC, CB) |

### Override Manual
- Pilih rekomendasi tertentu dari dropdown.
- Pilih manual dari daftar mata kuliah tujuan (searchable, maks 40 item).
- Tandai manual sebagai tidak setara.

### Deteksi Duplikat
- Highlight baris duplikat (warna amber).
- Tombol "Atur Otomatis Duplikat" — pertahankan skor tertinggi, sisanya ditandai tidak setara.
- Ekspor Excel diblokir selama masih ada duplikat.

### Ekspor ke Excel
- Ekspor file `hasil_konversi_unsia.xlsx` dengan 2 sheet:
  - **Hasil Konversi** — tabel hasil konversi lengkap.
  - **Transkrip Asal** — data transkrip asli yang di-upload beserta metadata mahasiswa.

### Ringkasan Otomatis (5 Kartu)
- SKS Diakui
- Sisa SKS
- Jumlah MK Terkonversi
- Jumlah Tidak Cocok
- Estimasi Semester (maks 20 SKS semester pertama, 24 SKS selanjutnya)

### Lainnya
- Tema Mode Terang dan Mode Gelap.
- Daftar hitam otomatis untuk mata kuliah non-konversi (tugas akhir, skripsi, thesis, kerja praktek, magang, PKL, KKN, proyek akhir, dsb.).
- Ekspansi singkatan (70+ mapping: `peng` → pengantar, `bhs` → bahasa, `ai` → kecerdasan buatan, dsb.) untuk akurasi matching lebih tinggi.
- Model AI Versi 2 diunduh pada penggunaan pertama (~30 MB), selanjutnya jauh lebih cepat.
- Versi 3 memerlukan server Ollama aktif dan model sudah tersedia (contoh: `ollama pull bge-m3`).

## Kurikulum Tersedia
| Program Studi | File |
|---|---|
| Informatika | `kurikulum-Informatika.json` |
| Teknologi Informasi | `kurikulum-TI.json` |
| Sistem Informasi | `kurikulum-SI.json` |
| Manajemen | `kurikulum-Manajemen.json` |
| Akuntansi | `kurikulum-Akuntansi.json` |
| Komunikasi | `kurikulum-Komunikasi.json` |

## Teknologi
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- AG Grid React untuk tabel data interaktif
- SheetJS (`xlsx`) untuk parsing & ekspor Excel
- Hugging Face Transformers JS (`Xenova/paraphrase-multilingual-MiniLM-L12-v2`)

## Menjalankan Proyek
### Prasyarat
- Node.js 18+
- Bun (direkomendasikan) atau npm

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

### Build Production
```bash
bun run build
```

### Preview Build
```bash
bun run preview
```

## Deploy ke GitHub Pages
1. Jalankan `bun run build` untuk menghasilkan folder `dist`.
2. Push isi `dist` ke branch `gh-pages`, atau gunakan GitHub Actions untuk deploy otomatis.

## Format Data

### Kurikulum
- Simpan di `src/kurikulum/*.json`.
- Struktur: `{ kurikulum, total_sks_lulus, data_semester: [...] }`.

### Transkrip Upload
- Diterima: `xls`, `xlsx` (Excel).
- Kolom utama: `nama`, `sks`, `nilai` (`kode` opsional).
- Banyak variasi nama kolom didukung (misal: `Nama_Mata_Kuliah_Asal`, `Mata Kuliah`, `Course`, dsb.).
- Template Excel internal memuat metadata mahasiswa (nama, asal kampus, jurusan asal) di baris 1–3.

## Struktur Folder Ringkas
```text
src/
  components/          # FileUploader, ProdiSelector, SummaryCards, ResultsTable
  kurikulum/           # Data kurikulum 6 program studi (JSON)
  pages/               # VersionOnePage (rule-based), VersionTwoPage (semantic AI lokal), VersionThreePage (semantic Ollama API)
  utils/
    competencyMap.ts   # 200+ peta kesetaraan MK
    matching.ts        # Mesin rule-based (2-pass: competency → similarity → fuzzy)
    semanticMatching.ts      # Mesin semantic embedding lokal (transformers.js)
    semanticMatchingOllama.ts# Mesin semantic embedding via Ollama API
    similarity.ts      # 3-tier similarity: exact → token → bigram + ekspansi singkatan
    parseFile.ts       # Parser Excel + template generator
    studyDuration.ts   # Kalkulator estimasi semester (20/24 SKS per sem)
  types.ts             # TypeScript interfaces
  App.tsx              # Shell utama + theme switch + credit modal
```

## Lisensi
Proyek ini dilisensikan di bawah **MIT License** — lihat file [LICENSE](LICENSE) untuk detail.

## Kredit
Dibuat oleh **Angga Alfiansah** (240101010032) & **Raja Capybara** yang berbudi luhur.
© 2026 Pengikut Raja Capybara
