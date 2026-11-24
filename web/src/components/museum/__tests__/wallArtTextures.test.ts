import * as THREE from 'three';
import {
  EXHIBIT_ART_SPECS,
  createExhibitPlateTexture,
  createFoyerMuralTexture,
  createSideGalleryPanelTexture,
  createUniquePortraitTexture,
  type FoyerMuralTheme,
} from '../scene/wallArtTextures';

const ALL_EXHIBIT_IDS = [
  'caesar',
  'affine',
  'vigenere',
  'playfair',
  'polybius',
  'scytale',
  'substitution',
  'enigma',
  'lorenz',
  'rsa',
  'aes',
  'sha256',
  'hmac-hash',
  'diffie-hellman',
  'rsa-signatures',
  'zkp-schnorr',
  'post-quantum-kem',
  'ecc',
  'otp-chacha20',
  'shamir-secret-sharing',
] as const;

const PORTRAIT_SUBJECTS = [
  { name: 'Leon Battista Alberti', lifespan: '1404–1472', legacy: 'Polyalphabetic Cipher Disc' },
  { name: 'Blaise de Vigenère', lifespan: '1523–1596', legacy: 'Le Chiffre Indéchiffrable' },
  { name: 'Marian Rejewski', lifespan: '1905–1980', legacy: 'Mathematical Breaker of Enigma' },
  { name: 'Charles Wheatstone', lifespan: '1802–1875', legacy: 'Playfair Digraph Matrix' },
  { name: 'Auguste Kerckhoffs', lifespan: '1835–1903', legacy: 'Kerckhoffs Cryptographic Principle' },
];

function createMock2dContext(): CanvasRenderingContext2D {
  const gradient = { addColorStop: jest.fn() };
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn((text: string) => ({ width: text.length * 8 })),
    createRadialGradient: jest.fn(() => gradient),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    quadraticCurveTo: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    setLineDash: jest.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('wallArtTextures', () => {
  describe('EXHIBIT_ART_SPECS', () => {
    it('covers all 20 exhibit IDs with unique titles, motifs, and formulas', () => {
      const specIds = Object.keys(EXHIBIT_ART_SPECS);
      expect(specIds).toHaveLength(20);
      ALL_EXHIBIT_IDS.forEach((id) => {
        expect(EXHIBIT_ART_SPECS[id]).toBeDefined();
        expect(EXHIBIT_ART_SPECS[id].id).toBe(id);
      });

      const titles = new Set(ALL_EXHIBIT_IDS.map((id) => EXHIBIT_ART_SPECS[id].title));
      const motifs = new Set(ALL_EXHIBIT_IDS.map((id) => EXHIBIT_ART_SPECS[id].motif));
      const formulas = new Set(ALL_EXHIBIT_IDS.map((id) => EXHIBIT_ART_SPECS[id].formula));
      const facts = new Set(ALL_EXHIBIT_IDS.map((id) => EXHIBIT_ART_SPECS[id].historicalFact));

      expect(titles.size).toBe(20);
      expect(motifs.size).toBe(20);
      expect(formulas.size).toBe(20);
      expect(facts.size).toBe(20);
    });
  });

  describe('null 2D context safety (jsdom default)', () => {
    it('returns CanvasTexture instances safely when 2d context is null', () => {
      const plate = createExhibitPlateTexture('caesar', 'Caesar Cipher', 'Classical', 'c. 58 BC');
      const panel = createSideGalleryPanelTexture(
        'enigma',
        'Enigma Machine',
        'Rotor Encryption',
        '1918–1945',
        'Historical'
      );
      const mural = createFoyerMuralTexture('evolution');
      const portrait = createUniquePortraitTexture(
        'Marian Rejewski',
        '1905–1980',
        'Enigma Codebreaker'
      );

      expect(plate).toBeInstanceOf(THREE.CanvasTexture);
      expect(panel).toBeInstanceOf(THREE.CanvasTexture);
      expect(mural).toBeInstanceOf(THREE.CanvasTexture);
      expect(portrait).toBeInstanceOf(THREE.CanvasTexture);
    });
  });

  describe('2D drawing & caching with mocked canvas context', () => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    let mockCtx: CanvasRenderingContext2D;

    beforeEach(() => {
      mockCtx = createMock2dContext();
      HTMLCanvasElement.prototype.getContext = jest.fn((type: string) => {
        if (type === '2d') return mockCtx;
        return null;
      }) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    });

    afterEach(() => {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });

    it('renders unique exhibit plates for all 20 exhibits and caches repeated calls', () => {
      const plates = ALL_EXHIBIT_IDS.map((id) => {
        const spec = EXHIBIT_ART_SPECS[id];
        return createExhibitPlateTexture(id, spec.title, spec.category, 'Archival');
      });

      plates.forEach((tex) => {
        expect(tex).toBeInstanceOf(THREE.CanvasTexture);
      });
      expect(new Set(plates).size).toBe(20);

      const cached = createExhibitPlateTexture(
        'rsa',
        EXHIBIT_ART_SPECS.rsa.title,
        EXHIBIT_ART_SPECS.rsa.category,
        'Archival'
      );
      expect(cached).toBe(plates[ALL_EXHIBIT_IDS.indexOf('rsa')]);
    });

    it('renders side gallery panels for all 20 exhibits and caches repeated calls', () => {
      const panels = ALL_EXHIBIT_IDS.map((id) => {
        const spec = EXHIBIT_ART_SPECS[id];
        return createSideGalleryPanelTexture(id, spec.title, spec.motif, 'Timeline', spec.category);
      });

      expect(new Set(panels).size).toBe(20);
      const cached = createSideGalleryPanelTexture(
        'aes',
        EXHIBIT_ART_SPECS.aes.title,
        EXHIBIT_ART_SPECS.aes.motif,
        'Timeline',
        EXHIBIT_ART_SPECS.aes.category
      );
      expect(cached).toBe(panels[ALL_EXHIBIT_IDS.indexOf('aes')]);
    });

    it('renders all 4 foyer mural themes and caches them', () => {
      const themes: FoyerMuralTheme[] = ['classical', 'historical', 'modern', 'evolution'];
      const murals = themes.map((t) => createFoyerMuralTexture(t));

      expect(new Set(murals).size).toBe(4);
      expect(createFoyerMuralTexture('classical')).toBe(murals[0]);
    });

    it('renders all 5 unique cryptologist portraits and caches them', () => {
      const portraits = PORTRAIT_SUBJECTS.map((p) =>
        createUniquePortraitTexture(p.name, p.lifespan, p.legacy)
      );

      expect(new Set(portraits).size).toBe(5);
      expect(
        createUniquePortraitTexture(
          PORTRAIT_SUBJECTS[0].name,
          PORTRAIT_SUBJECTS[0].lifespan,
          PORTRAIT_SUBJECTS[0].legacy
        )
      ).toBe(portraits[0]);
    });
  });
});
