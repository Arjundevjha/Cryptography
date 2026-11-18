"""Cryptanalysis Attack Lab routes across Classical, Historical, and Modern wings."""

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .historical import _parse_ring_item

logger = logging.getLogger(__name__)
router = APIRouter()


class CryptanalysisCaesarInput(BaseModel):
    ciphertext: str = Field(..., max_length=10000, description="Caesar ciphertext to crack")
    include_zero: bool = Field(False, description="Whether to include shift 0 in results")


class CryptanalysisAffineInput(BaseModel):
    mode: str = Field("bruteforce", description="'bruteforce' or 'known_plaintext'")
    ciphertext: str = Field("", max_length=10000, description="Affine ciphertext")
    limit: int = Field(20, ge=1, le=312, description="Max brute-force candidates to return")
    plaintext_pair: str = Field("", max_length=100, description="Known plaintext characters")
    ciphertext_pair: str = Field("", max_length=100, description="Corresponding ciphertext characters")


class CryptanalysisVigenereInput(BaseModel):
    ciphertext: str = Field(..., max_length=20000, description="Vigenere ciphertext to crack")
    key_length: int | None = Field(None, ge=1, le=32, description="Optional explicit key length")
    max_key_length: int = Field(16, ge=2, le=32, description="Max key length for IoC scan")


class CryptanalysisEnigmaBombeInput(BaseModel):
    ciphertext: str = Field(..., max_length=500, description="Enigma ciphertext")
    crib: str = Field(..., max_length=100, description="Known plaintext crib (e.g. WETTER)")
    rotors: list[str] = Field(["I", "II", "III"], description="3 rotor names")
    reflector: str = Field("B", description="Reflector name (A, B, C, B_THIN, C_THIN)")
    plugboard: list[str] = Field([], description="Plugboard swaps e.g. ['AB', 'CD']")
    rings: list[int | str] = Field([1, 1, 1], description="3 ring settings (1-26 or A-Z)")
    fixed_left_rotor: str = Field("A", max_length=1, description="Fixed left rotor letter A-Z")
    crib_offset: int | None = Field(None, ge=0, description="Optional fixed crib offset")


class CryptanalysisLorenzDepthInput(BaseModel):
    ciphertext1: str = Field(..., max_length=1000, description="First Lorenz ciphertext")
    ciphertext2: str = Field(..., max_length=1000, description="Second Lorenz ciphertext (same key)")
    crib: str = Field("", max_length=200, description="Optional crib to drag across XOR stream")


class CryptanalysisCbcBitflipInput(BaseModel):
    plaintext: str = Field("user=alice;role=guest;pad=1", max_length=500, description="Structured plaintext")
    target_from: str = Field("guest", max_length=100, description="Substring to replace")
    target_to: str = Field("admin", max_length=100, description="Forged replacement of same byte length")


class CryptanalysisRsaFactorInput(BaseModel):
    n: int = Field(..., ge=4, description="Small RSA modulus N = p * q (<= 64 bits)")
    e: int = Field(65537, ge=2, description="Public exponent e")
    method: str = Field("both", description="'fermat', 'pollard_rho', or 'both'")


@router.post("/api/cryptanalysis/caesar")
def cryptanalysis_caesar_endpoint(data: CryptanalysisCaesarInput):
    from methods.classical import cryptanalysis as classical_ca

    try:
        candidates = classical_ca.caesar_bruteforce(
            data.ciphertext,
            include_zero=data.include_zero,
        )
        return {
            "candidates": candidates,
            "best": candidates[0] if candidates else None,
        }
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("Caesar cryptanalysis error: %s", e)
        raise HTTPException(status_code=400, detail="Caesar cryptanalysis failed")


@router.post("/api/cryptanalysis/affine")
def cryptanalysis_affine_endpoint(data: CryptanalysisAffineInput):
    from methods.classical import cryptanalysis as classical_ca

    mode = data.mode.strip().lower()
    try:
        if mode == "bruteforce":
            if not data.ciphertext.strip():
                raise ValueError("Ciphertext cannot be empty for brute-force mode")
            candidates = classical_ca.affine_bruteforce(data.ciphertext, limit=data.limit)
            return {
                "mode": "bruteforce",
                "total_keys": 312,
                "candidates": candidates,
                "best": candidates[0] if candidates else None,
            }
        if mode == "known_plaintext":
            result = classical_ca.affine_known_plaintext(
                data.plaintext_pair,
                data.ciphertext_pair,
                ciphertext=data.ciphertext or None,
            )
            return {"mode": "known_plaintext", **result}
        raise ValueError("Invalid mode; expected 'bruteforce' or 'known_plaintext'")
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("Affine cryptanalysis error: %s", e)
        raise HTTPException(status_code=400, detail="Affine cryptanalysis failed")


@router.post("/api/cryptanalysis/vigenere")
def cryptanalysis_vigenere_endpoint(data: CryptanalysisVigenereInput):
    from methods.classical import cryptanalysis as classical_ca

    try:
        return classical_ca.vigenere_crack(
            data.ciphertext,
            key_length=data.key_length,
            max_key_length=data.max_key_length,
        )
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("Vigenere cryptanalysis error: %s", e)
        raise HTTPException(status_code=400, detail="Vigenere cryptanalysis failed")


@router.post("/api/cryptanalysis/enigma-bombe")
def cryptanalysis_enigma_bombe_endpoint(data: CryptanalysisEnigmaBombeInput):
    from methods.historical import cryptanalysis as historical_ca

    try:
        if len(data.rings) != 3:
            raise ValueError("Exactly 3 ring settings must be specified")
        parsed_rings = [_parse_ring_item(r) for r in data.rings]
        return historical_ca.enigma_bombe_search(
            ciphertext=data.ciphertext,
            crib=data.crib,
            rotors=data.rotors,
            reflector=data.reflector,
            plugboard=data.plugboard,
            rings=parsed_rings,
            fixed_left_rotor=data.fixed_left_rotor,
            crib_offset=data.crib_offset,
        )
    except HTTPException:
        raise
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("Enigma bombe cryptanalysis error: %s", e)
        raise HTTPException(status_code=400, detail="Enigma Bombe search failed")


@router.post("/api/cryptanalysis/lorenz-depth")
def cryptanalysis_lorenz_depth_endpoint(data: CryptanalysisLorenzDepthInput):
    from methods.historical import cryptanalysis as historical_ca

    try:
        return historical_ca.lorenz_depth_attack(
            ciphertext1=data.ciphertext1,
            ciphertext2=data.ciphertext2,
            crib=data.crib,
        )
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("Lorenz depth attack error: %s", e)
        raise HTTPException(status_code=400, detail="Lorenz depth attack failed")


@router.post("/api/cryptanalysis/cbc-bitflip")
def cryptanalysis_cbc_bitflip_endpoint(data: CryptanalysisCbcBitflipInput):
    from methods.modern import cryptanalysis as modern_ca

    try:
        return modern_ca.cbc_bitflip_attack(
            plaintext=data.plaintext,
            target_from=data.target_from,
            target_to=data.target_to,
        )
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("CBC bit-flip attack error: %s", e)
        raise HTTPException(status_code=400, detail="CBC bit-flip attack failed")


@router.post("/api/cryptanalysis/rsa-factor")
def cryptanalysis_rsa_factor_endpoint(data: CryptanalysisRsaFactorInput):
    from methods.modern import cryptanalysis as modern_ca

    try:
        return modern_ca.rsa_factor_small(
            n=data.n,
            e=data.e,
            method=data.method,
        )
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("RSA factor cryptanalysis error: %s", e)
        raise HTTPException(status_code=400, detail="RSA factorization failed")
