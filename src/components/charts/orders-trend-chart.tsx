'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OrdersTrendChartProps {
  data: {
    date: string;
    totalPending: number;
    totalCompleted: number;
  }[];
}

export function OrdersTrendChart({ data }: OrdersTrendChartProps) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold mb-4">Orders Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
          <Tooltip />
          <Legend />
          <Bar dataKey="totalCompleted" fill="#3b82f6" name="Completed" />
          <Bar dataKey="totalPending" fill="#ef4444" name="Pending" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
