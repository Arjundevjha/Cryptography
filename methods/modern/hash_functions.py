"""
Manual implementation of cryptographic hash functions in pure Python.
This module provides MD5, SHA-1, SHA-256, SHA-512, SHA3-256, BLAKE2b, and BLAKE2s.
No external library imports are used except for 'typing'.
"""

from typing import Dict, Callable, List

# --- Constants for Pylint Compliance ---
PADDING_MOD_64 = 64
PADDING_TARGET_56 = 56
PADDING_TARGET_112 = 112
PADDING_MOD_128 = 128

SHA1_ROUND_1_LIMIT = 20
SHA1_ROUND_2_LIMIT = 40
SHA1_ROUND_3_LIMIT = 60

BLAKE2B_BLOCK_SIZE = 128
BLAKE2S_BLOCK_SIZE = 64

ALL_ALGORITHMS_FLAG = "all"

MD5_ROUND_1_LIMIT = 16
MD5_ROUND_2_LIMIT = 32
MD5_ROUND_3_LIMIT = 48
MD5_WORD_COUNT = 16

# --- Constants for BLAKE2 ---
BLAKE2_SIGMA: List[List[int]] = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
    [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
    [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
    [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
    [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
    [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
    [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
    [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
    [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0],
]

BLAKE2B_H_INIT = [
    0x6a09e667f2bdc948, 0xbb67ae8584caa73b, 0x3c6ef372fe94f82b, 0xa54ff53a5f1d36f1,
    0x510e527fade682d1, 0x9b05688c2b3e6c1f, 0x1f83d9abfb41bd6b, 0x5be0cd19137e2179
]

BLAKE2B_IV = [
    0x6a09e667f3bcc908, 0xbb67ae8584caa73b, 0x3c6ef372fe94f82b, 0xa54ff53a5f1d36f1,
    0x510e527fade682d1, 0x9b05688c2b3e6c1f, 0x1f83d9abfb41bd6b, 0x5be0cd19137e2179
]

BLAKE2S_H_INIT = [
    0x6b08e647, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]

BLAKE2S_IV = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]

# --- SHA-256 Constants ---
SHA256_H_INIT = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]

SHA256_K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]

# --- MD5 Constants ---
MD5_T = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
]

MD5_S = [
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21
]

# --- SHA-1 Constants ---
SHA1_H_INIT = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0]

# --- SHA-512 Constants ---
SHA512_H_INIT = [
    0x6a09e667f3bcc908, 0xbb67ae8584caa73b, 0x3c6ef372fe94f82b, 0xa54ff53a5f1d36f1,
    0x510e527fade682d1, 0x9b05688c2b3e6c1f, 0x1f83d9abfb41bd6b, 0x5be0cd19137e2179
]

SHA512_K = [
    0x428a2f98d728ae22, 0x7137449123ef65cd, 0xb5c0fbcfec4d3b2f, 0xe9b5dba58189dbbc,
    0x3956c25bf348b538, 0x59f111f1b605d019, 0x923f82a4af194f9b, 0xab1c5ed5da6d8118,
    0xd807aa98a3030242, 0x12835b0145706fbe, 0x243185be4ee4b28c, 0x550c7dc3d5ffb4e2,
    0x72be5d74f27b896f, 0x80deb1fe3b1696b1, 0x9bdc06a725c71235, 0xc19bf174cf692694,
    0xe49b69c19ef14ad2, 0xefbe4786384f25e3, 0x0fc19dc68b8cd5b5, 0x240ca1cc77ac9c65,
    0x2de92c6f592b0275, 0x4a7484aa6ea6e483, 0x5cb0a9dcbd41fbd4, 0x76f988da831153b5,
    0x983e5152ee66dfab, 0xa831c66d2db43210, 0xb00327c898fb213f, 0xbf597fc7beef0ee4,
    0xc6e00bf33da88fc2, 0xd5a79147930aa725, 0x06ca6351e003826f, 0x142929670a0e6e70,
    0x27b70a8546d22ffc, 0x2e1b21385c26c926, 0x4d2c6dfc5ac42aed, 0x53380d139d95b3df,
    0x650a73548baf63de, 0x766a0abb3c77b2a8, 0x81c2c92e47edaee6, 0x92722c851482353b,
    0xa2bfe8a14cf10364, 0xa81a664bbc423001, 0xc24b8b70d0f89791, 0xc76c51a30654be30,
    0xd192e819d6ef5218, 0xd69906245565a910, 0xf40e35855771202a, 0x106aa07032bbd1b8,
    0x19a4c116b8d2d0c8, 0x1e376c085141ab53, 0x2748774cdf8eeb99, 0x34b0bcb5e19b48a8,
    0x391c0cb3c5c95a63, 0x4ed8aa4ae3418acb, 0x5b9cca4f7763e373, 0x682e6ff3d6b2b8a3,
    0x748f82ee5defb2fc, 0x78a5636f43172f60, 0x84c87814a1f0ab72, 0x8cc702081a6439ec,
    0x90befffa23631e28, 0xa4506cebde82bde9, 0xbef9a3f7b2c67915, 0xc67178f2e372532b,
    0xca273eceea26619c, 0xd186b8c721c0c207, 0xeada7dd6cde0eb1e, 0xf57d4f7fee6ed178,
    0x06f067aa72176fba, 0x0a637dc5a2c898a6, 0x113f9804bef90dae, 0x1b710b35131c471b,
    0x28db77f523047d84, 0x32caab7b40c72493, 0x3c9ebe0a15c9bebc, 0x431d67c49c100d4c,
    0x4cc5d4becb3e42b6, 0x597f299cfc657e2a, 0x5fcb6fab3ad6faec, 0x6c44198c4a475817,
]

# --- SHA-3 Constants ---
SHA3_RC = [
    0x0000000000000001, 0x0000000000008082, 0x800000000000808a, 0x8000000080008000,
    0x000000000000808b, 0x0000000080000001, 0x8000000080008081, 0x8000000000008009,
    0x000000000000008a, 0x0000000000000088, 0x0000000080008009, 0x000000008000000a,
    0x000000008000808b, 0x800000000000008b, 0x8000000000008089, 0x8000000000008003,
    0x8000000000008002, 0x8000000000000080, 0x000000000000800a, 0x800000008000000a,
    0x8000000080008081, 0x8000000000008080, 0x0000000080000001, 0x8000000080008008
]

SHA3_ROTATION_OFFSETS = [
    [0,  36,  3, 41, 18],
    [1,  44, 10, 45,  2],
    [62,  6, 43, 15, 61],
    [28, 55, 25, 21, 56],
    [27, 20, 39,  8, 14]
]


# --- Helper Functions ---
def _left_rotate32(x: int, amount: int) -> int:
    """Perform bitwise left rotation on a 32-bit unsigned integer."""
    x &= 0xffffffff
    return ((x << amount) | (x >> (32 - amount))) & 0xffffffff


def _rotr32(x: int, amount: int) -> int:
    """Perform bitwise right rotation on a 32-bit unsigned integer."""
    x &= 0xffffffff
    return ((x >> amount) | (x << (32 - amount))) & 0xffffffff


def _rotr64(x: int, amount: int) -> int:
    """Perform bitwise right rotation on a 64-bit unsigned integer."""
    x &= 0xffffffffffffffff
    return ((x >> amount) | (x << (64 - amount))) & 0xffffffffffffffff


def _f_func(x: int, y: int, z: int) -> int:
    return (x & y) | (~x & z)


def _g_func(x: int, y: int, z: int) -> int:
    return (x & z) | (y & ~z)


def _h_func(x: int, y: int, z: int) -> int:
    return x ^ y ^ z


def _i_func(x: int, y: int, z: int) -> int:
    return y ^ (x | ~z)


def _keccak_f1600(st: List[int]) -> List[int]:
    """Keccak-f[1600] permutation function."""
    for round_idx in range(24):
        # Theta
        c_state = [0] * 5
        for x in range(5):
            c_state[x] = st[x] ^ st[x + 5] ^ st[x + 10] ^ st[x + 15] ^ st[x + 20]
        d_state = [0] * 5
        for x in range(5):
            c_plus = c_state[(x + 1) % 5]
            rot_c = ((c_plus << 1) & 0xffffffffffffffff) | (c_plus >> 63)
            d_state[x] = c_state[(x - 1) % 5] ^ rot_c
        for x in range(5):
            for y in range(5):
                st[x + 5 * y] ^= d_state[x]

        # Rho and Pi
        b_state = [0] * 25
        for x in range(5):
            for y in range(5):
                val = st[x + 5 * y]
                offset = SHA3_ROTATION_OFFSETS[x][y]
                rot_val = (
                    ((val << offset) & 0xffffffffffffffff)
                    | (val >> (64 - offset))
                    if offset > 0
                    else val
                )
                b_state[y + 5 * ((2 * x + 3 * y) % 5)] = rot_val

        # Chi
        for y in range(5):
            for x in range(5):
                st[x + 5 * y] = b_state[x + 5 * y] ^ (
                    ((~b_state[((x + 1) % 5) + 5 * y]) & b_state[((x + 2) % 5) + 5 * y])
                    & 0xffffffffffffffff
                )

        # Iota
        st[0] ^= SHA3_RC[round_idx]
    return st


def _blake2b_g(v: List[int], indices: tuple[int, int, int, int], x: int, y: int) -> None:
    """Helper G function for BLAKE2b."""
    a, b, c, d = indices
    v[a] = (v[a] + v[b] + x) & 0xffffffffffffffff
    v[d] ^= v[a]
    v[d] = ((v[d] >> 32) | (v[d] << 32)) & 0xffffffffffffffff

    v[c] = (v[c] + v[d]) & 0xffffffffffffffff
    v[b] ^= v[c]
    v[b] = ((v[b] >> 24) | (v[b] << 40)) & 0xffffffffffffffff

    v[a] = (v[a] + v[b] + y) & 0xffffffffffffffff
    v[d] ^= v[a]
    v[d] = ((v[d] >> 16) | (v[d] << 48)) & 0xffffffffffffffff

    v[c] = (v[c] + v[d]) & 0xffffffffffffffff
    v[b] ^= v[c]
    v[b] = ((v[b] >> 63) | (v[b] << 1)) & 0xffffffffffffffff


def _blake2s_g(v: List[int], indices: tuple[int, int, int, int], x: int, y: int) -> None:
    """Helper G function for BLAKE2s."""
    a, b, c, d = indices
    v[a] = (v[a] + v[b] + x) & 0xffffffff
    v[d] ^= v[a]
    v[d] = ((v[d] >> 16) | (v[d] << 16)) & 0xffffffff

    v[c] = (v[c] + v[d]) & 0xffffffff
    v[b] ^= v[c]
    v[b] = ((v[b] >> 12) | (v[b] << 20)) & 0xffffffff

    v[a] = (v[a] + v[b] + y) & 0xffffffff
    v[d] ^= v[a]
    v[d] = ((v[d] >> 8) | (v[d] << 24)) & 0xffffffff

    v[c] = (v[c] + v[d]) & 0xffffffff
    v[b] ^= v[c]
    v[b] = ((v[b] >> 7) | (v[b] << 25)) & 0xffffffff


MD5_FUNCS = (_f_func, _g_func, _h_func, _i_func)
MD5_G_INDEXES = [
    idx if idx < MD5_ROUND_1_LIMIT else
    (5 * idx + 1) % MD5_WORD_COUNT if idx < MD5_ROUND_2_LIMIT else
    (3 * idx + 5) % MD5_WORD_COUNT if idx < MD5_ROUND_3_LIMIT else
    (7 * idx) % MD5_WORD_COUNT
    for idx in range(64)
]


# --- Hash Algorithms ---
def sha256(data: str) -> str:
    """
    Compute the SHA-256 hash of the given data.

    Args:
        data: The input string to hash

    Returns:
        SHA-256 hash as hexadecimal string
    """
    b_data = bytearray(data.encode('utf-8'))
    orig_len_bits = (len(b_data) * 8) & 0xffffffffffffffff
    b_data.append(0x80)
    while len(b_data) % PADDING_MOD_64 != PADDING_TARGET_56:
        b_data.append(0x00)
    b_data.extend(orig_len_bits.to_bytes(8, 'big'))

    h_state = list(SHA256_H_INIT)

    for offset in range(0, len(b_data), PADDING_MOD_64):
        w_words = [0] * 64
        for j in range(16):
            w_words[j] = int.from_bytes(b_data[offset + j * 4 : offset + (j + 1) * 4], 'big')
        for j in range(16, 64):
            s0 = (
                _rotr32(w_words[j - 15], 7)
                ^ _rotr32(w_words[j - 15], 18)
                ^ (w_words[j - 15] >> 3)
            )
            s1 = (
                _rotr32(w_words[j - 2], 17)
                ^ _rotr32(w_words[j - 2], 19)
                ^ (w_words[j - 2] >> 10)
            )
            w_words[j] = (w_words[j - 16] + s0 + w_words[j - 7] + s1) & 0xffffffff

        state = list(h_state)
        for j in range(64):
            t1 = (
                state[7]
                + (_rotr32(state[4], 6) ^ _rotr32(state[4], 11) ^ _rotr32(state[4], 25))
                + ((state[4] & state[5]) ^ (((~state[4]) & 0xffffffff) & state[6]))
                + SHA256_K[j]
                + w_words[j]
            ) & 0xffffffff
            t2 = (
                (_rotr32(state[0], 2) ^ _rotr32(state[0], 13) ^ _rotr32(state[0], 22))
                + ((state[0] & state[1]) ^ (state[0] & state[2]) ^ (state[1] & state[2]))
            ) & 0xffffffff
            state[7] = state[6]
            state[6] = state[5]
            state[5] = state[4]
            state[4] = (state[3] + t1) & 0xffffffff
            state[3] = state[2]
            state[2] = state[1]
            state[1] = state[0]
            state[0] = (t1 + t2) & 0xffffffff

        h_state[0] = (h_state[0] + state[0]) & 0xffffffff
        h_state[1] = (h_state[1] + state[1]) & 0xffffffff
        h_state[2] = (h_state[2] + state[2]) & 0xffffffff
        h_state[3] = (h_state[3] + state[3]) & 0xffffffff
        h_state[4] = (h_state[4] + state[4]) & 0xffffffff
        h_state[5] = (h_state[5] + state[5]) & 0xffffffff
        h_state[6] = (h_state[6] + state[6]) & 0xffffffff
        h_state[7] = (h_state[7] + state[7]) & 0xffffffff

    return b_data[:0].join(val.to_bytes(4, 'big') for val in h_state).hex()


def md5(data: str) -> str:
    """
    Compute the MD5 hash of the given data.

    Note: MD5 is cryptographically broken and should not be used for security.

    Args:
        data: The input string to hash

    Returns:
        MD5 hash as hexadecimal string
    """
    b_data = bytearray(data.encode('utf-8'))
    b_data.append(0x80)
    while len(b_data) % PADDING_MOD_64 != PADDING_TARGET_56:
        b_data.append(0x00)
    b_data.extend(((len(b_data) - 1) * 8).to_bytes(8, 'little'))

    a_state, b_state, c_state, d_state = 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476

    for offset in range(0, len(b_data), PADDING_MOD_64):
        x_words = [
            int.from_bytes(b_data[offset + j * 4 : offset + (j + 1) * 4], 'little')
            for j in range(16)
        ]
        a, b, c, d = a_state, b_state, c_state, d_state
        for i in range(64):
            term = (
                a
                + MD5_FUNCS[i // 16](b, c, d)
                + MD5_T[i]
                + x_words[MD5_G_INDEXES[i]]
            ) & 0xffffffff
            a, b, c, d = (
                d,
                (b + _left_rotate32(term, MD5_S[i])) & 0xffffffff,
                b,
                c
            )

        a_state = (a_state + a) & 0xffffffff
        b_state = (b_state + b) & 0xffffffff
        c_state = (c_state + c) & 0xffffffff
        d_state = (d_state + d) & 0xffffffff

    return (
        a_state.to_bytes(4, 'little')
        + b_state.to_bytes(4, 'little')
        + c_state.to_bytes(4, 'little')
        + d_state.to_bytes(4, 'little')
    ).hex()


def sha1(data: str) -> str:
    """
    Compute the SHA-1 hash of the given data.

    Note: SHA-1 is deprecated for security-sensitive applications.

    Args:
        data: The input string to hash

    Returns:
        SHA-1 hash as hexadecimal string
    """
    b_data = bytearray(data.encode('utf-8'))
    orig_len_bits = (len(b_data) * 8) & 0xffffffffffffffff
    b_data.append(0x80)
    while len(b_data) % PADDING_MOD_64 != PADDING_TARGET_56:
        b_data.append(0x00)
    b_data.extend(orig_len_bits.to_bytes(8, 'big'))

    h_state = list(SHA1_H_INIT)

    for offset in range(0, len(b_data), PADDING_MOD_64):
        w_words = [0] * 80
        for j in range(16):
            w_words[j] = int.from_bytes(b_data[offset + j * 4 : offset + (j + 1) * 4], 'big')
        for j in range(16, 80):
            w_words[j] = _left_rotate32(
                w_words[j - 3] ^ w_words[j - 8] ^ w_words[j - 14] ^ w_words[j - 16], 1
            )

        state = list(h_state)
        for t in range(80):
            if t < SHA1_ROUND_1_LIMIT:
                f_val = (state[1] & state[2]) | (~state[1] & state[3])
                k_val = 0x5a827999
            elif t < SHA1_ROUND_2_LIMIT:
                f_val = state[1] ^ state[2] ^ state[3]
                k_val = 0x6ed9eba1
            elif t < SHA1_ROUND_3_LIMIT:
                f_val = (state[1] & state[2]) | (state[1] & state[3]) | (state[2] & state[3])
                k_val = 0x8f1bbcdc
            else:
                f_val = state[1] ^ state[2] ^ state[3]
                k_val = 0xca62c1d6

            temp = (
                _left_rotate32(state[0], 5) + f_val + state[4] + k_val + w_words[t]
            ) & 0xffffffff
            state[4] = state[3]
            state[3] = state[2]
            state[2] = _left_rotate32(state[1], 30)
            state[1] = state[0]
            state[0] = temp

        h_state[0] = (h_state[0] + state[0]) & 0xffffffff
        h_state[1] = (h_state[1] + state[1]) & 0xffffffff
        h_state[2] = (h_state[2] + state[2]) & 0xffffffff
        h_state[3] = (h_state[3] + state[3]) & 0xffffffff
        h_state[4] = (h_state[4] + state[4]) & 0xffffffff

    return (
        h_state[0].to_bytes(4, 'big')
        + h_state[1].to_bytes(4, 'big')
        + h_state[2].to_bytes(4, 'big')
        + h_state[3].to_bytes(4, 'big')
        + h_state[4].to_bytes(4, 'big')
    ).hex()


def sha512(data: str) -> str:
    """
    Compute the SHA-512 hash of the given data.

    Args:
        data: The input string to hash

    Returns:
        SHA-512 hash as hexadecimal string
    """
    b_data = bytearray(data.encode('utf-8'))
    orig_len_bits = (len(b_data) * 8) & 0xffffffffffffffff
    b_data.append(0x80)
    while len(b_data) % PADDING_MOD_128 != PADDING_TARGET_112:
        b_data.append(0x00)
    b_data.extend((0).to_bytes(8, 'big'))
    b_data.extend(orig_len_bits.to_bytes(8, 'big'))

    h_state = list(SHA512_H_INIT)

    for offset in range(0, len(b_data), PADDING_MOD_128):
        w_words = [0] * 80
        for j in range(16):
            w_words[j] = int.from_bytes(b_data[offset + j * 8 : offset + (j + 1) * 8], 'big')
        for j in range(16, 80):
            s0 = (
                _rotr64(w_words[j - 15], 1)
                ^ _rotr64(w_words[j - 15], 8)
                ^ (w_words[j - 15] >> 7)
            )
            s1 = (
                _rotr64(w_words[j - 2], 19)
                ^ _rotr64(w_words[j - 2], 61)
                ^ (w_words[j - 2] >> 6)
            )
            w_words[j] = (w_words[j - 16] + s0 + w_words[j - 7] + s1) & 0xffffffffffffffff

        state = list(h_state)
        for j in range(80):
            t1 = (
                state[7]
                + (_rotr64(state[4], 14) ^ _rotr64(state[4], 18) ^ _rotr64(state[4], 41))
                + ((state[4] & state[5]) ^ (((~state[4]) & 0xffffffffffffffff) & state[6]))
                + SHA512_K[j]
                + w_words[j]
            ) & 0xffffffffffffffff
            t2 = (
                (_rotr64(state[0], 28) ^ _rotr64(state[0], 34) ^ _rotr64(state[0], 39))
                + ((state[0] & state[1]) ^ (state[0] & state[2]) ^ (state[1] & state[2]))
            ) & 0xffffffff
            state[7] = state[6]
            state[6] = state[5]
            state[5] = state[4]
            state[4] = (state[3] + t1) & 0xffffffffffffffff
            state[3] = state[2]
            state[2] = state[1]
            state[1] = state[0]
            state[0] = (t1 + t2) & 0xffffffffffffffff

        h_state[0] = (h_state[0] + state[0]) & 0xffffffffffffffff
        h_state[1] = (h_state[1] + state[1]) & 0xffffffffffffffff
        h_state[2] = (h_state[2] + state[2]) & 0xffffffffffffffff
        h_state[3] = (h_state[3] + state[3]) & 0xffffffffffffffff
        h_state[4] = (h_state[4] + state[4]) & 0xffffffffffffffff
        h_state[5] = (h_state[5] + state[5]) & 0xffffffffffffffff
        h_state[6] = (h_state[6] + state[6]) & 0xffffffffffffffff
        h_state[7] = (h_state[7] + state[7]) & 0xffffffffffffffff

    return b_data[:0].join(val.to_bytes(8, 'big') for val in h_state).hex()


def sha3_256(data: str) -> str:
    """
    Compute the SHA3-256 hash of the given data.

    Args:
        data: The input string to hash

    Returns:
        SHA3-256 hash as hexadecimal string
    """
    b_data = data.encode('utf-8')
    padded = bytearray(b_data)
    padded.append(0x06)
    while len(padded) % 136:
        padded.append(0x00)
    padded[-1] |= 0x80

    state = [0] * 25

    for i in range(0, len(padded), 136):
        block = padded[i : i + 136]
        for j in range(17):
            word = int.from_bytes(block[j * 8 : (j + 1) * 8], 'little')
            state[j] ^= word
        state = _keccak_f1600(state)

    out_bytes = bytearray()
    for j in range(4):
        out_bytes.extend(state[j].to_bytes(8, 'little'))
    return out_bytes.hex()


def blake2b(data: str) -> str:
    """
    Compute the BLAKE2b hash of the given data.

    BLAKE2b is optimized for 64-bit platforms and produces digests up to 64 bytes.

    Args:
        data: The input string to hash

    Returns:
        BLAKE2b hash as hexadecimal string
    """
    b_data = data.encode('utf-8')
    h_state = list(BLAKE2B_H_INIT)

    blocks = []
    if not b_data:
        blocks.append(bytes(BLAKE2B_BLOCK_SIZE))
    else:
        for i in range(0, len(b_data), BLAKE2B_BLOCK_SIZE):
            block = b_data[i : i + BLAKE2B_BLOCK_SIZE]
            if len(block) < BLAKE2B_BLOCK_SIZE:
                block += bytes(BLAKE2B_BLOCK_SIZE - len(block))
            blocks.append(block)

    for idx, block in enumerate(blocks):
        if idx == len(blocks) - 1:
            t = len(b_data)
            f0 = 0xffffffffffffffff
        else:
            t = (idx + 1) * BLAKE2B_BLOCK_SIZE
            f0 = 0

        m_words = [int.from_bytes(block[j * 8 : (j + 1) * 8], 'little') for j in range(16)]

        v_state = h_state + BLAKE2B_IV
        v_state[12] ^= t & 0xffffffffffffffff
        v_state[13] ^= (t >> 64) & 0xffffffffffffffff
        v_state[14] ^= f0

        for r in range(12):
            sigma = BLAKE2_SIGMA[r % 10]
            _blake2b_g(v_state, (0, 4, 8, 12), m_words[sigma[0]], m_words[sigma[1]])
            _blake2b_g(v_state, (1, 5, 9, 13), m_words[sigma[2]], m_words[sigma[3]])
            _blake2b_g(v_state, (2, 6, 10, 14), m_words[sigma[4]], m_words[sigma[5]])
            _blake2b_g(v_state, (3, 7, 11, 15), m_words[sigma[6]], m_words[sigma[7]])
            _blake2b_g(v_state, (0, 5, 10, 15), m_words[sigma[8]], m_words[sigma[9]])
            _blake2b_g(v_state, (1, 6, 11, 12), m_words[sigma[10]], m_words[sigma[11]])
            _blake2b_g(v_state, (2, 7, 8, 13), m_words[sigma[12]], m_words[sigma[13]])
            _blake2b_g(v_state, (3, 4, 9, 14), m_words[sigma[14]], m_words[sigma[15]])

        for i in range(8):
            h_state[i] ^= v_state[i] ^ v_state[i + 8]

    out_bytes = b"".join(h.to_bytes(8, 'little') for h in h_state)
    return out_bytes.hex()


def blake2s(data: str) -> str:
    """
    Compute the BLAKE2s hash of the given data.

    BLAKE2s is optimized for 8 to 32-bit platforms and produces digests up to 32 bytes.

    Args:
        data: The input string to hash

    Returns:
        BLAKE2s hash as hexadecimal string
    """
    b_data = data.encode('utf-8')
    h_state = list(BLAKE2S_H_INIT)

    blocks = []
    if not b_data:
        blocks.append(bytes(BLAKE2S_BLOCK_SIZE))
    else:
        for i in range(0, len(b_data), BLAKE2S_BLOCK_SIZE):
            block = b_data[i : i + BLAKE2S_BLOCK_SIZE]
            if len(block) < BLAKE2S_BLOCK_SIZE:
                block += bytes(BLAKE2S_BLOCK_SIZE - len(block))
            blocks.append(block)

    for idx, block in enumerate(blocks):
        if idx == len(blocks) - 1:
            t = len(b_data)
            f0 = 0xffffffff
        else:
            t = (idx + 1) * BLAKE2S_BLOCK_SIZE
            f0 = 0

        m_words = [int.from_bytes(block[j * 4 : (j + 1) * 4], 'little') for j in range(16)]

        v_state = h_state + BLAKE2S_IV
        v_state[12] ^= t & 0xffffffff
        v_state[13] ^= (t >> 32) & 0xffffffff
        v_state[14] ^= f0

        for r in range(10):
            sigma = BLAKE2_SIGMA[r]
            _blake2s_g(v_state, (0, 4, 8, 12), m_words[sigma[0]], m_words[sigma[1]])
            _blake2s_g(v_state, (1, 5, 9, 13), m_words[sigma[2]], m_words[sigma[3]])
            _blake2s_g(v_state, (2, 6, 10, 14), m_words[sigma[4]], m_words[sigma[5]])
            _blake2s_g(v_state, (3, 7, 11, 15), m_words[sigma[6]], m_words[sigma[7]])
            _blake2s_g(v_state, (0, 5, 10, 15), m_words[sigma[8]], m_words[sigma[9]])
            _blake2s_g(v_state, (1, 6, 11, 12), m_words[sigma[10]], m_words[sigma[11]])
            _blake2s_g(v_state, (2, 7, 8, 13), m_words[sigma[12]], m_words[sigma[13]])
            _blake2s_g(v_state, (3, 4, 9, 14), m_words[sigma[14]], m_words[sigma[15]])

        for i in range(8):
            h_state[i] ^= v_state[i] ^ v_state[i + 8]

    out_bytes = b"".join(h.to_bytes(4, 'little') for h in h_state)
    return out_bytes.hex()


# Mapping of algorithm names to functions
HASH_FUNCTIONS: Dict[str, Callable[[str], str]] = {
    'sha256': sha256,
    'md5': md5,
    'sha1': sha1,
    'sha512': sha512,
    'sha3_256': sha3_256,
    'blake2b': blake2b,
    'blake2s': blake2s,
}


def compute_hash(data: str, algorithm: str) -> str:
    """
    Compute hash using the specified algorithm.

    Args:
        data: The input string to hash
        algorithm: Hash algorithm name (sha256, md5, sha1, sha512, sha3_256, blake2b, blake2s)

    Returns:
        Hash digest as hexadecimal string

    Raises:
        ValueError: If algorithm is not supported
    """
    if algorithm not in HASH_FUNCTIONS:
        raise ValueError(
            f"Unsupported algorithm: {algorithm}. Supported: {list(HASH_FUNCTIONS.keys())}"
        )
    return HASH_FUNCTIONS[algorithm](data)


def main() -> None:
    """Run the interactive hash command line interface."""
    data = input("Please enter data to hash: ")

    algorithms = list(HASH_FUNCTIONS.keys())
    print(f"\nAvailable algorithms: {', '.join(algorithms)}")

    prompt = "Enter hash algorithm (or 'all' to show all): "
    if (algorithm := input(prompt).lower()) == ALL_ALGORITHMS_FLAG:
        print(f"\nInput: {data}\n")
        for algo in algorithms:
            hash_value = compute_hash(data, algo)
            print(f"{algo.upper():12} : {hash_value}")
    else:
        try:
            hash_value = compute_hash(data, algorithm)
            print(f"\nInput: {data}")
            print(f"{algorithm.upper()} Hash: {hash_value}")
        except ValueError as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    main()
