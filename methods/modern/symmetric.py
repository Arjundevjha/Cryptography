"""
Symmetric Encryption Module (AES-256)

This module provides symmetric encryption and decryption functionality
using AES-256 in CBC mode with PKCS7 padding.
"""

import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
from typing import Tuple


def generate_key() -> bytes:
    """
    Generate a random 256-bit (32 bytes) key for AES-256.
    
    Returns:
        Random 32-byte key
    """
    return os.urandom(32)


def generate_iv() -> bytes:
    """
    Generate a random 128-bit (16 bytes) initialization vector.
    
    Returns:
        Random 16-byte IV
    """
    return os.urandom(16)


def encrypt(message: str, key: bytes, iv: bytes) -> bytes:
    """
    Encrypt a message using AES-256-CBC.
    
    Args:
        message: The plaintext message to encrypt
        key: The 32-byte encryption key
        iv: The 16-byte initialization vector
    
    Returns:
        The encrypted ciphertext as bytes
    """
    # Pad the message to a multiple of 16 bytes
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(message.encode('utf-8')) + padder.finalize()
    
    # Create cipher and encrypt
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()
    
    return ciphertext


def decrypt(ciphertext: bytes, key: bytes, iv: bytes) -> str:
    """
    Decrypt a message using AES-256-CBC.
    
    Args:
        ciphertext: The encrypted data
        key: The 32-byte encryption key
        iv: The 16-byte initialization vector
    
    Returns:
        The decrypted plaintext as a string
    """
    # Create cipher and decrypt
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    padded_data = decryptor.update(ciphertext) + decryptor.finalize()
    
    # Unpad the decrypted message
    unpadder = padding.PKCS7(128).unpadder()
    data = unpadder.update(padded_data) + unpadder.finalize()
    
    return data.decode('utf-8')


def encrypt_with_new_key(message: str) -> Tuple[bytes, bytes, bytes]:
    """
    Encrypt a message with a newly generated key and IV.
    
    Args:
        message: The plaintext message to encrypt
    
    Returns:
        Tuple of (ciphertext, key, iv)
    """
    key = generate_key()
    iv = generate_iv()
    ciphertext = encrypt(message, key, iv)
    return ciphertext, key, iv


if __name__ == "__main__":
    # Example usage
    message = "This is a Test"
    
    key = generate_key()
    iv = generate_iv()
    
    encrypted = encrypt(message, key, iv)
    print(f"Encrypted: {encrypted.hex()}")
    
    decrypted = decrypt(encrypted, key, iv)
    print(f"Decrypted: {decrypted}")
