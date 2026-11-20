import * as THREE from 'three';
import { MUSEUM_STATUES } from '../museumData';
import {
  ARCHIVAL_PORTRAITS,
  buildGrandEntranceFoyer,
  buildPioneerStatues,
  buildStatueMonument,
  buildWingPortals,
  getPlaqueTexture,
  getPortalBannerTexture,
  getSignboardTexture,
  type FoyerBuildMaterials,
} from '../scene/statuesAndFoyer';

function createFoyerMaterials(): FoyerBuildMaterials {
  const std = (color: number) => new THREE.MeshStandardMaterial({ color });
  return {
    wallMat: std(0xe7ddd0),
    wainscotMat: std(0x422a1b),
    trimMat: std(0xd4af37),
    oakRunnerMat: std(0x6b4c35),
    brassInlayMat: std(0xd4af37),
    travertineMat: std(0xe6dccb),
    travertineTrimMat: std(0xe6dccb),
    wartimeBronzeMat: std(0x5a4533),
    titaniumMat: std(0x5a6878),
    glassMat: new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.16 }),
    goldMat: std(0xd4af37),
    crystalMat: std(0xfffbeb),
    contactShadowMat: new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 }),
  };
}

describe('statuesAndFoyer', () => {
  it('builds all 4 pioneer statue monuments with raycast statueId tags on descendants', () => {
    const scene = new THREE.Scene();
    buildPioneerStatues(scene);

    expect(scene.children).toHaveLength(MUSEUM_STATUES.length);
    MUSEUM_STATUES.forEach((statue, idx) => {
      const statueGroup = scene.children[idx];
      expect(statueGroup.userData.statueId).toBe(statue.id);
      let meshCount = 0;
      statueGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          meshCount += 1;
          expect(child.userData.statueId).toBe(statue.id);
        }
      });
      expect(meshCount).toBeGreaterThan(10);
    });
  });

  it('builds individual statue monument with flat inlaid floor medallion (no partial arc obstruction)', () => {
    const group = new THREE.Group();
    buildStatueMonument(MUSEUM_STATUES[0], group);

    let hasRing = false;
    let hasCircle = false;
    group.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        if (mesh.geometry instanceof THREE.RingGeometry) hasRing = true;
        if (mesh.geometry instanceof THREE.CircleGeometry) hasCircle = true;
      }
    });
    expect(hasRing).toBe(true);
    expect(hasCircle).toBe(true);
  });

  it('builds grand entrance foyer with colonnade, timeline frieze, and 5 archival portrait steles', () => {
    const scene = new THREE.Scene();
    const materials = createFoyerMaterials();
    buildGrandEntranceFoyer(scene, materials);

    // 3 door meshes + 3 medallion meshes + 8 spokes + 8 colonnade groups + 3 frieze meshes + 5 portrait steles
    expect(scene.children.length).toBeGreaterThanOrEqual(3 + 3 + 8 + 8 + 3 + ARCHIVAL_PORTRAITS.length);
  });

  it('builds all 3 grand wing portals tagged with wingId for raycast navigation', () => {
    const scene = new THREE.Scene();
    const materials = createFoyerMaterials();
    buildWingPortals(scene, materials);

    const wingIds = new Set<string>();
    scene.traverse((obj) => {
      if (obj.userData?.wingId) {
        wingIds.add(obj.userData.wingId);
      }
    });
    expect(wingIds).toEqual(new Set(['wing-classical', 'wing-historical', 'wing-modern']));
  });

  it('caches portal, signboard, and plaque canvas textures', () => {
    expect(getPortalBannerTexture('TEST PORTAL')).toBe(getPortalBannerTexture('TEST PORTAL'));
    expect(getSignboardTexture('Caesar', '50 BC')).toBe(getSignboardTexture('Caesar', '50 BC'));
    expect(getPlaqueTexture('Caesar', 'Shift cipher')).toBe(getPlaqueTexture('Caesar', 'Shift cipher'));
  });
});
