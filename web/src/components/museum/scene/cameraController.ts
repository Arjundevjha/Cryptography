import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MUSEUM_EXHIBITS, MUSEUM_STATUES, MUSEUM_WINGS } from '../museumData';

export const WALK_SPEED = 16.0;
export const EYE_LEVEL_Y = 2.5;
export const DRAG_CLICK_THRESHOLD_PX = 6;
export const SPATIAL_GRACE_MS = 1500;
export const SPATIAL_DEBOUNCE_MS = 500;
export const BOUNDARY_X: readonly [number, number] = [-80, 80];
export const BOUNDARY_Z: readonly [number, number] = [-105, 30];

export interface CameraTargetSpec {
  position: [number, number, number];
  lookAt: [number, number, number];
}

export interface RaycastHitTarget {
  kind: 'wing' | 'statue' | 'exhibit';
  id: string;
}

export interface CameraControllerStateRefs {
  keysPressedRef: React.MutableRefObject<Record<string, boolean>>;
  mobileKeysPropRef: React.MutableRefObject<React.MutableRefObject<Record<string, boolean>> | undefined>;
  lastRoomChangeTimeRef: React.MutableRefObject<number>;
  isSpatialUpdateRef: React.MutableRefObject<boolean>;
  isAnimatingRef: React.MutableRefObject<boolean>;
  targetCamPos: React.MutableRefObject<THREE.Vector3>;
  targetLookAt: React.MutableRefObject<THREE.Vector3>;
  currentViewRef: React.MutableRefObject<string>;
  onSelectRoomRef: React.MutableRefObject<(roomId: string) => void>;
}

export interface MuseumCameraController {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  update: (rawDelta: number, delta: number) => void;
  handleResize: (width: number, height: number) => void;
  dispose: () => void;
}

/**
 * Resolves the target camera position and lookAt vector for a given view ID
 * ('atrium', 'wing-*', 'statue-*', or an exhibit ID).
 */
export function resolveViewCameraTarget(viewId: string): CameraTargetSpec | null {
  if (viewId === 'atrium') {
    return { position: [0, EYE_LEVEL_Y, 20], lookAt: [0, EYE_LEVEL_Y, 10] };
  }
  if (viewId.startsWith('wing-')) {
    const wing = MUSEUM_WINGS.find((w) => w.id === viewId);
    if (!wing) return null;
    return {
      position: [wing.cameraPosition[0], EYE_LEVEL_Y, wing.cameraPosition[2]],
      lookAt: [wing.cameraTarget[0], EYE_LEVEL_Y, wing.cameraTarget[2]],
    };
  }
  if (viewId.startsWith('statue-')) {
    const statue = MUSEUM_STATUES.find((s) => s.id === viewId);
    if (!statue) return null;
    return {
      position: [...statue.cameraPosition],
      lookAt: [...statue.cameraTarget],
    };
  }
  const exhibit = MUSEUM_EXHIBITS.find((e) => e.id === viewId);
  if (!exhibit) return null;
  return {
    position: [exhibit.cameraPosition[0], 2.25, exhibit.cameraPosition[2]],
    lookAt: [exhibit.cameraTarget[0], 1.88, exhibit.cameraTarget[2]],
  };
}

/**
 * Detects which museum room, statue perimeter, wing, or atrium corresponds to
 * the given XZ floor coordinates during active walking.
 */
export function detectSpatialArea(pos: { x: number; z: number }, currentView: string): string {
  if (currentView.startsWith('statue-')) {
    const activeStatue = MUSEUM_STATUES.find((s) => s.id === currentView);
    if (activeStatue) {
      const [sx, , sz] = activeStatue.position;
      if (Math.hypot(pos.x - sx, pos.z - sz) <= 6.5) {
        return activeStatue.id;
      }
    }
  }

  for (const ex of MUSEUM_EXHIBITS) {
    const [exX, , exZ] = ex.position;
    if (Math.abs(pos.x - exX) <= 6.8 && pos.z >= exZ - 5.8 && pos.z <= exZ + 6.2) {
      return ex.id;
    }
  }

  if (pos.x < -20) return 'wing-classical';
  if (pos.x > 20) return 'wing-modern';
  if (pos.z < -10) return 'wing-historical';
  return 'atrium';
}

/**
 * Walks up the scene graph from a raycasted mesh to find the owning wing,
 * statue, or exhibit identifier.
 */
export function resolveRaycastTargetId(
  object: THREE.Object3D | null,
  sceneRoot: THREE.Object3D
): RaycastHitTarget | null {
  let obj: THREE.Object3D | null = object;
  while (obj && obj !== sceneRoot) {
    if (obj.userData?.wingId) {
      return { kind: 'wing', id: obj.userData.wingId };
    }
    if (obj.userData?.statueId) {
      return { kind: 'statue', id: obj.userData.statueId };
    }
    if (obj.userData?.exhibitId) {
      return { kind: 'exhibit', id: obj.userData.exhibitId };
    }
    obj = obj.parent;
  }
  return null;
}

/**
 * Returns true when pointer movement between mousedown and click is within the
 * 6px drag-vs-click threshold.
 */
export function isClickWithinDragThreshold(
  downPos: { x: number; y: number },
  upPos: { x: number; y: number }
): boolean {
  return Math.hypot(upPos.x - downPos.x, upPos.y - downPos.y) <= DRAG_CLICK_THRESHOLD_PX;
}

export function createMuseumCameraController(params: {
  width: number;
  height: number;
  domElement: HTMLElement;
  scene: THREE.Scene;
  refs: CameraControllerStateRefs;
}): MuseumCameraController {
  const { width, height, domElement, scene, refs } = params;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 300);
  camera.position.set(0, EYE_LEVEL_Y, 20);

  // OrbitControls configured for In-Place Head Look (Target stays right in front of camera)
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 1.8;
  controls.minPolarAngle = Math.PI / 4.0;
  controls.minDistance = 0.1;
  controls.maxDistance = 0.5;
  controls.target.set(0, EYE_LEVEL_Y, 15);

  controls.addEventListener('start', () => {
    refs.isAnimatingRef.current = false;
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
    refs.keysPressedRef.current[e.code] = true;
    refs.isAnimatingRef.current = false;
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    refs.keysPressedRef.current[e.code] = false;
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let mouseDownPos = { x: 0, y: 0 };

  const handleMouseDown = (e: MouseEvent) => {
    mouseDownPos = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: MouseEvent) => {
    if (!isClickWithinDragThreshold(mouseDownPos, { x: e.clientX, y: e.clientY })) return;

    const rect = domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length === 0) return;

    const hit = resolveRaycastTargetId(intersects[0].object, scene);
    if (!hit) return;

    if (hit.kind === 'wing') {
      refs.isSpatialUpdateRef.current = false;
      refs.lastRoomChangeTimeRef.current = performance.now() + SPATIAL_GRACE_MS;
      refs.onSelectRoomRef.current(hit.id);
      return;
    }

    if (hit.id !== refs.currentViewRef.current) {
      refs.isSpatialUpdateRef.current = false;
      refs.lastRoomChangeTimeRef.current = performance.now() + SPATIAL_GRACE_MS;
      refs.onSelectRoomRef.current(hit.id);
    }
  };

  domElement.addEventListener('mousedown', handleMouseDown);
  domElement.addEventListener('click', handleClick);

  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const moveVector = new THREE.Vector3();
  const currentDir = new THREE.Vector3();
  const lookDir = new THREE.Vector3();
  const upAxis = new THREE.Vector3(0, 1, 0);

  const update = (rawDelta: number, delta: number) => {
    const walkSpeed = WALK_SPEED * delta;
    const keys = refs.keysPressedRef.current;
    const mobKeys = refs.mobileKeysPropRef.current?.current;
    const moveForward = !!(keys['KeyW'] || keys['ArrowUp'] || mobKeys?.['KeyW']);
    const moveBackward = !!(keys['KeyS'] || keys['ArrowDown'] || mobKeys?.['KeyS']);
    const moveLeft = !!(keys['KeyA'] || keys['ArrowLeft'] || mobKeys?.['KeyA']);
    const moveRight = !!(keys['KeyD'] || keys['ArrowRight'] || mobKeys?.['KeyD']);
    const isWalking = moveForward || moveBackward || moveLeft || moveRight;

    if (mobKeys && (mobKeys['KeyW'] || mobKeys['KeyS'] || mobKeys['KeyA'] || mobKeys['KeyD'])) {
      refs.isAnimatingRef.current = false;
    }

    if (isWalking) {
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      right.crossVectors(forward, upAxis).normalize();
      moveVector.set(0, 0, 0);

      if (moveForward) moveVector.addScaledVector(forward, walkSpeed);
      if (moveBackward) moveVector.addScaledVector(forward, -walkSpeed);
      if (moveLeft) moveVector.addScaledVector(right, -walkSpeed);
      if (moveRight) moveVector.addScaledVector(right, walkSpeed);

      if (moveVector.lengthSq() > 0) {
        const newPos = camera.position.clone().add(moveVector);
        newPos.x = THREE.MathUtils.clamp(newPos.x, BOUNDARY_X[0], BOUNDARY_X[1]);
        newPos.z = THREE.MathUtils.clamp(newPos.z, BOUNDARY_Z[0], BOUNDARY_Z[1]);
        newPos.y = EYE_LEVEL_Y;

        const deltaPos = newPos.clone().sub(camera.position);
        camera.position.copy(newPos);
        controls.target.add(deltaPos);
      }
    }

    camera.getWorldDirection(currentDir);
    controls.target.copy(camera.position).addScaledVector(currentDir, 0.2);

    const now = performance.now();
    if (isWalking && !refs.isAnimatingRef.current && now > refs.lastRoomChangeTimeRef.current) {
      const detected = detectSpatialArea(
        { x: camera.position.x, z: camera.position.z },
        refs.currentViewRef.current
      );
      if (detected !== refs.currentViewRef.current) {
        refs.lastRoomChangeTimeRef.current = now + SPATIAL_DEBOUNCE_MS;
        refs.isSpatialUpdateRef.current = true;
        refs.onSelectRoomRef.current(detected);
      }
    }

    if (refs.isAnimatingRef.current) {
      const lerpAlpha = 1 - Math.exp(-8.5 * Math.min(rawDelta, 0.35));
      camera.position.lerp(refs.targetCamPos.current, lerpAlpha);
      lookDir.copy(refs.targetLookAt.current).sub(camera.position).normalize();
      if (lookDir.lengthSq() > 0.001) {
        controls.target.copy(camera.position).addScaledVector(lookDir, 0.2);
        camera.lookAt(refs.targetLookAt.current);
      }

      if (camera.position.distanceTo(refs.targetCamPos.current) < 0.05) {
        camera.position.copy(refs.targetCamPos.current);
        refs.isAnimatingRef.current = false;
      }
    }

    controls.update();
  };

  const handleResize = (w: number, h: number) => {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const dispose = () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    domElement.removeEventListener('mousedown', handleMouseDown);
    domElement.removeEventListener('click', handleClick);
    controls.dispose();
  };

  return { camera, controls, update, handleResize, dispose };
}
