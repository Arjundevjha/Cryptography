## 2026-06-12T04:04:46Z

You are teamwork_preview_worker.
Your working directory is: /Users/abc/Desktop/Cryptography/.agents/worker_classical
Please execute Milestone 2: Classical Ciphers Exhibit.

OBJECTIVE:
Implement the classical ciphers (Caesar, Vigenere, and Affine) inside `/Users/abc/Desktop/Cryptography/web`.

1. IMPLEMENT CLASSICAL CIPHERS IN FRONTEND (Next.js):
   - Caesar Exhibit:
     - Client-side TypeScript adapter matching `methods/classical/caesar.py`.
     - Concentric SVG wheels visualization showing letter rotation and highlighting the current letter mapping.
     - Controls: Play/Pause, Step Back/Forward, Reset, Speed Slider.
   - Vigenère Exhibit:
     - Client-side TypeScript adapter matching `methods/classical/vigenere.py`.
     - 26x26 grid showing row/col intersection highlights, auto-scrolling to the active cell during playback. Ensure optimized rendering.
     - Controls: Play/Pause, Step Back/Forward, Reset, Speed Slider.
   - Affine Exhibit:
     - Mathematical formula visualization.
     - Two number lines showing the mapping between index x and (ax + b) % 26, with animated arrows showing the mapping steps.
     - Controls: Play/Pause, Step Back/Forward, Reset, Speed Slider.
     - Requests `a` and `b` parameters, communicating with the FastAPI endpoints.

2. IMPLEMENT BACKEND ENDPOINTS (FastAPI):
   - Integrate `methods/classical/affine.py`.
   - Expose `/api/affine/encrypt` and `/api/affine/decrypt`.
   - Input structure: Use standard input models validating max 500 characters limit.
   - Returns output in JSON format matching the interface contracts in `SCOPE.md`.

3. LAYOUT, STYLING, AND ACCESSIBILITY:
   - Deep-navy/charcoal background. Serif font for titles, monospace for ciphers.
   - Accessibility (A11y): Include proper `aria-*` tags, ensure full keyboard navigation (focus states, `tabIndex`), and support `prefers-reduced-motion` to skip animations.
   - TypeScript: Strictly typed, no `any`.

4. VERIFICATION:
   - Add unit tests for the TS adapters (Caesar, Vigenere) in Vitest.
   - Verify that the FastAPI endpoints are tested in pytest.
   - Run Snyk code scan on newly written files.

COMPLETION CRITERIA:
- TypeScript adapters for Caesar and Vigenere match Python logic and are tested.
- Caesar, Vigenere, and Affine exhibits are interactive with full visualization, playback controls, and dark-theme styling.
- Backend FastAPI endpoints for Affine are fully functional and validate input limits.
- Write a handoff report at /Users/abc/Desktop/Cryptography/.agents/worker_classical/handoff.md detailing implemented components, test results, accessibility verification, and snyk scans.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
