// Matchers do jest-dom (toBeInTheDocument etc.) no Vitest.
import '@testing-library/jest-dom/vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// localStorage: usa o Storage real do jsdom (os testes de persistência dependem dele).

// Mock Audio
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  volume: 1,
  currentTime: 0,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

// Mock canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}));

// Suppress console errors in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};
