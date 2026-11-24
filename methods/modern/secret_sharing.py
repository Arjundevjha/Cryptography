"""Shamir's Secret Sharing over a prime finite field GF(p)."""

import secrets
from methods.modern.keypair import is_prime

DEFAULT_PRIME = (1 << 127) - 1
TEXT_PRIME = (1 << 521) - 1
MAX_SHARES = 255
MAX_TEXT_BYTES = 64


def _validate_prime(prime: int) -> None:
    """Validate that prime is an integer >= 3 and prime."""
    if isinstance(prime, bool) or not isinstance(prime, int) or prime < 3 or not is_prime(prime):
        raise ValueError("prime must be a prime integer >= 3")


def _validate_threshold(threshold: int, num_shares: int, prime: int) -> None:
    """Validate threshold k, share count n, and field size p."""
    if isinstance(threshold, bool) or not isinstance(threshold, int) or threshold < 2:
        raise ValueError("threshold must be an integer >= 2")
    if isinstance(num_shares, bool) or not isinstance(num_shares, int) or num_shares < threshold:
        raise ValueError("num_shares must be an integer >= threshold")
    if num_shares > MAX_SHARES:
        raise ValueError(f"num_shares must be <= {MAX_SHARES}")
    if num_shares >= prime:
        raise ValueError("prime must be strictly greater than num_shares")


def _eval_poly(coefficients: list[int], x_val: int, prime: int) -> int:
    """Evaluate polynomial at x_val mod prime using Horner's method."""
    acc = 0
    for coeff in reversed(coefficients):
        acc = (acc * x_val + coeff) % prime
    return acc


def _resolve_coefficients(
    secret: int,
    threshold: int,
    prime: int,
    coefficients: list[int] | None,
) -> list[int]:
    """Validate or generate polynomial coefficients [a_0, a_1, ..., a_{k-1}]."""
    degree = threshold - 1
    if coefficients is None:
        random_coeffs = [secrets.randbelow(prime) for _ in range(degree)]
        if random_coeffs[-1] == 0:
            random_coeffs[-1] = 1 + secrets.randbelow(prime - 1)
        return [secret, *random_coeffs]

    if len(coefficients) != degree:
        raise ValueError(f"coefficients must contain exactly {degree} elements")
    for coeff in coefficients:
        if isinstance(coeff, bool) or not isinstance(coeff, int) or not 0 <= coeff < prime:
            raise ValueError("all coefficients must be integers in [0, prime - 1]")
    return [secret, *coefficients]


def split_secret(
    secret: int,
    threshold: int,
    num_shares: int,
    prime: int = DEFAULT_PRIME,
    coefficients: list[int] | None = None,
) -> dict:
    """Split an integer secret into num_shares shares with reconstruction threshold."""
    _validate_prime(prime)
    if isinstance(secret, bool) or not isinstance(secret, int) or not 0 <= secret < prime:
        raise ValueError("secret must be an integer in [0, prime - 1]")
    _validate_threshold(threshold, num_shares, prime)

    poly = _resolve_coefficients(secret, threshold, prime, coefficients)
    shares = [{"x": idx, "y": _eval_poly(poly, idx, prime)} for idx in range(1, num_shares + 1)]
    return {
        "prime": prime,
        "threshold": threshold,
        "num_shares": num_shares,
        "coefficients": poly,
        "shares": shares,
    }


def _validate_shares(shares: list[tuple[int, int]], prime: int) -> list[tuple[int, int]]:
    """Validate share pairs (x, y) over GF(prime) and ensure distinct x coordinates."""
    if len(shares) < 2:
        raise ValueError("at least 2 shares are required for reconstruction")

    seen_x: set[int] = set()
    validated: list[tuple[int, int]] = []
    for x_val, y_val in shares:
        if isinstance(x_val, bool) or not isinstance(x_val, int) or not 1 <= x_val < prime:
            raise ValueError("share x-coordinate must be an integer in [1, prime - 1]")
        if x_val in seen_x:
            raise ValueError("share x-coordinates must be distinct")
        if isinstance(y_val, bool) or not isinstance(y_val, int) or not 0 <= y_val < prime:
            raise ValueError("share y-coordinate must be an integer in [0, prime - 1]")
        seen_x.add(x_val)
        validated.append((x_val, y_val))
    return validated


def reconstruct_secret(
    shares: list[tuple[int, int]],
    prime: int = DEFAULT_PRIME,
) -> dict:
    """Reconstruct secret at x=0 via Lagrange interpolation over GF(prime)."""
    _validate_prime(prime)
    validated = _validate_shares(shares, prime)

    secret = 0
    lagrange_basis = []
    for i, (x_i, y_i) in enumerate(validated):
        num = 1
        den = 1
        for j, (x_j, _) in enumerate(validated):
            if i == j:
                continue
            num = (num * (-x_j)) % prime
            den = (den * (x_i - x_j)) % prime
        lambda_0 = (num * pow(den, -1, prime)) % prime
        term = (y_i * lambda_0) % prime
        secret = (secret + term) % prime
        lagrange_basis.append({
            "x": x_i,
            "y": y_i,
            "lambda_0": lambda_0,
            "term": term,
        })

    return {
        "secret": secret,
        "prime": prime,
        "shares_used": len(validated),
        "lagrange_basis": lagrange_basis,
    }


def split_text_secret(
    secret_text: str,
    threshold: int,
    num_shares: int,
    prime: int = TEXT_PRIME,
) -> dict:
    """Split a UTF-8 text secret (up to 64 bytes) into Shamir shares."""
    if not isinstance(secret_text, str) or not secret_text:
        raise ValueError("secret_text must be a non-empty string")
    secret_bytes = secret_text.encode("utf-8")
    if len(secret_bytes) > MAX_TEXT_BYTES:
        raise ValueError(f"secret_text must be at most {MAX_TEXT_BYTES} UTF-8 bytes")

    secret_int = int.from_bytes(secret_bytes, "big")
    res = split_secret(secret_int, threshold, num_shares, prime=prime)
    return {
        "prime_hex": hex(prime)[2:],
        "threshold": threshold,
        "num_shares": num_shares,
        "byte_length": len(secret_bytes),
        "shares": [{"x": s["x"], "y_hex": hex(s["y"])[2:]} for s in res["shares"]],
    }


def reconstruct_text_secret(
    shares: list[tuple[int, int]],
    prime: int = TEXT_PRIME,
    byte_length: int | None = None,
) -> dict:
    """Reconstruct a UTF-8 text secret from Shamir shares."""
    res = reconstruct_secret(shares, prime=prime)
    secret_int = res["secret"]
    min_len = max(1, (secret_int.bit_length() + 7) // 8)
    target_len = max(min_len, byte_length) if byte_length is not None else min_len
    raw = secret_int.to_bytes(target_len, "big")
    return {
        "secret_text": raw.decode("utf-8", errors="replace"),
        "secret_hex": raw.hex(),
        "shares_used": res["shares_used"],
    }
