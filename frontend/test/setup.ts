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
    // Suppress React DOM nesting warnings
    if (message.includes('validateDOMNesting') ||
        message.includes('<html> cannot appear as a child of <div>') ||
        message.includes('Warning: validateDOMNesting')) {
      return;
    }
  }
  originalError(...args);
};

console.warn = (...args: any[]) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress React Router warnings and DOM nesting warnings
    if (message.includes('React Router Future Flag Warning') ||
        message.includes('validateDOMNesting') ||
        message.includes('<html> cannot appear as a child of <div>') ||
        message.includes('Warning: validateDOMNesting')) {
      return;
    }
  }
  originalWarn(...args);
};