"""Tests for the Vigenere cipher implementation."""

import pytest
from methods.classical.vigenere import _pad_key, _encrypt_decrypt_char, encrypt, decrypt, pick_keys, MODE_ENCRYPT

class TestVigenere:

    def test_pad_key(self):
        """Test the _pad_key function."""
        assert _pad_key("ATTACKATDAWN", "LEMON") == "LEMONLEMONLE"
        assert _pad_key("HELLO", "KEY") == "KEYKE"
        assert _pad_key("Hello World!", "KEY") == "KEYKE YKEYK "
        assert _pad_key("", "KEY") == ""

    def test_encrypt_decrypt_char(self):
        """Test single character encryption and decryption."""
        # Encrypt
        assert _encrypt_decrypt_char('A', 'L', MODE_ENCRYPT) == 'L'
        assert _encrypt_decrypt_char('a', 'l', MODE_ENCRYPT) == 'l'
        assert _encrypt_decrypt_char('T', 'E', MODE_ENCRYPT) == 'X'
        assert _encrypt_decrypt_char('t', 'e', MODE_ENCRYPT) == 'x'
        assert _encrypt_decrypt_char(' ', 'K', MODE_ENCRYPT) == ' '
        assert _encrypt_decrypt_char('!', 'K', MODE_ENCRYPT) == '!'

        # Decrypt
        assert _encrypt_decrypt_char('L', 'L', 'decrypt') == 'A'
        assert _encrypt_decrypt_char('l', 'l', 'decrypt') == 'a'
        assert _encrypt_decrypt_char('X', 'E', 'decrypt') == 'T'
        assert _encrypt_decrypt_char('x', 'e', 'decrypt') == 't'
        assert _encrypt_decrypt_char(' ', 'K', 'decrypt') == ' '
        assert _encrypt_decrypt_char('!', 'K', 'decrypt') == '!'

    def test_encrypt_standard(self):
        """Test standard encryption."""
        assert encrypt("ATTACKATDAWN", "LEMON") == "LXFOPVEFRNHR"
        assert encrypt("HELLO", "KEY") == "RIJVS"

    def test_decrypt_standard(self):
        """Test standard decryption."""
        assert decrypt("LXFOPVEFRNHR", "LEMON") == "ATTACKATDAWN"
        assert decrypt("RIJVS", "KEY") == "HELLO"

    def test_key_case_insensitivity(self):
        """Test that key case doesn't affect the result."""
        assert encrypt("HELLO", "kEy") == "RIJVS"
        assert encrypt("HELLO", "KEY") == "RIJVS"

    def test_special_characters_preservation(self):
        """Test that special characters and spaces are preserved."""
        assert encrypt("HELLO WORLD!", "KEY") == "RIJVS UYVJN!"
        assert decrypt("RIJVS UYVJN!", "KEY") == "HELLO WORLD!"

    def test_empty_string(self):
        """Test encrypting and decrypting an empty string."""
        assert encrypt("", "KEY") == ""
        assert decrypt("", "KEY") == ""

    def test_pick_keys(self):
        """Test key generation."""
        key = pick_keys()
        assert isinstance(key, str)
        assert len(key) == 5
        assert key.isalpha()
        assert key.islower()
