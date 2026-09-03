import warnings
import pytest
from methods.modern.hash_functions import compute_hash, sha1

def test_compute_hash_value_error():
    """Test that compute_hash raises a ValueError for unsupported algorithms."""
    with pytest.raises(ValueError) as excinfo:
        compute_hash("test data", "unsupported_algo")

    assert "Unsupported algorithm: unsupported_algo" in str(excinfo.value)


def test_sha1_kat_and_warning():
    """Test SHA-1 KAT correctness and verify security warning emission."""
    with pytest.warns(UserWarning, match="SHA-1 is cryptographically weak"):
        digest = sha1("The quick brown fox jumps over the lazy dog")
    assert digest == "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12"

    with pytest.warns(UserWarning, match="SHA-1 is cryptographically weak"):
        empty_digest = compute_hash("", "sha1")
    assert empty_digest == "da39a3ee5e6b4b0d3255bfef95601890afd80709"
