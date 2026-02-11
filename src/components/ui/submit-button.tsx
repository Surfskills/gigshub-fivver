'use client';

import { memo } from 'react';
import { useFormStatus } from 'react-dom';

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97] touch-manipulation select-none';

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 shadow-sm hover:shadow',
  secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-400 shadow-sm',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500 shadow-sm hover:shadow',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm hover:shadow',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs min-h-[36px]',
  md: 'px-4 py-2 text-sm min-h-[44px]',
  lg: 'px-6 py-3 text-base min-h-[48px]',
  xl: 'px-8 py-4 text-lg min-h-[56px]',
};

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  fullWidth?: boolean;
  showSpinner?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
}

// Spinner component
const Spinner = memo(({ size = 'md' }: { size?: string }) => {
  const spinnerSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' || size === 'xl' ? 'w-5 h-5' : 'w-4 h-4';
  
  return (
    <svg
      className={`animate-spin ${spinnerSize}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
});

Spinner.displayName = 'Spinner';

export const SubmitButton = memo(function SubmitButton({
  children,
  pendingLabel = 'Submitting...',
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  showSpinner = true,
  icon,
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      aria-busy={pending}
      aria-disabled={isDisabled}
    >
      {/* Spinner when pending */}
      {pending && showSpinner && <Spinner size={size} />}
      
      {/* Icon (hidden when pending and spinner shown) */}
      {!pending && icon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      
      {/* Button text */}
      <span className={pending && showSpinner && !pendingLabel ? 'opacity-0' : ''}>
        {pending && pendingLabel ? pendingLabel : children}
      </span>
    </button>
  );
});

// Alternative: Submit button with progress bar
export const SubmitButtonWithProgress = memo(function SubmitButtonWithProgress({
  children,
  pendingLabel = 'Submitting...',
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  icon,
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        relative overflow-hidden
        ${className}
      `}
      aria-busy={pending}
      aria-disabled={isDisabled}
    >
      {/* Progress bar overlay */}
      {pending && (
        <span 
          className="absolute inset-0 bg-white/20 animate-pulse"
          aria-hidden="true"
        />
      )}
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {pending && <Spinner size={size} />}
        {!pending && icon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        <span>{pending && pendingLabel ? pendingLabel : children}</span>
      </span>
    </button>
  );
});

// Cancel button that works alongside submit button
export const CancelButton = memo(function CancelButton({
  children = 'Cancel',
  size = 'md',
  className = '',
  fullWidth = false,
  onClick,
  type = 'button',
}: {
  children?: React.ReactNode;
  size?: keyof typeof sizes;
  className?: string;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'reset';
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={pending}
      className={`
        ${baseStyles}
        ${variants.secondary}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      aria-disabled={pending}
    >
      {children}
    </button>
  );
});

// Form action group for mobile layouts
export const FormActions = memo(function FormActions({
  children,
  className = '',
  align = 'right',
  stack = false,
  stackOnMobile = true,
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  stack?: boolean;
  stackOnMobile?: boolean;
}) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div
      className={`
        flex gap-3
        ${stack ? 'flex-col' : stackOnMobile ? 'flex-col sm:flex-row' : 'flex-row'}
        ${alignmentClasses[align]}
        ${className}
      `}
      role="group"
    >
      {children}
    </div>
  );
});