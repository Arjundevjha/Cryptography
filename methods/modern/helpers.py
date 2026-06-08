"""Helper cryptographic utilities in pure Python.

Contains manual implementations of Base64, SHA-256, and HMAC-SHA256.
No external libraries are used.
"""

BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
H_INIT = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]
K_CONSTANTS = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]

def b64encode(data: bytes) -> str:
    """Encode bytes to a Base64 string."""
    res = []
    for i in range(0, len(data), 3):
        chunk = data[i : i + 3]
        pad_len = 3 - len(chunk)
        val = 0
        for b in chunk:
            val = (val << 8) | b
        val <<= (8 * pad_len)

        idx_0 = (val >> 18) & 0x3F
        idx_1 = (val >> 12) & 0x3F
        idx_2 = (val >> 6) & 0x3F
        idx_3 = val & 0x3F

        res.append(BASE64_CHARS[idx_0])
        res.append(BASE64_CHARS[idx_1])
        res.append("=" if pad_len > 1 else BASE64_CHARS[idx_2])
        res.append("=" if pad_len > 0 else BASE64_CHARS[idx_3])
    return "".join(res)

def b64decode(data_str: str) -> bytes:
    """Decode a Base64 string to bytes."""
    if not (clean_str := data_str.strip().replace("\n", "").replace("\r", "").replace(" ", "")):
        return b""
    pad_len = clean_str.count("=")
    clean_str = clean_str.replace("=", "A")

    res = bytearray()
    for i in range(0, len(clean_str), 4):
        chunk = clean_str[i : i + 4]
        val = 0
        for char in chunk:
            val = (val << 6) | BASE64_CHARS.index(char)

        b_0 = (val >> 16) & 0xFF
        b_1 = (val >> 8) & 0xFF
        b_2 = val & 0xFF

        res.append(b_0)
        res.append(b_1)
        res.append(b_2)

    if pad_len > 0:
        return bytes(res[:-pad_len])
    return bytes(res)

def rotr(val: int, shift: int) -> int:
    """Rotate right a 32-bit integer by shift bits."""
    return ((val >> shift) | (val << (32 - shift))) & 0xFFFFFFFF

def shr(val: int, shift: int) -> int:
    """Shift right a 32-bit integer by shift bits."""
    return val >> shift

def ch_func(x: int, y: int, z: int) -> int:
    """Choose function for SHA-256."""
    return (x & y) ^ (~x & z)

def maj_func(x: int, y: int, z: int) -> int:
    """Majority function for SHA-256."""
    return (x & y) ^ (x & z) ^ (y & z)

def sigma_0_upper(x: int) -> int:
    """Sigma 0 uppercase function for SHA-256."""
    return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22)

def sigma_1_upper(x: int) -> int:
    """Sigma 1 uppercase function for SHA-256."""
    return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25)

def sigma_0_lower(x: int) -> int:
    """Sigma 0 lowercase function for SHA-256."""
    return rotr(x, 7) ^ rotr(x, 18) ^ shr(x, 3)

def sigma_1_lower(x: int) -> int:
    """Sigma 1 lowercase function for SHA-256."""
    return rotr(x, 17) ^ rotr(x, 19) ^ shr(x, 10)

def sha256(data: bytes) -> bytes:
    """Compute SHA-256 hash of bytes."""
    bit_len = len(data) * 8
    padded = bytearray(data)
    padded.append(0x80)

    # Compute padding length mathematically (avoid while loop)
    pad_len = (56 - (len(data) + 1) % 64) % 64
    padded.extend(b'\x00' * pad_len)
    padded.extend(bit_len.to_bytes(8, byteorder='big'))

    h = list(H_INIT)

    for chunk_idx in range(0, len(padded), 64):
        chunk = padded[chunk_idx : chunk_idx + 64]
        w = [0] * 64
        for i in range(16):
            w[i] = int.from_bytes(chunk[i*4 : i*4 + 4], byteorder='big')
        for i in range(16, 64):
            w[i] = (sigma_1_lower(w[i-2]) + w[i-7] + sigma_0_lower(w[i-15]) + w[i-16]) & 0xFFFFFFFF

        state = list(h)

        for i in range(64):
            val_s1 = sigma_1_upper(state[4])
            val_ch = ch_func(state[4], state[5], state[6])
            t_1 = (state[7] + val_s1 + val_ch + K_CONSTANTS[i] + w[i]) & 0xFFFFFFFF
            t_2 = (sigma_0_upper(state[0]) + maj_func(state[0], state[1], state[2])) & 0xFFFFFFFF

            state[7] = state[6]
            state[6] = state[5]
            state[5] = state[4]
            state[4] = (state[3] + t_1) & 0xFFFFFFFF
            state[3] = state[2]
            state[2] = state[1]
            state[1] = state[0]
            state[0] = (t_1 + t_2) & 0xFFFFFFFF

        for j in range(8):
            h[j] = (h[j] + state[j]) & 0xFFFFFFFF

    return b"".join(val.to_bytes(4, byteorder='big') for val in h)

def hmac_sha256(key: bytes, data: bytes) -> bytes:
    """Compute HMAC-SHA256 signature of data using key."""
    block_size = 64
    k_key = key
    if len(k_key) > block_size:
        k_key = sha256(k_key)
    if len(k_key) < block_size:
        k_key += b'\x00' * (block_size - len(k_key))

    ipad = bytes(x ^ 0x36 for x in k_key)
    opad = bytes(x ^ 0x5c for x in k_key)

    inner = sha256(ipad + data)
    return sha256(opad + inner)
