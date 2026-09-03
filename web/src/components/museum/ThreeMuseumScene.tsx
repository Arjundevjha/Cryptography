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

    // === 2. BRIGHT ARCHITECTURAL SCENE & FOG ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    scene.fog = new THREE.FogExp2(0x1e293b, 0.003);
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
    // 5. ELEGANT BRIGHT ARCHITECTURAL MATERIALS
    // ============================
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.5 });
    const woodBeamMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.4 });
    const marbleFloorMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.12, metalness: 0.1 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      transparent: true,
      opacity: 0.3,
      roughness: 0.04,
      ior: 1.5,
    });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.15 });

    // ============================
    // 6. VIBRANT MULTI-ZONE MUSEUM LIGHTING
    // ============================
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcbd5e1, 2.2);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 3.2);
    sunLight.position.set(30, 45, 30);
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

    const lobbyChandelier = new THREE.PointLight(0xfffbeb, 6.0, 60);
    lobbyChandelier.position.set(0, 10, 10);
    scene.add(lobbyChandelier);

    // Dedicated Rotunda Portrait Key Light (Illuminates Founding Fathers statues from the front)
    const rotundaKeyLight = new THREE.DirectionalLight(0xfffbeb, 2.6);
    rotundaKeyLight.position.set(0, 14, 24);
    rotundaKeyLight.target.position.set(0, 2.5, 6);
    scene.add(rotundaKeyLight);
    scene.add(rotundaKeyLight.target);

    const classicalLight = new THREE.PointLight(0x38bdf8, 6.0, 70);
    classicalLight.position.set(-45, 10, -40);
    scene.add(classicalLight);

    const historicalLight = new THREE.PointLight(0xf59e0b, 6.0, 70);
    historicalLight.position.set(0, 10, -45);
    scene.add(historicalLight);

    const modernLight = new THREE.PointLight(0xc084fc, 6.0, 70);
    modernLight.position.set(45, 10, -40);
    scene.add(modernLight);

    // ============================
    // 7. ACTUAL MUSEUM BUILDING ARCHITECTURE
    // ============================
    const floorGeo = new THREE.PlaneGeometry(180, 200);
    const floor = new THREE.Mesh(floorGeo, marbleFloorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(180, 90, 0x94a3b8, 0xcbd5e1);
    (gridHelper.material as THREE.Material).opacity = 0.4;
    (gridHelper.material as THREE.Material).transparent = true;
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Roof & Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(180, 200);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = 12;
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);

    for (let x = -80; x <= 80; x += 20) {
      const beamGeo = new THREE.BoxGeometry(0.6, 0.8, 200);
      const beam = new THREE.Mesh(beamGeo, woodBeamMat);
      beam.position.set(x, 11.6, -10);
      scene.add(beam);
    }
    for (let z = -90; z <= 30; z += 20) {
      const crossBeamGeo = new THREE.BoxGeometry(160, 0.8, 0.6);
      const crossBeam = new THREE.Mesh(crossBeamGeo, woodBeamMat);
      crossBeam.position.set(0, 11.6, z);
      scene.add(crossBeam);
    }

    // Perimeter Building Walls
    const rearWallGeo = new THREE.BoxGeometry(180, 12, 0.8);
    const rearWall = new THREE.Mesh(rearWallGeo, wallMat);
    rearWall.position.set(0, 6, 32);
    scene.add(rearWall);

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

    // ============================
    // 8. GRAND ENTRANCE LOBBY FOYER
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

    // Inlaid Brass Floor Medallion in Entrance Foyer
    const medallionRingGeo = new THREE.RingGeometry(2.5, 3.2, 64);
    const medallionRingMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.15, side: THREE.DoubleSide });
    const medallionRing = new THREE.Mesh(medallionRingGeo, medallionRingMat);
    medallionRing.rotation.x = -Math.PI / 2;
    medallionRing.position.set(0, 0.02, 16);
    scene.add(medallionRing);

    const medallionInnerGeo = new THREE.CircleGeometry(2.4, 64);
    const medallionInnerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, side: THREE.DoubleSide });
    const medallionInner = new THREE.Mesh(medallionInnerGeo, medallionInnerMat);
    medallionInner.rotation.x = -Math.PI / 2;
    medallionInner.position.set(0, 0.018, 16);
    scene.add(medallionInner);

    // ============================
    // 8.5. GRAND ROTUNDA OF CRYPTOGRAPHIC PIONEERS (FOUNDING FATHERS)
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
    // 9. GRAND WING PORTALS & BANNERS
    // ============================
    interface WingPortalData {
      id: string;
      title: string;
      pos: [number, number, number];
      rotY: number;
    }

    const wingPortalsData: WingPortalData[] = [
      { id: 'wing-classical', title: 'CLASSICAL CIPHERS WING', pos: [-30, 0, 0], rotY: Math.PI * 0.25 },
      { id: 'wing-historical', title: 'HISTORICAL SYSTEMS WING', pos: [0, 0, -12], rotY: 0 },
      { id: 'wing-modern', title: 'MODERN CRYPTOGRAPHY WING', pos: [30, 0, 0], rotY: -Math.PI * 0.25 },
    ];

    wingPortalsData.forEach((portal) => {
      const portalGroup = new THREE.Group();
      portalGroup.position.set(...portal.pos);
      portalGroup.rotation.y = portal.rotY;

      const pillarGeo = new THREE.CylinderGeometry(0.5, 0.55, 11, 32);
      const leftPillar = new THREE.Mesh(pillarGeo, trimMat);
      leftPillar.position.set(-4.5, 5.5, 0);
      portalGroup.add(leftPillar);

      const rightPillar = new THREE.Mesh(pillarGeo, trimMat);
      rightPillar.position.set(4.5, 5.5, 0);
      portalGroup.add(rightPillar);

      const beamGeo = new THREE.BoxGeometry(10, 1.4, 1.2);
      const beam = new THREE.Mesh(beamGeo, trimMat);
      beam.position.set(0, 10.5, 0);
      portalGroup.add(beam);

      const signTex = getPortalBannerTexture(portal.title);
      const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.2, metalness: 0.1 });
      const signMesh = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.6, 0.25), signMat);
      signMesh.position.set(0, 9.0, 0);
      signMesh.userData = { wingId: portal.id };
      portalGroup.add(signMesh);

      scene.add(portalGroup);
    });

    // ============================
    // 10. ENCLOSED ROOM GALLERIES & THRESHOLDS
    // ============================
    const rotatingArtifacts: THREE.Object3D[] = [];
    const floatingMarkers: THREE.Object3D[] = [];

    MUSEUM_EXHIBITS.forEach((exhibit, exIdx) => {
      const roomGroup = new THREE.Group();
      roomGroup.position.set(...exhibit.position);
      roomGroup.rotation.y = exhibit.rotationY;
      roomGroup.userData = { exhibitId: exhibit.id };

      const roomWallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
      const roomRoofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });

      // Back Wall
      const backWallGeo = new THREE.BoxGeometry(14, 8.5, 0.4);
      const backWall = new THREE.Mesh(backWallGeo, roomWallMat);
      backWall.position.set(0, 4.25, -6);
      backWall.receiveShadow = true;
      roomGroup.add(backWall);

      // Side Walls
      const sideWallGeo = new THREE.BoxGeometry(0.4, 8.5, 12);
      const leftWall = new THREE.Mesh(sideWallGeo, roomWallMat);
      leftWall.position.set(-7, 4.25, 0);
      leftWall.receiveShadow = true;
      roomGroup.add(leftWall);

      const rightWall = new THREE.Mesh(sideWallGeo, roomWallMat);
      rightWall.position.set(7, 4.25, 0);
      rightWall.receiveShadow = true;
      roomGroup.add(rightWall);

      // Front Wall with Doorway Arch
      const frontPartGeo = new THREE.BoxGeometry(3.8, 8.5, 0.4);
      const frontLeft = new THREE.Mesh(frontPartGeo, roomWallMat);
      frontLeft.position.set(-5.1, 4.25, 6);
      roomGroup.add(frontLeft);

      const frontRight = new THREE.Mesh(frontPartGeo, roomWallMat);
      frontRight.position.set(5.1, 4.25, 6);
      roomGroup.add(frontRight);

      // Header Beam
      const headerGeo = new THREE.BoxGeometry(6.6, 2.2, 0.45);
      const header = new THREE.Mesh(headerGeo, roomWallMat);
      header.position.set(0, 7.4, 6);
      roomGroup.add(header);

      // Roof Ceiling Beam
      const roomRoofGeo = new THREE.BoxGeometry(14.4, 0.3, 12.4);
      const roomRoof = new THREE.Mesh(roomRoofGeo, roomRoofMat);
      roomRoof.position.set(0, 8.6, 0);
      roomGroup.add(roomRoof);

      // Overhead 3D Signboard
      const roomSignTex = getSignboardTexture(exhibit.name, exhibit.timeline);
      const signBoardMat = new THREE.MeshStandardMaterial({ map: roomSignTex, roughness: 0.15, metalness: 0.2 });
      const signBoardGeo = new THREE.BoxGeometry(6.2, 1.4, 0.3);
      const signBoard = new THREE.Mesh(signBoardGeo, signBoardMat);
      signBoard.position.set(0, 7.6, 6.3);
      roomGroup.add(signBoard);

      // Animated Waypoint Gem over doorway threshold
      const waymarkerGeo = new THREE.OctahedronGeometry(0.45, 0);
      const waymarkerMat = new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0xb45309, emissiveIntensity: 0.8 });
      const waymarker = new THREE.Mesh(waymarkerGeo, waymarkerMat);
      waymarker.position.set(0, 9.6, 6.3);
      waymarker.userData = { baseY: 9.6, exIdx };
      roomGroup.add(waymarker);
      floatingMarkers.push(waymarker);

      // Threshold Light Strip
      const thresholdStripGeo = new THREE.BoxGeometry(6.0, 0.05, 0.8);
      const thresholdMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
      const thresholdStrip = new THREE.Mesh(thresholdStripGeo, thresholdMat);
      thresholdStrip.position.set(0, 0.02, 6.3);
      roomGroup.add(thresholdStrip);

      // Curatorial Plaque
      const plaqueTex = getPlaqueTexture(exhibit.name, exhibit.subtitle);
      const plaqueMat = new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.3 });
      const plaqueMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.0, 3.2), plaqueMat);
      plaqueMesh.position.set(-6.8, 3.8, -1);
      roomGroup.add(plaqueMesh);

      // Marble Pedestal
      const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.35, 1.2, 48);
      const pedestalMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.08, metalness: 0.05, clearcoat: 0.4 });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.set(0, 0.6, 0);
      pedestal.receiveShadow = true;
      roomGroup.add(pedestal);

      // Glass Case
      const glassGeo = new THREE.CylinderGeometry(1.1, 1.1, 2.2, 48);
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(0, 2.3, 0);
      glass.userData = { isDisplayCase: true, exhibitId: exhibit.id };
      roomGroup.add(glass);

      // Exhibit Spotlight
      const spot = new THREE.SpotLight(0xfffbeb, 8.0);
      spot.position.set(0, 7.8, 1);
      spot.angle = 0.6;
      spot.penumbra = 0.3;
      spot.castShadow = false;
      spot.target = pedestal;
      roomGroup.add(spot);
      roomGroup.add(spot.target);

      // Artifact
      const artifactGroup = new THREE.Group();
      artifactGroup.position.set(0, 1.8, 0);
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
        if (obj.userData?.isPortraitHead && ((obj as any).isGroup || obj instanceof THREE.Group || obj.type === 'Group')) {
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
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#d97706';
    ctx.strokeRect(12, 12, 1000, 232);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MUSEUM GALLERY PORTAL', 512, 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(title, 512, 155);
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
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 128);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#d97706';
    ctx.strokeRect(6, 6, 500, 116);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EXHIBIT ROOM', 256, 34);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(title.toUpperCase(), 256, 75);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px monospace';
    ctx.fillText(timeline, 256, 106);
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
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 160);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.strokeRect(4, 4, 248, 152);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('CURATORIAL PLAQUE', 16, 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(title, 16, 65);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px sans-serif';
    ctx.fillText(subtitle.slice(0, 30), 16, 95);
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
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, 512, 256);

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#d97706';
    ctx.strokeRect(8, 8, 496, 240);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f59e0b';
    ctx.strokeRect(16, 16, 480, 224);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FOUNDING FATHER OF CRYPTOGRAPHY', 256, 48);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(name.toUpperCase(), 256, 108);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(lifespan, 256, 150);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic 18px sans-serif';
    ctx.fillText(title, 256, 195);

    ctx.fillStyle = '#d97706';
    ctx.fillRect(156, 215, 200, 3);
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
// HIGH-QUALITY ARTIFACT BUILDER (Preserved)
// ===================================================
function buildHighQualityArtifact(id: string, group: THREE.Group) {
  switch (id) {
    case 'caesar': {
      group.rotation.x = Math.PI / 5;
      const outerDiskGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.05, 64);
      const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x92400e, metalness: 0.85, roughness: 0.25 });
      const outerDisk = new THREE.Mesh(outerDiskGeo, bronzeMat);
      outerDisk.castShadow = true;
      group.add(outerDisk);

      const outerNotchGeo = new THREE.BoxGeometry(0.025, 0.06, 0.035);
      const notchMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.9, roughness: 0.1 });
      for (let i = 0; i < 26; i++) {
        const angle = (i / 26) * Math.PI * 2;
        const notch = new THREE.Mesh(outerNotchGeo, notchMat);
        notch.position.set(Math.cos(angle) * 0.58, 0.01, Math.sin(angle) * 0.58);
        notch.rotation.y = -angle;
        group.add(notch);
      }

      const innerDiskGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.06, 64);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.15 });
      const innerDisk = new THREE.Mesh(innerDiskGeo, goldMat);
      innerDisk.position.y = 0.02;
      innerDisk.castShadow = true;
      group.add(innerDisk);

      const pinGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 32);
      const pin = new THREE.Mesh(pinGeo, notchMat);
      pin.position.y = 0.06;
      group.add(pin);
      break;
    }
    case 'affine': {
      group.rotation.x = Math.PI / 6;
      const gridGeo = new THREE.BoxGeometry(1.2, 0.06, 0.7);
      const darkSlateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 });
      const gridBase = new THREE.Mesh(gridGeo, darkSlateMat);
      gridBase.castShadow = true;
      group.add(gridBase);

      const barGeo = new THREE.BoxGeometry(0.03, 0.08, 0.65);
      const goldLineMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
      const diagonalBar = new THREE.Mesh(barGeo, goldLineMat);
      diagonalBar.rotation.y = Math.PI / 4;
      diagonalBar.position.y = 0.04;
      group.add(diagonalBar);
      break;
    }
    case 'vigenere': {
      group.rotation.x = Math.PI / 5;
      const squareGeo = new THREE.BoxGeometry(1.1, 0.08, 1.1);
      const marbleMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, clearcoat: 0.5 });
      const square = new THREE.Mesh(squareGeo, marbleMat);
      square.castShadow = true;
      group.add(square);

      const cellGeo = new THREE.BoxGeometry(0.06, 0.09, 0.06);
      const cyanMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5 });
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const cell = new THREE.Mesh(cellGeo, cyanMat);
          cell.position.set(-0.4 + c * 0.2, 0.01, -0.4 + r * 0.2);
          group.add(cell);
        }
      }
      break;
    }
    case 'playfair': {
      group.rotation.x = Math.PI / 5;
      const baseGeo = new THREE.BoxGeometry(1.2, 0.06, 1.2);
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
      const base = new THREE.Mesh(baseGeo, darkMat);
      base.castShadow = true;
      group.add(base);

      const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const amberMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 });
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const sphere = new THREE.Mesh(sphereGeo, amberMat);
          sphere.position.set(-0.4 + j * 0.2, 0.08, -0.4 + i * 0.2);
          group.add(sphere);
        }
      }
      break;
    }
    case 'polybius': {
      group.rotation.x = Math.PI / 5;
      const boardGeo = new THREE.BoxGeometry(1.2, 0.06, 1.2);
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
      const board = new THREE.Mesh(boardGeo, stoneMat);
      board.castShadow = true;
      group.add(board);
      break;
    }
    case 'scytale': {
      group.rotation.z = Math.PI / 2;
      const cylinderGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.4, 32);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
      const cylinder = new THREE.Mesh(cylinderGeo, woodMat);
      cylinder.castShadow = true;
      group.add(cylinder);

      const stripGeo = new THREE.CylinderGeometry(0.31, 0.31, 1.2, 32);
      const parchmentMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 });
      const strip = new THREE.Mesh(stripGeo, parchmentMat);
      group.add(strip);
      break;
    }
    case 'enigma': {
      const boxGeo = new THREE.BoxGeometry(1.2, 0.5, 1.0);
      const mahoganyMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.3 });
      const box = new THREE.Mesh(boxGeo, mahoganyMat);
      box.castShadow = true;
      group.add(box);

      const rotorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 32);
      const silverMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.1 });
      for (let r = 0; r < 3; r++) {
        const rotor = new THREE.Mesh(rotorGeo, silverMat);
        rotor.rotation.z = Math.PI / 2;
        rotor.position.set(-0.25 + r * 0.25, 0.3, -0.15);
        group.add(rotor);
      }
      break;
    }
    case 'lorenz': {
      const chassisGeo = new THREE.BoxGeometry(1.4, 0.6, 0.9);
      const greenSteelMat = new THREE.MeshStandardMaterial({ color: 0x164e63, metalness: 0.7, roughness: 0.3 });
      const chassis = new THREE.Mesh(chassisGeo, greenSteelMat);
      chassis.castShadow = true;
      group.add(chassis);

      const wheelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 24);
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 });
      for (let w = 0; w < 6; w++) {
        const wheel = new THREE.Mesh(wheelGeo, brassMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(-0.5 + w * 0.2, 0.35, 0.1);
        group.add(wheel);
      }
      break;
    }
    case 'rsa': {
      const vaultGeo = new THREE.BoxGeometry(1.0, 1.1, 1.0);
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.95, roughness: 0.1 });
      const vault = new THREE.Mesh(vaultGeo, steelMat);
      vault.castShadow = true;
      group.add(vault);

      const handleGeo = new THREE.TorusGeometry(0.2, 0.04, 16, 32);
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 1.0, roughness: 0.05 });
      const handle = new THREE.Mesh(handleGeo, chromeMat);
      handle.position.set(0, 0, 0.52);
      group.add(handle);
      break;
    }
    case 'aes': {
      const cubeGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
      const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transmission: 0.8, opacity: 0.8, roughness: 0.1 });
      const cube = new THREE.Mesh(cubeGeo, glassMat);
      cube.castShadow = true;
      group.add(cube);
      break;
    }
    case 'sha256': {
      const sphereGeo = new THREE.SphereGeometry(0.55, 32, 32);
      const purpleMat = new THREE.MeshPhysicalMaterial({ color: 0x9333ea, emissive: 0x6b21a8, emissiveIntensity: 0.6, roughness: 0.1 });
      const sphere = new THREE.Mesh(sphereGeo, purpleMat);
      sphere.castShadow = true;
      group.add(sphere);
      break;
    }
  }
}
