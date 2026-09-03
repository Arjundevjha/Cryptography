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
  substitutionDecrypt
} from '../../app/utils/ciphers';

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
