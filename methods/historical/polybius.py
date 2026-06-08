"""Polybius Square cipher implementation."""

import random

ALPHABET = "abcdefghiklmnopqrstuvwxyz"
GRID_SIZE = 5

def pick_keys() -> str:
    """Generate a random key grid by shuffling the alphabet."""
    chars = list(ALPHABET)
    random.shuffle(chars)
    return "".join(chars)

def encrypt(plaintext: str, key: str) -> str:
    """Encrypt plaintext using the Polybius Square cipher.

    Maps each letter to a two-digit coordinate string (row and column).
    Non-alphabetic characters are preserved.
    """
    ciphertext = ""
    for char in plaintext:
        if char.isalpha():
            lower_char = char.lower().replace("j", "i")
            idx = key.index(lower_char)
            row = (idx // GRID_SIZE) + 1
            col = (idx % GRID_SIZE) + 1
            ciphertext += f"{row}{col}"
        else:
            ciphertext += char
    return ciphertext

def decrypt(ciphertext: str, key: str) -> str:
    """Decrypt ciphertext using the Polybius Square cipher.

    Parses two-digit coordinates back into characters.
    Non-digit/non-coordinate characters are preserved.
    """
    plaintext = ""
    iterator = iter(ciphertext)
    for char1 in iterator:
        if char1.isdigit():
            char2 = next(iterator, None)
            if char2 and char2.isdigit():
                row = int(char1) - 1
                col = int(char2) - 1
                if 0 <= row < GRID_SIZE and 0 <= col < GRID_SIZE:
                    idx = row * GRID_SIZE + col
                    plaintext += key[idx]
                else:
                    plaintext += char1 + char2
            else:
                plaintext += char1
                if char2:
                    plaintext += char2
        else:
            plaintext += char1
    return plaintext

def main():
    """Run an interactive test of the Polybius Square cipher."""
    message = input("Please enter a message: ")
    key = pick_keys()
    encrypted = encrypt(message, key)
    decrypted = decrypt(encrypted, key)

    grid_rows = [key[i:i+5] for i in range(0, 25, 5)]

    print(f"Original: {message}")
    print("Grid Key:")
    for row in grid_rows:
        print(" ".join(row))
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")

if __name__ == "__main__":
    main()
