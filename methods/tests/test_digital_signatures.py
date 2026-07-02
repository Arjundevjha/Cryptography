import pytest
from methods.modern.digital_signatures import create_hmac, verify_hmac, generate_key

def test_create_hmac_unsupported_algorithm():
    """Test that creating an HMAC with an unsupported algorithm raises a ValueError."""
    data = b"test data"
    key = b"test key"

    with pytest.raises(ValueError, match="Only sha256 is supported in this pure Python implementation"):
        create_hmac(data, key, algorithm="md5")

def test_create_hmac_happy_path():
    """Test that creating an HMAC with the default (sha256) algorithm succeeds."""
    data = b"test data"
    key = b"test key"

    # Should not raise any exception
    signature = create_hmac(data, key)
    assert isinstance(signature, str)
    assert len(signature) > 0

def test_verify_hmac():
    """Test the complete flow of generating a key, creating an HMAC, and verifying it."""
    key = generate_key()
    data = b"message to sign"

    signature = create_hmac(data, key)
    is_valid = verify_hmac(data, key, signature)

    assert is_valid is True

def test_verify_hmac_invalid_signature():
    """Test that verification fails with an incorrect signature."""
    key = generate_key()
    data = b"message to sign"

    signature = create_hmac(data, key)
    # Tamper with the signature
    invalid_signature = "0" * len(signature)

    is_valid = verify_hmac(data, key, invalid_signature)

    assert is_valid is False
