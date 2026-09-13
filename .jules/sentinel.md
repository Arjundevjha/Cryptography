## 2026-06-16 - Unrestricted Resource Allocation in Pydantic Input Schemas
**Vulnerability:** API request body fields for RSA keygen primes (`p`, `q`), Enigma plugboard settings, and Lorenz wheel positions lacked max length and value range constraints, allowing attackers to submit arbitrarily large numbers or arrays and trigger CPU/memory exhaustion (DoS).
**Learning:** Even when ciphertext / plaintext strings have `max_length=500` bounds, auxiliary parameters (integers, arrays, nested lists) can easily be exploited for DoS if left unconstrained in Pydantic models.
**Prevention:** Always define explicit `max_length`, `gt`/`lt`, or `ge`/`le` bounds on all array and integer fields in Pydantic models across API endpoints.

## 2026-06-18 - Content Security Policy 'unsafe-eval' Risk
**Vulnerability:** Next.js HTTP security headers in `web/next.config.js` included `'unsafe-eval'` in `Content-Security-Policy` `script-src`.
**Learning:** `'unsafe-eval'` enables string-to-code execution primitives (`eval()`, `new Function()`) in browser contexts, exposing the app to Cross-Site Scripting (XSS) exploitation. Modern Next.js applications and WebGL libraries do not require `'unsafe-eval'` in production.
**Prevention:** Always omit `'unsafe-eval'` from `script-src` in production CSP configurations. Retain necessary hydration directives (`'unsafe-inline'` where static SSG nonces are absent) while ensuring dynamic string execution remains disabled.
