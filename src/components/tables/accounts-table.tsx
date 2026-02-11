import Link from 'next/link';
import { memo } from 'react';
import { AccountLevel, AccountStatus, Platform } from '@prisma/client';
import { reportsHistoryUrl } from '@/lib/urls';
import { formatAccountLevel, getAccountLevelStyle } from '@/lib/account-level';

interface AccountRow {
  id: string;
  platform: Platform;
  username: string;
  email: string;
  typeOfGigs: string;
  status: AccountStatus;
  accountLevel: AccountLevel;
  gigsCount: number;
  reportsCount: number;
  rankingPage?: number | null;
}

interface AccountsTableProps {
  rows: AccountRow[];
}

// Memoized row component for performance
const AccountCard = memo(({ row }: { row: AccountRow }) => {
  return (
    <div className="bg-white border-b last:border-b-0 p-4 hover:bg-gray-50 transition-colors">
      {/* Mobile Card Layout */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Header: Platform + Status + Rank + Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {row.rankingPage != null && (
              <span
                className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                  row.rankingPage <= 2 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Page {row.rankingPage}
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase">
              {row.platform}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getAccountLevelStyle(row.accountLevel)}`}>
              {formatAccountLevel(row.accountLevel)}
            </span>
          </div>
          <StatusBadge status={row.status} />
        </div>

        {/* Username (Primary Info) */}
        <Link 
          href={`/accounts/${row.id}`} 
          prefetch={false}
          className="text-base font-semibold text-blue-700 hover:text-blue-900 hover:underline -mt-1"
        >
          {row.username}
        </Link>

        {/* Secondary Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500 block text-xs">Email</span>
            <span className="text-gray-900 truncate block">{row.email}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Gig Type</span>
            <span className="text-gray-900">{row.typeOfGigs}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Gigs:</span>
            <span className="font-semibold text-gray-900">{row.gigsCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Reports:</span>
            <span className="font-semibold text-gray-900">{row.reportsCount}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t">
          <Link
            href={reportsHistoryUrl(row.id)}
            prefetch={false}
            className="flex-1 text-center py-2 px-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            View Reports
          </Link>
          <Link
            href={`/reports?accountId=${row.id}`}
            prefetch={false}
            className="flex-1 text-center py-2 px-3 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            Submit
          </Link>
        </div>
      </div>

      {/* Desktop Table Row (hidden on mobile) */}
      <div className="hidden md:grid md:grid-cols-10 md:gap-4 md:items-center md:px-4 md:py-3">
        <div>
          {row.rankingPage != null ? (
            <span
              className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                row.rankingPage <= 2 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Page {row.rankingPage}
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>
        <div className="uppercase text-sm font-medium text-gray-900">
          {row.platform}
        </div>
        <div>
          <Link 
            href={`/accounts/${row.id}`} 
            prefetch={false}
            className="font-medium text-blue-700 hover:underline"
          >
            {row.username}
          </Link>
        </div>
        <div className="text-gray-600 text-sm truncate">{row.email}</div>
        <div className="text-gray-600 text-sm">{row.typeOfGigs}</div>
        <div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getAccountLevelStyle(row.accountLevel)}`}>
            {formatAccountLevel(row.accountLevel)}
          </span>
        </div>
        <div>
          <StatusBadge status={row.status} />
        </div>
        <div className="text-right font-medium pr-4">{row.gigsCount}</div>
        <div className="text-right font-medium pr-6 min-w-[2.5rem]">{row.reportsCount}</div>
        <div className="flex gap-5 justify-end pl-6 min-w-[8rem]">
          <Link
            href={reportsHistoryUrl(row.id)}
            prefetch={false}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors py-1.5 px-2 rounded hover:bg-blue-50"
          >
            Reports
          </Link>
          <Link
            href={`/reports?accountId=${row.id}`}
            prefetch={false}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors py-1.5 px-2 rounded hover:bg-emerald-50"
          >
            Submit
          </Link>
        </div>
      </div>
    </div>
  );
});

AccountCard.displayName = 'AccountCard';

// Status badge component
const StatusBadge = memo(({ status }: { status: AccountStatus }) => {
  const variants = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-gray-100 text-gray-800',
    risk: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[status] || variants.paused}`}>
      {status}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

export function AccountsTable({ rows }: AccountsTableProps) {
  return (
    <div className="w-full">
      {/* Mobile: Stacked Cards */}
      <div className="md:hidden rounded-lg border border-gray-200 overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No accounts found
          </div>
        ) : (
          rows.map((row) => <AccountCard key={row.id} row={row} />)
        )}
      </div>

      {/* Desktop: Table View */}
      <div className="hidden md:block rounded-lg border border-gray-200 overflow-hidden bg-white">
        {/* Table Header */}
        <div className="grid grid-cols-10 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
          <div>Rank</div>
          <div>Platform</div>
          <div>Username</div>
          <div>Email</div>
          <div>Type of gigs</div>
          <div>Level</div>
          <div>Status</div>
          <div className="text-right pr-4">Gigs</div>
          <div className="text-right pr-6">Reports</div>
          <div className="text-right pl-6">Actions</div>
        </div>

        {/* Table Body */}
        {rows.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No accounts found
          </div>
        ) : (
          rows.map((row) => <AccountCard key={row.id} row={row} />)
        )}
      </div>
    </div>
  );
}