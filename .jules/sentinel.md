## 2026-06-16 - Unrestricted Resource Allocation in Pydantic Input Schemas
**Vulnerability:** API request body fields for RSA keygen primes (`p`, `q`), Enigma plugboard settings, and Lorenz wheel positions lacked max length and value range constraints, allowing attackers to submit arbitrarily large numbers or arrays and trigger CPU/memory exhaustion (DoS).
**Learning:** Even when ciphertext / plaintext strings have `max_length=500` bounds, auxiliary parameters (integers, arrays, nested lists) can easily be exploited for DoS if left unconstrained in Pydantic models.
**Prevention:** Always define explicit `max_length`, `gt`/`lt`, or `ge`/`le` bounds on all array and integer fields in Pydantic models across API endpoints.
