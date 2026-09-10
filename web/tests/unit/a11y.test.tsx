import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArtifactMetadataDrawer } from '../../src/components/museum/workbench/ArtifactMetadataDrawer';
import { MuseumHUD } from '../../src/components/museum/hud/MuseumHUD';
import { WorkbenchPanel } from '../../src/components/museum/workbench/WorkbenchPanel';
import { AudioSystem } from '../../src/components/museum/AudioSystem';
import { MUSEUM_EXHIBITS } from '../../src/components/museum/museumData';

describe('Accessibility (A11y) Unit Tests', () => {
  const sampleExhibit = MUSEUM_EXHIBITS[0];

  it('renders ArtifactMetadataDrawer close button with accessible aria-label', () => {
    const handleClose = jest.fn();
    render(<ArtifactMetadataDrawer exhibit={sampleExhibit} onClose={handleClose} />);

    const closeButton = screen.getByRole('button', { name: /close artifact details/i });
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
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
});
