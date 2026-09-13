"""Plugboard component for Enigma machine."""

_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
_INITIAL_POS = {c: i for i, c in enumerate(_ALPHABET)}


class Plugboard:
    """Plugboard simulator for mapping/swapping character signals."""

    def __init__(self, pairs):
        """Initialize the plugboard wiring based on pair mappings."""
        self.right = _ALPHABET
        left_list = list(_ALPHABET)
        pos_map = _INITIAL_POS.copy()

        for pair in pairs:
            char_a = pair[0]
            char_b = pair[1]
            pos_a = pos_map[char_a]
            pos_b = pos_map[char_b]
            left_list[pos_a] = char_b
            left_list[pos_b] = char_a
            pos_map[char_a] = pos_b
            pos_map[char_b] = pos_a

        self.left = "".join(left_list)

    def forward(self, signal):
        """Pass the signal forward through the plugboard mapping."""
        mapped_letter = self.right[signal]
        return self.left.index(mapped_letter)

    def backwards(self, signal):
        """Pass the signal backwards through the plugboard mapping."""
        mapped_letter = self.left[signal]
        return self.right.index(mapped_letter)
