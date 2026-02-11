'use client';

import { useState, memo, useCallback, useMemo } from 'react';
import {
  updateShiftReport,
  type AccountCreated,
  type OrderInProgress,
} from '@/lib/actions/reports';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shift, Prisma } from '@prisma/client';

// Updated type to handle Decimal from Prisma - FIXED rating type
type Report = {
  id: string;
  accountId: string;
  reportDate: Date;
  shift: Shift;
  ordersCompleted: number;
  pendingOrders: number;
  availableBalance: Prisma.Decimal;
  pendingBalance: Prisma.Decimal;
  rankingPage: number | null;
  notes: string | null;
  accountsCreated: Prisma.JsonValue;
  rating: Prisma.Decimal | null; // FIXED: Changed from JsonValue to Decimal | null
  ordersInProgress: Prisma.JsonValue;
  createdAt: Date;
  reportedBy: { name: string };
  account: { id: string; platform: string; username: string };
};

interface ReportEditFormProps {
  report: Report;
}

function parseJsonArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// Helper to safely convert various types to number - FIXED to handle null
function toNumber(val: Prisma.Decimal | Prisma.JsonValue | null): number {
  // Handle null
  if (val === null) return 0;
  // Handle Prisma Decimal
  if (val && typeof val === 'object' && 'toNumber' in val) {
    return (val as Prisma.Decimal).toNumber();
  }
  // Handle regular number
  if (typeof val === 'number') return val;
  // Handle string
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// Memoized form input component
const FormInput = memo(({
  label,
  name,
  type = 'text',
  required = false,
  min,
  max,
  step,
  defaultValue,
  placeholder,
  helpText,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string;
  defaultValue?: string | number;
  placeholder?: string;
  helpText?: string;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="block text-xs sm:text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      id={name}
      type={type}
      name={name}
      required={required}
      min={min}
      max={max}
      step={step}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="
        w-full rounded-lg border border-gray-300
        px-3 py-2 sm:py-2.5
        text-sm sm:text-base
        transition-all duration-200
        placeholder:text-gray-400
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
        hover:border-gray-400
      "
    />
    {helpText && (
      <p className="text-[10px] sm:text-xs text-gray-500">{helpText}</p>
    )}
  </div>
));
FormInput.displayName = 'FormInput';

// Memoized alert component
const Alert = memo(({ type, message }: { type: 'error' | 'success'; message: string }) => {
  const styles = type === 'error'
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-emerald-50 border-emerald-200 text-emerald-800';
  
  const icon = type === 'error' ? (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className={`rounded-lg border p-3 sm:p-4 flex items-start gap-2 sm:gap-3 ${styles}`}>
      {icon}
      <p className="text-xs sm:text-sm font-medium flex-1">{message}</p>
    </div>
  );
});
Alert.displayName = 'Alert';

// Memoized section header
const SectionHeader = memo(({ title, description }: { title: string; description?: string }) => (
  <div className="mb-3 sm:mb-4">
    <h4 className="text-sm sm:text-base font-semibold text-gray-900">{title}</h4>
    {description && (
      <p className="text-[10px] sm:text-xs text-gray-600 mt-1">{description}</p>
    )}
  </div>
));
SectionHeader.displayName = 'SectionHeader';

// Memoized account row component
const AccountRow = memo(({
  account,
  index,
  onUpdate,
  onRemove,
}: {
  account: AccountCreated;
  index: number;
  onUpdate: (i: number, field: 'email' | 'type', value: string) => void;
  onRemove: (i: number) => void;
}) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
    <input
      type="email"
      value={account.email}
      onChange={(e) => onUpdate(index, 'email', e.target.value)}
      placeholder="email@example.com"
      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
    />
    <select
      value={account.type}
      onChange={(e) => onUpdate(index, 'type', e.target.value)}
      className="sm:w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
    >
      <option value="seller">Seller</option>
      <option value="buyer">Buyer</option>
    </select>
    <button
      type="button"
      onClick={() => onRemove(index)}
      className="sm:w-auto px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
      aria-label="Remove account"
    >
      <span className="sm:hidden">Remove</span>
      <span className="hidden sm:inline">×</span>
    </button>
  </div>
));
AccountRow.displayName = 'AccountRow';

// Memoized order row component
const OrderRow = memo(({
  order,
  index,
  onUpdate,
  onRemove,
}: {
  order: OrderInProgress;
  index: number;
  onUpdate: (i: number, field: keyof OrderInProgress, value: string) => void;
  onRemove: (i: number) => void;
}) => (
  <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
    <div className="grid gap-2 sm:grid-cols-3">
      <input
        type="text"
        value={order.account}
        onChange={(e) => onUpdate(index, 'account', e.target.value)}
        placeholder="Account name"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
      />
      <input
        type="date"
        value={order.deadline}
        onChange={(e) => onUpdate(index, 'deadline', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
      />
      <input
        type="tel"
        value={order.handlerPhone}
        onChange={(e) => onUpdate(index, 'handlerPhone', e.target.value)}
        placeholder="Handler phone"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
      />
    </div>
    <button
      type="button"
      onClick={() => onRemove(index)}
      className="self-start px-3 py-1.5 text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
      aria-label="Remove order"
    >
      Remove
    </button>
  </div>
));
OrderRow.displayName = 'OrderRow';

export const ReportEditForm = memo(({ report }: ReportEditFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [accountsCreated, setAccountsCreated] = useState<AccountCreated[]>(
    () => parseJsonArray<AccountCreated>(report.accountsCreated)
  );
  const [ordersInProgress, setOrdersInProgress] = useState<OrderInProgress[]>(
    () => parseJsonArray<OrderInProgress>(report.ordersInProgress)
  );

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Memoized callbacks
  const addAccountRow = useCallback(() => {
    setAccountsCreated(prev => [...prev, { email: '', type: 'seller' }]);
  }, []);

  const removeAccountRow = useCallback((i: number) => {
    setAccountsCreated(prev => prev.filter((_, idx) => idx !== i));
  }, []);

  const updateAccountRow = useCallback((i: number, field: 'email' | 'type', value: string) => {
    setAccountsCreated(prev => {
      const next = [...prev];
      if (field === 'email') next[i] = { ...next[i], email: value };
      else next[i] = { ...next[i], type: value as 'seller' | 'buyer' };
      return next;
    });
  }, []);

  const addOrderRow = useCallback(() => {
    setOrdersInProgress(prev => [...prev, { account: '', deadline: today, handlerPhone: '' }]);
  }, [today]);

  const removeOrderRow = useCallback((i: number) => {
    setOrdersInProgress(prev => prev.filter((_, idx) => idx !== i));
  }, []);

  const updateOrderRow = useCallback((i: number, field: keyof OrderInProgress, value: string) => {
    setOrdersInProgress(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(form);
    const validAccounts = accountsCreated.filter((a) => a.email.trim());
    const validOrders = ordersInProgress.filter((o) => o.account.trim());
    const ratingVal = formData.get('rating');

    const result = await updateShiftReport(report.id, {
      ordersCompleted: Number(formData.get('ordersCompleted')),
      pendingOrders: Number(formData.get('pendingOrders')),
      availableBalance: Number(formData.get('availableBalance')),
      pendingBalance: Number(formData.get('pendingBalance')),
      rankingPage: formData.get('rankingPage') ? Number(formData.get('rankingPage')) : null,
      notes: (formData.get('notes') as string) || null,
      accountsCreated: validAccounts.length > 0 ? validAccounts : null,
      rating: ratingVal ? Number(ratingVal) : null,
      ordersInProgress: validOrders.length > 0 ? validOrders : null,
    });

    if (result.success) {
      setSuccess(true);
      router.refresh();
    } else {
      setError('Update failed. Please try again.');
    }

    setIsSubmitting(false);
  }, [report.id, accountsCreated, ordersInProgress, router]);

  const reportDateStr = useMemo(
    () => new Date(report.reportDate).toLocaleDateString(),
    [report.reportDate]
  );
  
  const accountName = useMemo(
    () => `${report.account.platform} - ${report.account.username}`,
    [report.account.platform, report.account.username]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
        {/* Header */}
        <div className="mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
            {accountName}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            {reportDateStr} • {report.shift} shift
            <span className="block sm:inline sm:ml-1 text-[10px] sm:text-xs text-gray-500">
              (Date and shift are read-only)
            </span>
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} />
          </div>
        )}

        {success && (
          <div className="mb-4">
            <Alert type="success" message="Report updated successfully!" />
          </div>
        )}

        {/* Basic Metrics */}
        <div className="mb-5 sm:mb-6">
          <SectionHeader title="Orders & Balance" description="Core performance metrics" />
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <FormInput
              label="Orders Completed"
              name="ordersCompleted"
              type="number"
              required
              min="0"
              defaultValue={report.ordersCompleted}
            />
            <FormInput
              label="Pending Orders"
              name="pendingOrders"
              type="number"
              required
              min="0"
              defaultValue={report.pendingOrders}
            />
            <FormInput
              label="Available Balance"
              name="availableBalance"
              type="number"
              required
              min="0"
              step="0.01"
              defaultValue={toNumber(report.availableBalance)}
            />
            <FormInput
              label="Pending Balance"
              name="pendingBalance"
              type="number"
              required
              min="0"
              step="0.01"
              defaultValue={toNumber(report.pendingBalance)}
            />
          </div>
        </div>

        {/* Optional Metrics */}
        <div className="mb-5 sm:mb-6">
          <SectionHeader title="Optional Metrics" description="Ranking and rating information" />
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <FormInput
              label="Ranking Page"
              name="rankingPage"
              type="number"
              min="1"
              defaultValue={report.rankingPage ?? ''}
              placeholder="e.g., 1"
            />
            <FormInput
              label="Rating"
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.01"
              defaultValue={report.rating != null ? toNumber(report.rating) : ''}
              placeholder="e.g., 4.85"
            />
          </div>
        </div>

        {/* Orders in Progress */}
        <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-blue-50/50 rounded-lg border border-blue-100">
          <SectionHeader 
            title="Orders in Progress" 
            description="Accounts with pending orders for handover"
          />
          <div className="space-y-2 sm:space-y-3 mb-3">
            {ordersInProgress.length === 0 ? (
              <p className="text-xs sm:text-sm text-gray-500 text-center py-3">
                No orders in progress
              </p>
            ) : (
              ordersInProgress.map((order, i) => (
                <OrderRow
                  key={i}
                  order={order}
                  index={i}
                  onUpdate={updateOrderRow}
                  onRemove={removeOrderRow}
                />
              ))
            )}
          </div>
          <button
            type="button"
            onClick={addOrderRow}
            className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            + Add order in progress
          </button>
        </div>

        {/* Accounts Created */}
        <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
          <SectionHeader 
            title="Accounts Created" 
            description="New accounts created during this shift"
          />
          <div className="space-y-2 sm:space-y-3 mb-3">
            {accountsCreated.length === 0 ? (
              <p className="text-xs sm:text-sm text-gray-500 text-center py-3">
                No accounts created
              </p>
            ) : (
              accountsCreated.map((account, i) => (
                <AccountRow
                  key={i}
                  account={account}
                  index={i}
                  onUpdate={updateAccountRow}
                  onRemove={removeAccountRow}
                />
              ))
            )}
          </div>
          <button
            type="button"
            onClick={addAccountRow}
            className="text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
          >
            + Add account
          </button>
        </div>

        {/* Notes */}
        <div className="mb-5 sm:mb-6">
          <label htmlFor="notes" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={report.notes ?? ''}
            placeholder="Any issues, observations, or handover notes..."
            className="
              w-full rounded-lg border border-gray-300
              px-3 py-2 sm:py-2.5
              text-sm sm:text-base
              transition-all duration-200
              placeholder:text-gray-400
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
              hover:border-gray-400
              resize-y
            "
          />
        </div>

        {/* Actions */}
        <div className="pt-4 sm:pt-5 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full sm:w-auto sm:min-w-[140px]
                rounded-lg bg-blue-600 
                px-4 py-2.5 sm:py-2
                text-sm font-semibold text-white 
                transition-all duration-200
                hover:bg-blue-700 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                disabled:cursor-not-allowed disabled:opacity-60 
                active:scale-[0.98]
                order-1
              "
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
            <Link
              href={`/accounts/${report.account.id}`}
              prefetch={false}
              className="
                w-full sm:w-auto
                rounded-lg border border-gray-300 
                px-4 py-2.5 sm:py-2
                text-sm font-medium text-gray-700
                text-center
                transition-all duration-200
                hover:bg-gray-50 hover:border-gray-400
                order-2
              "
            >
              Back to Account
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
});

ReportEditForm.displayName = 'ReportEditForm';