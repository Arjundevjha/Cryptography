# Graph Report - Cryptography  (2026-07-26)

## Corpus Check
- 108 files · ~58,535 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1064 nodes · 1885 edges · 62 communities (50 shown, 12 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 157 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6b17a671`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Cryptographic Helpers & Base64 Utilities
- Playfair Cipher Implementation & Benchmarks
- FastAPI Backend Routes & Schema Models
- Frontend App Third-Party Dependencies
- Development Tooling & Testing Packages
- Project Documentation & Handoff Guidelines
- Manual Hash Function Implementations
- Affine Cipher Core & Unit Tests
- Caesar Cipher Core & Unit Tests
- TypeScript Environment Configuration
- Polybius Square Cipher Implementation
- HMAC and Digital Signature Utilities
- Simple Substitution Cipher Implementation
- Baudot ITA2 Lorenz Code Conversions
- Lorenz Wheels Components Testing
- Vigenere Cipher Core & Helpers
- Museum Frontend Layout & Audio Scenes
- Symmetric Encryption Utilities
- Scytale Cipher & Classical Init Modules
- Enigma Cipher Machine Implementation
- Lorenz Stepping Controller Engine
- Vigenere Cipher Unit Tests
- Enigma Keyboard Component Routing
- Manual AES CTR Cipher Core
- Enigma Rotor Mechanics Simulation
- Enigma Plugboard Component Routing
- Enigma Reflector Simulator Routing
- Frontend TypeScript Cipher Adapters
- Frontend UI Build Entrypoints
- Lorenz Machine Cryptography Vector Math
- AES Key Expansion & S-Box Math
- PlayfairEncryptInput
- Enigma Rotor Ring Rotation Math
- Lorenz Text Processing Procedures
- Lorenz Machine Core Unit Tests
- Lorenz Machine Pinwheels Initialization
- Lorenz Interactive CLI Simulation Runner
- No-Install E2E Testing Script
- E2E Testing Script with Dependencies
- FastAPI Request Validation Handler
- Test Suites Execution Script
- Frontend Root App Layout Settings
- Jest Frontend Configuration Settings
- Exhibit Input Form UI Component
- Next.js Build Config Settings
- Next.js Environment Typings Directive
- no_ai_slop.md

## God Nodes (most connected - your core abstractions)
1. `Lorenz` - 48 edges
2. `Keyboard` - 45 edges
3. `Rotor` - 45 edges
4. `Plugboard` - 42 edges
5. `Enigma` - 39 edges
6. `Reflector` - 39 edges
7. `Wheel` - 25 edges
8. `SteppingController` - 21 edges
9. `create_hmac()` - 17 edges
10. `generate_keypair()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `AesDecryptInput` --uses--> `Enigma`  [INFERRED]
  web/api/main.py → methods/historical/enigma/enigma.py
- `AesEncryptInput` --uses--> `Enigma`  [INFERRED]
  web/api/main.py → methods/historical/enigma/enigma.py
- `AffineDecryptInput` --uses--> `Enigma`  [INFERRED]
  web/api/main.py → methods/historical/enigma/enigma.py
- `AffineEncryptInput` --uses--> `Enigma`  [INFERRED]
  web/api/main.py → methods/historical/enigma/enigma.py
- `CaesarDecryptInput` --uses--> `Enigma`  [INFERRED]
  web/api/main.py → methods/historical/enigma/enigma.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Museum Testing Flow** — test_infra_philosophy, test_ready_coverage, web_quality_log_tracks, web_security_log_scans [INFERRED 0.85]
- **Cryptography Project Guidelines** — contributing_python_standards, style_guide_no_external_libs, style_guide_file_structure, style_guide_naming_conventions [INFERRED 0.85]

## Communities (62 total, 12 thin omitted)

### Community 0 - "Cryptographic Helpers & Base64 Utilities"
Cohesion: 0.06
Nodes (76): b64decode(), b64encode(), ch_func(), hmac_sha256(), maj_func(), Helper cryptographic utilities in pure Python.  Contains manual implementations, Sigma 1 lowercase function for SHA-256., Compute SHA-256 hash of bytes. (+68 more)

### Community 1 - "Playfair Cipher Implementation & Benchmarks"
Cohesion: 0.06
Nodes (53): generate_long_text(), run_benchmark(), _create_grid(), decrypt(), encrypt(), _find_position(), main(), pick_keys() (+45 more)

### Community 2 - "FastAPI Backend Routes & Schema Models"
Cohesion: 0.09
Nodes (47): BaseModel, Lorenz, Lorenz SZ40/SZ42 cipher machine orchestrator., Get current position indices for all 12 wheels., Compute the SHA-256 hash of the given data.      Args:         data: The input s, sha256(), aes_decrypt_endpoint(), aes_encrypt() (+39 more)

### Community 4 - "Frontend App Third-Party Dependencies"
Cohesion: 0.05
Nodes (43): canvas-confetti, clsx, framer-motion, lucide-react, next, postprocessing, react, react-dom (+35 more)

### Community 5 - "Development Tooling & Testing Packages"
Cohesion: 0.05
Nodes (41): autoprefixer, concurrently, jest, jest-environment-jsdom, jsdom, @playwright/test, postcss, tailwindcss (+33 more)

### Community 6 - "Project Documentation & Handoff Guidelines"
Cohesion: 0.05
Nodes (27): Docstring Template Requirement, Categorized Cipher Directory Layout, Steps to Add New Algorithms, Python Standards Guidelines, Verification Audit Status, Lorenz SZ42 Integration Scope, FastAPI Integration Requirements, Cipher Exhibit Specifications (+19 more)

### Community 7 - "Manual Hash Function Implementations"
Cohesion: 0.07
Nodes (31): blake2b(), _blake2b_g(), blake2s(), _blake2s_g(), compute_hash(), _keccak_f1600(), _left_rotate32(), main() (+23 more)

### Community 8 - "Affine Cipher Core & Unit Tests"
Cohesion: 0.10
Nodes (33): _check_coprime(), decrypt(), encrypt(), main(), pick_keys(), Affine cipher implementation., Generate a random key pair (a, b) where a is coprime to 26., Encrypt plaintext using Affine cipher.      Each letter is mapped to (a_key * x (+25 more)

### Community 9 - "Caesar Cipher Core & Unit Tests"
Cohesion: 0.10
Nodes (33): decrypt(), encrypt(), main(), pick_keys(), Caesar cipher implementation., Encrypt plaintext using Caesar cipher.      Each letter is shifted forward by th, Decrypt ciphertext using Caesar cipher.      Each letter is shifted backward by, Run an interactive test of the Caesar cipher. (+25 more)

### Community 10 - "TypeScript Environment Configuration"
Cohesion: 0.06
Nodes (31): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, playwright.config.ts (+23 more)

### Community 11 - "Polybius Square Cipher Implementation"
Cohesion: 0.10
Nodes (29): decrypt(), encrypt(), main(), pick_keys(), Polybius Square cipher implementation., Encrypt plaintext using the Polybius Square cipher.      Maps each letter to a t, Decrypt ciphertext using the Polybius Square cipher.      Parses two-digit coord, Run an interactive test of the Polybius Square cipher. (+21 more)

### Community 12 - "HMAC and Digital Signature Utilities"
Cohesion: 0.14
Nodes (28): create_hmac(), generate_key(), hmac_compare_digest(), main(), HMAC digital signatures module in pure Python.  No external libraries or standar, Generate a random key for HMAC signing.      Args:         length: Key length in, Create an HMAC signature for the given data.      Args:         data: The data t, Verify an HMAC signature against expected value.      Args:         data: The or (+20 more)

### Community 13 - "Simple Substitution Cipher Implementation"
Cohesion: 0.13
Nodes (27): decrypt(), encrypt(), _invert_key(), main(), pick_keys(), Substitution cipher implementation., Create inverse mapping for decryption., Encrypt plaintext using substitution cipher.      Each letter is replaced accord (+19 more)

### Community 14 - "Baudot ITA2 Lorenz Code Conversions"
Cohesion: 0.15
Nodes (22): char_to_ita2(), ita2_to_char(), ita2_vectors_to_text(), ITA2 (Baudot Code) converter and bitwise vector utilities for Lorenz cipher., Convert a string into a list of 5-bit ITA2 binary vectors.      Args:         te, Convert a list of 5-bit ITA2 binary vectors back to a string.      Args:, Convert a character to its 5-bit ITA2 binary vector.      Args:         char: Si, Convert a 5-bit binary vector to its ITA2 character representation.      Args: (+14 more)

### Community 15 - "Lorenz Wheels Components Testing"
Cohesion: 0.10
Nodes (18): Unit tests for Lorenz Wheel class., test_wheel_custom_pins(), test_wheel_init_default(), test_wheel_invalid_pins_length(), test_wheel_invalid_pins_value(), test_wheel_invalid_position(), test_wheel_invalid_size(), test_wheel_step_wrapping() (+10 more)

### Community 16 - "Vigenere Cipher Core & Helpers"
Cohesion: 0.15
Nodes (26): decrypt(), encrypt(), encrypt_with_new_key(), generate_iv(), generate_key(), main(), pkcs7_pad(), pkcs7_unpad() (+18 more)

### Community 17 - "Museum Frontend Layout & Audio Scenes"
Cohesion: 0.12
Nodes (23): Home(), MuseumCanvas, AudioSystem(), AudioSystemProps, ApiStatusDot(), MuseumHUD(), MuseumHUDProps, MuseumCanvas() (+15 more)

### Community 18 - "Symmetric Encryption Utilities"
Cohesion: 0.11
Nodes (25): add_round_key(), decrypt_block(), encrypt_block(), inv_mix_columns(), inv_shift_rows(), inv_sub_bytes(), mix_columns(), mul_gf() (+17 more)

### Community 19 - "Scytale Cipher & Classical Init Modules"
Cohesion: 0.14
Nodes (20): Classical cryptography methods package., Historical cryptography methods package., decrypt(), encrypt(), main(), pick_keys(), Scytale transposition cipher implementation., Encrypt plaintext using the Scytale cipher.      Pads the plaintext and performs (+12 more)

### Community 20 - "Enigma Cipher Machine Implementation"
Cohesion: 0.06
Nodes (36): Enigma, Enigma machine class representing the whole machine assembly., Set the ring settings for each rotor., Set the initial key/letter position for each rotor., Encipher a single character through the Enigma machine., Enigma machine simulation., Initialize Enigma machine with components.          Args:             re: The Re, Keyboard (+28 more)

### Community 21 - "Lorenz Stepping Controller Engine"
Cohesion: 0.11
Nodes (16): Set positions for all 12 wheels.          Args:             positions: Dict cont, Manages the 12 Lorenz pinwheels and their stepping drive rules., Initialize stepping controller with 12 Lorenz wheels.          Args:, Get current 5-bit vector from the 5 Chi wheels., Get current 5-bit vector from the 5 Psi wheels., Generate current 5-bit keystream vector K = Chi ^ Psi., Advance wheels according to Lorenz stepping rules for next character:          1, Get current position indices for all 12 wheels.          Returns:             Di (+8 more)

### Community 22 - "Vigenere Cipher Unit Tests"
Cohesion: 0.17
Nodes (21): test_decrypt(), test_encrypt(), test_encrypt_decrypt_char(), test_encrypt_decrypt_roundtrip(), test_main_custom_key(), test_main_random_key(), test_pad_key(), test_pick_keys() (+13 more)

### Community 24 - "Manual AES CTR Cipher Core"
Cohesion: 0.16
Nodes (19): decrypt(), encrypt(), main(), AES symmetric encryption using manual AES-256-CTR in pure Python.  Reuses the AE, Encrypt a message using AES-256-CTR mode.      Args:         message: Plaintext, Decrypt a message encrypted with AES-256-CTR mode.      Args:         ciphertext, Demonstrate AES-CTR encryption and decryption., Known Answer Test for AES-256-CTR encryption. (+11 more)

### Community 25 - "Enigma Rotor Mechanics Simulation"
Cohesion: 0.15
Nodes (14): Enigma machine components and simulation package., Rotor component for Enigma machine., Pass the signal forward from right side to left side of the rotor., Pass the signal backwards from left side to right side of the rotor., Rotor simulator representing a rotating scrambled wheel., Initialize the rotor with a wiring permutation and turnover notch., Rotor, test_rotor_backwards() (+6 more)

### Community 26 - "Enigma Plugboard Component Routing"
Cohesion: 0.13
Nodes (13): Main simulation runner for the Enigma machine., Plugboard, Plugboard component for Enigma machine., Pass the signal forward through the plugboard mapping., Pass the signal backwards through the plugboard mapping., Plugboard simulator for mapping/swapping character signals., Initialize the plugboard wiring based on pair mappings., Test plugboard with a single pair. (+5 more)

### Community 27 - "Enigma Reflector Simulator Routing"
Cohesion: 0.10
Nodes (20): Reflector component for Enigma machine., Reflect a signal back through the rotors., Get the current reflector wiring mapping., Reflector simulator for reversing signal direction in Enigma., Initialize the reflector with standard and custom wiring mapping., Reflector, Test the reflecting logic of the Reflector., Test reflecting logic on all characters. (+12 more)

### Community 28 - "Frontend TypeScript Cipher Adapters"
Cohesion: 0.23
Nodes (17): caesarDecrypt(), caesarEncrypt(), cleanPolybiusKey(), enigmaStepRotors(), generatePlayfairGrid(), getPolybiusCoords(), isPrimeTypeScript(), padVigenereKey() (+9 more)

### Community 29 - "Frontend UI Build Entrypoints"
Cohesion: 0.12
Nodes (15): canvas-confetti, clsx, framer-motion, src/index.{ts,tsx,js,jsx}, src/main.{ts,tsx,js,jsx}, tailwind-merge, tailwindcss, duplicates (+7 more)

### Community 30 - "Lorenz Machine Cryptography Vector Math"
Cohesion: 0.25
Nodes (4): Decrypt a 5-bit vector (identical to encrypt_vector due to XOR reciprocity)., Encrypt or decrypt a single ITA2 character.          Args:             char: Inp, Decrypt a single ITA2 character (identical to encrypt_char)., Encrypt or decrypt a single 5-bit vector using current keystream and step.

### Community 31 - "AES Key Expansion & S-Box Math"
Cohesion: 0.25
Nodes (8): key_expansion(), Substitute bytes in a 4-byte word using the S-box., Rotate a 4-byte word: shift left by 1 position., Expand the AES key into round keys. Supports 16, 24, and 32 byte keys., rot_word(), sub_word(), test_key_expansion_invalid_key_length(), test_key_expansion_valid_key_lengths()

### Community 33 - "Enigma Rotor Ring Rotation Math"
Cohesion: 0.33
Nodes (3): Rotate the rotor n steps forward or backward., Rotate the rotor until the specified letter is at the top position., Set the ring offset for the rotor, adjusting notch and wiring.

### Community 34 - "Lorenz Text Processing Procedures"
Cohesion: 0.33
Nodes (3): Process an entire text string through the Lorenz cipher machine.          Non-IT, Alias for process_message., Alias for process_message.

### Community 35 - "Lorenz Machine Core Unit Tests"
Cohesion: 0.33
Nodes (5): Unit tests for Lorenz top-level machine class., test_lorenz_basic_reciprocity(), test_lorenz_custom_pins(), test_lorenz_manual_position_change(), test_lorenz_vector_processing()

### Community 37 - "Lorenz Interactive CLI Simulation Runner"
Cohesion: 0.50
Nodes (3): Main simulation runner and interactive CLI for the Lorenz SZ40/SZ42 machine., Run interactive Lorenz machine cipher CLI session., run_cli()

### Community 41 - "FastAPI Request Validation Handler"
Cohesion: 0.67
Nodes (3): Request, RequestValidationError, validation_exception_handler()

## Knowledge Gaps
- **113 isolated node(s):** `run_e2e_no_install.sh script`, `PYTHONPATH`, `run_e2e_tests.sh script`, `PYTHONPATH`, `run_tests.sh script` (+108 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Lorenz` connect `FastAPI Backend Routes & Schema Models` to `PlayfairEncryptInput`, `Lorenz Text Processing Procedures`, `Lorenz Machine Core Unit Tests`, `Lorenz Machine Pinwheels Initialization`, `Lorenz Interactive CLI Simulation Runner`, `Baudot ITA2 Lorenz Code Conversions`, `Lorenz Wheels Components Testing`, `Lorenz Stepping Controller Engine`, `Enigma Keyboard Component Routing`, `Enigma Reflector Simulator Routing`, `Lorenz Machine Cryptography Vector Math`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `Reflector` connect `Enigma Reflector Simulator Routing` to `PlayfairEncryptInput`, `FastAPI Backend Routes & Schema Models`, `Enigma Cipher Machine Implementation`, `Enigma Keyboard Component Routing`, `Enigma Rotor Mechanics Simulation`, `Enigma Plugboard Component Routing`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `b64encode()` connect `Cryptographic Helpers & Base64 Utilities` to `FastAPI Backend Routes & Schema Models`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `Lorenz` (e.g. with `SteppingController` and `Wheel`) actually correct?**
  _`Lorenz` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `Keyboard` (e.g. with `AesDecryptInput` and `AesEncryptInput`) actually correct?**
  _`Keyboard` has 23 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `Rotor` (e.g. with `AesDecryptInput` and `AesEncryptInput`) actually correct?**
  _`Rotor` has 23 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `Plugboard` (e.g. with `AesDecryptInput` and `AesEncryptInput`) actually correct?**
  _`Plugboard` has 23 INFERRED edges - model-reasoned connections that need verification._