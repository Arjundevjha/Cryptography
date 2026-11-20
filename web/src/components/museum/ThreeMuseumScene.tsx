'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MUSEUM_EXHIBITS, MUSEUM_STATUES } from './museumData';
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
} from './scene/wallArtTextures';
import {
  decorateExhibitRoom,
  decorateFoyerWalls,
  getRoomAccentPalette,
} from './scene/wingArchitecture';
import { buildHighQualityArtifact } from './scene/exhibitRegistry';
import {
  preloadPioneerBusts,
  buildGrandEntranceFoyer,
  buildPioneerStatues,
  buildWingPortals,
  getSignboardTexture,
  getPlaqueTexture,
  type FoyerBuildMaterials,
} from './scene/statuesAndFoyer';
import {
  createMuseumCameraController,
  resolveViewCameraTarget,
  SPATIAL_GRACE_MS,
} from './scene/cameraController';

interface ThreeMuseumSceneProps {
  currentView: string;
  onSelectRoom: (roomId: string) => void;
  mobileKeysRef?: React.MutableRefObject<Record<string, boolean>>;
}

preloadPioneerBusts();

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

    // === 3-4. CAMERA, ORBIT CONTROLS, RAYCASTING & WASD CONTROLLER ===
    const cameraController = createMuseumCameraController({
      width,
      height,
      domElement: renderer.domElement,
      scene,
      refs: {
        keysPressedRef,
        mobileKeysPropRef,
        lastRoomChangeTimeRef,
        isSpatialUpdateRef,
        isAnimatingRef,
        targetCamPos,
        targetLookAt,
        currentViewRef,
        onSelectRoomRef,
      },
    });
    const { camera } = cameraController;
    cameraRef.current = camera;
    controlsRef.current = cameraController.controls;

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
    // 8-9. GRAND ENTRANCE FOYER, PIONEER STATUES & WING PORTALS
    // ============================
    const foyerMaterials: FoyerBuildMaterials = {
      wallMat,
      wainscotMat,
      trimMat,
      oakRunnerMat,
      brassInlayMat,
      travertineMat,
      travertineTrimMat,
      wartimeBronzeMat,
      titaniumMat,
      glassMat,
      goldMat,
      crystalMat,
      contactShadowMat,
    };
    buildGrandEntranceFoyer(scene, foyerMaterials);
    buildPioneerStatues(scene);
    buildWingPortals(scene, foyerMaterials);

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
    // 11-12. ANIMATION LOOP (DELEGATED CAMERA/WALKING + SPOTLIGHT & ARTIFACT MOTION)
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

      cameraController.update(rawDelta, delta);

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
      cameraController.handleResize(w, h);
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', handleResize);
      cameraController.dispose();
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
    lastRoomChangeTimeRef.current = performance.now() + SPATIAL_GRACE_MS;
    if (isSpatialUpdateRef.current) {
      isSpatialUpdateRef.current = false;
    } else {
      isAnimatingRef.current = true;
    }

    const target = resolveViewCameraTarget(currentView);
    if (target) {
      targetCamPos.current.set(...target.position);
      targetLookAt.current.set(...target.lookAt);
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

