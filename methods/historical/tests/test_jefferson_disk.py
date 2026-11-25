"""Unit tests for the Jefferson Disk (Bazeries Cylinder) cipher."""

import pytest
from methods.historical.jefferson_disk import (
    DEFAULT_WHEELS,
    jefferson_decrypt,
    jefferson_encrypt,
)


def test_jefferson_disk_roundtrip_and_all_rows():
    """Verify Jefferson Disk encryption/decryption and 25 candidate rows."""
    order = [5, 12, 1, 30, 19, 8, 22, 3, 14, 27]
    res = jefferson_encrypt("RETREAT AT DAWN", wheel_order=order, offset=7)
    assert len(res["ciphertext"]) == 13
    assert res["offset"] == 7

    dec = jefferson_decrypt(res["ciphertext"], wheel_order=order, offset=7)
    assert dec["plaintext"] == "RETREATATDAWN"
    assert len(dec["all_rows"]) == 25
    assert dec["all_rows"][6]["text"] == "RETREATATDAWN"


def test_jefferson_default_wheels_determinism():
    """Verify default 36 wheels are distinct 26-letter permutations."""
    assert len(DEFAULT_WHEELS) == 36
    assert all(len(w) == 26 and set(w) == set("ABCDEFGHIJKLMNOPQRSTUVWXYZ") for w in DEFAULT_WHEELS)
    assert len(set(DEFAULT_WHEELS)) == 36


def test_jefferson_validation_errors():
    """Verify invalid wheel_order, offset, and empty inputs raise ValueError."""
    with pytest.raises(ValueError, match="wheel_order"):
        jefferson_encrypt("HELLO", wheel_order=[])
    with pytest.raises(ValueError, match="wheel numbers"):
        jefferson_encrypt("HELLO", wheel_order=[37])
    with pytest.raises(ValueError, match="offset"):
        jefferson_encrypt("HELLO", offset=26)
    with pytest.raises(ValueError, match="plaintext"):
        jefferson_encrypt("12345", offset=1)
    with pytest.raises(ValueError, match="ciphertext"):
        jefferson_decrypt("!!!", offset=1)
