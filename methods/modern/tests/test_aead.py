"""Unit tests for AES-GCM authenticated encryption (AEAD)."""

import pytest
from methods.modern.aead import aes_gcm_decrypt, aes_gcm_encrypt


def test_aes_gcm_roundtrip_and_aad():
    """Verify AES-GCM encryption/decryption roundtrips with Associated Data."""
    key = bytes.fromhex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff")
    nonce = bytes.fromhex("cafebabefacedbaddecaf888")
    aad = b"header=museum-v1"

    enc = aes_gcm_encrypt("Secret AEAD Payload", key, nonce=nonce, aad=aad)
    dec = aes_gcm_decrypt(
        bytes.fromhex(enc["ciphertext_hex"]),
        key,
        nonce,
        bytes.fromhex(enc["tag_hex"]),
        aad=aad,
    )
    assert dec["valid"] is True
    assert dec["plaintext"] == "Secret AEAD Payload"


def test_aes_gcm_tamper_detection():
    """Verify tampering ciphertext or AAD fails GHASH tag verification."""
    key = b"K" * 32
    enc = aes_gcm_encrypt("Do not tamper", key, aad=b"user=alice")
    ct = bytearray.fromhex(enc["ciphertext_hex"])
    ct[0] ^= 0x01
    nonce = bytes.fromhex(enc["nonce_hex"])
    tag = bytes.fromhex(enc["tag_hex"])

    bad_ct = aes_gcm_decrypt(bytes(ct), key, nonce, tag, aad=b"user=alice")
    assert bad_ct["valid"] is False
    assert bad_ct["plaintext"] is None

    bad_aad = aes_gcm_decrypt(
        bytes.fromhex(enc["ciphertext_hex"]), key, nonce, tag, aad=b"user=admin"
    )
    assert bad_aad["valid"] is False


def test_aes_gcm_validation_errors():
    """Verify invalid key/nonce/tag lengths raise ValueError."""
    with pytest.raises(ValueError, match="key"):
        aes_gcm_encrypt("hi", b"short")
    with pytest.raises(ValueError, match="nonce"):
        aes_gcm_encrypt("hi", b"K" * 16, nonce=b"short")
    with pytest.raises(ValueError, match="tag"):
        aes_gcm_decrypt(b"", b"K" * 16, b"N" * 12, b"short")
