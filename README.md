# Cryptography Museum & Library

An interactive 3D WebGL museum and Python library for exploring classical, historical, and modern cryptographic algorithms.

The project combines three main components:
- **Interactive 3D WebGL Museum**: A Next.js application built with Three.js featuring radial exhibit rooms, 3D display case models, live cipher workbench controls, and spatial audio.
- **FastAPI Backend**: Microservice endpoints for encryption, decryption, and hashing algorithms with OpenAPI documentation (`/api/docs`).
- **Python Cipher Engines**: Modular implementations of classical ciphers, historical rotor machines (Enigma, Lorenz SZ42), and modern cryptographic algorithms (AES, RSA, SHA-256).

---

## Supported Ciphers

| Category | Cipher | 3D Exhibit Model | Python Module |
| :--- | :--- | :--- | :--- |
| **Classical** | Caesar | Concentric Dial Disk | `methods.classical.caesar` |
| **Classical** | Scytale | Helical Parchment Cylinder | `methods.historical.scytale` |
| **Classical** | Affine | Dual-Gear Calculator Machine | `methods.classical.affine` |
| **Classical** | Vigenère | Jefferson Disk Multi-Rotor Roll | `methods.classical.vigenere` |
| **Classical** | Playfair | 5x5 Matrix Board & Digraph Laser | `methods.classical.playfair` |
| **Classical** | Polybius Square | Watchtower Torch Fortress | `methods.historical.polybius` |
| **Historical** | Enigma Machine | 3-Rotor Electromechanical Engine | `methods.historical.enigma` |
| **Historical** | Lorenz SZ42 | 12-Pinwheel Teleprinter Attachment | `methods.historical.lorenz` |
| **Modern** | RSA | Interlocking Prime Rings & Glass Lock | `methods.modern.rsa` |
| **Modern** | AES-128 | 4x4 ShiftRows Matrix State Core | `methods.modern.aes` |
| **Modern** | SHA-256 | Merkle Tree Compression Cascade | `methods.modern.hash_functions` |

---

## Repository Structure

```
Cryptography/
├── methods/                      # Core Python cryptographic library
│   ├── classical/                # Caesar, Affine, Vigenère, Playfair, Substitution
│   ├── historical/               # Enigma, Lorenz SZ42, Polybius, Scytale
│   ├── modern/                   # AES, RSA, Hash Functions, Digital Signatures
│   └── tests/                    # Python unit test suite
├── web/                          # Next.js 3D WebGL app & FastAPI backend
│   ├── api/                      # FastAPI endpoints (main.py)
│   ├── src/components/museum/    # Three.js WebGL scene, HUD, and workbench
│   └── tests/                    # Jest component tests & Playwright E2E tests
├── handoff.md                    # Session handoff documentation
└── run_e2e_tests.sh              # E2E test runner script
```

---

## Getting Started

### Running the Web Application & API

From the `web/` directory, run both the Next.js frontend (port 3000) and FastAPI backend (port 8000) concurrently:

```bash
cd web

# Development mode with hot-reloading
npm run dev:all

# Production build and server
npm run start:all
```

Open `http://localhost:3000` to view the museum.

### Running Services Separately

1. **FastAPI Backend**:
   ```bash
   export PYTHONPATH=$(pwd)
   python3 -m uvicorn web.api.main:app --port 8000 --reload
   ```

2. **Next.js Frontend**:
   ```bash
   cd web
   npm run dev
   ```

---

## Python Library Usage

```python
# Caesar Cipher
from methods.classical.caesar import encrypt, decrypt
ciphertext = encrypt("HELLOMUSEUM", shift=5)
plaintext = decrypt(ciphertext, shift=5)

# Lorenz SZ42 Machine
from methods.historical.lorenz.lorenz import LorenzMachine
lorenz = LorenzMachine(wheel_positions=[0] * 12)
cipher_bits = lorenz.encrypt_message("SECRET DATA")

# AES Encryption
from methods.modern.symmetric import generate_key, generate_iv, encrypt, decrypt
key, iv = generate_key(), generate_iv()
ciphertext = encrypt("Confidential Data", key, iv)
```

---

## Running Tests

```bash
# Python unit tests
pytest

# Next.js Jest tests
cd web && npm test

# End-to-end integration tests
./run_e2e_tests.sh
```

---

## License

This project is licensed under the [MIT License](LICENSE).
