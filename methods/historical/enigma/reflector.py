"""Reflector component for Enigma machine."""

class Reflector:
    """Reflector simulator for reversing signal direction in Enigma."""

    def __init__(self, wiring):
        """Initialize the reflector with standard and custom wiring mapping."""
        self.left = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        self.right = wiring

    def reflect(self, signal):
        """Reflect a signal back through the rotors."""
        letter = self.right[signal]
        signal = self.left.find(letter)
        return signal

    def get_wiring(self) -> str:
        """Get the current reflector wiring mapping."""
        return self.right
