"""Unit tests for Lorenz Wheel class."""

import pytest
from methods.historical.lorenz.wheels import Wheel


def test_wheel_init_default():
    w = Wheel(size=5, name="Test_5")
    assert w.size == 5
    assert w.position == 0
    assert w.pins == [0, 1, 0, 1, 0] or w.pins == [0, 1, 0, 1, 0] or w.pins == [0, 1, 0, 1, 0] or w.pins == [0, 1, 0, 1, 0]  # alternating
    assert w.get_active_pin() == w.pins[0]


def test_wheel_custom_pins():
    pins = [1, 1, 0, 0, 1]
    w = Wheel(size=5, pins=pins, name="Test_5")
    assert w.get_pins() == pins
    assert w.get_active_pin() == 1


def test_wheel_step_wrapping():
    pins = [1, 0, 1]
    w = Wheel(size=3, pins=pins)
    assert w.get_position() == 0
    assert w.get_active_pin() == 1

    w.step()
    assert w.get_position() == 1
    assert w.get_active_pin() == 0

    w.step()
    assert w.get_position() == 2
    assert w.get_active_pin() == 1

    w.step()
    assert w.get_position() == 0
    assert w.get_active_pin() == 1


def test_wheel_invalid_size():
    with pytest.raises(ValueError):
        Wheel(size=0)


def test_wheel_invalid_pins_length():
    with pytest.raises(ValueError):
        Wheel(size=4, pins=[1, 0, 1])


def test_wheel_invalid_pins_value():
    with pytest.raises(ValueError):
        Wheel(size=3, pins=[1, 2, 0])


def test_wheel_invalid_position():
    w = Wheel(size=5)
    with pytest.raises(ValueError):
        w.set_position(5)
    with pytest.raises(ValueError):
        w.set_position(-1)
