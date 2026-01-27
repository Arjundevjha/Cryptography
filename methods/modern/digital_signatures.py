import hashlib
import hmac
import os

def generate_key(length: int = 32) -> bytes:
    """
    Generate a random key for HMAC signing.
    
    Args:
        length: Key length in bytes (default: 32)
    
    Returns:
        Random bytes of specified length
    """
    return os.urandom(length)

def create_hmac(data: bytes, key: bytes, algorithm: str = 'sha256') -> str:
    """
    Create an HMAC signature for the given data.
    
    Args:
        data: The data to sign
        key: The secret key for signing
        algorithm: Hash algorithm to use (default: sha256)
    
    Returns:
        HMAC digest as hexadecimal string
    """
    hash_func = getattr(hashlib, algorithm)
    h = hmac.new(key, data, hash_func)
    return h.hexdigest()

def verify_hmac(data: bytes, key: bytes, expected: str, algorithm: str = 'sha256') -> bool:
    """
    Verify an HMAC signature against expected value.
    
    Args:
        data: The original data
        key: The secret key used for signing
        expected: The expected HMAC digest (hex string)
        algorithm: Hash algorithm to use (default: sha256)
    
    Returns:
        True if signature matches, False otherwise
    """
    computed = create_hmac(data, key, algorithm)
    return hmac.compare_digest(computed, expected)

def main():
    # Generate a secret key
    key = generate_key()
    
    # Get message from user
    message = input("Please enter a message to sign: ")
    data = message.encode('utf-8')
    
    # Create signature
    signature = create_hmac(data, key, 'sha256')
    
    # Verify signature
    is_valid = verify_hmac(data, key, signature, 'sha256')
    
    print(f"Original: {message}")
    print(f"Key (hex): {key.hex()}")
    print(f"HMAC-SHA256: {signature}")
    print(f"Verified: {is_valid}")

if __name__ == "__main__":
    main()
