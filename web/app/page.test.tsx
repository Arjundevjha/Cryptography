import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Home from './page';

test('renders heading and content', () => {
  render(<Home />);
  // Museum title appears once in the hero heading
  expect(screen.getByText(/🔒 Cryptography Museum/i)).toBeInTheDocument();
  // Cipher names appear in both the timeline nav and exhibit headings — use getAllByText
  expect(screen.getAllByText(/Caesar Cipher/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Vigenère/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Affine Cipher/i).length).toBeGreaterThan(0);
});
