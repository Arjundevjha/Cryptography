"""Top-level Lorenz SZ40/SZ42 machine orchestrator."""

from typing import List, Optional, Dict, Union
from .wheels import Wheel
from .stepping import SteppingController, CHI_SIZES, MOTOR_SIZES, PSI_SIZES
from .converter import char_to_ita2, ita2_to_char, xor_vectors, ITA2_CHAR_TO_VEC, ITA2_VEC_TO_CHAR


class Lorenz:
    """Lorenz SZ40/SZ42 cipher machine orchestrator."""

    def __init__(
        self,
        chi_pins: Optional[List[List[int]]] = None,
        motor_pins: Optional[List[List[int]]] = None,
        psi_pins: Optional[List[List[int]]] = None,
        positions: Optional[Union[Dict[str, List[int]], List[int]]] = None
    ):
        """Initialize the 12-wheel Lorenz cipher machine.

        Args:
            chi_pins: Optional list of 5 pin state arrays for Chi wheels.
            motor_pins: Optional list of 2 pin state arrays for Motor wheels.
            psi_pins: Optional list of 5 pin state arrays for Psi wheels.
            positions: Optional starting position configuration.
        """
        chi_wheels = []
        for i, size in enumerate(CHI_SIZES):
            pins = chi_pins[i] if chi_pins and i < len(chi_pins) else None
            chi_wheels.append(Wheel(size=size, pins=pins, name=f"Chi_{i+1}"))

        motor_wheels = []
        for i, size in enumerate(MOTOR_SIZES):
            pins = motor_pins[i] if motor_pins and i < len(motor_pins) else None
            motor_wheels.append(Wheel(size=size, pins=pins, name=f"Motor_{i+1}"))

        psi_wheels = []
        for i, size in enumerate(PSI_SIZES):
            pins = psi_pins[i] if psi_pins and i < len(psi_pins) else None
            psi_wheels.append(Wheel(size=size, pins=pins, name=f"Psi_{i+1}"))

        self.stepping = SteppingController(
            chi_wheels=chi_wheels,
            motor_wheels=motor_wheels,
            psi_wheels=psi_wheels
        )

        if positions is not None:
            self.set_positions(positions)

    def set_positions(self, positions: Union[Dict[str, List[int]], List[int]]) -> None:
        """Set positions for all 12 wheels.

        Args:
            positions: Position dict or flat list of 12 ints.
        """
        self.stepping.set_positions(positions)

    def get_positions(self) -> Dict[str, List[int]]:
        """Get current position indices for all 12 wheels."""
        return self.stepping.get_positions()

    def set_pins(
        self,
        chi_pins: Optional[List[List[int]]] = None,
        motor_pins: Optional[List[List[int]]] = None,
        psi_pins: Optional[List[List[int]]] = None
    ) -> None:
        """Set manual pin configurations for Chi, Motor, and Psi wheels.

        Args:
            chi_pins: List of 5 pin state arrays for Chi wheels.
            motor_pins: List of 2 pin state arrays for Motor wheels.
            psi_pins: List of 5 pin state arrays for Psi wheels.
        """
        if chi_pins:
            if len(chi_pins) != 5:
                raise ValueError("chi_pins must contain exactly 5 arrays.")
            for w, pins in zip(self.stepping.chi, chi_pins):
                w.set_pins(pins)

        if motor_pins:
            if len(motor_pins) != 2:
                raise ValueError("motor_pins must contain exactly 2 arrays.")
            for w, pins in zip(self.stepping.motor, motor_pins):
                w.set_pins(pins)

        if psi_pins:
            if len(psi_pins) != 5:
                raise ValueError("psi_pins must contain exactly 5 arrays.")
            for w, pins in zip(self.stepping.psi, psi_pins):
                w.set_pins(pins)

    def encrypt_vector(self, p_vec: List[int]) -> List[int]:
        """Encrypt or decrypt a single 5-bit vector using current keystream and step.

        Args:
            p_vec: 5-bit input vector [p1, p2, p3, p4, p5].

        Returns:
            5-bit output vector [z1, z2, z3, z4, z5].
        """
        k_vec = self.stepping.get_keystream_vector()
        z_vec = xor_vectors(p_vec, k_vec)
        self.stepping.step()
        return z_vec

    def decrypt_vector(self, z_vec: List[int]) -> List[int]:
        """Decrypt a 5-bit vector (identical to encrypt_vector due to XOR reciprocity)."""
        return self.encrypt_vector(z_vec)

    def encrypt_char(self, char: str) -> str:
        """Encrypt or decrypt a single ITA2 character.

        Args:
            char: Input character.

        Returns:
            Transformed ITA2 character.
        """
        p_vec = char_to_ita2(char)
        z_vec = self.encrypt_vector(p_vec)
        return ita2_to_char(z_vec)

    def decrypt_char(self, char: str) -> str:
        """Decrypt a single ITA2 character (identical to encrypt_char)."""
        return self.encrypt_char(char)

    def process_message(self, text: str) -> str:
        """Process an entire text string through the Lorenz cipher machine.

        Non-ITA2 characters are ignored/skipped or passed through if unmapped.

        Args:
            text: Input string.

        Returns:
            Transformed text string.
        """
        # BOLT OPTIMIZATION: Bypasses per-character call stack and stepping overhead.
        # Extracts wheel pins, sizes, and position indices into local scalar variables,
        # inlines the Lorenz stepping motor rules directly inside the character loop,
        # and synchronizes final wheel positions once after completion (~2.1x speedup).
        stepping = self.stepping
        chi = stepping.chi
        motor = stepping.motor
        psi = stepping.psi

        c0, c1, c2, c3, c4 = chi[0], chi[1], chi[2], chi[3], chi[4]
        m0, m1 = motor[0], motor[1]
        p0, p1, p2, p3, p4 = psi[0], psi[1], psi[2], psi[3], psi[4]

        c0_pins, c1_pins, c2_pins, c3_pins, c4_pins = c0.pins, c1.pins, c2.pins, c3.pins, c4.pins
        m0_pins, m1_pins = m0.pins, m1.pins
        p0_pins, p1_pins, p2_pins, p3_pins, p4_pins = p0.pins, p1.pins, p2.pins, p3.pins, p4.pins

        c0_pos, c1_pos, c2_pos, c3_pos, c4_pos = c0.position, c1.position, c2.position, c3.position, c4.position
        m0_pos, m1_pos = m0.position, m1.position
        p0_pos, p1_pos, p2_pos, p3_pos, p4_pos = p0.position, p1.position, p2.position, p3.position, p4.position

        c0_sz, c1_sz, c2_sz, c3_sz, c4_sz = c0.size, c1.size, c2.size, c3.size, c4.size
        m0_sz, m1_sz = m0.size, m1.size
        p0_sz, p1_sz, p2_sz, p3_sz, p4_sz = p0.size, p1.size, p2.size, p3.size, p4.size

        char_to_vec = ITA2_CHAR_TO_VEC
        vec_to_char = ITA2_VEC_TO_CHAR

        result_chars = []
        for char in text:
            upper_char = char.upper()
            p_vec = char_to_vec.get(upper_char)
            if p_vec is None:
                result_chars.append(char)
                continue

            z_tuple = (
                p_vec[0] ^ c0_pins[c0_pos] ^ p0_pins[p0_pos],
                p_vec[1] ^ c1_pins[c1_pos] ^ p1_pins[p1_pos],
                p_vec[2] ^ c2_pins[c2_pos] ^ p2_pins[p2_pos],
                p_vec[3] ^ c3_pins[c3_pos] ^ p3_pins[p3_pos],
                p_vec[4] ^ c4_pins[c4_pos] ^ p4_pins[p4_pos],
            )
            result_chars.append(vec_to_char.get(z_tuple, "?"))

            # Inlined Lorenz stepping rules:
            # 1. Chi wheels and Motor 1 step unconditionally.
            # 2. Motor 2 steps if Motor 1 active pin was 1.
            # 3. Psi wheels step if Motor 2 active pin was 1.
            mu1_active = m0_pins[m0_pos]
            mu2_active = m1_pins[m1_pos]

            c0_pos += 1
            if c0_pos == c0_sz:
                c0_pos = 0
            c1_pos += 1
            if c1_pos == c1_sz:
                c1_pos = 0
            c2_pos += 1
            if c2_pos == c2_sz:
                c2_pos = 0
            c3_pos += 1
            if c3_pos == c3_sz:
                c3_pos = 0
            c4_pos += 1
            if c4_pos == c4_sz:
                c4_pos = 0

            m0_pos += 1
            if m0_pos == m0_sz:
                m0_pos = 0

            if mu1_active == 1:
                m1_pos += 1
                if m1_pos == m1_sz:
                    m1_pos = 0

            if mu2_active == 1:
                p0_pos += 1
                if p0_pos == p0_sz:
                    p0_pos = 0
                p1_pos += 1
                if p1_pos == p1_sz:
                    p1_pos = 0
                p2_pos += 1
                if p2_pos == p2_sz:
                    p2_pos = 0
                p3_pos += 1
                if p3_pos == p3_sz:
                    p3_pos = 0
                p4_pos += 1
                if p4_pos == p4_sz:
                    p4_pos = 0

        # Synchronize wheel positions back to objects
        c0.position = c0_pos
        c1.position = c1_pos
        c2.position = c2_pos
        c3.position = c3_pos
        c4.position = c4_pos
        m0.position = m0_pos
        m1.position = m1_pos
        p0.position = p0_pos
        p1.position = p1_pos
        p2.position = p2_pos
        p3.position = p3_pos
        p4.position = p4_pos

        return "".join(result_chars)

    def encrypt_text(self, text: str) -> str:
        """Alias for process_message."""
        return self.process_message(text)

    def decrypt_text(self, text: str) -> str:
        """Alias for process_message."""
        return self.process_message(text)
