"""Unit tests for ITA2 converter and bitwise vector utilities."""

import pytest
from methods.historical.lorenz.converter import (
    char_to_ita2,
    ita2_to_char,
    xor_vectors,
    text_to_ita2_vectors,
    ita2_vectors_to_text,
)


def test_char_to_ita2_valid():
    assert char_to_ita2("A") == [1, 1, 0, 0, 0]
    assert char_to_ita2("b") == [1, 0, 0, 1, 1]
    assert char_to_ita2(" ") == [0, 0, 1, 0, 0]


def test_char_to_ita2_invalid():
    with pytest.raises(ValueError):
        char_to_ita2("$")


def test_ita2_to_char_valid():
    assert ita2_to_char([1, 1, 0, 0, 0]) == "A"
    assert ita2_to_char([1, 0, 0, 1, 1]) == "B"
    assert ita2_to_char([0, 0, 1, 0, 0]) == " "


def test_ita2_to_char_invalid_length():
    with pytest.raises(ValueError):
        ita2_to_char([1, 0, 1])


def test_xor_vectors():
    v1 = [1, 1, 0, 0, 0]
    v2 = [1, 0, 1, 1, 0]
    assert xor_vectors(v1, v2) == [0, 1, 1, 1, 0]


def test_xor_vectors_mismatched_length():
    with pytest.raises(ValueError):
        xor_vectors([1, 0], [1, 0, 1])


def test_text_conversion_roundtrip():
    original = "HELLO LORENZ"
    vecs = text_to_ita2_vectors(original)
    recovered = ita2_vectors_to_text(vecs)
    assert recovered == original
