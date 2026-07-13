import string
from methods.classical.caesar import encrypt, decrypt, pick_keys

def test_pick_keys():
    """Test that pick_keys generates a valid shift key between 1 and 25."""
    for _ in range(100):
        key = pick_keys()
        assert 1 <= key <= 25

def test_encrypt_basic():
    """Test standard encryption cases."""
    assert encrypt("HELLO", 3) == "KHOOR"
    assert encrypt("hello", 3) == "khoor"
    assert encrypt("Hello", 3) == "Khoor"

def test_decrypt_basic():
    """Test standard decryption cases."""
    assert decrypt("KHOOR", 3) == "HELLO"
    assert decrypt("khoor", 3) == "hello"
    assert decrypt("Khoor", 3) == "Hello"

def test_encrypt_no_shift():
    """Test encryption with a shift of 0."""
    assert encrypt("NO CHANGE", 0) == "NO CHANGE"

def test_decrypt_no_shift():
    """Test decryption with a shift of 0."""
    assert decrypt("NO CHANGE", 0) == "NO CHANGE"

def test_case_preservation():
    """Test that uppercase and lowercase letters are preserved."""
    assert encrypt("Caesar Cipher 123", 5) == "Hfjxfw Hnumjw 123"
    assert decrypt("Hfjxfw Hnumjw 123", 5) == "Caesar Cipher 123"

def test_negative_shift():
    """Test handling of negative shift values."""
    # A shift of -5 is equivalent to a shift of 21 (26 - 5)
    assert encrypt("HELLO", -5) == encrypt("HELLO", 21)
    assert encrypt("HELLO", -5) == "CZGGJ"
    assert decrypt("CZGGJ", -5) == "HELLO"

def test_large_shift():
    """Test handling of shifts larger than 26."""
    # A shift of 1000 is equivalent to 1000 % 26 = 12
    assert encrypt("HELLO", 1000) == encrypt("HELLO", 12)
    assert encrypt("HELLO", 1000) == "TQXXA"
    assert decrypt("TQXXA", 1000) == "HELLO"

def test_empty_string():
    """Test encryption and decryption of an empty string."""
    assert encrypt("", 5) == ""
    assert decrypt("", 5) == ""

def test_non_alphabetic():
    """Test that non-alphabetic characters are unmodified."""
    text = "Hello, World! 123 @#$"
    encrypted = encrypt(text, 13)
    assert encrypted == "Uryyb, Jbeyq! 123 @#$"
    assert decrypt(encrypted, 13) == text

def test_full_alphabet():
    """Test that every character in the alphabet shifts correctly."""
    alphabet_lower = string.ascii_lowercase
    alphabet_upper = string.ascii_uppercase

    # Shift by 1
    assert encrypt(alphabet_lower, 1) == "bcdefghijklmnopqrstuvwxyza"
    assert encrypt(alphabet_upper, 1) == "BCDEFGHIJKLMNOPQRSTUVWXYZA"

    # Shift by 25
    assert encrypt(alphabet_lower, 25) == "zabcdefghijklmnopqrstuvwxy"
    assert encrypt(alphabet_upper, 25) == "ZABCDEFGHIJKLMNOPQRSTUVWXY"

def test_all_shifts():
    """Test round-trip encryption/decryption for all valid shifts."""
    text = "The quick brown fox jumps over the lazy dog."
    for shift in range(-50, 50):
        encrypted = encrypt(text, shift)
        decrypted = decrypt(encrypted, shift)
        assert decrypted == text
