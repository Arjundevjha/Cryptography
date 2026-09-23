import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArtifactMetadataDrawer } from '../../src/components/museum/workbench/ArtifactMetadataDrawer';
import { StatueCuratorialDrawer } from '../../src/components/museum/workbench/StatueCuratorialDrawer';
import { MuseumHUD } from '../../src/components/museum/hud/MuseumHUD';
import { WorkbenchPanel } from '../../src/components/museum/workbench/WorkbenchPanel';
import { AudioSystem } from '../../src/components/museum/AudioSystem';
import { ApiStatusDot } from '../../src/components/museum/hud/ApiStatusDot';
import { MUSEUM_EXHIBITS, MUSEUM_STATUES } from '../../src/components/museum/museumData';

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

  it('renders MuseumHUD 2D Map toggle and modal close button with accessible aria-labels', () => {
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

    // Verify map close button accessible name
    const closeMapButton = screen.getByRole('button', { name: /close museum floorplan map/i });
    expect(closeMapButton).toBeInTheDocument();
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

  it('renders StatueCuratorialDrawer with accessible dialog role, ARIA tabs, aria-selected, and focus-visible indicators', () => {
    const handleClose = jest.fn();
    const sampleStatue = MUSEUM_STATUES[0]; // Al-Kindi
    render(<StatueCuratorialDrawer statue={sampleStatue} onClose={handleClose} />);

    const dialog = screen.getByRole('dialog', { name: `Statue details for ${sampleStatue.name}` });
    expect(dialog).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThanOrEqual(2);

    const curationTab = tabs[0];
    const labTab = tabs[1];

    expect(curationTab).toHaveAttribute('aria-selected', 'true');
    expect(labTab).toHaveAttribute('aria-selected', 'false');

    expect(curationTab.className).toContain('focus-visible:ring-2');
    expect(labTab.className).toContain('focus-visible:ring-2');

    // Switch to Interactive Pioneer Lab tab
    fireEvent.click(labTab);
    expect(curationTab).toHaveAttribute('aria-selected', 'false');
    expect(labTab).toHaveAttribute('aria-selected', 'true');

    // Verify slider input aria-label is accessible
    const shiftSlider = screen.getByLabelText(/caesar shift key/i);
    expect(shiftSlider).toBeInTheDocument();
    expect(shiftSlider.className).toContain('focus-visible:ring-2');
  });
});
