## 2026-06-12T03:47:44Z
You are teamwork_preview_worker.
Your working directory is: /Users/abc/Desktop/Cryptography/.agents/worker_setup
Please execute Milestone 1: Scaffolding & Setup for the Cryptography Museum web application.

OBJECTIVE:
Scaffold the Next.js and FastAPI projects in /Users/abc/Desktop/Cryptography/web.
1. Initialize the Next.js app in /Users/abc/Desktop/Cryptography/web with TypeScript, Tailwind CSS, and App Router. Set up basic dark theme layouts.
2. Set up the FastAPI server structure in /Users/abc/Desktop/Cryptography/web/api/main.py. Include CORS middleware, api endpoints, and validation for input string length (limit to 500 characters, returning a HTTP 400 Bad Request error if exceeded).
3. Set up a local proxy in Next.js (next.config.js rewrites) so that requests to /api/ are proxied to the FastAPI server.
4. Set up package configurations and dependencies (package.json, requirements.txt or pyproject.toml). Add vitest for TS unit tests.
5. Run Snyk scans on package dependencies using snyk_code_scan or similar to ensure clean dependencies.
6. Run build verification to ensure Next.js builds successfully.

COMPLETION CRITERIA:
- The web/ directory has a Next.js configuration and package setup.
- The web/api/main.py FastAPI entry point is created, containing CORS middleware and max 500 characters input validation.
- Next.js builds successfully (run build commands).
- Write a handoff report in your working directory at /Users/abc/Desktop/Cryptography/.agents/worker_setup/handoff.md listing:
  - Setup details and config choices.
  - Commands run and build output/results.
  - Dependencies installed.
  - Verification results (build, Snyk scan).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
