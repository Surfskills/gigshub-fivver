import { memo } from 'react';

interface OperatorPerformanceTableProps {
  data: {
    name: string;
    email: string;
    reportsSubmitted: number;
  }[];
}

// Memoized table row component
const OperatorRow = memo(({ 
  operator, 
  index 
}: { 
  operator: { name: string; email: string; reportsSubmitted: number }; 
  index: number;
}) => (
  <>
    {/* Mobile Card Layout */}
    <div className="sm:hidden border-b last:border-b-0 p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{operator.name}</p>
            <p className="text-xs text-gray-600 truncate">{operator.email}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-gray-500 mb-0.5">Reports</p>
          <p className="font-semibold text-base">{operator.reportsSubmitted}</p>
        </div>
      </div>
    </div>

    {/* Desktop Table Row */}
    <tr className="hidden sm:table-row border-b hover:bg-gray-50 transition-colors">
      <td className="p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
            {index + 1}
          </span>
          <span className="truncate">{operator.name}</span>
        </div>
      </td>
      <td className="p-3 sm:p-4 text-gray-600 max-w-[200px] md:max-w-none">
        <span className="truncate block">{operator.email}</span>
      </td>
      <td className="p-3 sm:p-4 text-right font-semibold tabular-nums">
        {operator.reportsSubmitted}
      </td>
    </tr>
  </>
));
OperatorRow.displayName = 'OperatorRow';

// Memoized empty state
const EmptyState = memo(() => (
  <div className="p-6 sm:p-8 text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
    <p className="text-sm sm:text-base text-gray-500">No operator data available</p>
    <p className="text-xs sm:text-sm text-gray-400 mt-1">Check back later for performance metrics</p>
  </div>
));
EmptyState.displayName = 'EmptyState';

export const OperatorPerformanceTable = memo(({ data }: OperatorPerformanceTableProps) => {
  // Early return for empty state
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-3 sm:p-4 md:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          Operator Performance <span className="text-sm sm:text-base text-gray-500 font-normal">(Last 30 Days)</span>
        </h3>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 md:p-6 border-b bg-gray-50/50">
        <h3 className="text-base sm:text-lg font-semibold">
          Operator Performance{' '}
          <span className="text-sm sm:text-base text-gray-500 font-normal">
            (Last 30 Days)
          </span>
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          {data.length} {data.length === 1 ? 'operator' : 'operators'}
        </p>
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden">
        {data.map((operator, idx) => (
          <OperatorRow key={operator.email} operator={operator} index={idx} />
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50/80">
              <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 text-xs sm:text-sm">
                Operator
              </th>
              <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 text-xs sm:text-sm">
                Email
              </th>
              <th className="text-right p-3 sm:p-4 font-semibold text-gray-700 text-xs sm:text-sm">
                Reports Submitted
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((operator, idx) => (
              <OperatorRow key={operator.email} operator={operator} index={idx} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

OperatorPerformanceTable.displayName = 'OperatorPerformanceTable';