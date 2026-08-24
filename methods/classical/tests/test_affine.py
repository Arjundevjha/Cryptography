import pytest
import math
from methods.classical.affine import encrypt, decrypt, pick_keys, _check_coprime

def test_encrypt_standard():
    """Test standard encryption with known values."""
    assert encrypt("ATTACK", 5, 8) == "izzisg"
    assert encrypt("HELLO", 17, 20) == "jkzzy"

def test_decrypt_standard():
    """Test standard decryption with known values."""
    assert decrypt("izzisg", 5, 8) == "attack"
    assert decrypt("jkzzy", 17, 20) == "hello"

def test_encrypt_preserve_non_alpha():
    """Test that non-alphabetic characters are preserved during encryption."""
    assert encrypt("ATTACK 123!", 5, 8) == "izzisg 123!"

def test_decrypt_preserve_non_alpha():
    """Test that non-alphabetic characters are preserved during decryption."""
    assert decrypt("izzisg 123!", 5, 8) == "attack 123!"

def test_case_conversion():
    """Test that encryption and decryption converts characters to lowercase."""
    assert encrypt("Attack", 5, 8) == "izzisg"
    assert decrypt("Izzisg", 5, 8) == "attack"
    assert decrypt("iZziSg", 5, 8) == "attack"

def test_pick_keys():
    """Test that pick_keys returns a valid 'a' key that is coprime to 26."""
    for _ in range(100):
        a_key, b_key = pick_keys()
        # a_key must be coprime to 26
        assert math.gcd(a_key, 26) == 1
        # In the current implementation, pick_keys also picks b_key from the same coprimes list
        assert math.gcd(b_key, 26) == 1
        assert a_key != b_key

def test_encrypt_decrypt_reciprocity():
    """Test that decrypting an encrypted text returns the original text."""
    plaintext = "thequickbrownfoxjumpsoverthelazydog"
    for _ in range(20):
        a_key, b_key = pick_keys()
        ciphertext = encrypt(plaintext, a_key, b_key)
        decrypted = decrypt(ciphertext, a_key, b_key)
        assert decrypted == plaintext

def test_encrypt_empty_string():
    """Test encryption with an empty string."""
    assert encrypt("", 5, 8) == ""

def test_decrypt_empty_string():
    """Test decryption with an empty string."""
    assert decrypt("", 5, 8) == ""

@pytest.mark.parametrize("a_key", [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25, 27, 29, 31, -1, -3, -5])
def test_check_coprime_valid(a_key):
    """Test that valid coprime keys do not raise an exception."""
    _check_coprime(a_key)

INVALID_A_KEYS = [0, 2, 4, 6, 8, 10, 12, 13, 14, 16, 18, 20, 22, 24, 26, 39, 52, -2, -13, -26]

@pytest.mark.parametrize("a_key", INVALID_A_KEYS)
def test_check_coprime_invalid(a_key):
    """Test that invalid non-coprime keys raise ValueError in _check_coprime."""
    with pytest.raises(ValueError) as exc:
        _check_coprime(a_key)
    assert "coprime" in str(exc.value)

@pytest.mark.parametrize("a_key", INVALID_A_KEYS)
def test_encrypt_non_coprime(a_key):
    """Test that encrypt raises ValueError when key 'a' is not coprime to 26."""
    with pytest.raises(ValueError) as exc:
        encrypt("HELLO", a_key, 5)
    assert "coprime" in str(exc.value)

@pytest.mark.parametrize("a_key", INVALID_A_KEYS)
def test_decrypt_non_coprime(a_key):
    """Test that decrypt raises ValueError when key 'a' is not coprime to 26."""
    with pytest.raises(ValueError) as exc:
        decrypt("HELLO", a_key, 5)
    assert "coprime" in str(exc.value)

