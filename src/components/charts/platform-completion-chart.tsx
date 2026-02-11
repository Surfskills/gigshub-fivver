'use client';

import { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PlatformCompletionChartProps {
  data: {
    platform: string;
    completionRate: number;
    submitted: number;
    expected: number;
  }[];
}

// Memoized color function
const getColor = (rate: number): string => {
  if (rate >= 90) return '#10b981'; // Green - Excellent
  if (rate >= 70) return '#f59e0b'; // Amber - Good
  return '#ef4444'; // Red - Needs attention
};

// Memoized custom tooltip
const CustomTooltip = memo(({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const rate = data.completionRate;
  const color = getColor(rate);

  return (
    <div className="bg-white p-2 sm:p-3 rounded-md shadow-lg border border-gray-200">
      <p className="font-semibold text-gray-800 mb-1.5 text-xs sm:text-sm">
        {data.platform}
      </p>
      <p style={{ color }} className="font-bold text-sm sm:text-base mb-0.5">
        {rate.toFixed(1)}%
      </p>
      <p className="text-[10px] sm:text-xs text-gray-600">
        {data.submitted} of {data.expected} submitted
      </p>
      {data.expected - data.submitted > 0 && (
        <p className="text-[10px] sm:text-xs text-red-600 mt-0.5">
          {data.expected - data.submitted} pending
        </p>
      )}
    </div>
  );
});
CustomTooltip.displayName = 'CustomTooltip';

// Memoized empty state
const EmptyState = memo(() => (
  <div className="rounded-lg border bg-white p-3 sm:p-4 md:p-6">
    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
      Report Completion by Platform
    </h3>
    <div className="flex h-[180px] sm:h-[220px] md:h-[250px] items-center justify-center text-gray-500 text-xs sm:text-sm">
      No platform data available
    </div>
  </div>
));
EmptyState.displayName = 'EmptyState';

// Memoized legend
const CompletionLegend = memo(() => (
  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-[10px] sm:text-xs" role="img" aria-label="Completion rate legend">
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-2 rounded-sm bg-emerald-500" aria-hidden="true"></div>
      <span className="text-gray-600">≥90% Excellent</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-2 rounded-sm bg-amber-500" aria-hidden="true"></div>
      <span className="text-gray-600">70-89% Good</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-2 rounded-sm bg-red-500" aria-hidden="true"></div>
      <span className="text-gray-600">&lt;70% Low</span>
    </div>
  </div>
));
CompletionLegend.displayName = 'CompletionLegend';

// Memoized platform name truncator for mobile
const truncatePlatform = (name: string, isMobile: boolean): string => {
  if (!isMobile) return name;
  if (name.length <= 12) return name;
  return name.substring(0, 10) + '..';
};

export const PlatformCompletionChart = memo(({ data }: PlatformCompletionChartProps) => {
  // Memoize processed data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    
    // Sort by completion rate (lowest first for visual impact)
    const sorted = [...data].sort((a, b) => a.completionRate - b.completionRate);
    
    // Limit to top 8 on mobile to prevent overcrowding
    if (isMobile && sorted.length > 8) {
      return sorted.slice(0, 8);
    }
    
    return sorted;
  }, [data]);

  // Memoize bar colors
  const barColors = useMemo(
    () => chartData.map(entry => getColor(entry.completionRate)),
    [chartData]
  );

  // Early return for empty state
  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const dynamicHeight = Math.max(180, chartData.length * 35); // 35px per bar, min 180px

  return (
    <div className="rounded-lg border bg-white p-3 sm:p-4 md:p-6">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold mb-1">
          Report Completion by Platform
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">
          {chartData.length} platform{chartData.length !== 1 ? 's' : ''}
          {data.length > chartData.length && (
            <span className="text-amber-600 ml-1">
              (showing top 8)
            </span>
          )}
        </p>
      </div>
      
      <div className="w-full overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        <ResponsiveContainer 
          width="100%" 
          height={dynamicHeight}
          className="sm:!h-[280px] md:!h-[320px]"
          debounce={100}
        >
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 5, right: 15, left: 5, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb"
              horizontal={false}
              className="opacity-60 sm:opacity-100"
            />
            
            <XAxis 
              type="number" 
              domain={[0, 100]}
              tick={{ fontSize: 9 }}
              className="sm:text-[11px]"
              tickFormatter={(value) => `${value}%`}
            />
            
            <YAxis 
              dataKey="platform" 
              type="category" 
              width={isMobile ? 60 : 100}
              tick={{ fontSize: 9 }}
              className="sm:text-[11px]"
              tickFormatter={(value) => truncatePlatform(value, isMobile)}
            />
            
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              isAnimationActive={false}
            />
            
            <Bar 
              dataKey="completionRate" 
              name="Completion Rate"
              radius={[0, 4, 4, 0]}
              maxBarSize={40}
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={barColors[index]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <CompletionLegend />
    </div>
  );
});

PlatformCompletionChart.displayName = 'PlatformCompletionChart';