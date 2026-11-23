"""Unit tests for historical cryptanalysis engines (Enigma Bombe & Lorenz Depth Attack)."""

import pytest

from methods.historical.cryptanalysis import (
    _build_enigma,
    enigma_bombe_search,
    lorenz_depth_attack,
)
from methods.historical.lorenz.lorenz import Lorenz


def test_enigma_bombe_search_finds_exact_position():
    """Test that the Bombe search recovers the exact rotor key for the ciphertext."""
    machine = _build_enigma(["I", "II", "III"], "B", ["AB", "CD"], [1, 1, 1])
    machine.set_key("AGZ")
    plaintext = "WETTERBERICHT"
    ciphertext = machine.process_message(plaintext)

    result = enigma_bombe_search(
        ciphertext=ciphertext,
        crib="WETTER",
        rotors=["I", "II", "III"],
        reflector="B",
        plugboard=["AB", "CD"],
        fixed_left_rotor="A",
    )
    assert result["positions_tested"] == 676
    assert any(
        m["position_str"] == "AGZ" and m["offset"] == 0 and m["plaintext"] == plaintext
        for m in result["matches"]
    )


def test_enigma_bombe_search_no_self_encryption_filter():
    """Test that impossible crib offsets (letter enciphered to itself) are filtered out."""
    # If crib is at every position and equals ciphertext at every offset, valid_offsets is empty
    result = enigma_bombe_search(
        ciphertext="AAAAAA",
        crib="AA",
        rotors=["I", "II", "III"],
        reflector="B",
        fixed_left_rotor="A",
    )
    assert not result["crib_offsets_valid"]
    assert not result["matches"]


def test_enigma_bombe_search_validation():
    """Test that Bombe search validates inputs (crib longer than ciphertext etc.)."""
    with pytest.raises(ValueError):
        enigma_bombe_search("ABC", "ABCD")
    with pytest.raises(ValueError):
        enigma_bombe_search("ABCDEF", "AB", fixed_left_rotor="AB")


def test_lorenz_depth_attack_recovers_other_plaintext():
    """Test that a depth attack with a crib recovers a fragment of the other plaintext."""
    p1 = "ATTACK AT DAWN"
    p2 = "WEATHER REPORT"

    m1 = Lorenz()
    c1 = m1.encrypt_text(p1)

    # Reuse identical initial state -> depth!
    m2 = Lorenz()
    c2 = m2.encrypt_text(p2)

    result = lorenz_depth_attack(c1, c2, crib="ATTACK")
    assert result["length"] == len(p1)
    assert len(result["xor_bits"]) == len(p1)
    offset0 = [r for r in result["crib_results"] if r["offset"] == 0]
    assert len(offset0) == 1
    assert offset0[0]["recovered_fragment"] == "WEATHE"


def test_lorenz_depth_attack_without_crib():
    """Test that the depth attack still computes the XOR stream without a crib."""
    m1 = Lorenz()
    c1 = m1.encrypt_text("HELLO")
    m2 = Lorenz()
    c2 = m2.encrypt_text("WORLD")

    result = lorenz_depth_attack(c1, c2)
    assert result["length"] == 5
    assert not result["crib_results"]
