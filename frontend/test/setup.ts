import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.scrollTo to fix the "Not implemented" warning
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

// Suppress React Router future flag warnings during testing
const originalConsoleWarn = console.warn;
console.warn = (message: string, ...args: any[]) => {
  if (typeof message === 'string' && message.includes('React Router Future Flag Warning')) {
    return; // Suppress the warning
  }
  originalConsoleWarn(message, ...args);
};