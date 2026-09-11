"""Playfair cipher implementation."""

import secrets

ALPHABET = "abcdefghiklmnopqrstuvwxyz"
ALPHA_SET = set(ALPHABET)
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


def _build_pos_map(grid: list[list[str]]) -> dict[str, tuple[int, int]]:
    """Build a mapping of character to (row, col) position in the grid."""
    return {grid[r][c]: (r, c) for r in range(5) for c in range(5)}


def _find_position(grid: list[list[str]], char: str) -> tuple[int, int]:
    """Find row and column of a character in the grid."""
    for r in range(5):
        if char in grid[r]:
            return r, grid[r].index(char)
    raise ValueError(f"Character {char} not found in grid")


def _build_transform_map(
    grid: list[list[str]], pos_map: dict[str, tuple[int, int]], mode: str = "encrypt"
) -> dict[str, str]:
    """Precompute 25x25 (625 entries) digraph pair transformation map for O(1) loop lookups.

    BOLT OPTIMIZATION: Replaces per-pair matrix coordinate lookups, row/column conditional
    branching, modulo arithmetic, and 2D grid index lookups inside the character loop with a single O(1) table lookup.
    """
    shift = 1 if mode == "encrypt" else -1
    transform_map = {}
    for c1 in ALPHABET:
        if c1 not in pos_map:
            continue
        r1, col1 = pos_map[c1]
        for c2 in ALPHABET:
            if c2 not in pos_map:
                continue
            r2, col2 = pos_map[c2]
            if r1 == r2:
                # Same row: shift right (or left for decrypt)
                out1 = grid[r1][(col1 + shift) % 5]
                out2 = grid[r2][(col2 + shift) % 5]
            elif col1 == col2:
                # Same column: shift down (or up for decrypt)
                out1 = grid[(r1 + shift) % 5][col1]
                out2 = grid[(r2 + shift) % 5][col2]
            else:
                # Rectangle: swap columns
                out1 = grid[r1][col2]
                out2 = grid[r2][col1]
            transform_map[c1 + c2] = out1 + out2
    return transform_map


def _prepare_text(text: str) -> list[str]:
    """Prepare text: remove non-alpha, replace j, group into digraphs.

    BOLT OPTIMIZATION: Fast filtering using set lookup before digraph grouping.
    """
    text = text.lower().replace("j", "i")
    text = "".join(c for c in text if c in ALPHA_SET)

    digraphs = []
    i = 0
    n = len(text)
    while i < n:
        c1 = text[i]
        if i + 1 < n:
            c2 = text[i+1]
            if c1 == c2:
                digraphs.append(c1 + "x")
                i += 1
            else:
                digraphs.append(c1 + c2)
                i += 2
        else:
            digraphs.append(c1 + "x")
            i += 1
    return digraphs


def pick_keys() -> str:
    """Generate and return a random encryption key using CSPRNG."""
    # Security: Use secrets module for cryptographically secure random key generation
    length = secrets.randbelow(6) + 5
    chars = "abcdefghiklmnopqrstuvwxyz"
    return "".join(secrets.choice(chars) for _ in range(length))


def encrypt(plaintext: str, key: str) -> str:
    """Encrypt plaintext using Playfair cipher."""
    grid = _create_grid(key)
    pos_map = _build_pos_map(grid)
    enc_map = _build_transform_map(grid, pos_map, mode="encrypt")
    digraphs = _prepare_text(plaintext)

    try:
        return "".join(enc_map[pair] for pair in digraphs)
    except KeyError as e:
        missing_char = e.args[0][0] if e.args[0][0] not in pos_map else e.args[0][1]
        raise ValueError(f"Character {missing_char} not found in grid")


def decrypt(ciphertext: str, key: str) -> str:
    """Decrypt ciphertext using Playfair cipher."""
    grid = _create_grid(key)
    pos_map = _build_pos_map(grid)
    dec_map = _build_transform_map(grid, pos_map, mode="decrypt")

    ciphertext = ciphertext.lower().replace("j", "i")
    ciphertext = "".join(c for c in ciphertext if c in ALPHA_SET)
    pairs = [ciphertext[i:i+2] for i in range(0, len(ciphertext), 2)]

    try:
        return "".join(dec_map[pair] for pair in pairs if len(pair) == DIGRAPH_LEN)
    except KeyError as e:
        missing_char = e.args[0][0] if e.args[0][0] not in pos_map else e.args[0][1]
        raise ValueError(f"Character {missing_char} not found in grid")


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
