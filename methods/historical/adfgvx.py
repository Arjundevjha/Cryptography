"""WWI German ADFGVX cipher (6x6 Polybius fractionation + keyed columnar transposition)."""

LABELS = "ADFGVX"
DEFAULT_SQUARE = "NA1C3H8TB2OME5WRPD4F6G7I9J0KLQSUVXYZ"


def _validate_square_key(square_key: str) -> str:
    """Validate that square_key is a 36-character permutation of A-Z and 0-9."""
    cleaned = square_key.strip().upper()
    if len(cleaned) != 36 or set(cleaned) != set(DEFAULT_SQUARE):
        raise ValueError("square_key must be a 36-character permutation of A-Z and 0-9")
    return cleaned


def _validate_transposition_key(transposition_key: str) -> str:
    """Validate that transposition_key is a non-empty alphanumeric string."""
    cleaned = "".join(ch for ch in transposition_key.strip().upper() if ch.isalnum())
    if not cleaned:
        raise ValueError("transposition_key must contain at least one alphanumeric character")
    return cleaned


def _build_square_maps(square_key: str) -> tuple[dict[str, str], dict[str, str]]:
    """Build forward (char -> bigram) and reverse (bigram -> char) lookup tables."""
    enc_map: dict[str, str] = {}
    dec_map: dict[str, str] = {}
    for idx, ch in enumerate(square_key):
        pair = LABELS[idx // 6] + LABELS[idx % 6]
        enc_map[ch] = pair
        dec_map[pair] = ch
    return enc_map, dec_map


def _column_order(key: str) -> list[int]:
    """Return column indices sorted alphabetically by key character, breaking ties by index."""
    return [idx for idx, _ in sorted(enumerate(key), key=lambda item: (item[1], item[0]))]


def adfgvx_encrypt(
    plaintext: str,
    transposition_key: str,
    square_key: str = DEFAULT_SQUARE,
) -> dict:
    """Encrypt alphanumeric plaintext using the ADFGVX cipher."""
    sq_key = _validate_square_key(square_key)
    tr_key = _validate_transposition_key(transposition_key)
    cleaned = "".join(ch for ch in plaintext.upper() if ch.isalnum())
    if not cleaned:
        raise ValueError("plaintext must contain at least one alphanumeric character")

    enc_map, _ = _build_square_maps(sq_key)
    fractionated = "".join(enc_map[ch] for ch in cleaned)

    cols = len(tr_key)
    columns = [fractionated[col::cols] for col in range(cols)]
    ciphertext = "".join(columns[idx] for idx in _column_order(tr_key))
    return {
        "ciphertext": ciphertext,
        "fractionated": fractionated,
        "transposition_key": tr_key,
        "square": sq_key,
    }


def _undo_transposition(cleaned: str, tr_key: str) -> str:
    """Reverse keyed columnar transposition with ragged bottom row lengths."""
    cols = len(tr_key)
    total = len(cleaned)
    base_len, remainder = divmod(total, cols)
    col_chunks: list[str] = [""] * cols
    cursor = 0
    for col_idx in _column_order(tr_key):
        col_len = base_len + (1 if col_idx < remainder else 0)
        col_chunks[col_idx] = cleaned[cursor:cursor + col_len]
        cursor += col_len

    rows = (total + cols - 1) // cols
    return "".join(
        col_chunks[col_idx][row_idx]
        for row_idx in range(rows)
        for col_idx in range(cols)
        if row_idx < len(col_chunks[col_idx])
    )


def adfgvx_decrypt(
    ciphertext: str,
    transposition_key: str,
    square_key: str = DEFAULT_SQUARE,
) -> dict:
    """Decrypt ADFGVX ciphertext back to alphanumeric plaintext."""
    sq_key = _validate_square_key(square_key)
    tr_key = _validate_transposition_key(transposition_key)
    cleaned = "".join(ch for ch in ciphertext.upper() if not ch.isspace())
    if not cleaned or len(cleaned) % 2 != 0 or any(ch not in LABELS for ch in cleaned):
        raise ValueError("ciphertext must be an even-length string of A, D, F, G, V, X")

    fractionated = _undo_transposition(cleaned, tr_key)
    _, dec_map = _build_square_maps(sq_key)
    plaintext = "".join(
        dec_map[fractionated[i:i + 2]] for i in range(0, len(fractionated), 2)
    )
    return {
        "plaintext": plaintext,
        "fractionated": fractionated,
        "transposition_key": tr_key,
    }
