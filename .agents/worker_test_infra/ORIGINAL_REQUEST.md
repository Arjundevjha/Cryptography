## 2026-06-12T03:47:42Z

You are teamwork_preview_worker acting as the E2E Test Infra Writer.
Your working directory is: /Users/abc/Desktop/Cryptography/.agents/worker_test_infra
Your task is to:
1. Initialize your BRIEFING.md and progress.md in your working directory.
2. Write the E2E test infrastructure specification file `TEST_INFRA.md` at the project root: `/Users/abc/Desktop/Cryptography/TEST_INFRA.md`.
3. The content of `TEST_INFRA.md` must follow this structure:

# E2E Test Infra: Cryptography Museum

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Caesar Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 2 | Vigenère Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 3 | Affine Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 4 | Scytale Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 5 | Polybius Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 6 | Enigma Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 7 | AES Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 8 | RSA Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 9 | SHA-256 Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: Playwright (running via `npx playwright test` inside the `web` directory, with typescript configuration and exit codes signaling test success/failure).
- Test case format: Inputs are entered into text inputs and control parameters, and final output is retrieved from visual text containers or visualizer outputs, verifying against expected values.
- Directory layout: All E2E tests will be located under `web/tests/e2e/`.
- UI Selector Contracts (data-testid):
  - `data-testid="timeline-node-<cipher>"` (e.g. `caesar`, `vigenere`, `affine`, `polybius`, `scytale`, `enigma`, `aes`, `rsa`, `sha256`)
  - `data-testid="exhibit-<cipher>"`
  - `data-testid="input-text-<cipher>"`
  - `data-testid="output-text-<cipher>"`
  - `data-testid="mode-select-<cipher>"` or `data-testid="encrypt-btn-<cipher>"` / `data-testid="decrypt-btn-<cipher>"`
  - `data-testid="param-<name>-<cipher>"` (e.g., `data-testid="param-shift-caesar"`, `data-testid="param-key-vigenere"`, `data-testid="param-a-affine"`, `data-testid="param-b-affine"`, `data-testid="param-width-scytale"`, `data-testid="param-key-aes"`, etc.)
  - `data-testid="play-btn-<cipher>"`, `data-testid="pause-btn-<cipher>"`, `data-testid="step-forward-btn-<cipher>"`, `data-testid="step-backward-btn-<cipher>"`, `data-testid="reset-btn-<cipher>"`
  - `data-testid="speed-slider-<cipher>"`
  - `data-testid="visualizer-<cipher>"`
  - `data-testid="error-message-<cipher>"`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Multi-stage classical transmission | Caesar, Vigenère, Scytale | High |
| 2 | Modern Secure Channel simulation | RSA, AES | High |
| 3 | Museum Tour timeline navigation | Timeline scroll, Node highlights | Medium |
| 4 | Database integrity simulation | SHA-256, AES | Medium |
| 5 | Enigma operational simulation | Enigma (rotors, rings, plugboard) | High |

## Coverage Thresholds
- Tier 1: >=5 per feature (Total: 45)
- Tier 2: >=5 per feature (Total: 45)
- Tier 3: pairwise coverage of major feature interactions (Total: >=10)
- Tier 4: >=5 realistic application scenarios (Total: >=5)
- Total minimum: ~110-120 test cases.

4. Once done, write a handoff.md in your working directory and notify me by calling send_message with your status and path to files created.
