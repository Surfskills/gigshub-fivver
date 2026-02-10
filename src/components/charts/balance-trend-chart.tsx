'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BalanceTrendChartProps {
  data: {
    date: string;
    totalAvailable: number;
    totalPending: number;
  }[];
}

export function BalanceTrendChart({ data }: BalanceTrendChartProps) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold mb-4">Balance Trends (All Accounts)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} labelFormatter={(label) => `Date: ${label}`} />
          <Legend />
          <Line type="monotone" dataKey="totalAvailable" stroke="#10b981" strokeWidth={2} name="Available Balance" />
          <Line type="monotone" dataKey="totalPending" stroke="#f59e0b" strokeWidth={2} name="Pending Balance" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
