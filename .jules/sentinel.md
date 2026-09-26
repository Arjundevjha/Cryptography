## 2026-06-16 - Unrestricted Resource Allocation in Pydantic Input Schemas
**Vulnerability:** API request body fields for RSA keygen primes (`p`, `q`), Enigma plugboard settings, and Lorenz wheel positions lacked max length and value range constraints, allowing attackers to submit arbitrarily large numbers or arrays and trigger CPU/memory exhaustion (DoS).
**Learning:** Even when ciphertext / plaintext strings have `max_length=500` bounds, auxiliary parameters (integers, arrays, nested lists) can easily be exploited for DoS if left unconstrained in Pydantic models.
**Prevention:** Always define explicit `max_length`, `gt`/`lt`, or `ge`/`le` bounds on all array and integer fields in Pydantic models across API endpoints.

## 2026-06-18 - Missing Parameter Length Validation for Cryptographic Nonces
**Vulnerability:** `aes.decrypt()` in AES-CTR mode lacked explicit length checking for the `nonce` argument, allowing invalid-length nonces to pass into block-level state unpacking and cause internal unhandled exceptions or potential counter block state corruption.
**Learning:** Symmetric stream ciphers relying on concatenated nonce-counter blocks require explicit parameter boundary validation at the function entry point before internal block processing or counter construction.
**Prevention:** Always validate exact byte-length requirements (e.g. `len(nonce) == NONCE_SIZE`) on cryptographic parameters at function entry and catch `ValueError` in API handlers to return HTTP 400 responses.
