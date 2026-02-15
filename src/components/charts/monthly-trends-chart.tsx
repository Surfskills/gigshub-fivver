'use client';

import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyTrendsData {
  month: string;
  moneyEarned: number;
  totalAccounts: number;
}

interface MonthlyTrendsChartProps {
  data: MonthlyTrendsData[];
}

// Memoized formatters
const formatCurrency = (value: number): string => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value.toFixed(0)}`;
};

const formatCurrencyFull = (value: number): string => {
  return `$${Number(value).toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

// Memoized custom tooltip
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-2 sm:p-3 rounded-md shadow-lg border border-gray-200 text-xs sm:text-sm">
      <p className="font-medium text-gray-700 mb-1.5 text-[10px] sm:text-xs">
        Month: {label}
      </p>
      {payload
        .filter((entry: any, i: number, arr: any[]) => 
          arr.findIndex((e: any) => e.dataKey === entry.dataKey) === i
        )
        .map((entry: any, index: number) => (
          <p key={entry.dataKey ?? index} style={{ color: entry.color }} className="font-semibold text-[11px] sm:text-xs">
            {entry.name}: {entry.name === 'Money Earned' 
              ? formatCurrencyFull(entry.value) 
              : entry.value}
          </p>
        ))}
    </div>
  );
});
CustomTooltip.displayName = 'CustomTooltip';

// Memoized empty state
const EmptyState = memo(() => (
  <div className="rounded-lg border bg-white p-3 sm:p-4 md:p-6">
    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Monthly Trends</h3>
    <div className="flex h-[200px] sm:h-[260px] md:h-[300px] items-center justify-center text-gray-500 text-xs sm:text-sm">
      No data available
    </div>
  </div>
));
EmptyState.displayName = 'EmptyState';

// Memoized mobile legend
const MobileLegend = memo(() => (
  <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:hidden" role="img" aria-label="Chart legend">
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-0.5 rounded-full bg-emerald-500" aria-hidden="true"></div>
      <span className="text-gray-600 text-[11px]">Money Earned</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-0.5 rounded-full bg-blue-500" aria-hidden="true"></div>
      <span className="text-gray-600 text-[11px]">Total Accounts</span>
    </div>
  </div>
));
MobileLegend.displayName = 'MobileLegend';

export const MonthlyTrendsChart = memo(({ data }: MonthlyTrendsChartProps) => {
  // Memoize processed chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((d) => ({
      month: d.month,
      moneyEarned: Number(d.moneyEarned.toFixed(2)),
      totalAccounts: d.totalAccounts,
    }));
  }, [data]);

  // Early return for empty state
  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-lg border bg-white p-3 sm:p-4 md:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
        Monthly Trends
      </h3>
      
      <div className="w-full overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        <ResponsiveContainer 
          width="100%" 
          height={280}
          className="sm:!h-[350px] md:!h-[400px]"
          debounce={100}
        >
          <LineChart 
            data={chartData} 
            margin={{ 
              top: 5, 
              right: 10, 
              left: -10, 
              bottom: 5 
            }}
            className="sm:!mr-5 sm:!ml-2"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              vertical={false}
              className="opacity-60 sm:opacity-100"
            />
            
            <XAxis
              dataKey="month"
              tick={{ fontSize: 9 }}
              className="sm:text-[11px]"
              angle={-45}
              textAnchor="end"
              height={65}
              interval="preserveStartEnd"
            />
            
            {/* Left Y-axis - Money */}
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 9 }}
              className="sm:text-[11px]"
              width={40}
              tickFormatter={formatCurrency}
              label={{ 
                value: '$', 
                angle: -90, 
                position: 'insideLeft',
                className: 'hidden sm:block',
                style: { fontSize: 11 }
              }}
            />
            
            {/* Right Y-axis - Accounts (hidden on mobile) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 9 }}
              className="hidden sm:block sm:text-[11px]"
              width={40}
              label={{ 
                value: 'Accounts', 
                angle: 90, 
                position: 'insideRight',
                style: { fontSize: 11 }
              }}
            />
            
            <Tooltip
              content={<CustomTooltip />}
              isAnimationActive={false}
              cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
            />
            
            <Legend 
              wrapperStyle={{
                fontSize: '10px',
                paddingTop: '8px'
              }}
              iconSize={8}
              className="hidden sm:block"
              content={() => (
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded-full bg-emerald-500" />
                    <span className="text-gray-600 text-[11px]">Money Earned</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded-full bg-blue-500" />
                    <span className="text-gray-600 text-[11px]">Total Accounts</span>
                  </div>
                </div>
              )}
            />
            
            {/* Money Earned Line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="moneyEarned"
              stroke="#10b981"
              strokeWidth={2}
              className="sm:stroke-[2.5]"
              name="Money Earned"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls
              isAnimationActive={false}
            />
            
            {/* Total Accounts Line - right axis on desktop, left on mobile (when right axis hidden) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalAccounts"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Total Accounts"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Mobile legend */}
      <MobileLegend />
    </div>
  );
});

MonthlyTrendsChart.displayName = 'MonthlyTrendsChart';