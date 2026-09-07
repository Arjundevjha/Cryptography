import warnings
import pytest
from methods.modern.hash_functions import (
    sha256,
    sha3_256,
    compute_hash,
    HASH_FUNCTIONS,
    md5,
    sha1,
)

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


def test_md5_warning_and_output():
    """Test that md5 function triggers a security UserWarning and computes expected hash."""
    with pytest.warns(UserWarning, match="MD5 is cryptographically broken"):
        result = md5("hello world")

    # Known MD5 hash KAT for "hello world"
    assert result == "5eb63bbbe01eeed093cb22bb8f5acdc3"


def test_compute_hash_md5_warning():
    """Test compute_hash with 'md5' algorithm triggers UserWarning."""
    with pytest.warns(UserWarning, match="MD5 is cryptographically broken"):
        result = compute_hash("hello world", "md5")

    assert result == "5eb63bbbe01eeed093cb22bb8f5acdc3"


def test_sha1_kat_and_warning():
    """Test SHA-1 KAT correctness and verify security warning emission."""
    with pytest.warns(UserWarning, match="SHA-1 is cryptographically weak"):
        digest = sha1("The quick brown fox jumps over the lazy dog")
    assert digest == "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12"

    with pytest.warns(UserWarning, match="SHA-1 is cryptographically weak"):
        empty_digest = compute_hash("", "sha1")
    assert empty_digest == "da39a3ee5e6b4b0d3255bfef95601890afd80709"


def test_sha3_256_kats():
    """Test SHA3-256 implementation against known-answer vectors and boundary conditions."""
    # Empty string KAT
    assert (
        sha3_256("")
        == "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a"
    )

    # Standard short input KAT
    assert (
        sha3_256("abc")
        == "3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532"
    )

    # Sentence input KAT
    assert (
        sha3_256("The quick brown fox jumps over the lazy dog")
        == "69070dda01975c8c120c3aada1b282394e7f032fa9cf32f4cb2259a0897dfc04"
    )

    # Multi-block / boundary conditions (SHA3-256 block size rate = 136 bytes)
    # Exactly 135 bytes
    assert (
        sha3_256("a" * 135)
        == "8094bb53c44cfb1e67b7c30447f9a1c33696d2463ecc1d9c92538913392843c9"
    )
    # Exactly 136 bytes (1 block boundary)
    assert (
        sha3_256("a" * 136)
        == "3fc5559f14db8e453a0a3091edbd2bc25e11528d81c66fa570a4efdcc2695ee1"
    )
    # 200 bytes (multiple blocks)
    assert (
        sha3_256("a" * 200)
        == "cce34485baf2bf2aca99b94833892a4f52896d3d153f7b840cc4f9fe695f1387"
    )

    # compute_hash wrapper verification
    assert (
        compute_hash("abc", "sha3_256")
        == "3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532"
    )
