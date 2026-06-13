# Execution Plan: Cryptography Museum

This project is orchestrated using a Dual-Track Project Pattern, consisting of an E2E Testing Track and an Implementation Track running in parallel.

## Tracks and Sub-Orchestrators

### 1. E2E Testing Track
- **Sub-Orchestrator**: `teamwork_preview_orchestrator` (Role: E2E Testing Orchestrator)
- **Directory**: `/Users/abc/Desktop/Cryptography/.agents/orchestrator_e2e`
- **Objective**: Design and build a comprehensive requirement-driven, opaque-box E2E test suite in Playwright verifying all 9 ciphers (Tiers 1-4).
- **Deliverable**: `TEST_READY.md` summarizing feature coverage, test cases, and invocation instructions.

### 2. Implementation Track
- **Sub-Orchestrator**: `teamwork_preview_orchestrator` (Role: Implementation Orchestrator)
- **Directory**: `/Users/abc/Desktop/Cryptography/.agents/orchestrator_implementation`
- **Objective**: Scaffold frontend and backend, build cipher visualizations and adapters, integrate FastAPI API bridge, pass unit/E2E tests, and perform Tier 5 adversarial hardening.
- **Deliverables**: Completed interactive web application, Vitest unit tests, clean security scans, passing E2E suite.

---

## Detailed Milestones

### Milestone 1: Track Initialization & Setup
- Spawn the E2E Testing sub-orchestrator and the Implementation sub-orchestrator.
- Establish the baseline repository directories under `.agents/`.

### Milestone 2: E2E Test Suite Creation & App Scaffolding
- E2E Track: Designs E2E tests for ciphers based on requirements.
- Implementation Track: Setup Next.js, tailwind, TypeScript configurations, FastAPI baseline server, and CORS/Proxy rewrite configurations. Snyk security scans run on initial packages.

### Milestone 3: Classical Ciphers & Core UI
- Implementation Track: Create timeline page layout (dark theme, intersection observer). Develop Caesar (concentric SVG wheel) and Vigenère (26x26 grid auto-scroll) components with client-side TS adapters.

### Milestone 4: FastAPI Bridge & Historical Ciphers
- Implementation Track: Setup FastAPI endpoints for Affine, Polybius, Scytale, and Enigma. Develop visualizers (math formulas, cylinder tape wrap, 5x5 grid, Enigma 3-rotor electrical path).

### Milestone 5: Modern Ciphers & Educational Diagrams
- Implementation Track: Develop educational viz for AES (10 rounds block diagram), RSA (key generation diagram), and SHA-256 (padding and block splitting) connected to FastAPI backend.

### Milestone 6: E2E Verification & Adversarial Hardening
- Implementation Track: Run the full E2E test suite published in `TEST_READY.md`. Fix any bugs until 100% of Tiers 1-4 tests pass.
- Run Challenger-driven Tier 5 white-box analysis, generate adversarial test cases, and fix outstanding edge-case bugs.
