import pytest
from methods.classical.affine import encrypt, decrypt, pick_keys, _check_coprime

def test_check_coprime_valid():
    # Should not raise exception
    _check_coprime(5)

def test_check_coprime_invalid():
    with pytest.raises(ValueError) as exc:
        _check_coprime(13)
    assert "coprime" in str(exc.value)

def test_encrypt_non_coprime():
    with pytest.raises(ValueError) as exc:
        encrypt("HELLO", 13, 5)
    assert "coprime" in str(exc.value)

def test_decrypt_non_coprime():
    with pytest.raises(ValueError) as exc:
        decrypt("HELLO", 13, 5)
    assert "coprime" in str(exc.value)

def test_encrypt_decrypt_happy_path():
    plaintext = "HELLO"
    a_key = 5
    b_key = 8
    ciphertext = encrypt(plaintext, a_key, b_key)
    assert ciphertext == "rclla"
    decrypted = decrypt(ciphertext, a_key, b_key)
    assert decrypted == "hello"

def test_pick_keys():
    a_key, b_key = pick_keys()
    _check_coprime(a_key)
