'use client';

import { useState, useTransition } from 'react';
import { exportReportsToCSV, exportAccountsToCSV } from '@/lib/actions/exports';
import Papa from 'papaparse';

type ExportType = 'reports' | 'accounts';

interface ExportButtonProps {
  type: ExportType;
}

export function ExportButton({ type }: ExportButtonProps) {
  const [isExporting, startTransition] = useTransition();
  const [showDatePicker, setShowDatePicker] = useState(false);

  async function handleExportReports(startDate: string, endDate: string) {
    startTransition(async () => {
      const data = await exportReportsToCSV(startDate, endDate);
      const csv = Papa.unparse(data);

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shift-reports-${startDate}-to-${endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setShowDatePicker(false);
    });
  }

  async function handleExportAccounts() {
    startTransition(async () => {
      const data = await exportAccountsToCSV();
      const csv = Papa.unparse(data);

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `accounts-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // Mobile-first button styles with touch optimization
  const btnStyles = `
    w-full sm:w-auto
    min-h-[44px]
    rounded-lg
    border border-gray-300 
    bg-white 
    px-4 py-2.5
    text-sm font-medium 
    shadow-sm
    transition-all duration-150 
    hover:bg-gray-50 
    active:bg-gray-100
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
    disabled:cursor-not-allowed disabled:opacity-50
    touch-manipulation
  `.trim().replace(/\s+/g, ' ');

  if (type === 'accounts') {
    return (
      <button 
        onClick={handleExportAccounts} 
        disabled={isExporting} 
        className={btnStyles}
        aria-label="Export accounts to CSV"
      >
        <span className="flex items-center justify-center gap-2">
          <span aria-hidden="true">📥</span>
          <span>{isExporting ? 'Exporting...' : 'Export Accounts'}</span>
        </span>
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={() => setShowDatePicker(true)} 
        className={btnStyles}
        aria-label="Export reports to CSV"
      >
        <span className="flex items-center justify-center gap-2">
          <span aria-hidden="true">📥</span>
          <span>Export Reports</span>
        </span>
      </button>

      {showDatePicker && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDatePicker(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="date-picker-title"
        >
          <div 
            className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile handle bar */}
            <div className="sm:hidden flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="p-6 pb-safe">
              <h3 
                id="date-picker-title"
                className="text-lg font-semibold mb-4 text-gray-900"
              >
                Select Date Range
              </h3>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleExportReports(
                    formData.get('startDate') as string, 
                    formData.get('endDate') as string
                  );
                }}
                className="space-y-4"
              >
                <div>
                  <label 
                    htmlFor="startDate"
                    className="block text-sm font-medium mb-2 text-gray-700"
                  >
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    name="startDate"
                    required
                    className="w-full min-h-[44px] rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="endDate"
                    className="block text-sm font-medium mb-2 text-gray-700"
                  >
                    End Date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    name="endDate"
                    required
                    className="w-full min-h-[44px] rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium transition-all hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 touch-manipulation"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isExporting}
                    className="w-full min-h-[44px] rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    {isExporting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Exporting...</span>
                      </span>
                    ) : (
                      'Export'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}