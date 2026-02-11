'use client';

import { memo, useState, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const PERIODS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
] as const;

interface AccountOption {
  id: string;
  label: string;
}

interface AnalyticsFiltersProps {
  accounts: AccountOption[];
}

// Period button component
const PeriodButton = memo(({ 
  value, 
  label, 
  isSelected, 
  isPending,
  onClick 
}: { 
  value: number; 
  label: string; 
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
        px-4 py-2 sm:px-3 sm:py-1.5
        min-h-[44px] sm:min-h-[36px]
        rounded-lg sm:rounded-md
        text-sm font-medium
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.97]
        touch-manipulation
        ${
          isSelected
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
        }
      `}
    >
      {label}
    </button>
  );
});

PeriodButton.displayName = 'PeriodButton';

// Account select component
const AccountSelect = memo(({ 
  accounts, 
  value, 
  isPending,
  onChange 
}: { 
  accounts: AccountOption[];
  value: string;
  isPending: boolean;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={value}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full sm:min-w-[200px]
          appearance-none
          rounded-lg
          border border-gray-300
          bg-white
          px-4 py-2.5 sm:px-3 sm:py-2
          pr-10
          text-sm
          min-h-[44px] sm:min-h-[36px]
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
          touch-manipulation
        "
      >
        <option value="">All accounts</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.label}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown icon */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform ${isPending ? 'animate-pulse' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
});

AccountSelect.displayName = 'AccountSelect';

// Loading overlay
const LoadingOverlay = memo(() => (
  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span>Updating...</span>
    </div>
  </div>
));

LoadingOverlay.displayName = 'LoadingOverlay';

export const AnalyticsFilters = memo(function AnalyticsFilters({ 
  accounts 
}: AnalyticsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const period = Number(searchParams.get('period') || 14);
  const accountId = searchParams.get('accountId') || '';

  const updateFilter = useCallback((updates: { period?: number; accountId?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.period != null) {
      params.set('period', String(updates.period));
    }
    
    if (updates.accountId !== undefined) {
      if (updates.accountId) {
        params.set('accountId', updates.accountId);
      } else {
        params.delete('accountId');
      }
    }

    setIsLocalLoading(true);
    
    startTransition(() => {
      router.push(`/analytics?${params.toString()}`);
      // Reset loading state after navigation
      setTimeout(() => setIsLocalLoading(false), 500);
    });
  }, [router, searchParams]);

  const handlePeriodChange = useCallback((value: number) => {
    updateFilter({ period: value });
  }, [updateFilter]);

  const handleAccountChange = useCallback((value: string) => {
    updateFilter({ accountId: value });
  }, [updateFilter]);

  const isLoading = isPending || isLocalLoading;

  return (
    <div className="relative">
      {/* Loading overlay */}
      {isLoading && <LoadingOverlay />}

      {/* Filters container */}
      <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
        {/* Period filter */}
        <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
          <label className="block text-sm font-medium text-gray-700 sm:flex-shrink-0">
            Period:
          </label>
          <div className="flex gap-2 sm:gap-1 p-1 bg-gray-100 rounded-lg">
            {PERIODS.map(({ value, label }) => (
              <PeriodButton
                key={value}
                value={value}
                label={label}
                isSelected={period === value}
                isPending={isLoading}
                onClick={() => handlePeriodChange(value)}
              />
            ))}
          </div>
        </div>

        {/* Account filter */}
        <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
          <label 
            htmlFor="account-filter" 
            className="block text-sm font-medium text-gray-700 sm:flex-shrink-0"
          >
            Account:
          </label>
          <AccountSelect
            accounts={accounts}
            value={accountId}
            isPending={isLoading}
            onChange={handleAccountChange}
          />
        </div>
      </div>
    </div>
  );
});

// Mobile-optimized bottom sheet version (alternative)
export const AnalyticsFiltersMobile = memo(function AnalyticsFiltersMobile({ 
  accounts 
}: AnalyticsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);

  const period = Number(searchParams.get('period') || 14);
  const accountId = searchParams.get('accountId') || '';

  const selectedAccount = accounts.find(acc => acc.id === accountId);
  const filterCount = (period !== 14 ? 1 : 0) + (accountId ? 1 : 0);

  const updateFilter = useCallback((updates: { period?: number; accountId?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.period != null) params.set('period', String(updates.period));
    if (updates.accountId !== undefined) {
      if (updates.accountId) {
        params.set('accountId', updates.accountId);
      } else {
        params.delete('accountId');
      }
    }

    startTransition(() => {
      router.push(`/analytics?${params.toString()}`);
    });
  }, [router, searchParams]);

  const resetFilters = useCallback(() => {
    startTransition(() => {
      router.push('/analytics?period=14');
    });
    setShowFilters(false);
  }, [router]);

  return (
    <>
      {/* Filter button */}
      <button
        onClick={() => setShowFilters(true)}
        className="
          flex items-center justify-between
          w-full sm:w-auto
          px-4 py-2.5
          min-h-[44px]
          bg-white border border-gray-300 rounded-lg
          text-sm font-medium text-gray-700
          hover:bg-gray-50 active:bg-gray-100
          transition-colors
          touch-manipulation
        "
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filters</span>
          {filterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
              {filterCount}
            </span>
          )}
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Bottom sheet overlay */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
          onClick={() => setShowFilters(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter options */}
            <div className="p-4 space-y-6">
              {/* Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Time Period
                </label>
                <div className="space-y-2">
                  {PERIODS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateFilter({ period: value })}
                      disabled={isPending}
                      className={`
                        w-full flex items-center justify-between
                        px-4 py-3 rounded-lg border-2
                        text-sm font-medium
                        transition-all
                        min-h-[48px]
                        ${
                          period === value
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <span>{label}</span>
                      {period === value && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Account
                </label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  <button
                    onClick={() => updateFilter({ accountId: '' })}
                    disabled={isPending}
                    className={`
                      w-full flex items-center justify-between
                      px-4 py-3 rounded-lg border-2
                      text-sm font-medium
                      transition-all
                      min-h-[48px]
                      ${
                        !accountId
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <span>All accounts</span>
                    {!accountId && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => updateFilter({ accountId: acc.id })}
                      disabled={isPending}
                      className={`
                        w-full flex items-center justify-between
                        px-4 py-3 rounded-lg border-2
                        text-sm font-medium
                        transition-all
                        min-h-[48px]
                        ${
                          accountId === acc.id
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <span>{acc.label}</span>
                      {accountId === acc.id && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={resetFilters}
                className="
                  flex-1 px-4 py-3 min-h-[48px]
                  border border-gray-300 rounded-lg
                  text-sm font-medium text-gray-700
                  hover:bg-gray-50 active:bg-gray-100
                  transition-colors
                "
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="
                  flex-1 px-4 py-3 min-h-[48px]
                  bg-blue-600 text-white rounded-lg
                  text-sm font-medium
                  hover:bg-blue-700 active:bg-blue-800
                  transition-colors
                "
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});