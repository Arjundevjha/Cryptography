import { render, screen, act } from '@testing-library/react';
import React from 'react';
import Home from './page';
import { ApiStatusDot } from '@/src/components/museum/hud/ApiStatusDot';

describe('Cryptography Museum Page Tests', () => {
  it('renders loading state for 3D Digital Museum canvas', () => {
    render(<Home />);
    expect(screen.getByText(/INITIALIZING 3D DIGITAL MUSEUM/i)).toBeInTheDocument();
  });

  it('renders ApiStatusDot with correct data-testid', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      })
    ) as any;

    await act(async () => {
      render(<ApiStatusDot />);
    });

    expect(screen.getByTestId('api-status-dot')).toBeInTheDocument();
  });
});
