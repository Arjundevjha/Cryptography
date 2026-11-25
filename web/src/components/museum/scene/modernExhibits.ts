import * as THREE from 'three';
import type { ArtifactMaterialSet } from './artifactMaterials';
import type { ExhibitArtifactBuilder } from './classicalExhibits';
import { buildModernNewExhibit } from './modernNewExhibits';

function buildRsaArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { antiqueBrass, polishedGold, agedBronze, obsidian, brushedSteel } = m;

  // Dual-Key Trapdoor Celestial Armillary (Gimballed brass astrolabe, Public & Private keys, prime dodecahedron core)
  const baseFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.1, 36), obsidian);
  baseFoot.position.y = -0.58;
  group.add(baseFoot);

  const baseCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.22, 24), polishedGold);
  baseCollar.position.y = -0.44;
  group.add(baseCollar);

  // Outer meridian cradle arc
  const meridian = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.03, 16, 64), agedBronze);
  meridian.position.y = 0.12;
  group.add(meridian);

  // Three tilted concentric gimbal astrolabe rings
  const outerGimbal = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.026, 16, 64), polishedGold);
  outerGimbal.position.y = 0.12;
  outerGimbal.rotation.set(0.45, 0.6, 0);
  group.add(outerGimbal);

  const midGimbal = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.022, 16, 56), antiqueBrass);
  midGimbal.position.y = 0.12;
  midGimbal.rotation.set(-0.55, -0.4, 0.35);
  group.add(midGimbal);

  const innerGimbal = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.018, 16, 48), brushedSteel);
  innerGimbal.position.y = 0.12;
  innerGimbal.rotation.set(Math.PI / 2 - 0.3, 0.2, 0.5);
  group.add(innerGimbal);

  // Glowing Prime Factorization Dodecahedron Core (N = p * q)
  const primeCore = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.165, 0),
    new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xd97706,
      emissiveIntensity: 1.35,
      metalness: 0.4,
      roughness: 0.15,
    })
  );
  primeCore.position.y = 0.12;
  group.add(primeCore);

  const coreCage = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.23, 0),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.1, wireframe: true })
  );
  coreCage.position.y = 0.12;
  group.add(coreCage);

  // Interlocking Asymmetric Twin Keys: Burnished Gold Public Key (e, N) & Obsidian Private Key (d, p, q)
  const buildKey = (mat: THREE.Material, accentMat: THREE.Material, isPublic: boolean) => {
    const kGroup = new THREE.Group();
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.022, 14, 28), mat);
    bow.position.y = 0.24;
    kGroup.add(bow);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.36, 16), mat);
    kGroup.add(shaft);

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.03, 16), accentMat);
    collar.position.y = 0.11;
    kGroup.add(collar);

    // Distinct asymmetric key bit teeth
    const bitTop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.032, 0.018), accentMat);
    bitTop.position.set(isPublic ? 0.045 : -0.045, -0.11, 0);
    kGroup.add(bitTop);

    const bitBot = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.04, 0.018), mat);
    bitBot.position.set(isPublic ? 0.05 : -0.05, -0.16, 0);
    kGroup.add(bitBot);
    return kGroup;
  };

  const pubKey = buildKey(polishedGold, antiqueBrass, true);
  pubKey.position.set(-0.26, 0.18, 0.08);
  pubKey.rotation.z = -0.65;
  group.add(pubKey);

  const privAccent = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0x7e22ce,
    emissiveIntensity: 0.75,
    metalness: 0.6,
    roughness: 0.2,
  });
  const privKey = buildKey(obsidian, privAccent, false);
  privKey.position.set(0.26, 0.06, -0.08);
  privKey.rotation.z = 0.65;
  group.add(privKey);
}

function buildAesArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { antiqueBrass, polishedGold, obsidian, brushedSteel } = m;

  // The 4x4 Rijndael State Lattice Engine (16 sapphire/quartz byte blocks, GF(2^8) gold bus traces, ShiftRows/MixColumns rings, S-Box core)
  const chassisBase = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.07, 0.98), obsidian);
  chassisBase.position.y = -0.46;
  chassisBase.castShadow = true;
  group.add(chassisBase);

  const baseRim = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.03, 1.02), polishedGold);
  baseRim.position.y = -0.48;
  group.add(baseRim);

  // 4 vertical brass corner stanchions supporting the suspended state lattice
  [
    [-0.42, -0.42],
    [0.42, -0.42],
    [-0.42, 0.42],
    [0.42, 0.42],
  ].forEach(([cx, cz]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.64, 12), antiqueBrass);
    post.position.set(cx, -0.14, cz);
    group.add(post);
  });

  // Tilted lattice assembly for 3D visual legibility from all angles
  const latticeGroup = new THREE.Group();
  latticeGroup.position.y = 0.14;
  latticeGroup.rotation.set(0.48, 0.35, 0);
  group.add(latticeGroup);

  const quartzByteMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.72,
    roughness: 0.1,
    metalness: 0.2,
  });
  const goldTraceMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xb45309,
    emissiveIntensity: 0.65,
    metalness: 0.9,
    roughness: 0.15,
  });
  const cyanCoreMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0284c7,
    emissiveIntensity: 0.85,
  });

  // Row and Column Galois Field data bus traces
  for (let i = 0; i < 4; i++) {
    const coord = -0.3 + i * 0.2;
    const rowBus = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.68, 8), goldTraceMat);
    rowBus.rotation.z = Math.PI / 2;
    rowBus.position.set(0, coord, 0);
    latticeGroup.add(rowBus);

    const colBus = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.68, 8), brushedSteel);
    colBus.position.set(coord, 0, 0);
    latticeGroup.add(colBus);
  }

  // 16 suspended byte blocks s_{r,c} with inner active nibble cores
  const byteGeo = new THREE.BoxGeometry(0.13, 0.13, 0.13);
  const coreGeo = new THREE.BoxGeometry(0.055, 0.055, 0.055);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const bx = -0.3 + c * 0.2;
      const by = 0.3 - r * 0.2;
      const bz = ((r + c) % 2 === 0 ? 1 : -1) * 0.025;

      const byteCube = new THREE.Mesh(byteGeo, quartzByteMat);
      byteCube.position.set(bx, by, bz);
      latticeGroup.add(byteCube);

      // Highlight diagonal ShiftRows trajectory in radiant gold
      const isShiftedDiag = c === r;
      const nibbleCore = new THREE.Mesh(coreGeo, isShiftedDiag ? goldTraceMat : cyanCoreMat);
      nibbleCore.position.set(bx, by, bz);
      latticeGroup.add(nibbleCore);
    }
  }

  // Central illuminated S-Box non-linear substitution prism
  const sBoxPrism = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), goldTraceMat);
  sBoxPrism.position.set(0, 0, 0);
  latticeGroup.add(sBoxPrism);

  // Concentric ShiftRows & MixColumns transformation orbital rings
  const shiftRowsRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.02, 16, 64), polishedGold);
  shiftRowsRing.position.y = 0.14;
  shiftRowsRing.rotation.x = Math.PI / 2 - 0.32;
  group.add(shiftRowsRing);

  const mixColsRing = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.016, 16, 64), brushedSteel);
  mixColsRing.position.y = 0.14;
  mixColsRing.rotation.y = 0.55;
  mixColsRing.rotation.x = 0.28;
  group.add(mixColsRing);
}

function buildSha256Artifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { antiqueBrass, polishedGold, agedBronze, obsidian, brushedSteel } = m;

  // 8-Register Merkle-Damgård Compression Core (Octagonal canisters A..H, 64-round bronze gear, Davies-Meyer funnel & feedforward pipes)
  const manifoldBase = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.68, 0.09, 8), obsidian);
  manifoldBase.position.y = -0.44;
  manifoldBase.castShadow = true;
  group.add(manifoldBase);

  const manifoldCrown = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.022, 12, 8), polishedGold);
  manifoldCrown.rotation.x = Math.PI / 2;
  manifoldCrown.position.y = 0.24;
  group.add(manifoldCrown);

  // Central 64-tooth bronze round-constant gear (K_0 .. K_63)
  const roundGear = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 32), antiqueBrass);
  roundGear.position.y = -0.08;
  group.add(roundGear);

  const toothGeo = new THREE.BoxGeometry(0.025, 0.085, 0.045);
  for (let t = 0; t < 32; t++) {
    const ang = (t / 32) * Math.PI * 2;
    const tooth = new THREE.Mesh(toothGeo, polishedGold);
    tooth.position.set(Math.cos(ang) * 0.295, -0.08, Math.sin(ang) * 0.295);
    tooth.rotation.y = -ang;
    group.add(tooth);
  }

  // Radiant 256-bit digest core & overhead Davies-Meyer conical compression intake funnel
  const digestCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.16, 1),
    new THREE.MeshStandardMaterial({
      color: 0xe9d5ff,
      emissive: 0x9333ea,
      emissiveIntensity: 1.5,
      roughness: 0.15,
    })
  );
  digestCore.position.y = 0.08;
  group.add(digestCore);

  const intakeFunnel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.11, 0.28, 32, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.92,
      roughness: 0.18,
      side: THREE.DoubleSide,
    })
  );
  intakeFunnel.position.y = 0.36;
  group.add(intakeFunnel);

  // 8 vertical 32-bit working register canisters (A, B, C, D, E, F, G, H) + radial feedforward pipes
  const quartzMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x7e22ce,
    emissiveIntensity: 0.95,
    roughness: 0.12,
  });

  for (let reg = 0; reg < 8; reg++) {
    const ang = (reg / 8) * Math.PI * 2;
    const rx = Math.cos(ang) * 0.5;
    const rz = Math.sin(ang) * 0.5;

    const botCap = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.08, 20), brushedSteel);
    botCap.position.set(rx, -0.36, rz);
    group.add(botCap);

    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.07, 20), brushedSteel);
    topCap.position.set(rx, 0.18, rz);
    group.add(topCap);

    // Outer glass sleeve & inner glowing 32-bit state column
    const fillH = 0.22 + ((reg * 3) % 5) * 0.05;
    const stateCol = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, fillH, 20), quartzMat);
    stateCol.position.set(rx, -0.32 + fillH / 2, rz);
    group.add(stateCol);

    // Radial Davies-Meyer feedforward conduit pipe from central core to register
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.38, 10), agedBronze);
    pipe.rotation.z = Math.PI / 2;
    pipe.rotation.y = -ang;
    pipe.position.set(Math.cos(ang) * 0.28, -0.22, Math.sin(ang) * 0.28);
    group.add(pipe);
  }
}

function buildHmacHashArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { antiqueBrass, polishedGold, obsidian, brushedSteel } = m;

  // Dual-Keyed HMAC Seal (ipad / opad interlocking rings + glowing Merkle digest prism)
  const sealBase = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.64, 0.09, 8), obsidian);
  sealBase.position.y = -0.44;
  group.add(sealBase);

  const ipadRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.036, 16, 48), polishedGold);
  ipadRing.position.y = 0.06;
  ipadRing.rotation.x = Math.PI / 3;
  ipadRing.rotation.y = 0.4;
  group.add(ipadRing);

  const opadRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.036, 16, 48), brushedSteel);
  opadRing.position.y = 0.06;
  opadRing.rotation.x = -Math.PI / 3;
  opadRing.rotation.y = -0.4;
  group.add(opadRing);

  const hmacCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.22, 0),
    new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 1.3,
      roughness: 0.15,
      metalness: 0.2,
    })
  );
  hmacCore.position.y = 0.06;
  group.add(hmacCore);

  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.48, 16), antiqueBrass);
    pin.position.set(Math.cos(ang) * 0.46, -0.16, Math.sin(ang) * 0.46);
    group.add(pin);
  }
}

function buildDiffieHellmanArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { antiqueBrass, polishedGold, agedBronze, obsidian } = m;

  // Diffie-Hellman Color-Mixing & Modular Exchange Vessels
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.09, 0.62), obsidian);
  plinth.position.y = -0.44;
  group.add(plinth);

  const aliceMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.85,
    roughness: 0.15,
  });
  const bobMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.85,
    roughness: 0.15,
  });
  const sharedMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 1.35,
    roughness: 0.12,
  });

  // Alice & Bob private vessels
  [
    { x: -0.42, mat: aliceMat },
    { x: 0.42, mat: bobMat },
  ].forEach(({ x, mat }) => {
    const capBot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.08, 24), antiqueBrass);
    capBot.position.set(x, -0.35, 0);
    group.add(capBot);

    const vessel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.42, 24), mat);
    vessel.position.set(x, -0.1, 0);
    group.add(vessel);

    const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 24), polishedGold);
    capTop.position.set(x, 0.14, 0);
    group.add(capTop);
  });

  // Shared secret central core + brass gimbal
  const sharedCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.19, 1), sharedMat);
  sharedCore.position.set(0, 0.18, 0);
  group.add(sharedCore);

  const gimbal = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.02, 14, 40), polishedGold);
  gimbal.position.set(0, 0.18, 0);
  gimbal.rotation.x = Math.PI / 3;
  group.add(gimbal);

  // Exchange bridge conduit bar
  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.84, 12), agedBronze);
  bridge.rotation.z = Math.PI / 2;
  bridge.position.set(0, -0.1, 0);
  group.add(bridge);
}

function buildRsaSignaturesArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { antiqueBrass, polishedGold, mahogany, obsidian, brushedSteel } = m;

  // RSA Digital Signature Signet Seal & Asymmetric Verification Ledger
  const sealPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.09, 8), obsidian);
  sealPlinth.position.y = -0.44;
  group.add(sealPlinth);

  // Tilted engraved signature ledger tablet
  const ledgerFrame = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.05, 0.56), polishedGold);
  ledgerFrame.position.set(0, -0.24, 0.06);
  ledgerFrame.rotation.x = 0.36;
  group.add(ledgerFrame);

  const ledgerSlate = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.48), obsidian);
  ledgerSlate.position.set(0, -0.235, 0.06);
  ledgerSlate.rotation.x = 0.36;
  group.add(ledgerSlate);

  // Wax/Emerald verified digital seal disc on the ledger
  const verifiedSealMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 1.15,
    roughness: 0.18,
    metalness: 0.25,
  });
  const sealDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.05, 24), verifiedSealMat);
  sealDisc.position.set(0.14, -0.17, 0.13);
  sealDisc.rotation.x = 0.36;
  group.add(sealDisc);

  // Floating heavy brass signet stamp hovering above ledger
  const stampGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.32, 20), mahogany);
  stampGrip.position.set(-0.12, 0.24, 0);
  group.add(stampGrip);

  const stampCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.08, 24), polishedGold);
  stampCollar.position.set(-0.12, 0.06, 0);
  group.add(stampCollar);

  // Twin asymmetric key pillars: Public Verifier (e) & Private Signer (d)
  const pubRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.022, 12, 32), brushedSteel);
  pubRing.position.set(0.36, 0.14, -0.12);
  group.add(pubRing);

  const privPrism = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), antiqueBrass);
  privPrism.position.set(-0.38, 0.14, -0.12);
  group.add(privPrism);
}

function buildZkpSchnorrArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { polishedGold, obsidian } = m;

  // Schnorr Zero-Knowledge Proof Dual-Chamber Veil (Prover Commit R -> Verifier Challenge c)
  const zkpBase = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.66, 0.09, 36), obsidian);
  zkpBase.position.y = -0.44;
  group.add(zkpBase);

  // Central translucent knowledge veil separating Prover & Verifier
  const veilMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.42,
    roughness: 0.12,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const veilPane = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.66, 0.72), veilMat);
  veilPane.position.set(0, -0.04, 0);
  group.add(veilPane);

  const veilFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.7, 0.76),
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
    })
  );
  veilFrame.position.set(0, -0.04, 0);
  group.add(veilFrame);

  // Prover hidden secret & commitment orb (left)
  const commitMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 1.15,
    roughness: 0.15,
  });
  const commitOrb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), commitMat);
  commitOrb.position.set(-0.34, -0.04, 0);
  group.add(commitOrb);

  // Verifier challenge icosahedron (right)
  const challengeMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x059669,
    emissiveIntensity: 1.1,
    roughness: 0.18,
  });
  const challengePoly = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), challengeMat);
  challengePoly.position.set(0.34, -0.04, 0);
  group.add(challengePoly);

  // Modular verification ring arching across the veil
  const proofArch = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.024, 14, 48, Math.PI), polishedGold);
  proofArch.position.set(0, 0.02, 0);
  group.add(proofArch);
}

function buildPostQuantumKemArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { obsidian } = m;

  // Post-Quantum ML-KEM / Learning-With-Errors 3D Lattice Cube & Encapsulated Core
  const lweBase = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.09, 0.96), obsidian);
  lweBase.position.y = -0.44;
  group.add(lweBase);

  const latticeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.85,
    roughness: 0.18,
    metalness: 0.3,
  });
  const noiseMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 0.95,
    roughness: 0.18,
    metalness: 0.3,
  });

  // 3x3x3 Lattice Grid of nodes with subtle LWE noise offsets
  const step = 0.28;
  for (let ix = -1; ix <= 1; ix++) {
    for (let iy = -1; iy <= 1; iy++) {
      for (let iz = -1; iz <= 1; iz++) {
        const isCenter = ix === 0 && iy === 0 && iz === 0;
        if (isCenter) continue;
        const isEdge = Math.abs(ix) + Math.abs(iy) + Math.abs(iz) === 3;
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(isEdge ? 0.042 : 0.032, 12, 12),
          isEdge ? latticeMat : noiseMat
        );
        const jitter = ((ix * 7 + iy * 13 + iz * 19) % 5) * 0.008;
        node.position.set(ix * step + jitter, 0.02 + iy * step, iz * step - jitter);
        group.add(node);
      }
    }
  }

  // Wireframe lattice cage
  const latticeCage = new THREE.Mesh(
    new THREE.BoxGeometry(step * 2, step * 2, step * 2),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.85, roughness: 0.2, wireframe: true })
  );
  latticeCage.position.y = 0.02;
  group.add(latticeCage);

  // Encapsulated golden shared-secret core at the center
  const kemCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.14, 0),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 1.25,
      roughness: 0.14,
      metalness: 0.5,
    })
  );
  kemCore.position.y = 0.02;
  group.add(kemCore);
}

export const MODERN_EXHIBIT_BUILDERS: Record<string, ExhibitArtifactBuilder> = {
  rsa: buildRsaArtifact,
  aes: buildAesArtifact,
  sha256: buildSha256Artifact,
  'hmac-hash': buildHmacHashArtifact,
  'diffie-hellman': buildDiffieHellmanArtifact,
  'rsa-signatures': buildRsaSignaturesArtifact,
  'zkp-schnorr': buildZkpSchnorrArtifact,
  'post-quantum-kem': buildPostQuantumKemArtifact,
  ecc: (group, m) => {
    buildModernNewExhibit('ecc', group, m);
  },
  'otp-chacha20': (group, m) => {
    buildModernNewExhibit('otp-chacha20', group, m);
  },
  'shamir-secret-sharing': (group, m) => {
    buildModernNewExhibit('shamir-secret-sharing', group, m);
  },
  'aes-gcm': (group, m) => {
    buildModernNewExhibit('aes-gcm', group, m);
  },
  'lamport-merkle': (group, m) => {
    buildModernNewExhibit('lamport-merkle', group, m);
  },
  hkdf: (group, m) => {
    buildModernNewExhibit('hkdf', group, m);
  },
};
