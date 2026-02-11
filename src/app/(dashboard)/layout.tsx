'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { NavLink } from '@/components/nav-link';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name: string | null;
  };
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/accounts', label: 'Accounts', icon: '👥' },
    { href: '/reports', label: 'Submit Reports', icon: '📝' },
    { href: '/reports/history', label: 'History', icon: '📋' },
    { href: '/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <nav className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between sm:h-16">
            
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center gap-6 lg:gap-8">
              {/* Logo */}
              <Link 
                href="/" 
                prefetch 
                className="flex-shrink-0 text-lg font-bold text-gray-900 transition-opacity hover:opacity-80 sm:text-xl"
              >
                <span className="hidden sm:inline">Gigs-Hub (Fiverr)</span>
                <span className="sm:hidden">Gigs-Hub</span>
              </Link>

              {/* Desktop Navigation - Hidden on mobile */}
              <div className="hidden items-center gap-1 md:flex lg:gap-2">
                {navLinks.map((link) => (
                  <NavLink key={link.href} href={link.href}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Right side - User info and mobile menu button */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* User name - Hidden on small mobile */}
              <span className="hidden text-sm text-gray-600 sm:inline-block">
                {user.name}
              </span>

              {/* User button */}
              <div className="flex-shrink-0">
                <UserButton afterSignOutUrl="/sign-in" />
              </div>

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  // X icon
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  // Hamburger icon
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 top-14 z-30 bg-gray-900/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Menu Panel */}
            <div className="fixed left-0 right-0 top-14 z-40 border-b border-gray-200 bg-white shadow-lg md:hidden">
              <div className="mx-auto max-w-7xl px-4 py-3">
                {/* User info on mobile */}
                <div className="mb-3 flex items-center gap-3 border-b border-gray-200 pb-3 sm:hidden">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                  </div>
                </div>

                {/* Navigation links */}
                <nav className="space-y-1" aria-label="Mobile navigation">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                        pathname === link.href
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-xl" aria-hidden="true">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>

      {/* Optional: Bottom Navigation for Mobile (Alternative to hamburger menu) */}
      {/* Uncomment if you prefer bottom nav instead of hamburger */}
      {/*
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white md:hidden">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch
              className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs transition-colors ${
                pathname === link.href
                  ? 'text-blue-600'
                  : 'text-gray-600 active:bg-gray-100'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="truncate text-[10px] font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      */}
    </div>
  );
}