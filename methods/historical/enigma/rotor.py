"""Rotor component for Enigma machine."""

class Rotor:
    """Rotor simulator representing a rotating scrambled wheel."""

    def __init__(self, wiring, notch):
        """Initialize the rotor with a wiring permutation and turnover notch."""
        self.left = wiring
        self.right = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        self.notch = notch
        self.position = 0
        self.ring = 0

    def forward(self, signal_idx: int) -> int:
        """Pass signal from right to left."""
        letter = self.right[(signal_idx + self.position - self.ring) % 26]
        signal_idx = self.left.index(letter)
        return (signal_idx - self.position + self.ring) % 26

    def backwards(self, signal_idx: int) -> int:
        """Pass the signal backwards from left side to right side of the rotor."""
        letter = self.left[(signal_idx + self.position - self.ring) % 26]
        signal_idx = self.right.index(letter)
        return (signal_idx - self.position + self.ring) % 26

    def rotate(self, n=1, forward=True):
        """Rotate the rotor n steps forward or backward."""
        if forward:
            self.position = (self.position + n) % 26
        else:
            self.position = (self.position - n) % 26

    def rotate_to_letter(self, letter):
        """Rotate the rotor until the specified letter is at the top position."""
        n = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".find(letter)
        self.position = n

    def set_ring(self, n):
        """Set the ring offset for the rotor, adjusting notch and wiring."""
        self.ring = n
