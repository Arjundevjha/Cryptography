"""Enigma machine class representing the whole machine assembly."""

class Enigma:
    """Enigma machine simulation."""

    def __init__(self, re, rotors: list, pb, kb):
        """Initialize Enigma machine with components.

        Args:
            re: The Reflector component.
            rotors: A list of Rotor components (left, middle, right).
            pb: The Plugboard component.
            kb: The Keyboard component.
        """
        self.re = re
        self.r1, self.r2, self.r3 = rotors
        self.pb = pb
        self.kb = kb

    def set_rings(self, rings):
        """Set the ring settings for each rotor."""
        self.r1.set_ring(rings[0])
        self.r2.set_ring(rings[1])
        self.r3.set_ring(rings[2])

    def set_key(self, key):
        """Set the initial key/letter position for each rotor."""
        self.r1.rotate_to_letter(key[0])
        self.r2.rotate_to_letter(key[1])
        self.r3.rotate_to_letter(key[2])

    def encipher(self, letter):
        """Encipher a single character through the Enigma machine."""
        # Rotate the rotors
        if self.r2.left[0] == self.r2.notch and self.r3.left[0] == self.r3.notch:
            self.r1.rotate()
            self.r2.rotate()
            self.r3.rotate()
        elif self.r2.left[0] == self.r2.notch:
            self.r1.rotate()
            self.r2.rotate()
            self.r3.rotate()
        elif self.r3.left[0] == self.r3.notch:
            self.r2.rotate()
            self.r3.rotate()
        else:
            self.r3.rotate()

        # Pass signal through machine
        signal = self.kb.forward(letter)
        signal = self.pb.forward(signal)
        signal = self.r3.forward(signal)
        signal = self.r2.forward(signal)
        signal = self.r1.forward(signal)
        signal = self.re.reflect(signal)
        signal = self.r1.backwards(signal)
        signal = self.r2.backwards(signal)
        signal = self.r3.backwards(signal)
        signal = self.pb.backwards(signal)
        letter = self.kb.backward(signal)
        return letter
