import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  MuseumHUD,
  PASSPORT_STORAGE_KEY,
  PASSPORT_UPDATED_EVENT,
} from '../../src/components/museum/hud/MuseumHUD';
import { MuseumCanvas } from '../../src/components/museum/MuseumCanvas';
import { MUSEUM_EXHIBITS, MUSEUM_WINGS } from '../../src/components/museum/museumData';

jest.mock('../../src/components/museum/ThreeMuseumScene', () => {
  return function DummyThreeMuseumScene() {
    return <div data-testid="mock-three-scene" />;
  };
});

describe('MuseumHUD Passport & Guided Tour Mode', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('displays Passport progress badge from localStorage and updates live on museum-passport-updated', () => {
    const firstId = MUSEUM_EXHIBITS[0].id;
    const secondId = MUSEUM_EXHIBITS[1].id;
    window.localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify([firstId, 'non-existent-id']));

    render(
      <MuseumHUD
        currentView="atrium"
        onSelectRoom={jest.fn()}
        onReturnToFoyer={jest.fn()}
      />
    );

    const badge = screen.getByTestId('passport-progress-badge');
    expect(badge).toHaveTextContent(`1/${MUSEUM_EXHIBITS.length}`);

    act(() => {
      window.localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify([firstId, secondId]));
      window.dispatchEvent(new Event(PASSPORT_UPDATED_EVENT));
    });

    expect(badge).toHaveTextContent(`2/${MUSEUM_EXHIBITS.length}`);
  });

  it('supports switching to All Wings tour mode across MUSEUM_WINGS and stepping through exhibits', () => {
    render(<MuseumCanvas />);

    fireEvent.click(screen.getByRole('button', { name: /toggle guided historical tour/i }));
    const allWingsBtn = screen.getByRole('button', { name: /all wings/i });
    fireEvent.click(allWingsBtn);

    expect(allWingsBtn).toHaveAttribute('aria-pressed', 'true');
    // First stop in All Wings mode is the first wing in MUSEUM_WINGS
    expect(screen.getAllByText(MUSEUM_WINGS[0].name).length).toBeGreaterThan(0);

    // Advance to the next stop (first exhibit in Classical Wing)
    fireEvent.click(screen.getByRole('button', { name: /next tour stop/i }));
    const firstClassical = MUSEUM_EXHIBITS.find((e) => e.category === MUSEUM_WINGS[0].category);
    if (firstClassical) {
      expect(screen.getAllByText(firstClassical.name).length).toBeGreaterThan(0);
    }

    // Previous tour stop returns to the first wing
    fireEvent.click(screen.getByRole('button', { name: /previous tour stop/i }));
    expect(screen.getAllByText(MUSEUM_WINGS[0].name).length).toBeGreaterThan(0);

    // Exit tour closes the docent bar
    fireEvent.click(screen.getByRole('button', { name: /end guided historical tour/i }));
    expect(screen.queryByRole('region', { name: /guided historical tour/i })).not.toBeInTheDocument();
  });
});
