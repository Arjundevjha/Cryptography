"""Jefferson Disk (Bazeries Cylinder) 36-wheel mechanical transposition-substitution cipher."""

import random

ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
NUM_WHEELS = 36


def _build_default_wheels() -> list[str]:
    """Generate 36 deterministic 26-letter wheel permutations."""
    wheels: list[str] = []
    for idx in range(NUM_WHEELS):
        rng = random.Random(1795 + idx)
        chars = list(ALPHABET)
        rng.shuffle(chars)
        wheels.append("".join(chars))
    return wheels


DEFAULT_WHEELS = _build_default_wheels()


def _resolve_wheel_order(wheel_order: list[int] | None) -> list[int]:
    """Validate or return the default 36-wheel ordering (1-indexed)."""
    if wheel_order is None:
        return list(range(1, NUM_WHEELS + 1))
    if not wheel_order:
        raise ValueError("wheel_order cannot be empty")
    for num in wheel_order:
        if isinstance(num, bool) or not isinstance(num, int) or not 1 <= num <= NUM_WHEELS:
            raise ValueError(f"wheel numbers must be integers in 1..{NUM_WHEELS}")
    return list(wheel_order)


def _validate_offset(offset: int) -> int:
    """Validate row offset in 1..25."""
    if isinstance(offset, bool) or not isinstance(offset, int) or not 1 <= offset <= 25:
        raise ValueError("offset must be an integer in 1..25")
    return offset


def _shift_on_wheels(text: str, order: list[int], delta: int) -> str:
    """Shift each A-Z character by delta steps on its assigned cylinder wheel."""
    out: list[str] = []
    for idx, ch in enumerate(text):
        wheel = DEFAULT_WHEELS[order[idx % len(order)] - 1]
        pos = wheel.index(ch)
        out.append(wheel[(pos + delta) % 26])
    return "".join(out)


def jefferson_encrypt(
    plaintext: str,
    wheel_order: list[int] | None = None,
    offset: int = 1,
) -> dict:
    """Encrypt A-Z plaintext using the Jefferson Disk cylinder."""
    order = _resolve_wheel_order(wheel_order)
    step = _validate_offset(offset)
    cleaned = "".join(ch for ch in plaintext.upper() if ch.isalpha() and ch in ALPHABET)
    if not cleaned:
        raise ValueError("plaintext must contain at least one A-Z letter")

    ciphertext = _shift_on_wheels(cleaned, order, step)
    return {
        "ciphertext": ciphertext,
        "wheel_order": order,
        "offset": step,
    }


def jefferson_decrypt(
    ciphertext: str,
    wheel_order: list[int] | None = None,
    offset: int = 1,
) -> dict:
    """Decrypt Jefferson Disk ciphertext and return all 25 candidate cylinder rows."""
    order = _resolve_wheel_order(wheel_order)
    step = _validate_offset(offset)
    cleaned = "".join(ch for ch in ciphertext.upper() if ch.isalpha() and ch in ALPHABET)
    if not cleaned:
        raise ValueError("ciphertext must contain at least one A-Z letter")

    plaintext = _shift_on_wheels(cleaned, order, -step)
    all_rows = [
        {"offset": row_off, "text": _shift_on_wheels(cleaned, order, -row_off)}
        for row_off in range(1, 26)
    ]
    return {
        "plaintext": plaintext,
        "wheel_order": order,
        "offset": step,
        "all_rows": all_rows,
    }
