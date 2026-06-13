# Original User Request

## 2026-06-12T03:44:04Z

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
