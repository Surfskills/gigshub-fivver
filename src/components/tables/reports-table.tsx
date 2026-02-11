import { memo, useMemo } from 'react';
import { Shift } from '@prisma/client';

export type AccountCreated = { email: string; type: 'seller' | 'buyer' };
export type OrderInProgress = { account: string; deadline: string; handlerPhone: string };

interface ReportRow {
  id: string;
  reportDate: Date;
  shift: Shift;
  ordersCompleted: number;
  pendingOrders: number;
  availableBalance: number;
  pendingBalance: number;
  accountName: string;
  reportedByName: string;
  accountsCreated?: AccountCreated[] | null;
  rating?: number | null;
  ordersInProgress?: OrderInProgress[] | null;
}

interface ReportsTableProps {
  rows: ReportRow[];
}

// Memoized formatters
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Shift badge component
const ShiftBadge = memo(({ shift }: { shift: Shift }) => {
  const variants = {
    AM: 'bg-amber-100 text-amber-800',
    PM: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${variants[shift] || 'bg-gray-100 text-gray-800'}`}>
      {shift}
    </span>
  );
});

ShiftBadge.displayName = 'ShiftBadge';

// Rating display component
const RatingDisplay = memo(({ rating }: { rating: number | null | undefined }) => {
  if (rating == null) return <span className="text-gray-400">—</span>;
  
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  const color = rating >= 4 ? 'text-green-600' : rating >= 3 ? 'text-yellow-600' : 'text-red-600';
  
  return (
    <div className="flex items-center gap-1">
      <span className={`${color} text-sm`}>{stars}</span>
      <span className="text-xs text-gray-600">({rating})</span>
    </div>
  );
});

RatingDisplay.displayName = 'RatingDisplay';

// Expandable section for mobile
const ExpandableSection = memo(({ 
  title, 
  items 
}: { 
  title: string; 
  items: React.ReactNode 
}) => {
  return (
    <details className="group">
      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 list-none flex items-center gap-2">
        <svg 
          className="w-4 h-4 transition-transform group-open:rotate-90" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {title}
      </summary>
      <div className="mt-2 pl-6 text-sm text-gray-600">
        {items}
      </div>
    </details>
  );
});

ExpandableSection.displayName = 'ExpandableSection';

// Main report card component
const ReportCard = memo(({ row }: { row: ReportRow }) => {
  const formattedDate = useMemo(() => formatDate(row.reportDate), [row.reportDate]);
  const formattedAvailable = useMemo(() => formatCurrency(row.availableBalance), [row.availableBalance]);
  const formattedPending = useMemo(() => formatCurrency(row.pendingBalance), [row.pendingBalance]);

  const accountsCreatedContent = useMemo(() => {
    if (!row.accountsCreated || row.accountsCreated.length === 0) {
      return <span className="text-gray-400">None</span>;
    }
    return (
      <ul className="space-y-1">
        {row.accountsCreated.map((acc, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${
              acc.type === 'seller' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {acc.type}
            </span>
            <span className="text-xs">{acc.email}</span>
          </li>
        ))}
      </ul>
    );
  }, [row.accountsCreated]);

  const ordersInProgressContent = useMemo(() => {
    if (!row.ordersInProgress || row.ordersInProgress.length === 0) {
      return <span className="text-gray-400">None</span>;
    }
    return (
      <ul className="space-y-2">
        {row.ordersInProgress.map((order, idx) => (
          <li key={idx} className="text-xs border-l-2 border-orange-300 pl-2">
            <div className="font-medium text-gray-900">{order.account}</div>
            <div className="text-gray-600">Due: {order.deadline}</div>
            <div className="text-gray-600">Handler: {order.handlerPhone}</div>
          </li>
        ))}
      </ul>
    );
  }, [row.ordersInProgress]);

  return (
    <div className="bg-white border-b last:border-b-0 p-4 hover:bg-gray-50 transition-colors">
      {/* Mobile Card Layout */}
      <div className="flex flex-col gap-3 lg:hidden">
        {/* Header: Date + Shift */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">{formattedDate}</span>
          <ShiftBadge shift={row.shift} />
        </div>

        {/* Account Name */}
        <div className="font-medium text-base text-gray-900">{row.accountName}</div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="text-xs text-gray-500 mb-1">Completed</div>
            <div className="text-lg font-bold text-green-600">{row.ordersCompleted}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Available</div>
            <div className="text-lg font-bold text-blue-600">{formattedAvailable}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Pending Orders</div>
            <div className="text-base font-semibold text-orange-600">{row.pendingOrders}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Pending Bal.</div>
            <div className="text-base font-semibold text-gray-700">{formattedPending}</div>
          </div>
        </div>

        {/* Rating */}
        {row.rating != null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Rating:</span>
            <RatingDisplay rating={row.rating} />
          </div>
        )}

        {/* Expandable Details */}
        <div className="space-y-2 pt-2 border-t">
          {row.accountsCreated && row.accountsCreated.length > 0 && (
            <ExpandableSection 
              title={`Accounts Created (${row.accountsCreated.length})`}
              items={accountsCreatedContent}
            />
          )}
          
          {row.ordersInProgress && row.ordersInProgress.length > 0 && (
            <ExpandableSection 
              title={`Orders in Progress (${row.ordersInProgress.length})`}
              items={ordersInProgressContent}
            />
          )}

          <div className="text-xs text-gray-500 pt-2">
            Reported by: <span className="text-gray-900 font-medium">{row.reportedByName}</span>
          </div>
        </div>
      </div>

      {/* Desktop Table Row */}
      <div className="hidden lg:grid lg:grid-cols-11 lg:gap-3 lg:items-start lg:text-sm">
        <div className="text-gray-900">{formattedDate}</div>
        <div><ShiftBadge shift={row.shift} /></div>
        <div className="font-medium text-gray-900">{row.accountName}</div>
        <div className="text-right font-semibold text-green-600">{row.ordersCompleted}</div>
        <div className="text-right font-semibold text-orange-600">{row.pendingOrders}</div>
        <div className="text-right font-semibold text-blue-600">{formattedAvailable}</div>
        <div className="text-right text-gray-700">{formattedPending}</div>
        <div className="flex justify-end">
          <RatingDisplay rating={row.rating} />
        </div>
        <div className="text-xs text-gray-600">
          {!row.accountsCreated || row.accountsCreated.length === 0 ? (
            <span className="text-gray-400">—</span>
          ) : (
            <div className="space-y-1">
              {row.accountsCreated.map((acc, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${
                    acc.type === 'seller' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {acc.type}
                  </span>
                  <span>{acc.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-600">
          {!row.ordersInProgress || row.ordersInProgress.length === 0 ? (
            <span className="text-gray-400">—</span>
          ) : (
            <div className="space-y-2">
              {row.ordersInProgress.map((order, idx) => (
                <div key={idx} className="border-l-2 border-orange-300 pl-2">
                  <div className="font-medium">{order.account}</div>
                  <div className="text-gray-500">Due: {order.deadline}</div>
                  <div className="text-gray-500">{order.handlerPhone}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-gray-700">{row.reportedByName}</div>
      </div>
    </div>
  );
});

ReportCard.displayName = 'ReportCard';

export function ReportsTable({ rows }: ReportsTableProps) {
  return (
    <div className="w-full">
      {/* Mobile: Stacked Cards */}
      <div className="lg:hidden rounded-lg border border-gray-200 overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No reports found
          </div>
        ) : (
          rows.map((row) => <ReportCard key={row.id} row={row} />)
        )}
      </div>

      {/* Desktop: Table View */}
      <div className="hidden lg:block rounded-lg border border-gray-200 overflow-hidden bg-white">
        {/* Table Header */}
        <div className="grid grid-cols-11 gap-3 p-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
          <div>Date</div>
          <div>Shift</div>
          <div>Account</div>
          <div className="text-right">Completed</div>
          <div className="text-right">Pending</div>
          <div className="text-right">Available</div>
          <div className="text-right">Pending Bal.</div>
          <div className="text-right">Rating</div>
          <div>Accounts Created</div>
          <div>Orders in Progress</div>
          <div>Reported By</div>
        </div>

        {/* Table Body */}
        {rows.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No reports found
          </div>
        ) : (
          rows.map((row) => <ReportCard key={row.id} row={row} />)
        )}
      </div>
    </div>
  );
}