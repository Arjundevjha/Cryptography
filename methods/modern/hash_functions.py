"""
Manual implementation of cryptographic hash functions in pure Python.
This module provides MD5, SHA-1, SHA-256, SHA-512, SHA3-256, BLAKE2b, and BLAKE2s.
No external library imports are used except for 'typing'.
"""

# pylint: disable=invalid-name,too-many-locals,too-many-arguments,too-many-positional-arguments

from typing import Dict, Callable, List

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
    while len(b_data) % 64 != 56:
        b_data.append(0x00)
    b_data.extend(orig_len_bits.to_bytes(8, 'big'))

    H = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]

    K = [
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

    for offset in range(0, len(b_data), 64):
        W = [0] * 64
        for j in range(16):
            W[j] = int.from_bytes(b_data[offset + j * 4 : offset + (j + 1) * 4], 'big')
        for j in range(16, 64):
            s0 = _rotr32(W[j - 15], 7) ^ _rotr32(W[j - 15], 18) ^ (W[j - 15] >> 3)
            s1 = _rotr32(W[j - 2], 17) ^ _rotr32(W[j - 2], 19) ^ (W[j - 2] >> 10)
            W[j] = (W[j - 16] + s0 + W[j - 7] + s1) & 0xffffffff

        a, b, c, d, e, f, g, h = H
        for j in range(64):
            S1 = _rotr32(e, 6) ^ _rotr32(e, 11) ^ _rotr32(e, 25)
            ch = (e & f) ^ (((~e) & 0xffffffff) & g)
            temp1 = (h + S1 + ch + K[j] + W[j]) & 0xffffffff
            S0 = _rotr32(a, 2) ^ _rotr32(a, 13) ^ _rotr32(a, 22)
            maj = (a & b) ^ (a & c) ^ (b & c)
            temp2 = (S0 + maj) & 0xffffffff

            h = g
            g = f
            f = e
            e = (d + temp1) & 0xffffffff
            d = c
            c = b
            b = a
            a = (temp1 + temp2) & 0xffffffff

        H[0] = (H[0] + a) & 0xffffffff
        H[1] = (H[1] + b) & 0xffffffff
        H[2] = (H[2] + c) & 0xffffffff
        H[3] = (H[3] + d) & 0xffffffff
        H[4] = (H[4] + e) & 0xffffffff
        H[5] = (H[5] + f) & 0xffffffff
        H[6] = (H[6] + g) & 0xffffffff
        H[7] = (H[7] + h) & 0xffffffff

    return b"".join(val.to_bytes(4, 'big') for val in H).hex()


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
    orig_len_bits = (len(b_data) * 8) & 0xffffffffffffffff
    b_data.append(0x80)
    while len(b_data) % 64 != 56:
        b_data.append(0x00)
    b_data.extend(orig_len_bits.to_bytes(8, 'little'))

    A, B, C, D = 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476

    T = [
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

    S = [
        7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
        5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
        4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
        6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21
    ]

    def F(x, y, z):
        return (x & y) | (~x & z)

    def G_func(x, y, z):
        return (x & z) | (y & ~z)

    def H_func(x, y, z):
        return x ^ y ^ z

    def I_func(x, y, z):
        return y ^ (x | ~z)

    for offset in range(0, len(b_data), 64):
        X = [
            int.from_bytes(b_data[offset + j * 4 : offset + (j + 1) * 4], 'little')
            for j in range(16)
        ]
        a, b, c, d = A, B, C, D
        for i in range(64):
            if 0 <= i <= 15:
                f = F(b, c, d)
                g = i
            elif 16 <= i <= 31:
                f = G_func(b, c, d)
                g = (5 * i + 1) % 16
            elif 32 <= i <= 47:
                f = H_func(b, c, d)
                g = (3 * i + 5) % 16
            else:
                f = I_func(b, c, d)
                g = (7 * i) % 16

            temp = (a + f + T[i] + X[g]) & 0xffffffff
            rot = _left_rotate32(temp, S[i])
            a, b, c, d = d, (b + rot) & 0xffffffff, b, c

        A = (A + a) & 0xffffffff
        B = (B + b) & 0xffffffff
        C = (C + c) & 0xffffffff
        D = (D + d) & 0xffffffff

    return (
        A.to_bytes(4, 'little')
        + B.to_bytes(4, 'little')
        + C.to_bytes(4, 'little')
        + D.to_bytes(4, 'little')
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
    while len(b_data) % 64 != 56:
        b_data.append(0x00)
    b_data.extend(orig_len_bits.to_bytes(8, 'big'))

    h0, h1, h2, h3, h4 = 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0

    for offset in range(0, len(b_data), 64):
        W = [0] * 80
        for j in range(16):
            W[j] = int.from_bytes(b_data[offset + j * 4 : offset + (j + 1) * 4], 'big')
        for j in range(16, 80):
            W[j] = _left_rotate32(W[j - 3] ^ W[j - 8] ^ W[j - 14] ^ W[j - 16], 1)

        a, b, c, d, e = h0, h1, h2, h3, h4
        for t in range(80):
            if 0 <= t <= 19:
                f = (b & c) | (~b & d)
                k = 0x5a827999
            elif 20 <= t <= 39:
                f = b ^ c ^ d
                k = 0x6ed9eba1
            elif 40 <= t <= 59:
                f = (b & c) | (b & d) | (c & d)
                k = 0x8f1bbcdc
            else:
                f = b ^ c ^ d
                k = 0xca62c1d6

            temp = (_left_rotate32(a, 5) + f + e + k + W[t]) & 0xffffffff
            e = d
            d = c
            c = _left_rotate32(b, 30)
            b = a
            a = temp

        h0 = (h0 + a) & 0xffffffff
        h1 = (h1 + b) & 0xffffffff
        h2 = (h2 + c) & 0xffffffff
        h3 = (h3 + d) & 0xffffffff
        h4 = (h4 + e) & 0xffffffff

    return (
        h0.to_bytes(4, 'big')
        + h1.to_bytes(4, 'big')
        + h2.to_bytes(4, 'big')
        + h3.to_bytes(4, 'big')
        + h4.to_bytes(4, 'big')
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
    while len(b_data) % 128 != 112:
        b_data.append(0x00)
    b_data.extend((0).to_bytes(8, 'big'))
    b_data.extend(orig_len_bits.to_bytes(8, 'big'))

    H = [
        0x6a09e667f3bcc908, 0xbb67ae8584caa73b, 0x3c6ef372fe94f82b, 0xa54ff53a5f1d36f1,
        0x510e527fade682d1, 0x9b05688c2b3e6c1f, 0x1f83d9abfb41bd6b, 0x5be0cd19137e2179
    ]

    K = [
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

    for offset in range(0, len(b_data), 128):
        W = [0] * 80
        for j in range(16):
            W[j] = int.from_bytes(b_data[offset + j * 8 : offset + (j + 1) * 8], 'big')
        for j in range(16, 80):
            s0 = _rotr64(W[j - 15], 1) ^ _rotr64(W[j - 15], 8) ^ (W[j - 15] >> 7)
            s1 = _rotr64(W[j - 2], 19) ^ _rotr64(W[j - 2], 61) ^ (W[j - 2] >> 6)
            W[j] = (W[j - 16] + s0 + W[j - 7] + s1) & 0xffffffffffffffff

        a, b, c, d, e, f, g, h = H
        for j in range(80):
            S1 = _rotr64(e, 14) ^ _rotr64(e, 18) ^ _rotr64(e, 41)
            ch = (e & f) ^ (((~e) & 0xffffffffffffffff) & g)
            temp1 = (h + S1 + ch + K[j] + W[j]) & 0xffffffffffffffff
            S0 = _rotr64(a, 28) ^ _rotr64(a, 34) ^ _rotr64(a, 39)
            maj = (a & b) ^ (a & c) ^ (b & c)
            temp2 = (S0 + maj) & 0xffffffff

            h = g
            g = f
            f = e
            e = (d + temp1) & 0xffffffffffffffff
            d = c
            c = b
            b = a
            a = (temp1 + temp2) & 0xffffffffffffffff

        H[0] = (H[0] + a) & 0xffffffffffffffff
        H[1] = (H[1] + b) & 0xffffffffffffffff
        H[2] = (H[2] + c) & 0xffffffffffffffff
        H[3] = (H[3] + d) & 0xffffffffffffffff
        H[4] = (H[4] + e) & 0xffffffffffffffff
        H[5] = (H[5] + f) & 0xffffffffffffffff
        H[6] = (H[6] + g) & 0xffffffffffffffff
        H[7] = (H[7] + h) & 0xffffffffffffffff

    return b"".join(val.to_bytes(8, 'big') for val in H).hex()


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

    RC = [
        0x0000000000000001, 0x0000000000008082, 0x800000000000808a, 0x8000000080008000,
        0x000000000000808b, 0x0000000080000001, 0x8000000080008081, 0x8000000000008009,
        0x000000000000008a, 0x0000000000000088, 0x0000000080008009, 0x000000008000000a,
        0x000000008000808b, 0x800000000000008b, 0x8000000000008089, 0x8000000000008003,
        0x8000000000008002, 0x8000000000000080, 0x000000000000800a, 0x800000008000000a,
        0x8000000080008081, 0x8000000000008080, 0x0000000080000001, 0x8000000080008008
    ]

    ROTATION_OFFSETS = [
        [0,  36,  3, 41, 18],
        [1,  44, 10, 45,  2],
        [62,  6, 43, 15, 61],
        [28, 55, 25, 21, 56],
        [27, 20, 39,  8, 14]
    ]

    def keccak_f1600(st: list[int]) -> list[int]:
        for round_idx in range(24):
            # Theta
            C = [0] * 5
            for x in range(5):
                C[x] = st[x] ^ st[x + 5] ^ st[x + 10] ^ st[x + 15] ^ st[x + 20]
            D = [0] * 5
            for x in range(5):
                c_plus = C[(x + 1) % 5]
                rot_c = ((c_plus << 1) & 0xffffffffffffffff) | (c_plus >> 63)
                D[x] = C[(x - 1) % 5] ^ rot_c
            for x in range(5):
                for y in range(5):
                    st[x + 5 * y] ^= D[x]

            # Rho and Pi
            B = [0] * 25
            for x in range(5):
                for y in range(5):
                    val = st[x + 5 * y]
                    offset = ROTATION_OFFSETS[x][y]
                    rot_val = (
                        ((val << offset) & 0xffffffffffffffff)
                        | (val >> (64 - offset))
                        if offset > 0
                        else val
                    )
                    B[y + 5 * ((2 * x + 3 * y) % 5)] = rot_val

            # Chi
            for y in range(5):
                for x in range(5):
                    st[x + 5 * y] = B[x + 5 * y] ^ (
                        ((~B[((x + 1) % 5) + 5 * y]) & B[((x + 2) % 5) + 5 * y])
                        & 0xffffffffffffffff
                    )

            # Iota
            st[0] ^= RC[round_idx]
        return st

    for i in range(0, len(padded), 136):
        block = padded[i : i + 136]
        for j in range(17):
            word = int.from_bytes(block[j * 8 : (j + 1) * 8], 'little')
            state[j] ^= word
        state = keccak_f1600(state)

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
    def g_func(v: List[int], a: int, b: int, c: int, d: int, x: int, y: int) -> None:
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

    b_data = data.encode('utf-8')
    H = [
        0x6a09e667f2bdc948, 0xbb67ae8584caa73b, 0x3c6ef372fe94f82b, 0xa54ff53a5f1d36f1,
        0x510e527fade682d1, 0x9b05688c2b3e6c1f, 0x1f83d9abfb41bd6b, 0x5be0cd19137e2179
    ]
    IV = [
        0x6a09e667f3bcc908, 0xbb67ae8584caa73b, 0x3c6ef372fe94f82b, 0xa54ff53a5f1d36f1,
        0x510e527fade682d1, 0x9b05688c2b3e6c1f, 0x1f83d9abfb41bd6b, 0x5be0cd19137e2179
    ]

    blocks = []
    if not b_data:
        blocks.append(bytes(128))
    else:
        for i in range(0, len(b_data), 128):
            block = b_data[i : i + 128]
            if len(block) < 128:
                block += bytes(128 - len(block))
            blocks.append(block)

    num_blocks = len(blocks)
    for idx, block in enumerate(blocks):
        if idx == num_blocks - 1:
            t = len(b_data)
            f0 = 0xffffffffffffffff
        else:
            t = (idx + 1) * 128
            f0 = 0

        M = [int.from_bytes(block[j * 8 : (j + 1) * 8], 'little') for j in range(16)]

        V = H + IV
        V[12] ^= t & 0xffffffffffffffff
        V[13] ^= (t >> 64) & 0xffffffffffffffff
        V[14] ^= f0

        for r in range(12):
            sigma = BLAKE2_SIGMA[r % 10]
            g_func(V, 0, 4, 8, 12, M[sigma[0]], M[sigma[1]])
            g_func(V, 1, 5, 9, 13, M[sigma[2]], M[sigma[3]])
            g_func(V, 2, 6, 10, 14, M[sigma[4]], M[sigma[5]])
            g_func(V, 3, 7, 11, 15, M[sigma[6]], M[sigma[7]])
            g_func(V, 0, 5, 10, 15, M[sigma[8]], M[sigma[9]])
            g_func(V, 1, 6, 11, 12, M[sigma[10]], M[sigma[11]])
            g_func(V, 2, 7, 8, 13, M[sigma[12]], M[sigma[13]])
            g_func(V, 3, 4, 9, 14, M[sigma[14]], M[sigma[15]])

        for i in range(8):
            H[i] ^= V[i] ^ V[i + 8]

    out_bytes = bytearray()
    for h in H:
        out_bytes.extend(h.to_bytes(8, 'little'))
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
    def g_func(v: List[int], a: int, b: int, c: int, d: int, x: int, y: int) -> None:
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

    b_data = data.encode('utf-8')
    H = [
        0x6b08e647, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]
    IV = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]

    blocks = []
    if not b_data:
        blocks.append(bytes(64))
    else:
        for i in range(0, len(b_data), 64):
            block = b_data[i : i + 64]
            if len(block) < 64:
                block += bytes(64 - len(block))
            blocks.append(block)

    num_blocks = len(blocks)
    for idx, block in enumerate(blocks):
        if idx == num_blocks - 1:
            t = len(b_data)
            f0 = 0xffffffff
        else:
            t = (idx + 1) * 64
            f0 = 0

        M = [int.from_bytes(block[j * 4 : (j + 1) * 4], 'little') for j in range(16)]

        V = H + IV
        V[12] ^= t & 0xffffffff
        V[13] ^= (t >> 32) & 0xffffffff
        V[14] ^= f0

        for r in range(10):
            sigma = BLAKE2_SIGMA[r]
            g_func(V, 0, 4, 8, 12, M[sigma[0]], M[sigma[1]])
            g_func(V, 1, 5, 9, 13, M[sigma[2]], M[sigma[3]])
            g_func(V, 2, 6, 10, 14, M[sigma[4]], M[sigma[5]])
            g_func(V, 3, 7, 11, 15, M[sigma[6]], M[sigma[7]])
            g_func(V, 0, 5, 10, 15, M[sigma[8]], M[sigma[9]])
            g_func(V, 1, 6, 11, 12, M[sigma[10]], M[sigma[11]])
            g_func(V, 2, 7, 8, 13, M[sigma[12]], M[sigma[13]])
            g_func(V, 3, 4, 9, 14, M[sigma[14]], M[sigma[15]])

        for i in range(8):
            H[i] ^= V[i] ^ V[i + 8]

    out_bytes = bytearray()
    for h in H:
        out_bytes.extend(h.to_bytes(4, 'little'))
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

    algorithm = input("Enter hash algorithm (or 'all' to show all): ").lower()

    if algorithm == 'all':
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
