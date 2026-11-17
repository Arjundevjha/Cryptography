import {
  caesarEncrypt,
  caesarDecrypt,
  vigenereEncrypt,
  vigenereDecrypt,
  cleanPolybiusKey,
  getPolybiusCoords,
  enigmaStepRotors,
  validateAesKey,
  validateRsaParams,
  sha256PadDescription,
  playfairEncrypt,
  playfairDecrypt,
  generatePlayfairGrid,
  substitutionEncrypt,
  substitutionDecrypt,
  computeLetterFrequencies,
  chiSquaredScore,
  indexOfCoincidence,
  estimateVigenereKeyLength,
  crackCaesar,
  affineEncrypt,
  affineDecrypt,
  crackAffine,
  tracePlayfairEncrypt,
  modPow,
  traceDiffieHellman,
  traceEnigmaSteps,
  getAesRoundSchedule,
  pkcs7PadBlocks,
  compareAesBlockModes,
  schnorrPublicKey,
  schnorrCommit,
  schnorrRespond,
  schnorrVerify,
  traceSchnorrZkp,
  traceToyMlKem
} from '../../app/utils/ciphers';
import { MUSEUM_EXHIBITS } from '../../src/components/museum/museumData';

describe('Caesar Cipher Adapter', () => {
  it('should encrypt standard text correctly', () => {
    expect(caesarEncrypt('HELLO', 3)).toBe('KHOOR');
  });

  it('should decrypt standard text correctly', () => {
    expect(caesarDecrypt('KHOOR', 3)).toBe('HELLO');
  });

  it('should handle zero shift', () => {
    expect(caesarEncrypt('NO CHANGE', 0)).toBe('NO CHANGE');
  });

  it('should preserve case and non-alphabetic characters', () => {
    expect(caesarEncrypt('Caesar Cipher 123', 5)).toBe('Hfjxfw Hnumjw 123');
  });

  it('should handle negative shift', () => {
    expect(caesarEncrypt('HELLO', -5)).toBe('CZGGJ');
  });

  it('should handle large shift', () => {
    expect(caesarEncrypt('HELLO', 1000)).toBe('TQXXA');
  });

  it('should handle empty string', () => {
    expect(caesarEncrypt('', 5)).toBe('');
    expect(caesarDecrypt('', 5)).toBe('');
  });
});

describe('Vigenere Cipher Adapter', () => {
  it('should encrypt standard text correctly', () => {
    expect(vigenereEncrypt('ATTACKATDAWN', 'LEMON')).toBe('LXFOPVEFRNHR');
  });

  it('should decrypt standard text correctly', () => {
    expect(vigenereDecrypt('LXFOPVEFRNHR', 'LEMON')).toBe('ATTACKATDAWN');
  });

  it('should be case-insensitive for key', () => {
    const outputLowerKey = vigenereEncrypt('hello', 'kEy');
    const outputUpperKey = vigenereEncrypt('hello', 'KEY');
    expect(outputLowerKey).toBe(outputUpperKey);
  });

  it('should preserve special characters and case', () => {
    expect(vigenereEncrypt('HELLO WORLD!', 'KEY')).toBe('RIJVS UYVJN!');
  });
});

describe('Polybius Helper Functions', () => {
  describe('cleanPolybiusKey', () => {
    it('should clean polybius key by replacing j with i and lowercasing', () => {
      expect(cleanPolybiusKey('ABCDEFGHJKLMNOPQRSTUVWXYZ')).toBe('abcdefghiklmnopqrstuvwxyz');
      expect(cleanPolybiusKey('')).toBe('abcdefghiklmnopqrstuvwxyz');
      expect(cleanPolybiusKey('   ')).toBe('abcdefghiklmnopqrstuvwxyz');
      expect(cleanPolybiusKey('JuLiEt')).toBe('iuliet');
    });
  });

  describe('getPolybiusCoords', () => {
    it('should return correct coordinates for letters in standard grid (both upper and lower case)', () => {
      // First position (row 1, col 1)
      expect(getPolybiusCoords('A', '')).toEqual({ row: 1, col: 1 });
      expect(getPolybiusCoords('a', '')).toEqual({ row: 1, col: 1 });

      // End of row 1 (row 1, col 5)
      expect(getPolybiusCoords('e', '')).toEqual({ row: 1, col: 5 });

      // Start of row 2 (row 2, col 1)
      expect(getPolybiusCoords('f', '')).toEqual({ row: 2, col: 1 });

      // Middle grid position
      expect(getPolybiusCoords('L', '')).toEqual({ row: 3, col: 1 });
      expect(getPolybiusCoords('m', '')).toEqual({ row: 3, col: 2 });

      // Last position (row 5, col 5)
      expect(getPolybiusCoords('Z', '')).toEqual({ row: 5, col: 5 });
      expect(getPolybiusCoords('z', '')).toEqual({ row: 5, col: 5 });
    });

    it('should treat J and I as equivalent, returning the same coordinates', () => {
      const iCoords = getPolybiusCoords('I', '');
      const jCoords = getPolybiusCoords('J', '');
      expect(iCoords).toEqual({ row: 2, col: 4 });
      expect(jCoords).toEqual({ row: 2, col: 4 });
      expect(getPolybiusCoords('i', '')).toEqual(getPolybiusCoords('j', ''));
    });

    it('should calculate correct coordinates when a custom key is provided', () => {
      // Custom 25-letter key starting with "keyword"
      const customKey = 'keywordabcfghilmnpqstuvxz';
      // 'k' should be at (row 1, col 1)
      expect(getPolybiusCoords('k', customKey)).toEqual({ row: 1, col: 1 });
      expect(getPolybiusCoords('e', customKey)).toEqual({ row: 1, col: 2 });
      expect(getPolybiusCoords('y', customKey)).toEqual({ row: 1, col: 3 });
      expect(getPolybiusCoords('w', customKey)).toEqual({ row: 1, col: 4 });
      expect(getPolybiusCoords('o', customKey)).toEqual({ row: 1, col: 5 });
      expect(getPolybiusCoords('r', customKey)).toEqual({ row: 2, col: 1 });
      expect(getPolybiusCoords('d', customKey)).toEqual({ row: 2, col: 2 });
    });

    it('should handle custom keys containing uppercase letters and J', () => {
      const customKeyWithJ = 'KEYWORDJABCFGHILMNPQSTUVXZ';
      // 'J' is converted to 'I' in cleanPolybiusKey, index 7 -> row 2, col 3
      expect(getPolybiusCoords('j', customKeyWithJ)).toEqual({ row: 2, col: 3 });
      expect(getPolybiusCoords('i', customKeyWithJ)).toEqual({ row: 2, col: 3 });
    });

    it('should return null for empty input or multi-character inputs', () => {
      expect(getPolybiusCoords('', '')).toBeNull();
      expect(getPolybiusCoords('AB', '')).toBeNull();
      expect(getPolybiusCoords('hello', '')).toBeNull();
    });

    it('should return null for non-alphabetic characters and characters not present in grid', () => {
      expect(getPolybiusCoords('1', '')).toBeNull();
      expect(getPolybiusCoords('!', '')).toBeNull();
      expect(getPolybiusCoords(' ', '')).toBeNull();
      expect(getPolybiusCoords('\t', '')).toBeNull();
      expect(getPolybiusCoords('\n', '')).toBeNull();
      expect(getPolybiusCoords('#', 'abcdefghiklmnopqrstuvwxyz')).toBeNull();
      expect(getPolybiusCoords('z', 'abcdefghiklmnopqrstuvwxy')).toBeNull(); // 24-letter key missing 'z'
      expect(getPolybiusCoords('a', 'bcdefghiklmnopqrstuvwxyz')).toBeNull(); // key missing 'a'
    });
  });
});

describe('Enigma Step Rotors Function', () => {
  it('should step right rotor normally', () => {
    // Rotors: I-II-III, Positions: A-A-A, step 1 step
    // Right rotor notch for III is V (21). A is 0, so it doesn't step middle.
    expect(enigmaStepRotors(['A', 'A', 'A'], 1, 'I-II-III')).toEqual(['A', 'A', 'B']);
  });

  it('should double-step rotors correctly when hitting notch', () => {
    // Notch for III is V. When right rotor steps from V to W, middle rotor steps.
    // Notch for II is W. Double step happens.
    expect(enigmaStepRotors(['A', 'D', 'U'], 1, 'I-II-III')).toEqual(['A', 'D', 'V']);
  });
});

describe('AES Key Validation', () => {
  it('should validate text keys of correct lengths', () => {
    expect(validateAesKey('1234567890123456', 'text')).toEqual({ isValid: true });
    expect(validateAesKey('12345678901234561234567890123456', 'text')).toEqual({ isValid: true });
    expect(validateAesKey('invalid', 'text').isValid).toBe(false);
  });

  it('should validate hex keys of correct lengths', () => {
    expect(validateAesKey('12345678901234561234567890123456', 'hex')).toEqual({ isValid: true });
    expect(validateAesKey('g'.repeat(32), 'hex').isValid).toBe(false);
  });
});

describe('RSA Params Validation', () => {
  it('should validate valid prime parameters and coprime e', () => {
    expect(validateRsaParams(61, 53, 17)).toEqual({ isValid: true });
  });

  it('should reject non-prime parameters', () => {
    expect(validateRsaParams(4, 53, 17).isValid).toBe(false);
  });

  it('should reject non-coprime e', () => {
    expect(validateRsaParams(61, 53, 13).isValid).toBe(false);
  });
});

describe('SHA-256 Padding helper', () => {
  it('should calculate correct padding and blocks', () => {
    const res = sha256PadDescription(5); // "hello" (5 bytes)
    expect(res.messageLenBits).toBe(40);
    expect(res.blockCount).toBe(1);
  });

  it('should calculate multiple blocks for long messages', () => {
    const res = sha256PadDescription(70); // > 64 bytes
    expect(res.blockCount).toBe(2);
  });
});

describe('Playfair Cipher', () => {
  it('should generate a correct 5x5 Playfair grid without duplicate letters and with J mapped to I', () => {
    const grid = generatePlayfairGrid('playfair example');
    // 'playfair example' -> 'p', 'l', 'a', 'y', 'f', 'i', 'r', 'e', 'x', 'm' (mapping 'j' to 'i')
    // and then appending remaining letters of the 25-letter alphabet:
    // 'b', 'c', 'd', 'g', 'h', 'k', 'n', 'o', 'q', 's', 't', 'u', 'v', 'w', 'z'
    const expected = [
      'p', 'l', 'a', 'y', 'f', 'i', 'r', 'e', 'x', 'm',
      'b', 'c', 'd', 'g', 'h', 'k', 'n', 'o', 'q', 's',
      't', 'u', 'v', 'w', 'z'
    ];
    expect(grid).toEqual(expected);
  });

  it('should encrypt and decrypt text correctly', () => {
    const key = 'playfair example';
    
    // Case 1: Plaintext with adjacent duplicate letters ('ee' in 'tree')
    const plaintext1 = 'hidethegoldinthetreestump';
    const ciphertext1 = playfairEncrypt(plaintext1, key);
    const decrypted1 = playfairDecrypt(ciphertext1, key);
    expect(decrypted1).toBe('hidethegoldinthetrexestump');

    // Case 2: Plaintext of even length with no duplicate adjacent letters
    const plaintext2 = 'hidethegoldintheroad';
    const ciphertext2 = playfairEncrypt(plaintext2, key);
    const decrypted2 = playfairDecrypt(ciphertext2, key);
    expect(decrypted2).toBe(plaintext2);
  });
});

describe('Substitution Cipher', () => {
  const keyAlphabet = 'zebrascdfghijklmnopqtuvwxy'; // A->Z, B->E, C->B, etc.

  it('should encrypt correctly', () => {
    expect(substitutionEncrypt('flee at once', keyAlphabet)).toBe('siaa zq lkba');
  });

  it('should decrypt correctly', () => {
    expect(substitutionDecrypt('siaa zq lkba', keyAlphabet)).toBe('flee at once');
  });

  it('should preserve case', () => {
    expect(substitutionEncrypt('Flee At Once', keyAlphabet)).toBe('Siaa Zq Lkba');
    expect(substitutionDecrypt('Siaa Zq Lkba', keyAlphabet)).toBe('Flee At Once');
  });

  it('should preserve non-alphabetic characters', () => {
    expect(substitutionEncrypt('flee at once! 123', keyAlphabet)).toBe('siaa zq lkba! 123');
    expect(substitutionDecrypt('siaa zq lkba! 123', keyAlphabet)).toBe('flee at once! 123');
  });
});

describe('Security Input Length & Sanitization', () => {
  it('should throw error when input length exceeds MAX_INPUT_LENGTH limit', () => {
    const longText = 'a'.repeat(100001);
    expect(() => caesarEncrypt(longText, 3)).toThrow('Input text exceeds maximum length limit');
    expect(() => vigenereEncrypt(longText, 'KEY')).toThrow('Input text exceeds maximum length limit');
    expect(() => playfairEncrypt(longText, 'KEY')).toThrow('Input text exceeds maximum length limit');
    expect(() => substitutionEncrypt(longText, 'zebrascdfghijklmnopqtuvwxy')).toThrow('Input text exceeds maximum length limit');
  });

  it('should sanitize non-alphabetic characters in Vigenère key', () => {
    expect(vigenereEncrypt('HELLO', 'K!E@Y#')).toBe(vigenereEncrypt('HELLO', 'KEY'));
    expect(vigenereEncrypt('HELLO', '12345')).toBe('HELLO');
  });
});

describe('Cryptanalysis Helpers', () => {
  const sampleEnglish =
    'Cryptography is the practice and study of techniques for secure communication in the presence of adversarial behavior.';

  it('should compute letter frequencies for 26 letters summing to 100%', () => {
    const freqs = computeLetterFrequencies('AAB!123');
    expect(freqs).toHaveLength(26);
    expect(freqs[0]).toMatchObject({ letter: 'A', count: 2 });
    expect(freqs[0].frequency).toBeCloseTo(66.6667, 2);
    expect(freqs[1]).toMatchObject({ letter: 'B', count: 1 });
    expect(freqs[1].frequency).toBeCloseTo(33.3333, 2);
    const totalFreq = freqs.reduce((acc, e) => acc + e.frequency, 0);
    expect(totalFreq).toBeCloseTo(100, 5);
  });

  it('should return zero frequencies for empty or non-alphabetic input', () => {
    const freqs = computeLetterFrequencies('1234!@#');
    expect(freqs.every((e) => e.count === 0 && e.frequency === 0)).toBe(true);
    expect(chiSquaredScore('1234!@#')).toBe(Infinity);
  });

  it('should score English plaintext lower than shifted ciphertext in chiSquaredScore', () => {
    const shifted = caesarEncrypt(sampleEnglish, 13);
    expect(chiSquaredScore(sampleEnglish)).toBeLessThan(chiSquaredScore(shifted));
  });

  it('should crack Caesar cipher and recover exact shift and plaintext', () => {
    const ciphertext = caesarEncrypt(sampleEnglish, 7);
    const candidates = crackCaesar(ciphertext, 5);
    expect(candidates).toHaveLength(5);
    expect(candidates[0].shift).toBe(7);
    expect(candidates[0].plaintext).toBe(sampleEnglish);
  });

  it('should encrypt, decrypt, and crack Affine cipher', () => {
    const ciphertext = affineEncrypt(sampleEnglish, 5, 8);
    expect(affineDecrypt(ciphertext, 5, 8)).toBe(sampleEnglish);
    expect(() => affineEncrypt('HELLO', 2, 3)).toThrow('must be coprime to 26');

    const candidates = crackAffine(ciphertext, 3);
    expect(candidates).toHaveLength(3);
    expect(candidates[0].a).toBe(5);
    expect(candidates[0].b).toBe(8);
    expect(candidates[0].plaintext).toBe(sampleEnglish);
  });

  it('should compute Index of Coincidence and estimate Vigenere key length', () => {
    const ioc = indexOfCoincidence(sampleEnglish);
    expect(ioc).toBeGreaterThan(0.055);
    expect(indexOfCoincidence('A')).toBe(0);

    const vigenereCipher = vigenereEncrypt(
      sampleEnglish + ' ' + sampleEnglish,
      'LEMON'
    );
    const estimates = estimateVigenereKeyLength(vigenereCipher, 10);
    expect(estimates.length).toBeGreaterThan(0);
    // Key length 5 (or multiple 10) should be among top 2 candidates
    const topTwo = estimates.slice(0, 2).map((e) => e.keyLength);
    expect(topTwo.some((len) => len === 5 || len === 10)).toBe(true);
  });
});

describe('Step-by-Step Inspector Helpers', () => {
  it('should trace Playfair digraph encryption matching playfairEncrypt', () => {
    const trace = tracePlayfairEncrypt('HIDETHEGOLDINTHETREESTUMP', 'playfair example');
    expect(trace.grid).toHaveLength(25);
    expect(trace.ciphertext).toBe(playfairEncrypt('HIDETHEGOLDINTHETREESTUMP', 'playfair example'));
    expect(trace.steps.length).toBeGreaterThan(0);
    expect(trace.steps.every((s) => ['same-row', 'same-col', 'rectangle'].includes(s.rule))).toBe(true);
  });

  it('should compute modPow and Diffie-Hellman shared secret with BigInt', () => {
    expect(modPow(5, 6, 23)).toBe(BigInt(8));
    expect(() => modPow(2, 3, 0)).toThrow('Modulus must be greater than 0');
    expect(() => modPow(2, -1, 5)).toThrow('Exponent must be non-negative');

    const dh = traceDiffieHellman(23, 5, 6, 15);
    expect(dh.publicA).toBe('8');
    expect(dh.publicB).toBe('19');
    expect(dh.sharedSecretAlice).toBe('2');
    expect(dh.sharedSecretBob).toBe('2');

    // Large BigInt test
    const largeDh = traceDiffieHellman(BigInt('2147483647'), BigInt(7), BigInt(123456), BigInt(654321));
    expect(largeDh.sharedSecretAlice).toBe(largeDh.sharedSecretBob);
  });

  it('should trace Enigma rotor stepping including double-step', () => {
    const steps = traceEnigmaSteps('AB', ['A', 'W', 'V'], 'I-II-III');
    expect(steps).toHaveLength(2);
    expect(steps[0].inputChar).toBe('A');
    expect(steps[0].rotorsBefore).toEqual(['A', 'W', 'V']);
    expect(steps[0].rotorsAfter).toEqual(['B', 'X', 'W']);
    expect(steps[0].doubleStepped).toBe(true);
  });

  it('should return AES round schedules for 128, 192, and 256-bit keys', () => {
    const s128 = getAesRoundSchedule(128);
    expect(s128).toHaveLength(11);
    expect(s128[0].operations).toEqual(['AddRoundKey']);
    expect(s128[1].operations).toContain('MixColumns');
    expect(s128[10].operations).not.toContain('MixColumns');

    expect(getAesRoundSchedule(192)).toHaveLength(13);
    expect(getAesRoundSchedule(256)).toHaveLength(15);
  });
});

describe('Museum Exhibits Data Integrity', () => {
  it('should include substitution, hmac-hash, diffie-hellman, rsa-signatures, zkp-schnorr, and post-quantum-kem exhibits with challenges and valid interior camera bounds', () => {
    const ids = MUSEUM_EXHIBITS.map((e) => e.id);
    expect(ids).toContain('substitution');
    expect(ids).toContain('hmac-hash');
    expect(ids).toContain('diffie-hellman');
    expect(ids).toContain('rsa-signatures');
    expect(ids).toContain('zkp-schnorr');
    expect(ids).toContain('post-quantum-kem');

    for (const exhibit of MUSEUM_EXHIBITS) {
      expect(exhibit.challenge).toBeDefined();
      expect(exhibit.challenge?.prompt).toBeTruthy();
      expect(exhibit.challenge?.answer).toBeTruthy();
      // Camera position must be strictly inside room bounds (Z = position.z + 3.5)
      expect(exhibit.cameraPosition[2]).toBeCloseTo(exhibit.position[2] + 3.5, 5);
    }

    // Verify no two exhibit rooms collide (< 20 units apart)
    for (let i = 0; i < MUSEUM_EXHIBITS.length; i++) {
      for (let j = i + 1; j < MUSEUM_EXHIBITS.length; j++) {
        const a = MUSEUM_EXHIBITS[i].position;
        const b = MUSEUM_EXHIBITS[j].position;
        const dist = Math.hypot(a[0] - b[0], a[2] - b[2]);
        expect(dist).toBeGreaterThanOrEqual(20);
      }
    }
  });
});

describe('AES CBC/CTR & PKCS#7 Helpers', () => {
  it('should pad partial and full blocks according to PKCS#7', () => {
    const partial = pkcs7PadBlocks('HELLO', 16);
    expect(partial.padByte).toBe(11);
    expect(partial.bytes).toHaveLength(16);
    expect(partial.paddedHexBlocks).toHaveLength(1);
    expect(partial.bytes.slice(5)).toEqual(new Array(11).fill(11));

    const exact = pkcs7PadBlocks('0123456789ABCDEF', 16);
    expect(exact.padByte).toBe(16);
    expect(exact.bytes).toHaveLength(32);
    expect(exact.paddedHexBlocks).toHaveLength(2);
  });

  it('should reject invalid block sizes', () => {
    expect(() => pkcs7PadBlocks('ABC', 1)).toThrow('Block size must be between 2 and 255 bytes');
  });

  it('should compare CBC vs CTR IV reuse behavior', () => {
    const reused = compareAesBlockModes(['BLOCK_A', 'BLOCK_A', 'BLOCK_B'], true);
    expect(reused.ctrXorLeakPossible).toBe(true);
    expect(reused.cbcIdenticalPrefixCount).toBe(1);
    expect(reused.cbcLeakSummary).toContain('1 matching block');
    expect(reused.ctrLeakSummary).toContain('P1 ⊕ P2');

    const fresh = compareAesBlockModes(['BLOCK_A', 'BLOCK_A'], false);
    expect(fresh.ctrXorLeakPossible).toBe(false);
    expect(fresh.cbcIdenticalPrefixCount).toBe(0);
  });
});

describe('Schnorr ZKP Modular Arithmetic Helpers', () => {
  it('should compute valid Schnorr commitment, response, and verification', () => {
    // Subgroup of order q=11 in Z_23* with generator g=2 (2^11 = 2048 ≡ 1 mod 23)
    const y = schnorrPublicKey(23, 2, 6);
    const t = schnorrCommit(23, 2, 4);
    const s = schnorrRespond(11, 4, 3, 6);
    expect(schnorrVerify(23, 2, y, t, 3, s)).toBe(true);

    const transcript = traceSchnorrZkp(23, 11, 2, 6, 4, 3);
    expect(transcript.valid).toBe(true);
    expect(transcript.lhs).toBe(transcript.rhs);
  });

  it('should reject tampered Schnorr responses', () => {
    const y = schnorrPublicKey(23, 2, 6);
    const t = schnorrCommit(23, 2, 4);
    const s = schnorrRespond(11, 4, 3, 6);
    expect(schnorrVerify(23, 2, y, t, 3, s + BigInt(1))).toBe(false);
  });
});

describe('Toy LWE / ML-KEM Helpers', () => {
  it('should encapsulate and decapsulate both 0 and 1 bits accurately with bounded noise', () => {
    const step1 = traceToyMlKem(97, [12, 25], [3, 2], 1, 2, [1, -1], 1, 1);
    expect(step1.publicB).toBe(87);
    expect(step1.u).toEqual([25, 49]);
    expect(step1.recoveredBit).toBe(1);
    expect(step1.matchedOriginal).toBe(true);

    const step0 = traceToyMlKem(97, [12, 25], [3, 2], 1, 2, [1, -1], 1, 0);
    expect(step0.recoveredBit).toBe(0);
    expect(step0.matchedOriginal).toBe(true);
  });

  it('should reject invalid modulus q < 5', () => {
    expect(() => traceToyMlKem(3, [1, 1], [1, 1], 0, 1, [0, 0], 0, 1)).toThrow('Modulus q must be at least 5');
  });
});
