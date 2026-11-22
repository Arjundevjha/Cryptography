"""Unit tests for the Scytale transposition cipher."""

import pytest

from methods.historical.scytale import decrypt, encrypt, pick_keys


def test_encrypt_standard():
    """Test encryption of a standard message with the hand-computed ciphertext."""
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
    """Test decryption of the standard ciphertext back to the original message."""
    plaintext = "I AM HURT VERY BADLY"
    diameter = 4
    ciphertext = "I TRA H YDAUV LMREBY"
    assert decrypt(ciphertext, diameter) == plaintext

def test_encrypt_padding():
    """Test encryption with a message length not a multiple of the diameter."""
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
    """Test decryption strips the padding space back to the original message."""
    diameter = 3
    ciphertext = "HLEOL "
    # Decrypt returns stripped output.
    assert decrypt(ciphertext, diameter) == "HELLO"

def test_invalid_diameter():
    """Test that encrypt/decrypt reject non-positive diameters."""
    with pytest.raises(ValueError, match="Diameter must be positive"):
        encrypt("HELLO", 0)
    with pytest.raises(ValueError, match="Diameter must be positive"):
        encrypt("HELLO", -1)
    with pytest.raises(ValueError, match="Diameter must be positive"):
        decrypt("HLEOL ", 0)

def test_empty_string():
    """Test that empty strings encrypt/decrypt to empty strings."""
    assert encrypt("", 3) == ""
    assert decrypt("", 3) == ""

def test_pick_keys():
    """Test that pick_keys returns diameters within the 3..8 range."""
    for _ in range(50):
        key = pick_keys()
        assert 3 <= key <= 8

def test_scytale_single_row():
    """Test that a diameter equal to the text length produces the identity transform."""
    # Width equals length
    plaintext = "HELLO"
    width = 5
    ciphertext = encrypt(plaintext, width)
    assert ciphertext == "HELLO"
    decrypted = decrypt(ciphertext, width)
    assert decrypted == plaintext

def test_invalid_input_types():
    """Test that invalid text and diameter types raise TypeError."""
    with pytest.raises(TypeError, match="Text must be a string"):
        encrypt(123, 3)
    with pytest.raises(TypeError, match="Text must be a string"):
        decrypt(None, 3)
    with pytest.raises(TypeError, match="Diameter must be an integer"):
        encrypt("HELLO", True)
    with pytest.raises(TypeError, match="Diameter must be an integer"):
        decrypt("HLEOL ", 3.14)

def test_boundary_limits():
    """Test that text length and diameter size limits are enforced."""
    with pytest.raises(ValueError, match="Text length exceeds maximum limit"):
        encrypt("A" * 100001, 3)
    with pytest.raises(ValueError, match="Diameter exceeds maximum limit"):
        encrypt("HELLO", 10001)

def test_decrypt_edge_cases():
    """Test that invalid decryption diameters raise ValueError."""
    with pytest.raises(ValueError, match="Diameter cannot be greater than ciphertext length"):
        decrypt("HELLO", 10)
    with pytest.raises(ValueError, match="Ciphertext length must be a multiple of diameter"):
        decrypt("HELLO", 2)
