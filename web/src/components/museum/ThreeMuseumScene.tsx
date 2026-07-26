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
    let mouseDownPos = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      mouseDownPos = { x: e.clientX, y: e.clientY };
    };

    const handleClick = (e: MouseEvent) => {
      // Ignore click event if user was dragging/orbiting camera with mouse
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
          obj = obj.parent;
        }
        if (obj && obj.userData?.exhibitId) {
          const clickedExhibitId = obj.userData.exhibitId;
          // Do NOT re-trigger room selection if already in current exhibit room
          if (clickedExhibitId !== currentViewRef.current) {
            onSelectRoomRef.current(clickedExhibitId);
          }
        }
      }
    };
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('click', handleClick);

    // ============================
    // FAST ANIMATION LOOP
    // ============================
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Rotate artifacts ONLY when not in close-up inspect (macro) mode
      if (!isMacroRef.current) {
        rotatingArtifactsRef.current.forEach((art) => {
          art.rotation.y += delta * 0.4;
        });
      }

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
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('click', handleClick);
      if (container && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      initializedRef.current = false;
    };
  }, []);

  // Initialize scene once
  useEffect(() => {
    const cleanup = buildScene();
    return () => {
      if (cleanup) cleanup();
    };
  }, [buildScene]);

  // Direct room-to-room camera transition without resetting to foyer!
  useEffect(() => {
    isMacroRef.current = isMacro;
    currentViewRef.current = currentView;
    onSelectRoomRef.current = onSelectRoom;
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
// ===================================================
// HIGH-QUALITY ARTIFACT BUILDER (High Poly, PBR Materials)
// ===================================================
function buildHighQualityArtifact(id: string, group: THREE.Group) {
  switch (id) {
    case 'caesar': {
      // Caesar Cipher Mechanical Concentric Disk
      group.rotation.x = Math.PI / 5; // Tilt up towards viewer

      // Outer Plaintext Disk (Bronze)
      const outerDiskGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.05, 64);
      const bronzeMat = new THREE.MeshStandardMaterial({
        color: 0x92400e,
        metalness: 0.85,
        roughness: 0.25,
      });
      const outerDisk = new THREE.Mesh(outerDiskGeo, bronzeMat);
      outerDisk.castShadow = true;
      group.add(outerDisk);

      // 26 Outer Alphabet Notch Indicators
      const outerNotchGeo = new THREE.BoxGeometry(0.025, 0.06, 0.035);
      const notchMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.9, roughness: 0.1 });
      for (let i = 0; i < 26; i++) {
        const angle = (i / 26) * Math.PI * 2;
        const notch = new THREE.Mesh(outerNotchGeo, notchMat);
        notch.position.set(Math.cos(angle) * 0.58, 0.01, Math.sin(angle) * 0.58);
        notch.rotation.y = -angle;
        group.add(notch);
      }

      // Inner Shifted Ciphertext Disk (Gold/Brass, elevated)
      const innerDiskGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.06, 64);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.9,
        roughness: 0.15,
      });
      const innerDisk = new THREE.Mesh(innerDiskGeo, goldMat);
      innerDisk.position.y = 0.02;
      innerDisk.castShadow = true;
      group.add(innerDisk);

      // 26 Inner Alphabet Notch Indicators
      const innerNotchGeo = new THREE.BoxGeometry(0.02, 0.07, 0.025);
      for (let i = 0; i < 26; i++) {
        const angle = (i / 26) * Math.PI * 2 + 0.15; // Shifted angle
        const notch = new THREE.Mesh(innerNotchGeo, notchMat);
        notch.position.set(Math.cos(angle) * 0.4, 0.03, Math.sin(angle) * 0.4);
        notch.rotation.y = -angle;
        group.add(notch);
      }

      // Central Steel Pin
      const pinGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 32);
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.95, roughness: 0.1 });
      const pin = new THREE.Mesh(pinGeo, steelMat);
      pin.position.y = 0.04;
      group.add(pin);

      // Shift Indicator Pointer Dial
      const pointerGeo = new THREE.BoxGeometry(0.03, 0.08, 0.42);
      const redBrassMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.8, roughness: 0.2 });
      const pointer = new THREE.Mesh(pointerGeo, redBrassMat);
      pointer.position.set(0, 0.04, 0.18);
      pointer.castShadow = true;
      group.add(pointer);
      break;
    }

    case 'scytale': {
      // Spartan Scytale Cylinder with Helical Parchment Ribbon
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

      // Continuous Helical Parchment Ribbon wrapped around cylinder
      const parchMat = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        roughness: 0.35,
      });
      const segmentGeo = new THREE.BoxGeometry(0.05, 0.015, 0.14);
      const turns = 6;
      const steps = 72;
      for (let i = 0; i < steps; i++) {
        const progress = i / (steps - 1);
        const x = -0.7 + progress * 1.4;
        const angle = progress * turns * Math.PI * 2;
        const y = Math.cos(angle) * 0.228;
        const z = Math.sin(angle) * 0.228;
        const seg = new THREE.Mesh(segmentGeo, parchMat);
        seg.position.set(x, y, z);
        seg.rotation.x = angle;
        seg.castShadow = true;
        group.add(seg);
      }
      break;
    }

    case 'affine': {
      // Double-Dial Mathematical Gear Machine E(x) = (ax + b) mod 26
      // Base Block (Mahogany)
      const baseGeo = new THREE.BoxGeometry(1.4, 0.12, 1.0);
      const mahoganyMat = new THREE.MeshStandardMaterial({
        color: 0x451a03,
        roughness: 0.4,
        metalness: 0.1,
      });
      const base = new THREE.Mesh(baseGeo, mahoganyMat);
      base.castShadow = true;
      group.add(base);

      // Brass Inset Trim Plate
      const trimGeo = new THREE.BoxGeometry(1.35, 0.02, 0.95);
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
      const trim = new THREE.Mesh(trimGeo, brassMat);
      trim.position.y = 0.07;
      group.add(trim);

      // Multiplier Gear (Key 'a', Left Brass Gear)
      const gearAGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 48);
      const gearA = new THREE.Mesh(gearAGeo, brassMat);
      gearA.position.set(-0.32, 0.12, 0);
      gearA.castShadow = true;
      group.add(gearA);

      // Teeth for Gear A
      const toothGeo = new THREE.BoxGeometry(0.04, 0.08, 0.04);
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const tooth = new THREE.Mesh(toothGeo, brassMat);
        tooth.position.set(-0.32 + Math.cos(angle) * 0.36, 0.12, Math.sin(angle) * 0.36);
        group.add(tooth);
      }

      // Shift Gear (Key 'b', Right Copper Gear)
      const gearBGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.08, 48);
      const copperMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.92, roughness: 0.15 });
      const gearB = new THREE.Mesh(gearBGeo, copperMat);
      gearB.position.set(0.3, 0.12, 0);
      gearB.castShadow = true;
      group.add(gearB);

      // Teeth for Gear B
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + 0.1;
        const tooth = new THREE.Mesh(toothGeo, copperMat);
        tooth.position.set(0.3 + Math.cos(angle) * 0.27, 0.12, Math.sin(angle) * 0.27);
        group.add(tooth);
      }

      // Pointer Needles
      const needleGeo = new THREE.BoxGeometry(0.02, 0.04, 0.25);
      const needleA = new THREE.Mesh(needleGeo, mahoganyMat);
      needleA.position.set(-0.32, 0.17, 0.06);
      needleA.rotation.y = Math.PI / 4;
      group.add(needleA);

      const needleB = new THREE.Mesh(needleGeo, mahoganyMat);
      needleB.position.set(0.3, 0.17, -0.05);
      needleB.rotation.y = -Math.PI / 3;
      group.add(needleB);

      // Mathematical Engraved Plaque
      const plaqueGeo = new THREE.BoxGeometry(0.4, 0.03, 0.14);
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
      const plaque = new THREE.Mesh(plaqueGeo, steelMat);
      plaque.position.set(0, 0.09, 0.36);
      group.add(plaque);
      break;
    }

    case 'vigenere': {
      // Jefferson Disk / Vigenère Multi-Rotor Cylindrical Roll
      // Base Marble Slab
      const slabGeo = new THREE.BoxGeometry(1.5, 0.08, 0.6);
      const marbleMat = new THREE.MeshPhysicalMaterial({ color: 0xf8fafc, roughness: 0.1, clearcoat: 0.6 });
      const slab = new THREE.Mesh(slabGeo, marbleMat);
      slab.position.y = -0.22;
      slab.castShadow = true;
      group.add(slab);

      // Central Axle Shaft (Steel)
      const shaftGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.4, 32);
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
      const shaft = new THREE.Mesh(shaftGeo, steelMat);
      shaft.rotation.z = Math.PI / 2;
      shaft.castShadow = true;
      group.add(shaft);

      // End Support Pillars (Cast Iron)
      const pillarGeo = new THREE.BoxGeometry(0.08, 0.45, 0.38);
      const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
      const leftPillar = new THREE.Mesh(pillarGeo, ironMat);
      leftPillar.position.set(-0.66, 0, 0);
      leftPillar.castShadow = true;
      group.add(leftPillar);

      const rightPillar = new THREE.Mesh(pillarGeo, ironMat);
      rightPillar.position.set(0.66, 0, 0);
      rightPillar.castShadow = true;
      group.add(rightPillar);

      // 9 Alternating Alphabet Disks (Ivory and Brass)
      const diskGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 48);
      const ivoryMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.3 });
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.15 });

      for (let i = 0; i < 9; i++) {
        const mat = i % 2 === 0 ? ivoryMat : brassMat;
        const disk = new THREE.Mesh(diskGeo, mat);
        disk.rotation.z = Math.PI / 2;
        disk.rotation.x = i * 0.65; // Each disk rotated differently
        disk.position.x = -0.52 + i * 0.13;
        disk.castShadow = true;
        group.add(disk);
      }

      // Top Alignment Key Bar
      const barGeo = new THREE.BoxGeometry(1.25, 0.025, 0.035);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
      const bar = new THREE.Mesh(barGeo, goldMat);
      bar.position.set(0, 0.26, 0);
      group.add(bar);
      break;
    }

    case 'playfair': {
      // 5x5 Cryptographic Matrix Grid Board with Digraph Highlight Laser
      // Base Walnut Board
      const baseGeo = new THREE.BoxGeometry(1.3, 0.1, 1.3);
      const walnutMat = new THREE.MeshStandardMaterial({ color: 0x27160c, roughness: 0.3, metalness: 0.1 });
      const base = new THREE.Mesh(baseGeo, walnutMat);
      base.castShadow = true;
      group.add(base);

      // Inset Brass Matrix Plate
      const plateGeo = new THREE.BoxGeometry(1.15, 0.02, 1.15);
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 });
      const plate = new THREE.Mesh(plateGeo, brassMat);
      plate.position.y = 0.06;
      group.add(plate);

      // 5x5 Grid of Marble Letter Tiles
      const tileGeo = new THREE.BoxGeometry(0.18, 0.04, 0.18);
      const marbleMat = new THREE.MeshPhysicalMaterial({ color: 0xf8fafc, roughness: 0.12, clearcoat: 0.5 });
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const tile = new THREE.Mesh(tileGeo, marbleMat);
          tile.position.set(-0.4 + c * 0.2, 0.08, -0.4 + r * 0.2);
          tile.castShadow = true;
          group.add(tile);
        }
      }

      // Digraph Highlight Ring 1 (Cyan Glow at tile 1,1)
      const ringGeo = new THREE.TorusGeometry(0.08, 0.015, 16, 32);
      const cyanMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 1.8 });
      const ring1 = new THREE.Mesh(ringGeo, cyanMat);
      ring1.position.set(-0.2, 0.12, -0.2);
      ring1.rotation.x = Math.PI / 2;
      group.add(ring1);

      // Digraph Highlight Ring 2 (Magenta Glow at tile 3,4)
      const magentaMat = new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xdb2777, emissiveIntensity: 1.8 });
      const ring2 = new THREE.Mesh(ringGeo, magentaMat);
      ring2.position.set(0.4, 0.12, 0.2);
      ring2.rotation.x = Math.PI / 2;
      group.add(ring2);

      // Connecting Laser Line (Bigram Substitution Path)
      const laserGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.72, 16);
      const laserMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 2.0 });
      const laser = new THREE.Mesh(laserGeo, laserMat);
      laser.position.set(0.1, 0.12, 0);
      laser.rotation.z = -Math.PI / 3;
      laser.rotation.x = Math.PI / 6;
      group.add(laser);
      break;
    }

    case 'polybius': {
      // Ancient Greek Fortress Watchtower Torch Signalling System
      // Masonry Rampart Base
      const rampartGeo = new THREE.BoxGeometry(1.5, 0.14, 0.9);
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8, metalness: 0.1 });
      const rampart = new THREE.Mesh(rampartGeo, stoneMat);
      rampart.castShadow = true;
      group.add(rampart);

      // Left Watchtower
      const towerGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.9, 16);
      const leftTower = new THREE.Mesh(towerGeo, stoneMat);
      leftTower.position.set(-0.55, 0.5, 0);
      leftTower.castShadow = true;
      group.add(leftTower);

      // Right Watchtower
      const rightTower = new THREE.Mesh(towerGeo, stoneMat);
      rightTower.position.set(0.55, 0.5, 0);
      rightTower.castShadow = true;
      group.add(rightTower);

      // Tower Battlements (Crenellations)
      const capGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.1, 16);
      const capL = new THREE.Mesh(capGeo, stoneMat);
      capL.position.set(-0.55, 0.95, 0);
      group.add(capL);

      const capR = new THREE.Mesh(capGeo, stoneMat);
      capR.position.set(0.55, 0.95, 0);
      group.add(capR);

      // Fire Braziers & Glowing Torches
      const brazierGeo = new THREE.CylinderGeometry(0.1, 0.06, 0.08, 16);
      const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });

      const brazierL = new THREE.Mesh(brazierGeo, ironMat);
      brazierL.position.set(-0.55, 1.04, 0);
      group.add(brazierL);

      const brazierR = new THREE.Mesh(brazierGeo, ironMat);
      brazierR.position.set(0.55, 1.04, 0);
      group.add(brazierR);

      // Fire Orbs
      const flameGeo = new THREE.SphereGeometry(0.07, 16, 16);
      const fireMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 2.5 });

      const flameL = new THREE.Mesh(flameGeo, fireMat);
      flameL.position.set(-0.55, 1.12, 0);
      group.add(flameL);

      const flameR = new THREE.Mesh(flameGeo, fireMat);
      flameR.position.set(0.55, 1.12, 0);
      group.add(flameR);

      // Engraved Bronze Grid Tablet (between towers)
      const tabletGeo = new THREE.BoxGeometry(0.48, 0.05, 0.48);
      const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x92400e, metalness: 0.85, roughness: 0.25 });
      const tablet = new THREE.Mesh(tabletGeo, bronzeMat);
      tablet.position.set(0, 0.1, 0);
      tablet.castShadow = true;
      group.add(tablet);
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

    case 'lorenz': {
      // Detailed 12-Rotor Lorenz SZ42 Teleprinter Attachment
      const chassisGeo = new THREE.BoxGeometry(1.5, 0.25, 1.0);
      const chassisMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.25 });
      const chassis = new THREE.Mesh(chassisGeo, chassisMat);
      chassis.castShadow = true;
      group.add(chassis);

      // Central Steel Drive Shaft
      const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.35, 32);
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
      const shaft = new THREE.Mesh(shaftGeo, steelMat);
      shaft.rotation.z = Math.PI / 2;
      shaft.position.set(0, 0.22, -0.1);
      shaft.castShadow = true;
      group.add(shaft);

      // 12 Pinwheels (Brass Rotors) grouped into Chi (5), Motor (2), and Psi (5)
      const wheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.05, 32);
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.15 });
      const motorMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.95, roughness: 0.1 });

      const wheelOffsets = [
        // Chi 1..5
        -0.58, -0.48, -0.38, -0.28, -0.18,
        // Motor 1..2
        -0.05, 0.05,
        // Psi 1..5
        0.18, 0.28, 0.38, 0.48, 0.58,
      ];

      wheelOffsets.forEach((x, idx) => {
        const mat = (idx >= 5 && idx <= 6) ? motorMat : brassMat;
        const wheel = new THREE.Mesh(wheelGeo, mat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.22, -0.1);
        wheel.castShadow = true;
        group.add(wheel);

        // Active Pin Notch
        const notchGeo = new THREE.BoxGeometry(0.02, 0.05, 0.03);
        const notchMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xca8a04, emissiveIntensity: 0.8 });
        const notch = new THREE.Mesh(notchGeo, notchMat);
        notch.position.set(x, 0.35, -0.1);
        group.add(notch);
      });

      // Status Telemetry LEDs
      const ledGeo = new THREE.SphereGeometry(0.025, 16, 16);
      const ledGreen = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d, emissiveIntensity: 1.5 });
      const ledAmber = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xb45309, emissiveIntensity: 1.5 });

      [-0.4, 0, 0.4].forEach((x, i) => {
        const led = new THREE.Mesh(ledGeo, i === 1 ? ledAmber : ledGreen);
        led.position.set(x, 0.14, 0.38);
        group.add(led);
      });
      break;
    }

    case 'rsa': {
      // Asymmetric Prime Factorization Key Vault
      // Titanium Base Plate
      const baseGeo = new THREE.CylinderGeometry(0.6, 0.65, 0.1, 64);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.15 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.castShadow = true;
      group.add(base);

      // Two Interlocking Prime Rings (p and q)
      const ringGeo = new THREE.TorusGeometry(0.42, 0.03, 32, 64);
      const cyanMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 1.5 });
      const ring1 = new THREE.Mesh(ringGeo, cyanMat);
      ring1.position.y = 0.35;
      ring1.rotation.x = Math.PI / 3;
      group.add(ring1);

      const magentaMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 1.5 });
      const ring2 = new THREE.Mesh(ringGeo, magentaMat);
      ring2.position.y = 0.35;
      ring2.rotation.x = -Math.PI / 3;
      ring2.rotation.y = Math.PI / 2;
      group.add(ring2);

      // Floating Translucent Crystal Padlock
      const lockBodyGeo = new THREE.BoxGeometry(0.3, 0.25, 0.12);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.9,
        transparent: true,
        opacity: 0.85,
        roughness: 0.05,
        clearcoat: 1.0,
      });
      const lockBody = new THREE.Mesh(lockBodyGeo, glassMat);
      lockBody.position.y = 0.35;
      lockBody.castShadow = true;
      group.add(lockBody);

      // Shackle
      const shackleGeo = new THREE.TorusGeometry(0.09, 0.022, 16, 32, Math.PI);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
      const shackle = new THREE.Mesh(shackleGeo, goldMat);
      shackle.position.set(0, 0.47, 0);
      shackle.rotation.z = Math.PI;
      group.add(shackle);
      break;
    }

    case 'aes': {
      // AES 128-bit State Matrix ShiftRows Diffusion Core
      // Octagonal Chrome Plate
      const plateGeo = new THREE.CylinderGeometry(0.65, 0.7, 0.08, 8);
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.92, roughness: 0.18 });
      const plate = new THREE.Mesh(plateGeo, chromeMat);
      plate.castShadow = true;
      group.add(plate);

      // 4x4 State Matrix of Glowing Glass Cubes (with ShiftRows offsets)
      const cubeGeo = new THREE.BoxGeometry(0.09, 0.09, 0.09);
      const purpleMat = new THREE.MeshPhysicalMaterial({
        color: 0xc084fc,
        emissive: 0x9333ea,
        emissiveIntensity: 1.2,
        roughness: 0.1,
        clearcoat: 1.0,
      });

      for (let r = 0; r < 4; r++) {
        const rowShift = r * 0.04; // ShiftRows visualization offset per row
        for (let c = 0; c < 4; c++) {
          const cube = new THREE.Mesh(cubeGeo, purpleMat);
          cube.position.set(-0.3 + c * 0.2 + rowShift - 0.06, 0.2 + r * 0.14, -0.3 + c * 0.2);
          cube.castShadow = true;
          group.add(cube);
        }
      }

      // Outer Wireframe Gimbal Ring
      const ringGeo = new THREE.TorusGeometry(0.68, 0.015, 16, 64);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0xe9d5ff, wireframe: true });
      const ring = new THREE.Mesh(ringGeo, wireMat);
      ring.position.y = 0.4;
      ring.rotation.x = Math.PI / 4;
      group.add(ring);
      break;
    }

    case 'sha256': {
      // Merkle Tree Hash Chain Compression Cascade
      // Dark Hexagonal Base
      const baseGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.08, 6);
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
      const base = new THREE.Mesh(baseGeo, steelMat);
      base.castShadow = true;
      group.add(base);

      // Tier 1: 4 Leaf Nodes (Bottom Row)
      const leafGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const greenMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d, emissiveIntensity: 0.8 });
      for (let i = 0; i < 4; i++) {
        const leaf = new THREE.Mesh(leafGeo, greenMat);
        leaf.position.set(-0.45 + i * 0.3, 0.15, 0.3);
        leaf.castShadow = true;
        group.add(leaf);
      }

      // Tier 2: 2 Branch Nodes (Middle Row)
      const branchGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
      const brightGreenMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 1.3 });
      [-0.25, 0.25].forEach((x) => {
        const branch = new THREE.Mesh(branchGeo, brightGreenMat);
        branch.position.set(x, 0.45, 0);
        branch.castShadow = true;
        group.add(branch);
      });

      // Tier 3: 1 Master Root Hash Digest (Top Node)
      const rootGeo = new THREE.IcosahedronGeometry(0.18, 1);
      const rootMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x22c55e, emissiveIntensity: 2.2 });
      const rootNode = new THREE.Mesh(rootGeo, rootMat);
      rootNode.position.set(0, 0.78, -0.25);
      rootNode.castShadow = true;
      group.add(rootNode);

      // Connecting Laser Cables
      const cableGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.45, 16);
      const cableMat = new THREE.MeshStandardMaterial({ color: 0x86efac, emissive: 0x4ade80, emissiveIntensity: 1.5 });

      // Leaf to branch connectors
      [-0.35, -0.15, 0.15, 0.35].forEach((x) => {
        const cable = new THREE.Mesh(cableGeo, cableMat);
        cable.position.set(x, 0.3, 0.15);
        cable.rotation.x = Math.PI / 4;
        group.add(cable);
      });

      // Branch to root connectors
      [-0.12, 0.12].forEach((x) => {
        const cable = new THREE.Mesh(cableGeo, cableMat);
        cable.position.set(x, 0.6, -0.12);
        cable.rotation.x = Math.PI / 4;
        group.add(cable);
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

