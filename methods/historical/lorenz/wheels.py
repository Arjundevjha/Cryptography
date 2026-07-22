"""Pinwheel (Rotor) class for Lorenz SZ40/SZ42 machine."""

from typing import List, Optional


class Wheel:
    """Represents a single pinwheel rotor in the Lorenz SZ cipher machine."""

    def __init__(
        self,
        size: int,
        pins: Optional[List[int]] = None,
        position: int = 0,
        name: str = ""
    ):
        """Initialize a Lorenz pinwheel.

        Args:
            size: Number of pins around the wheel circumference (must be > 0).
            pins: Optional list of binary pin states (0 or 1). Default is alternating pattern.
            position: Initial 0-indexed position of the wheel.
            name: Optional name string for identification (e.g., 'Chi_1', 'Motor_1').
        """
        if size <= 0:
            raise ValueError("Wheel size must be greater than 0.")

        self.size = size
        self.name = name or f"Wheel_{size}"

        if pins is None:
            # Default alternating pin pattern [1, 0, 1, 0, ...]
            self.pins = [(i % 2) for i in range(size)]
        else:
            self.set_pins(pins)

        self.set_position(position)

    def set_pins(self, pins: List[int]) -> None:
        """Set the pin states for this wheel.

        Args:
            pins: List of pin state integers (0 or 1). Must match wheel size.

        Raises:
            ValueError: If pin list length does not match wheel size or contains invalid bits.
        """
        if len(pins) != self.size:
            raise ValueError(
                f"Wheel '{self.name}' requires exactly {self.size} pins, got {len(pins)}."
            )
        cleaned_pins = []
        for bit in pins:
            if bit not in (0, 1):
                raise ValueError(f"Invalid pin bit value '{bit}'. Pins must be 0 or 1.")
            cleaned_pins.append(bit)
        self.pins = cleaned_pins

    def set_position(self, position: int) -> None:
        """Set the current active position of the wheel.

        Args:
            position: 0-indexed position integer.

        Raises:
            ValueError: If position is out of valid range [0, size - 1].
        """
        if not (0 <= position < self.size):
            raise ValueError(
                f"Position {position} out of bounds for wheel '{self.name}' (size {self.size})."
            )
        self.position = position

    def get_position(self) -> int:
        """Get the current position of the wheel."""
        return self.position

    def get_active_pin(self) -> int:
        """Get the bit value (0 or 1) of the current active pin."""
        return self.pins[self.position]

    def step(self) -> int:
        """Advance the wheel position forward by 1 pin.

        Returns:
            The new position of the wheel.
        """
        self.position = (self.position + 1) % self.size
        return self.position

    def get_pins(self) -> List[int]:
        """Return a copy of the current pin configuration array."""
        return list(self.pins)
