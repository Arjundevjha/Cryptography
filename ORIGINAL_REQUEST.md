# Original User Request

## Initial Request — 2026-06-12T03:43:46Z

Build a museum-style, interactive web application called **Cryptography Museum** in the `web/` directory of the existing `Cryptography` repository. The app presents ciphers as exhibits in a chronological timeline ("record of secrets through time") with visual step-by-step animations and interactive controls.

Working directory: `/Users/abc/Desktop/Cryptography/web`
Integrity mode: benchmark

## Requirements

### R1. Museum Timeline & Page Layout
- A single-page, dark-themed museum layout (deep navy/charcoal background, monospace fonts for ciphers, serif for titles).
- A horizontal scrollable timeline nav at the top showing cipher nodes (year, name, era color dot).
- Node clicks smoothly scroll to the exhibit, and an `IntersectionObserver` highlights the active node.
- Exhibit cards show era badges, titles, 2-sentence historical blurbs, visual demo area, input panel, playback controls (Play/Pause, Step Back/Forward, Reset, Speed Slider), and left-to-right building output.
- Support `prefers-reduced-motion` to skip animations.

### R2. Cipher Exhibits (Stage 1 to 5)
- **Caesar Cipher (TS adapter + Visualisation):** Concentric SVG wheels showing rotation; highlighting input/output letters.
- **Vigenère Cipher (TS adapter + Visualisation):** 26x26 grid showing row/col intersection highlights, auto-scrolling to the active cell.
- **Affine Cipher (FastAPI + TS adapter + Visualisation):** Mathematical formula visualization, two number lines with animated mapping arrows.
- **Historical Ciphers:** 
  - **Scytale:** Vertical cylinder with wrapping tape.
  - **Polybius:** 5x5 grid lookup.
  - **Enigma:** Three rotor columns showing the electrical path (plugboard, rotors, reflector) using the existing Python emulator class.
- **Modern Ciphers (FastAPI only, educational viz):** 
  - **AES:** Block diagram of 10 rounds with actual ciphertext output.
  - **RSA:** Key generation diagram (p, q, n, phi, e, d) with real output.
  - **SHA-256:** Padding, block splitting, and real hash display.

### R3. Repository Integration & Python API Bridge (FastAPI)
- **CRITICAL CONSTRAINT:** All web-based cryptography implementations must use the logic/algorithms already implemented in the Python codebase in the repository (`methods/` directory).
- A FastAPI server at `web/api/main.py` serving endpoints to run backend Python implementations for Affine, Enigma, AES, RSA, and SHA-256.
- Enforce input length validation (max 500 characters) and CORS middleware.
- Proxy API requests from the Next.js frontend to the FastAPI backend.

### R4. Quality, Performance, & Accessibility
- Strict TypeScript, no `any`.
- Self-contained components.
- Keyboard navigation, `aria-*` tags, Lighthouse accessibility/best practices score >= 90.
- Vigenère grid optimized for rendering.

## Acceptance Criteria

### Verification Methods
- [ ] **Unit Tests:** Run Vitest unit tests for Caesar, Vigenère, Affine, and check that all pass cleanly.
- [ ] **E2E Tests:** Run Playwright smoke tests for cipher workflows (e.g., verifying plaintext input leads to expected ciphertext).
- [ ] **Security Checks:** Run Snyk code and package scans (immediately after installs and at each stage end) showing no high/critical issues.
- [ ] **Startup & Build:** Verify that the frontend builds and runs successfully on `localhost:3000` and the backend FastAPI runs on `localhost:8000`.

## Follow-up — 2026-06-12T03:45:19Z

I have deleted the pre-existing index.html, css/, and js/ files/directories in `web/` so that the directory is clean and ready for Next.js scaffolding.

## Follow-up — 2026-06-12T08:46:51Z

The API quota has reset. Please continue with the remaining work:

1. Install `@playwright/test` and Playwright browser binaries: `npm install --save-dev @playwright/test && npx playwright install --with-deps chromium`
2. Install FastAPI and uvicorn: `pip install fastapi uvicorn` (run from `/Users/abc/Desktop/Cryptography`)
3. Run Snyk scans after each install and log all findings in `web/SECURITY_LOG.md`
4. Start the FastAPI backend: `cd /Users/abc/Desktop/Cryptography && uvicorn web.api.main:app --port 8000` (in background)
5. Start the Next.js frontend: `cd /Users/abc/Desktop/Cryptography/web && npm run dev` (in background)
6. Run Playwright E2E tests: `npx playwright test` — fix any failures
7. Verify production build: `npm run build`
8. Write `web/README.md` with startup instructions for both frontend and backend

All 22 Vitest unit tests already pass. The working directory is `/Users/abc/Desktop/Cryptography/web`.

## Follow-up — 2026-06-12T09:23:56Z

I've unblocked the terminal command approvals by running them directly:

1. ✅ `pip install fastapi uvicorn` — DONE. Installed: fastapi-0.136.3, uvicorn-0.49.0, pydantic-2.13.4
2. 🔄 `npx playwright install --with-deps chromium` — running in background, will complete shortly

Once Playwright binaries finish downloading, you can proceed to:
- Start the FastAPI backend: `cd /Users/abc/Desktop/Cryptography && uvicorn web.api.main:app --port 8000`
- Start the Next.js frontend: `cd /Users/abc/Desktop/Cryptography/web && npm run dev`
- Run E2E tests: `npx playwright test`

The FastAPI server should be started from the repo root (`/Users/abc/Desktop/Cryptography`) so Python can find the `methods/` module on the path.

## Follow-up — 2026-06-12T09:24:09Z

✅ Playwright Chromium browser binaries are now fully downloaded and ready (Chrome Headless Shell 148.0.7778.96).

All dependencies are now installed:
- fastapi + uvicorn ✅
- @playwright/test ✅  
- Chromium headless shell ✅

You can now proceed to:
1. Start the FastAPI backend (from repo root): `cd /Users/abc/Desktop/Cryptography && uvicorn web.api.main:app --port 8000 --reload`
2. Start the Next.js frontend: `cd /Users/abc/Desktop/Cryptography/web && npm run dev`
3. Wait for both to be ready, then run: `npx playwright test`
4. Fix any E2E test failures
5. Run `npm run build` to verify production build
6. Write `web/README.md` and ensure `web/SECURITY_LOG.md` is complete
