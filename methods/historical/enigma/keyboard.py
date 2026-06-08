"""Keyboard component for Enigma machine."""

class Keyboard:
    """Keyboard simulator for Enigma machine."""

    def __init__(self):
        """Initialize the keyboard layout."""
        self.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    def forward(self, letter):
        """Map a letter to its alphabetical signal index (0-25)."""
        return self.alphabet.find(letter)

    def backward(self, signal):
        """Map an alphabetical signal index (0-25) back to a letter."""
        return self.alphabet[signal]
