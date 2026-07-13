import pytest
from methods.historical.enigma.keyboard import Keyboard

def test_keyboard_initialization():
    """Test the standard initialization of the Keyboard."""
    keyboard = Keyboard()
    assert keyboard.alphabet == "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

def test_keyboard_forward():
    """Test the forward logic: letter to signal."""
    keyboard = Keyboard()
    assert keyboard.forward("A") == 0
    assert keyboard.forward("B") == 1
    assert keyboard.forward("Z") == 25

def test_keyboard_backward():
    """Test the backward logic: signal to letter."""
    keyboard = Keyboard()
    assert keyboard.backward(0) == "A"
    assert keyboard.backward(1) == "B"
    assert keyboard.backward(25) == "Z"

def test_keyboard_all_letters_and_signals():
    """Test all valid letters and signals."""
    keyboard = Keyboard()
    for index, letter in enumerate("ABCDEFGHIJKLMNOPQRSTUVWXYZ"):
        assert keyboard.forward(letter) == index
        assert keyboard.backward(index) == letter

def test_keyboard_forward_not_found():
    """Test forward method with characters not in the alphabet."""
    keyboard = Keyboard()
    # str.find() returns -1 if substring is not found
    assert keyboard.forward("a") == -1
    assert keyboard.forward("1") == -1
    assert keyboard.forward(" ") == -1

def test_keyboard_backward_index_error():
    """Test backward method with invalid indices."""
    keyboard = Keyboard()
    with pytest.raises(IndexError):
        keyboard.backward(26)
    with pytest.raises(TypeError):
        keyboard.backward("A") # type: ignore
