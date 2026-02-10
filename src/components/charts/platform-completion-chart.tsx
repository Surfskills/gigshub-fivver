'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PlatformCompletionChartProps {
  data: {
    platform: string;
    completionRate: number;
    submitted: number;
    expected: number;
  }[];
}

export function PlatformCompletionChart({ data }: PlatformCompletionChartProps) {
  const getColor = (rate: number) => {
    if (rate >= 90) return '#10b981';
    if (rate >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold mb-4">Report Completion by Platform</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="platform" type="category" width={80} />
          <Tooltip
            formatter={(value: number, name: string, props: any) => {
              if (name === 'completionRate') {
                return [`${value}% (${props.payload.submitted}/${props.payload.expected})`, 'Completion'];
              }
              return [value, name];
            }}
          />
          <Bar dataKey="completionRate" name="Completion Rate">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.completionRate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
