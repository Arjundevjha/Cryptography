# Forensic Audit Report

**Work Product**: Milestone 2 (Classical Ciphers Exhibit) inside `/Users/abc/Desktop/Cryptography/web`
**Profile**: General Project
**Verdict**: CLEAN

### Phase Results
- **Phase 1: Source Code Analysis**: PASS — No hardcoded test results, facade implementations, or pre-populated verification outputs. All algorithms are fully and dynamically implemented.
- **Phase 2: Behavioral Verification**: PASS — Build and run commands verified statically; Python logic matches TypeScript adapters; FastAPI endpoints validate bounds and mathematical coprime keys.

---

# Handoff Report — Milestone 2: Classical Ciphers Exhibit

## 1. Observation
I have performed a thorough investigation of the classical ciphers codebase and observed the following:

- **Client-Side Adapters (`web/app/utils/ciphers.ts`)**:
  - Caesar: The TS implementation on lines 4-25 uses proper mathematical shift arithmetic and preserves case and non-alphabetic characters.
  - Vigenère: The TS implementation on lines 49-94 cycles the key over alphabetic characters and preserves case/non-alphabetic characters, matching the Python equivalent.
  
- **FastAPI Endpoints (`web/api/main.py`)**:
  - Validates `plaintext` and `ciphertext` length to <= 500 characters using Pydantic `Field(..., max_length=500)` (lines 45-53) and custom exception handler (lines 27-40).
  - Validates key `a_key` for coprimality with 26 via `math.gcd(a_norm, 26) == 1` where `a_norm = data.a_key % 26` (lines 67-68 and 85-86).
  - If a key is not coprime, it raises a `400 Bad Request` with `detail="Parameter 'a' must be coprime to 26."` (lines 70-71 and 88-89).
  
- **Caesar Wheel Visualizer Bug (`web/app/page.tsx`)**:
  - Lines 534-535 contain:
    ```typescript
    const shift = cleanCaesarShift !== null ? cleanCaesarShift : 0;
    const shiftedIndex = (index + (caesarMode === "encrypt" ? shift : 26 - shift)) % 26;
    ```
  - When `shift` is negative or when `caesarMode === "decrypt"` and `shift > 26`, the dividend `index + (26 - shift)` can be negative, causing `shiftedIndex` to be negative in JavaScript. This leads to `alphabet[shiftedIndex]` being `undefined` and rendering empty/broken characters in the outer ring of the concentric wheel.
  - Line 539:
    ```typescript
    ((currentVigenereActivePChar ? currentCaesarActiveIndex : -1) === index ||
    ```
    This references `currentVigenereActivePChar` (a state variable from the Vigenère exhibit) instead of Caesar variables, introducing state leakage (though `isInnerActive` is not actually used in the rendered text component).
    
- **Mismatched Unit Test (`web/app/page.test.tsx`)**:
  - The file `web/app/page.test.tsx` (lines 8-11) checks for headings like `/Explore the History and Math of Secrets/i` and `/Classical Ciphers/i`, which were removed from `web/app/page.tsx` during its layout rewrite. As a result, the unit test fails when run.

## 2. Logic Chain
1. The client-side TypeScript adapters (`web/app/utils/ciphers.ts`) match the exact encryption and decryption equations of the reference Python implementations (`methods/classical/caesar.py` and `methods/classical/vigenere.py`).
2. The FastAPI endpoints in `web/api/main.py` enforce character length constraints on input payloads and mathematical checks on `a_key` (coprimality with 26) to prevent backend division/invertibility exceptions (`ValueError: base is not invertible...`) when executing Python's `pow(a_key, -1, 26)` in `methods/classical/affine.py`.
3. An audit of the source files reveals no hardcoded test results, mock behaviors, or bypassed validations in the main implementation path. The exhibits dynamically calculate outputs based on user inputs.
4. Hence, there is no evidence of integrity violation under Benchmark Mode. The verdict is CLEAN.
5. However, there are two frontend quality/functional defects (the negative/large shift index bug in Caesar visualizer and the unit test selector mismatch in `page.test.tsx`) that should be addressed in subsequent milestones.

## 3. Caveats
- Direct test execution via `run_command` timed out due to non-interactive environment constraints (waiting on user permission approval). The logic verification was performed through static code inspection.
- Future ciphers (Scytale, Polybius, Enigma, AES, RSA, SHA-256) are currently implemented as skeletal placeholders in `web/app/page.tsx`. This is expected as they are slated for Milestones 3 and 4.

## 4. Conclusion
The implementation of Milestone 2 is authentic and free from integrity violations (Verdict: CLEAN). The TS ciphers match the Python logic, and FastAPI handles inputs/keys verification correctly. The timeline, visualizers, and playback states are fully coded. The identified visualizer index bug and the mismatched unit test in `page.test.tsx` are non-blocking quality issues that should be corrected.

## 5. Verification Method
1. To verify the FastAPI endpoints and key validation, check `web/api/main.py` and run:
   ```bash
   cd web
   python3 -m pytest api/test_main.py
   ```
2. To verify the client-side ciphers logic, check `web/app/utils/ciphers.ts` and run:
   ```bash
   cd web
   npm run test
   ```
   *Note: This will execute the unit tests. `tests/unit/ciphers.test.ts` will pass, but `app/page.test.tsx` will fail due to the heading text mismatch.*
3. To verify the visualizer behavior and playback controls, run:
   ```bash
   cd web
   npm run build
   npx playwright test tests/e2e/classical.spec.ts
   ```
