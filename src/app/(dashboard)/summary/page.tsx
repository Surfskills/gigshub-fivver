import Link from 'next/link';
import { getDashboardSummary } from '@/lib/queries/dashboard';
import { SummaryReportView } from '@/components/summary-report-view';
import { formatAccountLevel } from '@/lib/account-level';
import type { AccountLevel } from '@prisma/client';

export const metadata = {
  title: 'Summary Report | Freelance Manager',
  description: 'Business overview and key metrics report.',
};

export default async function SummaryReportPage() {
  let summary;
  try {
    summary = await getDashboardSummary();
  } catch (err) {
    console.error('Summary report error:', err);
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <h2 className="font-semibold">Could not load summary</h2>
        <p className="mt-2 text-sm">Check your database connection and try again.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-amber-900 underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const exportData = {
    ...summary,
    topAccounts: summary.topAccounts.map((a) => ({
      ...a,
      level: formatAccountLevel(a.level as AccountLevel),
    })),
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Summary Report</h1>
          <p className="mt-1 text-sm text-gray-600">
            Key business metrics · Generated {new Date(summary.generatedAt).toLocaleString()}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to dashboard
        </Link>
      </header>

      <SummaryReportView summary={exportData} />
    </div>
  );
}
