"""Playfair cipher implementation."""

import random

ALPHABET = "abcdefghiklmnopqrstuvwxyz"
DIGRAPH_LEN = 2

def _create_grid(key: str) -> list[list[str]]:
    """Create a 5x5 Playfair grid from key."""
    key = key.lower().replace("j", "i")
    key = "".join([c for c in key if c in ALPHABET])

    seen = set()
    grid_chars = []

    # Add key chars
    for char in key:
        if char not in seen:
            seen.add(char)
            grid_chars.append(char)

    # Add remaining alphabet
    for char in ALPHABET:
        if char not in seen:
            seen.add(char)
            grid_chars.append(char)

    # Create 5x5 grid
    return [grid_chars[i:i+5] for i in range(0, 25, 5)]

def _find_position(grid: list[list[str]], char: str) -> tuple[int, int]:
    """Find row and column of a character in the grid."""
    for r in range(5):
        for c in range(5):
            if grid[r][c] == char:
                return r, c
    raise ValueError(f"Character {char} not found in grid")

def _prepare_text(text: str) -> list[str]:
    """Prepare text: remove non-alpha, replace j, group into digraphs."""
    text = text.lower().replace("j", "i")
    text = "".join([c for c in text if c in ALPHABET])

    digraphs = []
    iterator = iter(range(len(text)))
    for i in iterator:
        char1 = text[i]
        if i + 1 < len(text):
            char2 = text[i+1]
            if char1 == char2:
                digraphs.append(char1 + "x")
            else:
                digraphs.append(char1 + char2)
                next(iterator, None)
        else:
            digraphs.append(char1 + "x")
    return digraphs

def pick_keys() -> str:
    """Generate and return a random encryption key."""
    length = random.randint(5, 10)
    chars = "abcdefghiklmnopqrstuvwxyz"
    return "".join(random.choice(chars) for _ in range(length))

def encrypt(plaintext: str, key: str) -> str:
    """Encrypt plaintext using Playfair cipher."""
    grid = _create_grid(key)
    digraphs = _prepare_text(plaintext)
    ciphertext_chars = []

    for pair in digraphs:
        r1, c1 = _find_position(grid, pair[0])
        r2, c2 = _find_position(grid, pair[1])

        if r1 == r2:
            # Same row: shift right
            ciphertext_chars.append(grid[r1][(c1 + 1) % 5])
            ciphertext_chars.append(grid[r2][(c2 + 1) % 5])
        elif c1 == c2:
            # Same column: shift down
            ciphertext_chars.append(grid[(r1 + 1) % 5][c1])
            ciphertext_chars.append(grid[(r2 + 1) % 5][c2])
        else:
            # Rectangle: swap columns
            ciphertext_chars.append(grid[r1][c2])
            ciphertext_chars.append(grid[r2][c1])

    return "".join(ciphertext_chars)

def decrypt(ciphertext: str, key: str) -> str:
    """Decrypt ciphertext using Playfair cipher."""
    grid = _create_grid(key)
    # Ciphertext is assumed to be valid pairs, but clean it just in case
    ciphertext = ciphertext.lower().replace("j", "i")
    ciphertext = "".join([c for c in ciphertext if c in ALPHABET])

    pairs = [ciphertext[i:i+2] for i in range(0, len(ciphertext), 2)]
    plaintext_chars = []

    for pair in pairs:
        if len(pair) != DIGRAPH_LEN:
            continue

        r1, c1 = _find_position(grid, pair[0])
        r2, c2 = _find_position(grid, pair[1])

        if r1 == r2:
            # Same row: shift left
            plaintext_chars.append(grid[r1][(c1 - 1) % 5])
            plaintext_chars.append(grid[r2][(c2 - 1) % 5])
        elif c1 == c2:
            # Same column: shift up
            plaintext_chars.append(grid[(r1 - 1) % 5][c1])
            plaintext_chars.append(grid[(r2 - 1) % 5][c2])
        else:
            # Rectangle: swap columns
            plaintext_chars.append(grid[r1][c2])
            plaintext_chars.append(grid[r2][c1])

    return "".join(plaintext_chars)

def main():
    """Run an interactive test of the Playfair cipher."""
    plaintext_msg = input("Please enter a message for Playfair: ")
    grid_key = pick_keys()

    playfair_encrypted = encrypt(plaintext_msg, grid_key)
    playfair_decrypted = decrypt(playfair_encrypted, grid_key)

    print(f"Playfair Original Message: {plaintext_msg}")
    print(f"Playfair Generated Key: {grid_key}")
    print(f"Playfair Encrypted Result: {playfair_encrypted}")
    print(f"Playfair Decrypted Result: {playfair_decrypted}")

if __name__ == "__main__":
    main()
