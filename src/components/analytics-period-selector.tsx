'use client';

import { memo, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const PERIODS = [
  { value: 7, label: '7 days', shortLabel: '7d' },
  { value: 14, label: '14 days', shortLabel: '14d' },
  { value: 30, label: '30 days', shortLabel: '30d' },
] as const;

// Loading spinner
const Spinner = memo(() => (
  <svg
    className="animate-spin w-3 h-3 sm:w-3.5 sm:h-3.5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
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
));

Spinner.displayName = 'Spinner';

// Period button component
const PeriodButton = memo(({
  value,
  label,
  shortLabel,
  isSelected,
  isPending,
  onClick,
}: {
  value: number;
  label: string;
  shortLabel: string;
  isSelected: boolean;
  isPending: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={onClick}
      className={`
        flex-1 sm:flex-none
        relative
        px-4 py-2 sm:px-3 sm:py-1.5
        min-h-[44px] sm:min-h-[36px]
        rounded-lg sm:rounded-md
        text-sm font-medium
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        disabled:cursor-not-allowed
        active:scale-[0.97]
        touch-manipulation select-none
        ${
          isSelected
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50'
        }
      `}
      aria-pressed={isSelected}
      aria-label={`Show data for ${label}`}
    >
      {isPending && isSelected ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{shortLabel}</span>
        </span>
      ) : (
        <>
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{shortLabel}</span>
        </>
      )}
    </button>
  );
});

PeriodButton.displayName = 'PeriodButton';

export const AnalyticsPeriodSelector = memo(function AnalyticsPeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const current = Number(searchParams.get('period') || 14);

  const handlePeriodChange = useCallback((period: number) => {
    // Preserve other search params if they exist
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', String(period));

    startTransition(() => {
      router.push(`/analytics?${params.toString()}`);
    });
  }, [router, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
      <label className="text-sm font-medium text-gray-700 sm:flex-shrink-0">
        Period:
      </label>
      <div 
        className="flex gap-1 sm:gap-1 p-1 bg-gray-100 rounded-lg"
        role="group"
        aria-label="Time period selector"
      >
        {PERIODS.map(({ value, label, shortLabel }) => (
          <PeriodButton
            key={value}
            value={value}
            label={label}
            shortLabel={shortLabel}
            isSelected={current === value}
            isPending={isPending}
            onClick={() => handlePeriodChange(value)}
          />
        ))}
      </div>
    </div>
  );
});

// Compact version for mobile toolbars
export const AnalyticsPeriodSelectorCompact = memo(function AnalyticsPeriodSelectorCompact() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const current = Number(searchParams.get('period') || 14);
  const currentLabel = PERIODS.find(p => p.value === current)?.label || '14 days';

  const handlePeriodChange = useCallback((period: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', String(period));

    startTransition(() => {
      router.push(`/analytics?${params.toString()}`);
    });
  }, [router, searchParams]);

  return (
    <div className="relative">
      <select
        value={current}
        disabled={isPending}
        onChange={(e) => handlePeriodChange(Number(e.target.value))}
        className="
          appearance-none
          w-full
          pl-3 pr-10 py-2.5
          min-h-[44px]
          bg-white
          border border-gray-300
          rounded-lg
          text-sm font-medium text-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
          transition-all
          touch-manipulation
        "
        aria-label="Select time period"
      >
        {PERIODS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown icon */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        {isPending ? (
          <Spinner />
        ) : (
          <svg 
            className="w-5 h-5 text-gray-400"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  );
});

// Segmented control version (iOS-style)
export const AnalyticsPeriodSelectorSegmented = memo(function AnalyticsPeriodSelectorSegmented() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const current = Number(searchParams.get('period') || 14);

  const handlePeriodChange = useCallback((period: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', String(period));

    startTransition(() => {
      router.push(`/analytics?${params.toString()}`);
    });
  }, [router, searchParams]);

  return (
    <div className="w-full sm:w-auto">
      <div 
        className="relative inline-flex w-full sm:w-auto bg-gray-200 rounded-lg p-0.5"
        role="group"
        aria-label="Time period selector"
      >
        {/* Active indicator */}
        <div
          className="absolute inset-y-0.5 transition-all duration-200 ease-out"
          style={{
            left: `${PERIODS.findIndex(p => p.value === current) * (100 / PERIODS.length)}%`,
            width: `${100 / PERIODS.length}%`,
            padding: '0.125rem',
          }}
        >
          <div className="w-full h-full bg-white rounded-md shadow-sm" />
        </div>

        {/* Buttons */}
        {PERIODS.map(({ value, label, shortLabel }) => (
          <button
            key={value}
            type="button"
            disabled={isPending}
            onClick={() => handlePeriodChange(value)}
            className={`
              relative z-10
              flex-1
              px-4 py-2
              min-h-[44px] sm:min-h-[36px]
              text-sm font-medium
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:cursor-not-allowed
              touch-manipulation select-none
              ${
                current === value
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }
            `}
            aria-pressed={current === value}
            aria-label={`Show data for ${label}`}
          >
            {isPending && current === value ? (
              <span className="flex items-center justify-center">
                <Spinner />
              </span>
            ) : (
              <>
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{shortLabel}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
});

// With label and description
export const AnalyticsPeriodSelectorWithLabel = memo(function AnalyticsPeriodSelectorWithLabel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const current = Number(searchParams.get('period') || 14);

  const handlePeriodChange = useCallback((period: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', String(period));

    startTransition(() => {
      router.push(`/analytics?${params.toString()}`);
    });
  }, [router, searchParams]);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-gray-900">Time Period</h3>
        <p className="text-xs text-gray-500 mt-0.5">Select the date range for analytics</p>
      </div>
      
      <div 
        className="flex gap-2 p-1 bg-gray-100 rounded-lg"
        role="group"
        aria-label="Time period selector"
      >
        {PERIODS.map(({ value, label, shortLabel }) => (
          <button
            key={value}
            type="button"
            disabled={isPending}
            onClick={() => handlePeriodChange(value)}
            className={`
              flex-1
              px-4 py-2.5
              min-h-[44px]
              rounded-lg
              text-sm font-medium
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              disabled:cursor-not-allowed
              active:scale-[0.97]
              touch-manipulation select-none
              ${
                current === value
                  ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50'
              }
            `}
            aria-pressed={current === value}
          >
            {isPending && current === value ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{shortLabel}</span>
              </span>
            ) : (
              <>
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{shortLabel}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
});