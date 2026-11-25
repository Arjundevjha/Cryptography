"""Unit tests for RFC 5869 HKDF-SHA256."""

import pytest
from methods.modern.kdf import hkdf_derive, hkdf_expand, hkdf_extract


def test_rfc5869_test_vector_1():
    """Verify RFC 5869 Appendix A.1 SHA-256 test vector."""
    ikm = bytes.fromhex("0b" * 22)
    salt = bytes.fromhex("000102030405060708090a0b0c")
    info = bytes.fromhex("f0f1f2f3f4f5f6f7f8f9")
    res = hkdf_derive(ikm=ikm, salt=salt, info=info, length=42)
    assert res["prk_hex"] == "077709362c2e32df0ddc3f0dc47bba6390b6c73bb50f9c3122ec844ad7c2b3e5"
    assert res["okm_hex"] == (
        "3cb25f25faacd57a90434f64d0362f2a"
        "2d2d0a90cf1a5a4c5db02d56ecc4c5bf"
        "34007208d5b887185865"
    )
    assert len(res["blocks"]) == 2


def test_hkdf_validation_errors():
    """Verify invalid inputs raise ValueError."""
    with pytest.raises(ValueError, match="ikm"):
        hkdf_derive(b"")
    with pytest.raises(ValueError, match="length"):
        hkdf_expand(hkdf_extract(b"", b"secret"), b"", 0)
    with pytest.raises(ValueError, match="prk"):
        hkdf_expand(b"short", b"", 32)
