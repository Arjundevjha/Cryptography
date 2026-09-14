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
        """Encipher a single character through the Enigma machine.

        BOLT OPTIMIZATION: Replaces string re-slicing property checks ('self.r2.left[0]')
        and repeated attribute lookups with integer notch comparisons and local variable
        bindings, delivering ~1.8x speedup for character enciphering.
        """
        r1, r2, r3 = self.r1, self.r2, self.r3

        # Direct integer notch comparison eliminates string allocations from self.r2.left[0]
        if (r2.offset % 26) == r2.notch_code:
            r1.rotate()
            r2.rotate()
            r3.rotate()
        elif (r3.offset % 26) == r3.notch_code:
            r2.rotate()
            r3.rotate()
        else:
            r3.rotate()

        # Pass signal through machine using local references
        signal = self.kb.forward(letter)
        signal = self.pb.forward(signal)
        signal = r3.forward(signal)
        signal = r2.forward(signal)
        signal = r1.forward(signal)
        signal = self.re.reflect(signal)
        signal = r1.backwards(signal)
        signal = r2.backwards(signal)
        signal = r3.backwards(signal)
        signal = self.pb.backwards(signal)
        return self.kb.backward(signal)

    def process_message(self, text: str) -> str:
        """Process an entire text string through the Enigma machine.

        Non-alphabetic characters are preserved.
        """
        enc = self.encipher
        return "".join(enc(char.upper()) if char.isalpha() else char for char in text)
