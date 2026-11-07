'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MUSEUM_EXHIBITS, MUSEUM_WINGS, MUSEUM_STATUES, CryptographicStatue } from './museumData';

interface ThreeMuseumSceneProps {
  currentView: string;
  isMacro: boolean;
  onSelectRoom: (roomId: string) => void;
  onCaseClick: (roomId: string) => void;
}

const textureCache = new Map<string, THREE.CanvasTexture>();

let sharedBustGeometry: THREE.BufferGeometry | null = null;
let isBustLoading = false;
const bustCallbacks: Array<() => void> = [];

function loadScannedBust(onReady?: () => void) {
  if (sharedBustGeometry) {
    if (onReady) onReady();
    return;
  }
  if (onReady) bustCallbacks.push(onReady);
  if (isBustLoading || typeof window === 'undefined') return;
  isBustLoading = true;

  fetch('/models/LeePerrySmith.glb')
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then((buffer) => {
      const loader = new GLTFLoader();
      loader.parse(
        buffer,
        '',
        (gltf) => {
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh && !sharedBustGeometry) {
              const mesh = child as THREE.Mesh;
              sharedBustGeometry = mesh.geometry.clone();
              sharedBustGeometry.center();
              sharedBustGeometry.computeVertexNormals();
            }
          });
          isBustLoading = false;
          bustCallbacks.forEach((cb) => cb());
          bustCallbacks.length = 0;
        },
        (err) => {
          console.error('[loadScannedBust] Parse error:', err);
          isBustLoading = false;
        }
      );
    })
    .catch((err) => {
      console.warn('[loadScannedBust] Could not load 3D scanned bust, falling back to procedural sculpture:', err);
      isBustLoading = false;
    });
}

if (typeof window !== 'undefined') {
  loadScannedBust();
}

export default function ThreeMuseumScene({
  currentView,
  isMacro,
  onSelectRoom,
  onCaseClick,
}: ThreeMuseumSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animIdRef = useRef<number>(0);
  const rotatingArtifactsRef = useRef<THREE.Object3D[]>([]);
  const floatingMarkersRef = useRef<THREE.Object3D[]>([]);
  const statueGlyphsRef = useRef<THREE.Object3D[]>([]);

  // Keyboard WASD state
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const lastRoomChangeTimeRef = useRef<number>(0);
  const isSpatialUpdateRef = useRef<boolean>(false);

  const targetCamPos = useRef(new THREE.Vector3(0, 2.5, 20));
  const targetLookAt = useRef(new THREE.Vector3(0, 2.5, 10));
  const isAnimatingRef = useRef(true);

  const isMacroRef = useRef(isMacro);
  const currentViewRef = useRef(currentView);
  const onSelectRoomRef = useRef(onSelectRoom);
  const onCaseClickRef = useRef(onCaseClick);
  const initializedRef = useRef(false);

  // Build the full 3D scene once
  const buildScene = useCallback(() => {
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // === 1. HIGH-PERFORMANCE WEBGL RENDERER ===
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.setClearColor(0x1e293b);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === 2. ATMOSPHERIC OBSIDIAN VAULT SCENE & FOG ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10);
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.005);
    sceneRef.current = scene;

    // === 3. FIRST-PERSON EYE-LEVEL CAMERA & IN-PLACE CONTROLS ===
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 300);
    camera.position.set(0, 2.5, 20); // Eye-level standing height
    cameraRef.current = camera;

    // OrbitControls configured for In-Place Head Look (Target stays right in front of camera!)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 1.8; // Prevent looking upside down
    controls.minPolarAngle = Math.PI / 4.0;
    controls.minDistance = 0.1; // In-place rotation
    controls.maxDistance = 0.5; // Lock camera distance to target origin for FPV Head Look!
    controls.target.set(0, 2.5, 15);
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      isAnimatingRef.current = false;
    });

    // ============================
    // 4. WASD KEYBOARD LISTENERS
    // ============================
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      keysPressedRef.current[e.code] = true;
      isAnimatingRef.current = false; // Give immediate control to WASD FPV walking
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // ============================
    // 5. ARCHIVAL MUSEUM ARCHITECTURAL MATERIALS
    // ============================
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1b1e27, roughness: 0.55 });
    const wainscotMat = new THREE.MeshStandardMaterial({ color: 0x261912, roughness: 0.45 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xc59f3d, metalness: 0.88, roughness: 0.22 });
    const woodBeamMat = new THREE.MeshStandardMaterial({ color: 0x231710, roughness: 0.45 });
    const terrazzoFloorMat = new THREE.MeshPhysicalMaterial({
      color: 0x12141a,
      roughness: 0.18,
      metalness: 0.08,
      clearcoat: 0.35,
      clearcoatRoughness: 0.12,
    });
    const neroMarquinaMat = new THREE.MeshPhysicalMaterial({
      color: 0x08090d,
      roughness: 0.12,
      metalness: 0.06,
      clearcoat: 0.45,
    });
    const brassInlayMat = new THREE.MeshStandardMaterial({ color: 0xc99a3e, metalness: 0.88, roughness: 0.2 });
    const travertineMat = new THREE.MeshStandardMaterial({ color: 0xd6cfc2, roughness: 0.42, metalness: 0.04 });
    const wartimeBronzeMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, metalness: 0.82, roughness: 0.32 });
    const titaniumMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.92, roughness: 0.18 });
    const matteBlackMat = new THREE.MeshStandardMaterial({ color: 0x0b0d12, roughness: 0.5, metalness: 0.3 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x2c1810, roughness: 0.65, metalness: 0.05 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.94,
      transparent: true,
      opacity: 0.32,
      roughness: 0.02,
      ior: 1.52,
    });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.92, roughness: 0.16 });

    // ============================
    // 6. CALIBRATED GALLERY EXHIBITION LIGHTING
    // ============================
    const hemiLight = new THREE.HemisphereLight(0xfff7ea, 0x101218, 0.58);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.65);
    sunLight.position.set(25, 42, 28);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 160;
    sunLight.shadow.camera.left = -80;
    sunLight.shadow.camera.right = 80;
    sunLight.shadow.camera.top = 80;
    sunLight.shadow.camera.bottom = -80;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // Dedicated Rotunda Portrait Key Light (Illuminates Founding Pioneers from the front)
    const rotundaKeyLight = new THREE.DirectionalLight(0xffedd5, 2.3);
    rotundaKeyLight.position.set(0, 14, 24);
    rotundaKeyLight.target.position.set(0, 2.3, 6);
    scene.add(rotundaKeyLight);
    scene.add(rotundaKeyLight.target);

    // Physical Multi-Tier Brass & Frosted Crystal Chandelier in Grand Rotunda
    const chandelierGroup = new THREE.Group();
    chandelierGroup.position.set(0, 11.2, 8);
    const suspensionRod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 16), trimMat);
    suspensionRod.position.y = 0.4;
    chandelierGroup.add(suspensionRod);

    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.95,
      roughness: 0.15,
    });
    [3.0, 2.0, 1.1].forEach((rad, rIdx) => {
      const tierY = -rIdx * 0.52;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.045, 16, 48), goldMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = tierY;
      chandelierGroup.add(ring);

      // Brass suspension cables
      for (let c = 0; c < 4; c++) {
        const cAngle = (c * Math.PI) / 2;
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.4, 8), trimMat);
        strut.position.set(Math.cos(cAngle) * (rad * 0.5), tierY + 0.5, Math.sin(cAngle) * (rad * 0.5));
        strut.rotation.z = Math.cos(cAngle) * 0.45;
        strut.rotation.x = -Math.sin(cAngle) * 0.45;
        chandelierGroup.add(strut);
      }

      const crystalCount = Math.round(rad * 6);
      for (let l = 0; l < crystalCount; l++) {
        const theta = (l / crystalCount) * Math.PI * 2;
        const crystal = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.36, 12), crystalMat);
        crystal.position.set(Math.cos(theta) * rad, tierY - 0.18, Math.sin(theta) * rad);
        chandelierGroup.add(crystal);
      }
    });
    const lobbyChandelier = new THREE.PointLight(0xffeedb, 4.2, 48);
    lobbyChandelier.position.set(0, -1.2, 0);
    chandelierGroup.add(lobbyChandelier);
    scene.add(chandelierGroup);

    // ============================
    // 7. MUSEUM BUILDING ARCHITECTURE (TERRAZZO, INLAYS, COFFERED CEILING)
    // ============================
    const floorGeo = new THREE.PlaneGeometry(180, 200);
    const floor = new THREE.Mesh(floorGeo, terrazzoFloorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Nero Marquina Marble Corridor Runners leading from Rotunda to Wings
    const mainRunner = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 56), neroMarquinaMat);
    mainRunner.rotation.x = -Math.PI / 2;
    mainRunner.position.set(0, 0.008, -14);
    scene.add(mainRunner);

    // Architectural Inlaid Brass Expansion Joints (Replaces debug GridHelper)
    for (let x = -72; x <= 72; x += 18) {
      const joint = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.004, 150), brassInlayMat);
      joint.position.set(x, 0.012, -25);
      scene.add(joint);
    }
    for (let z = -86; z <= 28; z += 18) {
      const crossJoint = new THREE.Mesh(new THREE.BoxGeometry(150, 0.004, 0.035), brassInlayMat);
      crossJoint.position.set(0, 0.012, z);
      scene.add(crossJoint);
    }

    // Coffered Dark Acoustic Ceiling & Walnut Structural Cross-Beams
    const ceilingGeo = new THREE.PlaneGeometry(180, 200);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x10131b, roughness: 0.65 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = 12;
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);

    for (let x = -80; x <= 80; x += 20) {
      const beamGeo = new THREE.BoxGeometry(0.65, 0.85, 200);
      const beam = new THREE.Mesh(beamGeo, woodBeamMat);
      beam.position.set(x, 11.55, -10);
      scene.add(beam);
    }
    for (let z = -90; z <= 30; z += 20) {
      const crossBeamGeo = new THREE.BoxGeometry(160, 0.85, 0.65);
      const crossBeam = new THREE.Mesh(crossBeamGeo, woodBeamMat);
      crossBeam.position.set(0, 11.55, z);
      scene.add(crossBeam);
    }

    // Perimeter Acoustic Limestone Walls with Dark Walnut Wainscoting & Brass Rails
    const rearWallGeo = new THREE.BoxGeometry(180, 12, 0.8);
    const rearWall = new THREE.Mesh(rearWallGeo, wallMat);
    rearWall.position.set(0, 6, 32);
    scene.add(rearWall);

    const rearWainscot = new THREE.Mesh(new THREE.BoxGeometry(180, 1.4, 0.88), wainscotMat);
    rearWainscot.position.set(0, 0.7, 32);
    scene.add(rearWainscot);

    const rearBrassRail = new THREE.Mesh(new THREE.BoxGeometry(180, 0.06, 0.92), trimMat);
    rearBrassRail.position.set(0, 1.42, 32);
    scene.add(rearBrassRail);

    const frontWall = new THREE.Mesh(rearWallGeo, wallMat);
    frontWall.position.set(0, 6, -95);
    scene.add(frontWall);

    const sideWallGeo = new THREE.BoxGeometry(0.8, 12, 130);
    const leftExteriorWall = new THREE.Mesh(sideWallGeo, wallMat);
    leftExteriorWall.position.set(-85, 6, -30);
    scene.add(leftExteriorWall);

    const rightExteriorWall = new THREE.Mesh(sideWallGeo, wallMat);
    rightExteriorWall.position.set(85, 6, -30);
    scene.add(rightExteriorWall);

    // Architectural Wall Sconces along Perimeter & Rotunda
    const buildWallSconce = (sx: number, sy: number, sz: number, rotY: number) => {
      const sconce = new THREE.Group();
      sconce.position.set(sx, sy, sz);
      sconce.rotation.y = rotY;
      const backplate = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 0.06), trimMat);
      sconce.add(backplate);
      const diffuser = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16), crystalMat);
      diffuser.position.z = 0.09;
      sconce.add(diffuser);
      scene.add(sconce);
    };
    [-22, -10, 10, 22].forEach((sx) => buildWallSconce(sx, 5.2, 31.5, Math.PI));

    // Museum Walnut & Tufted Leather Gallery Benches
    const buildGalleryBench = (bx: number, bz: number, rotY: number = 0) => {
      const bench = new THREE.Group();
      bench.position.set(bx, 0, bz);
      bench.rotation.y = rotY;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 0.95), wainscotMat);
      frame.position.y = 0.42;
      bench.add(frame);
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.14, 0.88), leatherMat);
      cushion.position.y = 0.54;
      cushion.castShadow = true;
      bench.add(cushion);
      const brassTrim = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.03, 0.97), trimMat);
      brassTrim.position.y = 0.36;
      bench.add(brassTrim);
      [
        [-1.15, -0.35],
        [1.15, -0.35],
        [-1.15, 0.35],
        [1.15, 0.35],
      ].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.36, 0.12), matteBlackMat);
        leg.position.set(lx, 0.18, lz);
        bench.add(leg);
      });
      scene.add(bench);
    };
    buildGalleryBench(-13.5, 16, Math.PI / 5);
    buildGalleryBench(13.5, 16, -Math.PI / 5);
    buildGalleryBench(-20, -16, Math.PI / 4);
    buildGalleryBench(20, -16, -Math.PI / 4);

    // ============================
    // 8. GRAND ENTRANCE FOYER, COLONNADE, PORTRAITS & TIMELINE FRIEZE
    // ============================
    const doorFrameGeo = new THREE.BoxGeometry(12, 9, 1.2);
    const doorFrame = new THREE.Mesh(doorFrameGeo, trimMat);
    doorFrame.position.set(0, 4.5, 31.5);
    scene.add(doorFrame);

    const glassDoorGeo = new THREE.BoxGeometry(5.2, 8.2, 0.2);
    const leftDoor = new THREE.Mesh(glassDoorGeo, glassMat);
    leftDoor.position.set(-2.8, 4.3, 31.5);
    scene.add(leftDoor);

    const rightDoor = new THREE.Mesh(glassDoorGeo, glassMat);
    rightDoor.position.set(2.8, 4.3, 31.5);
    scene.add(rightDoor);

    // Inlaid Astronomical Brass & Nero Marquina Compass Medallion in Entrance Foyer
    const medallionRingGeo = new THREE.RingGeometry(2.5, 3.2, 64);
    const medallionRing = new THREE.Mesh(
      medallionRingGeo,
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.92, roughness: 0.16, side: THREE.DoubleSide })
    );
    medallionRing.rotation.x = -Math.PI / 2;
    medallionRing.position.set(0, 0.02, 16);
    scene.add(medallionRing);

    const medallionInner = new THREE.Mesh(
      new THREE.CircleGeometry(2.48, 64),
      new THREE.MeshStandardMaterial({ color: 0x08090d, roughness: 0.2, side: THREE.DoubleSide })
    );
    medallionInner.rotation.x = -Math.PI / 2;
    medallionInner.position.set(0, 0.018, 16);
    scene.add(medallionInner);

    const compassInnerRing = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.25, 48), brassInlayMat);
    compassInnerRing.rotation.x = -Math.PI / 2;
    compassInnerRing.position.set(0, 0.021, 16);
    scene.add(compassInnerRing);

    for (let s = 0; s < 8; s++) {
      const needle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.004, 4.6), brassInlayMat);
      needle.rotation.y = (s * Math.PI) / 8;
      needle.position.set(0, 0.022, 16);
      scene.add(needle);
    }

    // Monumental 8-Pillar Neoclassical Fluted Rotunda Colonnade
    const colonnadeAngles = [
      -0.88 * Math.PI,
      -0.68 * Math.PI,
      -0.32 * Math.PI,
      -0.12 * Math.PI,
      0.12 * Math.PI,
      0.32 * Math.PI,
      0.68 * Math.PI,
      0.88 * Math.PI,
    ];
    colonnadeAngles.forEach((ang) => {
      const colR = 15.2;
      const cx = Math.sin(ang) * colR;
      const cz = 8.0 + Math.cos(ang) * colR;
      const pGroup = new THREE.Group();
      pGroup.position.set(cx, 0, cz);

      const basePlinth = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 1.5), neroMarquinaMat);
      basePlinth.position.y = 0.225;
      pGroup.add(basePlinth);

      const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.07, 16, 36), goldMat);
      baseRing.rotation.x = Math.PI / 2;
      baseRing.position.y = 0.48;
      pGroup.add(baseRing);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 10.2, 32), travertineMat);
      shaft.position.y = 5.55;
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      pGroup.add(shaft);

      const capRing = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.06, 16, 36), goldMat);
      capRing.rotation.x = Math.PI / 2;
      capRing.position.y = 10.65;
      pGroup.add(capRing);

      const abacus = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.35, 1.45), travertineMat);
      abacus.position.y = 10.88;
      pGroup.add(abacus);

      scene.add(pGroup);
    });

    // "THE CHRONICLES OF CRYPTOGRAPHY" — 2,500-Year Illuminated Timeline Frieze Entablature
    const friezeTex = getTimelineFriezeTexture();
    const friezeBacking = new THREE.Mesh(new THREE.BoxGeometry(21.6, 2.45, 0.45), wainscotMat);
    friezeBacking.position.set(0, 9.65, -4.6);
    scene.add(friezeBacking);

    const friezeTrim = new THREE.Mesh(new THREE.BoxGeometry(21.8, 2.58, 0.38), trimMat);
    friezeTrim.position.set(0, 9.65, -4.62);
    scene.add(friezeTrim);

    const friezeFace = new THREE.Mesh(
      new THREE.PlaneGeometry(21.2, 2.25),
      new THREE.MeshStandardMaterial({
        map: friezeTex,
        roughness: 0.25,
        metalness: 0.15,
        emissive: 0x291d09,
        emissiveIntensity: 0.45,
      })
    );
    friezeFace.position.set(0, 9.65, -4.36);
    scene.add(friezeFace);

    // Archival Framed Portrait Gallery (5 Great Cryptologists on Gallery Steles with Picture Lamps)
    const archivalPortraits = [
      {
        name: 'Leon Battista Alberti',
        lifespan: '1404–1472',
        legacy: 'Inventor of the Polyalphabetic Cipher Disc',
        pos: [-16.8, 0, 12.5] as [number, number, number],
        rotY: Math.PI * 0.38,
      },
      {
        name: 'Blaise de Vigenère',
        lifespan: '1523–1596',
        legacy: 'Architect of Le Chiffre Indéchiffrable',
        pos: [-15.2, 0, 5.2] as [number, number, number],
        rotY: Math.PI * 0.28,
      },
      {
        name: 'Marian Rejewski',
        lifespan: '1905–1980',
        legacy: 'First Mathematical Breaker of Enigma (1932)',
        pos: [-12.5, 0, 31.2] as [number, number, number],
        rotY: Math.PI,
      },
      {
        name: 'Charles Wheatstone',
        lifespan: '1802–1875',
        legacy: 'Creator of the Playfair Digraph Matrix',
        pos: [15.2, 0, 5.2] as [number, number, number],
        rotY: -Math.PI * 0.28,
      },
      {
        name: 'Auguste Kerckhoffs',
        lifespan: '1835–1903',
        legacy: 'Author of Kerckhoffs’s Cryptographic Principle',
        pos: [16.8, 0, 12.5] as [number, number, number],
        rotY: -Math.PI * 0.38,
      },
    ];

    archivalPortraits.forEach((pt) => {
      const steleGroup = new THREE.Group();
      steleGroup.position.set(...pt.pos);
      steleGroup.rotation.y = pt.rotY;

      // Freestanding acoustic stone display wall stele
      const steleWall = new THREE.Mesh(new THREE.BoxGeometry(3.4, 6.2, 0.38), wallMat);
      steleWall.position.y = 3.1;
      steleWall.castShadow = true;
      steleWall.receiveShadow = true;
      steleGroup.add(steleWall);

      const steleBase = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.85, 0.48), wainscotMat);
      steleBase.position.y = 0.425;
      steleGroup.add(steleBase);

      // Ornate gilded portrait frame
      const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(2.35, 2.95, 0.12), goldMat);
      outerFrame.position.set(0, 3.45, 0.22);
      steleGroup.add(outerFrame);

      const portraitTex = getArchivalPortraitTexture(pt.name, pt.lifespan, pt.legacy);
      const canvasMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.15, 2.75),
        new THREE.MeshStandardMaterial({ map: portraitTex, roughness: 0.38 })
      );
      canvasMesh.position.set(0, 3.45, 0.29);
      steleGroup.add(canvasMesh);

      // Over-frame Brass Museum Picture Lamp
      const lampArm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.42), trimMat);
      lampArm.position.set(0, 5.08, 0.32);
      steleGroup.add(lampArm);

      const lampHood = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.1, 16), goldMat);
      lampHood.rotation.z = Math.PI / 2;
      lampHood.position.set(0, 5.05, 0.52);
      steleGroup.add(lampHood);

      const lampGlow = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.03, 0.06), crystalMat);
      lampGlow.position.set(0, 4.98, 0.52);
      steleGroup.add(lampGlow);

      scene.add(steleGroup);
    });

    // ============================
    // 8.5. GRAND ROTUNDA OF CRYPTOGRAPHIC PIONEERS (THE 4 PILLARS)
    // ============================
    const statueGlyphs: THREE.Object3D[] = [];

    MUSEUM_STATUES.forEach((statue) => {
      const statueGroup = new THREE.Group();
      statueGroup.position.set(...statue.position);
      statueGroup.rotation.y = statue.rotationY;
      statueGroup.userData = { statueId: statue.id };

      buildStatueMonument(statue, statueGroup, statueGlyphs);
      scene.add(statueGroup);
    });

    statueGlyphsRef.current = statueGlyphs;

    // ============================
    // 9. THEMATIC GRAND WING PORTALS & ARCHWAYS
    // ============================
    interface WingPortalData {
      id: string;
      title: string;
      pos: [number, number, number];
      rotY: number;
      pillarMat: THREE.Material;
      accentColor: number;
    }

    const wingPortalsData: WingPortalData[] = [
      {
        id: 'wing-classical',
        title: 'CLASSICAL CIPHERS WING',
        pos: [-30, 0, 0],
        rotY: Math.PI * 0.25,
        pillarMat: travertineMat,
        accentColor: 0x38bdf8,
      },
      {
        id: 'wing-historical',
        title: 'HISTORICAL SYSTEMS WING',
        pos: [0, 0, -12],
        rotY: 0,
        pillarMat: wartimeBronzeMat,
        accentColor: 0xf59e0b,
      },
      {
        id: 'wing-modern',
        title: 'MODERN CRYPTOGRAPHY WING',
        pos: [30, 0, 0],
        rotY: -Math.PI * 0.25,
        pillarMat: titaniumMat,
        accentColor: 0xc084fc,
      },
    ];

    wingPortalsData.forEach((portal) => {
      const portalGroup = new THREE.Group();
      portalGroup.position.set(...portal.pos);
      portalGroup.rotation.y = portal.rotY;

      const pillarGeo = new THREE.CylinderGeometry(0.52, 0.58, 9.6, 32);
      const leftPillar = new THREE.Mesh(pillarGeo, portal.pillarMat);
      leftPillar.position.set(-4.6, 4.8, 0);
      leftPillar.castShadow = true;
      portalGroup.add(leftPillar);

      const rightPillar = new THREE.Mesh(pillarGeo, portal.pillarMat);
      rightPillar.position.set(4.6, 4.8, 0);
      rightPillar.castShadow = true;
      portalGroup.add(rightPillar);

      // Brass plinth & capital rings on portal columns
      [-4.6, 4.6].forEach((px) => {
        const pBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 1.4), neroMarquinaMat);
        pBase.position.set(px, 0.2, 0);
        portalGroup.add(pBase);
        const pRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.05, 16, 32), goldMat);
        pRing.rotation.x = Math.PI / 2;
        pRing.position.set(px, 9.5, 0);
        portalGroup.add(pRing);
      });

      const beamGeo = new THREE.BoxGeometry(10.8, 1.2, 1.3);
      const beam = new THREE.Mesh(beamGeo, portal.pillarMat);
      beam.position.set(0, 10.1, 0);
      portalGroup.add(beam);

      const corniceTrim = new THREE.Mesh(new THREE.BoxGeometry(11.1, 0.14, 1.42), goldMat);
      corniceTrim.position.set(0, 10.75, 0);
      portalGroup.add(corniceTrim);

      // Accent cornice wash strip & physical brass uplight housing
      const washStrip = new THREE.Mesh(
        new THREE.BoxGeometry(8.6, 0.08, 0.12),
        new THREE.MeshStandardMaterial({
          color: portal.accentColor,
          emissive: portal.accentColor,
          emissiveIntensity: 0.9,
        })
      );
      washStrip.position.set(0, 9.46, 0.55);
      portalGroup.add(washStrip);

      const portalGlow = new THREE.PointLight(portal.accentColor, 2.2, 22);
      portalGlow.position.set(0, 8.2, 1.5);
      portalGroup.add(portalGlow);

      const signTex = getPortalBannerTexture(portal.title);
      const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.22, metalness: 0.25 });
      const signMesh = new THREE.Mesh(new THREE.BoxGeometry(8.6, 1.65, 0.28), signMat);
      signMesh.position.set(0, 8.2, 0);
      signMesh.userData = { wingId: portal.id };
      portalGroup.add(signMesh);

      scene.add(portalGroup);
    });

    // ============================
    // 10. GALLERY DISPLAY ALCOVES, TRACK LIGHTS & ARCHIVAL VITRINES
    // ============================
    const rotatingArtifacts: THREE.Object3D[] = [];
    const floatingMarkers: THREE.Object3D[] = [];
    const roomWallMat = new THREE.MeshStandardMaterial({ color: 0x181b24, roughness: 0.55 });
    const roomRoofMat = new THREE.MeshStandardMaterial({ color: 0x0f1219, roughness: 0.6 });
    const plinthObsidianMat = new THREE.MeshPhysicalMaterial({
      color: 0x12151e,
      roughness: 0.22,
      metalness: 0.15,
      clearcoat: 0.35,
    });
    const velvetBedMat = new THREE.MeshStandardMaterial({ color: 0x2a1018, roughness: 0.88, metalness: 0.04 });

    MUSEUM_EXHIBITS.forEach((exhibit, exIdx) => {
      const roomGroup = new THREE.Group();
      roomGroup.position.set(...exhibit.position);
      roomGroup.rotation.y = exhibit.rotationY;
      roomGroup.userData = { exhibitId: exhibit.id };

      // Back Wall with Walnut Wainscoting & Recessed Cove Backlight
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(14, 8.5, 0.4), roomWallMat);
      backWall.position.set(0, 4.25, -6);
      backWall.receiveShadow = true;
      roomGroup.add(backWall);

      const backWainscot = new THREE.Mesh(new THREE.BoxGeometry(13.6, 1.2, 0.46), wainscotMat);
      backWainscot.position.set(0, 0.6, -5.96);
      roomGroup.add(backWainscot);

      const backRail = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.05, 0.5), trimMat);
      backRail.position.set(0, 1.22, -5.96);
      roomGroup.add(backRail);

      // Warm Recessed Alcove Frame on Back Wall
      const alcoveFrame = new THREE.Mesh(new THREE.BoxGeometry(5.6, 5.2, 0.12), trimMat);
      alcoveFrame.position.set(0, 4.2, -5.78);
      roomGroup.add(alcoveFrame);

      const alcoveInner = new THREE.Mesh(new THREE.BoxGeometry(5.3, 4.9, 0.14), neroMarquinaMat);
      alcoveInner.position.set(0, 4.2, -5.76);
      roomGroup.add(alcoveInner);

      // Side Walls with Walnut Wainscoting
      const sideWallGeo = new THREE.BoxGeometry(0.4, 8.5, 12);
      const leftWall = new THREE.Mesh(sideWallGeo, roomWallMat);
      leftWall.position.set(-7, 4.25, 0);
      leftWall.receiveShadow = true;
      roomGroup.add(leftWall);

      const rightWall = new THREE.Mesh(sideWallGeo, roomWallMat);
      rightWall.position.set(7, 4.25, 0);
      rightWall.receiveShadow = true;
      roomGroup.add(rightWall);

      [-6.95, 6.95].forEach((wx) => {
        const sWainscot = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.2, 11.8), wainscotMat);
        sWainscot.position.set(wx, 0.6, 0);
        roomGroup.add(sWainscot);
      });

      // Front Wall with Doorway Arch & Brass Pilaster Trim
      const frontPartGeo = new THREE.BoxGeometry(3.8, 8.5, 0.4);
      const frontLeft = new THREE.Mesh(frontPartGeo, roomWallMat);
      frontLeft.position.set(-5.1, 4.25, 6);
      roomGroup.add(frontLeft);

      const frontRight = new THREE.Mesh(frontPartGeo, roomWallMat);
      frontRight.position.set(5.1, 4.25, 6);
      roomGroup.add(frontRight);

      const header = new THREE.Mesh(new THREE.BoxGeometry(6.6, 2.2, 0.45), roomWallMat);
      header.position.set(0, 7.4, 6);
      roomGroup.add(header);

      // Coffered Ceiling Roof
      const roomRoof = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.3, 12.4), roomRoofMat);
      roomRoof.position.set(0, 8.6, 0);
      roomGroup.add(roomRoof);

      // Physical Ceiling Spotlight Track Rail & Angled Brass Cans
      const trackRail = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.08, 0.14), matteBlackMat);
      trackRail.position.set(0, 8.38, 1.4);
      roomGroup.add(trackRail);

      [-1.3, 1.3].forEach((tx) => {
        const can = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.34, 16), goldMat);
        can.position.set(tx, 8.18, 1.4);
        can.rotation.x = -0.35;
        can.rotation.z = tx > 0 ? 0.22 : -0.22;
        roomGroup.add(can);
      });

      // Overhead 3D Etched Bronze Signboard
      const roomSignTex = getSignboardTexture(exhibit.name, exhibit.timeline);
      const signBoardMat = new THREE.MeshStandardMaterial({ map: roomSignTex, roughness: 0.22, metalness: 0.28 });
      const signBoard = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.4, 0.3), signBoardMat);
      signBoard.position.set(0, 7.6, 6.3);
      roomGroup.add(signBoard);

      // Subtle Floating Brass Octahedron Finial above Chamber
      const waymarker = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.38, 0),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.15, emissive: 0x78350f, emissiveIntensity: 0.45 })
      );
      waymarker.position.set(0, 9.5, 6.3);
      waymarker.userData = { baseY: 9.5, exIdx };
      roomGroup.add(waymarker);
      floatingMarkers.push(waymarker);

      // Inlaid Brass Threshold Medallion Bar
      const thresholdStrip = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.03, 0.45), brassInlayMat);
      thresholdStrip.position.set(0, 0.016, 6.1);
      roomGroup.add(thresholdStrip);

      // Wall-Mounted Archival Accession Plaque
      const plaqueTex = getPlaqueTexture(exhibit.name, exhibit.subtitle);
      const plaqueMat = new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.28, metalness: 0.2 });
      const plaqueMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.0, 3.2), plaqueMat);
      plaqueMesh.position.set(-6.75, 3.8, -1);
      roomGroup.add(plaqueMesh);

      // Museum-Grade Multi-Tier Beveled Obsidian Vitrine Plinth
      const toeKick = new THREE.Mesh(new THREE.CylinderGeometry(1.26, 1.3, 0.12, 48), goldMat);
      toeKick.position.set(0, 0.06, 0);
      roomGroup.add(toeKick);

      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.16, 1.24, 1.02, 48), plinthObsidianMat);
      pedestal.position.set(0, 0.63, 0);
      pedestal.receiveShadow = true;
      roomGroup.add(pedestal);

      const plinthBezel = new THREE.Mesh(new THREE.TorusGeometry(1.16, 0.032, 16, 48), goldMat);
      plinthBezel.rotation.x = Math.PI / 2;
      plinthBezel.position.set(0, 1.15, 0);
      roomGroup.add(plinthBezel);

      const velvetBed = new THREE.Mesh(new THREE.CylinderGeometry(1.06, 1.1, 0.08, 48), velvetBedMat);
      velvetBed.position.set(0, 1.18, 0);
      roomGroup.add(velvetBed);

      // Ultra-Clear Museum Vitrine Glass Case & Brass Crown Cap
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.12, 2.22, 48), glassMat);
      glass.position.set(0, 2.31, 0);
      glass.userData = { isDisplayCase: true, exhibitId: exhibit.id };
      roomGroup.add(glass);

      const vitrineCrown = new THREE.Mesh(new THREE.CylinderGeometry(1.16, 1.16, 0.08, 48), goldMat);
      vitrineCrown.position.set(0, 3.44, 0);
      roomGroup.add(vitrineCrown);

      // Calibrated Exhibit Pin-Spotlight with Realistic Decay & Soft Penumbra
      const spot = new THREE.SpotLight(0xfff6e5, 6.2, 24, 0.48, 0.55, 1.4);
      spot.position.set(0, 8.1, 1.4);
      spot.castShadow = false;
      spot.target = pedestal;
      roomGroup.add(spot);
      roomGroup.add(spot.target);

      // Elevated Rotating Physical Cryptographic Artifact
      const artifactGroup = new THREE.Group();
      artifactGroup.position.set(0, 1.92, 0);
      buildHighQualityArtifact(exhibit.id, artifactGroup);
      roomGroup.add(artifactGroup);
      rotatingArtifacts.push(artifactGroup);

      scene.add(roomGroup);
    });

    rotatingArtifactsRef.current = rotatingArtifacts;
    floatingMarkersRef.current = floatingMarkers;

    // Preload & dynamically upgrade portrait busts with 3D scanned anatomy
    loadScannedBust(() => {
      const geo = sharedBustGeometry;
      if (!scene || !geo) return;
      scene.traverse((obj) => {
        if (obj.userData?.isPortraitHead && ((obj as any).isGroup || obj.type === 'Group')) {
          const mat = obj.userData.material;
          const s = obj.userData.scale || 0.088;
          while (obj.children.length > 0) {
            obj.remove(obj.children[0]);
          }
          const mesh = new THREE.Mesh(geo, mat);
          mesh.scale.setScalar(s);
          mesh.rotation.y = 0;
          mesh.castShadow = true;
          obj.add(mesh);
        }
      });
    });

    // ============================
    // 11. RAYCASTING INTERACTION
    // ============================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let mouseDownPos = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      mouseDownPos = { x: e.clientX, y: e.clientY };
    };

    const handleClick = (e: MouseEvent) => {
      const dx = e.clientX - mouseDownPos.x;
      const dy = e.clientY - mouseDownPos.y;
      if (Math.hypot(dx, dy) > 6) return;

      // In macro inspection mode, ignore background 3D clicks so inspection is not interrupted
      if (isMacroRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj.parent && obj.parent !== scene) {
          if (obj.userData?.wingId) {
            isSpatialUpdateRef.current = false;
            lastRoomChangeTimeRef.current = performance.now() + 1500;
            onSelectRoomRef.current(obj.userData.wingId);
            return;
          }
          if (obj.userData?.statueId) {
            const clickedStatueId = obj.userData.statueId;
            if (clickedStatueId !== currentViewRef.current) {
              isSpatialUpdateRef.current = false;
              lastRoomChangeTimeRef.current = performance.now() + 1500;
              onSelectRoomRef.current(clickedStatueId);
            }
            return;
          }
          if (obj.userData?.isDisplayCase && obj.userData.exhibitId === currentViewRef.current) {
            if (onCaseClickRef.current) {
              onCaseClickRef.current(obj.userData.exhibitId);
            }
            return;
          }
          if (obj.userData?.exhibitId) {
            const clickedExhibitId = obj.userData.exhibitId;
            if (clickedExhibitId !== currentViewRef.current) {
              isSpatialUpdateRef.current = false;
              lastRoomChangeTimeRef.current = performance.now() + 1500;
              onSelectRoomRef.current(clickedExhibitId);
            }
            return;
          }
          obj = obj.parent;
        }
      }
    };
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('click', handleClick);

    // ============================
    // 12. FPV IN-PLACE HEAD LOOK & SPATIAL PROXIMITY ANIMATION LOOP
    // ============================
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // --- A. WASD & ARROW KEYS FIRST-PERSON EYE-LEVEL WALKING CONTROL ---
      const walkSpeed = 16.0 * delta;
      const keys = keysPressedRef.current;
      const isWalking = !!(
        keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'] ||
        keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']
      );

      if (isWalking) {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0; // Lock movement horizontally on marble floor
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        const moveVector = new THREE.Vector3();

        if (keys['KeyW'] || keys['ArrowUp']) moveVector.addScaledVector(forward, walkSpeed);
        if (keys['KeyS'] || keys['ArrowDown']) moveVector.addScaledVector(forward, -walkSpeed);
        if (keys['KeyA'] || keys['ArrowLeft']) moveVector.addScaledVector(right, -walkSpeed);
        if (keys['KeyD'] || keys['ArrowRight']) moveVector.addScaledVector(right, walkSpeed);

        if (moveVector.lengthSq() > 0) {
          // Clamp camera position within exterior building walls [-80, 80] and [-90, 30]
          const newPos = camera.position.clone().add(moveVector);
          newPos.x = THREE.MathUtils.clamp(newPos.x, -80, 80);
          newPos.z = THREE.MathUtils.clamp(newPos.z, -90, 30);
          newPos.y = 2.5; // Fixed eye-level standing height!

          const deltaPos = newPos.clone().sub(camera.position);
          camera.position.copy(newPos);
          controls.target.add(deltaPos); // Shift look target in sync so head look never swings on a distant pole!
        }
      }

      // Keep OrbitControls target close to camera for in-place head look!
      const currentDir = new THREE.Vector3();
      camera.getWorldDirection(currentDir);
      controls.target.copy(camera.position).addScaledVector(currentDir, 0.2);

      // --- B. AUTOMATIC 3D SPATIAL PROXIMITY ROOM DETECTION ---
      // CRITICAL: Only evaluate spatial room changes when the user is ACTUALLY walking with WASD!
      const now = performance.now();
      if (isWalking && !isMacroRef.current && !isAnimatingRef.current && now > lastRoomChangeTimeRef.current) {
        let insideRoomId: string | null = null;

        if (currentViewRef.current.startsWith('statue-')) {
          const activeStatue = MUSEUM_STATUES.find((s) => s.id === currentViewRef.current);
          if (activeStatue) {
            const [sx, , sz] = activeStatue.position;
            // Retain statue view within 6.5m viewing perimeter
            if (Math.hypot(camera.position.x - sx, camera.position.z - sz) <= 6.5) {
              insideRoomId = activeStatue.id;
            }
          }
        }

        for (const ex of MUSEUM_EXHIBITS) {
          const [exX, , exZ] = ex.position;
          // Exhibit room interior check (|X - exX| <= 6.8 and Z in [exZ - 5.8, exZ + 6.2])
          if (Math.abs(camera.position.x - exX) <= 6.8 && camera.position.z >= exZ - 5.8 && camera.position.z <= exZ + 6.2) {
            insideRoomId = ex.id;
            break;
          }
        }

        if (insideRoomId) {
          if (insideRoomId !== currentViewRef.current) {
            lastRoomChangeTimeRef.current = now + 500;
            isSpatialUpdateRef.current = true;
            onSelectRoomRef.current(insideRoomId);
          }
        } else {
          // Corridor / Wing auto-detection
          let targetArea = 'atrium';
          if (camera.position.x < -20) targetArea = 'wing-classical';
          else if (camera.position.x > 20) targetArea = 'wing-modern';
          else if (camera.position.z < -10) targetArea = 'wing-historical';

          if (targetArea !== currentViewRef.current) {
            lastRoomChangeTimeRef.current = now + 500;
            isSpatialUpdateRef.current = true;
            onSelectRoomRef.current(targetArea);
          }
        }
      }

      // Rotate artifacts
      if (!isMacroRef.current) {
        rotatingArtifactsRef.current.forEach((art) => {
          art.rotation.y += delta * 0.4;
        });
      }

      // Animate doorway floating markers
      floatingMarkersRef.current.forEach((marker, idx) => {
        marker.rotation.y += delta * 1.5;
        marker.position.y = marker.userData.baseY + Math.sin(time * 0.003 + idx * 0.5) * 0.25;
      });

      // Animate statue floating holographic glyphs
      statueGlyphsRef.current.forEach((glyph, idx) => {
        glyph.rotation.y += delta * 1.2;
        glyph.position.y = (glyph.userData.baseY || 4.3) + Math.sin(time * 0.003 + idx * 1.2) * 0.15;
      });

      // Smooth camera lerp during button room selection jumps
      if (isAnimatingRef.current) {
        camera.position.lerp(targetCamPos.current, Math.min(delta * 7.0, 0.22));
        const lookDir = targetLookAt.current.clone().sub(camera.position).normalize();
        if (lookDir.lengthSq() > 0.001) {
          controls.target.copy(camera.position).addScaledVector(lookDir, 0.2);
          camera.lookAt(targetLookAt.current);
        }

        if (camera.position.distanceTo(targetCamPos.current) < 0.05) {
          isAnimatingRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
      animIdRef.current = requestAnimationFrame(animate);
    };

    animIdRef.current = requestAnimationFrame(animate);

    // ============================
    // 13. RESIZE HANDLER & CLEANUP
    // ============================
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('click', handleClick);
      if (container && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      initializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let built = false;
    const triggerBuild = () => {
      if (built) return;
      built = true;
      cleanup = buildScene();
    };

    // Load scanned bust, with graceful fallback timer for test environments
    loadScannedBust(triggerBuild);
    const fallbackTimer = setTimeout(triggerBuild, 300);

    return () => {
      clearTimeout(fallbackTimer);
      if (cleanup) cleanup();
    };
  }, [buildScene]);

  // Target camera positions for button room selection transitions
  useEffect(() => {
    isMacroRef.current = isMacro;
    currentViewRef.current = currentView;
    onSelectRoomRef.current = onSelectRoom;
    onCaseClickRef.current = onCaseClick;
    lastRoomChangeTimeRef.current = performance.now() + 1500; // 1.5s grace period on programmatic selection
    if (isSpatialUpdateRef.current) {
      isSpatialUpdateRef.current = false;
    } else {
      isAnimatingRef.current = true;
    }

    if (currentView === 'atrium') {
      targetCamPos.current.set(0, 2.5, 20);
      targetLookAt.current.set(0, 2.5, 10);
    } else if (currentView.startsWith('wing-')) {
      const wing = MUSEUM_WINGS.find((w) => w.id === currentView);
      if (wing) {
        targetCamPos.current.set(wing.cameraPosition[0], 2.5, wing.cameraPosition[2]);
        targetLookAt.current.set(wing.cameraTarget[0], 2.5, wing.cameraTarget[2]);
      }
    } else if (currentView.startsWith('statue-')) {
      const statue = MUSEUM_STATUES.find((s) => s.id === currentView);
      if (statue) {
        targetCamPos.current.set(...statue.cameraPosition);
        targetLookAt.current.set(...statue.cameraTarget);
      }
    } else {
      const exhibit = MUSEUM_EXHIBITS.find((e) => e.id === currentView);
      if (exhibit) {
        if (isMacro) {
          targetCamPos.current.set(...exhibit.macroPosition);
          targetLookAt.current.set(...exhibit.macroTarget);
          isAnimatingRef.current = true;
        } else {
          targetCamPos.current.set(exhibit.cameraPosition[0], 2.2, exhibit.cameraPosition[2]);
          targetLookAt.current.set(exhibit.cameraTarget[0], 1.6, exhibit.cameraTarget[2]);
        }
      }
    }
  }, [currentView, isMacro]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}

// ===================================================
// CACHED CANVAS TEXTURE GENERATORS
// ===================================================
function getPortalBannerTexture(title: string): THREE.CanvasTexture {
  if (textureCache.has(title)) return textureCache.get(title)!;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Deep obsidian bronze plate
    ctx.fillStyle = '#0c0e14';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#c59f3d';
    ctx.strokeRect(10, 10, 1004, 236);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e6c875';
    ctx.strokeRect(20, 20, 984, 216);

    ctx.fillStyle = '#d4af37';
    ctx.font = '600 24px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '6px';
    ctx.fillText('GALLERY PORTAL', 512, 68);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 52px Georgia, serif';
    ctx.letterSpacing = '3px';
    ctx.fillText(title, 512, 145);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 20px Georgia, serif';
    ctx.fillText('Permanent Cryptographic Exhibition', 512, 195);
  }
  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(title, texture);
  return texture;
}

function getSignboardTexture(title: string, timeline: string): THREE.CanvasTexture {
  const key = `sign_${title}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0c0e14';
    ctx.fillRect(0, 0, 512, 128);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#c59f3d';
    ctx.strokeRect(4, 4, 504, 120);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXHIBIT CHAMBER', 256, 28);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillText(title.toUpperCase(), 256, 68);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillText(timeline, 256, 102);
  }
  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

function getPlaqueTexture(title: string, subtitle: string): THREE.CanvasTexture {
  const key = `plaque_${title}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#12151c';
    ctx.fillRect(0, 0, 256, 160);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#c59f3d';
    ctx.strokeRect(4, 4, 248, 152);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText('ARCHIVAL ACCESSION', 16, 28);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText(title, 16, 62);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 12px Georgia, serif';
    ctx.fillText(subtitle.slice(0, 32), 16, 92);
  }
  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

function getStatuePlaqueTexture(name: string, lifespan: string, title: string): THREE.CanvasTexture {
  const key = `statue_plaque_${name}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#10131a';
    ctx.fillRect(0, 0, 512, 256);

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#c59f3d';
    ctx.strokeRect(8, 8, 496, 240);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e6c875';
    ctx.strokeRect(16, 16, 480, 224);

    ctx.fillStyle = '#d4af37';
    ctx.font = '600 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PIONEER OF SECRET WRITING', 256, 48);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillText(name.toUpperCase(), 256, 105);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'italic 20px Georgia, serif';
    ctx.fillText(lifespan, 256, 148);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '16px Georgia, serif';
    ctx.fillText(title, 256, 192);

    ctx.fillStyle = '#c59f3d';
    ctx.fillRect(166, 212, 180, 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

function getArchivalPortraitTexture(name: string, lifespan: string, legacy: string): THREE.CanvasTexture {
  const key = `portrait_${name}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Rich dark museum oil canvas background with vignette
    const bgGrad = ctx.createRadialGradient(256, 240, 40, 256, 240, 320);
    bgGrad.addColorStop(0, '#2c251e');
    bgGrad.addColorStop(0.7, '#161311');
    bgGrad.addColorStop(1, '#0a0908');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 640);

    // Ornate gilded picture frame border
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#b48a3c';
    ctx.strokeRect(7, 7, 498, 626);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f3d98d';
    ctx.strokeRect(18, 18, 476, 604);

    // Stylized silhouette / classical cameo portrait
    ctx.fillStyle = '#3a3229';
    ctx.beginPath();
    ctx.arc(256, 200, 110, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d8c29d';
    // Head silhouette
    ctx.beginPath();
    ctx.arc(256, 180, 52, 0, Math.PI * 2);
    ctx.fill();
    // Shoulder & bust drapery silhouette
    ctx.beginPath();
    ctx.ellipse(256, 280, 95, 65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soft warm glaze overlay
    ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.fillRect(20, 20, 472, 600);

    // Nameplate at bottom of frame
    ctx.fillStyle = '#14110e';
    ctx.fillRect(40, 470, 432, 120);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#c59f3d';
    ctx.strokeRect(42, 472, 428, 116);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 256, 512);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillText(lifespan, 256, 542);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px Georgia, serif';
    ctx.fillText(legacy, 256, 570);
  }
  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

function getTimelineFriezeTexture(): THREE.CanvasTexture {
  const key = 'timeline_frieze_texture';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0c0e14';
    ctx.fillRect(0, 0, 2048, 256);

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#c59f3d';
    ctx.strokeRect(8, 8, 2032, 240);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE CHRONICLES OF CRYPTOGRAPHY • 2,500 YEARS OF SECRET WRITING', 1024, 46);

    const epochs = [
      { year: '400 BC', name: 'Spartan Scytale', desc: 'Military Transposition' },
      { year: '50 BC', name: 'Caesar Cipher', desc: 'Monoalphabetic Shift' },
      { year: '850 AD', name: 'Al-Kindi (Baghdad)', desc: 'Frequency Analysis' },
      { year: '1586', name: 'Blaise de Vigenère', desc: 'Le Chiffre Indéchiffrable' },
      { year: '1940', name: 'Turing & Bletchley', desc: 'The Bombe & Enigma' },
      { year: '1948', name: 'Claude Shannon', desc: 'Mathematical Secrecy' },
      { year: '1976', name: 'Diffie & Hellman', desc: 'Public-Key Revolution' },
      { year: '2001', name: 'Rijndael (AES)', desc: 'Global Standard' },
    ];

    // Horizontal baseline
    ctx.strokeStyle = '#c59f3d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 130);
    ctx.lineTo(1988, 130);
    ctx.stroke();

    epochs.forEach((ep, i) => {
      const x = 110 + i * 260;
      // Gold node
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(x, 130, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 18px Georgia, serif';
      ctx.fillText(ep.year, x, 105);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 17px Georgia, serif';
      ctx.fillText(ep.name, x, 168);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 13px Georgia, serif';
      ctx.fillText(ep.desc, x, 192);
    });
  }
  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

function getTuringBombeTexture(): THREE.CanvasTexture {
  const key = 'turing_bombe_texture';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Weathered British wartime parchment
    ctx.fillStyle = '#f4ebd0';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 480, 480);

    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('TOP SECRET — ULTRA', 256, 56);

    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 18px Courier New, monospace';
    ctx.fillText('GOVERNMENT CODE & CYPHER SCHOOL', 256, 92);
    ctx.fillText('BLETCHLEY PARK • HUT 8', 256, 116);

    ctx.fillStyle = '#44403c';
    ctx.font = '14px Courier New, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('INTERCEPT REF: BP/1941/NAVAL-ENIGMA', 40, 160);
    ctx.fillText('CRIB: W E T T E R V O R H E R S A G E', 40, 190);
    ctx.fillText('CIPHERTEXT: Q M X K P Z W L Y N V B T R S', 40, 220);

    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 250, 432, 160);

    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE TURING-WELCHMAN BOMBE', 256, 280);

    ctx.fillStyle = '#1c1917';
    ctx.font = '13px Courier New, monospace';
    ctx.fillText('36 Concurrent Enigma Virtual Rotor Banks', 256, 310);
    ctx.fillText('Diagonal Board Electrical Contradiction Check', 256, 335);
    ctx.fillText('STOP REGISTERED: STELLUNG [B - K - F]', 256, 365);
    ctx.fillText('KEY DEDUCED • DISPATCH SENT TO ADMIRALTY', 256, 390);

    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillText('MOST SECRET • BURN BEFORE READING', 256, 460);
  }
  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

function getAlKindiScrollTexture(): THREE.CanvasTexture {
  const key = 'scroll_alkindi_texture';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#fde68a';
    for (let i = 0; i < 200; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 8, Math.random() * 8);
    }

    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 480, 480);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, 464, 464);

    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('رسالة في استخراج المعمى', 256, 60);

    ctx.font = 'bold 18px monospace';
    ctx.fillText('A MANUSCRIPT ON DECIPHERING', 256, 95);
    ctx.fillText('CRYPTOGRAPHIC MESSAGES (9th c.)', 256, 120);

    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 360);
    ctx.lineTo(460, 360);
    ctx.stroke();

    const sampleFrequencies = [
      { l: 'ا', h: 180 },
      { l: 'ل', h: 160 },
      { l: 'م', h: 120 },
      { l: 'و', h: 110 },
      { l: 'ي', h: 100 },
      { l: 'ن', h: 90 },
      { l: 'ر', h: 80 },
      { l: 'ت', h: 70 },
      { l: 'ب', h: 60 },
      { l: 'ه', h: 50 },
    ];

    sampleFrequencies.forEach((item, idx) => {
      const x = 65 + idx * 39;
      const barH = item.h;
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x, 360 - barH, 26, barH);
      ctx.strokeStyle = '#78350f';
      ctx.strokeRect(x, 360 - barH, 26, barH);

      ctx.fillStyle = '#451a03';
      ctx.font = 'bold 20px serif';
      ctx.fillText(item.l, x + 13, 390);
    });

    ctx.font = 'italic 16px serif';
    ctx.fillStyle = '#92400e';
    ctx.fillText('Letter Distribution Analysis • Monoalphabetic Decryption', 256, 440);
  }

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

function getShannonChalkboardTexture(): THREE.CanvasTexture {
  const key = 'shannon_chalkboard_texture';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 492, 492);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BELL TELEPHONE LABORATORIES (1949)', 256, 55);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('INFORMATION ENTROPY', 256, 110);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 36px serif';
    ctx.fillText('H(X) = - Σ p(x) log₂ p(x)', 256, 175);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('SHANNON’S PERFECT SECRECY THEOREM:', 256, 250);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px serif';
    ctx.fillText('H(M | C) = H(M)', 256, 305);

    ctx.fillStyle = '#a5f3fc';
    ctx.font = '18px monospace';
    ctx.fillText('P(M = m | C = c) = P(M = m)', 256, 350);

    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('ONE-TIME PAD VERNAM CIPHER:', 256, 410);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('C = M ⊕ K  (Unconditional Security)', 256, 450);
  }

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

function buildClassicalSocle(radius: number, height: number, material: THREE.Material): THREE.Mesh {
  const points = [
    new THREE.Vector2(radius, 0),
    new THREE.Vector2(radius, height * 0.15),
    new THREE.Vector2(radius * 0.88, height * 0.25),
    new THREE.Vector2(radius * 0.58, height * 0.55),
    new THREE.Vector2(radius * 0.52, height * 0.8),
    new THREE.Vector2(radius * 0.72, height * 0.92),
    new THREE.Vector2(radius * 0.78, height),
  ];
  const geo = new THREE.LatheGeometry(points, 48);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  return mesh;
}

function createPortraitHead(material: THREE.Material, scale: number = 0.088): THREE.Object3D {
  if (sharedBustGeometry) {
    const mesh = new THREE.Mesh(sharedBustGeometry, material);
    mesh.scale.setScalar(scale);
    mesh.rotation.y = 0;
    mesh.castShadow = true;
    mesh.userData = { isPortraitHead: true, material, scale };
    return mesh;
  }
  const group = new THREE.Group();
  group.userData = { isPortraitHead: true, material, scale };
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 32), material);
  head.scale.set(0.92, 1.08, 0.98);
  head.castShadow = true;
  group.add(head);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.11, 12), material);
  nose.position.set(0, -0.01, 0.19);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);
  return group;
}

function buildSculptedHermTorso(
  width: number,
  height: number,
  depth: number,
  material: THREE.Material
): THREE.Group {
  const torso = new THREE.Group();

  // Tapered chest
  const chest = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.44, width * 0.32, height, 32),
    material
  );
  chest.position.set(0, height / 2 + 0.34, 0);
  chest.scale.set(1.15, 1, (depth / width) * 1.5);
  chest.castShadow = true;
  torso.add(chest);

  // Left rounded anatomical shoulder
  const sL = new THREE.Mesh(new THREE.SphereGeometry(width * 0.22, 24, 24), material);
  sL.position.set(-width * 0.36, height * 0.84 + 0.34, 0);
  sL.scale.set(1.1, 0.82, (depth / width) * 1.6);
  sL.castShadow = true;
  torso.add(sL);

  // Right rounded anatomical shoulder
  const sR = new THREE.Mesh(new THREE.SphereGeometry(width * 0.22, 24, 24), material);
  sR.position.set(width * 0.36, height * 0.84 + 0.34, 0);
  sR.scale.set(1.1, 0.82, (depth / width) * 1.6);
  sR.castShadow = true;
  torso.add(sR);

  return torso;
}

function buildStatueMonument(
  statue: CryptographicStatue,
  group: THREE.Group,
  statueGlyphs: THREE.Object3D[]
) {
  // Rich Classical & Sculptural PBR Materials
  const carraraMarble = new THREE.MeshPhysicalMaterial({
    color: 0xfafaf9,
    roughness: 0.15,
    metalness: 0.05,
    clearcoat: 0.65,
    clearcoatRoughness: 0.12,
  });

  const belgianBlackGranite = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.22,
    metalness: 0.35,
  });

  const florentineBronze = new THREE.MeshPhysicalMaterial({
    color: 0x5a3e28,
    metalness: 0.88,
    roughness: 0.26,
    clearcoat: 0.5,
    clearcoatRoughness: 0.18,
  });

  const darkWoolBronze = new THREE.MeshPhysicalMaterial({
    color: 0x27272a,
    metalness: 0.72,
    roughness: 0.32,
    clearcoat: 0.35,
  });

  const gildedGold = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.14,
    clearcoat: 0.75,
    clearcoatRoughness: 0.08,
  });

  const antiqueGold = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.9,
    roughness: 0.2,
  });

  // ==========================================
  // 1. INLAID FLOOR MEDALLION & STARBURST
  // ==========================================
  const medallionRingGeo = new THREE.RingGeometry(2.3, 2.7, 64);
  const medallionRingMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.92,
    roughness: 0.15,
    side: THREE.DoubleSide,
  });
  const medallionRing = new THREE.Mesh(medallionRingGeo, medallionRingMat);
  medallionRing.rotation.x = -Math.PI / 2;
  medallionRing.position.set(0, 0.02, 0);
  group.add(medallionRing);

  const medallionInnerGeo = new THREE.CircleGeometry(2.28, 64);
  const medallionInnerMat = new THREE.MeshStandardMaterial({
    color: 0x09090b,
    roughness: 0.25,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });
  const medallionInner = new THREE.Mesh(medallionInnerGeo, medallionInnerMat);
  medallionInner.rotation.x = -Math.PI / 2;
  medallionInner.position.set(0, 0.018, 0);
  group.add(medallionInner);

  // 8 Inlaid Brass Starburst Inlay Lines
  for (let i = 0; i < 8; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.002, 2.1), medallionRingMat);
    spoke.rotation.y = (i * Math.PI) / 8;
    spoke.position.set(0, 0.019, 0);
    group.add(spoke);
  }

  // ==========================================
  // 2. ARCHITECTURAL FLUTED PEDESTAL
  // ==========================================
  const isTwin = statue.id === 'statue-diffie-hellman';
  const plinthWidth = isTwin ? 3.0 : 2.2;
  const plinthDepth = isTwin ? 1.8 : 2.2;

  // Stepped Belgian Black Marble Base Plinth
  const plinthGeo = new THREE.BoxGeometry(plinthWidth, 0.32, plinthDepth);
  const plinth = new THREE.Mesh(plinthGeo, belgianBlackGranite);
  plinth.position.set(0, 0.16, 0);
  plinth.receiveShadow = true;
  group.add(plinth);

  // Gilded Gold Sub-Base Molding
  const subBaseGeo = new THREE.BoxGeometry(plinthWidth - 0.2, 0.08, plinthDepth - 0.2);
  const subBase = new THREE.Mesh(subBaseGeo, gildedGold);
  subBase.position.set(0, 0.36, 0);
  group.add(subBase);

  // Fluted Grecian Column Shaft
  if (isTwin) {
    // Twin Monument Wide Marble Plinth with Classical Pilasters
    const colGeo = new THREE.BoxGeometry(2.55, 1.18, 1.35);
    const col = new THREE.Mesh(colGeo, carraraMarble);
    col.position.set(0, 0.99, 0);
    col.receiveShadow = true;
    group.add(col);

    // Front & Back Fluted Pilaster Reliefs
    [-1.05, -0.65, 0.65, 1.05].forEach((px) => {
      const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.18, 0.05), carraraMarble);
      pilaster.position.set(px, 0.99, 0.68);
      group.add(pilaster);
      const pilasterBack = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.18, 0.05), carraraMarble);
      pilasterBack.position.set(px, 0.99, -0.68);
      group.add(pilasterBack);
    });
  } else {
    // Single Monument Fluted Circular Column Shaft
    const colGeo = new THREE.CylinderGeometry(0.78, 0.86, 1.18, 32);
    const col = new THREE.Mesh(colGeo, carraraMarble);
    col.position.set(0, 0.99, 0);
    col.receiveShadow = true;
    group.add(col);

    // Base Torus Molding
    const baseTorus = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.055, 16, 48), carraraMarble);
    baseTorus.rotation.x = Math.PI / 2;
    baseTorus.position.set(0, 0.43, 0);
    group.add(baseTorus);

    // Neck Torus Molding
    const neckTorus = new THREE.Mesh(new THREE.TorusGeometry(0.79, 0.045, 16, 48), carraraMarble);
    neckTorus.rotation.x = Math.PI / 2;
    neckTorus.position.set(0, 1.55, 0);
    group.add(neckTorus);

    // 16 Vertical Fluted Relief Ribs
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const fx = Math.cos(angle) * 0.82;
      const fz = Math.sin(angle) * 0.82;
      const flute = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.14, 12), carraraMarble);
      flute.position.set(fx, 0.99, fz);
      group.add(flute);
    }
  }

  // Capital Cornice with Egg-and-Dart Gold Rim
  const capWidth = isTwin ? 2.75 : 1.95;
  const capDepth = isTwin ? 1.55 : 1.95;
  const capital = new THREE.Mesh(new THREE.BoxGeometry(capWidth, 0.16, capDepth), carraraMarble);
  capital.position.set(0, 1.66, 0);
  capital.receiveShadow = true;
  group.add(capital);

  const capGoldRim = new THREE.Mesh(new THREE.BoxGeometry(capWidth + 0.04, 0.03, capDepth + 0.04), gildedGold);
  capGoldRim.position.set(0, 1.73, 0);
  group.add(capGoldRim);

  // Heavy Cast Brass Plaque with Hex Rivets
  const plaqueTex = getStatuePlaqueTexture(statue.name, statue.lifespan, statue.title);
  const plaqueMat = new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.2, metalness: 0.5 });
  const plaqueWidth = isTwin ? 1.7 : 1.15;
  const plaqueZ = isTwin ? 0.71 : 0.85;
  const plaqueMesh = new THREE.Mesh(new THREE.BoxGeometry(plaqueWidth, 0.56, 0.04), plaqueMat);
  plaqueMesh.position.set(0, 0.99, plaqueZ);
  plaqueMesh.userData = { statueId: statue.id };
  group.add(plaqueMesh);

  // 4 Corner Gold Mounting Rivets
  const rivetGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.025, 8);
  const rxOffset = plaqueWidth / 2 - 0.06;
  const ryOffset = 0.22;
  [
    [-rxOffset, ryOffset],
    [rxOffset, ryOffset],
    [-rxOffset, -ryOffset],
    [rxOffset, -ryOffset],
  ].forEach(([rx, ry]) => {
    const rivet = new THREE.Mesh(rivetGeo, gildedGold);
    rivet.rotation.x = Math.PI / 2;
    rivet.position.set(rx, 0.99 + ry, plaqueZ + 0.025);
    group.add(rivet);
  });

  // Dedicated Soft Upward Point Light from Pedestal
  const upLight = new THREE.PointLight(0xffedd5, 1.4, 4.5);
  upLight.position.set(0, 1.8, 0.5);
  group.add(upLight);

  // Dedicated Overhead Warm Spotlight targeted at the portrait bust
  const spot = new THREE.SpotLight(0xfffbeb, 3.8);
  spot.position.set(0, 7.5, 2.8);
  spot.angle = 0.62;
  spot.penumbra = 0.5;
  const bustSpotTarget = new THREE.Object3D();
  bustSpotTarget.position.set(0, 2.5, 0);
  group.add(bustSpotTarget);
  spot.target = bustSpotTarget;
  group.add(spot);

  // ==========================================
  // 3. CLASSICAL MUSEUM STATUARY BUSTS & EXHIBITS
  // ==========================================
  const statuaryMarble = new THREE.MeshPhysicalMaterial({
    color: 0xdfdad2, // Natural warm antique Roman marble with subtle surface depth
    roughness: 0.42, // Honed satin stone finish (eliminating specular glare blowout)
    metalness: 0.02,
    clearcoat: 0.12,
    clearcoatRoughness: 0.35,
  });

  const museumBronze = new THREE.MeshStandardMaterial({
    color: 0x8a623c, // Rich Florentine bronze patina with warm highlights
    metalness: 0.78,
    roughness: 0.36,
  });

  const darkGranite = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.3,
    metalness: 0.25,
  });

  const mahoganyWood = new THREE.MeshStandardMaterial({
    color: 0x3f1d10,
    roughness: 0.4,
    metalness: 0.05,
  });

  const velvetCushionMat = new THREE.MeshStandardMaterial({
    color: 0x4c0519,
    roughness: 0.85,
    metalness: 0.05,
  });

  if (statue.id === 'statue-alkindi') {
    // ===================================================
    // AL-KINDI: THE FATHER OF CRYPTANALYSIS (CLASSICAL MARBLE BUST & LECTERN)
    // ===================================================
    const alkindiGroup = new THREE.Group();
    alkindiGroup.position.set(0, 1.74, 0);

    // 1. Classical Turned Carrara Marble Socle
    const socle = buildClassicalSocle(0.36, 0.38, statuaryMarble);
    socle.position.set(0, 0, 0);
    alkindiGroup.add(socle);

    // 2. Sculpted Draped Herm (Anatomically contoured chest and draped robes)
    const hermTorso = buildSculptedHermTorso(0.72, 0.48, 0.38, statuaryMarble);
    alkindiGroup.add(hermTorso);

    // Sculpted Diagonal Robe Fold across the chest
    const chestDrape = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.07, 16, 32, Math.PI * 0.8), statuaryMarble);
    chestDrape.position.set(-0.05, 0.64, 0.14);
    chestDrape.rotation.z = -Math.PI / 4;
    alkindiGroup.add(chestDrape);

    // Gilded Gold Embroidered Zari Lapel Border
    const zariLeft = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.48, 0.02), gildedGold);
    zariLeft.position.set(-0.16, 0.62, 0.2);
    zariLeft.rotation.z = 0.15;
    alkindiGroup.add(zariLeft);

    const zariRight = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.48, 0.02), gildedGold);
    zariRight.position.set(0.16, 0.62, 0.2);
    zariRight.rotation.z = -0.15;
    alkindiGroup.add(zariRight);

    // 3. Dignified Portrait Head of Al-Kindi (Anatomical 3D Scanned Sculpture)
    const head = createPortraitHead(statuaryMarble, 0.092);
    head.position.set(0, 1.14, 0.02);
    alkindiGroup.add(head);

    // Sculpted Arabian Scholar Beard (Neat tapered beard under chin)
    const chinBeard = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 16), statuaryMarble);
    chinBeard.position.set(0, 0.98, 0.12);
    chinBeard.rotation.x = -Math.PI / 10;
    alkindiGroup.add(chinBeard);

    const mustache = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 12, 24, Math.PI), statuaryMarble);
    mustache.position.set(0, 1.12, 0.21);
    mustache.rotation.z = Math.PI;
    alkindiGroup.add(mustache);

    // 4. Imperial Abbasid Turban (Crowning the head above the brow)
    const turban1 = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.055, 16, 32), statuaryMarble);
    turban1.rotation.x = Math.PI / 2;
    turban1.position.set(0, 1.32, 0.01);
    alkindiGroup.add(turban1);

    const turban2 = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.048, 16, 32), statuaryMarble);
    turban2.rotation.x = Math.PI / 2 + 0.18;
    turban2.position.set(0, 1.38, 0);
    alkindiGroup.add(turban2);

    const turbanDome = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 16), statuaryMarble);
    turbanDome.position.set(0, 1.42, 0);
    alkindiGroup.add(turbanDome);

    // Trailing Sash Tail (Tailasan) draped down over left shoulder
    const tailasan = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.44, 8, 16), statuaryMarble);
    tailasan.position.set(-0.24, 1.06, -0.04);
    tailasan.rotation.z = 0.2;
    alkindiGroup.add(tailasan);

    // 6. Historic Artifact: Carved Mahogany Manuscript Stand (Rihal) with Manuscript
    const lecternGroup = new THREE.Group();
    lecternGroup.position.set(-0.62, 0, 0.15);
    lecternGroup.rotation.y = Math.PI / 5;

    // Carved Mahogany Lectern Stand
    const rihalPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.72, 12), mahoganyWood);
    rihalPost.position.set(0, 0.36, 0);
    lecternGroup.add(rihalPost);

    const rihalBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.35), mahoganyWood);
    rihalBase.position.set(0, 0.03, 0);
    lecternGroup.add(rihalBase);

    const rihalDesk = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.03), mahoganyWood);
    rihalDesk.position.set(0, 0.74, 0);
    rihalDesk.rotation.x = -Math.PI / 4;
    lecternGroup.add(rihalDesk);

    // Unrolled Parchment Manuscript displaying Frequency Analysis Chart
    const scrollTex = getAlKindiScrollTexture();
    const parchmentMat = new THREE.MeshStandardMaterial({
      map: scrollTex,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });
    const manuscript = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.4), parchmentMat);
    manuscript.position.set(0, 0.75, 0.02);
    manuscript.rotation.x = -Math.PI / 4;
    lecternGroup.add(manuscript);

    // Hand-Carved Golden Qalam (Reed Pen) resting on the desk
    const qalam = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.005, 0.24, 8), gildedGold);
    qalam.position.set(0.18, 0.72, 0.1);
    qalam.rotation.z = Math.PI / 3;
    lecternGroup.add(qalam);

    alkindiGroup.add(lecternGroup);

    // 7. Floating Celestial Astrolabe Glyph with Frequency Bars
    const glyphGroup = new THREE.Group();
    glyphGroup.position.set(0, 4.35, 0);
    glyphGroup.userData = { baseY: 4.35 };

    const astrolabe = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.032, 16, 48), gildedGold);
    glyphGroup.add(astrolabe);

    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.022, 16, 32), antiqueGold);
    innerRing.rotation.y = Math.PI / 2;
    glyphGroup.add(innerRing);

    const barHeights = [0.15, 0.38, 0.25, 0.52, 0.32, 0.18];
    const barMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
    });
    barHeights.forEach((h, bIdx) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.06), barMat);
      bar.position.set(-0.25 + bIdx * 0.1, h / 2 - 0.15, 0);
      glyphGroup.add(bar);
    });

    group.add(glyphGroup);
    statueGlyphs.push(glyphGroup);

    group.add(alkindiGroup);

  } else if (statue.id === 'statue-turing') {
    // ===================================================
    // ALAN TURING: TITAN OF WARTIME CRYPTANALYSIS (BRONZE BUST, BOMBE DRUMS & ULTRA DISPATCH)
    // ===================================================
    const turingGroup = new THREE.Group();
    turingGroup.position.set(0, 1.74, 0);

    // 1. Turned Belgian Black Granite Socle with Gilded Collar
    const socle = buildClassicalSocle(0.35, 0.38, darkGranite);
    turingGroup.add(socle);

    const socleCollar = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.018, 12, 36), gildedGold);
    socleCollar.rotation.x = Math.PI / 2;
    socleCollar.position.set(0, 0.38, 0);
    turingGroup.add(socleCollar);

    // 2. Sculpted 1940s Bletchley Park Jacket Herm Torso in Florentine Bronze
    const hermTorso = buildSculptedHermTorso(0.7, 0.48, 0.37, museumBronze);
    turingGroup.add(hermTorso);

    // Tailored Jacket Lapels & Wartime Tie
    const lapelLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.03), darkWoolBronze);
    lapelLeft.position.set(-0.11, 0.62, 0.19);
    lapelLeft.rotation.z = -0.18;
    turingGroup.add(lapelLeft);

    const lapelRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.03), darkWoolBronze);
    lapelRight.position.set(0.11, 0.62, 0.19);
    lapelRight.rotation.z = 0.18;
    turingGroup.add(lapelRight);

    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.34, 0.025), gildedGold);
    tie.position.set(0, 0.58, 0.195);
    turingGroup.add(tie);

    // 3. Portrait Head of Alan Turing with Side-Parted Hair
    const head = createPortraitHead(museumBronze, 0.09);
    head.position.set(0, 1.14, 0.02);
    turingGroup.add(head);

    const hairSweep = new THREE.Mesh(
      new THREE.SphereGeometry(0.165, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
      darkWoolBronze
    );
    hairSweep.position.set(0.01, 1.24, -0.01);
    hairSweep.rotation.z = -0.12;
    turingGroup.add(hairSweep);

    // 4. Historic Relic Right: Miniature 3-Drum Turing-Welchman Bombe Cabinet
    const bombeGroup = new THREE.Group();
    bombeGroup.position.set(0.52, 0.18, 0.22);
    bombeGroup.rotation.y = -0.32;

    const bombeCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.22), mahoganyWood);
    bombeCabinet.castShadow = true;
    bombeGroup.add(bombeCabinet);

    const bombeFaceplate = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.31, 0.02), darkWoolBronze);
    bombeFaceplate.position.z = 0.11;
    bombeGroup.add(bombeFaceplate);

    const drumColors = [0x991b1b, 0xd97706, 0x065f46];
    drumColors.forEach((dColor, dIdx) => {
      const dx = -0.1 + dIdx * 0.1;
      const drumMat = new THREE.MeshStandardMaterial({ color: dColor, roughness: 0.35, metalness: 0.25 });
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.05, 24), drumMat);
      drum.rotation.x = Math.PI / 2;
      drum.position.set(dx, 0.05, 0.13);
      bombeGroup.add(drum);

      const commutator = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 16), gildedGold);
      commutator.rotation.x = Math.PI / 2;
      commutator.position.set(dx, 0.05, 0.14);
      bombeGroup.add(commutator);

      // Lower secondary bank drum
      const lowerDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.05, 24), drumMat);
      lowerDrum.rotation.x = Math.PI / 2;
      lowerDrum.position.set(dx, -0.06, 0.13);
      bombeGroup.add(lowerDrum);
    });
    turingGroup.add(bombeGroup);

    // 5. Historic Relic Left: "TOP SECRET — ULTRA" Bletchley Park Crib Dispatch on Brass Easel
    const dispatchGroup = new THREE.Group();
    dispatchGroup.position.set(-0.5, 0.2, 0.24);
    dispatchGroup.rotation.y = 0.35;
    dispatchGroup.rotation.x = -0.28;

    const dispatchBacking = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.02), gildedGold);
    dispatchGroup.add(dispatchBacking);

    const bombeTex = getTuringBombeTexture();
    const dispatchSheet = new THREE.Mesh(
      new THREE.PlaneGeometry(0.31, 0.35),
      new THREE.MeshStandardMaterial({ map: bombeTex, roughness: 0.55 })
    );
    dispatchSheet.position.z = 0.015;
    dispatchGroup.add(dispatchSheet);
    turingGroup.add(dispatchGroup);

    // 6. Perforated Wartime Teleprinter Tape Ribbon
    const punchTapeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.36, 0.04, 0.34),
      new THREE.Vector3(0.12, 0.08, 0.42),
      new THREE.Vector3(-0.15, 0.03, 0.38),
      new THREE.Vector3(-0.34, 0.05, 0.32),
    ]);
    const punchTape = new THREE.Mesh(
      new THREE.TubeGeometry(punchTapeCurve, 28, 0.022, 8, false),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.65 })
    );
    turingGroup.add(punchTape);

    // 7. Floating Bombe Electromechanical Rotor Contradiction Glyph
    const glyphGroup = new THREE.Group();
    glyphGroup.position.set(0, 4.35, 0);
    glyphGroup.userData = { baseY: 4.35 };

    [0.34, 0.24, 0.14].forEach((rRad, rIdx) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(rRad, 0.022, 16, 48),
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xb45309,
          emissiveIntensity: 0.75,
          metalness: 0.88,
          roughness: 0.15,
        })
      );
      ring.rotation.x = rIdx * 0.6;
      ring.rotation.y = rIdx * 0.8;
      glyphGroup.add(ring);
    });

    group.add(glyphGroup);
    statueGlyphs.push(glyphGroup);
    group.add(turingGroup);

  } else if (statue.id === 'statue-shannon') {
    // ===================================================
    // CLAUDE SHANNON: MATHEMATICAL CRYPTOGRAPHY (CLASSICAL BRONZE BUST & BELL LABS CHALKBOARD)
    // ===================================================
    const shannonGroup = new THREE.Group();
    shannonGroup.position.set(0, 1.74, 0);

    // 1. Classical Turned Dark Granite Socle with Gold Rim
    const socle = buildClassicalSocle(0.35, 0.38, darkGranite);
    socle.position.set(0, 0, 0);
    shannonGroup.add(socle);

    const goldSocleRim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.02, 16, 32), gildedGold);
    goldSocleRim.rotation.x = Math.PI / 2;
    goldSocleRim.position.set(0, 0.36, 0);
    shannonGroup.add(goldSocleRim);

    // 2. Tailored Academic Suit Herm (Anatomically contoured chest in Cast Museum Bronze)
    const suitTorso = buildSculptedHermTorso(0.7, 0.48, 0.36, museumBronze);
    shannonGroup.add(suitTorso);

    // Sculpted V-Lapels
    [-0.13, 0.13].forEach((lx) => {
      const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.03), museumBronze);
      lapel.position.set(lx, 0.65, 0.19);
      lapel.rotation.z = (lx > 0 ? -1 : 1) * 0.22;
      shannonGroup.add(lapel);
    });

    // White Shirt Collar & Silk Tie with Gold Tie Clip
    const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.02), statuaryMarble);
    shirt.position.set(0, 0.74, 0.19);
    shannonGroup.add(shirt);

    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.36, 0.025), museumBronze);
    tie.position.set(0, 0.58, 0.2);
    shannonGroup.add(tie);

    const tieClip = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.02, 0.035), gildedGold);
    tieClip.position.set(0, 0.64, 0.21);
    shannonGroup.add(tieClip);

    // 3. Thoughtful Portrait Head of Claude Shannon (Anatomical 3D Scanned Bronze)
    const head = createPortraitHead(museumBronze, 0.092);
    head.position.set(0, 1.14, 0.02);
    shannonGroup.add(head);

    // Gold Wireframe Scholarly Spectacles (Resting on eye bridge)
    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 1.25, 0.22);

    const rim1 = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.0035, 12, 24), gildedGold);
    rim1.position.set(-0.046, 0, 0);
    glassesGroup.add(rim1);

    const rim2 = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.0035, 12, 24), gildedGold);
    rim2.position.set(0.046, 0, 0);
    glassesGroup.add(rim2);

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.004, 0.004), gildedGold);
    glassesGroup.add(bridge);

    shannonGroup.add(glassesGroup);

    // 5. Historic Display: Bell Labs Drafting Easel & Framed Chalkboard
    const easelGroup = new THREE.Group();
    easelGroup.position.set(0.68, 0, 0.1);
    easelGroup.rotation.y = -Math.PI / 6;

    // Bronze Tripod Easel
    const legGeo = new THREE.CylinderGeometry(0.022, 0.022, 1.8, 12);
    const flLeg = new THREE.Mesh(legGeo, museumBronze);
    flLeg.position.set(-0.35, 0.9, 0.15);
    flLeg.rotation.z = 0.18;
    easelGroup.add(flLeg);

    const frLeg = new THREE.Mesh(legGeo, museumBronze);
    frLeg.position.set(0.35, 0.9, 0.15);
    frLeg.rotation.z = -0.18;
    easelGroup.add(frLeg);

    const bkLeg = new THREE.Mesh(legGeo, museumBronze);
    bkLeg.position.set(0, 0.9, -0.32);
    bkLeg.rotation.x = -0.25;
    easelGroup.add(bkLeg);

    // Framed Slate Blackboard with Shannon's Entropy Formula
    const boardTex = getShannonChalkboardTexture();
    const boardMat = new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.35 });
    const blackboard = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.74, 0.04), boardMat);
    blackboard.position.set(0, 1.25, 0.1);
    blackboard.rotation.x = -0.12;
    easelGroup.add(blackboard);

    const frameGold = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.78, 0.035), gildedGold);
    frameGold.position.set(0, 1.25, 0.08);
    frameGold.rotation.x = -0.12;
    easelGroup.add(frameGold);

    shannonGroup.add(easelGroup);

    // 6. Electromechanical Relay & Perforated Ticker-Tape Ribbon
    const relayBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.18), darkGranite);
    relayBox.position.set(-0.48, 0.06, 0.15);
    shannonGroup.add(relayBox);

    const tapeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.48, 0.14, 0.15),
      new THREE.Vector3(-0.42, 0.28, 0.28),
      new THREE.Vector3(-0.35, 0.18, 0.4),
      new THREE.Vector3(-0.25, 0.02, 0.35),
    ]);
    const tape = new THREE.Mesh(
      new THREE.TubeGeometry(tapeCurve, 24, 0.03, 8, false),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 })
    );
    shannonGroup.add(tape);

    // 7. Floating Celestial Double-Helix Entropy Spiral
    const glyphGroup = new THREE.Group();
    glyphGroup.position.set(0, 4.35, 0);
    glyphGroup.userData = { baseY: 4.35 };

    const spiral = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.26, 0.055, 96, 24, 2, 3),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.8,
      })
    );
    glyphGroup.add(spiral);

    for (let b = 0; b < 4; b++) {
      const bitAngle = (b * Math.PI) / 2;
      const bitMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 1.0,
        })
      );
      bitMesh.position.set(Math.cos(bitAngle) * 0.42, Math.sin(bitAngle * 2) * 0.15, Math.sin(bitAngle) * 0.42);
      glyphGroup.add(bitMesh);
    }

    group.add(glyphGroup);
    statueGlyphs.push(glyphGroup);

    group.add(shannonGroup);

  } else {
    // ===================================================
    // WHITFIELD DIFFIE & MARTIN HELLMAN (WITH RALPH MERKLE)
    // ===================================================
    const twinGroup = new THREE.Group();
    twinGroup.position.set(0, 1.74, 0);

    // ---------------------------------------------
    // LEFT BUST: WHITFIELD DIFFIE (X = -0.85)
    // ---------------------------------------------
    const diffieGroup = new THREE.Group();
    diffieGroup.position.set(-0.85, 0, 0);

    const diffieSocle = buildClassicalSocle(0.34, 0.38, statuaryMarble);
    diffieGroup.add(diffieSocle);

    const diffieTorso = buildSculptedHermTorso(0.68, 0.48, 0.36, museumBronze);
    diffieGroup.add(diffieTorso);

    const diffieHead = createPortraitHead(museumBronze, 0.088);
    diffieHead.position.set(0, 1.14, 0.02);
    diffieGroup.add(diffieHead);

    // Flowing Shoulder-Length Wavy Hair Locks
    const dHairL = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.14, 1.25, 0.02),
          new THREE.Vector3(-0.22, 1.05, 0.04),
          new THREE.Vector3(-0.18, 0.78, -0.02),
        ]),
        16,
        0.05,
        8,
        false
      ),
      museumBronze
    );
    diffieGroup.add(dHairL);

    const dHairR = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.14, 1.25, 0.02),
          new THREE.Vector3(0.22, 1.05, 0.04),
          new THREE.Vector3(0.18, 0.78, -0.02),
        ]),
        16,
        0.05,
        8,
        false
      ),
      museumBronze
    );
    diffieGroup.add(dHairR);

    // Velvet Cushion & Golden Private Key Scepter on Plinth
    const cushionL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.22), velvetCushionMat);
    cushionL.position.set(0, 0.03, 0.28);
    diffieGroup.add(cushionL);

    const privKeyShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 12), gildedGold);
    privKeyShaft.rotation.z = Math.PI / 2;
    privKeyShaft.position.set(0, 0.08, 0.28);
    diffieGroup.add(privKeyShaft);

    const privKeyBow = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 12, 24), gildedGold);
    privKeyBow.position.set(-0.16, 0.08, 0.28);
    diffieGroup.add(privKeyBow);

    twinGroup.add(diffieGroup);

    // ---------------------------------------------
    // RIGHT BUST: MARTIN HELLMAN (X = +0.85)
    // ---------------------------------------------
    const hellmanGroup = new THREE.Group();
    hellmanGroup.position.set(0.85, 0, 0);

    const hellmanSocle = buildClassicalSocle(0.34, 0.38, statuaryMarble);
    hellmanGroup.add(hellmanSocle);

    const hellmanTorso = buildSculptedHermTorso(0.68, 0.48, 0.36, museumBronze);
    hellmanGroup.add(hellmanTorso);

    const hTie = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.025), gildedGold);
    hTie.position.set(0, 0.58, 0.19);
    hellmanGroup.add(hTie);

    const hellmanHead = createPortraitHead(museumBronze, 0.088);
    hellmanHead.position.set(0, 1.14, 0.02);
    hellmanGroup.add(hellmanHead);

    // Velvet Cushion & Platinum Public Key Scepter on Plinth
    const cushionR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.22), velvetCushionMat);
    cushionR.position.set(0, 0.03, 0.28);
    hellmanGroup.add(cushionR);

    const pubKeyShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 12), statuaryMarble);
    pubKeyShaft.rotation.z = Math.PI / 2;
    pubKeyShaft.position.set(0, 0.08, 0.28);
    hellmanGroup.add(pubKeyShaft);

    const pubKeyBow = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 12, 24), statuaryMarble);
    pubKeyBow.position.set(0.16, 0.08, 0.28);
    hellmanGroup.add(pubKeyBow);

    twinGroup.add(hellmanGroup);

    // ---------------------------------------------
    // CENTER: RALPH MERKLE'S PUZZLE ALTAR
    // ---------------------------------------------
    const merkleGroup = new THREE.Group();
    merkleGroup.position.set(0, 0, 0.08);

    const merkleBase = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.14, 0.52), darkGranite);
    merkleBase.position.set(0, 0.07, 0);
    merkleGroup.add(merkleBase);

    const merkleShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.72, 24), darkGranite);
    merkleShaft.position.set(0, 0.5, 0);
    merkleGroup.add(merkleShaft);

    const merkleCap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.08, 24), gildedGold);
    merkleCap.position.set(0, 0.9, 0);
    merkleGroup.add(merkleCap);

    // Dial Ring with Degree Ticks
    const dialRing = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.24, 32), antiqueGold);
    dialRing.rotation.x = -Math.PI / 2;
    dialRing.position.set(0, 0.945, 0);
    merkleGroup.add(dialRing);

    // Ralph Merkle's Faceted Refractive Puzzle Polyhedron
    const puzzlePoly = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.2),
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.94,
        roughness: 0.04,
        ior: 1.6,
        clearcoat: 1.0,
      })
    );
    puzzlePoly.position.set(0, 1.2, 0);
    merkleGroup.add(puzzlePoly);

    // Glowing Golden Key Artifact Core with Internal Light
    const coreKey = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 1.2,
      })
    );
    coreKey.position.set(0, 1.2, 0);
    merkleGroup.add(coreKey);

    const coreLight = new THREE.PointLight(0xf59e0b, 2.8, 3.5);
    coreLight.position.set(0, 1.2, 0);
    merkleGroup.add(coreLight);

    // Orbiting Brass Gimbal Rings
    const gimbal1 = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.014, 12, 32), gildedGold);
    gimbal1.position.set(0, 1.2, 0);
    gimbal1.rotation.x = Math.PI / 4;
    merkleGroup.add(gimbal1);

    const gimbal2 = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.014, 12, 32), antiqueGold);
    gimbal2.position.set(0, 1.2, 0);
    gimbal2.rotation.y = Math.PI / 4;
    merkleGroup.add(gimbal2);

    twinGroup.add(merkleGroup);

    // ---------------------------------------------
    // TRIUMPHAL GOLDEN KEYHOLE ARCH OVERHEAD
    // ---------------------------------------------
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, -0.22);

    [-1.28, 1.28].forEach((ax) => {
      const archCol = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 2.0, 16), gildedGold);
      archCol.position.set(ax, 1.0, 0);
      archGroup.add(archCol);
      const colBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16), gildedGold);
      colBase.position.set(ax, 0.04, 0);
      archGroup.add(colBase);
      const colCap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.08, 16), gildedGold);
      colCap.position.set(ax, 1.96, 0);
      archGroup.add(colCap);
    });

    const archBar = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.05, 16, 48, Math.PI), gildedGold);
    archBar.position.set(0, 1.96, 0);
    archGroup.add(archBar);

    const medallion = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 24), gildedGold);
    medallion.rotation.x = Math.PI / 2;
    medallion.position.set(0, 3.24, 0);
    archGroup.add(medallion);

    twinGroup.add(archGroup);

    // ---------------------------------------------
    // FLOATING HOLOGRAM: INTERLOCKING PUBLIC/PRIVATE KEY RINGS
    // ---------------------------------------------
    const glyphGroup = new THREE.Group();
    glyphGroup.position.set(0, 4.35, 0);
    glyphGroup.userData = { baseY: 4.35 };

    const pubRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.04, 16, 32), gildedGold);
    glyphGroup.add(pubRing);

    const privRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.04, 16, 32),
      new THREE.MeshStandardMaterial({
        color: 0x9333ea,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.7,
      })
    );
    privRing.rotation.y = Math.PI / 2;
    glyphGroup.add(privRing);

    const lockBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.06), gildedGold);
    glyphGroup.add(lockBody);

    group.add(glyphGroup);
    statueGlyphs.push(glyphGroup);

    group.add(twinGroup);
  }

  // Ensure all descendants know their statueId for raycast clicks
  group.traverse((child) => {
    child.userData = { statueId: statue.id };
  });
}

// ===================================================
// MUSEUM-GRADE 3D CRYPTOGRAPHIC ARTIFACT BUILDER
// ===================================================
function buildHighQualityArtifact(id: string, group: THREE.Group) {
  const antiqueBrass = new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.88, roughness: 0.24 });
  const polishedGold = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.94, roughness: 0.14 });
  const agedBronze = new THREE.MeshStandardMaterial({ color: 0x7c4a1e, metalness: 0.82, roughness: 0.32 });
  const mahogany = new THREE.MeshStandardMaterial({ color: 0x3b180c, roughness: 0.34, metalness: 0.08 });
  const darkOak = new THREE.MeshStandardMaterial({ color: 0x2b170b, roughness: 0.42, metalness: 0.05 });
  const obsidian = new THREE.MeshStandardMaterial({ color: 0x0f131a, roughness: 0.16, metalness: 0.45 });
  const brushedSteel = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.2 });
  const gunmetal = new THREE.MeshStandardMaterial({ color: 0x27303f, metalness: 0.78, roughness: 0.32 });
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf5eedc, roughness: 0.28, metalness: 0.04 });

  switch (id) {
    case 'caesar': {
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
      break;
    }

    case 'affine': {
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
        new THREE.MeshPhysicalMaterial({
          color: 0xe0f2fe,
          transmission: 0.85,
          transparent: true,
          opacity: 0.45,
          roughness: 0.06,
          ior: 1.52,
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
      break;
    }

    case 'vigenere': {
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
      break;
    }

    case 'playfair': {
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
      break;
    }

    case 'polybius': {
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

        // Sculpted glowing flame cones (2 torches lit on left, 4 ember tongues on right)
        const flameCount = idx === 0 ? 2 : 3;
        for (let f = 0; f < flameCount; f++) {
          const offset = (f - (flameCount - 1) / 2) * 0.065;
          const flame = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.2, 12), flameCoreMat);
          flame.position.set(offset, 0.81 + (f % 2) * 0.03, 0);
          brazierGroup.add(flame);
        }
      });
      break;
    }

    case 'scytale': {
      // Spartan Ephor Scytale Baton (Turned dark cedarwood baton, bronze hoplite shield caps, helical parchment spiral, bronze tripod)
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
      break;
    }

    case 'enigma': {
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
      break;
    }

    case 'lorenz': {
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
      break;
    }

    case 'rsa': {
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
      break;
    }

    case 'aes': {
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

      const quartzByteMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.82,
        transparent: true,
        opacity: 0.72,
        roughness: 0.08,
        ior: 1.54,
        clearcoat: 1.0,
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
      break;
    }

    case 'sha256': {
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
      break;
    }
  }
}
