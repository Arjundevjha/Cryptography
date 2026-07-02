import pytest

from methods.classical.caesar import encrypt, decrypt

def test_encrypt_standard():
    assert encrypt("HELLO", 3) == "KHOOR"
    assert encrypt("hello", 3) == "khoor"
    assert encrypt("ATTACK", 5) == "FYYFHP"

def test_decrypt_standard():
    assert decrypt("KHOOR", 3) == "HELLO"
    assert decrypt("khoor", 3) == "hello"
    assert decrypt("FYYFHP", 5) == "ATTACK"

def test_encrypt_no_change():
    assert encrypt("NO CHANGE", 0) == "NO CHANGE"

def test_decrypt_no_change():
    assert decrypt("NO CHANGE", 0) == "NO CHANGE"

def test_encrypt_case_preservation():
    assert encrypt("Caesar Cipher 123", 5) == "Hfjxfw Hnumjw 123"

def test_decrypt_case_preservation():
    assert decrypt("Hfjxfw Hnumjw 123", 5) == "Caesar Cipher 123"

def test_encrypt_special_chars():
    assert encrypt("Hello, World! @2024", 1) == "Ifmmp, Xpsme! @2024"

def test_decrypt_special_chars():
    assert decrypt("Ifmmp, Xpsme! @2024", 1) == "Hello, World! @2024"

def test_encrypt_large_shift():
    # 26 should be equivalent to 0
    assert encrypt("HELLO", 26) == "HELLO"
    # 29 should be equivalent to 3
    assert encrypt("HELLO", 29) == "KHOOR"

def test_decrypt_large_shift():
    assert decrypt("HELLO", 26) == "HELLO"
    assert decrypt("KHOOR", 29) == "HELLO"

def test_encrypt_negative_shift():
    # -1 should be equivalent to 25
    assert encrypt("A", -1) == "Z"
    assert encrypt("HELLO", -3) == "EBIIL"

def test_decrypt_negative_shift():
    assert decrypt("Z", -1) == "A"
    assert decrypt("EBIIL", -3) == "HELLO"

def test_empty_string():
    assert encrypt("", 5) == ""
    assert decrypt("", 5) == ""
