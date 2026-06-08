"""Rotor component for Enigma machine."""

class Rotor:
    """Rotor simulator representing a rotating scrambled wheel."""

    def __init__(self, wiring, notch):
        """Initialize the rotor with a wiring permutation and turnover notch."""
        self.left = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        self.right = wiring
        self.notch = notch

    def forward(self, signal):
        """Pass the signal forward from right side to left side of the rotor."""
        letter = self.right[signal]
        signal = self.left.find(letter)
        return signal

    def backwards(self, signal):
        """Pass the signal backwards from left side to right side of the rotor."""
        letter = self.left[signal]
        signal = self.right.find(letter)
        return signal

    def rotate(self, n=1, forward=True):
        """Rotate the rotor n steps forward or backward."""
        for _ in range(n):
            if forward:
                self.left = self.left[1:] + self.left[0]
                self.right = self.right[1:] + self.right[0]
            else:
                self.left = self.left[25] + self.left[:25]
                self.right = self.right[25] + self.right[:25]

    def rotate_to_letter(self, letter):
        """Rotate the rotor until the specified letter is at the top position."""
        n = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".find(letter)
        self.rotate(n)

    def set_ring(self, n):
        """Set the ring offset for the rotor, adjusting notch and wiring."""
        # Rotate the rotor backwards
        self.rotate(n-1, forward=False)

        # Adjust the turnover notch in relationship to the wiring
        n_notch = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".find(self.notch)
        self.notch = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[(n_notch - n) % 26]
