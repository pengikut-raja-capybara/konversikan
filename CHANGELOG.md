# Changelog

All notable changes to this project will be documented in this file.

## [0.0.3] - 2026-03-07

### Added
- Version 3 (Ollama) now supports a compact settings modal with gear trigger and tooltip.
- Initial automatic Ollama connection check on page load, with a success checkmark indicator on the gear button.
- Detailed score display with 3 decimal precision in results table and recommendation dropdown options.

### Changed
- Results sorting updated: duplicate rows are prioritized to the top, grouped by target course, and ordered by highest score first.
- Non-duplicate rows now default to highest-score-first ordering.
- Duplicate row indicator changed from background color to red border while preserving score-based row backgrounds.

### Fixed
- Disabled AG Grid auto-scroll jump when setting rows to "Tetapkan tidak setara".
- Removed unused `modelReady` state from `VersionTwoPage`.

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
