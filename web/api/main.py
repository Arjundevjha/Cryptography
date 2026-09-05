import sys
import os

# Ensure repository root is in python path to resolve methods package in Vercel serverless environment
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field
import logging
import math
from methods.classical import affine

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Cryptography Museum API",
    description="Backend service for Cryptography Museum web application.",
    version="0.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# ASGI middleware to strip /api/main prefix on Vercel deployments
class VercelPathMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            path = scope.get("path", "")
            if path.startswith("/api/main"):
                scope["path"] = path[len("/api/main"):]
                if "raw_path" in scope:
                    scope["raw_path"] = scope["raw_path"][len("/api/main".encode()):]
        await self.app(scope, receive, send)

app.add_middleware(VercelPathMiddleware)

# CORS Middleware
from urllib.parse import urlparse

DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

def is_valid_origin(origin: str) -> bool:
    """Validates if an origin string is a secure, well-formed HTTP/HTTPS origin."""
    if not isinstance(origin, str):
        return False
    origin = origin.strip()
    if not origin or origin == "*":
        return False
    if origin.endswith("/"):
        origin = origin[:-1]
    if any(c in origin for c in (" ", "\t", "\r", "\n", "<", ">", '"', "'", ";", "@")):
        return False
    try:
        parsed = urlparse(origin)
        if parsed.scheme not in ("http", "https"):
            return False
        if not parsed.netloc or "*" in parsed.netloc:
            return False
        if parsed.path or parsed.params or parsed.query or parsed.fragment:
            return False
        netloc = parsed.netloc
        if netloc.startswith("[") and "]" in netloc:
            ipv6_str = netloc[1:netloc.index("]")]
            import ipaddress
            try:
                ipaddress.ip_address(ipv6_str)
            except ValueError:
                return False
            netloc = netloc.split("]")[-1]
        if ":" in netloc:
            port_str = netloc.split(":")[-1]
            if port_str:
                if not port_str.isdigit() or not (1 <= int(port_str) <= 65535):
                    return False
        return True
    except ValueError:
        return False
    except Exception as e:
        logger.warning("Unexpected error validating origin '%s': %s", origin, e)
        return False

def parse_allowed_origins(env_str: str | None) -> list[str]:
    """Parses and validates CORS_ALLOWED_ORIGINS from environment string."""
    if not env_str:
        return DEFAULT_ALLOWED_ORIGINS
    origins: list[str] = []
    for item in env_str.split(","):
        item = item.strip()
        if item.endswith("/"):
            item = item[:-1]
        if is_valid_origin(item):
            if item not in origins:
                origins.append(item)
    return origins if origins else DEFAULT_ALLOWED_ORIGINS

allowed_origins = parse_allowed_origins(os.getenv("CORS_ALLOWED_ORIGINS"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Origin", "X-Requested-With"],
)

# Custom exception handler for validation errors to return HTTP 400 on limit violation
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    for error in exc.errors():
        # Check if the error is due to string length constraint
        if error.get("type") in ("string_too_long", "value_error.any_str.max_length") or "500" in str(error.get("msg")):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Input string length exceeds limit of 500 characters."},
            )
    # Default to 400 for any validation errors to be safe and strictly adhere to HTTP 400 Bad Request
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.errors()},
    )

class CipherInput(BaseModel):
    text: str = Field(..., max_length=500, description="The input text to process (max 500 chars)")

class CaesarEncryptInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The plaintext to encrypt")
    shift: int = Field(..., ge=-100000, le=100000, description="Shift amount (0-25)")

class CaesarDecryptInput(BaseModel):
    ciphertext: str = Field(..., max_length=500, description="The ciphertext to decrypt")
    shift: int = Field(..., ge=-100000, le=100000, description="Shift amount (0-25)")

class VigenereEncryptInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The plaintext to encrypt")
    key: str = Field(..., max_length=500, description="Secret key phrase")

class VigenereDecryptInput(BaseModel):
    ciphertext: str = Field(..., max_length=500, description="The ciphertext to decrypt")
    key: str = Field(..., max_length=500, description="Secret key phrase")

class PlayfairEncryptInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The plaintext to encrypt")
    key: str = Field(..., max_length=500, description="Secret key phrase")

class PlayfairDecryptInput(BaseModel):
    ciphertext: str = Field(..., max_length=500, description="The ciphertext to decrypt")
    key: str = Field(..., max_length=500, description="Secret key phrase")

class AffineEncryptInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The plaintext to encrypt")
    a_key: int = Field(..., ge=-100000, le=100000, description="Key a (must be coprime to 26)")
    b_key: int = Field(..., ge=-100000, le=100000, description="Key b")

class AffineDecryptInput(BaseModel):
    ciphertext: str = Field(..., max_length=500, description="The ciphertext to decrypt")
    a_key: int = Field(..., ge=-100000, le=100000, description="Key a (must be coprime to 26)")
    b_key: int = Field(..., ge=-100000, le=100000, description="Key b")

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/validate")
async def validate_input(data: CipherInput):
    return {"status": "valid", "length": len(data.text)}

@app.post("/api/caesar/encrypt")
def caesar_encrypt(data: CaesarEncryptInput):
    try:
        from methods.classical import caesar
        ciphertext = caesar.encrypt(data.plaintext, data.shift)
        return {"ciphertext": ciphertext}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Caesar encryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Encryption failed"
        )

@app.post("/api/caesar/decrypt")
def caesar_decrypt(data: CaesarDecryptInput):
    try:
        from methods.classical import caesar
        plaintext = caesar.decrypt(data.ciphertext, data.shift)
        return {"plaintext": plaintext}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Caesar decryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decryption failed"
        )

@app.post("/api/vigenere/encrypt")
def vigenere_encrypt(data: VigenereEncryptInput):
    if not data.key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vigenere key cannot be empty."
        )
    try:
        from methods.classical import vigenere
        ciphertext = vigenere.encrypt(data.plaintext, data.key)
        return {"ciphertext": ciphertext}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Vigenere encryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Encryption failed"
        )

@app.post("/api/vigenere/decrypt")
def vigenere_decrypt(data: VigenereDecryptInput):
    if not data.key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vigenere key cannot be empty."
        )
    try:
        from methods.classical import vigenere
        plaintext = vigenere.decrypt(data.ciphertext, data.key)
        return {"plaintext": plaintext}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Vigenere decryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decryption failed"
        )

@app.post("/api/playfair/encrypt")
def playfair_encrypt(data: PlayfairEncryptInput):
    if not data.key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Playfair key cannot be empty."
        )
    try:
        from methods.classical import playfair
        ciphertext = playfair.encrypt(data.plaintext, data.key)
        return {"ciphertext": ciphertext}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Playfair encryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Encryption failed"
        )

@app.post("/api/playfair/decrypt")
def playfair_decrypt(data: PlayfairDecryptInput):
    if not data.key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Playfair key cannot be empty."
        )
    try:
        from methods.classical import playfair
        plaintext = playfair.decrypt(data.ciphertext, data.key)
        return {"plaintext": plaintext}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Playfair decryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decryption failed"
        )

@app.post("/api/affine/encrypt")
def affine_encrypt(data: AffineEncryptInput):

    # Check if a_key is coprime to 26
    # Reduce a_key mod 26 first to handle negative or large values
    a_norm = data.a_key % 26
    if math.gcd(a_norm, 26) != 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parameter 'a' must be coprime to 26."
        )
    try:
        ciphertext = affine.encrypt(data.plaintext, data.a_key, data.b_key)
        return {"ciphertext": ciphertext}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Affine encryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Encryption failed"
        )

@app.post("/api/affine/decrypt")
def affine_decrypt(data: AffineDecryptInput):
    # Check if a_key is coprime to 26
    a_norm = data.a_key % 26
    if math.gcd(a_norm, 26) != 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parameter 'a' must be coprime to 26."
        )
    try:
        plaintext = affine.decrypt(data.ciphertext, data.a_key, data.b_key)
        return {"plaintext": plaintext}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Affine decryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decryption failed"
        )


# ==========================================
# HISTORICAL CIPHERS
# ==========================================

class ScytaleEncryptInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The plaintext to encrypt")
    width: int = Field(..., gt=0, le=10000, description="Cylinder width (diameter)")

class ScytaleDecryptInput(BaseModel):
    ciphertext: str = Field(..., max_length=500, description="The ciphertext to decrypt")
    width: int = Field(..., gt=0, le=10000, description="Cylinder width (diameter)")

class PolybiusEncryptInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The plaintext to encrypt")
    key: str = Field(default=None, max_length=500, description="Polybius grid key (25 letters)")

class PolybiusDecryptInput(BaseModel):
    ciphertext: str = Field(..., max_length=500, description="The ciphertext to decrypt")
    key: str = Field(default=None, max_length=500, description="Polybius grid key (25 letters)")

class EnigmaEncipherInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The message to encipher")
    rotors: list[str] = Field(..., max_length=3, description="Rotors like ['I', 'II', 'III']")
    positions: list[str] = Field(..., max_length=3, description="Positions like ['A', 'A', 'A']")
    rings: list[str] = Field(..., max_length=3, description="Rings like ['A', 'A', 'A'] or ['1', '1', '1']")
    plugboard: list[str] = Field(default=[], max_length=13, description="Plugboard swaps like ['AB', 'CD']")
    reflector: str = Field(default="B", max_length=10, description="Reflector selection (A, B, C, B_THIN, C_THIN)")

class LorenzEncryptInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The plaintext to encrypt")
    positions: list[int] = Field(default=[], max_length=12, description="12 wheel positions [chi1..5, motor1..2, psi1..5]")
    chi_pins: list[list[int]] = Field(default=[], max_length=5, description="Custom pin state arrays for 5 Chi wheels")
    motor_pins: list[list[int]] = Field(default=[], max_length=2, description="Custom pin state arrays for 2 Motor wheels")
    psi_pins: list[list[int]] = Field(default=[], max_length=5, description="Custom pin state arrays for 5 Psi wheels")

class LorenzDecryptInput(BaseModel):
    ciphertext: str = Field(..., max_length=500, description="The ciphertext to decrypt")
    positions: list[int] = Field(default=[], max_length=12, description="12 wheel positions [chi1..5, motor1..2, psi1..5]")
    chi_pins: list[list[int]] = Field(default=[], max_length=5, description="Custom pin state arrays for 5 Chi wheels")
    motor_pins: list[list[int]] = Field(default=[], max_length=2, description="Custom pin state arrays for 2 Motor wheels")
    psi_pins: list[list[int]] = Field(default=[], max_length=5, description="Custom pin state arrays for 5 Psi wheels")


@app.post("/api/scytale/encrypt")
def scytale_encrypt(data: ScytaleEncryptInput):
    if data.width < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Width must be at least 2 for Scytale."
        )
    try:
        from methods.historical import scytale
        ciphertext = scytale.encrypt(data.plaintext, data.width)
        return {"ciphertext": ciphertext}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Scytale encryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Encryption failed"
        )

@app.post("/api/scytale/decrypt")
def scytale_decrypt(data: ScytaleDecryptInput):
    if data.width < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Width must be at least 2 for Scytale."
        )
    try:
        from methods.historical import scytale
        plaintext = scytale.decrypt(data.ciphertext, data.width)
        return {"plaintext": plaintext}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Scytale decryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decryption failed"
        )

@app.post("/api/polybius/encrypt")
def polybius_encrypt(data: PolybiusEncryptInput):
    grid_key = data.key
    if not grid_key:
        grid_key = "abcdefghiklmnopqrstuvwxyz"
    else:
        # validate key
        grid_key_clean = grid_key.lower().replace("j", "i")
        if len(grid_key_clean) != 25 or len(set(grid_key_clean)) != 25 or not grid_key_clean.isalpha():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Key must contain exactly 25 unique letters."
            )
    try:
        from methods.historical import polybius
        ciphertext = polybius.encrypt(data.plaintext, grid_key)
        return {"ciphertext": ciphertext}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Polybius encryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Encryption failed"
        )

@app.post("/api/polybius/decrypt")
def polybius_decrypt(data: PolybiusDecryptInput):
    grid_key = data.key
    if not grid_key:
        grid_key = "abcdefghiklmnopqrstuvwxyz"
    else:
        # validate key
        grid_key_clean = grid_key.lower().replace("j", "i")
        if len(grid_key_clean) != 25 or len(set(grid_key_clean)) != 25 or not grid_key_clean.isalpha():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Key must contain exactly 25 unique letters."
            )
    
    # validate ciphertext coordinates
    try:
        digits = []
        i = 0
        n = len(data.ciphertext)
        while i < n:
            char = data.ciphertext[i]
            if char.isdigit():
                if i + 1 < n and data.ciphertext[i+1].isdigit():
                    d1 = int(char)
                    d2 = int(data.ciphertext[i+1])
                    if not (1 <= d1 <= 5 and 1 <= d2 <= 5):
                        raise ValueError("Coordinates must be between 1 and 5")
                    i += 2
                else:
                    raise ValueError("Digits must appear in pairs")
            else:
                i += 1
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )

    try:
        from methods.historical import polybius
        plaintext = polybius.decrypt(data.ciphertext, grid_key)
        return {"plaintext": plaintext}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Polybius decryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decryption failed"
        )

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


def parse_and_validate_enigma_rings(rings: list[str]) -> list[int]:
    if len(rings) != 3:
        raise HTTPException(status_code=400, detail="Exactly 3 ring settings must be specified.")
        
    parsed_rings = []
    for r in rings:
        if isinstance(r, int):
            if 1 <= r <= 26:
                parsed_rings.append(r)
            else:
                raise HTTPException(status_code=400, detail="Invalid ring setting")
        elif isinstance(r, str):
            r_str = r.strip()
            if r_str.isdigit():
                val = int(r_str)
                if 1 <= val <= 26:
                    parsed_rings.append(val)
                else:
                    raise HTTPException(status_code=400, detail="Invalid ring setting")
            elif len(r_str) == 1 and r_str.isalpha():
                val = ord(r_str.upper()) - ord('A') + 1
                parsed_rings.append(val)
            else:
                raise HTTPException(status_code=400, detail="Invalid ring setting")
        else:
            raise HTTPException(status_code=400, detail="Invalid ring setting")
    return parsed_rings


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


@app.post("/api/enigma/encipher")
def enigma_encipher(data: EnigmaEncipherInput):
    """Encipher plaintext using the Enigma cipher machine."""
    try:
        enigma_machine = build_enigma_machine(data)
        ciphertext_chars = [
            enigma_machine.encipher(char.upper()) if char.isalpha() else char
            for char in data.plaintext
        ]
        return {"ciphertext": "".join(ciphertext_chars)}
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


@app.post("/api/lorenz/encrypt")
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


@app.post("/api/lorenz/decrypt")
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


# ==========================================
# MODERN CIPHERS
# ==========================================

class AesEncryptInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The plaintext to encrypt")
    key: str = Field(..., max_length=500, description="16 or 32-byte key (raw string or hex)")
    key_format: str = Field(default="text", description="Key format: 'text' or 'hex'")
    plaintext_format: str = Field(default="text", description="Plaintext format: 'text' or 'hex'")

class AesDecryptInput(BaseModel):
    ciphertext: str = Field(..., max_length=500, description="The hex ciphertext to decrypt")
    key: str = Field(..., max_length=500, description="16 or 32-byte key (raw string or hex)")
    nonce: str = Field(..., max_length=500, description="The hex nonce")
    key_format: str = Field(default="text", description="Key format: 'text' or 'hex'")

class RsaKeygenInput(BaseModel):
    p: int = Field(..., gt=0, lt=2**2048, description="Prime number p")
    q: int = Field(..., gt=0, lt=2**2048, description="Prime number q")
    e: int = Field(default=65537, gt=0, lt=2**2048, description="Public exponent e")

class RsaEncryptInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The plaintext to encrypt")
    public_key: str = Field(..., max_length=500, description="PEM formatted RSA public key")

class RsaDecryptInput(BaseModel):
    ciphertext: str = Field(..., max_length=500, description="The hex ciphertext to decrypt")
    private_key: str = Field(..., max_length=500, description="PEM formatted RSA private key")

class Sha256Input(BaseModel):
    plaintext: str = Field("", max_length=500, description="The plaintext to hash")


def parse_aes_key(key: str, key_format: str = "text") -> bytes:
    if key_format not in ("text", "hex"):
        raise HTTPException(status_code=400, detail="Invalid key format")
    if key_format == "hex":
        try:
            key_bytes = bytes.fromhex(key)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid hex key")
    else:
        # Try to parse as hex if length is 64 (32 bytes) or 32 (16 bytes) and only hex characters
        if len(key) in (32, 64) and all(c in "0123456789abcdefABCDEF" for c in key):
            try:
                key_bytes = bytes.fromhex(key)
            except ValueError:
                key_bytes = key.encode('utf-8')
        else:
            key_bytes = key.encode('utf-8')
    
    if len(key_bytes) not in (16, 32):
        raise HTTPException(status_code=400, detail="Key must be 16 or 32 bytes (or 32 or 64 hex characters)")
    
    return key_bytes


@app.post("/api/aes/encrypt")
def aes_encrypt(data: AesEncryptInput):
    # Parse plaintext
    if data.plaintext_format not in ("text", "hex"):
        raise HTTPException(status_code=400, detail="Invalid plaintext format")
    plaintext = data.plaintext
    if data.plaintext_format == "hex":
        try:
            plaintext = bytes.fromhex(plaintext).decode('utf-8')
        except (ValueError, UnicodeDecodeError) as ve:
            logger.warning("Invalid hex plaintext in AES encrypt: %s", ve)
            raise HTTPException(status_code=400, detail="Invalid hex plaintext")
            
    key_bytes = parse_aes_key(data.key, data.key_format)
    
    try:
        from methods.modern import aes
        ciphertext_bytes, nonce_bytes = aes.encrypt(plaintext, key_bytes)
        return {
            "ciphertext": ciphertext_bytes.hex(),
            "nonce": nonce_bytes.hex()
        }
    except Exception as e:
        logger.error("AES encryption error: %s", e)
        raise HTTPException(status_code=400, detail="Encryption failed")


@app.post("/api/aes/decrypt")
def aes_decrypt_endpoint(data: AesDecryptInput):
    key_bytes = parse_aes_key(data.key, data.key_format)
    
    try:
        ciphertext_bytes = bytes.fromhex(data.ciphertext)
        nonce_bytes = bytes.fromhex(data.nonce)
    except ValueError as ve:
        logger.warning("Invalid hex ciphertext or nonce in AES decrypt: %s", ve)
        raise HTTPException(status_code=400, detail="Ciphertext and nonce must be valid hex strings")
        
    try:
        from methods.modern import aes
        plaintext = aes.decrypt(ciphertext_bytes, key_bytes, nonce_bytes)
        return {"plaintext": plaintext}
    except Exception as e:
        logger.error("AES decryption error: %s", e)
        raise HTTPException(status_code=400, detail="Decryption failed")


@app.post("/api/rsa/keygen")
def rsa_keygen(data: RsaKeygenInput):
    from methods.modern.keypair import is_prime
    from methods.modern.helpers import b64encode
    
    if data.p <= 2 or not is_prime(data.p):
        raise HTTPException(status_code=400, detail="p must be a prime greater than 2")
    if data.q <= 2 or not is_prime(data.q):
        raise HTTPException(status_code=400, detail="q must be a prime greater than 2")
        
    n = data.p * data.q
    phi = (data.p - 1) * (data.q - 1)
    
    if math.gcd(data.e, phi) != 1:
        raise HTTPException(status_code=400, detail="e must be coprime to phi")
        
    try:
        d = pow(data.e, -1, phi)
    except ValueError:
        raise HTTPException(status_code=400, detail="Modular inverse of e mod phi does not exist")
        
    pub_str = f"{n}:{data.e}"
    pub_b64 = b64encode(pub_str.encode('utf-8'))
    public_key_pem = (
        f"-----BEGIN RSA PUBLIC KEY-----\n"
        f"{pub_b64}\n"
        f"-----END RSA PUBLIC KEY-----\n"
    )

    priv_str = f"{n}:{data.e}:{d}:{data.p}:{data.q}"
    priv_b64 = b64encode(priv_str.encode('utf-8'))
    private_key_pem = (
        f"-----BEGIN RSA PRIVATE KEY-----\n"
        f"{priv_b64}\n"
        f"-----END RSA PRIVATE KEY-----\n"
    )
    
    return {
        "n": n,
        "phi": phi,
        "d": d,
        "public_key": public_key_pem,
        "private_key": private_key_pem
    }


@app.post("/api/rsa/encrypt")
def rsa_encrypt(data: RsaEncryptInput):
    try:
        from methods.modern import rsa
        pub_key_bytes = data.public_key.strip().encode('utf-8')
        ciphertext_bytes = rsa.encrypt(data.plaintext, pub_key_bytes)
        return {"ciphertext": ciphertext_bytes.hex()}
    except Exception as e:
        logger.error("RSA encryption error: %s", e)
        raise HTTPException(status_code=400, detail="Encryption failed")


@app.post("/api/rsa/decrypt")
def rsa_decrypt(data: RsaDecryptInput):
    try:
        from methods.modern import rsa
        priv_key_bytes = data.private_key.strip().encode('utf-8')
        ciphertext_bytes = bytes.fromhex(data.ciphertext)
        plaintext = rsa.decrypt(ciphertext_bytes, priv_key_bytes)
        return {"plaintext": plaintext}
    except Exception as e:
        logger.error("RSA decryption error: %s", e)
        raise HTTPException(status_code=400, detail="Decryption failed")


@app.post("/api/sha256")
def sha256_endpoint(data: Sha256Input):
    try:
        from methods.modern.hash_functions import sha256
        hash_val = sha256(data.plaintext)
        return {"hash": hash_val}
    except Exception as e:
        logger.error("SHA256 error: %s", e)
        raise HTTPException(status_code=400, detail="Hashing failed")


