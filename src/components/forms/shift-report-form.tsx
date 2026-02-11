'use client';

import { useState, memo, useCallback, useMemo } from 'react';
import {
  submitShiftReport,
  type AccountCreated,
  type OrderInProgress,
} from '@/lib/actions/reports';
import { Shift } from '@prisma/client';

interface ShiftReportFormProps {
  accountId: string;
  accountName: string;
  existingShifts: Shift[];
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

// Memoized all-complete state
const AllReportsComplete = memo(({ accountName }: { accountName: string }) => (
  <div className="rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4 sm:p-5 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="shrink-0">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 ring-4 ring-emerald-50">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm sm:text-base text-emerald-900 mb-1">
          All Reports Submitted ✓
        </p>
        <p className="text-xs sm:text-sm text-emerald-700">
          All shift reports for <span className="font-semibold">{accountName}</span> have been submitted today.
        </p>
      </div>
    </div>
  </div>
));
AllReportsComplete.displayName = 'AllReportsComplete';

export const ShiftReportForm = memo(({ 
  accountId, 
  accountName, 
  existingShifts 
}: ShiftReportFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [accountsCreated, setAccountsCreated] = useState<AccountCreated[]>([]);
  const [ordersInProgress, setOrdersInProgress] = useState<OrderInProgress[]>([]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const availableShifts = useMemo(
    () => (['AM', 'PM'].filter((s) => !existingShifts.includes(s as Shift)) as Shift[]),
    [existingShifts]
  );

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

    const result = await submitShiftReport({
      accountId,
      reportDate: today,
      shift: formData.get('shift') as Shift,
      ordersCompleted: Number(formData.get('ordersCompleted')),
      pendingOrders: Number(formData.get('pendingOrders')),
      availableBalance: Number(formData.get('availableBalance')),
      pendingBalance: Number(formData.get('pendingBalance')),
      rankingPage: formData.get('rankingPage') ? Number(formData.get('rankingPage')) : undefined,
      notes: (formData.get('notes') as string) || undefined,
      accountsCreated: validAccounts.length > 0 ? validAccounts : undefined,
      rating: ratingVal ? Number(ratingVal) : undefined,
      ordersInProgress: validOrders.length > 0 ? validOrders : undefined,
    });

    if (result.success) {
      setSuccess(true);
      form.reset();
      setAccountsCreated([]);
      setOrdersInProgress([]);
    } else {
      setError(result.error || 'Submission failed. Please try again.');
    }

    setIsSubmitting(false);
  }, [accountId, today, accountsCreated, ordersInProgress]);

  // Early return for all reports complete
  if (availableShifts.length === 0) {
    return <AllReportsComplete accountName={accountName} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
        {/* Header */}
        <div className="mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
            {accountName}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Submit shift report for today
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
            <Alert type="success" message="Report submitted successfully!" />
          </div>
        )}

        {/* Shift Selection */}
        <div className="mb-5 sm:mb-6">
          <label htmlFor="shift" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
            Shift
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select
            id="shift"
            name="shift"
            required
            className="
              w-full rounded-lg border border-gray-300
              px-3 py-2 sm:py-2.5
              text-sm sm:text-base
              transition-all duration-200
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
              hover:border-gray-400
              appearance-none bg-[length:16px_16px] bg-[position:right_0.75rem_center] bg-no-repeat
              cursor-pointer
            "
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
            }}
          >
            {availableShifts.map((shift) => (
              <option key={shift} value={shift}>
                {shift === 'AM' ? 'Morning (AM)' : 'Evening (PM)'}
              </option>
            ))}
          </select>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5">
            Available shifts for today
          </p>
        </div>

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
            />
            <FormInput
              label="Pending Orders"
              name="pendingOrders"
              type="number"
              required
              min="0"
            />
            <FormInput
              label="Available Balance"
              name="availableBalance"
              type="number"
              required
              min="0"
              step="0.01"
            />
            <FormInput
              label="Pending Balance"
              name="pendingBalance"
              type="number"
              required
              min="0"
              step="0.01"
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
              placeholder="e.g., 1"
            />
            <FormInput
              label="Rating"
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.01"
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

        {/* Submit Button */}
        <div className="pt-4 sm:pt-5 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="
              w-full sm:w-auto sm:min-w-[160px]
              rounded-lg bg-blue-600 
              px-4 py-2.5 sm:py-2
              text-sm font-semibold text-white 
              transition-all duration-200
              hover:bg-blue-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
              disabled:cursor-not-allowed disabled:opacity-60 
              active:scale-[0.98]
            "
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </div>
    </form>
  );
});

ShiftReportForm.displayName = 'ShiftReportForm';