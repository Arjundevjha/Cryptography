"""Unit tests for Shamir's Secret Sharing over GF(p)."""

from itertools import combinations
import pytest

from methods.modern.secret_sharing import (
    DEFAULT_PRIME,
    TEXT_PRIME,
    reconstruct_secret,
    reconstruct_text_secret,
    split_secret,
    split_text_secret,
)


def test_wikipedia_kat_vector():
    """Verify the standard Shamir Secret Sharing KAT vector (s=1234, k=3, n=6, p=1613)."""
    res = split_secret(secret=1234, threshold=3, num_shares=6, prime=1613, coefficients=[166, 94])
    expected_shares = [
        {"x": 1, "y": 1494},
        {"x": 2, "y": 329},
        {"x": 3, "y": 965},
        {"x": 4, "y": 176},
        {"x": 5, "y": 1188},
        {"x": 6, "y": 775},
    ]
    assert res["shares"] == expected_shares
    assert res["coefficients"] == [1234, 166, 94]

    pairs = [(s["x"], s["y"]) for s in res["shares"]]
    for subset in combinations(pairs, 3):
        rec = reconstruct_secret(list(subset), prime=1613)
        assert rec["secret"] == 1234
        assert rec["shares_used"] == 3
        assert len(rec["lagrange_basis"]) == 3

    # Any 2 shares (< threshold) should not recover 1234 for this polynomial
    rec_two = reconstruct_secret([pairs[0], pairs[1]], prime=1613)
    assert rec_two["secret"] != 1234


def test_default_prime_threshold_subsets():
    """Verify arbitrary (k, n) roundtrip using DEFAULT_PRIME."""
    secret = 9876543210123456789
    res = split_secret(secret=secret, threshold=4, num_shares=7)
    assert res["prime"] == DEFAULT_PRIME
    assert len(res["shares"]) == 7

    pairs = [(s["x"], s["y"]) for s in res["shares"]]
    for subset in (pairs[:4], pairs[3:], [pairs[0], pairs[2], pairs[4], pairs[6]]):
        rec = reconstruct_secret(subset)
        assert rec["secret"] == secret


def test_text_secret_roundtrip_ascii_unicode_and_leading_null():
    """Verify UTF-8 text secrets including Unicode and leading null bytes roundtrip cleanly."""
    for message in ("Museum-Key-2026!", "Shamir 🔐 Secret", "\x00hidden"):
        res = split_text_secret(message, threshold=3, num_shares=5)
        assert res["prime_hex"] == hex(TEXT_PRIME)[2:]
        shares = [(s["x"], int(s["y_hex"], 16)) for s in res["shares"]]
        rec = reconstruct_text_secret(
            [shares[1], shares[3], shares[4]],
            byte_length=res["byte_length"],
        )
        assert rec["secret_text"] == message
        assert rec["shares_used"] == 3


def test_validation_errors():
    """Verify all invalid parameter and share inputs raise ValueError."""
    with pytest.raises(ValueError, match="prime"):
        split_secret(10, 2, 3, prime=15)
    with pytest.raises(ValueError, match="threshold"):
        split_secret(10, 1, 3, prime=1613)
    with pytest.raises(ValueError, match="num_shares"):
        split_secret(10, 4, 3, prime=1613)
    with pytest.raises(ValueError, match="secret"):
        split_secret(1613, 2, 3, prime=1613)
    with pytest.raises(ValueError, match="coefficients"):
        split_secret(10, 3, 4, prime=1613, coefficients=[1])
    with pytest.raises(ValueError, match="at least 2 shares"):
        reconstruct_secret([(1, 2)], prime=1613)
    with pytest.raises(ValueError, match="distinct"):
        reconstruct_secret([(1, 2), (1, 3)], prime=1613)
    with pytest.raises(ValueError, match="non-empty"):
        split_text_secret("", 2, 3)
    with pytest.raises(ValueError, match="at most 64"):
        split_text_secret("A" * 65, 2, 3)
