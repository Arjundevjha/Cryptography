"""Polybius Square cipher implementation."""

import random

ALPHABET = "abcdefghiklmnopqrstuvwxyz"
GRID_SIZE = 5

def pick_keys() -> str:
    """Generate a random key grid by shuffling the alphabet."""
    chars = list(ALPHABET)
    random.shuffle(chars)
    return "".join(chars)

def encrypt(plaintext: str, key: str = None) -> str:
    """Encrypt plaintext using the Polybius Square cipher.

    Maps each letter to a two-digit coordinate string (row and column).
    Non-alphabetic characters are preserved.
    """
    if not key:
        key = ALPHABET
    ciphertext_parts = []
    last_was_digit = False
    for char in plaintext:
        if char.isalpha():
            lower_char = char.lower().replace("j", "i")
            idx = key.index(lower_char)
            row = (idx // GRID_SIZE) + 1
            col = (idx % GRID_SIZE) + 1
            if last_was_digit:
                ciphertext_parts.append(f" {row}{col}")
            else:
                ciphertext_parts.append(f"{row}{col}")
            last_was_digit = True
        else:
            ciphertext_parts.append(char)
            last_was_digit = char.isdigit()
    return "".join(ciphertext_parts)

def decrypt(ciphertext: str, key: str = None) -> str:
    """Decrypt ciphertext using the Polybius Square cipher.

    Parses two-digit coordinates back into characters.
    Non-digit/non-coordinate characters are preserved.
    """
    if not key:
        key = ALPHABET
    plaintext_parts = []
    iterator = iter(ciphertext.replace(" ", ""))
    for char1 in iterator:
        if char1.isdigit():
            char2 = next(iterator, None)
            if char2 and char2.isdigit():
                row = int(char1) - 1
                col = int(char2) - 1
                if 0 <= row < GRID_SIZE and 0 <= col < GRID_SIZE:
                    idx = row * GRID_SIZE + col
                    plaintext_parts.append(key[idx])
                else:
                    plaintext_parts.append(char1)
                    plaintext_parts.append(char2)
            else:
                plaintext_parts.append(char1)
                if char2:
                    plaintext_parts.append(char2)
        else:
            plaintext_parts.append(char1)
    return "".join(plaintext_parts).upper()

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
