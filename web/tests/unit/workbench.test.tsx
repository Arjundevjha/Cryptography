import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CipherExhibit } from '../../src/components/museum/museumData';
import { WorkbenchPanel } from '../../src/components/museum/workbench/WorkbenchPanel';
import { PASSPORT_STORAGE_KEY, PASSPORT_UPDATED_EVENT } from '../../src/components/museum/workbench/PassportChallengeView';

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

describe('WorkbenchPanel Modular Components & New Exhibits', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it('wires up substitution exhibit and displays standardized offline fallback on network failure', async () => {
    const substitutionExhibit = makeExhibit({
      id: 'substitution',
      name: 'Simple Substitution',
      category: 'Classical',
      endpoint: { encrypt: '/api/substitution/encrypt', decrypt: '/api/substitution/decrypt' },
    });

    render(<WorkbenchPanel exhibit={substitutionExhibit} />);

    const keyInput = screen.getByTestId('param-key-substitution');
    expect(keyInput).toHaveValue('QWERTYUIOPASDFGHJKLZXCVBNM');

    global.fetch = jest.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('execute-btn-substitution'));
    });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not reach encryption server — is the API running?');
  });

  it('wires up hmac-hash exhibit for digest, sign, and verify flows', async () => {
    const hmacExhibit = makeExhibit({
      id: 'hmac-hash',
      name: 'Multi-Hash & HMAC',
      category: 'Modern',
      endpoint: { encrypt: '/api/hmac/sign', decrypt: '/api/hmac/verify' },
    });

    render(<WorkbenchPanel exhibit={hmacExhibit} />);

    // Digest mode
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ hash: 'abc123digest', algorithm: 'sha256' }),
    }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('execute-btn-hmac-hash'));
    });
    expect(screen.getByTestId('output-text-hmac-hash')).toHaveTextContent('abc123digest');

    // Switch to HMAC Sign
    fireEvent.click(screen.getByRole('button', { name: /hmac sign/i }));
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ signature: 'sig999', algorithm: 'sha256' }),
    }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('execute-btn-hmac-hash'));
    });
    expect(screen.getByTestId('output-text-hmac-hash')).toHaveTextContent('sig999');
  });

  it('wires up diffie-hellman exhibit and renders public/shared values', async () => {
    const dhExhibit = makeExhibit({
      id: 'diffie-hellman',
      name: 'Diffie-Hellman Key Exchange',
      category: 'Modern',
      endpoint: { encrypt: '/api/diffie-hellman/exchange', decrypt: '/api/diffie-hellman/exchange' },
      defaultParams: { p: 23, g: 5, a: 6, b: 15 },
    });

    render(<WorkbenchPanel exhibit={dhExhibit} />);
    expect(screen.getByTestId('dh-visualizer')).toBeInTheDocument();

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ A: 8, B: 19, shared_secret: 2 }),
    }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('execute-btn-diffie-hellman'));
    });

    expect(screen.getByTestId('output-text-diffie-hellman')).toHaveTextContent('A=8, B=19, Shared Secret=2');
  });

  it('supports Interactive Cryptanalysis tab with chi-squared recovery and Apply Shift', () => {
    const caesarExhibit = makeExhibit({ id: 'caesar', category: 'Classical', defaultParams: { shift: 0 } });
    render(<WorkbenchPanel exhibit={caesarExhibit} />);

    // Enter Caesar-shifted text (shift=3)
    const inputArea = screen.getByTestId('input-text-caesar');
    fireEvent.change(inputArea, {
      target: { value: 'WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ' },
    });

    fireEvent.click(screen.getByRole('tab', { name: /crack/i }));
    expect(screen.getByTestId('cryptanalysis-view-caesar')).toBeInTheDocument();
    expect(screen.getByText(/Index of Coincidence/i)).toBeInTheDocument();
    expect(screen.getByText(/Chi-Squared Key Recovery/i)).toBeInTheDocument();

    // Apply top candidate
    const applyButtons = screen.getAllByRole('button', { name: /apply/i });
    fireEvent.click(applyButtons[0]);

    // Returned to Cipher tab with shift=3 applied
    expect(screen.getByTestId('param-shift-caesar')).toHaveValue('3');
  });

  it('supports Step-by-Step Inspector for Playfair, Enigma, Diffie-Hellman, and AES', () => {
    const playfairExhibit = makeExhibit({
      id: 'playfair',
      name: 'Playfair Cipher',
      category: 'Classical',
      defaultParams: { key: 'MONARCHY' },
    });
    const { rerender } = render(<WorkbenchPanel exhibit={playfairExhibit} />);
    fireEvent.click(screen.getByRole('tab', { name: /steps/i }));
    expect(screen.getByTestId('step-inspector-playfair')).toBeInTheDocument();
    expect(screen.getByText(/Playfair 5×5 Grid Inspector/i)).toBeInTheDocument();

    const enigmaExhibit = makeExhibit({ id: 'enigma', name: 'Enigma Machine', category: 'Historical' });
    rerender(<WorkbenchPanel exhibit={enigmaExhibit} />);
    fireEvent.click(screen.getByRole('tab', { name: /steps/i }));
    expect(screen.getByTestId('step-inspector-enigma')).toBeInTheDocument();
    expect(screen.getByText(/Enigma Rotor & Plugboard Trace/i)).toBeInTheDocument();

    const aesExhibit = makeExhibit({ id: 'aes', name: 'AES-128', category: 'Modern' });
    rerender(<WorkbenchPanel exhibit={aesExhibit} />);
    fireEvent.click(screen.getByRole('tab', { name: /steps/i }));
    expect(screen.getByTestId('step-inspector-aes')).toBeInTheDocument();
    expect(screen.getByText(/AES 4×4 Rijndael State Matrix/i)).toBeInTheDocument();
  });

  it('unlocks Passport stamp in localStorage and dispatches update event on challenge solve', () => {
    const caesarExhibit = makeExhibit({ id: 'caesar', category: 'Classical' });
    const eventListener = jest.fn();
    window.addEventListener(PASSPORT_UPDATED_EVENT, eventListener);

    render(<WorkbenchPanel exhibit={caesarExhibit} />);
    fireEvent.click(screen.getByRole('tab', { name: /stamp/i }));

    const answerInput = screen.getByTestId('challenge-input-caesar');
    const submitBtn = screen.getByTestId('challenge-submit-caesar');

    // Wrong answer
    fireEvent.change(answerInput, { target: { value: 'WRONG' } });
    fireEvent.click(submitBtn);
    expect(screen.getByRole('alert')).toHaveTextContent(/not quite right/i);

    // Correct answer
    fireEvent.change(answerInput, { target: { value: 'vene vidi vici' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/STAMP UNLOCKED/i)).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(PASSPORT_STORAGE_KEY) || '[]')).toContain('caesar');
    expect(eventListener).toHaveBeenCalledTimes(1);

    window.removeEventListener(PASSPORT_UPDATED_EVENT, eventListener);
  });

  it('supports AES-256-CTR vs AES-256-CBC mode switching and IV-Reuse & PKCS7 Padding visualizer', async () => {
    const aesExhibit = makeExhibit({
      id: 'aes',
      name: 'AES-256',
      category: 'Modern',
      endpoint: { encrypt: '/api/aes/encrypt', decrypt: '/api/aes/decrypt' },
    });

    render(<WorkbenchPanel exhibit={aesExhibit} />);
    expect(screen.getByTestId('aes-mode-controls')).toBeInTheDocument();
    expect(screen.getByTestId('aes-padding-iv-visualizer')).toBeInTheDocument();

    // Switch to CBC mode and load identical blocks + fixed IV
    fireEvent.click(screen.getByTestId('aes-mode-cbc'));
    fireEvent.click(screen.getByTestId('aes-load-identical-blocks-btn'));
    fireEvent.click(screen.getByTestId('aes-reuse-iv-btn'));

    expect(screen.getByTestId('param-iv-aes')).toHaveValue('00000000000000000000000000000000');

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          ciphertext: 'aabbccddeeff00112233445566778899',
          iv_hex: '00000000000000000000000000000000',
          padded_blocks_hex: ['4d'.repeat(16), '4d'.repeat(16)],
          ciphertext_blocks_hex: ['11'.repeat(16), '11'.repeat(16)],
          mode: 'cbc',
        }),
    }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('execute-btn-aes'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/aes/cbc/encrypt',
      expect.objectContaining({ method: 'POST' })
    );
    expect(screen.getByTestId('aes-cbc-blocks-output')).toBeInTheDocument();
    expect(screen.getByText(/Pattern Leak Detected/i)).toBeInTheDocument();
  });

  it('renders rsa-signatures workbench for keygen, sign, tamper, and verify', async () => {
    const rsaSigExhibit = makeExhibit({
      id: 'rsa-signatures',
      name: 'RSA Digital Signatures',
      category: 'Modern',
      endpoint: { encrypt: '/api/rsa/sign', decrypt: '/api/rsa/verify' },
    });

    render(<WorkbenchPanel exhibit={rsaSigExhibit} />);
    expect(screen.getByTestId('rsa-signatures-view')).toBeInTheDocument();

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ public_key: 'PUB_PEM', private_key: 'PRIV_PEM' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ signature: 'deadbeef', digest_hex: '1234', algorithm: 'rsa-sha256' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ valid: true, digest_hex: '1234', algorithm: 'rsa-sha256' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ valid: false, digest_hex: '9999', algorithm: 'rsa-sha256' }),
      }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('rsa-sig-keygen-btn'));
    });
    await React.act(async () => {
      fireEvent.click(screen.getByTestId('rsa-sig-sign-btn'));
    });
    expect(screen.getByTestId('rsa-sig-hex')).toHaveValue('deadbeef');

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('rsa-sig-verify-btn'));
    });
    expect(screen.getByTestId('rsa-sig-verify-result')).toHaveTextContent('VALID SIGNATURE');

    fireEvent.click(screen.getByTestId('rsa-sig-tamper-msg-btn'));
    await React.act(async () => {
      fireEvent.click(screen.getByTestId('rsa-sig-verify-btn'));
    });
    expect(screen.getByTestId('rsa-sig-verify-result')).toHaveTextContent('INVALID SIGNATURE');
  });

  it('renders zkp-schnorr interactive Commit -> Challenge -> Respond -> Verify game', async () => {
    const zkpExhibit = makeExhibit({
      id: 'zkp-schnorr',
      name: 'Schnorr Zero-Knowledge Proof',
      category: 'Modern',
      endpoint: { encrypt: '/api/zkp/prove-step', decrypt: '/api/zkp/prove-step' },
    });

    render(<WorkbenchPanel exhibit={zkpExhibit} />);
    expect(screen.getByTestId('zkp-schnorr-view')).toBeInTheDocument();

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ step: 'commit', y: 111, r: 50, t: 222 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ step: 'respond', s: 92 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ step: 'verify', lhs: 333, rhs: 333, valid: true }),
      }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('zkp-commit-btn'));
    });
    expect(screen.getByTestId('zkp-commit-output')).toHaveTextContent('t = 222');

    fireEvent.click(screen.getByTestId('zkp-challenge-1'));
    await React.act(async () => {
      fireEvent.click(screen.getByTestId('zkp-respond-btn'));
    });
    expect(screen.getByTestId('zkp-respond-output')).toHaveTextContent('s = 92');

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('zkp-verify-btn'));
    });
    expect(screen.getByTestId('zkp-verify-result')).toHaveTextContent('PROOF ACCEPTED');
  });

  it('renders post-quantum-kem Lattice / ML-KEM key-encapsulation visualizer', async () => {
    const pqExhibit = makeExhibit({
      id: 'post-quantum-kem',
      name: 'ML-KEM Lattice Key Encapsulation',
      category: 'Modern',
      endpoint: { encrypt: '/api/mlkem/demo', decrypt: '/api/mlkem/demo' },
    });

    render(<WorkbenchPanel exhibit={pqExhibit} />);
    expect(screen.getByTestId('post-quantum-kem-view')).toBeInTheDocument();

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          q: 3329,
          n: 4,
          noise_bound: 2,
          public_key: { A: [[1, 2, 3, 4]], t: [10, 20, 30, 40] },
          secret_key: { s: [1, 0, -1, 1], e: [1, -1, 0, 1] },
          ciphertext: { u: [5, 6, 7, 8], v: 1665 },
          encapsulation: { r: [1, 1, 0, 0], e1: [0, 1, 0, 0], e2: 1, message_bit: 1, shared_secret_hex: 'a1b2c3d4' },
          decapsulation: { noisy_diff: 1664, centered_diff: 1664, recovered_bit: 1, shared_secret_hex: 'a1b2c3d4' },
          match: true,
        }),
    }) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(screen.getByTestId('mlkem-run-btn'));
    });

    expect(screen.getByTestId('mlkem-results')).toBeInTheDocument();
    expect(screen.getByTestId('mlkem-match-badge')).toHaveTextContent('SHARED SECRET MATCHED');
  });

  it('supports keyboard ArrowRight/ArrowLeft/Home/End navigation and ARIA tabpanel semantics on WorkbenchPanel tabs', () => {
    const aesExhibit = makeExhibit({ id: 'aes', name: 'AES-256', category: 'Modern' });
    render(<WorkbenchPanel exhibit={aesExhibit} />);

    const tablist = screen.getByRole('tablist', { name: /workbench tools/i });
    const cipherTab = screen.getByRole('tab', { name: /cipher/i });
    const stepsTab = screen.getByRole('tab', { name: /steps/i });
    const stampTab = screen.getByRole('tab', { name: /stamp/i });

    expect(cipherTab).toHaveAttribute('aria-controls', 'wb-tabpanel-workbench-aes');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', cipherTab.id);

    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(stepsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', stepsTab.id);

    fireEvent.keyDown(tablist, { key: 'End' });
    expect(stampTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(cipherTab).toHaveAttribute('aria-selected', 'true');
  });
});
