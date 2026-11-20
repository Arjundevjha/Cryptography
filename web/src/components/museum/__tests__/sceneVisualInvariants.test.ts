import fs from 'fs';
import path from 'path';
import { createVenetianPlasterTexture } from '../museumTextures';
import { ARCHIVAL_PORTRAITS } from '../scene/statuesAndFoyer';

const SCENE_PATH = path.resolve(__dirname, '../ThreeMuseumScene.tsx');
const STATUES_FOYER_PATH = path.resolve(__dirname, '../scene/statuesAndFoyer.ts');

describe('3D Museum scene visual & spatial invariants', () => {
  const sceneSource = fs.readFileSync(SCENE_PATH, 'utf8');
  const statuesFoyerSource = fs.readFileSync(STATUES_FOYER_PATH, 'utf8');
  const combinedSource = `${sceneSource}\n${statuesFoyerSource}`;

  it('places all archival portraits in front of the entry camera (z <= 16)', () => {
    expect(ARCHIVAL_PORTRAITS.length).toBeGreaterThanOrEqual(5);

    for (const portrait of ARCHIVAL_PORTRAITS) {
      expect(portrait.pos).toHaveLength(3);
      expect(portrait.pos[2]).toBeLessThanOrEqual(16);
    }
  });

  it('does not include floating statue glyphs, stray corridor benches, or the bare apse placeholder', () => {
    expect(combinedSource).not.toContain('statueGlyphs');
    expect(combinedSource).not.toContain('buildGalleryBench');
    expect(combinedSource).not.toContain('apseGroup');
    expect(combinedSource).not.toContain('apseCrest');
  });

  it('wires per-exhibit plates, side panels, unique portraits, and foyer/room architecture', () => {
    expect(sceneSource).toContain('createExhibitPlateTexture');
    expect(sceneSource).toContain('createSideGalleryPanelTexture');
    expect(sceneSource).toContain('createFoyerMuralTexture');
    expect(statuesFoyerSource).toContain('createUniquePortraitTexture');
    expect(sceneSource).toContain('decorateExhibitRoom');
    expect(sceneSource).toContain('decorateFoyerWalls');
    expect(sceneSource).toContain('getRoomAccentPalette');
  });

  it('keeps room roofs flush at y = 8.65 with zero overhang to avoid wall-ceiling seams', () => {
    expect(sceneSource).toContain('new THREE.BoxGeometry(14.0, 0.3, 12.0)');
    expect(sceneSource).toContain('roomRoof.position.set(0, 8.65, 0)');
  });

  it('creates clean architectural Venetian plaster textures without throwing', () => {
    const tex = createVenetianPlasterTexture('#5b748a', '#485f74', 2, 1, 65);
    expect(tex).toBeDefined();
  });
});
