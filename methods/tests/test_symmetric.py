import pytest
from methods.modern.symmetric import (
    encrypt, decrypt, generate_key, generate_iv,
    pkcs7_pad, pkcs7_unpad, encrypt_with_new_key,
    encrypt_block, decrypt_block, key_expansion,
    xtime, mul_gf
)

def test_pkcs7_padding():
    data = b"Hello"
    padded = pkcs7_pad(data)
    assert len(padded) % 16 == 0
    assert padded == b"Hello\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b"
    unpadded = pkcs7_unpad(padded)
    assert unpadded == data

def test_pkcs7_unpad_invalid_bytes():
    with pytest.raises(ValueError, match="Invalid PKCS7 padding bytes"):
        pkcs7_unpad(b"Hello\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0a")

def test_pkcs7_unpad_invalid_value():
    with pytest.raises(ValueError, match="Invalid PKCS7 padding value"):
        pkcs7_unpad(b"Hello\x11")

    with pytest.raises(ValueError, match="Invalid PKCS7 padding value"):
        pkcs7_unpad(b"Hello\x00")

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
    """Known Answer Test for AES-256 in CBC mode."""
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

def test_kat_aes_256_cbc_large_message():
    """Known Answer Test for AES-256 in CBC mode with a larger message."""
    key = bytes([i for i in range(32, 64)])
    iv = bytes([i for i in range(16, 32)])
    message = "A" * 100

    expected_ciphertext = bytes.fromhex(
        "af2a4fd5a1e5e4ded6db731d778297947b69df614ce796a9dff2b46e77e65e9c12eecc8bd0a3c9fa9a7d707cc137ce735eeaa94cb389aeaae2027dffbb726fd95d14eba28938c9698bf13cddc49ea7844c2b4e4ceb37449d48d68fe1d5d41b53d0adc4f2f10f0a9971bea30c12b759be"
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
    """Test raw block encryption and decryption to ensure no data loss in core AES functions."""
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
        key_expansion(b"12345") # 5 bytes

def test_key_expansion_valid_key_lengths():
    # 16 bytes
    key16 = b"1" * 16
    assert len(key_expansion(key16)) > 0

    # 24 bytes
    key24 = b"1" * 24
    assert len(key_expansion(key24)) > 0

    # 32 bytes
    key32 = b"1" * 32
    assert len(key_expansion(key32)) > 0

def test_xtime_edge_cases_and_vectors():
    """Test xtime GF(2^8) multiplication by 2 with edge cases and known values."""
    # 0x00 -> 0x00
    assert xtime(0x00) == 0x00

    # 0x01 shifted left by 1 -> 0x02 (no MSB reduction)
    assert xtime(0x01) == 0x02

    # 0x57 * 2 in GF(2^8) (standard FIPS-197 / AES vector example)
    # 0x57 (01010111) -> << 1 = 10101110 (0xAE) without MSB reduction since MSB was 0
    assert xtime(0x57) == 0xAE

    # 0xAE * 2 in GF(2^8) (0xAE has MSB set: 10101110)
    # (0xAE << 1) ^ 0x1B & 0xFF -> (0x15C ^ 0x1B) & 0xFF -> 0x147 & 0xFF = 0x47
    assert xtime(0xAE) == 0x47

    # 0x7F boundary (MSB not set: 01111111) -> 0xFE
    assert xtime(0x7F) == 0xFE

    # 0x80 boundary (MSB set: 10000000) -> (0x100 ^ 0x1B) & 0xFF = 0x1B
    assert xtime(0x80) == 0x1B

    # 0x81 (MSB set: 10000001) -> (0x102 ^ 0x1B) & 0xFF = 0x19
    assert xtime(0x81) == 0x19

    # 0xFF (MSB set: 11111111) -> (0x1FE ^ 0x1B) & 0xFF = 0xE5
    assert xtime(0xFF) == 0xE5

def test_xtime_matches_mul_gf():
    """Verify xtime matches mul_gf(val, 2) for all byte values from 0 to 255."""
    for byte_val in range(256):
        assert xtime(byte_val) == mul_gf(byte_val, 2)
