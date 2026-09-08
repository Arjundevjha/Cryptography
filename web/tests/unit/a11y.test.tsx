import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArtifactMetadataDrawer } from '../../src/components/museum/workbench/ArtifactMetadataDrawer';
import { MuseumHUD } from '../../src/components/museum/hud/MuseumHUD';
import { StatueCuratorialDrawer } from '../../src/components/museum/workbench/StatueCuratorialDrawer';
import { MUSEUM_EXHIBITS, MUSEUM_STATUES } from '../../src/components/museum/museumData';

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

  it('renders StatueCuratorialDrawer tabs with accessible tablist, tabs, aria-selected, and tabpanels', () => {
    const handleClose = jest.fn();
    const alkindi = MUSEUM_STATUES[0];

    render(<StatueCuratorialDrawer statue={alkindi} onClose={handleClose} />);

    // Verify tablist and tab roles
    const tablist = screen.getByRole('tablist', { name: /statue details views/i });
    expect(tablist).toBeInTheDocument();

    const curationTab = screen.getByRole('tab', { name: /historical curation/i });
    const labTab = screen.getByRole('tab', { name: /interactive pioneer lab/i });

    expect(curationTab).toBeInTheDocument();
    expect(labTab).toBeInTheDocument();

    // Verify initial active tab state
    expect(curationTab).toHaveAttribute('aria-selected', 'true');
    expect(labTab).toHaveAttribute('aria-selected', 'false');

    // Verify tabpanel role
    const curationPanel = screen.getByRole('tabpanel', { name: /historical curation/i });
    expect(curationPanel).toBeInTheDocument();

    // Click lab tab
    fireEvent.click(labTab);

    expect(curationTab).toHaveAttribute('aria-selected', 'false');
    expect(labTab).toHaveAttribute('aria-selected', 'true');

    const labPanel = screen.getByRole('tabpanel', { name: /interactive pioneer lab/i });
    expect(labPanel).toBeInTheDocument();
  });
});
