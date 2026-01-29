import random
from typing import List, Tuple

ALPHABET = "abcdefghiklmnopqrstuvwxyz"

def _create_grid(key: str) -> List[List[str]]:
    """Helper to create 5x5 Playfair grid from key."""
    key = key.lower().replace("j", "i")
    # Remove non-alpha
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

def _find_position(grid: List[List[str]], char: str) -> Tuple[int, int]:
    """Helper to find row and column of a character in the grid."""
    for r in range(5):
        for c in range(5):
            if grid[r][c] == char:
                return r, c
    raise ValueError(f"Character {char} not found in grid")

def _prepare_text(text: str) -> List[str]:
    """Helper to prepare text: remove non-alpha, replace j, group into digraphs."""
    text = text.lower().replace("j", "i")
    text = "".join([c for c in text if c in ALPHABET])
    
    digraphs = []
    i = 0
    while i < len(text):
        char1 = text[i]
        if i + 1 < len(text):
            char2 = text[i+1]
            if char1 == char2:
                digraphs.append(char1 + "x")
                i += 1
            else:
                digraphs.append(char1 + char2)
                i += 2
        else:
            digraphs.append(char1 + "x")
            i += 1
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
    ciphertext = ""
    
    for pair in digraphs:
        r1, c1 = _find_position(grid, pair[0])
        r2, c2 = _find_position(grid, pair[1])
        
        if r1 == r2:
            # Same row: shift right
            ciphertext += grid[r1][(c1 + 1) % 5]
            ciphertext += grid[r2][(c2 + 1) % 5]
        elif c1 == c2:
            # Same column: shift down
            ciphertext += grid[(r1 + 1) % 5][c1]
            ciphertext += grid[(r2 + 1) % 5][c2]
        else:
            # Rectangle: swap columns
            ciphertext += grid[r1][c2]
            ciphertext += grid[r2][c1]
            
    return ciphertext

def decrypt(ciphertext: str, key: str) -> str:
    """Decrypt ciphertext using Playfair cipher."""
    grid = _create_grid(key)
    # Ciphertext is assumed to be valid pairs, but clean it just in case
    ciphertext = ciphertext.lower().replace("j", "i")
    ciphertext = "".join([c for c in ciphertext if c in ALPHABET])
    
    pairs = [ciphertext[i:i+2] for i in range(0, len(ciphertext), 2)]
    plaintext = ""
    
    for pair in pairs:
        if len(pair) != 2:
            continue
            
        r1, c1 = _find_position(grid, pair[0])
        r2, c2 = _find_position(grid, pair[1])
        
        if r1 == r2:
            # Same row: shift left
            plaintext += grid[r1][(c1 - 1) % 5]
            plaintext += grid[r2][(c2 - 1) % 5]
        elif c1 == c2:
            # Same column: shift up
            plaintext += grid[(r1 - 1) % 5][c1]
            plaintext += grid[(r2 - 1) % 5][c2]
        else:
            # Rectangle: swap columns
            plaintext += grid[r1][c2]
            plaintext += grid[r2][c1]
            
    return plaintext

def main():
    message = input("Please enter a message: ")
    # Allow user to input key if they want, but default to pick_keys() if empty or just use pick_keys()
    # To strictly follow standard main pattern in affine.py: automatic key generation.
    # But Playfair is key-based. I'll stick to automatic for standard compliance.
    key = pick_keys()
    
    encrypted = encrypt(message, key)
    decrypted = decrypt(encrypted, key)
    
    print(f"Original: {message}")
    print(f"Key: {key}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")

if __name__ == "__main__":
    main()