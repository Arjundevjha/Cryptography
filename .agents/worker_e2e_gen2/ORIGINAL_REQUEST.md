## 2026-06-12T09:07:06Z

You are teamwork_preview_worker.
Your working directory is: `/Users/abc/Desktop/Cryptography/.agents/worker_e2e_gen2`.
Your identity is: `worker_e2e_gen2`.

**CRITICAL MODEL DIRECTIVE**: When physically coding, modifying files, or running commands, you MUST use Claude Opus 4.5 (Thinking).

**Objective**:
Run and verify E2E integration tests for the Cryptography Museum application:
1. Complete the installation of Playwright browser binaries (`npx playwright install --with-deps chromium`) and Python/pip dependencies from `web/requirements.txt` (including `fastapi`, `uvicorn`, etc.). Ensure you wait for any user permission prompts to approve the command execution.
2. Verify that the FastAPI backend server starts cleanly on port 8000 (e.g., `python3 -m uvicorn api.main:app --port 8000` or similar, from the `web/` directory).
3. Verify that the Next.js frontend starts cleanly on port 3000 (e.g., `npm run dev` or `npm run build && npm run start`).
4. Run the Playwright E2E test suite from the `web/` directory (`npx playwright test`).
5. If any test fails, debug and fix the failures. Ensure all code changes/fixes are genuine (no hardcoding, no dummy/facade implementations) and are written using Claude Opus 4.5 (Thinking).
6. Ensure all background servers are cleanly stopped after tests are completed.
7. Provide a detailed handoff report in `/Users/abc/Desktop/Cryptography/.agents/worker_e2e_gen2/handoff.md`.

**MANDATORY INTEGRITY WARNING**:
> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A Forensic Auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.

**Completion Criteria**:
- Playwright Chromium binaries are installed.
- Python dependencies are installed.
- Both backend and frontend servers can start, and the Next.js proxy works as expected.
- All Playwright E2E tests run and pass.
- Background processes are cleaned up.
