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
});
