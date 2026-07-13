import os
from unittest.mock import patch

from methods.modern.aes import encrypt, decrypt, NONCE_SIZE, BLOCK_SIZE

# Use the KAT generated earlier
KAT_KEY = bytes.fromhex("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f")
KAT_NONCE = bytes.fromhex("000102030405060708090a0b")
KAT_PLAINTEXT = "Hello, World! This is a Known Answer Test for AES-256-CTR. It should be long enough."
KAT_CIPHERTEXT = bytes.fromhex("f5b920a6de7c469bae8c07689b336ade9db1fb74b0a8648330fc786b332ac0a23475b369e5b1a768f961f1e4c3c93928d0fbb501c6561c286a49c5cc694973da6e65c2988fa377b818cb118aa8e246579b3e08a3")

def test_aes_encrypt_kat():
    """Known Answer Test for AES-256-CTR encryption."""
    with patch('secrets.token_bytes', return_value=KAT_NONCE):
        ciphertext, nonce = encrypt(KAT_PLAINTEXT, KAT_KEY)

    assert nonce == KAT_NONCE
    assert ciphertext == KAT_CIPHERTEXT

def test_aes_decrypt_kat():
    """Known Answer Test for AES-256-CTR decryption."""
    decrypted = decrypt(KAT_CIPHERTEXT, KAT_KEY, KAT_NONCE)
    assert decrypted == KAT_PLAINTEXT

def test_aes_encrypt_decrypt_roundtrip():
    """Test that encrypting and decrypting a message recovers the original."""
    key = os.urandom(32) # Test data generation doesn't need secrets module, but we can update anyway or leave it. We'll use os.urandom for testing.
    message = "A test message with arbitrary length!"
    ciphertext, nonce = encrypt(message, key)
    decrypted = decrypt(ciphertext, key, nonce)

    assert decrypted == message
    assert len(nonce) == NONCE_SIZE

def test_aes_encrypt_empty_message():
    """Test encryption of an empty string."""
    key = os.urandom(32)
    ciphertext, nonce = encrypt("", key)

    assert ciphertext == b""
    assert len(nonce) == NONCE_SIZE

    decrypted = decrypt(ciphertext, key, nonce)
    assert decrypted == ""

def test_aes_encrypt_unique_nonces():
    """Test that consecutive encrypt calls generate unique nonces."""
    key = os.urandom(32)
    message = "Message"
    _, nonce1 = encrypt(message, key)
    _, nonce2 = encrypt(message, key)

    assert nonce1 != nonce2

def test_aes_long_message():
    """Test encryption and decryption with a message larger than multiple blocks."""
    key = os.urandom(32)
    message = "A" * (BLOCK_SIZE * 5 + 7)  # 5 full blocks + partial block
    ciphertext, nonce = encrypt(message, key)

    assert len(ciphertext) == len(message.encode('utf-8'))

    decrypted = decrypt(ciphertext, key, nonce)
    assert decrypted == message
