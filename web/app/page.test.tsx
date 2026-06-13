import { render, screen } from '@testing-library/react';
import React from 'react';
import Home from './page';

test('renders heading and content', () => {
  render(<Home />);
  // Museum title appears in the hero heading, about section, and footer
  expect(screen.getAllByText(/Cryptography Museum/i).length).toBeGreaterThan(0);
  // Cipher names appear in both the timeline nav and exhibit headings — use getAllByText
  expect(screen.getAllByText(/Caesar Cipher/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Vigenère/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Affine Cipher/i).length).toBeGreaterThan(0);
});
