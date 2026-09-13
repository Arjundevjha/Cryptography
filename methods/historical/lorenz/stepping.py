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
        self.chi = self._init_wheels(chi_wheels, CHI_SIZES, "Chi", 5)
        self.motor = self._init_wheels(motor_wheels, MOTOR_SIZES, "Motor", 2)
        self.psi = self._init_wheels(psi_wheels, PSI_SIZES, "Psi", 5)

    @staticmethod
    def _init_wheels(
        wheels: Optional[List[Wheel]],
        sizes: List[int],
        name_prefix: str,
        expected_count: int
    ) -> List[Wheel]:
        """Initialize or validate a set of wheels."""
        if wheels is None:
            return [Wheel(size, name=f"{name_prefix}_{i+1}") for i, size in enumerate(sizes)]
        if len(wheels) != expected_count:
            raise ValueError(f"Requires exactly {expected_count} {name_prefix} wheels, got {len(wheels)}.")
        return wheels

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
            self._set_positions_from_dict(positions)
        elif isinstance(positions, (list, tuple)):
            self._set_positions_from_sequence(positions)
        else:
            raise ValueError("Positions must be a dict or list/tuple.")

    def _set_positions_from_dict(self, positions: Dict[str, List[int]]) -> None:
        """Set wheel positions from a dictionary."""
        groups = (("chi", self.chi, 5), ("motor", self.motor, 2), ("psi", self.psi, 5))
        if any(len(positions.get(key, [])) != expected for key, _, expected in groups):
            raise ValueError("Positions dict must contain 5 chi, 2 motor, and 5 psi values.")

        for key, wheels, _ in groups:
            self._apply_positions(wheels, positions[key])

    def _set_positions_from_sequence(self, positions: Union[List[int], tuple]) -> None:
        """Set wheel positions from a flat 12-element list or tuple."""
        if len(positions) != 12:
            raise ValueError(f"Flat positions list must contain exactly 12 integers, got {len(positions)}.")

        self._apply_positions(self.chi, positions[0:5])
        self._apply_positions(self.motor, positions[5:7])
        self._apply_positions(self.psi, positions[7:12])

    @staticmethod
    def _apply_positions(wheels: List[Wheel], positions: Union[List[int], tuple]) -> None:
        """Apply target position values to a list of Wheel instances."""
        for wheel, pos in zip(wheels, positions):
            wheel.set_position(pos)
