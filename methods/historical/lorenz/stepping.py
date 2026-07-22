"""Stepping motor mechanism for Lorenz SZ40/SZ42 machine."""

from typing import List, Optional, Dict, Union
from .wheels import Wheel
from .converter import xor_vectors

CHI_SIZES = [41, 31, 29, 26, 23]
MOTOR_SIZES = [61, 37]
PSI_SIZES = [43, 47, 51, 53, 59]


class SteppingController:
    """Manages the 12 Lorenz pinwheels and their stepping drive rules."""

    def __init__(
        self,
        chi_wheels: Optional[List[Wheel]] = None,
        motor_wheels: Optional[List[Wheel]] = None,
        psi_wheels: Optional[List[Wheel]] = None
    ):
        """Initialize stepping controller with 12 Lorenz wheels.

        Args:
            chi_wheels: List of 5 Chi wheels (sizes 41, 31, 29, 26, 23).
            motor_wheels: List of 2 Motor wheels (sizes 61, 37).
            psi_wheels: List of 5 Psi wheels (sizes 43, 47, 51, 53, 59).
        """
        if chi_wheels is None:
            self.chi = [
                Wheel(size, name=f"Chi_{i+1}") for i, size in enumerate(CHI_SIZES)
            ]
        else:
            if len(chi_wheels) != 5:
                raise ValueError(f"Requires exactly 5 Chi wheels, got {len(chi_wheels)}.")
            self.chi = chi_wheels

        if motor_wheels is None:
            self.motor = [
                Wheel(size, name=f"Motor_{i+1}") for i, size in enumerate(MOTOR_SIZES)
            ]
        else:
            if len(motor_wheels) != 2:
                raise ValueError(f"Requires exactly 2 Motor wheels, got {len(motor_wheels)}.")
            self.motor = motor_wheels

        if psi_wheels is None:
            self.psi = [
                Wheel(size, name=f"Psi_{i+1}") for i, size in enumerate(PSI_SIZES)
            ]
        else:
            if len(psi_wheels) != 5:
                raise ValueError(f"Requires exactly 5 Psi wheels, got {len(psi_wheels)}.")
            self.psi = psi_wheels

    def get_chi_vector(self) -> List[int]:
        """Get current 5-bit vector from the 5 Chi wheels."""
        return [w.get_active_pin() for w in self.chi]

    def get_psi_vector(self) -> List[int]:
        """Get current 5-bit vector from the 5 Psi wheels."""
        return [w.get_active_pin() for w in self.psi]

    def get_keystream_vector(self) -> List[int]:
        """Generate current 5-bit keystream vector K = Chi ^ Psi."""
        return xor_vectors(self.get_chi_vector(), self.get_psi_vector())

    def step(self) -> None:
        """Advance wheels according to Lorenz stepping rules for next character:

        1. All 5 Chi wheels step every character.
        2. Motor 1 (mu1) steps every character.
        3. Motor 2 (mu2) steps ONLY IF active pin on Motor 1 is 1.
        4. All 5 Psi wheels step ONLY IF active pin on Motor 2 is 1.
        """
        mu1_active = self.motor[0].get_active_pin()
        mu2_active = self.motor[1].get_active_pin()

        # Step Chi wheels unconditionally
        for w in self.chi:
            w.step()

        # Step Motor 1 unconditionally
        self.motor[0].step()

        # Step Motor 2 if Motor 1 active pin was 1
        if mu1_active == 1:
            self.motor[1].step()

        # Step Psi wheels if Motor 2 active pin was 1
        if mu2_active == 1:
            for w in self.psi:
                w.step()

    def get_positions(self) -> Dict[str, List[int]]:
        """Get current position indices for all 12 wheels.

        Returns:
            Dict containing 'chi', 'motor', and 'psi' position lists.
        """
        return {
            "chi": [w.get_position() for w in self.chi],
            "motor": [w.get_position() for w in self.motor],
            "psi": [w.get_position() for w in self.psi],
        }

    def set_positions(
        self,
        positions: Union[Dict[str, List[int]], List[int]]
    ) -> None:
        """Set positions for all 12 wheels.

        Args:
            positions: Dict containing 'chi', 'motor', 'psi' lists OR flat list of 12 ints.
        """
        if isinstance(positions, dict):
            chi_pos = positions.get("chi", [])
            motor_pos = positions.get("motor", [])
            psi_pos = positions.get("psi", [])

            if len(chi_pos) != 5 or len(motor_pos) != 2 or len(psi_pos) != 5:
                raise ValueError("Positions dict must contain 5 chi, 2 motor, and 5 psi values.")

            for w, p in zip(self.chi, chi_pos):
                w.set_position(p)
            for w, p in zip(self.motor, motor_pos):
                w.set_position(p)
            for w, p in zip(self.psi, psi_pos):
                w.set_position(p)

        elif isinstance(positions, (list, tuple)):
            if len(positions) != 12:
                raise ValueError(f"Flat positions list must contain exactly 12 integers, got {len(positions)}.")

            for w, p in zip(self.chi, positions[0:5]):
                w.set_position(p)
            for w, p in zip(self.motor, positions[5:7]):
                w.set_position(p)
            for w, p in zip(self.psi, positions[7:12]):
                w.set_position(p)
        else:
            raise ValueError("Positions must be a dict or list/tuple.")
