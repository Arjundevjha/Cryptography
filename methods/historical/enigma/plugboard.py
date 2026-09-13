"""Plugboard component for Enigma machine."""

_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
_INITIAL_POS = {c: i for i, c in enumerate(_ALPHABET)}
_IDENTITY_MAP = {i: i for i in range(26)}


class Plugboard:
    """Plugboard simulator for mapping/swapping character signals."""

    def __init__(self, pairs):
        """Initialize the plugboard wiring based on pair mappings."""
        self.right = _ALPHABET
        left_list = list(_ALPHABET)
        f_map = _IDENTITY_MAP.copy()

        for pair in pairs:
            char_a = pair[0]
            char_b = pair[1]
            pos_a = _INITIAL_POS[char_a]
            pos_b = _INITIAL_POS[char_b]
            left_list[pos_a] = char_b
            left_list[pos_b] = char_a
            f_map[pos_a] = pos_b
            f_map[pos_b] = pos_a

        self.left = "".join(left_list)
        self._forward_map = f_map
        self._backwards_map = f_map

    def forward(self, signal):
        """Pass the signal forward through the plugboard mapping."""
        return self._forward_map[signal]

    def backwards(self, signal):
        """Pass the signal backwards through the plugboard mapping."""
        return self._backwards_map[signal]
