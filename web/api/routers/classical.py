"""Classical cipher routes: Caesar, Vigenere, Playfair, Affine, Substitution, Scytale, Polybius."""

import logging
import math
from typing import Annotated

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from methods.classical import affine

logger = logging.getLogger(__name__)
router = APIRouter()


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


@router.post("/api/caesar/encrypt")
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


@router.post("/api/caesar/decrypt")
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


@router.post("/api/vigenere/encrypt")
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


@router.post("/api/vigenere/decrypt")
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


@router.post("/api/playfair/encrypt")
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


@router.post("/api/playfair/decrypt")
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


@router.post("/api/affine/encrypt")
def affine_encrypt(data: AffineEncryptInput):
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


@router.post("/api/affine/decrypt")
def affine_decrypt(data: AffineDecryptInput):
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


@router.post("/api/substitution/encrypt")
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


@router.post("/api/substitution/decrypt")
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


@router.post("/api/scytale/encrypt")
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


@router.post("/api/scytale/decrypt")
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


@router.post("/api/polybius/encrypt")
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


@router.post("/api/polybius/decrypt")
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
