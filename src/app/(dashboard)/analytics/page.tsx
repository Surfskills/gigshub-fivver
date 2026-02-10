import {
  getBalanceTrends,
  getPendingOrdersTrend,
  getOperatorPerformance,
  getCompletionRateByPlatform,
} from '@/lib/queries/analytics';
import { BalanceTrendChart } from '@/components/dashboard/balance-trend-chart';
import { OrdersTrendChart } from '@/components/charts/orders-trend-chart';
import { OperatorPerformanceTable } from '@/components/charts/operator-performance-table';
import { PlatformCompletionChart } from '@/components/charts/platform-completion-chart';

export default async function AnalyticsPage() {
  const [balanceTrends, ordersTrends, operatorPerf, platformCompletion] = await Promise.all([
    getBalanceTrends(14),
    getPendingOrdersTrend(14),
    getOperatorPerformance(30),
    getCompletionRateByPlatform(30),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-600">Performance metrics and trends</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BalanceTrendChart data={balanceTrends} />
        <OrdersTrendChart data={ordersTrends} />
      </div>

      <PlatformCompletionChart data={platformCompletion} />

      <OperatorPerformanceTable data={operatorPerf} />
    </div>
  );
}
