"""Caesar cipher implementation."""

import random
import string

def pick_keys() -> int:
    """Generate a random shift key for Caesar cipher (1-25)."""
    return random.randint(1, 25)

def encrypt(plaintext: str, shift: int) -> str:
    """Encrypt plaintext using Caesar cipher.

    Each letter is shifted forward by the shift amount in the alphabet.
    Non-alphabetic characters are preserved.
    """
    shift %= 26
    alphabet = string.ascii_lowercase
    shifted = alphabet[shift:] + alphabet[:shift]
    table = str.maketrans(alphabet + alphabet.upper(),
                          shifted + shifted.upper())
    return plaintext.translate(table)

def decrypt(ciphertext: str, shift: int) -> str:
    """Decrypt ciphertext using Caesar cipher.

    Each letter is shifted backward by the shift amount in the alphabet.
    Non-alphabetic characters are preserved.
    """
    # Decryption is just encryption with the inverse shift
    return encrypt(ciphertext, 26 - shift)

def main():
    """Run an interactive test of the Caesar cipher."""
    message = input("Please enter a message: ")
    shift = pick_keys()
    encrypted = encrypt(message, shift)
    decrypted = decrypt(encrypted, shift)

    print(f"Original: {message}")
    print(f"Shift: {shift}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")

if __name__ == "__main__":
    main()
