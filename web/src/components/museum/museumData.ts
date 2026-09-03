export interface CipherExhibit {
  id: string;
  name: string;
  category: 'Classical' | 'Historical' | 'Modern';
  wing: string;
  subtitle: string;
  description: string;
  historicalContext: string;
  vulnerabilities: string;
  timeline: string;
  position: [number, number, number];
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  macroPosition: [number, number, number];
  macroTarget: [number, number, number];
  rotationY: number;
  endpoint: {
    encrypt: string;
    decrypt: string;
  };
  defaultParams: Record<string, any>;
}

export interface MuseumWing {
  id: string;
  name: string;
  category: 'Classical' | 'Historical' | 'Modern';
  description: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export const MUSEUM_WINGS: MuseumWing[] = [
  {
    id: 'wing-classical',
    name: 'Classical Ciphers Wing',
    category: 'Classical',
    description: 'Ancient & Renaissance Substitution & Transposition Ciphers',
    cameraPosition: [-45, 8, 12],
    cameraTarget: [-45, 1.5, -35],
  },
  {
    id: 'wing-historical',
    name: 'Historical Systems Wing',
    category: 'Historical',
    description: 'Electromechanical Rotor Machines & WWII High Command Encryption',
    cameraPosition: [0, 8, -10],
    cameraTarget: [0, 1.5, -45],
  },
  {
    id: 'wing-modern',
    name: 'Modern Cryptography Wing',
    category: 'Modern',
    description: 'Asymmetric Key Vaults, Block Ciphers & Cryptographic Hash Functions',
    cameraPosition: [45, 8, 12],
    cameraTarget: [45, 1.5, -35],
  },
];

export const MUSEUM_EXHIBITS: CipherExhibit[] = [
  {
    id: 'caesar',
    name: 'Caesar Cipher',
    category: 'Classical',
    wing: 'Classical Ciphers Wing',
    subtitle: 'Monoalphabetic Shift Cipher & Ancient Scytale',
    description: 'Used by Julius Caesar to protect military communications by shifting letters by a fixed offset.',
    historicalContext: 'Dating back to 58 BC, Roman commanders used the Scytale (a wooden rod with wrapped parchment) and letter-shift rules to send confidential battlefield dispatches across Gaul.',
    vulnerabilities: 'Extremely vulnerable to frequency analysis and brute-force key search (only 25 possible shift keys in the English alphabet).',
    timeline: 'c. 58 BC – Roman Empire Era',
    position: [-35, 0, -15],
    cameraPosition: [-35, 2.2, -11.5],
    cameraTarget: [-35, 1.6, -15],
    macroPosition: [-35, 2.8, -13.2],
    macroTarget: [-35, 1.6, -15],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/caesar/encrypt',
      decrypt: '/api/caesar/decrypt',
    },
    defaultParams: {
      shift: 3,
    },
  },
  {
    id: 'affine',
    name: 'Affine Cipher',
    category: 'Classical',
    wing: 'Classical Ciphers Wing',
    subtitle: 'Monoalphabetic Linear Substitution E(x) = (ax + b) mod 26',
    description: 'Combines multiplicative scaling (key a, coprime to 26) and additive shift (key b).',
    historicalContext: 'A generalized monoalphabetic substitution cipher combining modular multiplication and addition.',
    vulnerabilities: 'Only 12 valid choices for key a and 26 for key b (312 total keys), vulnerable to frequency analysis.',
    timeline: 'c. 1600s – Classical Cryptanalysis',
    position: [-55, 0, -15],
    cameraPosition: [-55, 2.2, -11.5],
    cameraTarget: [-55, 1.6, -15],
    macroPosition: [-55, 2.8, -13.2],
    macroTarget: [-55, 1.6, -15],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/affine/encrypt',
      decrypt: '/api/affine/decrypt',
    },
    defaultParams: {
      a_key: 5,
      b_key: 8,
    },
  },
  {
    id: 'vigenere',
    name: 'Vigenère Cipher',
    category: 'Classical',
    wing: 'Classical Ciphers Wing',
    subtitle: 'Polyalphabetic Substitution & Tabula Recta',
    description: 'Uses a keyword to apply a sequence of different Caesar shifts based on the Tabula Recta grid.',
    historicalContext: 'Described by Giovan Battista Bellaso in 1553 and later misattributed to Blaise de Vigenère. Known for centuries as "le chiffre indéchiffrable" (the unbreakable cipher).',
    vulnerabilities: 'Vulnerable to Kasiski examination and Index of Coincidence analysis to determine key length, followed by frequency analysis per key position.',
    timeline: '1553 AD – Renaissance Cryptography',
    position: [-35, 0, -40],
    cameraPosition: [-35, 2.2, -36.5],
    cameraTarget: [-35, 1.6, -40],
    macroPosition: [-35, 2.8, -38.2],
    macroTarget: [-35, 1.6, -40],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/vigenere/encrypt',
      decrypt: '/api/vigenere/decrypt',
    },
    defaultParams: {
      key: 'LEMON',
    },
  },
  {
    id: 'playfair',
    name: 'Playfair Cipher',
    category: 'Classical',
    wing: 'Classical Ciphers Wing',
    subtitle: 'Bigram Substitution & 5x5 Marble Matrix',
    description: 'Encrypts pairs of letters (digraphs) using a 5x5 matrix derived from a keyword.',
    historicalContext: 'Invented by Charles Wheatstone in 1854 but named after Lord Playfair who promoted its tactical use in the Crimean War and World War I.',
    vulnerabilities: 'Frequency analysis of digraphs. Does not obscure letter frequency patterns across large texts as effectively as modern polyalphabetic ciphers.',
    timeline: '1854 AD – Victorian & WWI Era',
    position: [-55, 0, -40],
    cameraPosition: [-55, 2.2, -36.5],
    cameraTarget: [-55, 1.6, -40],
    macroPosition: [-55, 2.8, -38.2],
    macroTarget: [-55, 1.6, -40],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/playfair/encrypt',
      decrypt: '/api/playfair/decrypt',
    },
    defaultParams: {
      key: 'MONARCHY',
    },
  },
  {
    id: 'polybius',
    name: 'Polybius Square',
    category: 'Classical',
    wing: 'Classical Ciphers Wing',
    subtitle: 'Greek Fractionalization & Stone Checkerboard',
    description: 'Maps each letter of the alphabet to coordinate pairs on a 5x5 grid.',
    historicalContext: 'Devised by ancient Greek historian Polybius (c. 200–118 BC) for signaling via torch signals between military watchtowers.',
    vulnerabilities: 'Direct 1-to-1 coordinate substitution preserves character frequency patterns completely.',
    timeline: 'c. 150 BC – Ancient Greece',
    position: [-35, 0, -65],
    cameraPosition: [-35, 2.2, -61.5],
    cameraTarget: [-35, 1.6, -65],
    macroPosition: [-35, 2.8, -63.2],
    macroTarget: [-35, 1.6, -65],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/polybius/encrypt',
      decrypt: '/api/polybius/decrypt',
    },
    defaultParams: {
      key: 'abcdefghiklmnopqrstuvwxyz',
    },
  },
  {
    id: 'scytale',
    name: 'Scytale Cipher',
    category: 'Classical',
    wing: 'Classical Ciphers Wing',
    subtitle: 'Transposition Cylinder Cipher',
    description: 'Ancient Spartan transposition cipher wrapping parchment around a rod of fixed diameter.',
    historicalContext: 'Used by the Spartans during Peloponnesian military campaigns.',
    vulnerabilities: 'Easy to break by testing different rod diameters.',
    timeline: 'c. 400 BC – Ancient Sparta',
    position: [-55, 0, -65],
    cameraPosition: [-55, 2.2, -61.5],
    cameraTarget: [-55, 1.6, -65],
    macroPosition: [-55, 2.8, -63.2],
    macroTarget: [-55, 1.6, -65],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/scytale/encrypt',
      decrypt: '/api/scytale/decrypt',
    },
    defaultParams: {
      width: 4,
    },
  },
  {
    id: 'enigma',
    name: 'Enigma Machine',
    category: 'Historical',
    wing: 'Historical Systems Wing',
    subtitle: 'Elector-Mechanical Rotor Encryption',
    description: 'Uses stepping mechanical rotors, a plugboard (Steckerbrett), and a reflector to continuously alter substitution paths.',
    historicalContext: 'Adopted by the German military during WWII. Broken by Alan Turing, Marian Rejewski, and Bletchley Park cryptanalysts using the electromechanical Bombe machine.',
    vulnerabilities: 'No letter could ever encrypt to itself, a fundamental flaw exploited by Bletchley Park codebreakers along with predictable cribs.',
    timeline: '1918–1945 AD – World War II',
    position: [-10, 0, -45],
    cameraPosition: [-10, 2.2, -41.5],
    cameraTarget: [-10, 1.6, -45],
    macroPosition: [-10, 2.8, -43.2],
    macroTarget: [-10, 1.6, -45],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/enigma/encipher',
      decrypt: '/api/enigma/encipher',
    },
    defaultParams: {
      rotors: ['I', 'II', 'III'],
      positions: ['A', 'A', 'A'],
      rings: ['A', 'A', 'A'],
      plugboard: ['AB', 'CD'],
    },
  },
  {
    id: 'lorenz',
    name: 'Lorenz SZ42',
    category: 'Historical',
    wing: 'Historical Systems Wing',
    subtitle: 'WWII Teleprinter Stream Cipher & 12-Pinwheel Attachment',
    description: 'High-level strategic teleprinter stream cipher used by Hitler and the German High Command (OKW). Enciphers 5-bit ITA2 Baudot code characters using 12 pinwheels.',
    historicalContext: 'Operational from 1940 to 1945 for top-secret high command communications. Codebreaker Bill Tutte reverse-engineered its 12-wheel architecture without ever seeing a physical machine, leading Tommy Flowers to build Colossus.',
    vulnerabilities: 'Vulnerable to depth attacks when German operators retransmitted messages with identical wheel settings, exposing the XOR keystream.',
    timeline: '1940–1945 AD – World War II (High Command)',
    position: [10, 0, -45],
    cameraPosition: [10, 2.2, -41.5],
    cameraTarget: [10, 1.6, -45],
    macroPosition: [10, 2.8, -43.2],
    macroTarget: [10, 1.6, -45],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/lorenz/encrypt',
      decrypt: '/api/lorenz/decrypt',
    },
    defaultParams: {
      positions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  {
    id: 'rsa',
    name: 'RSA Vault',
    category: 'Modern',
    wing: 'Modern Cryptography Wing',
    subtitle: 'Asymmetric Public-Key & Prime Factorization',
    description: 'Utilizes asymmetric key pairs based on the mathematical difficulty of factoring large composite prime products n = p * q.',
    historicalContext: 'Published in 1977 by Ron Rivest, Adi Shamir, and Leonard Adleman at MIT. Formed the foundation of modern internet security, TLS/SSL, and digital signatures.',
    vulnerabilities: 'Shor algorithm on quantum computers can solve prime factorization in polynomial time. Small primes are vulnerable to Fermat or Pollard factorization.',
    timeline: '1977 AD – Digital Era',
    position: [35, 0, -15],
    cameraPosition: [35, 2.2, -11.5],
    cameraTarget: [35, 1.6, -15],
    macroPosition: [35, 2.8, -13.2],
    macroTarget: [35, 1.6, -15],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/rsa/encrypt',
      decrypt: '/api/rsa/decrypt',
    },
    defaultParams: {
      p: 61,
      q: 53,
      e: 17,
    },
  },
  {
    id: 'aes',
    name: 'AES Vault',
    category: 'Modern',
    wing: 'Modern Cryptography Wing',
    subtitle: 'Symmetric Block Cipher & SPN Network',
    description: 'Rijndael cipher utilizing 128-bit blocks with 128/192/256-bit keys through SubBytes, ShiftRows, MixColumns, and AddRoundKey operations.',
    historicalContext: 'Selected by NIST in 2001 after a 5-year open competition to replace DES. Protects classified government communications and worldwide disk encryption.',
    vulnerabilities: 'No known practical attack against full AES-128/256. Quantum Grover algorithm reduces effective key security to 64/128 bits.',
    timeline: '2001 AD – Present Standard',
    position: [55, 0, -15],
    cameraPosition: [55, 2.2, -11.5],
    cameraTarget: [55, 1.6, -15],
    macroPosition: [55, 2.8, -13.2],
    macroTarget: [55, 1.6, -15],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/aes/encrypt',
      decrypt: '/api/aes/decrypt',
    },
    defaultParams: {
      key: '1234567890123456',
      key_format: 'text',
    },
  },
  {
    id: 'sha256',
    name: 'SHA-256 Vault',
    category: 'Modern',
    wing: 'Modern Cryptography Wing',
    subtitle: 'Cryptographic Hash Function',
    description: 'Produces a deterministic 256-bit (32-byte) hash digest for any arbitrary input message.',
    historicalContext: 'Designed by the NSA and published by NIST in 2001 in FIPS PUB 180-2.',
    vulnerabilities: 'Pre-image resistant, second pre-image resistant, collision resistant. No known practical collision.',
    timeline: '2001 AD – Secure Hashing',
    position: [45, 0, -45],
    cameraPosition: [45, 2.2, -41.5],
    cameraTarget: [45, 1.6, -45],
    macroPosition: [45, 2.8, -43.2],
    macroTarget: [45, 1.6, -45],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/sha256',
      decrypt: '/api/sha256',
    },
    defaultParams: {},
  },
];

export interface CryptographicStatue {
  id: string;
  name: string;
  lifespan: string;
  title: string;
  landmarkPaper: string;
  description: string;
  historicalSignificance: string;
  coreBreakthrough: string;
  keyContributions: string[];
  associatedWing: string;
  position: [number, number, number];
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  rotationY: number;
  accentColor: number;
  accentHex: string;
  plaqueSummary: string;
  interactiveDemoType: 'frequency-analysis' | 'information-entropy' | 'key-exchange';
}

export const MUSEUM_STATUES: CryptographicStatue[] = [
  {
    id: 'statue-alkindi',
    name: 'Al-Kindi',
    lifespan: 'c. 801–873',
    title: 'The Father of Cryptanalysis',
    landmarkPaper: 'A Manuscript on Deciphering Cryptographic Messages (Risalah fi Istikhraj al-Mu\'amma)',
    description: 'Known as the father of cryptanalysis. In the 9th century, he authored A Manuscript on Deciphering Cryptographic Messages, introducing frequency analysis. He proved that monoalphabetic substitution ciphers could be systematically broken using letter distribution statistics.',
    historicalSignificance: 'During the Islamic Golden Age in Baghdad\'s House of Wisdom (Bayt al-Hikmah), Al-Kindi pioneered the mathematical analysis of language. By observing that specific letters appear with predictable statistical regularity in natural language, he turned cryptography from an art of intuition into a rigorous empirical science.',
    coreBreakthrough: 'Statistical Frequency Analysis: Establishing that counting letter occurrences enables the deterministic decryption of monoalphabetic substitution ciphers without knowing the secret key.',
    keyContributions: [
      'Invention of cryptographic frequency analysis',
      'Author of the earliest known cryptanalysis treatise',
      'Pioneered statistical techniques in linguistics and decoding',
      'Proved monoalphabetic substitution ciphers are fundamentally insecure',
    ],
    associatedWing: 'Classical Ciphers Wing',
    position: [-8.5, 0, 7.5],
    cameraPosition: [-7.4, 2.4, 11.2],
    cameraTarget: [-8.5, 2.3, 7.5],
    rotationY: 0.25,
    accentColor: 0xd97706,
    accentHex: '#d97706',
    plaqueSummary: 'Father of Cryptanalysis • Author of the 9th Century Treatise on Deciphering Messages',
    interactiveDemoType: 'frequency-analysis',
  },
  {
    id: 'statue-shannon',
    name: 'Claude Shannon',
    lifespan: '1916–2001',
    title: 'The Architect of Mathematical Cryptography',
    landmarkPaper: 'Communication Theory of Secrecy Systems (1949)',
    description: 'The architect of mathematical cryptography. His 1949 landmark paper, Communication Theory of Secrecy Systems, established the rigorous mathematical foundation of cryptography, defined information theory, and proved the absolute secrecy of the one-time pad.',
    historicalSignificance: 'Working at Bell Labs and advising during World War II on secure wartime communications, Shannon revolutionized computer science and telecommunications. He formalized the concept of entropy H(X) as the measure of information uncertainty, and proved that unconditional secrecy requires key entropy at least equal to message entropy.',
    coreBreakthrough: 'Mathematical Proof of Perfect Secrecy: H(M|C) = H(M), proving that the Vernam One-Time Pad is impenetrable to infinite computing power if the key is truly random, never reused, and as long as the plaintext.',
    keyContributions: [
      'Established Information Theory and mathematical secrecy',
      'Proved unconditional mathematical security of the One-Time Pad',
      'Defined entropy, redundancy, and equivocation in cipher design',
      'Introduced the core principles of Confusion and Diffusion',
    ],
    associatedWing: 'Historical Systems Wing',
    position: [0, 0, 4.0],
    cameraPosition: [1.1, 2.4, 8.2],
    cameraTarget: [0, 2.3, 4.0],
    rotationY: 0,
    accentColor: 0x0284c7,
    accentHex: '#0284c7',
    plaqueSummary: 'Architect of Mathematical Cryptography • Founder of Information Theory',
    interactiveDemoType: 'information-entropy',
  },
  {
    id: 'statue-diffie-hellman',
    name: 'Whitfield Diffie & Martin Hellman',
    lifespan: 'Diffie (1944– ) & Hellman (1945– ) [with Ralph Merkle (1952– )]',
    title: 'Pioneers of Public-Key Cryptography',
    landmarkPaper: 'New Directions in Cryptography (1976)',
    description: 'Their 1976 paper, New Directions in Cryptography, introduced public-key cryptography and the Diffie–Hellman key exchange. They solved the ancient "key distribution problem"—allowing two parties to establish a shared secret over an insecure channel without meeting beforehand. (Ralph Merkle is often recognized alongside them for independently conceptualizing public-key agreements via Merkle’s Puzzles).',
    historicalSignificance: 'For millennia, secure communication required pre-sharing secret keys in person or via trusted couriers. Diffie, Hellman, and Merkle broke this paradigm using one-way trapdoor mathematical functions, creating the bedrock for modern internet encryption, TLS/HTTPS, and e-commerce.',
    coreBreakthrough: 'Asymmetric Key Exchange: Using modular exponentiation (g^a mod p and g^b mod p) to calculate a shared secret g^(ab) mod p over an eavesdropped public network without exposing private keys.',
    keyContributions: [
      'Invented Public-Key (Asymmetric) Cryptography',
      'Devised the Diffie-Hellman Key Exchange algorithm',
      'Solved the millennia-old Key Distribution Problem',
      'Merkle\'s Puzzles: Earliest independent conceptualization of public-key exchange',
    ],
    associatedWing: 'Modern Cryptography Wing',
    position: [8.5, 0, 7.5],
    cameraPosition: [9.6, 2.4, 11.2],
    cameraTarget: [8.5, 2.3, 7.5],
    rotationY: -0.25,
    accentColor: 0x9333ea,
    accentHex: '#9333ea',
    plaqueSummary: 'Pioneers of Public-Key Cryptography • Diffie-Hellman Key Exchange & Merkle\'s Puzzles',
    interactiveDemoType: 'key-exchange',
  },
];

