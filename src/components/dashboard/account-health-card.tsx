import { memo } from 'react';

interface AccountHealthCardProps {
  label: string;
  value: number | string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

// Memoized trend indicator
const TrendIndicator = memo(({ trend }: { trend: { value: number; direction: 'up' | 'down' | 'neutral' } }) => {
  const isPositive = trend.direction === 'up';
  const isNegative = trend.direction === 'down';
  
  if (trend.direction === 'neutral') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs text-gray-500">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
        {trend.value}%
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-medium ${
      isPositive ? 'text-emerald-600' : 'text-red-600'
    }`}>
      <svg 
        className="w-3 h-3" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d={isPositive ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} 
        />
      </svg>
      {Math.abs(trend.value)}%
    </span>
  );
});
TrendIndicator.displayName = 'TrendIndicator';

export const AccountHealthCard = memo(({ 
  label, 
  value, 
  trend, 
  icon,
  variant = 'default' 
}: AccountHealthCardProps) => {
  // Variant-based styling
  const variantStyles = {
    default: 'border-gray-200 bg-white hover:border-gray-300',
    success: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300',
    warning: 'border-amber-200 bg-amber-50/50 hover:border-amber-300',
    danger: 'border-red-200 bg-red-50/50 hover:border-red-300',
  };

  const variantTextColors = {
    default: 'text-gray-900',
    success: 'text-emerald-900',
    warning: 'text-amber-900',
    danger: 'text-red-900',
  };

  return (
    <div 
      className={`
        rounded-lg border p-3 sm:p-4 md:p-5
        transition-all duration-200
        ${variantStyles[variant]}
        hover:shadow-md active:scale-[0.98]
      `}
    >
      {/* Header with label and optional icon */}
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] sm:text-xs md:text-sm uppercase tracking-wide text-gray-600 font-medium truncate">
            {label}
          </div>
          {trend && (
            <div className="mt-1">
              <TrendIndicator trend={trend} />
            </div>
          )}
        </div>
        {icon && (
          <div className="shrink-0 text-gray-400 opacity-60">
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className={`
        text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums
        ${variantTextColors[variant]}
        leading-none
      `}>
        {value}
      </div>
    </div>
  );
});

AccountHealthCard.displayName = 'AccountHealthCard';