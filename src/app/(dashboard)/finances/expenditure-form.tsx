'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const EXPENDITURE_TYPES = [
  { value: 'internet', label: 'Internet' },
  { value: 'rent', label: 'Rent' },
  { value: 'proxy', label: 'Proxy' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'water', label: 'Water' },
  { value: 'meals', label: 'Meals' },
  { value: 'office_furniture', label: 'Office Furniture' },
  { value: 'electronics', label: 'Electronics' },
] as const;

export function ExpenditureForm() {
  const router = useRouter();
  const [itemName, setItemName] = useState('');
  const [typeOfExpenditure, setTypeOfExpenditure] = useState<typeof EXPENDITURE_TYPES[number]['value']>('internet');
  const [cost, setCost] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/finances/expenditures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: itemName.trim(),
          typeOfExpenditure,
          cost: parseFloat(cost),
          transactionId: transactionId.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to add expenditure');
      }
      router.refresh();
      setItemName('');
      setCost('');
      setTransactionId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
      <h3 className="text-sm font-semibold text-gray-900">Add Expenditure</h3>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="itemName" className="block text-xs font-medium text-gray-600">
            Item Name
          </label>
          <input
            id="itemName"
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. Monthly broadband"
            required
          />
        </div>
        <div>
          <label htmlFor="typeOfExpenditure" className="block text-xs font-medium text-gray-600">
            Type of Expenditure
          </label>
          <select
            id="typeOfExpenditure"
            value={typeOfExpenditure}
            onChange={(e) => setTypeOfExpenditure(e.target.value as typeof typeOfExpenditure)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          >
            {EXPENDITURE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cost" className="block text-xs font-medium text-gray-600">
            Cost ($)
          </label>
          <input
            id="cost"
            type="number"
            step="0.01"
            min="0"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label htmlFor="transactionId" className="block text-xs font-medium text-gray-600">
            Transaction ID (optional)
          </label>
          <input
            id="transactionId"
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. TXN-12345"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {submitting ? 'Adding…' : 'Add Expenditure'}
      </button>
    </form>
  );
}
