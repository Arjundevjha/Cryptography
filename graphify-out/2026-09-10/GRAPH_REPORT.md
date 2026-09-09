# Graph Report - Cryptography  (2026-09-09)

## Corpus Check
- 114 files · ~79,125 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1355 nodes · 2370 edges · 87 communities (72 shown, 15 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 161 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b8a24849`
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
- VercelPathMiddleware
- PlayfairEncryptInput
- Enigma Rotor Ring Rotation Math
- Lorenz Text Processing Procedures
- Lorenz Machine Core Unit Tests
- Lorenz Machine Pinwheels Initialization
- Lorenz Interactive CLI Simulation Runner
- is_valid_origin
- No-Install E2E Testing Script
- E2E Testing Script with Dependencies
- FastAPI Request Validation Handler
- Test Suites Execution Script
- Frontend Root App Layout Settings
- Jest Frontend Configuration Settings
- Exhibit Input Form UI Component
- validate_enigma_rotors
- Next.js Build Config Settings
- Next.js Environment Typings Directive
- no_ai_slop.md
- Plugboard
- _prepare_text
- playfair.py
- encrypt
- test_playfair.py
- _find_position
- keypair.py
- inv_mix_columns
- PolybiusDecryptInput
- validate_enigma_plugboard
- .__init__
- stepping.py
- parse_aes_key
- test_fallback_imports
- run_cli
- sub_bytes
- inv_shift_rows
- xtime
- validation_exception_handler
- AesDecryptInput
- VercelPathMiddleware
- sub_word
- b64decode

## God Nodes (most connected - your core abstractions)
1. `Lorenz` - 53 edges
2. `Rotor` - 47 edges
3. `Keyboard` - 45 edges
4. `Plugboard` - 42 edges
5. `Enigma` - 39 edges
6. `Reflector` - 39 edges
7. `Wheel` - 26 edges
8. `SteppingController` - 24 edges
9. `decrypt()` - 20 edges
10. `generate_keypair()` - 20 edges

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

## Communities (87 total, 15 thin omitted)

### Community 0 - "Cryptographic Helpers & Base64 Utilities"
Cohesion: 0.15
Nodes (30): generate_keypair(), Generate an RSA key pair.      Args:         key_size: The size of the key in bi, decrypt(), decrypt_private_key(), encrypt(), main(), _parse_pem(), RSA asymmetric encryption and decryption module in pure Python.  This module pro (+22 more)

### Community 1 - "Playfair Cipher Implementation & Benchmarks"
Cohesion: 0.12
Nodes (24): decrypt(), Decrypt ciphertext using Playfair cipher., Test decrypting digraphs where characters share a row., Test decrypting digraphs where characters share a column., Test decrypting digraphs forming a rectangle., Test that decrypt skips pairs that aren't of length DIGRAPH_LEN., Test decrypt behavior with an odd-length ciphertext input., Test decrypt strips spaces, numbers, and special characters from ciphertext. (+16 more)

### Community 2 - "FastAPI Backend Routes & Schema Models"
Cohesion: 0.09
Nodes (42): BaseModel, aes_encrypt(), AesEncryptInput, affine_decrypt(), affine_encrypt(), AffineDecryptInput, AffineEncryptInput, build_enigma_machine() (+34 more)

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
Cohesion: 0.05
Nodes (55): blake2b(), _blake2b_g(), blake2s(), _blake2s_g(), compute_hash(), _keccak_f1600(), _left_rotate32(), main() (+47 more)

### Community 8 - "Affine Cipher Core & Unit Tests"
Cohesion: 0.09
Nodes (37): _check_coprime(), decrypt(), encrypt(), main(), pick_keys(), Affine cipher implementation., Generate a random key pair (a, b) where a is coprime to 26 using CSPRNG., Encrypt plaintext using Affine cipher.      Each letter is mapped to (a_key * x (+29 more)

### Community 9 - "Caesar Cipher Core & Unit Tests"
Cohesion: 0.09
Nodes (35): decrypt(), encrypt(), main(), pick_keys(), Caesar cipher implementation., Encrypt plaintext using Caesar cipher.      Each letter is shifted forward by th, Decrypt ciphertext using Caesar cipher.      Each letter is shifted backward by, Run an interactive test of the Caesar cipher. (+27 more)

### Community 10 - "TypeScript Environment Configuration"
Cohesion: 0.06
Nodes (31): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, playwright.config.ts (+23 more)

### Community 11 - "Polybius Square Cipher Implementation"
Cohesion: 0.09
Nodes (31): decrypt(), encrypt(), main(), pick_keys(), Polybius Square cipher implementation., Encrypt plaintext using the Polybius Square cipher.      Maps each letter to a t, Decrypt ciphertext using the Polybius Square cipher.      Parses two-digit coord, Run an interactive test of the Polybius Square cipher. (+23 more)

### Community 12 - "HMAC and Digital Signature Utilities"
Cohesion: 0.13
Nodes (30): create_hmac(), generate_key(), hmac_compare_digest(), main(), HMAC digital signatures module in pure Python.  No external libraries or standar, Generate a random key for HMAC signing.      Args:         length: Key length in, Create an HMAC signature for the given data.      Args:         data: The data t, Verify an HMAC signature against expected value.      Args:         data: The or (+22 more)

### Community 13 - "Simple Substitution Cipher Implementation"
Cohesion: 0.13
Nodes (27): decrypt(), encrypt(), _invert_key(), main(), pick_keys(), Substitution cipher implementation., Create inverse mapping for decryption., Encrypt plaintext using substitution cipher.      Each letter is replaced accord (+19 more)

### Community 14 - "Baudot ITA2 Lorenz Code Conversions"
Cohesion: 0.16
Nodes (21): char_to_ita2(), ita2_to_char(), ita2_vectors_to_text(), ITA2 (Baudot Code) converter and bitwise vector utilities for Lorenz cipher., Convert a string into a list of 5-bit ITA2 binary vectors.      Args:         te, Convert a list of 5-bit ITA2 binary vectors back to a string.      Args:, Convert a character to its 5-bit ITA2 binary vector.      Args:         char: Si, Convert a 5-bit binary vector to its ITA2 character representation.      Args: (+13 more)

### Community 15 - "Lorenz Wheels Components Testing"
Cohesion: 0.10
Nodes (18): Initialize stepping controller with 12 Lorenz wheels.          Args:, Unit tests for Lorenz Wheel class., test_wheel_custom_pins(), test_wheel_init_default(), test_wheel_invalid_pins_length(), test_wheel_invalid_pins_value(), test_wheel_invalid_position(), test_wheel_invalid_size() (+10 more)

### Community 16 - "Vigenere Cipher Core & Helpers"
Cohesion: 0.17
Nodes (20): decrypt(), encrypt(), encrypt_with_new_key(), generate_iv(), generate_key(), main(), Symmetric Encryption Module (AES-256) in pure Python.  This module provides symm, Generate a random 256-bit (32 bytes) key for AES-256. (+12 more)

### Community 17 - "Museum Frontend Layout & Audio Scenes"
Cohesion: 0.09
Nodes (36): Home(), MuseumCanvas, AudioSystem(), AudioSystemProps, ApiStatusDot(), MuseumHUD(), MuseumHUDProps, MuseumCanvas() (+28 more)

### Community 18 - "Symmetric Encryption Utilities"
Cohesion: 0.25
Nodes (8): add_round_key(), decrypt_block(), Decrypt a single 16-byte block using AES., XOR state with the round key., Test raw block encryption and decryption to ensure no data loss in core AES func, Test XOR state with round key in AES., test_add_round_key(), test_single_block_encryption_decryption()

### Community 19 - "Scytale Cipher & Classical Init Modules"
Cohesion: 0.14
Nodes (20): Classical cryptography methods package., Historical cryptography methods package., decrypt(), encrypt(), main(), pick_keys(), Scytale transposition cipher implementation., Encrypt plaintext using the Scytale cipher.      Pads the plaintext and performs (+12 more)

### Community 20 - "Enigma Cipher Machine Implementation"
Cohesion: 0.12
Nodes (18): Enigma, Enigma machine class representing the whole machine assembly., Set the ring settings for each rotor., Set the initial key/letter position for each rotor., Encipher a single character through the Enigma machine., Enigma machine simulation., Initialize Enigma machine with components.          Args:             re: The Re, get_components() (+10 more)

### Community 21 - "Lorenz Stepping Controller Engine"
Cohesion: 0.12
Nodes (18): Set positions for all 12 wheels.          Args:             positions: Dict cont, Manages the 12 Lorenz pinwheels and their stepping drive rules., Get current 5-bit vector from the 5 Chi wheels., Get current 5-bit vector from the 5 Psi wheels., Generate current 5-bit keystream vector K = Chi ^ Psi., Advance wheels according to Lorenz stepping rules for next character:          1, Get current position indices for all 12 wheels.          Returns:             Di, SteppingController (+10 more)

### Community 22 - "Vigenere Cipher Unit Tests"
Cohesion: 0.14
Nodes (25): test_decrypt(), test_decrypt_unmatching_length_and_edge_cases(), test_encrypt(), test_encrypt_decrypt_char(), test_encrypt_decrypt_roundtrip(), test_encrypt_unmatching_length_and_edge_cases(), test_main_custom_key(), test_main_random_key() (+17 more)

### Community 23 - "Enigma Keyboard Component Routing"
Cohesion: 0.16
Nodes (17): mul_gf(), pkcs7_pad(), pkcs7_unpad(), Perform GF(2^8) multiplication by 2., Perform GF(2^8) multiplication of two bytes., Apply PKCS7 padding to raw bytes., Remove PKCS7 padding from raw bytes., xtime() (+9 more)

### Community 24 - "Manual AES CTR Cipher Core"
Cohesion: 0.12
Nodes (24): decrypt(), encrypt(), main(), AES symmetric encryption using manual AES-256-CTR in pure Python.  Reuses the AE, Encrypt a message using AES-256-CTR mode.      Args:         message: Plaintext, Decrypt a message encrypted with AES-256-CTR mode.      Args:         ciphertext, Demonstrate AES-CTR encryption and decryption., Modern cryptography methods package. (+16 more)

### Community 25 - "Enigma Rotor Mechanics Simulation"
Cohesion: 0.10
Nodes (18): Rotor component for Enigma machine., Initialize the rotor with a wiring permutation and turnover notch., Dynamically build left alphabet state for backward compatibility., Dynamically build right wiring state for backward compatibility., Pass the signal forward from right side to left side of the rotor., Rotor simulator representing a rotating scrambled wheel.      BOLT OPTIMIZATION:, Pass the signal backwards from left side to right side of the rotor., Rotate the rotor n steps forward or backward. (+10 more)

### Community 27 - "Enigma Reflector Simulator Routing"
Cohesion: 0.12
Nodes (15): Enigma machine components and simulation package., Reflector component for Enigma machine., Reflect a signal back through the rotors., Get the current reflector wiring mapping., Reflector simulator for reversing signal direction in Enigma., Initialize the reflector with standard and custom wiring mapping., Reflector, Test the reflecting logic of the Reflector. (+7 more)

### Community 28 - "Frontend TypeScript Cipher Adapters"
Cohesion: 0.23
Nodes (17): caesarDecrypt(), caesarEncrypt(), cleanPolybiusKey(), enigmaStepRotors(), generatePlayfairGrid(), getPolybiusCoords(), isPrimeTypeScript(), playfairDecrypt() (+9 more)

### Community 29 - "Frontend UI Build Entrypoints"
Cohesion: 0.12
Nodes (15): canvas-confetti, clsx, framer-motion, src/index.{ts,tsx,js,jsx}, src/main.{ts,tsx,js,jsx}, tailwind-merge, tailwindcss, duplicates (+7 more)

### Community 30 - "Lorenz Machine Cryptography Vector Math"
Cohesion: 0.25
Nodes (4): Decrypt a 5-bit vector (identical to encrypt_vector due to XOR reciprocity)., Encrypt or decrypt a single ITA2 character.          Args:             char: Inp, Decrypt a single ITA2 character (identical to encrypt_char)., Encrypt or decrypt a single 5-bit vector using current keystream and step.

### Community 31 - "VercelPathMiddleware"
Cohesion: 0.17
Nodes (12): b64encode(), Encode bytes to a Base64 string., Test Base64 encoding against standard RFC 4648 test vectors., Test Base64 encoding padding rules (0, 1, and 2 '=' padding characters)., Test Base64 encoding with extreme binary values (0x00, 0xFF, full byte ranges)., Verify b64encode matches standard library base64.b64encode for various payload l, Test Base64 encoding with bytearray inputs., test_b64encode_binary_and_edge_values() (+4 more)

### Community 32 - "PlayfairEncryptInput"
Cohesion: 0.11
Nodes (18): Keyboard, Keyboard component for Enigma machine., Map a letter to its alphabetical signal index (0-25)., Map an alphabetical signal index (0-25) back to a letter., Keyboard simulator for Enigma machine., Initialize the keyboard layout., Test the forward logic: letter to signal., Test the backward logic: signal to letter. (+10 more)

### Community 34 - "Lorenz Text Processing Procedures"
Cohesion: 0.11
Nodes (21): Lorenz, Lorenz SZ40/SZ42 cipher machine orchestrator., Process an entire text string through the Lorenz cipher machine.          Non-IT, Alias for process_message., Alias for process_message., Get current position indices for all 12 wheels., Set manual pin configurations for Chi, Motor, and Psi wheels.          Args:, Unit tests for Lorenz top-level machine class. (+13 more)

### Community 35 - "Lorenz Machine Core Unit Tests"
Cohesion: 0.16
Nodes (27): ch_func(), hmac_sha256(), maj_func(), Helper cryptographic utilities in pure Python.  Contains manual implementations, Sigma 1 lowercase function for SHA-256., Process a single 64-byte block to update the SHA-256 state in place., Compute SHA-256 hash of bytes., Compute HMAC-SHA256 signature of data using key. (+19 more)

### Community 36 - "Lorenz Machine Pinwheels Initialization"
Cohesion: 0.29
Nodes (7): parse_and_validate_enigma_rings(), _parse_ring_item(), Helper to parse a single ring setting (integer 1-26 or letter A-Z / '1'-'26')., test_parse_and_validate_enigma_rings_helper(), test_parse_and_validate_enigma_rings_invalid_count(), test_parse_and_validate_enigma_rings_invalid_values(), test_parse_and_validate_enigma_rings_valid()

### Community 37 - "Lorenz Interactive CLI Simulation Runner"
Cohesion: 0.33
Nodes (6): parse_enigma_positions(), Validates and returns rotor positions as a key string., test_parse_enigma_positions_helper(), test_parse_enigma_positions_invalid_characters(), test_parse_enigma_positions_invalid_count(), test_parse_enigma_positions_valid()

### Community 38 - "is_valid_origin"
Cohesion: 0.14
Nodes (14): is_valid_origin(), parse_allowed_origins(), Validates if an origin string is a secure, well-formed HTTP/HTTPS origin., Parses and validates CORS_ALLOWED_ORIGINS from environment string., test_is_valid_origin_exception_handling(), test_is_valid_origin_forbidden_characters(), test_is_valid_origin_invalid_cases(), test_is_valid_origin_ipaddress_value_error() (+6 more)

### Community 41 - "FastAPI Request Validation Handler"
Cohesion: 0.25
Nodes (7): 2025-05-18 - Vectorize Vigenère Cipher Operations, 2025-05-19 - Vectorize Affine Cipher via str.maketrans, 2025-05-20 - Pre-compute Coordinate Maps for Grid Ciphers, 2025-05-20 - Vectorize Scytale Cipher Transposition via Strided Slicing, 2025-05-21 - Optimize Enigma Rotor State Transitions with Modular Offset Arithmetic, 2025-05-22 - Bypass Call Stack & Redundant Object Allocations in Lorenz Machine Message Loops, 2025-05-23 - Pre-compute Galois Field GF(2^8) Multiplication Tables for AES MixColumns

### Community 46 - "validate_enigma_rotors"
Cohesion: 0.33
Nodes (6): validate_enigma_rotors(), test_validate_enigma_rotors_duplicate_rotors(), test_validate_enigma_rotors_error_precedence(), test_validate_enigma_rotors_invalid_count(), test_validate_enigma_rotors_invalid_rotor_type(), test_validate_enigma_rotors_valid()

### Community 64 - "Plugboard"
Cohesion: 0.13
Nodes (13): Main simulation runner for the Enigma machine., Plugboard, Plugboard component for Enigma machine., Pass the signal forward through the plugboard mapping., Pass the signal backwards through the plugboard mapping., Plugboard simulator for mapping/swapping character signals., Initialize the plugboard wiring based on pair mappings., Test plugboard with a single pair. (+5 more)

### Community 65 - "_prepare_text"
Cohesion: 0.14
Nodes (14): _prepare_text(), Prepare text: remove non-alpha, replace j, group into digraphs., Test that a message properly encrypts and decrypts., Test standard digraph preparation., Test that 'j' is replaced by 'i'., Test that non-alphabet characters are ignored., Test that odd-length texts get padded with 'x'., Test behavior with text containing all same letters. (+6 more)

### Community 66 - "playfair.py"
Cohesion: 0.18
Nodes (11): _build_pos_map(), main(), pick_keys(), Playfair cipher implementation., Run an interactive test of the Playfair cipher., Build a mapping of character to (row, col) position in the grid., Generate and return a random encryption key using CSPRNG., Test random key generation. (+3 more)

### Community 67 - "encrypt"
Cohesion: 0.17
Nodes (12): encrypt(), Encrypt plaintext using Playfair cipher., Test encrypting digraphs where characters share a column., Test encrypting digraphs forming a rectangle., Test decryption when key contains spaces, uppercase letters, duplicate character, Test encrypt raises ValueError when pos_map lookup raises KeyError., Test encrypting digraphs where characters share a row., test_decrypt_complex_key() (+4 more)

### Community 68 - "test_playfair.py"
Cohesion: 0.33
Nodes (6): _create_grid(), Create a 5x5 Playfair grid from key., Test grid generation with a simple key., Test grid generation converts 'j' to 'i'., test_create_grid_basic(), test_create_grid_with_j()

### Community 69 - "_find_position"
Cohesion: 0.33
Nodes (6): _find_position(), Find row and column of a character in the grid., Test finding a character's row and column in the grid., Test ValueError is raised if character is missing., test_find_position(), test_find_position_missing_char()

### Community 70 - "keypair.py"
Cohesion: 0.15
Nodes (20): generate_encrypted_keypair(), generate_prime(), is_prime(), main(), RSA Keypair Generation Module in pure Python.  This module provides functionalit, Generate an RSA key pair with an encrypted private key.      Args:         passp, Generate and print a sample RSA keypair., Check if val is prime using Miller-Rabin primality test. (+12 more)

### Community 71 - "inv_mix_columns"
Cohesion: 0.16
Nodes (14): inv_mix_columns(), mix_columns(), Mix the columns of the state matrix using precomputed GF(2^8) multiplication tab, Mix the columns of the state matrix using precomputed inverse GF(2^8) multiplica, Test mix_columns against standard FIPS 197 AES test vectors., Test mix_columns on all-zero state matrix., Test that inv_mix_columns reverses mix_columns for arbitrary states., Known Answer Test for inv_mix_columns. (+6 more)

### Community 72 - "PolybiusDecryptInput"
Cohesion: 0.40
Nodes (5): get_enigma_reflector_wiring(), Retrieves and validates reflector wiring for the given reflector name., test_get_enigma_reflector_wiring_helper(), test_get_enigma_reflector_wiring_invalid(), test_get_enigma_reflector_wiring_valid()

### Community 73 - "validate_enigma_plugboard"
Cohesion: 0.40
Nodes (5): validate_enigma_plugboard(), test_validate_enigma_plugboard_duplicate_connection(), test_validate_enigma_plugboard_helper(), test_validate_enigma_plugboard_invalid_format(), test_validate_enigma_plugboard_valid()

### Community 76 - "parse_aes_key"
Cohesion: 0.67
Nodes (3): parse_aes_key(), test_parse_aes_key_hex_fallback(), test_parse_aes_key_lengths()

### Community 78 - "run_cli"
Cohesion: 0.29
Nodes (9): Main simulation runner and interactive CLI for the Lorenz SZ40/SZ42 machine., Run interactive Lorenz machine cipher CLI session., run_cli(), Unit tests for Lorenz CLI main runner., test_run_cli_custom_positions_and_valid_message(), test_run_cli_default_positions_and_valid_message(), test_run_cli_empty_message(), test_run_cli_invalid_position_format() (+1 more)

### Community 79 - "sub_bytes"
Cohesion: 0.22
Nodes (10): inv_sub_bytes(), Substitute state bytes using the S-box., Substitute state bytes using the Inverse S-box., sub_bytes(), Test sub_bytes with a known input state against expected S-box substitution valu, Test that applying sub_bytes followed by inv_sub_bytes returns the original stat, Test inv_sub_bytes direct transformation and inverse relationship with sub_bytes, test_inv_sub_bytes() (+2 more)

### Community 80 - "inv_shift_rows"
Cohesion: 0.25
Nodes (8): inv_shift_rows(), Shift state rows to the left by row offsets., Shift state rows to the right by row offsets., shift_rows(), Test shift_rows function with a 16-byte state represented as 0..15., Test inv_shift_rows function directly with a known input state., test_inv_shift_rows(), test_shift_rows()

### Community 81 - "xtime"
Cohesion: 0.25
Nodes (8): key_expansion(), Rotate a 4-byte word: shift left by 1 position., Expand the AES key into round keys. Supports 16, 24, and 32 byte keys., rot_word(), Test 1-byte left rotation on a 4-byte word., test_key_expansion_invalid_key_length(), test_key_expansion_valid_key_lengths(), test_rot_word()

### Community 82 - "validation_exception_handler"
Cohesion: 0.48
Nodes (7): Request, RequestValidationError, validation_exception_handler(), test_validation_exception_handler_generic_validation_error(), test_validation_exception_handler_msg_contains_500(), test_validation_exception_handler_string_too_long_type(), test_validation_exception_handler_value_error_any_str_max_length()

### Community 83 - "AesDecryptInput"
Cohesion: 1.00
Nodes (3): aes_decrypt_endpoint(), AesDecryptInput, test_aes_decrypt_endpoint_direct_function_call()

### Community 85 - "sub_word"
Cohesion: 0.25
Nodes (8): Substitute bytes in a 4-byte word using the S-box., sub_word(), Test byte substitution on 4-byte words using the S-box., Test sub_word over all 256 byte values., Test sub_word with an empty list., test_sub_word(), test_sub_word_all_bytes(), test_sub_word_empty()

### Community 86 - "b64decode"
Cohesion: 0.40
Nodes (5): b64decode(), Decode a Base64 string to bytes., Test roundtrip encoding and decoding for various byte payloads., test_b64decode(), test_b64encode_roundtrip()

## Knowledge Gaps
- **123 isolated node(s):** `run_e2e_no_install.sh script`, `PYTHONPATH`, `run_e2e_tests.sh script`, `PYTHONPATH`, `run_tests.sh script` (+118 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sha256()` connect `Manual Hash Function Implementations` to `FastAPI Backend Routes & Schema Models`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `Lorenz` connect `Lorenz Text Processing Procedures` to `FastAPI Backend Routes & Schema Models`, `.__init__`, `Baudot ITA2 Lorenz Code Conversions`, `Lorenz Wheels Components Testing`, `run_cli`, `AesDecryptInput`, `VercelPathMiddleware`, `Lorenz Stepping Controller Engine`, `Lorenz Machine Cryptography Vector Math`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `Wheel` connect `Lorenz Wheels Components Testing` to `Lorenz Text Processing Procedures`, `.__init__`, `stepping.py`, `Baudot ITA2 Lorenz Code Conversions`, `Lorenz Stepping Controller Engine`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `Lorenz` (e.g. with `SteppingController` and `Wheel`) actually correct?**
  _`Lorenz` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `Rotor` (e.g. with `AesDecryptInput` and `AesEncryptInput`) actually correct?**
  _`Rotor` has 23 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `Keyboard` (e.g. with `AesDecryptInput` and `AesEncryptInput`) actually correct?**
  _`Keyboard` has 23 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `Plugboard` (e.g. with `AesDecryptInput` and `AesEncryptInput`) actually correct?**
  _`Plugboard` has 23 INFERRED edges - model-reasoned connections that need verification._