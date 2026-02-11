'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition, memo } from 'react';

interface AccountOption {
  id: string;
  label: string;
}

interface ReportsFilterProps {
  accounts: AccountOption[];
  variant?: 'inline' | 'modal';
}

// Date helpers
const today = () => new Date().toISOString().split('T')[0];
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const DATE_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
] as const;

// Loading spinner
const Spinner = memo(() => (
  <svg
    className="animate-spin w-4 h-4"
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

// Modal component
const FilterModal = memo(({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {children}
      </div>
    </div>
  );
});

FilterModal.displayName = 'FilterModal';

// Main filter form component
const FilterForm = memo(({
  accounts,
  onSubmit,
  onClear,
  isPending,
  defaultValues,
  showActions = true,
}: {
  accounts: AccountOption[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
  isPending: boolean;
  defaultValues: {
    startDate: string;
    endDate: string;
    accountId: string;
  };
  showActions?: boolean;
}) => {
  const [startDate, setStartDate] = useState(defaultValues.startDate);
  const [endDate, setEndDate] = useState(defaultValues.endDate);

  const handlePresetClick = useCallback((days: number) => {
    setStartDate(daysAgo(days));
    setEndDate(today());
  }, []);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Date presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quick Select
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.days}
              type="button"
              onClick={() => handlePresetClick(preset.days)}
              disabled={isPending}
              className="
                px-3 py-2.5
                min-h-[44px]
                rounded-lg
                border-2 border-gray-200
                text-sm font-medium text-gray-700
                hover:border-blue-300 hover:bg-blue-50
                active:bg-blue-100
                disabled:opacity-50
                transition-all
                touch-manipulation
              "
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isPending}
            className="
              w-full
              px-4 py-3
              min-h-[48px]
              border border-gray-300 rounded-lg
              text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:bg-gray-50
              transition-all
              touch-manipulation
            "
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isPending}
            className="
              w-full
              px-4 py-3
              min-h-[48px]
              border border-gray-300 rounded-lg
              text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:bg-gray-50
              transition-all
              touch-manipulation
            "
          />
        </div>
      </div>

      {/* Account select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account
        </label>
        <div className="relative">
          <select
            name="accountId"
            defaultValue={defaultValues.accountId}
            disabled={isPending}
            className="
              w-full
              appearance-none
              px-4 py-3
              pr-10
              min-h-[48px]
              border border-gray-300 rounded-lg
              text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:bg-gray-50
              transition-all
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClear}
            disabled={isPending}
            className="
              flex-1
              inline-flex items-center justify-center gap-2
              px-4 py-3
              min-h-[48px]
              border border-gray-300 rounded-lg
              text-sm font-medium text-gray-700
              bg-white
              hover:bg-gray-50 active:bg-gray-100
              focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all
              active:scale-[0.97]
              touch-manipulation
            "
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="
              flex-1
              inline-flex items-center justify-center gap-2
              px-4 py-3
              min-h-[48px]
              bg-blue-600 text-white rounded-lg
              text-sm font-medium
              hover:bg-blue-700 active:bg-blue-800
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all
              active:scale-[0.97]
              touch-manipulation
              shadow-sm
            "
          >
            {isPending ? (
              <>
                <Spinner />
                <span>Applying...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Apply Filters</span>
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
});

FilterForm.displayName = 'FilterForm';

// Inline variant (desktop)
export const ReportsFilter = memo(function ReportsFilter({
  accounts,
  variant = 'inline',
}: ReportsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  const startDate = searchParams.get('startDate') ?? daysAgo(30);
  const endDate = searchParams.get('endDate') ?? today();
  const accountId = searchParams.get('accountId') ?? '';

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const startDate = formData.get('startDate') as string;
      const endDate = formData.get('endDate') as string;
      const accountId = formData.get('accountId') as string;

      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (accountId) params.set('accountId', accountId);

      startTransition(() => {
        router.push(`/reports/history?${params.toString()}`);
        if (variant === 'modal') {
          setShowModal(false);
        }
      });
    },
    [router, variant]
  );

  const handleClear = useCallback(() => {
    startTransition(() => {
      router.push('/reports/history');
      if (variant === 'modal') {
        setShowModal(false);
      }
    });
  }, [router, variant]);

  const activeFilterCount = 
    (startDate !== daysAgo(30) ? 1 : 0) +
    (endDate !== today() ? 1 : 0) +
    (accountId ? 1 : 0);

  // Inline variant (desktop)
  if (variant === 'inline') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <FilterForm
          accounts={accounts}
          onSubmit={handleSubmit}
          onClear={handleClear}
          isPending={isPending}
          defaultValues={{ startDate, endDate, accountId }}
        />
      </div>
    );
  }

  // Modal variant (mobile)
  return (
    <>
      {/* Filter button */}
      <button
        onClick={() => setShowModal(true)}
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
          shadow-sm
        "
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Modal */}
      <FilterModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Filter Reports</h3>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close filters"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <FilterForm
            accounts={accounts}
            onSubmit={handleSubmit}
            onClear={handleClear}
            isPending={isPending}
            defaultValues={{ startDate, endDate, accountId }}
          />
        </div>
      </FilterModal>
    </>
  );
});

// Compact filter summary (shows active filters)
export const FilterSummary = memo(function FilterSummary({
  onEdit,
}: {
  onEdit: () => void;
}) {
  const searchParams = useSearchParams();
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const accountId = searchParams.get('accountId');

  const hasFilters = startDate || endDate || accountId;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <span className="text-sm font-medium text-blue-900">Active filters:</span>
      {startDate && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white text-blue-700 border border-blue-200">
          From: {new Date(startDate).toLocaleDateString()}
        </span>
      )}
      {endDate && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white text-blue-700 border border-blue-200">
          To: {new Date(endDate).toLocaleDateString()}
        </span>
      )}
      {accountId && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white text-blue-700 border border-blue-200">
          Account selected
        </span>
      )}
      <button
        onClick={onEdit}
        className="ml-auto text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
      >
        Edit
      </button>
    </div>
  );
});