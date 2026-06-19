"""Substitution cipher implementation."""

import random
import string

def pick_keys() -> dict:
    """Generate a random substitution key mapping each letter to another.

    Returns a dictionary mapping each lowercase letter to a unique substitute.
    """
    alphabet = list(string.ascii_lowercase)
    shuffled = alphabet.copy()
    random.shuffle(shuffled)
    return dict(zip(alphabet, shuffled))

def _invert_key(key: dict) -> dict:
    """Create inverse mapping for decryption."""
    return {v: k for k, v in key.items()}

def encrypt(plaintext: str, key: dict) -> str:
    """Encrypt plaintext using substitution cipher.

    Each letter is replaced according to the key mapping.
    Non-alphabetic characters are preserved.
    """
    ciphertext = ""
    for char in plaintext:
        if char.lower() in key:
            substituted = key[char.lower()]
            # Preserve original case
            ciphertext += substituted.upper() if char.isupper() else substituted
        else:
            ciphertext += char
    return ciphertext

def decrypt(ciphertext: str, key: dict) -> str:
    """Decrypt ciphertext using substitution cipher.

    Each letter is replaced according to the inverse key mapping.
    Non-alphabetic characters are preserved.
    """
    inverse_key = _invert_key(key)
    plaintext = ""
    for char in ciphertext:
        if char.lower() in inverse_key:
            substituted = inverse_key[char.lower()]
            # Preserve original case
            plaintext += substituted.upper() if char.isupper() else substituted
        else:
            plaintext += char
    return plaintext

def main():
    """Run an interactive test of the substitution cipher."""
    raw_msg = input("Please enter a message for Substitution: ")
    sub_map = pick_keys()
    substituted_text = encrypt(raw_msg, sub_map)
    restored_text = decrypt(substituted_text, sub_map)

    print(f"Substitution Input Message: {raw_msg}")
    print(f"Substitution Cipher Key Map: {''.join(sub_map.values())}")
    print(f"Substitution Ciphertext (Encrypted): {substituted_text}")
    print(f"Substitution Restored Message (Decrypted): {restored_text}")

if __name__ == "__main__":
    main()
