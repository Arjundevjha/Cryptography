# Scope: Cryptography Museum Integration & Verification

## Architecture
- **Frontend**: Next.js (TypeScript, React, Tailwind CSS)
- **Backend**: FastAPI (Python) running on `http://localhost:8000` proxied through Next.js under `/api/`
- **Testing**: Playwright for E2E tests, Vitest for unit tests

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | Dependency Installation & Initial Snyk Scans | Install npm Playwright, run npx playwright install, install pip requirements.txt (fastapi, uvicorn), and run Snyk scans after each stage. | none | DONE |
| 2 | E2E Testing & Verification | Start both servers, run E2E test suite, fix failures, audit results. | M1 | IN_PROGRESS |
| 3 | Final Build, Docs & SECURITY_LOG | Verify Next.js production build, generate README.md, generate SECURITY_LOG.md with all scan results, final audit. | M2 | PLANNED |

## Interface Contracts
- Next.js development server runs on `http://localhost:3000`
- FastAPI server runs on `http://localhost:8000`
- Next.js proxies `/api/v1/*` to `http://localhost:8000/api/v1/*` or `/api/*` to `http://localhost:8000/*`
- Snyk scan output format: JSON or text scans stored in `web/SECURITY_LOG.md`
