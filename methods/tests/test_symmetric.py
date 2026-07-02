import pytest
from methods.modern.symmetric import (
    encrypt, decrypt, generate_key, generate_iv,
    pkcs7_pad, pkcs7_unpad, encrypt_with_new_key,
    encrypt_block, decrypt_block, key_expansion
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
