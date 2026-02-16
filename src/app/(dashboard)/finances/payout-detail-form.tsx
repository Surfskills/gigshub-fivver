'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PAYMENT_GATEWAYS = [
  { value: 'bank', label: 'Bank' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'payoneer', label: 'Payoneer' },
] as const;

type AccountOption = { id: string; label: string };

interface PayoutDetailFormProps {
  accounts: AccountOption[];
}

export function PayoutDetailForm({ accounts }: PayoutDetailFormProps) {
  const router = useRouter();
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [paymentGateway, setPaymentGateway] = useState<typeof PAYMENT_GATEWAYS[number]['value']>('bank');
  const [mobileNumber, setMobileNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/finances/payout-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          paymentGateway,
          mobileNumber: mobileNumber.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to save payout details');
      }
      router.refresh();
      setMobileNumber('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-gray-500">Add accounts first to set payout details.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/50 p-3 sm:p-4">
      <h3 className="text-sm font-semibold text-gray-900">Add or Update Payout Details</h3>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
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
          <label htmlFor="paymentGateway" className="block text-xs font-medium text-gray-600">
            Payment Gateway
          </label>
          <select
            id="paymentGateway"
            value={paymentGateway}
            onChange={(e) => setPaymentGateway(e.target.value as typeof paymentGateway)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          >
            {PAYMENT_GATEWAYS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="mobileNumber" className="block text-xs font-medium text-gray-600">
            Mobile Number
          </label>
          <input
            id="mobileNumber"
            type="text"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. +1234567890"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 sm:w-auto"
      >
        {submitting ? 'Saving…' : 'Save Payout Details'}
      </button>
    </form>
  );
}
