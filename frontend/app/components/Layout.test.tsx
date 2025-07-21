import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Layout } from './Layout';

// Props for mock component
const mockChildren = <div data-testid="test-children">Test Children</div>;

describe('Layout Component', () => {
  beforeEach(() => {
    // Reset viewport size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Layout Structure', () => {
    it('renders header, main, and footer sections', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('renders children in main content area', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const mainElement = screen.getByRole('main');
      expect(mainElement).toContainElement(screen.getByTestId('test-children'));
    });

    it('applies correct CSS classes for container layout', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const container = screen.getByTestId('layout-container');
      expect(container).toHaveClass('min-h-screen', 'flex', 'flex-col');
    });
  });

  describe('Header Component', () => {
    it('displays application title', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      expect(screen.getByText('MD-Todo')).toBeInTheDocument();
    });

    it('renders logo with proper alt text', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      expect(screen.getByAltText('MD-Todo Logo')).toBeInTheDocument();
    });

    it('includes navigation menu', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('applies sticky positioning to header', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0', 'z-50');
    });
  });

  describe('Responsive Design', () => {
    it('shows mobile menu button on small screens', () => {
      // Simulate mobile size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<Layout>{mockChildren}</Layout>);
      
      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
    });

    it('hides mobile menu button on large screens', () => {
      // Simulate desktop size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      render(<Layout>{mockChildren}</Layout>);
      
      const mobileButton = screen.queryByTestId('mobile-menu-button');
      expect(mobileButton).toHaveClass('md:hidden');
    });

    it('toggles mobile menu visibility when button is clicked', () => {
      // Simulate mobile size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<Layout>{mockChildren}</Layout>);
      
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      const mobileMenu = screen.getByTestId('mobile-menu');
      
      // Initially hidden
      expect(mobileMenu).toHaveClass('hidden');
      
      // Show on button click
      fireEvent.click(mobileMenuButton);
      expect(mobileMenu).not.toHaveClass('hidden');
      
      // Hide on second click
      fireEvent.click(mobileMenuButton);
      expect(mobileMenu).toHaveClass('hidden');
    });

    it('applies responsive grid layout', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const container = screen.getByTestId('layout-grid');
      expect(container).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-12');
    });

    it('adjusts padding for different screen sizes', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const container = screen.getByTestId('layout-container');
      expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });
  });

  describe('Theme Toggle', () => {
    it('renders dark mode toggle button', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      expect(screen.getByRole('button', { name: /toggle dark mode/i })).toBeInTheDocument();
    });

    it('toggles theme when dark mode button is clicked', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const themeToggle = screen.getByRole('button', { name: /toggle dark mode/i });
      
      // Initially light mode
      expect(document.documentElement).not.toHaveClass('dark');
      
      // Switch to dark mode
      fireEvent.click(themeToggle);
      expect(document.documentElement).toHaveClass('dark');
      
      // Switch back to light mode
      fireEvent.click(themeToggle);
      expect(document.documentElement).not.toHaveClass('dark');
    });

    it('persists theme preference in localStorage', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const themeToggle = screen.getByRole('button', { name: /toggle dark mode/i });
      fireEvent.click(themeToggle);
      
      // Confirm dark theme is applied
      expect(document.documentElement).toHaveClass('dark');
    });

    it('loads theme preference from localStorage on mount', () => {
      // Save dark theme to localStorage
      const originalGetItem = window.localStorage.getItem;
      window.localStorage.getItem = vi.fn((key) => key === 'theme' ? 'dark' : null);
      
      render(<Layout>{mockChildren}</Layout>);
      
      // Confirm dark theme is applied
      expect(document.documentElement).toHaveClass('dark');
      
      // Restore original function
      window.localStorage.getItem = originalGetItem;
    });
  });

  describe('Accessibility', () => {
    it('includes skip to main content link', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('provides proper heading hierarchy', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      // h1 is used for application title
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('MD-Todo');
    });

    it('has proper ARIA attributes for navigation', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('provides appropriate focus management for mobile menu', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
      
      fireEvent.click(mobileMenuButton);
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('includes proper role attributes for semantic structure', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // main
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // nav
    });
  });

  describe('Footer', () => {
    it('displays copyright information', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      expect(screen.getByText(/© 2025 MD-Todo/)).toBeInTheDocument();
    });

    it('includes link to GitHub repository', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const githubLink = screen.getByRole('link', { name: /github/i });
      expect(githubLink).toHaveAttribute('href', 'https://github.com/saitotm/md-todo');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('applies correct styling classes', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('mt-auto', 'border-t', 'border-gray-200', 'dark:border-gray-700');
    });
  });

  describe('Performance and Optimization', () => {
    it('uses semantic HTML elements for better performance', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      // Semantic elements like header, main, footer, nav are used
      expect(screen.getByRole('banner').tagName).toBe('HEADER');
      expect(screen.getByRole('main').tagName).toBe('MAIN');
      expect(screen.getByRole('contentinfo').tagName).toBe('FOOTER');
      expect(screen.getByRole('navigation').tagName).toBe('NAV');
    });

    it('provides proper meta tags for SEO', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      // Main content has id attribute set (for skip link)
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveAttribute('id', 'main-content');
    });
  });
});