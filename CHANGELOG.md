# Changelog

All notable changes to this project will be documented in this file.

## [0.0.2] - 2026-03-07

### Fixed
- Logo UNSIA now uses `import.meta.env.BASE_URL` in `src/App.tsx` so it loads correctly on GitHub Pages subpath deployment.

## [0.0.1] - 2026-03-07

### Added
- Dual conversion engines: rule-based matching (V1) and semantic AI matching (V2).
- AG Grid result table with recommendation selection and manual override.
- Duplicate target-course detection with automatic duplicate resolver.
- Excel export with two sheets: `Hasil Konversi` and `Transkrip Asal`.
- Transcript template download and Excel-only upload flow (`.xls`, `.xlsx`).
- Summary cards for converted SKS, remaining SKS, and semester estimation.
- Day/night theme toggle and credit/disclaimer modal.

### Changed
- Refactor: shared type modules under `src/types/*`.
- Refactor: reusable selection/effective-result helpers under `src/utils/*`.
