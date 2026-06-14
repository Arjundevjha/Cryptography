# Quality Log

This log documents code quality and dead-code cleanup findings, actions taken, and resolutions.

## Track 1A: Log File and PID Cleanup
- **Findings**:
  - Found log files in the repository root: `backend.log`, `frontend.log`, `playwright.log`.
  - The root `.gitignore` lacked explicit patterns to ignore these and other temporary/debug/PID files.
- **Actions**:
  - Removed root log files: `backend.log`, `frontend.log`, `playwright.log`.
  - Updated the repository root `.gitignore` with ignore patterns for `*.log`, `*.log.*`, `npm-debug.log*`, `yarn-debug.log*`, `yarn-error.log*`, `.pnpm-debug.log*`, `*.pid`, `*.seed`, `*.pid.lock`.
- **Resolution**:
  - Root log files are cleaned up and excluded from future commits.

## Track 1D: Fallow Setup and Initial Dead-Code Cleanup
- **Findings**:
  - Initialized Fallow in `web/` using `npx fallow init`, which generated `.fallowrc.json` and a local `.gitignore` extension.
  - Ran `npx fallow --format json` to scan the codebase.
  - The analysis reported:
    - `unused_files`: 0
    - `unused_exports`: 1 (`isPrimeTypeScript` in `app/utils/ciphers.ts` at line 176)
    - `unused_dependencies`: 0
    - `circular_dependencies`: 0
- **Actions**:
  - Ran `npx fallow fix --yes --format json` which automatically stripped the unused `export` keyword from `isPrimeTypeScript` in `app/utils/ciphers.ts`.
  - Fixed an issue in `web/vitest.setup.ts` where `MockIntersectionObserver` was set up as an arrow function, causing it to crash with `new IntersectionObserver(...)` when running unit tests. Rewrote it as a constructor-safe function.
- **Resolution**:
  - Next.js production build (`npm run build`) compiles successfully.
  - Unit tests (`npm run test`) pass successfully.
  - Verification run via `npx fallow dead-code --format json` reports 0 issues.

## Track 1B: Migrate Vitest to Jest
- **Findings**:
  - Removed `vitest.config.ts`, `vitest.setup.ts`.
  - Removed `vitest`, `@vitejs/plugin-react` from `package.json`.
  - Added `jest`, `jest-environment-jsdom`, `@types/jest`, `ts-jest`, `ts-node` to `package.json`.
  - Created a correct `jest.config.ts` and `jest.setup.ts` following Next.js guidelines.
  - Refactored `web/app/page.test.tsx` and `web/tests/unit/ciphers.test.ts` to use Jest globals instead of vitest imports.
- **Actions**:
  - Excluded Playwright E2E tests from running in Jest via `testPathIgnorePatterns` configuration in `jest.config.ts`.
  - Ran `npm install` and verified all unit tests pass using `npm run test` (`jest`).
- **Resolution**:
  - Jest is successfully configured and running unit tests.
  - All 22 frontend unit tests pass successfully.

## Track 1C: FastAPI Connection and Health Endpoint
- **Findings**:
  - Verified FastAPI server starts successfully using `PYTHONPATH=. uvicorn web.api.main:app --port 8000 --reload` from repository root.
  - Verified Next.js proxy rewrite configuration in `next.config.js` properly maps `/api/` to `http://localhost:8000/api/`.
  - Found `/api/health` endpoint in `web/api/main.py` was returning a different status message than requested.
- **Actions**:
  - Updated FastAPI health check endpoint to return `{"status": "ok"}`.
  - Updated `web/api/test_main.py` to assert the updated health check format and corrected a pre-existing failing Polybius decrypt test.
  - Created a Next.js API route at `web/app/api/health/route.ts` that acts as a proxy checking the FastAPI backend health.
  - Updated `web/app/page.tsx` with a mount-level API health polling effect and added an "API Connected" / "API Offline" colored dot indicator in the page footer.
  - Modified catch blocks in all 8 client exhibit components calling the API to display: `"Could not reach encryption server — is the API running?"`.
  - Updated `web/README.md` with explicit startup instructions.
- Resolution:
  - Next.js successfully compiles and builds.
  - Frontend and backend integration is complete with visual status indicator and proper error handling.

## Track 2A–C: Navigation Overhaul
- **Findings**:
  - Replaced the horizontal timeline strip with a vertical, right-anchored, hover-expanding navigation panel. Collapsed to 48px by default, expanding to 220px on hover.
  - Era color groupings (Classical: Amber, Historical: Crimson, Modern: Teal) and borders/highlighting correctly represent eras.
  - Main content padding adjusted with `pr-[48px]` to prevent nav overlap.
  - Active section on page load was initially wrong because `sectionRefs` was recreated on every render, causing the IntersectionObserver to disconnect/reconnect and reset state in an infinite render loop.
  - Hash navigation and E2E history tests (`TC-T3-INTERACT-12` and `TC-T4-SCENARIO-10`) were flaky or failing due to race conditions during page hydration and the Next.js router intercepting and suppressing browser native history events.
- **Actions**:
  - Stabilized `sectionRefs` using `useMemo` to prevent IntersectionObserver reconnection loops.
  - Implemented an `isInitialScroll` scroll-lock ref to bypass IntersectionObserver callbacks during programmatic scrolls.
  - Created a unified history monkey-patch hook that intercepts `pushState`/`replaceState` and listens to `popstate`/`hashchange` to handle all URL transitions reliably.
  - Fixed E2E test flakiness by introducing a hydration-check wait (`timeline-node-caesar` visibility) before performing hash navigations.
- **Resolution**:
  - Playwright E2E tests `TC-T2B-NAV-ACTIVE-ON-LOAD`, `TC-T3-INTERACT-12`, and `TC-T4-SCENARIO-10` pass successfully.
  - Fallow dead-code analysis reports 0 issues.

## Track 3A–D: Museum Experience & UI Consistency
- **Findings**:
  - The museum dashboard lacked context on page entry (missing Hero section) and detailed educational references (missing About section).
  - Individual cipher exhibits lacked standardized metadata card overlays (blurbs detailing history, usage era, and mechanics).
  - Input elements across all 11 cipher exhibits were inconsistent in styling, label positioning, and error state reporting, causing layout duplication and maintenance overhead.
- **Actions**:
  - **Track 3A**: Created a full-screen dynamic Hero section featuring interactive, custom CSS-animated drifting characters, fully optimized for performance and respects user `prefers-reduced-motion` settings.
  - **Track 3B**: Designed and added a detailed "About" section containing user interaction guides, an era guide, build specifications, GitHub links, and a unified footer.
  - **Track 3C**: Unified and structured the metadata (historical background, mechanism explanation, etc.) for all 11 ciphers into a central configuration object.
  - **Track 3D**: Designed and implemented a unified, reusable `ExhibitInput` component in `web/src/components/ui/ExhibitInput.tsx` to handle labels, placeholders, input values, and validation errors consistently.
- **Resolution**:
  - The museum experience is visually polished and cohesive across all viewport sizes.
  - All 11 cipher exhibits leverage the structured metadata config and the reusable `ExhibitInput` component, ensuring uniform form layouts, error display styles, and centralized validation feedback.

## Track 1D: Final Sweep (Fallow Cleanup)
- **Findings**:
  - Code analysis revealed duplication of the Playfair grid generation logic (mapping "j" to "i", stripping non-alphabetic characters, and creating the 5x5 key square) across `playfairEncrypt`, `playfairDecrypt`, and the visual key grid visualization loop inside `web/app/page.tsx`.
- **Actions**:
  - Extracted the grid logic into a single, exported helper function `generatePlayfairGrid(key: string)` in `web/app/utils/ciphers.ts`.
  - Refactored `playfairEncrypt`, `playfairDecrypt`, and `web/app/page.tsx` to use the unified helper function.
  - Added new Jest unit tests in `web/tests/unit/ciphers.test.ts` to verify the grid generation behavior (duplicate character filtering, J-to-I mapping) and standard encryption/decryption flows.
- **Resolution**:
  - Eliminated duplicate implementation patterns, improving maintainability.
  - All unit tests pass successfully.


