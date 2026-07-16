import '@testing-library/jest-dom';

// Mock IntersectionObserver which is not available in jsdom
window.IntersectionObserver = function() {
  return {
    observe: () => {},
    unobserve: () => {},
    disconnect: () => {}
  };
} as any;

// Mock window.matchMedia which is not available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollIntoView which is not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = jest.fn();
