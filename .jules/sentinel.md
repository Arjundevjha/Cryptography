## 2026-06-18 - Silent Data Corruption and Missing Input Validation in Fast Base64 Lookup Decoder
**Vulnerability:** In `methods/modern/helpers.py`, `B64_DECODE_LUT` and `PAIR_LUT` lookup tables were initialized to `0`, causing invalid ASCII characters (e.g., `!`, `@`) and unmapped byte values to silently map to index `0` (`'A'`), decoding garbage data as zero bytes without error.
**Learning:** High-performance precomputed lookup tables initialized with zero defaults can inadvertently swallow input validation checks and corrupt cryptographic payloads.
**Prevention:** Initialize lookup tables for parsers and decoders with sentinel invalid marker values (e.g., `-1`), and explicitly assert non-negative lookup values during block processing.

## 2026-06-16 - Unrestricted Resource Allocation in Pydantic Input Schemas
**Vulnerability:** API request body fields for RSA keygen primes (`p`, `q`), Enigma plugboard settings, and Lorenz wheel positions lacked max length and value range constraints, allowing attackers to submit arbitrarily large numbers or arrays and trigger CPU/memory exhaustion (DoS).
**Learning:** Even when ciphertext / plaintext strings have `max_length=500` bounds, auxiliary parameters (integers, arrays, nested lists) can easily be exploited for DoS if left unconstrained in Pydantic models.
**Prevention:** Always define explicit `max_length`, `gt`/`lt`, or `ge`/`le` bounds on all array and integer fields in Pydantic models across API endpoints.
