'use client';

import { useState } from 'react';
import { exportReportsToCSV, exportAccountsToCSV } from '@/lib/actions/exports';
import Papa from 'papaparse';

type ExportType = 'reports' | 'accounts';

interface ExportButtonProps {
  type: ExportType;
}

export function ExportButton({ type }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  async function handleExportReports(startDate: string, endDate: string) {
    setIsExporting(true);

    const data = await exportReportsToCSV(startDate, endDate);
    const csv = Papa.unparse(data);

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift-reports-${startDate}-to-${endDate}.csv`;
    a.click();

    setIsExporting(false);
    setShowDatePicker(false);
  }

  async function handleExportAccounts() {
    setIsExporting(true);

    const data = await exportAccountsToCSV();
    const csv = Papa.unparse(data);

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    setIsExporting(false);
  }

  if (type === 'accounts') {
    return (
      <button
        onClick={handleExportAccounts}
        disabled={isExporting}
        className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
      >
        {isExporting ? 'Exporting...' : '📥 Export Accounts CSV'}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowDatePicker(true)}
        className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
      >
        📥 Export Reports CSV
      </button>

      {showDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold mb-4">Select Date Range</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleExportReports(formData.get('startDate') as string, formData.get('endDate') as string);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  className="w-full rounded border px-3 py-2"
                  defaultValue={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  required
                  className="w-full rounded border px-3 py-2"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDatePicker(false)}
                  className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExporting}
                  className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
