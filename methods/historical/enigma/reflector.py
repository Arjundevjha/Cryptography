"""Reflector component for Enigma machine."""

class Reflector:
    """Reflector simulator for reversing signal direction in Enigma."""

    def __init__(self, wiring):
        """Initialize the reflector with standard and custom wiring mapping."""
        self.left = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        self.right = wiring
        self._map = {i: self.left.find(letter) for i, letter in enumerate(self.right)}

    def reflect(self, signal):
        """Reflect a signal back through the rotors."""
        if not isinstance(signal, int):
            raise TypeError("Signal must be an integer index.")
        return self._map[signal]

    def get_wiring(self) -> str:
        """Get the current reflector wiring mapping."""
        return self.right
