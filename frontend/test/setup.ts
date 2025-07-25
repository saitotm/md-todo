import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.scrollTo to fix the "Not implemented" warning
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

// Suppress React development warnings during testing
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Allow DOM nesting warnings to show for now - will address properly
    if (false) {
      return;
    }
  }
  originalError(...args);
};

console.warn = (...args: any[]) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress React Router warnings only
    if (message.includes('React Router Future Flag Warning')) {
      return;
    }
  }
  originalWarn(...args);
};