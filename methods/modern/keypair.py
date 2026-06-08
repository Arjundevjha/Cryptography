"""RSA Keypair Generation Module in pure Python.

This module provides functionality for generating RSA public/private key pairs
without external dependencies.
"""

import random

try:
    from .symmetric import encrypt, generate_iv
except ImportError:
    from symmetric import encrypt, generate_iv

try:
    from .helpers import b64encode, sha256
except ImportError:
    from helpers import b64encode, sha256

PRIME_BITS = 512
RSA_EXPONENT = 65537
MIN_PRIME = 2

def is_prime(val: int, tests: int = 5) -> bool:
    """Check if val is prime using Miller-Rabin primality test."""
    if val < MIN_PRIME:
        return False
    if val in {2, 3}:
        return True
    if not val % 2:
        return False

    r, d = 0, val - 1
    for _ in range(d.bit_length()):
        if not d % 2:
            r += 1
            d //= 2
        else:
            break

    for _ in range(tests):
        a = random.randint(2, val - 2)
        if (x := pow(a, d, val)) in {1, val - 1}:
            continue
        for _ in range(r - 1):
            if (x := pow(x, 2, val)) == val - 1:
                break
        else:
            return False
    return True

def generate_prime(bits: int) -> int:
    """Generate a random prime number of specified bit length."""
    # Practical upper bound to avoid while-used warning
    for _ in range(100000):
        n = random.getrandbits(bits)
        n |= (1 << (bits - 1)) | 1
        if is_prime(n):
            return n
    raise RuntimeError("Failed to generate prime")

def generate_keypair(
    key_size: int = 1024,
    public_exponent: int = RSA_EXPONENT
) -> tuple[bytes, bytes]:
    """Generate an RSA key pair.

    Args:
        key_size: The size of the key in bits (default: 1024)
        public_exponent: The public exponent (default: 65537)

    Returns:
        Tuple containing (public_key_pem, private_key_pem) as bytes
    """
    half_size = key_size // 2
    p = generate_prime(half_size)
    q = generate_prime(half_size)
    n = p * q
    phi = (p - 1) * (q - 1)
    d = pow(public_exponent, -1, phi)

    pub_str = f"{n}:{public_exponent}"
    pub_b64 = b64encode(pub_str.encode('utf-8'))
    public_key_pem = (
        f"-----BEGIN RSA PUBLIC KEY-----\n"
        f"{pub_b64}\n"
        f"-----END RSA PUBLIC KEY-----\n"
    ).encode('utf-8')

    priv_str = f"{n}:{public_exponent}:{d}:{p}:{q}"
    priv_b64 = b64encode(priv_str.encode('utf-8'))
    private_key_pem = (
        f"-----BEGIN RSA PRIVATE KEY-----\n"
        f"{priv_b64}\n"
        f"-----END RSA PRIVATE KEY-----\n"
    ).encode('utf-8')

    return public_key_pem, private_key_pem

def generate_encrypted_keypair(
    passphrase: bytes,
    key_size: int = 1024,
    public_exponent: int = RSA_EXPONENT
) -> tuple[bytes, bytes]:
    """Generate an RSA key pair with an encrypted private key.

    Args:
        passphrase: The passphrase to encrypt the private key
        key_size: The size of the key in bits (default: 1024)
        public_exponent: The public exponent (default: 65537)

    Returns:
        Tuple containing (public_key_pem, encrypted_private_key_pem) as bytes
    """
    public_key_pem, private_key_pem = generate_keypair(key_size, public_exponent)

    # Derive AES-256 key from passphrase using SHA-256 helper
    aes_key = sha256(passphrase)
    iv = generate_iv()
    enc_priv = encrypt(private_key_pem.decode('utf-8'), aes_key, iv)

    enc_payload = iv + enc_priv
    enc_b64 = b64encode(enc_payload)

    enc_private_key_pem = (
        f"-----BEGIN ENCRYPTED RSA PRIVATE KEY-----\n"
        f"{enc_b64}\n"
        f"-----END ENCRYPTED RSA PRIVATE KEY-----\n"
    ).encode('utf-8')

    return public_key_pem, enc_private_key_pem

def main():
    """Generate and print a sample RSA keypair."""
    public_key, private_key = generate_keypair()

    print("Public Key:")
    print(public_key.decode('utf-8'))
    print("\nPrivate Key:")
    print(private_key.decode('utf-8'))

if __name__ == "__main__":
    main()
