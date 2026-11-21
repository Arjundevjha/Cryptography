import * as THREE from 'three';
import { MUSEUM_EXHIBITS } from '../museumData';
import {
  getRoomAccentPalette,
  decorateExhibitRoom,
  decorateFoyerWalls,
  type RoomArchitectureMaterials,
} from '../scene/wingArchitecture';

function createTestMaterials(): RoomArchitectureMaterials {
  return {
    goldMat: new THREE.MeshStandardMaterial({ color: 0xd4af37 }),
    trimMat: new THREE.MeshStandardMaterial({ color: 0x8a6d3b }),
    wainscotMat: new THREE.MeshStandardMaterial({ color: 0x3b271c }),
    travertineTrimMat: new THREE.MeshStandardMaterial({ color: 0xd6cfc2 }),
    crystalMat: new THREE.MeshStandardMaterial({ color: 0xfff3d6 }),
  };
}

function countMeshes(root: THREE.Object3D): number {
  let count = 0;
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      count += 1;
    }
  });
  return count;
}

describe('wingArchitecture', () => {
  describe('getRoomAccentPalette', () => {
    it('returns unique accent, velvet, and runner colors across all 19 museum exhibits', () => {
      const accentHexes = new Set<number>();
      const velvetColors = new Set<number>();
      const runnerColors = new Set<number>();

      MUSEUM_EXHIBITS.forEach((exhibit, idx) => {
        const palette = getRoomAccentPalette(exhibit.id, exhibit.category, idx);
        expect(palette.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
        accentHexes.add(palette.accentHex);
        velvetColors.add(palette.velvetColor);
        runnerColors.add(palette.runnerColor);
      });

      expect(MUSEUM_EXHIBITS.length).toBe(19);
      expect(accentHexes.size).toBe(19);
      expect(velvetColors.size).toBe(19);
      expect(runnerColors.size).toBe(19);
    });

    it('assigns category-specific sconce styles', () => {
      expect(getRoomAccentPalette('caesar', 'Classical', 0).sconceStyle).toBe('torch');
      expect(getRoomAccentPalette('enigma', 'Historical', 7).sconceStyle).toBe('cage');
      expect(getRoomAccentPalette('rsa', 'Modern', 9).sconceStyle).toBe('linear');
    });

    it('provides deterministic fallback palettes for unknown exhibit IDs', () => {
      const p1 = getRoomAccentPalette('custom-cipher-a', 'Modern', 18);
      const p2 = getRoomAccentPalette('custom-cipher-b', 'Modern', 19);

      expect(p1.sconceStyle).toBe('linear');
      expect(p2.sconceStyle).toBe('linear');
      expect(p1.accentHex).not.toBe(p2.accentHex);
    });
  });

  describe('decorateExhibitRoom', () => {
    it.each([
      { id: 'caesar', category: 'Classical' as const, exIdx: 0, expectedSconce: 'torch' },
      { id: 'enigma', category: 'Historical' as const, exIdx: 7, expectedSconce: 'cage' },
      { id: 'aes', category: 'Modern' as const, exIdx: 10, expectedSconce: 'linear' },
    ])(
      'adds curatorial panel, category sconces, floor runner, and corner accents for $category ($id)',
      ({ id, category, exIdx, expectedSconce }) => {
        const roomGroup = new THREE.Group();
        const materials = createTestMaterials();
        const sidePanelTex = new THREE.Texture();

        expect(() =>
          decorateExhibitRoom(roomGroup, {
            exhibitId: id,
            title: id.toUpperCase(),
            subtitle: 'Test Subtitle',
            timeline: 'Test Timeline',
            category,
            exIdx,
            sidePanelTex,
            materials,
          })
        ).not.toThrow();

        expect(countMeshes(roomGroup)).toBeGreaterThan(15);

        const panel = roomGroup.getObjectByName(`curatorial-panel-${id}`);
        expect(panel).toBeDefined();
        expect(panel?.position.x).toBeCloseTo(6.72);
        expect(panel?.position.y).toBeCloseTo(4.0);
        expect(panel?.position.z).toBeCloseTo(0);
        expect(panel?.rotation.y).toBeCloseTo(-Math.PI / 2);

        const runner = roomGroup.getObjectByName('exhibit-floor-runner');
        expect(runner).toBeDefined();

        const corners = roomGroup.getObjectByName('exhibit-corner-accents');
        expect(corners).toBeDefined();

        const sconces: THREE.Object3D[] = [];
        roomGroup.traverse((obj) => {
          if (obj.userData?.sconceStyle) {
            sconces.push(obj);
          }
        });
        expect(sconces).toHaveLength(2);
        sconces.forEach((sconce) => {
          expect(sconce.userData.sconceStyle).toBe(expectedSconce);
          expect(Math.abs(sconce.position.x)).toBeCloseTo(4.4);
          expect(sconce.position.y).toBeCloseTo(4.4);
          expect(sconce.position.z).toBeCloseTo(-5.65);
        });
      }
    );
  });

  describe('decorateFoyerWalls', () => {
    it('adds framed murals, pilasters, wainscoting, and sconces to the scene without throwing', () => {
      const scene = new THREE.Scene();
      const materials = createTestMaterials();
      const murals = {
        leftTex: new THREE.Texture(),
        rightTex: new THREE.Texture(),
        classicalTex: new THREE.Texture(),
        historicalTex: new THREE.Texture(),
        modernTex: new THREE.Texture(),
      };

      expect(() =>
        decorateFoyerWalls(scene, {
          materials,
          murals,
        })
      ).not.toThrow();

      const foyerGroup = scene.getObjectByName('foyer-wall-decorations');
      expect(foyerGroup).toBeDefined();
      expect(countMeshes(foyerGroup!)).toBeGreaterThan(30);
    });
  });
});
