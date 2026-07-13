import pytest
from methods.historical.scytale import encrypt, decrypt, pick_keys

def test_encrypt_standard():
    plaintext = "I AM HURT VERY BADLY"
    diameter = 4
    # Calculate the expected ciphertext manually based on Python logic:
    # "I AM HURT VERY BADLY" length is 20. Multiple of 4 is 20, no padding.
    # Num rows = 5.
    # Col 0: indices 0, 4, 8, 12, 16 -> 'I', ' ', 'T', 'R', 'A' -> 'I TRA'
    # Col 1: indices 1, 5, 9, 13, 17 -> ' ', 'H', ' ', 'Y', 'D' -> ' H YD'
    # Col 2: indices 2, 6, 10, 14, 18 -> 'A', 'U', 'V', ' ', 'L' -> 'AUV L'
    # Col 3: indices 3, 7, 11, 15, 19 -> 'M', 'R', 'E', 'B', 'Y' -> 'MREBY'
    # Expected: "I TRA H YDAUV LMREBY"
    assert encrypt(plaintext, diameter) == "I TRA H YDAUV LMREBY"

def test_decrypt_standard():
    plaintext = "I AM HURT VERY BADLY"
    diameter = 4
    ciphertext = "I TRA H YDAUV LMREBY"
    assert decrypt(ciphertext, diameter) == plaintext

def test_encrypt_padding():
    plaintext = "HELLO"
    diameter = 3
    # "HELLO" len=5. padding=(3 - (5%3))%3 = (3-2)%3 = 1 space -> "HELLO "
    # num_rows = 6 / 3 = 2
    # cols=3, rows=2
    # col0: 0, 3 -> 'H', 'L'
    # col1: 1, 4 -> 'E', 'O'
    # col2: 2, 5 -> 'L', ' '
    # expected: "HLEOL "
    assert encrypt(plaintext, diameter) == "HLEOL "

def test_decrypt_padding():
    plaintext = "HELLO"
    diameter = 3
    ciphertext = "HLEOL "
    # Decrypt returns stripped output.
    assert decrypt(ciphertext, diameter) == "HELLO"

def test_invalid_diameter():
    with pytest.raises(ValueError, match="Diameter must be positive"):
        encrypt("HELLO", 0)
    with pytest.raises(ValueError, match="Diameter must be positive"):
        encrypt("HELLO", -1)
    with pytest.raises(ValueError, match="Diameter must be positive"):
        decrypt("HLEOL ", 0)

def test_empty_string():
    assert encrypt("", 3) == ""
    assert decrypt("", 3) == ""

def test_pick_keys():
    for _ in range(50):
        key = pick_keys()
        assert 3 <= key <= 8

def test_scytale_single_row():
    # Width equals length
    plaintext = "HELLO"
    width = 5
    ciphertext = encrypt(plaintext, width)
    assert ciphertext == "HELLO"
    decrypted = decrypt(ciphertext, width)
    assert decrypted == plaintext

