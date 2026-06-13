# Handoff Report — Codebase Exploration & Analysis

## Observation

I have explored the codebase structure and individual cipher implementations in the `methods/` and `web/` directories. Below are the exact details of the findings:

### 1. Project Directory Structure
The repository structure observed at the root directory `/Users/abc/Desktop/Cryptography` is as follows:
- `methods/`: Contains Python packages for classical, historical, and modern ciphers.
  - `classical/`: Caesar, Vigenère, Affine, Playfair, Substitution ciphers.
  - `historical/`: Polybius, Scytale, and Enigma machine simulation.
  - `modern/`: AES (CTR and CBC), RSA, digital signatures, hash functions.
- `web/`: Contains static front-end assets:
  - `index.html` (0 bytes, empty)
  - `js/index.js` (0 bytes, empty)
  - `css/style.css` (0 bytes, empty)
- `STYLE_GUIDE.md`: Prohibits importing external cryptography libraries (e.g. `cryptography`, `pycryptodome`). Only Python standard library modules (`hashlib`, `hmac`, `os`, `random`, `math`, etc.) are allowed.
- `ORIGINAL_REQUEST.md` (root): Details the future "Cryptography Museum" web application requirements, including chronological timeline UI (Next.js) and a FastAPI backend at `web/api/main.py` acting as an API bridge to the `methods/` folder.

---

### 2. Cipher Implementations in `methods/`

#### A. Classical Ciphers (`methods/classical/`)

*   **Caesar Cipher (`methods/classical/caesar.py`)**
    *   **Key Generation:** `pick_keys() -> int` (generates a random shift 1-25).
    *   **Encryption:** `encrypt(plaintext: str, shift: int) -> str`
    *   **Decryption:** `decrypt(ciphertext: str, shift: int) -> str`
    *   **Behavior:** Preserves non-alphabetic characters and maintains character casing.

*   **Vigenère Cipher (`methods/classical/vigenere.py`)**
    *   **Key Generation:** `pick_keys() -> str` (generates a random 5-letter lowercase string).
    *   **Encryption:** `encrypt(plaintext: str, key: str) -> str`
    *   **Decryption:** `decrypt(ciphertext: str, key: str) -> str`
    *   **Behavior:** Pads and cycles key through alphabetic characters. Case and non-alphabetic characters are preserved.

*   **Affine Cipher (`methods/classical/affine.py`)**
    *   **Key Generation:** `pick_keys() -> tuple[int, int]` (generates `a_key` coprime to 26 and a random `b_key`).
    *   **Encryption:** `encrypt(plaintext: str, a_key: int, b_key: int) -> str`
    *   **Decryption:** `decrypt(ciphertext: str, a_key: int, b_key: int) -> str`
    *   **Behavior:** Preserves non-alphabetic characters. Always outputs lowercase for alphabetic characters.

*   **Playfair Cipher (`methods/classical/playfair.py`)**
    *   **Key Generation:** `pick_keys() -> str` (generates a random key of length 5-10 from alphabet characters, replacing `j` with `i`).
    *   **Encryption:** `encrypt(plaintext: str, key: str) -> str`
    *   **Decryption:** `decrypt(ciphertext: str, key: str) -> str`
    *   **Behavior:** Removes non-alphabetic characters, maps `j` to `i`, inserts `x` between duplicate adjacent letters, and pads odd-length text with `x`. Always outputs lowercase.

*   **Substitution Cipher (`methods/classical/substitution.py`)**
    *   **Key Generation:** `pick_keys() -> dict` (generates a dict mapping each lowercase character to a shuffled character).
    *   **Encryption:** `encrypt(plaintext: str, key: dict) -> str`
    *   **Decryption:** `decrypt(ciphertext: str, key: dict) -> str`
    *   **Behavior:** Preserves non-alphabetic characters and casing.

---

#### B. Historical Ciphers (`methods/historical/`)

*   **Polybius Square Cipher (`methods/historical/polybius.py`)**
    *   **Key Generation:** `pick_keys() -> str` (generates a shuffled 25-letter alphabet string, excluding `j` / mapping `j` to `i`).
    *   **Encryption:** `encrypt(plaintext: str, key: str) -> str`
    *   **Decryption:** `decrypt(ciphertext: str, key: str) -> str`
    *   **Behavior:** Encrypts each letter into a two-digit coordinate string (row/col 1-5). Preserves non-alphabetic characters.

*   **Scytale Cipher (`methods/historical/scytale.py`)**
    *   **Key Generation:** `pick_keys() -> int` (generates a random cylinder diameter 3-8).
    *   **Encryption:** `encrypt(plaintext: str, diameter: int) -> str`
    *   **Decryption:** `decrypt(ciphertext: str, diameter: int) -> str`
    *   **Behavior:** Transposition cipher that pads text with spaces to match a multiple of the diameter. Decryption strips trailing spaces using `rstrip()`.

*   **Enigma Machine (`methods/historical/enigma/`)**
    *   **Structure:** Split into modular component classes:
        *   `Keyboard` (`keyboard.py`): Maps letters to indices 0-25.
        *   `Plugboard` (`plugboard.py`): Wiring swap mapping for character pairs (e.g. `["AB", "CD"]`).
        *   `Reflector` (`reflector.py`): Reflector wiring.
        *   `Rotor` (`rotor.py`): Turnover notch and wiring permutation. Supports rotation (`rotate`) and ring offsets (`set_ring`).
        *   `Enigma` (`enigma.py`): Assembles components (`re`, `rotors` (list of 3 rotors), `pb`, `kb`).
    *   **Enigma Methods:**
        *   `__init__(self, re, rotors: list, pb, kb)`
        *   `set_rings(self, rings)` (takes a tuple/list of 3 ring settings)
        *   `set_key(self, key)` (takes a 3-letter string)
        *   `encipher(self, letter: str) -> str` (processes a single character, advances rotors first)
    *   **CLI Demo (`methods/historical/enigma/main.py`):** Uses rotor list `[IV, II, I]`, reflector `B`, plugboard `["AB", "CD", "EF"]`, rings `(5, 26, 2)`, and key `"CAT"`. The message input is preprocessed to remove spaces and punctuation, convert to uppercase, and enciphered letter-by-letter.

---

#### C. Modern Ciphers (`methods/modern/`)

*   **AES Cipher (`methods/modern/aes.py` & `symmetric.py`)**
    *   **CTR Mode (`aes.py`):**
        *   `encrypt(message: str, key: bytes) -> tuple[bytes, bytes]` (encrypts message using AES-256-CTR, returns `(ciphertext, nonce)` where nonce is 12 random bytes).
        *   `decrypt(ciphertext: bytes, key: bytes, nonce: bytes) -> str`
    *   **CBC Mode (`symmetric.py`):**
        *   `generate_key() -> bytes` (32 bytes)
        *   `generate_iv() -> bytes` (16 bytes)
        *   `encrypt(message: str, key: bytes, iv: bytes) -> bytes` (uses AES-256-CBC with PKCS7 padding)
        *   `decrypt(ciphertext: bytes, key: bytes, iv: bytes) -> str` (decrypts and unpads)
    *   **Implementation Note:** Pure-Python implementation of S-box, Inv S-box, Key Expansion, MixColumns, ShiftRows, and block encryption/decryption without external binary dependencies.

*   **RSA Cipher (`methods/modern/rsa.py` & `keypair.py`)**
    *   **Keypair Generation (`keypair.py`):**
        *   `generate_keypair(key_size: int = 1024, public_exponent: int = 65537) -> tuple[bytes, bytes]` (returns custom public and private keys encoded in PEM blocks as bytes).
        *   `generate_encrypted_keypair(passphrase: bytes, key_size: int = 1024, public_exponent: int = 65537) -> tuple[bytes, bytes]` (returns PEM public key and passphrase-encrypted private key PEM using AES-CBC).
    *   **Encryption/Decryption (`rsa.py`):**
        *   `encrypt(message: str, public_key_pem: bytes) -> bytes` (RSA encryption using the public key params serialized inside PEM).
        *   `decrypt(ciphertext: bytes, private_key_pem: bytes) -> str` (RSA decryption using the private key params serialized inside PEM).
        *   `decrypt_private_key(enc_private_key_pem: bytes, passphrase: bytes) -> bytes` (decrypts the private key PEM using the passphrase).
    *   **Implementation Note:** Implemented in pure Python using modular exponentiation and Miller-Rabin primality tests.

*   **Digital Signatures (`methods/modern/digital_signatures.py`)**
    *   **Signing/Verification:**
        *   `generate_key(length: int = 32) -> bytes` (generates random HMAC secret key).
        *   `create_hmac(data: bytes, key: bytes, algorithm: str = 'sha256') -> str` (computes HMAC signature as a hex string).
        *   `verify_hmac(data: bytes, key: bytes, expected: str, algorithm: str = 'sha256') -> bool` (verifies signature using constant-time comparison).
    *   **Dependencies:** Uses custom `hmac_sha256` in `methods/modern/helpers.py`.

*   **Hash Functions (`methods/modern/hash_functions.py` & `helpers.py`)**
    *   **Functions:**
        *   `compute_hash(data: str, algorithm: str) -> str` (computes hex digest for specified algorithm).
        *   Supported algorithms: `sha256`, `md5`, `sha1`, `sha512`, `sha3_256`, `blake2b`, `blake2s`.
    *   **Implementation Note:** All hash algorithms are manually implemented in pure Python.

---

### 3. Web Directory Status
- Path: `/Users/abc/Desktop/Cryptography/web`
- Status: Pre-existing files (`index.html`, `js/index.js`, `css/style.css`) are empty skeleton files (0 bytes).
- Findings: No backend (FastAPI) or front-end (Next.js) code is present. The directory is clean and ready for onboarding a web/API scaffolding framework.

---

## Logic Chain

1. **Verification of Directory Layout:** I listed the directories and files recursively under `/Users/abc/Desktop/Cryptography` using `list_dir` and `find_by_name`. This confirmed the presence of the Python package `methods/` and the static skeleton directory `web/`.
2. **Analysis of Cipher APIs:** I examined the file content for every Python module in `methods/` via the `view_file` tool. By examining the function signatures (`encrypt`, `decrypt`, `pick_keys`, `main`), I mapped out the argument types (e.g., strings, integers, byte payloads, PEM blocks) and output types for all algorithms.
3. **Assessment of Web Architecture:** Inspecting the contents of the `web/` directory and checking its files revealed that all of them contain 0 bytes. This confirms that no active application resides in the folder yet. The root `ORIGINAL_REQUEST.md` provides the exact architecture design (Next.js + FastAPI bridge) required for the subsequent implementation phase.

---

## Caveats

- **Scope:** No code modifications were performed, as this is a read-only investigation.
- **External Dependencies:** Although `README.md` mentions `pip install cryptography` for modern algorithms, inspection of the codebase showed that all modules (including AES, RSA, SHA-256) are written in pure Python using only standard library modules and manual bitwise operations. No third-party modules are actually imported.
- **Missing Scope Document:** The `PROJECT.md` file listed in the orchestrator briefing does not exist in the root folder. The `ORIGINAL_REQUEST.md` at the root acts as the primary requirement reference instead.

---

## Conclusion

The repository is fully analyzed. All classical, historical, and modern ciphers are implemented in pure Python using consistent naming conventions (`pick_keys`, `encrypt`, `decrypt`) and custom command-line demos (`main`). The `web/` directory is clean and empty, making it ready for scaffolding the Next.js and FastAPI application.

---

## Verification Method

1. **Verify Python Implementations:** Each cipher can be verified by running its interactive command-line demo directly:
   ```bash
   python methods/classical/caesar.py
   python methods/classical/vigenere.py
   python methods/classical/affine.py
   python methods/classical/playfair.py
   python methods/classical/substitution.py
   python methods/historical/polybius.py
   python methods/historical/scytale.py
   python -m methods.historical.enigma.main
   python methods/modern/aes.py
   python methods/modern/symmetric.py
   python methods/modern/rsa.py
   python methods/modern/keypair.py
   python methods/modern/digital_signatures.py
   python methods/modern/hash_functions.py
   ```
2. **Verify Web Directory Structure:** Run `ls -R web/` to verify that `web/` contains only empty static placeholders, ready for scaffolding.
