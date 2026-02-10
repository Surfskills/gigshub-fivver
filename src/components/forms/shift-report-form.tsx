'use client';

import { useState } from 'react';
import { submitShiftReport } from '@/lib/actions/reports';
import { Shift } from '@prisma/client';

interface ShiftReportFormProps {
  accountId: string;
  accountName: string;
  existingShifts: Shift[];
}

export function ShiftReportForm({ accountId, accountName, existingShifts }: ShiftReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const availableShifts: Shift[] = ['AM', 'PM'].filter((s) => !existingShifts.includes(s as Shift)) as Shift[];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

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
    });

    if (result.success) {
      setSuccess(true);
      e.currentTarget.reset();
    } else {
      setError(result.error || 'Submission failed');
    }

    setIsSubmitting(false);
  }

  if (availableShifts.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm text-green-800">✓ All reports submitted for {accountName} today</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border bg-white p-6">
        <h3 className="text-lg font-semibold mb-4">{accountName}</h3>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        {success && (
          <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-800">Report submitted successfully</div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Shift *</label>
            <select name="shift" required className="w-full rounded border px-3 py-2">
              {availableShifts.map((shift) => (
                <option key={shift} value={shift}>
                  {shift}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Orders Completed *</label>
            <input type="number" name="ordersCompleted" required min="0" className="w-full rounded border px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pending Orders *</label>
            <input type="number" name="pendingOrders" required min="0" className="w-full rounded border px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Available Balance *</label>
            <input
              type="number"
              name="availableBalance"
              required
              min="0"
              step="0.01"
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pending Balance *</label>
            <input
              type="number"
              name="pendingBalance"
              required
              min="0"
              step="0.01"
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ranking Page</label>
            <input type="number" name="rankingPage" min="1" className="w-full rounded border px-3 py-2" />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded border px-3 py-2"
            placeholder="Any issues, observations, or handover notes..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </form>
  );
}
