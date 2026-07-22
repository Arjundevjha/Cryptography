"""ITA2 (Baudot Code) converter and bitwise vector utilities for Lorenz cipher."""

from typing import List, Union

# Complete 32-vector International Telegraph Alphabet No. 2 (ITA2) LTRS + Control mapping
# Maps all 32 possible 5-bit binary vectors [bit1, bit2, bit3, bit4, bit5]
ITA2_CHAR_TO_VEC = {
    'A': [1, 1, 0, 0, 0],
    'B': [1, 0, 0, 1, 1],
    'C': [0, 1, 1, 1, 0],
    'D': [1, 0, 0, 1, 0],
    'E': [1, 0, 0, 0, 0],
    'F': [1, 0, 1, 1, 0],
    'G': [0, 1, 0, 1, 1],
    'H': [0, 0, 1, 0, 1],
    'I': [0, 1, 1, 0, 0],
    'J': [1, 1, 0, 1, 0],
    'K': [1, 1, 1, 1, 0],
    'L': [0, 1, 0, 0, 1],
    'M': [0, 0, 1, 1, 1],
    'N': [0, 0, 1, 1, 0],
    'O': [0, 0, 0, 1, 1],
    'P': [0, 1, 1, 0, 1],
    'Q': [1, 1, 1, 0, 1],
    'R': [0, 1, 0, 1, 0],
    'S': [1, 0, 1, 0, 0],
    'T': [0, 0, 0, 0, 1],
    'U': [1, 1, 1, 0, 0],
    'V': [0, 1, 1, 1, 1],
    'W': [1, 1, 0, 0, 1],
    'X': [1, 0, 1, 1, 1],
    'Y': [1, 0, 1, 0, 1],
    'Z': [1, 0, 0, 0, 1],
    ' ': [0, 0, 1, 0, 0],
    '\r': [0, 0, 0, 1, 0],
    '\n': [0, 1, 0, 0, 0],
    '\0': [0, 0, 0, 0, 0],
    '#': [1, 1, 0, 1, 1],
    '*': [1, 1, 1, 1, 1],
}

# Inverse map: Tuple of 5 bits -> Character
ITA2_VEC_TO_CHAR = {tuple(v): c for c, v in ITA2_CHAR_TO_VEC.items()}


def char_to_ita2(char: str) -> List[int]:
    """Convert a character to its 5-bit ITA2 binary vector.

    Args:
        char: Single character string.

    Returns:
        List of 5 integers (0 or 1).

    Raises:
        ValueError: If character cannot be represented in ITA2.
    """
    upper_char = char.upper()
    if upper_char not in ITA2_CHAR_TO_VEC:
        raise ValueError(f"Character '{char}' is not supported in ITA2 alphabet.")
    return list(ITA2_CHAR_TO_VEC[upper_char])


def ita2_to_char(vec: Union[List[int], tuple]) -> str:
    """Convert a 5-bit binary vector to its ITA2 character representation.

    Args:
        vec: List or tuple of 5 integers (0 or 1).

    Returns:
        Single character string.

    Raises:
        ValueError: If vector length is not 5.
    """
    if len(vec) != 5:
        raise ValueError(f"Vector must be 5 bits long, got length {len(vec)}.")
    vec_tuple = tuple(1 if b else 0 for b in vec)
    if vec_tuple not in ITA2_VEC_TO_CHAR:
        return "?"
    return ITA2_VEC_TO_CHAR[vec_tuple]


def xor_vectors(v1: List[int], v2: List[int]) -> List[int]:
    """Perform bitwise XOR (modulo 2 addition) on two equal-length binary vectors.

    Args:
        v1: List of bits (0 or 1).
        v2: List of bits (0 or 1).

    Returns:
        List of XOR result bits.

    Raises:
        ValueError: If vectors differ in length.
    """
    if len(v1) != len(v2):
        raise ValueError(f"Vectors must have equal length (got {len(v1)} and {len(v2)}).")
    return [b1 ^ b2 for b1, b2 in zip(v1, v2)]


def text_to_ita2_vectors(text: str) -> List[List[int]]:
    """Convert a string into a list of 5-bit ITA2 binary vectors.

    Args:
        text: Input string.

    Returns:
        List of 5-bit vector lists.
    """
    return [char_to_ita2(c) for c in text if c.upper() in ITA2_CHAR_TO_VEC]


def ita2_vectors_to_text(vectors: List[List[int]]) -> str:
    """Convert a list of 5-bit ITA2 binary vectors back to a string.

    Args:
        vectors: List of 5-bit vector lists.

    Returns:
        Decoded string text.
    """
    return "".join(ita2_to_char(v) for v in vectors)
