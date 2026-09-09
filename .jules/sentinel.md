## 2026-06-16 - Equal RSA Primes and PEM String Validation Bounds
**Vulnerability:** RSA keygen allowed $p = q$, generating cryptographically broken and trivially factorable RSA keys ($n = p^2$), while RSA decryption endpoints enforced an overly restrictive `max_length=500` on PEM keys and ciphertexts, rejecting legitimate 1024/2048-bit RSA keys.
**Learning:** RSA mathematically requires distinct primes ($p \neq q$), and string length bounds on serialized cryptographic materials (like Base64 PEM keys and hex ciphertexts) must account for standard key sizes (e.g., 10,000 chars for PEM keys and 100,000 chars for hex ciphertexts).
**Prevention:** Explicitly validate prime distinctness ($p \neq q$) in RSA keygen endpoints and set realistic, bounded length limits on public/private key PEM strings and hex ciphertext inputs.

## 2026-06-16 - Unrestricted Resource Allocation in Pydantic Input Schemas
**Vulnerability:** API request body fields for RSA keygen primes (`p`, `q`), Enigma plugboard settings, and Lorenz wheel positions lacked max length and value range constraints, allowing attackers to submit arbitrarily large numbers or arrays and trigger CPU/memory exhaustion (DoS).
**Learning:** Even when ciphertext / plaintext strings have `max_length=500` bounds, auxiliary parameters (integers, arrays, nested lists) can easily be exploited for DoS if left unconstrained in Pydantic models.
**Prevention:** Always define explicit `max_length`, `gt`/`lt`, or `ge`/`le` bounds on all array and integer fields in Pydantic models across API endpoints.
