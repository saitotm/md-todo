import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResponsiveLayout } from './ResponsiveLayout';

// Viewport breakpoints for testing
const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = MockResizeObserver;

describe('ResponsiveLayout Component', () => {
  beforeEach(() => {
    // Reset viewport size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: BREAKPOINTS.desktop,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Mobile Layout (< 768px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        value: BREAKPOINTS.mobile,
      });
    });

    it('renders mobile-optimized header layout', () => {
      render(<ResponsiveLayout />);
      
      const header = screen.getByTestId('responsive-header');
      expect(header).toHaveClass('h-16'); // Mobile header height
      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
    });

    it('shows hamburger menu button', () => {
      render(<ResponsiveLayout />);
      
      const hamburgerButton = screen.getByTestId('mobile-menu-button');
      expect(hamburgerButton).toBeInTheDocument();
      expect(hamburgerButton).toHaveAttribute('aria-label', 'Open navigation menu');
    });

    it('hides desktop navigation in mobile view', () => {
      render(<ResponsiveLayout />);
      
      const desktopNav = screen.getByTestId('desktop-navigation');
      expect(desktopNav).toHaveClass('hidden', 'md:flex');
    });

    it('uses single column layout', () => {
      render(<ResponsiveLayout />);
      
      const container = screen.getByTestId('main-container');
      expect(container).toHaveClass('grid-cols-1');
    });

    it('applies mobile-specific padding', () => {
      render(<ResponsiveLayout />);
      
      const container = screen.getByTestId('content-container');
      expect(container).toHaveClass('px-4');
    });

    it('shows mobile menu overlay when opened', async () => {
      render(<ResponsiveLayout />);
      
      const hamburgerButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('mobile-menu-overlay')).toBeInTheDocument();
      });
    });
  });

  describe('Tablet Layout (768px - 1024px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        value: BREAKPOINTS.tablet,
      });
    });

    it('renders tablet-optimized layout', () => {
      render(<ResponsiveLayout />);
      
      const container = screen.getByTestId('main-container');
      expect(container).toHaveClass('md:grid-cols-8', 'lg:grid-cols-12');
    });

    it('shows collapsed navigation for tablet', () => {
      render(<ResponsiveLayout />);
      
      const navigation = screen.getByTestId('tablet-navigation');
      expect(navigation).toBeInTheDocument();
      expect(navigation).toHaveClass('md:flex');
    });

    it('applies tablet-specific spacing', () => {
      render(<ResponsiveLayout />);
      
      const container = screen.getByTestId('content-container');
      expect(container).toHaveClass('sm:px-6');
    });

    it('adjusts header height for tablet', () => {
      render(<ResponsiveLayout />);
      
      const header = screen.getByTestId('responsive-header');
      expect(header).toHaveClass('md:h-20');
    });
  });

  describe('Desktop Layout (>= 1024px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        value: BREAKPOINTS.desktop,
      });
    });

    it('renders full desktop navigation', () => {
      render(<ResponsiveLayout />);
      
      const desktopNav = screen.getByTestId('desktop-navigation');
      expect(desktopNav).toHaveClass('lg:flex');
      expect(desktopNav).not.toHaveClass('hidden');
    });

    it('uses multi-column layout', () => {
      render(<ResponsiveLayout />);
      
      const container = screen.getByTestId('main-container');
      expect(container).toHaveClass('lg:grid-cols-12');
    });

    it('hides mobile menu button', () => {
      render(<ResponsiveLayout />);
      
      const mobileButton = screen.getByTestId('mobile-menu-button');
      expect(mobileButton).toHaveClass('lg:hidden');
    });

    it('applies desktop-specific padding', () => {
      render(<ResponsiveLayout />);
      
      const container = screen.getByTestId('content-container');
      expect(container).toHaveClass('lg:px-8');
    });

    it('shows full-width content area', () => {
      render(<ResponsiveLayout />);
      
      const contentArea = screen.getByTestId('main-content-area');
      expect(contentArea).toHaveClass('lg:col-span-10');
    });
  });

  describe('Wide Screen Layout (>= 1440px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        value: BREAKPOINTS.wide,
      });
    });

    it('applies wide screen optimizations', () => {
      render(<ResponsiveLayout />);
      
      const container = screen.getByTestId('main-container');
      expect(container).toHaveClass('xl:max-w-7xl', 'xl:mx-auto');
    });

    it('uses appropriate content width constraints', () => {
      render(<ResponsiveLayout />);
      
      const contentArea = screen.getByTestId('main-content-area');
      expect(contentArea).toHaveClass('xl:col-span-8', 'xl:col-start-3');
    });
  });

  describe('Responsive Behavior', () => {
    it('handles window resize events', async () => {
      render(<ResponsiveLayout />);
      
      // Start with desktop view
      expect(screen.getByTestId('desktop-navigation')).toHaveClass('lg:flex');
      
      // Simulate resize to mobile
      Object.defineProperty(window, 'innerWidth', { value: BREAKPOINTS.mobile });
      fireEvent(window, new Event('resize'));
      
      await waitFor(() => {
        // Should update layout for mobile
        expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
      });
    });

    it('adapts text size for different screens', () => {
      render(<ResponsiveLayout />);
      
      const title = screen.getByTestId('app-title');
      expect(title).toHaveClass('text-lg', 'md:text-xl', 'lg:text-2xl');
    });

    it('adjusts button sizes for touch interfaces', () => {
      render(<ResponsiveLayout />);
      
      const mobileButton = screen.getByTestId('mobile-menu-button');
      expect(mobileButton).toHaveClass('h-10', 'w-10', 'md:h-12', 'md:w-12');
    });

    it('provides appropriate spacing for different screen densities', () => {
      render(<ResponsiveLayout />);
      
      const spacing = screen.getByTestId('responsive-spacing');
      expect(spacing).toHaveClass('space-y-2', 'md:space-y-4', 'lg:space-y-6');
    });
  });

  describe('Touch and Interaction Optimizations', () => {
    it('provides touch-friendly button sizes on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: BREAKPOINTS.mobile });
      render(<ResponsiveLayout />);
      
      const touchTargets = screen.getAllByRole('button');
      touchTargets.forEach(button => {
        // Touch targets should be at least 44px (iOS) or 48dp (Android)
        expect(button).toHaveClass('min-h-[44px]');
      });
    });

    it('adjusts interactive element spacing for touch', () => {
      Object.defineProperty(window, 'innerWidth', { value: BREAKPOINTS.mobile });
      render(<ResponsiveLayout />);
      
      const touchNavigation = screen.getByTestId('mobile-touch-navigation');
      expect(touchNavigation).toHaveClass('space-y-4'); // More spacing for touch
    });

    it('provides hover states only on non-touch devices', () => {
      render(<ResponsiveLayout />);
      
      const hoverElement = screen.getByTestId('hover-interactive');
      expect(hoverElement).toHaveClass('hover:bg-gray-100');
    });
  });

  describe('Accessibility Across Devices', () => {
    it('maintains focus management across breakpoints', async () => {
      render(<ResponsiveLayout />);
      
      const mobileButton = screen.getByTestId('mobile-menu-button');
      
      // Focus should be trapped in mobile menu when opened
      fireEvent.click(mobileButton);
      
      await waitFor(() => {
        const mobileMenu = screen.getByTestId('mobile-menu');
        expect(mobileMenu).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('provides appropriate ARIA labels for responsive elements', () => {
      render(<ResponsiveLayout />);
      
      const mobileButton = screen.getByTestId('mobile-menu-button');
      expect(mobileButton).toHaveAttribute('aria-label', 'Open navigation menu');
      
      const mobileMenu = screen.getByTestId('mobile-menu');
      expect(mobileMenu).toHaveAttribute('aria-hidden', 'true');
    });

    it('maintains keyboard navigation across screen sizes', () => {
      render(<ResponsiveLayout />);
      
      const navigationItems = screen.getAllByRole('link');
      navigationItems.forEach(link => {
        expect(link).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('lazy loads responsive images', () => {
      render(<ResponsiveLayout />);
      
      const responsiveImages = screen.getAllByRole('img');
      responsiveImages.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });

    it('uses CSS containment for layout optimization', () => {
      render(<ResponsiveLayout />);
      
      const containedElements = screen.getAllByTestId(/container-/);
      containedElements.forEach(element => {
        expect(element).toHaveStyle('contain: layout style');
      });
    });

    it('implements proper content visibility for off-screen elements', () => {
      render(<ResponsiveLayout />);
      
      const offScreenContent = screen.getByTestId('off-screen-content');
      expect(offScreenContent).toHaveStyle('content-visibility: auto');
    });
  });
});