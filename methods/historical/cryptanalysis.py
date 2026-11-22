"""Historical cryptanalysis engines for Enigma (Bombe crib-dragging) and Lorenz (Depth attack)."""

from __future__ import annotations

import string
import time
from itertools import product

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


# The Bombe API surface is intentionally kept as individual options
# (see enigma_bombe_search callers in web/api/routers/cryptanalysis.py).
def enigma_bombe_search(  # pylint: disable=too-many-arguments,too-many-positional-arguments
    ciphertext: str,
    crib: str,
    *,
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
    context = _bombe_context(
        ciphertext, crib, crib_offset, fixed_left_rotor, rotors, reflector, plugboard, rings
    )
    matches, positions_tested, elapsed_ms = _run_bombe_positions(context, max_matches)
    return {
        "matches": matches,
        "positions_tested": positions_tested,
        "crib_offsets_valid": context["crib_offsets_valid"],
        "elapsed_ms": elapsed_ms,
    }


def _validate_bombe_inputs(clean_ct: str, clean_crib: str, fixed_left_rotor: str) -> str:
    """Validate Bombe input strings and the fixed left rotor letter, returning the letter."""
    if not clean_ct:
        raise ValueError("Ciphertext must contain alphabetic characters")
    if not clean_crib:
        raise ValueError("Crib must contain alphabetic characters")
    if len(clean_crib) > len(clean_ct):
        raise ValueError("Crib cannot be longer than ciphertext")
    if (
        not isinstance(fixed_left_rotor, str)
        or len(fixed_left_rotor) != 1
        or not fixed_left_rotor.isalpha()
    ):
        raise ValueError("fixed_left_rotor must be a single letter A-Z")
    return fixed_left_rotor.upper()


def _build_bombe_machine(
    rotors: list[str] | None,
    reflector: str,
    plugboard: list[str] | None,
    rings: list[int] | None,
) -> tuple[Enigma, list[int]]:
    """Build the Enigma machine and base rotor offsets for a Bombe search."""
    rotor_list = rotors if rotors is not None else ["I", "II", "III"]
    ring_vals = rings if rings is not None else [1, 1, 1]
    machine = _build_enigma(rotor_list, reflector, plugboard, ring_vals)
    base_offsets = [-(rv - 1) % 26 for rv in ring_vals]
    return machine, base_offsets


def _bombe_valid_offsets(
    clean_ct: str, clean_crib: str, crib_offset: int | None, len_ct: int
) -> list[int]:
    """Compute crib offsets, filtering impossible ones (Enigma never maps a letter to itself)."""
    if crib_offset is not None:
        if crib_offset < 0 or crib_offset + len(clean_crib) > len_ct:
            raise ValueError("crib_offset is out of bounds for the ciphertext and crib lengths")
        candidates = [crib_offset]
    else:
        candidates = list(range(len_ct - len(clean_crib) + 1))
    # Enigma can never encipher a letter to itself: filter impossible crib offsets first.
    return [
        off
        for off in candidates
        if all(clean_ct[off + i] != clean_crib[i] for i in range(len(clean_crib)))
    ]


def _bombe_context(  # pylint: disable=too-many-arguments,too-many-positional-arguments
    ciphertext: str,
    crib: str,
    crib_offset: int | None,
    fixed_left_rotor: str,
    rotors: list[str] | None,
    reflector: str,
    plugboard: list[str] | None,
    rings: list[int] | None,
) -> dict:
    """Validate Bombe inputs and prepare the Enigma machine and search context."""
    clean_ct = "".join(c.upper() for c in ciphertext if c.isalpha())
    clean_crib = "".join(c.upper() for c in crib if c.isalpha())
    left_letter = _validate_bombe_inputs(clean_ct, clean_crib, fixed_left_rotor)
    machine, base_offsets = _build_bombe_machine(rotors, reflector, plugboard, rings)
    valid_offsets = _bombe_valid_offsets(clean_ct, clean_crib, crib_offset, len(clean_ct))
    return {
        "machine": machine,
        "base_offsets": base_offsets,
        "clean_ct": clean_ct,
        "clean_crib": clean_crib,
        "left_letter": left_letter,
        "crib_offsets_valid": valid_offsets,
        "ciphertext": ciphertext,
    }


def _reset_and_set_key(machine: Enigma, context: dict, key_str: str) -> None:
    """Reset machine offsets to base and set the key string."""
    machine.r1.offset, machine.r2.offset, machine.r3.offset = context["base_offsets"]
    machine.set_key(key_str)


def _test_crib_offset(context: dict, pos_str: str) -> list[dict]:
    """Test a rotor key against the crib at all valid offsets.

    Returns a list of match dicts (one per matching offset; usually 0 or 1).
    """
    machine = context["machine"]
    clean_ct = context["clean_ct"]
    clean_crib = context["clean_crib"]
    results: list[dict] = []
    for off in context["crib_offsets_valid"]:
        _reset_and_set_key(machine, context, pos_str)
        for _ in range(off):
            machine.encipher("A")
        matched = all(
            machine.encipher(clean_ct[off + i]) == crib_ch
            for i, crib_ch in enumerate(clean_crib)
        )
        if matched:
            _reset_and_set_key(machine, context, pos_str)
            decrypted = machine.process_message(context["ciphertext"])
            results.append(
                {
                    "positions": [context["left_letter"], pos_str[1], pos_str[2]],
                    "position_str": pos_str,
                    "offset": off,
                    "plaintext": decrypted,
                }
            )
    return results


def _run_bombe_positions(context: dict, max_matches: int) -> tuple[list[dict], int, float]:
    """Iterate rotor positions, testing crib matches and collecting results."""
    matches: list[dict] = []
    positions_tested = 0
    t0 = time.perf_counter()

    if context["crib_offsets_valid"]:
        for r2, r3 in product(string.ascii_uppercase, repeat=2):
            pos_str = f"{context['left_letter']}{r2}{r3}"
            positions_tested += 1
            matches.extend(_test_crib_offset(context, pos_str))
            if len(matches) >= max_matches:
                break

    elapsed_ms = round((time.perf_counter() - t0) * 1000, 3)
    return matches, positions_tested, elapsed_ms


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
    crib_results = _crib_drag_results(xor_vecs, crib, min_len)

    return {
        "length": min_len,
        "xor_text": xor_text,
        "xor_bits": xor_bits,
        "crib_results": crib_results,
    }


def _crib_drag_results(xor_vecs: list, crib: str, min_len: int) -> list[dict]:
    """Crib-drag a guessed word across valid offsets and rank recovered fragments."""
    crib_results: list[dict] = []
    if not crib or not crib.strip():
        return crib_results

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
    return crib_results
