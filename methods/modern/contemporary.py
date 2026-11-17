"""Contemporary and Post-Quantum cryptography demonstrations in pure Python.

Includes:
1. Interactive Schnorr Zero-Knowledge Proof (commitment, challenge, response, verification).
2. Conceptual ML-KEM / Lattice LWE Key-Encapsulation Mechanism (keygen, encapsulate, decapsulate).
"""

import secrets

try:
    from .helpers import sha256
    from .keypair import is_prime
except ImportError:
    from helpers import sha256
    from keypair import is_prime

# Safe-prime Schnorr subgroup defaults: p = 2*q + 1, g has order q mod p.
SCHNORR_DEFAULT_P = 467
SCHNORR_DEFAULT_Q = 233
SCHNORR_DEFAULT_G = 4

# Toy ML-KEM / LWE parameters (uses the real ML-KEM prime modulus q = 3329).
MLKEM_DEFAULT_Q = 3329
MLKEM_DEFAULT_N = 4
MLKEM_DEFAULT_NOISE_BOUND = 2


def validate_schnorr_params(p: int, q: int, g: int) -> None:
    """Validate Schnorr group parameters (p, q, g)."""
    for name, val in (("p", p), ("q", q), ("g", g)):
        if not isinstance(val, int) or isinstance(val, bool):
            raise TypeError(f"{name} must be an integer")
    if p < 5 or not is_prime(p):
        raise ValueError("p must be a prime >= 5")
    if q < 2 or not is_prime(q):
        raise ValueError("q must be a prime >= 2")
    if (p - 1) % q != 0:
        raise ValueError("q must divide p - 1")
    if not (2 <= g < p):
        raise ValueError("g must satisfy 2 <= g < p")
    if pow(g, q, p) != 1:
        raise ValueError("g must generate a subgroup of order q modulo p (g^q mod p == 1)")


def schnorr_public_key(
    secret_x: int,
    p: int = SCHNORR_DEFAULT_P,
    q: int = SCHNORR_DEFAULT_Q,
    g: int = SCHNORR_DEFAULT_G,
) -> int:
    """Compute Schnorr public key y = g^x mod p."""
    validate_schnorr_params(p, q, g)
    if not isinstance(secret_x, int) or isinstance(secret_x, bool) or not (1 <= secret_x < q):
        raise ValueError(f"secret_x must be an integer in [1, {q - 1}]")
    return pow(g, secret_x, p)


def schnorr_commit(
    r: int | None = None,
    p: int = SCHNORR_DEFAULT_P,
    q: int = SCHNORR_DEFAULT_Q,
    g: int = SCHNORR_DEFAULT_G,
) -> tuple[int, int]:
    """Prover step 1: choose random nonce r in [1, q-1] and compute commitment t = g^r mod p."""
    validate_schnorr_params(p, q, g)
    if r is None:
        r_val = secrets.randbelow(q - 1) + 1
    else:
        if not isinstance(r, int) or isinstance(r, bool) or not (1 <= r < q):
            raise ValueError(f"r must be an integer in [1, {q - 1}]")
        r_val = r
    t_val = pow(g, r_val, p)
    return r_val, t_val


def schnorr_challenge(c: int | None = None, q: int = SCHNORR_DEFAULT_Q) -> int:
    """Verifier step 2: generate or validate challenge c in [0, q-1]."""
    if not isinstance(q, int) or isinstance(q, bool) or q < 2:
        raise ValueError("q must be an integer >= 2")
    if c is None:
        return secrets.randbelow(q)
    if not isinstance(c, int) or isinstance(c, bool) or not (0 <= c < q):
        raise ValueError(f"c must be an integer in [0, {q - 1}]")
    return c


def schnorr_respond(
    r: int,
    c: int,
    secret_x: int,
    q: int = SCHNORR_DEFAULT_Q,
) -> int:
    """Prover step 3: compute response s = (r + c * x) mod q."""
    if not isinstance(q, int) or isinstance(q, bool) or q < 2:
        raise ValueError("q must be an integer >= 2")
    if not isinstance(r, int) or isinstance(r, bool) or not (1 <= r < q):
        raise ValueError(f"r must be an integer in [1, {q - 1}]")
    if not isinstance(c, int) or isinstance(c, bool) or not (0 <= c < q):
        raise ValueError(f"c must be an integer in [0, {q - 1}]")
    if not isinstance(secret_x, int) or isinstance(secret_x, bool) or not (1 <= secret_x < q):
        raise ValueError(f"secret_x must be an integer in [1, {q - 1}]")
    return (r + c * secret_x) % q


def schnorr_verify(
    t: int,
    c: int,
    s: int,
    y: int,
    p: int = SCHNORR_DEFAULT_P,
    q: int = SCHNORR_DEFAULT_Q,
    g: int = SCHNORR_DEFAULT_G,
) -> dict[str, int | bool]:
    """Verifier step 4: check g^s mod p == (t * y^c) mod p."""
    validate_schnorr_params(p, q, g)
    for name, val in (("t", t), ("y", y)):
        if not isinstance(val, int) or isinstance(val, bool) or not (1 <= val < p):
            raise ValueError(f"{name} must be an integer in [1, {p - 1}]")
    if not isinstance(c, int) or isinstance(c, bool) or not (0 <= c < q):
        raise ValueError(f"c must be an integer in [0, {q - 1}]")
    if not isinstance(s, int) or isinstance(s, bool) or not (0 <= s < q):
        raise ValueError(f"s must be an integer in [0, {q - 1}]")

    lhs = pow(g, s, p)
    rhs = (t * pow(y, c, p)) % p
    return {
        "valid": lhs == rhs,
        "lhs": lhs,
        "rhs": rhs,
    }


def _sample_small_noise(length: int, bound: int) -> list[int]:
    """Sample a vector of small signed integers in [-bound, bound]."""
    if bound == 0:
        return [0] * length
    span = 2 * bound + 1
    return [secrets.randbelow(span) - bound for _ in range(length)]


def _mat_vec_mul(mat: list[list[int]], vec: list[int], q: int) -> list[int]:
    """Multiply matrix (rows x cols) by vector mod q."""
    return [sum(row[j] * vec[j] for j in range(len(vec))) % q for row in mat]


def _vec_dot(a: list[int], b: list[int], q: int) -> int:
    """Compute inner product of two vectors mod q."""
    return sum(a[i] * b[i] for i in range(len(a))) % q


def _derive_shared_secret_hex(bit: int) -> str:
    """Derive a 256-bit hex shared secret from the encapsulated bit."""
    return sha256(f"mlkem-demo-bit:{bit}".encode("utf-8")).hex()


def _validate_mlkem_params(n: int, q: int, noise_bound: int) -> None:
    if not isinstance(n, int) or isinstance(n, bool) or not (2 <= n <= 8):
        raise ValueError("Lattice dimension n must be an integer between 2 and 8")
    if not isinstance(q, int) or isinstance(q, bool) or not (17 <= q <= 65537) or not is_prime(q):
        raise ValueError("Modulus q must be a prime integer between 17 and 65537")
    if not isinstance(noise_bound, int) or isinstance(noise_bound, bool) or not (0 <= noise_bound <= 500):
        raise ValueError("noise_bound must be an integer between 0 and 500")


def mlkem_keygen(
    n: int = MLKEM_DEFAULT_N,
    q: int = MLKEM_DEFAULT_Q,
    noise_bound: int = MLKEM_DEFAULT_NOISE_BOUND,
) -> dict:
    """Generate a conceptual LWE / ML-KEM keypair: t = (A * s + e) mod q."""
    _validate_mlkem_params(n, q, noise_bound)
    matrix_a = [[secrets.randbelow(q) for _ in range(n)] for _ in range(n)]
    secret_s = _sample_small_noise(n, noise_bound)
    error_e = _sample_small_noise(n, noise_bound)
    a_s = _mat_vec_mul(matrix_a, secret_s, q)
    public_t = [(a_s[i] + error_e[i]) % q for i in range(n)]
    return {
        "q": q,
        "n": n,
        "noise_bound": noise_bound,
        "A": matrix_a,
        "s": secret_s,
        "e": error_e,
        "t": public_t,
    }


def mlkem_encapsulate(
    matrix_a: list[list[int]],
    public_t: list[int],
    message_bit: int | None = None,
    q: int = MLKEM_DEFAULT_Q,
    noise_bound: int = MLKEM_DEFAULT_NOISE_BOUND,
) -> dict:
    """Encapsulate a secret bit under public key (A, t) with fresh LWE noise."""
    n = len(public_t)
    _validate_mlkem_params(n, q, noise_bound)
    if len(matrix_a) != n or any(len(row) != n for row in matrix_a):
        raise ValueError(f"Matrix A must be {n}x{n}")
    if message_bit is None:
        m_bit = secrets.randbelow(2)
    else:
        if not isinstance(message_bit, int) or isinstance(message_bit, bool) or message_bit not in (0, 1):
            raise ValueError("message_bit must be 0 or 1")
        m_bit = message_bit

    r_vec = _sample_small_noise(n, noise_bound)
    e1_vec = _sample_small_noise(n, noise_bound)
    e2_val = _sample_small_noise(1, noise_bound)[0]

    # A^T * r + e1 mod q
    a_transpose = [[matrix_a[j][i] for j in range(n)] for i in range(n)]
    at_r = _mat_vec_mul(a_transpose, r_vec, q)
    u_vec = [(at_r[i] + e1_vec[i]) % q for i in range(n)]

    # v = t^T * r + e2 + round(q/2) * m mod q
    half_q = q // 2
    v_val = (_vec_dot(public_t, r_vec, q) + e2_val + half_q * m_bit) % q

    return {
        "r": r_vec,
        "e1": e1_vec,
        "e2": e2_val,
        "u": u_vec,
        "v": v_val,
        "message_bit": m_bit,
        "shared_secret_hex": _derive_shared_secret_hex(m_bit),
    }


def mlkem_decapsulate(
    secret_s: list[int],
    u_vec: list[int],
    v_val: int,
    q: int = MLKEM_DEFAULT_Q,
) -> dict:
    """Decapsulate ciphertext (u, v) using secret vector s."""
    n = len(secret_s)
    if len(u_vec) != n:
        raise ValueError("u vector length must match secret_s length")
    if not isinstance(q, int) or isinstance(q, bool) or q < 17:
        raise ValueError("q must be an integer >= 17")

    noisy_diff = (v_val - _vec_dot(secret_s, u_vec, q)) % q
    # Centered representation in (-q/2, q/2]
    centered_diff = noisy_diff - q if noisy_diff > q // 2 else noisy_diff
    # Distance to 0 vs distance to q/2 (or -q/2)
    dist_to_zero = abs(centered_diff)
    dist_to_half = abs(abs(centered_diff) - (q // 2))
    recovered_bit = 1 if dist_to_half < dist_to_zero else 0

    return {
        "noisy_diff": noisy_diff,
        "centered_diff": centered_diff,
        "recovered_bit": recovered_bit,
        "shared_secret_hex": _derive_shared_secret_hex(recovered_bit),
    }


def mlkem_demo(
    n: int = MLKEM_DEFAULT_N,
    q: int = MLKEM_DEFAULT_Q,
    noise_bound: int = MLKEM_DEFAULT_NOISE_BOUND,
    message_bit: int | None = None,
) -> dict:
    """Run a complete conceptual ML-KEM keygen -> encapsulate -> decapsulate demo."""
    keys = mlkem_keygen(n=n, q=q, noise_bound=noise_bound)
    encap = mlkem_encapsulate(
        keys["A"],
        keys["t"],
        message_bit=message_bit,
        q=q,
        noise_bound=noise_bound,
    )
    decap = mlkem_decapsulate(keys["s"], encap["u"], encap["v"], q=q)
    return {
        "q": q,
        "n": n,
        "noise_bound": noise_bound,
        "public_key": {"A": keys["A"], "t": keys["t"]},
        "secret_key": {"s": keys["s"], "e": keys["e"]},
        "ciphertext": {"u": encap["u"], "v": encap["v"]},
        "encapsulation": {
            "r": encap["r"],
            "e1": encap["e1"],
            "e2": encap["e2"],
            "message_bit": encap["message_bit"],
            "shared_secret_hex": encap["shared_secret_hex"],
        },
        "decapsulation": decap,
        "match": decap["recovered_bit"] == encap["message_bit"],
    }
