"""Vigenere cipher implementation."""

import secrets
import string

MODE_ENCRYPT = 'encrypt'

def _pad_key(text: str, key: str) -> str:
    """Pad the key to match the length of the text, cycling through key characters."""
    if not key:
        return ''
    key_len = len(key)
    padded_key = []
    i = 0
    for char in text:
        if char.isalpha():
            padded_key.append(key[i % key_len])
            i += 1
        else:
            padded_key.append(' ')
    return ''.join(padded_key)

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
    return ''.join(secrets.choice(string.ascii_lowercase) for _ in range(5))

def _transform(text: str, key: str, mode: str = MODE_ENCRYPT) -> str:
    """Fast vectorized transformation (encryption or decryption) using pre-calculated key shifts.

    BOLT OPTIMIZATION: Avoids O(N) string concatenation overhead, redundant key padding,
    and repeated helper calls by doing a single list-accumulated pass with pre-computed shift values.
    """
    if not key or not text:
        return text

    key_lower = key.lower()
    key_len = len(key_lower)
    key_shifts = [ord(k) - 97 for k in key_lower]

    sign = 1 if mode == MODE_ENCRYPT else -1
    result = []
    key_idx = 0

    for char in text:
        if 'a' <= char <= 'z':
            shift = key_shifts[key_idx % key_len]
            result.append(chr(97 + (ord(char) - 97 + sign * shift) % 26))
            key_idx += 1
        elif 'A' <= char <= 'Z':
            shift = key_shifts[key_idx % key_len]
            result.append(chr(65 + (ord(char) - 65 + sign * shift) % 26))
            key_idx += 1
        else:
            result.append(char)

    return ''.join(result)

def encrypt(plaintext: str, key: str) -> str:
    """Encrypt plaintext using Vigenère cipher.

    Each letter is shifted by the corresponding key letter position.
    Non-alphabetic characters are preserved.
    """
    return _transform(plaintext, key, mode=MODE_ENCRYPT)

def decrypt(ciphertext: str, key: str) -> str:
    """Decrypt ciphertext using Vigenère cipher.

    Each letter is shifted back by the corresponding key letter position.
    Non-alphabetic characters are preserved.
    """
    return _transform(ciphertext, key, mode='decrypt')

def main():
    """Run an interactive test of the Vigenère cipher."""
    vigenere_text = input("Please enter a message for Vigenere: ")
    if not (vigenere_key := input("Please enter a key (or press Enter for random): ")):
        vigenere_key = pick_keys()

    vigenere_cipher = encrypt(vigenere_text, vigenere_key)
    vigenere_decrypted = decrypt(vigenere_cipher, vigenere_key)

    print(f"Vigenere Original Plaintext: {vigenere_text}")
    print(f"Vigenere Key Utilized: {vigenere_key}")
    print(f"Vigenere Encrypted Text: {vigenere_cipher}")
    print(f"Vigenere Decrypted Result: {vigenere_decrypted}")

if __name__ == "__main__":
    main()
