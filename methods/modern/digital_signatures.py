"""HMAC digital signatures module in pure Python.

No external libraries or standard hashlib/hmac libraries are used.
"""

import os
try:
    from .helpers import hmac_sha256
except ImportError:
    from helpers import hmac_sha256

ALGORITHM_NAME = "sha256"

def generate_key(length: int = 32) -> bytes:
    """Generate a random key for HMAC signing.

    Args:
        length: Key length in bytes (default: 32)

    Returns:
        Random bytes of specified length
    """
    return os.urandom(length)

def create_hmac(data: bytes, key: bytes, algorithm: str = 'sha256') -> str:
    """Create an HMAC signature for the given data.

    Args:
        data: The data to sign
        key: The secret key for signing
        algorithm: Hash algorithm to use (default: sha256)

    Returns:
        HMAC digest as hexadecimal string
    """
    if algorithm != ALGORITHM_NAME:
        raise ValueError("Only sha256 is supported in this pure Python implementation")
    return hmac_sha256(key, data).hex()

def verify_hmac(data: bytes, key: bytes, expected: str, algorithm: str = 'sha256') -> bool:
    """Verify an HMAC signature against expected value.

    Args:
        data: The original data
        key: The secret key used for signing
        expected: The expected HMAC digest (hex string)
        algorithm: Hash algorithm to use (default: sha256)

    Returns:
        True if signature matches, False otherwise
    """
    computed = create_hmac(data, key, algorithm)
    # Constant-time comparison to prevent timing attacks
    return hmac_compare_digest(computed.encode('utf-8'), expected.encode('utf-8'))

def hmac_compare_digest(val_a: bytes, val_b: bytes) -> bool:
    """Compare two digests in constant time to prevent timing attacks."""
    if len(val_a) != len(val_b):
        return False
    result = 0
    for x, y in zip(val_a, val_b):
        result |= x ^ y
    return not result

def main():
    """Run a test of key generation, signing, and verification using HMAC."""
    key = generate_key()

    message = input("Please enter a message to sign: ")
    data = message.encode('utf-8')

    signature = create_hmac(data, key, 'sha256')
    is_valid = verify_hmac(data, key, signature, 'sha256')

    print(f"Original: {message}")
    print(f"Key (hex): {key.hex()}")
    print(f"HMAC-SHA256: {signature}")
    print(f"Verified: {is_valid}")

if __name__ == "__main__":
    main()
