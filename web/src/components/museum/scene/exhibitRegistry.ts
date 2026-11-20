import * as THREE from 'three';
import { createArtifactMaterials, type ArtifactMaterialSet } from './artifactMaterials';
import { CLASSICAL_EXHIBIT_BUILDERS, type ExhibitArtifactBuilder } from './classicalExhibits';
import { HISTORICAL_EXHIBIT_BUILDERS } from './historicalExhibits';
import { MODERN_EXHIBIT_BUILDERS } from './modernExhibits';

export type { ExhibitArtifactBuilder, ArtifactMaterialSet };

export const EXHIBIT_BUILDERS: Record<string, ExhibitArtifactBuilder> = {
  ...CLASSICAL_EXHIBIT_BUILDERS,
  ...HISTORICAL_EXHIBIT_BUILDERS,
  ...MODERN_EXHIBIT_BUILDERS,
};

export function registerExhibitBuilder(id: string, builder: ExhibitArtifactBuilder): void {
  EXHIBIT_BUILDERS[id] = builder;
}

function buildFallbackArtifact(group: THREE.Group, materials: ArtifactMaterialSet): void {
  const { obsidian, polishedGold } = materials;

  const fallbackBase = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 0.09, 32), obsidian);
  fallbackBase.position.y = -0.44;
  group.add(fallbackBase);

  const fallbackOrb = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.26, 0),
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.88,
      roughness: 0.2,
    })
  );
  fallbackOrb.position.y = 0.05;
  group.add(fallbackOrb);

  const fallbackRing = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.02, 14, 48), polishedGold);
  fallbackRing.position.y = 0.05;
  fallbackRing.rotation.x = Math.PI / 3;
  group.add(fallbackRing);
}

/**
 * Dispatches 3D artifact geometry construction to the registered wing builder
 * for the given exhibit ID, or falls back to a generic museum plinth orb.
 */
export function buildHighQualityArtifact(
  id: string,
  group: THREE.Group,
  materials: ArtifactMaterialSet = createArtifactMaterials()
): boolean {
  const builder = EXHIBIT_BUILDERS[id];
  if (builder) {
    builder(group, materials);
    return true;
  }
  buildFallbackArtifact(group, materials);
  return false;
}
