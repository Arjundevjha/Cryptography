import pytest
from methods.historical.scytale import encrypt, decrypt

def test_scytale_invalid_diameter():
    with pytest.raises(ValueError, match="Diameter must be positive"):
        encrypt("HELLO", 0)

    with pytest.raises(ValueError, match="Diameter must be positive"):
        encrypt("HELLO", -1)

    with pytest.raises(ValueError, match="Diameter must be positive"):
        decrypt("HELLO", 0)

    with pytest.raises(ValueError, match="Diameter must be positive"):
        decrypt("HELLO", -1)

def test_scytale_encrypt_decrypt():
    # Basic standard test
    plaintext = "I AM HURT VERY BADLY"
    width = 4

    ciphertext = encrypt(plaintext, width)
    # Testing that it returns something deterministic and decryption matches
    expected = encrypt(plaintext, width)
    assert ciphertext == expected

    decrypted = decrypt(ciphertext, width)
    assert decrypted == plaintext

def test_scytale_single_row():
    # Width equals length
    plaintext = "HELLO"
    width = 5
    ciphertext = encrypt(plaintext, width)
    assert ciphertext == "HELLO"
    decrypted = decrypt(ciphertext, width)
    assert decrypted == plaintext

def test_scytale_empty_string():
    # Empty string tests
    ciphertext = encrypt("", 4)
    assert ciphertext == ""
    decrypted = decrypt("", 4)
    assert decrypted == ""
