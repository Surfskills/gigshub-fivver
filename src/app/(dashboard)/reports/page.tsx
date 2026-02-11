import { Suspense } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ShiftReportForm } from '@/components/forms/shift-report-form';
import { startOfDay, format } from 'date-fns';

// Loading skeletons
function ShiftReportFormSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="animate-pulse">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 bg-gray-300 rounded" />
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-200 rounded-full" />
              <div className="h-8 w-20 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>
        {/* Form fields */}
        <div className="p-4 space-y-4 sm:p-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded-md sm:h-11" />
            </div>
          ))}
          <div className="h-11 w-full bg-gray-300 rounded-md sm:w-40" />
        </div>
      </div>
    </div>
  );
}

function PageHeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded sm:h-8" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-2 sm:gap-3">
          <div className="h-10 w-32 bg-gray-200 rounded-md" />
          <div className="h-10 w-40 bg-gray-200 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// Empty state component
function NoActiveAccounts({ accountId }: { accountId?: string }) {
  return (
    <div className="rounded-lg bg-white px-4 py-12 text-center shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl sm:px-6 sm:py-16">
      <svg
        className="mx-auto h-12 w-12 text-gray-400 sm:h-16 sm:w-16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">
        {accountId ? 'Account not found or inactive' : 'No active accounts'}
      </h3>
      <p className="mt-2 text-sm text-gray-600 sm:text-base">
        {accountId 
          ? 'This account may have been deactivated or removed.'
          : 'You need to add and activate an account before submitting reports.'}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {accountId ? (
          <Link
            href="/reports"
            prefetch
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 active:bg-blue-700 sm:px-5 sm:py-3"
          >
            View All Accounts
          </Link>
        ) : (
          <>
            <Link
              href="/accounts/new"
              prefetch
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 active:bg-blue-700 sm:px-5 sm:py-3"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Account
            </Link>
            <Link
              href="/accounts"
              prefetch
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:bg-gray-100 sm:px-5 sm:py-3"
            >
              View Accounts
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

interface ReportsPageProps {
  searchParams: { accountId?: string };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const today = startOfDay(new Date());
  const accountId = searchParams.accountId;

  const accounts = await db.account.findMany({
    where: accountId ? { id: accountId, status: 'active' } : { status: 'active' },
    select: {
      id: true,
      platform: true,
      username: true,
      shiftReports: {
        where: {
          reportDate: today,
        },
        select: {
          shift: true,
        },
      },
    },
    orderBy: {
      platform: 'asc',
    },
  });

  const hasAccounts = accounts.length > 0;
  const totalShiftsReported = accounts.reduce(
    (sum, acc) => sum + acc.shiftReports.length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile-first container */}
      <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header section - mobile optimized */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            {/* Title and description */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                Submit Shift Reports
              </h1>
              <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
                Report your daily shift performance and earnings
              </p>
              
              {/* Mobile info pills */}
              {hasAccounts && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:hidden">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {format(today, 'MMM d, yyyy')}
                  </span>
                  {totalShiftsReported > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 font-medium text-green-700">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {totalShiftsReported} submitted today
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons - mobile stacked */}
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              {accountId && (
                <Link
                  href="/reports"
                  prefetch
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:bg-gray-100 sm:px-5"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="hidden sm:inline">View All Accounts</span>
                  <span className="sm:hidden">All Accounts</span>
                </Link>
              )}
              <Link
                href={accountId ? `/analytics?accountId=${accountId}` : '/analytics'}
                prefetch
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 active:bg-emerald-700 sm:px-5"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analytics</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <Suspense fallback={<div className="space-y-4">{[...Array(2)].map((_, i) => <ShiftReportFormSkeleton key={i} />)}</div>}>
          {!hasAccounts ? (
            <NoActiveAccounts accountId={accountId} />
          ) : (
            <>
              {/* Desktop info card */}
              {totalShiftsReported > 0 && (
                <div className="mb-6 hidden rounded-lg bg-green-50 p-4 ring-1 ring-green-600/20 sm:block">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        {totalShiftsReported} {totalShiftsReported === 1 ? 'shift' : 'shifts'} reported today
                      </p>
                      <p className="mt-0.5 text-xs text-green-700">
                        Great progress! Keep tracking your performance.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Forms container */}
              <div 
                className="space-y-4 sm:space-y-6" 
                id={accountId ? `account-${accountId}` : undefined}
              >
                {accounts.map((account, index) => (
                  <div key={account.id}>
                    <ShiftReportForm
                      accountId={account.id}
                      accountName={`${account.platform} - ${account.username}`}
                      existingShifts={account.shiftReports.map((r) => r.shift)}
                    />
                    
                    {/* Divider between forms on mobile */}
                    {index < accounts.length - 1 && (
                      <div className="mt-4 border-t border-gray-200 sm:hidden" />
                    )}
                  </div>
                ))}
              </div>

              {/* Helper text for mobile users */}
              {accounts.length > 1 && (
                <div className="mt-6 rounded-lg bg-blue-50 p-4 sm:hidden">
                  <div className="flex gap-3">
                    <svg className="h-5 w-5 flex-shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-blue-800">
                        Multiple Accounts
                      </h3>
                      <p className="mt-1 text-xs text-blue-700">
                        Scroll down to submit reports for all your active accounts.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Suspense>
      </div>
    </div>
  );
}

// Metadata for SEO
export const metadata = {
  title: 'Submit Shift Reports | Freelance Manager',
  description: 'Submit your daily shift reports to track performance, earnings, and analytics across all your freelancing accounts.',
};

// Revalidate for fresh account data
export const revalidate = 60;