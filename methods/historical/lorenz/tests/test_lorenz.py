"""Unit tests for Lorenz top-level machine class."""

import pytest
from methods.historical.lorenz.converter import ita2_to_char
from methods.historical.lorenz.lorenz import Lorenz


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


def test_lorenz_char_processing():
    lorenz1 = Lorenz(positions=[0] * 12)
    lorenz2 = Lorenz(positions=[0] * 12)

    char = "A"
    encrypted_char = lorenz1.encrypt_char(char)
    decrypted_char = lorenz2.decrypt_char(encrypted_char)

    assert decrypted_char == char
    assert isinstance(encrypted_char, str)


def test_lorenz_encrypt_char_and_stepping():
    lorenz1 = Lorenz(positions=[0] * 12)
    lorenz2 = Lorenz(positions=[0] * 12)

    initial_pos = lorenz1.get_positions()

    # Encrypt a single character
    char = "A"
    encrypted_char = lorenz1.encrypt_char(char)

    # Position should have stepped after encrypting single char
    stepped_pos = lorenz1.get_positions()
    assert initial_pos != stepped_pos

    # Decrypt character with second machine in initial state
    decrypted_char = lorenz2.decrypt_char(encrypted_char)
    assert decrypted_char == char


def test_lorenz_text_aliases():
    lorenz1 = Lorenz(positions=[0] * 12)
    lorenz2 = Lorenz(positions=[0] * 12)

    msg = "HELLO WORLD"
    encrypted = lorenz1.encrypt_text(msg)
    decrypted = lorenz2.decrypt_text(encrypted)

    assert decrypted == msg


def test_lorenz_set_pins():
    lorenz = Lorenz(positions=[0] * 12)

    new_chi = [[1] * 41, [1] * 31, [1] * 29, [1] * 26, [1] * 23]
    new_motor = [[0] * 61, [0] * 37]
    new_psi = [[1] * 43, [1] * 47, [1] * 51, [1] * 53, [1] * 59]

    lorenz.set_pins(chi_pins=new_chi, motor_pins=new_motor, psi_pins=new_psi)

    for i, w in enumerate(lorenz.stepping.chi):
        assert w.pins == new_chi[i]
    for i, w in enumerate(lorenz.stepping.motor):
        assert w.pins == new_motor[i]
    for i, w in enumerate(lorenz.stepping.psi):
        assert w.pins == new_psi[i]

    # Validate error handling for invalid pin list lengths
    with pytest.raises(ValueError, match="chi_pins must contain exactly 5 arrays."):
        lorenz.set_pins(chi_pins=[[1] * 41])

    with pytest.raises(ValueError, match="motor_pins must contain exactly 2 arrays."):
        lorenz.set_pins(motor_pins=[[1] * 61])

    with pytest.raises(ValueError, match="psi_pins must contain exactly 5 arrays."):
        lorenz.set_pins(psi_pins=[[0] * 43])


def test_lorenz_process_message_non_ita2_char():
    lorenz = Lorenz(positions=[0] * 12)
    text_with_special = "HELLO! @WORLD"
    processed = lorenz.process_message(text_with_special)
    # The '!' and '@' should be preserved as-is since they are non-ITA2
    assert processed[5] == "!"
    assert processed[7] == "@"


def test_lorenz_encrypt_char_unsupported_char_raises_value_error():
    lorenz = Lorenz(positions=[0] * 12)
    with pytest.raises(ValueError, match="Character '!' is not supported in ITA2 alphabet."):
        lorenz.encrypt_char("!")


def test_lorenz_encrypt_char_state_stepping_and_keystream():
    lorenz = Lorenz(positions=[0] * 12)
    initial_pos = lorenz.get_positions()

    # Calculate expected keystream before stepping
    expected_k_vec = lorenz.stepping.get_keystream_vector()

    # Encrypt single char 'A' -> ITA2 [1, 1, 0, 0, 0]
    p_vec = [1, 1, 0, 0, 0]
    expected_z_vec = [p ^ k for p, k in zip(p_vec, expected_k_vec)]
    expected_char = ita2_to_char(expected_z_vec)

    result_char = lorenz.encrypt_char("a")  # test case-insensitivity as well

    # Verify output char matches expected transformation
    assert result_char == expected_char

    # Verify stepping updated positions after single char processing
    new_pos = lorenz.get_positions()
    assert new_pos != initial_pos


def test_lorenz_encrypt_char_special_ita2_symbols():
    special_chars = [' ', '\r', '\n', '#', '*']
    for c in special_chars:
        lorenz1 = Lorenz(positions=[0] * 12)
        lorenz2 = Lorenz(positions=[0] * 12)
        encrypted = lorenz1.encrypt_char(c)
        decrypted = lorenz2.decrypt_char(encrypted)
        assert decrypted == c
