# Scope: Cryptography Museum Implementation

## Architecture
- Deep-navy/charcoal background Next.js Single Page App. Monospace font for ciphers, serif for titles.
- Horizontal scrollable timeline nav at the top (node clicking scrolls to exhibit, intersection observer highlights node).
- FastAPI backend in `web/api/main.py` serving as an API bridge to the `methods/` directory algorithms (Affine, Enigma, AES, RSA, SHA-256).
- Client-side TypeScript implementations for Caesar and Vigenere matching Python behavior.
- Next.js acts as front-end, proxying API requests under `/api/` to the FastAPI backend.
- Accessibility standards: Lighthouse accessibility score >= 90, keyboard nav, focus states, `aria-*` tags, skipping animations when `prefers-reduced-motion` is active.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | Scaffolding & Setup | Next.js and FastAPI directory setups, configs, CORS, length limit (500), Snyk validation | none | DONE |
| 2 | Classical Ciphers Exhibit | Client-side Caesar + SVG wheel visual; client-side Vigenere + grid visual; backend Affine + number lines visual | M1 | DONE |
| 3 | Historical Ciphers Exhibit | Backend Scytale + wrap tape visual; backend Polybius + grid visual; backend Enigma + electrical path visual | M2 | DONE |
| 4 | Modern Ciphers Exhibit | Backend AES + 10 rounds visual; backend RSA + keygen visual; backend SHA-256 + padding visual | M3 | PLANNED |
| 5 | Timeline Nav & A11y Hardening | Timeline nav scroll, dark theme, accessibility (tabindex, aria-*, reduced-motion) | M4 | PLANNED |
| 6 | E2E Integration & Verification | Integrate tests, run Vitest/Playwright, get 100% pass, run Forensic Auditor check | M5 | PLANNED |
| 7 | Adversarial Hardening | Tier 5 tests with Challengers, fix bugs, run Forensic Auditor check | M6 | PLANNED |

## Interface Contracts
### Client ↔ FastAPI Backend (web/api/main.py)
- **CORS**: Enabled for frontend.
- **Input Validation**: All text inputs have max length 500 characters. Returns 400 if exceeded.
- **Endpoints**:
  - `/api/affine/encrypt` & `/api/affine/decrypt`
    - Input: `{"plaintext": str, "a_key": int, "b_key": int}` (or ciphertext)
    - Output: `{"ciphertext": str}` (or plaintext)
  - `/api/scytale/encrypt` & `/api/scytale/decrypt`
    - Input: `{"plaintext": str, "diameter": int}`
    - Output: `{"ciphertext": str}`
  - `/api/polybius/encrypt` & `/api/polybius/decrypt`
    - Input: `{"plaintext": str, "key": str}`
    - Output: `{"ciphertext": str}`
  - `/api/enigma/encipher`
    - Input: `{"plaintext": str, "rotors": list[str], "reflector": str, "plugboard": list[str], "rings": list[int], "key": str}`
    - Output: `{"ciphertext": str}`
  - `/api/aes/encrypt` & `/api/aes/decrypt`
    - Input: `{"plaintext": str, "key": str}` (key is hex) or `{"ciphertext": str, "key": str, "nonce": str}`
    - Output: `{"ciphertext": str, "nonce": str}` or `{"plaintext": str}`
  - `/api/rsa/keygen`
    - Input: `{"passphrase": str}` (optional)
    - Output: `{"public_key": str, "private_key": str}` (PEM format strings)
  - `/api/rsa/encrypt` & `/api/rsa/decrypt`
    - Input: `{"plaintext": str, "public_key": str}` or `{"ciphertext": str, "private_key": str}`
    - Output: `{"ciphertext": str}` or `{"plaintext": str}`
  - `/api/sha256`
    - Input: `{"plaintext": str}`
    - Output: `{"hash": str}`
