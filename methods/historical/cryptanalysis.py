"""Historical cryptanalysis engines for Enigma (Bombe crib-dragging) and Lorenz (Depth attack)."""

from __future__ import annotations

import string
import time

from .enigma.enigma import Enigma
from .enigma.keyboard import Keyboard
from .enigma.plugboard import Plugboard
from .enigma.reflector import Reflector
from .enigma.rotor import Rotor
from .lorenz.converter import (
    ita2_vectors_to_text,
    text_to_ita2_vectors,
    xor_vectors,
)

ENIGMA_ROTOR_MAP: dict[str, tuple[str, str]] = {
    "I": ("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q"),
    "II": ("AJDKSIRUXBLHWTMCQGZNPYFVOE", "W"),
    "III": ("BDFHJLCPRTXVZNYEIWGAKMUSQO", "V"),
    "IV": ("ESOVPZJAYQUIRHXLNFTGKDCMWB", "J"),
    "V": ("VZBRGITYUPSDNHLXAWMJQOFECK", "Z"),
    "VI": ("JPGVOUMFYQBENHZRDKASXLICTW", "M"),
    "VII": ("NZJHGRCXMYSWBOUFAIVLPEKQDT", "Z"),
    "VIII": ("FKQHTLXOCBJSPDZRAMEWNIUYGV", "M"),
}

ENIGMA_REFLECTOR_MAP: dict[str, str] = {
    "A": "EJMZALYXVBWFCRQUONTSPIKHGD",
    "B": "YRUHQSLDPXNGOKMIEBFZCWVJAT",
    "C": "FVPJIAOYEDRZXWGCTKUQSBNMHL",
    "B_THIN": "ENKQAUYWJICOPBLMDXZVFTHRGS",
    "C_THIN": "RDOBJNTKVEHMLFCWZAXGYIPSUQ",
}


def _build_enigma(
    rotors: list[str],
    reflector: str,
    plugboard: list[str] | None,
    rings: list[int] | None,
) -> Enigma:
    if len(rotors) != 3 or len(set(rotors)) != 3:
        raise ValueError("Exactly 3 distinct rotors must be specified")
    for r in rotors:
        if r not in ENIGMA_ROTOR_MAP:
            raise ValueError(f"Invalid rotor '{r}'")

    ref_key = reflector.upper()
    if ref_key not in ENIGMA_REFLECTOR_MAP:
        raise ValueError(f"Invalid reflector '{reflector}'")

    pb_pairs = [p.upper() for p in (plugboard or [])]
    seen: set[str] = set()
    for pair in pb_pairs:
        if len(pair) != 2 or not pair.isalpha():
            raise ValueError(f"Invalid plugboard pair '{pair}'")
        for ch in pair:
            if ch in seen:
                raise ValueError(f"Duplicate plugboard character '{ch}'")
            seen.add(ch)

    ring_vals = rings if rings is not None else [1, 1, 1]
    if len(ring_vals) != 3 or any(not (1 <= rv <= 26) for rv in ring_vals):
        raise ValueError("Rings must be 3 integers between 1 and 26")

    machine = Enigma(
        Reflector(ENIGMA_REFLECTOR_MAP[ref_key]),
        [Rotor(*ENIGMA_ROTOR_MAP[r]) for r in rotors],
        Plugboard(pb_pairs),
        Keyboard(),
    )
    machine.set_rings(ring_vals)
    return machine


def enigma_bombe_search(
    ciphertext: str,
    crib: str,
    rotors: list[str] | None = None,
    reflector: str = "B",
    plugboard: list[str] | None = None,
    rings: list[int] | None = None,
    fixed_left_rotor: str = "A",
    crib_offset: int | None = None,
    max_matches: int = 20,
) -> dict:
    """Search Enigma rotor start positions matching a known crib (Bombe mini-lab).

    By default fixes the leftmost rotor to `fixed_left_rotor` (searching 26 x 26 = 676
    middle/right rotor positions) for sub-second interactive response.
    """
    if not isinstance(ciphertext, str) or not isinstance(crib, str):
        raise TypeError("Ciphertext and crib must be strings")

    clean_ct = "".join(c.upper() for c in ciphertext if c.isalpha())
    clean_crib = "".join(c.upper() for c in crib if c.isalpha())

    if not clean_ct:
        raise ValueError("Ciphertext must contain alphabetic characters")
    if not clean_crib:
        raise ValueError("Crib must contain alphabetic characters")
    if len(clean_crib) > len(clean_ct):
        raise ValueError("Crib cannot be longer than ciphertext")

    if not isinstance(fixed_left_rotor, str) or len(fixed_left_rotor) != 1 or not fixed_left_rotor.isalpha():
        raise ValueError("fixed_left_rotor must be a single letter A-Z")
    left_letter = fixed_left_rotor.upper()

    rotor_list = rotors if rotors is not None else ["I", "II", "III"]
    ring_vals = rings if rings is not None else [1, 1, 1]
    machine = _build_enigma(rotor_list, reflector, plugboard, ring_vals)
    base_offsets = [-(rv - 1) % 26 for rv in ring_vals]

    def _reset_and_set_key(key_str: str) -> None:
        machine.r1.offset, machine.r2.offset, machine.r3.offset = base_offsets
        machine.set_key(key_str)

    if crib_offset is not None:
        if crib_offset < 0 or crib_offset + len(clean_crib) > len(clean_ct):
            raise ValueError("crib_offset is out of bounds for the ciphertext and crib lengths")
        candidate_offsets = [crib_offset]
    else:
        candidate_offsets = list(range(len(clean_ct) - len(clean_crib) + 1))

    # Enigma can never encipher a letter to itself: filter impossible crib offsets first.
    valid_offsets = [
        off
        for off in candidate_offsets
        if all(clean_ct[off + i] != clean_crib[i] for i in range(len(clean_crib)))
    ]

    t0 = time.perf_counter()
    matches: list[dict] = []
    positions_tested = 0

    if valid_offsets:
        alphabet = string.ascii_uppercase
        for r2 in alphabet:
            for r3 in alphabet:
                pos_str = f"{left_letter}{r2}{r3}"
                positions_tested += 1
                for off in valid_offsets:
                    _reset_and_set_key(pos_str)
                    for _ in range(off):
                        machine.encipher("A")
                    matched = True
                    for i, crib_ch in enumerate(clean_crib):
                        if machine.encipher(clean_ct[off + i]) != crib_ch:
                            matched = False
                            break
                    if matched:
                        _reset_and_set_key(pos_str)
                        decrypted = machine.process_message(ciphertext)
                        matches.append(
                            {
                                "positions": [left_letter, r2, r3],
                                "position_str": pos_str,
                                "offset": off,
                                "plaintext": decrypted,
                            }
                        )
                        if len(matches) >= max_matches:
                            break
                if len(matches) >= max_matches:
                    break
            if len(matches) >= max_matches:
                break

    elapsed_ms = round((time.perf_counter() - t0) * 1000, 3)
    return {
        "matches": matches,
        "positions_tested": positions_tested,
        "crib_offsets_valid": valid_offsets,
        "elapsed_ms": elapsed_ms,
    }


def lorenz_depth_attack(
    ciphertext1: str,
    ciphertext2: str,
    crib: str = "",
) -> dict:
    """Perform a Lorenz depth attack by XORing two ciphertexts encrypted with the same key.

    Computes C1 XOR C2 = P1 XOR P2 in 5-bit ITA2 Baudot space and optionally crib-drags
    a guessed word across all valid offsets to reveal fragments of the other plaintext.
    """
    if not isinstance(ciphertext1, str) or not isinstance(ciphertext2, str):
        raise TypeError("Both ciphertexts must be strings")

    vecs1 = text_to_ita2_vectors(ciphertext1)
    vecs2 = text_to_ita2_vectors(ciphertext2)
    min_len = min(len(vecs1), len(vecs2))
    if min_len == 0:
        raise ValueError("Both ciphertexts must contain at least one valid ITA2 character")

    xor_vecs = [xor_vectors(vecs1[i], vecs2[i]) for i in range(min_len)]
    xor_text = ita2_vectors_to_text(xor_vecs)
    xor_bits = ["".join(str(b) for b in vec) for vec in xor_vecs]

    crib_results: list[dict] = []
    if crib and crib.strip():
        crib_vecs = text_to_ita2_vectors(crib)
        if not crib_vecs:
            raise ValueError("Crib must contain at least one valid ITA2 character")
        if len(crib_vecs) > min_len:
            raise ValueError("Crib cannot be longer than the overlapping ciphertext length")

        crib_upper = ita2_vectors_to_text(crib_vecs)
        for offset in range(min_len - len(crib_vecs) + 1):
            frag_vecs = [
                xor_vectors(xor_vecs[offset + j], crib_vecs[j])
                for j in range(len(crib_vecs))
            ]
            frag_text = ita2_vectors_to_text(frag_vecs)
            alpha_count = sum(1 for ch in frag_text if ch.isalpha() or ch == " ")
            ratio = round(alpha_count / len(frag_text), 4)
            crib_results.append(
                {
                    "offset": offset,
                    "crib": crib_upper,
                    "recovered_fragment": frag_text,
                    "alphabetic_ratio": ratio,
                }
            )
        crib_results.sort(key=lambda item: (-item["alphabetic_ratio"], item["offset"]))

    return {
        "length": min_len,
        "xor_text": xor_text,
        "xor_bits": xor_bits,
        "crib_results": crib_results,
    }
