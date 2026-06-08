"""RSA asymmetric encryption and decryption module in pure Python.

This module provides RSA encryption and decryption using custom serialized keys.
No external libraries are used.
"""

import base64
import hashlib
import json

try:
    from .symmetric import decrypt as aes_decrypt
except ImportError:
    from symmetric import decrypt as aes_decrypt

try:
    from .keypair import generate_keypair, generate_encrypted_keypair
except ImportError:
    from keypair import generate_keypair, generate_encrypted_keypair

# Size constants
IV_SIZE = 16

def _parse_pem(pem_bytes: bytes, header: str, footer: str) -> dict:
    """Helper to strip PEM wrapping and parse base64 JSON payload."""
    pem_str = pem_bytes.decode('utf-8').strip()
    payload = pem_str.replace(header, "").replace(footer, "").replace("\n", "")
    decoded = base64.b64decode(payload.encode('utf-8')).decode('utf-8')
    return json.loads(decoded)

def decrypt_private_key(enc_private_key_pem: bytes, passphrase: bytes) -> bytes:
    """Decrypt an encrypted private key PEM using the passphrase."""
    pem_str = enc_private_key_pem.decode('utf-8').strip()
    header = "-----BEGIN ENCRYPTED RSA PRIVATE KEY-----"
    footer = "-----END ENCRYPTED RSA PRIVATE KEY-----"
    payload = pem_str.replace(header, "").replace(footer, "").replace("\n", "")

    raw_payload = base64.b64decode(payload.encode('utf-8'))
    iv = raw_payload[:IV_SIZE]
    ciphertext = raw_payload[IV_SIZE:]

    aes_key = hashlib.sha256(passphrase).digest()
    decrypted_pem = aes_decrypt(ciphertext, aes_key, iv)
    return decrypted_pem.encode('utf-8')

def encrypt(message: str, public_key_pem: bytes) -> bytes:
    """Encrypt a message using RSA public key.

    Args:
        message: Plaintext message string
        public_key_pem: PEM encoded public key bytes

    Returns:
        Ciphertext bytes
    """
    key_dict = _parse_pem(
        public_key_pem,
        "-----BEGIN RSA PUBLIC KEY-----",
        "-----END RSA PUBLIC KEY-----"
    )
    n = key_dict["n"]
    e = key_dict["e"]

    msg_bytes = message.encode('utf-8')
    if (m := int.from_bytes(msg_bytes, byteorder='big')) >= n:
        raise ValueError("Message too large for RSA key size")

    c = pow(m, e, n)
    key_size_bytes = (n.bit_length() + 7) // 8
    return c.to_bytes(key_size_bytes, byteorder='big')

def decrypt(ciphertext: bytes, private_key_pem: bytes) -> str:
    """Decrypt a message using RSA private key.

    Args:
        ciphertext: Encrypted ciphertext bytes
        private_key_pem: PEM encoded private key bytes

    Returns:
        Decrypted plaintext string
    """
    key_dict = _parse_pem(
        private_key_pem,
        "-----BEGIN RSA PRIVATE KEY-----",
        "-----END RSA PRIVATE KEY-----"
    )
    n = key_dict["n"]
    d = key_dict["d"]

    c = int.from_bytes(ciphertext, byteorder='big')
    m = pow(c, d, n)
    key_size_bytes = (n.bit_length() + 7) // 8
    msg_bytes = m.to_bytes(key_size_bytes, byteorder='big')
    return msg_bytes.decode('utf-8').lstrip('\x00')

def main():
    """Demonstrate RSA keypair generation, encryption, and decryption."""
    message = "Secret message for RSA"
    passphrase = b"supersecretpassphrase"

    print("--- Testing Unencrypted Keypair ---")
    pub, priv = generate_keypair()
    ciphertext = encrypt(message, pub)
    decrypted = decrypt(ciphertext, priv)
    print(f"Decrypted message: {decrypted}")

    print("\n--- Testing Encrypted Keypair ---")
    pub_enc, priv_enc = generate_encrypted_keypair(passphrase)
    decrypted_priv = decrypt_private_key(priv_enc, passphrase)
    ciphertext_enc = encrypt(message, pub_enc)
    decrypted_enc = decrypt(ciphertext_enc, decrypted_priv)
    print(f"Decrypted message (with encrypted key): {decrypted_enc}")

if __name__ == "__main__":
    main()
