"""Symmetric Encryption Module (AES-256) in pure Python.

This module provides symmetric encryption and decryption functionality
using manual AES-256 in CBC mode with PKCS7 padding.
No external libraries are used.
"""

import os
import secrets

# AES Constants
BLOCK_SIZE = 16
KEY_SIZE = 32
EXPANDED_KEY_WORDS = 60
KEY_WORDS_HALF = 4

SBOX = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
]

INV_SBOX = [
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
]

RCON = [
    0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36
]

def sub_word(word: list[int]) -> list[int]:
    """Substitute bytes in a 4-byte word using the S-box."""
    return [SBOX[b] for b in word]

def rot_word(word: list[int]) -> list[int]:
    """Rotate a 4-byte word: shift left by 1 position."""
    return word[1:] + word[:1]

def key_expansion(key: bytes) -> list[list[int]]:
    """Expand the AES key into round keys. Supports 16, 24, and 32 byte keys."""
    nk = len(key) // 4
    if len(key) not in {16, 24, 32} or len(key) % 4 != 0:
        raise ValueError("Key length must be 16, 24, or 32 bytes")

    words = [list(key[i:i+4]) for i in range(0, len(key), 4)]

    # Calculate expanded key words based on key size
    # 16 bytes -> 44 words (10 rounds)
    # 24 bytes -> 52 words (12 rounds)
    # 32 bytes -> 60 words (14 rounds)
    rounds = nk + 6
    expanded_key_words = (rounds + 1) * 4

    for idx in range(nk, expanded_key_words):
        temp = words[-1].copy()
        if not idx % nk:
            temp = sub_word(rot_word(temp))
            temp[0] ^= RCON[idx // nk]
        elif nk > 6 and idx % nk == 4:
            temp = sub_word(temp)

        word_prev = words[-nk]
        new_word = [temp[j] ^ word_prev[j] for j in range(4)]
        words.append(new_word)

    flat_bytes = []
    for w in words:
        flat_bytes.extend(w)
    return [flat_bytes[i:i+BLOCK_SIZE] for i in range(0, len(flat_bytes), BLOCK_SIZE)]

def add_round_key(state: list[int], round_key: list[int]) -> list[int]:
    """XOR state with the round key."""
    return [state[i] ^ round_key[i] for i in range(BLOCK_SIZE)]

def sub_bytes(state: list[int]) -> list[int]:
    """Substitute state bytes using the S-box."""
    return [SBOX[b] for b in state]

def inv_sub_bytes(state: list[int]) -> list[int]:
    """Substitute state bytes using the Inverse S-box."""
    return [INV_SBOX[b] for b in state]

def shift_rows(state: list[int]) -> list[int]:
    """Shift state rows to the left by row offsets."""
    return [
        state[0], state[5], state[10], state[15],
        state[4], state[9], state[14], state[3],
        state[8], state[13], state[2], state[7],
        state[12], state[1], state[6], state[11]
    ]

def inv_shift_rows(state: list[int]) -> list[int]:
    """Shift state rows to the right by row offsets."""
    return [
        state[0], state[13], state[10], state[7],
        state[4], state[1], state[14], state[11],
        state[8], state[5], state[2], state[15],
        state[12], state[9], state[6], state[3]
    ]

def xtime(val: int) -> int:
    """Perform GF(2^8) multiplication by 2."""
    return (((val << 1) ^ 0x1B) & 0xFF) if (val & 0x80) else (val << 1)

def mul_gf(val_a: int, val_b: int) -> int:
    """Perform GF(2^8) multiplication of two bytes."""
    res = 0
    a_shifted = val_a
    b_shifted = val_b
    for _ in range(8):
        if b_shifted & 1:
            res ^= a_shifted
        hi_bit_set = a_shifted & 0x80
        a_shifted = (a_shifted << 1) & 0xFF
        if hi_bit_set:
            a_shifted ^= 0x1B
        b_shifted >>= 1
    return res

def mix_columns(state: list[int]) -> list[int]:
    """Mix the columns of the state matrix."""
    new_state = [0] * BLOCK_SIZE
    for i in range(4):
        c = state[i*4 : i*4 + 4]
        new_state[i*4] =     xtime(c[0]) ^ (xtime(c[1]) ^ c[1]) ^ c[2] ^ c[3]
        new_state[i*4 + 1] = c[0] ^ xtime(c[1]) ^ (xtime(c[2]) ^ c[2]) ^ c[3]
        new_state[i*4 + 2] = c[0] ^ c[1] ^ xtime(c[2]) ^ (xtime(c[3]) ^ c[3])
        new_state[i*4 + 3] = (xtime(c[0]) ^ c[0]) ^ c[1] ^ c[2] ^ xtime(c[3])
    return new_state

def inv_mix_columns(state: list[int]) -> list[int]:
    """Mix the columns of the state matrix using inverse coefficients."""
    new_state = [0] * BLOCK_SIZE
    for i in range(4):
        c = state[i*4 : i*4 + 4]
        val_0 = mul_gf(c[0], 14) ^ mul_gf(c[1], 11) ^ mul_gf(c[2], 13) ^ mul_gf(c[3], 9)
        val_1 = mul_gf(c[0], 9) ^ mul_gf(c[1], 14) ^ mul_gf(c[2], 11) ^ mul_gf(c[3], 13)
        val_2 = mul_gf(c[0], 13) ^ mul_gf(c[1], 9) ^ mul_gf(c[2], 14) ^ mul_gf(c[3], 11)
        val_3 = mul_gf(c[0], 11) ^ mul_gf(c[1], 13) ^ mul_gf(c[2], 9) ^ mul_gf(c[3], 14)
        new_state[i*4]     = val_0
        new_state[i*4 + 1] = val_1
        new_state[i*4 + 2] = val_2
        new_state[i*4 + 3] = val_3
    return new_state

def encrypt_block(block: bytes, round_keys: list[list[int]]) -> bytes:
    """Encrypt a single 16-byte block using AES."""
    rounds = len(round_keys) - 1
    state = list(block)
    state = add_round_key(state, round_keys[0])
    for r in range(1, rounds):
        state = sub_bytes(state)
        state = shift_rows(state)
        state = mix_columns(state)
        state = add_round_key(state, round_keys[r])
    state = sub_bytes(state)
    state = shift_rows(state)
    state = add_round_key(state, round_keys[rounds])
    return bytes(state)

def decrypt_block(block: bytes, round_keys: list[list[int]]) -> bytes:
    """Decrypt a single 16-byte block using AES."""
    rounds = len(round_keys) - 1
    state = list(block)
    state = add_round_key(state, round_keys[rounds])
    state = inv_shift_rows(state)
    state = inv_sub_bytes(state)
    for r in range(rounds - 1, 0, -1):
        state = add_round_key(state, round_keys[r])
        state = inv_mix_columns(state)
        state = inv_shift_rows(state)
        state = inv_sub_bytes(state)
    state = add_round_key(state, round_keys[0])
    return bytes(state)

def pkcs7_pad(data: bytes) -> bytes:
    """Apply PKCS7 padding to raw bytes."""
    pad_len = BLOCK_SIZE - (len(data) % BLOCK_SIZE)
    return data + bytes([pad_len] * pad_len)

def pkcs7_unpad(data: bytes) -> bytes:
    """Remove PKCS7 padding from raw bytes."""
    pad_len = data[-1]
    if pad_len < 1 or pad_len > BLOCK_SIZE:
        raise ValueError("Invalid PKCS7 padding value")
    for b in data[-pad_len:]:
        if b != pad_len:
            raise ValueError("Invalid PKCS7 padding bytes")
    return data[:-pad_len]

def generate_key() -> bytes:
    """Generate a random 256-bit (32 bytes) key for AES-256."""
    return secrets.token_bytes(KEY_SIZE)

def generate_iv() -> bytes:
    """Generate a random 128-bit (16 bytes) initialization vector."""
    return secrets.token_bytes(BLOCK_SIZE)

def encrypt(message: str, key: bytes, iv: bytes) -> bytes:
    """Encrypt a message string using AES-256-CBC with PKCS7 padding."""
    round_keys = key_expansion(key)
    padded_data = pkcs7_pad(message.encode('utf-8'))
    ciphertext = b""
    prev_block = iv
    for i in range(0, len(padded_data), BLOCK_SIZE):
        block = padded_data[i : i + BLOCK_SIZE]
        xor_block = bytes(x ^ y for x, y in zip(block, prev_block))
        enc_block = encrypt_block(xor_block, round_keys)
        ciphertext += enc_block
        prev_block = enc_block
    return ciphertext

def decrypt(ciphertext: bytes, key: bytes, iv: bytes) -> str:
    """Decrypt ciphertext bytes using AES-256-CBC and remove PKCS7 padding."""
    round_keys = key_expansion(key)
    decrypted_data = b""
    prev_block = iv
    for i in range(0, len(ciphertext), BLOCK_SIZE):
        block = ciphertext[i : i + BLOCK_SIZE]
        dec_block = decrypt_block(block, round_keys)
        xor_block = bytes(x ^ y for x, y in zip(dec_block, prev_block))
        decrypted_data += xor_block
        prev_block = block
    unpadded_data = pkcs7_unpad(decrypted_data)
    return unpadded_data.decode('utf-8')

def encrypt_with_new_key(message: str) -> tuple[bytes, bytes, bytes]:
    """Encrypt a message with a newly generated key and IV."""
    key = generate_key()
    iv = generate_iv()
    ciphertext = encrypt(message, key, iv)
    return ciphertext, key, iv

def main():
    """Run symmetric encryption and decryption test."""
    message = "This is a Test"
    key = generate_key()
    iv = generate_iv()
    encrypted = encrypt(message, key, iv)
    print(f"Encrypted: {encrypted.hex()}")
    decrypted = decrypt(encrypted, key, iv)
    print(f"Decrypted: {decrypted}")

if __name__ == "__main__":
    main()
