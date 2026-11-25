"""Unit tests for the WWI ADFGVX cipher."""

import pytest
from methods.historical.adfgvx import DEFAULT_SQUARE, adfgvx_decrypt, adfgvx_encrypt


def test_adfgvx_roundtrip_and_ragged_columns():
    """Verify ADFGVX encryption/decryption roundtrips cleanly with ragged column lengths."""
    res = adfgvx_encrypt("ATTACK AT 1200", transposition_key="PRIVACY")
    assert set(res["ciphertext"]).issubset(set("ADFGVX"))
    assert len(res["fractionated"]) == 24  # 12 alphanumeric chars -> 24 ADFGVX chars

    dec = adfgvx_decrypt(res["ciphertext"], transposition_key="PRIVACY")
    assert dec["plaintext"] == "ATTACKAT1200"
    assert dec["fractionated"] == res["fractionated"]


def test_adfgvx_custom_square_and_duplicate_key_letters():
    """Verify custom 36-char square and repeated letters in transposition key."""
    custom_sq = DEFAULT_SQUARE[::-1]
    res = adfgvx_encrypt("GEHEIMNIS9", transposition_key="BALLOON", square_key=custom_sq)
    dec = adfgvx_decrypt(res["ciphertext"], transposition_key="BALLOON", square_key=custom_sq)
    assert dec["plaintext"] == "GEHEIMNIS9"


def test_adfgvx_validation_errors():
    """Verify invalid square keys, transposition keys, and ciphertexts raise ValueError."""
    with pytest.raises(ValueError, match="square_key"):
        adfgvx_encrypt("HELLO", "KEY", square_key="SHORT")
    with pytest.raises(ValueError, match="transposition_key"):
        adfgvx_encrypt("HELLO", "!!!")
    with pytest.raises(ValueError, match="plaintext"):
        adfgvx_encrypt("   ", "KEY")
    with pytest.raises(ValueError, match="ciphertext"):
        adfgvx_decrypt("BAD", "KEY")
    with pytest.raises(ValueError, match="ciphertext"):
        adfgvx_decrypt("ADZ", "KEY")
