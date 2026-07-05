import pytest
from methods.modern.digital_signatures import (
    generate_key,
    create_hmac,
    verify_hmac,
    hmac_compare_digest
)

def test_generate_key():
    key1 = generate_key()
    key2 = generate_key()

    assert len(key1) == 32
    assert len(key2) == 32
    assert key1 != key2

def test_generate_key_custom_length():
    key = generate_key(16)
    assert len(key) == 16

def test_create_hmac():
    key = b"secret_key"
    data = b"hello world"

    mac1 = create_hmac(data, key)
    mac2 = create_hmac(data, key)

    assert isinstance(mac1, str)
    assert mac1 == mac2
    assert len(mac1) == 64  # Hex string of 32 bytes

def test_create_hmac_unsupported_algorithm():
    key = b"secret_key"
    data = b"hello world"

    with pytest.raises(ValueError, match="Only sha256 is supported"):
        create_hmac(data, key, algorithm='md5')

def test_verify_hmac_success():
    key = b"secret_key"
    data = b"hello world"

    mac = create_hmac(data, key)

    assert verify_hmac(data, key, mac) is True

def test_verify_hmac_failure_wrong_data():
    key = b"secret_key"
    data = b"hello world"

    mac = create_hmac(data, key)

    assert verify_hmac(b"hello world!", key, mac) is False

def test_verify_hmac_failure_wrong_key():
    key1 = b"secret_key1"
    key2 = b"secret_key2"
    data = b"hello world"

    mac = create_hmac(data, key1)

    assert verify_hmac(data, key2, mac) is False

def test_verify_hmac_failure_wrong_signature():
    key = b"secret_key"
    data = b"hello world"

    mac = create_hmac(data, key)
    tampered_mac = mac[:-1] + ('0' if mac[-1] != '0' else '1')

    assert verify_hmac(data, key, tampered_mac) is False

def test_hmac_compare_digest():
    assert hmac_compare_digest(b"hello", b"hello") is True
    assert hmac_compare_digest(b"hello", b"world") is False
    assert hmac_compare_digest(b"hello", b"hell") is False
    assert hmac_compare_digest(b"hell", b"hello") is False
    assert hmac_compare_digest(b"", b"") is True
