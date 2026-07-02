import pytest
import string
from methods.classical.vigenere import (
    encrypt,
    decrypt,
    _pad_key,
    pick_keys,
    _encrypt_decrypt_char,
    MODE_ENCRYPT
)

def test_pad_key():
    assert _pad_key("hello", "key") == "keyke"
    # Spaces do not advance the key index
    assert _pad_key("hello world", "key") == "keyke ykeyk"
    # Non-alphanumeric chars pad with space and don't advance key
    assert _pad_key("H3LL0", "key") == "k ey "
    assert _pad_key("ATTACKATDAWN", "LEMON") == "LEMONLEMONLE"

def test_encrypt_decrypt_char():
    # Encrypt
    assert _encrypt_decrypt_char('a', 'a', MODE_ENCRYPT) == 'a'
    assert _encrypt_decrypt_char('a', 'b', MODE_ENCRYPT) == 'b'
    assert _encrypt_decrypt_char('z', 'b', MODE_ENCRYPT) == 'a'
    assert _encrypt_decrypt_char('A', 'b', MODE_ENCRYPT) == 'B'
    assert _encrypt_decrypt_char('Z', 'B', MODE_ENCRYPT) == 'A'

    # Decrypt
    assert _encrypt_decrypt_char('a', 'a', 'decrypt') == 'a'
    assert _encrypt_decrypt_char('b', 'b', 'decrypt') == 'a'
    assert _encrypt_decrypt_char('a', 'b', 'decrypt') == 'z'
    assert _encrypt_decrypt_char('B', 'b', 'decrypt') == 'A'
    assert _encrypt_decrypt_char('A', 'B', 'decrypt') == 'Z'

    # Non-alphabet characters
    assert _encrypt_decrypt_char(' ', 'a', MODE_ENCRYPT) == ' '
    assert _encrypt_decrypt_char('1', 'a', MODE_ENCRYPT) == '1'
    assert _encrypt_decrypt_char('!', 'b', 'decrypt') == '!'

def test_encrypt():
    # Standard example
    assert encrypt("ATTACKATDAWN", "LEMON") == "LXFOPVEFRNHR"
    assert encrypt("attackatdawn", "lemon") == "lxfopvefrnhr"
    # With spaces
    assert encrypt("HELLO WORLD", "KEY") == "RIJVS UYVJN"
    # With numbers and special characters
    assert encrypt("HELLO, WORLD 123!", "KEY") == "RIJVS, UYVJN 123!"

def test_decrypt():
    # Standard example
    assert decrypt("LXFOPVEFRNHR", "LEMON") == "ATTACKATDAWN"
    assert decrypt("lxfopvefrnhr", "lemon") == "attackatdawn"
    # With spaces
    assert decrypt("RIJVS UYVJN", "KEY") == "HELLO WORLD"
    # With numbers and special characters
    assert decrypt("RIJVS, UYVJN 123!", "KEY") == "HELLO, WORLD 123!"

def test_encrypt_decrypt_roundtrip():
    plaintext = "The quick brown fox jumps over 13 lazy dogs!"
    key = "SECRET"
    ciphertext = encrypt(plaintext, key)
    assert decrypt(ciphertext, key) == plaintext

def test_pick_keys():
    key = pick_keys()
    assert len(key) == 5
    assert all(c in string.ascii_lowercase for c in key)

    # Check randomness (very likely to be different)
    key2 = pick_keys()
    # It's possible for them to be the same, but very unlikely (1 in 26^5).
    # Just to be safe we don't strictly assert they are different, but we check type/format
    assert isinstance(key, str)

from unittest.mock import patch
from methods.classical.vigenere import main

def test_main_custom_key(capsys):
    with patch('builtins.input', side_effect=['HELLO', 'KEY']):
        main()

    captured = capsys.readouterr()
    assert "Vigenere Original Plaintext: HELLO" in captured.out
    assert "Vigenere Key Utilized: KEY" in captured.out
    assert "Vigenere Encrypted Text: RIJVS" in captured.out
    assert "Vigenere Decrypted Result: HELLO" in captured.out

def test_main_random_key(capsys):
    with patch('builtins.input', side_effect=['HELLO', '']):
        with patch('methods.classical.vigenere.pick_keys', return_value='abcde'):
            main()

    captured = capsys.readouterr()
    assert "Vigenere Original Plaintext: HELLO" in captured.out
    assert "Vigenere Key Utilized: abcde" in captured.out
    assert "Vigenere Encrypted Text: HFNOS" in captured.out
    assert "Vigenere Decrypted Result: HELLO" in captured.out
