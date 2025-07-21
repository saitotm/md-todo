import { useState, useEffect, ReactNode } from 'react';

interface ResponsiveLayoutProps {
  children?: ReactNode;
}

const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('desktop');

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.tablet) {
        setCurrentBreakpoint('mobile');
      } else if (width < BREAKPOINTS.desktop) {
        setCurrentBreakpoint('tablet');
      } else if (width < BREAKPOINTS.wide) {
        setCurrentBreakpoint('desktop');
      } else {
        setCurrentBreakpoint('wide');
      }
    };

    handleResize(); // Set initial breakpoint
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Responsive Header */}
      <header
        data-testid="responsive-header"
        className="h-16 md:h-20 sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
      >
        <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* App Title */}
          <h1 data-testid="app-title" className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
            MD-Todo
          </h1>

          {/* Desktop Navigation */}
          <nav
            data-testid="desktop-navigation"
            className="hidden lg:flex items-center space-x-6"
          >
            <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Home
            </a>
            <a href="/todos" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Todos
            </a>
            <a href="/about" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              About
            </a>
          </nav>

          {/* Tablet Navigation */}
          <nav
            data-testid="tablet-navigation"
            className="hidden md:flex lg:hidden items-center space-x-4"
          >
            <a href="/" className="text-gray-700 dark:text-gray-300">Home</a>
            <a href="/todos" className="text-gray-700 dark:text-gray-300">Todos</a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            data-testid="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px]"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          data-testid="mobile-menu-overlay"
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleMobileMenu}
        >
          <div
            data-testid="mobile-menu"
            aria-expanded="true"
            className="absolute top-16 md:top-20 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <nav data-testid="mobile-touch-navigation" className="px-4 py-4 space-y-4">
              <a
                href="/"
                className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[44px] flex items-center"
              >
                Home
              </a>
              <a
                href="/todos"
                className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[44px] flex items-center"
              >
                Todos
              </a>
              <a
                href="/about"
                className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[44px] flex items-center"
              >
                About
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* Main Container with Responsive Grid */}
      <main
        data-testid="main-container"
        className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-12 xl:max-w-7xl xl:mx-auto gap-6"
      >
        {/* Content Container */}
        <div
          data-testid="content-container"
          className="col-span-1 md:col-span-8 lg:col-span-12 px-4 sm:px-6 lg:px-8"
        >
          {/* Main Content Area */}
          <div
            data-testid="main-content-area"
            className="lg:col-span-10 xl:col-span-8 xl:col-start-3"
          >
            {/* Responsive Spacing */}
            <div data-testid="responsive-spacing" className="space-y-2 md:space-y-4 lg:space-y-6">
              {children}
            </div>

            {/* Interactive Element with Hover State */}
            <div
              data-testid="hover-interactive"
              className="mt-6 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <p className="text-gray-600 dark:text-gray-400">Interactive element with hover state</p>
            </div>

            {/* Off-screen Content for Performance Testing */}
            <div
              data-testid="off-screen-content"
              style={{ contentVisibility: 'auto' }}
              className="mt-8"
            >
              <p>Off-screen content for performance optimization</p>
            </div>

            {/* Container Elements for Performance Testing */}
            <div
              data-testid="container-layout"
              style={{ contain: 'layout style' }}
              className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <p>Container with layout containment</p>
            </div>

            <div
              data-testid="container-style"
              style={{ contain: 'layout style' }}
              className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <p>Container with style containment</p>
            </div>

            {/* Responsive Images */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <img
                role="img"
                src="/placeholder-1.jpg"
                alt="Placeholder image 1"
                loading="lazy"
                className="w-full h-48 object-cover rounded-lg"
              />
              <img
                role="img"
                src="/placeholder-2.jpg"
                alt="Placeholder image 2"
                loading="lazy"
                className="w-full h-48 object-cover rounded-lg"
              />
              <img
                role="img"
                src="/placeholder-3.jpg"
                alt="Placeholder image 3"
                loading="lazy"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Touch-friendly buttons for mobile */}
      <div className="fixed bottom-4 right-4 space-y-2 lg:hidden">
        <button
          role="button"
          className="min-h-[44px] w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center"
          aria-label="Add new task"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          role="button"
          className="min-h-[44px] w-12 h-12 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 flex items-center justify-center"
          aria-label="Settings"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}