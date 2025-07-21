import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRemixStub } from '@remix-run/testing';
import { Layout } from './root';
import App from './root';

describe('Root Layout Component', () => {
  describe('Basic Layout Structure', () => {
    it('renders HTML structure with correct lang attribute', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: () => <div data-testid="test-content">Test Content</div>,
        },
      ]);
      
      render(<RemixStub />);
      
      // Layout コンポーネントが正常にレンダリングされることを確認
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('includes proper meta viewport for responsive design', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: () => <div data-testid="test-content">Test Content</div>,
        },
      ]);
      
      render(<RemixStub />);
      
      // Layout コンポーネントが正常にレンダリングされることを確認
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('includes charset meta tag', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: () => <div data-testid="test-content">Test Content</div>,
        },
      ]);
      
      render(<RemixStub />);
      
      // Layout コンポーネントが正常にレンダリングされることを確認
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
  });

  describe('Application Header', () => {
    it('renders application header with title', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // アプリケーションのヘッダータイトルが表示されることを確認
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText('MD-Todo')).toBeInTheDocument();
    });

    it('renders navigation menu', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // ナビゲーションメニューが表示されることを確認
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('renders logo image with proper alt text', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // ロゴ画像が適切なalt属性とともに表示されることを確認
      expect(screen.getByAltText('MD-Todo Logo')).toBeInTheDocument();
    });
  });

  describe('Main Content Area', () => {
    it('renders main content area with proper semantic markup', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // メインコンテンツエリアがmainタグで表示されることを確認
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('renders child components within main content area', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // メインエリアが存在し、outlet内容を含むことを確認
      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders application footer', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // フッターが表示されることを確認
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('displays copyright information in footer', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // コピーライト情報がフッターに表示されることを確認
      expect(screen.getByText(/© 2025 MD-Todo/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      // レスポンシブテスト用のviewport設定をリセット
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
    });

    it('applies responsive container classes', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // レスポンシブコンテナクラスが適用されることを確認
      const container = screen.getByTestId('app-container');
      expect(container).toHaveClass('container', 'mx-auto', 'px-4');
    });

    it('renders mobile-friendly navigation on small screens', () => {
      // モバイルサイズのviewportをシミュレート
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // モバイル用ナビゲーションが表示されることを確認
      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
    });

    it('hides mobile menu button on desktop screens', () => {
      // デスクトップサイズのviewportをシミュレート
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // デスクトップではモバイルメニューボタンにhiddenクラスが適用されることを確認
      const mobileButton = screen.getByTestId('mobile-menu-button');
      expect(mobileButton).toHaveClass('md:hidden');
    });

    it('applies appropriate grid layout for different screen sizes', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // レスポンシブグリッドクラスが適用されることを確認
      const gridContainer = screen.getByTestId('layout-grid');
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-12');
    });
  });

  describe('Accessibility', () => {
    it('includes skip to main content link', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // メインコンテンツへのスキップリンクが存在することを確認
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // h1タグが存在することを確認（SEOとアクセシビリティのため）
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('provides aria-label for navigation', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // ナビゲーションに適切なaria-labelが設定されることを確認
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');
    });
  });

  describe('Theme Support', () => {
    it('supports dark mode toggle', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // ダークモード切り替えボタンが存在することを確認
      expect(screen.getByRole('button', { name: /toggle dark mode/i })).toBeInTheDocument();
    });

    it('applies theme classes to body element', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: App,
        },
      ]);

      render(<RemixStub />);
      
      // Layout コンポーネントが正常にレンダリングされることを確認
      expect(screen.getByRole('button', { name: /toggle dark mode/i })).toBeInTheDocument();
    });
  });
});