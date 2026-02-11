import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { db } from '@/lib/db';
import { getMetricTrends } from '@/lib/queries/analytics';
import { AnalyticsFilters } from '@/components/analytics-filters';

// Optimized chart loading with better skeleton
const MetricTrendChart = dynamic(
  () => import('@/components/charts/metric-trend-chart').then((m) => ({ 
    default: m.MetricTrendChart 
  })),
  { 
    ssr: false, 
    loading: () => <ChartSkeleton />
  }
);

// Chart loading skeleton
function ChartSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="animate-pulse">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="h-6 w-32 bg-gray-200 rounded sm:h-7" />
        </div>
        {/* Chart area */}
        <div className="p-4 sm:p-6">
          <div className="h-64 bg-gray-100 rounded sm:h-80 lg:h-96" />
        </div>
        {/* Legend */}
        <div className="border-t border-gray-200 px-4 py-3 sm:px-6">
          <div className="flex gap-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyAnalytics() {
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
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">
        No analytics data yet
      </h3>
      <p className="mt-2 text-sm text-gray-600 sm:text-base">
        Start tracking your performance by adding shift reports.
      </p>
    </div>
  );
}

// Filters skeleton
function FiltersSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      <div className="h-10 w-32 animate-pulse bg-gray-200 rounded-md" />
      <div className="h-10 w-40 animate-pulse bg-gray-200 rounded-md" />
    </div>
  );
}

interface AnalyticsPageProps {
  searchParams: { period?: string; accountId?: string };
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const period = Math.min(30, Math.max(7, Number(searchParams.period) || 14));
  const accountId = searchParams.accountId || undefined;

  const [trendData, accounts] = await Promise.all([
    getMetricTrends(period, accountId),
    db.account.findMany({
      select: { id: true, platform: true, username: true },
      orderBy: { platform: 'asc' },
    }),
  ]);

  const accountOptions = accounts.map((a) => ({
    id: a.id,
    label: `${a.platform} - ${a.username}`,
  }));

  const hasData = trendData.length > 0;

  const moneyData = trendData.map((d) => ({
    date: d.date,
    availableBalance: d.availableBalance,
    pendingBalance: d.pendingBalance,
  }));

  const ratingData = trendData.map((d) => ({
    date: d.date,
    rating: d.rating,
  }));

  const rankingData = trendData.map((d) => ({
    date: d.date,
    ranking: d.ranking,
  }));

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile-first container */}
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header section - mobile optimized */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            {/* Title and description */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                Analytics Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
                Track your performance metrics over time
              </p>
              
              {/* Mobile data summary */}
              {hasData && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 sm:hidden">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 font-medium">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Last {period} days
                  </span>
                  {accountId && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Filtered
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Filters - responsive positioning */}
            <div className="shrink-0">
              <Suspense fallback={<FiltersSkeleton />}>
                <AnalyticsFilters accounts={accountOptions} />
              </Suspense>
            </div>
          </div>
        </header>

        {/* Main content area */}
        {!hasData ? (
          <EmptyAnalytics />
        ) : (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Charts grid - mobile stacked, desktop optional grid */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-1">
              
              {/* Money Chart */}
              <section aria-labelledby="money-chart-title">
                <Suspense fallback={<ChartSkeleton />}>
                  <MetricTrendChart
                    title="Balance Overview"
                    variant="money"
                    data={moneyData}
                    dataKeys={[
                      { key: 'availableBalance', color: '#10b981', name: 'Available' },
                      { key: 'pendingBalance', color: '#f59e0b', name: 'Pending' },
                    ]}
                  />
                </Suspense>
              </section>

              {/* Rating Chart */}
              <section aria-labelledby="rating-chart-title">
                <Suspense fallback={<ChartSkeleton />}>
                  <MetricTrendChart
                    title="Performance Rating"
                    variant="rating"
                    data={ratingData}
                    dataKeys={[{ key: 'rating', color: '#3b82f6', name: 'Rating' }]}
                  />
                </Suspense>
              </section>

              {/* Ranking Chart */}
              <section aria-labelledby="ranking-chart-title">
                <Suspense fallback={<ChartSkeleton />}>
                  <MetricTrendChart
                    title="Platform Ranking"
                    variant="ranking"
                    data={rankingData}
                    dataKeys={[{ key: 'ranking', color: '#8b5cf6', name: 'Ranking Page' }]}
                  />
                </Suspense>
              </section>
            </div>

            {/* Mobile-only quick insights */}
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5 sm:hidden">
              <h2 className="text-sm font-semibold text-gray-900">Quick Insights</h2>
              <ul className="mt-3 space-y-2 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Tap any chart to see detailed data points</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Swipe horizontally on charts to see more data</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span>Use filters above to focus on specific accounts or time periods</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Metadata for SEO
export const metadata = {
  title: 'Analytics Dashboard | Freelance Manager',
  description: 'Track your freelancing performance with detailed analytics on earnings, ratings, and platform rankings.',
};

// Revalidate every 5 minutes for fresh data
export const revalidate = 300;