import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArtifactMetadataDrawer } from '../../src/components/museum/workbench/ArtifactMetadataDrawer';
import { MuseumHUD } from '../../src/components/museum/hud/MuseumHUD';
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

  it('renders WorkbenchPanel inputs with associated labels and live region for output', () => {
    const { WorkbenchPanel } = require('../../src/components/museum/workbench/WorkbenchPanel');
    render(<WorkbenchPanel exhibit={sampleExhibit} />);

    // Check textarea is associated with label via htmlFor / id
    const textarea = screen.getByLabelText(/plaintext input/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');

    // Check shift input is associated with label
    const shiftInput = screen.getByLabelText(/shift value/i);
    expect(shiftInput).toBeInTheDocument();

    // Check output box has role="status" and aria-live="polite"
    const outputBox = screen.getByTestId(`output-text-${sampleExhibit.id}`);
    expect(outputBox).toHaveAttribute('role', 'status');
    expect(outputBox).toHaveAttribute('aria-live', 'polite');
  });

  it('renders MuseumHUD wing buttons with descriptive aria-labels', () => {
    render(
      <MuseumHUD
        currentView="atrium"
        isMacro={false}
        onSelectRoom={jest.fn()}
        onReturnToFoyer={jest.fn()}
      />
    );

    const lobbyBtn = screen.getByRole('button', { name: /navigate to museum lobby/i });
    expect(lobbyBtn).toBeInTheDocument();

    const wingBtn = screen.getByRole('button', { name: /navigate to classical ciphers wing/i });
    expect(wingBtn).toBeInTheDocument();
  });
});
