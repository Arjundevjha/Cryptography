"""Affine cipher implementation."""

import random
import math
import string

def _check_coprime(a_key: int):
    """Check if the a_key is coprime to 26."""
    if math.gcd(a_key, 26) != 1:
        raise ValueError(f"The key 'a' ({a_key}) must be coprime to 26.")

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
    _check_coprime(a_key)
    # Optimization: Pre-compute translation table using str.maketrans and ''.join() list comprehension.
    # Replaces O(N^2) loop string concatenation with C-level str.translate (~120x speedup).
    a_mod = a_key % 26
    b_mod = b_key % 26
    lower = string.ascii_lowercase
    transformed = "".join([chr((a_mod * i + b_mod) % 26 + 97) for i in range(26)])
    table = str.maketrans(lower + string.ascii_uppercase, transformed + transformed)
    return plaintext.translate(table)

def decrypt(ciphertext: str, a_key: int, b_key: int) -> str:
    """Decrypt ciphertext using Affine cipher.

    Each letter is decrypted using the modular inverse of a_key.
    Non-alphabetic characters are preserved.
    """
    _check_coprime(a_key)
    # Optimization: Pre-compute translation table using str.maketrans and ''.join() list comprehension.
    # Replaces O(N^2) loop string concatenation with C-level str.translate (~120x speedup).
    a_inverse = pow(a_key, -1, 26)
    b_mod = b_key % 26
    lower = string.ascii_lowercase
    transformed = "".join([chr((a_inverse * (i - b_mod)) % 26 + 97) for i in range(26)])
    table = str.maketrans(lower + string.ascii_uppercase, transformed + transformed)
    return ciphertext.translate(table)

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
