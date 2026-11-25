"""Modern cryptanalysis engines: AES-CBC Bit-Flipping attack and Small-Prime RSA Factoring."""

from __future__ import annotations

import hashlib
import math
import secrets
import time

from . import ecc
from . import symmetric


def _decrypt_cbc_raw(ciphertext: bytes, key: bytes, iv: bytes) -> tuple[list[bytes], bytes]:
    """Decrypt AES-256-CBC ciphertext into raw 16-byte blocks and unpadded bytes."""
    round_keys = symmetric.key_expansion(key)
    blocks: list[bytes] = []
    prev_block = iv
    for i in range(0, len(ciphertext), symmetric.BLOCK_SIZE):
        block = ciphertext[i : i + symmetric.BLOCK_SIZE]
        dec_block = symmetric.decrypt_block(block, round_keys)
        plain_block = (
            int.from_bytes(dec_block, "big") ^ int.from_bytes(prev_block, "big")
        ).to_bytes(symmetric.BLOCK_SIZE, "big")
        blocks.append(plain_block)
        prev_block = block

    raw = b"".join(blocks)
    try:
        unpadded = symmetric.pkcs7_unpad(raw)
    except ValueError:
        unpadded = raw
    return blocks, unpadded


def _flip_byte_at(pt_idx: int, from_byte: int, to_byte: int, state: dict) -> None:
    """Tamper IV/CT bytes at a plaintext offset so the tampered value decrypts to the target."""
    target_block = pt_idx // symmetric.BLOCK_SIZE
    byte_in_block = pt_idx % symmetric.BLOCK_SIZE
    xor_mask = from_byte ^ to_byte

    if target_block == 0:
        state["tampered_iv"][byte_in_block] ^= xor_mask
        modified_block = -1
    else:
        modified_block = target_block - 1
        state["tampered_ct"][modified_block * symmetric.BLOCK_SIZE + byte_in_block] ^= xor_mask
        state["corrupted_blocks"].add(modified_block)

    state["forged_blocks"].add(target_block)
    state["flipped_positions"].append(
        {
            "plaintext_offset": pt_idx,
            "target_block": target_block,
            "modified_block": modified_block,
            "byte_index": byte_in_block,
            "orig_byte_hex": f"{from_byte:02x}",
            "new_byte_hex": f"{to_byte:02x}",
            "xor_mask_hex": f"{xor_mask:02x}",
        }
    )


def _compute_bitflip_tamper(
    pt_bytes: bytes,
    from_bytes: bytes,
    to_bytes: bytes,
    ct_bytes: bytes,
    iv: bytes,
) -> dict:
    """Compute tampered IV/CT so that CBC decryption yields the forged target."""
    pos = pt_bytes.index(from_bytes)
    state = {
        "tampered_iv": bytearray(iv),
        "tampered_ct": bytearray(ct_bytes),
        "flipped_positions": [],
        "corrupted_blocks": set(),
        "forged_blocks": set(),
    }
    for j, from_byte in enumerate(from_bytes):
        _flip_byte_at(pos + j, from_byte, to_bytes[j], state)

    return {
        "tampered_iv": bytes(state["tampered_iv"]),
        "tampered_ct": bytes(state["tampered_ct"]),
        "flipped_positions": state["flipped_positions"],
        "corrupted_blocks": state["corrupted_blocks"],
        "forged_blocks": state["forged_blocks"],
    }


def _hex_blocks(data: bytes) -> list[str]:
    """Split raw bytes into a list of hex-encoded block strings."""
    return [
        data[i : i + symmetric.BLOCK_SIZE].hex()
        for i in range(0, len(data), symmetric.BLOCK_SIZE)
    ]


def _block_status_info(dec_blocks: list[bytes], tamper: dict) -> list[dict]:
    """Return per-block decryption status info for the tampered ciphertext."""
    decrypted_blocks_info: list[dict] = []
    for idx, blk in enumerate(dec_blocks):
        if idx in tamper["forged_blocks"]:
            blk_status = "forged"
        elif idx in tamper["corrupted_blocks"]:
            blk_status = "corrupted"
        else:
            blk_status = "intact"
        decrypted_blocks_info.append(
            {
                "index": idx,
                "hex": blk.hex(),
                "text": blk.decode("utf-8", errors="replace"),
                "status": blk_status,
            }
        )
    return decrypted_blocks_info


def cbc_bitflip_attack(
    plaintext: str = "user=alice;role=guest;pad=1",
    target_from: str = "guest",
    target_to: str = "admin",
) -> dict:
    """Demonstrate an AES-256-CBC bit-flipping attack forging `target_from` -> `target_to`."""
    if (
        not isinstance(plaintext, str)
        or not isinstance(target_from, str)
        or not isinstance(target_to, str)
    ):
        raise TypeError("plaintext, target_from, and target_to must be strings")
    if not plaintext or not target_from or not target_to:
        raise ValueError("plaintext, target_from, and target_to cannot be empty")

    pt_bytes = plaintext.encode("utf-8")
    from_bytes = target_from.encode("utf-8")
    to_bytes = target_to.encode("utf-8")

    if len(from_bytes) != len(to_bytes):
        raise ValueError("target_from and target_to must have the same UTF-8 byte length")
    if from_bytes not in pt_bytes:
        raise ValueError(f"target_from '{target_from}' was not found in plaintext")

    key = symmetric.generate_key()
    iv = symmetric.generate_iv()
    ct_bytes = symmetric.encrypt(plaintext, key, iv)
    tamper = _compute_bitflip_tamper(pt_bytes, from_bytes, to_bytes, ct_bytes, iv)
    dec_blocks, unpadded = _decrypt_cbc_raw(tamper["tampered_ct"], key, tamper["tampered_iv"])

    decrypted_text = unpadded.decode("utf-8", errors="replace")

    return {
        "plaintext": plaintext,
        "target_from": target_from,
        "target_to": target_to,
        "iv_hex": iv.hex(),
        "tampered_iv_hex": tamper["tampered_iv"].hex(),
        "original_blocks_hex": _hex_blocks(ct_bytes),
        "tampered_blocks_hex": _hex_blocks(tamper["tampered_ct"]),
        "flipped_positions": tamper["flipped_positions"],
        "decrypted_text": decrypted_text,
        "decrypted_raw_hex": unpadded.hex(),
        "decrypted_blocks": _block_status_info(dec_blocks, tamper),
        "forged_successfully": target_to in decrypted_text,
    }


def _fermat_factor(n: int, max_iterations: int = 500_000) -> dict:
    """Factor n using Fermat's difference of squares method."""
    t0 = time.perf_counter()
    if n % 2 == 0:
        return {
            "method": "fermat",
            "found": True,
            "p": 2,
            "q": n // 2,
            "iterations": 1,
            "elapsed_ms": round((time.perf_counter() - t0) * 1000, 3),
            "trace": [{"step": 1, "a": n // 2 + 1, "b_squared": (n // 2 - 1) ** 2}],
        }

    a = math.isqrt(n)
    if a * a < n:
        a += 1

    trace: list[dict] = []
    for step in range(1, max_iterations + 1):
        b2 = a * a - n
        b = math.isqrt(b2)
        if step <= 10:
            trace.append({"step": step, "a": a, "b_squared": b2})
        if b * b == b2:
            p, q = sorted((a - b, a + b))
            if step > 10:
                trace.append({"step": step, "a": a, "b_squared": b2})
            return {
                "method": "fermat",
                "found": True,
                "p": p,
                "q": q,
                "iterations": step,
                "elapsed_ms": round((time.perf_counter() - t0) * 1000, 3),
                "trace": trace,
            }
        a += 1

    return {
        "method": "fermat",
        "found": False,
        "p": None,
        "q": None,
        "iterations": max_iterations,
        "elapsed_ms": round((time.perf_counter() - t0) * 1000, 3),
        "trace": trace,
    }


def _pollard_rho_factor(n: int, max_iterations: int = 500_000) -> dict:
    """Factor n using Pollard's rho algorithm with deterministic polynomial seeds."""
    t0 = time.perf_counter()
    if n % 2 == 0:
        return {
            "method": "pollard_rho",
            "found": True,
            "p": 2,
            "q": n // 2,
            "iterations": 1,
            "elapsed_ms": round((time.perf_counter() - t0) * 1000, 3),
            "trace": [{"step": 1, "x": 2, "y": 2, "gcd": 2}],
        }

    total_steps = 0
    trace: list[dict] = []

    for c in range(1, 20):
        x = 2
        y = 2
        d = 1
        while d == 1 and total_steps < max_iterations:
            total_steps += 1
            x = (x * x + c) % n
            y = (y * y + c) % n
            y = (y * y + c) % n
            d = math.gcd(abs(x - y), n)
            if total_steps <= 10:
                trace.append({"step": total_steps, "x": x, "y": y, "gcd": d})
        if 1 < d < n:
            p, q = sorted((d, n // d))
            if total_steps > 10:
                trace.append({"step": total_steps, "x": x, "y": y, "gcd": d})
            return {
                "method": "pollard_rho",
                "found": True,
                "p": p,
                "q": q,
                "iterations": total_steps,
                "elapsed_ms": round((time.perf_counter() - t0) * 1000, 3),
                "trace": trace,
            }

    return {
        "method": "pollard_rho",
        "found": False,
        "p": None,
        "q": None,
        "iterations": total_steps,
        "elapsed_ms": round((time.perf_counter() - t0) * 1000, 3),
        "trace": trace,
    }


def rsa_factor_small(
    n: int,
    e: int = 65537,
    method: str = "both",
    max_iterations: int = 500_000,
) -> dict:
    """Factor a small RSA modulus N = p * q and recover private exponent d given e."""
    if not isinstance(n, int) or isinstance(n, bool):
        raise TypeError("n must be an integer")
    if not isinstance(e, int) or isinstance(e, bool):
        raise TypeError("e must be an integer")
    if n < 4:
        raise ValueError("n must be >= 4")
    if n.bit_length() > 64:
        raise ValueError("n exceeds maximum educational bit-length of 64 bits")
    if e < 2:
        raise ValueError("e must be >= 2")

    normalized_method = method.strip().lower()
    if normalized_method not in ("fermat", "pollard_rho", "both"):
        raise ValueError("method must be 'fermat', 'pollard_rho', or 'both'")

    fermat_res = (
        _fermat_factor(n, max_iterations=max_iterations)
        if normalized_method in ("fermat", "both")
        else None
    )
    rho_res = (
        _pollard_rho_factor(n, max_iterations=max_iterations)
        if normalized_method in ("pollard_rho", "both")
        else None
    )

    p = None
    q = None
    for res in (rho_res, fermat_res):
        if res and res["found"]:
            p = res["p"]
            q = res["q"]
            break

    phi = None
    d = None
    if p is not None and q is not None and p > 1 and q > 1:
        phi = (p - 1) * (q - 1)
        if math.gcd(e, phi) == 1:
            d = pow(e, -1, phi)

    return {
        "n": n,
        "e": e,
        "bit_length": n.bit_length(),
        "p": p,
        "q": q,
        "phi": phi,
        "d": d,
        "fermat": fermat_res,
        "pollard_rho": rho_res,
    }


def _sign_with_fixed_nonce(digest_int: int, priv: int, nonce_k: int) -> tuple[int, int]:
    """Sign digest_int with an explicit P-256 nonce k (unsafe if reused)."""
    point = ecc.scalar_mult(nonce_k, ecc.P256_G)
    if point is None:
        raise ValueError("invalid nonce k")
    r_val = point[0] % ecc.P256_N
    if r_val == 0:
        raise ValueError("r cannot be zero")
    s_val = (pow(nonce_k, -1, ecc.P256_N) * (digest_int + r_val * priv)) % ecc.P256_N
    if s_val == 0:
        raise ValueError("s cannot be zero")
    return r_val, s_val


def ecdsa_nonce_reuse_attack(
    message1: str,
    message2: str,
    private_key: int | None = None,
    nonce_k: int | None = None,
) -> dict:
    """Recover P-256 ECDSA private key from two signatures that reused the same nonce k."""
    if not message1 or not message2 or message1 == message2:
        raise ValueError("message1 and message2 must be distinct non-empty strings")

    priv = (secrets.randbelow(ecc.P256_N - 1) + 1) if private_key is None else private_key
    k_val = (secrets.randbelow(ecc.P256_N - 1) + 1) if nonce_k is None else nonce_k
    if not 1 <= priv < ecc.P256_N or not 1 <= k_val < ecc.P256_N:
        raise ValueError("private_key and nonce_k must be in [1, P256_N - 1]")

    z1 = int.from_bytes(hashlib.sha256(message1.encode("utf-8")).digest(), "big")
    z2 = int.from_bytes(hashlib.sha256(message2.encode("utf-8")).digest(), "big")
    r1, s1 = _sign_with_fixed_nonce(z1, priv, k_val)
    r2, s2 = _sign_with_fixed_nonce(z2, priv, k_val)
    if r1 != r2 or s1 == s2:
        raise ValueError("signatures did not produce distinct s with shared r")

    recovered_k = ((z1 - z2) * pow((s1 - s2) % ecc.P256_N, -1, ecc.P256_N)) % ecc.P256_N
    recovered_d = ((s1 * recovered_k - z1) * pow(r1, -1, ecc.P256_N)) % ecc.P256_N

    return {
        "curve": "secp256r1",
        "actual_private_key": f"{priv:064x}",
        "recovered_private_key": f"{recovered_d:064x}",
        "recovered_nonce": f"{recovered_k:064x}",
        "r": f"{r1:064x}",
        "s1": f"{s1:064x}",
        "s2": f"{s2:064x}",
        "z1": f"{z1:064x}",
        "z2": f"{z2:064x}",
        "recovered_match": recovered_d == priv,
    }


def _cbc_padding_oracle(round_keys: list[bytes], prev_block: bytes, cipher_block: bytes) -> bool:
    """Return True if AES-CBC decryption of cipher_block with prev_block has valid PKCS#7 pad."""
    dec_block = symmetric.decrypt_block(cipher_block, round_keys)
    plain = (
        int.from_bytes(dec_block, "big") ^ int.from_bytes(prev_block, "big")
    ).to_bytes(16, "big")
    try:
        symmetric.pkcs7_unpad(plain)
        return True
    except ValueError:
        return False


def _oracle_guess_byte(
    round_keys: list[bytes],
    cipher_block: bytes,
    forged_prev: bytearray,
    byte_idx: int,
) -> tuple[int, int]:
    """Find the forged byte value at byte_idx that satisfies PKCS#7 padding."""
    pad_val = 16 - byte_idx
    queries = 0
    for guess in range(256):
        forged_prev[byte_idx] = guess
        queries += 1
        if _cbc_padding_oracle(round_keys, bytes(forged_prev), cipher_block):
            if pad_val == 1 and byte_idx > 0:
                verify_prev = bytearray(forged_prev)
                verify_prev[byte_idx - 1] ^= 0x01
                queries += 1
                if not _cbc_padding_oracle(round_keys, bytes(verify_prev), cipher_block):
                    continue
            return guess, queries
    raise ValueError("padding oracle failed to find valid byte")


def _recover_cbc_block(
    round_keys: list[bytes],
    prev_block: bytes,
    cipher_block: bytes,
    steps: list[dict],
) -> tuple[bytes, int]:
    """Recover a single 16-byte CBC plaintext block via PKCS#7 padding oracle queries."""
    intermediate = bytearray(16)
    recovered = bytearray(16)
    queries = 0

    for byte_idx in range(15, -1, -1):
        pad_val = 16 - byte_idx
        forged_prev = bytearray(16)
        for k in range(byte_idx + 1, 16):
            forged_prev[k] = intermediate[k] ^ pad_val

        found_guess, byte_queries = _oracle_guess_byte(
            round_keys, cipher_block, forged_prev, byte_idx
        )
        queries += byte_queries
        inter_byte = found_guess ^ pad_val
        plain_byte = inter_byte ^ prev_block[byte_idx]
        intermediate[byte_idx] = inter_byte
        recovered[byte_idx] = plain_byte
        steps.append({
            "byte_index": byte_idx,
            "pad_value": pad_val,
            "guessed_byte_hex": f"{found_guess:02x}",
            "intermediate_hex": f"{inter_byte:02x}",
            "recovered_byte_hex": f"{plain_byte:02x}",
            "recovered_char": chr(plain_byte) if 32 <= plain_byte <= 126 else ".",
        })

    return bytes(recovered), queries


def cbc_padding_oracle_attack(
    plaintext: str,
    key: bytes | None = None,
    iv: bytes | None = None,
) -> dict:
    """Demonstrate byte-by-byte AES-256-CBC plaintext recovery via a PKCS#7 padding oracle."""
    if not plaintext:
        raise ValueError("plaintext cannot be empty")
    if len(plaintext.encode("utf-8")) > 32:
        raise ValueError("plaintext must be at most 32 bytes for interactive padding oracle demo")

    key_bytes = symmetric.generate_key() if key is None else key
    actual_iv = symmetric.generate_iv() if iv is None else iv
    ciphertext = symmetric.encrypt(plaintext, key_bytes, actual_iv)
    round_keys = symmetric.key_expansion(key_bytes)

    blocks = [ciphertext[i:i + 16] for i in range(0, len(ciphertext), 16)]
    prev = actual_iv
    recovered_padded = bytearray()
    total_queries = 0
    steps: list[dict] = []

    for blk in blocks:
        rec_blk, q_count = _recover_cbc_block(round_keys, prev, blk, steps)
        recovered_padded.extend(rec_blk)
        total_queries += q_count
        prev = blk

    return {
        "recovered_plaintext": symmetric.pkcs7_unpad(bytes(recovered_padded)).decode(
            "utf-8", errors="replace"
        ),
        "ciphertext_hex": ciphertext.hex(),
        "iv_hex": actual_iv.hex(),
        "block_count": len(blocks),
        "oracle_queries": total_queries,
        "steps": steps[-16:],
    }
