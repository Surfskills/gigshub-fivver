import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { getMissingReportsToday } from '@/lib/queries/reports';
import { getDashboardStats, getMonthlyTrends, getITSupportAnalystLeaderboard } from '@/lib/queries/dashboard';
import { getTopPerformingAccounts } from '@/lib/queries/accounts';
import { TopPerformingAccountsCard } from '@/components/dashboard/top-performing-accounts-card';
import { AlertButton } from '@/components/alert-button';
import { AccountHealthCard } from '@/components/dashboard/account-health-card';
import { MissingReportsCard } from '@/components/dashboard/missing-reports-card';
import { ITSupportLeaderboard } from '@/components/dashboard/it-support-leaderboard';

// Optimized chart loading
const MonthlyTrendsChart = dynamic(
  () => import('@/components/charts/monthly-trends-chart').then((m) => ({ default: m.MonthlyTrendsChart })),
  { 
    ssr: false, 
    loading: () => <ChartSkeleton />
  }
);

// Loading skeletons
function ChartSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="animate-pulse">
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="h-6 w-40 bg-gray-200 rounded sm:h-7" />
        </div>
        <div className="p-4 sm:p-6">
          <div className="h-80 bg-gray-100 rounded lg:h-96" />
        </div>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-3 sm:p-4 md:p-5">
          <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
          <div className="h-8 w-16 bg-gray-300 rounded" />
        </div>
      ))}
    </div>
  );
}

function PlatformStatsSkeleton() {
  return (
    <div className="grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-3 sm:p-4 md:p-5">
          <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
          <div className="h-8 w-12 bg-gray-300 rounded" />
        </div>
      ))}
    </div>
  );
}

// Helper function for platform icons
function getPlatformIcon(platform: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    'Fiverr': (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
      </svg>
    ),
    'Upwork': (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z" />
      </svg>
    ),
    'Freelancer': (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.096 3.076l1.634 2.292L24 3.076M5.503 20.924l4.474-4.374-2.692-2.89m6.133-10.584L11.027 5.23l4.022.15M4.124 3.077l.857 1.76 4.734.294m-3.058 7.072l3.497-6.522L0 5.13" />
      </svg>
    ),
  };
  
  return iconMap[platform] || (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

export default async function DashboardPage() {
  let missingReports: Awaited<ReturnType<typeof getMissingReportsToday>> = [];
  let stats: Awaited<ReturnType<typeof getDashboardStats>>;
  let monthlyTrends: Awaited<ReturnType<typeof getMonthlyTrends>>;
  let leaderboard: Awaited<ReturnType<typeof getITSupportAnalystLeaderboard>>;
  let loadError: string | null = null;

  let topAccounts: Awaited<ReturnType<typeof getTopPerformingAccounts>> = [];
  try {
    const [missing, s, trends, lb, top] = await Promise.all([
      getMissingReportsToday(),
      getDashboardStats(),
      getMonthlyTrends(12),
      getITSupportAnalystLeaderboard(),
      getTopPerformingAccounts(),
    ]);
    missingReports = missing;
    stats = s;
    monthlyTrends = trends;
    leaderboard = lb;
    topAccounts = top;
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Failed to load dashboard data';
    stats = {
      totalGigs: 0,
      totalReports: 0,
      accountsByPlatform: [],
      totalAvailableEarnings: 0,
      totalPendingEarnings: 0,
    };
    monthlyTrends = [];
    leaderboard = [];
  }

  const hasMissingReports = missingReports.length > 0;
  const totalAccounts = stats.accountsByPlatform.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="font-medium">Could not load dashboard data</p>
          <p className="mt-1 text-sm">{loadError}</p>
          <p className="mt-2 text-sm">Check your database connection and .env (DATABASE_URL).</p>
        </div>
      )}
      {/* Header Section - Mobile Optimized */}
      <header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Title and date */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
              Operations Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
              <time dateTime={new Date().toISOString()}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </p>

            {/* Mobile quick stats pills */}
            <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                {totalAccounts} accounts
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                ${stats.totalAvailableEarnings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Alert button - only show when there are missing reports */}
          {hasMissingReports && (
            <div className="flex-shrink-0">
              <Suspense fallback={<div className="h-10 w-32 animate-pulse bg-red-200 rounded-md" />}>
                <AlertButton />
              </Suspense>
            </div>
          )}
        </div>

        {/* Alert banner for missing reports */}
        {hasMissingReports && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 ring-1 ring-red-600/20 sm:p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-red-800 sm:text-base">
                  {missingReports.length} {missingReports.length === 1 ? 'report' : 'reports'} missing today
                </h3>
                <p className="mt-1 text-xs text-red-700 sm:text-sm">
                  Some accounts haven't submitted their shift reports yet.
                </p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Stats Grid - Mobile First */}
      <section aria-labelledby="main-stats-title">
        <h2 id="main-stats-title" className="sr-only">Main Statistics</h2>
        <Suspense fallback={<StatsSkeleton />}>
          <div className="grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            <AccountHealthCard 
              label="Total Gigs" 
              value={stats.totalGigs}
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />
            <AccountHealthCard 
              label="Total Reports" 
              value={stats.totalReports}
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            <AccountHealthCard
              label="Available"
              value={`$${stats.totalAvailableEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              variant="success"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <AccountHealthCard
              label="Pending"
              value={`$${stats.totalPendingEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              variant="warning"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <AccountHealthCard 
              label="Accounts" 
              value={totalAccounts}
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
          </div>
        </Suspense>
      </section>

      {/* Platform Breakdown - Mobile First */}
      <section aria-labelledby="platform-stats-title">
        <h2 id="platform-stats-title" className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">
          Accounts by Platform
        </h2>
        <Suspense fallback={<PlatformStatsSkeleton />}>
          <div className="grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-3">
            {stats.accountsByPlatform.map((p) => (
              <AccountHealthCard 
                key={p.platform} 
                label={`${p.platform}`}
                value={p.count}
                icon={getPlatformIcon(p.platform)}
              />
            ))}
          </div>
        </Suspense>
      </section>

      {/* Top Performing Accounts */}
      <section aria-labelledby="top-accounts-title">
        <h2 id="top-accounts-title" className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">
          Top Performing Accounts
        </h2>
        <TopPerformingAccountsCard accounts={topAccounts} />
      </section>

      {/* Monthly Trends Chart */}
      <section aria-labelledby="trends-chart-title">
        <Suspense fallback={<ChartSkeleton />}>
          <MonthlyTrendsChart data={monthlyTrends} />
        </Suspense>
      </section>

      {/* IT Support Analyst Leaderboard */}
      <section aria-labelledby="leaderboard-title">
        <Suspense fallback={<ChartSkeleton />}>
          <ITSupportLeaderboard data={leaderboard} />
        </Suspense>
      </section>

      {/* Missing Reports */}
      {hasMissingReports && (
        <section aria-labelledby="missing-reports-title">
          <Suspense fallback={<ChartSkeleton />}>
            <MissingReportsCard items={missingReports} />
          </Suspense>
        </section>
      )}

      {/* Mobile Helper */}
      <div className="rounded-lg bg-blue-50 p-4 sm:hidden">
        <div className="flex gap-3">
          <svg className="h-5 w-5 flex-shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              Quick Tip
            </h3>
            <p className="mt-1 text-xs text-blue-700">
              Tap on any stat card to see more details. Swipe left/right on charts to explore historical data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metadata for SEO
export const metadata = {
  title: 'Dashboard | Freelance Manager',
  description: 'View your operations dashboard with real-time stats, earnings, and performance metrics across all your freelancing accounts.',
};

// Revalidate every minute for fresh data
export const revalidate = 60;