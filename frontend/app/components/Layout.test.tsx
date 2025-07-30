import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Layout } from './Layout';

// Props for mock component
const mockChildren = <div data-testid="test-children">Test Children</div>;

describe('Layout Component', () => {

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

    it('aligns logo and title to the left in header', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const headerContent = screen.getByRole('banner').querySelector('div');
      expect(headerContent).toHaveClass('justify-start');
    });

    it('applies sticky positioning to header', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0', 'z-50');
    });
  });

  describe('Responsive Design', () => {

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


    it('includes proper role attributes for semantic structure', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // main
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
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
      
      // Semantic elements like header, main, footer are used
      expect(screen.getByRole('banner').tagName).toBe('HEADER');
      expect(screen.getByRole('main').tagName).toBe('MAIN');
      expect(screen.getByRole('contentinfo').tagName).toBe('FOOTER');
    });

    it('provides proper meta tags for SEO', () => {
      render(<Layout>{mockChildren}</Layout>);
      
      // Main content has id attribute set (for skip link)
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveAttribute('id', 'main-content');
    });
  });
});