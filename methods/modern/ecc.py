"""Elliptic Curve Cryptography (secp256r1 / NIST P-256) in pure Python.

Implements:
- Elliptic curve point arithmetic over the prime field F_p (secp256r1)
- ECDH (Elliptic Curve Diffie-Hellman) key agreement
- ECDSA (Elliptic Curve Digital Signature Algorithm) with SHA-256
"""

import hashlib
import secrets

# NIST P-256 (secp256r1) domain parameters (FIPS 186-4 / SEC 2)
P256_P = 0xFFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF
P256_A = 0xFFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC
P256_B = 0x5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B
P256_GX = 0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296
P256_GY = 0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5
P256_G: tuple[int, int] = (P256_GX, P256_GY)
P256_N = 0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551

Point = tuple[int, int] | None


def _require_int(value: object, name: str) -> int:
    """Validate that value is a plain int (not bool)."""
    if not isinstance(value, int) or isinstance(value, bool):
        raise TypeError(f"{name} must be an integer")
    return value


def _validate_private_key(private_key: int) -> int:
    """Validate that a P-256 private scalar is in [1, P256_N - 1]."""
    _require_int(private_key, "private_key")
    if private_key < 1 or private_key >= P256_N:
        raise ValueError("private_key must be in [1, P256_N - 1]")
    return private_key


def _validate_public_point(point: object, name: str = "public_key") -> tuple[int, int]:
    """Validate that point is a non-infinity tuple on secp256r1."""
    if point is None:
        raise ValueError(f"{name} cannot be the point at infinity")
    if not isinstance(point, tuple) or len(point) != 2:
        raise TypeError(f"{name} must be a (x, y) tuple")
    x_coord, y_coord = point
    _require_int(x_coord, f"{name}[0]")
    _require_int(y_coord, f"{name}[1]")
    if not is_on_curve((x_coord, y_coord)):
        raise ValueError(f"{name} is not on the secp256r1 curve")
    return (x_coord, y_coord)


def _message_digest_int(message: str | bytes) -> int:
    """Hash a message with SHA-256 and return the digest as an integer."""
    if isinstance(message, str):
        data = message.encode("utf-8")
    elif isinstance(message, (bytes, bytearray)):
        data = bytes(message)
    else:
        raise TypeError("message must be str or bytes")
    return int.from_bytes(hashlib.sha256(data).digest(), "big")


def is_on_curve(point: Point) -> bool:
    """Return True if point is None (infinity) or satisfies y^2 = x^3 + ax + b (mod p)."""
    if point is None:
        return True
    x_coord, y_coord = point
    if x_coord < 0 or x_coord >= P256_P or y_coord < 0 or y_coord >= P256_P:
        return False
    lhs = (y_coord * y_coord) % P256_P
    rhs = (pow(x_coord, 3, P256_P) + P256_A * x_coord + P256_B) % P256_P
    return lhs == rhs


def point_add(point_p: Point, point_q: Point) -> Point:
    """Add two points on secp256r1."""
    if point_p is None:
        return point_q
    if point_q is None:
        return point_p

    x1, y1 = point_p
    x2, y2 = point_q

    if x1 == x2 and (y1 + y2) % P256_P == 0:
        return None

    if point_p == point_q:
        if y1 == 0:
            return None
        numerator = (3 * x1 * x1 + P256_A) % P256_P
        denominator = pow((2 * y1) % P256_P, -1, P256_P)
        slope = (numerator * denominator) % P256_P
    else:
        numerator = (y2 - y1) % P256_P
        denominator = pow((x2 - x1) % P256_P, -1, P256_P)
        slope = (numerator * denominator) % P256_P

    x3 = (slope * slope - x1 - x2) % P256_P
    y3 = (slope * (x1 - x3) - y1) % P256_P
    return (x3, y3)


def scalar_mult(scalar: int, point: Point) -> Point:
    """Multiply a point on secp256r1 by a non-negative integer scalar."""
    _require_int(scalar, "scalar")
    if scalar < 0:
        raise ValueError("scalar must be non-negative")
    if not is_on_curve(point):
        raise ValueError("point is not on the secp256r1 curve")
    if scalar == 0 or point is None:
        return None

    result: Point = None
    addend: Point = point
    k = scalar % P256_N
    while k > 0:
        if k & 1:
            result = point_add(result, addend)
        addend = point_add(addend, addend)
        k >>= 1
    return result


def pick_keys() -> tuple[int, tuple[int, int]]:
    """Generate a secp256r1 (private_key, public_key) pair."""
    private_key = secrets.randbelow(P256_N - 1) + 1
    public_key = derive_public_key(private_key)
    return private_key, public_key


def derive_public_key(private_key: int) -> tuple[int, int]:
    """Derive the secp256r1 public key point Q = d * G from a private scalar."""
    d_val = _validate_private_key(private_key)
    point = scalar_mult(d_val, P256_G)
    if point is None:
        raise ValueError("Derived public key is point at infinity")
    return point


def ecdh_shared_secret(
    private_key: int,
    peer_public_key: tuple[int, int],
) -> tuple[tuple[int, int], str]:
    """Compute ECDH shared point S = d * Q_peer and SHA-256 derived 32-byte key hex."""
    d_val = _validate_private_key(private_key)
    peer_point = _validate_public_point(peer_public_key, "peer_public_key")
    shared_point = scalar_mult(d_val, peer_point)
    if shared_point is None:
        raise ValueError("ECDH shared point cannot be the point at infinity")
    shared_key_hex = hashlib.sha256(shared_point[0].to_bytes(32, "big")).hexdigest()
    return shared_point, shared_key_hex


def ecdsa_sign(
    message: str | bytes,
    private_key: int,
    nonce_k: int | None = None,
) -> tuple[int, int]:
    """Sign a message with ECDSA (secp256r1 / SHA-256), returning (r, s)."""
    d_val = _validate_private_key(private_key)
    digest_int = _message_digest_int(message)

    if nonce_k is not None:
        _require_int(nonce_k, "nonce_k")
        if nonce_k < 1 or nonce_k >= P256_N:
            raise ValueError("nonce_k must be in [1, P256_N - 1]")
        r_point = scalar_mult(nonce_k, P256_G)
        if r_point is None:
            raise ValueError("nonce_k produced point at infinity")
        r_val = r_point[0] % P256_N
        s_val = (pow(nonce_k, -1, P256_N) * (digest_int + r_val * d_val)) % P256_N
        if r_val == 0 or s_val == 0:
            raise ValueError("nonce_k produced an invalid zero signature component")
        return (r_val, s_val)

    while True:
        k_val = secrets.randbelow(P256_N - 1) + 1
        r_point = scalar_mult(k_val, P256_G)
        if r_point is None:
            continue
        r_val = r_point[0] % P256_N
        if r_val == 0:
            continue
        s_val = (pow(k_val, -1, P256_N) * (digest_int + r_val * d_val)) % P256_N
        if s_val != 0:
            return (r_val, s_val)


def ecdsa_verify(
    message: str | bytes,
    signature: tuple[int, int],
    public_key: tuple[int, int],
) -> bool:
    """Verify an ECDSA (r, s) signature against a message and secp256r1 public key."""
    pub_point = _validate_public_point(public_key, "public_key")
    if not isinstance(signature, tuple) or len(signature) != 2:
        raise TypeError("signature must be a (r, s) tuple")
    r_val, s_val = signature
    _require_int(r_val, "signature[0]")
    _require_int(s_val, "signature[1]")

    if r_val < 1 or r_val >= P256_N or s_val < 1 or s_val >= P256_N:
        return False

    digest_int = _message_digest_int(message)
    w_val = pow(s_val, -1, P256_N)
    u1_val = (digest_int * w_val) % P256_N
    u2_val = (r_val * w_val) % P256_N

    check_point = point_add(scalar_mult(u1_val, P256_G), scalar_mult(u2_val, pub_point))
    if check_point is None:
        return False
    return (check_point[0] % P256_N) == r_val


def main() -> None:
    """CLI demonstration of secp256r1 ECDH and ECDSA."""
    alice_priv, alice_pub = pick_keys()
    bob_priv, bob_pub = pick_keys()

    _, alice_secret = ecdh_shared_secret(alice_priv, bob_pub)
    _, bob_secret = ecdh_shared_secret(bob_priv, alice_pub)
    print(f"ECDH Shared Secrets Match: {alice_secret == bob_secret}")
    print(f"Derived Key (SHA-256): {alice_secret}")

    message = input("Enter a message to sign with ECDSA: ")
    signature = ecdsa_sign(message, alice_priv)
    valid = ecdsa_verify(message, signature, alice_pub)
    print(f"Signature valid: {valid}")


if __name__ == "__main__":
    main()
