'use client';

import { memo, forwardRef } from 'react';

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97] touch-manipulation select-none';

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 shadow-sm hover:shadow',
  secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-400 shadow-sm',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500 shadow-sm hover:shadow',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm hover:shadow',
  ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs min-h-[36px]', // Mobile minimum touch target
  md: 'px-4 py-2 text-sm min-h-[44px]',   // Optimal mobile touch target
  lg: 'px-6 py-3 text-base min-h-[48px]',  // Large mobile buttons
  xl: 'px-8 py-4 text-lg min-h-[56px]',   // Extra large for primary actions
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// Loading spinner component
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

export const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        children,
        variant = 'primary',
        size = 'md',
        isLoading = false,
        loadingText,
        leftIcon,
        rightIcon,
        fullWidth = false,
        disabled,
        className = '',
        type = 'button',
        ...props
      },
      ref
    ) => {
      const isDisabled = disabled || isLoading;

      return (
        <button
          ref={ref}
          type={type}
          disabled={isDisabled}
          className={`
            ${baseStyles}
            ${variants[variant]}
            ${sizes[size]}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          aria-busy={isLoading}
          aria-disabled={isDisabled}
          {...props}
        >
          {/* Loading state */}
          {isLoading && <Spinner size={size} />}
          
          {/* Left icon (hidden when loading) */}
          {!isLoading && leftIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          
          {/* Button text */}
          <span className={isLoading && !loadingText ? 'opacity-0' : ''}>
            {isLoading && loadingText ? loadingText : children}
          </span>
          
          {/* Right icon (hidden when loading) */}
          {!isLoading && rightIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </button>
      );
    }
  )
);

Button.displayName = 'Button';

// Icon Button variant for compact actions
export const IconButton = memo(
  forwardRef<HTMLButtonElement, Omit<ButtonProps, 'leftIcon' | 'rightIcon'> & { icon: React.ReactNode; label: string }>(
    (
      {
        icon,
        label,
        variant = 'ghost',
        size = 'md',
        isLoading = false,
        disabled,
        className = '',
        type = 'button',
        ...props
      },
      ref
    ) => {
      const iconSizes = {
        sm: 'w-8 h-8 p-1.5',
        md: 'w-10 h-10 p-2',
        lg: 'w-12 h-12 p-2.5',
        xl: 'w-14 h-14 p-3',
      };

      return (
        <button
          ref={ref}
          type={type}
          disabled={disabled || isLoading}
          className={`
            ${baseStyles}
            ${variants[variant]}
            ${iconSizes[size]}
            ${className}
          `}
          aria-label={label}
          aria-busy={isLoading}
          title={label}
          {...props}
        >
          {isLoading ? <Spinner size={size} /> : icon}
        </button>
      );
    }
  )
);

IconButton.displayName = 'IconButton';

// Button Group for related actions
export const ButtonGroup = memo(({ 
  children, 
  className = '',
  fullWidth = false 
}: { 
  children: React.ReactNode; 
  className?: string;
  fullWidth?: boolean;
}) => {
  return (
    <div 
      className={`
        inline-flex 
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      role="group"
    >
      {children}
    </div>
  );
});

ButtonGroup.displayName = 'ButtonGroup';