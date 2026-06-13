/**
 * Caesar cipher implementation.
 */
export function caesarEncrypt(plaintext: string, shift: number): string {
  const normalizedShift = ((shift % 26) + 26) % 26;
  let result = '';
  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    if (/[a-zA-Z]/.test(char)) {
      const isUpper = char === char.toUpperCase();
      const base = isUpper ? 65 : 97;
      const charCode = char.charCodeAt(0);
      const newChar = String.fromCharCode(((charCode - base + normalizedShift) % 26) + base);
      result += newChar;
    } else {
      result += char;
    }
  }
  return result;
}

export function caesarDecrypt(ciphertext: string, shift: number): string {
  const normalizedShift = ((shift % 26) + 26) % 26;
  return caesarEncrypt(ciphertext, 26 - normalizedShift);
}

/**
 * Vigenere cipher helper: pads/cycles the key to match input length.
 */
export function padVigenereKey(text: string, key: string): string {
  if (!key) return '';
  let paddedKey = '';
  let keyIndex = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (/[a-zA-Z]/.test(char)) {
      paddedKey += key[keyIndex % key.length];
      keyIndex++;
    } else {
      paddedKey += ' ';
    }
  }
  return paddedKey;
}

/**
 * Vigenere cipher implementation.
 */
export function vigenereEncrypt(plaintext: string, key: string): string {
  if (!key) return plaintext;
  const paddedKey = padVigenereKey(plaintext, key);
  let result = '';
  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    const keyChar = paddedKey[i];
    if (/[a-zA-Z]/.test(char)) {
      const isUpper = char === char.toUpperCase();
      const base = isUpper ? 65 : 97;
      const keyBase = keyChar === keyChar.toUpperCase() ? 65 : 97;
      
      const charCode = char.charCodeAt(0) - base;
      const keyCode = keyChar.toLowerCase().charCodeAt(0) - 97;
      
      const encryptedCode = (charCode + keyCode) % 26;
      result += String.fromCharCode(encryptedCode + base);
    } else {
      result += char;
    }
  }
  return result;
}

export function vigenereDecrypt(ciphertext: string, key: string): string {
  if (!key) return ciphertext;
  const paddedKey = padVigenereKey(ciphertext, key);
  let result = '';
  for (let i = 0; i < ciphertext.length; i++) {
    const char = ciphertext[i];
    const keyChar = paddedKey[i];
    if (/[a-zA-Z]/.test(char)) {
      const isUpper = char === char.toUpperCase();
      const base = isUpper ? 65 : 97;
      
      const charCode = char.charCodeAt(0) - base;
      const keyCode = keyChar.toLowerCase().charCodeAt(0) - 97;
      
      const decryptedCode = (charCode - keyCode + 26) % 26;
      result += String.fromCharCode(decryptedCode + base);
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Polybius grid key cleaner.
 */
export function cleanPolybiusKey(key: string): string {
  const cleanKey = key.trim() === "" ? "abcdefghiklmnopqrstuvwxyz" : key;
  return cleanKey.toLowerCase().replace(/j/g, "i");
}

/**
 * Get Polybius coordinates for a character.
 */
export function getPolybiusCoords(char: string, key: string): { row: number; col: number } | null {
  const cleanKey = cleanPolybiusKey(key);
  const charClean = char.toLowerCase().replace(/j/g, "i");
  const idx = cleanKey.indexOf(charClean);
  if (idx === -1) return null;
  return {
    row: Math.floor(idx / 5) + 1,
    col: (idx % 5) + 1
  };
}

/**
 * Enigma double-stepping rotor positions calculator.
 */
export function enigmaStepRotors(initial: string[], step: number, rotors: string): string[] {
  let pos1 = initial[0]?.charCodeAt(0) - 65 || 0;
  let pos2 = initial[1]?.charCodeAt(0) - 65 || 0;
  let pos3 = initial[2]?.charCodeAt(0) - 65 || 0;
  
  const rotorList = rotors.split("-").map(r => r.trim().toUpperCase());
  const notches: Record<string, number> = {
    I: 16, II: 22, III: 21, IV: 9, V: 25, VI: 12, VII: 25, VIII: 12
  };
  
  const n1 = notches[rotorList[0]] || 16;
  const n2 = notches[rotorList[1]] || 22;
  const n3 = notches[rotorList[2]] || 21;
  
  for (let s = 0; s < step; s++) {
    if (pos2 === n2 && pos3 === n3) {
      pos1 = (pos1 + 1) % 26;
      pos2 = (pos2 + 1) % 26;
      pos3 = (pos3 + 1) % 26;
    } else if (pos2 === n2) {
      pos1 = (pos1 + 1) % 26;
      pos2 = (pos2 + 1) % 26;
      pos3 = (pos3 + 1) % 26;
    } else if (pos3 === n3) {
      pos2 = (pos2 + 1) % 26;
      pos3 = (pos3 + 1) % 26;
    } else {
      pos3 = (pos3 + 1) % 26;
    }
  }
  return [String.fromCharCode(pos1 + 65), String.fromCharCode(pos2 + 65), String.fromCharCode(pos3 + 65)];
}

/**
 * Validate AES key length and hex characters.
 */
export function validateAesKey(key: string, format: 'text' | 'hex'): { isValid: boolean; error?: string } {
  if (format === 'hex') {
    if (!/^[0-9a-fA-F]*$/.test(key)) {
      return { isValid: false, error: 'Key contains invalid non-hex characters' };
    }
    if (key.length !== 32 && key.length !== 64) {
      return { isValid: false, error: 'Hex key must be 32 characters (16 bytes) or 64 characters (32 bytes)' };
    }
  } else {
    if (key.length !== 16 && key.length !== 32) {
      return { isValid: false, error: 'Text key must be 16 or 32 characters' };
    }
  }
  return { isValid: true };
}

/**
 * Simple primality check for numbers.
 */
function isPrimeTypeScript(val: number): boolean {
  if (val < 2) return false;
  if (val === 2 || val === 3) return true;
  if (val % 2 === 0 || val % 3 === 0) return false;
  for (let i = 5; i * i <= val; i += 6) {
    if (val % i === 0 || val % (i + 2) === 0) return false;
  }
  return true;
}

/**
 * Validate RSA key generation params p, q, and exponent e.
 */
export function validateRsaParams(p: number, q: number, e: number): { isValid: boolean; error?: string } {
  if (p <= 2 || !isPrimeTypeScript(p)) {
    return { isValid: false, error: 'p must be a prime greater than 2' };
  }
  if (q <= 2 || !isPrimeTypeScript(q)) {
    return { isValid: false, error: 'q must be a prime greater than 2' };
  }
  const phi = (p - 1) * (q - 1);
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  if (gcd(e, phi) !== 1) {
    return { isValid: false, error: 'e must be coprime to phi' };
  }
  return { isValid: true };
}

/**
 * Calculate SHA-256 padding values for a message of given byte length.
 */
export function sha256PadDescription(messageLenBytes: number): {
  messageLenBits: number;
  paddingBits: number;
  totalLenBytes: number;
  blockCount: number;
} {
  const messageLenBits = messageLenBytes * 8;
  let paddingBits = (448 - (messageLenBits + 1)) % 512;
  if (paddingBits < 0) {
    paddingBits += 512;
  }
  const totalLenBytes = Math.ceil((messageLenBits + 1 + paddingBits + 64) / 8);
  const blockCount = Math.ceil(totalLenBytes / 64);
  return {
    messageLenBits,
    paddingBits,
    totalLenBytes,
    blockCount
  };
}

