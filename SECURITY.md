# Security Policy

## Reporting a vulnerability

If you believe you have found a security vulnerability in the Cryptography
Museum or the Python cryptography engine, please report it via a GitHub
Security Advisory:

https://github.com/Arjundevjha/Cryptography/security/advisories/new

or open an issue. Please include:

- What the issue is and a short reproduction
- The file or endpoint affected
- A suggested fix, if you have one

## Supported versions

| Version       | Supported |
| ------------- | --------- |
| `main` (HEAD) | Yes       |
| Tags/releases | Best effort |

## Scope and threat model

- The `methods/` engine is intentionally **zero-dependency** (Python standard
  library only). All attack demonstrations (RSA factorization, CBC
  bit-flipping, Lorenz depth attacks, Enigma Bombe crib searches) run on
  synthetic examples and are educational tools, not production attack
  platforms.
- Inputs are validated with DoS bounds (maximum text/key/message lengths,
  prime bit-length caps); the FastAPI backend adds Pydantic input bounds,
  request-size limits, and SSRF protections to all cryptanalysis endpoints.
- The cryptographic primitives (AES, SHA-256/SHA-512/SHA3, BLAKE2, HMAC, RSA,
  ECC, Schnorr, ML-KEM/OTP/ChaCha20) are implemented from scratch for
  educational purposes. Treat them as reference implementations; review and
  fuzz them before use in production systems.
- The FastAPI backend (`web/api/`) and Next.js frontend (`web/`) are intended
  for development and demonstration; they are not hardened production
  deployments.

## Disclosure policy

Vulnerabilities found in this repository should be reported to the repository
maintainers; public disclosure happens after a fix is available or the
reporter is agreed upon. Reporters will be credited unless they request
anonymity.
