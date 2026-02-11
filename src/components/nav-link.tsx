'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo } from 'react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: number | string;
  variant?: 'default' | 'mobile' | 'sidebar' | 'pill';
  onClick?: () => void;
}

// Default nav link (horizontal navigation)
export const NavLink = memo(function NavLink({
  href,
  children,
  icon,
  badge,
  variant = 'default',
  onClick,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    href === '/'
      ? pathname === '/'
      : href === '/reports'
        ? pathname === '/reports'
        : pathname === href || (href !== '/' && pathname.startsWith(href + '/'));

  const baseStyles = `
    relative flex items-center justify-center gap-2
    rounded-lg
    text-sm font-medium
    transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    active:scale-[0.97]
    touch-manipulation select-none
  `;

  const variantStyles = {
    default: `
      px-4 py-2 sm:px-3 sm:py-2
      min-h-[44px] sm:min-h-[36px]
      ${
        isActive
          ? 'bg-gray-900 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
      }
    `,
    mobile: `
      flex-col gap-1
      px-3 py-2
      min-h-[56px]
      ${
        isActive
          ? 'text-blue-600'
          : 'text-gray-500 hover:text-gray-900'
      }
    `,
    sidebar: `
      w-full justify-start
      px-4 py-3 sm:px-3 sm:py-2
      min-h-[48px] sm:min-h-[40px]
      ${
        isActive
          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
      }
    `,
    pill: `
      px-4 py-2.5 sm:px-3 sm:py-2
      min-h-[44px] sm:min-h-[36px]
      rounded-full
      ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
      }
    `,
  };

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Icon */}
      {icon && (
        <span className={`flex-shrink-0 ${variant === 'mobile' ? 'w-6 h-6' : 'w-5 h-5'}`}>
          {icon}
        </span>
      )}

      {/* Label */}
      <span className={variant === 'mobile' ? 'text-xs' : ''}>
        {children}
      </span>

      {/* Badge */}
      {badge && (
        <span
          className={`
            inline-flex items-center justify-center
            ${variant === 'mobile' ? 'absolute top-1 right-1' : ''}
            min-w-[20px] h-5 px-1.5
            text-xs font-bold
            ${
              isActive
                ? 'bg-white text-blue-600'
                : 'bg-blue-600 text-white'
            }
            rounded-full
          `}
        >
          {badge}
        </span>
      )}

      {/* Active indicator (for default variant) */}
      {isActive && variant === 'default' && (
        <span
          className="absolute inset-x-2 bottom-0 h-1 rounded-full bg-white sm:bg-gray-900"
          aria-hidden="true"
        />
      )}

      {/* Active indicator (for mobile variant) */}
      {isActive && variant === 'mobile' && (
        <span
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-blue-600"
          aria-hidden="true"
        />
      )}
    </Link>
  );
});

// Bottom navigation component (mobile)
export const BottomNav = memo(function BottomNav({
  links,
}: {
  links: Array<{
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
  }>;
}) {
  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0
        bg-white border-t border-gray-200
        safe-area-inset-bottom
        z-40
        lg:hidden
      "
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 px-2 py-1">
        {links.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            badge={link.badge}
            variant="mobile"
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
});

// Sidebar navigation component
export const SidebarNav = memo(function SidebarNav({
  links,
  title,
}: {
  links: Array<{
    href: string;
    label: string;
    icon?: React.ReactNode;
    badge?: number | string;
  }>;
  title?: string;
}) {
  return (
    <nav className="space-y-1" aria-label="Sidebar navigation">
      {title && (
        <h2 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h2>
      )}
      {links.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          icon={link.icon}
          badge={link.badge}
          variant="sidebar"
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
});

// Horizontal navigation component (desktop)
export const HorizontalNav = memo(function HorizontalNav({
  links,
  variant = 'default',
}: {
  links: Array<{
    href: string;
    label: string;
    icon?: React.ReactNode;
    badge?: number | string;
  }>;
  variant?: 'default' | 'pill';
}) {
  return (
    <nav className="flex items-center gap-2" aria-label="Main navigation">
      {links.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          icon={link.icon}
          badge={link.badge}
          variant={variant}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
});

// Mobile menu with drawer
export const MobileMenu = memo(function MobileMenu({
  isOpen,
  onClose,
  links,
}: {
  isOpen: boolean;
  onClose: () => void;
  links: Array<{
    href: string;
    label: string;
    icon?: React.ReactNode;
    badge?: number | string;
  }>;
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="
          fixed top-0 left-0 bottom-0
          w-[280px] max-w-[80vw]
          bg-white
          shadow-xl
          z-50
          overflow-y-auto
          animate-in slide-in-from-left duration-300
          lg:hidden
        "
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="
              p-2 rounded-full
              hover:bg-gray-100 active:bg-gray-200
              transition-colors
            "
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <div className="p-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              badge={link.badge}
              variant="sidebar"
              onClick={onClose}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
});

// Tabs navigation (for sub-navigation)
export const TabsNav = memo(function TabsNav({
  links,
  scrollable = false,
}: {
  links: Array<{
    href: string;
    label: string;
    badge?: number | string;
  }>;
  scrollable?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={`
        border-b border-gray-200
        ${scrollable ? 'overflow-x-auto scrollbar-hide' : ''}
      `}
      aria-label="Tabs navigation"
    >
      <div className={`flex ${scrollable ? 'min-w-min' : 'justify-start'} gap-4 px-4`}>
        {links.map((link) => {
          const isActive =
            link.href === '/'
              ? pathname === '/'
              : link.href === '/reports'
                ? pathname === '/reports'
                : pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href + '/'));

          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className={`
                relative flex items-center gap-2
                px-3 py-4
                min-h-[48px]
                text-sm font-medium
                border-b-2 -mb-px
                transition-colors duration-150
                whitespace-nowrap
                touch-manipulation
                ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <span>{link.label}</span>
              {link.badge && (
                <span
                  className={`
                    inline-flex items-center justify-center
                    min-w-[20px] h-5 px-1.5
                    text-xs font-bold
                    rounded-full
                    ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

// Breadcrumb navigation
export const Breadcrumbs = memo(function Breadcrumbs({
  items,
}: {
  items: Array<{
    href?: string;
    label: string;
  }>;
}) {
  return (
    <nav className="flex items-center space-x-2 text-sm overflow-x-auto scrollbar-hide" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 whitespace-nowrap">
          {index > 0 && (
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
});