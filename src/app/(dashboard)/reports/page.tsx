import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ReportsPageTabs } from '@/components/reports-page-tabs';
import { startOfDay, format } from 'date-fns';
import { REPORT_INTERVAL_HOURS } from '@/lib/queries/reports';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Submit Reports | Freelance Manager',
  description: 'Submit shift reports for your freelancing accounts.',
};

function EmptyState() {
  return (
    <div className="rounded-lg bg-white px-4 py-12 text-center shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <h3 className="text-base font-semibold text-gray-900">No accounts to report</h3>
      <p className="mt-2 text-sm text-gray-600">Create an account first to submit shift reports.</p>
      <Link href="/accounts/new" prefetch className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
        Add Account
      </Link>
    </div>
  );
}

export default async function ReportsPage() {
  let allAccounts;
  try {
    allAccounts = await db.account.findMany({
      where: { status: 'active' },
      select: { id: true, platform: true, username: true },
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

  if (allAccounts.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState />
      </div>
    );
  }

  const today = startOfDay(new Date());

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Submit Reports</h1>
            <p className="mt-1 text-sm text-gray-600">
              Reports due every {REPORT_INTERVAL_HOURS} hours · <time dateTime={today.toISOString()}>{format(today, 'EEEE, MMMM d, yyyy')}</time>
            </p>
          </div>
          <Link href="/reports/history" prefetch className="inline-flex gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            View History
          </Link>
        </div>
      </header>

      <ReportsPageTabs accounts={allAccounts} />
    </div>
  );
}
