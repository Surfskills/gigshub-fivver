'use client';

import { useState, memo, useCallback } from 'react';
import { reportAccountsCreated, type AccountCreatedInput } from '@/lib/actions/accounts';
import { Platform } from '@prisma/client';

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'fiverr', label: 'Fiverr' },
  { value: 'upwork', label: 'Upwork' },
  { value: 'direct', label: 'Direct' },
];

const AccountRow = memo(({
  account,
  index,
  onUpdate,
  onRemove,
}: {
  account: AccountCreatedInput;
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
      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    />
    <select
      value={account.type}
      onChange={(e) => onUpdate(index, 'type', e.target.value)}
      className="sm:w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500"
    >
      <option value="seller">Seller</option>
      <option value="buyer">Buyer</option>
    </select>
    <button
      type="button"
      onClick={() => onRemove(index)}
      className="sm:w-auto px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
    >
      ×
    </button>
  </div>
));
AccountRow.displayName = 'AccountRow';

export function AccountsCreatedForm() {
  const [platform, setPlatform] = useState<Platform>('fiverr');
  const [accounts, setAccounts] = useState<AccountCreatedInput[]>([{ email: '', type: 'seller' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ created: number; failed?: { email: string; error: string }[] } | null>(null);

  const addRow = useCallback(() => {
    setAccounts((prev) => [...prev, { email: '', type: 'seller' }]);
  }, []);

  const removeRow = useCallback((i: number) => {
    setAccounts((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const updateRow = useCallback((i: number, field: 'email' | 'type', value: string) => {
    setAccounts((prev) => {
      const next = [...prev];
      if (field === 'email') next[i] = { ...next[i], email: value };
      else next[i] = { ...next[i], type: value as 'seller' | 'buyer' };
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const valid = accounts.filter((a) => a.email.trim());
      if (valid.length === 0) {
        setError('Add at least one account with an email');
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const result = await reportAccountsCreated({ platform, accounts: valid });

      if (result.success) {
        setSuccess({
          created: result.created!,
          failed: result.failed?.map((f) => ({ email: f.email, error: f.error! })),
        });
        setAccounts([{ email: '', type: 'seller' }]);
      } else {
        setError(result.error || 'Submission failed');
      }
      setIsSubmitting(false);
    },
    [platform, accounts]
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
      <div className="mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Report Accounts Created</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Add newly created accounts to the accounts listing. They will appear in the Accounts page.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 text-sm">
          <p className="font-medium">{success.created} account(s) added to the listing.</p>
          {success.failed && success.failed.length > 0 && (
            <p className="mt-1 text-amber-700">
              Failed: {success.failed.map((f) => `${f.email} (${f.error})`).join(', ')}
            </p>
          )}
        </div>
      )}

      <div className="mb-5">
        <label htmlFor="platform" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Platform <span className="text-red-500">*</span>
        </label>
        <select
          id="platform"
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          className="w-full sm:w-48 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Accounts to add</h4>
        <div className="space-y-2 mb-3">
          {accounts.map((account, i) => (
            <AccountRow key={i} account={account} index={i} onUpdate={updateRow} onRemove={removeRow} />
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-800"
        >
          + Add account
        </button>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add to Accounts'}
        </button>
      </div>
    </form>
  );
}
