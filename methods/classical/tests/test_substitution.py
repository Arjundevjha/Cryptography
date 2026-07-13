import pytest
import string
from unittest.mock import patch

from methods.classical.substitution import (
    pick_keys,
    _invert_key,
    encrypt,
    decrypt,
    main
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
