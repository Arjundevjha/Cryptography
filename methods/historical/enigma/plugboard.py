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
        self._left_indices = {char: idx for idx, char in enumerate(self.left)}
        self._right_indices = {char: idx for idx, char in enumerate(self.right)}

    def forward(self, signal):
        """Pass the signal forward through the plugboard mapping."""
        mapped_letter = self.right[signal]
        return self._left_indices[mapped_letter]

    def backwards(self, signal):
        """Pass the signal backwards through the plugboard mapping."""
        mapped_letter = self.left[signal]
        return self._right_indices[mapped_letter]
