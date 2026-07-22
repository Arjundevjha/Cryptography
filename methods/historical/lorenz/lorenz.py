"""Top-level Lorenz SZ40/SZ42 machine orchestrator."""

from typing import List, Optional, Dict, Union
from .wheels import Wheel
from .stepping import SteppingController, CHI_SIZES, MOTOR_SIZES, PSI_SIZES
from .converter import char_to_ita2, ita2_to_char, xor_vectors


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
        result_chars = []
        for char in text:
            try:
                result_chars.append(self.encrypt_char(char))
            except ValueError:
                # Passthrough characters not supported by ITA2 (e.g. unsupported symbols)
                result_chars.append(char)
        return "".join(result_chars)

    def encrypt_text(self, text: str) -> str:
        """Alias for process_message."""
        return self.process_message(text)

    def decrypt_text(self, text: str) -> str:
        """Alias for process_message."""
        return self.process_message(text)
