"""Scytale transposition cipher implementation."""

import random

def pick_keys() -> int:
    """Generate a random cylinder diameter (3-8)."""
    return random.randint(3, 8)

def encrypt(plaintext: str, diameter: int) -> str:
    """Encrypt plaintext using the Scytale cipher.

    Pads the plaintext and performs a column-wise transposition.
    """
    if diameter <= 0:
        raise ValueError("Diameter must be positive")

    # Pad plaintext to a multiple of diameter
    padding_len = (diameter - (len(plaintext) % diameter)) % diameter
    padded_text = plaintext + " " * padding_len

    num_rows = len(padded_text) // diameter
    ciphertext = ""

    for col in range(diameter):
        for row in range(num_rows):
            ciphertext += padded_text[row * diameter + col]

    return ciphertext

def decrypt(ciphertext: str, diameter: int) -> str:
    """Decrypt ciphertext using the Scytale cipher.

    Reverses the column-wise transposition of the Scytale cipher.
    """
    if diameter <= 0:
        raise ValueError("Diameter must be positive")
    if not ciphertext:
        return ""

    num_rows = len(ciphertext) // diameter
    # Decryption is symmetric transposition with num_rows
    decrypted = encrypt(ciphertext, num_rows)
    return decrypted.rstrip()

def main():
    """Run an interactive test of the Scytale cipher."""
    message = input("Please enter a message: ")
    diameter = pick_keys()
    encrypted = encrypt(message, diameter)
    decrypted = decrypt(encrypted, diameter)

    print(f"Original: {message}")
    print(f"Diameter: {diameter}")
    print(f"Encrypted: '{encrypted}'")
    print(f"Decrypted: '{decrypted}'")

if __name__ == "__main__":
    main()
