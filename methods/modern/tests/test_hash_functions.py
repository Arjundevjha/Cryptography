import pytest
from methods.modern.hash_functions import compute_hash

def test_compute_hash_value_error():
    """Test that compute_hash raises a ValueError for unsupported algorithms."""
    with pytest.raises(ValueError) as excinfo:
        compute_hash("test data", "unsupported_algo")

    assert "Unsupported algorithm: unsupported_algo" in str(excinfo.value)
