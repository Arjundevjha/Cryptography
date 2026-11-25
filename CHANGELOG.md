# Changelog

All notable changes to the Cryptography Museum and the Python cryptography
engine are documented here. Format follows Keep a Changelog.

## [Unreleased]

### Added

- **Shamir's Secret Sharing exhibit** (20th museum exhibit, Modern Wing):
  - `methods/modern/secret_sharing.py`: GF(p) $(k, n)$ threshold splitting & Lagrange interpolation at $x=0$ (`split_secret`, `reconstruct_secret`, `split_text_secret`, `reconstruct_text_secret`) with unit tests (`methods/modern/tests/test_secret_sharing.py`).
  - `web/api/routers/modern.py`: `POST /api/shamir/split` and `POST /api/shamir/reconstruct` endpoints (integer GF(p) and UTF-8 text modes) with API tests in `web/api/test_main.py`.
  - `web/`: 3D polynomial/share artifact (`modernNewExhibits.ts`), room palette (`wingArchitecture.ts`), wall art (`wallArtTextures.ts`), interactive `ShamirView.tsx` workbench, step inspector, and unit/E2E test updates.
- CI quality gates (`.github/workflows/ci.yml`): new `python-lint`
  (`pylint methods/`), `dead-code` (`fallow` in `web/`), and `diagnostics`
  (`python3 scripts/diagnose.py --check`) jobs.
- `.pylintrc` at the repo root — disables `duplicate-code` (intentional
  KAT-vector replication across modules; pylint cannot suppress it inline).
- `CHANGELOG.md` and `SECURITY.md`.

### Changed

- `methods/`: reached `pylint` 10.00/10 (was 9.23/10). Refactors:
  - `classical/cryptanalysis.py`: extracted `_collect_repeated_ngrams` etc.;
    rewrote `vigenere_kasiski` and `vigenere_crack` (fixes an `E1136`
    unsubscriptable warning) into smaller helpers.
  - `historical/cryptanalysis.py`: split `enigma_bombe_search` into
    `_bombe_context`/`_run_bombe_positions`/`_test_crib_offset`; extracted
    `_crib_drag_results` from `lorenz_depth_attack`.
  - `modern/cryptanalysis.py`: extracted `_compute_bitflip_tamper`,
    `_flip_byte_at`, `_hex_blocks`, `_block_status_info` from
    `cbc_bitflip_attack`.
  - `modern/contemporary.py`: removed superfluous parens, made
    `schnorr_verify` args keyword-only (callers updated in
    `web/api/routers/modern.py`).
  - `historical/lorenz/*`: `Wheel._validate_position`, `wheels.py` init
    validation, `process_message` arg disables.
  - Test files: module/test docstrings, wrapped long lines, import-order
    fixes, removed unused variables/imports, `R1721` → `list(range(n))`.
- `web/`: removed 19 unused exports/types via fallow
  (`app/utils/ciphers.ts`, `museumAudio.ts`, `museumTextures.ts`,
  `cameraController.ts`, `modernNewExhibits.ts`, `statuesAndFoyer.ts`,
  `PassportChallengeView.tsx`, `labApi.ts`, `cryptanalysis.ts` x2,
  `stepTrace.ts`) and added `ignoreExports` to `web/.fallowrc.json` for the
  intentional namespace-barrel duplicate (`ExhibitChallenge`).
- Tests: replaced hardcoded test secrets in `web/tests/unit/workbench.test.tsx`
  with non-secret mocks (Snyk findings).

### Fixed

- `methods/classical/cryptanalysis.py`: fixed `E1136` in `vigenere_crack`.

### Security

- Snyk scan of first-party code: 0 issues.
