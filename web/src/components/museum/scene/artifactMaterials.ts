import * as THREE from 'three';

export interface ArtifactMaterialSet {
  antiqueBrass: THREE.MeshStandardMaterial;
  polishedGold: THREE.MeshStandardMaterial;
  agedBronze: THREE.MeshStandardMaterial;
  mahogany: THREE.MeshStandardMaterial;
  darkOak: THREE.MeshStandardMaterial;
  obsidian: THREE.MeshStandardMaterial;
  brushedSteel: THREE.MeshStandardMaterial;
  gunmetal: THREE.MeshStandardMaterial;
  ivory: THREE.MeshStandardMaterial;
}

export function createArtifactMaterials(): ArtifactMaterialSet {
  return {
    antiqueBrass: new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.88, roughness: 0.24 }),
    polishedGold: new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.94, roughness: 0.14 }),
    agedBronze: new THREE.MeshStandardMaterial({ color: 0x7c4a1e, metalness: 0.82, roughness: 0.32 }),
    mahogany: new THREE.MeshStandardMaterial({ color: 0x3b180c, roughness: 0.34, metalness: 0.08 }),
    darkOak: new THREE.MeshStandardMaterial({ color: 0x2b170b, roughness: 0.42, metalness: 0.05 }),
    obsidian: new THREE.MeshStandardMaterial({ color: 0x0f131a, roughness: 0.16, metalness: 0.45 }),
    brushedSteel: new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.2 }),
    gunmetal: new THREE.MeshStandardMaterial({ color: 0x27303f, metalness: 0.78, roughness: 0.32 }),
    ivory: new THREE.MeshStandardMaterial({ color: 0xf5eedc, roughness: 0.28, metalness: 0.04 }),
  };
}
