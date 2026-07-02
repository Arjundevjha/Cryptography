import pytest
from methods.modern.symmetric import key_expansion

def test_key_expansion_invalid_key_length():
    with pytest.raises(ValueError, match="Key length must be 16, 24, or 32 bytes"):
        key_expansion(b"12345") # 5 bytes

def test_key_expansion_valid_key_lengths():
    # 16 bytes
    key16 = b"1" * 16
    assert len(key_expansion(key16)) > 0

    # 24 bytes
    key24 = b"1" * 24
    assert len(key_expansion(key24)) > 0

    # 32 bytes
    key32 = b"1" * 32
    assert len(key_expansion(key32)) > 0
