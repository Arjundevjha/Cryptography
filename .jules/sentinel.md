## 2026-06-17 - Non-Constant-Time PKCS#7 Padding Verification
**Vulnerability:** `pkcs7_unpad` in `methods/modern/symmetric.py` checked padding bytes with an early-exit loop (`if b != pad_len: raise ValueError(...)`), creating observable timing discrepancies (timing side-channel / CWE-208) depending on where invalid padding bytes occurred in AES-CBC blocks.
**Learning:** Returning early or short-circuiting on byte equality during cryptographic padding unpadding leaks timing information that can be exploited in padding oracle scenarios.
**Prevention:** Always verify all bytes in cryptographic buffers in constant time using a bitwise accumulator (`invalid |= b ^ expected`) before checking for errors.

## 2026-06-16 - Unrestricted Resource Allocation in Pydantic Input Schemas
**Vulnerability:** API request body fields for RSA keygen primes (`p`, `q`), Enigma plugboard settings, and Lorenz wheel positions lacked max length and value range constraints, allowing attackers to submit arbitrarily large numbers or arrays and trigger CPU/memory exhaustion (DoS).
**Learning:** Even when ciphertext / plaintext strings have `max_length=500` bounds, auxiliary parameters (integers, arrays, nested lists) can easily be exploited for DoS if left unconstrained in Pydantic models.
**Prevention:** Always define explicit `max_length`, `gt`/`lt`, or `ge`/`le` bounds on all array and integer fields in Pydantic models across API endpoints.
