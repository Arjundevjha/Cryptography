import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArtifactMetadataDrawer } from '../../src/components/museum/workbench/ArtifactMetadataDrawer';
import { MuseumHUD } from '../../src/components/museum/hud/MuseumHUD';
import { WorkbenchPanel } from '../../src/components/museum/workbench/WorkbenchPanel';
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

  it('renders WorkbenchPanel with proper input label association and aria-pressed attributes', () => {
    render(<WorkbenchPanel exhibit={sampleExhibit} />);

    // Label and Input connection
    const inputLabel = screen.getByLabelText(/plaintext input/i);
    expect(inputLabel).toBeInTheDocument();
    expect(inputLabel).toHaveAttribute('id', `workbench-input-${sampleExhibit.id}`);

    // Mode Toggle Buttons ARIA pressed states
    const encryptBtn = screen.getByTestId(`encrypt-btn-${sampleExhibit.id}`);
    const decryptBtn = screen.getByTestId(`decrypt-btn-${sampleExhibit.id}`);

    expect(encryptBtn).toHaveAttribute('aria-pressed', 'true');
    expect(decryptBtn).toHaveAttribute('aria-pressed', 'false');

    // Toggle mode
    fireEvent.click(decryptBtn);
    expect(encryptBtn).toHaveAttribute('aria-pressed', 'false');
    expect(decryptBtn).toHaveAttribute('aria-pressed', 'true');

    // Check updated label
    const ciphertextLabel = screen.getByLabelText(/ciphertext input/i);
    expect(ciphertextLabel).toBeInTheDocument();
  });
});
