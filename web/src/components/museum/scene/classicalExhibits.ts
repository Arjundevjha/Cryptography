import * as THREE from 'three';
import type { ArtifactMaterialSet } from './artifactMaterials';

export type ExhibitArtifactBuilder = (group: THREE.Group, materials: ArtifactMaterialSet) => void;

function buildCaesarArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { antiqueBrass, polishedGold, agedBronze, obsidian, ivory } = m;

  // Alberti Imperial Roman Cipher Disc (Dual concentric bronze/gold discs, 24 divisions, laurel boss & pointer)
  const cradleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 0.08, 32), obsidian);
  cradleBase.position.y = -0.46;
  group.add(cradleBase);

  const cradleStem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.38, 20), agedBronze);
  cradleStem.position.set(0, -0.26, -0.08);
  cradleStem.rotation.x = -0.35;
  group.add(cradleStem);

  const mount = new THREE.Group();
  mount.rotation.x = 0.62;
  mount.position.y = 0.02;
  group.add(mount);

  // Outer stationary Roman bronze disc with stepped bevel rim
  const outerDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.71, 0.06, 64), agedBronze);
  outerDisc.castShadow = true;
  mount.add(outerDisc);

  const outerRim = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.024, 16, 64), polishedGold);
  outerRim.rotation.x = Math.PI / 2;
  outerRim.position.y = 0.03;
  mount.add(outerRim);

  // 24 radial Latin majuscule sector dividers & letter studs
  const dividerGeo = new THREE.BoxGeometry(0.014, 0.025, 0.16);
  const studGeo = new THREE.BoxGeometry(0.045, 0.02, 0.055);
  for (let i = 0; i < 24; i++) {
    const ang = (i / 24) * Math.PI * 2;
    const div = new THREE.Mesh(dividerGeo, polishedGold);
    div.position.set(Math.cos(ang) * 0.57, 0.034, Math.sin(ang) * 0.57);
    div.rotation.y = -ang;
    mount.add(div);

    const nextAng = ((i + 0.5) / 24) * Math.PI * 2;
    const stud = new THREE.Mesh(studGeo, ivory);
    stud.position.set(Math.cos(nextAng) * 0.57, 0.032, Math.sin(nextAng) * 0.57);
    stud.rotation.y = -nextAng;
    mount.add(stud);
  }

  // Inner rotatable cipher disc
  const innerRecess = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.065, 64), obsidian);
  innerRecess.position.y = 0.015;
  mount.add(innerRecess);

  const innerDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.46, 0.075, 64), antiqueBrass);
  innerDisc.position.y = 0.028;
  innerDisc.castShadow = true;
  mount.add(innerDisc);

  const innerStudGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.02, 12);
  for (let i = 0; i < 24; i++) {
    const ang = (i / 24) * Math.PI * 2 + 0.13;
    const s = new THREE.Mesh(innerStudGeo, polishedGold);
    s.position.set(Math.cos(ang) * 0.36, 0.07, Math.sin(ang) * 0.36);
    mount.add(s);
  }

  // Central Imperial Roman laurel wreath boss
  const bossBase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.09, 32), polishedGold);
  bossBase.position.y = 0.065;
  mount.add(bossBase);

  const leafGeo = new THREE.BoxGeometry(0.028, 0.016, 0.065);
  for (let l = 0; l < 12; l++) {
    const ang = (l / 12) * Math.PI * 2;
    const leaf = new THREE.Mesh(leafGeo, polishedGold);
    leaf.position.set(Math.cos(ang) * 0.19, 0.072, Math.sin(ang) * 0.19);
    leaf.rotation.y = -ang + 0.45;
    mount.add(leaf);
  }

  const rubyPin = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.12, metalness: 0.3 })
  );
  rubyPin.position.y = 0.11;
  mount.add(rubyPin);

  // Tapered brass index pointer arm
  const pointer = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.022, 0.62), polishedGold);
  pointer.position.set(0, 0.088, -0.31);
  mount.add(pointer);
}

function buildAffineArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { antiqueBrass, polishedGold, agedBronze, mahogany, obsidian } = m;

  // St.-Cyr Modular Vernier Slide Ruler (ax + b mod 26 dual scales, magnifying glass cursor & coprime dial)
  const mount = new THREE.Group();
  mount.rotation.x = 0.54;
  group.add(mount);

  // Twin brass trestle feet beneath frame
  [-0.46, 0.46].forEach((fx) => {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.48), agedBronze);
    foot.position.set(fx, -0.14, 0);
    mount.add(foot);
  });

  // Mahogany & aged boxwood slide rule frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.08, 0.62), mahogany);
  frame.castShadow = true;
  mount.add(frame);

  const brassBorder = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.06, 0.64), antiqueBrass);
  brassBorder.position.y = -0.005;
  mount.add(brassBorder);

  const boxwoodMat = new THREE.MeshStandardMaterial({ color: 0xd9c396, roughness: 0.38, metalness: 0.05 });
  // Upper stationary plaintext scale (x) and lower modular sliding bar (a*x + b mod 26)
  const upperScale = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.03, 0.16), boxwoodMat);
  upperScale.position.set(0.12, 0.045, -0.13);
  mount.add(upperScale);

  const lowerSlide = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.034, 0.16), antiqueBrass);
  lowerSlide.position.set(0.16, 0.046, 0.11);
  mount.add(lowerSlide);

  // Center brass gear rack track between scales
  const rackTrack = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.025, 0.05), obsidian);
  rackTrack.position.set(0.12, 0.042, -0.01);
  mount.add(rackTrack);

  const tickGeo = new THREE.BoxGeometry(0.008, 0.014, 0.09);
  for (let t = 0; t < 26; t++) {
    const tx = -0.32 + t * 0.035;
    const uTick = new THREE.Mesh(tickGeo, obsidian);
    uTick.position.set(tx, 0.062, -0.13);
    mount.add(uTick);

    const lTick = new THREE.Mesh(tickGeo, obsidian);
    lTick.position.set(tx + 0.04, 0.065, 0.11);
    mount.add(lTick);
  }

  // Left-mounted Coprime Multiplier Selector Dial gcd(a, 26) = 1
  const dialPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 0.04, 32), polishedGold);
  dialPlate.position.set(-0.46, 0.05, 0);
  mount.add(dialPlate);

  const dialKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 24), obsidian);
  dialKnob.position.set(-0.46, 0.09, 0);
  mount.add(dialKnob);

  for (let d = 0; d < 12; d++) {
    const ang = (d / 12) * Math.PI * 2;
    const detent = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), obsidian);
    detent.position.set(-0.46 + Math.cos(ang) * 0.15, 0.072, Math.sin(ang) * 0.15);
    mount.add(detent);
  }

  // Magnifying Vernier Cursor with clear crystal & glowing amber hairline
  const cursorGroup = new THREE.Group();
  cursorGroup.position.set(0.22, 0.09, -0.01);
  mount.add(cursorGroup);

  const cursorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.48), polishedGold);
  cursorGroup.add(cursorFrame);

  const cursorCutout = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.05, 0.4),
    new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.38,
      roughness: 0.08,
      metalness: 0.15,
    })
  );
  cursorCutout.position.y = 0.01;
  cursorGroup.add(cursorCutout);

  const hairline = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, 0.055, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.9 })
  );
  hairline.position.y = 0.012;
  cursorGroup.add(hairline);
}

function buildVigenereArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { antiqueBrass, polishedGold, agedBronze, mahogany, obsidian, brushedSteel } = m;

  // Blaise de Vigenère / Bazeries Polyalphabetic Brass Cylinder Stack (12 fluted cipher disks on spindle)
  const basePlinth = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.11, 0.62), mahogany);
  basePlinth.position.y = -0.34;
  basePlinth.castShadow = true;
  group.add(basePlinth);

  const plinthTrim = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.66), antiqueBrass);
  plinthTrim.position.y = -0.38;
  group.add(plinthTrim);

  // Twin ornate bronze end stanchions
  [-0.56, 0.56].forEach((sx) => {
    const stanchion = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.56, 0.28), agedBronze);
    stanchion.position.set(sx, -0.02, 0);
    stanchion.castShadow = true;
    group.add(stanchion);

    const bearingCap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.12, 24), polishedGold);
    bearingCap.rotation.z = Math.PI / 2;
    bearingCap.position.set(sx + (sx > 0 ? 0.06 : -0.06), 0.12, 0);
    group.add(bearingCap);
  });

  // Central steel spindle shaft
  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.32, 24), brushedSteel);
  spindle.rotation.z = Math.PI / 2;
  spindle.position.y = 0.12;
  group.add(spindle);

  // 12 rotatable alphanumeric cipher wheel disks with 26 peripheral character notches
  const notchGeo = new THREE.BoxGeometry(0.055, 0.016, 0.022);
  for (let w = 0; w < 12; w++) {
    const wx = -0.44 + w * 0.08;
    const wheelMat = w % 2 === 0 ? polishedGold : antiqueBrass;
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.068, 48), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, 0.12, 0);
    wheel.castShadow = true;
    group.add(wheel);

    const dividerRing = new THREE.Mesh(new THREE.CylinderGeometry(0.348, 0.348, 0.008, 48), obsidian);
    dividerRing.rotation.z = Math.PI / 2;
    dividerRing.position.set(wx + 0.036, 0.12, 0);
    group.add(dividerRing);

    const phaseOffset = w * 0.24;
    for (let c = 0; c < 26; c += 2) {
      const ang = (c / 26) * Math.PI * 2 + phaseOffset;
      const notch = new THREE.Mesh(notchGeo, obsidian);
      notch.position.set(wx, 0.12 + Math.sin(ang) * 0.342, Math.cos(ang) * 0.342);
      notch.rotation.x = -ang;
      group.add(notch);
    }
  }

  // Front-mounted horizontal brass reading aperture bar framing active cipher row
  const upperBar = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.032, 0.04), polishedGold);
  upperBar.position.set(0, 0.2, 0.365);
  group.add(upperBar);

  const lowerBar = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.032, 0.04), polishedGold);
  lowerBar.position.set(0, 0.08, 0.365);
  group.add(lowerBar);

  [-0.51, 0.51].forEach((bx) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.15, 0.18), agedBronze);
    arm.position.set(bx, 0.14, 0.29);
    group.add(arm);
  });
}

function buildPlayfairArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { antiqueBrass, polishedGold, mahogany, obsidian, ivory } = m;

  // Victorian Wheatstone-Playfair Digraph Matrix (Mahogany case, 25 ivory tiles, dual brass crosshairs)
  const mount = new THREE.Group();
  mount.rotation.x = 0.56;
  group.add(mount);

  // Polished mahogany tray & raised mitered brass bezel
  const tray = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.09, 1.08), mahogany);
  tray.castShadow = true;
  mount.add(tray);

  const bezelRim = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.06, 1.12), antiqueBrass);
  bezelRim.position.y = -0.01;
  mount.add(bezelRim);

  const recessWell = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.03, 0.92), obsidian);
  recessWell.position.y = 0.042;
  mount.add(recessWell);

  // Brass compartment dividers
  for (let g = 0; g < 6; g++) {
    const pos = -0.45 + g * 0.18;
    const hDiv = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.025, 0.014), antiqueBrass);
    hDiv.position.set(0, 0.058, pos);
    mount.add(hDiv);

    const vDiv = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.025, 0.92), antiqueBrass);
    vDiv.position.set(pos, 0.058, 0);
    mount.add(vDiv);
  }

  // 25 carved ivory letter tiles (highlighting digraph rectangle corners (1,1), (1,3), (3,1), (3,3))
  const tileGeo = new THREE.BoxGeometry(0.148, 0.038, 0.148);
  const pipGeo = new THREE.BoxGeometry(0.065, 0.008, 0.065);
  const highlightMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xd97706,
    emissiveIntensity: 0.45,
    roughness: 0.2,
  });

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const isCorner = (r === 1 || r === 3) && (c === 1 || c === 3);
      const tile = new THREE.Mesh(tileGeo, isCorner ? highlightMat : ivory);
      tile.position.set(-0.36 + c * 0.18, isCorner ? 0.078 : 0.068, -0.36 + r * 0.18);
      tile.castShadow = true;
      mount.add(tile);

      const pip = new THREE.Mesh(pipGeo, obsidian);
      pip.position.set(-0.36 + c * 0.18, isCorner ? 0.099 : 0.089, -0.36 + r * 0.18);
      mount.add(pip);
    }
  }

  // Articulated dual sliding brass coordinate crosshairs framing the digraph rectangle
  [-0.18, 0.18].forEach((coord) => {
    const hRail = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.016, 0.016), polishedGold);
    hRail.position.set(0, 0.115, coord);
    mount.add(hRail);

    const vRail = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.016, 1.04), polishedGold);
    vRail.position.set(coord, 0.128, 0);
    mount.add(vRail);

    const sliderKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 16), polishedGold);
    sliderKnob.position.set(0.53, 0.115, coord);
    mount.add(sliderKnob);
  });

  // Engraved Wheatstone 1854 brass patent plate on front rim
  const patentPlate = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.03, 0.06), polishedGold);
  patentPlate.position.set(0, 0.048, 0.52);
  mount.add(patentPlate);
}

function buildPolybiusArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { antiqueBrass, agedBronze } = m;

  // Hellenic Optical Torch Tablet (Carved Grecian limestone stele with 5x5 peg grid + twin bronze fire braziers)
  const limestoneMat = new THREE.MeshStandardMaterial({ color: 0xcbc3b4, roughness: 0.72, metalness: 0.04 });
  const recessedStoneMat = new THREE.MeshStandardMaterial({ color: 0x8d8475, roughness: 0.85 });
  const emberMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xea580c,
    emissiveIntensity: 1.5,
    roughness: 0.25,
  });
  const flameCoreMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xf59e0b,
    emissiveIntensity: 2.0,
    roughness: 0.15,
  });

  // Stepped Grecian stone base plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.1, 0.86), limestoneMat);
  plinth.position.y = -0.38;
  plinth.castShadow = true;
  group.add(plinth);

  // Angled carved limestone tablet in center
  const steleMount = new THREE.Group();
  steleMount.position.set(0, 0.02, -0.02);
  steleMount.rotation.x = 0.58;
  group.add(steleMount);

  const stele = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 0.86), limestoneMat);
  stele.castShadow = true;
  steleMount.add(stele);

  // Triangular classical pediment header on top of stele
  const pediment = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.1, 3), limestoneMat);
  pediment.rotation.y = Math.PI;
  pediment.scale.set(1.0, 1.0, 0.35);
  pediment.position.set(0, 0, -0.5);
  steleMount.add(pediment);

  // 5x5 recessed coordinate wells + weathered bronze signal pegs
  const wellGeo = new THREE.BoxGeometry(0.11, 0.02, 0.11);
  const pegGeo = new THREE.CylinderGeometry(0.026, 0.022, 0.09, 14);
  const activeCoords = new Set(['1-3', '0-4', '2-1', '4-2', '3-0']);

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const wx = -0.28 + c * 0.14;
      const wz = -0.28 + r * 0.14;
      const well = new THREE.Mesh(wellGeo, recessedStoneMat);
      well.position.set(wx, 0.048, wz);
      steleMount.add(well);

      if (activeCoords.has(`${r}-${c}`)) {
        const peg = new THREE.Mesh(pegGeo, agedBronze);
        peg.position.set(wx, 0.09, wz);
        peg.castShadow = true;
        steleMount.add(peg);
      }
    }
  }

  // Twin elevated Greek bronze torch braziers flanking left (row count) and right (column count)
  [-0.58, 0.58].forEach((bx, idx) => {
    const brazierGroup = new THREE.Group();
    brazierGroup.position.set(bx, -0.33, 0.06);
    group.add(brazierGroup);

    const tripodBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.12, 6), agedBronze);
    tripodBase.position.y = 0.06;
    brazierGroup.add(tripodBase);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.055, 0.52, 16), agedBronze);
    stem.position.y = 0.36;
    brazierGroup.add(stem);

    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.06, 0.12, 24), antiqueBrass);
    bowl.position.y = 0.65;
    brazierGroup.add(bowl);

    const emberBed = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 20), emberMat);
    emberBed.position.y = 0.71;
    brazierGroup.add(emberBed);

    // Sculpted glowing flame cones (2 torches lit on left, 3 ember tongues on right)
    const flameCount = idx === 0 ? 2 : 3;
    for (let f = 0; f < flameCount; f++) {
      const offset = (f - (flameCount - 1) / 2) * 0.065;
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.2, 12), flameCoreMat);
      flame.position.set(offset, 0.81 + (f % 2) * 0.03, 0);
      brazierGroup.add(flame);
    }
  });
}

function buildScytaleArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { polishedGold, agedBronze, obsidian } = m;

  // Spartan Ephor Scytale Baton (Turned dark cedarwood baton, bronze hoplite shield caps, helical parchment spiral)
  const cedarMat = new THREE.MeshStandardMaterial({ color: 0x5c260e, roughness: 0.42, metalness: 0.06 });
  const parchmentMat = new THREE.MeshStandardMaterial({ color: 0xf3e5ab, roughness: 0.64, metalness: 0.02 });

  // Ornate Greek bronze cradle stand
  const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.06, 0.42), obsidian);
  standBase.position.y = -0.38;
  group.add(standBase);

  [-0.36, 0.36].forEach((sx) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.34, 16), agedBronze);
    pillar.position.set(sx, -0.2, 0);
    group.add(pillar);

    const cradleArc = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.025, 12, 24, Math.PI), polishedGold);
    cradleArc.rotation.z = Math.PI;
    cradleArc.rotation.y = Math.PI / 2;
    cradleArc.position.set(sx, 0.14, 0);
    group.add(cradleArc);
  });

  // Baton assembly tilted slightly for dramatic museum silhouette
  const batonGroup = new THREE.Group();
  batonGroup.position.y = 0.14;
  batonGroup.rotation.z = Math.PI / 2 - 0.08;
  group.add(batonGroup);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 1.32, 36), cedarMat);
  shaft.castShadow = true;
  batonGroup.add(shaft);

  // Cast-bronze Spartan hoplite end-cap medallions with Lambda relief
  [-0.68, 0.68].forEach((ey) => {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.07, 32), agedBronze);
    cap.position.y = ey;
    batonGroup.add(cap);

    const boss = new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 20), polishedGold);
    boss.position.y = ey + (ey > 0 ? 0.035 : -0.035);
    batonGroup.add(boss);
  });

  // Helical multi-turn coiled parchment strip with iron-gall ink strokes bridging adjacent wraps
  const inkMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 });
  for (let t = 0; t < 9; t++) {
    const ty = -0.48 + t * 0.12;
    const wrap = new THREE.Mesh(new THREE.CylinderGeometry(0.183, 0.183, 0.096, 36), parchmentMat);
    wrap.position.y = ty;
    wrap.rotation.z = 0.09;
    batonGroup.add(wrap);

    // Ink character strokes aligned along longitudinal reading rows
    for (let row = 0; row < 6; row++) {
      const ang = (row / 6) * Math.PI * 2;
      const glyph = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.055, 0.008), inkMat);
      glyph.position.set(Math.cos(ang) * 0.186, ty, Math.sin(ang) * 0.186);
      glyph.rotation.y = -ang + Math.PI / 2;
      batonGroup.add(glyph);
    }
  }

  // Unfurled trailing parchment ribbon tail draping toward base
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.36, 0.012), parchmentMat);
  tail.position.set(0.22, -0.06, 0.18);
  tail.rotation.z = -0.35;
  tail.rotation.x = 0.25;
  group.add(tail);
}

function buildSubstitutionArtifact(group: THREE.Group, m: ArtifactMaterialSet) {
  const { antiqueBrass, polishedGold, mahogany, obsidian, ivory } = m;

  // Monoalphabetic Keyed Cipher Tablet & Bijection Dial
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.62, 0.09, 32), mahogany);
  base.position.y = -0.44;
  group.add(base);

  const dialBed = new THREE.Group();
  dialBed.position.y = 0.02;
  dialBed.rotation.x = 0.32;

  const outerDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.05, 48), antiqueBrass);
  dialBed.add(outerDisc);

  const innerDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.065, 48), ivory);
  innerDisc.position.y = 0.012;
  dialBed.add(innerDisc);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.02, 14, 48), polishedGold);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.026;
  dialBed.add(rim);

  for (let i = 0; i < 26; i++) {
    const ang = (i / 26) * Math.PI * 2;
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.02, 0.075), obsidian);
    tick.position.set(Math.cos(ang) * 0.43, 0.032, Math.sin(ang) * 0.43);
    tick.rotation.y = -ang;
    dialBed.add(tick);
  }

  const pointer = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 0.62), polishedGold);
  pointer.position.y = 0.06;
  pointer.rotation.y = 0.45;
  dialBed.add(pointer);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.09, 24), polishedGold);
  hub.position.y = 0.065;
  dialBed.add(hub);

  group.add(dialBed);
}

export const CLASSICAL_EXHIBIT_BUILDERS: Record<string, ExhibitArtifactBuilder> = {
  caesar: buildCaesarArtifact,
  affine: buildAffineArtifact,
  vigenere: buildVigenereArtifact,
  playfair: buildPlayfairArtifact,
  polybius: buildPolybiusArtifact,
  scytale: buildScytaleArtifact,
  substitution: buildSubstitutionArtifact,
};
