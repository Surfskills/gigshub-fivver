'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { NavLink } from '@/components/nav-link';
import { usePathname } from 'next/navigation';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: {
    name: string | null;
  };
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/accounts', label: 'Accounts', icon: '👥' },
    { href: '/reports', label: 'Reports', icon: '📝' },
    { href: '/finances', label: 'Finances', icon: '💰' },
    { href: '/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between sm:h-16">
            <div className="flex items-center gap-6 lg:gap-8">
              <Link href="/dashboard" prefetch className="flex-shrink-0 text-lg font-bold text-gray-900 transition-opacity hover:opacity-80 sm:text-xl">
                <span className="hidden sm:inline">Mini Gigs Hub</span>
                <span className="sm:hidden">Mini Gigs Hub</span>
              </Link>
              <div className="hidden items-center gap-1 md:flex lg:gap-2">
                {navLinks.map((link) => (
                  <NavLink key={link.href} href={link.href}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden text-sm text-gray-600 sm:inline-block">{user.name}</span>
              <div className="flex-shrink-0">
                <UserButton afterSignOutUrl="/" />
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 top-14 z-30 bg-gray-900/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed left-0 right-0 top-14 z-40 border-b border-gray-200 bg-white shadow-lg md:hidden">
              <div className="mx-auto max-w-7xl px-4 py-3">
                <div className="mb-3 flex items-center gap-3 border-b border-gray-200 pb-3 sm:hidden">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
                  </div>
                </div>
                <nav className="space-y-1" aria-label="Mobile navigation">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                        pathname === link.href ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
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
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
    </div>
  );
}
