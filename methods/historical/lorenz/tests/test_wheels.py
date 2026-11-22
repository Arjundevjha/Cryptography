"""Unit tests for Lorenz Wheel class."""

import pytest
from methods.historical.lorenz.wheels import Wheel


def test_wheel_init_default():
    """Test that Wheel defaults to the alternating pin pattern and position 0."""
    w = Wheel(size=5, name="Test_5")
    assert w.size == 5
    assert w.position == 0
    assert w.pins == [0, 1, 0, 1, 0]
    assert w.get_active_pin() == w.pins[0]


def test_wheel_custom_pins():
    """Test that Wheel accepts and returns custom pin configurations."""
    pins = [1, 1, 0, 0, 1]
    w = Wheel(size=5, pins=pins, name="Test_5")
    assert w.get_pins() == pins
    assert w.get_active_pin() == 1


def test_wheel_step_wrapping():
    """Test that wheel position wraps around after reaching the last pin."""
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
    """Test that Wheel rejects non-positive sizes."""
    with pytest.raises(ValueError):
        Wheel(size=0)


def test_wheel_invalid_pins_length():
    """Test that Wheel rejects pin lists whose length differs from the size."""
    with pytest.raises(ValueError):
        Wheel(size=4, pins=[1, 0, 1])


def test_wheel_invalid_pins_value():
    """Test that Wheel rejects pin values outside {0, 1}."""
    with pytest.raises(ValueError):
        Wheel(size=3, pins=[1, 2, 0])


def test_wheel_invalid_position():
    """Test that set_position rejects out-of-range positions."""
    w = Wheel(size=5)
    with pytest.raises(ValueError):
        w.set_position(5)
    with pytest.raises(ValueError):
        w.set_position(-1)
