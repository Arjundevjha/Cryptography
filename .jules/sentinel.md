## 2026-06-16 - Unrestricted Resource Allocation in Pydantic Input Schemas
**Vulnerability:** API request body fields for RSA keygen primes (`p`, `q`), Enigma plugboard settings, and Lorenz wheel positions lacked max length and value range constraints, allowing attackers to submit arbitrarily large numbers or arrays and trigger CPU/memory exhaustion (DoS).
**Learning:** Even when ciphertext / plaintext strings have `max_length=500` bounds, auxiliary parameters (integers, arrays, nested lists) can easily be exploited for DoS if left unconstrained in Pydantic models.
**Prevention:** Always define explicit `max_length`, `gt`/`lt`, or `ge`/`le` bounds on all array and integer fields in Pydantic models across API endpoints.

## 2026-06-17 - Missing Input Type & Length Validation in Cipher Core Modules
**Vulnerability:** Core cipher modules (`methods/classical/affine.py`) accepted unvalidated text inputs of arbitrary length and non-integer/boolean keys, creating potential Denial of Service (resource exhaustion) and type confusion vulnerabilities when called directly outside the web API layer.
**Learning:** Defense-in-depth requires enforcing strict type checks (rejecting `bool` as a subclass of `int`) and maximum text length bounds (`MAX_TEXT_LENGTH = 100000`) inside lower-level library functions, not relying solely on edge API schema validation.
**Prevention:** Always validate parameter types (`isinstance(x, int) and not isinstance(x, bool)`) and enforce upper bounds on string sizes in core cryptographic implementation functions.
