import * as THREE from 'three';

export interface ModernArtifactMaterials {
  obsidian?: THREE.Material;
  polishedGold?: THREE.Material;
}

export interface ModernExhibitAnimationHandle {
  exhibitId: 'ecc' | 'otp-chacha20' | 'shamir-secret-sharing';
  update: (elapsed: number) => void;
}

function createDefaultObsidian(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.25,
    metalness: 0.65,
  });
}

function createDefaultPolishedGold(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.9,
    roughness: 0.18,
  });
}

/**
 * Builds the 3D Elliptic Curve Cryptography (ECDH / ECDSA) artifact:
 * a sculpted Weierstrass curve ribbon, point-addition nodes (P, Q, P+Q),
 * and an orbiting generator ring.
 */
function buildEccArtifact(
  group: THREE.Group,
  materials?: ModernArtifactMaterials
): ModernExhibitAnimationHandle {
  const obsidian = materials?.obsidian ?? createDefaultObsidian();
  const polishedGold = materials?.polishedGold ?? createDefaultPolishedGold();

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.65, 0.09, 36), obsidian);
  base.position.y = -0.44;
  group.add(base);

  const curveContainer = new THREE.Group();
  curveContainer.position.y = 0.02;
  group.add(curveContainer);

  // Sample upper and lower branches of y^2 = x^3 - 0.8x + 0.45
  const upperPoints: THREE.Vector3[] = [];
  const lowerPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 32; i++) {
    const x = -0.35 + (i / 32) * 0.72;
    const rhs = Math.max(0.002, x * x * x - 0.8 * x + 0.45);
    const y = Math.sqrt(rhs) * 0.46;
    upperPoints.push(new THREE.Vector3(x, y, 0));
    lowerPoints.push(new THREE.Vector3(x, -y, 0));
  }

  const curveMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.95,
    roughness: 0.18,
    metalness: 0.35,
  });

  const upperCurve = new THREE.CatmullRomCurve3(upperPoints);
  const lowerCurve = new THREE.CatmullRomCurve3(lowerPoints);
  const upperTube = new THREE.Mesh(new THREE.TubeGeometry(upperCurve, 32, 0.022, 10, false), curveMat);
  const lowerTube = new THREE.Mesh(new THREE.TubeGeometry(lowerCurve, 32, 0.022, 10, false), curveMat);
  curveContainer.add(upperTube, lowerTube);

  // Secant chord connecting P, Q, and R = -(P + Q)
  const chordPts = [
    new THREE.Vector3(-0.3, 0.28, 0),
    new THREE.Vector3(0.05, 0.31, 0),
    new THREE.Vector3(0.32, 0.33, 0),
  ];
  const chordCurve = new THREE.CatmullRomCurve3(chordPts);
  const chordMesh = new THREE.Mesh(new THREE.TubeGeometry(chordCurve, 12, 0.011, 8, false), polishedGold);
  curveContainer.add(chordMesh);

  const pointColors = [0xf59e0b, 0x34d399, 0xf472b6];
  const pointNodes: THREE.Mesh[] = [];
  chordPts.forEach((pt, idx) => {
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 18, 18),
      new THREE.MeshStandardMaterial({
        color: pointColors[idx],
        emissive: pointColors[idx],
        emissiveIntensity: 1.0,
        roughness: 0.15,
      })
    );
    node.position.copy(pt);
    curveContainer.add(node);
    pointNodes.push(node);
  });

  const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.014, 12, 48), polishedGold);
  orbitRing.rotation.x = Math.PI / 2.3;
  curveContainer.add(orbitRing);

  return {
    exhibitId: 'ecc',
    update: (elapsed: number) => {
      curveContainer.rotation.y = elapsed * 0.35;
      orbitRing.rotation.z = elapsed * 0.5;
      pointNodes.forEach((node, idx) => {
        const s = 1 + 0.14 * Math.sin(elapsed * 2.4 + idx * 1.3);
        node.scale.setScalar(s);
      });
    },
  };
}

/**
 * Builds the 3D One-Time Pad & ChaCha20 Stream Cipher artifact:
 * a 4x4 ARX state matrix of glowing cells flanking a central XOR prism
 * and counter-rotating quarter-round rings.
 */
function buildOtpChachaArtifact(
  group: THREE.Group,
  materials?: ModernArtifactMaterials
): ModernExhibitAnimationHandle {
  const obsidian = materials?.obsidian ?? createDefaultObsidian();
  const polishedGold = materials?.polishedGold ?? createDefaultPolishedGold();

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.09, 0.96), obsidian);
  base.position.y = -0.44;
  group.add(base);

  const matrixGroup = new THREE.Group();
  matrixGroup.position.y = 0.04;
  group.add(matrixGroup);

  const cellGeo = new THREE.BoxGeometry(0.11, 0.11, 0.11);
  const cells: THREE.Mesh[] = [];

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const isConstant = row === 0;
      const isNonceCounter = row === 3;
      const color = isConstant ? 0xf59e0b : isNonceCounter ? 0x38bdf8 : 0x2dd4bf;
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.75,
        roughness: 0.2,
        metalness: 0.35,
      });
      const cell = new THREE.Mesh(cellGeo, mat);
      cell.position.set((col - 1.5) * 0.17, (1.5 - row) * 0.17, -0.08);
      matrixGroup.add(cell);
      cells.push(cell);
    }
  }

  // Central XOR prism representing P xor K
  const xorPrism = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.13, 0),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 1.15,
      roughness: 0.14,
      metalness: 0.55,
    })
  );
  xorPrism.position.set(0, 0, 0.22);
  matrixGroup.add(xorPrism);

  const arxRing = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.015, 12, 48), polishedGold);
  arxRing.rotation.x = Math.PI / 2;
  arxRing.position.y = -0.35;
  group.add(arxRing);

  return {
    exhibitId: 'otp-chacha20',
    update: (elapsed: number) => {
      xorPrism.rotation.y = elapsed * 1.1;
      xorPrism.rotation.x = elapsed * 0.6;
      arxRing.rotation.z = elapsed * 0.4;
      cells.forEach((cell, idx) => {
        const wave = 0.04 * Math.sin(elapsed * 2.6 + idx * 0.45);
        cell.position.z = -0.08 + wave;
      });
    },
  };
}

/**
 * Builds the 3D Shamir's Secret Sharing artifact:
 * a glowing degree-(k-1) polynomial curve over GF(p), a golden f(0) secret
 * core at the origin, and 5 orbiting/pulsing share nodes on vertical stems.
 */
function buildShamirArtifact(
  group: THREE.Group,
  materials?: ModernArtifactMaterials
): ModernExhibitAnimationHandle {
  const obsidian = materials?.obsidian ?? createDefaultObsidian();
  const polishedGold = materials?.polishedGold ?? createDefaultPolishedGold();

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.65, 0.09, 36), obsidian);
  base.position.y = -0.44;
  group.add(base);

  const container = new THREE.Group();
  container.position.y = 0.02;
  group.add(container);

  const polyPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = -0.4 + (i / 24) * 0.8;
    const y = 0.14 + 0.55 * t * t - 0.12 * t - 0.16;
    polyPoints.push(new THREE.Vector3(t, y, 0));
  }

  const curveMat = new THREE.MeshStandardMaterial({
    color: 0xa78bfa,
    emissive: 0x7c3aed,
    emissiveIntensity: 0.95,
    roughness: 0.18,
    metalness: 0.35,
  });
  const polyTube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(polyPoints), 28, 0.02, 10, false),
    curveMat
  );
  container.add(polyTube);

  const secretCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.1, 0),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 1.2,
      roughness: 0.14,
      metalness: 0.6,
    })
  );
  secretCore.position.set(0, -0.02, 0);
  container.add(secretCore);

  const shareNodes: THREE.Mesh[] = [];
  const stemGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.24, 8);
  const sharePositions = [-0.34, -0.17, 0.12, 0.26, 0.38];
  sharePositions.forEach((xPos, idx) => {
    const yPos = 0.14 + 0.55 * xPos * xPos - 0.12 * xPos - 0.16;
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xc4b5fd,
        emissive: 0x8b5cf6,
        emissiveIntensity: 0.9,
        roughness: 0.18,
      })
    );
    node.position.set(xPos, yPos, 0);
    container.add(node);
    shareNodes.push(node);

    const stem = new THREE.Mesh(stemGeo, polishedGold);
    stem.position.set(xPos, yPos - 0.12, 0);
    container.add(stem);
    void idx;
  });

  const thresholdRing = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.014, 12, 48), polishedGold);
  thresholdRing.rotation.x = Math.PI / 2;
  thresholdRing.position.y = -0.35;
  group.add(thresholdRing);

  return {
    exhibitId: 'shamir-secret-sharing',
    update: (elapsed: number) => {
      container.rotation.y = elapsed * 0.35;
      secretCore.rotation.y = -elapsed * 1.1;
      thresholdRing.rotation.z = elapsed * 0.4;
      shareNodes.forEach((node, idx) => {
        const s = 1 + 0.15 * Math.sin(elapsed * 2.5 + idx * 1.1);
        node.scale.setScalar(s);
      });
    },
  };
}

/**
 * Dispatcher for the newly added Modern Cryptography exhibits (`ecc`, `otp-chacha20`, `shamir-secret-sharing`).
 * Returns null for any other exhibitId so callers can fall back cleanly.
 */
export function buildModernNewExhibit(
  exhibitId: string,
  group: THREE.Group,
  materials?: ModernArtifactMaterials
): ModernExhibitAnimationHandle | null {
  if (exhibitId === 'ecc') {
    return buildEccArtifact(group, materials);
  }
  if (exhibitId === 'otp-chacha20') {
    return buildOtpChachaArtifact(group, materials);
  }
  if (exhibitId === 'shamir-secret-sharing') {
    return buildShamirArtifact(group, materials);
  }
  return null;
}

export function updateModernNewExhibit(
  handle: ModernExhibitAnimationHandle | null | undefined,
  elapsed: number
): void {
  handle?.update(elapsed);
}
