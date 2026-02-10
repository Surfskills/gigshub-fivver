interface OperatorPerformanceTableProps {
  data: {
    name: string;
    email: string;
    reportsSubmitted: number;
  }[];
}

export function OperatorPerformanceTable({ data }: OperatorPerformanceTableProps) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-semibold mb-4">Operator Performance (Last 30 Days)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">Operator</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-right p-3 font-medium">Reports Submitted</th>
            </tr>
          </thead>
          <tbody>
            {data.map((operator, idx) => (
              <tr key={operator.email} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                      {idx + 1}
                    </span>
                    {operator.name}
                  </div>
                </td>
                <td className="p-3 text-gray-600">{operator.email}</td>
                <td className="p-3 text-right font-semibold">{operator.reportsSubmitted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
