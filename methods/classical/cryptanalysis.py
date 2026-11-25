"""Classical cryptanalysis engines for Caesar, Affine, and Vigenere ciphers."""

from __future__ import annotations

import math
import random
from collections import Counter

from . import affine, caesar, vigenere

# Standard English letter frequencies (A-Z)
ENGLISH_FREQ: tuple[float, ...] = (
    0.08167, 0.01492, 0.02782, 0.04253, 0.12702, 0.02228, 0.02015,
    0.06094, 0.06966, 0.00153, 0.00772, 0.04025, 0.02406, 0.06749,
    0.07507, 0.01929, 0.00095, 0.05987, 0.06327, 0.09056, 0.02758,
    0.00978, 0.02360, 0.00150, 0.01974, 0.00074,
)

VALID_AFFINE_A: tuple[int, ...] = (1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25)
ENGLISH_IOC = 0.0667


def chi_squared_score(text: str) -> float:
    """Compute chi-squared statistic of alphabetic characters against English frequencies."""
    counts = [0] * 26
    total = 0
    for ch in text:
        if "a" <= ch <= "z":
            counts[ord(ch) - 97] += 1
            total += 1
        elif "A" <= ch <= "Z":
            counts[ord(ch) - 65] += 1
            total += 1

    if total == 0:
        return 0.0

    score = 0.0
    for i, freq in enumerate(ENGLISH_FREQ):
        expected = total * freq
        diff = counts[i] - expected
        score += (diff * diff) / expected
    return round(score, 4)


def caesar_bruteforce(ciphertext: str, include_zero: bool = False) -> list[dict]:
    """Brute-force all Caesar shifts and rank candidates by English chi-squared score."""
    if not isinstance(ciphertext, str):
        raise TypeError("Ciphertext must be a string")
    if not ciphertext.strip():
        raise ValueError("Ciphertext cannot be empty")

    start_shift = 0 if include_zero else 1
    results: list[dict] = []
    for shift in range(start_shift, 26):
        plaintext = caesar.decrypt(ciphertext, shift)
        results.append(
            {
                "shift": shift,
                "plaintext": plaintext,
                "chi_squared": chi_squared_score(plaintext),
            }
        )

    results.sort(key=lambda item: item["chi_squared"])
    return results


def affine_bruteforce(ciphertext: str, limit: int | None = None) -> list[dict]:
    """Brute-force all 312 valid Affine (a, b) keys and rank by chi-squared score."""
    if not isinstance(ciphertext, str):
        raise TypeError("Ciphertext must be a string")
    if not ciphertext.strip():
        raise ValueError("Ciphertext cannot be empty")

    results: list[dict] = []
    for a_key in VALID_AFFINE_A:
        for b_key in range(26):
            plaintext = affine.decrypt(ciphertext, a_key, b_key)
            results.append(
                {
                    "a": a_key,
                    "b": b_key,
                    "plaintext": plaintext,
                    "chi_squared": chi_squared_score(plaintext),
                }
            )

    results.sort(key=lambda item: item["chi_squared"])
    if limit is not None and limit > 0:
        return results[:limit]
    return results


def affine_known_plaintext(
    plaintext_pair: str,
    ciphertext_pair: str,
    ciphertext: str | None = None,
) -> dict:
    """Solve Affine cipher keys (a, b) from known plaintext-ciphertext character pairs."""
    if not isinstance(plaintext_pair, str) or not isinstance(ciphertext_pair, str):
        raise TypeError("Plaintext and ciphertext pairs must be strings")

    p_letters = [ord(c.upper()) - 65 for c in plaintext_pair if c.isalpha()]
    c_letters = [ord(c.upper()) - 65 for c in ciphertext_pair if c.isalpha()]

    if len(p_letters) < 2 or len(c_letters) < 2:
        raise ValueError("At least 2 alphabetic characters are required in both pairs")
    if len(p_letters) != len(c_letters):
        raise ValueError("Plaintext and ciphertext pairs must have the same number of letters")

    candidates: list[dict] = []
    for a_key in VALID_AFFINE_A:
        for b_key in range(26):
            if all((a_key * p + b_key) % 26 == c for p, c in zip(p_letters, c_letters)):
                entry: dict = {"a": a_key, "b": b_key}
                if ciphertext:
                    entry["plaintext"] = affine.decrypt(ciphertext, a_key, b_key)
                    entry["chi_squared"] = chi_squared_score(entry["plaintext"])
                candidates.append(entry)

    if not candidates:
        raise ValueError("No valid Affine key (a, b) satisfies the given plaintext-ciphertext pair")

    if ciphertext:
        candidates.sort(key=lambda item: item["chi_squared"])

    best = candidates[0]
    return {
        "a": best["a"],
        "b": best["b"],
        "unique": len(candidates) == 1,
        "candidates": candidates,
        "plaintext": best.get("plaintext"),
    }


def _index_of_coincidence(letters: list[int]) -> float:
    """Compute Index of Coincidence for a list of 0..25 letter indices."""
    n = len(letters)
    if n <= 1:
        return 0.0
    counts = Counter(letters)
    numerator = sum(cnt * (cnt - 1) for cnt in counts.values())
    return numerator / (n * (n - 1))


def vigenere_ioc(ciphertext: str, max_key_length: int = 16) -> list[dict]:
    """Estimate Vigenere key length using average Index of Coincidence per coset."""
    if not isinstance(ciphertext, str):
        raise TypeError("Ciphertext must be a string")

    letters = [ord(c.upper()) - 65 for c in ciphertext if c.isalpha()]
    if len(letters) < 2:
        raise ValueError("Ciphertext must contain at least 2 alphabetic characters")

    upper_bound = max(1, min(max_key_length, len(letters) // 2))
    results: list[dict] = []
    for key_len in range(1, upper_bound + 1):
        cosets = [letters[i::key_len] for i in range(key_len)]
        avg_ioc = sum(_index_of_coincidence(coset) for coset in cosets) / key_len
        results.append(
            {
                "key_length": key_len,
                "ioc": round(avg_ioc, 5),
            }
        )
    return results


def vigenere_kasiski(
    ciphertext: str,
    min_ngram: int = 3,
    max_ngram: int = 5,
    max_factor: int = 20,
) -> dict:
    """Perform Kasiski examination: find repeated n-gram distances and factor frequencies."""
    if not isinstance(ciphertext, str):
        raise TypeError("Ciphertext must be a string")

    clean = "".join(c.upper() for c in ciphertext if c.isalpha())
    if len(clean) < min_ngram * 2:
        return {"repeated_ngrams": [], "factor_scores": []}

    repeated_ngrams, factor_counts = _collect_repeated_ngrams(
        clean, min_ngram, max_ngram, max_factor
    )

    repeated_ngrams.sort(key=lambda item: (-len(item["positions"]), -item["length"], item["ngram"]))
    factor_scores = [
        {"factor": factor, "count": count}
        for factor, count in factor_counts.most_common(12)
    ]

    return {
        "repeated_ngrams": repeated_ngrams[:20],
        "factor_scores": factor_scores,
    }


def _index_ngrams(clean: str, n: int) -> dict[str, list[int]]:
    """Map each length-n gram in clean to the list of its occurrence indices."""
    positions_map: dict[str, list[int]] = {}
    for idx in range(len(clean) - n + 1):
        gram = clean[idx : idx + n]
        positions_map.setdefault(gram, []).append(idx)
    return positions_map


def _ngram_distances(positions: list[int]) -> list[int]:
    """Return successive distance gaps between occurrences of a repeated n-gram."""
    return [positions[i + 1] - positions[i] for i in range(len(positions) - 1)]


def _gcd_of_distances(distances: list[int]) -> int:
    """Return the GCD of a list of distances."""
    overall_gcd = distances[0]
    for d in distances[1:]:
        overall_gcd = math.gcd(overall_gcd, d)
    return overall_gcd


def _count_distance_factors(
    distances: list[int], max_factor: int, factor_counts: Counter[int]
) -> None:
    """Accumulate factor counts for all factors of each distance in factor_counts."""
    for d in distances:
        for factor in range(2, min(d, max_factor) + 1):
            if d % factor == 0:
                factor_counts[factor] += 1


def _collect_repeated_ngrams(
    clean: str, min_ngram: int, max_ngram: int, max_factor: int
) -> tuple[list[dict], Counter[int]]:
    """Collect repeated n-grams with distances and aggregate factor frequency counts."""
    repeated_ngrams: list[dict] = []
    factor_counts: Counter[int] = Counter()
    for n in range(min_ngram, max_ngram + 1):
        positions_map = _index_ngrams(clean, n)
        for gram, positions in positions_map.items():
            if len(positions) < 2:
                continue
            distances = _ngram_distances(positions)
            _count_distance_factors(distances, max_factor, factor_counts)
            repeated_ngrams.append(
                {
                    "ngram": gram,
                    "length": n,
                    "positions": positions,
                    "distances": distances,
                    "gcd": _gcd_of_distances(distances),
                }
            )
    return repeated_ngrams, factor_counts


def _best_shift_for_coset(coset: list[int]) -> int:
    """Find the Caesar shift (0..25) minimizing chi-squared for a single Vigenere coset."""
    n = len(coset)
    if n == 0:
        return 0
    counts = [0] * 26
    for idx in coset:
        counts[idx] += 1

    best_shift = 0
    best_chi = float("inf")
    for shift in range(26):
        chi = 0.0
        for p_idx, freq in enumerate(ENGLISH_FREQ):
            observed = counts[(p_idx + shift) % 26]
            expected = n * freq
            diff = observed - expected
            chi += (diff * diff) / expected
        if chi < best_chi:
            best_chi = chi
            best_shift = shift
    return best_shift


def _recover_key_for_length(letters: list[int], key_length: int) -> str:
    """Recover the Vigenere key of a given length using frequency analysis per coset."""
    shifts = [
        _best_shift_for_coset(letters[i::key_length])
        for i in range(key_length)
    ]
    return "".join(chr(65 + s) for s in shifts)


def vigenere_crack(
    ciphertext: str,
    key_length: int | None = None,
    max_key_length: int = 16,
) -> dict:
    """Crack a Vigenere ciphertext using IoC/Kasiski key-length estimation and chi-squared."""
    if not isinstance(ciphertext, str):
        raise TypeError("Ciphertext must be a string")
    if not ciphertext.strip():
        raise ValueError("Ciphertext cannot be empty")

    letters = [ord(c.upper()) - 65 for c in ciphertext if c.isalpha()]
    if len(letters) < 2:
        raise ValueError("Ciphertext must contain at least 2 alphabetic characters")

    ioc_candidates = vigenere_ioc(ciphertext, max_key_length=max_key_length)
    kasiski = vigenere_kasiski(ciphertext)

    if key_length is not None:
        if key_length < 1:
            raise ValueError("key_length must be >= 1")
        recovered_key = _recover_key_for_length(letters, key_length)
        plaintext = vigenere.decrypt(ciphertext, recovered_key)
        chi2 = chi_squared_score(plaintext)
    else:
        best = _select_best_ioc_result(ciphertext, letters, ioc_candidates)
        assert best is not None
        _, chi2, recovered_key, plaintext = best

    return {
        "key": recovered_key,
        "key_length": len(recovered_key),
        "plaintext": plaintext,
        "chi_squared": chi2,
        "ioc_candidates": ioc_candidates,
        "kasiski": kasiski,
    }


def _select_best_ioc_result(
    ciphertext: str,
    letters: list[int],
    ioc_candidates: list[dict],
) -> tuple[float, float, str, str] | None:
    """Select the top IoC candidate key minimizing the AIC-style chi-squared penalty.

    Evaluates the top IoC candidates to prevent both underfitting (sub-harmonics
    like L/2) and overfitting (long keys): minimize ``chi2 + 3.0 * key_length``.
    """
    ranked_lengths = sorted(
        ioc_candidates,
        key=lambda item: abs(item["ioc"] - ENGLISH_IOC),
    )[:6]
    best_penalty = float("inf")
    best: tuple[float, float, str, str] | None = None
    for cand in ranked_lengths:
        k_len = cand["key_length"]
        cand_key = _recover_key_for_length(letters, k_len)
        cand_pt = vigenere.decrypt(ciphertext, cand_key)
        cand_chi = chi_squared_score(cand_pt)
        penalty = cand_chi + 3.0 * k_len
        if penalty < best_penalty:
            best_penalty = penalty
            best = (penalty, cand_chi, cand_key, cand_pt)
    return best


COMMON_BIGRAMS = {
    "TH": 3.56, "HE": 3.07, "IN": 2.43, "ER": 2.05, "AN": 1.99,
    "RE": 1.85, "ON": 1.76, "AT": 1.49, "EN": 1.45, "ND": 1.35,
    "TI": 1.34, "ES": 1.34, "OR": 1.28, "TE": 1.20, "OF": 1.17,
    "ED": 1.17, "IS": 1.13, "IT": 1.12, "AL": 1.09, "AR": 1.07,
    "ST": 1.05, "TO": 1.04, "NT": 1.04, "NG": 0.95, "SE": 0.93,
    "HA": 0.93, "AS": 0.87, "OU": 0.87, "IO": 0.83, "LE": 0.83,
}
ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def _score_english_text(text: str) -> float:
    """Score candidate plaintext using English unigram and bigram frequencies."""
    letters = [ch for ch in text.upper() if "A" <= ch <= "Z"]
    if not letters:
        return -1e9
    total = len(letters)
    counts = Counter(letters)
    score = sum(
        (counts[ch] / total) * math.log(max(ENGLISH_FREQ[ord(ch) - 65], 0.01))
        for ch in counts
    ) * 100.0
    for idx in range(total - 1):
        bg = letters[idx] + letters[idx + 1]
        if bg in COMMON_BIGRAMS:
            score += COMMON_BIGRAMS[bg] * 1.4
    return score


def _apply_sub_key(ciphertext: str, key_map: dict[str, str]) -> str:
    """Apply uppercase substitution mapping while preserving case and punctuation."""
    out: list[str] = []
    for ch in ciphertext:
        up = ch.upper()
        if up in key_map:
            mapped = key_map[up]
            out.append(mapped if ch.isupper() else mapped.lower())
        else:
            out.append(ch)
    return "".join(out)


def _initial_freq_key(ciphertext: str) -> list[str]:
    """Build initial cipher->plain mapping ordered by frequency alignment."""
    freq_order = "".join(sorted(ALPHABET, key=lambda ch: -ENGLISH_FREQ[ord(ch) - 65]))
    cipher_counts = Counter(ch.upper() for ch in ciphertext if ch.isalpha())
    cipher_order = [ch for ch, _ in cipher_counts.most_common()]
    for ch in ALPHABET:
        if ch not in cipher_order:
            cipher_order.append(ch)
    mapping = {cipher_order[i]: freq_order[i] for i in range(26)}
    return [mapping[ch] for ch in ALPHABET]


def _run_hill_climb_restart(
    ciphertext: str,
    base_key: list[str],
    restart_idx: int,
    iterations: int,
    rng: random.Random,
) -> tuple[float, list[str], str]:
    """Run one seeded hill-climbing restart for monoalphabetic substitution."""
    cur_key = list(base_key)
    if restart_idx > 0:
        for _ in range(8):
            a_idx, b_idx = rng.sample(range(26), 2)
            cur_key[a_idx], cur_key[b_idx] = cur_key[b_idx], cur_key[a_idx]

    cur_pt = _apply_sub_key(ciphertext, {ALPHABET[i]: cur_key[i] for i in range(26)})
    cur_score = _score_english_text(cur_pt)

    for _ in range(max(1, iterations)):
        a_idx, b_idx = rng.sample(range(26), 2)
        cur_key[a_idx], cur_key[b_idx] = cur_key[b_idx], cur_key[a_idx]
        cand_pt = _apply_sub_key(ciphertext, {ALPHABET[i]: cur_key[i] for i in range(26)})
        cand_score = _score_english_text(cand_pt)
        if cand_score > cur_score:
            cur_score, cur_pt = cand_score, cand_pt
        else:
            cur_key[a_idx], cur_key[b_idx] = cur_key[b_idx], cur_key[a_idx]
    return cur_score, cur_key, cur_pt


def substitution_hill_climb(
    ciphertext: str,
    restarts: int = 6,
    iterations: int = 350,
    seed: int = 42,
) -> dict:
    """Crack a monoalphabetic substitution cipher via seeded hill-climbing."""
    if not ciphertext or not any(ch.isalpha() for ch in ciphertext):
        raise ValueError("ciphertext must contain at least one alphabetic character")

    rng = random.Random(seed)
    best_score = -1e9
    best_key = list(ALPHABET)
    best_pt = ciphertext
    trace: list[dict] = []
    base_key = _initial_freq_key(ciphertext)

    for restart_idx in range(max(1, restarts)):
        cur_score, cur_key, cur_pt = _run_hill_climb_restart(
            ciphertext, base_key, restart_idx, iterations, rng
        )
        trace.append({"restart": restart_idx + 1, "score": round(cur_score, 3)})
        if cur_score > best_score:
            best_score, best_key, best_pt = cur_score, cur_key, cur_pt

    return {
        "best_key": "".join(best_key),
        "plaintext": best_pt,
        "score": round(best_score, 3),
        "restarts": max(1, restarts),
        "iterations": max(1, iterations),
        "trace": trace,
    }
