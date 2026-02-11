import React, { Suspense } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ShiftReportForm } from '@/components/forms/shift-report-form';
import { startOfDay, format } from 'date-fns';
import { Shift } from '@prisma/client';

// Metadata for SEO
export const metadata = {
  title: 'Submit Reports | Freelance Manager',
  description: 'Submit shift reports for your freelancing accounts. Track daily performance, orders, and earnings.',
};

// Loading skeleton for the shift report form
function ShiftReportFormSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="animate-pulse">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 bg-gray-300 rounded" />
            <div className="gap-2 flex">
              <div className="h-8 w-20 bg-gray-200 rounded-full" />
              <div className="h-8 w-20 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>
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

// Empty state when no accounts
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">
        No accounts to report
      </h3>
      <p className="mt-2 text-sm text-gray-600 sm:text-base">
        Create an account first to submit shift reports.
      </p>
      <div className="mt-6">
        <Link
          href="/accounts/new"
          prefetch
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Add Account
        </Link>
      </div>
    </div>
  );
}

export default async function ReportsPage() {
  const today = startOfDay(new Date());

  let accounts;
  try {
    accounts = await db.account.findMany({
      where: { status: 'active' },
      include: {
        shiftReports: {
          where: { reportDate: today },
          select: { shift: true },
        },
      },
      orderBy: { platform: 'asc' },
    });
  } catch {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <h2 className="font-semibold">Could not load reports</h2>
        <p className="mt-2 text-sm">Check your database connection (DATABASE_URL) and try again.</p>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
              Submit Reports
            </h1>
            <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
              <time dateTime={today.toISOString()}>
                {format(today, 'EEEE, MMMM d, yyyy')}
              </time>
            </p>
          </div>
          <Link
            href="/reports/history"
            prefetch
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View History
          </Link>
        </div>
      </header>

      {/* Report forms per account */}
      <div className="space-y-6">
        {accounts.map((account) => {
          const existingShifts = account.shiftReports.map((r) => r.shift) as Shift[];
          const accountName = `${account.platform} – ${account.username}`;

          return (
            <Suspense
              key={account.id}
              fallback={<ShiftReportFormSkeleton />}
            >
              <ShiftReportForm
                accountId={account.id}
                accountName={accountName}
                existingShifts={existingShifts}
              />
            </Suspense>
          );
        })}
      </div>
    </div>
  );
}
