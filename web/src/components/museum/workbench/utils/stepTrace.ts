import { enigmaStepRotors } from '../../../../../app/utils/ciphers';

interface PlayfairGridCell {
  letter: string;
  row: number;
  col: number;
}

export interface PlayfairStep {
  index: number;
  pair: [string, string];
  pos1: { row: number; col: number };
  pos2: { row: number; col: number };
  outPair: [string, string];
  outPos1: { row: number; col: number };
  outPos2: { row: number; col: number };
  rule: 'Same Row' | 'Same Column' | 'Rectangle';
}

export interface PlayfairTrace {
  grid: string[][];
  steps: PlayfairStep[];
}

export function buildPlayfairTrace(text: string, key: string): PlayfairTrace {
  const cleanKey = (key || 'MONARCHY')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .replace(/J/g, 'I');

  const seen = new Set<string>();
  const letters: string[] = [];
  for (const ch of cleanKey + 'ABCDEFGHIKLMNOPQRSTUVWXYZ') {
    if (!seen.has(ch)) {
      seen.add(ch);
      letters.push(ch);
    }
  }

  const grid: string[][] = [];
  const coords = new Map<string, { row: number; col: number }>();
  for (let r = 0; r < 5; r++) {
    const row: string[] = [];
    for (let c = 0; c < 5; c++) {
      const ch = letters[r * 5 + c];
      row.push(ch);
      coords.set(ch, { row: r, col: c });
    }
    grid.push(row);
  }

  const cleanText = (text || 'HELLO')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .replace(/J/g, 'I');

  const digraphs: [string, string][] = [];
  let i = 0;
  while (i < cleanText.length) {
    const a = cleanText[i];
    const b = cleanText[i + 1];
    if (!b) {
      digraphs.push([a, 'X']);
      i += 1;
    } else if (a === b) {
      digraphs.push([a, 'X']);
      i += 1;
    } else {
      digraphs.push([a, b]);
      i += 2;
    }
  }

  const steps: PlayfairStep[] = digraphs.map(([a, b], idx) => {
    const p1 = coords.get(a) || { row: 0, col: 0 };
    const p2 = coords.get(b) || { row: 0, col: 0 };

    let outPos1: { row: number; col: number };
    let outPos2: { row: number; col: number };
    let rule: PlayfairStep['rule'];

    if (p1.row === p2.row) {
      rule = 'Same Row';
      outPos1 = { row: p1.row, col: (p1.col + 1) % 5 };
      outPos2 = { row: p2.row, col: (p2.col + 1) % 5 };
    } else if (p1.col === p2.col) {
      rule = 'Same Column';
      outPos1 = { row: (p1.row + 1) % 5, col: p1.col };
      outPos2 = { row: (p2.row + 1) % 5, col: p2.col };
    } else {
      rule = 'Rectangle';
      outPos1 = { row: p1.row, col: p2.col };
      outPos2 = { row: p2.row, col: p1.col };
    }

    return {
      index: idx,
      pair: [a, b],
      pos1: p1,
      pos2: p2,
      outPair: [grid[outPos1.row][outPos1.col], grid[outPos2.row][outPos2.col]],
      outPos1,
      outPos2,
      rule,
    };
  });

  return { grid, steps };
}

export interface EnigmaStepInfo {
  index: number;
  inputChar: string;
  plugboardIn: string;
  rotorPositions: string[];
  reflector: string;
  plugboardOut: string;
}

export function buildEnigmaTrace(
  text: string,
  initialPositions: string[],
  rotors: string[],
  reflector: string,
  plugboard: string
): EnigmaStepInfo[] {
  const clean = (text || 'HELLO').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 16);
  const plugMap = new Map<string, string>();
  const pairs = plugboard.trim().toUpperCase().split(/\s+/).filter(Boolean);
  for (const pair of pairs) {
    if (pair.length === 2 && /^[A-Z]{2}$/.test(pair)) {
      plugMap.set(pair[0], pair[1]);
      plugMap.set(pair[1], pair[0]);
    }
  }

  const rotorStr = rotors.join('-');
  return clean.split('').map((ch, idx) => {
    const stepped = enigmaStepRotors(initialPositions, idx + 1, rotorStr);
    const plugIn = plugMap.get(ch) || ch;
    return {
      index: idx,
      inputChar: ch,
      plugboardIn: plugIn,
      rotorPositions: stepped,
      reflector,
      plugboardOut: plugMap.get(plugIn) ? `${plugIn} ↔ ${plugMap.get(plugIn)}` : `${plugIn} (unswapped)`,
    };
  });
}

export function buildAesStateMatrix(text: string): string[][] {
  const bytes: string[] = [];
  const src = text || 'HELLO MUSEUM';
  for (let i = 0; i < 16; i++) {
    const code = i < src.length ? src.charCodeAt(i) & 0xff : 0x00;
    bytes.push(code.toString(16).toUpperCase().padStart(2, '0'));
  }
  // AES state matrix is column-major 4x4
  const matrix: string[][] = Array.from({ length: 4 }, () => Array(4).fill('00'));
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      matrix[row][col] = bytes[col * 4 + row];
    }
  }
  return matrix;
}

export function safeModPow(base: number, exp: number, mod: number): number {
  if (mod <= 1) return 0;
  let res = 1;
  let b = ((base % mod) + mod) % mod;
  let e = Math.max(0, Math.floor(exp));
  while (e > 0) {
    if (e % 2 === 1) res = (res * b) % mod;
    b = (b * b) % mod;
    e = Math.floor(e / 2);
  }
  return res;
}
