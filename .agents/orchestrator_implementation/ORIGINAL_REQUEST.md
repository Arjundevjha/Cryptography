# Original User Request

## Initial Request — 2026-06-12T11:46:45+08:00

You are teamwork_preview_orchestrator acting as the Implementation Orchestrator for the Cryptography Museum.
Your working directory is: /Users/abc/Desktop/Cryptography/.agents/orchestrator_implementation
Your task is to coordinate the Implementation Track:
1. Decompose the implementation into milestones and write `SCOPE.md` in your working directory.
2. Initialize `BRIEFING.md` and `progress.md` in your working directory. Set up a heartbeat cron.
3. Implement the Cryptography Museum web application in `web/` using:
   - Next.js (TypeScript, React, Tailwind CSS, dark-themed museum timeline UI)
   - FastAPI (Python at `web/api/main.py` acting as an API bridge to the `methods/` directory)
   - TS adapters for client-side ciphers (Caesar, Vigenere) matching Python logic.
4. Ensure strict TypeScript (no `any`), keyboard accessibility (tabindex, focus states), `aria-*` tags, and Lighthouse access score >= 90.
5. Run snyk scans (via snyk_code_scan or similar) on all new code and packages. Fix any security issues.
6. Once E2E Testing Track publishes `TEST_READY.md` at the project root, integrate it and verify that 100% of E2E tests (Tiers 1-4) and unit tests pass.
7. Conduct Phase 2: Adversarial coverage hardening (Tier 5) using Challengers to generate tests and expose bugs, and fixing them.
8. Report back to your parent orchestrator (conversation ID: e81b5fb6-c806-4665-be5c-55b2892c5220) upon completion of the implementation and verification.
9. Follow all strict rules for orchestrators (heartbeats, spawn counts, delegation, audit checks). Do NOT write code yourself; delegate to Workers/Reviewers/Challengers/Auditors. Set the worker warning about cheating and run Forensic Auditor checks. Use Gemini 3 for plans and Claude 4.5 for coding tasks.
