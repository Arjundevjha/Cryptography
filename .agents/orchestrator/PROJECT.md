# Project: Cryptography Museum

## Architecture
- **Frontend**: Next.js (TypeScript, React, Tailwind CSS) running on `http://localhost:3000`. Monospace fonts for ciphers, serif for titles. Dark theme. Timeline navigation at the top, exhibit cards below with playback and visual animations.
- **Backend**: FastAPI (Python) running on `http://localhost:8000` via `web/api/main.py`. Proxied through Next.js proxy/rewrites.
- **Data Flow**:
  - Caesar & Vigenère ciphers: Executed entirely client-side via TS adapters matching the Python implementations.
  - Affine, Enigma, AES, RSA, SHA-256: Web UI sends request to Next.js API route -> proxied to FastAPI backend -> calls pure Python algorithms in `methods/` -> returns result and intermediate execution states -> visualized on frontend.
- **Shared Interfaces / Contracts**:
  - FastAPI endpoints for ciphers.
  - Snyk scanners check for security vulnerability checks on python and javascript.
  - Strict TypeScript, no `any`.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| 1 | E2E Testing Track | Comprehensive E2E test suite using Playwright (Tier 1-4). Outputs `TEST_READY.md`. | none | IN_PROGRESS | cd7b6eff-8f86-45b0-88c4-549b47ed78f8 |
| 2 | Implementation Track | Full frontend and backend implementation of all ciphers, timeline UI, and integration with `methods/`. | M1 | IN_PROGRESS | d10245f3-7cc3-40b4-85ec-d6360ff51b99 |

## Interface Contracts
### Next.js Frontend ↔ FastAPI Backend
- Proxy base path: `/api/v1` -> `http://localhost:8000/api/v1`
- **Affine Endpoint**: `POST /api/v1/cipher/affine`
  - Input: `{ plaintext: string, a_key: number, b_key: number, mode: 'encrypt' | 'decrypt' }`
  - Output: `{ result: string, steps: any }`
- **Enigma Endpoint**: `POST /api/v1/cipher/enigma`
  - Input: `{ message: string, rotors: string[], plugboard: string[], reflector: string, rings: number[], key: string }`
  - Output: `{ result: string, path: any }`
- **AES Endpoint**: `POST /api/v1/cipher/aes`
  - Input: `{ message: string, key: string, iv: string, mode: 'encrypt' | 'decrypt' }`
  - Output: `{ result: string, rounds: any }`
- **RSA Endpoint**: `POST /api/v1/cipher/rsa`
  - Input: `{ message: string, mode: 'encrypt' | 'decrypt', public_key?: string, private_key?: string, passphrase?: string }`
  - Output: `{ result: string, keys: { public: string, private: string } }`
- **SHA-256 Endpoint**: `POST /api/v1/cipher/sha256`
  - Input: `{ data: string }`
  - Output: `{ hash: string, padding: string, blocks: string[] }`

## Code Layout
- `web/`: Next.js frontend root directory
  - `web/api/main.py`: FastAPI server entrypoint
  - `web/components/`: React components (timeline, visualizers)
  - `web/tests/`: E2E and Vitest unit tests
- `methods/`: Existing Python algorithms
