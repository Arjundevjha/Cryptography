"""Unit tests for digital signatures and HMAC verification."""

import pytest
from methods.modern.digital_signatures import (
    generate_key,
    create_hmac,
    verify_hmac,
    hmac_compare_digest,
    rsa_sign,
    rsa_verify,
)
from methods.modern.keypair import generate_keypair

def test_generate_key():
    """Test generating a random symmetric HMAC key."""
    key1 = generate_key()
    key2 = generate_key()

    assert len(key1) == 32
    assert len(key2) == 32
    assert key1 != key2

def test_generate_key_custom_length():
    """Test generating a key with a custom byte length."""
    key = generate_key(16)
    assert len(key) == 16


def test_generate_key_invalid_inputs():
    """Test generating key with invalid types and bounds raises appropriate exceptions."""
    with pytest.raises(TypeError, match="Key length must be an integer"):
        generate_key("32")  # type: ignore

    with pytest.raises(TypeError, match="Key length must be an integer"):
        generate_key(32.5)  # type: ignore

    with pytest.raises(TypeError, match="Key length must be an integer"):
        generate_key(True)  # type: ignore

    with pytest.raises(ValueError, match="Key length must be between 16 and 4096 bytes"):
        generate_key(15)

    with pytest.raises(ValueError, match="Key length must be between 16 and 4096 bytes"):
        generate_key(0)

    with pytest.raises(ValueError, match="Key length must be between 16 and 4096 bytes"):
        generate_key(4097)

    with pytest.raises(ValueError, match="Key length must be between 16 and 4096 bytes"):
        generate_key(5000)


def test_create_hmac_invalid_inputs():
    """Test input validation for create_hmac on types and empty key."""
    # Invalid data types
    with pytest.raises(TypeError, match="Data must be bytes or bytearray"):
        create_hmac("invalid string data", b"secret_key")

    # Invalid key types
    with pytest.raises(TypeError, match="Key must be bytes or bytearray"):
        create_hmac(b"hello world", "invalid string key")

    # Empty key
    with pytest.raises(ValueError, match="Key cannot be empty"):
        create_hmac(b"hello world", b"")


def test_create_hmac():
    """Test creating an HMAC-SHA256 signature for data."""
    key = b"secret_key"
    data = b"hello world"

    mac1 = create_hmac(data, key)
    mac2 = create_hmac(data, key)

    assert isinstance(mac1, str)
    assert mac1 == mac2
    assert len(mac1) == 64  # Hex string of 32 bytes

def test_create_hmac_unsupported_algorithm():
    """Test that unsupported HMAC algorithms raise ValueError."""
    key = b"secret_key"
    data = b"hello world"

    with pytest.raises(ValueError, match="Only sha256 is supported"):
        create_hmac(data, key, algorithm='md5')

def test_verify_hmac_success():
    """Test successful verification of a valid HMAC signature."""
    key = b"secret_key"
    data = b"hello world"

    mac = create_hmac(data, key)

    assert verify_hmac(data, key, mac) is True

def test_verify_hmac_failure_wrong_data():
    """Test HMAC verification failure with altered payload."""
    key = b"secret_key"
    data = b"hello world"

    mac = create_hmac(data, key)

    assert verify_hmac(b"hello world!", key, mac) is False

def test_verify_hmac_failure_wrong_key():
    """Test HMAC verification failure with mismatched key."""
    key1 = b"secret_key1"
    key2 = b"secret_key2"
    data = b"hello world"

    mac = create_hmac(data, key1)

    assert verify_hmac(data, key2, mac) is False

def test_verify_hmac_failure_wrong_signature():
    """Test HMAC verification failure with corrupted signature."""
    key = b"secret_key"
    data = b"hello world"

    mac = create_hmac(data, key)
    tampered_mac = mac[:-1] + ('0' if mac[-1] != '0' else '1')

    assert verify_hmac(data, key, tampered_mac) is False

def test_hmac_compare_digest():
    """Test constant-time digest comparison with secrets.compare_digest."""
    assert hmac_compare_digest(b"hello", b"hello") is True
    assert hmac_compare_digest(b"hello", b"world") is False
    assert hmac_compare_digest(b"hello", b"hell") is False
    assert hmac_compare_digest(b"hell", b"hello") is False
    assert hmac_compare_digest(b"", b"") is True
    # Test string input comparisons
    assert hmac_compare_digest("hello", "hello") is True
    assert hmac_compare_digest("hello", "world") is False
    # Test incompatible input types gracefully return False
    assert hmac_compare_digest(b"hello", "hello") is False
    assert hmac_compare_digest(b"hello", None) is False
    assert hmac_compare_digest(12345, b"12345") is False


def test_rsa_sign_and_verify_roundtrip():
    """Test RSA-SHA256 signing and verification with generated keypair."""
    pub_pem, priv_pem = generate_keypair(key_size=512)
    msg = "Museum Digital Signature Exhibit"
    sig = rsa_sign(msg, priv_pem)
    assert isinstance(sig, str)
    assert len(sig) > 0
    assert rsa_verify(msg, sig, pub_pem) is True
    assert rsa_verify(msg.encode("utf-8"), sig.upper(), pub_pem) is True


def test_rsa_verify_failures():
    """Test RSA verification fails on tampered message, tampered signature, or wrong key."""
    pub_pem, priv_pem = generate_keypair(key_size=512)
    other_pub, _ = generate_keypair(key_size=512)
    sig = rsa_sign("Authentic message", priv_pem)

    assert rsa_verify("Tampered message", sig, pub_pem) is False
    tampered_sig = sig[:-1] + ("0" if sig[-1] != "0" else "1")
    assert rsa_verify("Authentic message", tampered_sig, pub_pem) is False
    assert rsa_verify("Authentic message", sig, other_pub) is False
    assert rsa_verify("Authentic message", "not-hex!", pub_pem) is False
    assert rsa_verify("Authentic message", "", pub_pem) is False
    assert rsa_verify("Authentic message", None, pub_pem) is False  # type: ignore


def test_rsa_sign_verify_invalid_inputs():
    """Test RSA sign/verify raise appropriate errors on invalid message or PEM."""
    pub_pem, priv_pem = generate_keypair(key_size=512)
    with pytest.raises(TypeError, match="Message must be"):
        rsa_sign(12345, priv_pem)  # type: ignore
    with pytest.raises(ValueError, match="Invalid PEM"):
        rsa_sign("hello", b"not a pem")
    with pytest.raises(ValueError, match="Invalid PEM"):
        rsa_verify("hello", "abcd", b"not a pem")
    assert rsa_verify("hello", "ff" * 128, pub_pem) is False
