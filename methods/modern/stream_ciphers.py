"""One-Time Pad (OTP) and ChaCha20 (RFC 8439) stream ciphers in pure Python.

Implements:
- One-Time Pad key generation, encryption, and decryption
- ChaCha20 quarter-round, block function, keystream generator, and XOR stream cipher
"""

import secrets
import struct

CHACHA20_CONSTANTS = (0x61707865, 0x3320646E, 0x79622D32, 0x6B206574)
_MASK32 = 0xFFFFFFFF


def _to_bytes(data: str | bytes, name: str) -> bytes:
    """Convert str or bytes-like input into immutable bytes."""
    if isinstance(data, str):
        return data.encode("utf-8")
    if isinstance(data, (bytes, bytearray)):
        return bytes(data)
    raise TypeError(f"{name} must be str or bytes")


def _rotl32(value: int, shift: int) -> int:
    """Rotate a 32-bit unsigned integer left by shift bits."""
    return ((value << shift) & _MASK32) | (value >> (32 - shift))


def otp_generate_key(length: int) -> bytes:
    """Generate a cryptographically random One-Time Pad key of `length` bytes."""
    if not isinstance(length, int) or isinstance(length, bool):
        raise TypeError("length must be an integer")
    if length < 1:
        raise ValueError("length must be at least 1")
    return secrets.token_bytes(length)


def otp_encrypt(plaintext: str | bytes, key: bytes | str) -> bytes:
    """Encrypt plaintext using One-Time Pad XOR with a key at least as long as plaintext."""
    pt_bytes = _to_bytes(plaintext, "plaintext")
    key_bytes = _to_bytes(key, "key")
    if len(key_bytes) == 0:
        raise ValueError("OTP key cannot be empty")
    if len(key_bytes) < len(pt_bytes):
        raise ValueError("OTP key must be at least as long as the plaintext")
    return bytes(p_byte ^ k_byte for p_byte, k_byte in zip(pt_bytes, key_bytes))


def otp_decrypt(ciphertext: bytes, key: bytes | str) -> bytes:
    """Decrypt One-Time Pad ciphertext bytes using the matching key."""
    if not isinstance(ciphertext, (bytes, bytearray)):
        raise TypeError("ciphertext must be bytes")
    ct_bytes = bytes(ciphertext)
    key_bytes = _to_bytes(key, "key")
    if len(key_bytes) == 0:
        raise ValueError("OTP key cannot be empty")
    if len(key_bytes) < len(ct_bytes):
        raise ValueError("OTP key must be at least as long as the ciphertext")
    return bytes(c_byte ^ k_byte for c_byte, k_byte in zip(ct_bytes, key_bytes))


def chacha20_quarter_round(
    state: list[int],
    idx_a: int,
    idx_b: int,
    idx_c: int,
    idx_d: int,
) -> None:
    """Apply the ChaCha20 quarter-round operation in-place on 4 state words."""
    state[idx_a] = (state[idx_a] + state[idx_b]) & _MASK32
    state[idx_d] = _rotl32(state[idx_d] ^ state[idx_a], 16)

    state[idx_c] = (state[idx_c] + state[idx_d]) & _MASK32
    state[idx_b] = _rotl32(state[idx_b] ^ state[idx_c], 12)

    state[idx_a] = (state[idx_a] + state[idx_b]) & _MASK32
    state[idx_d] = _rotl32(state[idx_d] ^ state[idx_a], 8)

    state[idx_c] = (state[idx_c] + state[idx_d]) & _MASK32
    state[idx_b] = _rotl32(state[idx_b] ^ state[idx_c], 7)


def _validate_chacha20_params(key: bytes, nonce: bytes, counter: int) -> None:
    """Validate ChaCha20 key (32 bytes), nonce (12 bytes), and 32-bit counter."""
    if not isinstance(key, (bytes, bytearray)) or len(key) != 32:
        raise ValueError("ChaCha20 key must be exactly 32 bytes")
    if not isinstance(nonce, (bytes, bytearray)) or len(nonce) != 12:
        raise ValueError("ChaCha20 nonce must be exactly 12 bytes")
    if not isinstance(counter, int) or isinstance(counter, bool):
        raise TypeError("counter must be an integer")
    if counter < 0 or counter >= 2**32:
        raise ValueError("counter must be a 32-bit unsigned integer (0 <= counter < 2^32)")


def chacha20_block(key: bytes, counter: int, nonce: bytes) -> bytes:
    """Compute a 64-byte ChaCha20 keystream block per RFC 8439."""
    _validate_chacha20_params(key, nonce, counter)
    key_words = struct.unpack("<8I", bytes(key))
    nonce_words = struct.unpack("<3I", bytes(nonce))

    initial_state = [
        *CHACHA20_CONSTANTS,
        *key_words,
        counter,
        *nonce_words,
    ]
    working = list(initial_state)

    for _ in range(10):
        # Column rounds
        chacha20_quarter_round(working, 0, 4, 8, 12)
        chacha20_quarter_round(working, 1, 5, 9, 13)
        chacha20_quarter_round(working, 2, 6, 10, 14)
        chacha20_quarter_round(working, 3, 7, 11, 15)
        # Diagonal rounds
        chacha20_quarter_round(working, 0, 5, 10, 15)
        chacha20_quarter_round(working, 1, 6, 11, 12)
        chacha20_quarter_round(working, 2, 7, 8, 13)
        chacha20_quarter_round(working, 3, 4, 9, 14)

    output_words = [(working[i] + initial_state[i]) & _MASK32 for i in range(16)]
    return struct.pack("<16I", *output_words)


def chacha20_keystream(
    key: bytes,
    nonce: bytes,
    length: int,
    counter: int = 1,
) -> bytes:
    """Generate `length` bytes of ChaCha20 keystream starting at `counter`."""
    _validate_chacha20_params(key, nonce, counter)
    if not isinstance(length, int) or isinstance(length, bool) or length < 0:
        raise ValueError("length must be a non-negative integer")
    if length == 0:
        return b""

    blocks_needed = (length + 63) // 64
    if counter + blocks_needed > 2**32:
        raise ValueError("ChaCha20 block counter overflow")

    chunks = [
        chacha20_block(key, counter + block_idx, nonce)
        for block_idx in range(blocks_needed)
    ]
    return b"".join(chunks)[:length]


def chacha20_encrypt(
    plaintext: str | bytes,
    key: bytes,
    nonce: bytes,
    counter: int = 1,
) -> bytes:
    """Encrypt plaintext using ChaCha20 stream cipher."""
    pt_bytes = _to_bytes(plaintext, "plaintext")
    stream = chacha20_keystream(key, nonce, len(pt_bytes), counter=counter)
    return bytes(p_byte ^ s_byte for p_byte, s_byte in zip(pt_bytes, stream))


def chacha20_decrypt(
    ciphertext: bytes,
    key: bytes,
    nonce: bytes,
    counter: int = 1,
) -> bytes:
    """Decrypt ciphertext bytes using ChaCha20 stream cipher."""
    if not isinstance(ciphertext, (bytes, bytearray)):
        raise TypeError("ciphertext must be bytes")
    ct_bytes = bytes(ciphertext)
    stream = chacha20_keystream(key, nonce, len(ct_bytes), counter=counter)
    return bytes(c_byte ^ s_byte for c_byte, s_byte in zip(ct_bytes, stream))


def pick_keys() -> tuple[bytes, bytes]:
    """Generate a random 32-byte ChaCha20 key and 12-byte nonce."""
    return secrets.token_bytes(32), secrets.token_bytes(12)


def main() -> None:
    """CLI demonstration of OTP and ChaCha20 stream ciphers."""
    message = input("Enter a message to encrypt: ")
    otp_key = otp_generate_key(max(1, len(message.encode("utf-8"))))
    otp_ct = otp_encrypt(message, otp_key)
    otp_pt = otp_decrypt(otp_ct, otp_key).decode("utf-8")
    print(f"OTP Ciphertext (hex): {otp_ct.hex()}")
    print(f"OTP Decrypted: {otp_pt}")

    chacha_key, chacha_nonce = pick_keys()
    chacha_ct = chacha20_encrypt(message, chacha_key, chacha_nonce)
    chacha_pt = chacha20_decrypt(chacha_ct, chacha_key, chacha_nonce).decode("utf-8")
    print(f"ChaCha20 Ciphertext (hex): {chacha_ct.hex()}")
    print(f"ChaCha20 Decrypted: {chacha_pt}")


if __name__ == "__main__":
    main()
