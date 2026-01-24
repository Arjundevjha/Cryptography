# Cryptography

A comprehensive collection of cryptographic algorithms implemented in Python, ranging from historical ciphers to modern encryption methods. Built for learning, experimentation, and educational purposes.

## Features

- **Classical Ciphers**: Caesar, Vigenère, Affine, Playfair, Substitution
- **Historical Machines**: Enigma machine emulator, Polybius square, Scytale
- **Modern Cryptography**: AES, RSA, SHA-256/512, HMAC, Digital Signatures

## Installation

```bash
git clone https://github.com/yourusername/Cryptography.git
cd Cryptography
pip install cryptography  # Required for modern crypto algorithms
```

## Project Structure

```
Cryptography/
├── methods/                  # All cryptographic implementations
│   ├── classical/           # Classical substitution & transposition ciphers
│   │   ├── caesar.py        # Caesar cipher (shift cipher)
│   │   ├── vigenere.py      # Vigenère polyalphabetic cipher
│   │   ├── affine.py        # Affine cipher
│   │   ├── playfair.py      # Playfair digraph cipher
│   │   └── substitution.py  # Simple substitution cipher
│   ├── historical/          # Historical encryption machines
│   │   ├── enigma/          # WWII Enigma machine emulator
│   │   ├── polybius.py      # Polybius square cipher
│   │   └── scytale.py       # Spartan scytale cipher
│   └── modern/              # Modern cryptographic algorithms
│       ├── aes.py           # AES block cipher
│       ├── rsa.py           # RSA asymmetric encryption
│       ├── keypair.py       # RSA keypair generation
│       ├── symmetric.py     # AES-256 symmetric encryption
│       ├── hash_functions.py # SHA-256, SHA-512, MD5, BLAKE2
│       └── digital_signatures.py # HMAC signatures
├── web/                     # Future web interface (in development)
└── LICENSE
```

## Quick Start

### Classical Ciphers

```python
from methods.classical.caesar import encrypt, decrypt

# Caesar cipher
encrypted = encrypt("HELLO WORLD", 3)
print(encrypted)  # "KHOOR ZRUOG"

decrypted = decrypt(encrypted, 3)
print(decrypted)  # "HELLO WORLD"
```

### Vigenère Cipher

```python
from methods.classical.vigenere import encrypt, decrypt

message = "ATTACKATDAWN"
key = "LEMON"

encrypted = encrypt(message, key)
decrypted = decrypt(encrypted, key)
```

### Modern Encryption (AES-256)

```python
from methods.modern.symmetric import encrypt, decrypt, generate_key, generate_iv

key = generate_key()
iv = generate_iv()

ciphertext = encrypt("Secret message", key, iv)
plaintext = decrypt(ciphertext, key, iv)
```

### RSA Key Pair Generation

```python
from methods.modern.keypair import generate_keypair

public_key, private_key = generate_keypair(key_size=2048)
print(public_key.decode())
```

### Hash Functions

```python
from methods.modern.hash_functions import HashFunction

hasher = HashFunction("sha256", None)
hash_value = hasher.sha256_hash("Hello World")
print(hash_value)
```

## Algorithm Reference

| Category | Algorithm | Security Level | Use Case |
|----------|-----------|----------------|----------|
| Classical | Caesar | ⚠️ Very Weak | Educational |
| Classical | Vigenère | ⚠️ Weak | Educational |
| Classical | Playfair | ⚠️ Weak | Educational |
| Historical | Enigma | ⚠️ Broken | Historical study |
| Modern | AES-256 | ✅ Strong | Data encryption |
| Modern | RSA-2048 | ✅ Strong | Key exchange |
| Modern | SHA-256 | ✅ Strong | Integrity verification |

> **⚠️ Security Notice**: Classical and historical ciphers are included for educational purposes only. Do NOT use them for securing sensitive data. Use modern algorithms (AES, RSA, SHA-256) for real-world applications.

## Requirements

- Python 3.8+
- `cryptography` library (for modern encryption)

```bash
pip install cryptography
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.