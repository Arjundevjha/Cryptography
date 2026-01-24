"""
RSA Keypair Generation Module

This module provides functionality for generating RSA public/private key pairs
using Python's cryptography library.
"""

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
from typing import Tuple


def generate_keypair(
    key_size: int = 2048,
    public_exponent: int = 65537
) -> Tuple[bytes, bytes]:
    """
    Generate an RSA key pair.
    
    Args:
        key_size: The size of the key in bits (default: 2048)
        public_exponent: The public exponent (default: 65537)
    
    Returns:
        Tuple containing (public_key_pem, private_key_pem) as bytes
    """
    # Generate the private key
    private_key = rsa.generate_private_key(
        public_exponent=public_exponent,
        key_size=key_size,
        backend=default_backend()
    )
    
    # Get the public key from private key
    public_key = private_key.public_key()
    
    # Serialize private key to PEM format
    private_key_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    # Serialize public key to PEM format
    public_key_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    return public_key_pem, private_key_pem


def generate_encrypted_keypair(
    passphrase: bytes,
    key_size: int = 2048,
    public_exponent: int = 65537
) -> Tuple[bytes, bytes]:
    """
    Generate an RSA key pair with an encrypted private key.
    
    Args:
        passphrase: The passphrase to encrypt the private key
        key_size: The size of the key in bits (default: 2048)
        public_exponent: The public exponent (default: 65537)
    
    Returns:
        Tuple containing (public_key_pem, encrypted_private_key_pem) as bytes
    """
    # Generate the private key
    private_key = rsa.generate_private_key(
        public_exponent=public_exponent,
        key_size=key_size,
        backend=default_backend()
    )
    
    # Get the public key from private key
    public_key = private_key.public_key()
    
    # Serialize private key with encryption
    private_key_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.BestAvailableEncryption(passphrase)
    )
    
    # Serialize public key to PEM format
    public_key_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    return public_key_pem, private_key_pem


if __name__ == "__main__":
    # Example usage
    public_key, private_key = generate_keypair()
    
    print("Public Key:")
    print(public_key.decode('utf-8'))
    print("\nPrivate Key:")
    print(private_key.decode('utf-8'))
