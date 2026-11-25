"""Unit tests for classical cryptanalysis engines."""

import pytest

from methods.classical import affine, caesar, vigenere
from methods.classical.cryptanalysis import (
    affine_bruteforce,
    affine_known_plaintext,
    caesar_bruteforce,
    vigenere_crack,
    vigenere_ioc,
    vigenere_kasiski,
)


SAMPLE_ENGLISH = (
    "Cryptography is the practice and study of techniques for secure communication "
    "in the presence of adversarial behavior. More generally, cryptography is about "
    "constructing and analyzing protocols that prevent third parties from reading private messages."
)


def test_caesar_bruteforce_ranks_correct_shift_first():
    ct = caesar.encrypt(SAMPLE_ENGLISH, 13)
    results = caesar_bruteforce(ct)
    assert len(results) == 25
    assert results[0]["shift"] == 13
    assert results[0]["plaintext"] == SAMPLE_ENGLISH
    assert results[0]["chi_squared"] < results[1]["chi_squared"]


def test_caesar_bruteforce_invalid_input():
    with pytest.raises(ValueError):
        caesar_bruteforce("   ")
    with pytest.raises(TypeError):
        caesar_bruteforce(123)  # type: ignore[arg-type]


def test_affine_bruteforce_ranks_correct_key_first():
    ct = affine.encrypt(SAMPLE_ENGLISH, 7, 11)
    results = affine_bruteforce(ct)
    assert len(results) == 312
    assert results[0]["a"] == 7
    assert results[0]["b"] == 11
    assert results[0]["plaintext"].lower() == SAMPLE_ENGLISH.lower()


def test_affine_known_plaintext_unique_solution():
    ct = affine.encrypt(SAMPLE_ENGLISH, 5, 8)
    result = affine_known_plaintext("CR", ct[:2], ciphertext=ct)
    assert result["a"] == 5
    assert result["b"] == 8
    assert result["unique"] is True
    assert result["plaintext"].lower() == SAMPLE_ENGLISH.lower()


def test_affine_known_plaintext_invalid():
    with pytest.raises(ValueError):
        affine_known_plaintext("A", "B")
    with pytest.raises(ValueError):
        affine_known_plaintext("AA", "AB")


def test_vigenere_ioc_and_kasiski_and_crack():
    key = "CRYPTO"
    ct = vigenere.encrypt(SAMPLE_ENGLISH, key)

    ioc_scores = vigenere_ioc(ct, max_key_length=12)
    assert len(ioc_scores) == 12
    ioc_by_len = {item["key_length"]: item["ioc"] for item in ioc_scores}
    assert ioc_by_len[6] > 0.055

    kasiski = vigenere_kasiski(ct)
    assert "repeated_ngrams" in kasiski
    assert "factor_scores" in kasiski

    cracked = vigenere_crack(ct)
    assert cracked["key"] == "CRYPTO"
    assert cracked["key_length"] == 6
    assert cracked["plaintext"] == SAMPLE_ENGLISH


def test_substitution_hill_climb_solver():
    """Verify substitution hill-climbing solver improves score and recovers readable text."""
    from methods.classical.cryptanalysis import substitution_hill_climb
    from methods.classical.substitution import encrypt

    key_str = "ZEBRASCDFGHIJKLMNOPQTUVWXY"
    key = {chr(65 + i): ch for i, ch in enumerate(key_str)}
    ct = encrypt(SAMPLE_ENGLISH, key)
    res = substitution_hill_climb(ct, restarts=4, iterations=250, seed=7)
    assert len(res["best_key"]) == 26
    assert len(res["trace"]) == 4
    assert "THE" in res["plaintext"].upper()

    with pytest.raises(ValueError, match="alphabetic"):
        substitution_hill_climb("12345!!!")


def test_vigenere_crack_explicit_key_length():
    ct = vigenere.encrypt(SAMPLE_ENGLISH, "KEY")
    cracked = vigenere_crack(ct, key_length=3)
    assert cracked["key"] == "KEY"
    assert cracked["plaintext"] == SAMPLE_ENGLISH


def test_substitution_hill_climb_solver():
    """Verify substitution hill-climbing solver improves score and recovers readable text."""
    from methods.classical.cryptanalysis import substitution_hill_climb
    from methods.classical.substitution import encrypt

    key_str = "ZEBRASCDFGHIJKLMNOPQTUVWXY"
    key = {chr(65 + i): ch for i, ch in enumerate(key_str)}
    ct = encrypt(SAMPLE_ENGLISH, key)
    res = substitution_hill_climb(ct, restarts=4, iterations=250, seed=7)
    assert len(res["best_key"]) == 26
    assert len(res["trace"]) == 4
    assert "THE" in res["plaintext"].upper()

    with pytest.raises(ValueError, match="alphabetic"):
        substitution_hill_climb("12345!!!")
