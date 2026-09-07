"""Unit tests for Lorenz SteppingController."""

import pytest
from methods.historical.lorenz.wheels import Wheel
from methods.historical.lorenz.stepping import SteppingController


def test_stepping_controller_init_defaults():
    sc = SteppingController()
    pos = sc.get_positions()
    assert len(pos["chi"]) == 5
    assert len(pos["motor"]) == 2
    assert len(pos["psi"]) == 5
    assert pos["chi"] == [0, 0, 0, 0, 0]


def test_stepping_chi_unconditional():
    sc = SteppingController()
    sc.step()
    pos = sc.get_positions()
    assert pos["chi"] == [1, 1, 1, 1, 1]


def test_stepping_motor1_unconditional():
    sc = SteppingController()
    sc.step()
    pos = sc.get_positions()
    assert pos["motor"][0] == 1


def test_stepping_motor2_gated_by_mu1():
    # Set mu1 active pin to 0
    sc = SteppingController()
    sc.motor[0].set_pins([0] * 61)
    sc.motor[1].set_position(0)
    sc.step()
    # mu2 should NOT step
    assert sc.motor[1].get_position() == 0

    # Set mu1 active pin to 1
    sc.motor[0].set_pins([1] * 61)
    sc.step()
    # mu2 SHOULD step
    assert sc.motor[1].get_position() == 1


def test_stepping_psi_gated_by_mu2():
    sc = SteppingController()
    # Set mu2 active pin to 0
    sc.motor[1].set_pins([0] * 37)
    sc.step()
    # psi wheels should NOT step
    assert sc.get_positions()["psi"] == [0, 0, 0, 0, 0]

    # Set mu2 active pin to 1
    sc.motor[1].set_pins([1] * 37)
    sc.step()
    # psi wheels SHOULD step
    assert sc.get_positions()["psi"] == [1, 1, 1, 1, 1]


def test_set_get_positions():
    sc = SteppingController()
    sc.set_positions([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    pos = sc.get_positions()
    assert pos["chi"] == [1, 2, 3, 4, 5]
    assert pos["motor"] == [6, 7]
    assert pos["psi"] == [8, 9, 10, 11, 12]

    # Test dictionary positions
    dict_pos = {
        "chi": [5, 4, 3, 2, 1],
        "motor": [7, 6],
        "psi": [12, 11, 10, 9, 8]
    }
    sc.set_positions(dict_pos)
    pos = sc.get_positions()
    assert pos["chi"] == [5, 4, 3, 2, 1]
    assert pos["motor"] == [7, 6]
    assert pos["psi"] == [12, 11, 10, 9, 8]


def test_get_keystream_vector():
    sc = SteppingController()
    # Default wheels start with all pins at 0 or initial state
    chi_vec = sc.get_chi_vector()
    psi_vec = sc.get_psi_vector()
    expected_keystream = [c ^ p for c, p in zip(chi_vec, psi_vec)]
    assert sc.get_keystream_vector() == expected_keystream

    # Modify pins on chi and psi wheels to test custom XOR behavior
    sc.chi[0].set_pins([1] * 41)
    sc.chi[1].set_pins([0] * 31)
    sc.chi[2].set_pins([1] * 29)
    sc.chi[3].set_pins([0] * 26)
    sc.chi[4].set_pins([1] * 23)

    sc.psi[0].set_pins([0] * 43)
    sc.psi[1].set_pins([1] * 47)
    sc.psi[2].set_pins([1] * 51)
    sc.psi[3].set_pins([0] * 53)
    sc.psi[4].set_pins([0] * 59)

    assert sc.get_chi_vector() == [1, 0, 1, 0, 1]
    assert sc.get_psi_vector() == [0, 1, 1, 0, 0]
    assert sc.get_keystream_vector() == [1, 1, 0, 0, 1]


def test_stepping_controller_init_validation():
    with pytest.raises(ValueError, match="Requires exactly 5 Chi wheels"):
        SteppingController(chi_wheels=[Wheel(41)] * 4)

    with pytest.raises(ValueError, match="Requires exactly 2 Motor wheels"):
        SteppingController(motor_wheels=[Wheel(61)] * 3)

    with pytest.raises(ValueError, match="Requires exactly 5 Psi wheels"):
        SteppingController(psi_wheels=[Wheel(43)] * 6)


def test_set_positions_validation():
    sc = SteppingController()
    with pytest.raises(ValueError, match="Positions dict must contain 5 chi, 2 motor, and 5 psi values"):
        sc.set_positions({"chi": [0] * 4, "motor": [0] * 2, "psi": [0] * 5})

    with pytest.raises(ValueError, match="Flat positions list must contain exactly 12 integers"):
        sc.set_positions([0] * 10)

    with pytest.raises(ValueError, match="Positions must be a dict or list/tuple"):
        sc.set_positions("invalid_type")  # type: ignore
