# Python Style Guide for Cryptography Methods

This style guide establishes consistent coding standards for all cryptographic implementations in this repository, based on the reference implementation in `methods/classical/affine.py`.

---

> [!CAUTION]
> **No External Cryptography Libraries**  
> Importing external cryptography libraries (e.g., `cryptography`, `pycryptodome`, `pynacl`) is **NOT permitted**.  
> All implementations must use only Python standard library modules (`hashlib`, `hmac`, `os`, `random`, etc.).  
> This ensures educational value and portability of all methods.

---

## File Structure

Every cryptographic method file should follow this structure:

```python
# 1. Imports (standard library only)
import random
import string

# 2. Constants (if needed)
ALPHABET = "abcdefghijklmnopqrstuvwxyz"

# 3. Helper/utility functions (prefix with _ for private)
def _helper_function():
    pass

# 4. Key generation function
def pick_keys():
    """Generate and return encryption key(s)."""
    pass

# 5. Core encryption function
def encrypt(plaintext: str, key) -> str:
    """Encrypt plaintext using the given key."""
    pass

# 6. Core decryption function
def decrypt(ciphertext: str, key) -> str:
    """Decrypt ciphertext using the given key."""
    pass

# 7. Main function for CLI demonstration
def main():
    message = input("Please enter a message: ")
    key = pick_keys()
    encrypted = encrypt(message, key)
    decrypted = decrypt(encrypted, key)
    
    print(f"Original: {message}")
    print(f"Key: {key}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")

# 8. Entry point guard
if __name__ == "__main__":
    main()
```

---

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Functions | `snake_case` | `encrypt()`, `decrypt()`, `pick_keys()` |
| Variables | `snake_case` | `plaintext`, `ciphertext`, `a_key` |
| Constants | `UPPER_SNAKE_CASE` | `ALPHABET`, `MODULUS` |
| Private functions | `_snake_case` | `_pad_key()`, `_helper()` |

### Standard Function Names

Use these consistent names across all cipher implementations:

- `pick_keys()` — Generate and return key(s)
- `encrypt(plaintext, key, ...)` — Encrypt plaintext
- `decrypt(ciphertext, key, ...)` — Decrypt ciphertext
- `main()` — CLI demonstration entry point

---

## Type Hints

Add type hints to all function parameters:

```python
# Good
def encrypt(plaintext: str, key: int) -> str:
    pass

def pick_keys() -> tuple[int, int]:
    pass

# Avoid
def encrypt(plaintext, key):
    pass
```

---

## Code Style

### Use Functions, Not Classes

Simple cryptographic methods should use standalone functions, not classes:

```python
# Good
def encrypt(plaintext: str, shift: int) -> str:
    # implementation
    pass

# Avoid
class CaesarCipher:
    def __init__(self, shift):
        self.shift = shift
    
    def encrypt(self, plaintext):
        pass
```

### No Top-Level Executable Code

All executable code must be inside `main()`:

```python
# Good
def main():
    message = input("Please enter a message: ")
    encrypted = encrypt(message, 3)
    print(encrypted)

if __name__ == "__main__":
    main()

# Avoid
message = input("Please enter a message: ")
encrypted = encrypt(message, 3)
print(encrypted)
```

### Use f-strings for Output

```python
# Good
print(f"Original: {message}")
print(f"Encrypted: {encrypted}")

# Avoid
print("Original: " + message)
print("Encrypted: %s" % encrypted)
```

### Return Values Over Side Effects

Core functions should return values, not print directly:

```python
# Good
def encrypt(plaintext: str, key: int) -> str:
    ciphertext = ""
    # ... encryption logic ...
    return ciphertext

# Avoid
def encrypt(plaintext: str, key: int):
    ciphertext = ""
    # ... encryption logic ...
    print(ciphertext)  # Don't print in core functions
```

---

## Main Function Pattern

Every file should have a `main()` function that demonstrates the cipher:

```python
def main():
    # 1. Get input from user
    message = input("Please enter a message: ")
    
    # 2. Generate or get key(s)
    key = pick_keys()
    
    # 3. Encrypt
    encrypted = encrypt(message, key)
    
    # 4. Decrypt (verify round-trip)
    decrypted = decrypt(encrypted, key)
    
    # 5. Display results
    print(f"Original: {message}")
    print(f"Key: {key}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")

if __name__ == "__main__":
    main()
```

---

## Imports

### Allowed (Standard Library Only)

```python
import random
import string
import hashlib
import hmac
import os
import math
from typing import Tuple, List, Optional
```

### Not Allowed (External Libraries)

```python
# DO NOT USE
from cryptography.hazmat.primitives import ...
from Crypto.Cipher import AES
import pynacl
```

---

## Example: Complete Implementation

Reference implementation: [affine.py](methods/classical/affine.py)

```python
import random

def pick_keys() -> tuple[int, int]:
    """Generate two coprime keys for affine cipher."""
    coprimes = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]
    a_key = random.choice(coprimes)
    coprimes.remove(a_key)
    b_key = random.choice(coprimes)
    return a_key, b_key

def encrypt(plaintext: str, a_key: int, b_key: int) -> str:
    """Encrypt plaintext using affine cipher: E(x) = (ax + b) mod 26"""
    ciphertext = ""
    for char in plaintext:
        if char.isalpha():
            char = char.lower()
            char_index = ord(char) - ord('a')
            encrypted_index = (a_key * char_index + b_key) % 26
            ciphertext += chr(encrypted_index + ord('a'))
        else:
            ciphertext += char
    return ciphertext

def decrypt(ciphertext: str, a_key: int, b_key: int) -> str:
    """Decrypt ciphertext using affine cipher: D(x) = a^-1(x - b) mod 26"""
    plaintext = ""
    a_inverse = pow(a_key, -1, 26)
    for char in ciphertext:
        if char.isalpha():
            char = char.lower()
            char_index = ord(char) - ord('a')
            decrypted_index = (a_inverse * (char_index - b_key)) % 26
            plaintext += chr(decrypted_index + ord('a'))
        else:
            plaintext += char
    return plaintext

def main():
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
```
