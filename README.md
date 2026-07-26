# 🏛️ Cryptography Museum & Python Core Library

> An interactive 3D WebGL Cryptography Museum, FastAPI microservice suite, and comprehensive Python cryptographic library—spanning ancient classical ciphers to WWII rotor machines and modern asymmetric encryption.

---

## 🌟 Core Pillars

### 1. 🎨 3D WebGL Interactive Museum (`web/src/components/museum`)
- **Radial Exhibit Pavilions**: Explore three curated wings (Classical, Historical Systems, Modern Cryptography) arranged radially around a central monument atrium.
- **Custom 3D Display Case Artifacts**: Each cipher features a bespoke, mathematically & historically accurate 3D model (e.g. Caesar Concentric Disk, Lorenz 12-Rotor Teleprinter, Affine Dual-Gear Machine, Playfair Digraph Laser Board, SHA-256 Merkle Cascade).
- **Smooth OrbitControls & Camera Flights**: Cinematic camera flight transitions between exhibit rooms with auto-lerping interruption on drag.
- **Interactive Workbench Controls**: Live parameter adjustment panels for encryption, decryption, rotor settings, key matrices, and hash generation.
- **Top-Side Inspection Macro View**: Close-up inspection mode with curatorial drawer metadata and spatial audio synthesis.

### 2. ⚡ FastAPI REST Microservice (`web/api/main.py`)
- Real-time endpoints for all 11 ciphers (`/api/caesar`, `/api/affine`, `/api/vigenere`, `/api/playfair`, `/api/polybius`, `/api/scytale`, `/api/enigma`, `/api/lorenz`, `/api/rsa`, `/api/aes`, `/api/sha256`).
- Automatic OpenAPI documentation (`/api/docs`).
- Vercel serverless prefix handling (`VercelPathMiddleware`) and strict input length validation.

### 3. 🐍 Python Cryptographic Engine (`methods/`)
- Pure Python implementations built for learning, research, and cryptographic analysis.
- Includes complex emulators like the **WWII Enigma Machine** (rotors, plugboard, reflector) and the **Lorenz SZ42 Teleprinter Stream Cipher** (12-pinwheel $\chi$, $\mu$, $\psi$ stepping system).

---

## 🏛️ Exhibit Roster & 3D Artifact Metaphors

| Wing | Exhibit | 3D Artifact Representation | Key Cryptographic Concept |
| :--- | :--- | :--- | :--- |
| **Classical** | **Caesar Cipher** | Mechanical Concentric Dial Disk | Monoalphabetic letter shift |
| **Classical** | **Scytale Cipher** | Spartan Helical Parchment Cylinder | Transposition ribbon winding |
| **Classical** | **Affine Cipher** | Dual-Gear Mathematical Machine | Modular linear transformation $E(x) = (ax + b) \bmod 26$ |
| **Classical** | **Vigenère Cipher** | Jefferson Disk Multi-Rotor Roll | Polyalphabetic key phrase shift |
| **Classical** | **Playfair Cipher** | 5x5 Matrix Board with Digraph Laser | Digraph substitution pairs |
| **Classical** | **Polybius Square** | Greek Watchtower Torch Fortress | Grid coordinate substitution |
| **Historical** | **Enigma Machine** | 3-Rotor Electromechanical Engine | Stepping mechanical rotors & plugboard |
| **Historical** | **Lorenz SZ42** | 12-Pinwheel Teleprinter Attachment | 5-bit ITA2 Baudot stream cipher ($\chi$, $\mu$, $\psi$ wheels) |
| **Modern** | **RSA Vault** | Asymmetric Interlocking Prime Rings & Glass Lock | Public key & prime factorization $n = p \cdot q$ |
| **Modern** | **AES Vault** | 128-bit State Matrix ShiftRows Core | 4x4 offset glowing glass byte cubes |
| **Modern** | **SHA-256 Vault** | Merkle Tree Compression Cascade | Tiered cryptographic hash digest |

---

## 📂 Repository Structure

```
Cryptography/
├── methods/                      # Core Python Cryptographic Engine
│   ├── classical/                # Caesar, Affine, Vigenère, Playfair, Substitution
│   ├── historical/               # Historical Encryption Machines
│   │   ├── enigma/               # WWII Enigma Machine emulator (Rotors, Plugboard, Reflector)
│   │   ├── lorenz/               # WWII Lorenz SZ42 12-wheel teleprinter stream cipher
│   │   ├── polybius.py           # Polybius square grid cipher
│   │   └── scytale.py            # Spartan transposition scytale
│   ├── modern/                   # AES, RSA, Hash Functions, Digital Signatures
│   └── tests/                    # 231 Pytest backend unit tests
├── web/                          # Next.js 3D WebGL Frontend & FastAPI Backend
│   ├── api/                      # FastAPI REST Microservices (`main.py`)
│   ├── src/
│   │   ├── app/                  # Next.js App Router & main exhibit page
│   │   └── components/museum/   # Three.js 3D scene, HUD, Workbench, Spatial Audio
│   ├── tests/                    # Jest component tests & Playwright E2E tests
│   └── package.json              # NPM scripts and dependencies
├── handoff.md                    # Active session handoff & technical state
├── run_e2e_tests.sh              # Full automated E2E setup and test runner script
└── pytest.ini                    # Pytest configuration
```

---

## 🚀 Quick Start

### 🌐 Running Web Application & API (Recommended)

From the `web/` directory, launch both the Next.js 3D WebGL frontend (port 3000) and the FastAPI backend (port 8000) concurrently:

```bash
cd web

# Development Mode (Hot-Reloading for Frontend + Backend)
npm run dev:all

# Production Build & Start
npm run start:all
```

Then navigate to `http://localhost:3000` in your browser.

---

### 🐍 Using Python Core Engine

```python
# 1. Caesar Shift Cipher
from methods.classical.caesar import encrypt, decrypt
ciphertext = encrypt("HELLOMUSEUM", shift=5)
plaintext = decrypt(ciphertext, shift=5)

# 2. Lorenz SZ42 12-Wheel Machine
from methods.historical.lorenz.lorenz import LorenzMachine
lorenz = LorenzMachine(wheel_positions=[0]*12)
cipher_bits = lorenz.encrypt_message("SECRET DATA")

# 3. Modern AES-256 Encryption
from methods.modern.symmetric import generate_key, generate_iv, encrypt, decrypt
key, iv = generate_key(), generate_iv()
ciphertext = encrypt("Confidential Payload", key, iv)
```

---

## 🧪 Testing & Quality Assurance

This repository maintains test coverage across the Python backend, Next.js frontend, and end-to-end user flows.

```bash
# 1. Python Unit Tests (231 tests passing)
pytest

# 2. Next.js Jest Component Tests (30 tests passing)
cd web && npm test

# 3. Full Automated E2E Test Suite (FastAPI + Next.js + Playwright)
./run_e2e_tests.sh
```

---

## 🔒 Security & Quality Compliance

- **Snyk SAST**: Scanned with zero security vulnerabilities.
- **Fallow Audit**: Clean code with zero dead exports or unused dependencies.
- **SSRF Prevention**: Next.js rewrite handlers utilize absolute destination URLs without relying on client-supplied headers.

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
