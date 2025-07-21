import { useState, useEffect, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle theme and persist to localStorage
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
        <div className="flex items-center justify-between h-16 md:h-20">
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

          {/* Desktop Navigation */}
          <nav role="navigation" aria-label="Main navigation" data-testid="desktop-navigation" className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" tabIndex={0}>
              Home
            </a>
            <a href="/todos" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" tabIndex={0}>
              Todos
            </a>
            <a href="/about" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" tabIndex={0}>
              About
            </a>
          </nav>

          {/* Theme Toggle and Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDarkMode ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              data-testid="mobile-menu-button"
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="md:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          data-testid="mobile-menu"
          aria-hidden={!isMobileMenuOpen}
          className={`md:hidden border-t border-gray-200 dark:border-gray-700 ${isMobileMenuOpen ? 'block' : 'hidden'}`}
        >
          <div data-testid="mobile-touch-navigation" className="px-4 py-4 space-y-4">
            <a
              href="/"
              className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[44px] flex items-center"
              tabIndex={0}
            >
              Home
            </a>
            <a
              href="/todos"
              className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[44px] flex items-center"
              tabIndex={0}
            >
              Todos
            </a>
            <a
              href="/about"
              className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[44px] flex items-center"
              tabIndex={0}
            >
              About
            </a>
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