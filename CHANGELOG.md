# Changelog

All notable changes to the Cryptography Museum and the Python cryptography
engine are documented here. Format follows Keep a Changelog.

## [Unreleased]

### Added

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
