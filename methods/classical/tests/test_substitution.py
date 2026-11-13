import string
from unittest.mock import patch

import pytest

from methods.classical.substitution import (
    pick_keys,
    _invert_key,
    encrypt,
    decrypt,
    main,
    MAX_TEXT_LENGTH
)

def test_pick_keys():
    """Test that pick_keys generates a valid substitution key."""
    key = pick_keys()

    # Must be a dictionary mapping 26 lowercase letters to 26 unique lowercase letters
    assert isinstance(key, dict)
    assert len(key) == 26

    # Check all keys are a-z
    assert set(key.keys()) == set(string.ascii_lowercase)

    # Check all values are a-z and unique
    assert set(key.values()) == set(string.ascii_lowercase)

def test_invert_key():
    """Test that _invert_key correctly reverses the mapping."""
    key = {'a': 'z', 'b': 'y', 'c': 'x'}
    expected_inverse = {'z': 'a', 'y': 'b', 'x': 'c'}
    assert _invert_key(key) == expected_inverse

def test_encrypt_basic():
    """Test basic encryption functionality."""
    key = {'a': 'z', 'b': 'y', 'c': 'x', 'd': 'w', 'e': 'v'}
    assert encrypt("abcde", key) == "zyxwv"
    assert encrypt("ABCDE", key) == "ZYXWV"
    assert encrypt("AbCdE", key) == "ZyXwV"

def test_decrypt_basic():
    """Test basic decryption functionality."""
    key = {'a': 'z', 'b': 'y', 'c': 'x', 'd': 'w', 'e': 'v'}
    assert decrypt("zyxwv", key) == "abcde"
    assert decrypt("ZYXWV", key) == "ABCDE"
    assert decrypt("ZyXwV", key) == "AbCdE"

def test_encrypt_decrypt_roundtrip():
    """Test that decrypting an encrypted message yields the original."""
    key = pick_keys()
    plaintext = "Hello World! This is a test."
    ciphertext = encrypt(plaintext, key)
    decrypted = decrypt(ciphertext, key)
    assert decrypted == plaintext

def test_non_alphabetic_characters():
    """Test that non-alphabetic characters are preserved."""
    key = pick_keys()
    plaintext = "123 !@# ABC xyz"
    # Even without knowing the key, we know the non-alpha should be preserved
    ciphertext = encrypt(plaintext, key)

    # Check positions of non-alpha characters
    assert ciphertext[0:3] == "123"
    assert ciphertext[3:8] == " !@# "
    assert ciphertext[11:12] == " "

    # Check roundtrip
    assert decrypt(ciphertext, key) == plaintext

def test_empty_string():
    """Test encryption and decryption of an empty string."""
    key = pick_keys()
    assert encrypt("", key) == ""
    assert decrypt("", key) == ""

def test_main(capsys):
    """Test the main interactive function."""
    # We'll mock input to return our test message
    # And we'll mock pick_keys so we know the exact key for predictable output
    test_key = {chr(i): chr((i - 97 + 1) % 26 + 97) for i in range(97, 123)}  # simple shift by 1

    with patch('builtins.input', return_value='Hello World!'), \
         patch('methods.classical.substitution.pick_keys', return_value=test_key):
        main()

    captured = capsys.readouterr()

    assert "Substitution Input Message: Hello World!" in captured.out
    assert "Substitution Cipher Key Map: bcdefghijklmnopqrstuvwxyza" in captured.out
    assert "Substitution Ciphertext (Encrypted): Ifmmp Xpsme!" in captured.out
    assert "Substitution Restored Message (Decrypted): Hello World!" in captured.out

def test_invalid_input_types():
    """Test that non-string text inputs raise TypeError."""
    key = {'a': 'b'}
    with pytest.raises(TypeError, match="Plaintext must be a string"):
        encrypt(12345, key)
    with pytest.raises(TypeError, match="Plaintext must be a string"):
        encrypt(None, key)
    with pytest.raises(TypeError, match="Ciphertext must be a string"):
        decrypt(12345, key)
    with pytest.raises(TypeError, match="Ciphertext must be a string"):
        decrypt(None, key)

def test_invalid_key_types_and_empty():
    """Test that invalid key types and empty keys raise appropriate errors."""
    with pytest.raises(TypeError, match="Key must be a dictionary"):
        encrypt("hello", "not_a_dict")
    with pytest.raises(TypeError, match="Key must be a dictionary"):
        decrypt("hello", None)
    with pytest.raises(ValueError, match="Key cannot be empty"):
        encrypt("hello", {})
    with pytest.raises(ValueError, match="Key cannot be empty"):
        decrypt("hello", {})

def test_max_text_length_dos():
    """Test that text exceeding MAX_TEXT_LENGTH raises ValueError to mitigate DoS."""
    key = {'a': 'b'}
    oversized = "a" * (MAX_TEXT_LENGTH + 1)
    with pytest.raises(ValueError, match=f"Plaintext length exceeds maximum allowed limit of {MAX_TEXT_LENGTH}"):
        encrypt(oversized, key)
    with pytest.raises(ValueError, match=f"Ciphertext length exceeds maximum allowed limit of {MAX_TEXT_LENGTH}"):
        decrypt(oversized, key)
