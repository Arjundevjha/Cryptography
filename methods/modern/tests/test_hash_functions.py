import pytest
from methods.modern.hash_functions import sha256, compute_hash, HASH_FUNCTIONS

def test_compute_hash_value_error():
    """Test that compute_hash raises a ValueError for unsupported algorithms."""
    with pytest.raises(ValueError) as excinfo:
        compute_hash("test data", "unsupported_algo")

    assert "Unsupported algorithm: unsupported_algo" in str(excinfo.value)


def test_sha256_kats():
    """Test SHA-256 implementation against known-answer vectors."""
    assert sha256("") == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    assert sha256("abc") == "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    assert sha256("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq") == (
        "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1"
    )
    assert compute_hash("abc", "sha256") == "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"


def test_all_hash_functions_non_empty():
    """Test that all hash functions compute non-empty digests."""
    for algo in HASH_FUNCTIONS:
        res = compute_hash("hello world", algo)
        assert isinstance(res, str) and len(res) > 0
