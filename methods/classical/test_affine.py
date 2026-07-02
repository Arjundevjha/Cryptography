import pytest
import math
from methods.classical.affine import encrypt, decrypt, pick_keys

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
