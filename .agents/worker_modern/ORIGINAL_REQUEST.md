## 2026-06-12T04:21:08Z
You are teamwork_preview_worker.
Your working directory is: /Users/abc/Desktop/Cryptography/.agents/worker_modern
Please execute Milestone 4: Modern Ciphers Exhibit.

OBJECTIVE:
Implement the modern ciphers (AES, RSA, and SHA-256) inside `/Users/abc/Desktop/Cryptography/web`.

1. IMPLEMENT BACKEND ENDPOINTS (FastAPI):
   - Integrations:
     - AES: Integrate `methods/modern/aes.py` and `methods/modern/symmetric.py`.
     - RSA: Integrate `methods/modern/rsa.py` and `methods/modern/keypair.py`.
     - SHA-256: Integrate `methods/modern/hash_functions.py`.
   - Endpoints:
     - `/api/aes/encrypt` & `/api/aes/decrypt`
       - Encryption Input: `{"plaintext": str, "key": str}` (where key is a 16-byte or 32-byte string, or hex string. E2E test inputs '1234567890123456' which is 16 chars / 16 bytes, or '12345678901234561234567890123456' which is 32 chars / 32 bytes. Ensure the backend handles both text keys of length 16/32 and parses hex formatted keys when formatted as hex)
       - Encryption Output: `{"ciphertext": str, "nonce": str}` (hex strings)
       - Decryption Input: `{"ciphertext": str, "key": str, "nonce": str}`
       - Decryption Output: `{"plaintext": str}`
     - `/api/rsa/keygen`
       - Input: `{"p": int, "q": int, "e": int}` (FastAPI endpoint can generate keys based on primes p and q and custom exponent e as tested in E2E tests, or generate them using standard generate_keypair. Since E2E tests fill out inputs 'param-p-rsa', 'param-q-rsa', 'param-e-rsa', the keygen endpoint should accept p, q, and e, compute n, phi, d, and return public and private keys in PEM format or custom fields, or just validate they are prime, p & q > 2, e coprime to phi, and output them so that the frontend can display n, public key, and private key)
     - `/api/rsa/encrypt` & `/api/rsa/decrypt`
       - Encryption Input: `{"plaintext": str, "public_key": str}`
       - Encryption Output: `{"ciphertext": str}` (hex)
       - Decryption Input: `{"ciphertext": str, "private_key": str}`
       - Decryption Output: `{"plaintext": str}`
     - `/api/sha256`
       - Input: `{"plaintext": str}`
       - Output: `{"hash": str}` (hex string)
   - Inputs: All text inputs must be checked using standard schemas with a 500-character max limit. If the limits are invalid (or keys are invalid like non-prime p/q, e not coprime, etc.), raise a `400 Bad Request`.

2. IMPLEMENT FRONTEND EXHIBITS (Next.js):
   - AES Exhibit:
     - Block diagram showing the key expansion and 10 rounds of encryption/decryption.
     - Controls: Play/Pause, Step Back/Forward, Reset, Speed Slider.
   - RSA Exhibit:
     - Key generation panel with parameters p, q, e and generate keys button.
     - Diagram showing the mathematical relations (n, phi, d) and encryption/decryption panels.
     - Controls: Play/Pause, Step Back/Forward, Reset, Speed Slider.
   - SHA-256 Exhibit:
     - Diagram showing message padding (advising pad, 1), block splitting (Block 1, Block 2), and output hash.
     - Controls: Play/Pause, Step Back/Forward, Reset, Speed Slider.
   - Layout & Styling: Keep the dark theme (`bg-slate-950`), serif for titles, monospace for code blocks, and full keyboard navigation (focus states, `tabIndex`, proper `aria-*` tags). Animation skipping when `prefers-reduced-motion` is active.
   - Selectors: Ensure that the data-testid attributes correspond to E2E requirements:
     - AES: `input-text-aes`, `param-key-aes`, `encrypt-btn-aes`, `decrypt-btn-aes`, `mode-select-aes`, `output-text-aes`, `visualizer-aes`, `play-btn-aes`, `error-message-aes`, `param-format-aes`, `param-keyformat-aes`.
     - RSA: `param-p-rsa`, `param-q-rsa`, `param-e-rsa`, `generate-keys-btn-rsa`, `param-n-rsa`, `public-key-rsa`, `input-text-rsa`, `encrypt-btn-rsa`, `decrypt-btn-rsa`, `mode-select-rsa`, `output-text-rsa`, `visualizer-rsa`, `error-message-rsa`.
     - SHA-256: `input-text-sha256`, `encrypt-btn-sha256`, `hash-btn-sha256`, `output-text-sha256`, `visualizer-sha256`, `error-message-sha256`.

3. VERIFICATION:
   - Add unit tests in Vitest for new client functions or helpers.
   - Add backend tests in pytest under `web/api/test_main.py` exercising these new endpoints.
   - Run Snyk code scans on newly written files.

COMPLETION CRITERIA:
- Modern ciphers are fully functional on frontend and backend, using references in `methods/`.
- All Playwright E2E tests for modern ciphers pass successfully.
- Write a handoff report at /Users/abc/Desktop/Cryptography/.agents/worker_modern/handoff.md detailing changes, verification, test outcomes, and any snyk scans.
