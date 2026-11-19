import fs from 'fs';
import path from 'path';
import { createVenetianPlasterTexture } from '../museumTextures';

const SCENE_PATH = path.resolve(__dirname, '../ThreeMuseumScene.tsx');

describe('3D Museum scene visual & spatial invariants', () => {
  const sceneSource = fs.readFileSync(SCENE_PATH, 'utf8');

  it('places all archival portraits in front of the entry camera (z <= 20)', () => {
    const blockMatch = sceneSource.match(/const archivalPortraits = \[([\s\S]*?)\];/);
    expect(blockMatch).not.toBeNull();
    const posMatches = Array.from(blockMatch![1].matchAll(/pos:\s*\[([^\]]+)\]/g));
    expect(posMatches.length).toBeGreaterThanOrEqual(5);

    for (const match of posMatches) {
      const coords = match[1].split(',').map((n) => Number(n.trim()));
      expect(coords).toHaveLength(3);
      expect(coords[2]).toBeLessThanOrEqual(16);
    }
  });

  it('does not include floating statue glyphs, stray corridor benches, or the bare apse placeholder', () => {
    expect(sceneSource).not.toContain('statueGlyphs');
    expect(sceneSource).not.toContain('buildGalleryBench');
    expect(sceneSource).not.toContain('apseGroup');
    expect(sceneSource).not.toContain('apseCrest');
  });

  it('wires per-exhibit plates, side panels, unique portraits, and foyer/room architecture', () => {
    expect(sceneSource).toContain('createExhibitPlateTexture');
    expect(sceneSource).toContain('createSideGalleryPanelTexture');
    expect(sceneSource).toContain('createFoyerMuralTexture');
    expect(sceneSource).toContain('createUniquePortraitTexture');
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
