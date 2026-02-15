'use client';

import { useState } from 'react';
import Link from 'next/link';

const PAGE_SIZE = 20;

type Account = { id: string; platform: string; username: string };

interface ReportsSubmissionSectionProps {
  accounts: Account[];
}

/** Account selector — links to /reports/[accountId] (same pattern as edit report). */
export function ReportsSubmissionSection({ accounts }: ReportsSubmissionSectionProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(accounts.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginatedAccounts = accounts.slice(start, start + PAGE_SIZE);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-3 text-sm font-medium text-gray-700">Select account to submit report</h3>
      <p className="mb-4 text-sm text-gray-500">
        Click an account to open the form pre-filled with the last report.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {paginatedAccounts.map((account) => (
          <Link
            key={account.id}
            href={`/reports/${account.id}`}
            className="inline-flex rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
          >
            {account.platform} – {account.username}
          </Link>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, accounts.length)} of {accounts.length} accounts
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
