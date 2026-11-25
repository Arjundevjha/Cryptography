import * as THREE from 'three';
import type { ArtifactMaterialSet } from './artifactMaterials';
import type { ExhibitArtifactBuilder } from './classicalExhibits';

function buildEnigmaArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { antiqueBrass, polishedGold, darkOak, obsidian, brushedSteel, gunmetal, ivory } = m;

  // Wehrmacht Enigma M4 Naval Field Machine (Open oak case, 26 keys, 26-lamp board, 4 rotors, Steckerbrett cables)
  const mGroup = new THREE.Group();
  mGroup.position.set(0, -0.14, 0.05);
  group.add(mGroup);

  // Dovetailed dark oak transport box
  const caseBody = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.34, 0.96), darkOak);
  caseBody.castShadow = true;
  mGroup.add(caseBody);

  // Hinged open oak lid at rear
  const openLid = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.68, 0.07), darkOak);
  openLid.position.set(0, 0.44, -0.52);
  openLid.rotation.x = -0.22;
  openLid.castShadow = true;
  mGroup.add(openLid);

  // Brushed steel corner clasps
  [-0.55, 0.55].forEach((cx) => {
    const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.04), brushedSteel);
    clasp.position.set(cx, 0.08, 0.48);
    mGroup.add(clasp);
  });

  // Stepped matte crinkle-black steel chassis deck
  const lowerDeck = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.08, 0.32), obsidian);
  lowerDeck.position.set(0, 0.18, 0.28);
  mGroup.add(lowerDeck);

  const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.16, 0.56), obsidian);
  upperDeck.position.set(0, 0.22, -0.14);
  mGroup.add(upperDeck);

  // 26-key circular chrome-bezel typewriter keyboard (3 staggered QWERTZU rows: 9 + 8 + 9)
  const keyRows = [9, 8, 9];
  keyRows.forEach((count, rIdx) => {
    const kz = 0.17 + rIdx * 0.095;
    const startX = -((count - 1) * 0.098) / 2;
    for (let k = 0; k < count; k++) {
      const kx = startX + k * 0.098;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.05, 8), brushedSteel);
      stem.position.set(kx, 0.24, kz);
      mGroup.add(stem);

      const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.018, 16), brushedSteel);
      bezel.position.set(kx, 0.268, kz);
      mGroup.add(bezel);

      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.02, 16), obsidian);
      cap.position.set(kx, 0.272, kz);
      mGroup.add(cap);
    }
  });

  // 26-lamp amber dome lightboard (with active cipher lamp illuminated!)
  const activeLampMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 2.2,
    roughness: 0.15,
  });
  const dimLampMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.3 });

  keyRows.forEach((count, rIdx) => {
    const lz = -0.09 + rIdx * 0.078;
    const startX = -((count - 1) * 0.096) / 2;
    for (let l = 0; l < count; l++) {
      const isLit = rIdx === 1 && l === 5;
      const lamp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.029, 0.029, 0.012, 16),
        isLit ? activeLampMat : dimLampMat
      );
      lamp.position.set(startX + l * 0.096, 0.304, lz);
      mGroup.add(lamp);
    }
  });

  // M4 4-Rotor Walzenlage assembly (Beta thin rotor + 3 Wehrmacht rotors) + UKW reflector housing
  const ukwBlock = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.09, 24), gunmetal);
  ukwBlock.rotation.z = Math.PI / 2;
  ukwBlock.position.set(-0.36, 0.34, -0.3);
  mGroup.add(ukwBlock);

  for (let r = 0; r < 4; r++) {
    const rx = -0.22 + r * 0.135;
    const rotorCore = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.065, 32), gunmetal);
    rotorCore.rotation.z = Math.PI / 2;
    rotorCore.position.set(rx, 0.35, -0.3);
    mGroup.add(rotorCore);

    // Cream alphabet tyre band
    const alphaBand = new THREE.Mesh(new THREE.CylinderGeometry(0.149, 0.149, 0.032, 32), ivory);
    alphaBand.rotation.z = Math.PI / 2;
    alphaBand.position.set(rx - 0.008, 0.35, -0.3);
    mGroup.add(alphaBand);

    // Serrated brass thumbwheel flange
    const thumbRing = new THREE.Mesh(new THREE.CylinderGeometry(0.172, 0.172, 0.018, 28), polishedGold);
    thumbRing.rotation.z = Math.PI / 2;
    thumbRing.position.set(rx + 0.028, 0.35, -0.3);
    mGroup.add(thumbRing);
  }

  // Front Steckerbrett (plugboard) with brass socket jacks & curved braided patch cables
  const steckerPlate = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.22, 0.03), obsidian);
  steckerPlate.position.set(0, -0.02, 0.48);
  mGroup.add(steckerPlate);

  for (let j = 0; j < 13; j++) {
    const jx = -0.42 + j * 0.07;
    const sockTop = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 10), antiqueBrass);
    sockTop.rotation.x = Math.PI / 2;
    sockTop.position.set(jx, 0.03, 0.495);
    mGroup.add(sockTop);

    const sockBot = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 10), antiqueBrass);
    sockBot.rotation.x = Math.PI / 2;
    sockBot.position.set(jx, -0.04, 0.495);
    mGroup.add(sockBot);
  }

  const cableMat = new THREE.MeshStandardMaterial({ color: 0x4a1d1f, roughness: 0.75 });
  const cablePairs: [number, number, number][] = [
    [-0.38, -0.08, -0.14],
    [-0.24, 0.18, -0.19],
    [-0.02, 0.36, -0.15],
    [0.08, 0.42, -0.12],
  ];
  cablePairs.forEach(([x1, x2, sagY]) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x1, 0.03, 0.5),
      new THREE.Vector3(x1, 0.01, 0.57),
      new THREE.Vector3((x1 + x2) / 2, sagY, 0.61),
      new THREE.Vector3(x2, -0.03, 0.57),
      new THREE.Vector3(x2, -0.04, 0.5),
    ]);
    const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.013, 8, false), cableMat);
    mGroup.add(cable);
  });
}

function buildLorenzArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { antiqueBrass, polishedGold, agedBronze, obsidian, brushedSteel, gunmetal, ivory } = m;

  // Lorenz Schlüssel-Zusatz SZ42 Teleprinter Cipher Attachment (12 pinwheels in 3 banks: 5 Chi, 2 Mu, 5 Psi)
  const lGroup = new THREE.Group();
  lGroup.position.y = -0.1;
  group.add(lGroup);

  // Industrial cast-iron & olive-gunmetal slotted bedplate chassis
  const bedplate = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.22, 0.88), gunmetal);
  bedplate.position.y = -0.22;
  bedplate.castShadow = true;
  lGroup.add(bedplate);

  // Tubular chrome rack-mount handles at left and right ends
  [-0.71, 0.71].forEach((hx) => {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.018, 12, 24, Math.PI), brushedSteel);
    handle.rotation.y = hx > 0 ? 0 : Math.PI;
    handle.position.set(hx > 0 ? 0.67 : -0.67, -0.22, 0);
    lGroup.add(handle);
  });

  // Front Bakelite control switches & Baudot synchronizer dials
  [-0.42, -0.14, 0.14, 0.42].forEach((dx) => {
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.04, 20), obsidian);
    dial.rotation.x = Math.PI / 2;
    dial.position.set(dx, -0.22, 0.45);
    lGroup.add(dial);

    const pointer = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.07, 0.02), ivory);
    pointer.position.set(dx, -0.22, 0.47);
    lGroup.add(pointer);
  });

  // Twin cast-iron end stanchions + central stainless drive shaft
  [-0.58, 0.58].forEach((sx) => {
    const upright = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.54, 0.46), gunmetal);
    upright.position.set(sx, 0.14, -0.04);
    lGroup.add(upright);
  });

  const driveShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.24, 24), brushedSteel);
  driveShaft.rotation.z = Math.PI / 2;
  driveShaft.position.set(0, 0.22, -0.04);
  lGroup.add(driveShaft);

  // Overhead sensing pawl rail
  const pawlBar = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.03, 0.05), brushedSteel);
  pawlBar.position.set(0, 0.54, -0.04);
  lGroup.add(pawlBar);

  // All 12 historical Lorenz pinwheels across 3 distinct banks: 5 Chi (left), 2 Motor Mu (center), 5 Psi (right)
  const wheelSpecs: { x: number; r: number; mat: THREE.Material }[] = [
    // 5 Chi wheels
    { x: -0.49, r: 0.24, mat: antiqueBrass },
    { x: -0.4, r: 0.24, mat: antiqueBrass },
    { x: -0.31, r: 0.24, mat: antiqueBrass },
    { x: -0.22, r: 0.24, mat: antiqueBrass },
    { x: -0.13, r: 0.24, mat: antiqueBrass },
    // 2 Mu motor control wheels
    { x: -0.02, r: 0.205, mat: brushedSteel },
    { x: 0.07, r: 0.205, mat: brushedSteel },
    // 5 Psi wheels
    { x: 0.18, r: 0.26, mat: polishedGold },
    { x: 0.27, r: 0.26, mat: polishedGold },
    { x: 0.36, r: 0.26, mat: polishedGold },
    { x: 0.45, r: 0.26, mat: polishedGold },
    { x: 0.54, r: 0.26, mat: polishedGold },
  ];

  const pinGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.038, 6);
  wheelSpecs.forEach((ws, idx) => {
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(ws.r, ws.r, 0.046, 36), ws.mat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(ws.x, 0.22, -0.04);
    rim.castShadow = true;
    lGroup.add(rim);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(ws.r * 0.62, ws.r * 0.62, 0.052, 24), obsidian);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(ws.x, 0.22, -0.04);
    lGroup.add(hub);

    // Radial cam pins around wheel circumference
    for (let p = 0; p < 14; p++) {
      const ang = (p / 14) * Math.PI * 2 + idx * 0.19;
      const pin = new THREE.Mesh(pinGeo, brushedSteel);
      const toggleShift = (p + idx) % 3 === 0 ? 0.018 : -0.012;
      pin.rotation.z = Math.PI / 2;
      pin.position.set(
        ws.x + toggleShift,
        0.22 + Math.sin(ang) * (ws.r - 0.015),
        -0.04 + Math.cos(ang) * (ws.r - 0.015)
      );
      lGroup.add(pin);
    }

    // Overhead sensing lever pawl
    const pawl = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.08, 0.12), agedBronze);
    pawl.position.set(ws.x, 0.5, 0.01);
    pawl.rotation.x = 0.25;
    lGroup.add(pawl);
  });
}

export const HISTORICAL_EXHIBIT_BUILDERS: Record<string, ExhibitArtifactBuilder> = {
  enigma: buildEnigmaArtifact,
  lorenz: buildLorenzArtifact,
  adfgvx: (group, materials) => {
    const { obsidian, antiqueBrass, brushedSteel, agedBronze } = materials;
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.68), agedBronze);
    base.position.y = -0.44;
    group.add(base);

    const gridBoard = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.56, 0.06), obsidian);
    gridBoard.position.set(0, 0.14, -0.14);
    gridBoard.rotation.x = -0.18;
    group.add(gridBoard);

    const cellGeo = new THREE.BoxGeometry(0.07, 0.06, 0.03);
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const cell = new THREE.Mesh(cellGeo, (r + c) % 2 === 0 ? antiqueBrass : brushedSteel);
        cell.position.set((c - 2.5) * 0.095, 0.14 + (2.5 - r) * 0.075, -0.1);
        group.add(cell);
      }
    }

    const telegraphBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.05, 24), antiqueBrass);
    telegraphBase.position.set(0, -0.36, 0.22);
    group.add(telegraphBase);
  },
  'jefferson-disk': (group, materials) => {
    const { obsidian, polishedGold, agedBronze, antiqueBrass } = materials;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.08, 32), obsidian);
    base.position.y = -0.44;
    group.add(base);

    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.92, 16), polishedGold);
    spindle.position.y = 0.04;
    group.add(spindle);

    const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.055, 26);
    for (let i = 0; i < 10; i++) {
      const wheel = new THREE.Mesh(wheelGeo, i % 2 === 0 ? agedBronze : antiqueBrass);
      wheel.position.y = -0.3 + i * 0.07;
      wheel.rotation.y = i * 0.35;
      group.add(wheel);
    }
  },
};
