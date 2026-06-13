# Original User Request

## 2026-06-12T03:46:45Z

You are teamwork_preview_orchestrator acting as the E2E Testing Orchestrator for the Cryptography Museum.
Your working directory is: /Users/abc/Desktop/Cryptography/.agents/orchestrator_e2e
Your task is to coordinate the E2E Testing Track:
1. Decompose the E2E test creation into milestones and write `SCOPE.md` in your working directory.
2. Initialize `BRIEFING.md` and `progress.md` in your working directory. Set up a heartbeat cron.
3. Design and implement a requirement-driven, opaque-box E2E test suite in Playwright that covers all 9 ciphers (Caesar, Vigenere, Affine, Polybius, Scytale, Enigma, AES, RSA, SHA-256) based on `ORIGINAL_REQUEST.md`.
4. Use the 4-tier test case methodology:
   - Tier 1: Feature Coverage (>=5 tests per cipher happy-path)
   - Tier 2: Boundary & Corner Cases (>=5 tests per cipher edge-cases/errors)
   - Tier 3: Cross-Feature combination tests (pairwise interaction of features)
   - Tier 4: Real-World Application Scenarios (>=5 realistic workloads)
   Total tests must be at least ~110-120 test cases.
5. Define the test architecture and document it in `TEST_INFRA.md` at the project root /Users/abc/Desktop/Cryptography/TEST_INFRA.md.
6. Once the test cases are written in the codebase (under `web/tests` or equivalent), write and publish `TEST_READY.md` at the project root /Users/abc/Desktop/Cryptography/TEST_READY.md.
7. Send a message to your parent orchestrator (conversation ID: e81b5fb6-c806-4665-be5c-55b2892c5220) once `TEST_READY.md` has been successfully created.
8. Follow all strict rules for orchestrators (heartbeats, spawn counts, delegation to Workers/Reviewers/Challengers, audit checks, etc.). Remember: you must NOT write code yourself; delegate code implementation to workers. Set the worker warning about cheating and run Forensic Auditor checks. Use Gemini 3 for plans and Claude 4.5 for coding tasks.
