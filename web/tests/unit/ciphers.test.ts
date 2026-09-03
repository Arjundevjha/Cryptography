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
  it('should clean polybius key by replacing j with i and lowercasing', () => {
    expect(cleanPolybiusKey('ABCDEFGHJKLMNOPQRSTUVWXYZ')).toBe('abcdefghiklmnopqrstuvwxyz');
    expect(cleanPolybiusKey('')).toBe('abcdefghiklmnopqrstuvwxyz');
  });

  it('should return correct coordinates for letters in standard grid', () => {
    expect(getPolybiusCoords('A', '')).toEqual({ row: 1, col: 1 });
    expect(getPolybiusCoords('L', '')).toEqual({ row: 3, col: 1 });
    expect(getPolybiusCoords('Z', '')).toEqual({ row: 5, col: 5 });
    expect(getPolybiusCoords('J', '')).toEqual({ row: 2, col: 4 }); // 'J' maps to 'I'
  });

  it('should return null for characters not present in key grid or invalid failure modes', () => {
    expect(getPolybiusCoords('1', '')).toBeNull();
    expect(getPolybiusCoords('!', '')).toBeNull();
    expect(getPolybiusCoords(' ', '')).toBeNull();
    expect(getPolybiusCoords('#', 'abcdefghiklmnopqrstuvwxyz')).toBeNull();
    expect(getPolybiusCoords('z', 'abcdefghiklmnopqrstuvwxy')).toBeNull(); // custom 24-letter key missing 'z'
    expect(getPolybiusCoords('a', 'bcdefghiklmnopqrstuvwxyz')).toBeNull(); // custom key missing 'a'
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
    expect(validateRsaParams(3, 5, 3)).toEqual({ isValid: true });
  });

  it('should reject non-prime p or p <= 2', () => {
    const res1 = validateRsaParams(2, 53, 17);
    expect(res1.isValid).toBe(false);
    expect(res1.error).toBe('p must be a prime greater than 2');

    const res2 = validateRsaParams(4, 53, 17);
    expect(res2.isValid).toBe(false);
    expect(res2.error).toBe('p must be a prime greater than 2');

    const res3 = validateRsaParams(-5, 53, 17);
    expect(res3.isValid).toBe(false);
    expect(res3.error).toBe('p must be a prime greater than 2');
  });

  it('should reject non-prime q or q <= 2', () => {
    const res1 = validateRsaParams(61, 2, 17);
    expect(res1.isValid).toBe(false);
    expect(res1.error).toBe('q must be a prime greater than 2');

    const res2 = validateRsaParams(61, 15, 17);
    expect(res2.isValid).toBe(false);
    expect(res2.error).toBe('q must be a prime greater than 2');
  });

  it('should reject when p and q are equal', () => {
    const res = validateRsaParams(61, 61, 17);
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('p and q must be distinct');
  });

  it('should reject non-coprime e or e <= 1', () => {
    const res1 = validateRsaParams(61, 53, 13); // gcd(13, 3120) = 13 != 1
    expect(res1.isValid).toBe(false);
    expect(res1.error).toBe('e must be coprime to phi');

    const res2 = validateRsaParams(61, 53, 1);
    expect(res2.isValid).toBe(false);
    expect(res2.error).toBe('e must be coprime to phi');

    const res3 = validateRsaParams(61, 53, 0);
    expect(res3.isValid).toBe(false);
    expect(res3.error).toBe('e must be coprime to phi');
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
