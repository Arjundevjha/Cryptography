import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CipherExhibit } from '../../src/components/museum/museumData';
import { WorkbenchPanel } from '../../src/components/museum/workbench/WorkbenchPanel';
import { AttackLabView } from '../../src/components/museum/workbench/labs/AttackLabView';

const makeExhibit = (overrides: Partial<CipherExhibit>): CipherExhibit => ({
  id: 'caesar',
  name: 'Caesar Cipher',
  category: 'Classical',
  wing: 'Classical Ciphers Wing',
  subtitle: 'Monoalphabetic Shift',
  description: 'Test exhibit',
  historicalContext: 'Test context',
  vulnerabilities: 'Test vuln',
  timeline: '58 BC',
  position: [0, 0, 0],
  cameraPosition: [0, 2, 4],
  cameraTarget: [0, 1, 0],
  macroPosition: [0, 2, 2],
  macroTarget: [0, 1, 0],
  rotationY: 0,
  endpoint: { encrypt: '/api/caesar/encrypt', decrypt: '/api/caesar/decrypt' },
  defaultParams: {},
  ...overrides,
});

describe('Cryptanalysis Attack Labs', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('runs Caesar chi-squared attack and displays best shift and ranked candidates', async () => {
    const caesarExhibit = makeExhibit({ id: 'caesar', name: 'Caesar Cipher', category: 'Classical' });
    render(<AttackLabView exhibit={caesarExhibit} />);

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            { shift: 3, plaintext: 'HELLO MUSEUM WORLD', chi_squared: 12.34 },
            { shift: 7, plaintext: 'DAHHK IQOAIQ SKNHZ', chi_squared: 240.5 },
          ],
          best: { shift: 3, plaintext: 'HELLO MUSEUM WORLD', chi_squared: 12.34 },
        }),
    }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('run-attack-caesar'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/cryptanalysis/caesar',
      expect.objectContaining({ method: 'POST' })
    );
    expect(screen.getByTestId('caesar-attack-results')).toHaveTextContent('Best Match: Shift 3');
    expect(screen.getByTestId('caesar-attack-results')).toHaveTextContent('HELLO MUSEUM WORLD');
  });

  it('runs Affine brute-force and known-plaintext pair solver', async () => {
    const affineExhibit = makeExhibit({ id: 'affine', name: 'Affine Cipher', category: 'Classical' });
    render(<AttackLabView exhibit={affineExhibit} />);

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          mode: 'bruteforce',
          total_keys: 312,
          candidates: [{ a: 5, b: 8, plaintext: 'HELLO MUSEUM', chi_squared: 14.2 }],
          best: { a: 5, b: 8, plaintext: 'HELLO MUSEUM', chi_squared: 14.2 },
        }),
    }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('run-attack-affine'));
    });

    expect(screen.getByTestId('affine-bruteforce-results')).toHaveTextContent('Best Key (a=5, b=8)');

    // Switch to Known-Plaintext Pair mode
    fireEvent.click(screen.getByRole('button', { name: /known-plaintext pair/i }));

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          mode: 'known_plaintext',
          a: 5,
          b: 8,
          unique: true,
          candidates: [{ a: 5, b: 8, plaintext: 'HELLO MUSEUM', chi_squared: 14.2 }],
          plaintext: 'HELLO MUSEUM',
        }),
    }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('run-attack-affine'));
    });

    expect(screen.getByTestId('affine-known-results')).toHaveTextContent('Solved Key: a=5, b=8');
  });

  it('runs Vigenere IoC and Kasiski attack and displays recovered key', async () => {
    const vigenereExhibit = makeExhibit({
      id: 'vigenere',
      name: 'Vigenere Cipher',
      category: 'Classical',
    });
    render(<AttackLabView exhibit={vigenereExhibit} />);

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          key: 'LEMON',
          key_length: 5,
          plaintext: 'ATTACKATDAWN',
          chi_squared: 18.4,
          ioc_candidates: [
            { key_length: 1, ioc: 0.041 },
            { key_length: 5, ioc: 0.068 },
          ],
          kasiski: {
            repeated_ngrams: [
              { ngram: 'LXF', length: 3, positions: [0, 12], distances: [12], gcd: 12 },
            ],
            factor_scores: [{ factor: 5, count: 2 }],
          },
        }),
    }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('run-attack-vigenere'));
    });

    const results = screen.getByTestId('vigenere-attack-results');
    expect(results).toHaveTextContent('LEMON');
    expect(results).toHaveTextContent('0.0680');
    expect(results).toHaveTextContent('LXF');
  });

  it('runs Historical Enigma Bombe and Lorenz Depth attacks', async () => {
    const enigmaExhibit = makeExhibit({ id: 'enigma', name: 'Enigma', category: 'Historical' });
    const { rerender } = render(<AttackLabView exhibit={enigmaExhibit} />);

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          matches: [
            {
              positions: ['A', 'A', 'C'],
              position_str: 'AAC',
              offset: 0,
              plaintext: 'WETTERBERICHT',
            },
          ],
          positions_tested: 676,
          crib_offsets_valid: [0],
          elapsed_ms: 42.5,
        }),
    }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('run-attack-enigma'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/cryptanalysis/enigma-bombe',
      expect.objectContaining({ method: 'POST' })
    );
    expect(screen.getByTestId('enigma-bombe-results')).toHaveTextContent('Rotors: AAC');
    expect(screen.getByTestId('enigma-bombe-results')).toHaveTextContent('WETTERBERICHT');

    // Lorenz Depth Attack
    const lorenzExhibit = makeExhibit({ id: 'lorenz', name: 'Lorenz SZ40', category: 'Historical' });
    rerender(<AttackLabView exhibit={lorenzExhibit} />);

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          length: 8,
          xor_text: 'ABCDEFGH',
          xor_bits: ['00011', '10011'],
          crib_results: [
            {
              offset: 0,
              crib: 'WETTER',
              recovered_fragment: 'BERLIN',
              alphabetic_ratio: 1.0,
            },
          ],
        }),
    }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('run-attack-lorenz'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/cryptanalysis/lorenz-depth',
      expect.objectContaining({ method: 'POST' })
    );
    expect(screen.getByTestId('lorenz-depth-results')).toHaveTextContent('BERLIN');
  });

  it('runs Modern AES-CBC Bit-Flipping and Small-Prime RSA Factoring attacks', async () => {
    const aesExhibit = makeExhibit({ id: 'aes', name: 'AES-256', category: 'Modern' });
    const { rerender } = render(<AttackLabView exhibit={aesExhibit} />);

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          plaintext: 'user=alice;role=guest;pad=1',
          target_from: 'guest',
          target_to: 'admin',
          iv_hex: '00'.repeat(16),
          tampered_iv_hex: '00'.repeat(16),
          original_blocks_hex: ['aa'.repeat(16), 'bb'.repeat(16)],
          tampered_blocks_hex: ['ff'.repeat(16), 'bb'.repeat(16)],
          flipped_positions: [
            {
              plaintext_offset: 16,
              target_block: 1,
              modified_block: 0,
              byte_index: 0,
              orig_byte_hex: 'aa',
              new_byte_hex: 'ac',
              xor_mask_hex: '06',
            },
          ],
          decrypted_text: 'user=alice;role=admin;pad=1',
          decrypted_raw_hex: '00',
          decrypted_blocks: [
            { index: 0, hex: 'aa', text: '????', status: 'corrupted' },
            { index: 1, hex: 'bb', text: 'admin;pad=1', status: 'forged' },
          ],
          forged_successfully: true,
        }),
    }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('run-attack-aes'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/cryptanalysis/cbc-bitflip',
      expect.objectContaining({ method: 'POST' })
    );
    const aesRes = screen.getByTestId('aes-bitflip-results');
    expect(aesRes).toHaveTextContent('Forged "guest" → "admin"');
    expect(aesRes).toHaveTextContent('corrupted');
    expect(aesRes).toHaveTextContent('forged');

    // RSA Factoring
    const rsaExhibit = makeExhibit({ id: 'rsa', name: 'RSA-2048', category: 'Modern' });
    rerender(<AttackLabView exhibit={rsaExhibit} />);

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          n: 3233,
          e: 17,
          bit_length: 12,
          p: 61,
          q: 53,
          phi: 3120,
          d: 2753,
          fermat: {
            method: 'fermat',
            found: true,
            p: 61,
            q: 53,
            iterations: 4,
            elapsed_ms: 0.12,
            trace: [{ a: 57, b2: 16 }],
          },
          pollard_rho: {
            method: 'pollard_rho',
            found: true,
            p: 53,
            q: 61,
            iterations: 6,
            elapsed_ms: 0.18,
            trace: [{ x: 2, y: 5, d: 1 }],
          },
        }),
    }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('run-attack-rsa'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/cryptanalysis/rsa-factor',
      expect.objectContaining({ method: 'POST' })
    );
    const rsaRes = screen.getByTestId('rsa-factor-results');
    expect(rsaRes).toHaveTextContent('p=61, q=53');
    expect(rsaRes).toHaveTextContent('Recovered Private Key d = 2753');
  });

  it('wires Attack Lab tab into WorkbenchPanel only for the 7 supported exhibits and handles offline errors', async () => {
    const aesExhibit = makeExhibit({ id: 'aes', name: 'AES-256', category: 'Modern' });
    const { rerender } = render(<WorkbenchPanel exhibit={aesExhibit} />);

    const attackTab = screen.getByRole('tab', { name: /attack lab/i });
    expect(attackTab).toHaveAttribute('aria-controls', 'wb-tabpanel-attack-lab-aes');

    fireEvent.click(attackTab);
    expect(screen.getByTestId('attack-lab-aes')).toBeInTheDocument();

    global.fetch = jest.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')) as jest.Mock;
    await React.act(async () => {
      fireEvent.click(screen.getByTestId('run-attack-aes'));
    });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not reach encryption server — is the API running?');

    // Non-attack-lab exhibit should NOT render Attack Lab tab
    const dhExhibit = makeExhibit({
      id: 'diffie-hellman',
      name: 'Diffie-Hellman',
      category: 'Modern',
    });
    rerender(<WorkbenchPanel exhibit={dhExhibit} />);
    expect(screen.queryByRole('tab', { name: /attack lab/i })).not.toBeInTheDocument();
  });
});
