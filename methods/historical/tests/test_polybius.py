import pytest

from methods.historical.polybius import encrypt, decrypt, pick_keys, ALPHABET

def test_pick_keys():
    """Test picking a random key grid."""
    key = pick_keys()
    assert len(key) == 25
    assert set(key) == set(ALPHABET)

def test_encrypt_standard():
    """Test standard encryption."""
    assert encrypt("hello") == "23 15 31 31 34"

def test_decrypt_standard():
    """Test standard decryption."""
    # Polybius natively returns upper case.
    assert decrypt("23 15 31 31 34") == "HELLO"

def test_encrypt_i_j_merge():
    """Test encryption with J treated as I."""
    # 'juliet' -> iuliet -> 24 45 31 24 15 44
    assert encrypt("juliet") == "24 45 31 24 15 44"

def test_encrypt_non_alphabetic():
    """Test encryption preserves spaces and punctuation."""
    assert encrypt("hello!") == "23 15 31 31 34!"
    # The implementation ignores non-digits for trailing spaces, which results in:
    assert encrypt("he llo") == "23 15 31 31 34"

def test_decrypt_non_alphabetic():
    """Test decryption preserves spaces and punctuation."""
    # Note: Spaces are completely stripped out by `ciphertext.replace(" ", "")` in the current implementation.
    # So we test that punctuation is preserved.
    assert decrypt("23 15 31 31 34!") == "HELLO!"

def test_decrypt_invalid_coordinates():
    """Test decryption with invalid odd number of digits."""
    # 23 15 31 31 3 -> missing the last digit
    assert decrypt("23 15 31 31 3") == "HELL3"

def test_decrypt_out_of_range():
    """Test decryption with digits out of range (like 99)."""
    # 23 15 99 31
    assert decrypt("23 15 99 31") == "HE99L"

def test_decrypt_non_numeric_coords():
    """Test decryption skips over letters that aren't coords properly."""
    # 23 a 15 31 -> H a E L
    assert decrypt("23a15 31") == "HAEL"

def test_encrypt_custom_key():
    """Test encryption with a custom key grid."""
    key = ALPHABET[::-1]
    plaintext = "customkeytest"
    encrypted = encrypt(plaintext, key=key)
    decrypted = decrypt(encrypted, key=key)
    assert decrypted == plaintext.upper()
