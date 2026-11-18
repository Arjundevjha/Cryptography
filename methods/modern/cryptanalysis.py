"""Modern cryptanalysis engines: AES-CBC Bit-Flipping attack and Small-Prime RSA Factoring."""

from __future__ import annotations

import math
import time

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


def cbc_bitflip_attack(
    plaintext: str = "user=alice;role=guest;pad=1",
    target_from: str = "guest",
    target_to: str = "admin",
) -> dict:
    """Demonstrate an AES-256-CBC bit-flipping attack forging `target_from` -> `target_to`."""
    if not isinstance(plaintext, str) or not isinstance(target_from, str) or not isinstance(target_to, str):
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

    pos = pt_bytes.index(from_bytes)
    tampered_iv = bytearray(iv)
    tampered_ct = bytearray(ct_bytes)

    flipped_positions: list[dict] = []
    corrupted_blocks: set[int] = set()
    forged_blocks: set[int] = set()

    for j in range(len(from_bytes)):
        pt_idx = pos + j
        target_block = pt_idx // symmetric.BLOCK_SIZE
        byte_in_block = pt_idx % symmetric.BLOCK_SIZE
        xor_mask = from_bytes[j] ^ to_bytes[j]

        if target_block == 0:
            tampered_iv[byte_in_block] ^= xor_mask
            modified_block = -1
        else:
            modified_block = target_block - 1
            tampered_ct[modified_block * symmetric.BLOCK_SIZE + byte_in_block] ^= xor_mask
            corrupted_blocks.add(modified_block)

        forged_blocks.add(target_block)
        flipped_positions.append(
            {
                "plaintext_offset": pt_idx,
                "target_block": target_block,
                "modified_block": modified_block,
                "byte_index": byte_in_block,
                "orig_byte_hex": f"{from_bytes[j]:02x}",
                "new_byte_hex": f"{to_bytes[j]:02x}",
                "xor_mask_hex": f"{xor_mask:02x}",
            }
        )

    tampered_iv_bytes = bytes(tampered_iv)
    tampered_ct_bytes = bytes(tampered_ct)
    dec_blocks, unpadded = _decrypt_cbc_raw(tampered_ct_bytes, key, tampered_iv_bytes)

    decrypted_text = unpadded.decode("utf-8", errors="replace")
    decrypted_blocks_info: list[dict] = []
    for idx, blk in enumerate(dec_blocks):
        if idx in forged_blocks:
            blk_status = "forged"
        elif idx in corrupted_blocks:
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

    return {
        "plaintext": plaintext,
        "target_from": target_from,
        "target_to": target_to,
        "iv_hex": iv.hex(),
        "tampered_iv_hex": tampered_iv_bytes.hex(),
        "original_blocks_hex": [
            ct_bytes[i : i + symmetric.BLOCK_SIZE].hex()
            for i in range(0, len(ct_bytes), symmetric.BLOCK_SIZE)
        ],
        "tampered_blocks_hex": [
            tampered_ct_bytes[i : i + symmetric.BLOCK_SIZE].hex()
            for i in range(0, len(tampered_ct_bytes), symmetric.BLOCK_SIZE)
        ],
        "flipped_positions": flipped_positions,
        "decrypted_text": decrypted_text,
        "decrypted_raw_hex": unpadded.hex(),
        "decrypted_blocks": decrypted_blocks_info,
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

    fermat_res = _fermat_factor(n, max_iterations=max_iterations) if normalized_method in ("fermat", "both") else None
    rho_res = _pollard_rho_factor(n, max_iterations=max_iterations) if normalized_method in ("pollard_rho", "both") else None

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
