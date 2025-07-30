import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {

  return (
    <div data-testid="app-container" className="container mx-auto px-4">
      <div data-testid="layout-container" className="min-h-screen flex flex-col px-4 sm:px-6 lg:px-8">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header role="banner" className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-16 md:h-20">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <img
              src="/logo.svg"
              alt="MD-Todo Logo"
              className="h-8 w-8"
            />
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              MD-Todo
            </h1>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div data-testid="layout-grid" className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <main
          role="main"
          id="main-content"
          className="lg:col-span-12"
        >
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer role="contentinfo" className="mt-auto border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="py-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 MD-Todo. All rights reserved.</p>
          <div className="mt-2">
            <a
              href="https://github.com/saitotm/md-todo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}