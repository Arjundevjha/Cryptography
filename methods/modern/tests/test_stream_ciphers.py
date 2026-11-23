"""Unit tests for methods.modern.stream_ciphers (OTP and ChaCha20 RFC 8439)."""

import pytest

from methods.modern import stream_ciphers


def test_otp_roundtrip_and_keygen():
    """Test OTP key generation, encryption/decryption round-trip, and UTF-8 support."""
    key = stream_ciphers.otp_generate_key(32)
    assert len(key) == 32

    plaintext = "Perfect secrecy with One-Time Pad!"
    ct = stream_ciphers.otp_encrypt(plaintext, key * 2)
    assert ct != plaintext.encode("utf-8")
    assert stream_ciphers.otp_decrypt(ct, key * 2).decode("utf-8") == plaintext

    # UTF-8 multi-byte characters
    utf8_msg = "Crypto Museum 🔐✨"
    utf8_key = stream_ciphers.otp_generate_key(len(utf8_msg.encode("utf-8")))
    utf8_ct = stream_ciphers.otp_encrypt(utf8_msg, utf8_key)
    assert stream_ciphers.otp_decrypt(utf8_ct, utf8_key).decode("utf-8") == utf8_msg


def test_otp_validation_errors():
    """Test that OTP key generation and encrypt/decrypt validate inputs."""
    with pytest.raises(ValueError):
        stream_ciphers.otp_generate_key(0)
    with pytest.raises(TypeError):
        stream_ciphers.otp_generate_key(True)  # type: ignore[arg-type]
    with pytest.raises(ValueError):
        stream_ciphers.otp_encrypt("hello", b"")
    with pytest.raises(ValueError):
        stream_ciphers.otp_encrypt("hello", b"abc")
    with pytest.raises(ValueError):
        stream_ciphers.otp_decrypt(b"hello", b"abc")
    with pytest.raises(TypeError):
        stream_ciphers.otp_decrypt("not-bytes", b"123456789")  # type: ignore[arg-type]


def test_chacha20_rfc8439_block_vector():
    """Verify ChaCha20 block function against RFC 8439 Section 2.3.2."""
    key = bytes.fromhex(
        "000102030405060708090a0b0c0d0e0f"
        "101112131415161718191a1b1c1d1e1f"
    )
    nonce = bytes.fromhex("000000090000004a00000000")
    expected_block = bytes.fromhex(
        "10f1e7e4d13b5915500fdd1fa32071c4"
        "c7d1f4c733c068030422aa9ac3d46c4e"
        "d2826446079faa0914c2d705d98b02a2"
        "b5129cd1de164eb9cbd083e8a2503c4e"
    )
    assert stream_ciphers.chacha20_block(key, 1, nonce) == expected_block


def test_chacha20_rfc8439_encrypt_vector():
    """Verify ChaCha20 encryption against RFC 8439 Section 2.4.2."""
    key = bytes.fromhex(
        "000102030405060708090a0b0c0d0e0f"
        "101112131415161718191a1b1c1d1e1f"
    )
    nonce = bytes.fromhex("000000000000004a00000000")
    plaintext = (
        b"Ladies and Gentlemen of the class of '99: "
        b"If I could offer you only one tip for the future, sunscreen would be it."
    )
    expected_ct = bytes.fromhex(
        "6e2e359a2568f98041ba0728dd0d6981"
        "e97e7aec1d4360c20a27afccfd9fae0b"
        "f91b65c5524733ab8f593dabcd62b357"
        "1639d624e65152ab8f530c359f0861d8"
        "07ca0dbf500d6a6156a38e088a22b65e"
        "52bc514d16ccf806818ce91ab7793736"
        "5af90bbf74a35be6b40b8eedf2785e42"
        "874d"
    )
    ct = stream_ciphers.chacha20_encrypt(plaintext, key, nonce, counter=1)
    assert ct == expected_ct
    assert stream_ciphers.chacha20_decrypt(ct, key, nonce, counter=1) == plaintext


def test_chacha20_multiblock_and_validation():
    """Test ChaCha20 multi-block encryption and input validation."""
    key, nonce = stream_ciphers.pick_keys()
    msg = "ChaCha20 multi-block stream test! " * 5  # > 128 bytes
    ct = stream_ciphers.chacha20_encrypt(msg, key, nonce, counter=0)
    assert stream_ciphers.chacha20_decrypt(ct, key, nonce, counter=0).decode("utf-8") == msg

    assert stream_ciphers.chacha20_keystream(key, nonce, 0) == b""
    assert len(stream_ciphers.chacha20_keystream(key, nonce, 70)) == 70

    with pytest.raises(ValueError):
        stream_ciphers.chacha20_block(b"short", 1, nonce)
    with pytest.raises(ValueError):
        stream_ciphers.chacha20_block(key, 1, b"short")
    with pytest.raises(ValueError):
        stream_ciphers.chacha20_block(key, -1, nonce)
    with pytest.raises(ValueError):
        stream_ciphers.chacha20_block(key, 2**32, nonce)
    with pytest.raises(ValueError):
        stream_ciphers.chacha20_keystream(key, nonce, 128, counter=2**32 - 1)
