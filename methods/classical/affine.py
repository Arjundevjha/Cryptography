"""Affine cipher implementation."""

import random

def pick_keys():
    """Generate a random key pair (a, b) where a is coprime to 26."""
    coprimes = [
        1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 41,
        43, 45, 47, 49, 51, 53, 55, 57, 59, 61, 63, 67, 69, 71, 73, 75, 77, 79,
        81, 83, 85, 87, 89, 93, 95, 97, 99, 101, 103, 105, 107, 109, 111, 113,
        115, 119, 121, 123, 125, 127, 129, 131, 133, 135, 137, 139, 141, 145,
        147, 149, 151, 153, 155, 157, 159, 161, 163, 165, 167, 171, 173, 175,
        177, 179, 181, 183, 185, 187, 189, 191, 193, 197, 199, 201, 203, 205,
        207, 209, 211, 213, 215
    ]

    a_key = random.choice(coprimes)
    coprimes.remove(a_key)
    b_key = random.choice(coprimes)

    return a_key, b_key

def encrypt(plaintext: str, a_key: int, b_key: int) -> str:
    """Encrypt plaintext using Affine cipher.

    Each letter is mapped to (a_key * x + b_key) % 26.
    Non-alphabetic characters are preserved.
    """
    ciphertext = ""
    for char in plaintext:
        if char.isalpha():
            lower_char = char.lower()
            char_index = ord(lower_char) - ord('a')
            encrypted_char_index = (a_key * char_index + b_key) % 26
            ciphertext += chr(encrypted_char_index + ord('a'))
        else:
            ciphertext += char
    return ciphertext

def decrypt(ciphertext: str, a_key: int, b_key: int) -> str:
    """Decrypt ciphertext using Affine cipher.

    Each letter is decrypted using the modular inverse of a_key.
    Non-alphabetic characters are preserved.
    """
    decrypted_text = ""
    for char in ciphertext:
        if char.isalpha():
            lower_char = char.lower()
            char_index = ord(lower_char) - ord('a')
            a_inverse = pow(a_key, -1, 26)
            decrypted_char_index = (a_inverse * (char_index - b_key)) % 26
            decrypted_text += chr(decrypted_char_index + ord('a'))
        else:
            decrypted_text += char
    return decrypted_text

def main():
    """Run an interactive test of the Affine cipher."""
    message = input("Please enter a message: ")
    a_key, b_key = pick_keys()
    encrypted = encrypt(message, a_key, b_key)
    decrypted = decrypt(encrypted, a_key, b_key)
    print(f"Original: {message}")
    print(f"Key-A: {a_key}")
    print(f"Key-B: {b_key}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")

if __name__ == "__main__":
    main()
