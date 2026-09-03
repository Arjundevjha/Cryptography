import pytest
import warnings
from methods.modern.hash_functions import compute_hash, md5

def test_compute_hash_value_error():
    """Test that compute_hash raises a ValueError for unsupported algorithms."""
    with pytest.raises(ValueError) as excinfo:
        compute_hash("test data", "unsupported_algo")

    assert "Unsupported algorithm: unsupported_algo" in str(excinfo.value)


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
