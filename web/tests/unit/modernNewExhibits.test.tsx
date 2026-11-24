import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import * as THREE from 'three';
import { MUSEUM_EXHIBITS } from '../../src/components/museum/museumData';
import { EXHIBIT_ART_SPECS } from '../../src/components/museum/scene/wallArtTextures';
import { getRoomAccentPalette } from '../../src/components/museum/scene/wingArchitecture';
import {
  buildModernNewExhibit,
  updateModernNewExhibit,
} from '../../src/components/museum/scene/modernNewExhibits';
import { WorkbenchPanel } from '../../src/components/museum/workbench/WorkbenchPanel';

describe('New Modern Cryptography Exhibits (ecc & otp-chacha20)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it('registers ecc and otp-chacha20 in MUSEUM_EXHIBITS with non-overlapping Modern wing coordinates', () => {
    const ecc = MUSEUM_EXHIBITS.find((e) => e.id === 'ecc');
    const stream = MUSEUM_EXHIBITS.find((e) => e.id === 'otp-chacha20');

    expect(ecc).toBeDefined();
    expect(stream).toBeDefined();
    expect(ecc?.category).toBe('Modern');
    expect(stream?.category).toBe('Modern');

    // Interior cameraPosition check (inside room boundary z = position[2] + 3.5)
    expect(ecc!.cameraPosition[2]).toBeCloseTo(ecc!.position[2] + 3.5, 5);
    expect(stream!.cameraPosition[2]).toBeCloseTo(stream!.position[2] + 3.5, 5);

    // Verify no overlap with any other exhibit (rooms are 14x12, so |dx| >= 14 or |dz| >= 12)
    for (const target of [ecc!, stream!]) {
      expect(Math.abs(target.position[0])).toBeLessThanOrEqual(78);
      expect(target.position[2]).toBeGreaterThanOrEqual(-98);
      for (const other of MUSEUM_EXHIBITS) {
        if (other.id === target.id) continue;
        const dx = Math.abs(target.position[0] - other.position[0]);
        const dz = Math.abs(target.position[2] - other.position[2]);
        expect(dx >= 14 || dz >= 12).toBe(true);
      }
    }
  });

  it('includes wall art specs and room accent palettes for ecc and otp-chacha20', () => {
    expect(EXHIBIT_ART_SPECS.ecc).toBeDefined();
    expect(EXHIBIT_ART_SPECS['otp-chacha20']).toBeDefined();

    const eccPalette = getRoomAccentPalette('ecc', 'Modern', 17);
    const streamPalette = getRoomAccentPalette('otp-chacha20', 'Modern', 18);
    expect(eccPalette.sconceStyle).toBe('linear');
    expect(streamPalette.sconceStyle).toBe('linear');
    expect(eccPalette.accentColor).not.toBe(streamPalette.accentColor);
  });

  it('builds and animates 3D meshes for ecc and otp-chacha20 via modernNewExhibits', () => {
    const eccGroup = new THREE.Group();
    const eccHandle = buildModernNewExhibit('ecc', eccGroup);
    expect(eccHandle).not.toBeNull();
    expect(eccGroup.children.length).toBeGreaterThan(0);
    expect(() => updateModernNewExhibit(eccHandle, 1.25)).not.toThrow();

    const streamGroup = new THREE.Group();
    const streamHandle = buildModernNewExhibit('otp-chacha20', streamGroup);
    expect(streamHandle).not.toBeNull();
    expect(streamGroup.children.length).toBeGreaterThan(0);
    expect(() => updateModernNewExhibit(streamHandle, 2.5)).not.toThrow();

    expect(buildModernNewExhibit('unknown-id', new THREE.Group())).toBeNull();
  });

  it('renders EccView in WorkbenchPanel, runs ECDH & ECDSA, and shows offline fallback', async () => {
    const eccExhibit = MUSEUM_EXHIBITS.find((e) => e.id === 'ecc')!;
    render(<WorkbenchPanel exhibit={eccExhibit} />);

    expect(screen.getByTestId('ecc-view')).toBeInTheDocument();

    // Test ECDH flow
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            curve: 'secp256r1',
            private_key: 'a'.repeat(64),
            public_key: { x: '1'.repeat(64), y: '2'.repeat(64) },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            curve: 'secp256r1',
            private_key: 'b'.repeat(64),
            public_key: { x: '3'.repeat(64), y: '4'.repeat(64) },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            curve: 'secp256r1',
            shared_point: { x: '5'.repeat(64), y: '6'.repeat(64) },
            shared_secret_hex: '5'.repeat(64),
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            curve: 'secp256r1',
            shared_point: { x: '5'.repeat(64), y: '6'.repeat(64) },
            shared_secret_hex: '5'.repeat(64),
          }),
      }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('ecc-ecdh-run'));
    });
    expect(screen.getByTestId('ecc-ecdh-result')).toHaveTextContent('Shared Secrets Match');

    // Switch to ECDSA and test offline fallback
    fireEvent.click(screen.getByTestId('ecc-mode-ecdsa'));
    global.fetch = jest.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('ecc-sign-btn'));
    });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not reach encryption server — is the API running?');
  });

  it('renders StreamCipherView in WorkbenchPanel, runs ChaCha20 & OTP, and shows offline fallback', async () => {
    const streamExhibit = MUSEUM_EXHIBITS.find((e) => e.id === 'otp-chacha20')!;
    render(<WorkbenchPanel exhibit={streamExhibit} />);

    expect(screen.getByTestId('stream-cipher-view')).toBeInTheDocument();

    // ChaCha20 encrypt
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          ciphertext_hex: 'deadbeef',
          key_hex: '0'.repeat(64),
          nonce_hex: '1'.repeat(24),
          counter: 1,
          keystream_preview_hex: 'abcd1234',
        }),
    }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('stream-execute-btn'));
    });

    expect(screen.getByTestId('stream-output-text')).toHaveTextContent('deadbeef');

    // Switch to OTP and test offline fallback
    fireEvent.click(screen.getByTestId('stream-algo-otp'));
    global.fetch = jest.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('stream-execute-btn'));
    });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not reach encryption server — is the API running?');
  });

  it('registers, builds 3D artifact, and renders ShamirView split/reconstruct & offline fallback', async () => {
    const shamir = MUSEUM_EXHIBITS.find((e) => e.id === 'shamir-secret-sharing');
    expect(shamir).toBeDefined();
    expect(shamir?.category).toBe('Modern');
    expect(shamir!.cameraPosition[2]).toBeCloseTo(shamir!.position[2] + 3.5, 5);
    for (const other of MUSEUM_EXHIBITS) {
      if (other.id === shamir!.id) continue;
      const dx = Math.abs(shamir!.position[0] - other.position[0]);
      const dz = Math.abs(shamir!.position[2] - other.position[2]);
      expect(dx >= 14 || dz >= 12).toBe(true);
    }

    expect(EXHIBIT_ART_SPECS['shamir-secret-sharing']).toBeDefined();
    const shamirPalette = getRoomAccentPalette('shamir-secret-sharing', 'Modern', 19);
    expect(shamirPalette.sconceStyle).toBe('linear');

    const shamirGroup = new THREE.Group();
    const shamirHandle = buildModernNewExhibit('shamir-secret-sharing', shamirGroup);
    expect(shamirHandle).not.toBeNull();
    expect(shamirGroup.children.length).toBeGreaterThan(0);
    expect(() => updateModernNewExhibit(shamirHandle, 1.5)).not.toThrow();

    render(<WorkbenchPanel exhibit={shamir!} />);
    expect(screen.getByTestId('shamir-view')).toBeInTheDocument();

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            mode: 'integer',
            prime: '1613',
            threshold: 3,
            num_shares: 5,
            coefficients: ['1234', '166', '94'],
            shares: [
              { x: 1, y: '1494' },
              { x: 2, y: '329' },
              { x: 3, y: '965' },
              { x: 4, y: '176' },
              { x: 5, y: '1188' },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            mode: 'integer',
            secret: '1234',
            prime: '1613',
            shares_used: 3,
            lagrange_basis: [
              { x: 1, y: '1494', lambda_0: '3', term: '1256' },
              { x: 2, y: '329', lambda_0: '1610', term: '626' },
              { x: 3, y: '965', lambda_0: '1', term: '965' },
            ],
          }),
      }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('shamir-split-btn'));
    });
    expect(screen.getByTestId('shamir-reconstruct-btn')).toBeInTheDocument();

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('shamir-reconstruct-btn'));
    });
    expect(screen.getByTestId('shamir-reconstruct-result')).toHaveTextContent('1234');

    global.fetch = jest.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')) as jest.Mock;
    await React.act(async () => {
      fireEvent.click(screen.getByTestId('shamir-split-btn'));
    });
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not reach encryption server — is the API running?');
  });
});
