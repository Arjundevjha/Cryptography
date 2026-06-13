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
