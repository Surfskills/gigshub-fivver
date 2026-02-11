import Link from 'next/link';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { formatAccountLevel, getAccountLevelStyle } from '@/lib/account-level';

export const metadata = {
  title: 'Reports History | Freelance Manager',
  description: 'View past shift reports.',
};

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function today() {
  return new Date().toISOString().split('T')[0];
}

interface PageProps {
  searchParams: Promise<{ accountId?: string; startDate?: string; endDate?: string }>;
}

export default async function ReportsHistoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const accountId = params.accountId || undefined;
  const startDate = params.startDate || daysAgo(30);
  const endDate = params.endDate || today();

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const reports = await db.shiftReport.findMany({
    where: {
      ...(accountId && { accountId }),
      reportDate: {
        gte: start,
        lte: end,
      },
    },
    include: {
      account: { select: { id: true, platform: true, username: true, accountLevel: true } },
      reportedBy: { select: { name: true } },
    },
    orderBy: [{ reportDate: 'desc' }, { shift: 'asc' }],
  });

  const accounts = await db.account.findMany({
    where: { status: 'active' },
    select: { id: true, platform: true, username: true },
    orderBy: { platform: 'asc' },
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

  const formatRating = (r: number | null) => (r != null ? r.toFixed(2) : '—');

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Reports History</h1>
            <p className="mt-1 text-sm text-gray-600">
              {startDate} to {endDate}
              {accountId && ` • Filtered by account`}
            </p>
          </div>
          <Link
            href="/reports"
            prefetch
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
          >
            Submit Report
          </Link>
        </div>
      </header>

      {/* Filter */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <form action="/reports/history" method="get" className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="accountId" className="block text-xs font-medium text-gray-600 mb-1">
              Account
            </label>
            <select
              id="accountId"
              name="accountId"
              defaultValue={accountId || ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">All accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.platform} – {a.username}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-xs font-medium text-gray-600 mb-1">
              From
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              defaultValue={startDate}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-xs font-medium text-gray-600 mb-1">
              To
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              defaultValue={endDate}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Reports table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {reports.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="font-medium">No reports found</p>
            <p className="mt-1 text-sm">Try adjusting the date range or account filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Shift</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Account</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Level</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Completed</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Pending</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Available</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Reported by</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {format(new Date(r.reportDate), 'MMM d, yyyy')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                          r.shift === 'AM' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {r.shift}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {r.account.platform} – {r.account.username}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getAccountLevelStyle(r.account.accountLevel)}`}>
                        {formatAccountLevel(r.account.accountLevel)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {r.ordersCompleted}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-orange-600">
                      {r.pendingOrders}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-green-600">
                      {formatCurrency(Number(r.availableBalance))}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                      {formatRating(r.rating != null ? Number(r.rating) : null)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{r.reportedBy.name}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/accounts/${r.accountId}/reports/${r.id}/edit`}
                        prefetch
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
