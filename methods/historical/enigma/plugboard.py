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

        # Precompute index lookup dictionaries for O(1) performance
        self._forward_map = {i: self.left.index(self.right[i]) for i in range(len(self.right))}
        self._backwards_map = {i: self.right.index(self.left[i]) for i in range(len(self.left))}

    def forward(self, signal):
        """Pass the signal forward through the plugboard mapping."""
        return self._forward_map[signal]

    def backwards(self, signal):
        """Pass the signal backwards through the plugboard mapping."""
        return self._backwards_map[signal]
