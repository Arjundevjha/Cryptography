import pytest

from methods.classical.playfair import (
    _create_grid,
    _find_position,
    _prepare_text,
    encrypt,
    decrypt,
    pick_keys,
)

def test_create_grid_basic():
    """Test grid generation with a simple key."""
    # "playfair example" -> playfirexm
    # remainder of alphabet appended
    grid = _create_grid("playfair example")

    # 5 rows expected
    assert len(grid) == 5
    assert len(grid[0]) == 5

    # Check first row
    assert grid[0] == ["p", "l", "a", "y", "f"]

    # Ensure total 25 distinct characters (no 'j')
    all_chars = [char for row in grid for char in row]
    assert len(all_chars) == 25
    assert len(set(all_chars)) == 25
    assert "j" not in all_chars

def test_create_grid_with_j():
    """Test grid generation converts 'j' to 'i'."""
    grid = _create_grid("jungle")
    all_chars = [char for row in grid for char in row]
    assert "j" not in all_chars
    assert all_chars[0] == "i" # j -> i
    assert all_chars[1] == "u"

def test_find_position():
    """Test finding a character's row and column in the grid."""
    grid = [
        ["p", "l", "a", "y", "f"],
        ["i", "r", "e", "x", "m"],
        ["b", "c", "d", "g", "h"],
        ["k", "n", "o", "q", "s"],
        ["t", "u", "v", "w", "z"]
    ]

    assert _find_position(grid, "p") == (0, 0)
    assert _find_position(grid, "f") == (0, 4)
    assert _find_position(grid, "v") == (4, 2)
    assert _find_position(grid, "z") == (4, 4)

def test_find_position_missing_char():
    """Test ValueError is raised if character is missing."""
    grid = [
        ["a", "b", "c", "d", "e"],
        ["f", "g", "h", "i", "k"],
        ["l", "m", "n", "o", "p"],
        ["q", "r", "s", "t", "u"],
        ["v", "w", "x", "y", "z"]
    ]
    with pytest.raises(ValueError, match="Character j not found in grid"):
        _find_position(grid, "j")

def test_prepare_text_basic():
    """Test standard digraph preparation."""
    assert _prepare_text("hello") == ["he", "lx", "lo"]
    assert _prepare_text("tree") == ["tr", "ex", "ex"]

def test_prepare_text_replace_j():
    """Test that 'j' is replaced by 'i'."""
    assert _prepare_text("jello") == ["ie", "lx", "lo"]
    assert _prepare_text("jump") == ["iu", "mp"]

def test_prepare_text_ignore_nonalpha():
    """Test that non-alphabet characters are ignored."""
    assert _prepare_text("a b! 123 c") == ["ab", "cx"]

def test_prepare_text_odd_length():
    """Test that odd-length texts get padded with 'x'."""
    assert _prepare_text("a") == ["ax"]
    assert _prepare_text("abc") == ["ab", "cx"]

def test_prepare_text_all_duplicates():
    """Test behavior with text containing all same letters."""
    assert _prepare_text("xx") == ["xx", "xx"]
    assert _prepare_text("xxx") == ["xx", "xx", "xx"]
    assert _prepare_text("eeee") == ["ex", "ex", "ex", "ex"]

def test_encrypt_same_row():
    """Test encrypting digraphs where characters share a row."""
    # Key "playfair example", row 0 is p l a y f
    # 'p' (0,0) and 'l' (0,1) -> shift right -> 'l' (0,1) and 'a' (0,2)
    assert encrypt("pl", "playfair example") == "la"
    # 'y' (0,3) and 'f' (0,4) -> shift right (wrap) -> 'f' (0,4) and 'p' (0,0)
    assert encrypt("yf", "playfair example") == "fp"

def test_encrypt_same_col():
    """Test encrypting digraphs where characters share a column."""
    # Key "playfair example", col 0 is p i b k t
    # 'p' (0,0) and 'i' (1,0) -> shift down -> 'i' (1,0) and 'b' (2,0)
    assert encrypt("pi", "playfair example") == "ib"
    # 'k' (3,0) and 't' (4,0) -> shift down (wrap) -> 't' (4,0) and 'p' (0,0)
    assert encrypt("kt", "playfair example") == "tp"

def test_encrypt_rectangle():
    """Test encrypting digraphs forming a rectangle."""
    # Key "playfair example"
    # 'l' (0,1) and 'i' (1,0) -> swap cols -> 'p' (0,0) and 'r' (1,1)
    assert encrypt("li", "playfair example") == "pr"

def test_decrypt_same_row():
    """Test decrypting digraphs where characters share a row."""
    # 'l' (0,1) and 'a' (0,2) -> shift left -> 'p' (0,0) and 'l' (0,1)
    assert decrypt("la", "playfair example") == "pl"
    # 'f' (0,4) and 'p' (0,0) -> shift left (wrap) -> 'y' (0,3) and 'f' (0,4)
    assert decrypt("fp", "playfair example") == "yf"

def test_decrypt_same_col():
    """Test decrypting digraphs where characters share a column."""
    # 'i' (1,0) and 'b' (2,0) -> shift up -> 'p' (0,0) and 'i' (1,0)
    assert decrypt("ib", "playfair example") == "pi"
    # 't' (4,0) and 'p' (0,0) -> shift up (wrap) -> 'k' (3,0) and 't' (4,0)
    assert decrypt("tp", "playfair example") == "kt"

def test_decrypt_rectangle():
    """Test decrypting digraphs forming a rectangle."""
    # 'p' (0,0) and 'r' (1,1) -> swap cols -> 'l' (0,1) and 'i' (1,0)
    assert decrypt("pr", "playfair example") == "li"

def test_encrypt_decrypt_integration():
    """Test that a message properly encrypts and decrypts."""
    key = "secret key"
    plaintext = "this is a secret message"

    # Original text is modified during preparation:
    # "this is a secret message" -> "th is is as ec re tm es sa ge"
    # but 'ss' in 'message' gets separated: "th is is as ec re tm es sa ge" -> wait, m e s s a g e
    # let's prepare the text to see what decrypt *should* yield.
    prepared_pairs = _prepare_text(plaintext)
    expected_decrypted = "".join(prepared_pairs)

    ciphertext = encrypt(plaintext, key)
    decrypted = decrypt(ciphertext, key)

    assert decrypted == expected_decrypted

def test_decrypt_ignores_invalid_length_pairs():
    """Test that decrypt skips pairs that aren't of length DIGRAPH_LEN."""
    key = "secret"
    # Decrypt method prepares text slightly, pairing it.
    # An odd length ciphertext (which normally wouldn't happen) shouldn't crash it.
    # "he l" -> "he" (valid), "l" (skipped)
    res = decrypt("hel", key)
    assert len(res) == 2 # Only processed the first pair

def test_pick_keys():
    """Test random key generation."""
    key1 = pick_keys()
    key2 = pick_keys()

    # Length between 5 and 10
    assert 5 <= len(key1) <= 10

    # Check all characters in key are from the alphabet
    alphabet = "abcdefghiklmnopqrstuvwxyz"
    assert all(c in alphabet for c in key1)

    # Two generated keys are extremely unlikely to be the same
    # But since it's random, we just assert valid behavior
