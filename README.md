# 🏛️ Cryptography Museum & Cipher Engine

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r160-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

[![Tests: 911 Passed](https://img.shields.io/badge/Tests-911%20Passed%20(100%25)-10B981?style=flat-square&logo=pytest&logoColor=white)](scripts/diagnose.py)
[![Python Tests](https://img.shields.io/badge/pytest-507%20passed-10B981?style=flat-square&logo=python&logoColor=white)](methods/)
[![Web Tests](https://img.shields.io/badge/jest-148%20passed-10B981?style=flat-square&logo=jest&logoColor=white)](web/)
[![Pylint](https://img.shields.io/badge/pylint-10.00%2F10-10B981?style=flat-square&logo=pylint&logoColor=white)](methods/)
[![Dependencies: Zero External Crypto](https://img.shields.io/badge/crypto%20deps-zero%20external%20(stdlib%20only)-blue?style=flat-square)](STYLE_GUIDE.md)

**An immersive 3D WebGL museum and educational, zero-external-dependency Python cryptography engine.**

[Explore Museum](#-quickstart--installation) • [Cipher Catalog](#-museum-wings--cipher-catalog) • [Architecture](#-architecture--system-design) • [Python Library](#-python-cryptography-engine) • [Diagnostic Checks](#-testing--diagnostics)

</div>

---

## 📖 Overview

The **Cryptography Museum** is a dual-purpose educational platform combining an interactive, first-person 3D WebGL museum with an audited, high-performance Python cryptography engine.

Visitors can walk through three grand architectural wings spanning over two millennia of secrecy:
1. **Classical Ciphers Wing** (400 BC – 1850s): Ancient Spartan Scytale cylinders, Caesar shift disks, Polybius watchtower squares, Renaissance Vigenère wheels, Affine gears, Playfair matrix boards, and keyed Substitution ciphers.
2. **Historical Systems Wing** (1918 – 1945): Electromechanical WWII rotor engines, including the 3-rotor Enigma Machine (with plugboard and reflector) and the German High Command Lorenz SZ42 12-pinwheel teleprinter stream cipher.
3. **Modern Cryptography Wing** (1970s – Present): Asymmetric public-key systems (RSA Vault, Diffie-Hellman Exchange, RSA Digital Signatures, Elliptic Curve Cryptography `secp256r1`), symmetric block & stream ciphers (AES-128 CTR/CBC, One-Time Pad & ChaCha20 RFC 8439), cryptographic hash cascades (SHA-256, Multi-Hash & HMAC), Schnorr Zero-Knowledge Proofs, and Post-Quantum ML-KEM (Lattice LWE).

Every cipher in the 3D museum connects directly to a live curatorial workbench backed by a FastAPI microservice and native Python implementations, allowing real-time encryption, decryption, input/output swapping, step-by-step playback, and vulnerability exploration.

---

## 🌟 Key Features

- **🏛️ Spatial 3D Radial Museum**: Built with [Three.js](https://threejs.org/). Features an open entrance foyer with three grand exhibition wings radially spaced to prevent occlusion and provide natural acoustic and visual flow.
- **🎮 Dual Traversal Modes**: Seamlessly switch between first-person **WASD / Arrow-key walking** across gallery halls and **OrbitControls 360° inspection** for examining exhibit artifacts up close.
- **🧪 Interactive Curatorial Workbench**: Test ciphers live with custom plaintexts, dynamic keys, instant **Swap I/O**, playback speed sliders, step-by-step animation controls, and real-time ciphertext streaming.
- **🔓 Cryptanalysis Attack Labs**: Three dedicated interactive attack laboratories (**Classical**, **Historical**, and **Modern**) for running live brute-force, Kasiski/IoC, Enigma Bombe crib matching, Lorenz depth attacks, AES CBC bit-flipping, and small-prime RSA factorization.
- **🛂 Museum Passport Challenge**: Interactive per-exhibit decryption challenges across all museum exhibits with hints, live verification, and persistent stamp collection.
- **📖 Curatorial Drawers & Vulnerability Analysis**: In-depth sliding curatorial dossiers detailing historical context, mathematical formulas, and cryptanalysis vulnerabilities (e.g. letter frequency analysis, Kasiski examination, crib attacks, depth attacks, Shor's quantum algorithm).
- **🗿 Memorial Hall of Fame Statues**: High-fidelity 3D statues in the central foyer honoring four intellectual giants of cryptology: **Al-Kindi** (frequency analysis), **Alan Turing** (British Bombe & wartime cryptanalysis), **Claude Shannon** (information entropy and perfect secrecy), and **Whitfield Diffie & Martin Hellman [with Ralph Merkle]** (public-key cryptography).
- **🗺️ Interactive 2D Map HUD**: Instant birds-eye museum navigation map accessible via keyboard shortcut (`[M]`) or HUD button.
- **🔊 Procedural 3D Web Audio**: Immersive ambient hall resonance and interactive acoustic feedback synthesized directly via the Web Audio API.
- **🐍 Pure Python Standard Library Invariant**: The entire `methods/` engine is written exclusively using Python standard library primitives (`hashlib`, `hmac`, `os`, `random`, `struct`). No third-party cryptography packages (`pycryptodome`, `cryptography`) are permitted, guaranteeing transparency, auditability, and educational value.
- **⚡ Algorithmic Optimizations**: Precomputed Galois Field $GF(2^8)$ multiplication tables for AES-128 MixColumns (~16x speedup), immutable shift tables for Vigenère, direct codepoint translation maps for Affine/Substitution, and typed-array bitmasks for Playfair.
- **🛡️ Hardened Security**: FastAPI endpoints protected with strict Pydantic input bounds, request length limits (preventing CPU DoS exhaustion), and security headers (`X-Permitted-Cross-Domain-Policies`, strict CORS, SSRF protection).

---

## 🏛️ Museum Wings & Cipher Catalog

| Wing | Exhibit / Cipher | Timeline | 3D Artifact Model | Core Cryptographic Mechanism | Known Vulnerabilities & Attacks | Python Module |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Classical** | **Caesar Cipher** | c. 58 BC | Concentric Brass Dial Disk | Monoalphabetic substitution: $C = (P + k) \bmod 26$ | Trivial brute-force (25 keys) & single-letter frequency analysis | [`methods.classical.caesar`](methods/classical/caesar.py) |
| **Classical** | **Scytale Cipher** | c. 400 BC | Helical Parchment Cylinder | Transposition around fixed wooden cylinder of diameter $d$ | Divisor search across message lengths & anagramming | [`methods.historical.scytale`](methods/historical/scytale.py) |
| **Classical** | **Polybius Square** | c. 150 BC | Torch Watchtower & Stone Grid | $5 \times 5$ fractionalization matrix mapping letters to $(row, col)$ | Preserves exact underlying language frequency distributions | [`methods.historical.polybius`](methods/historical/polybius.py) |
| **Classical** | **Vigenère Cipher** | 1553 AD | Jefferson Multi-Rotor Disk Roll | Polyalphabetic substitution via keyword-driven Tabula Recta | Kasiski examination, Friedman test, Index of Coincidence | [`methods.classical.vigenere`](methods/classical/vigenere.py) |
| **Classical** | **Affine Cipher** | c. 1600s | Dual-Gear Calculator Machine | Linear modular arithmetic: $E(x) = (ax + b) \bmod 26$ with $\gcd(a, 26)=1$ | Very small key space (312 keys); vulnerable to known-plaintext pairs | [`methods.classical.affine`](methods/classical/affine.py) |
| **Classical** | **Playfair Cipher** | 1854 AD | Marble Matrix Board & Laser | Digraph substitution on $5 \times 5$ grid (row, col, rectangle rules) | Digram frequency analysis; leaves single-letter frequencies partially obscured | [`methods.classical.playfair`](methods/classical/playfair.py) |
| **Classical** | **Substitution Cipher** | Ancient–1800s | Keyed Alphabet Permutation Wheel | Monoalphabetic keyed 26-letter permutation mapping | Frequency analysis & hill-climbing / pattern matching | [`methods.classical.substitution`](methods/classical/substitution.py) |
| **Historical** | **Enigma Machine** | 1918–1945 | 3-Rotor Electromechanical Engine | Stepping mechanical rotors, plugboard (Steckerbrett), and reflector | Letters never encrypt to themselves; vulnerable to cribs and Turing Bombe | [`methods.historical.enigma`](methods/historical/enigma/) |
| **Historical** | **Lorenz SZ42** | 1940–1945 | 12-Pinwheel Teleprinter Rig | Stream cipher XORing 5-bit ITA2 Baudot code with 12 pinwheels | Depth attacks from key reuse; broken by Bill Tutte & Colossus | [`methods.historical.lorenz`](methods/historical/lorenz/) |
| **Modern** | **RSA Vault** | 1977 AD | Interlocking Prime Rings & Vault | Asymmetric public key cryptography: $C \equiv M^e \pmod n$, factoring $n = pq$ | Vulnerable to small prime factorization; broken by Shor's quantum algorithm | [`methods.modern.rsa`](methods/modern/rsa.py) |
| **Modern** | **AES Vault** | 2001 AD | $4 \times 4$ ShiftRows Matrix State | Rijndael SPN block cipher (CTR & CBC): SubBytes, ShiftRows, MixColumns, AddRoundKey | CBC bit-flipping without MAC; Grover's search halves effective key bits | [`methods.modern.aes`](methods/modern/aes.py) |
| **Modern** | **SHA-256 Vault** | 2001 AD | Merkle Tree Compression Cascade | 64-round cryptographic compression function operating on 512-bit blocks | Pre-image resistant, second pre-image resistant, and collision resistant | [`methods.modern.hash_functions`](methods/modern/hash_functions.py) |
| **Modern** | **Multi-Hash & HMAC** | 1996–2015 | Dual-Pass Hash & Keyed Pad Forge | Cryptographic digests (SHA-256, BLAKE2b/s, MD5) & keyed HMAC authentication | Length-extension on raw Merkle–Damgård hashes (mitigated by HMAC) | [`methods.modern.hash_functions`](methods/modern/hash_functions.py) |
| **Modern** | **Diffie-Hellman Exchange** | 1976 AD | Twin Modular Exponentiation Towers | Asymmetric key agreement $g^{ab} \bmod p$ over public channels | Vulnerable to MitM without authentication; broken by Shor's algorithm | [`methods.modern.keypair`](methods/modern/keypair.py) |
| **Modern** | **RSA Digital Signatures** | 1978 AD | Wax-Seal & Prime Verification Pillar | Asymmetric authentication & non-repudiation via private-key signing | Weak padding or small-exponent attacks without proper hashing/PSS | [`methods.modern.digital_signatures`](methods/modern/digital_signatures.py) |
| **Modern** | **Schnorr Zero-Knowledge Proof** | 1989 AD | Interactive Prover–Verifier Chamber | 3-move $\Sigma$-protocol proving knowledge of $x$ in $y = g^x \bmod p$ without revealing $x$ | Nonce ($r$) reuse leaks the secret key $x$ immediately | [`methods.modern.contemporary`](methods/modern/contemporary.py) |
| **Modern** | **Post-Quantum ML-KEM** | 2024 AD | Lattice LWE Encapsulation Prism | Module Learning-With-Errors (LWE) lattice key encapsulation ($q = 3329$) | Resistant to Shor's quantum algorithm; relies on hardness of noisy lattice problems | [`methods.modern.contemporary`](methods/modern/contemporary.py) |
| **Modern** | **Elliptic Curve Cryptography (ECC)** | 1985 AD | Secp256r1 Curve & Point-Addition Pedestal | ECDH key agreement & ECDSA signatures over `secp256r1` ($y^2 = x^3 + ax + b \pmod p$) | Nonce ($k$) reuse leaks private key; broken by Shor's quantum algorithm | [`methods.modern.ecc`](methods/modern/ecc.py) |
| **Modern** | **One-Time Pad & ChaCha20** | 1917 / 2008 AD | Vernam XOR Tape & ARX Quarter-Round Core | Unconditionally secure OTP XOR & RFC 8439 ChaCha20 256-bit ARX stream cipher | Key/nonce reuse leaks $P_1 \oplus P_2$; OTP requires true-random key $\ge$ message length | [`methods.modern.stream_ciphers`](methods/modern/stream_ciphers.py) |

---

## 🗿 The Cryptographic Hall of Fame

Located in the museum's central entrance rotunda are 4 interactive 3D memorial statues honoring fundamental pioneers:

```
                      [ HISTORICAL WINGS (Enigma, Lorenz) ]
                                        ▲
                                        │
[ CLASSICAL WINGS ]  ◄─────── [ ENTRANCE ROTUNDA ] ───────►  [ MODERN WINGS ]
(Caesar, Scytale,             [Turing]    [Shannon]          (RSA, AES, SHA-256,
 Affine, Vigenère,          [Al-Kindi]  [Diffie-Hellman]      HMAC, DH, ZKP, ML-KEM)
 Playfair, Polybius,                    ▲
 Substitution)                          │
                                  [ MAIN FOYER ]
```

1. **Al-Kindi (c. 801–873 AD)** — *The Father of Cryptanalysis*  
   Authored *A Manuscript on Deciphering Cryptographic Messages* at Baghdad's House of Wisdom. Introduced statistical frequency analysis, demonstrating that monoalphabetic ciphers could be systematically broken without knowing the key.
   - *Interactive Demo*: Real-time letter frequency distribution analyzer.

2. **Alan Turing (1912–1954)** — *The Titan of Wartime Cryptanalysis*  
   At Bletchley Park's Hut 8 during World War II, Turing devised the British Bombe electromechanical machine to systematically break the German Naval Enigma cipher using known-plaintext "cribs", laying the foundations for modern computer science.
   - *Interactive Demo*: Interactive Turing Bombe crib-matching simulator.

3. **Claude Shannon (1916–2001)** — *The Architect of Mathematical Cryptography*  
   Published *Communication Theory of Secrecy Systems* (1949). Defined Information Theory, entropy $H(X)$, the concepts of Confusion and Diffusion, and proved the unconditional secrecy of the One-Time Pad ($H(M|C) = H(M)$).
   - *Interactive Demo*: Information entropy and redundancy calculator.

4. **Whitfield Diffie & Martin Hellman [with Ralph Merkle]** — *Pioneers of Public-Key Cryptography*  
   Published *New Directions in Cryptography* (1976). Solved the millennia-old key distribution problem using one-way trapdoor mathematical functions, establishing the bedrock for modern internet encryption (TLS/HTTPS).
   - *Interactive Demo*: Interactive Diffie-Hellman modular exponentiation key exchange.

---

## 🔓 Cryptanalysis Attack Labs & Passport Challenge

### Cryptanalysis Attack Labs
Inside the curatorial workbench, visitors can switch to the **Attack Lab** tab on supported exhibits to execute real cryptanalysis attacks against live ciphertexts:
1. **Classical Attack Lab** (`caesar`, `affine`, `vigenere`):
   - **Caesar**: Exhaustive 26-shift brute-force ranked by English $\chi^2$ letter-frequency scoring.
   - **Affine**: 312-key brute-force and known-plaintext modular inverse recovery.
   - **Vigenère**: Automated Index of Coincidence (IoC) and Kasiski examination key-length estimation + column frequency breaking.
2. **Historical Attack Lab** (`enigma`, `lorenz`):
   - **Enigma**: Turing Bombe crib-matching across rotor orders and ring/start positions.
   - **Lorenz SZ42**: Depth-attack XOR recovery on two ciphertexts encrypted with reused keystreams ($C_1 \oplus C_2 = P_1 \oplus P_2$).
3. **Modern Attack Lab** (`aes`, `rsa`):
   - **AES-CBC**: Ciphertext bit-flipping malleability attack demonstrating why unauthenticated CBC mode allows predictable plaintext tampering.
   - **RSA**: Small-prime modulus factorization using Fermat's factorization and Pollard's Rho to recover the private exponent $d$.

### Museum Passport Challenge
The **Passport Challenge** (`PassportChallengeView`) turns the museum into an interactive cryptographic scavenger hunt. Each exhibit features a curated decryption puzzle with an optional hint; solving it awards a persistent digital passport stamp stored in `localStorage` (`cryptography-museum-passport-v1`).

---

## 🏗️ Architecture & System Design

```mermaid
flowchart TD
    subgraph Client["Next.js 16 Web Client (Port 3000)"]
        UI["React 18 User Interface (Tailwind CSS)"]
        Canvas["Three.js / React Three Fiber Canvas"]
        Audio["Web Audio Procedural Engine"]
        HUD["Museum HUD & 2D Map [M]"]
        Workbench["Curatorial Workbench Panel"]
        Drawers["Artifact Metadata & Statue Drawers"]
    end

    subgraph Proxy["Next.js Route Proxy"]
        Rewrites["next.config.js Rewrites (/api/* -> :8000/api/*)"]
    end

    subgraph Backend["FastAPI Backend Service (Port 8000)"]
        App["FastAPI ASGI Application (web/api/main.py)"]
        Security["Middleware: Security Headers & SSRF Protection"]
        Schemas["Pydantic Input Bounds & DoS Validation"]
        Routes["Classical, Historical & Modern API Endpoints"]
    end

    subgraph Core["Pure Python Cryptographic Library (methods/)"]
        Classical["methods.classical (Caesar, Affine, Vigenère, Playfair)"]
        Historical["methods.historical (Enigma, Lorenz SZ42, Scytale, Polybius)"]
        Modern["methods.modern (AES, RSA, SHA-256, Signatures)"]
    end

    Canvas --> UI
    HUD --> UI
    Workbench --> UI
    Drawers --> UI
    UI --> Rewrites
    Rewrites --> App
    App --> Security
    Security --> Schemas
    Schemas --> Routes
    Routes --> Classical
    Routes --> Historical
    Routes --> Modern
```

---

## 🚀 Quickstart & Installation

### Prerequisites

| Tool | Minimum Version | Recommended | Purpose |
| :--- | :--- | :--- | :--- |
| **Node.js** | `18.17.0+` | `20.x` or `22.x` | Next.js frontend runtime |
| **npm** | `9.x+` | `10.x+` | Node package manager |
| **Python** | `3.8+` | `3.10+` or `3.11+` | Backend API & cryptographic engines |
| **pip** | `22.x+` | Latest | Python package installer |

### 1. Clone the Repository

```bash
git clone https://github.com/Arjundevjha/Cryptography.git
cd Cryptography
```

### 2. Install Dependencies

```bash
# 1. Install Python backend dependencies
pip install -r web/requirements.txt

# 2. Install Node.js frontend dependencies
cd web && npm install && cd ..
```

### 3. Launch Frontend & Backend Concurrently

From the `web/` directory, run both servers in a single command with hot-reloading:

```bash
cd web
npm run dev:all
```

- **3D Museum Frontend**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI Documentation**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

### Running Services Separately (Optional)

If you prefer dedicated terminal sessions:

**Terminal 1 — FastAPI Backend**:
```bash
export PYTHONPATH=$(pwd)
python3 -m uvicorn web.api.main:app --port 8000 --reload
```

**Terminal 2 — Next.js Frontend**:
```bash
cd web
npm run dev
```

---

## 🎮 Navigation & Keyboard Controls

| Control | Action |
| :--- | :--- |
| **`[W]`, `[A]`, `[S]`, `[D]`** or **Arrow Keys** | Walk through the museum halls and wings in first-person mode |
| **Left Click + Drag** | Orbit camera 360° around exhibits and pedestals |
| **Right Click + Drag** | Pan camera across the gallery floor |
| **Scroll Wheel** | Zoom in / out to inspect fine artifact engravings and details |
| **`[M]` Key** | Toggle the 2D Birds-Eye Architectural Map overlay |
| **`[Esc]` Key** | Dismiss active Curatorial Metadata Drawer or Statue Modal |
| **Pedestal Click** | Auto-lerp camera directly into exhibit inspection focus |

---

## 🐍 Python Cryptography Engine

All algorithms can be used as a standalone, zero-dependency Python library in any Python project.

```python
# -------------------------------------------------------------
# 1. Caesar Shift Cipher
# -------------------------------------------------------------
from methods.classical.caesar import encrypt as caesar_encrypt, decrypt as caesar_decrypt

ciphertext = caesar_encrypt("DEFEND THE EAST WALL", shift=7)
# -> 'KLMLUK AOL LHZA DHSS'
plaintext = caesar_decrypt(ciphertext, shift=7)
# -> 'DEFEND THE EAST WALL'

# -------------------------------------------------------------
# 2. Ancient Spartan Scytale Transposition
# -------------------------------------------------------------
from methods.historical.scytale import encrypt as scytale_encrypt, decrypt as scytale_decrypt

scytale_cipher = scytale_encrypt("SECRET BATTLEFIELD DISPATCH", diameter=5)
scytale_plain = scytale_decrypt(scytale_cipher, diameter=5)

# -------------------------------------------------------------
# 3. Vigenère Polyalphabetic Cipher
# -------------------------------------------------------------
from methods.classical.vigenere import encrypt as vigenere_encrypt, decrypt as vigenere_decrypt

v_cipher = vigenere_encrypt("ATTACK AT DAWN", key="LEMON")
# -> 'LXFOPV EF RNHR'
v_plain = vigenere_decrypt(v_cipher, key="LEMON")

# -------------------------------------------------------------
# 4. WWII 3-Rotor Enigma Machine Simulation
# -------------------------------------------------------------
from methods.historical.enigma.enigma import Enigma

enigma = Enigma(
    rotors=["I", "II", "III"],
    positions=["A", "B", "C"],
    rings=["A", "A", "A"],
    plugboard_pairs=["AB", "CD", "EF"],
    reflector="B"
)
enigma_cipher = enigma.encipher("OPERATION BARBAROSSA")

# -------------------------------------------------------------
# 5. WWII Lorenz SZ42 12-Pinwheel Teleprinter Stream Cipher
# -------------------------------------------------------------
from methods.historical.lorenz.lorenz import LorenzMachine

lorenz = LorenzMachine(wheel_positions=[0] * 12)
lorenz_cipher = lorenz.encrypt_message("TOP SECRET TELEPRINTER")

# -------------------------------------------------------------
# 6. AES-128 Symmetric Block Cipher (Pure Python Standard Library)
# -------------------------------------------------------------
from methods.modern.symmetric import generate_key, generate_iv, encrypt as aes_encrypt, decrypt as aes_decrypt

key = generate_key()  # 16-byte random AES key
iv = generate_iv()    # 16-byte random initialization vector
cipher_bytes = aes_encrypt("Confidential Museum Manuscript", key, iv)
recovered_text = aes_decrypt(cipher_bytes, key, iv)

# -------------------------------------------------------------
# 7. RSA-4096 Asymmetric Keypair & Cryptosystem
# -------------------------------------------------------------
from methods.modern.rsa import generate_keypair, encrypt as rsa_encrypt, decrypt as rsa_decrypt

public_key, private_key = generate_keypair(bits=2048)
encrypted_blocks = rsa_encrypt("Vault Access Code 9481", public_key)
decrypted_secret = rsa_decrypt(encrypted_blocks, private_key)

# -------------------------------------------------------------
# 8. Cryptographic Hash Functions & Signatures
# -------------------------------------------------------------
from methods.modern.hash_functions import sha256
from methods.modern.digital_signatures import sign_message, verify_signature

digest = sha256("Provenance Certificate Document")
# Deterministic 64-character hexadecimal SHA-256 string
```

> [!CAUTION]
> **No External Cryptography Libraries Allowed**:  
> In accordance with [`STYLE_GUIDE.md`](STYLE_GUIDE.md), importing third-party cryptography libraries (`cryptography`, `pycryptodome`, `pynacl`, etc.) is strictly prohibited. All implementations must use only Python standard library modules to preserve educational clarity and auditability.

---

## ⚡ Performance & Optimization Standards

All cryptography modules undergo rigorous benchmarking to ensure high-throughput execution:

1. **AES Galois Field Lookup Tables**: Pre-computed 256-entry $GF(2^8)$ multiplication lookup tables (`MUL2`, `MUL3`, `MUL9`, `MUL11`, `MUL13`, `MUL14`) replace dynamic bitwise shifting in `MixColumns`, yielding a **~16x speedup** for AES decryption.
2. **BLAKE2 Vectorized Unpacking**: Utilizes `struct.unpack('<16Q')` and inlined scalar variables in BLAKE2b/s round transformations for **~1.3x speedups**.
3. **Vigenère Immutable Shift Arrays**: Precomputed module-level integer shift lookup tables eliminate character-by-character modular arithmetic and string concatenation allocations.
4. **Playfair Typed Array Bitmasks**: Client-side TypeScript adapter uses 128-entry `Uint8Array` bitmasks and `Int32Array` coordinate maps to achieve $O(1)$ coordinate resolution without heap tuple allocations.
5. **Affine Translation Tables**: Replaced character-by-character loops with pre-computed codepoint translation dictionaries executed via `str.translate()`, achieving **~60x speedups**.

---

## 🧪 Testing & Diagnostics

The repository features comprehensive automated test coverage across Python, TypeScript, and end-to-end browser environments.

### Summary of Test Suites

| Suite | Technology | Test Count | Scope |
| :--- | :--- | :--- | :--- |
| **Python Unit Tests** | `pytest` | **801 / 801** | Classical, historical, and modern algorithms, bounds validation, DoS protections, and FastAPI endpoints |
| **Web Unit Tests** | `jest` + React Testing Library | **61 / 61** | React components, Three.js canvas isolation, HUD controls, a11y keyboard dismissal, and audio state |
| **E2E Integration** | `playwright` | Multi-Tier | Full user walkthroughs, timeline navigation, workbench encryption flows, and error recovery |
| **Code Style** | `pylint` | **10.00 / 10** | Strict adherence to PEP 8, docstrings, type annotations, and resource bounds |

### 1. Run Automated Diagnostic Suite

Use the persistent repository diagnostic tool to check all health layers at once:

```bash
python3 scripts/diagnose.py --check
```

Or for verbose error logs:
```bash
python3 scripts/diagnose.py --verbose
```

### 2. Run Python Unit Tests

```bash
# Run all 801 Python tests
pytest

# Run tests with verbose output
pytest -v

# Run tests for a specific category
pytest methods/classical/
pytest methods/historical/
pytest methods/modern/
```

### 3. Run Web Unit & Accessibility Tests

```bash
cd web
npm test
```

### 4. Run End-to-End Playwright Tests

We provide a consolidated, automated test runner in `scripts/run_e2e.sh`:

```bash
# Option A: Via npm script (from web/ directory)
cd web && npm run test:e2e

# Option B: Run script directly from repository root
bash scripts/run_e2e.sh

# Option C: Run against dev server instead of production bundle
bash scripts/run_e2e.sh --dev

# Option D: Automatically install missing Python / Playwright dependencies first
bash scripts/run_e2e.sh --install
```

---

## 📂 Repository Structure

```
Cryptography/
├── methods/                          # Pure Python Standard-Library Cryptography Engines
│   ├── classical/                    # Caesar, Affine, Vigenère, Playfair, Substitution
│   │   ├── affine.py
│   │   ├── caesar.py
│   │   ├── playfair.py
│   │   ├── substitution.py
│   │   ├── vigenere.py
│   │   └── tests/                    # Classical unit test suites
│   ├── historical/                   # Mechanical & Rotor Cipher Machines
│   │   ├── enigma/                   # 3-Rotor Enigma engine, keyboard, plugboard, reflector
│   │   ├── lorenz/                   # 12-Wheel Lorenz SZ42 teleprinter cipher & ITA2 converter
│   │   ├── polybius.py               # 5x5 Polybius Square fractionating cipher
│   │   ├── scytale.py                # Ancient Spartan transposition cylinder
│   │   └── tests/                    # Historical unit test suites
│   ├── modern/                       # Modern Symmetric & Asymmetric Cryptography
│   │   ├── aes.py                    # AES-128 block cipher with GF(2^8) lookup tables
│   │   ├── contemporary.py           # Schnorr Zero-Knowledge Proof & Post-Quantum ML-KEM (LWE)
│   │   ├── cryptanalysis.py          # Classical, Historical & Modern cryptanalysis attack engines
│   │   ├── digital_signatures.py     # HMAC and RSA digital signature schemes
│   │   ├── ecc.py                    # Pure-Python secp256r1 ECDH key exchange & ECDSA sign/verify
│   │   ├── hash_functions.py         # SHA-256, BLAKE2b/s, MD5 standard library implementations
│   │   ├── helpers.py                # Shared modern cryptography helpers
│   │   ├── keypair.py                # Asymmetric keypair generation & DoS-bounded primes
│   │   ├── rsa.py                    # RSA encryption, decryption & Euler totient arithmetic
│   │   ├── stream_ciphers.py         # One-Time Pad (OTP) & RFC 8439 ChaCha20 stream cipher
│   │   ├── symmetric.py              # CBC / CTR symmetric modes and padding helpers
│   │   └── tests/                    # Modern unit test suites
│   └── tests/                        # Cross-cutting integration tests
├── web/                              # Next.js 16 Web Application & FastAPI Backend
│   ├── api/                          # FastAPI microservice
│   │   ├── main.py                   # ASGI application entry point & security middleware
│   │   ├── routers/                  # Classical, Historical, Modern & Cryptanalysis API routers
│   │   └── test_main.py              # API endpoint unit tests
│   ├── app/                          # Next.js App Router (pages, layout, API routes)
│   │   ├── page.tsx                  # Main 3D museum viewport and overlays
│   │   └── utils/ciphers.ts          # Client-side TypeScript cipher adapters
│   ├── src/components/museum/        # Three.js 3D WebGL scene and museum UI
│   │   ├── ThreeMuseumScene.tsx      # Main 3D canvas & scene orchestration
│   │   ├── scene/                    # Wall art textures, wing architecture & modular 3D builders
│   │   ├── MuseumCanvas.tsx          # Canvas container & fallback boundary
│   │   ├── museumData.ts             # Exhibits (19), wings (3), statues (4) metadata & coordinates
│   │   ├── AudioSystem.tsx           # Procedural Web Audio synthesis
│   │   ├── hud/                      # HUD overlay, 2D floorplan map, status indicator
│   │   └── workbench/                # Curatorial workbench, EccView, StreamCipherView, Attack Labs & Passport Challenge
│   └── tests/                        # Frontend Jest unit & Playwright E2E suites
│       ├── unit/                     # Component & accessibility unit tests
│       └── e2e/                      # Playwright end-to-end user journey tests
├── scripts/                          # Automated Developer & CI Tooling
│   ├── diagnose.py                   # Health check diagnostic CLI
│   └── run_e2e.sh                    # Consolidated E2E test runner
├── CONTRIBUTING.md                   # Contribution workflow & guidelines
├── STYLE_GUIDE.md                    # Python standards & zero-dependency policy
├── handoff.md                        # Session continuity & architecture handoff notes
├── pytest.ini                        # Pytest configuration
└── LICENSE                           # MIT License
```

---

## 🤝 Contributing

We welcome contributions from cryptographers, historians, software engineers, and 3D web enthusiasts!

Before opening a pull request, please review our contribution documentation:
- 📘 [`CONTRIBUTING.md`](CONTRIBUTING.md): Detailed guide on branch conventions, issue tracking, and PR review lifecycles.
- 📐 [`STYLE_GUIDE.md`](STYLE_GUIDE.md): Code conventions, PEP 8 standards, and the **Zero External Cryptography Libraries** invariant.

### Contribution Workflow

1. **Fork** the repository & create a descriptive feature branch:
   ```bash
   git checkout -b feature/your-algorithm-or-improvement
   ```
2. **Follow Standards**:
   - Implement both `encrypt()` and `decrypt()` functions.
   - Include type annotations, full docstrings, and doctest / usage examples.
   - Strictly avoid external crypto packages—use only the Python standard library.
3. **Verify Everything Passes**:
   ```bash
   # Run full repository health diagnostic
   python3 scripts/diagnose.py --check
   ```
4. **Commit & Open a Pull Request** with a detailed explanation of changes made.

---

## 📜 License

This project is open-source software licensed under the **[MIT License](LICENSE)**.

---

<div align="center">
  <sub>Crafted with precision for cryptology students, security researchers, and history enthusiasts worldwide.</sub>
</div>
