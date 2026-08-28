'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MUSEUM_EXHIBITS, MUSEUM_WINGS } from './museumData';

interface ThreeMuseumSceneProps {
  currentView: string;
  isMacro: boolean;
  onSelectRoom: (roomId: string) => void;
  onCaseClick: (roomId: string) => void;
}

const textureCache = new Map<string, THREE.CanvasTexture>();

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

    const daisGeo = new THREE.CylinderGeometry(5.5, 6.0, 0.6, 64);
    const daisMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.1 });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.set(0, 0.3, 5);
    dais.receiveShadow = true;
    scene.add(dais);

    const monumentGeo = new THREE.TorusGeometry(1.8, 0.25, 32, 64);
    const monument = new THREE.Mesh(monumentGeo, goldMat);
    monument.position.set(0, 2.5, 5);
    scene.add(monument);

    const coreGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const coreMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8, roughness: 0.1 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 2.5, 5);
    scene.add(core);

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
            onSelectRoomRef.current(obj.userData.wingId);
            return;
          }
          if (obj.userData?.exhibitId) {
            const clickedExhibitId = obj.userData.exhibitId;
            if (clickedExhibitId !== currentViewRef.current) {
              isSpatialUpdateRef.current = false;
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

      if (keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'] || keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']) {
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
      const now = performance.now();
      if (!isMacroRef.current && !isAnimatingRef.current && now - lastRoomChangeTimeRef.current > 300) {
        let insideRoomId: string | null = null;

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
            lastRoomChangeTimeRef.current = now;
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
            lastRoomChangeTimeRef.current = now;
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

      // Animate centerpiece monument
      monument.rotation.y += delta * 0.5;
      monument.rotation.x += delta * 0.2;

      // Smooth camera lerp during button room selection jumps
      if (isAnimatingRef.current) {
        camera.position.lerp(targetCamPos.current, Math.min(delta * 7.0, 0.22));
        const viewDir = new THREE.Vector3();
        camera.getWorldDirection(viewDir);
        controls.target.copy(camera.position).addScaledVector(viewDir, 0.2);

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
    const cleanup = buildScene();
    return () => {
      if (cleanup) cleanup();
    };
  }, [buildScene]);

  // Target camera positions for button room selection transitions
  useEffect(() => {
    isMacroRef.current = isMacro;
    currentViewRef.current = currentView;
    onSelectRoomRef.current = onSelectRoom;
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
