import pytest
from methods.historical.enigma.reflector import Reflector

def test_reflector_initialization():
    """Test standard initialization of the Reflector."""
    wiring = "YRUHQSLDPXNGOKMIEBFZCWVJAT"
    reflector = Reflector(wiring)
    assert reflector.left == "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    assert reflector.right == wiring

def test_reflector_reflect():
    """Test the reflecting logic of the Reflector."""
    # Reflector B wiring
    wiring = "YRUHQSLDPXNGOKMIEBFZCWVJAT"
    reflector = Reflector(wiring)

    # Check signal mapping
    assert reflector.reflect(0) == 24  # A -> Y
    assert reflector.reflect(24) == 0  # Y -> A
    assert reflector.reflect(25) == 19 # Z -> T
    assert reflector.reflect(19) == 25 # T -> Z

def test_reflector_all_characters():
    """Test reflecting logic on all characters."""
    wiring = "YRUHQSLDPXNGOKMIEBFZCWVJAT"
    reflector = Reflector(wiring)

    # Test all characters mapping
    for i in range(26):
        out = reflector.reflect(i)
        # Because Reflector B is symmetric
        assert reflector.reflect(out) == i

def test_reflector_type_error():
    """Test reflector with invalid signal types."""
    wiring = "YRUHQSLDPXNGOKMIEBFZCWVJAT"
    reflector = Reflector(wiring)
    with pytest.raises(TypeError):
        reflector.reflect("A") # Signal should be an integer
