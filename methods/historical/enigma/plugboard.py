"""Plugboard component for Enigma machine."""

class Plugboard:
    """Plugboard simulator for mapping/swapping character signals."""

    def __init__(self, pairs):
        """Initialize the plugboard wiring based on pair mappings."""
        self.left = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        self.right = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        for pair in pairs:
            char_a = pair[0]
            char_b = pair[1]
            pos_a = self.left.find(char_a)
            pos_b = self.left.find(char_b)
            self.left = self.left[:pos_a] + char_b + self.left[pos_a+1:]
            self.left = self.left[:pos_b] + char_a + self.left[pos_b+1:]

    def forward(self, signal):
        """Pass the signal forward through the plugboard mapping."""
        letter = self.right[signal]
        signal = self.left.find(letter)
        return signal

    def backwards(self, signal):
        """Pass the signal backwards through the plugboard mapping."""
        letter = self.left[signal]
        signal = self.right.find(letter)
        return signal
