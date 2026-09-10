## 2026-06-16 - Insecure RSA Public Exponent $e=1$ and Sub-256 Bit Modulus Validation
**Vulnerability:** API key generation endpoint `/api/rsa/keygen` accepted $e=1$ and small primes $p, q$ resulting in modulus $n < 256$, allowing clients to generate RSA keys where encryption was an identity function ($c \equiv m$) and single-byte byte values wraparound.
**Learning:** Checking `math.gcd(e, phi) == 1` passes for $e=1$ because $\gcd(1, \phi) = 1$, creating a valid mathematical modular inverse $d=1$ where $c = m^1 \pmod n = m$, completely bypassing encryption.
**Prevention:** Explicitly enforce $e \ge 3$ (`ge=3` on Pydantic fields and runtime checks) and $n = p \times q \ge 256$ in all RSA key generation models and handlers.

## 2026-06-16 - Unrestricted Resource Allocation in Pydantic Input Schemas
**Vulnerability:** API request body fields for RSA keygen primes (`p`, `q`), Enigma plugboard settings, and Lorenz wheel positions lacked max length and value range constraints, allowing attackers to submit arbitrarily large numbers or arrays and trigger CPU/memory exhaustion (DoS).
**Learning:** Even when ciphertext / plaintext strings have `max_length=500` bounds, auxiliary parameters (integers, arrays, nested lists) can easily be exploited for DoS if left unconstrained in Pydantic models.
**Prevention:** Always define explicit `max_length`, `gt`/`lt`, or `ge`/`le` bounds on all array and integer fields in Pydantic models across API endpoints.
