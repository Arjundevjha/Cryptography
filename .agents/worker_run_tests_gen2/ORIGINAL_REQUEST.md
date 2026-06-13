## 2026-06-12T09:22:24Z
You are teamwork_preview_worker.
Your working directory is: `/Users/abc/Desktop/Cryptography/.agents/worker_run_tests_gen2`.
Your identity is: `worker_run_tests_gen2`.

**CRITICAL MODEL DIRECTIVE**: When physically coding, modifying files, or running commands, you MUST use Claude Opus 4.5 (Thinking).

**Objective**:
Execute E2E integration tests, verify the production build, run the final Snyk security scan, and write documentation:
1. Run the consolidated E2E script: `bash /Users/abc/Desktop/Cryptography/run_e2e_tests.sh`. Ensure you approve the command permission prompt when it appears.
2. Read the resulting logs in `/Users/abc/Desktop/Cryptography/playwright.log`, `/Users/abc/Desktop/Cryptography/backend.log`, and `/Users/abc/Desktop/Cryptography/frontend.log` to confirm that the servers started cleanly and all 115 E2E tests passed successfully.
3. If there are any E2E test failures, debug and fix the code. Ensure all code changes/fixes are genuine (no hardcoding, no dummy/facade implementations) and are written using Claude Opus 4.5 (Thinking).
4. Verify the Next.js production build runs cleanly by executing `npm run build` in the `web/` directory.
5. Create `web/README.md` documenting:
   - Prerequisites (Node version, Python version/packages).
   - How to install dependencies.
   - How to start the FastAPI backend server (port 8000).
   - How to start the Next.js frontend server (port 3000).
   - How to run the E2E test suite.
6. Run the final Snyk scans (e.g., `snyk test` or `snyk code test` on frontend/backend) and update/document the final findings in `web/SECURITY_LOG.md`.
7. Write a detailed handoff report in `/Users/abc/Desktop/Cryptography/.agents/worker_run_tests_gen2/handoff.md` detailing:
   - E2E test execution command and results.
   - Production build command and result.
   - Snyk final scan command and results.
   - List of created files and verification status.

**MANDATORY INTEGRITY WARNING**:
> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A Forensic Auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.
