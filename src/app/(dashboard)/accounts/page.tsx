import React from "react"; // Ensure React is imported
import { Suspense } from 'react';
import Link from 'next/link';
import { getAccountsRankedByPage } from '@/lib/queries/accounts';
import { ExportButton } from '@/components/export-button';
import { AccountsTable } from '@/components/tables/accounts-table';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
// Metadata for SEO
export const metadata = {
  title: 'Accounts | Freelance Manager',
  description: 'Manage all your freelancing platform accounts in one place. Track gigs, earnings, and performance across multiple platforms.',
};

// Loading skeleton for the accounts table
function AccountsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="animate-pulse">
        {/* Mobile card skeletons */}
        <div className="block sm:hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-b border-gray-200 p-4 last:border-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 bg-gray-200 rounded" />
                  <div className="h-6 w-16 bg-gray-200 rounded-full" />
                </div>
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="flex gap-2">
                  <div className="h-7 w-20 bg-gray-200 rounded" />
                  <div className="h-7 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table skeleton */}
        <div className="hidden sm:block">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <div className="flex gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-24 bg-gray-300 rounded" />
              ))}
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-gray-200 px-6 py-4">
              <div className="flex gap-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-5 w-24 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Header skeleton
function HeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-gray-200 rounded sm:h-8" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-2 sm:gap-3">
          <div className="h-10 w-24 bg-gray-200 rounded-md" />
          <div className="h-10 w-32 bg-gray-200 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="rounded-lg bg-white px-4 py-12 text-center shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl sm:px-6 sm:py-16">
      <svg
        className="mx-auto h-12 w-12 text-gray-400 sm:h-16 sm:w-16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">
        No accounts yet
      </h3>
      <p className="mt-2 text-sm text-gray-600 sm:text-base">
        Get started by creating your first freelancing account.
      </p>
      <div className="mt-6">
        <Link
          href="/accounts/new"
          prefetch
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 active:bg-blue-700 sm:px-5 sm:py-3 sm:text-base"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Your First Account
        </Link>
      </div>
    </div>
  );
}

export default async function AccountsPage() {
  const accounts = await getAccountsRankedByPage();

  const accountsData = accounts.map((account) => ({
    id: account.id,
    platform: account.platform,
    username: account.username,
    email: account.email,
    typeOfGigs: account.typeOfGigs,
    status: account.status,
    accountLevel: account.accountLevel,
    gigsCount: account._count.gigs,
    reportsCount: account._count.shiftReports,
    rankingPage: account.shiftReports[0]?.rankingPage ?? null,
  }));

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile-first container */}
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header section - mobile optimized */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Title and description */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                Accounts
              </h1>
              <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
                Sorted by page rank (best first). Manage your freelancing platform accounts.
              </p>
              
              {/* Mobile stats summary */}
              {accounts.length > 0 && (
                <div className="mt-3 flex gap-4 text-sm text-gray-500 sm:hidden">
                  <span className="font-medium">
                    {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
                  </span>
                  <span>•</span>
                  <span>
                    {accounts.reduce((sum, acc) => sum + acc._count.gigs, 0)} total gigs
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons - mobile optimized */}
            <div className="flex gap-2 sm:gap-3">
              <Suspense fallback={<div className="h-10 w-20 animate-pulse bg-gray-200 rounded-md" />}>
                <ExportButton type="accounts" />
              </Suspense>
              <Link
                href="/accounts/new"
                prefetch
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 active:bg-blue-700 sm:px-5 sm:text-base"
              >
                <svg 
                  className="h-4 w-4 sm:h-5 sm:w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Account</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <Suspense fallback={<AccountsTableSkeleton />}>
          {accounts.length === 0 ? (
            <EmptyState />
          ) : (
            <AccountsTable rows={accountsData} />
          )}
        </Suspense>
      </div>
    </div>
  );
}

