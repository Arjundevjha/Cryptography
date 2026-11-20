import * as THREE from 'three';
import { MUSEUM_EXHIBITS } from '../museumData';
import {
  EXHIBIT_BUILDERS,
  buildHighQualityArtifact,
  registerExhibitBuilder,
} from '../scene/exhibitRegistry';
import { CLASSICAL_EXHIBIT_BUILDERS } from '../scene/classicalExhibits';
import { HISTORICAL_EXHIBIT_BUILDERS } from '../scene/historicalExhibits';
import { MODERN_EXHIBIT_BUILDERS } from '../scene/modernExhibits';

function countMeshes(root: THREE.Object3D): number {
  let count = 0;
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      count += 1;
    }
  });
  return count;
}

describe('exhibitRegistry & wing artifact builders', () => {
  it('registers a dedicated builder for every exhibit in MUSEUM_EXHIBITS', () => {
    for (const exhibit of MUSEUM_EXHIBITS) {
      expect(EXHIBIT_BUILDERS[exhibit.id]).toBeDefined();
      const group = new THREE.Group();
      const matched = buildHighQualityArtifact(exhibit.id, group);
      expect(matched).toBe(true);
      expect(countMeshes(group)).toBeGreaterThanOrEqual(3);
    }
  });

  it('partitions builders cleanly by wing category without overlap', () => {
    const classicalIds = Object.keys(CLASSICAL_EXHIBIT_BUILDERS);
    const historicalIds = Object.keys(HISTORICAL_EXHIBIT_BUILDERS);
    const modernIds = Object.keys(MODERN_EXHIBIT_BUILDERS);

    for (const exhibit of MUSEUM_EXHIBITS) {
      if (exhibit.category === 'Classical') {
        expect(classicalIds).toContain(exhibit.id);
      } else if (exhibit.category === 'Historical') {
        expect(historicalIds).toContain(exhibit.id);
      } else if (exhibit.category === 'Modern') {
        expect(modernIds).toContain(exhibit.id);
      }
    }

    const total = classicalIds.length + historicalIds.length + modernIds.length;
    expect(new Set([...classicalIds, ...historicalIds, ...modernIds]).size).toBe(total);
  });

  it('falls back to a generic museum plinth orb for unknown exhibit IDs', () => {
    const group = new THREE.Group();
    const matched = buildHighQualityArtifact('non-existent-cipher', group);
    expect(matched).toBe(false);
    expect(countMeshes(group)).toBe(3);
  });

  it('supports plugging in a new exhibit builder via registerExhibitBuilder', () => {
    const customId = 'test-custom-cipher';
    try {
      registerExhibitBuilder(customId, (group, materials) => {
        group.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), materials.polishedGold));
      });
      const group = new THREE.Group();
      expect(buildHighQualityArtifact(customId, group)).toBe(true);
      expect(countMeshes(group)).toBe(1);
    } finally {
      delete EXHIBIT_BUILDERS[customId];
    }
  });
});
