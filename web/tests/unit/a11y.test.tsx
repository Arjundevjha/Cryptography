import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArtifactMetadataDrawer } from '../../src/components/museum/workbench/ArtifactMetadataDrawer';
import { MuseumHUD } from '../../src/components/museum/hud/MuseumHUD';
import { WorkbenchPanel } from '../../src/components/museum/workbench/WorkbenchPanel';
import { AudioSystem } from '../../src/components/museum/AudioSystem';
import { ApiStatusDot } from '../../src/components/museum/hud/ApiStatusDot';
import { MUSEUM_EXHIBITS, MUSEUM_STATUES } from '../../src/components/museum/museumData';
import { StatueCuratorialDrawer } from '../../src/components/museum/workbench/StatueCuratorialDrawer';
import { MuseumCanvas } from '../../src/components/museum/MuseumCanvas';

// Mock ThreeMuseumScene to prevent WebGL canvas initialization during unit tests
jest.mock('../../src/components/museum/ThreeMuseumScene', () => {
  return function DummyThreeMuseumScene() {
    return <div data-testid="mock-three-scene" />;
  };
});

describe('Accessibility (A11y) Unit Tests', () => {
  const sampleExhibit = MUSEUM_EXHIBITS[0];

  it('renders ArtifactMetadataDrawer with accessible dialog role, aria-label, and focus styles', () => {
    const handleClose = jest.fn();
    render(<ArtifactMetadataDrawer exhibit={sampleExhibit} onClose={handleClose} />);

    const dialog = screen.getByRole('dialog', { name: `Artifact details for ${sampleExhibit.name}` });
    expect(dialog).toBeInTheDocument();

    const exitBtn = screen.getByRole('button', { name: /exit macro close-up view/i });
    expect(exitBtn).toBeInTheDocument();
    expect(exitBtn.className).toContain('focus-visible:ring-2');

    const closeButton = screen.getByRole('button', { name: /close artifact details/i });
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders MuseumHUD top navigation with aria-current="page" on active item and focus-visible styles', () => {
    render(
      <MuseumHUD
        currentView="wing-classical"
        isMacro={false}
        onSelectRoom={jest.fn()}
        onReturnToFoyer={jest.fn()}
      />
    );

    const lobbyNavBtn = screen.getByRole('button', { name: /^lobby$/i });
    const classicalWingBtn = screen.getByRole('button', { name: /classical wing/i });
    const historicalWingBtn = screen.getByRole('button', { name: /historical wing/i });

    expect(lobbyNavBtn).not.toHaveAttribute('aria-current');
    expect(classicalWingBtn).toHaveAttribute('aria-current', 'page');
    expect(historicalWingBtn).not.toHaveAttribute('aria-current');

    expect(lobbyNavBtn.className).toContain('focus-visible:ring-2');
    expect(classicalWingBtn.className).toContain('focus-visible:ring-2');

    // Return to lobby button should also have focus indicator
    const returnToLobbyBtn = screen.getByRole('button', { name: /lobby entrance/i });
    expect(returnToLobbyBtn.className).toContain('focus-visible:ring-2');
  });

  it('renders MuseumHUD 2D Map toggle, modal dialog role, aria-modal, and supports Escape key dismissal', () => {
    render(
      <MuseumHUD
        currentView="atrium"
        isMacro={false}
        onSelectRoom={jest.fn()}
        onReturnToFoyer={jest.fn()}
      />
    );

    const toggleMapButton = screen.getByRole('button', { name: /toggle 2d museum floorplan map/i });
    expect(toggleMapButton).toBeInTheDocument();
    expect(toggleMapButton).toHaveAttribute('aria-expanded', 'false');

    // Click toggle to open map
    fireEvent.click(toggleMapButton);
    expect(toggleMapButton).toHaveAttribute('aria-expanded', 'true');

    // Verify map dialog accessibility attributes
    const dialog = screen.getByRole('dialog', { name: /interactive museum floorplan map/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Verify map close button accessible name and focus visible style
    const closeMapButton = screen.getByRole('button', { name: /close museum floorplan map/i });
    expect(closeMapButton).toBeInTheDocument();
    expect(closeMapButton.className).toContain('focus-visible:ring-2');

    const closeMapTextBtn = screen.getByRole('button', { name: /^close map$/i });
    expect(closeMapTextBtn).toBeInTheDocument();
    expect(closeMapTextBtn.className).toContain('focus-visible:ring-2');

    // Verify pressing Escape key closes the map modal
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(toggleMapButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog', { name: /interactive museum floorplan map/i })).not.toBeInTheDocument();
  });

  it('allows keyboard navigation and activation of 2D floorplan interactive room markers', () => {
    const handleSelectRoom = jest.fn();
    render(
      <MuseumHUD
        currentView="atrium"
        isMacro={false}
        onSelectRoom={handleSelectRoom}
        onReturnToFoyer={jest.fn()}
      />
    );

    // Open map
    const toggleMapButton = screen.getByRole('button', { name: /toggle 2d museum floorplan map/i });
    fireEvent.click(toggleMapButton);

    // Find exhibit room marker button
    const caesarMarker = screen.getByRole('button', { name: /navigate to exhibit caesar cipher/i });
    expect(caesarMarker).toBeInTheDocument();
    expect(caesarMarker).toHaveAttribute('tabindex', '0');

    // Trigger Enter key press on room marker
    fireEvent.keyDown(caesarMarker, { key: 'Enter', code: 'Enter' });
    expect(handleSelectRoom).toHaveBeenCalledWith('caesar');
  });

  it('renders WorkbenchPanel with accessible label input association and aria-live output region', () => {
    render(<WorkbenchPanel exhibit={sampleExhibit} />);

    // Verify textarea is accessible via label
    const inputArea = screen.getByLabelText(/plaintext input/i);
    expect(inputArea).toBeInTheDocument();
    expect(inputArea.tagName).toBe('TEXTAREA');
    expect(inputArea).toHaveAttribute('id', `input-text-${sampleExhibit.id}`);

    // Verify output container has aria-live="polite"
    const outputContainer = screen.getByTestId(`output-text-${sampleExhibit.id}`);
    expect(outputContainer).toHaveAttribute('aria-live', 'polite');
    expect(outputContainer).toHaveAttribute('aria-atomic', 'true');
  });

  it('renders AudioSystem toggle button with accessible aria-label, aria-pressed, and focus styles', () => {
    render(<AudioSystem currentView="atrium" />);

    const audioButton = screen.getByRole('button', { name: /unmute spatial audio/i });
    expect(audioButton).toBeInTheDocument();
    expect(audioButton).toHaveAttribute('aria-pressed', 'false');
    expect(audioButton.className).toContain('focus-visible:ring-2');

    fireEvent.click(audioButton);

    const unmutedButton = screen.getByRole('button', { name: /mute spatial audio/i });
    expect(unmutedButton).toBeInTheDocument();
    expect(unmutedButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders WorkbenchPanel input character counter and clear button action', () => {
    render(<WorkbenchPanel exhibit={sampleExhibit} />);

    const inputArea = screen.getByLabelText(/plaintext input/i);
    expect(screen.getByText('18 chars')).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /clear input text/i });
    expect(clearBtn).toBeInTheDocument();
    expect(clearBtn.className).toContain('focus-visible:ring-2');

    fireEvent.click(clearBtn);

    expect(inputArea).toHaveValue('');
    expect(screen.getByText('0 chars')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /clear input text/i })).not.toBeInTheDocument();
  });

  it('renders WorkbenchPanel parameter inputs with accessible labels and ARIA attributes', () => {
    // Test Caesar exhibit shift parameter input label association
    const caesarExhibit = MUSEUM_EXHIBITS.find((e) => e.id === 'caesar') || sampleExhibit;
    render(<WorkbenchPanel exhibit={caesarExhibit} />);

    const shiftInput = screen.getByLabelText(/shift value/i);
    expect(shiftInput).toBeInTheDocument();
    expect(shiftInput).toHaveAttribute('id', `param-shift-${caesarExhibit.id}`);
  });

  it('renders ApiStatusDot with accessible role="status", aria-label, tabIndex, and focus styles', () => {
    render(<ApiStatusDot />);

    const statusWidget = screen.getByRole('status');
    expect(statusWidget).toBeInTheDocument();
    expect(statusWidget).toHaveAttribute('tabindex', '0');
    expect(statusWidget).toHaveAttribute('aria-label');
    expect(statusWidget.className).toContain('focus-visible:ring-2');
  });

  it('renders StatueCuratorialDrawer tab switchers with accessible tab roles, aria-selected, and focus styles', () => {
    const diffieHellman = MUSEUM_STATUES.find((s) => s.id === 'statue-diffie-hellman')!;
    render(<StatueCuratorialDrawer statue={diffieHellman} onClose={jest.fn()} />);

    // Verify main tablist
    const mainTabList = screen.getByRole('tablist', { name: /statue details view mode/i });
    expect(mainTabList).toBeInTheDocument();

    const curationTab = screen.getByRole('tab', { name: /historical curation/i });
    const labTab = screen.getByRole('tab', { name: /interactive pioneer lab/i });

    expect(curationTab).toHaveAttribute('aria-selected', 'true');
    expect(labTab).toHaveAttribute('aria-selected', 'false');
    expect(curationTab.className).toContain('focus-visible:ring-2');
    expect(labTab.className).toContain('focus-visible:ring-2');

    // Switch to Pioneer Lab
    fireEvent.click(labTab);
    expect(curationTab).toHaveAttribute('aria-selected', 'false');
    expect(labTab).toHaveAttribute('aria-selected', 'true');

    // Verify sub-tablist for Key exchange concept explanation
    const subTabList = screen.getByRole('tablist', { name: /key exchange concept explanation/i });
    expect(subTabList).toBeInTheDocument();

    const dhMathTab = screen.getByRole('tab', { name: /diffie-hellman math/i });
    const merklePuzzleTab = screen.getByRole('tab', { name: /ralph merkle's puzzles/i });

    expect(dhMathTab).toHaveAttribute('aria-selected', 'true');
    expect(merklePuzzleTab).toHaveAttribute('aria-selected', 'false');
    expect(dhMathTab.className).toContain('focus-visible:ring-2');
    expect(merklePuzzleTab.className).toContain('focus-visible:ring-2');

    // Switch sub-tab
    fireEvent.click(merklePuzzleTab);
    expect(dhMathTab).toHaveAttribute('aria-selected', 'false');
    expect(merklePuzzleTab).toHaveAttribute('aria-selected', 'true');
  });

  it('renders RSA parameter inputs and keygen button with accessible labels and focus styles', () => {
    const rsaExhibit = MUSEUM_EXHIBITS.find((e) => e.id === 'rsa')!;
    render(<WorkbenchPanel exhibit={rsaExhibit} />);

    const pInput = screen.getByLabelText(/rsa prime p/i);
    const qInput = screen.getByLabelText(/rsa prime q/i);
    const eInput = screen.getByLabelText(/rsa public exponent e/i);
    const keygenBtn = screen.getByRole('button', { name: /generate rsa keypair/i });

    expect(pInput).toBeInTheDocument();
    expect(qInput).toBeInTheDocument();
    expect(eInput).toBeInTheDocument();
    expect(keygenBtn).toBeInTheDocument();

    expect(pInput.className).toContain('focus-visible:ring-2');
    expect(qInput.className).toContain('focus-visible:ring-2');
    expect(eInput.className).toContain('focus-visible:ring-2');
    expect(keygenBtn.className).toContain('focus-visible:ring-2');
  });

  it('renders Lorenz wheel inputs and reset button with accessible labels and focus styles', () => {
    const lorenzExhibit = MUSEUM_EXHIBITS.find((e) => e.id === 'lorenz')!;
    render(<WorkbenchPanel exhibit={lorenzExhibit} />);

    const chi1Input = screen.getByLabelText(/chi wheel 1 position/i);
    const motor1Input = screen.getByLabelText(/motor wheel 1 position/i);
    const psi1Input = screen.getByLabelText(/psi wheel 1 position/i);
    const resetBtn = screen.getByRole('button', { name: /reset all lorenz wheel positions to zero/i });

    expect(chi1Input).toBeInTheDocument();
    expect(motor1Input).toBeInTheDocument();
    expect(psi1Input).toBeInTheDocument();
    expect(resetBtn).toBeInTheDocument();

    expect(chi1Input.className).toContain('focus-visible:ring-2');
    expect(resetBtn.className).toContain('focus-visible:ring-2');
  });

  it('renders WorkbenchPanel copy button with accessible mode-specific tooltip and aria-label', async () => {
    // Mock navigator.clipboard.writeText
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(<WorkbenchPanel exhibit={sampleExhibit} />);

    // Trigger encryption execution by rendering component state with mock output or simulate output
    const inputArea = screen.getByLabelText(/plaintext input/i);
    fireEvent.change(inputArea, { target: { value: 'TEST PLAINTEXT' } });

    // Execute button to trigger output
    const executeBtn = screen.getByRole('button', { name: /execute encrypt/i });

    // Mock global fetch for API response
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ciphertext: 'KHOOR' }),
      })
    ) as jest.Mock;

    await React.act(async () => {
      fireEvent.click(executeBtn);
    });

    // Wait for output copy button to render
    const copyButton = await screen.findByRole('button', { name: /copy ciphertext result to clipboard/i });
    expect(copyButton).toBeInTheDocument();
    expect(copyButton).toHaveAttribute('title', 'Copy ciphertext result to clipboard');

    // Click copy button inside act to handle setCopied state update
    await React.act(async () => {
      fireEvent.click(copyButton);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('KHOOR');

    // Verify screen-reader live status element updates with polite feedback
    const liveStatus = screen.getByRole('status');
    expect(liveStatus).toHaveTextContent('Copied ciphertext to clipboard');
  });

  it('renders StatueCuratorialDrawer Pioneer Lab controls with accessible labels, ARIA attributes, and focus styles', () => {
    const kindiStatue = MUSEUM_STATUES.find((s) => s.id === 'statue-alkindi')!;
    render(<StatueCuratorialDrawer statue={kindiStatue} onClose={jest.fn()} />);

    // Switch to Pioneer Lab tab
    const labTab = screen.getByRole('tab', { name: /interactive pioneer lab/i });
    fireEvent.click(labTab);

    // Al-Kindi Lab inputs
    const kindiTextarea = screen.getByLabelText(/ciphertext sample/i);
    expect(kindiTextarea).toBeInTheDocument();
    expect(kindiTextarea).toHaveAttribute('id', 'kindi-ciphertext-input');
    expect(kindiTextarea.className).toContain('focus-visible:ring-2');

    const kindiShiftInput = screen.getByLabelText(/test caesar shift key/i);
    expect(kindiShiftInput).toBeInTheDocument();
    expect(kindiShiftInput).toHaveAttribute('id', 'kindi-shift-input');
    expect(kindiShiftInput.className).toContain('focus-visible:ring-2');

    const presetShiftBtn = screen.getByRole('button', { name: /set caesar shift key to default value of 3/i });
    expect(presetShiftBtn).toBeInTheDocument();
    expect(presetShiftBtn.className).toContain('focus-visible:ring-2');
  });

  it('renders MuseumCanvas lobby statue buttons and inspect buttons with focus-visible focus ring styles', () => {
    render(<MuseumCanvas />);

    // Verify monument button focus-visible styling
    const alKindiMonumentBtn = screen.getByRole('button', { name: /al-kindi/i });
    expect(alKindiMonumentBtn).toBeInTheDocument();
    expect(alKindiMonumentBtn.className).toContain('focus-visible:ring-2');
    expect(alKindiMonumentBtn.className).toContain('focus-visible:ring-amber-500');
  });

  it('renders Enigma rotor selectors with accessible group role, aria-labelledby, and assigned IDs', () => {
    const enigmaExhibit = MUSEUM_EXHIBITS.find((e) => e.id === 'enigma')!;
    render(<WorkbenchPanel exhibit={enigmaExhibit} />);

    const rotorGroup = screen.getByRole('group', { name: /rotors \(select i - viii\):/i });
    expect(rotorGroup).toBeInTheDocument();
    expect(rotorGroup).toHaveAttribute('aria-labelledby', `param-rotors-label-${enigmaExhibit.id}`);

    const rotor1 = screen.getByRole('combobox', { name: /enigma rotor 1/i });
    const rotor2 = screen.getByRole('combobox', { name: /enigma rotor 2/i });
    const rotor3 = screen.getByRole('combobox', { name: /enigma rotor 3/i });

    expect(rotor1).toBeInTheDocument();
    expect(rotor2).toBeInTheDocument();
    expect(rotor3).toBeInTheDocument();

    expect(rotor1).toHaveAttribute('id', `param-rotor-0-${enigmaExhibit.id}`);
    expect(rotor2).toHaveAttribute('id', `param-rotor-1-${enigmaExhibit.id}`);
    expect(rotor3).toHaveAttribute('id', `param-rotor-2-${enigmaExhibit.id}`);
  });
});
