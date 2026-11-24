import * as THREE from 'three';

export type WingCategory = 'Classical' | 'Historical' | 'Modern';
export type SconceStyle = 'torch' | 'cage' | 'linear';

export interface RoomAccentPalette {
  accentHex: number;
  accentColor: string;
  velvetColor: number;
  runnerColor: number;
  sconceStyle: SconceStyle;
}

export interface RoomArchitectureMaterials {
  goldMat: THREE.Material;
  trimMat: THREE.Material;
  wainscotMat: THREE.Material;
  travertineTrimMat: THREE.Material;
  crystalMat: THREE.Material;
}

export interface DecorateExhibitRoomParams {
  exhibitId: string;
  title: string;
  subtitle: string;
  timeline: string;
  category: WingCategory;
  exIdx: number;
  sidePanelTex: THREE.Texture;
  materials: RoomArchitectureMaterials;
}

export interface DecorateFoyerWallsParams {
  materials: RoomArchitectureMaterials;
  murals: {
    leftTex: THREE.Texture;
    rightTex: THREE.Texture;
    classicalTex: THREE.Texture;
    historicalTex: THREE.Texture;
    modernTex: THREE.Texture;
  };
}

const CATEGORY_SCONCE_STYLE: Record<WingCategory, SconceStyle> = {
  Classical: 'torch',
  Historical: 'cage',
  Modern: 'linear',
};

const EXHIBIT_PALETTES: Record<string, Omit<RoomAccentPalette, 'sconceStyle'>> = {
  // Classical Wing (7 exhibits)
  caesar: {
    accentHex: 0xc2410c,
    accentColor: '#c2410c',
    velvetColor: 0x7f1d1d,
    runnerColor: 0x6b211f,
  },
  affine: {
    accentHex: 0x0369a1,
    accentColor: '#0369a1',
    velvetColor: 0x1e3a5f,
    runnerColor: 0x1d3557,
  },
  vigenere: {
    accentHex: 0xb45309,
    accentColor: '#b45309',
    velvetColor: 0x6b2f10,
    runnerColor: 0x5c3317,
  },
  playfair: {
    accentHex: 0x0f766e,
    accentColor: '#0f766e',
    velvetColor: 0x134e4a,
    runnerColor: 0x164a41,
  },
  polybius: {
    accentHex: 0xa16207,
    accentColor: '#a16207',
    velvetColor: 0x5b3a12,
    runnerColor: 0x573b1a,
  },
  scytale: {
    accentHex: 0x4338ca,
    accentColor: '#4338ca',
    velvetColor: 0x2e2559,
    runnerColor: 0x2b244d,
  },
  substitution: {
    accentHex: 0x9f1239,
    accentColor: '#9f1239',
    velvetColor: 0x5f1830,
    runnerColor: 0x541b2e,
  },

  // Historical Wing (2 exhibits)
  enigma: {
    accentHex: 0xd97706,
    accentColor: '#d97706',
    velvetColor: 0x452a12,
    runnerColor: 0x3b2a1a,
  },
  lorenz: {
    accentHex: 0x4d7c0f,
    accentColor: '#4d7c0f',
    velvetColor: 0x2b3f16,
    runnerColor: 0x283618,
  },

  // Modern Wing (8 exhibits)
  rsa: {
    accentHex: 0x7e22ce,
    accentColor: '#7e22ce',
    velvetColor: 0x3b175c,
    runnerColor: 0x32184a,
  },
  aes: {
    accentHex: 0x0284c7,
    accentColor: '#0284c7',
    velvetColor: 0x0c3c5c,
    runnerColor: 0x10354f,
  },
  sha256: {
    accentHex: 0x059669,
    accentColor: '#059669',
    velvetColor: 0x0d4434,
    runnerColor: 0x113d30,
  },
  'hmac-hash': {
    accentHex: 0x2563eb,
    accentColor: '#2563eb',
    velvetColor: 0x172d5e,
    runnerColor: 0x1a2c54,
  },
  'diffie-hellman': {
    accentHex: 0x9333ea,
    accentColor: '#9333ea',
    velvetColor: 0x481a6b,
    runnerColor: 0x3d1959,
  },
  'rsa-signatures': {
    accentHex: 0xbe185d,
    accentColor: '#be185d',
    velvetColor: 0x591435,
    runnerColor: 0x4d1530,
  },
  'zkp-schnorr': {
    accentHex: 0x0d9488,
    accentColor: '#0d9488',
    velvetColor: 0x114542,
    runnerColor: 0x133d3a,
  },
  'post-quantum-kem': {
    accentHex: 0x6366f1,
    accentColor: '#6366f1',
    velvetColor: 0x242861,
    runnerColor: 0x212454,
  },
  ecc: {
    accentHex: 0x0ea5e9,
    accentColor: '#0ea5e9',
    velvetColor: 0x0c3d59,
    runnerColor: 0x10354a,
  },
  'otp-chacha20': {
    accentHex: 0x14b8a6,
    accentColor: '#14b8a6',
    velvetColor: 0x0f4743,
    runnerColor: 0x113d39,
  },
  'shamir-secret-sharing': {
    accentHex: 0x8b5cf6,
    accentColor: '#8b5cf6',
    velvetColor: 0x311d6e,
    runnerColor: 0x2a1b5c,
  },
};

function toHexString(hex: number): string {
  return `#${hex.toString(16).padStart(6, '0')}`;
}

/**
 * Returns a distinct per-exhibit accent, velvet, runner, and sconce palette
 * so every room within the same wing has a recognizable visual identity.
 */
export function getRoomAccentPalette(
  exhibitId: string,
  category: WingCategory,
  exIdx: number
): RoomAccentPalette {
  const sconceStyle = CATEGORY_SCONCE_STYLE[category];
  const preset = EXHIBIT_PALETTES[exhibitId];
  if (preset) {
    return {
      ...preset,
      sconceStyle,
    };
  }

  // Deterministic fallback for any custom/future exhibit ID
  const hueOffset = ((exIdx * 47 + exhibitId.length * 19) % 360) / 360;
  const accentColorObj = new THREE.Color().setHSL(hueOffset, 0.68, 0.45);
  const velvetColorObj = new THREE.Color().setHSL(hueOffset, 0.55, 0.2);
  const runnerColorObj = new THREE.Color().setHSL(hueOffset, 0.48, 0.17);
  const accentHex = accentColorObj.getHex();

  return {
    accentHex,
    accentColor: toHexString(accentHex),
    velvetColor: velvetColorObj.getHex(),
    runnerColor: runnerColorObj.getHex(),
    sconceStyle,
  };
}

function buildFramedPanel(
  width: number,
  height: number,
  tex: THREE.Texture,
  materials: RoomArchitectureMaterials,
  accentHex?: number
): THREE.Group {
  const panelGroup = new THREE.Group();

  // Outer walnut backing
  const outerBack = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.52, height + 0.52, 0.08),
    materials.wainscotMat
  );
  panelGroup.add(outerBack);

  // Brass/gold inner frame
  const brassFrame = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.3, height + 0.3, 0.1),
    materials.goldMat
  );
  panelGroup.add(brassFrame);

  // Subtle accent matte border
  const matteColor = accentHex ?? 0x26201a;
  const matteMat = new THREE.MeshStandardMaterial({
    color: matteColor,
    roughness: 0.45,
    metalness: 0.25,
  });
  const matteBoard = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.14, height + 0.14, 0.11),
    matteMat
  );
  panelGroup.add(matteBoard);

  // Texture face
  const faceMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.38,
      metalness: 0.06,
    })
  );
  faceMesh.position.z = 0.065;
  panelGroup.add(faceMesh);

  // Over-picture brass museum lamp
  const lampArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.06, 0.28),
    materials.trimMat
  );
  lampArm.position.set(0, height / 2 + 0.32, 0.14);
  panelGroup.add(lampArm);

  const lampHood = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.075, Math.min(1.6, width * 0.42), 12),
    materials.goldMat
  );
  lampHood.rotation.z = Math.PI / 2;
  lampHood.position.set(0, height / 2 + 0.3, 0.28);
  panelGroup.add(lampHood);

  const lampGlow = new THREE.Mesh(
    new THREE.BoxGeometry(Math.min(1.4, width * 0.36), 0.03, 0.04),
    materials.crystalMat
  );
  lampGlow.position.set(0, height / 2 + 0.25, 0.28);
  panelGroup.add(lampGlow);

  return panelGroup;
}

function buildCategorySconce(
  style: SconceStyle,
  accentHex: number,
  materials: RoomArchitectureMaterials
): THREE.Group {
  const sconce = new THREE.Group();
  sconce.userData = { sconceStyle: style };

  const accentGlowMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    emissive: accentHex,
    emissiveIntensity: 0.55,
    roughness: 0.25,
    metalness: 0.3,
  });

  if (style === 'torch') {
    // Classical torch-sconce
    const backplate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16),
      materials.trimMat
    );
    backplate.rotation.x = Math.PI / 2;
    sconce.add(backplate);

    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.24),
      materials.goldMat
    );
    arm.position.set(0, -0.08, 0.12);
    sconce.add(arm);

    const torchStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.045, 0.58, 12),
      materials.goldMat
    );
    torchStem.position.set(0, 0.12, 0.24);
    sconce.add(torchStem);

    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.1, 0.12, 14),
      materials.trimMat
    );
    cup.position.set(0, 0.42, 0.24);
    sconce.add(cup);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.32, 12),
      materials.crystalMat
    );
    flame.position.set(0, 0.62, 0.24);
    sconce.add(flame);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.018, 8, 20),
      accentGlowMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.48, 0.24);
    sconce.add(ring);
  } else if (style === 'cage') {
    // Historical brass cage-lamp
    const backplate = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.48, 0.06),
      materials.trimMat
    );
    sconce.add(backplate);

    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.09, 0.26),
      materials.goldMat
    );
    arm.position.set(0, 0.1, 0.14);
    sconce.add(arm);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 14, 10),
      materials.crystalMat
    );
    bulb.position.set(0, -0.05, 0.26);
    sconce.add(bulb);

    // Protective brass cage rings & vertical ribs
    [-0.18, 0.08].forEach((ry) => {
      const cageRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.16, 0.016, 8, 20),
        materials.goldMat
      );
      cageRing.rotation.x = Math.PI / 2;
      cageRing.position.set(0, ry, 0.26);
      sconce.add(cageRing);
    });

    [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((ang) => {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.32, 6),
        materials.trimMat
      );
      bar.position.set(Math.cos(ang) * 0.16, -0.05, 0.26 + Math.sin(ang) * 0.16);
      sconce.add(bar);
    });

    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.09, 0.06, 12),
      accentGlowMat
    );
    collar.position.set(0, 0.12, 0.26);
    sconce.add(collar);
  } else {
    // Modern sleek linear LED bar
    const backplate = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.96, 0.05),
      materials.travertineTrimMat
    );
    sconce.add(backplate);

    const spine = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.9, 0.12),
      materials.trimMat
    );
    spine.position.z = 0.06;
    sconce.add(spine);

    const ledBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.82, 0.06),
      materials.crystalMat
    );
    ledBar.position.z = 0.14;
    sconce.add(ledBar);

    const accentStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.78, 0.03),
      accentGlowMat
    );
    accentStrip.position.z = 0.175;
    sconce.add(accentStrip);
  }

  return sconce;
}

function buildFloorRunner(
  palette: RoomAccentPalette,
  materials: RoomArchitectureMaterials
): THREE.Group {
  const runnerGroup = new THREE.Group();
  runnerGroup.name = 'exhibit-floor-runner';

  const runnerMat = new THREE.MeshStandardMaterial({
    color: palette.runnerColor,
    roughness: 0.88,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });

  const accentInlayMat = new THREE.MeshStandardMaterial({
    color: palette.accentHex,
    roughness: 0.55,
    metalness: 0.25,
    side: THREE.DoubleSide,
  });

  // Four strips framing the central plinth (r <= 1.45) and keeping doorway (z = 6) clear
  const sideStripGeo = new THREE.PlaneGeometry(0.75, 7.2);
  [-2.45, 2.45].forEach((rx) => {
    const strip = new THREE.Mesh(sideStripGeo, runnerMat);
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(rx, 0.014, 0);
    runnerGroup.add(strip);

    const brassEdge = new THREE.Mesh(
      new THREE.PlaneGeometry(0.06, 7.2),
      materials.goldMat
    );
    brassEdge.rotation.x = -Math.PI / 2;
    brassEdge.position.set(rx > 0 ? rx + 0.39 : rx - 0.39, 0.0145, 0);
    runnerGroup.add(brassEdge);
  });

  const endStripGeo = new THREE.PlaneGeometry(4.15, 0.75);
  [-3.225, 3.225].forEach((rz) => {
    const strip = new THREE.Mesh(endStripGeo, runnerMat);
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(0, 0.014, rz);
    runnerGroup.add(strip);

    const brassEdge = new THREE.Mesh(
      new THREE.PlaneGeometry(5.68, 0.06),
      materials.goldMat
    );
    brassEdge.rotation.x = -Math.PI / 2;
    brassEdge.position.set(0, 0.0145, rz > 0 ? rz + 0.39 : rz - 0.39);
    runnerGroup.add(brassEdge);
  });

  // Corner geometric diamond medallions
  const medallionGeo = new THREE.PlaneGeometry(0.36, 0.36);
  [
    [-2.45, -3.225],
    [2.45, -3.225],
    [-2.45, 3.225],
    [2.45, 3.225],
  ].forEach(([mx, mz]) => {
    const medallion = new THREE.Mesh(medallionGeo, accentInlayMat);
    medallion.rotation.x = -Math.PI / 2;
    medallion.rotation.z = Math.PI / 4;
    medallion.position.set(mx, 0.015, mz);
    runnerGroup.add(medallion);
  });

  return runnerGroup;
}

function buildCornerAccents(
  category: WingCategory,
  exIdx: number,
  palette: RoomAccentPalette,
  materials: RoomArchitectureMaterials
): THREE.Group {
  const cornerGroup = new THREE.Group();
  cornerGroup.name = 'exhibit-corner-accents';

  const accentMat = new THREE.MeshStandardMaterial({
    color: palette.accentHex,
    roughness: 0.32,
    metalness: 0.55,
  });

  [-5.8, 5.8].forEach((cx) => {
    const post = new THREE.Group();
    post.position.set(cx, 0, -4.8);

    if (category === 'Classical') {
      // Fluted pedestal + varied classical finial
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 0.24, 0.54),
        materials.travertineTrimMat
      );
      plinth.position.y = 0.12;
      post.add(plinth);

      const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.19, 1.05, 16),
        materials.travertineTrimMat
      );
      column.position.y = 0.765;
      post.add(column);

      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.025, 10, 24),
        materials.goldMat
      );
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 1.3;
      post.add(collar);

      const finialVariant = exIdx % 3;
      const finialGeo =
        finialVariant === 0
          ? new THREE.SphereGeometry(0.16, 16, 12)
          : finialVariant === 1
            ? new THREE.OctahedronGeometry(0.18, 0)
            : new THREE.CylinderGeometry(0.17, 0.1, 0.28, 16);
      const finial = new THREE.Mesh(finialGeo, accentMat);
      finial.position.y = 1.48;
      post.add(finial);
    } else if (category === 'Historical') {
      // Brass stanchion post with accent collar
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.28, 0.1, 20),
        materials.trimMat
      );
      base.position.y = 0.05;
      post.add(base);

      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 1.05, 14),
        materials.goldMat
      );
      shaft.position.y = 0.62;
      post.add(shaft);

      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.075, 0.14, 14),
        accentMat
      );
      band.position.y = 1.02;
      post.add(band);

      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 14, 10),
        materials.goldMat
      );
      crown.position.y = 1.2;
      post.add(crown);
    } else {
      // Modern geometric monolith pillar
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 1.18, 0.46),
        materials.wainscotMat
      );
      plinth.position.y = 0.59;
      post.add(plinth);

      const trimCap = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.06, 0.5),
        materials.goldMat
      );
      trimCap.position.y = 1.21;
      post.add(trimCap);

      const prism = new THREE.Mesh(
        exIdx % 2 === 0
          ? new THREE.OctahedronGeometry(0.18, 0)
          : new THREE.BoxGeometry(0.24, 0.24, 0.24),
        accentMat
      );
      prism.position.y = 1.44;
      prism.rotation.y = (exIdx * Math.PI) / 6;
      post.add(prism);
    }

    cornerGroup.add(post);

    // Wall pilaster medallion on back wall near corner (x=±5.8, z=-5.76)
    const medallion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.06, 20),
      materials.goldMat
    );
    medallion.rotation.x = Math.PI / 2;
    medallion.position.set(cx, 6.2, -5.76);
    cornerGroup.add(medallion);

    const medallionCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16),
      accentMat
    );
    medallionCore.rotation.x = Math.PI / 2;
    medallionCore.position.set(cx, 6.2, -5.75);
    cornerGroup.add(medallionCore);
  });

  return cornerGroup;
}

/**
 * Adds rich non-colliding architectural details inside a 14x12x8.5 exhibit room:
 * - Right-wall framed curatorial panel at (6.72, 4.0, 0) facing -X
 * - Category-styled wall sconces flanking the back alcove at (±4.4, 4.4, -5.65)
 * - Inlaid geometric floor runner around the plinth at y=0.014
 * - Corner architectural stanchion/pilaster accents at (±5.8, *, -4.8)
 */
export function decorateExhibitRoom(
  roomGroup: THREE.Group,
  params: DecorateExhibitRoomParams
): void {
  const { exhibitId, category, exIdx, sidePanelTex, materials } = params;
  const palette = getRoomAccentPalette(exhibitId, category, exIdx);

  // 1. Right-wall framed curatorial panel
  const rightPanel = buildFramedPanel(4.2, 2.7, sidePanelTex, materials, palette.accentHex);
  rightPanel.name = `curatorial-panel-${exhibitId}`;
  rightPanel.position.set(6.72, 4.0, 0);
  rightPanel.rotation.y = -Math.PI / 2;
  roomGroup.add(rightPanel);

  // 2. Category-styled sconces flanking the back alcove
  [-4.4, 4.4].forEach((sx) => {
    const sconce = buildCategorySconce(palette.sconceStyle, palette.accentHex, materials);
    sconce.position.set(sx, 4.4, -5.65);
    roomGroup.add(sconce);
  });

  // 3. Unique inlaid geometric floor runner around the plinth
  roomGroup.add(buildFloorRunner(palette, materials));

  // 4. Corner architectural accents & pilaster medallions
  roomGroup.add(buildCornerAccents(category, exIdx, palette, materials));
}

function buildFoyerPilaster(
  x: number,
  y: number,
  z: number,
  rotY: number,
  materials: RoomArchitectureMaterials
): THREE.Group {
  const pilaster = new THREE.Group();
  pilaster.position.set(x, y, z);
  pilaster.rotation.y = rotY;

  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 1.4, 0.55),
    materials.wainscotMat
  );
  plinth.position.y = 0.7;
  pilaster.add(plinth);

  const shaft = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 9.6, 0.42),
    materials.travertineTrimMat
  );
  shaft.position.y = 6.2;
  pilaster.add(shaft);

  const capital = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.38, 0.58),
    materials.goldMat
  );
  capital.position.y = 11.15;
  pilaster.add(capital);

  return pilaster;
}

function buildFoyerWallBay(
  width: number,
  muralTex: THREE.Texture,
  materials: RoomArchitectureMaterials,
  accentHex: number
): THREE.Group {
  const bay = new THREE.Group();

  // Wainscoting base + brass rail
  const wainscot = new THREE.Mesh(
    new THREE.BoxGeometry(width, 1.4, 0.36),
    materials.wainscotMat
  );
  wainscot.position.y = 0.7;
  bay.add(wainscot);

  const brassRail = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.1, 0.08, 0.42),
    materials.trimMat
  );
  brassRail.position.y = 1.42;
  bay.add(brassRail);

  // Framed museum mural
  const mural = buildFramedPanel(width - 2.6, 4.4, muralTex, materials, accentHex);
  mural.position.set(0, 5.2, 0.12);
  bay.add(mural);

  // Flanking pilasters
  const halfSpan = width / 2 + 0.55;
  [-halfSpan, halfSpan].forEach((px) => {
    bay.add(buildFoyerPilaster(px, 0, 0, 0, materials));
  });

  // Flanking museum sconces
  [-width / 2 + 0.5, width / 2 - 0.5].forEach((sx) => {
    const sconce = buildCategorySconce('torch', accentHex, materials);
    sconce.position.set(sx, 5.2, 0.2);
    bay.add(sconce);
  });

  return bay;
}

/**
 * Populates bare perimeter & foyer gallery walls flush against their inner faces
 * (`z = 31.55`, `z = -103.55`, `x = ±84.55`) with framed museum murals,
 * decorative pilasters, wainscoting trim, and museum wall sconces without
 * obstructing the spawn camera (0, 2.5, 20) -> (0, 2.5, 10), wing portals,
 * or exhibit doorways.
 */
export function decorateFoyerWalls(
  scene: THREE.Scene,
  params: DecorateFoyerWallsParams
): void {
  const { materials, murals } = params;
  const foyerGroup = new THREE.Group();
  foyerGroup.name = 'foyer-wall-decorations';

  // 1. Rear Perimeter Wall (z=32, inner face 31.6 -> mount at z=31.55, facing -Z)
  // Avoids doorway (-6..6), Rejewski stele (-12.5), and existing sconces (±10, ±22)
  const rearLeftMural = buildFramedPanel(6.8, 4.2, murals.classicalTex, materials, 0x38bdf8);
  rearLeftMural.position.set(-28, 5.2, 31.55);
  rearLeftMural.rotation.y = Math.PI;
  foyerGroup.add(rearLeftMural);

  const rearRightMural = buildFramedPanel(6.8, 4.2, murals.modernTex, materials, 0xc084fc);
  rearRightMural.position.set(28, 5.2, 31.55);
  rearRightMural.rotation.y = Math.PI;
  foyerGroup.add(rearRightMural);

  const rearMidRightMural = buildFramedPanel(5.2, 3.6, murals.historicalTex, materials, 0xf59e0b);
  rearMidRightMural.position.set(16, 5.2, 31.55);
  rearMidRightMural.rotation.y = Math.PI;
  foyerGroup.add(rearMidRightMural);

  [-34, -19, 34].forEach((px) => {
    foyerGroup.add(buildFoyerPilaster(px, 0, 31.55, Math.PI, materials));
  });

  // 2. North Perimeter Wall (z=-104, inner face -103.6 -> mount at z=-103.55, facing +Z)
  // Flanks the central apse (-7..7)
  const northWestBay = buildFoyerWallBay(10.4, murals.classicalTex, materials, 0x38bdf8);
  northWestBay.position.set(-22, 0, -103.55);
  foyerGroup.add(northWestBay);

  const northEastBay = buildFoyerWallBay(10.4, murals.modernTex, materials, 0xc084fc);
  northEastBay.position.set(22, 0, -103.55);
  foyerGroup.add(northEastBay);

  // 3. West Exterior Wall (x=-85, inner face -84.6 -> mount at x=-84.55, facing +X)
  const westBays: Array<{ z: number; tex: THREE.Texture; accent: number }> = [
    { z: -18, tex: murals.leftTex, accent: 0x38bdf8 },
    { z: -50, tex: murals.classicalTex, accent: 0xd97706 },
  ];
  westBays.forEach(({ z, tex, accent }) => {
    const bay = buildFoyerWallBay(11.2, tex, materials, accent);
    bay.position.set(-84.55, 0, z);
    bay.rotation.y = Math.PI / 2;
    foyerGroup.add(bay);
  });

  // 4. East Exterior Wall (x=85, inner face 84.6 -> mount at x=84.55, facing -X)
  const eastBays: Array<{ z: number; tex: THREE.Texture; accent: number }> = [
    { z: -18, tex: murals.rightTex, accent: 0xc084fc },
    { z: -50, tex: murals.modernTex, accent: 0x7e22ce },
  ];
  eastBays.forEach(({ z, tex, accent }) => {
    const bay = buildFoyerWallBay(11.2, tex, materials, accent);
    bay.position.set(84.55, 0, z);
    bay.rotation.y = -Math.PI / 2;
    foyerGroup.add(bay);
  });

  scene.add(foyerGroup);
}
