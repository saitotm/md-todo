import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock window.scrollTo to fix the "Not implemented" warning
Object.defineProperty(window, "scrollTo", {
  value: vi.fn(),
  writable: true,
});
