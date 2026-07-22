"""Unit tests for Lorenz top-level machine class."""

import pytest
from methods.historical.lorenz.lorenz import Lorenz
from methods.historical.lorenz.converter import char_to_ita2, xor_vectors


def test_lorenz_basic_reciprocity():
    # Initialized two Lorenz machines with identical initial positions and pins
    lorenz1 = Lorenz(positions=[0] * 12)
    lorenz2 = Lorenz(positions=[0] * 12)

    plaintext = "SECRET MESSAGE"
    ciphertext = lorenz1.encrypt_text(plaintext)
    decrypted = lorenz2.decrypt_text(ciphertext)

    assert decrypted == plaintext
    assert ciphertext != plaintext


def test_lorenz_vector_processing():
    lorenz1 = Lorenz(positions=[0] * 12)
    lorenz2 = Lorenz(positions=[0] * 12)

    vec = [1, 1, 0, 0, 0]  # 'A'
    encrypted_vec = lorenz1.encrypt_vector(vec)
    decrypted_vec = lorenz2.decrypt_vector(encrypted_vec)

    assert decrypted_vec == vec


def test_lorenz_custom_pins():
    custom_chi = [[1] * 41, [0] * 31, [1] * 29, [0] * 26, [1] * 23]
    custom_motor = [[1] * 61, [1] * 37]
    custom_psi = [[0] * 43, [1] * 47, [0] * 51, [1] * 53, [0] * 59]

    lorenz1 = Lorenz(
        chi_pins=custom_chi,
        motor_pins=custom_motor,
        psi_pins=custom_psi,
        positions=[1] * 12
    )
    lorenz2 = Lorenz(
        chi_pins=custom_chi,
        motor_pins=custom_motor,
        psi_pins=custom_psi,
        positions=[1] * 12
    )

    msg = "ATTACK AT DAWN"
    cipher = lorenz1.process_message(msg)
    decrypted = lorenz2.process_message(cipher)

    assert decrypted == msg


def test_lorenz_manual_position_change():
    lorenz = Lorenz(positions=[0] * 12)
    lorenz.set_positions([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24])

    pos = lorenz.get_positions()
    assert pos["chi"] == [2, 4, 6, 8, 10]
    assert pos["motor"] == [12, 14]
    assert pos["psi"] == [16, 18, 20, 22, 24]
