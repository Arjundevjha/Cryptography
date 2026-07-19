'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MUSEUM_EXHIBITS } from './museumData';

interface ThreeMuseumSceneProps {
  currentView: string;
  isMacro: boolean;
  onSelectRoom: (roomId: string) => void;
  onCaseClick: (roomId: string) => void;
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
  const targetCamPos = useRef(new THREE.Vector3(0, 7, 26));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.2, 0));
  const isAnimatingRef = useRef(true);
  const initializedRef = useRef(false);

  // Build the full 3D scene once
  const buildScene = useCallback(() => {
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // === RENDERER ===
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.setClearColor(0xe0f2fe); // Bright sky blue ambient
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === SCENE ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0f2fe);
    scene.fog = new THREE.FogExp2(0xe0f2fe, 0.008);
    sceneRef.current = scene;

    // === CAMERA ===
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 300);
    camera.position.set(0, 7, 26);
    cameraRef.current = camera;

    // === CONTROLS ===
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // When user starts dragging mouse to look around, stop auto-lerping immediately
    controls.addEventListener('start', () => {
      isAnimatingRef.current = false;
    });

    // ============================
    // LIGHTING SETUP
    // ============================
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 1.6);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.8);
    sunLight.position.set(30, 45, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    const warmFill = new THREE.DirectionalLight(0xfef3c7, 1.0);
    warmFill.position.set(-30, 20, -20);
    scene.add(warmFill);

    // ============================
    // MARBLE FLOOR (High poly plane)
    // ============================
    const floorGeo = new THREE.PlaneGeometry(160, 160, 64, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.12,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // High detail floor tile grid
    const gridHelper = new THREE.GridHelper(160, 80, 0xcbd5e1, 0xe2e8f0);
    (gridHelper.material as THREE.Material).opacity = 0.4;
    (gridHelper.material as THREE.Material).transparent = true;
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // ============================
    // CENTRAL ATRIUM DAIS & TITLE
    // ============================
    const daisGeo = new THREE.CylinderGeometry(5.5, 6.0, 0.6, 64);
    const daisMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.08,
      metalness: 0.02,
      clearcoat: 0.5,
    });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.set(0, 0.3, 0);
    dais.castShadow = true;
    dais.receiveShadow = true;
    scene.add(dais);

    // Centerpiece monument torus
    const monumentGeo = new THREE.TorusGeometry(1.8, 0.25, 32, 64);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.15,
    });
    const monument = new THREE.Mesh(monumentGeo, goldMat);
    monument.position.set(0, 2.5, 0);
    monument.castShadow = true;
    scene.add(monument);

    // Inner monument core sphere
    const coreGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 0.5,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 2.5, 0);
    scene.add(core);

    // Point light for atrium monument
    const atriumLight = new THREE.PointLight(0x38bdf8, 4, 15);
    atriumLight.position.set(0, 3, 0);
    scene.add(atriumLight);

    // ============================
    // HIGH-POLYGON COLUMNS
    // ============================
    const colRadius = 20;
    const numColumns = 16;
    const colGeo = new THREE.CylinderGeometry(0.45, 0.5, 12, 48);
    const colMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.02,
    });
    const baseCapGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.4, 48);

    for (let i = 0; i < numColumns; i++) {
      const angle = (i / numColumns) * Math.PI * 2;
      const cx = colRadius * Math.sin(angle);
      const cz = colRadius * Math.cos(angle);

      const column = new THREE.Mesh(colGeo, colMat);
      column.position.set(cx, 6, cz);
      column.castShadow = true;
      column.receiveShadow = true;
      scene.add(column);

      // Base
      const base = new THREE.Mesh(baseCapGeo, colMat);
      base.position.set(cx, 0.2, cz);
      base.castShadow = true;
      scene.add(base);

      // Capital
      const cap = new THREE.Mesh(baseCapGeo, colMat);
      cap.position.set(cx, 11.8, cz);
      scene.add(cap);
    }

    // ============================
    // RADIAL EXHIBIT PAVILIONS
    // ============================
    const rotatingArtifacts: THREE.Object3D[] = [];

    MUSEUM_EXHIBITS.forEach((exhibit) => {
      const roomGroup = new THREE.Group();
      roomGroup.position.set(...exhibit.position);
      roomGroup.rotation.y = exhibit.rotationY;
      roomGroup.userData = { exhibitId: exhibit.id };

      // --- PAVILION BACK WALL ---
      const wallGeo = new THREE.BoxGeometry(10, 8, 0.4);
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.2,
      });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(0, 4, -5);
      wall.castShadow = true;
      wall.receiveShadow = true;
      roomGroup.add(wall);

      // --- GOLD ARCH OVER PAVILION ---
      const archStripeGeo = new THREE.BoxGeometry(9.6, 0.25, 0.42);
      const archStripeMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.85,
        roughness: 0.2,
      });
      const archStripe = new THREE.Mesh(archStripeGeo, archStripeMat);
      archStripe.position.set(0, 7.2, -5);
      roomGroup.add(archStripe);

      // --- SIDE WALLS ---
      const sideWallGeo = new THREE.BoxGeometry(0.4, 8, 8);
      const leftWall = new THREE.Mesh(sideWallGeo, wallMat);
      leftWall.position.set(-5, 4, -1);
      leftWall.castShadow = true;
      roomGroup.add(leftWall);

      const rightWall = new THREE.Mesh(sideWallGeo, wallMat);
      rightWall.position.set(5, 4, -1);
      rightWall.castShadow = true;
      roomGroup.add(rightWall);

      // --- MARBLE PEDESTAL ---
      const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.35, 1.2, 48);
      const pedestalMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.08,
        metalness: 0.05,
        clearcoat: 0.4,
      });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.set(0, 0.6, 0);
      pedestal.castShadow = true;
      pedestal.receiveShadow = true;
      roomGroup.add(pedestal);

      // --- GLASS DISPLAY CASE ---
      const glassGeo = new THREE.CylinderGeometry(1.1, 1.1, 2.2, 48);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.94,
        transparent: true,
        opacity: 0.25,
        roughness: 0.04,
        ior: 1.52,
        thickness: 0.05,
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(0, 2.3, 0);
      roomGroup.add(glass);

      // --- EXHIBIT SPOTLIGHT ---
      const spot = new THREE.SpotLight(0xfffbeb, 6);
      spot.position.set(0, 7.5, 1);
      spot.angle = 0.55;
      spot.penumbra = 0.4;
      spot.castShadow = true;
      spot.target = pedestal;
      roomGroup.add(spot);
      roomGroup.add(spot.target);

      // --- HIGH-QUALITY ARTIFACT ---
      const artifactGroup = new THREE.Group();
      artifactGroup.position.set(0, 1.8, 0);

      buildHighQualityArtifact(exhibit.id, artifactGroup);

      roomGroup.add(artifactGroup);
      rotatingArtifacts.push(artifactGroup);

      scene.add(roomGroup);
    });

    rotatingArtifactsRef.current = rotatingArtifacts;

    // ============================
    // RAYCASTING CLICK INTERACTION
    // ============================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj.parent && obj.parent !== scene) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.exhibitId) {
          onSelectRoom(obj.userData.exhibitId);
        }
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    // ============================
    // FAST ANIMATION LOOP
    // ============================
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Slow elegant artifact rotation
      rotatingArtifactsRef.current.forEach((art) => {
        art.rotation.y += delta * 0.4;
      });

      // Animate center monument
      monument.rotation.y += delta * 0.5;
      monument.rotation.x += delta * 0.2;

      // Lerp camera ONLY while transitioning to a new exhibit target
      if (isAnimatingRef.current) {
        camera.position.lerp(targetCamPos.current, Math.min(delta * 8.0, 0.25));
        controls.target.lerp(targetLookAt.current, Math.min(delta * 8.0, 0.25));

        if (
          camera.position.distanceTo(targetCamPos.current) < 0.05 &&
          controls.target.distanceTo(targetLookAt.current) < 0.05
        ) {
          isAnimatingRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
      animIdRef.current = requestAnimationFrame(animate);
    };

    animIdRef.current = requestAnimationFrame(animate);

    // ============================
    // RESIZE HANDLER
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
      renderer.domElement.removeEventListener('click', handleClick);
      if (container && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      initializedRef.current = false;
    };
  }, [onSelectRoom]);

  // Initialize scene once
  useEffect(() => {
    const cleanup = buildScene();
    return () => {
      if (cleanup) cleanup();
    };
  }, [buildScene]);

  // Direct room-to-room camera transition without resetting to foyer!
  useEffect(() => {
    isAnimatingRef.current = true; // Enable camera flight animation when target changes

    if (currentView === 'atrium') {
      targetCamPos.current.set(0, 7, 26);
      targetLookAt.current.set(0, 1.2, 0);
    } else {
      const exhibit = MUSEUM_EXHIBITS.find((e) => e.id === currentView);
      if (exhibit) {
        if (isMacro) {
          targetCamPos.current.set(...exhibit.macroPosition);
          targetLookAt.current.set(...exhibit.macroTarget);
        } else {
          targetCamPos.current.set(...exhibit.cameraPosition);
          targetLookAt.current.set(...exhibit.cameraTarget);
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
// HIGH-QUALITY ARTIFACT BUILDER (High Poly, PBR Materials)
// ===================================================
function buildHighQualityArtifact(id: string, group: THREE.Group) {
  switch (id) {
    case 'caesar':
    case 'scytale': {
      // High-poly Spartan Scytale cylinder with carved texture & parchment
      const woodGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.6, 64);
      const woodMat = new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.45,
        metalness: 0.1,
      });
      const wood = new THREE.Mesh(woodGeo, woodMat);
      wood.rotation.z = Math.PI / 2;
      wood.castShadow = true;
      group.add(wood);

      // Gold end caps with bevels
      const capGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.08, 64);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.9,
        roughness: 0.15,
      });
      const capL = new THREE.Mesh(capGeo, goldMat);
      capL.rotation.z = Math.PI / 2;
      capL.position.x = -0.84;
      capL.castShadow = true;
      group.add(capL);

      const capR = new THREE.Mesh(capGeo, goldMat);
      capR.rotation.z = Math.PI / 2;
      capR.position.x = 0.84;
      capR.castShadow = true;
      group.add(capR);

      // Smooth parchment band wrapped continuously
      const parchGeo = new THREE.CylinderGeometry(0.235, 0.235, 0.12, 64);
      const parchMat = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        roughness: 0.35,
      });
      for (let x = -0.6; x <= 0.6; x += 0.2) {
        const band = new THREE.Mesh(parchGeo, parchMat);
        band.rotation.z = Math.PI / 2;
        band.position.x = x;
        band.castShadow = true;
        group.add(band);
      }
      break;
    }

    case 'affine': {
      // Mathematical Stone Obelisk with Gold Equations
      const obeliskGeo = new THREE.CylinderGeometry(0.1, 0.4, 1.4, 4);
      const obeliskMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.3,
        metalness: 0.2,
      });
      const obelisk = new THREE.Mesh(obeliskGeo, obeliskMat);
      obelisk.rotation.y = Math.PI / 4;
      obelisk.castShadow = true;
      group.add(obelisk);

      // Floating gold equations ring
      const ringGeo = new THREE.TorusGeometry(0.55, 0.03, 32, 64);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.15 });
      const ring = new THREE.Mesh(ringGeo, goldMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
      break;
    }

    case 'vigenere': {
      // Renaissance Tabula Recta Grid with Polished Brass Letters
      const baseGeo = new THREE.BoxGeometry(1.2, 0.1, 1.2);
      const marbleMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, clearcoat: 0.8 });
      const base = new THREE.Mesh(baseGeo, marbleMat);
      base.castShadow = true;
      group.add(base);

      // 6x6 Raised Gold Grid Tiles
      const tileGeo = new THREE.BoxGeometry(0.14, 0.12, 0.14);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          const tile = new THREE.Mesh(tileGeo, goldMat);
          tile.position.set(-0.42 + c * 0.17, 0.08, -0.42 + r * 0.17);
          tile.castShadow = true;
          group.add(tile);
        }
      }
      break;
    }

    case 'playfair': {
      // 5x5 Obsidian Matrix with Metallic Letters
      const baseGeo = new THREE.BoxGeometry(1.2, 0.12, 1.2);
      const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 });
      const base = new THREE.Mesh(baseGeo, obsidianMat);
      base.castShadow = true;
      group.add(base);

      const cellGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 32);
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.15 });
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const cell = new THREE.Mesh(cellGeo, brassMat);
          cell.position.set(-0.4 + c * 0.2, 0.08, -0.4 + r * 0.2);
          cell.castShadow = true;
          group.add(cell);
        }
      }
      break;
    }

    case 'polybius': {
      // Greek Bronze Checkerboard with Torch Orbs
      const plateGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.1, 64);
      const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x92400e, metalness: 0.8, roughness: 0.3 });
      const plate = new THREE.Mesh(plateGeo, bronzeMat);
      plate.castShadow = true;
      group.add(plate);

      // Glowing Torch Orbs at 4 Corners
      const orbGeo = new THREE.SphereGeometry(0.08, 32, 32);
      const fireMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 1.5 });
      [
        [-0.45, 0.45],
        [0.45, 0.45],
        [-0.45, -0.45],
        [0.45, -0.45],
      ].forEach(([x, z]) => {
        const orb = new THREE.Mesh(orbGeo, fireMat);
        orb.position.set(x, 0.12, z);
        group.add(orb);
      });
      break;
    }

    case 'enigma': {
      // Detailed High-Poly Enigma Machine
      const bodyGeo = new THREE.BoxGeometry(1.2, 0.35, 1.0);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.4 });
      const body = new THREE.Mesh(bodyGeo, woodMat);
      body.castShadow = true;
      group.add(body);

      // Metal faceplate
      const plateGeo = new THREE.BoxGeometry(1.15, 0.02, 0.95);
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
      const plate = new THREE.Mesh(plateGeo, metalMat);
      plate.position.y = 0.185;
      group.add(plate);

      // 3 Rotors (brass wheels)
      const rotorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.07, 48);
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.15 });
      [-0.22, 0, 0.22].forEach((x) => {
        const rotor = new THREE.Mesh(rotorGeo, brassMat);
        rotor.rotation.z = Math.PI / 2;
        rotor.position.set(x, 0.23, -0.18);
        rotor.castShadow = true;
        group.add(rotor);
      });

      // Keyboard Keys
      const keyGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.03, 24);
      const keyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 9; col++) {
          const key = new THREE.Mesh(keyGeo, keyMat);
          key.position.set(-0.4 + col * 0.1, 0.2, 0.1 + row * 0.12);
          group.add(key);
        }
      }
      break;
    }

    case 'rsa': {
      // High-Tech Quantum RSA Terminal with Dual Rings
      const baseGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.4, 64);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.castShadow = true;
      group.add(base);

      // Glowing Cyan Core Sphere
      const sphereGeo = new THREE.SphereGeometry(0.25, 64, 64);
      const glowMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 2.0,
        roughness: 0.1,
      });
      const sphere = new THREE.Mesh(sphereGeo, glowMat);
      sphere.position.y = 0.45;
      group.add(sphere);

      // Holographic Ring 1
      const ringGeo = new THREE.TorusGeometry(0.65, 0.02, 32, 64);
      const cyanMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 1.5 });
      const ring1 = new THREE.Mesh(ringGeo, cyanMat);
      ring1.position.y = 0.45;
      ring1.rotation.x = Math.PI / 3;
      group.add(ring1);

      // Holographic Ring 2
      const ring2 = new THREE.Mesh(ringGeo, cyanMat);
      ring2.position.y = 0.45;
      ring2.rotation.x = -Math.PI / 3;
      ring2.rotation.y = Math.PI / 2;
      group.add(ring2);
      break;
    }

    case 'aes': {
      // AES Hypercube: Inner Core + Outer Wireframe Cages
      const coreGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
      const purpleMat = new THREE.MeshPhysicalMaterial({
        color: 0xc084fc,
        emissive: 0x9333ea,
        emissiveIntensity: 1.2,
        roughness: 0.1,
        clearcoat: 1.0,
      });
      const core = new THREE.Mesh(coreGeo, purpleMat);
      core.castShadow = true;
      group.add(core);

      const cage1Geo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      const cage1Mat = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true });
      const cage1 = new THREE.Mesh(cage1Geo, cage1Mat);
      group.add(cage1);

      const cage2Geo = new THREE.BoxGeometry(0.95, 0.95, 0.95);
      const cage2Mat = new THREE.MeshBasicMaterial({ color: 0xe9d5ff, wireframe: true });
      const cage2 = new THREE.Mesh(cage2Geo, cage2Mat);
      group.add(cage2);
      break;
    }

    case 'sha256': {
      // SHA-256 Hash Chain: High-Poly Connected Geometric Polyhedra
      const polyGeo = new THREE.IcosahedronGeometry(0.24, 1);
      const greenMat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x15803d,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      [-0.45, 0, 0.45].forEach((x) => {
        const poly = new THREE.Mesh(polyGeo, greenMat);
        poly.position.x = x;
        poly.castShadow = true;
        group.add(poly);
      });

      const linkGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 32);
      const linkMat = new THREE.MeshStandardMaterial({ color: 0x86efac, metalness: 0.8 });
      [-0.225, 0.225].forEach((x) => {
        const link = new THREE.Mesh(linkGeo, linkMat);
        link.rotation.z = Math.PI / 2;
        link.position.x = x;
        group.add(link);
      });
      break;
    }

    default: {
      const torusGeo = new THREE.TorusGeometry(0.35, 0.12, 32, 64);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
      const torus = new THREE.Mesh(torusGeo, goldMat);
      torus.castShadow = true;
      group.add(torus);
      break;
    }
  }
}
