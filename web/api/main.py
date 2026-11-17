import sys
import os

# Ensure repository root is in python path to resolve methods package in Vercel serverless environment
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from typing import Annotated
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field
import ipaddress
import logging
import math
from urllib.parse import urlparse
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
DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

_INVALID_ORIGIN_CHARS = frozenset(" \t\r\n<>'\"@;")

def _validate_origin_netloc(netloc: str) -> bool:
    """Validates host and port inside netloc, handling IPv6 literals and port ranges."""
    if netloc.startswith("[") and "]" in netloc:
        ipv6_str = netloc[1:netloc.index("]")]
        try:
            ipaddress.ip_address(ipv6_str)
        except ValueError:
            return False
        netloc = netloc.split("]")[-1]
    if ":" in netloc:
        port_str = netloc.split(":")[-1]
        if not port_str or not port_str.isdigit() or not (1 <= int(port_str) <= 65535):
            return False
    return True

def _check_origin_string_format(origin: str) -> bool:
    """Sanity checks basic string properties of an origin candidate."""
    if not isinstance(origin, str):
        return False
    cleaned = origin.strip()
    if not cleaned or cleaned == "*":
        return False
    return not any(c in _INVALID_ORIGIN_CHARS for c in cleaned)

def is_valid_origin(origin: str) -> bool:
    """Validates if an origin string is a secure, well-formed HTTP/HTTPS origin."""
    if not _check_origin_string_format(origin):
        return False
    origin = origin.strip()
    if origin.endswith("/"):
        origin = origin[:-1]
    try:
        parsed = urlparse(origin)
        if parsed.scheme not in ("http", "https"):
            return False
        if not parsed.netloc or "*" in parsed.netloc:
            return False
        if parsed.path or parsed.params or parsed.query or parsed.fragment:
            return False
        return _validate_origin_netloc(parsed.netloc)
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

# Security: Defense-in-depth middleware adding standard HTTP security headers
# to all FastAPI responses
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'; object-src 'none';"
    response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
    return response

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
# SUBSTITUTION CIPHER
# ==========================================

SubstitutionKeyStr = Annotated[str, Field(max_length=500)]
SubstitutionKeyChar = Annotated[str, Field(max_length=10)]
SubstitutionKeyDict = Annotated[dict[SubstitutionKeyChar, SubstitutionKeyChar], Field(max_length=26)]

class SubstitutionEncryptInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The plaintext to encrypt")
    key: SubstitutionKeyStr | SubstitutionKeyDict = Field(
        ..., description="26-letter permutation string or a-z mapping dictionary"
    )

class SubstitutionDecryptInput(BaseModel):
    ciphertext: str = Field(..., max_length=500, description="The ciphertext to decrypt")
    key: SubstitutionKeyStr | SubstitutionKeyDict = Field(
        ..., description="26-letter permutation string or a-z mapping dictionary"
    )


def parse_substitution_key(key: str | dict[str, str]) -> dict[str, str]:
    """Validate and normalize a substitution key into a 26-letter a-z bijection."""
    alphabet = "abcdefghijklmnopqrstuvwxyz"
    if isinstance(key, str):
        cleaned = key.strip().lower()
        if (
            len(cleaned) != 26
            or not cleaned.isascii()
            or not cleaned.isalpha()
            or len(set(cleaned)) != 26
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Substitution key string must contain 26 unique ASCII letters.",
            )
        return dict(zip(alphabet, cleaned))

    if isinstance(key, dict):
        if len(key) != 26:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Substitution key dictionary must contain all 26 letters.",
            )
        normalized: dict[str, str] = {}
        for k, v in key.items():
            if (
                not isinstance(k, str)
                or not isinstance(v, str)
                or len(k) != 1
                or len(v) != 1
                or not (k.isascii() and k.isalpha())
                or not (v.isascii() and v.isalpha())
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Substitution key entries must map single ASCII letters to single ASCII letters.",
                )
            normalized[k.lower()] = v.lower()
        if set(normalized.keys()) != set(alphabet) or len(set(normalized.values())) != 26:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Substitution key dictionary must be a bijection over a-z.",
            )
        return normalized

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Substitution key must be a 26-letter string or mapping dictionary.",
    )


@app.post("/api/substitution/encrypt")
def substitution_encrypt(data: SubstitutionEncryptInput):
    key_map = parse_substitution_key(data.key)
    try:
        from methods.classical import substitution
        ciphertext = substitution.encrypt(data.plaintext, key_map)
        return {"ciphertext": ciphertext}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Substitution encryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Encryption failed",
        )


@app.post("/api/substitution/decrypt")
def substitution_decrypt(data: SubstitutionDecryptInput):
    key_map = parse_substitution_key(data.key)
    try:
        from methods.classical import substitution
        plaintext = substitution.decrypt(data.ciphertext, key_map)
        return {"plaintext": plaintext}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Substitution decryption error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decryption failed",
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

def validate_polybius_key(key: str | None) -> str:
    """Validates and returns normalized Polybius grid key."""
    if not key:
        return "abcdefghiklmnopqrstuvwxyz"
    grid_key_clean = key.lower().replace("j", "i")
    if len(grid_key_clean) != 25 or len(set(grid_key_clean)) != 25 or not grid_key_clean.isalpha():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Key must contain exactly 25 unique letters."
        )
    # Security: Return normalized 25-character key grid (`grid_key_clean`) rather than raw `key`
    # to prevent out-of-bounds matrix coordinate generation (e.g. "61") when `key` contains 'j'.
    return grid_key_clean


def validate_polybius_ciphertext(ciphertext: str) -> None:
    """Validates digit coordinates in Polybius ciphertext."""
    i = 0
    n = len(ciphertext)
    while i < n:
        if not ciphertext[i].isdigit():
            i += 1
            continue
        if i + 1 >= n or not ciphertext[i + 1].isdigit():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Digits must appear in pairs"
            )
        d1, d2 = int(ciphertext[i]), int(ciphertext[i + 1])
        if not (1 <= d1 <= 5 and 1 <= d2 <= 5):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coordinates must be between 1 and 5"
            )
        i += 2


@app.post("/api/polybius/encrypt")
def polybius_encrypt(data: PolybiusEncryptInput):
    grid_key = validate_polybius_key(data.key)
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
    grid_key = validate_polybius_key(data.key)
    validate_polybius_ciphertext(data.ciphertext)

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


@app.post("/api/enigma/encipher")
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
    key_format: str = Field(default="text", max_length=10, description="Key format: 'text' or 'hex'")
    plaintext_format: str = Field(default="text", max_length=10, description="Plaintext format: 'text' or 'hex'")

class AesDecryptInput(BaseModel):
    ciphertext: str = Field(..., max_length=500, description="The hex ciphertext to decrypt")
    key: str = Field(..., max_length=500, description="16 or 32-byte key (raw string or hex)")
    nonce: str = Field(..., max_length=500, description="The hex nonce")
    key_format: str = Field(default="text", max_length=10, description="Key format: 'text' or 'hex'")

class RsaKeygenInput(BaseModel):
    p: int = Field(..., gt=0, lt=2**2048, description="Prime number p")
    q: int = Field(..., gt=0, lt=2**2048, description="Prime number q")
    e: int = Field(default=65537, ge=3, lt=2**2048, description="Public exponent e")

class RsaEncryptInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The plaintext to encrypt")
    public_key: str = Field(..., max_length=10000, description="PEM formatted RSA public key")

class RsaDecryptInput(BaseModel):
    ciphertext: str = Field(..., max_length=10000, description="The hex ciphertext to decrypt")
    private_key: str = Field(..., max_length=10000, description="PEM formatted RSA private key")

class Sha256Input(BaseModel):
    plaintext: str = Field("", max_length=500, description="The plaintext to hash")


def _decode_aes_key(key: str, key_format: str) -> bytes:
    """Helper to decode raw string or hex string key representation."""
    if key_format == "hex":
        try:
            return bytes.fromhex(key)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid hex key") from exc
    if len(key) in (32, 64) and all(c in "0123456789abcdefABCDEF" for c in key):
        try:
            return bytes.fromhex(key)
        except ValueError:
            pass
    return key.encode('utf-8')

def parse_aes_key(key: str, key_format: str = "text") -> bytes:
    if key_format not in ("text", "hex"):
        raise HTTPException(status_code=400, detail="Invalid key format")
    key_bytes = _decode_aes_key(key, key_format)
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
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("AES decryption error: %s", e)
        raise HTTPException(status_code=400, detail="Decryption failed")


def _validate_rsa_prime(val: int, name: str) -> None:
    from methods.modern.keypair import is_prime
    if val <= 2 or not is_prime(val):
        raise HTTPException(status_code=400, detail=f"{name} must be a prime greater than 2")

@app.post("/api/rsa/keygen")
def rsa_keygen(data: RsaKeygenInput):
    from methods.modern.helpers import b64encode
    
    _validate_rsa_prime(data.p, "p")
    _validate_rsa_prime(data.q, "q")
    if data.p == data.q:
        raise HTTPException(status_code=400, detail="p and q must be distinct prime numbers")
        
    n = data.p * data.q
    if n < 256:
        raise HTTPException(status_code=400, detail="Modulus n (p * q) must be at least 256")
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
    except ValueError as ve:
        logger.warning("RSA encryption validation error: %s", ve)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid RSA public key or input parameters"
        )
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
    except ValueError as ve:
        logger.warning("RSA decryption validation error: %s", ve)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid RSA private key or ciphertext parameters"
        )
    except Exception as e:
        logger.error("RSA decryption error: %s", e)
        raise HTTPException(status_code=400, detail="Decryption failed")


@app.post("/api/sha256")
@app.post("/api/hash/sha256")
def sha256_endpoint(data: Sha256Input):
    try:
        from methods.modern.hash_functions import sha256
        hash_val = sha256(data.plaintext)
        return {"hash": hash_val}
    except Exception as e:
        logger.error("SHA256 error: %s", e)
        raise HTTPException(status_code=400, detail="Hashing failed")


ALLOWED_HASH_ALGORITHMS = ("sha256", "sha3_256", "blake2s", "md5")

class HashDigestInput(BaseModel):
    plaintext: str = Field("", max_length=500, description="The plaintext to hash")
    algorithm: str = Field(
        default="sha256",
        max_length=20,
        description="Hash algorithm: sha256, sha3_256, blake2s, or md5",
    )

class HmacSignInput(BaseModel):
    message: str = Field(..., max_length=500, description="The message to sign")
    key: str = Field(..., max_length=500, description="The secret key")
    algorithm: str = Field(default="sha256", max_length=20, description="Hash algorithm (sha256)")

class HmacVerifyInput(BaseModel):
    message: str = Field(..., max_length=500, description="The original message")
    key: str = Field(..., max_length=500, description="The secret key")
    signature: str = Field(..., max_length=500, description="The expected HMAC hex digest")
    algorithm: str = Field(default="sha256", max_length=20, description="Hash algorithm (sha256)")

class DiffieHellmanExchangeInput(BaseModel):
    p: int = Field(..., ge=3, le=2**512, description="Prime modulus p (3 <= p <= 2^512)")
    g: int = Field(..., ge=2, le=2**512, description="Generator g (2 <= g < p)")
    a: int = Field(..., ge=1, le=2**512, description="Alice's private key a (1 <= a < p)")
    b: int = Field(..., ge=1, le=2**512, description="Bob's private key b (1 <= b < p)")


@app.post("/api/hash/digest")
def hash_digest(data: HashDigestInput):
    algo = data.algorithm.strip().lower()
    if algo not in ALLOWED_HASH_ALGORITHMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported algorithm '{data.algorithm}'. Allowed: {', '.join(ALLOWED_HASH_ALGORITHMS)}",
        )
    try:
        from methods.modern.hash_functions import compute_hash
        hash_val = compute_hash(data.plaintext, algo)
        return {"hash": hash_val, "algorithm": algo}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("Hash digest error (%s): %s", algo, e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hashing failed")


@app.post("/api/hmac/sign")
def hmac_sign(data: HmacSignInput):
    if not data.key:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Key cannot be empty.")
    algo = data.algorithm.strip().lower()
    if algo != "sha256":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only sha256 is supported for HMAC.",
        )
    try:
        from methods.modern.digital_signatures import create_hmac
        signature = create_hmac(data.message.encode("utf-8"), data.key.encode("utf-8"), algo)
        return {"signature": signature, "algorithm": algo}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("HMAC sign error: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="HMAC signing failed")


@app.post("/api/hmac/verify")
def hmac_verify(data: HmacVerifyInput):
    if not data.key:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Key cannot be empty.")
    algo = data.algorithm.strip().lower()
    if algo != "sha256":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only sha256 is supported for HMAC.",
        )
    try:
        from methods.modern.digital_signatures import verify_hmac
        valid = verify_hmac(
            data.message.encode("utf-8"),
            data.key.encode("utf-8"),
            data.signature,
            algo,
        )
        return {"valid": valid, "algorithm": algo}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error("HMAC verify error: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="HMAC verification failed")


@app.post("/api/diffie-hellman/exchange")
def diffie_hellman_exchange(data: DiffieHellmanExchangeInput):
    from methods.modern.keypair import is_prime
    if not is_prime(data.p):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="p must be a prime number.",
        )
    if data.g >= data.p:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Generator g must be strictly less than p.",
        )
    if data.a >= data.p or data.b >= data.p:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Private keys a and b must be strictly less than p.",
        )
    try:
        pub_a = pow(data.g, data.a, data.p)
        pub_b = pow(data.g, data.b, data.p)
        shared_secret = pow(pub_b, data.a, data.p)
        return {
            "A": pub_a,
            "B": pub_b,
            "shared_secret": shared_secret,
        }
    except Exception as e:
        logger.error("Diffie-Hellman exchange error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Key exchange failed",
        )


# ==========================================
# AES-256-CBC, RSA Signatures & Contemporary / Post-Quantum Endpoints
# ==========================================

class AesCbcEncryptInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="The plaintext to encrypt")
    key: str = Field(..., min_length=1, max_length=500, description="32-byte key hex (64 hex chars) or passphrase")
    key_format: str = Field(default="text", max_length=16, description="Key format: 'text', 'hex', or 'passphrase'")
    iv: str | None = Field(default=None, max_length=64, description="Optional 16-byte IV as 32 hex chars")


class AesCbcDecryptInput(BaseModel):
    ciphertext: str = Field(..., min_length=2, max_length=2000, description="Hex ciphertext to decrypt")
    key: str = Field(..., min_length=1, max_length=500, description="32-byte key hex (64 hex chars) or passphrase")
    iv: str = Field(..., min_length=32, max_length=64, description="16-byte IV as 32 hex chars")
    key_format: str = Field(default="text", max_length=16, description="Key format: 'text', 'hex', or 'passphrase'")


class RsaSignInput(BaseModel):
    message: str = Field(..., max_length=2000, description="Message to sign with RSA-SHA256")
    private_key: str = Field(..., max_length=10000, description="PEM formatted RSA private key")


class RsaVerifyInput(BaseModel):
    message: str = Field(..., max_length=2000, description="Original message")
    signature: str = Field(..., max_length=10000, description="Hex-encoded RSA signature")
    public_key: str = Field(..., max_length=10000, description="PEM formatted RSA public key")


class ZkpProveStepInput(BaseModel):
    step: str = Field(default="full", max_length=16, description="Step: 'setup', 'commit', 'respond', 'verify', or 'full'")
    p: int = Field(default=467, ge=5, le=2**64, description="Schnorr prime modulus p")
    q: int = Field(default=233, ge=2, le=2**64, description="Schnorr subgroup prime order q")
    g: int = Field(default=4, ge=2, le=2**64, description="Subgroup generator g of order q mod p")
    secret_x: int | None = Field(default=None, ge=1, le=2**64, description="Prover secret x in [1, q-1]")
    y: int | None = Field(default=None, ge=1, le=2**64, description="Public key y = g^x mod p")
    r: int | None = Field(default=None, ge=1, le=2**64, description="Prover commitment nonce r in [1, q-1]")
    t: int | None = Field(default=None, ge=1, le=2**64, description="Prover commitment t = g^r mod p")
    c: int | None = Field(default=None, ge=0, le=2**64, description="Verifier challenge c in [0, q-1]")
    s: int | None = Field(default=None, ge=0, le=2**64, description="Prover response s = (r + c*x) mod q")


class MlkemDemoInput(BaseModel):
    message_bit: int | None = Field(default=None, ge=0, le=1, description="Optional secret bit (0 or 1); random if omitted")
    noise_bound: int = Field(default=2, ge=0, le=500, description="Max absolute noise value (default 2)")
    n: int = Field(default=4, ge=2, le=8, description="Lattice dimension n (default 4)")
    q: int = Field(default=3329, ge=17, le=65537, description="Prime modulus q (default 3329)")


def _parse_aes_cbc_key(key: str, key_format: str) -> bytes:
    from methods.modern.helpers import sha256

    fmt = key_format.strip().lower()
    if fmt not in ("text", "hex", "passphrase"):
        raise HTTPException(status_code=400, detail="Invalid key_format; expected 'text', 'hex', or 'passphrase'")
    if not key:
        raise HTTPException(status_code=400, detail="Key cannot be empty")
    if fmt == "hex":
        try:
            key_bytes = bytes.fromhex(key.strip())
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid hex key") from exc
        if len(key_bytes) != 32:
            raise HTTPException(status_code=400, detail="AES-256-CBC hex key must be 32 bytes (64 hex characters)")
        return key_bytes
    if fmt == "passphrase":
        return sha256(key.encode("utf-8"))
    cleaned = key.strip()
    if len(cleaned) == 64 and all(c in "0123456789abcdefABCDEF" for c in cleaned):
        return bytes.fromhex(cleaned)
    raw = key.encode("utf-8")
    if len(raw) == 32:
        return raw
    return sha256(raw)


def _parse_cbc_iv(iv_hex: str | None, required: bool) -> bytes:
    from methods.modern import symmetric

    if iv_hex is None or not iv_hex.strip():
        if required:
            raise HTTPException(status_code=400, detail="IV is required for CBC decryption")
        return symmetric.generate_iv()
    try:
        iv_bytes = bytes.fromhex(iv_hex.strip())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="IV must be a valid hex string") from exc
    if len(iv_bytes) != 16:
        raise HTTPException(status_code=400, detail="IV must be 16 bytes (32 hex characters)")
    return iv_bytes


@app.post("/api/aes/cbc/encrypt")
def aes_cbc_encrypt(data: AesCbcEncryptInput):
    from methods.modern import symmetric

    key_bytes = _parse_aes_cbc_key(data.key, data.key_format)
    iv_bytes = _parse_cbc_iv(data.iv, required=False)
    try:
        padded = symmetric.pkcs7_pad(data.plaintext.encode("utf-8"))
        padded_blocks_hex = [padded[i : i + 16].hex() for i in range(0, len(padded), 16)]
        ciphertext_bytes = symmetric.encrypt(data.plaintext, key_bytes, iv_bytes)
        ciphertext_blocks_hex = [
            ciphertext_bytes[i : i + 16].hex() for i in range(0, len(ciphertext_bytes), 16)
        ]
        return {
            "ciphertext": ciphertext_bytes.hex(),
            "iv_hex": iv_bytes.hex(),
            "padded_blocks_hex": padded_blocks_hex,
            "ciphertext_blocks_hex": ciphertext_blocks_hex,
            "mode": "cbc",
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("AES-CBC encryption error: %s", e)
        raise HTTPException(status_code=400, detail="AES-CBC encryption failed")


@app.post("/api/aes/cbc/decrypt")
def aes_cbc_decrypt(data: AesCbcDecryptInput):
    from methods.modern import symmetric

    key_bytes = _parse_aes_cbc_key(data.key, data.key_format)
    iv_bytes = _parse_cbc_iv(data.iv, required=True)
    try:
        ciphertext_bytes = bytes.fromhex(data.ciphertext.strip())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Ciphertext must be a valid hex string") from exc
    try:
        plaintext = symmetric.decrypt(ciphertext_bytes, key_bytes, iv_bytes)
        padded = symmetric.pkcs7_pad(plaintext.encode("utf-8"))
        padded_blocks_hex = [padded[i : i + 16].hex() for i in range(0, len(padded), 16)]
        return {
            "plaintext": plaintext,
            "iv_hex": iv_bytes.hex(),
            "padded_blocks_hex": padded_blocks_hex,
            "mode": "cbc",
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("AES-CBC decryption error: %s", e)
        raise HTTPException(status_code=400, detail="AES-CBC decryption failed")


@app.post("/api/rsa/sign")
def rsa_sign_endpoint(data: RsaSignInput):
    from methods.modern.digital_signatures import rsa_sign
    from methods.modern.helpers import sha256

    try:
        priv_key_bytes = data.private_key.strip().encode("utf-8")
        signature = rsa_sign(data.message, priv_key_bytes)
        digest_hex = sha256(data.message.encode("utf-8")).hex()
        return {
            "signature": signature,
            "digest_hex": digest_hex,
            "algorithm": "rsa-sha256",
        }
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("RSA sign error: %s", e)
        raise HTTPException(status_code=400, detail="RSA signing failed")


@app.post("/api/rsa/verify")
def rsa_verify_endpoint(data: RsaVerifyInput):
    from methods.modern.digital_signatures import rsa_verify
    from methods.modern.helpers import sha256

    try:
        pub_key_bytes = data.public_key.strip().encode("utf-8")
        valid = rsa_verify(data.message, data.signature, pub_key_bytes)
        digest_hex = sha256(data.message.encode("utf-8")).hex()
        return {
            "valid": valid,
            "digest_hex": digest_hex,
            "algorithm": "rsa-sha256",
        }
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("RSA verify error: %s", e)
        raise HTTPException(status_code=400, detail="RSA verification failed")


@app.post("/api/zkp/prove-step")
def zkp_prove_step(data: ZkpProveStepInput):
    import secrets
    from methods.modern import contemporary

    step = data.step.strip().lower()
    if step not in ("setup", "commit", "respond", "verify", "full"):
        raise HTTPException(
            status_code=400,
            detail="Invalid step; expected 'setup', 'commit', 'respond', 'verify', or 'full'",
        )

    try:
        contemporary.validate_schnorr_params(data.p, data.q, data.g)

        if step == "setup":
            secret_x = data.secret_x if data.secret_x is not None else (secrets.randbelow(data.q - 1) + 1)
            y = contemporary.schnorr_public_key(secret_x, data.p, data.q, data.g)
            return {
                "step": "setup",
                "p": data.p,
                "q": data.q,
                "g": data.g,
                "y": y,
                "r": None,
                "t": None,
                "c": None,
                "s": None,
                "lhs": None,
                "rhs": None,
                "valid": None,
            }

        if step == "commit":
            r_val, t_val = contemporary.schnorr_commit(data.r, data.p, data.q, data.g)
            y_val = (
                contemporary.schnorr_public_key(data.secret_x, data.p, data.q, data.g)
                if data.secret_x is not None
                else data.y
            )
            return {
                "step": "commit",
                "p": data.p,
                "q": data.q,
                "g": data.g,
                "y": y_val,
                "r": r_val,
                "t": t_val,
                "c": None,
                "s": None,
                "lhs": None,
                "rhs": None,
                "valid": None,
            }

        if step == "respond":
            if data.r is None or data.secret_x is None:
                raise HTTPException(status_code=400, detail="r and secret_x are required for 'respond' step")
            c_val = contemporary.schnorr_challenge(data.c, data.q)
            s_val = contemporary.schnorr_respond(data.r, c_val, data.secret_x, data.q)
            t_val = data.t if data.t is not None else pow(data.g, data.r, data.p)
            y_val = (
                data.y
                if data.y is not None
                else contemporary.schnorr_public_key(data.secret_x, data.p, data.q, data.g)
            )
            return {
                "step": "respond",
                "p": data.p,
                "q": data.q,
                "g": data.g,
                "y": y_val,
                "r": data.r,
                "t": t_val,
                "c": c_val,
                "s": s_val,
                "lhs": None,
                "rhs": None,
                "valid": None,
            }

        if step == "verify":
            if data.t is None or data.c is None or data.s is None or data.y is None:
                raise HTTPException(status_code=400, detail="t, c, s, and y are required for 'verify' step")
            result = contemporary.schnorr_verify(data.t, data.c, data.s, data.y, data.p, data.q, data.g)
            return {
                "step": "verify",
                "p": data.p,
                "q": data.q,
                "g": data.g,
                "y": data.y,
                "r": None,
                "t": data.t,
                "c": data.c,
                "s": data.s,
                "lhs": result["lhs"],
                "rhs": result["rhs"],
                "valid": result["valid"],
            }

        # step == "full"
        secret_x = data.secret_x if data.secret_x is not None else (secrets.randbelow(data.q - 1) + 1)
        y_val = contemporary.schnorr_public_key(secret_x, data.p, data.q, data.g)
        r_val, t_val = contemporary.schnorr_commit(data.r, data.p, data.q, data.g)
        c_val = contemporary.schnorr_challenge(data.c, data.q)
        s_val = contemporary.schnorr_respond(r_val, c_val, secret_x, data.q)
        result = contemporary.schnorr_verify(t_val, c_val, s_val, y_val, data.p, data.q, data.g)
        return {
            "step": "full",
            "p": data.p,
            "q": data.q,
            "g": data.g,
            "y": y_val,
            "r": r_val,
            "t": t_val,
            "c": c_val,
            "s": s_val,
            "lhs": result["lhs"],
            "rhs": result["rhs"],
            "valid": result["valid"],
        }
    except HTTPException:
        raise
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("ZKP prove-step error: %s", e)
        raise HTTPException(status_code=400, detail="Schnorr ZKP step failed")


@app.post("/api/mlkem/demo")
def mlkem_demo_endpoint(data: MlkemDemoInput):
    from methods.modern import contemporary

    try:
        return contemporary.mlkem_demo(
            n=data.n,
            q=data.q,
            noise_bound=data.noise_bound,
            message_bit=data.message_bit,
        )
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("ML-KEM demo error: %s", e)
        raise HTTPException(status_code=400, detail="ML-KEM demo failed")



