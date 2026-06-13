# Scope: E2E Testing Track

## Architecture
- **Test Runner**: Playwright (TypeScript) running in `web` (or root context).
- **Test Strategy**: Opaque-box testing of Next.js frontend running on `http://localhost:3000`. Interact with elements using stable `data-testid` selectors.
- **Mocking / API Verification**: Verify frontend interactions. Since Next.js API routes proxy to the FastAPI server, tests will exercise both client-side adapters (Caesar, Vigenere) and server-side algorithms (Affine, Enigma, AES, RSA, SHA-256) end-to-end.
- **Verification Target**: Ensure all 9 ciphers work correctly, playback controls animate, responsiveness checks pass, and boundary constraints (e.g. input limits) are correctly handled.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| 1 | Test Infra Setup | Define E2E testing directory structure, write `TEST_INFRA.md`, scaffold Playwright configuration and test utilities. | none | DONE | 881187fe-9595-4cd5-b505-112b7f0351d6 |
| 2 | Classical & Historical Tests | Implement Tier 1 and Tier 2 E2E tests for Caesar, Vigenère, Affine, Polybius, and Scytale ciphers. | M1 | DONE | b0b35e13-148f-4b01-b606-ee8eefd32395 |
| 3 | Advanced & Modern Tests | Implement Tier 1 and Tier 2 E2E tests for Enigma, AES, RSA, and SHA-256 ciphers. | M1 | DONE | b0b35e13-148f-4b01-b606-ee8eefd32395 |
| 4 | Combinatorial & Scenarios | Implement Tier 3 (Cross-cipher pairwise interactions) and Tier 4 (Real-world workload scenarios). | M2, M3 | DONE | b0b35e13-148f-4b01-b606-ee8eefd32395 |
| 5 | Verification & Release | Run the full suite, resolve failures, run Forensic Auditor checks, and write `TEST_READY.md`. | M4 | DONE | 7693afe8-9984-4b00-92db-5dc987d89eb8 |

## Interface Contracts
### Playwright Tests ↔ Web Application UI Selectors
To keep tests decoupled from implementation details, we establish the following `data-testid` contract:
- `data-testid="timeline-node-<cipher>"`: Navigation element for each cipher (e.g., `caesar`, `vigenere`, `affine`, `polybius`, `scytale`, `enigma`, `aes`, `rsa`, `sha256`).
- `data-testid="exhibit-<cipher>"`: The container for each cipher's exhibit.
- `data-testid="input-text-<cipher>"`: Textarea or input field for input message.
- `data-testid="output-text-<cipher>"`: Textarea or element containing the final output.
- `data-testid="mode-select-<cipher>"` or `data-testid="encrypt-btn-<cipher>"` / `data-testid="decrypt-btn-<cipher>"`: Mode toggles.
- `data-testid="param-<name>-<cipher>"`: Param inputs (e.g., `data-testid="param-shift-caesar"`, `data-testid="param-key-vigenere"`, `data-testid="param-a-affine"`, `data-testid="param-b-affine"`, `data-testid="param-width-scytale"`, `data-testid="param-key-aes"`, etc.).
- `data-testid="play-btn-<cipher>"`, `data-testid="pause-btn-<cipher>"`, `data-testid="step-forward-btn-<cipher>"`, `data-testid="step-backward-btn-<cipher>"`, `data-testid="reset-btn-<cipher>"`: Animation/playback controls.
- `data-testid="speed-slider-<cipher>"`: Playback speed control.
- `data-testid="visualizer-<cipher>"`: The visual animation area.
- `data-testid="error-message-<cipher>"`: Container for validation/error messages.
