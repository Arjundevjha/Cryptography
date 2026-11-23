"""Modern cipher routes: AES, AES-CBC, RSA, RSA-Sign, Hash, HMAC, Diffie-Hellman, ZKP, ML-KEM, ECC, OTP, ChaCha20."""

import logging
import math

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
router = APIRouter()


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
    return key.encode("utf-8")


def parse_aes_key(key: str, key_format: str = "text") -> bytes:
    if key_format not in ("text", "hex"):
        raise HTTPException(status_code=400, detail="Invalid key format")
    key_bytes = _decode_aes_key(key, key_format)
    if len(key_bytes) not in (16, 32):
        raise HTTPException(status_code=400, detail="Key must be 16 or 32 bytes (or 32 or 64 hex characters)")
    return key_bytes


@router.post("/api/aes/encrypt")
def aes_encrypt(data: AesEncryptInput):
    if data.plaintext_format not in ("text", "hex"):
        raise HTTPException(status_code=400, detail="Invalid plaintext format")
    plaintext = data.plaintext
    if data.plaintext_format == "hex":
        try:
            plaintext = bytes.fromhex(plaintext).decode("utf-8")
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


@router.post("/api/aes/decrypt")
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


@router.post("/api/rsa/keygen")
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
    pub_b64 = b64encode(pub_str.encode("utf-8"))
    public_key_pem = (
        f"-----BEGIN RSA PUBLIC KEY-----\n"
        f"{pub_b64}\n"
        f"-----END RSA PUBLIC KEY-----\n"
    )

    priv_str = f"{n}:{data.e}:{d}:{data.p}:{data.q}"
    priv_b64 = b64encode(priv_str.encode("utf-8"))
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


@router.post("/api/rsa/encrypt")
def rsa_encrypt(data: RsaEncryptInput):
    try:
        from methods.modern import rsa
        pub_key_bytes = data.public_key.strip().encode("utf-8")
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


@router.post("/api/rsa/decrypt")
def rsa_decrypt(data: RsaDecryptInput):
    try:
        from methods.modern import rsa
        priv_key_bytes = data.private_key.strip().encode("utf-8")
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


@router.post("/api/sha256")
@router.post("/api/hash/sha256")
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


@router.post("/api/hash/digest")
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


@router.post("/api/hmac/sign")
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


@router.post("/api/hmac/verify")
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


@router.post("/api/diffie-hellman/exchange")
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


@router.post("/api/aes/cbc/encrypt")
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


@router.post("/api/aes/cbc/decrypt")
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


@router.post("/api/rsa/sign")
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


@router.post("/api/rsa/verify")
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


@router.post("/api/zkp/prove-step")
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
            result = contemporary.schnorr_verify(data.t, data.c, data.s, data.y, p=data.p, q=data.q, g=data.g)
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
        result = contemporary.schnorr_verify(t_val, c_val, s_val, y_val, p=data.p, q=data.q, g=data.g)
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


@router.post("/api/mlkem/demo")
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


class EccKeygenInput(BaseModel):
    private_key: str | None = Field(
        default=None,
        min_length=1,
        max_length=128,
        description="Optional P-256 private key scalar in hex",
    )


class EccEcdhInput(BaseModel):
    private_key: str = Field(..., min_length=1, max_length=128, description="Own P-256 private key scalar in hex")
    peer_public_x: str = Field(..., min_length=1, max_length=128, description="Peer P-256 public key x in hex")
    peer_public_y: str = Field(..., min_length=1, max_length=128, description="Peer P-256 public key y in hex")


class EccSignInput(BaseModel):
    message: str = Field(..., max_length=2000, description="Message to sign with ECDSA (P-256 / SHA-256)")
    private_key: str = Field(..., min_length=1, max_length=128, description="P-256 private key scalar in hex")


class EccVerifyInput(BaseModel):
    message: str = Field(..., max_length=2000, description="Message to verify")
    public_x: str = Field(..., min_length=1, max_length=128, description="Signer P-256 public key x in hex")
    public_y: str = Field(..., min_length=1, max_length=128, description="Signer P-256 public key y in hex")
    r: str = Field(..., min_length=1, max_length=128, description="ECDSA signature r in hex")
    s: str = Field(..., min_length=1, max_length=128, description="ECDSA signature s in hex")


class OtpEncryptInput(BaseModel):
    plaintext: str = Field(..., min_length=1, max_length=500, description="Plaintext to encrypt with One-Time Pad")
    key: str | None = Field(default=None, max_length=2000, description="Optional OTP key (hex or text)")
    key_format: str = Field(default="hex", max_length=10, description="Key format: 'hex' or 'text'")


class OtpDecryptInput(BaseModel):
    ciphertext_hex: str = Field(..., min_length=2, max_length=2000, description="Hex ciphertext to decrypt")
    key: str = Field(..., min_length=1, max_length=2000, description="OTP key (hex or text)")
    key_format: str = Field(default="hex", max_length=10, description="Key format: 'hex' or 'text'")


class ChaCha20EncryptInput(BaseModel):
    plaintext: str = Field(..., max_length=500, description="Plaintext to encrypt with ChaCha20")
    key: str | None = Field(default=None, max_length=128, description="Optional 32-byte key (64 hex chars or 32-byte text)")
    nonce: str | None = Field(default=None, max_length=64, description="Optional 12-byte nonce (24 hex chars)")
    counter: int = Field(default=1, ge=0, lt=2**32, description="32-bit initial block counter")
    key_format: str = Field(default="hex", max_length=10, description="Key format: 'hex' or 'text'")


class ChaCha20DecryptInput(BaseModel):
    ciphertext_hex: str = Field(..., max_length=2000, description="Hex ciphertext to decrypt")
    key: str = Field(..., min_length=1, max_length=128, description="32-byte key (64 hex chars or 32-byte text)")
    nonce: str = Field(..., min_length=24, max_length=24, description="12-byte nonce as 24 hex chars")
    counter: int = Field(default=1, ge=0, lt=2**32, description="32-bit initial block counter")
    key_format: str = Field(default="hex", max_length=10, description="Key format: 'hex' or 'text'")


def _parse_ecc_hex_int(value: str, field_name: str) -> int:
    cleaned = value.strip().lower()
    if cleaned.startswith("0x"):
        cleaned = cleaned[2:]
    if not cleaned or not all(ch in "0123456789abcdef" for ch in cleaned):
        raise HTTPException(status_code=400, detail=f"{field_name} must be a valid hex integer")
    return int(cleaned, 16)


def _format_ecc_hex(value: int) -> str:
    return f"{value:064x}"


def _parse_stream_key(key: str, key_format: str) -> bytes:
    fmt = key_format.strip().lower()
    if fmt not in ("hex", "text"):
        raise HTTPException(status_code=400, detail="key_format must be 'hex' or 'text'")
    if fmt == "hex":
        try:
            return bytes.fromhex(key.strip())
        except ValueError as ve:
            raise HTTPException(status_code=400, detail="Key must be valid hex when key_format='hex'") from ve
    return key.encode("utf-8")


@router.post("/api/ecc/keygen")
def ecc_keygen(data: EccKeygenInput):
    from methods.modern import ecc

    try:
        if data.private_key is not None:
            priv_int = _parse_ecc_hex_int(data.private_key, "private_key")
            pub_x, pub_y = ecc.derive_public_key(priv_int)
        else:
            priv_int, (pub_x, pub_y) = ecc.pick_keys()
        return {
            "curve": "secp256r1",
            "private_key": _format_ecc_hex(priv_int),
            "public_key": {
                "x": _format_ecc_hex(pub_x),
                "y": _format_ecc_hex(pub_y),
            },
        }
    except HTTPException:
        raise
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("ECC keygen error: %s", e)
        raise HTTPException(status_code=400, detail="ECC key generation failed")


@router.post("/api/ecc/ecdh")
def ecc_ecdh(data: EccEcdhInput):
    from methods.modern import ecc

    try:
        priv_int = _parse_ecc_hex_int(data.private_key, "private_key")
        peer_x = _parse_ecc_hex_int(data.peer_public_x, "peer_public_x")
        peer_y = _parse_ecc_hex_int(data.peer_public_y, "peer_public_y")
        (shared_x, shared_y), shared_secret_hex = ecc.ecdh_shared_secret(priv_int, (peer_x, peer_y))
        return {
            "curve": "secp256r1",
            "shared_point": {
                "x": _format_ecc_hex(shared_x),
                "y": _format_ecc_hex(shared_y),
            },
            "shared_secret_hex": shared_secret_hex,
        }
    except HTTPException:
        raise
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("ECC ECDH error: %s", e)
        raise HTTPException(status_code=400, detail="ECC ECDH failed")


@router.post("/api/ecc/sign")
def ecc_sign_endpoint(data: EccSignInput):
    import hashlib
    from methods.modern import ecc

    try:
        priv_int = _parse_ecc_hex_int(data.private_key, "private_key")
        r_val, s_val = ecc.ecdsa_sign(data.message, priv_int)
        digest_hex = hashlib.sha256(data.message.encode("utf-8")).hexdigest()
        return {
            "curve": "secp256r1",
            "algorithm": "ecdsa-p256-sha256",
            "digest_hex": digest_hex,
            "signature": {
                "r": _format_ecc_hex(r_val),
                "s": _format_ecc_hex(s_val),
            },
        }
    except HTTPException:
        raise
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("ECC sign error: %s", e)
        raise HTTPException(status_code=400, detail="ECC signing failed")


@router.post("/api/ecc/verify")
def ecc_verify_endpoint(data: EccVerifyInput):
    import hashlib
    from methods.modern import ecc

    try:
        pub_x = _parse_ecc_hex_int(data.public_x, "public_x")
        pub_y = _parse_ecc_hex_int(data.public_y, "public_y")
        r_val = _parse_ecc_hex_int(data.r, "r")
        s_val = _parse_ecc_hex_int(data.s, "s")
        valid = ecc.ecdsa_verify(data.message, (r_val, s_val), (pub_x, pub_y))
        digest_hex = hashlib.sha256(data.message.encode("utf-8")).hexdigest()
        return {
            "curve": "secp256r1",
            "algorithm": "ecdsa-p256-sha256",
            "digest_hex": digest_hex,
            "valid": valid,
        }
    except HTTPException:
        raise
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("ECC verify error: %s", e)
        raise HTTPException(status_code=400, detail="ECC verification failed")


@router.post("/api/otp/encrypt")
def otp_encrypt_endpoint(data: OtpEncryptInput):
    from methods.modern import stream_ciphers

    try:
        pt_bytes = data.plaintext.encode("utf-8")
        if data.key is None or data.key == "":
            key_bytes = stream_ciphers.otp_generate_key(len(pt_bytes))
        else:
            key_bytes = _parse_stream_key(data.key, data.key_format)
        ct_bytes = stream_ciphers.otp_encrypt(pt_bytes, key_bytes)
        return {
            "ciphertext_hex": ct_bytes.hex(),
            "key_hex": key_bytes.hex(),
            "plaintext_bytes": len(pt_bytes),
        }
    except HTTPException:
        raise
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("OTP encrypt error: %s", e)
        raise HTTPException(status_code=400, detail="OTP encryption failed")


@router.post("/api/otp/decrypt")
def otp_decrypt_endpoint(data: OtpDecryptInput):
    from methods.modern import stream_ciphers

    try:
        try:
            ct_bytes = bytes.fromhex(data.ciphertext_hex.strip())
        except ValueError as ve:
            raise HTTPException(status_code=400, detail="ciphertext_hex must be valid hex") from ve
        key_bytes = _parse_stream_key(data.key, data.key_format)
        pt_bytes = stream_ciphers.otp_decrypt(ct_bytes, key_bytes)
        return {
            "plaintext": pt_bytes.decode("utf-8", errors="replace"),
            "plaintext_hex": pt_bytes.hex(),
        }
    except HTTPException:
        raise
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("OTP decrypt error: %s", e)
        raise HTTPException(status_code=400, detail="OTP decryption failed")


@router.post("/api/chacha20/encrypt")
def chacha20_encrypt_endpoint(data: ChaCha20EncryptInput):
    import secrets
    from methods.modern import stream_ciphers

    try:
        if data.key is None or data.key == "":
            key_bytes = secrets.token_bytes(32)
        else:
            key_bytes = _parse_stream_key(data.key, data.key_format)
        if data.nonce is None or data.nonce == "":
            nonce_bytes = secrets.token_bytes(12)
        else:
            try:
                nonce_bytes = bytes.fromhex(data.nonce.strip())
            except ValueError as ve:
                raise HTTPException(status_code=400, detail="nonce must be valid hex") from ve

        pt_bytes = data.plaintext.encode("utf-8")
        ct_bytes = stream_ciphers.chacha20_encrypt(pt_bytes, key_bytes, nonce_bytes, counter=data.counter)
        preview_len = min(64, max(16, len(pt_bytes)))
        keystream_preview = stream_ciphers.chacha20_keystream(
            key_bytes, nonce_bytes, preview_len, counter=data.counter
        )
        return {
            "ciphertext_hex": ct_bytes.hex(),
            "key_hex": key_bytes.hex(),
            "nonce_hex": nonce_bytes.hex(),
            "counter": data.counter,
            "keystream_preview_hex": keystream_preview.hex(),
        }
    except HTTPException:
        raise
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("ChaCha20 encrypt error: %s", e)
        raise HTTPException(status_code=400, detail="ChaCha20 encryption failed")


@router.post("/api/chacha20/decrypt")
def chacha20_decrypt_endpoint(data: ChaCha20DecryptInput):
    from methods.modern import stream_ciphers

    try:
        try:
            ct_bytes = bytes.fromhex(data.ciphertext_hex.strip())
            nonce_bytes = bytes.fromhex(data.nonce.strip())
        except ValueError as ve:
            raise HTTPException(status_code=400, detail="ciphertext_hex and nonce must be valid hex") from ve
        key_bytes = _parse_stream_key(data.key, data.key_format)
        pt_bytes = stream_ciphers.chacha20_decrypt(ct_bytes, key_bytes, nonce_bytes, counter=data.counter)
        return {
            "plaintext": pt_bytes.decode("utf-8", errors="replace"),
            "plaintext_hex": pt_bytes.hex(),
        }
    except HTTPException:
        raise
    except (ValueError, TypeError) as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.error("ChaCha20 decrypt error: %s", e)
        raise HTTPException(status_code=400, detail="ChaCha20 decryption failed")
