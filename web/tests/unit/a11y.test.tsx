import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArtifactMetadataDrawer } from '../../src/components/museum/workbench/ArtifactMetadataDrawer';
import { AudioSystem } from '../../src/components/museum/AudioSystem';
import { MuseumHUD } from '../../src/components/museum/hud/MuseumHUD';
import { MUSEUM_EXHIBITS } from '../../src/components/museum/museumData';

describe('Accessibility (A11y) Unit Tests', () => {
  const sampleExhibit = MUSEUM_EXHIBITS[0];

  it('renders ArtifactMetadataDrawer close button and dialog role with accessible aria-label', () => {
    const handleClose = jest.fn();
    render(<ArtifactMetadataDrawer exhibit={sampleExhibit} onClose={handleClose} />);

    const dialog = screen.getByRole('dialog', { name: new RegExp(`curatorial details for ${sampleExhibit.name}`, 'i') });
    expect(dialog).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close artifact details/i });
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders AudioSystem toggle button with accessible aria-label and aria-pressed attributes', () => {
    render(<AudioSystem currentView="atrium" />);

    const audioBtn = screen.getByRole('button', { name: /unmute spatial audio/i });
    expect(audioBtn).toBeInTheDocument();
    expect(audioBtn).toHaveAttribute('aria-pressed', 'false');

    // Click audio button to toggle spatial audio state
    fireEvent.click(audioBtn);
    expect(screen.getByRole('button', { name: /mute spatial audio/i })).toBeInTheDocument();
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
});
