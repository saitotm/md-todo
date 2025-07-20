import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRemixStub } from '@remix-run/testing';
import { Layout } from './root';

describe('Root Layout Component', () => {
  describe('Basic Layout Structure', () => {
    it('renders HTML structure with correct lang attribute', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: () => <div>Test Content</div>,
        },
      ]);

      render(<RemixStub />);
      
      // HTMLのlang属性がenに設定されていることを確認
      const htmlElement = document.documentElement;
      expect(htmlElement).toHaveAttribute('lang', 'en');
    });

    it('includes proper meta viewport for responsive design', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: () => <div>Test Content</div>,
        },
      ]);

      render(<RemixStub />);
      
      // viewport metaタグが存在することを確認
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      expect(viewportMeta).toHaveAttribute('content', 'width=device-width, initial-scale=1');
    });

    it('includes charset meta tag', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: () => <div>Test Content</div>,
        },
      ]);

      render(<RemixStub />);
      
      // charset metaタグが存在することを確認
      const charsetMeta = document.querySelector('meta[charset]');
      expect(charsetMeta).toHaveAttribute('charset', 'utf-8');
    });
  });

  describe('Application Header', () => {
    it('renders application header with title', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: () => <div>Test Content</div>,
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
          Component: () => <div>Test Content</div>,
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
          Component: () => <div>Test Content</div>,
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
          Component: () => <div data-testid="test-content">Test Content</div>,
        },
      ]);

      render(<RemixStub />);
      
      // メインコンテンツエリアがmainタグで表示されることを確認
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('renders child components within main content area', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: () => <div data-testid="child-component">Child Component</div>,
        },
      ]);

      render(<RemixStub />);
      
      // 子コンポーネントがメインエリア内に表示されることを確認
      const mainElement = screen.getByRole('main');
      expect(mainElement).toContainElement(screen.getByTestId('child-component'));
    });
  });

  describe('Footer', () => {
    it('renders application footer', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: () => <div>Test Content</div>,
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
          Component: () => <div>Test Content</div>,
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
          Component: () => <div>Test Content</div>,
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
          Component: () => <div>Test Content</div>,
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
          Component: () => <div>Test Content</div>,
        },
      ]);

      render(<RemixStub />);
      
      // デスクトップではモバイルメニューボタンが非表示になることを確認
      const mobileButton = screen.queryByTestId('mobile-menu-button');
      expect(mobileButton).not.toBeInTheDocument();
    });

    it('applies appropriate grid layout for different screen sizes', () => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: () => <div>Test Content</div>,
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
          Component: () => <div>Test Content</div>,
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
          Component: () => <div>Test Content</div>,
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
          Component: () => <div>Test Content</div>,
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
          Component: () => <div>Test Content</div>,
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
          Component: () => <div>Test Content</div>,
        },
      ]);

      render(<RemixStub />);
      
      // bodyにテーマクラスが適用されることを確認
      expect(document.body).toHaveClass('min-h-screen', 'bg-white', 'dark:bg-gray-900');
    });
  });
});