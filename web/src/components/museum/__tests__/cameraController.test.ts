import * as THREE from 'three';
import { MUSEUM_EXHIBITS, MUSEUM_STATUES, MUSEUM_WINGS } from '../museumData';

jest.mock('three/examples/jsm/controls/OrbitControls.js', () => {
  return {
    OrbitControls: jest.fn().mockImplementation(() => {
      const listeners: Record<string, Array<() => void>> = {};
      return {
        enableDamping: false,
        dampingFactor: 0,
        maxPolarAngle: 0,
        minPolarAngle: 0,
        minDistance: 0,
        maxDistance: 0,
        target: new THREE.Vector3(),
        addEventListener: (event: string, cb: () => void) => {
          listeners[event] = listeners[event] || [];
          listeners[event].push(cb);
        },
        emit: (event: string) => {
          (listeners[event] || []).forEach((cb) => cb());
        },
        update: jest.fn(),
        dispose: jest.fn(),
      };
    }),
  };
});

import {
  BOUNDARY_X,
  BOUNDARY_Z,
  EYE_LEVEL_Y,
  createMuseumCameraController,
  detectSpatialArea,
  isClickWithinDragThreshold,
  resolveRaycastTargetId,
  resolveViewCameraTarget,
} from '../scene/cameraController';

describe('cameraController', () => {
  describe('resolveViewCameraTarget', () => {
    it('resolves atrium, wings, statues, and exhibits to expected camera vectors', () => {
      expect(resolveViewCameraTarget('atrium')).toEqual({
        position: [0, EYE_LEVEL_Y, 20],
        lookAt: [0, EYE_LEVEL_Y, 10],
      });

      const wing = MUSEUM_WINGS[0];
      expect(resolveViewCameraTarget(wing.id)).toEqual({
        position: [wing.cameraPosition[0], EYE_LEVEL_Y, wing.cameraPosition[2]],
        lookAt: [wing.cameraTarget[0], EYE_LEVEL_Y, wing.cameraTarget[2]],
      });

      const statue = MUSEUM_STATUES[0];
      expect(resolveViewCameraTarget(statue.id)).toEqual({
        position: statue.cameraPosition,
        lookAt: statue.cameraTarget,
      });

      const exhibit = MUSEUM_EXHIBITS[0];
      expect(resolveViewCameraTarget(exhibit.id)).toEqual({
        position: [exhibit.cameraPosition[0], 2.25, exhibit.cameraPosition[2]],
        lookAt: [exhibit.cameraTarget[0], 1.88, exhibit.cameraTarget[2]],
      });

      expect(resolveViewCameraTarget('unknown-room')).toBeNull();
    });
  });

  describe('detectSpatialArea', () => {
    it('detects exhibit rooms, statue perimeters, wings, and atrium', () => {
      const ex = MUSEUM_EXHIBITS[0];
      expect(detectSpatialArea({ x: ex.position[0], z: ex.position[2] }, 'atrium')).toBe(ex.id);

      const statue = MUSEUM_STATUES[0];
      expect(
        detectSpatialArea({ x: statue.position[0] + 1, z: statue.position[2] + 1 }, statue.id)
      ).toBe(statue.id);

      expect(detectSpatialArea({ x: -25, z: 5 }, 'atrium')).toBe('wing-classical');
      expect(detectSpatialArea({ x: 25, z: 5 }, 'atrium')).toBe('wing-modern');
      expect(detectSpatialArea({ x: 0, z: -15 }, 'atrium')).toBe('wing-historical');
      expect(detectSpatialArea({ x: 0, z: 18 }, 'wing-classical')).toBe('atrium');
    });
  });

  describe('isClickWithinDragThreshold', () => {
    it('allows clicks within 6px and rejects drags beyond 6px', () => {
      expect(isClickWithinDragThreshold({ x: 10, y: 10 }, { x: 13, y: 14 })).toBe(true);
      expect(isClickWithinDragThreshold({ x: 10, y: 10 }, { x: 16, y: 10 })).toBe(true);
      expect(isClickWithinDragThreshold({ x: 10, y: 10 }, { x: 15, y: 15 })).toBe(false);
    });
  });

  describe('resolveRaycastTargetId', () => {
    it('walks parent chain to locate wingId, statueId, or exhibitId', () => {
      const scene = new THREE.Scene();
      const roomGroup = new THREE.Group();
      roomGroup.userData = { exhibitId: 'caesar' };
      const childMesh = new THREE.Mesh();
      roomGroup.add(childMesh);
      scene.add(roomGroup);

      expect(resolveRaycastTargetId(childMesh, scene)).toEqual({ kind: 'exhibit', id: 'caesar' });

      const untagged = new THREE.Mesh();
      scene.add(untagged);
      expect(resolveRaycastTargetId(untagged, scene)).toBeNull();
    });
  });

  describe('createMuseumCameraController', () => {
    it('handles OrbitControls start interruption, WASD walking with clamping, and disposal', () => {
      const scene = new THREE.Scene();
      const domElement = document.createElement('canvas');
      const isAnimatingRef = { current: true };
      const keysPressedRef = { current: {} as Record<string, boolean> };
      const mobileKeysPropRef = { current: undefined };
      const lastRoomChangeTimeRef = { current: 0 };
      const isSpatialUpdateRef = { current: false };
      const targetCamPos = { current: new THREE.Vector3(0, 2.5, 20) };
      const targetLookAt = { current: new THREE.Vector3(0, 2.5, 10) };
      const currentViewRef = { current: 'atrium' };
      const onSelectRoomRef = { current: jest.fn() };

      const controller = createMuseumCameraController({
        width: 800,
        height: 600,
        domElement,
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

      // OrbitControls drag interruption cancels camera lerp animation
      (controller.controls as unknown as { emit: (e: string) => void }).emit('start');
      expect(isAnimatingRef.current).toBe(false);

      // KeyW triggers forward walking and maintains eye-level Y and bounds
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
      expect(keysPressedRef.current['KeyW']).toBe(true);

      const initialZ = controller.camera.position.z;
      controller.update(0.05, 0.05);
      expect(controller.camera.position.y).toBe(EYE_LEVEL_Y);
      expect(controller.camera.position.z).toBeLessThan(initialZ);
      expect(controller.camera.position.x).toBeGreaterThanOrEqual(BOUNDARY_X[0]);
      expect(controller.camera.position.x).toBeLessThanOrEqual(BOUNDARY_X[1]);
      expect(controller.camera.position.z).toBeGreaterThanOrEqual(BOUNDARY_Z[0]);
      expect(controller.camera.position.z).toBeLessThanOrEqual(BOUNDARY_Z[1]);

      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
      expect(keysPressedRef.current['KeyW']).toBe(false);

      controller.handleResize(1280, 720);
      expect(controller.camera.aspect).toBeCloseTo(1280 / 720);

      controller.dispose();
    });
  });
});
