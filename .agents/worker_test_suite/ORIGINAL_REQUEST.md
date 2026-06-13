## 2026-06-12T11:48:41+08:00

You are teamwork_preview_worker acting as the E2E Test Suite Writer.
Your working directory is: /Users/abc/Desktop/Cryptography/.agents/worker_test_suite
Your task is to:
1. Initialize your BRIEFING.md and progress.md in your working directory.
2. Read `/Users/abc/Desktop/Cryptography/TEST_INFRA.md`.
3. Update `/Users/abc/Desktop/Cryptography/TEST_INFRA.md` to add 10 additional test cases (bringing total to 115 test cases) under Tier 3 and Tier 4:
   - TC-T3-INTERACT-11 (Keyboard Focus Trapping)
   - TC-T3-INTERACT-12 (Deep Linking & Timeline Navigation)
   - TC-T3-INTERACT-13 (Playback Control State Protection)
   - TC-T3-INTERACT-14 (Reset Button Clear state)
   - TC-T3-INTERACT-15 (Playback Speed preservation)
   - TC-T4-SCENARIO-06 (Double-Encryption Comparison)
   - TC-T4-SCENARIO-07 (Large Input Stress Test)
   - TC-T4-SCENARIO-08 (Caesar Brute-Force Simulation)
   - TC-T4-SCENARIO-09 (Signed Key Exchange)
   - TC-T4-SCENARIO-10 (Timeline Browsing History Integration)
   Ensure the coverage thresholds, counts, and lists in TEST_INFRA.md are updated accordingly.

4. Create the E2E Playwright test suite. Write the test cases in TypeScript under `web/tests/e2e/` split across 5 files:
   - `web/tests/e2e/classical.spec.ts` (Caesar, Vigenère, Affine - Tier 1 & 2 tests; 30 tests total)
   - `web/tests/e2e/historical.spec.ts` (Scytale, Polybius, Enigma - Tier 1 & 2 tests; 30 tests total)
   - `web/tests/e2e/modern.spec.ts` (AES, RSA, SHA-256 - Tier 1 & 2 tests; 30 tests total)
   - `web/tests/e2e/interactions.spec.ts` (Tier 3: 15 tests total)
   - `web/tests/e2e/scenarios.spec.ts` (Tier 4: 10 tests total)

   Use stable `data-testid` selectors as documented in `TEST_INFRA.md` interface contracts. Since the Next.js app will be running at `http://localhost:3000`, configure tests to use this baseURL. Write real, executable Playwright tests that implement all assertions and flow steps for each test case.

5. Create `web/playwright.config.ts` with appropriate standard Playwright settings (headless mode, test directory `tests/e2e`, viewport sizes, base URL `http://localhost:3000`, etc.).
6. Update/create `web/package.json` to include `@playwright/test`, `typescript`, `@types/node` in devDependencies and add script `"test:e2e": "playwright test"`. If `web/package.json` does not exist, initialize it cleanly with basic configurations.

MANDATORY INTEGRITY WARNING — DO NOT CHEAT:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When physically coding, use Claude Opus 4.5 (Thinking) as required by the global rules.

Once done, write a handoff.md in your working directory and notify me by calling send_message with your status and path to files created.
