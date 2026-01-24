# Contributing to Cryptography

Thank you for your interest in contributing! This document provides guidelines and steps for contributing to this project.

## How to Contribute

### Reporting Issues

1. Check existing issues to avoid duplicates
2. Use a clear, descriptive title
3. Include Python version and OS information
4. Provide steps to reproduce the issue
5. Include expected vs actual behavior

### Submitting Changes

1. **Fork** the repository
2. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the code style guidelines
4. **Test your changes** thoroughly
5. **Commit** with clear messages:
   ```bash
   git commit -m "Add: Brief description of changes"
   ```
6. **Push** to your fork and submit a **Pull Request**

## Code Style Guidelines

### Python Standards

- Follow **PEP 8** style guidelines
- Use **type hints** for function parameters and return values
- Maximum line length: **100 characters**
- Use **f-strings** for string formatting

### Documentation

Every function must include a docstring:

```python
def encrypt(plaintext: str, key: int) -> str:
    """
    Encrypt plaintext using the cipher.
    
    Args:
        plaintext: The message to encrypt
        key: The encryption key
    
    Returns:
        The encrypted ciphertext
    
    Example:
        >>> encrypt("HELLO", 3)
        'KHOOR'
    """
```

### File Structure

- Place new algorithms in the appropriate category:
  - `methods/classical/` - Classical ciphers (pre-1900s)
  - `methods/historical/` - Historical machines and methods
  - `methods/modern/` - Modern cryptographic algorithms
- Include `__init__.py` updates when adding new modules

### Naming Conventions

- **Files**: lowercase with underscores (`caesar_cipher.py`)
- **Functions**: lowercase with underscores (`encrypt_message`)
- **Classes**: PascalCase (`CaesarCipher`)
- **Constants**: UPPERCASE with underscores (`DEFAULT_KEY_SIZE`)

## Adding New Algorithms

1. Create a new file in the appropriate `methods/` subdirectory
2. Include module-level docstring describing the algorithm
3. Implement at minimum:
   - `encrypt()` function
   - `decrypt()` function
   - Example usage in `if __name__ == "__main__":` block
4. Update the category's `__init__.py` to export your module
5. Add usage example to README.md

### Template

```python
"""
Algorithm Name

Brief description of the algorithm and its history.
"""

from typing import ...


def encrypt(plaintext: str, key: ...) -> str:
    """Encrypt plaintext using the algorithm."""
    ...


def decrypt(ciphertext: str, key: ...) -> str:
    """Decrypt ciphertext using the algorithm."""
    ...


if __name__ == "__main__":
    # Example usage
    message = "HELLO WORLD"
    encrypted = encrypt(message, key)
    decrypted = decrypt(encrypted, key)
    print(f"Original: {message}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")
```

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Update documentation if needed
3. Verify all existing functionality still works
4. Provide a clear PR description explaining:
   - What changes were made
   - Why the changes are needed
   - Any breaking changes

## Questions?

Feel free to open an issue for any questions about contributing.
