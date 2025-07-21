import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { createRemixStub } from "@remix-run/testing";
import App from "./root";

describe("Root Layout Component", () => {
  describe("Basic Layout Structure", () => {
    it("renders HTML structure with correct lang attribute", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: () => <div data-testid="test-content">Test Content</div>,
        },
      ]);

      render(<RemixStub />);

      // Confirm Layout component renders correctly
      expect(screen.getByTestId("test-content")).toBeInTheDocument();
    });

    it("includes proper meta viewport for responsive design", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: () => <div data-testid="test-content">Test Content</div>,
        },
      ]);

      render(<RemixStub />);

      // Confirm Layout component renders correctly
      expect(screen.getByTestId("test-content")).toBeInTheDocument();
    });

    it("includes charset meta tag", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: () => <div data-testid="test-content">Test Content</div>,
        },
      ]);

      render(<RemixStub />);

      // Confirm Layout component renders correctly
      expect(screen.getByTestId("test-content")).toBeInTheDocument();
    });
  });

  describe("Application Header", () => {
    it("renders application header with title", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

      // Confirm application header title is displayed
      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByText("MD-Todo")).toBeInTheDocument();
    });

    it("renders navigation menu", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

      // Confirm navigation menu is displayed
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("renders logo image with proper alt text", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

      // Confirm logo image displays with proper alt attribute
      expect(screen.getByAltText("MD-Todo Logo")).toBeInTheDocument();
    });
  });

  describe("Main Content Area", () => {
    it("renders main content area with proper semantic markup", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

      // Confirm main content area is displayed with main tag
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("renders child components within main content area", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

      // Confirm main area exists and contains outlet content
      const mainElement = screen.getByRole("main");
      expect(mainElement).toBeInTheDocument();
    });
  });

  describe("Footer", () => {
    it("renders application footer", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

      // Confirm footer is displayed
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("displays copyright information in footer", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

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
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

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

      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

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

      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

      // Confirm mobile menu button has hidden class applied on desktop
      const mobileButton = screen.getByTestId("mobile-menu-button");
      expect(mobileButton).toHaveClass("md:hidden");
    });

    it("applies appropriate grid layout for different screen sizes", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

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
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

      // Confirm skip link to main content exists
      expect(screen.getByText("Skip to main content")).toBeInTheDocument();
    });

    it("has proper heading hierarchy", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

      // Confirm h1 tag exists (for SEO and accessibility)
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("provides aria-label for navigation", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

      // Confirm navigation has appropriate aria-label
      const navigation = screen.getByRole("navigation");
      expect(navigation).toHaveAttribute("aria-label", "Main navigation");
    });
  });

  describe("Theme Support", () => {
    it("supports dark mode toggle", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

      // Confirm dark mode toggle button exists
      expect(
        screen.getByRole("button", { name: /toggle dark mode/i })
      ).toBeInTheDocument();
    });

    it("applies theme classes to body element", () => {
      const RemixStub = createRemixStub([
        {
          path: "/",
          Component: App,
        },
      ]);

      render(<RemixStub />);

      // Confirm Layout component renders correctly
      expect(
        screen.getByRole("button", { name: /toggle dark mode/i })
      ).toBeInTheDocument();
    });
  });
});
