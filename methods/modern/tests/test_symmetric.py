import pytest
from methods.modern.symmetric import (
    add_round_key,
    encrypt,
    decrypt,
    generate_key,
    generate_iv,
    pkcs7_pad,
    pkcs7_unpad,
    encrypt_with_new_key,
    encrypt_block,
    decrypt_block,
    key_expansion,
    sub_bytes,
    inv_sub_bytes,
    shift_rows,
    inv_shift_rows,
    mix_columns,
    inv_mix_columns,
    sub_word,
    rot_word,
    xtime,
    mul_gf,
    SBOX,
    INV_SBOX,
    BLOCK_SIZE,
)


def test_add_round_key_known_vector():
    """Test add_round_key against a known vector with specific state and key values."""
    input_state = [0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff]
    round_key   = [0x10, 0x21, 0x32, 0x43, 0x54, 0x65, 0x76, 0x87, 0x98, 0xa9, 0xba, 0xcb, 0xdc, 0xed, 0xfe, 0x0f]
    expected    = [0x10, 0x30, 0x10, 0x70, 0x10, 0x30, 0x10, 0xf0, 0x10, 0x30, 0x10, 0x70, 0x10, 0x30, 0x10, 0xf0]

    result = add_round_key(input_state, round_key)
    assert result == expected
    assert len(result) == BLOCK_SIZE


def test_add_round_key_fips197_column_major_kat():
    """Test add_round_key with FIPS 197 Appendix B Round 0 state and round key."""
    # FIPS 197 Appendix B Input State in flat byte order
    input_state = [
        0x32, 0x43, 0xf6, 0xa8,
        0x88, 0x5a, 0x30, 0x8d,
        0x31, 0x31, 0x98, 0xa2,
        0xe0, 0x37, 0x07, 0x34,
    ]
    # Round Key 0 in column-major order matching AES block structure
    round_key = [
        0x2b, 0x7e, 0x15, 0x16,
        0x28, 0xae, 0xd2, 0xa6,
        0xab, 0xf7, 0x15, 0x88,
        0x09, 0xcf, 0x4f, 0x3c,
    ]
    # Result of byte-wise XOR state ^ round_key
    expected_state = [
        0x19, 0x3d, 0xe3, 0xbe,
        0xa0, 0xf4, 0xe2, 0x2b,
        0x9a, 0xc6, 0x8d, 0x2a,
        0xe9, 0xf8, 0x48, 0x08,
    ]

    result = add_round_key(input_state, round_key)
    assert result == expected_state


def test_add_round_key_identity_property():
    """Test that XOR with a zero round key preserves state unchanged."""
    state = [0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff]
    zero_key = [0x00] * BLOCK_SIZE

    result = add_round_key(state, zero_key)
    assert result == state


def test_add_round_key_involution_property():
    """Test that applying add_round_key twice with the same key returns the original state."""
    state = [0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef, 0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10]
    round_key = [0x0f, 0x1e, 0x2d, 0x3c, 0x4b, 0x5a, 0x69, 0x78, 0x87, 0x96, 0xa5, 0xb4, 0xc3, 0xd2, 0xe1, 0xf0]

    once = add_round_key(state, round_key)
    twice = add_round_key(once, round_key)

    assert once != state
    assert twice == state


def test_add_round_key_self_xor_zeros():
    """Test that XORing state with itself produces all zeros."""
    state = [0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0x0f, 0xed, 0xcb, 0xa9, 0x87, 0x65, 0x43, 0x21]

    result = add_round_key(state, state)
    assert result == [0x00] * BLOCK_SIZE


def test_add_round_key_bit_complement():
    """Test that XORing state with all 0xFF round key inverts all bits."""
    state = [0x00, 0x0f, 0xf0, 0xff, 0x55, 0xaa, 0x33, 0xcc, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0]
    ones_key = [0xff] * BLOCK_SIZE

    expected = [b ^ 0xff for b in state]
    result = add_round_key(state, ones_key)
    assert result == expected


def test_add_round_key_edge_cases():
    """Test add_round_key with boundary inputs (all zeros, all 0xFF)."""
    zeros = [0x00] * BLOCK_SIZE
    ones = [0xff] * BLOCK_SIZE

    assert add_round_key(zeros, zeros) == zeros
    assert add_round_key(ones, ones) == zeros
    assert add_round_key(zeros, ones) == ones


def test_pkcs7_padding():
    data = b"Hello"
    padded = pkcs7_pad(data)
    assert len(padded) % BLOCK_SIZE == 0
    assert padded == b"Hello\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b"
    unpadded = pkcs7_unpad(padded)
    assert unpadded == data


def test_pkcs7_unpad_invalid_bytes():
    with pytest.raises(ValueError, match="Invalid PKCS7 padding bytes"):
        pkcs7_unpad(b"Hello\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0a")


def test_pkcs7_unpad_invalid_value():
    with pytest.raises(ValueError, match="Invalid PKCS7 padding value"):
        pkcs7_unpad(b"Hello\x11\x11\x11\x11\x11\x11\x11\x11\x11\x11\x11")

    with pytest.raises(ValueError, match="Invalid PKCS7 padding value"):
        pkcs7_unpad(b"Hello\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00")


def test_pkcs7_unpad_empty_and_unaligned_data():
    with pytest.raises(ValueError, match="Invalid PKCS7 padding value"):
        pkcs7_unpad(b"")

    with pytest.raises(ValueError, match="Invalid PKCS7 padding value"):
        pkcs7_unpad(b"unaligned_data")


def test_encrypt_decrypt():
    message = "Secret message"
    key = generate_key()
    iv = generate_iv()

    ciphertext = encrypt(message, key, iv)
    assert isinstance(ciphertext, bytes)
    assert len(ciphertext) > 0

    plaintext = decrypt(ciphertext, key, iv)
    assert plaintext == message


def test_encrypt_empty_message():
    message = ""
    key = generate_key()
    iv = generate_iv()

    ciphertext = encrypt(message, key, iv)
    plaintext = decrypt(ciphertext, key, iv)
    assert plaintext == message


def test_kat_aes_256_cbc():
    key = bytes([i for i in range(32)])
    iv = bytes([i for i in range(16)])
    message = "Known answer test for AES-256 CBC"

    expected_ciphertext = bytes.fromhex(
        "0677792407c396879dfe465ca9958063813e3616b4faaf11c021e2b563ed9b5361a9e1c330a6dee3feabdc49bb8a1f70"
    )

    ciphertext = encrypt(message, key, iv)
    assert ciphertext == expected_ciphertext

    plaintext = decrypt(expected_ciphertext, key, iv)
    assert plaintext == message


def test_encrypt_with_new_key():
    message = "Test new key generation"
    ciphertext, key, iv = encrypt_with_new_key(message)

    assert len(key) == 32
    assert len(iv) == 16
    assert isinstance(ciphertext, bytes)

    plaintext = decrypt(ciphertext, key, iv)
    assert plaintext == message


def test_single_block_encryption_decryption():
    key = generate_key()
    block = bytes([i for i in range(16)])
    round_keys = key_expansion(key)

    encrypted_block = encrypt_block(block, round_keys)
    assert len(encrypted_block) == 16
    assert encrypted_block != block

    decrypted_block = decrypt_block(encrypted_block, round_keys)
    assert decrypted_block == block


def test_key_expansion_invalid_key_length():
    with pytest.raises(ValueError, match="Key length must be 16, 24, or 32 bytes"):
        key_expansion(b"12345")


def test_sub_bytes_known_state():
    input_state = [0x00, 0x01, 0x02, 0x0f, 0x10, 0x53, 0xff, 0x80, 0x00, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde]
    expected_output = [SBOX[b] for b in input_state]

    output_state = sub_bytes(input_state)
    assert output_state == expected_output


def test_sub_bytes_inv_sub_bytes_roundtrip():
    input_state = list(range(16))
    sub_state = sub_bytes(input_state)
    restored_state = inv_sub_bytes(sub_state)
    assert restored_state == input_state


def test_rot_word():
    word = [0x01, 0x02, 0x03, 0x04]
    rotated = rot_word(word)
    assert rotated == [0x02, 0x03, 0x04, 0x01]


def test_sub_word():
    word = [0x00, 0x01, 0x02, 0x03]
    expected = [SBOX[0], SBOX[1], SBOX[2], SBOX[3]]
    assert sub_word(word) == expected


def test_xtime_matches_mul_gf():
    for byte_val in range(256):
        assert xtime(byte_val) == mul_gf(byte_val, 2)
