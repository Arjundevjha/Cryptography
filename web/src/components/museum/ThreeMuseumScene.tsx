'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MUSEUM_EXHIBITS, MUSEUM_WINGS, MUSEUM_STATUES, CryptographicStatue } from './museumData';
import {
  createMarbleTileTexture,
  createHerringboneParquetTexture,
  createVenetianPlasterTexture,
  createFlutedColumnTexture,
  createCofferedCeilingTexture,
  createContactShadowTexture,
} from './museumTextures';
import {
  createExhibitPlateTexture,
  createSideGalleryPanelTexture,
  createFoyerMuralTexture,
  createUniquePortraitTexture,
} from './scene/wallArtTextures';
import {
  decorateExhibitRoom,
  decorateFoyerWalls,
  getRoomAccentPalette,
} from './scene/wingArchitecture';
import { buildHighQualityArtifact } from './scene/exhibitRegistry';

interface ThreeMuseumSceneProps {
  currentView: string;
  onSelectRoom: (roomId: string) => void;
  mobileKeysRef?: React.MutableRefObject<Record<string, boolean>>;
}

const textureCache = new Map<string, THREE.CanvasTexture>();

type PioneerBustKey = 'alkindi' | 'turing' | 'shannon' | 'diffie' | 'hellman';

interface PioneerBustMaterials {
  skin: THREE.Material;
  hair: THREE.Material;
  turban?: THREE.Material;
  garment?: THREE.Material;
  accent: THREE.Material;
}

const pioneerBustCache = new Map<PioneerBustKey, Map<string, THREE.BufferGeometry>>();
const pioneerBustLoading = new Set<PioneerBustKey>();
const pioneerBustCallbacks = new Map<PioneerBustKey, Array<(parts: Map<string, THREE.BufferGeometry>) => void>>();

function loadPioneerBust(
  bustKey: PioneerBustKey,
  onReady?: (parts: Map<string, THREE.BufferGeometry>) => void
) {
  const cached = pioneerBustCache.get(bustKey);
  if (cached) {
    if (onReady) onReady(cached);
    return;
  }
  if (onReady) {
    const list = pioneerBustCallbacks.get(bustKey) ?? [];
    list.push(onReady);
    pioneerBustCallbacks.set(bustKey, list);
  }
  if (pioneerBustLoading.has(bustKey) || typeof window === 'undefined') return;
  pioneerBustLoading.add(bustKey);

  fetch(`/models/bust-${bustKey}.glb`)
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
          const parts = new Map<string, THREE.BufferGeometry>();
          gltf.scene.updateMatrixWorld(true);
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              const partName = (mesh.name || 'head').toLowerCase();
              const geo = mesh.geometry.clone();
              geo.applyMatrix4(mesh.matrixWorld);
              geo.computeVertexNormals();
              parts.set(partName, geo);
            }
          });
          pioneerBustCache.set(bustKey, parts);
          pioneerBustLoading.delete(bustKey);
          const cbs = pioneerBustCallbacks.get(bustKey) ?? [];
          cbs.forEach((cb) => cb(parts));
          pioneerBustCallbacks.delete(bustKey);
        },
        (err) => {
          console.error(`[loadPioneerBust:${bustKey}] Parse error:`, err);
          pioneerBustLoading.delete(bustKey);
        }
      );
    })
    .catch((err) => {
      console.warn(`[loadPioneerBust:${bustKey}] Could not load bust GLB, falling back to procedural sculpture:`, err);
      pioneerBustLoading.delete(bustKey);
    });
}

if (typeof window !== 'undefined') {
  (['alkindi', 'turing', 'shannon', 'diffie', 'hellman'] as PioneerBustKey[]).forEach((k) =>
    loadPioneerBust(k)
  );
}

export default function ThreeMuseumScene({
  currentView,
  onSelectRoom,
  mobileKeysRef,
}: ThreeMuseumSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animIdRef = useRef<number>(0);
  const rotatingArtifactsRef = useRef<THREE.Object3D[]>([]);
  const floatingMarkersRef = useRef<THREE.Object3D[]>([]);
  const activeExhibitSpotRef = useRef<THREE.SpotLight | null>(null);
  const activeExhibitWashRef = useRef<THREE.PointLight | null>(null);

  // Keyboard WASD state
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const lastRoomChangeTimeRef = useRef<number>(0);
  const isSpatialUpdateRef = useRef<boolean>(false);

  const targetCamPos = useRef(new THREE.Vector3(0, 2.5, 20));
  const targetLookAt = useRef(new THREE.Vector3(0, 2.5, 10));
  const isAnimatingRef = useRef(true);

  const currentViewRef = useRef(currentView);
  const onSelectRoomRef = useRef(onSelectRoom);
  const mobileKeysPropRef = useRef(mobileKeysRef);
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
    const gl = renderer.getContext();
    const debugRendererInfo = gl?.getExtension('WEBGL_debug_renderer_info');
    const unmaskedRenderer = debugRendererInfo
      ? String(gl.getParameter(debugRendererInfo.UNMASKED_RENDERER_WEBGL) || '')
      : '';
    const isSoftwareWebGL = /swiftshader|llvmpipe|software|mesa/i.test(unmaskedRenderer);
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareWebGL ? 0.5 : Math.min(window.devicePixelRatio, 1.0));
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setClearColor(0xe5dbcd);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === 2. GRAND CLASSICAL ARCHITECTURAL SCENE & ATMOSPHERIC FOG ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe5dbcd);
    scene.fog = new THREE.FogExp2(0xe5dbcd, 0.0042);
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
    // 5. GRAND CLASSICAL ARCHITECTURAL MATERIALS (PROCEDURALLY TEXTURED)
    // ============================
    const travertineWallTex = createVenetianPlasterTexture('#e7ddd0', '#d6c8b6', 6, 2, 19);
    const marbleFloorTex = createMarbleTileTexture(26, 28);
    const parquetRunnerTex = createHerringboneParquetTexture(2, 15);
    const flutedColTex = createFlutedColumnTexture();
    const cofferedCeilingTex = createCofferedCeilingTexture(18, 20);
    const contactShadowTex = createContactShadowTexture();
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.72,
    });

    const wallMat = new THREE.MeshStandardMaterial({ map: travertineWallTex, roughness: 0.72, metalness: 0.02 });
    const wainscotMat = new THREE.MeshStandardMaterial({ color: 0x422a1b, roughness: 0.44, metalness: 0.05 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.88, roughness: 0.22 });
    const woodBeamMat = new THREE.MeshStandardMaterial({ color: 0x3f2819, roughness: 0.48 });
    const marbleFloorMat = new THREE.MeshStandardMaterial({
      map: marbleFloorTex,
      roughness: 0.26,
      metalness: 0.05,
    });
    const oakRunnerMat = new THREE.MeshStandardMaterial({
      map: parquetRunnerTex,
      roughness: 0.38,
      metalness: 0.03,
    });
    const brassInlayMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.18 });
    const travertineMat = new THREE.MeshStandardMaterial({ map: flutedColTex, roughness: 0.52, metalness: 0.03 });
    const travertineTrimMat = new THREE.MeshStandardMaterial({ color: 0xe6dccb, roughness: 0.55, metalness: 0.03 });
    const wartimeBronzeMat = new THREE.MeshStandardMaterial({ color: 0x5a4533, metalness: 0.82, roughness: 0.32 });
    const titaniumMat = new THREE.MeshStandardMaterial({ color: 0x5a6878, metalness: 0.9, roughness: 0.2 });
    const matteBlackMat = new THREE.MeshStandardMaterial({ color: 0x221f1c, roughness: 0.6, metalness: 0.2 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x4a291a, roughness: 0.62, metalness: 0.05 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.16,
      roughness: 0.08,
      metalness: 0.15,
      depthWrite: false,
    });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.92, roughness: 0.16 });

    // ============================
    // 6. CALIBRATED GRAND MUSEUM LIGHTING (DAYLIGHT & WARM ARCHITECTURAL FILL)
    // ============================
    const hemiLight = new THREE.HemisphereLight(0xfffaf0, 0xc9b9a6, 1.05);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff4e0, 1.35);
    sunLight.position.set(25, 45, 28);
    sunLight.castShadow = false;
    scene.add(sunLight);

    // Dedicated Rotunda Portrait Key Light (Illuminates Founding Pioneers from the front)
    const rotundaKeyLight = new THREE.DirectionalLight(0xfff2db, 1.85);
    rotundaKeyLight.position.set(0, 15, 22);
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
    const lobbyChandelier = new THREE.PointLight(0xffeedb, 3.5, 42);
    lobbyChandelier.position.set(0, -1.2, 0);
    chandelierGroup.add(lobbyChandelier);
    scene.add(chandelierGroup);

    // ============================
    // 7. MUSEUM BUILDING ARCHITECTURE (BOTTICINO MARBLE, INLAYS, COFFERED CEILING)
    // ============================
    const floorGeo = new THREE.PlaneGeometry(180, 220);
    const floor = new THREE.Mesh(floorGeo, marbleFloorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -10;
    scene.add(floor);

    // French Honey Oak Herringbone Parquet Corridor Runner with Brass Border Rails
    const mainRunner = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 56), oakRunnerMat);
    mainRunner.rotation.x = -Math.PI / 2;
    mainRunner.position.set(0, 0.008, -14);
    scene.add(mainRunner);

    [-3.65, 3.65].forEach((bx) => {
      const runnerBorder = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.008, 56), brassInlayMat);
      runnerBorder.position.set(bx, 0.011, -14);
      scene.add(runnerBorder);
    });

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

    // Coffered Warm Classical Ceiling & Walnut Structural Cross-Beams
    const ceilingGeo = new THREE.PlaneGeometry(180, 220);
    const ceilingMat = new THREE.MeshStandardMaterial({ map: cofferedCeilingTex, roughness: 0.72 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.set(0, 12, -10);
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);

    // Grand Rotunda Frosted Oculus Skylight (Diffuses Warm Natural Daylight)
    const skylightGeo = new THREE.CircleGeometry(7.5, 48);
    const skylightMat = new THREE.MeshBasicMaterial({
      color: 0xfffaee,
      side: THREE.DoubleSide,
    });
    const rotundaSkylight = new THREE.Mesh(skylightGeo, skylightMat);
    rotundaSkylight.rotation.x = Math.PI / 2;
    rotundaSkylight.position.set(0, 11.95, 8);
    scene.add(rotundaSkylight);

    const skylightTrim = new THREE.Mesh(new THREE.RingGeometry(7.3, 7.8, 48), trimMat);
    skylightTrim.rotation.x = Math.PI / 2;
    skylightTrim.position.set(0, 11.94, 8);
    scene.add(skylightTrim);

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

    // Perimeter Travertine Limestone Walls with Warm Walnut Wainscoting & Brass Rails
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
    frontWall.position.set(0, 6, -104);
    scene.add(frontWall);

    // Continuous subtle wainscoting flush along the north perimeter wall
    const northWainscot = new THREE.Mesh(new THREE.BoxGeometry(170, 1.4, 0.12), wainscotMat);
    northWainscot.position.set(0, 0.7, -103.54);
    scene.add(northWainscot);
    const northRail = new THREE.Mesh(new THREE.BoxGeometry(170, 0.06, 0.16), trimMat);
    northRail.position.set(0, 1.42, -103.54);
    scene.add(northRail);

    const sideWallGeo = new THREE.BoxGeometry(0.8, 12, 140);
    const leftExteriorWall = new THREE.Mesh(sideWallGeo, wallMat);
    leftExteriorWall.position.set(-85, 6, -35);
    scene.add(leftExteriorWall);

    const rightExteriorWall = new THREE.Mesh(sideWallGeo, wallMat);
    rightExteriorWall.position.set(85, 6, -35);
    scene.add(rightExteriorWall);

    decorateFoyerWalls(scene, {
      materials: { goldMat, trimMat, wainscotMat, travertineTrimMat, crystalMat },
      murals: {
        leftTex: createFoyerMuralTexture('classical'),
        rightTex: createFoyerMuralTexture('modern'),
        classicalTex: createFoyerMuralTexture('evolution'),
        historicalTex: createFoyerMuralTexture('historical'),
        modernTex: createFoyerMuralTexture('modern'),
      },
    });

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
      new THREE.MeshStandardMaterial({ color: 0x4a3324, roughness: 0.35, side: THREE.DoubleSide })
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

      const basePlinth = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 1.5), oakRunnerMat);
      basePlinth.position.y = 0.225;
      pGroup.add(basePlinth);

      const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.07, 16, 36), goldMat);
      baseRing.rotation.x = Math.PI / 2;
      baseRing.position.y = 0.48;
      pGroup.add(baseRing);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 10.2, 32), travertineMat);
      shaft.position.y = 5.55;
      pGroup.add(shaft);

      const capRing = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.06, 16, 36), goldMat);
      capRing.rotation.x = Math.PI / 2;
      capRing.position.y = 10.65;
      pGroup.add(capRing);

      const abacus = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.35, 1.45), travertineTrimMat);
      abacus.position.y = 10.88;
      pGroup.add(abacus);

      const colShadow = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), contactShadowMat);
      colShadow.rotation.x = -Math.PI / 2;
      colShadow.position.y = 0.013;
      pGroup.add(colShadow);

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
        pos: [-12.2, 0, -1.8] as [number, number, number],
        rotY: Math.PI * 0.14,
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

      const portraitTex = createUniquePortraitTexture(pt.name, pt.lifespan, pt.legacy);
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
    MUSEUM_STATUES.forEach((statue) => {
      const statueGroup = new THREE.Group();
      statueGroup.position.set(...statue.position);
      statueGroup.rotation.y = statue.rotationY;
      statueGroup.userData = { statueId: statue.id };

      buildStatueMonument(statue, statueGroup);
      scene.add(statueGroup);
    });

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
        const pBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 1.4), oakRunnerMat);
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
    const wingWallMaterials: Record<'Classical' | 'Historical' | 'Modern', THREE.MeshStandardMaterial> = {
      Classical: new THREE.MeshStandardMaterial({
        map: createVenetianPlasterTexture('#c98967', '#b37250', 2, 1, 21),
        roughness: 0.72,
        metalness: 0.02,
      }),
      Historical: new THREE.MeshStandardMaterial({
        map: createVenetianPlasterTexture('#627d69', '#4e6655', 2, 1, 43),
        roughness: 0.72,
        metalness: 0.02,
      }),
      Modern: new THREE.MeshStandardMaterial({
        map: createVenetianPlasterTexture('#5b748a', '#485f74', 2, 1, 65),
        roughness: 0.68,
        metalness: 0.04,
      }),
    };
    const roomExteriorMat = wallMat;
    const roomRoofMat = new THREE.MeshStandardMaterial({ map: cofferedCeilingTex, roughness: 0.72 });
    const plinthMarbleMat = new THREE.MeshStandardMaterial({
      map: marbleFloorTex,
      color: 0xfaf6f0,
      roughness: 0.24,
      metalness: 0.05,
    });

    MUSEUM_EXHIBITS.forEach((exhibit, exIdx) => {
      const roomGroup = new THREE.Group();
      roomGroup.position.set(...exhibit.position);
      roomGroup.rotation.y = exhibit.rotationY;
      roomGroup.userData = { exhibitId: exhibit.id };
      const roomWallMat = wingWallMaterials[exhibit.category];
      const roomPalette = getRoomAccentPalette(exhibit.id, exhibit.category, exIdx);
      const velvetBedMat = new THREE.MeshStandardMaterial({
        color: roomPalette.velvetColor,
        roughness: 0.85,
        metalness: 0.02,
      });

      // Back Wall with Interior Walnut Wainscoting & Crown Molding
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(14, 8.5, 0.4), roomWallMat);
      backWall.position.set(0, 4.25, -6);
      roomGroup.add(backWall);

      const backWainscot = new THREE.Mesh(new THREE.BoxGeometry(13.6, 1.2, 0.08), wainscotMat);
      backWainscot.position.set(0, 0.6, -5.76);
      roomGroup.add(backWainscot);

      const backRail = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.05, 0.08), trimMat);
      backRail.position.set(0, 1.22, -5.76);
      roomGroup.add(backRail);

      // Warm Recessed Alcove Frame & Curatorial Archival Plate on Back Wall
      const alcoveFrame = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.8, 0.12), trimMat);
      alcoveFrame.position.set(0, 4.35, -5.78);
      roomGroup.add(alcoveFrame);

      const alcoveInner = new THREE.Mesh(new THREE.BoxGeometry(5.3, 4.5, 0.14), wainscotMat);
      alcoveInner.position.set(0, 4.35, -5.76);
      roomGroup.add(alcoveInner);

      const galleryArtTex = createExhibitPlateTexture(exhibit.id, exhibit.name, exhibit.category, exhibit.timeline);
      const galleryArtMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(4.8, 4.05),
        new THREE.MeshStandardMaterial({ map: galleryArtTex, roughness: 0.42 })
      );
      galleryArtMesh.position.set(0, 4.35, -5.67);
      roomGroup.add(galleryArtMesh);

      // Over-alcove Brass Picture Lamp
      const alcoveLampHood = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.8, 12), goldMat);
      alcoveLampHood.rotation.z = Math.PI / 2;
      alcoveLampHood.position.set(0, 6.85, -5.45);
      roomGroup.add(alcoveLampHood);

      // Side Walls with Interior Walnut Wainscoting
      const sideWallGeo = new THREE.BoxGeometry(0.4, 8.5, 12);
      const leftWall = new THREE.Mesh(sideWallGeo, roomWallMat);
      leftWall.position.set(-7, 4.25, 0);
      roomGroup.add(leftWall);

      const rightWall = new THREE.Mesh(sideWallGeo, roomWallMat);
      rightWall.position.set(7, 4.25, 0);
      roomGroup.add(rightWall);

      [-6.76, 6.76].forEach((wx) => {
        const sWainscot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 11.6), wainscotMat);
        sWainscot.position.set(wx, 0.6, 0);
        roomGroup.add(sWainscot);
        const sRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 11.6), trimMat);
        sRail.position.set(wx, 1.22, 0);
        roomGroup.add(sRail);
      });

      // Corner Travertine Pilasters & Crown Molding
      [
        [-6.85, -5.85],
        [6.85, -5.85],
        [-6.85, 5.85],
        [6.85, 5.85],
      ].forEach(([px, pz]) => {
        const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.55, 8.5, 0.55), travertineTrimMat);
        pilaster.position.set(px, 4.25, pz);
        roomGroup.add(pilaster);
      });

      const backCrown = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.28, 0.55), travertineTrimMat);
      backCrown.position.set(0, 8.36, -5.95);
      roomGroup.add(backCrown);

      // Front Wall with Textured Travertine Facade, Doorway Arch & Brass Pilaster Trim
      const frontPartGeo = new THREE.BoxGeometry(3.8, 8.5, 0.4);
      const frontLeft = new THREE.Mesh(frontPartGeo, roomExteriorMat);
      frontLeft.position.set(-5.1, 4.25, 6);
      roomGroup.add(frontLeft);

      const frontRight = new THREE.Mesh(frontPartGeo, roomExteriorMat);
      frontRight.position.set(5.1, 4.25, 6);
      roomGroup.add(frontRight);

      const header = new THREE.Mesh(new THREE.BoxGeometry(6.6, 2.2, 0.45), roomExteriorMat);
      header.position.set(0, 7.4, 6);
      roomGroup.add(header);

      // Front Doorway Brass Trim & Wainscot
      [-3.2, 3.2].forEach((dx) => {
        const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.18, 6.3, 0.52), trimMat);
        jamb.position.set(dx, 3.15, 6);
        roomGroup.add(jamb);
      });
      [-5.1, 5.1].forEach((fx) => {
        const fWainscot = new THREE.Mesh(new THREE.BoxGeometry(3.82, 1.2, 0.48), wainscotMat);
        fWainscot.position.set(fx, 0.6, 6);
        roomGroup.add(fWainscot);
      });

      // Coffered Ceiling Roof (bottom flush at y=8.50, zero overlap/overhang)
      const roomRoof = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.3, 12.0), roomRoofMat);
      roomRoof.position.set(0, 8.65, 0);
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

      // Soft Ground Contact Ring under Vitrine Pedestal (Lightweight contact shadow)
      const contactDecal = new THREE.Mesh(
        new THREE.RingGeometry(0.8, 1.45, 32),
        new THREE.MeshBasicMaterial({ color: 0x8a7f72, opacity: 0.35, transparent: true, side: THREE.DoubleSide })
      );
      contactDecal.rotation.x = -Math.PI / 2;
      contactDecal.position.set(0, 0.015, 0);
      roomGroup.add(contactDecal);

      // Museum-Grade Multi-Tier Botticino Marble Vitrine Plinth
      const toeKick = new THREE.Mesh(new THREE.CylinderGeometry(1.26, 1.3, 0.12, 48), goldMat);
      toeKick.position.set(0, 0.06, 0);
      roomGroup.add(toeKick);

      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.16, 1.24, 1.02, 48), plinthMarbleMat);
      pedestal.position.set(0, 0.63, 0);
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

      // Elevated Rotating Physical Cryptographic Artifact
      const artifactGroup = new THREE.Group();
      artifactGroup.position.set(0, 1.92, 0);
      artifactGroup.userData = { exhibitId: exhibit.id };
      buildHighQualityArtifact(exhibit.id, artifactGroup);
      roomGroup.add(artifactGroup);
      rotatingArtifacts.push(artifactGroup);

      decorateExhibitRoom(roomGroup, {
        exhibitId: exhibit.id,
        title: exhibit.name,
        subtitle: exhibit.subtitle,
        timeline: exhibit.timeline,
        category: exhibit.category,
        exIdx,
        sidePanelTex: createSideGalleryPanelTexture(
          exhibit.id,
          exhibit.name,
          exhibit.subtitle,
          exhibit.timeline,
          exhibit.category
        ),
        materials: {
          goldMat,
          trimMat,
          wainscotMat,
          travertineTrimMat,
          crystalMat,
        },
      });

      scene.add(roomGroup);
    });

    // Single shared dynamic Exhibit Pin-Spotlight + Warm Chamber Wash (avoids 22 per-room lights)
    const activeSpot = new THREE.SpotLight(0xfff6e5, 0, 24, 0.54, 0.5, 1.3);
    activeSpot.castShadow = false;
    scene.add(activeSpot);
    scene.add(activeSpot.target);
    activeExhibitSpotRef.current = activeSpot;

    const activeWash = new THREE.PointLight(0xffedd5, 0, 15, 1.4);
    scene.add(activeWash);
    activeExhibitWashRef.current = activeWash;

    rotatingArtifactsRef.current = rotatingArtifacts;
    floatingMarkersRef.current = floatingMarkers;

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
    let lastRenderTime = 0;

    const animate = (time: number) => {
      if (isSoftwareWebGL && time - lastRenderTime < 100) {
        animIdRef.current = requestAnimationFrame(animate);
        return;
      }
      lastRenderTime = time;
      const rawDelta = Math.max((time - lastTime) / 1000, 0.001);
      const delta = Math.min(rawDelta, 0.1);
      lastTime = time;

      // --- A. WASD, ARROW KEYS & MOBILE D-PAD FIRST-PERSON EYE-LEVEL WALKING CONTROL ---
      const walkSpeed = 16.0 * delta;
      const keys = keysPressedRef.current;
      const mobKeys = mobileKeysPropRef.current?.current;
      const moveForward = !!(keys['KeyW'] || keys['ArrowUp'] || mobKeys?.['KeyW']);
      const moveBackward = !!(keys['KeyS'] || keys['ArrowDown'] || mobKeys?.['KeyS']);
      const moveLeft = !!(keys['KeyA'] || keys['ArrowLeft'] || mobKeys?.['KeyA']);
      const moveRight = !!(keys['KeyD'] || keys['ArrowRight'] || mobKeys?.['KeyD']);
      const isWalking = moveForward || moveBackward || moveLeft || moveRight;

      if (mobKeys && (mobKeys['KeyW'] || mobKeys['KeyS'] || mobKeys['KeyA'] || mobKeys['KeyD'])) {
        isAnimatingRef.current = false;
      }

      if (isWalking) {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0; // Lock movement horizontally on marble floor
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        const moveVector = new THREE.Vector3();

        if (moveForward) moveVector.addScaledVector(forward, walkSpeed);
        if (moveBackward) moveVector.addScaledVector(forward, -walkSpeed);
        if (moveLeft) moveVector.addScaledVector(right, -walkSpeed);
        if (moveRight) moveVector.addScaledVector(right, walkSpeed);

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
      if (isWalking && !isAnimatingRef.current && now > lastRoomChangeTimeRef.current) {
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

      // Rotate artifacts: only spin the active exhibit or when viewing wing/rotunda overview
      const activeExhibitId = currentViewRef.current;
      rotatingArtifactsRef.current.forEach((art) => {
        if (
          art.userData?.exhibitId === activeExhibitId ||
          activeExhibitId.startsWith('wing-') ||
          activeExhibitId === 'atrium'
        ) {
          art.rotation.y += delta * 0.45;
        }
      });

      // Position single shared exhibit spotlight & wash on the active exhibit room or pioneer statue
      const activeEx = MUSEUM_EXHIBITS.find((e) => e.id === activeExhibitId);
      const activeStat = !activeEx ? MUSEUM_STATUES.find((s) => s.id === activeExhibitId) : undefined;
      if (activeExhibitSpotRef.current && activeExhibitWashRef.current) {
        if (activeEx) {
          activeExhibitSpotRef.current.position.set(activeEx.position[0], 8.1, activeEx.position[2] + 1.8);
          activeExhibitSpotRef.current.target.position.set(activeEx.position[0], 0.6, activeEx.position[2]);
          activeExhibitSpotRef.current.target.updateMatrixWorld();
          activeExhibitSpotRef.current.intensity = 7.5;
          activeExhibitWashRef.current.position.set(activeEx.position[0], 6.2, activeEx.position[2] + 1.5);
          activeExhibitWashRef.current.intensity = 2.4;
        } else if (activeStat) {
          const [sx, , sz] = activeStat.position;
          const frontX = sx + Math.sin(activeStat.rotationY) * 2.4;
          const frontZ = sz + Math.cos(activeStat.rotationY) * 2.4;
          activeExhibitSpotRef.current.position.set(frontX, 7.6, frontZ);
          activeExhibitSpotRef.current.target.position.set(sx, 2.2, sz);
          activeExhibitSpotRef.current.target.updateMatrixWorld();
          activeExhibitSpotRef.current.intensity = 8.0;
          activeExhibitWashRef.current.position.set(
            sx - Math.sin(activeStat.rotationY) * 1.4,
            4.2,
            sz - Math.cos(activeStat.rotationY) * 1.4
          );
          activeExhibitWashRef.current.intensity = 2.6;
        } else {
          activeExhibitSpotRef.current.intensity = 0;
          activeExhibitWashRef.current.intensity = 0;
        }
      }

      // Animate doorway floating markers
      floatingMarkersRef.current.forEach((marker, idx) => {
        marker.rotation.y += delta * 1.5;
        marker.position.y = marker.userData.baseY + Math.sin(time * 0.003 + idx * 0.5) * 0.25;
      });

      // Smooth frame-rate-independent camera lerp during button room selection jumps
      if (isAnimatingRef.current) {
        const lerpAlpha = 1 - Math.exp(-8.5 * Math.min(rawDelta, 0.35));
        camera.position.lerp(targetCamPos.current, lerpAlpha);
        const lookDir = targetLookAt.current.clone().sub(camera.position).normalize();
        if (lookDir.lengthSq() > 0.001) {
          controls.target.copy(camera.position).addScaledVector(lookDir, 0.2);
          camera.lookAt(targetLookAt.current);
        }

        if (camera.position.distanceTo(targetCamPos.current) < 0.05) {
          camera.position.copy(targetCamPos.current);
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
    const cleanup = buildScene();
    return () => {
      if (cleanup) cleanup();
    };
  }, [buildScene]);

  // Target camera positions for button room selection transitions
  useEffect(() => {
    currentViewRef.current = currentView;
    onSelectRoomRef.current = onSelectRoom;
    mobileKeysPropRef.current = mobileKeysRef;
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
        targetCamPos.current.set(exhibit.cameraPosition[0], 2.25, exhibit.cameraPosition[2]);
        targetLookAt.current.set(exhibit.cameraTarget[0], 1.88, exhibit.cameraTarget[2]);
      }
    }
  }, [currentView]);

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

function populatePioneerBustGroup(
  group: THREE.Group,
  parts: Map<string, THREE.BufferGeometry>,
  materials: PioneerBustMaterials,
  scale: number
) {
  while (group.children.length > 0) {
    group.remove(group.children[0]);
  }
  parts.forEach((geo, partName) => {
    let mat: THREE.Material = materials.skin;
    if (partName === 'hair' || partName === 'beard') {
      mat = materials.hair;
    } else if (partName === 'turban') {
      mat = materials.turban ?? materials.skin;
    } else if (partName === 'garment') {
      mat = materials.garment ?? materials.skin;
    } else if (partName === 'glasses' || partName === 'tie') {
      mat = materials.accent;
    }
    if (geo.attributes.color) {
      mat = new THREE.MeshStandardMaterial({
        color: 0xf0d6b8,
        vertexColors: true,
        roughness: 0.44,
        metalness: 0.28,
      });
    }
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.setScalar(scale);
    mesh.rotation.y = 0;
    if (group.userData?.statueId) {
      mesh.userData = { statueId: group.userData.statueId };
    }
    group.add(mesh);
  });
}

function createPioneerBust(
  bustKey: PioneerBustKey,
  materials: PioneerBustMaterials,
  scale: number = 0.09
): THREE.Group {
  const group = new THREE.Group();
  group.userData = { isPioneerBust: true, bustKey, materials, scale };
  const cached = pioneerBustCache.get(bustKey);
  if (cached) {
    populatePioneerBustGroup(group, cached, materials, scale);
    return group;
  }
  // Lightweight fallback silhouette until async GLB fetch completes
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 24), materials.skin);
  head.scale.set(0.92, 1.08, 0.98);
  group.add(head);
  loadPioneerBust(bustKey, (parts) => {
    populatePioneerBustGroup(group, parts, materials, scale);
  });
  return group;
}

function buildStatueMonument(
  statue: CryptographicStatue,
  group: THREE.Group
) {
  // Rich Classical & Sculptural PBR Materials (MeshStandardMaterial for high FPS)
  const carraraMarble = new THREE.MeshStandardMaterial({
    color: 0xfafaf9,
    roughness: 0.22,
    metalness: 0.05,
  });

  const belgianBlackGranite = new THREE.MeshStandardMaterial({
    color: 0x422c1e,
    roughness: 0.28,
    metalness: 0.15,
  });

  const florentineBronze = new THREE.MeshStandardMaterial({
    color: 0x5a3e28,
    metalness: 0.85,
    roughness: 0.28,
  });

  const darkWoolBronze = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    metalness: 0.72,
    roughness: 0.34,
  });

  const gildedGold = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.92,
    roughness: 0.16,
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
    color: 0x4a3324,
    roughness: 0.35,
    metalness: 0.15,
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

  // Warm Gilded Pedestal Halo Ring framing the Pioneer Bust
  const bustHaloMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    metalness: 0.9,
    roughness: 0.2,
  });
  const bustHaloRadius = isTwin ? 1.12 : 0.78;
  const bustHalo = new THREE.Mesh(new THREE.TorusGeometry(bustHaloRadius, 0.016, 12, 48), bustHaloMat);
  bustHalo.rotation.x = Math.PI / 2;
  bustHalo.position.set(0, 1.745, 0);
  group.add(bustHalo);

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

  // ==========================================
  // 3. CLASSICAL MUSEUM STATUARY BUSTS & EXHIBITS
  // ==========================================
  const statuaryMarble = new THREE.MeshStandardMaterial({
    color: 0xdfdad2, // Natural warm antique Roman marble with subtle surface depth
    roughness: 0.42, // Honed satin stone finish (eliminating specular glare blowout)
    metalness: 0.02,
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

    // 2. Bespoke Sculpted Portrait Bust of Al-Kindi (Abbasid Scholar Likeness, Turban, Beard & Jubba)
    const head = createPioneerBust(
      'alkindi',
      {
        skin: statuaryMarble,
        hair: statuaryMarble,
        turban: statuaryMarble,
        garment: statuaryMarble,
        accent: gildedGold,
      },
      1.15
    );
    head.position.set(0, 0.37, 0);
    alkindiGroup.add(head);

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

    // 2. Bespoke Sculpted Portrait Bust of Alan Turing (1951 Elliott & Fry Likeness + 1940s Blazer)
    const head = createPioneerBust(
      'turing',
      {
        skin: museumBronze,
        hair: darkWoolBronze,
        garment: darkWoolBronze,
        accent: gildedGold,
      },
      1.15
    );
    head.position.set(0, 0.37, 0);
    turingGroup.add(head);

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

    // 2. Bespoke Sculpted Portrait Bust of Claude Shannon (Bell Labs Likeness, Spectacles & Suit)
    const head = createPioneerBust(
      'shannon',
      {
        skin: museumBronze,
        hair: darkWoolBronze,
        garment: darkWoolBronze,
        accent: gildedGold,
      },
      1.15
    );
    head.position.set(0, 0.37, 0);
    shannonGroup.add(head);

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

    const diffieHead = createPioneerBust(
      'diffie',
      {
        skin: museumBronze,
        hair: darkWoolBronze,
        garment: darkWoolBronze,
        accent: gildedGold,
      },
      1.12
    );
    diffieHead.position.set(0, 0.37, 0);
    diffieGroup.add(diffieHead);

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

    const hellmanHead = createPioneerBust(
      'hellman',
      {
        skin: museumBronze,
        hair: darkWoolBronze,
        garment: darkWoolBronze,
        accent: gildedGold,
      },
      1.12
    );
    hellmanHead.position.set(0, 0.37, 0);
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
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.42,
        roughness: 0.08,
        metalness: 0.25,
        depthWrite: false,
      })
    );
    puzzlePoly.position.set(0, 1.2, 0);
    merkleGroup.add(puzzlePoly);

    // Glowing Golden Key Artifact Core
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

    group.add(twinGroup);
  }

  // Ensure all descendants know their statueId for raycast clicks
  group.traverse((child) => {
    child.userData = { statueId: statue.id };
  });
}
