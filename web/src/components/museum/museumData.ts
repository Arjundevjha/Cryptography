export interface ExhibitChallenge {
  prompt: string;
  ciphertext: string;
  hint: string;
  answer: string;
}

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
  challenge?: ExhibitChallenge;
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
    challenge: {
      prompt: 'Decrypt this Roman dispatch encrypted with a Caesar shift of 3.',
      ciphertext: 'YHQL YLGL YLFL',
      hint: 'Shift each letter backward by 3 positions in the alphabet (Y → V, H → E).',
      answer: 'VENI VIDI VICI',
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
    challenge: {
      prompt: 'Break this Affine ciphertext encrypted with a = 5, b = 8.',
      ciphertext: 'SWFRCP',
      hint: 'Use the Cryptanalysis tab or solve x = 21 * (y - 8) mod 26.',
      answer: 'CIPHER',
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
    challenge: {
      prompt: 'Decrypt this classic Renaissance Vigenère message using the key LEMON.',
      ciphertext: 'LXFOPVEFRNHR',
      hint: 'Subtract the repeating key LEMON (shifts 11, 4, 12, 14, 13) from the ciphertext.',
      answer: 'ATTACKATDAWN',
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
    challenge: {
      prompt: 'Decrypt this Playfair digraph message using the keyword MONARCHY.',
      ciphertext: 'FNTC',
      hint: 'Build the 5x5 grid starting with MONARCHY and reverse the rectangle rule for FN and TC.',
      answer: 'GOLD',
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
    challenge: {
      prompt: 'Decode these watchtower Polybius coordinates using the standard 5x5 grid (I/J combined).',
      ciphertext: '25 15 54',
      hint: 'Each pair represents (row, column): row 2 col 5 is K.',
      answer: 'KEY',
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
    challenge: {
      prompt: 'Unwrap this Spartan Scytale dispatch written on a rod of circumference width 4.',
      ciphertext: 'STPAANRS',
      hint: 'Arrange the 8 letters into 4 columns (2 rows) and read across.',
      answer: 'SPARTANS',
    },
  },
  {
    id: 'substitution',
    name: 'Substitution Cipher',
    category: 'Classical',
    wing: 'Classical Ciphers Wing',
    subtitle: 'Monoalphabetic Keyed Alphabet Permutation',
    description: 'Replaces each plaintext letter with a fixed corresponding letter from a scrambled 26-letter cipher alphabet.',
    historicalContext: 'Widely used for diplomatic and personal correspondence from the Middle Ages through the Renaissance until Al-Kindi and Arab cryptanalysts popularized frequency analysis.',
    vulnerabilities: 'Preserves single-letter, digraph, and trigraph frequency distributions of the underlying language, making it vulnerable to frequency analysis.',
    timeline: 'c. 9th–16th Century – Classical Era',
    position: [-45, 0, -90],
    cameraPosition: [-45, 2.2, -86.5],
    cameraTarget: [-45, 1.6, -90],
    macroPosition: [-45, 2.8, -88.2],
    macroTarget: [-45, 1.6, -90],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/substitution/encrypt',
      decrypt: '/api/substitution/decrypt',
    },
    defaultParams: {
      key: 'zebrascdfghijklmnopqtuvwxy',
    },
    challenge: {
      prompt: 'Decrypt this monoalphabetic substitution message using key alphabet "zebrascdfghijklmnopqtuvwxy".',
      ciphertext: 'SIAA ZQ LKBA',
      hint: 'Map each ciphertext letter back to A–Z using its index in the key alphabet.',
      answer: 'FLEE AT ONCE',
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
    challenge: {
      prompt: 'With rotors I-II-III loaded, which rotor steps on every single keystroke?',
      ciphertext: 'I - II - III',
      hint: 'The rightmost (fast) rotor always advances at least one step per keypress.',
      answer: 'III',
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
    challenge: {
      prompt: 'How many total pinwheels (chi, psi, and motor wheels combined) does the Lorenz SZ42 use?',
      ciphertext: '5 χ + 5 ψ + 2 μ',
      hint: 'Sum the 5 chi, 5 psi, and 2 motor wheels.',
      answer: '12',
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
    challenge: {
      prompt: 'Given primes p = 61 and q = 53, compute the RSA public modulus n = p × q.',
      ciphertext: 'p = 61, q = 53',
      hint: 'Multiply 61 by 53.',
      answer: '3233',
    },
  },
  {
    id: 'aes',
    name: 'AES Vault',
    category: 'Modern',
    wing: 'Modern Cryptography Wing',
    subtitle: 'Symmetric Block Cipher (CTR & CBC Modes)',
    description: 'Rijndael cipher utilizing 128-bit blocks with 128/192/256-bit keys through SubBytes, ShiftRows, MixColumns, and AddRoundKey operations. Supports Counter (CTR) and Cipher Block Chaining (CBC) modes with PKCS#7 padding.',
    historicalContext: 'Selected by NIST in 2001 after a 5-year open competition to replace DES. Protects classified government communications and worldwide disk encryption.',
    vulnerabilities: 'No known practical attack against full AES-128/256. Quantum Grover algorithm reduces effective key security to 64/128 bits. Reusing an IV/nonce leaks P1⊕P2 in CTR mode and reveals identical prefix blocks in CBC mode.',
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
      mode: 'ctr',
    },
    challenge: {
      prompt: 'In AES-CTR mode, if the same key and nonce/IV are reused for two plaintexts P1 and P2, what does XORing C1 ⊕ C2 reveal?',
      ciphertext: 'C1 ⊕ C2 = (P1 ⊕ K) ⊕ (P2 ⊕ K)',
      hint: 'The identical keystream K cancels out under XOR, leaving the XOR of the two plaintexts (P1^P2).',
      answer: 'P1^P2',
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
    challenge: {
      prompt: 'What is the fixed output bit length of a SHA-256 digest?',
      ciphertext: '32 bytes',
      hint: 'Multiply 32 bytes by 8 bits per byte.',
      answer: '256',
    },
  },
  {
    id: 'hmac-hash',
    name: 'Multi-Hash & HMAC',
    category: 'Modern',
    wing: 'Modern Cryptography Wing',
    subtitle: 'Cryptographic Digests & Keyed Message Authentication',
    description: 'Compares SHA-256, SHA3-256, BLAKE2s, and legacy MD5 digests alongside HMAC-SHA256 keyed message authentication codes.',
    historicalContext: 'HMAC (Hash-based Message Authentication Code) was formalized by Mihir Bellare, Ran Canetti, and Hugo Krawczyk in 1996 (RFC 2104) to prevent length-extension attacks on Merkle-Damgård hashes.',
    vulnerabilities: 'Legacy MD5 is broken against collision attacks and must not be used for security. HMAC-SHA256 remains secure even when the underlying hash has minor structural weaknesses.',
    timeline: '1996 AD–Present – Integrity & Authentication',
    position: [35, 0, -75],
    cameraPosition: [35, 2.2, -71.5],
    cameraTarget: [35, 1.6, -75],
    macroPosition: [35, 2.8, -73.2],
    macroTarget: [35, 1.6, -75],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/hmac/sign',
      decrypt: '/api/hmac/verify',
    },
    defaultParams: {
      algorithm: 'sha256',
      key: 'museum-secret-key',
    },
    challenge: {
      prompt: 'How many hexadecimal characters are in a 256-bit HMAC-SHA256 signature?',
      ciphertext: '256 bits = 32 bytes',
      hint: 'Each byte is represented by 2 hexadecimal characters.',
      answer: '64',
    },
  },
  {
    id: 'diffie-hellman',
    name: 'Diffie-Hellman Exchange',
    category: 'Modern',
    wing: 'Modern Cryptography Wing',
    subtitle: 'Asymmetric Key Agreement Over Public Channels',
    description: 'Allows two parties (Alice and Bob) to establish a shared secret key over an insecure public channel using modular exponentiation.',
    historicalContext: 'Published in 1976 by Whitfield Diffie and Martin Hellman (building on Ralph Merkle’s work), solving the millennia-old key distribution problem and launching modern public-key cryptography.',
    vulnerabilities: 'Unauthenticated Diffie-Hellman is vulnerable to Man-in-the-Middle (MitM) attacks; small primes are vulnerable to discrete logarithm attacks.',
    timeline: '1976 AD – Public-Key Revolution',
    position: [55, 0, -75],
    cameraPosition: [55, 2.2, -71.5],
    cameraTarget: [55, 1.6, -75],
    macroPosition: [55, 2.8, -73.2],
    macroTarget: [55, 1.6, -75],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/diffie-hellman/exchange',
      decrypt: '/api/diffie-hellman/exchange',
    },
    defaultParams: {
      p: 23,
      g: 5,
      a: 6,
      b: 15,
    },
    challenge: {
      prompt: 'With p = 23, g = 5, Alice secret a = 6, and Bob secret b = 15, compute the shared secret g^(ab) mod p.',
      ciphertext: 'p=23, g=5, a=6, b=15',
      hint: 'Compute A = 5^6 mod 23 = 8, then compute 8^15 mod 23.',
      answer: '2',
    },
  },
  {
    id: 'rsa-signatures',
    name: 'RSA Digital Signatures',
    category: 'Modern',
    wing: 'Modern Cryptography Wing',
    subtitle: 'Asymmetric Authentication & Non-Repudiation',
    description: 'Uses a private RSA key to sign message digests (s = H(m)^d mod n) and the corresponding public key to verify authenticity (H(m) ≡ s^e mod n).',
    historicalContext: 'Introduced alongside the 1977 RSA cryptosystem and standardized in PKCS#1 / PSS, RSA signatures underpin TLS certificates, software code signing, and digital documents.',
    vulnerabilities: 'Textbook RSA without padding (PSS) is malleable and vulnerable to existential forgery; small moduli are factored easily, and quantum Shor algorithm threatens RSA.',
    timeline: '1978 AD–Present – Digital Trust',
    position: [75, 0, -15],
    cameraPosition: [75, 2.2, -11.5],
    cameraTarget: [75, 1.6, -15],
    macroPosition: [75, 2.8, -13.2],
    macroTarget: [75, 1.6, -15],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/rsa/sign',
      decrypt: '/api/rsa/verify',
    },
    defaultParams: {
      p: 61,
      q: 53,
      e: 17,
    },
    challenge: {
      prompt: 'Which key is used to create an RSA digital signature that anyone with the public key can verify?',
      ciphertext: 'Sign(m) → s, Verify(m, s) → true',
      hint: 'Only the signer possesses this key; everyone else uses the public key to verify.',
      answer: 'private',
    },
  },
  {
    id: 'zkp-schnorr',
    name: 'Schnorr Zero-Knowledge Proof',
    category: 'Modern',
    wing: 'Modern Cryptography Wing',
    subtitle: 'Interactive Prover–Verifier Protocol',
    description: 'Allows a Prover to convince a Verifier they know a discrete-log secret x (where y = g^x mod p) through commitment, random challenge, and response without revealing x.',
    historicalContext: 'Proposed by Claus-Peter Schnorr in 1989 as an efficient zero-knowledge identification protocol, later adapted via the Fiat-Shamir heuristic into Schnorr signatures (used in Bitcoin Taproot).',
    vulnerabilities: 'Reusing the random commitment nonce r across two different challenges c1 ≠ c2 allows anyone to extract the secret key x = (s1 - s2) / (c1 - c2) mod q.',
    timeline: '1989 AD–Present – Zero-Knowledge Proofs',
    position: [75, 0, -45],
    cameraPosition: [75, 2.2, -41.5],
    cameraTarget: [75, 1.6, -45],
    macroPosition: [75, 2.8, -43.2],
    macroTarget: [75, 1.6, -45],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/zkp/prove-step',
      decrypt: '/api/zkp/prove-step',
    },
    defaultParams: {
      p: 23,
      q: 11,
      g: 2,
      x: 6,
    },
    challenge: {
      prompt: 'In Schnorr ZKP, given commitment t = g^r mod p, challenge c, and response s = (r + c·x) mod q, what must g^s mod p equal for verification to pass?',
      ciphertext: 'y = g^x mod p, t = g^r mod p',
      hint: 'Substitute s = r + c·x into g^s: g^(r + c·x) = g^r · (g^x)^c = t*y^c mod p.',
      answer: 't*y^c',
    },
  },
  {
    id: 'post-quantum-kem',
    name: 'Post-Quantum ML-KEM',
    category: 'Modern',
    wing: 'Modern Cryptography Wing',
    subtitle: 'Lattice Key Encapsulation (Learning With Errors)',
    description: 'Establishes a shared secret resistant to quantum computers using Module Learning With Errors (ML-KEM / Kyber), hiding secrets inside noisy linear lattice equations.',
    historicalContext: 'Standardized by NIST in 2024 as FIPS 203 (ML-KEM, derived from CRYSTALS-Kyber) to replace RSA and ECDH against future fault-tolerant quantum computers running Shor algorithm.',
    vulnerabilities: 'Improperly bounded noise or leaked error terms can reduce LWE to simple Gaussian elimination; side-channel leakage during decapsulation must be mitigated via Fujisaki-Okamoto transform.',
    timeline: '2024 AD – Post-Quantum Era (FIPS 203)',
    position: [75, 0, -75],
    cameraPosition: [75, 2.2, -71.5],
    cameraTarget: [75, 1.6, -75],
    macroPosition: [75, 2.8, -73.2],
    macroTarget: [75, 1.6, -75],
    rotationY: 0,
    endpoint: {
      encrypt: '/api/mlkem/demo',
      decrypt: '/api/mlkem/demo',
    },
    defaultParams: {
      q: 97,
      a: [12, 25],
      s: [3, 2],
      e: 1,
    },
    challenge: {
      prompt: 'What hard mathematical problem underpins NIST FIPS 203 (ML-KEM) security against quantum computers?',
      ciphertext: 'b = A·s + e (mod q)',
      hint: 'Adding small noise e to linear equations modulo q defines Learning With Errors (LWE).',
      answer: 'LWE',
    },
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
  interactiveDemoType: 'frequency-analysis' | 'information-entropy' | 'key-exchange' | 'turing-bombe';
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
    position: [-9.0, 0, 8.5],
    cameraPosition: [-7.8, 2.4, 12.0],
    cameraTarget: [-9.0, 2.3, 8.5],
    rotationY: 0.35,
    accentColor: 0xd97706,
    accentHex: '#d97706',
    plaqueSummary: 'Father of Cryptanalysis • Author of the 9th Century Treatise on Deciphering Messages',
    interactiveDemoType: 'frequency-analysis',
  },
  {
    id: 'statue-turing',
    name: 'Alan Turing',
    lifespan: '1912–1954',
    title: 'The Titan of Wartime Cryptanalysis',
    landmarkPaper: 'On Computable Numbers (1936) & The Bombe Machine (1940)',
    description: 'The titan of electromechanical cryptanalysis and founder of modern theoretical computer science. At Bletchley Park\'s Hut 8 during World War II, Turing devised the Bombe machine to systematically break the German Enigma cipher, saving millions of lives and laying the foundation for modern computing.',
    historicalSignificance: 'Stationed at Bletchley Park, Turing applied rigorous mathematical logic, group theory, and electromechanical automation to crack the German naval Enigma. His design of the British Bombe machine tested thousands of rotor possibilities concurrently using known-plaintext "cribs", fundamentally transforming wartime intelligence and the birth of the computer age.',
    coreBreakthrough: 'Electromechanical Crib Matching & The Bombe: Automating the deduction of rotor wirings and daily settings by eliminating electrical contradictions across simultaneous virtual Enigma paths.',
    keyContributions: [
      'Designed the British Bombe electromechanical cryptanalysis machine',
      'Cracked the German Naval Enigma (M3 & M4) at Bletchley Park Hut 8',
      'Invented the Turing Machine, defining the mathematical foundation of computation',
      'Pioneered automated cryptanalysis using known-plaintext "cribs"',
    ],
    associatedWing: 'Historical Systems Wing',
    position: [-3.8, 0, 4.2],
    cameraPosition: [-2.8, 2.4, 7.8],
    cameraTarget: [-3.8, 2.3, 4.2],
    rotationY: 0.15,
    accentColor: 0xf59e0b,
    accentHex: '#f59e0b',
    plaqueSummary: 'Titan of Wartime Cryptanalysis • Breaker of Enigma & Father of Computer Science',
    interactiveDemoType: 'turing-bombe',
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
    position: [3.8, 0, 4.2],
    cameraPosition: [4.8, 2.4, 7.8],
    cameraTarget: [3.8, 2.3, 4.2],
    rotationY: -0.15,
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
    position: [9.0, 0, 8.5],
    cameraPosition: [10.2, 2.4, 12.0],
    cameraTarget: [9.0, 2.3, 8.5],
    rotationY: -0.35,
    accentColor: 0x9333ea,
    accentHex: '#9333ea',
    plaqueSummary: 'Pioneers of Public-Key Cryptography • Diffie-Hellman Key Exchange & Merkle\'s Puzzles',
    interactiveDemoType: 'key-exchange',
  },
];

