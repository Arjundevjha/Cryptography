import * as THREE from 'three';

export type ExhibitCategory = 'Classical' | 'Historical' | 'Modern';
export type FoyerMuralTheme = 'classical' | 'historical' | 'modern' | 'evolution';

export interface ExhibitArtSpec {
  id: string;
  title: string;
  category: ExhibitCategory;
  motif: string;
  accentColor: string;
  secondaryColor: string;
  formula: string;
  historicalFact: string;
  cryptanalysisNote: string;
}

export const EXHIBIT_ART_SPECS: Record<string, ExhibitArtSpec> = {
  caesar: {
    id: 'caesar',
    title: 'Caesar Cipher',
    category: 'Classical',
    motif: 'Concentric 26-Letter Shift Ring (+3)',
    accentColor: '#9c5a3c',
    secondaryColor: '#c5a059',
    formula: 'E(x) = (x + k) mod 26',
    historicalFact:
      'Used by Julius Caesar c. 58 BC during the Gallic Wars with a fixed shift of 3 to protect military dispatches.',
    cryptanalysisNote:
      'Only 25 non-trivial shifts exist; broken in milliseconds by brute force or chi-squared frequency matching.',
  },
  affine: {
    id: 'affine',
    title: 'Affine Cipher',
    category: 'Classical',
    motif: 'Coprime Modular Lattice (gcd(a, 26) = 1)',
    accentColor: '#8b4d32',
    secondaryColor: '#b88645',
    formula: 'E(x) = (ax + b) mod 26,  gcd(a, 26) = 1',
    historicalFact:
      'Extends the Caesar shift with a multiplicative slope a chosen from the 12 integers coprime to 26.',
    cryptanalysisNote:
      'Two known plaintext-ciphertext letter pairs yield a linear system mod 26 that recovers both a and b.',
  },
  vigenere: {
    id: 'vigenere',
    title: 'Vigenère Cipher',
    category: 'Classical',
    motif: 'Renaissance Tabula Recta 26x26 Grid',
    accentColor: '#7c3f24',
    secondaryColor: '#c9a252',
    formula: 'C_i = (P_i + K_{i mod m}) mod 26',
    historicalFact:
      'Described by Giovan Battista Bellaso in 1553 and misattributed to Blaise de Vigenère; revered as "le chiffre indéchiffrable".',
    cryptanalysisNote:
      'Kasiski examination and Index of Coincidence reveal key length m, reducing the cipher to m Caesar shifts.',
  },
  playfair: {
    id: 'playfair',
    title: 'Playfair Cipher',
    category: 'Classical',
    motif: 'Victorian 5x5 Digraph Matrix (I/J)',
    accentColor: '#6d3b27',
    secondaryColor: '#b8944f',
    formula: 'Digraph (P_1, P_2) -> Rectangle / Row / Col Shift',
    historicalFact:
      'Invented by Charles Wheatstone in 1854 and championed by Lord Playfair; used by British forces in the Boer War and WWI.',
    cryptanalysisNote:
      'Encrypting letter pairs hides single-letter frequencies, yet 600 digraphs remain vulnerable to bigram frequency analysis.',
  },
  polybius: {
    id: 'polybius',
    title: 'Polybius Square',
    category: 'Classical',
    motif: 'Ancient Greek 5x5 Coordinate Checkerboard',
    accentColor: '#945335',
    secondaryColor: '#d1ad66',
    formula: 'Letter -> (Row in 1..5, Col in 1..5)',
    historicalFact:
      'Devised by Greek historian Polybius c. 150 BC for long-distance torch signaling across mountain watchtowers.',
    cryptanalysisNote:
      'Fractionalization doubles message length into digit pairs, preserving monoalphabetic frequency profiles.',
  },
  scytale: {
    id: 'scytale',
    title: 'Scytale Cipher',
    category: 'Classical',
    motif: 'Spartan Helical Transposition Cylinder',
    accentColor: '#844b30',
    secondaryColor: '#c49d56',
    formula: 'C[i] = P[(i mod d) * rows + floor(i / d)]',
    historicalFact:
      'Used by Spartan commanders c. 400 BC: a parchment strip wound around a wooden baton of diameter d aligned hidden columns.',
    cryptanalysisNote:
      'Pure columnar transposition leaves letter frequencies unchanged; testing candidate cylinder diameters d reveals plaintext.',
  },
  substitution: {
    id: 'substitution',
    title: 'Substitution Cipher',
    category: 'Classical',
    motif: 'Monoalphabetic Frequency Spectrum',
    accentColor: '#753d24',
    secondaryColor: '#c7a055',
    formula: 'E(x) = pi(x),  pi in S_26  (|S_26| = 26!)',
    historicalFact:
      'Al-Kindi pioneered frequency analysis in 9th-century Baghdad, proving that 26! permutations cannot hide language statistics.',
    cryptanalysisNote:
      'English E, T, A, O, I, N peaks and common word patterns quickly collapse the permutation key.',
  },
  enigma: {
    id: 'enigma',
    title: 'Enigma Machine',
    category: 'Historical',
    motif: '3-Rotor Reflector & Plugboard Circuit',
    accentColor: '#3e5746',
    secondaryColor: '#c5a059',
    formula: 'E(x) = P^-1 R_1^-1 R_2^-1 R_3^-1 U R_3 R_2 R_1 P(x)',
    historicalFact:
      'Patented by Arthur Scherbius in 1918 and broken mathematically by Marian Rejewski (1932) and Alan Turing’s Bombe at Bletchley Park.',
    cryptanalysisNote:
      'The reflector U guaranteed reciprocity and forbade any letter from encrypting to itself, enabling crib-based Bombe attacks.',
  },
  lorenz: {
    id: 'lorenz',
    title: 'Lorenz SZ42',
    category: 'Historical',
    motif: '12-Pinwheel Chi/Psi/Mu Baudot XOR Stream',
    accentColor: '#2f4536',
    secondaryColor: '#b79752',
    formula: 'C = P xor Chi xor Psi  (5-bit Baudot ITA2)',
    historicalFact:
      'Protected German High Command teleprinter links ("Tunny") during WWII until Bill Tutte deduced its 12-wheel structure without seeing a machine.',
    cryptanalysisNote:
      'Reusing wheel settings ("depths") allowed C1 xor C2 = P1 xor P2, feeding the Colossus codebreaking computer.',
  },
  rsa: {
    id: 'rsa',
    title: 'RSA Vault',
    category: 'Modern',
    motif: 'Prime Factorization Trapdoor (n = p * q)',
    accentColor: '#3a5268',
    secondaryColor: '#6fa3c7',
    formula: 'C = M^e mod n,  M = C^d mod n,  ed = 1 mod phi(n)',
    historicalFact:
      'Published by Rivest, Shamir, and Adleman in 1977 (independently discovered by Clifford Cocks at GCHQ in 1973).',
    cryptanalysisNote:
      'Small primes fall to Fermat or Pollard’s rho factoring; large moduli require >= 2048 bits and OAEP padding.',
  },
  aes: {
    id: 'aes',
    title: 'AES Vault',
    category: 'Modern',
    motif: '4x4 Byte State Matrix & SPN Rounds',
    accentColor: '#2b4054',
    secondaryColor: '#76a8cc',
    formula: 'State -> AddRoundKey(MixColumns(ShiftRows(SubBytes(S))))',
    historicalFact:
      'Designed by Joan Daemen and Vincent Rijmen as Rijndael and standardized by NIST FIPS 197 in 2001.',
    cryptanalysisNote:
      'Unpadded ECB leaks block patterns and unauthenticated CBC allows bit-flipping; modern deployments use AES-GCM.',
  },
  sha256: {
    id: 'sha256',
    title: 'SHA-256 Vault',
    category: 'Modern',
    motif: '64-Round Merkle-Damgård Compression',
    accentColor: '#334b61',
    secondaryColor: '#7cb0d4',
    formula: 'H_i = H_{i-1} + Compress(H_{i-1}, M_i)  (256-bit)',
    historicalFact:
      'Part of the SHA-2 family published by NIST in 2001, underpinning TLS certificates, code signing, and Bitcoin proof-of-work.',
    cryptanalysisNote:
      'Provides 128-bit collision resistance; vulnerable to length-extension attacks when misused directly as a keyed MAC.',
  },
  'hmac-hash': {
    id: 'hmac-hash',
    title: 'Multi-Hash & HMAC',
    category: 'Modern',
    motif: 'Nested Inner/Outer Pad Compression',
    accentColor: '#2c465c',
    secondaryColor: '#6da2c8',
    formula: 'HMAC(K, m) = H((K' + "'" + ' xor opad) || H((K' + "'" + ' xor ipad) || m))',
    historicalFact:
      'Introduced by Bellare, Canetti, and Krawczyk in 1996 (RFC 2104) to build provably secure message authentication from hash functions.',
    cryptanalysisNote:
      'Double-wrapping defeats length-extension attacks even on Merkle-Damgård hashes like SHA-256 and legacy SHA-1.',
  },
  'diffie-hellman': {
    id: 'diffie-hellman',
    title: 'Diffie-Hellman Exchange',
    category: 'Modern',
    motif: 'Modular Color & Exponent Key Agreement',
    accentColor: '#3b5870',
    secondaryColor: '#7bb2d9',
    formula: 'A = g^a mod p,  B = g^b mod p  =>  S = g^(ab) mod p',
    historicalFact:
      'Published by Whitfield Diffie and Martin Hellman in 1976, launching public-key cryptography over untrusted channels.',
    cryptanalysisNote:
      'Unauthenticated DH is vulnerable to Man-in-the-Middle substitution; real protocols pair DH with digital signatures.',
  },
  'rsa-signatures': {
    id: 'rsa-signatures',
    title: 'RSA Digital Signatures',
    category: 'Modern',
    motif: 'Asymmetric Sign & Verify Dual-Lane Flow',
    accentColor: '#31495e',
    secondaryColor: '#73a6cb',
    formula: 's = H(m)^d mod n,  Verify: H(m) == s^e mod n',
    historicalFact:
      'Standardized in PKCS#1 and PSS to provide authenticity and non-repudiation for software releases and web PKI.',
    cryptanalysisNote:
      'Textbook RSA signatures without randomized PSS padding allow multiplicative existential forgery.',
  },
  'zkp-schnorr': {
    id: 'zkp-schnorr',
    title: 'Schnorr Zero-Knowledge Proof',
    category: 'Modern',
    motif: '3-Pass Commit-Challenge-Response Loop',
    accentColor: '#294257',
    secondaryColor: '#81b6dc',
    formula: 't = g^r,  c <- Z_q,  s = r + c*x mod q  =>  g^s == t * y^c',
    historicalFact:
      'Proposed by Claus-Peter Schnorr in 1989 and adapted via Fiat-Shamir into compact signatures used in Bitcoin Taproot.',
    cryptanalysisNote:
      'Reusing nonce r across two challenges leaks the secret key: x = (s_1 - s_2) / (c_1 - c_2) mod q.',
  },
  'post-quantum-kem': {
    id: 'post-quantum-kem',
    title: 'Post-Quantum ML-KEM',
    category: 'Modern',
    motif: 'Noisy 2D Module-LWE Cryptographic Lattice',
    accentColor: '#243c52',
    secondaryColor: '#88c0e6',
    formula: 't = A*s + e (mod q)   [NIST FIPS 203]',
    historicalFact:
      'Standardized by NIST in 2024 as FIPS 203 (from CRYSTALS-Kyber) to resist quantum computers running Shor’s algorithm.',
    cryptanalysisNote:
      'Bounded noise e prevents Gaussian elimination; Fujisaki-Okamoto transform protects decapsulation against chosen-ciphertext attacks.',
  },
  ecc: {
    id: 'ecc',
    title: 'Elliptic Curve Cryptography',
    category: 'Modern',
    motif: 'Weierstrass Curve Point Addition & Scalar Multiplication',
    accentColor: '#1e4a5f',
    secondaryColor: '#38bdf8',
    formula: 'y^2 = x^3 + ax + b (mod p),  Q = d * G',
    historicalFact:
      'Proposed independently by Neal Koblitz and Victor Miller in 1985; P-256 achieves 128-bit security with 256-bit keys instead of 3072-bit RSA.',
    cryptanalysisNote:
      'Reusing the ECDSA nonce k across two signatures exposes the private key d = (s*k - z) * r^-1 mod n.',
  },
  'otp-chacha20': {
    id: 'otp-chacha20',
    title: 'One-Time Pad & ChaCha20',
    category: 'Modern',
    motif: 'Perfect Secrecy XOR & ARX Quarter-Round Stream',
    accentColor: '#24475a',
    secondaryColor: '#2dd4bf',
    formula: 'OTP: C = P xor K  |  ChaCha20: ARX(a, b, c, d) x 20',
    historicalFact:
      'Shannon proved OTP’s unconditional secrecy in 1949; Bernstein’s ChaCha20 (2008, RFC 8439) delivers constant-time speed in TLS 1.3.',
    cryptanalysisNote:
      'Never reuse a key or nonce: C1 xor C2 = P1 xor P2 collapses stream confidentiality into a two-time pad.',
  },
};

const textureCache = new Map<string, THREE.CanvasTexture>();

function createCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D | null] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  return [canvas, ctx];
}

function configureTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function getCategoryPalette(category: ExhibitCategory, spec?: ExhibitArtSpec) {
  if (category === 'Classical') {
    return {
      bg: '#f6efe2',
      bgInner: '#fbf6ec',
      border: spec?.accentColor ?? '#9c5a3c',
      gold: spec?.secondaryColor ?? '#c5a059',
      ink: '#342014',
      muted: '#6c4d3b',
    };
  }
  if (category === 'Historical') {
    return {
      bg: '#eef1e7',
      bgInner: '#f6f8f1',
      border: spec?.accentColor ?? '#3e5746',
      gold: spec?.secondaryColor ?? '#b99954',
      ink: '#1a281f',
      muted: '#455b4c',
    };
  }
  return {
    bg: '#ebf0f5',
    bgInner: '#f4f8fc',
    border: spec?.accentColor ?? '#3a5268',
    gold: spec?.secondaryColor ?? '#6fa3c7',
    ink: '#15222e',
    muted: '#425b70',
  };
}

function drawArchivalFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: ReturnType<typeof getCategoryPalette>
): void {
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle archival paper vignette
  const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.72);
  grad.addColorStop(0, palette.bgInner);
  grad.addColorStop(1, palette.bg);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Outer & inner museum mat borders
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 8;
  ctx.strokeRect(18, 18, w - 36, h - 36);

  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(30, 30, w - 60, h - 60);

  // Corner brass rivets
  const corners = [
    [42, 42],
    [w - 42, 42],
    [42, h - 42],
    [w - 42, h - 42],
  ];
  ctx.fillStyle = palette.gold;
  corners.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 4
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let linesDrawn = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
      linesDrawn++;
      if (linesDrawn >= maxLines - 1) {
        const remaining = words.slice(i + 1).join(' ');
        const finalLine = remaining ? `${line} ${remaining}` : line;
        ctx.fillText(
          finalLine.length > 58 ? `${finalLine.slice(0, 55)}...` : finalLine,
          x,
          currentY
        );
        return currentY + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

function drawExhibitMotif(
  ctx: CanvasRenderingContext2D,
  exhibitId: string,
  cx: number,
  cy: number,
  palette: ReturnType<typeof getCategoryPalette>
): void {
  ctx.save();
  ctx.strokeStyle = palette.border;
  ctx.fillStyle = palette.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  switch (exhibitId) {
    case 'caesar': {
      // Concentric 26-letter shift rings (+3)
      const outerR = 132;
      const innerR = 90;
      const centerR = 46;
      [outerR, innerR, centerR].forEach((r, idx) => {
        ctx.lineWidth = idx === 0 ? 3 : 2;
        ctx.strokeStyle = idx === 1 ? palette.gold : palette.border;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      ctx.font = 'bold 11px Georgia, serif';
      for (let i = 0; i < 26; i++) {
        const angle = (i / 26) * Math.PI * 2 - Math.PI / 2;
        const ox = cx + Math.cos(angle) * 112;
        const oy = cy + Math.sin(angle) * 112;
        const ix = cx + Math.cos(angle) * 68;
        const iy = cy + Math.sin(angle) * 68;
        ctx.fillStyle = palette.ink;
        ctx.fillText(letters[i], ox, oy);
        ctx.fillStyle = palette.border;
        ctx.fillText(letters[(i + 3) % 26], ix, iy);
      }
      ctx.font = 'bold 18px Georgia, serif';
      ctx.fillStyle = palette.border;
      ctx.fillText('+3', cx, cy - 6);
      ctx.font = '11px Georgia, serif';
      ctx.fillText('A -> D', cx, cy + 14);
      break;
    }

    case 'affine': {
      // Coprime modular lattice & slope line E(x) = (5x + 8) mod 26
      const gridSize = 210;
      const x0 = cx - gridSize / 2;
      const y0 = cy - gridSize / 2;
      ctx.strokeStyle = 'rgba(120, 90, 70, 0.25)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 6; i++) {
        const p = (i / 6) * gridSize;
        ctx.beginPath();
        ctx.moveTo(x0 + p, y0);
        ctx.lineTo(x0 + p, y0 + gridSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x0, y0 + p);
        ctx.lineTo(x0 + gridSize, y0 + p);
        ctx.stroke();
      }
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x0, y0, gridSize, gridSize);

      // Coprime points & linear congruence wrap-around segments
      ctx.strokeStyle = palette.gold;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x <= 6; x++) {
        const px = x0 + (x / 6) * gridSize;
        const yVal = ((x * 5 + 2) % 7) / 6;
        const py = y0 + gridSize - yVal * gridSize;
        if (x === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
        ctx.fillStyle = palette.border;
        ctx.fillRect(px - 4, py - 4, 8, 8);
      }
      ctx.stroke();
      ctx.font = 'bold 13px Georgia, serif';
      ctx.fillStyle = palette.ink;
      ctx.fillText('gcd(a, 26) = 1  |  12 Coprime Slopes', cx, y0 + gridSize + 22);
      break;
    }

    case 'vigenere': {
      // Tabula Recta 9x9 archival excerpt with highlighted key intersection
      const cells = 9;
      const cell = 24;
      const startX = cx - (cells * cell) / 2;
      const startY = cy - (cells * cell) / 2;
      const alpha = 'ABCDEFGHI';
      for (let r = 0; r < cells; r++) {
        for (let c = 0; c < cells; c++) {
          const rx = startX + c * cell;
          const ry = startY + r * cell;
          const isHighlight = r === 3 || c === 4;
          const isIntersect = r === 3 && c === 4;
          ctx.fillStyle = isIntersect
            ? palette.border
            : isHighlight
            ? 'rgba(197, 160, 89, 0.25)'
            : 'rgba(255, 255, 255, 0.45)';
          ctx.fillRect(rx, ry, cell, cell);
          ctx.strokeStyle = palette.border;
          ctx.lineWidth = 1;
          ctx.strokeRect(rx, ry, cell, cell);

          ctx.fillStyle = isIntersect ? '#ffffff' : palette.ink;
          ctx.font = isIntersect ? 'bold 12px monospace' : '11px monospace';
          ctx.fillText(alpha[(r + c) % 9], rx + cell / 2, ry + cell / 2);
        }
      }
      ctx.fillStyle = palette.border;
      ctx.font = 'bold 13px Georgia, serif';
      ctx.fillText('KEY ROW D  x  COL E  ->  H', cx, startY + cells * cell + 22);
      break;
    }

    case 'playfair': {
      // 5x5 Playfair digraph matrix with rectangle swap arrows
      const grid = [
        ['M', 'O', 'N', 'A', 'R'],
        ['C', 'H', 'Y', 'B', 'D'],
        ['E', 'F', 'G', 'I/J', 'K'],
        ['L', 'P', 'Q', 'S', 'T'],
        ['U', 'V', 'W', 'X', 'Z'],
      ];
      const cell = 42;
      const sx = cx - (5 * cell) / 2;
      const sy = cy - (5 * cell) / 2;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const rx = sx + c * cell;
          const ry = sy + r * cell;
          const isCorner = (r === 1 || r === 3) && (c === 0 || c === 3);
          ctx.fillStyle = isCorner ? 'rgba(197, 160, 89, 0.35)' : 'rgba(255,255,255,0.5)';
          ctx.fillRect(rx, ry, cell, cell);
          ctx.strokeStyle = palette.border;
          ctx.lineWidth = 1.6;
          ctx.strokeRect(rx, ry, cell, cell);
          ctx.fillStyle = palette.ink;
          ctx.font = 'bold 14px Georgia, serif';
          ctx.fillText(grid[r][c], rx + cell / 2, ry + cell / 2);
        }
      }
      // Digraph rectangle dashed highlight
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(sx + cell * 0.5, sy + cell * 1.5, cell * 3, cell * 2);
      ctx.setLineDash([]);
      break;
    }

    case 'polybius': {
      // 5x5 Greek Polybius Checkerboard with row/col headers 1..5
      const grid = [
        ['A', 'B', 'C', 'D', 'E'],
        ['F', 'G', 'H', 'I/J', 'K'],
        ['L', 'M', 'N', 'O', 'P'],
        ['Q', 'R', 'S', 'T', 'U'],
        ['V', 'W', 'X', 'Y', 'Z'],
      ];
      const cell = 38;
      const sx = cx - (5 * cell) / 2 + 12;
      const sy = cy - (5 * cell) / 2 + 12;
      ctx.font = 'bold 13px Georgia, serif';
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = palette.border;
        ctx.fillText(String(i + 1), sx + i * cell + cell / 2, sy - 16);
        ctx.fillText(String(i + 1), sx - 18, sy + i * cell + cell / 2);
      }
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const rx = sx + c * cell;
          const ry = sy + r * cell;
          ctx.fillStyle = r === 2 && c === 3 ? palette.gold : 'rgba(255,255,255,0.5)';
          ctx.fillRect(rx, ry, cell, cell);
          ctx.strokeStyle = palette.border;
          ctx.lineWidth = 1.4;
          ctx.strokeRect(rx, ry, cell, cell);
          ctx.fillStyle = palette.ink;
          ctx.fillText(grid[r][c], rx + cell / 2, ry + cell / 2);
        }
      }
      ctx.fillStyle = palette.border;
      ctx.fillText('O  ->  (Row 3, Col 4)  =  34', cx, sy + 5 * cell + 22);
      break;
    }

    case 'scytale': {
      // Spartan wooden cylinder with helical parchment band
      const cylW = 240;
      const cylH = 74;
      const x0 = cx - cylW / 2;
      const y0 = cy - cylH / 2;

      ctx.fillStyle = '#d7be98';
      ctx.fillRect(x0, y0, cylW, cylH);
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x0, y0, cylW, cylH);

      // Cylinder end caps
      ctx.beginPath();
      ctx.ellipse(x0, cy, 12, cylH / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#c4a476';
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(x0 + cylW, cy, 12, cylH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Helical ribbon wraps
      const stripLetters = ['S', 'P', 'A', 'R', 'T', 'A'];
      for (let i = 0; i < 6; i++) {
        const wx = x0 + 22 + i * 36;
        ctx.fillStyle = 'rgba(250, 242, 224, 0.92)';
        ctx.beginPath();
        ctx.moveTo(wx, y0 - 4);
        ctx.lineTo(wx + 22, y0 - 4);
        ctx.lineTo(wx + 32, y0 + cylH + 4);
        ctx.lineTo(wx + 10, y0 + cylH + 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = palette.gold;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.fillStyle = palette.ink;
        ctx.font = 'bold 16px Georgia, serif';
        ctx.fillText(stripLetters[i], wx + 16, cy);
      }
      ctx.fillStyle = palette.border;
      ctx.font = 'bold 13px Georgia, serif';
      ctx.fillText('Transposition Diameter d = 6', cx, cy + 68);
      break;
    }

    case 'substitution': {
      // English letter frequency histogram (Al-Kindi frequency analysis)
      const bars = [
        { l: 'E', v: 12.7 },
        { l: 'T', v: 9.1 },
        { l: 'A', v: 8.2 },
        { l: 'O', v: 7.5 },
        { l: 'I', v: 7.0 },
        { l: 'N', v: 6.7 },
        { l: 'S', v: 6.3 },
        { l: 'R', v: 6.0 },
      ];
      const baseLine = cy + 75;
      const bw = 24;
      const gap = 10;
      const sx = cx - (bars.length * (bw + gap) - gap) / 2;

      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - 12, baseLine);
      ctx.lineTo(sx + bars.length * (bw + gap), baseLine);
      ctx.stroke();

      bars.forEach((b, idx) => {
        const bh = b.v * 11.5;
        const bx = sx + idx * (bw + gap);
        ctx.fillStyle = idx < 2 ? palette.border : palette.gold;
        ctx.fillRect(bx, baseLine - bh, bw, bh);
        ctx.strokeStyle = palette.ink;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, baseLine - bh, bw, bh);

        ctx.fillStyle = palette.ink;
        ctx.font = 'bold 12px Georgia, serif';
        ctx.fillText(b.l, bx + bw / 2, baseLine + 16);
      });
      ctx.fillStyle = palette.muted;
      ctx.font = '12px Georgia, serif';
      ctx.fillText('Al-Kindi Frequency Profile (%)', cx, baseLine + 38);
      break;
    }

    case 'enigma': {
      // Reflector + 3 Rotors + Plugboard bidirectional schematic
      const rotorX = [cx - 48, cx + 10, cx + 68];
      // Reflector UKW
      ctx.fillStyle = 'rgba(62, 87, 70, 0.14)';
      ctx.fillRect(cx - 125, cy - 82, 42, 164);
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 125, cy - 82, 42, 164);
      ctx.fillStyle = palette.ink;
      ctx.font = 'bold 11px monospace';
      ctx.fillText('UKW', cx - 104, cy);

      // 3 Rotors
      rotorX.forEach((rx, idx) => {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(rx - 20, cy - 82, 40, 164);
        ctx.strokeStyle = palette.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(rx - 20, cy - 82, 40, 164);
        ctx.fillStyle = palette.ink;
        ctx.fillText(`R${idx + 1}`, rx, cy - 96);
        for (let p = -56; p <= 56; p += 28) {
          ctx.beginPath();
          ctx.arc(rx, cy + p, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Signal path forward (gold) & reflected (green)
      ctx.strokeStyle = palette.gold;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx + 125, cy + 28);
      ctx.lineTo(cx + 68, cy + 28);
      ctx.lineTo(cx + 10, cy - 28);
      ctx.lineTo(cx - 48, cy + 56);
      ctx.lineTo(cx - 83, cy + 56);
      ctx.arc(cx - 83, cy, 56, Math.PI / 2, -Math.PI / 2, false);
      ctx.stroke();

      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - 83, cy - 56);
      ctx.lineTo(cx - 48, cy - 56);
      ctx.lineTo(cx + 10, cy + 56);
      ctx.lineTo(cx + 68, cy - 28);
      ctx.lineTo(cx + 125, cy - 28);
      ctx.stroke();

      ctx.fillStyle = palette.ink;
      ctx.font = 'bold 11px monospace';
      ctx.fillText('PLUGBOARD', cx + 115, cy + 96);
      break;
    }

    case 'lorenz': {
      // 12-pinwheel (5 Chi, 2 Mu, 5 Psi) Baudot XOR diagram
      const drawBank = (label: string, count: number, bx: number, by: number) => {
        ctx.fillStyle = palette.ink;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(label, bx + (count * 26) / 2 - 13, by - 26);
        for (let i = 0; i < count; i++) {
          const wx = bx + i * 26;
          ctx.strokeStyle = palette.border;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(wx, by, 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = i % 2 === 0 ? palette.gold : palette.border;
          ctx.beginPath();
          ctx.arc(wx, by, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      drawBank('CHI (5)', 5, cx - 125, cy - 42);
      drawBank('MU (2)', 2, cx + 65, cy - 42);
      drawBank('PSI (5)', 5, cx - 55, cy + 32);

      // XOR symbol
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy + 88, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy + 88);
      ctx.lineTo(cx + 16, cy + 88);
      ctx.moveTo(cx, cy + 72);
      ctx.lineTo(cx, cy + 104);
      ctx.stroke();

      ctx.fillStyle = palette.ink;
      ctx.font = 'bold 12px monospace';
      ctx.fillText('C = P XOR K  (5-BIT BAUDOT)', cx, cy + 120);
      break;
    }

    case 'rsa': {
      // Prime factorization trapdoor diagram
      const boxW = 90;
      const boxH = 44;
      const drawBox = (x: number, y: number, label: string, highlight = false) => {
        ctx.fillStyle = highlight ? palette.border : 'rgba(255,255,255,0.75)';
        ctx.fillRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
        ctx.strokeStyle = palette.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
        ctx.fillStyle = highlight ? '#ffffff' : palette.ink;
        ctx.font = 'bold 13px monospace';
        ctx.fillText(label, x, y);
      };

      drawBox(cx - 85, cy - 64, 'Prime p');
      drawBox(cx + 85, cy - 64, 'Prime q');
      drawBox(cx, cy, 'n = p * q', true);
      drawBox(cx - 85, cy + 68, 'Public (e, n)');
      drawBox(cx + 85, cy + 68, 'Private d');

      ctx.strokeStyle = palette.gold;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 85, cy - 42);
      ctx.lineTo(cx - 20, cy - 22);
      ctx.moveTo(cx + 85, cy - 42);
      ctx.lineTo(cx + 20, cy - 22);
      ctx.moveTo(cx - 20, cy + 22);
      ctx.lineTo(cx - 85, cy + 46);
      ctx.moveTo(cx + 20, cy + 22);
      ctx.lineTo(cx + 85, cy + 46);
      ctx.stroke();
      break;
    }

    case 'aes': {
      // 4x4 AES Byte State Matrix + SPN pipeline
      const cell = 32;
      const sx = cx - 2 * cell;
      const sy = cy - 2 * cell - 20;
      const bytes = [
        ['19', 'a0', '9a', 'e9'],
        ['3d', 'f4', 'c6', 'f8'],
        ['e3', 'e2', '8d', '48'],
        ['be', '2b', '2a', '08'],
      ];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const rx = sx + c * cell;
          const ry = sy + r * cell;
          ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(111,163,199,0.22)' : 'rgba(255,255,255,0.65)';
          ctx.fillRect(rx, ry, cell, cell);
          ctx.strokeStyle = palette.border;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(rx, ry, cell, cell);
          ctx.fillStyle = palette.ink;
          ctx.font = 'bold 12px monospace';
          ctx.fillText(bytes[r][c], rx + cell / 2, ry + cell / 2);
        }
      }
      ctx.fillStyle = palette.border;
      ctx.font = 'bold 12px monospace';
      ctx.fillText('SubBytes -> ShiftRows -> MixColumns -> AddRoundKey', cx, sy + 4 * cell + 28);
      break;
    }

    case 'sha256': {
      // Merkle-Damgård 64-round compression registers A..H
      const regs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const bw = 30;
      const gap = 4;
      const sx = cx - (regs.length * (bw + gap) - gap) / 2;
      regs.forEach((reg, idx) => {
        const bx = sx + idx * (bw + gap);
        ctx.fillStyle = idx === 0 || idx === 4 ? palette.border : 'rgba(255,255,255,0.75)';
        ctx.fillRect(bx, cy - 68, bw, 36);
        ctx.strokeStyle = palette.border;
        ctx.lineWidth = 1.6;
        ctx.strokeRect(bx, cy - 68, bw, 36);
        ctx.fillStyle = idx === 0 || idx === 4 ? '#ffffff' : palette.ink;
        ctx.font = 'bold 13px monospace';
        ctx.fillText(reg, bx + bw / 2, cy - 50);
      });

      // Compression block
      ctx.fillStyle = 'rgba(58, 82, 104, 0.14)';
      ctx.fillRect(cx - 130, cy - 8, 260, 62);
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 2.2;
      ctx.strokeRect(cx - 130, cy - 8, 260, 62);
      ctx.fillStyle = palette.ink;
      ctx.font = 'bold 13px monospace';
      ctx.fillText('64 ROUNDS: Ch, Maj, Sigma0, Sigma1', cx, cy + 16);
      ctx.font = '11px monospace';
      ctx.fillText('512-bit Block  ->  256-bit Digest', cx, cy + 36);
      break;
    }

    case 'hmac-hash': {
      // Nested ipad / opad two-stage compression
      const drawStage = (x: number, y: number, w: number, h: number, label: string) => {
        ctx.fillStyle = 'rgba(255,255,255,0.78)';
        ctx.fillRect(x - w / 2, y - h / 2, w, h);
        ctx.strokeStyle = palette.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - w / 2, y - h / 2, w, h);
        ctx.fillStyle = palette.ink;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(label, x, y);
      };

      drawStage(cx - 72, cy - 45, 118, 42, "K' XOR ipad");
      drawStage(cx + 72, cy - 45, 104, 42, 'Message m');
      drawStage(cx, cy + 16, 170, 42, 'Inner Hash H( ... )');
      drawStage(cx, cy + 80, 220, 44, "Outer H((K' XOR opad) || Inner)");

      ctx.strokeStyle = palette.gold;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 72, cy - 24);
      ctx.lineTo(cx - 25, cy - 5);
      ctx.moveTo(cx + 72, cy - 24);
      ctx.lineTo(cx + 25, cy - 5);
      ctx.moveTo(cx, cy + 37);
      ctx.lineTo(cx, cy + 58);
      ctx.stroke();
      break;
    }

    case 'diffie-hellman': {
      // Alice & Bob public modular color/key exchange
      const drawNode = (x: number, y: number, r: number, fill: string, label: string) => {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = palette.border;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(label, x, y);
      };

      drawNode(cx - 95, cy - 48, 34, '#3a5268', 'A = g^a');
      drawNode(cx + 95, cy - 48, 34, '#6fa3c7', 'B = g^b');
      drawNode(cx, cy + 48, 42, '#243c52', 'g^(ab) mod p');

      ctx.strokeStyle = palette.gold;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - 60, cy - 48);
      ctx.lineTo(cx + 60, cy - 48);
      ctx.moveTo(cx - 75, cy - 20);
      ctx.lineTo(cx - 26, cy + 18);
      ctx.moveTo(cx + 75, cy - 20);
      ctx.lineTo(cx + 26, cy + 18);
      ctx.stroke();

      ctx.fillStyle = palette.ink;
      ctx.font = 'bold 11px monospace';
      ctx.fillText('PUBLIC CHANNEL (p, g)', cx, cy - 68);
      break;
    }

    case 'rsa-signatures': {
      // Dual-lane Sign & Verify authenticity flow
      const drawLane = (y: number, left: string, right: string, fill: string) => {
        ctx.fillStyle = fill;
        ctx.fillRect(cx - 132, y - 22, 114, 44);
        ctx.fillRect(cx + 18, y - 22, 114, 44);
        ctx.strokeStyle = palette.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 132, y - 22, 114, 44);
        ctx.strokeRect(cx + 18, y - 22, 114, 44);
        ctx.fillStyle = palette.ink;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(left, cx - 75, y);
        ctx.fillText(right, cx + 75, y);
        ctx.strokeStyle = palette.gold;
        ctx.beginPath();
        ctx.moveTo(cx - 18, y);
        ctx.lineTo(cx + 18, y);
        ctx.stroke();
      };

      drawLane(cy - 44, 'H(m) ^ d', 'Signature s', 'rgba(58,82,104,0.16)');
      drawLane(cy + 40, 's ^ e mod n', 'H(m) == ?', 'rgba(111,163,199,0.22)');
      ctx.fillStyle = palette.border;
      ctx.font = 'bold 12px Georgia, serif';
      ctx.fillText('Private Sign  vs  Public Verify', cx, cy + 92);
      break;
    }

    case 'zkp-schnorr': {
      // 3-pass Prover <-> Verifier loop
      ctx.fillStyle = palette.border;
      ctx.fillRect(cx - 132, cy - 72, 74, 144);
      ctx.fillStyle = palette.gold;
      ctx.fillRect(cx + 58, cy - 72, 74, 144);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('PROVER', cx - 95, cy - 48);
      ctx.fillText('secret x', cx - 95, cy + 10);
      ctx.fillText('VERIFIER', cx + 95, cy - 48);
      ctx.fillText('y = g^x', cx + 95, cy + 10);

      const passes = [
        { y: cy - 40, text: '1. t = g^r  -->' },
        { y: cy, text: '<--  2. c in Z_q' },
        { y: cy + 40, text: '3. s = r + cx  -->' },
      ];
      ctx.fillStyle = palette.ink;
      ctx.font = 'bold 11px monospace';
      passes.forEach((p) => {
        ctx.fillText(p.text, cx, p.y);
      });
      break;
    }

    case 'post-quantum-kem': {
      // 2D Lattice basis grid with noisy LWE vector target
      ctx.strokeStyle = 'rgba(58, 82, 104, 0.28)';
      ctx.lineWidth = 1.4;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - 120, cy + i * 28 - 20);
        ctx.lineTo(cx + 120, cy + i * 28 + 20);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx + i * 34 - 20, cy - 95);
        ctx.lineTo(cx + i * 34 + 20, cy + 95);
        ctx.stroke();
      }
      // Lattice points
      ctx.fillStyle = palette.border;
      for (let gx = -2; gx <= 2; gx++) {
        for (let gy = -2; gy <= 2; gy++) {
          const px = cx + gx * 36 + gy * 8;
          const py = cy + gy * 28 + gx * 6;
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Error noise halo around target point
      const tx = cx + 44;
      const ty = cy - 22;
      ctx.strokeStyle = palette.gold;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(tx, ty, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#c45b3b';
      ctx.beginPath();
      ctx.arc(tx + 10, ty - 7, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = palette.ink;
      ctx.font = 'bold 12px monospace';
      ctx.fillText('ML-KEM:  t = A*s + e (mod q)', cx, cy + 106);
      break;
    }

    default: {
      // Generic geometric seal fallback
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

/**
 * Framed archival diagram / gallery plate mounted inside each exhibit room's back alcove.
 */
export function createExhibitPlateTexture(
  exhibitId: string,
  title: string,
  category: 'Classical' | 'Historical' | 'Modern',
  timeline: string
): THREE.CanvasTexture {
  const cacheKey = `plate:${exhibitId}:${title}:${category}:${timeline}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const w = 768;
  const h = 648;
  const [canvas, ctx] = createCanvas(w, h);
  if (!ctx) {
    const tex = configureTexture(canvas);
    textureCache.set(cacheKey, tex);
    return tex;
  }

  const spec = EXHIBIT_ART_SPECS[exhibitId];
  const palette = getCategoryPalette(category, spec);

  drawArchivalFrame(ctx, w, h, palette);

  // Header classification ribbon
  ctx.fillStyle = palette.border;
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.fillText(`${category.toUpperCase()} CRYPTOGRAPHY ARCHIVE`, w / 2, 66);

  // Unique exhibit schematic
  drawExhibitMotif(ctx, exhibitId, w / 2, 260, palette);

  // Formula pill banner
  if (spec?.formula) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.fillRect(92, 430, w - 184, 42);
    ctx.strokeStyle = palette.gold;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(92, 430, w - 184, 42);
    ctx.fillStyle = palette.ink;
    ctx.font = 'bold 16px monospace';
    ctx.fillText(spec.formula, w / 2, 456);
  }

  // Curatorial plate title & timeline
  ctx.fillStyle = palette.ink;
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText(title.toUpperCase(), w / 2, 518);

  ctx.fillStyle = palette.muted;
  ctx.font = 'italic 18px Georgia, serif';
  ctx.fillText(`Archival Plate · ${timeline}`, w / 2, 552);

  if (spec?.motif) {
    ctx.fillStyle = palette.border;
    ctx.font = '14px Georgia, serif';
    ctx.fillText(spec.motif, w / 2, 584);
  }

  const tex = configureTexture(canvas);
  textureCache.set(cacheKey, tex);
  return tex;
}

/**
 * Curatorial formula & cryptanalysis fact-sheet panel for each exhibit room's right wall.
 */
export function createSideGalleryPanelTexture(
  exhibitId: string,
  title: string,
  subtitle: string,
  timeline: string,
  category: 'Classical' | 'Historical' | 'Modern'
): THREE.CanvasTexture {
  const cacheKey = `panel:${exhibitId}:${title}:${subtitle}:${timeline}:${category}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const w = 768;
  const h = 512;
  const [canvas, ctx] = createCanvas(w, h);
  if (!ctx) {
    const tex = configureTexture(canvas);
    textureCache.set(cacheKey, tex);
    return tex;
  }

  const spec = EXHIBIT_ART_SPECS[exhibitId];
  const palette = getCategoryPalette(category, spec);
  drawArchivalFrame(ctx, w, h, palette);

  ctx.textAlign = 'left';
  ctx.fillStyle = palette.border;
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText(`CURATORIAL DOSSIER · ${category.toUpperCase()}`, 56, 72);

  ctx.fillStyle = palette.ink;
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText(title, 56, 108);

  ctx.fillStyle = palette.muted;
  ctx.font = 'italic 16px Georgia, serif';
  ctx.fillText(`${subtitle}  (${timeline})`, 56, 134);

  // Divider
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(56, 152);
  ctx.lineTo(w - 56, 152);
  ctx.stroke();

  // Formula box
  ctx.fillStyle = palette.border;
  ctx.fillRect(56, 170, w - 112, 48);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(spec?.formula ?? 'Cipher Transformation E_k(P) = C', 74, 200);

  // Historical Context
  ctx.fillStyle = palette.border;
  ctx.font = 'bold 14px Georgia, serif';
  ctx.fillText('HISTORICAL PROVENANCE', 56, 250);
  ctx.fillStyle = palette.ink;
  ctx.font = '16px Georgia, serif';
  const afterHistoryY = wrapText(
    ctx,
    spec?.historicalFact ?? subtitle,
    56,
    276,
    w - 112,
    24,
    3
  );

  // Cryptanalysis Note
  ctx.fillStyle = palette.border;
  ctx.font = 'bold 14px Georgia, serif';
  ctx.fillText('CRYPTANALYSIS & SECURITY', 56, Math.max(352, afterHistoryY + 12));
  ctx.fillStyle = palette.ink;
  ctx.font = '16px Georgia, serif';
  wrapText(
    ctx,
    spec?.cryptanalysisNote ?? 'Subject to classical or modern cryptanalytic evaluation.',
    56,
    Math.max(378, afterHistoryY + 38),
    w - 112,
    24,
    3
  );

  const tex = configureTexture(canvas);
  textureCache.set(cacheKey, tex);
  return tex;
}

/**
 * Large richly illustrated museum wall murals for bare foyer and corridor walls.
 */
export function createFoyerMuralTexture(theme: FoyerMuralTheme): THREE.CanvasTexture {
  const cacheKey = `mural:${theme}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const w = 1024;
  const h = 512;
  const [canvas, ctx] = createCanvas(w, h);
  if (!ctx) {
    const tex = configureTexture(canvas);
    textureCache.set(cacheKey, tex);
    return tex;
  }

  const themeConfig: Record<
    FoyerMuralTheme,
    { category: ExhibitCategory; heading: string; subheading: string; ids: string[] }
  > = {
    classical: {
      category: 'Classical',
      heading: 'THE CLASSICAL CIPHER TRADITION',
      subheading: 'From Spartan Scytales & Caesar Rings to Renaissance Polyalphabetic Tables',
      ids: ['scytale', 'caesar', 'vigenere'],
    },
    historical: {
      category: 'Historical',
      heading: 'ELECTRO-MECHANICAL WARFARE',
      subheading: 'Rotor Circuits, Teleprinter Pinwheels & Mathematical Codebreaking (1918–1945)',
      ids: ['enigma', 'lorenz', 'playfair'],
    },
    modern: {
      category: 'Modern',
      heading: 'THE PUBLIC-KEY & QUANTUM ERA',
      subheading: 'Number Theory, Zero-Knowledge Proofs & Post-Quantum Lattices',
      ids: ['rsa', 'zkp-schnorr', 'post-quantum-kem'],
    },
    evolution: {
      category: 'Modern',
      heading: 'THREE MILLENNIA OF SECRET WRITING',
      subheading: 'Transposition & Substitution  ->  Rotor Machines  ->  Post-Quantum Lattices',
      ids: ['caesar', 'enigma', 'post-quantum-kem'],
    },
  };

  const cfg = themeConfig[theme];
  const palette = getCategoryPalette(cfg.category);
  drawArchivalFrame(ctx, w, h, palette);

  ctx.textAlign = 'center';
  ctx.fillStyle = palette.ink;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText(cfg.heading, w / 2, 78);

  ctx.fillStyle = palette.muted;
  ctx.font = 'italic 16px Georgia, serif';
  ctx.fillText(cfg.subheading, w / 2, 108);

  // Three triptych schematic panels across the mural
  const centers = [w * 0.2, w * 0.5, w * 0.8];
  cfg.ids.forEach((id, idx) => {
    const cx = centers[idx];
    ctx.save();
    ctx.translate(cx, 285);
    ctx.scale(0.72, 0.72);
    drawExhibitMotif(ctx, id, 0, 0, palette);
    ctx.restore();

    const spec = EXHIBIT_ART_SPECS[id];
    if (spec) {
      ctx.fillStyle = palette.border;
      ctx.font = 'bold 14px Georgia, serif';
      ctx.fillText(spec.title.toUpperCase(), cx, 438);
    }
  });

  // Connecting timeline arrows between triptych panels
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2.5;
  [w * 0.34, w * 0.66].forEach((ax) => {
    ctx.beginPath();
    ctx.moveTo(ax - 22, 285);
    ctx.lineTo(ax + 22, 285);
    ctx.lineTo(ax + 12, 277);
    ctx.moveTo(ax + 22, 285);
    ctx.lineTo(ax + 12, 293);
    ctx.stroke();
  });

  const tex = configureTexture(canvas);
  textureCache.set(cacheKey, tex);
  return tex;
}

/**
 * Individualized archival portraits with period headwear, collar, and emblem motifs.
 */
export function createUniquePortraitTexture(
  name: string,
  lifespan: string,
  legacy: string
): THREE.CanvasTexture {
  const cacheKey = `portrait:${name}:${lifespan}:${legacy}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const w = 512;
  const h = 640;
  const [canvas, ctx] = createCanvas(w, h);
  if (!ctx) {
    const tex = configureTexture(canvas);
    textureCache.set(cacheKey, tex);
    return tex;
  }

  // Rich oil-portrait dark gallery background
  const bgGrad = ctx.createRadialGradient(w / 2, 240, 30, w / 2, 260, 340);
  bgGrad.addColorStop(0, '#4d3a2c');
  bgGrad.addColorStop(1, '#1d1510');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Gilded inner frame
  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 6;
  ctx.strokeRect(18, 18, w - 36, h - 36);
  ctx.strokeStyle = '#7e6030';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, w - 56, h - 56);

  const cx = w / 2;
  const headY = 215;

  // Shoulders & coat base
  ctx.fillStyle =
    name === 'Leon Battista Alberti'
      ? '#6b2722'
      : name === 'Blaise de Vigenère'
      ? '#232028'
      : name === 'Marian Rejewski'
      ? '#27352c'
      : name === 'Charles Wheatstone'
      ? '#242936'
      : '#2c2520';
  ctx.beginPath();
  ctx.moveTo(cx - 135, 455);
  ctx.quadraticCurveTo(cx - 115, 315, cx, 305);
  ctx.quadraticCurveTo(cx + 115, 315, cx + 135, 455);
  ctx.closePath();
  ctx.fill();

  // Period collar & facial styling per cryptologist
  if (name === 'Leon Battista Alberti') {
    // Renaissance fur-trimmed robe collar
    ctx.fillStyle = '#c8ab7a';
    ctx.beginPath();
    ctx.moveTo(cx - 58, 316);
    ctx.lineTo(cx, 370);
    ctx.lineTo(cx + 58, 316);
    ctx.lineTo(cx + 38, 306);
    ctx.lineTo(cx, 342);
    ctx.lineTo(cx - 38, 306);
    ctx.closePath();
    ctx.fill();
  } else if (name === 'Blaise de Vigenère') {
    // 16th-century pleated white ruff collar
    ctx.fillStyle = '#f2ece1';
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath();
      ctx.ellipse(cx + i * 11, 314, 12, 18, i * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === 'Marian Rejewski') {
    // 1930s shirt collar & dark tie
    ctx.fillStyle = '#ece8df';
    ctx.beginPath();
    ctx.moveTo(cx - 34, 308);
    ctx.lineTo(cx, 355);
    ctx.lineTo(cx + 34, 308);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3b5142';
    ctx.beginPath();
    ctx.moveTo(cx - 10, 326);
    ctx.lineTo(cx + 10, 326);
    ctx.lineTo(cx + 14, 420);
    ctx.lineTo(cx - 14, 420);
    ctx.closePath();
    ctx.fill();
  } else if (name === 'Charles Wheatstone') {
    // Victorian high wing collar & silk cravat
    ctx.fillStyle = '#f4efe6';
    ctx.beginPath();
    ctx.moveTo(cx - 38, 300);
    ctx.lineTo(cx, 372);
    ctx.lineTo(cx + 38, 300);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7a3b2e';
    ctx.beginPath();
    ctx.ellipse(cx, 336, 16, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Auguste Kerckhoffs: academic lapel & bow tie
    ctx.fillStyle = '#f1ebe0';
    ctx.beginPath();
    ctx.moveTo(cx - 34, 306);
    ctx.lineTo(cx, 360);
    ctx.lineTo(cx + 34, 306);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1b1815';
    ctx.fillRect(cx - 22, 316, 44, 14);
  }

  // Face oval
  ctx.fillStyle = '#d9b592';
  ctx.beginPath();
  ctx.ellipse(cx, headY, 54, 68, 0, 0, Math.PI * 2);
  ctx.fill();

  // Individualized hair / headwear / facial hair / glasses
  if (name === 'Leon Battista Alberti') {
    // Renaissance scholar cap
    ctx.fillStyle = '#6b2722';
    ctx.beginPath();
    ctx.ellipse(cx, headY - 52, 66, 26, -0.08, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 60, headY - 54, 120, 16);
  } else if (name === 'Blaise de Vigenère') {
    // Receding cap + pointed beard
    ctx.fillStyle = '#2b221c';
    ctx.beginPath();
    ctx.arc(cx, headY - 12, 56, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 24, headY + 34);
    ctx.lineTo(cx, headY + 78);
    ctx.lineTo(cx + 24, headY + 34);
    ctx.closePath();
    ctx.fill();
  } else if (name === 'Marian Rejewski') {
    // Swept 1930s hair + round wire spectacles
    ctx.fillStyle = '#3c2f26';
    ctx.beginPath();
    ctx.arc(cx, headY - 18, 55, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx - 20, headY - 4, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 20, headY - 4, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 6, headY - 4);
    ctx.lineTo(cx + 6, headY - 4);
    ctx.stroke();
  } else if (name === 'Charles Wheatstone') {
    // Victorian sideburns & hair
    ctx.fillStyle = '#5c4d42';
    ctx.beginPath();
    ctx.arc(cx, headY - 14, 57, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();
    ctx.fillRect(cx - 54, headY - 5, 16, 48);
    ctx.fillRect(cx + 38, headY - 5, 16, 48);
  } else {
    // Auguste Kerckhoffs: moustache & pince-nez
    ctx.fillStyle = '#554940';
    ctx.beginPath();
    ctx.arc(cx, headY - 16, 56, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 22, headY + 22, 44, 10);
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - 18, headY - 4, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 18, headY - 4, 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Unique corner cryptologist emblem medallion (top-right)
  ctx.save();
  ctx.translate(w - 86, 86);
  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.stroke();
  if (name === 'Leon Battista Alberti') {
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.stroke();
  } else if (name === 'Blaise de Vigenère') {
    ctx.strokeRect(-14, -14, 28, 28);
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(14, 0);
    ctx.moveTo(0, -14);
    ctx.lineTo(0, 14);
    ctx.stroke();
  } else if (name === 'Marian Rejewski') {
    [-12, 0, 12].forEach((rx) => {
      ctx.strokeRect(rx - 4, -12, 8, 24);
    });
  } else if (name === 'Charles Wheatstone') {
    ctx.strokeRect(-15, -15, 30, 30);
    ctx.strokeRect(-6, -6, 12, 12);
  } else {
    ctx.beginPath();
    ctx.arc(0, -5, 8, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(-10, -4, 20, 16);
  }
  ctx.restore();

  // Brass museum nameplate at bottom
  ctx.fillStyle = '#2b2016';
  ctx.fillRect(46, 476, w - 92, 122);
  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 2;
  ctx.strokeRect(46, 476, w - 92, 122);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f5e6c8';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText(name.toUpperCase(), cx, 514);

  ctx.fillStyle = '#c5a059';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText(lifespan, cx, 542);

  ctx.fillStyle = '#d8cbb5';
  ctx.font = 'italic 14px Georgia, serif';
  ctx.fillText(legacy, cx, 574);

  const tex = configureTexture(canvas);
  textureCache.set(cacheKey, tex);
  return tex;
}
