import Link from 'next/link';
import type { Account } from '@prisma/client';
import { formatAccountLevel, getAccountLevelStyle } from '@/lib/account-level';

type TopAccount = Account & {
  shiftReports: Array<{ rankingPage: number | null; reportDate: Date }>;
  _count: { gigs: number; shiftReports: number };
};

interface TopPerformingAccountsCardProps {
  accounts: TopAccount[];
}

export function TopPerformingAccountsCard({ accounts }: TopPerformingAccountsCardProps) {
  if (accounts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Top Performing Accounts</h2>
        <p className="mt-2 text-sm text-gray-500">
          Accounts ranking on page 1 or 2 will appear here once reports are submitted.
        </p>
        <Link
          href="/accounts"
          prefetch
          className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View all accounts →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Top Performing Accounts</h2>
        <Link
          href="/accounts"
          prefetch
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View all →
        </Link>
      </div>
      <div className="divide-y divide-gray-100">
        {accounts.slice(0, 8).map((account) => {
          const rank = account.shiftReports[0]?.rankingPage ?? 0;
          return (
            <Link
              key={account.id}
              href={`/accounts/${account.id}`}
              prefetch
              className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50 sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">
                  {account.platform} – {account.username}
                </p>
                <p className="truncate text-sm text-gray-500">{account.email}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getAccountLevelStyle(account.accountLevel)}`}
                >
                  {formatAccountLevel(account.accountLevel)}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    rank === 1 ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  Page {rank}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
