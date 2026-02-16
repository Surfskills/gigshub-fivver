'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type AccountOption = { id: string; label: string };

interface WithdrawFormProps {
  accounts: AccountOption[];
}

export function WithdrawForm({ accounts }: WithdrawFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [withdrawDate, setWithdrawDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [paymentMeans, setPaymentMeans] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/finances/withdraws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          amount: parseFloat(amount),
          withdrawDate,
          paymentMeans: paymentMeans.trim() || 'Other',
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to add withdrawal');
      }
      router.refresh();
      setAmount('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-gray-500">Add accounts first to record withdrawals.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/50 p-3 sm:p-4">
      <h3 className="text-sm font-semibold text-gray-900">Add Withdrawal</h3>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <div>
          <label htmlFor="account" className="block text-xs font-medium text-gray-600">
            Account
          </label>
          <select
            id="account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="amount" className="block text-xs font-medium text-gray-600">
            Withdraw Amount ($)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label htmlFor="withdrawDate" className="block text-xs font-medium text-gray-600">
            Withdraw Date
          </label>
          <input
            id="withdrawDate"
            type="date"
            value={withdrawDate}
            onChange={(e) => setWithdrawDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="paymentMeans" className="block text-xs font-medium text-gray-600">
            Payment Means
          </label>
          <input
            id="paymentMeans"
            type="text"
            value={paymentMeans}
            onChange={(e) => setPaymentMeans(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. PayPal, Bank Transfer, Wise"
          />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="block text-xs font-medium text-gray-600">
          Notes (optional)
        </label>
        <input
          id="notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Optional notes"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 sm:w-auto"
      >
        {submitting ? 'Adding…' : 'Add Withdrawal'}
      </button>
    </form>
  );
}
