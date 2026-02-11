'use client';

import { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OrdersTrendChartProps {
  data: {
    date: string;
    totalPending: number;
    totalCompleted: number;
  }[];
}

// Memoized date formatters
const formatDateDesktop = (value: string): string => {
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const formatDateMobile = (value: string): string => {
  const date = new Date(value);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

// Memoized custom tooltip
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);

  return (
    <div className="bg-white p-2 sm:p-3 rounded-md shadow-lg border border-gray-200">
      <p className="font-medium text-gray-700 mb-1.5 text-[10px] sm:text-xs">
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ color: entry.color }} className="font-semibold text-[11px] sm:text-xs">
          {entry.name}: {entry.value}
        </p>
      ))}
      <p className="font-semibold text-gray-800 mt-1 pt-1 border-t text-[11px] sm:text-xs">
        Total: {total}
      </p>
    </div>
  );
});
CustomTooltip.displayName = 'CustomTooltip';

// Memoized empty state
const EmptyState = memo(() => (
  <div className="rounded-lg border bg-white p-3 sm:p-4 md:p-6">
    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Orders Trend</h3>
    <div className="flex h-[200px] sm:h-[260px] md:h-[300px] items-center justify-center text-gray-500 text-xs sm:text-sm">
      No order data available
    </div>
  </div>
));
EmptyState.displayName = 'EmptyState';

// Memoized mobile legend
const MobileLegend = memo(() => (
  <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:hidden" role="img" aria-label="Chart legend">
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-2 rounded-sm bg-blue-500" aria-hidden="true"></div>
      <span className="text-gray-600 text-[11px]">Completed</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-2 rounded-sm bg-red-500" aria-hidden="true"></div>
      <span className="text-gray-600 text-[11px]">Pending</span>
    </div>
  </div>
));
MobileLegend.displayName = 'MobileLegend';

export const OrdersTrendChart = memo(({ data }: OrdersTrendChartProps) => {
  // Memoize processed data (sample on mobile)
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    if (isMobile && data.length > 10) {
      // Sample data - show ~10 bars on mobile
      const step = Math.ceil(data.length / 10);
      return data.filter((_, index) => index % step === 0);
    }
    return data;
  }, [data]);

  // Memoize date formatter based on screen size
  const dateFormatter = useMemo(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return formatDateMobile;
    }
    return formatDateDesktop;
  }, []);

  // Early return for empty state
  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-lg border bg-white p-3 sm:p-4 md:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
        Orders Trend
      </h3>
      
      <div className="w-full overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        <ResponsiveContainer 
          width="100%" 
          height={240}
          className="sm:!h-[280px] md:!h-[320px]"
          debounce={100}
        >
          <BarChart 
            data={chartData}
            margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
            barGap={2}
            barCategoryGap="15%"
            className="sm:barCategoryGap-20"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb"
              vertical={false}
              className="opacity-60 sm:opacity-100"
            />
            
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9 }}
              className="sm:text-[11px]"
              tickFormatter={dateFormatter}
              angle={-35}
              textAnchor="end"
              height={50}
              interval="preserveStartEnd"
            />
            
            <YAxis 
              tick={{ fontSize: 9 }}
              className="sm:text-[11px]"
              width={35}
              tickFormatter={(value) => {
                // Abbreviate large numbers on mobile
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(1)}k`;
                }
                return value;
              }}
            />
            
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              isAnimationActive={false}
            />
            
            <Legend 
              wrapperStyle={{
                fontSize: '10px',
                paddingTop: '8px'
              }}
              iconSize={8}
              iconType="square"
              className="hidden sm:block"
            />
            
            {/* Bars - order matters for stacking appearance */}
            <Bar 
              dataKey="totalCompleted" 
              fill="#3b82f6" 
              name="Completed"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
              isAnimationActive={false}
            />
            <Bar 
              dataKey="totalPending" 
              fill="#ef4444" 
              name="Pending"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Mobile legend */}
      <MobileLegend />
    </div>
  );
});

OrdersTrendChart.displayName = 'OrdersTrendChart';