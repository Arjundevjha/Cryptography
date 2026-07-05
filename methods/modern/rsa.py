"""RSA asymmetric encryption and decryption module in pure Python.

This module provides RSA encryption and decryption using custom serialized keys.
No external libraries are used.
"""

import os

try:
    from .symmetric import decrypt as aes_decrypt
except ImportError:
    from symmetric import decrypt as aes_decrypt

try:
    from .helpers import b64decode, sha256
except ImportError:
    from helpers import b64decode, sha256

try:
    from .keypair import generate_keypair, generate_encrypted_keypair
except ImportError:
    from keypair import generate_keypair, generate_encrypted_keypair

# Size constants
IV_SIZE = 16

def _parse_pem(pem_bytes: bytes, header: str, footer: str) -> list[int]:
    """Helper to strip PEM wrapping, decode base64, and split by colon."""
    pem_str = pem_bytes.decode('utf-8').strip()
    payload = pem_str.replace(header, "").replace(footer, "").replace("\n", "")
    decoded = b64decode(payload).decode('utf-8')
    return [int(val) for val in decoded.split(":")]

def decrypt_private_key(enc_private_key_pem: bytes, passphrase: bytes) -> bytes:
    """Decrypt an encrypted private key PEM using the passphrase."""
    pem_str = enc_private_key_pem.decode('utf-8').strip()
    header = "-----BEGIN ENCRYPTED RSA PRIVATE KEY-----"
    footer = "-----END ENCRYPTED RSA PRIVATE KEY-----"
    payload = pem_str.replace(header, "").replace(footer, "").replace("\n", "")

    raw_payload = b64decode(payload)
    iv = raw_payload[:IV_SIZE]
    ciphertext = raw_payload[IV_SIZE:]

    aes_key = sha256(passphrase)
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
    key_params = _parse_pem(
        public_key_pem,
        "-----BEGIN RSA PUBLIC KEY-----",
        "-----END RSA PUBLIC KEY-----"
    )
    n = key_params[0]
    e = key_params[1]

    msg_bytes = message.encode('utf-8')
    key_size_bytes = (n.bit_length() + 7) // 8

    ciphertext = b""
    for b in msg_bytes:
        c = pow(b, e, n)
        ciphertext += c.to_bytes(key_size_bytes, byteorder='big')
    return ciphertext

def decrypt(ciphertext: bytes, private_key_pem: bytes) -> str:
    """Decrypt a message using RSA private key.

    Args:
        ciphertext: Encrypted ciphertext bytes
        private_key_pem: PEM encoded private key bytes

    Returns:
        Decrypted plaintext string
    """
    key_params = _parse_pem(
        private_key_pem,
        "-----BEGIN RSA PRIVATE KEY-----",
        "-----END RSA PRIVATE KEY-----"
    )
    n = key_params[0]
    d = key_params[2]

    key_size_bytes = (n.bit_length() + 7) // 8
    decrypted_bytes = bytearray()
    for i in range(0, len(ciphertext), key_size_bytes):
        if not (block := ciphertext[i : i + key_size_bytes]):
            continue
        c = int.from_bytes(block, byteorder='big')
        m = pow(c, d, n)
        decrypted_bytes.append(m)
    return decrypted_bytes.decode('utf-8')

def main():
    """Demonstrate RSA keypair generation, encryption, and decryption."""
    message = "Secret message for RSA"

    print("--- Testing Unencrypted Keypair ---")
    pub, priv = generate_keypair()
    ciphertext = encrypt(message, pub)
    decrypted = decrypt(ciphertext, priv)
    print(f"Decrypted message: {decrypted}")

    passphrase_str = os.environ.get("RSA_PASSPHRASE")
    if not passphrase_str:
        print("\n--- Skipping Encrypted Keypair Test ---")
        print("To run the encrypted keypair test, set the RSA_PASSPHRASE environment variable.")
        return

    passphrase = passphrase_str.encode("utf-8")

    print("\n--- Testing Encrypted Keypair ---")
    pub_enc, priv_enc = generate_encrypted_keypair(passphrase)
    decrypted_priv = decrypt_private_key(priv_enc, passphrase)
    ciphertext_enc = encrypt(message, pub_enc)
    decrypted_enc = decrypt(ciphertext_enc, decrypted_priv)
    print(f"Decrypted message (with encrypted key): {decrypted_enc}")

if __name__ == "__main__":
    main()
