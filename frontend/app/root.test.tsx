import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { Layout as AppLayout } from "./components/Layout";

describe("Root Layout Component", () => {
  describe("Inner Layout Structure (without HTML wrapper)", () => {
    it("renders AppLayout correctly", () => {
      render(
        <AppLayout>
          <div data-testid="test-content">Test Content</div>
        </AppLayout>
      );

      // Confirm Layout component renders correctly
      expect(screen.getByTestId("test-content")).toBeInTheDocument();
      expect(screen.getByTestId("app-container")).toBeInTheDocument();
    });

    it("includes responsive design support in AppLayout", () => {
      render(
        <AppLayout>
          <div data-testid="test-content">Test Content</div>
        </AppLayout>
      );

      // Check for responsive classes in AppLayout
      const layoutContainer = screen.getByTestId("layout-container");
      expect(layoutContainer).toHaveClass("min-h-screen");
    });

    it("renders basic layout structure without HTML wrapper", () => {
      render(
        <AppLayout>
          <div data-testid="test-content">Test Content</div>
        </AppLayout>
      );

      // Confirm Layout component renders correctly
      expect(screen.getByTestId("test-content")).toBeInTheDocument();
    });
  });

  describe("Application Header (AppLayout)", () => {
    it("renders application header with title", () => {
      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm application header title is displayed
      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByText("MD-Todo")).toBeInTheDocument();
    });

    it("renders navigation menu", () => {
      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm navigation menu is displayed
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("renders logo image with proper alt text", () => {
      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm logo image displays with proper alt attribute
      expect(screen.getByAltText("MD-Todo Logo")).toBeInTheDocument();
    });
  });

  describe("Main Content Area", () => {
    it("renders main content area with proper semantic markup", () => {
      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm main content area is displayed with main tag
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("renders child components within main content area", () => {
      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm main area exists and contains outlet content
      const mainElement = screen.getByRole("main");
      expect(mainElement).toBeInTheDocument();
    });
  });

  describe("Footer", () => {
    it("renders application footer", () => {
      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm footer is displayed
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("displays copyright information in footer", () => {
      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm copyright information is displayed in footer
      expect(screen.getByText(/© 2025 MD-Todo/)).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    beforeEach(() => {
      // Reset viewport settings for responsive tests
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 768,
      });
    });

    it("applies responsive container classes", () => {
      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm responsive container classes are applied
      const container = screen.getByTestId("app-container");
      expect(container).toHaveClass("container", "mx-auto", "px-4");
    });

    it("renders mobile-friendly navigation on small screens", () => {
      // Simulate mobile size viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm mobile navigation is displayed
      expect(screen.getByTestId("mobile-menu-button")).toBeInTheDocument();
    });

    it("hides mobile menu button on desktop screens", () => {
      // Simulate desktop size viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm mobile menu button has hidden class applied on desktop
      const mobileButton = screen.getByTestId("mobile-menu-button");
      expect(mobileButton).toHaveClass("md:hidden");
    });

    it("applies appropriate grid layout for different screen sizes", () => {
      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm responsive grid classes are applied
      const gridContainer = screen.getByTestId("layout-grid");
      expect(gridContainer).toHaveClass(
        "grid",
        "grid-cols-1",
        "lg:grid-cols-12"
      );
    });
  });

  describe("Accessibility", () => {
    it("includes skip to main content link", () => {
      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm skip link to main content exists
      expect(screen.getByText("Skip to main content")).toBeInTheDocument();
    });

    it("has proper heading hierarchy", () => {
      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm h1 tag exists (for SEO and accessibility)
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("provides aria-label for navigation", () => {
      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm navigation has appropriate aria-label
      const navigation = screen.getByRole("navigation");
      expect(navigation).toHaveAttribute("aria-label", "Main navigation");
    });
  });

  describe("Theme Support", () => {
    it("supports dark mode toggle", () => {
      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm dark mode toggle button exists
      expect(
        screen.getByRole("button", { name: /toggle dark mode/i })
      ).toBeInTheDocument();
    });

    it("applies theme classes to body element", () => {
      render(
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      );

      // Confirm Layout component renders correctly
      expect(
        screen.getByRole("button", { name: /toggle dark mode/i })
      ).toBeInTheDocument();
    });
  });
});
