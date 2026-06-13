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

## Follow-up — 2026-06-13T13:38:53Z

Build a museum-style, interactive web application called **Cryptography Museum** in the `web/` directory of the existing `Cryptography` repository. The app presents ciphers as exhibits in a chronological timeline ("record of secrets through time") with visual step-by-step animations and interactive controls.

# Cryptography Museum — Fix & Finish Prompt

> **Workspace:** Antigravity
> **Repo:** `https://github.com/Arjundevjha/Cryptography`
> **Mode:** Run as parallel subagents. The four tracks below are independent and can execute simultaneously. Track 1 must complete before Track 4 starts (Track 4 depends on the FastAPI fix).

---

## Before splitting into subagents — shared context

Read the full `web/` directory tree and the existing `methods/` folder before any subagent begins work. Each subagent needs to understand the current state so they don't overwrite each other. Agree on shared files (`app/page.tsx`, `app/layout.tsx`, `tailwind.config.ts`) before touching them — coordinate writes, do not race.

---

## Code quality toolchain

### Fallow — dead code, duplication, and cleanup (CLI only — MCP is not configured)

**Fallow is the primary code quality and cleanup tool for this project.** It builds a full module graph across the entire `web/` codebase and finds unused files, unused exports, unused dependencies, circular dependencies, duplicated logic, and complexity hotspots — deterministically, with zero configuration needed for Next.js.

Before using it, fetch and read the full documentation index:
```
https://docs.fallow.tools/llms.txt
```
This file lists every available documentation page. Read the pages relevant to what you are doing (dead code analysis, auto-fix, agent integration) before running commands.

**The MCP server is not set up. Use the CLI exclusively.** Every subagent that can run shell commands can call Fallow directly — no special setup needed.

#### Setup (run once in Track 1D, before any other track begins work)

```bash
cd web

# Install and initialise — auto-detects Next.js, generates .fallowrc.json
npx fallow init
# This also adds .fallow/ to .gitignore automatically
```

#### Core commands every subagent must know

```bash
# Full analysis — dead code + duplication + health in one pass (use this for the complete picture)
npx fallow --format json

# Dead code only — unused files, exports, types, dependencies, circular deps
npx fallow dead-code --format json

# Duplication only — repeated logic and copy-paste across files
npx fallow dupes --format json

# Complexity hotspots — files most likely to cause bugs
npx fallow health --format json

# Preview what auto-fix would remove (always run this before applying)
npx fallow fix --dry-run --format json

# Apply auto-fix (removes unused exports and dependencies — agents use --yes to skip confirmation)
npx fallow fix --yes --format json

# Check only files changed since main (efficient for per-track verification)
npx fallow dead-code --changed-since main --format json
```

#### When each subagent must run Fallow

| Moment | Command |
|---|---|
| After Track 1D setup (once, before other tracks start) | `npx fallow --format json` — establish baseline, fix everything found |
| After each track completes its changes | `npx fallow dead-code --changed-since main --format json` — verify no new dead code was introduced |
| Before the final acceptance check | `npx fallow --format json` — full clean sweep of the finished codebase |
| After `npx fallow fix --yes` | Re-run `npx fallow dead-code --format json` to confirm issues are gone |

#### What to do with findings

- **Unused files** identified by Fallow: delete them. Do not leave them in place.
- **Unused exports**: run `npx fallow fix --yes` to strip them automatically, then verify the build still passes.
- **Unused dependencies** in `package.json`: remove them with `npm uninstall <package>`.
- **Duplicate logic** across exhibit components: extract into a shared utility in `web/src/lib/` and replace both usages.
- **Circular dependencies**: restructure imports to break the cycle — do not suppress them.
- Log every Fallow cleanup action in `web/QUALITY_LOG.md` with: what was found, what was done, which track fixed it.

---

## Track 1 — Cleanup & infrastructure

### 1A — Remove log files from the repo

Scan the entire repo root for any files matching `*.log`, `*.log.*`, `npm-debug.log*`, `yarn-debug.log*`, `yarn-error.log*`, `.pnpm-debug.log*`, `*.pid`, `*.seed`, `*.pid.lock`. Delete them all. Then add the following to `.gitignore` at the repo root if not already present:

```
# Logs
*.log
*.log.*
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
logs/
*.pid
*.seed
*.pid.lock
```

Do not delete anything inside `node_modules/` — only files in the repo's tracked directories.

### 1B — Fix the test setup

There should be no Vite config or Vite test runner in a Next.js project. Do the following:

1. Remove `vite.config.ts` or `vite.config.js` if present.
2. Remove `vitest` from `package.json` dependencies.
3. Check if `@vitejs/plugin-react` is present — remove it.
4. Set up the correct test stack for Next.js:
   - Install `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@types/jest`, `ts-jest`.
   - Create `jest.config.ts` at `web/jest.config.ts` following the official Next.js Jest setup.
   - Move any existing test files from `__tests__/` or `*.test.ts` into the correct structure and confirm they run with `npx jest`.
5. Confirm `npx jest` runs without errors before closing this track.

### 1D — Fallow setup and initial dead-code cleanup

> **This must complete before any other track begins touching `web/` source files.** All other tracks run `--changed-since main` to check their own changes; this step establishes the clean baseline they compare against.

1. Run `npx fallow init` inside `web/`. This auto-detects the Next.js plugin, generates `.fallowrc.json`, and adds `.fallow/` to `.gitignore`.
2. Run the full analysis to see the current state of the codebase:
   ```bash
   npx fallow --format json
   ```
   Parse the JSON output and categorise every finding.
3. Handle each category:
   - **Unused files:** list them, review each one — if it is leftover scaffolding, a superseded implementation, or an orphaned helper with no importers, delete it. If it appears intentional (e.g. a future stub with a comment), leave it and add a Fallow inline suppression comment.
   - **Unused exports:** run `npx fallow fix --dry-run --format json` to preview, then `npx fallow fix --yes --format json` to apply. Verify the build still passes after.
   - **Unused dependencies in `package.json`:** run `npm uninstall` for each one flagged.
   - **Duplicate logic:** note the locations; if two exhibit components share substantially identical animation or layout code, extract it into `web/src/lib/` or `web/src/components/ui/` and update both importers. Do not leave the duplication for other tracks to worsen.
   - **Circular dependencies:** trace the cycle and restructure imports to break it. Do not suppress.
4. Re-run `npx fallow dead-code --format json` and confirm the issue count is zero (or only intentionally suppressed items remain).
5. Commit the cleanup as a standalone commit: `chore: fallow dead-code cleanup — remove unused files, exports, deps`.
6. Log every finding and resolution in `web/QUALITY_LOG.md`.

### 1C — Fix the FastAPI connection failure

The frontend is failing to reach the FastAPI server. Debug and fix in this order:

1. Start the FastAPI server (`uvicorn api.main:app --reload --port 8000`) and check what error it throws on startup. Fix any import errors first — the most likely cause is the `sys.path.insert` not resolving correctly relative to the `web/api/` directory.
2. Check all Next.js API route proxy files in `web/src/app/api/`. Each should proxy to `http://localhost:8000/...`. Verify the fetch URL, method, headers, and that the response is forwarded correctly.
3. Add a `/api/health` endpoint to `web/api/main.py` that returns `{"status": "ok"}`. Add a corresponding Next.js route at `web/src/app/api/health/route.ts`. The frontend should call this on mount and display a visible "API Connected" or "API Offline" status indicator in the site footer — a simple coloured dot is sufficient.
4. Add error handling in all exhibit components that call the API: if the call fails, show an inline error message ("Could not reach encryption server — is the API running?") rather than a silent failure or broken UI.
5. Update `web/README.md` with the exact two commands needed to run the full stack:
   ```bash
   # Terminal 1
   cd web && npm run dev

   # Terminal 2
   cd web && uvicorn api.main:app --reload --port 8000
   ```

---

## Track 2 — Navigation overhaul

### 2A — Move the navbar to a vertical right-side panel

The current horizontal timeline strip must be replaced with a vertical navigation panel anchored to the right side of the viewport. Requirements:

- Fixed position, right edge, full viewport height, `z-index` above content.
- Width: collapsed to ~48px by default, expands to ~220px on hover (CSS transition, no JS required).
- Each cipher entry is a vertical list item with: a coloured era dot, the cipher name (visible when expanded), and the year (visible when expanded, smaller text below the name).
- Era colour grouping with a thin coloured left border per section:
  - Amber (`#D4A853`) — Classical (~60 BC → 1700s)
  - Crimson (`#C0392B`) — Historical machines (1800s → 1940s)
  - Teal (`#4ECDC4`) — Modern (1970s → present)
- A subtle divider line between era groups.
- The active cipher item has a filled background highlight (same era colour at 20% opacity) and a 2px solid era-colour left accent.
- On mobile (< 768px): collapses to a hamburger icon that opens a full-screen overlay menu.
- The main content area must have `padding-right` equal to the collapsed nav width (48px) so nothing is obscured.

### 2B — Fix the active state (nav shows wrong cipher on load)

The bug: when the page first loads at the top (Caesar exhibit), the nav highlights Vigenère (or another incorrect cipher). Root cause is almost certainly the `IntersectionObserver` threshold or root margin being miscalibrated, causing the wrong exhibit to be considered "in view."

Fix:
1. Replace any existing IntersectionObserver with one configured as:
   ```ts
   const observer = new IntersectionObserver(
     (entries) => {
       entries.forEach((entry) => {
         if (entry.isIntersecting) {
           setActiveId(entry.target.id);
         }
       });
     },
     {
       root: null,
       rootMargin: "-40% 0px -55% 0px",
       threshold: 0,
     }
   );
   ```
   The asymmetric root margin ensures only the exhibit occupying the upper-middle of the viewport is considered active, preventing bleed from adjacent exhibits.
2. On initial page load, set `activeId` to the first cipher's ID explicitly before the observer fires — do not rely on the observer alone for the initial state.
3. Write a Playwright test: open `/`, assert the first nav item has `aria-current="true"` without any user interaction.

### 2C — Fix instant teleport → smooth scroll

Clicking a nav item currently jumps instantly. Fix:

1. Find all nav click handlers. Replace any `window.location.hash = ...` or `element.scrollIntoView()` without options with:
   ```ts
   document.getElementById(targetId)?.scrollIntoView({
     behavior: "smooth",
     block: "start",
   });
   ```
2. In `app/globals.css`, ensure this is present:
   ```css
   html {
     scroll-behavior: smooth;
   }
   ```
3. Account for the fixed navbar offset: if the exhibit heading is obscured by any fixed header, add a `scroll-margin-top` value to each exhibit section:
   ```css
   .exhibit-section {
     scroll-margin-top: 80px;
   }
   ```
4. Test: click every nav item and confirm smooth animated scroll, not a jump.

---

## Track 3 — Museum experience & UI consistency

### 3A — Add a hero / intro section

The site currently drops the user straight into Caesar with no context. Add a full-viewport hero section as the very first element on the page (above the exhibits, the nav points to exhibits below this).

The hero must contain:
- Large serif title: **"Cryptography Museum"**
- Subtitle in monospace: `// A Record of Secrets Through Time`
- A 2–3 sentence introduction explaining what the site is — a living record of how humans have hidden information, from Caesar's battlefield codes to modern AES. Write this copy yourself; make it feel like a museum placard.
- A prominent CTA button: **"Enter the Museum ↓"** that smooth-scrolls to the first exhibit.
- A subtle animated background: slowly drifting characters (A–Z, 0–9) in the background at very low opacity (~5%), moving upward. Implement as a CSS `@keyframes` animation, not JS. Respect `prefers-reduced-motion` — if set, render a static background instead.

### 3B — Add an About section

Add an About section as the final section on the page, below all cipher exhibits.

Content:
- **"About This Museum"** as the section heading.
- A paragraph explaining the project: an open-source interactive reference for classical, historical, and modern cryptography methods. Link to the GitHub repo.
- A **"How to use"** sub-section: short bullet list — enter text, adjust key/shift/params, press Encrypt, use the playback controls to step through the encryption.
- An **"Era guide"** sub-section: brief explanation of the three eras and their colour codes (amber = classical, crimson = historical machines, teal = modern).
- A **"Built with"** sub-section: Next.js, TypeScript, Tailwind CSS, Framer Motion, FastAPI.
- Footer below the About section: copyright line + GitHub link.

### 3C — Add descriptions to every exhibit card

Every cipher exhibit currently has little to no historical context. Each card must have, between the title and the visualisation area, the following four elements rendered in this exact order:

1. **Era badge** — verify it matches the era colour for that cipher (amber / crimson / teal).
2. **"When & where" line** — displayed in small caps, muted colour, below the title. This must appear on every single exhibit without exception. Store it as a static string in the cipher's data object alongside the name and ID — do not derive it at render time.
3. **Historical blurb** — 3–4 sentences. Accurate, engaging, written like a museum placard. No placeholder text.
4. **"How it works" one-liner** — rendered in `JetBrains Mono`, slightly dimmed, below the blurb. Describes the mechanical operation of the cipher in one sentence.

Use exactly the following content for each exhibit. Do not paraphrase or shorten it:

---

**Scytale**
- When & where: `Ancient Sparta, ~700 BC`
- Blurb: The scytale is one of history's oldest known encryption devices, used by the Spartans as early as the 7th century BC to send secret military orders between commanders. A strip of parchment was wound diagonally around a wooden rod and written across; unwound, it appeared as a jumble of letters. Only a recipient with a rod of the same diameter could reassemble the message. It is a transposition cipher — it rearranges letters rather than replacing them, a distinction that would not be formalised for another two millennia.
- How it works: `The message is written across a rod in rows, then the strip is unwound and the columns become the ciphertext.`

---

**Polybius Square**
- When & where: `Ancient Greece, ~150 BC`
- Blurb: Invented by the Greek historian Polybius around 150 BC, this cipher converts each letter into a coordinate pair on a 5×5 grid. Polybius originally designed it for fire signalling — operators held up torches to indicate row and column numbers across long distances. It was later adapted by medieval cryptographers, Russian Nihilist revolutionaries, and Charles Wheatstone, who used it as the foundation for the Playfair cipher. Its grid structure is a conceptual ancestor of both binary encoding and modern substitution boxes.
- How it works: `Each letter is located on a 5×5 grid; its row number followed by its column number becomes the ciphertext.`

---

**Caesar Cipher**
- When & where: `Ancient Rome, ~60 BC`
- Blurb: Julius Caesar used this cipher to protect military communications during his Gallic campaigns, reportedly with a shift of three positions. It is the earliest well-documented substitution cipher in recorded history — simple enough to memorise, fast enough to use under battlefield conditions. Suetonius documented its use in 69 AD; Augustus Caesar later adopted a shift of one. It offers no meaningful security against modern analysis, but as the purest expression of the shift principle it remains the conceptual starting point for all substitution-based cryptography.
- How it works: `Each letter is shifted N positions forward in the alphabet, wrapping from Z back to A.`

---

**Affine Cipher**
- When & where: `Arab world, ~800 AD`
- Blurb: A mathematical generalisation of the Caesar cipher that emerged during the Islamic Golden Age, the affine cipher encodes each letter using the formula C = (aP + b) mod 26, where a and b are secret keys. The 9th-century polymath al-Kindi described methods for breaking it in his Treatise on Deciphering Cryptographic Messages — the first known work on frequency analysis. The key a must be coprime with 26, yielding 312 possible key combinations, which sounds large until you realise al-Kindi's method defeats it in minutes with enough text. It was the first cipher to be broken through mathematical reasoning rather than brute force.
- How it works: `Each letter's alphabetic index P is transformed to C = (aP + b) mod 26, then converted back to a letter.`

---

**Vigenère Cipher**
- When & where: `Europe, 1553`
- Blurb: First described by Giovan Battista Bellaso in 1553 and later misattributed to Blaise de Vigenère, this polyalphabetic cipher earned the title "le chiffre indéchiffrable" — the indecipherable cipher — and held that reputation for nearly 300 years. By shifting each letter using a different position in a repeating keyword, it defeated the frequency analysis that broke every previous cipher. Charles Babbage cracked it privately around 1854 using periodicity analysis; Friedrich Kasiski published the method independently in 1863, ending its era of dominance.
- How it works: `Each plaintext letter is shifted by the value of the corresponding letter in a repeating keyword, cycling the key continuously.`

---

**Playfair Cipher**
- When & where: `Britain, 1854`
- Blurb: Invented by Charles Wheatstone in 1854 but named after his friend Baron Playfair, who championed its adoption — a common injustice in the history of cryptography. It was the first widely used cipher to encrypt pairs of letters (digraphs) rather than individual characters, which significantly undermined traditional frequency analysis. The British Foreign Office used it during the Second Boer War and World War I. It was eventually defeated by statistical analysis of digraph frequencies and replaced by electromechanical cipher machines in the 1940s.
- How it works: `Letter pairs are located in a 5×5 key square and transformed using one of three geometric rules based on whether they share a row, column, or neither.`

---

**Substitution Cipher**
- When & where: `Widespread, ~100 BC onward`
- Blurb: The simple substitution cipher maps each letter of the alphabet to a unique replacement letter using a secret scrambled key. It was used across the ancient and medieval world — Mary Queen of Scots deployed a variant in 1586 to communicate with conspirators, but the letters were intercepted and deciphered, leading directly to her execution. With 26! possible keys — roughly 4×10²⁶ — it appears unbreakable, but al-Kindi's 9th-century frequency analysis defeats it reliably using just a few hundred characters of ciphertext. Any cipher that substitutes letters one-for-one without variation inherits this fundamental weakness.
- How it works: `Every letter is replaced by its fixed counterpart from a shuffled 26-character key alphabet.`

---

**Enigma**
- When & where: `Germany, developed 1918 · used 1939–1945`
- Blurb: Invented by Arthur Scherbius in 1918 as a commercial encryption machine, Enigma was adopted by the German military in the 1920s and became the cryptographic backbone of the Nazi war effort. Three or more interchangeable rotors, a plugboard, and a reflector combined to produce a polyalphabetic substitution with over 158 quintillion possible daily settings. British codebreakers at Bletchley Park — led mathematically by Alan Turing — built electromechanical Bombe machines to systematically eliminate impossible settings, cracking Enigma traffic daily throughout the war. The breach was kept secret until 1974; its impact is estimated to have shortened World War II by two to four years.
- How it works: `Each keypress routes an electrical signal through a plugboard, three stepping rotors, and a reflector, producing a different substitution for every single letter.`

---

**AES — Advanced Encryption Standard**
- When & where: `United States, standardised 2001`
- Blurb: AES was selected in 2001 by the US National Institute of Standards and Technology after a five-year open international competition to replace the ageing DES standard, which had become vulnerable to brute-force attacks. The winning algorithm, Rijndael, was designed by Belgian cryptographers Joan Daemen and Vincent Rijmen. It operates on 128-bit blocks of data, putting each block through 10 rounds of four mathematical transformations — SubBytes, ShiftRows, MixColumns, and AddRoundKey — using keys of 128, 192, or 256 bits. AES is the most widely deployed symmetric encryption algorithm in existence, securing HTTPS connections, disk encryption, Wi-Fi, government communications, and virtually every modern digital transaction.
- How it works: `A 128-bit data block is transformed through 10 rounds of substitution, row-shifting, column-mixing, and key-addition operations.`

---

**RSA — Rivest–Shamir–Adleman**
- When & where: `United States, 1977`
- Blurb: Invented in 1977 by Ron Rivest, Adi Shamir, and Leonard Adleman at MIT — though British intelligence agency GCHQ had independently discovered the same algorithm in 1973 under Clifford Cocks, and classified it. RSA was the first practical public-key cryptosystem, solving the fundamental problem of how to establish a shared secret over an insecure channel without having met beforehand. Its security rests on the mathematical hardness of factoring the product of two large prime numbers — a problem for which no efficient general algorithm is known. RSA-2048 would require more computation to factor than exists in the known universe using current methods, though quantum computers threaten this assumption.
- How it works: `Two large primes generate a mathematically linked key pair; data encrypted with the public key can only be decrypted with the private key.`

---

**SHA — Secure Hash Algorithms**
- When & where: `United States, SHA-1: 1993 · SHA-256 & SHA-512: 2001 · BLAKE2: 2012`
- Blurb: The SHA family was developed by the NSA and standardised by NIST across three decades. SHA-1 (1993) is now cryptographically broken — Google's 2017 SHAttered project produced the first real-world collision. SHA-256 and SHA-512, released in 2001 as part of SHA-2, remain sound and underpin Bitcoin's proof-of-work, TLS certificate signing, and software package verification worldwide. MD5 (1992), while faster, is broken for collision resistance and should not be used for security. BLAKE2 (2012) matches SHA-2 in security while outperforming it in speed on most hardware without the NSA's involvement in its design.
- How it works: `Input of any length is compressed into a fixed-size digest; identical inputs always produce identical output, but no efficient method exists to reverse the process or find two inputs that collide.`

### 3D — Fix AES input field inconsistency

The AES exhibit's text input field uses different styling from every other exhibit. Audit all input fields across all exhibits and ensure they share a single consistent CSS class (or Tailwind class group). Specifically:

- Same font (monospace, `JetBrains Mono`).
- Same border style, border colour, border radius.
- Same padding, same focus ring colour (era-appropriate teal for modern ciphers).
- Same placeholder text colour.
- Same background colour (slightly lighter than the card background).

Create a shared `ExhibitInput` React component in `web/src/components/ui/ExhibitInput.tsx` and replace all individual input elements in all exhibit cards with this component.

---

## Track 4 — Finish unimplemented exhibits

> **Depends on Track 1C (FastAPI) being complete.** Do not start this track until the API health check returns 200.

### 4A — Audit what is and isn't implemented

Before writing any code, list every cipher in `methods/` and cross-reference with what exists in `web/src/components/exhibits/`. Produce a checklist in your working notes. Then implement each missing one below.

### 4B — RSA (Asymmetric encryption)

Cipher: `methods/modern/keypair.py` + `methods/modern/rsa.py`

FastAPI endpoint to add to `web/api/main.py`:
```python
from methods.modern.keypair import generate_keypair

@app.post("/api/rsa/generate")
def rsa_generate(payload: RSARequest):  # payload: { key_size: 2048 }
    pub, priv = generate_keypair(payload.key_size)
    return {"public_key": str(pub), "private_key": str(priv)}

@app.post("/api/rsa/encrypt")
def rsa_encrypt(payload: RSAEncryptRequest):  # payload: { message, public_key }
    ...
```

Inspect the actual function signatures in the Python files before writing these endpoints.

**Visualisation:** RSA cannot be animated step-by-step meaningfully. Instead show a conceptual diagram:
- Three panels side by side: **Key Generation** | **Encryption** | **Decryption**.
- Key Generation panel: animate the steps — pick p, pick q → n = p×q → φ(n) = (p−1)(q−1) → choose e → d = e⁻¹ mod φ(n). Show real computed values from the API (use small primes for demo: p=61, q=53).
- Encryption panel: input box for plaintext, shows `C = M^e mod n` with real values substituted.
- Decryption panel: shows `M = C^d mod n` decrypting back to the original.
- All computed values come from the FastAPI bridge.

Era: Modern · 1977. Colour: teal.

### 4C — AES / Symmetric encryption

Cipher: `methods/modern/symmetric.py`

FastAPI endpoint (check existing — may already be partially there, fix if broken):
```python
from methods.modern.symmetric import encrypt, decrypt, generate_key, generate_iv

@app.post("/api/aes/encrypt")
def aes_encrypt(payload: AESRequest):
    key = generate_key()
    iv = generate_iv()
    ct = encrypt(payload.message, key, iv)
    return {"ciphertext": ct, "key": key.hex(), "iv": iv.hex()}
```

**Visualisation:** AES round diagram.
- The exhibit header must use the full description from section 3C ("When & where: United States, standardised 2001" and the Rijndael blurb). The current placeholder that reads something like "AES uses math to encrypt" must be deleted entirely and replaced with that copy.
- Show 10 labelled round boxes in sequence: Initial AddRoundKey → [SubBytes → ShiftRows → MixColumns → AddRoundKey] × 9 → [SubBytes → ShiftRows → AddRoundKey].
- Label each operation with a one-line tooltip explaining what it does in plain English.
- On encrypt: animate each round box lighting up in sequence (Framer Motion, 400ms per round, speed-controllable).
- Below the diagram: show the real encrypted output (hex) from the API.
- Display the key and IV that were used, with a "Regenerate key" button.

Era: Modern · 2001. Colour: teal.

### 4D — Hash functions

Cipher: `methods/modern/hash_functions.py`

This exhibit is different — there is no "decryption." Frame it as a **one-way function exhibit**.

FastAPI endpoints:
```python
@app.post("/api/hash")
def compute_hash(payload: HashRequest):  # payload: { text, algorithm }
    # algorithm: "sha256" | "sha512" | "md5" | "blake2"
    h = HashFunction(payload.algorithm, None)
    result = getattr(h, f"{payload.algorithm}_hash")(payload.text)
    return {"hash": result, "algorithm": payload.algorithm}
```

**Visualisation:**
- Four sub-tabs within the exhibit: SHA-256, SHA-512, MD5, BLAKE2.
- Input field shared across all tabs.
- Each tab shows: the computed hash in a monospace display, the output length in bits, and a one-sentence description of the algorithm's use case.
- Demonstrate the **avalanche effect**: a toggle labelled "Change one character" that flips one character in the input and re-hashes, showing how dramatically the output changes. Highlight the differing characters in the two hash outputs in red.
- No animation needed — hashing is instantaneous. The visual interest is in the avalanche comparison.

Era: Modern · 1993–2015. Colour: teal.

### 4E — Remaining classical ciphers (Playfair, Substitution)

If these are not yet in the web app, implement them:

**Playfair:**
- TypeScript adapter: `getEncryptionSteps(message, key)` — inspect `methods/classical/playfair.py` for the algorithm (digraph substitution on a 5×5 key square).
- Visualisation: show the 5×5 Polybius-style key square. For each digraph pair, highlight the two input cells and animate the rectangle rule to find the two output cells.

**Substitution cipher:**
- TypeScript adapter: `getEncryptionSteps(text, key)` — 26-character key maps A→key[0], B→key[1], etc.
- Visualisation: show two alphabets (plain above, cipher below) as aligned letter grids. Animate the lookup per character by highlighting the column.

### 4F — Verify all timeline entries

Once all exhibits are implemented, verify the timeline/nav has an entry for every exhibit in the correct chronological order:

| Cipher | Year | Era colour |
|---|---|---|
| Scytale | ~700 BC | Amber |
| Caesar | ~60 BC | Amber |
| Polybius | ~150 BC | Amber |
| Affine | ~800 AD | Amber |
| Playfair | 1854 | Amber |
| Vigenère | 1553 | Amber |
| Substitution | varies | Amber |
| Enigma | 1918 | Crimson |
| AES / Symmetric | 2001 | Teal |
| RSA / Asymmetric | 1977 | Teal |
| SHA / Hash | 1993 | Teal |

Reorder the exhibit cards on the page to match this chronological order.

---

## Acceptance criteria — all tracks must pass before done

- [ ] `git status` shows no `.log` files tracked. `.gitignore` covers all log patterns.
- [ ] `npx jest` runs and passes with no Vite config present.
- [ ] FastAPI health endpoint returns 200. Site footer shows "API Connected" indicator.
- [ ] All exhibit API calls show a graceful error message on failure, not a broken UI.
- [ ] Nav is vertical, right-side, collapses to 48px, expands on hover.
- [ ] On fresh page load, the first nav item is highlighted, not any other.
- [ ] All nav clicks produce smooth scroll, not instant jump.
- [ ] Hero section present with intro copy and "Enter the Museum" CTA.
- [ ] About section present at bottom of page with how-to, era guide, and built-with.
- [ ] Every exhibit has a historical blurb and "How it works" one-liner.
- [ ] Every exhibit displays its "when & where" line — stored as a static string in the cipher data object, not derived at render time. Verify all 11 ciphers show it, not just Caesar and Vigenère.
- [ ] AES exhibit copy does not contain any placeholder text. The full Rijndael/NIST description from section 3C is present.
- [ ] All input fields use the shared `ExhibitInput` component — visually consistent.
- [ ] RSA, AES, all four hash functions, Playfair, and Substitution are implemented and visible.
- [ ] Timeline has all 11 ciphers in chronological order.
- [ ] Run Snyk. No high/critical findings. Log results in `web/SECURITY_LOG.md`.
- [ ] `npx fallow --format json` reports zero unused files, zero unused exports, zero unused dependencies, and zero circular dependencies across `web/`. Any intentional suppressions are documented inline with a comment explaining why.
- [ ] `npx fallow dupes --format json` reports no clone groups above the default threshold — shared logic has been extracted into `web/src/lib/` or `web/src/components/ui/`.
- [ ] `web/QUALITY_LOG.md` exists and contains an entry for every Fallow finding that was addressed across all tracks.
