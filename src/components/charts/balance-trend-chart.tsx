'use client';

import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BalanceTrendChartProps {
  data: {
    date: string;
    totalAvailable: number;
    totalPending: number;
  }[];
}

// Memoized custom tooltip for better performance
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-2 rounded-md shadow-lg border border-gray-200 text-xs">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ color: entry.color }} className="font-semibold">
          {entry.name}: ${entry.value.toFixed(2)}
        </p>
      ))}
    </div>
  );
});
CustomTooltip.displayName = 'CustomTooltip';

// Memoized tick formatter functions (created once, not on every render)
const formatXAxis = (value: string) => {
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const formatYAxis = (value: number) => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value}`;
};

export const BalanceTrendChart = memo(({ data }: BalanceTrendChartProps) => {
  // Memoize processed data to avoid recalculation
  const chartData = useMemo(() => {
    // Limit data points on mobile for performance
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    if (isMobile && data.length > 15) {
      // Sample data - take every nth item to show ~15 points
      const step = Math.ceil(data.length / 15);
      return data.filter((_, index) => index % step === 0);
    }
    return data;
  }, [data]);

  // Memoize chart config
  const chartConfig = useMemo(() => ({
    margin: { top: 5, right: 5, left: -20, bottom: 5 },
    height: {
      mobile: 250,
      tablet: 300,
      desktop: 350
    }
  }), []);

  return (
    <div className="rounded-lg border bg-white p-3 sm:p-4 md:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
        Balance Trends
      </h3>
      
      <div className="w-full overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        <ResponsiveContainer 
          width="100%" 
          height={250}
          className="sm:!h-[300px] md:!h-[350px]"
          debounce={100}
        >
          <LineChart 
            data={chartData}
            margin={chartConfig.margin}
          >
            {/* Simplified grid for performance */}
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f0f0f0"
              vertical={false}
            />
            
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={formatXAxis}
              angle={-45}
              textAnchor="end"
              height={60}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            
            <YAxis 
              tick={{ fontSize: 10 }}
              width={45}
              tickFormatter={formatYAxis}
              domain={['auto', 'auto']}
            />
            
            <Tooltip 
              content={<CustomTooltip />}
              isAnimationActive={false}
              cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
            />
            
            <Legend 
              wrapperStyle={{
                fontSize: '11px',
                paddingTop: '10px'
              }}
              iconSize={10}
            />
            
            <Line 
              type="monotone" 
              dataKey="totalAvailable" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Available" 
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
            
            <Line 
              type="monotone" 
              dataKey="totalPending" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Pending"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Mobile legend - static, no re-render */}
      <div className="flex gap-4 mt-3 text-xs sm:hidden" role="img" aria-label="Chart legend">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-emerald-500" aria-hidden="true"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-amber-500" aria-hidden="true"></div>
          <span className="text-gray-600">Pending</span>
        </div>
      </div>
    </div>
  );
});

BalanceTrendChart.displayName = 'BalanceTrendChart';