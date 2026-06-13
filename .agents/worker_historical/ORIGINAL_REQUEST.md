## 2026-06-12T04:13:03Z

You are teamwork_preview_worker.
Your working directory is: /Users/abc/Desktop/Cryptography/.agents/worker_historical
Please execute Milestone 3: Historical Ciphers Exhibit and fix the two non-blocking defects from Milestone 2.

1. FIX MILESTONE 2 DEFECTS:
   - In `web/app/page.tsx`, resolve the Caesar visualizer concentric wheels bug. Ensure `shiftedIndex` is strictly positive `((shiftedIndex % 26) + 26) % 26` so that the array index is never out of bounds. Also fix the Caesar variable check leak that references Vigenere active state.
   - In `web/app/page.test.tsx`, update the vitest selectors to match the updated page structure so that Vitest unit tests pass cleanly.

2. IMPLEMENT HISTORICAL CIPHERS BACKEND ENDPOINTS (FastAPI):
   - Integrations:
     - Scytale: `methods/historical/scytale.py`
     - Polybius: `methods/historical/polybius.py` (ensure key parameter defaults to standard alphabet order `"abcdefghiklmnopqrstuvwxyz"` when not provided or when empty)
     - Enigma: `methods/historical/enigma/` (specifically, create/instantiate the Enigma machine based on input parameters: rotors like `['I', 'II', 'III']`, positions like `['A', 'A', 'A']`, rings which could be parsed from letter/number formats, and plugboard swaps like `['AB', 'CD']`).
   - Endpoints:
     - `/api/scytale/encrypt` and `/api/scytale/decrypt`
     - `/api/polybius/encrypt` and `/api/polybius/decrypt`
     - `/api/enigma/encipher`
   - Inputs: All text inputs must be checked using standard schemas with a 500-character max limit. If the limits or key structures are invalid (e.g. duplicate rotors, duplicate plugboard swaps, invalid plugboard formats, width < 2 for Scytale), raise a `400 Bad Request`.

3. IMPLEMENT HISTORICAL CIPHERS FRONTEND (Next.js):
   - Scytale Exhibit:
     - Vertical cylinder SVG with wrapping tape visualization.
     - Playback controls: Play/Pause, Step Back/Forward, Reset, Speed Slider.
     - Controls for cylinder diameter (param width).
   - Polybius Exhibit:
     - 5x5 grid lookup table visualization, highlighting rows/cols.
     - Playback controls.
     - Controls for grid key (defaults to standard alphabet grid).
   - Enigma Exhibit:
     - Three rotor columns showing the electrical path traversal (plugboard -> rotor 3 -> rotor 2 -> rotor 1 -> reflector -> rotor 1 -> rotor 2 -> rotor 3 -> plugboard) for the active character.
     - Playback controls.
     - Inputs for: rotors (`param-rotors-enigma`), initial positions (`param-positions-enigma`), rings (`param-rings-enigma`), and plugboard connections (`param-plugboard-enigma`).
   - Dark theme styling, full keyboard accessibility, tab indices, focus states, `aria-*` attributes, and `prefers-reduced-motion` animations skipping.
   - Ensure the required E2E test selectors (`data-testid`) are precisely set as defined in `web/tests/e2e/historical.spec.ts`.

4. VERIFICATION:
   - Write Vitest unit tests for the frontend adapters or functions if any.
   - Ensure pytest backend tests run and pass for the historical endpoints.
   - Run Snyk code scans on newly modified files.

COMPLETION CRITERIA:
- Milestone 2 bugs are fixed and Vitest unit tests pass.
- Scytale, Polybius, and Enigma exhibits are fully implemented, interactive, and styled.
- FastAPI endpoints for historical ciphers validate inputs, keys, and execute the correct algorithms.
- Write a handoff report at /Users/abc/Desktop/Cryptography/.agents/worker_historical/handoff.md detailing changes, verification, test outcomes, and any snyk scans.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
