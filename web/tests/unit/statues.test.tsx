import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MUSEUM_STATUES } from '../../src/components/museum/museumData';
import { StatueCuratorialDrawer } from '../../src/components/museum/workbench/StatueCuratorialDrawer';
import { MuseumHUD } from '../../src/components/museum/hud/MuseumHUD';

describe('Founding Fathers Cryptographic Statues Unit Tests', () => {
  it('defines valid data and citations for all three founding pioneers', () => {
    expect(MUSEUM_STATUES).toHaveLength(3);

    const alkindi = MUSEUM_STATUES.find((s) => s.id === 'statue-alkindi');
    expect(alkindi).toBeDefined();
    expect(alkindi?.description).toContain('father of cryptanalysis');
    expect(alkindi?.description).toContain('Manuscript on Deciphering Cryptographic Messages');
    expect(alkindi?.description).toContain('frequency analysis');
    expect(alkindi?.description).toContain('monoalphabetic substitution ciphers could be systematically broken');

    const shannon = MUSEUM_STATUES.find((s) => s.id === 'statue-shannon');
    expect(shannon).toBeDefined();
    expect(shannon?.description).toContain('architect of mathematical cryptography');
    expect(shannon?.description).toContain('Communication Theory of Secrecy Systems');
    expect(shannon?.description).toContain('information theory');
    expect(shannon?.description).toContain('absolute secrecy of the one-time pad');

    const diffieHellman = MUSEUM_STATUES.find((s) => s.id === 'statue-diffie-hellman');
    expect(diffieHellman).toBeDefined();
    expect(diffieHellman?.description).toContain('New Directions in Cryptography');
    expect(diffieHellman?.description).toContain('public-key cryptography');
    expect(diffieHellman?.description).toContain('Diffie–Hellman key exchange');
    expect(diffieHellman?.description).toContain('key distribution problem');
    expect(diffieHellman?.description).toContain('Ralph Merkle');
  });

  it('renders StatueCuratorialDrawer with accessible labels and handles tab switching', () => {
    const handleClose = jest.fn();
    const alkindi = MUSEUM_STATUES[0];

    render(<StatueCuratorialDrawer statue={alkindi} onClose={handleClose} />);

    // Accessible dialog check
    const dialog = screen.getByRole('dialog', { name: new RegExp(`Statue details for ${alkindi.name}`, 'i') });
    expect(dialog).toBeInTheDocument();

    // Close button accessibility
    const closeBtn = screen.getByRole('button', { name: /close statue details/i });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Initial Historical Curation Tab contains the citation
    expect(screen.getByText(/Curatorial Landmark Citation/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(alkindi.description, 'i'))).toBeInTheDocument();

    // Switch to Interactive Pioneer Lab Tab
    const labTabBtn = screen.getByRole('button', { name: /interactive pioneer lab/i });
    fireEvent.click(labTabBtn);

    // Verify Al-Kindi Frequency Analysis components
    expect(screen.getByText(/Letter Frequency Histogram/i)).toBeInTheDocument();
    expect(screen.getByText(/STATISTICAL DECRYPT PREVIEW:/i)).toBeInTheDocument();
  });

  it('renders Claude Shannon interactive Information Entropy and OTP stream lab', () => {
    const handleClose = jest.fn();
    const shannon = MUSEUM_STATUES.find((s) => s.id === 'statue-shannon')!;

    render(<StatueCuratorialDrawer statue={shannon} onClose={handleClose} />);

    // Switch to Lab tab
    const labTabBtn = screen.getByRole('button', { name: /interactive pioneer lab/i });
    fireEvent.click(labTabBtn);

    expect(screen.getByText(/Plaintext Entropy H\(M\)/i)).toBeInTheDocument();
    expect(screen.getByText(/OTP Ciphertext H\(C\)/i)).toBeInTheDocument();
    expect(screen.getByText(/One-Time Pad Stream/i)).toBeInTheDocument();

    // Test re-rolling keystream
    const rerollBtn = screen.getByRole('button', { name: /re-roll keystream/i });
    expect(rerollBtn).toBeInTheDocument();
    fireEvent.click(rerollBtn);
  });

  it('renders Diffie-Hellman Key Exchange and Ralph Merkle Puzzles tab', () => {
    const handleClose = jest.fn();
    const diffieHellman = MUSEUM_STATUES.find((s) => s.id === 'statue-diffie-hellman')!;

    render(<StatueCuratorialDrawer statue={diffieHellman} onClose={handleClose} />);

    // Switch to Lab tab
    const labTabBtn = screen.getByRole('button', { name: /interactive pioneer lab/i });
    fireEvent.click(labTabBtn);

    expect(screen.getByText(/PUBLIC PRIME \(p\):/i)).toBeInTheDocument();
    expect(screen.getByText(/PUBLIC GENERATOR \(g\):/i)).toBeInTheDocument();
    expect(screen.getByText(/AGREED SHARED SECRET KEY \(S\)/i)).toBeInTheDocument();

    // Switch to Merkle's Puzzles explainer
    const merkleToggle = screen.getByRole('button', { name: /ralph merkle's puzzles/i });
    fireEvent.click(merkleToggle);
    expect(screen.getByText(/Ralph Merkle's Independent Puzzles \(1974\)/i)).toBeInTheDocument();
    expect(screen.getByText(/quadratic computational asymmetry/i)).toBeInTheDocument();
  });

  it('renders MuseumHUD subtext and 2D map markers for statues', () => {
    const handleSelectRoom = jest.fn();
    const handleReturnToFoyer = jest.fn();

    render(
      <MuseumHUD
        currentView="statue-alkindi"
        isMacro={false}
        onSelectRoom={handleSelectRoom}
        onReturnToFoyer={handleReturnToFoyer}
      />
    );

    // Verify subtext displays pioneer monument name
    expect(screen.getByText(/Pioneer Monument • Al-Kindi/i)).toBeInTheDocument();

    // Open 2D Map
    const toggleMapButton = screen.getByRole('button', { name: /toggle 2d museum floorplan map/i });
    fireEvent.click(toggleMapButton);

    // Verify map markers exist for the statues
    expect(screen.getByText('Al-Kindi')).toBeInTheDocument();
    expect(screen.getByText('Claude')).toBeInTheDocument();
    expect(screen.getByText('Whitfield')).toBeInTheDocument();

    // Click a statue marker in 2D Map
    const shannonMarker = screen.getByText('Claude');
    fireEvent.click(shannonMarker);
    expect(handleSelectRoom).toHaveBeenCalledWith('statue-shannon');
  });
});
