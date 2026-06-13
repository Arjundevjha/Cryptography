# E2E Test Infra: Cryptography Museum

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise + Workload Testing.
  - **Category-Partition**: Divides the input domain of each cipher into distinct categories (such as mode, key type, text length, and character set) and partitions them into sub-domains to generate optimized combinations.
  - **Boundary Value Analysis**: Focuses test inputs at the extremes, such as empty inputs, maximum characters (500 limit), parameter boundary values (e.g., shifts of -1, 0, 25, 26 for Caesar, non-coprime numbers for Affine, invalid widths for Scytale, wrong key lengths for AES), and boundary visual states.
  - **Pairwise Testing**: Selects combinations of input parameters systematically to ensure all dual-parameter interactions are tested, optimizing coverage without combinatorial explosion.
  - **Workload Testing**: Exercises playback animation features (Play, Pause, Step Forward, Step Backward, Reset, Speed Slider) to verify the visual state machine and rendering performance under variable speeds and fast switching.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Caesar Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 2 | Vigenère Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 3 | Affine Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 4 | Scytale Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 5 | Polybius Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 6 | Enigma Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 7 | AES Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 8 | RSA Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 9 | SHA-256 Cipher | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: Playwright (running via `npx playwright test` inside the `web` directory, with typescript configuration and exit codes signaling test success/failure).
- Test case format: Inputs are entered into text inputs and control parameters, and final output is retrieved from visual text containers or visualizer outputs, verifying against expected values.
- Directory layout: All E2E tests will be located under `web/tests/e2e/`.
- UI Selector Contracts (data-testid):
  - `data-testid="timeline-node-<cipher>"` (e.g. `caesar`, `vigenere`, `affine`, `polybius`, `scytale`, `enigma`, `aes`, `rsa`, `sha256`)
  - `data-testid="exhibit-<cipher>"`
  - `data-testid="input-text-<cipher>"`
  - `data-testid="output-text-<cipher>"`
  - `data-testid="mode-select-<cipher>"` or `data-testid="encrypt-btn-<cipher>"` / `data-testid="decrypt-btn-<cipher>"`
  - `data-testid="param-<name>-<cipher>"` (e.g., `data-testid="param-shift-caesar"`, `data-testid="param-key-vigenere"`, `data-testid="param-a-affine"`, `data-testid="param-b-affine"`, `data-testid="param-width-scytale"`, `data-testid="param-key-aes"`, etc.)
  - `data-testid="play-btn-<cipher>"`
  - `data-testid="pause-btn-<cipher>"`
  - `data-testid="step-forward-btn-<cipher>"`
  - `data-testid="step-backward-btn-<cipher>"`
  - `data-testid="reset-btn-<cipher>"`
  - `data-testid="speed-slider-<cipher>"`
  - `data-testid="visualizer-<cipher>"`
  - `data-testid="error-message-<cipher>"`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Multi-stage classical transmission | Caesar, Vigenère, Scytale | High |
| 2 | Modern Secure Channel simulation | RSA, AES | High |
| 3 | Museum Tour timeline navigation | Timeline scroll, Node highlights | Medium |
| 4 | Database integrity simulation | SHA-256, AES | Medium |
| 5 | Enigma operational simulation | Enigma (rotors, rings, plugboard) | High |
| 6 | Double-Encryption Comparison | Caesar | Medium |
| 7 | Large Input Stress Test | Caesar | Medium |
| 8 | Caesar Brute-Force Simulation | Caesar | Medium |
| 9 | Signed Key Exchange | RSA, SHA-256, AES | High |
| 10 | Timeline Browsing History Integration | Timeline scroll, Browser history | Medium |

## Coverage Thresholds
- Tier 1: >=5 per feature (Total: 45)
- Tier 2: >=5 per feature (Total: 45)
- Tier 3: pairwise coverage of major feature interactions (Total: 15)
- Tier 4: realistic application scenarios (Total: 10)
- Total: 115 test cases.

---

## E2E Test Case Catalog

Below is the complete E2E test catalog detailing the requirements, inputs, expected results, and steps to satisfy the coverage thresholds.

### Tier 1: Feature Functionality & Happy Paths (45 Tests)

#### 1. Caesar Cipher
1. **TC-T1-CAESAR-01 (Encrypt Standard)**: Input "HELLO", shift = 3, mode = Encrypt. Verify output is "KHOOR".
2. **TC-T1-CAESAR-02 (Decrypt Standard)**: Input "KHOOR", shift = 3, mode = Decrypt. Verify output is "HELLO".
3. **TC-T1-CAESAR-03 (No Shift)**: Input "NO CHANGE", shift = 0, mode = Encrypt. Verify output remains "NO CHANGE".
4. **TC-T1-CAESAR-04 (Case Preservation)**: Input "Caesar Cipher 123", shift = 5, mode = Encrypt. Verify output is "Hfjxfw Hnumjw 123" (preserving cases, numbers, and spaces).
5. **TC-T1-CAESAR-05 (Visual Wheel Step)**: Input "A", shift = 1. Click step-forward-btn-caesar. Verify the concentric SVG wheel highlights shift angle and output letters.

#### 2. Vigenère Cipher
6. **TC-T1-VIGENERE-01 (Encrypt Standard)**: Input "ATTACKATDAWN", key = "LEMON", mode = Encrypt. Verify output is "LXFOPVEFRNHR".
7. **TC-T1-VIGENERE-02 (Decrypt Standard)**: Input "LXFOPVEFRNHR", key = "LEMON", mode = Decrypt. Verify output is "ATTACKATDAWN".
8. **TC-T1-VIGENERE-03 (Key Case Insensitivity)**: Input "hello", key = "kEy", mode = Encrypt. Verify output matches encryption with key "KEY".
9. **TC-T1-VIGENERE-04 (Special Characters Preservation)**: Input "HELLO WORLD!", key = "KEY", mode = Encrypt. Verify spaces and punctuation are preserved: "RIJVS UYVJn!".
10. **TC-T1-VIGENERE-05 (Visual Grid Highlight)**: Input "A", key = "B". Trigger playback and verify 26x26 grid highlights column A and row B intersection.

#### 3. Affine Cipher
11. **TC-T1-AFFINE-01 (Encrypt Standard)**: Input "ATTACK", a = 5, b = 8, mode = Encrypt. Verify output is "IYYACK".
12. **TC-T1-AFFINE-02 (Decrypt Standard)**: Input "IYYACK", a = 5, b = 8, mode = Decrypt. Verify output is "ATTACK".
13. **TC-T1-AFFINE-03 (Coprime a=17)**: Input "HELLO", a = 17, b = 20, mode = Encrypt. Verify output is "PLBBD".
14. **TC-T1-AFFINE-04 (Key Decryption Reciprocity)**: Input "WORLD", a = 3, b = 5, mode = Encrypt. Copy output, toggle mode to Decrypt, verify decrypted text is "WORLD".
15. **TC-T1-AFFINE-05 (Formula Visualizer)**: Input "X", a = 5, b = 8. Verify the mathematical formula visualization shows $(5 \times 23 + 8) \pmod{26}$ mapping.

#### 4. Scytale Cipher
16. **TC-T1-SCYTALE-01 (Encrypt Standard)**: Input "I AM HURT VERY BADLY", width = 4, mode = Encrypt. Verify output is "IRB AYA MTD HVE UYL".
17. **TC-T1-SCYTALE-02 (Decrypt Standard)**: Input "IRB AYA MTD HVE UYL", width = 4, mode = Decrypt. Verify output is "I AM HURT VERY BADLY" (with padding spaces trimmed or handled correctly).
18. **TC-T1-SCYTALE-03 (Single Row)**: Input "HELLO", width = 5, mode = Encrypt. Verify output is "H E L L O" or padded equivalent.
19. **TC-T1-SCYTALE-04 (Wrapping Tape Animation)**: Input "TEST", width = 2. Verify visualizer cylinder updates wrapping count.
20. **TC-T1-SCYTALE-05 (Varying Width)**: Input "SCYTALE", change width from 3 to 4. Verify output updates automatically.

#### 5. Polybius Cipher
21. **TC-T1-POLYBIUS-01 (Encrypt Standard)**: Input "HELLO", mode = Encrypt. Verify output coordinates format is "23 15 31 31 34".
22. **TC-T1-POLYBIUS-02 (Decrypt Standard)**: Input "23 15 31 31 34", mode = Decrypt. Verify output is "HELLO" (or "HELLIO" if merging I/J).
23. **TC-T1-POLYBIUS-03 (I and J Merge)**: Input "JULIET", mode = Encrypt. Verify output matches "IULIET" coordinates representation.
24. **TC-T1-POLYBIUS-04 (Non-Alphabetic Ignored/Preserved)**: Input "HE LLO!", mode = Encrypt. Verify spaces/punctuation are handled appropriately in coordinates string.
25. **TC-T1-POLYBIUS-05 (Grid Highlight)**: Input "A". Verify grid row 1, col 1 is highlighted in the visualizer.

#### 6. Enigma Cipher
26. **TC-T1-ENIGMA-01 (Encrypt Standard)**: Input "HELLO", rotors = I-II-III, positions = A-A-A, rings = A-A-A, plugboard = empty. Verify output is encrypted correctly via Enigma emulator.
27. **TC-T1-ENIGMA-02 (Reciprocity/Decryption)**: Input the ciphertext from TC-T1-ENIGMA-01 back into Enigma with identical rotor, position, and ring settings. Verify output is "HELLO".
28. **TC-T1-ENIGMA-03 (Rotor Config Change)**: Input "TESTING", rotors = III-I-II, positions = X-Y-Z. Verify valid encryption output.
29. **TC-T1-ENIGMA-04 (Plugboard Swaps)**: Input "A", rotors = I-II-III, plugboard = "AB CD". Verify plugboard characters swap correctly.
30. **TC-T1-ENIGMA-05 (Visual Electrical Path)**: Input "A". Verify visualizer renders lines showing signal path from plugboard, through rotor stages, reflector, and back.

#### 7. AES Cipher
31. **TC-T1-AES-01 (Encrypt AES-128)**: Input "Secret Message", key = "1234567890123456" (16 bytes). Verify output block diagram displays and yields non-empty ciphertext.
32. **TC-T1-AES-02 (Decrypt AES-128)**: Input ciphertext from AES-01, same 16-byte key, mode = Decrypt. Verify output is "Secret Message".
33. **TC-T1-AES-03 (AES-256 Encrypt)**: Input "Secret Message", key = "12345678901234561234567890123456" (32 bytes). Verify output block diagram renders 14 rounds.
34. **TC-T1-AES-04 (Hex vs Text Mode)**: Toggle input format to Hex/UTF-8. Verify correct handling.
35. **TC-T1-AES-05 (Round Visualization)**: Trigger play-btn-aes. Verify rounds 1 to 10 block transitions animate in sequence.

#### 8. RSA Cipher
36. **TC-T1-RSA-01 (Keypair Gen)**: Enter prime numbers $p=61, q=53$. Verify public key $e$ and private key $d$ are computed and displayed.
37. **TC-T1-RSA-02 (Encrypt Message)**: Input numeric message "42" (or short text), encrypt using public key. Verify ciphertext output.
38. **TC-T1-RSA-03 (Decrypt Ciphertext)**: Input numeric ciphertext, decrypt using private key. Verify recovered output is "42".
39. **TC-T1-RSA-04 (Custom e Selection)**: Generate keys with prime $p=61, q=53$, specify custom $e=17$. Verify successful calculation.
40. **TC-T1-RSA-05 (Formula Visualization)**: Verify visualizer shows equations $n = p \times q$ and $d \equiv e^{-1} \pmod{\phi(n)}$.

#### 9. SHA-256 Cipher
41. **TC-T1-SHA256-01 (Hash Empty String)**: Input "", mode = Hash. Verify output is hex string: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
42. **TC-T1-SHA256-02 (Hash Text)**: Input "hello", mode = Hash. Verify output is hex string: `2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824`.
43. **TC-T1-SHA256-03 (Varying Case Hash)**: Input "Hello" vs "hello". Verify output hashes differ significantly.
44. **TC-T1-SHA256-04 (Padding Visual Representation)**: Input "A". Verify visualizer exhibits how message is padded with `1` bit and zeros to 512 bits.
45. **TC-T1-SHA256-05 (Block Splitting)**: Input long string exceeding 64 bytes. Verify block splitter visualizes 2 blocks.

---

### Tier 2: Boundary, Validation & Error Handling (45 Tests)

#### 1. Caesar Cipher
46. **TC-T2-CAESAR-01 (Negative Shift)**: Input "HELLO", shift = -5. Verify UI converts negative shift to equivalent positive shift (21) or handles it gracefully.
47. **TC-T2-CAESAR-02 (Extremely Large Shift)**: Input "HELLO", shift = 1000. Verify correct modulo calculation (shift 12) is used.
48. **TC-T2-CAESAR-03 (Empty String Validation)**: Leave input text empty. Verify output is empty and no error is thrown.
49. **TC-T2-CAESAR-04 (Non-Numeric Shift)**: Type "abc" into shift input. Verify validation error message appears in `error-message-caesar`.
50. **TC-T2-CAESAR-05 (Max Length Bound)**: Input exactly 500 characters. Verify encryption works. Input 501 characters. Verify error displays in `error-message-caesar`.

#### 2. Vigenère Cipher
51. **TC-T2-VIGENERE-01 (Empty Key Validation)**: Input "HELLO", leave key empty. Verify error message appears in `error-message-vigenere`.
52. **TC-T2-VIGENERE-02 (Non-Alphabetic Key)**: Input "HELLO", key = "KEY123". Verify validation rejects numeric values or sanitizes them.
53. **TC-T2-VIGENERE-03 (Empty Input Validation)**: Leave input empty, key = "KEY". Verify no error, empty output.
54. **TC-T2-VIGENERE-04 (Max Length Bound)**: Input exactly 500 characters. Verify correct ciphertext. Input 501 characters. Verify error displays.
55. **TC-T2-VIGENERE-05 (Key Matching Input Length)**: Input a short word with a very long key. Verify correct modulo key indexing.

#### 3. Affine Cipher
56. **TC-T2-AFFINE-01 (Non-Coprime Parameter a)**: Input "HELLO", a = 13 (not coprime to 26), b = 5. Verify validation triggers and `error-message-affine` displays "a must be coprime to 26".
57. **TC-T2-AFFINE-02 (Even Value a)**: Input "HELLO", a = 2 (not coprime), b = 3. Verify validation error.
58. **TC-T2-AFFINE-03 (Negative Parameters)**: Input a = -5, b = -8. Verify values are normalized to positive modulo equivalents or validation fails cleanly.
59. **TC-T2-AFFINE-04 (Out of Bounds a/b)**: Input a = 1001, b = 2000. Verify normalization/validation.
60. **TC-T2-AFFINE-05 (Max Length Bound)**: Input 501 characters. Verify validation halts submission.

#### 4. Scytale Cipher
61. **TC-T2-SCYTALE-01 (Width Too Small)**: Input "HELLO", width = 1. Verify validation error: width must be greater than or equal to 2.
62. **TC-T2-SCYTALE-02 (Non-Numeric Width)**: Input "HELLO", width = "xyz". Verify error validation in `error-message-scytale`.
63. **TC-T2-SCYTALE-03 (Width Exceeding Input Length)**: Input "HI", width = 10. Verify padding or output displays correctly without crashing.
64. **TC-T2-SCYTALE-04 (Empty Input Validation)**: Leave input empty. Verify empty output.
65. **TC-T2-SCYTALE-05 (Max Length Bound)**: Input 501 characters. Verify validation stops execution.

#### 5. Polybius Cipher
66. **TC-T2-POLYBIUS-01 (Invalid Decrypt Coordinates)**: Input "23 15 31 3" (odd number of coordinates), mode = Decrypt. Verify error displays in `error-message-polybius`.
67. **TC-T2-POLYBIUS-02 (Decryption Out of Range)**: Input "23 99 31", mode = Decrypt. Verify coordinates outside 1-5 range trigger validation error.
68. **TC-T2-POLYBIUS-03 (Empty Input Validation)**: Leave input empty. Verify empty output.
69. **TC-T2-POLYBIUS-04 (Max Length Bound)**: Input 501 characters. Verify validation error.
70. **TC-T2-POLYBIUS-05 (Non-numeric Coordinates Decrypt)**: Input "2a 15 31", mode = Decrypt. Verify coordinate validation rejects alphabetic inputs.

#### 6. Enigma Cipher
71. **TC-T2-ENIGMA-01 (Invalid Rotor Configuration)**: Select rotors I-I-II (duplicate rotor). Verify validation error displays in `error-message-enigma`.
72. **TC-T2-ENIGMA-02 (Duplicate Plugboard Connections)**: Set plugboard = "AB AC" (A connected to both B and C). Verify validation displays plugboard error.
73. **TC-T2-ENIGMA-03 (Invalid Plugboard Character)**: Set plugboard = "A1 CD". Verify validation rejects numbers.
74. **TC-T2-ENIGMA-04 (Empty Input Validation)**: Leave input empty. Verify empty output.
75. **TC-T2-ENIGMA-05 (Max Length Bound)**: Input 501 characters. Verify validation halts execution.

#### 7. AES Cipher
76. **TC-T2-AES-01 (Invalid Key Size)**: Input "HELLO", key = "12345" (not 16/24/32 bytes). Verify `error-message-aes` displays invalid key length error.
77. **TC-T2-AES-02 (Non-Hex Key for Hex Mode)**: Set key input format to Hex, enter "GHIJKL...". Verify validation error.
78. **TC-T2-AES-03 (Empty Input Validation)**: Leave input empty. Verify empty output.
79. **TC-T2-AES-04 (Max Length Bound)**: Input 501 characters. Verify validation halts request.
80. **TC-T2-AES-05 (Invalid Ciphertext Decryption)**: Input "InvalidHexFormat!", mode = Decrypt. Verify backend handles decryption failure and displays error.

#### 8. RSA Cipher
81. **TC-T2-RSA-01 (Non-Prime Parameters)**: Enter p = 4, q = 53. Verify validation error: p and q must be prime numbers.
82. **TC-T2-RSA-02 (Primes Too Small)**: Enter p = 2, q = 3. Verify validation error indicating parameters cannot securely generate keys or are too small.
83. **TC-T2-RSA-03 (Coprimality Violation for e)**: Enter p = 61, q = 53, select e = 13 (not coprime to phi(n) = 3120). Verify validation error.
84. **TC-T2-RSA-04 (Empty Input Validation)**: Leave input empty. Verify empty output.
85. **TC-T2-RSA-05 (Max Length Bound)**: Input 501 characters. Verify validation halts request.

#### 9. SHA-256 Cipher
86. **TC-T2-SHA256-01 (Empty Input Handling)**: Input empty string. Verify output matches standard empty SHA-256 hash.
87. **TC-T2-SHA256-02 (Unicode/Emoji Inputs)**: Input "Hello World 🌍🔒". Verify hash matches valid UTF-8 SHA-256.
88. **TC-T2-SHA256-03 (Max Length Bound)**: Input exactly 500 characters. Verify hash. Input 501 characters. Verify error displays in `error-message-sha256`.
89. **TC-T2-SHA256-04 (Special Symbol Inputs)**: Input string containing multiple carriage returns, tabs, and escape codes. Verify hash accuracy.
90. **TC-T2-SHA256-05 (Rapid Sequence Changes)**: Input letters rapidly. Verify UI handles race conditions cleanly and renders the final input's hash.

---

### Tier 3: Pairwise Interactions & Visual Integration (10 Tests)

91. **TC-T3-INTERACT-01 (Input State Persistence)**: Type "My Secret Text" into input-text-caesar. Scroll down to Enigma exhibit, type something there, then scroll back to Caesar. Verify "My Secret Text" is still present in input-text-caesar.
92. **TC-T3-INTERACT-02 (Mode Select State Preservation)**: Toggle mode-select-affine to Decrypt. Click timeline node for Vigenère, then click timeline node for Affine. Verify mode remains Decrypt for Affine.
93. **TC-T3-INTERACT-03 (Global/Local Playback Control Integration)**: Start play animation in Caesar. Switch tabs or click Vigenère. Verify Caesar's animation pauses automatically when out of viewport focus to conserve rendering resources.
94. **TC-T3-INTERACT-04 (Timeline Scroll Sync)**: Click timeline-node-aes. Verify viewport scrolls smoothly to exhibit-aes and intersection observer highlights timeline-node-aes.
95. **TC-T3-INTERACT-05 (Mobile Viewport Responsiveness)**: Set browser viewport to mobile dimensions (375x667). Scroll through exhibits. Verify layout adjusts, text is readable, visualizers scale, and timeline remains scrollable.
96. **TC-T3-INTERACT-06 (Theme Contrast Compliance)**: Inspect background, card boundaries, and text elements. Verify color contrast ratios conform to WCAG AA standards (>= 4.5:1 for normal text).
97. **TC-T3-INTERACT-07 (Reduced Motion Media Query)**: Enable `prefers-reduced-motion` in browser contexts. Enter text and trigger encryption in Caesar. Verify SVG animation is omitted or jumps instantly to completion, updating output immediately.
98. **TC-T3-INTERACT-08 (Keyboard Accessibility Navigation)**: Tab through timeline nodes. Verify active visual outline indicator on focus. Press Enter on timeline-node-polybius. Verify viewport scrolls and focuses on exhibit-polybius.
99. **TC-T3-INTERACT-09 (Error Auto-dismissal)**: Input invalid shift in Caesar ("abc"). Verify error-message-caesar appears. Input a valid shift ("5"). Verify error-message-caesar is automatically removed.
100. **TC-T3-INTERACT-10 (Output Copy-Paste Integration)**: Enter plaintext in Caesar, shift = 4, encrypt. Click output copy button. Paste into Vigenère input-text-vigenere. Verify clipboard contents transfer exactly.
101. **TC-T3-INTERACT-11 (Keyboard Focus Trapping)**: Focus an interactive modal/drawer like Enigma visual settings, verify Tab key loops focus within elements inside the container, and pressing ESC closes container and returns focus.
102. **TC-T3-INTERACT-12 (Deep Linking & Timeline Navigation)**: Navigate to site with a hash like `#caesar` or `#aes`. Verify page scrolls and highlights the specific cipher section immediately on page load.
103. **TC-T3-INTERACT-13 (Playback Control State Protection)**: Trigger playback of a cipher animation. While running, modify input text. Verify the animation pauses or resets appropriately.
104. **TC-T3-INTERACT-14 (Reset Button Clear state)**: Enter text, shift/key, encrypt, trigger animation. Click the Reset button. Verify input, output, errors, and visualizer states are reset to default values.
105. **TC-T3-INTERACT-15 (Playback Speed preservation)**: Adjust playback speed slider to 2x speed for a cipher. Switch to another cipher, verify speed settings are either preserved globally or reset appropriately, and returning shows it at 2x.

---

### Tier 4: Real-World Application Scenarios (10 Tests)

#### 106. TC-T4-SCENARIO-01: Multi-Stage Classical Transmission
- **Objective**: Simulate a message passed through multiple historical ciphers in sequence.
- **Steps**:
  1. Input plaintext "MUSEUM VISIT AT NOON" into Caesar.
  2. Set shift = 7, mode = Encrypt. Verify output-text-caesar matches "TVZBLT Bpzpa ha uvvu" or equivalent case-shifted text.
  3. Copy Caesar output, paste it into input-text-vigenere.
  4. Set key = "SECRET", mode = Encrypt. Verify output-text-vigenere.
  5. Copy Vigenère output, paste it into input-text-scytale.
  6. Set width = 3, mode = Encrypt. Verify final ciphertext output.
  7. Perform reverse path: Input final ciphertext into Scytale (width=3, mode=Decrypt) -> copy result -> input to Vigenère (key="SECRET", mode=Decrypt) -> copy result -> input to Caesar (shift=7, mode=Decrypt).
  8. Verify final output matches original "MUSEUM VISIT AT NOON".

#### 107. TC-T4-SCENARIO-02: Modern Secure Channel Simulation
- **Objective**: Simulate key exchange using RSA and message encryption/decryption using AES.
- **Steps**:
  1. Go to RSA exhibit. Generate keypair with $p=61, q=53$. Write down public parameters $(e, n)$ and private key $d$.
  2. Generate a random AES symmetric key (16 bytes, e.g., "1234567890123456").
  3. Go to AES exhibit. Input message "Top Secret Exhibit Document" and use the symmetric key to Encrypt. Copy the AES ciphertext.
  4. Convert the AES symmetric key to a numeric value and encrypt it using the RSA public key.
  5. Copy the RSA encrypted key.
  6. Simulate the receiver: Take the RSA encrypted key and decrypt it at the RSA exhibit using the private key $d$, successfully recovering "1234567890123456".
  7. Go to AES exhibit. Input the copied AES ciphertext, input the decrypted AES key, set mode = Decrypt.
  8. Verify output is "Top Secret Exhibit Document".

#### 108. TC-T4-SCENARIO-03: Museum Tour Timeline Navigation
- **Objective**: Verify that the museum visitor experience navigates smoothly, behaves responsively, and highlights nodes correctly.
- **Steps**:
  1. Load application at `/`. Verify Caesar timeline node is highlighted and Caesar exhibit is visible.
  2. Click Enigma timeline node. Verify page scrolls smoothly, and Enigma exhibit becomes visible in the viewport.
  3. Manually scroll down past Polybius to Enigma. Verify Enigma timeline node becomes highlighted.
  4. Use keyboard to tab back to the top navigation, select AES, and press Enter. Verify page scrolls to AES exhibit.
  5. Verify that resizing the browser window to tablet and mobile sizes preserves timeline layout and exhibit text readability.

#### 109. TC-T4-SCENARIO-04: Database Integrity Simulation
- **Objective**: Simulate integrity verification (hashing) combined with confidential database storage (encryption).
- **Steps**:
  1. Input database entry text "ID: 1001, Name: Gold Mask, Value: Priceless" into SHA-256 exhibit.
  2. Click Hash. Copy the resulting SHA-256 hash.
  3. Input the database entry text into AES. Set key = "DB_KEY_SECURE_99", encrypt, and copy the AES ciphertext.
  4. Modify a single letter in the database entry text: change "Gold Mask" to "Gold Mask" (simulating unauthorized modification/tampering).
  5. Hash the modified text using SHA-256. Verify that the new SHA-256 hash is radically different from the original hash.
  6. Encrypt the modified text with AES. Verify ciphertext is different.
  7. Decrypt the original ciphertext. Verify it returns the unmodified "ID: 1001, Name: Gold Mask, Value: Priceless".

#### 110. TC-T4-SCENARIO-05: Enigma Operational Simulation
- **Objective**: Verify detailed simulation of Enigma settings, rotor mechanics, plugboard wiring, and encryption reciprocity.
- **Steps**:
  1. Configure Enigma exhibit: Rotors = I-II-III, start positions = M-C-K, ring settings = O-P-Q.
  2. Set plugboard wiring = "AD FT LY UX".
  3. Input text "CONGRATULATIONS".
  4. Press Play button. Watch the rotors step and the electrical path light up in the visualizer for each character.
  5. Wait for encryption to finish or press Speed Slider to max. Copy final ciphertext output.
  6. Reset rotor positions to initial M-C-K. Keep same rotor selection, rings, and plugboard.
  7. Input ciphertext from step 5.
  8. Press Play button. Verify the decrypted output matches "CONGRATULATIONS".

#### 111. TC-T4-SCENARIO-06: Double-Encryption Comparison
- **Objective**: Encrypt text twice with different ciphers and compare results to check security differences.
- **Steps**:
  1. Input plaintext "HELLO" into Caesar. Set shift = 3, mode = Encrypt. Output is "KHOOR".
  2. Input "KHOOR" into Caesar. Set shift = 4, mode = Encrypt. Output is "OLSSV".
  3. Input "HELLO" into Caesar. Set shift = 7, mode = Encrypt. Output is "OLSSV".
  4. Verify that double Caesar encryption shift 3 and shift 4 is equivalent to single Caesar encryption shift 7.

#### 112. TC-T4-SCENARIO-07: Large Input Stress Test
- **Objective**: Verify system stability and error prevention when handling large strings.
- **Steps**:
  1. Generate a 1000-character string.
  2. Input the string into Caesar cipher input.
  3. Verify that the UI exhibits a validation error message ("Character limit exceeded") in error-message-caesar, or prevents submission.
  4. Trim input to 500 characters, verify encryption succeeds without errors.

#### 113. TC-T4-SCENARIO-08: Caesar Brute-Force Simulation
- **Objective**: Simulate a brute-force attacker testing all 25 shift possibilities to decrypt a Caesar message.
- **Steps**:
  1. Input encrypted text "KHOOR" into Caesar input. Set mode = Decrypt.
  2. Systematically step shift from 1 to 25.
  3. Verify output at shift = 3 reveals the legible plaintext "HELLO".

#### 114. TC-T4-SCENARIO-09: Signed Key Exchange
- **Objective**: Simulate a signed key exchange where Alice encrypts a symmetric key with Bob's public key and signs it with her private key.
- **Steps**:
  1. Alice generates RSA keys $p_A=61, q_A=53$. Bob generates RSA keys $p_B=47, q_B=59$.
  2. Alice takes a symmetric AES key (e.g. "1234567890123456") and encrypts it using Bob's RSA public key.
  3. Alice hashes the AES key with SHA-256 to get a hash digest, then encrypts (signs) the hash using Alice's RSA private key.
  4. Bob receives the encrypted key and signature. Bob decrypts the signature using Alice's RSA public key to get the expected hash digest.
  5. Bob decrypts the encrypted key using Bob's RSA private key to get the AES key, hashes it, and verifies it matches the decrypted hash digest.

#### 115. TC-T4-SCENARIO-10: Timeline Browsing History Integration
- **Objective**: Verify that clicking timeline nodes updates the browser history and URL hash correctly, allowing back/forward navigation.
- **Steps**:
  1. Click timeline-node-caesar, then click timeline-node-enigma, then click timeline-node-aes.
  2. Verify that the browser URL hash updates to `#caesar`, `#enigma`, `#aes` respectively.
  3. Trigger browser back navigation, verify URL hash updates to `#enigma` and Enigma exhibit is scrolled into view.
  4. Trigger browser forward navigation, verify URL hash updates to `#aes` and AES exhibit is scrolled into view.
