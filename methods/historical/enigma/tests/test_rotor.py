import pytest
from methods.historical.enigma.rotor import Rotor

def test_rotor_forward_basic():
    # Wiring string maps A->D, B->E, C->F ...
    # This matches the user's issue description which had:
    # letter = self.right[(signal_idx + self.position - self.ring) % 26]
    # signal_idx = self.left.index(letter)

    wiring = "DEF" + "GHIJKLMNOPQRSTUVWXYZABC"
    rotor = Rotor(wiring, "Q")

    # We must patch the rotor to match the expected state
    rotor.left = wiring
    rotor.right = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    rotor.position = 0
    rotor.ring = 0

    # signal_idx = 0 -> letter = 'A'. left.index('A') = 23
    assert rotor.forward(0) == 23

    # signal_idx = 1 -> letter = 'B'. left.index('B') = 24
    assert rotor.forward(1) == 24

    # signal_idx = 25 -> letter = 'Z'. left.index('Z') = 22
    assert rotor.forward(25) == 22

def test_rotor_forward_with_position():
    wiring = "DEF" + "GHIJKLMNOPQRSTUVWXYZABC"
    rotor = Rotor(wiring, "Q")

    rotor.left = wiring
    rotor.right = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    rotor.position = 1
    rotor.ring = 0

    # signal_idx = 0
    # letter = right[(0 + 1 - 0) % 26] = right[1] = 'B'
    # left.index('B') = 24
    # return (24 - 1 + 0) % 26 = 23
    assert rotor.forward(0) == 23

def test_rotor_forward_with_ring():
    wiring = "DEF" + "GHIJKLMNOPQRSTUVWXYZABC"
    rotor = Rotor(wiring, "Q")

    rotor.left = wiring
    rotor.right = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    rotor.position = 0
    rotor.ring = 1

    # signal_idx = 0
    # letter = right[(0 + 0 - 1) % 26] = right[25] = 'Z'
    # left.index('Z') = 22
    # return (22 - 0 + 1) % 26 = 23
    assert rotor.forward(0) == 23

def test_rotor_forward_position_and_ring():
    wiring = "DEF" + "GHIJKLMNOPQRSTUVWXYZABC"
    rotor = Rotor(wiring, "Q")

    rotor.left = wiring
    rotor.right = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    rotor.position = 2
    rotor.ring = 1

    # signal_idx = 0
    # letter = right[(0 + 2 - 1) % 26] = right[1] = 'B'
    # left.index('B') = 24
    # return (24 - 2 + 1) % 26 = 23
    assert rotor.forward(0) == 23

def test_rotor_forward_wrap_around():
    wiring = "DEF" + "GHIJKLMNOPQRSTUVWXYZABC"
    rotor = Rotor(wiring, "Q")

    rotor.left = wiring
    rotor.right = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    rotor.position = 25
    rotor.ring = 0

    # signal_idx = 1
    # letter = right[(1 + 25 - 0) % 26] = right[0] = 'A'
    # left.index('A') = 23
    # return (23 - 25 + 0) % 26 = -2 % 26 = 24
    assert rotor.forward(1) == 24

def test_rotor_forward_all_positions():
    wiring = "EKMFLGDQVZNTOWYHXUSPAIBRCJ"
    rotor = Rotor(wiring, "Q")
    rotor.left = wiring
    rotor.right = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    rotor.position = 0
    rotor.ring = 0

    # Test all 26 inputs
    for i in range(26):
        target_char = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[i]
        expected_index = wiring.index(target_char)
        assert rotor.forward(i) == expected_index
