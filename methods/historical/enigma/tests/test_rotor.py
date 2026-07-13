import pytest
from methods.historical.enigma.rotor import Rotor

def test_rotor_initialization():
    wiring = "EKMFLGDQVZNTOWYHXUSPAIBRCJ" # Rotor I wiring
    notch = "Q"
    rotor = Rotor(wiring, notch)

    assert rotor.left == "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    assert rotor.right == wiring
    assert rotor.notch == notch

def test_rotor_forward():
    # Rotor I
    wiring = "EKMFLGDQVZNTOWYHXUSPAIBRCJ"
    rotor = Rotor(wiring, "Q")

    # Let's test forward at index 0.
    # signal_idx = 0 -> target_char = wiring[0] = "E"
    # return self.left.find("E") -> find in "ABCDEFGHIJKLMNOPQRSTUVWXYZ" -> 4
    assert rotor.forward(0) == 4

    # Test forward at index 1 -> "K" -> index 10
    assert rotor.forward(1) == 10

    # Test forward at index 25 -> "J" -> index 9
    assert rotor.forward(25) == 9

def test_rotor_backwards():
    # Rotor I
    wiring = "EKMFLGDQVZNTOWYHXUSPAIBRCJ"
    rotor = Rotor(wiring, "Q")

    # Let's test backwards at index 0.
    # signal_idx = 0 -> target_char = self.left[0] = "A"
    # return self.right.find("A") -> find "A" in wiring -> 20
    assert rotor.backwards(0) == 20

    # Test backwards at index 4 (from E) -> should go back to 0
    assert rotor.backwards(4) == 0

def test_rotor_rotate():
    # Test simple forward rotation
    wiring = "EKMFLGDQVZNTOWYHXUSPAIBRCJ"
    rotor = Rotor(wiring, "Q")

    rotor.rotate(1, forward=True)
    assert rotor.left == "BCDEFGHIJKLMNOPQRSTUVWXYZA"
    assert rotor.right == "KMFLGDQVZNTOWYHXUSPAIBRCJE"

    # Test forward rotation by 2
    rotor.rotate(2, forward=True)
    assert rotor.left == "DEFGHIJKLMNOPQRSTUVWXYZABC"
    assert rotor.right == "FLGDQVZNTOWYHXUSPAIBRCJEKM"

def test_rotor_rotate_backwards():
    wiring = "EKMFLGDQVZNTOWYHXUSPAIBRCJ"
    rotor = Rotor(wiring, "Q")

    # Using 'Z' + A-Y for backwards rotation
    # Actually wait, rotate backwards logic in rotor.py is:
    # self.left = self.left[25] + self.left[:25]
    rotor.rotate(1, forward=False)
    assert rotor.left == "ZABCDEFGHIJKLMNOPQRSTUVWXY"
    assert rotor.right == "JEKMFLGDQVZNTOWYHXUSPAIBRC"

def test_rotor_rotate_to_letter():
    wiring = "EKMFLGDQVZNTOWYHXUSPAIBRCJ"
    rotor = Rotor(wiring, "Q")

    # Rotate to 'C', which is index 2.
    rotor.rotate_to_letter("C")
    assert rotor.left == "CDEFGHIJKLMNOPQRSTUVWXYZAB"
    assert rotor.right == "MFLGDQVZNTOWYHXUSPAIBRCJEK"

def test_rotor_set_ring():
    wiring = "EKMFLGDQVZNTOWYHXUSPAIBRCJ"
    rotor = Rotor(wiring, "Q")

    # set_ring(1) should not change much.
    # self.rotate(0, forward=False)
    # n_notch = find("Q") -> 16
    # notch = alphabet[(16-1)%26] = P
    rotor.set_ring(1)

    assert rotor.left == "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    assert rotor.right == wiring
    assert rotor.notch == "P"

    # Let's reset and test a ring setting of 2 (B)
    rotor2 = Rotor(wiring, "Q")
    rotor2.set_ring(2)
    # rotate(1, forward=False)
    assert rotor2.left == "ZABCDEFGHIJKLMNOPQRSTUVWXY"
    assert rotor2.right == "JEKMFLGDQVZNTOWYHXUSPAIBRC"

    # Notch was Q (16). (16-2)%26 = 14 -> O
    assert rotor2.notch == "O"
