"""Authenticated Encryption with Associated Data (AES-256-GCM) in pure Python."""

import hmac
import secrets
from methods.modern.symmetric import encrypt_block, key_expansion

GCM_BLOCK_SIZE = 16
GCM_NONCE_SIZE = 12
GCM_R = 0xE1000000000000000000000000000000


def _gf128_mul(x_int: int, y_int: int) -> int:
    """Multiply two 128-bit elements in GF(2^128) per NIST SP 800-38D."""
    z_val = 0
    v_val = y_int
    for i in range(128):
        if (x_int >> (127 - i)) & 1:
            z_val ^= v_val
        lsb = v_val & 1
        v_val >>= 1
        if lsb:
            v_val ^= GCM_R
    return z_val


def _ghash_update(acc: int, h_int: int, data: bytes) -> int:
    """Process arbitrary-length bytes through GHASH with zero-padding."""
    for offset in range(0, len(data), GCM_BLOCK_SIZE):
        block = data[offset:offset + GCM_BLOCK_SIZE].ljust(GCM_BLOCK_SIZE, b"\x00")
        acc = _gf128_mul(acc ^ int.from_bytes(block, "big"), h_int)
    return acc


def _compute_ghash(h_bytes: bytes, aad: bytes, ciphertext: bytes) -> bytes:
    """Compute GHASH(H, AAD, C) per NIST SP 800-38D."""
    h_int = int.from_bytes(h_bytes, "big")
    acc = _ghash_update(0, h_int, aad)
    acc = _ghash_update(acc, h_int, ciphertext)
    lengths_block = (len(aad) * 8).to_bytes(8, "big") + (len(ciphertext) * 8).to_bytes(8, "big")
    acc = _gf128_mul(acc ^ int.from_bytes(lengths_block, "big"), h_int)
    return acc.to_bytes(GCM_BLOCK_SIZE, "big")


def _aes_ctr_blocks(round_keys: list[bytes], j0: bytes, payload: bytes) -> bytes:
    """Apply GCTR starting from inc32(J0) over payload."""
    prefix = j0[:12]
    counter = int.from_bytes(j0[12:], "big")
    out: list[bytes] = []
    for offset in range(0, len(payload), GCM_BLOCK_SIZE):
        counter = (counter + 1) & 0xFFFFFFFF
        ctr_block = prefix + counter.to_bytes(4, "big")
        keystream = encrypt_block(ctr_block, round_keys)
        chunk = payload[offset:offset + GCM_BLOCK_SIZE]
        masked = int.from_bytes(chunk, "big") ^ int.from_bytes(keystream[:len(chunk)], "big")
        out.append(masked.to_bytes(len(chunk), "big"))
    return b"".join(out)


def _validate_key_and_nonce(key: bytes, nonce: bytes | None) -> tuple[bytes, bytes]:
    """Validate 16/24/32-byte AES key and 12-byte GCM nonce."""
    if not isinstance(key, (bytes, bytearray)) or len(key) not in (16, 24, 32):
        raise ValueError("key must be 16, 24, or 32 bytes")
    nonce_bytes = secrets.token_bytes(GCM_NONCE_SIZE) if nonce is None else bytes(nonce)
    if len(nonce_bytes) != GCM_NONCE_SIZE:
        raise ValueError("nonce must be 12 bytes")
    return bytes(key), nonce_bytes


def aes_gcm_encrypt(
    plaintext: str | bytes,
    key: bytes,
    nonce: bytes | None = None,
    aad: bytes = b"",
) -> dict:
    """Encrypt and authenticate plaintext + AAD using AES-GCM."""
    key_bytes, nonce_bytes = _validate_key_and_nonce(key, nonce)
    pt_bytes = plaintext.encode("utf-8") if isinstance(plaintext, str) else bytes(plaintext)
    aad_bytes = bytes(aad)

    round_keys = key_expansion(key_bytes)
    h_bytes = encrypt_block(b"\x00" * GCM_BLOCK_SIZE, round_keys)
    j0 = nonce_bytes + b"\x00\x00\x00\x01"

    ciphertext = _aes_ctr_blocks(round_keys, j0, pt_bytes)
    s_tag = _compute_ghash(h_bytes, aad_bytes, ciphertext)
    j0_mask = encrypt_block(j0, round_keys)
    tag = (int.from_bytes(s_tag, "big") ^ int.from_bytes(j0_mask, "big")).to_bytes(16, "big")

    return {
        "ciphertext_hex": ciphertext.hex(),
        "tag_hex": tag.hex(),
        "nonce_hex": nonce_bytes.hex(),
        "key_hex": key_bytes.hex(),
        "aad_hex": aad_bytes.hex(),
    }


def _compute_gcm_tag(round_keys: list[bytes], j0: bytes, aad: bytes, ciphertext: bytes) -> bytes:
    """Compute 16-byte AES-GCM authentication tag."""
    h_bytes = encrypt_block(b"\x00" * GCM_BLOCK_SIZE, round_keys)
    s_tag = _compute_ghash(h_bytes, aad, ciphertext)
    j0_mask = encrypt_block(j0, round_keys)
    return (int.from_bytes(s_tag, "big") ^ int.from_bytes(j0_mask, "big")).to_bytes(16, "big")


def aes_gcm_decrypt(
    ciphertext: bytes,
    key: bytes,
    nonce: bytes,
    tag: bytes,
    aad: bytes = b"",
) -> dict:
    """Verify GHASH tag and decrypt AES-GCM ciphertext."""
    key_bytes, nonce_bytes = _validate_key_and_nonce(key, nonce)
    if not isinstance(tag, (bytes, bytearray)) or len(tag) != GCM_BLOCK_SIZE:
        raise ValueError("tag must be 16 bytes")

    ct_bytes = bytes(ciphertext)
    round_keys = key_expansion(key_bytes)
    j0 = nonce_bytes + b"\x00\x00\x00\x01"
    expected_tag = _compute_gcm_tag(round_keys, j0, bytes(aad), ct_bytes)

    if not hmac.compare_digest(expected_tag, bytes(tag)):
        return {
            "valid": False,
            "plaintext": None,
            "error": "Authentication tag mismatch — ciphertext or AAD was tampered!",
        }

    pt_bytes = _aes_ctr_blocks(round_keys, j0, ct_bytes)
    return {
        "valid": True,
        "plaintext": pt_bytes.decode("utf-8", errors="replace"),
        "plaintext_hex": pt_bytes.hex(),
    }
