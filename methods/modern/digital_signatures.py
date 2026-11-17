"""HMAC digital signatures module in pure Python.

No external libraries or standard hashlib/hmac libraries are used.
"""

import secrets
try:
    from .helpers import hmac_sha256, sha256
except ImportError:
    from helpers import hmac_sha256, sha256

try:
    from .rsa import _parse_pem
except ImportError:
    from rsa import _parse_pem

ALGORITHM_NAME = "sha256"

def generate_key(length: int = 32) -> bytes:
    """Generate a random key for HMAC signing.

    Args:
        length: Key length in bytes (default: 32)

    Returns:
        Random bytes of specified length
    """
    # Security: Validate type and bounds to prevent weak keys or CPU/Memory DoS attacks
    if not isinstance(length, int) or isinstance(length, bool):
        raise TypeError("Key length must be an integer")
    if not 16 <= length <= 4096:
        raise ValueError("Key length must be between 16 and 4096 bytes")
    return secrets.token_bytes(length)

def create_hmac(data: bytes, key: bytes, algorithm: str = 'sha256') -> str:
    """Create an HMAC signature for the given data.

    Args:
        data: The data to sign
        key: The secret key for signing
        algorithm: Hash algorithm to use (default: sha256)

    Returns:
        HMAC digest as hexadecimal string
    """
    if not isinstance(data, (bytes, bytearray)):
        raise TypeError("Data must be bytes or bytearray")
    if not isinstance(key, (bytes, bytearray)):
        raise TypeError("Key must be bytes or bytearray")
    if len(key) == 0:
        raise ValueError("Key cannot be empty")
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
    if not isinstance(expected, str):
        return False
    try:
        computed = create_hmac(data, key, algorithm)
        # Normalize hex strings to lowercase for case-insensitive verification
        # before constant-time comparison
        return hmac_compare_digest(
            computed.lower().encode('utf-8'),
            expected.strip().lower().encode('utf-8')
        )
    except (ValueError, KeyError, TypeError, AttributeError):
        return False

def hmac_compare_digest(val_a: bytes | str, val_b: bytes | str) -> bool:
    """Compare two digests in constant time using secrets.compare_digest
    to prevent timing attacks.
    """
    try:
        return secrets.compare_digest(val_a, val_b)
    except TypeError:
        return False


def _normalize_message_bytes(message: str | bytes | bytearray) -> bytes:
    """Normalize a string or byte sequence to raw bytes for hashing."""
    if isinstance(message, str):
        return message.encode("utf-8")
    if isinstance(message, (bytes, bytearray)):
        return bytes(message)
    raise TypeError("Message must be a str, bytes, or bytearray")


def rsa_sign(message: str | bytes | bytearray, private_key_pem: bytes) -> str:
    """Sign a message using RSA private key and SHA-256 digest.

    Computes s = (SHA256(message) mod n)^d mod n and returns the fixed-width
    big-endian hexadecimal signature.
    """
    msg_bytes = _normalize_message_bytes(message)
    key_params = _parse_pem(
        private_key_pem,
        "-----BEGIN RSA PRIVATE KEY-----",
        "-----END RSA PRIVATE KEY-----",
    )
    if len(key_params) < 3:
        raise ValueError("Invalid RSA private key PEM: missing private exponent d")
    n = key_params[0]
    d = key_params[2]
    if n < 256 or d <= 0:
        raise ValueError("Invalid RSA private key parameters")

    digest_int = int.from_bytes(sha256(msg_bytes), "big") % n
    sig_int = pow(digest_int, d, n)
    key_size_bytes = (n.bit_length() + 7) // 8
    return sig_int.to_bytes(key_size_bytes, "big").hex()


def rsa_verify(
    message: str | bytes | bytearray,
    signature_hex: str,
    public_key_pem: bytes,
) -> bool:
    """Verify an RSA-SHA256 hex signature using the signer's RSA public key."""
    msg_bytes = _normalize_message_bytes(message)
    key_params = _parse_pem(
        public_key_pem,
        "-----BEGIN RSA PUBLIC KEY-----",
        "-----END RSA PUBLIC KEY-----",
    )
    if len(key_params) < 2:
        raise ValueError("Invalid RSA public key PEM: missing modulus or exponent")
    n = key_params[0]
    e = key_params[1]
    if n < 256 or e <= 0:
        raise ValueError("Invalid RSA public key parameters")

    if not isinstance(signature_hex, str):
        return False
    cleaned_sig = signature_hex.strip()
    if not cleaned_sig:
        return False
    try:
        sig_bytes = bytes.fromhex(cleaned_sig)
    except ValueError:
        return False

    sig_int = int.from_bytes(sig_bytes, "big")
    if sig_int >= n:
        return False

    recovered_int = pow(sig_int, e, n)
    expected_int = int.from_bytes(sha256(msg_bytes), "big") % n
    key_size_bytes = (n.bit_length() + 7) // 8
    return hmac_compare_digest(
        recovered_int.to_bytes(key_size_bytes, "big"),
        expected_int.to_bytes(key_size_bytes, "big"),
    )

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
