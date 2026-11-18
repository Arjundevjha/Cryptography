"""Historical cipher routes: Enigma and Lorenz SZ40/SZ42."""

import logging
from typing import Annotated

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
router = APIRouter()

# Security: Bounded types to prevent Denial of Service (DoS) via Unrestricted Resource Allocation
Str10 = Annotated[str, Field(max_length=10)]
BoundedInt = Annotated[int, Field(ge=-10000, le=10000)]
PinVal = Annotated[int, Field(ge=0, le=1)]
PinList = Annotated[list[PinVal], Field(max_length=61)]


class EnigmaEncipherInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The message to encipher")
    rotors: list[Str10] = Field(..., max_length=3, description="Rotors like ['I', 'II', 'III']")
    positions: list[Str10] = Field(..., max_length=3, description="Positions like ['A', 'A', 'A']")
    rings: list[Str10] = Field(..., max_length=3, description="Rings like ['A', 'A', 'A'] or ['1', '1', '1']")
    plugboard: list[Str10] = Field(default=[], max_length=13, description="Plugboard swaps like ['AB', 'CD']")
    reflector: str = Field(default="B", max_length=10, description="Reflector selection (A, B, C, B_THIN, C_THIN)")


class LorenzEncryptInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The plaintext to encrypt")
    positions: list[BoundedInt] = Field(default=[], max_length=12, description="12 wheel positions [chi1..5, motor1..2, psi1..5]")
    chi_pins: list[PinList] = Field(default=[], max_length=5, description="Custom pin state arrays for 5 Chi wheels")
    motor_pins: list[PinList] = Field(default=[], max_length=2, description="Custom pin state arrays for 2 Motor wheels")
    psi_pins: list[PinList] = Field(default=[], max_length=5, description="Custom pin state arrays for 5 Psi wheels")


class LorenzDecryptInput(BaseModel):
    ciphertext: str = Field(..., max_length=500, description="The ciphertext to decrypt")
    positions: list[BoundedInt] = Field(default=[], max_length=12, description="12 wheel positions [chi1..5, motor1..2, psi1..5]")
    chi_pins: list[PinList] = Field(default=[], max_length=5, description="Custom pin state arrays for 5 Chi wheels")
    motor_pins: list[PinList] = Field(default=[], max_length=2, description="Custom pin state arrays for 2 Motor wheels")
    psi_pins: list[PinList] = Field(default=[], max_length=5, description="Custom pin state arrays for 5 Psi wheels")


ENIGMA_ROTOR_MAP = {
    "I": ("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q"),
    "II": ("AJDKSIRUXBLHWTMCQGZNPYFVOE", "W"),
    "III": ("BDFHJLCPRTXVZNYEIWGAKMUSQO", "V"),
    "IV": ("ESOVPZJAYQUIRHXLNFTGKDCMWB", "J"),
    "V": ("VZBRGITYUPSDNHLXAWMJQOFECK", "Z"),
    "VI": ("JPGVOUMFYQBENHZRDKASXLICTW", "M"),
    "VII": ("NZJHGRCXMYSWBOUFAIVLPEKQDT", "Z"),
    "VIII": ("FKQHTLXOCBJSPDZRAMEWNIUYGV", "M"),
}

ENIGMA_REFLECTOR_MAP = {
    "A": "EJMZALYXVBWFCRQUONTSPIKHGD",
    "B": "YRUHQSLDPXNGOKMIEBFZCWVJAT",
    "C": "FVPJIAOYEDRZXWGCTKUQSBNMHL",
    "B_THIN": "ENKQAUYWJICOPBLMDXZVFTHRGS",
    "C_THIN": "RDOBJNTKVEHMLFCWZAXGYIPSUQ",
}


def validate_enigma_rotors(rotors: list[str]) -> None:
    if len(rotors) != 3:
        raise HTTPException(status_code=400, detail="Exactly 3 rotors must be specified.")
    if len(set(rotors)) != 3:
        raise HTTPException(status_code=400, detail="Duplicate rotors are not allowed.")

    allowed_rotors = set(ENIGMA_ROTOR_MAP.keys())
    for r in rotors:
        if r not in allowed_rotors:
            raise HTTPException(status_code=400, detail=f"Invalid rotor '{r}'.")


def parse_enigma_positions(positions: list[str]) -> str:
    """Validates and returns rotor positions as a key string."""
    if len(positions) != 3:
        raise HTTPException(status_code=400, detail="Exactly 3 rotor positions must be specified.")
    for pos in positions:
        if len(pos) != 1 or not pos.isalpha():
            raise HTTPException(status_code=400, detail="Rotor positions must be single letters.")
    return "".join([pos.upper() for pos in positions])


def _parse_ring_item(r: int | str) -> int:
    """Helper to parse a single ring setting (integer 1-26 or letter A-Z / '1'-'26')."""
    if isinstance(r, int) and 1 <= r <= 26:
        return r
    if isinstance(r, str):
        r_str = r.strip()
        if r_str.isdigit() and 1 <= int(r_str) <= 26:
            return int(r_str)
        if len(r_str) == 1 and r_str.isalpha():
            return ord(r_str.upper()) - ord('A') + 1
    raise HTTPException(status_code=400, detail="Invalid ring setting")


def parse_and_validate_enigma_rings(rings: list[str]) -> list[int]:
    if len(rings) != 3:
        raise HTTPException(status_code=400, detail="Exactly 3 ring settings must be specified.")
    return [_parse_ring_item(r) for r in rings]


def validate_enigma_plugboard(plugboard: list[str]) -> None:
    seen_chars = set()
    for swap in plugboard:
        if len(swap) != 2 or not swap.isalpha():
            raise HTTPException(status_code=400, detail="Invalid plugboard swap format")
        swap_upper = swap.upper()
        for char in swap_upper:
            if char in seen_chars:
                raise HTTPException(status_code=400, detail="Duplicate plugboard connection")
            seen_chars.add(char)


def get_enigma_reflector_wiring(reflector_name: str | None) -> str:
    """Retrieves and validates reflector wiring for the given reflector name."""
    reflector_key = reflector_name.upper() if reflector_name else "B"
    if reflector_key not in ENIGMA_REFLECTOR_MAP:
        raise HTTPException(status_code=400, detail=f"Invalid reflector '{reflector_name}'.")
    return ENIGMA_REFLECTOR_MAP[reflector_key]


def build_enigma_machine(data: EnigmaEncipherInput):
    """Validates parameters and builds an Enigma machine instance."""
    validate_enigma_rotors(data.rotors)
    initial_key = parse_enigma_positions(data.positions)
    parsed_rings = parse_and_validate_enigma_rings(data.rings)
    validate_enigma_plugboard(data.plugboard)
    reflector_wiring = get_enigma_reflector_wiring(data.reflector)

    from methods.historical.enigma.rotor import Rotor
    from methods.historical.enigma.plugboard import Plugboard
    from methods.historical.enigma.reflector import Reflector
    from methods.historical.enigma.keyboard import Keyboard
    from methods.historical.enigma.enigma import Enigma

    reflector = Reflector(reflector_wiring)
    rotors_list = [Rotor(*ENIGMA_ROTOR_MAP[r_name]) for r_name in data.rotors]
    plugboard = Plugboard([swap.upper() for swap in data.plugboard])
    keyboard = Keyboard()

    enigma_machine = Enigma(reflector, rotors_list, plugboard, keyboard)
    enigma_machine.set_rings(parsed_rings)
    enigma_machine.set_key(initial_key)
    return enigma_machine


@router.post("/api/enigma/encipher")
def enigma_encipher(data: EnigmaEncipherInput):
    """Encipher plaintext using the Enigma cipher machine."""
    try:
        enigma_machine = build_enigma_machine(data)
        ciphertext = enigma_machine.process_message(data.plaintext)
        return {"ciphertext": ciphertext}
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Enigma encryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Encryption failed"
        )


@router.post("/api/lorenz/encrypt")
def lorenz_encrypt(data: LorenzEncryptInput):
    try:
        from methods.historical.lorenz import Lorenz
        positions = data.positions if data.positions else None
        chi_pins = data.chi_pins if data.chi_pins else None
        motor_pins = data.motor_pins if data.motor_pins else None
        psi_pins = data.psi_pins if data.psi_pins else None

        machine = Lorenz(
            chi_pins=chi_pins,
            motor_pins=motor_pins,
            psi_pins=psi_pins,
            positions=positions
        )
        ciphertext = machine.encrypt_text(data.plaintext)
        return {"ciphertext": ciphertext}
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Encryption failed: {str(ve)}"
        )
    except Exception as e:
        logger.error("Lorenz encryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Encryption failed"
        )


@router.post("/api/lorenz/decrypt")
def lorenz_decrypt(data: LorenzDecryptInput):
    try:
        from methods.historical.lorenz import Lorenz
        positions = data.positions if data.positions else None
        chi_pins = data.chi_pins if data.chi_pins else None
        motor_pins = data.motor_pins if data.motor_pins else None
        psi_pins = data.psi_pins if data.psi_pins else None

        machine = Lorenz(
            chi_pins=chi_pins,
            motor_pins=motor_pins,
            psi_pins=psi_pins,
            positions=positions
        )
        plaintext = machine.decrypt_text(data.ciphertext)
        return {"plaintext": plaintext}
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Decryption failed: {str(ve)}"
        )
    except Exception as e:
        logger.error("Lorenz decryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decryption failed"
        )
