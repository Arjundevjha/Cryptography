"""Vigenere cipher implementation."""

import random
import string

MODE_ENCRYPT = 'encrypt'

def _pad_key(text: str, key: str) -> str:
    """Pad the key to match the length of the text, cycling through key characters."""
    padded_key = ''
    i = 0
    for char in text:
        if char.isalpha():
            padded_key += key[i % len(key)]
            i += 1
        else:
            padded_key += ' '
    return padded_key

def _encrypt_decrypt_char(text_char: str, key_char: str, mode: str = MODE_ENCRYPT) -> str:
    """Encrypt or decrypt a single character using the Vigenère method."""
    if text_char.isalpha():
        first_alphabet_letter = 'a'
        if text_char.isupper():
            first_alphabet_letter = 'A'

        old_char_position = ord(text_char) - ord(first_alphabet_letter)
        key_char_position = ord(key_char.lower()) - ord('a')

        if mode == MODE_ENCRYPT:
            new_char_position = (old_char_position + key_char_position) % 26
        else:
            new_char_position = (old_char_position - key_char_position + 26) % 26
        return chr(new_char_position + ord(first_alphabet_letter))
    return text_char

def pick_keys() -> str:
    """Generate a random 5-letter key."""
    return ''.join(random.choices(string.ascii_lowercase, k=5))

def encrypt(plaintext: str, key: str) -> str:
    """Encrypt plaintext using Vigenère cipher.

    Each letter is shifted by the corresponding key letter position.
    Non-alphabetic characters are preserved.
    """
    ciphertext = ''
    padded_key = _pad_key(plaintext, key)
    for plaintext_char, key_char in zip(plaintext, padded_key):
        ciphertext += _encrypt_decrypt_char(plaintext_char, key_char, mode=MODE_ENCRYPT)
    return ciphertext

def decrypt(ciphertext: str, key: str) -> str:
    """Decrypt ciphertext using Vigenère cipher.

    Each letter is shifted back by the corresponding key letter position.
    Non-alphabetic characters are preserved.
    """
    plaintext = ''
    padded_key = _pad_key(ciphertext, key)
    for ciphertext_char, key_char in zip(ciphertext, padded_key):
        plaintext += _encrypt_decrypt_char(ciphertext_char, key_char, mode='decrypt')
    return plaintext

def main():
    """Run an interactive test of the Vigenère cipher."""
    message = input("Please enter a message: ")
    if not (key := input("Please enter a key (or press Enter for random): ")):
        key = pick_keys()

    encrypted = encrypt(message, key)
    decrypted = decrypt(encrypted, key)

    print(f"Original: {message}")
    print(f"Key: {key}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")

if __name__ == "__main__":
    main()
