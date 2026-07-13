"""AES symmetric encryption using manual AES-256-CTR in pure Python.

Reuses the AES block cipher from symmetric.py.
No external libraries are used.
"""

import os
import secrets

try:
    from .symmetric import encrypt_block, key_expansion, generate_key
except ImportError:
    from symmetric import encrypt_block, key_expansion, generate_key

NONCE_SIZE = 12
BLOCK_SIZE = 16

def encrypt(message: str, key: bytes) -> tuple[bytes, bytes]:
    """Encrypt a message using AES-256-CTR mode.

    Args:
        message: Plaintext message to encrypt
        key: 32-byte key

    Returns:
        Tuple of (ciphertext, 12-byte nonce)
    """
    round_keys = key_expansion(key)
    nonce = secrets.token_bytes(NONCE_SIZE)
    plaintext_bytes = message.encode('utf-8')

    ciphertext = b""
    counter = 0

    for i in range(0, len(plaintext_bytes), BLOCK_SIZE):
        block = plaintext_bytes[i : i + BLOCK_SIZE]
        # Construct the 16-byte counter block (12-byte nonce + 4-byte counter)
        counter_block = nonce + counter.to_bytes(4, byteorder='big')
        keystream = encrypt_block(counter_block, round_keys)
        # XOR block with keystream
        xor_block = bytes(x ^ y for x, y in zip(block, keystream))
        ciphertext += xor_block
        counter += 1

    return ciphertext, nonce

def decrypt(ciphertext: bytes, key: bytes, nonce: bytes) -> str:
    """Decrypt a message encrypted with AES-256-CTR mode.

    Args:
        ciphertext: Encrypted payload bytes
        key: 32-byte key
        nonce: 12-byte nonce

    Returns:
        Decrypted plaintext message string
    """
    round_keys = key_expansion(key)
    decrypted_bytes = b""
    counter = 0

    for i in range(0, len(ciphertext), BLOCK_SIZE):
        block = ciphertext[i : i + BLOCK_SIZE]
        counter_block = nonce + counter.to_bytes(4, byteorder='big')
        keystream = encrypt_block(counter_block, round_keys)
        xor_block = bytes(x ^ y for x, y in zip(block, keystream))
        decrypted_data = xor_block
        decrypted_bytes += decrypted_data
        counter += 1

    return decrypted_bytes.decode('utf-8')

def main():
    """Demonstrate AES-CTR encryption and decryption."""
    message = "Secret message for AES-CTR"
    key = generate_key()
    ciphertext, nonce = encrypt(message, key)
    decrypted = decrypt(ciphertext, key, nonce)

    print(f"Original: {message}")
    print(f"Key (hex): {key.hex()}")
    print(f"Nonce (hex): {nonce.hex()}")
    print(f"Ciphertext (hex): {ciphertext.hex()}")
    print(f"Decrypted: {decrypted}")

if __name__ == "__main__":
    main()
