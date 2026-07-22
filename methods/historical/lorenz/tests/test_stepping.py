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
