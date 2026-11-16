export interface LetterFrequency {
  letter: string;
  count: number;
  percentage: number;
  englishExpected: number;
}

export interface CaesarCandidate {
  shift: number;
  chiSquared: number;
  preview: string;
}

export interface AffineCandidate {
  a: number;
  b: number;
  chiSquared: number;
  preview: string;
}

export interface VigenereCandidate {
  key: string;
  keyLength: number;
  chiSquared: number;
  preview: string;
}

export const ENGLISH_FREQUENCIES: Record<string, number> = {
  A: 8.167, B: 1.492, C: 2.782, D: 4.253, E: 12.702, F: 2.228, G: 2.015,
  H: 6.094, I: 6.966, J: 0.153, K: 0.772, L: 4.025, M: 2.406, N: 6.749,
  O: 7.507, P: 1.929, Q: 0.095, R: 5.987, S: 6.327, T: 9.056, U: 2.758,
  V: 0.978, W: 2.360, X: 0.150, Y: 1.974, Z: 0.074,
};

const VALID_AFFINE_A = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

export function computeLetterFrequencies(text: string): {
  frequencies: LetterFrequency[];
  totalLetters: number;
} {
  const counts: Record<string, number> = {};
  let totalLetters = 0;
  const upper = text.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    const code = upper.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      const ch = upper[i];
      counts[ch] = (counts[ch] || 0) + 1;
      totalLetters++;
    }
  }

  const frequencies: LetterFrequency[] = [];
  for (let code = 65; code <= 90; code++) {
    const letter = String.fromCharCode(code);
    const count = counts[letter] || 0;
    frequencies.push({
      letter,
      count,
      percentage: totalLetters > 0 ? (count / totalLetters) * 100 : 0,
      englishExpected: ENGLISH_FREQUENCIES[letter],
    });
  }

  return { frequencies, totalLetters };
}

export function computeIndexOfCoincidence(text: string): number {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const n = clean.length;
  if (n < 2) return 0;

  const counts: Record<string, number> = {};
  for (const ch of clean) {
    counts[ch] = (counts[ch] || 0) + 1;
  }

  let sum = 0;
  for (const count of Object.values(counts)) {
    sum += count * (count - 1);
  }
  return sum / (n * (n - 1));
}

export function chiSquaredScore(text: string): number {
  const { frequencies, totalLetters } = computeLetterFrequencies(text);
  if (totalLetters === 0) return Infinity;

  let score = 0;
  for (const item of frequencies) {
    const expected = (item.englishExpected / 100) * totalLetters;
    if (expected > 0) {
      const diff = item.count - expected;
      score += (diff * diff) / expected;
    }
  }
  return score;
}

function shiftText(text: string, shift: number): string {
  const norm = ((shift % 26) + 26) % 26;
  return text
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 - norm + 26) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 - norm + 26) % 26) + 97);
      }
      return ch;
    })
    .join('');
}

export function crackCaesarCandidates(ciphertext: string, topN = 3): CaesarCandidate[] {
  if (!ciphertext.replace(/[^A-Za-z]/g, '')) return [];
  const results: CaesarCandidate[] = [];
  for (let shift = 0; shift < 26; shift++) {
    const preview = shiftText(ciphertext, shift);
    results.push({
      shift,
      chiSquared: chiSquaredScore(preview),
      preview,
    });
  }
  return results.sort((a, b) => a.chiSquared - b.chiSquared).slice(0, topN);
}

function modInverse(a: number, m: number): number {
  const normA = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) {
    if ((normA * x) % m === 1) return x;
  }
  return 1;
}

function affineDecryptText(text: string, a: number, b: number): string {
  const aInv = modInverse(a, 26);
  return text
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        const y = code - 65;
        return String.fromCharCode((((aInv * (y - b)) % 26 + 26) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        const y = code - 97;
        return String.fromCharCode((((aInv * (y - b)) % 26 + 26) % 26) + 97);
      }
      return ch;
    })
    .join('');
}

export function crackAffineCandidates(ciphertext: string, topN = 3): AffineCandidate[] {
  if (!ciphertext.replace(/[^A-Za-z]/g, '')) return [];
  const results: AffineCandidate[] = [];
  for (const a of VALID_AFFINE_A) {
    for (let b = 0; b < 26; b++) {
      const preview = affineDecryptText(ciphertext, a, b);
      results.push({
        a,
        b,
        chiSquared: chiSquaredScore(preview),
        preview,
      });
    }
  }
  return results.sort((a, b) => a.chiSquared - b.chiSquared).slice(0, topN);
}

export function crackVigenereCandidate(ciphertext: string, maxKeyLen = 8): VigenereCandidate | null {
  const clean = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
  if (clean.length < 4) return null;

  let bestCandidate: VigenereCandidate | null = null;
  const limit = Math.min(maxKeyLen, Math.floor(clean.length / 2));

  for (let keyLength = 1; keyLength <= Math.max(1, limit); keyLength++) {
    let key = '';
    for (let col = 0; col < keyLength; col++) {
      let slice = '';
      for (let i = col; i < clean.length; i += keyLength) {
        slice += clean[i];
      }
      const bestShift = crackCaesarCandidates(slice, 1)[0]?.shift ?? 0;
      key += String.fromCharCode(65 + bestShift);
    }

    // Decrypt full text preserving non-alpha
    let keyIdx = 0;
    const preview = ciphertext
      .split('')
      .map((ch) => {
        const code = ch.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          const shift = key.charCodeAt(keyIdx % keyLength) - 65;
          keyIdx++;
          return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
        }
        if (code >= 97 && code <= 122) {
          const shift = key.charCodeAt(keyIdx % keyLength) - 65;
          keyIdx++;
          return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
        }
        return ch;
      })
      .join('');

    const score = chiSquaredScore(preview);
    // Slight Occam penalty for longer keys to prefer shorter repeating keys when tied
    const adjustedScore = score + keyLength * 1.5;
    if (!bestCandidate || adjustedScore < bestCandidate.chiSquared) {
      bestCandidate = { key, keyLength, chiSquared: adjustedScore, preview };
    }
  }

  return bestCandidate;
}

export function suggestSubstitutionKey(ciphertext: string): string {
  const { frequencies } = computeLetterFrequencies(ciphertext);
  const englishOrder = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';
  const sortedCipher = [...frequencies]
    .sort((a, b) => b.count - a.count)
    .map((f) => f.letter);

  // Build key[plainIndex] = cipherLetter
  const mapping: Record<string, string> = {};
  for (let i = 0; i < 26; i++) {
    mapping[englishOrder[i]] = sortedCipher[i];
  }
  return Array.from({ length: 26 }, (_, i) => mapping[String.fromCharCode(65 + i)]).join('');
}
