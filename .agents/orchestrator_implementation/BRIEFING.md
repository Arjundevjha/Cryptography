# BRIEFING — 2026-06-12T11:48:00+08:00

## Mission
Coordinate the Implementation Track for the Cryptography Museum, scaffolding the web application, implementing ciphers (Next.js + FastAPI), scanning with Snyk, and verifying correctness through unit, E2E, and adversarial testing.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /Users/abc/Desktop/Cryptography/.agents/orchestrator_implementation
- Original parent: main agent
- Original parent conversation ID: e81b5fb6-c806-4665-be5c-55b2892c5220

## 🔒 My Workflow
- Pattern: Project Pattern (Sub-orchestrator)
- Scope document: /Users/abc/Desktop/Cryptography/.agents/orchestrator_implementation/SCOPE.md
1. **Decompose**: Decompose implementation into milestones based on module boundaries and complexity.
2. **Dispatch & Execute** (pick ONE):
   - **Direct (iteration loop)**: For each milestone, run the Explorer → Worker → Reviewer → Challenger → Forensic Auditor loop.
   - **Delegate (sub-orchestrator)**: [not used unless a milestone is too large to manage directly]
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: Self-succeed at 16 spawns. Write handoff.md, spawn successor.
- **Work items**:
  1. Planning and decomposition [in-progress]
  2. Next.js & FastAPI project scaffolding [pending]
  3. Classical ciphers (Caesar, Vigenere, Affine) implementation & frontend [pending]
  4. Historical ciphers (Scytale, Polybius, Enigma) implementation & frontend [pending]
  5. Modern ciphers (AES, RSA, SHA-256) implementation & frontend [pending]
  6. E2E Test Suite integration (Tiers 1-4) [pending]
  7. Adversarial Coverage Hardening (Tier 5) [pending]
- **Current phase**: 1
- **Current focus**: Planning and decomposition

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- All web-based cryptography implementations must use the logic/algorithms already implemented in the Python codebase in the repository (`methods/` directory).
- TS ciphers (Caesar, Vigenere) must match Python logic.
- Web-based cryptography backend API in FastAPI (`web/api/main.py`).
- Next.js frontend, dark-themed museum timeline UI.
- Strict TS, keyboard accessibility, ARIA tags, Lighthouse accessibility score >= 90.
- Snyk code and package scans on all new code and packages.
- Verification via unit/E2E tests, challenger checks, and forensic audits.
- Never reuse a subagent after it has delivered its handoff.
- Gemini 3 for plans, Claude 4.5 for coding tasks.

## Current Parent
- Conversation ID: e81b5fb6-c806-4665-be5c-55b2892c5220
- Updated: not yet

## Key Decisions Made
- CORS Middleware RuntimeError: Resolved to set `allow_credentials=False` because the cipher APIs are stateless, which resolves the Starlette RuntimeError while keeping wildcard origins allowed.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
| worker_setup | teamwork_preview_worker | Milestone 1 Setup | completed | c1bced24-100d-42c5-91bb-125d29f680c7 |
| auditor_setup | teamwork_preview_auditor | Forensic Audit M1 | completed (fail) | d8ce872d-8df2-4084-8f29-74be55ba992f |
| explorer_setup_1 | teamwork_preview_explorer | Explorer Setup Retry 1 | completed | 3710c499-2968-4cd7-aee0-2aaa4e101dbf |
| explorer_setup_2 | teamwork_preview_explorer | Explorer Setup Retry 2 | completed | 8885b780-1d37-4c86-a014-f84fdbff7351 |
| explorer_setup_3 | teamwork_preview_explorer | Explorer Setup Retry 3 | completed | df200e8e-6d24-4946-8ea9-0aa5ac6829d8 |
| worker_setup_2 | teamwork_preview_worker | Milestone 1 Setup Fix | completed | 3d8bcbfd-5035-41a9-b028-f79ae0e87148 |
| auditor_setup_2 | teamwork_preview_auditor | Forensic Audit Setup Retry | completed | ae741b1d-0c6b-47bd-8d7b-1693f29475d5 |
| worker_classical | teamwork_preview_worker | Milestone 2 Classical Ciphers | completed | 0a250286-f98b-449f-be99-1a75423e8e0c |
| auditor_classical | teamwork_preview_auditor | Forensic Audit Classical Ciphers | completed | 4a229793-cc2f-4672-bd68-9e3a599fac35 |
| worker_historical | teamwork_preview_worker | Milestone 3 Historical Ciphers | completed | edee3548-e680-44bc-a399-206cd45cfb78 |
| auditor_historical | teamwork_preview_auditor | Forensic Audit Historical Ciphers | completed | 53a93d46-0194-4e04-8298-22557879f69f |
| worker_modern | teamwork_preview_worker | Milestone 4 Modern Ciphers | in-progress | 309c57fb-11e2-43b6-b734-daf2e797af54 |

## Succession Status
- Succession required: no
- Spawn count: 12 / 16
- Pending subagents: 309c57fb-11e2-43b6-b734-daf2e797af54
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: task-23
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- /Users/abc/Desktop/Cryptography/.agents/orchestrator_implementation/progress.md — heartbeat progress log
- /Users/abc/Desktop/Cryptography/.agents/orchestrator_implementation/SCOPE.md — milestone decomposition and interface contracts
- /Users/abc/Desktop/Cryptography/.agents/orchestrator_implementation/ORIGINAL_REQUEST.md — user requirements and initial task description
