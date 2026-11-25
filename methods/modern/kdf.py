"""RFC 5869 HMAC-based Extract-and-Expand Key Derivation Function (HKDF-SHA256)."""

import hashlib
import hmac

HASH_LEN = 32


def hkdf_extract(salt: bytes, ikm: bytes) -> bytes:
    """HKDF-Extract: PRK = HMAC-SHA256(salt, IKM)."""
    effective_salt = salt if salt else b"\x00" * HASH_LEN
    return hmac.new(effective_salt, ikm, hashlib.sha256).digest()


def hkdf_expand(prk: bytes, info: bytes, length: int) -> tuple[bytes, list[str]]:
    """HKDF-Expand: derive output keying material of length bytes and return T(i) blocks."""
    if length < 1 or length > 255 * HASH_LEN:
        raise ValueError(f"length must be in 1..{255 * HASH_LEN}")
    if len(prk) < HASH_LEN:
        raise ValueError("prk must be at least 32 bytes")

    blocks: list[bytes] = []
    t_prev = b""
    num_blocks = (length + HASH_LEN - 1) // HASH_LEN
    for counter in range(1, num_blocks + 1):
        t_prev = hmac.new(prk, t_prev + info + bytes([counter]), hashlib.sha256).digest()
        blocks.append(t_prev)

    okm = b"".join(blocks)[:length]
    return okm, [b.hex() for b in blocks]


def hkdf_derive(
    ikm: bytes,
    salt: bytes = b"",
    info: bytes = b"",
    length: int = 32,
) -> dict:
    """Run full RFC 5869 HKDF Extract + Expand and return intermediate PRK, OKM, and blocks."""
    if not isinstance(ikm, (bytes, bytearray)) or not ikm:
        raise ValueError("ikm must be non-empty bytes")
    prk = hkdf_extract(bytes(salt), bytes(ikm))
    okm, blocks = hkdf_expand(prk, bytes(info), length)
    return {
        "prk_hex": prk.hex(),
        "okm_hex": okm.hex(),
        "length": length,
        "blocks": blocks,
    }
