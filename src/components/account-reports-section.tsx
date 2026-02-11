'use client';

import Link from 'next/link';
import { memo, useMemo, useState } from 'react';
import type { AccountCreated, OrderInProgress } from '@/lib/actions/reports';
import type { Shift, Prisma } from '@prisma/client';

// Updated type to match Prisma's return type
type Report = {
  id: string;
  reportDate: Date;
  shift: Shift;
  ordersCompleted: number;
  pendingOrders: number;
  availableBalance: Prisma.Decimal;
  pendingBalance: Prisma.Decimal;
  rankingPage: number | null;
  notes: string | null;
  accountsCreated: Prisma.JsonValue;
  rating: Prisma.Decimal | null;
  ordersInProgress: Prisma.JsonValue;
  reportedBy: { name: string };
};

interface AccountReportsSectionProps {
  accountId: string;
  reports: Report[];
}

// Helper to parse JSON arrays
function parseJsonArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// Helper to convert Decimal to number
function toNumber(val: Prisma.Decimal | Prisma.JsonValue | null): number {
  if (val === null) return 0;
  if (val && typeof val === 'object' && 'toNumber' in val) {
    return (val as Prisma.Decimal).toNumber();
  }
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// Memoized formatters
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatCurrency = (amount: Prisma.Decimal | Prisma.JsonValue | unknown) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(toNumber(amount as Prisma.Decimal | Prisma.JsonValue | null));
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

// Rating display
const RatingDisplay = memo(({ rating }: { rating: Prisma.Decimal | null }) => {
  if (rating == null) return <span className="text-gray-400 text-sm">No rating</span>;
  
  const numRating = toNumber(rating);
  const stars = '★'.repeat(Math.floor(numRating)) + '☆'.repeat(5 - Math.floor(numRating));
  const color = numRating >= 4 ? 'text-green-600' : numRating >= 3 ? 'text-yellow-600' : 'text-red-600';
  
  return (
    <div className="flex items-center gap-1">
      <span className={`${color} text-sm`}>{stars}</span>
      <span className="text-xs text-gray-600">({numRating.toFixed(2)})</span>
    </div>
  );
});

RatingDisplay.displayName = 'RatingDisplay';

// Report card component for mobile
const ReportCard = memo(({ 
  report, 
  accountId 
}: { 
  report: Report; 
  accountId: string;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const formattedDate = useMemo(() => formatDate(report.reportDate), [report.reportDate]);
  const formattedAvailable = useMemo(() => formatCurrency(report.availableBalance), [report.availableBalance]);
  const formattedPending = useMemo(() => formatCurrency(report.pendingBalance), [report.pendingBalance]);
  
  // Parse JSON fields
  const accountsCreated = useMemo(() => parseJsonArray<AccountCreated>(report.accountsCreated), [report.accountsCreated]);
  const ordersInProgress = useMemo(() => parseJsonArray<OrderInProgress>(report.ordersInProgress), [report.ordersInProgress]);

  return (
    <div className="bg-white border-b last:border-b-0 hover:bg-gray-50 transition-colors">
      {/* Mobile Card */}
      <div className="p-4 lg:hidden">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900 mb-1">{formattedDate}</div>
            <ShiftBadge shift={report.shift} />
          </div>
          <Link
            href={`/accounts/${accountId}/reports/${report.id}/edit`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 ml-2"
          >
            Edit
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 rounded-lg p-2.5">
            <div className="text-xs text-gray-500 mb-1">Orders</div>
            <div className="text-base font-semibold text-gray-900">
              <span className="text-green-600">{report.ordersCompleted}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-orange-600">{report.pendingOrders}</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5">
            <div className="text-xs text-gray-500 mb-1">Available</div>
            <div className="text-base font-semibold text-blue-600">{formattedAvailable}</div>
          </div>
        </div>

        {/* Secondary Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Pending Balance:</span>
            <span className="font-medium text-gray-900">{formattedPending}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Rating:</span>
            <RatingDisplay rating={report.rating} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Reported by:</span>
            <span className="font-medium text-gray-900">{report.reportedBy.name}</span>
          </div>
        </div>

        {/* Expandable Details */}
        {(accountsCreated.length || ordersInProgress.length || report.notes || report.rankingPage) && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-3 w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 py-2 border-t"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showDetails ? 'Hide' : 'Show'} details
          </button>
        )}

        {showDetails && (
          <div className="mt-3 pt-3 border-t space-y-3 text-sm">
            {report.rankingPage != null && (
              <div>
                <span className="text-gray-500">Ranking Page:</span>{' '}
                <span className="font-medium text-gray-900">{report.rankingPage}</span>
              </div>
            )}
            
            {accountsCreated.length > 0 && (
              <div>
                <div className="text-gray-700 font-medium mb-1">Accounts Created:</div>
                <div className="space-y-1 pl-2">
                  {accountsCreated.map((acc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${
                        acc.type === 'seller' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {acc.type}
                      </span>
                      <span className="text-xs text-gray-600">{acc.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ordersInProgress.length > 0 && (
              <div>
                <div className="text-gray-700 font-medium mb-1">Orders in Progress:</div>
                <div className="space-y-2 pl-2">
                  {ordersInProgress.map((order, idx) => (
                    <div key={idx} className="text-xs border-l-2 border-orange-300 pl-2">
                      <div className="font-medium text-gray-900">{order.account}</div>
                      <div className="text-gray-600">Deadline: {order.deadline}</div>
                      <div className="text-gray-600">Handler: {order.handlerPhone}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.notes && (
              <div>
                <div className="text-gray-700 font-medium mb-1">Notes:</div>
                <div className="text-gray-600 bg-gray-50 rounded p-2 text-xs">{report.notes}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Table Row */}
      <div className="hidden lg:grid lg:grid-cols-8 lg:gap-3 lg:items-center lg:p-3 lg:text-sm">
        <div className="text-gray-900">{formattedDate}</div>
        <div><ShiftBadge shift={report.shift} /></div>
        <div className="text-right">
          <span className="text-green-600 font-semibold">{report.ordersCompleted}</span>
          <span className="text-gray-400">/</span>
          <span className="text-orange-600 font-semibold">{report.pendingOrders}</span>
        </div>
        <div className="text-right font-semibold text-blue-600">{formattedAvailable}</div>
        <div className="text-right text-gray-700">{formattedPending}</div>
        <div className="flex justify-end">
          <RatingDisplay rating={report.rating} />
        </div>
        <div className="text-gray-700">{report.reportedBy.name}</div>
        <div className="flex justify-end">
          <Link
            href={`/accounts/${accountId}/reports/${report.id}/edit`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
});

ReportCard.displayName = 'ReportCard';

export function AccountReportsSection({ accountId, reports }: AccountReportsSectionProps) {
  if (reports.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
        <div className="mt-4 text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No reports yet.</p>
          <p className="text-xs text-gray-400 mt-1">Reports will appear here once submitted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
          <Link
            href={`/reports/history?accountId=${accountId}`}
            prefetch={false}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            View all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Mobile: Cards */}
      <div className="lg:hidden">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} accountId={accountId} />
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden lg:block">
        {/* Table Header */}
        <div className="grid grid-cols-8 gap-3 p-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
          <div>Date</div>
          <div>Shift</div>
          <div className="text-right">Orders</div>
          <div className="text-right">Available</div>
          <div className="text-right">Pending</div>
          <div className="text-right">Rating</div>
          <div>Reported By</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} accountId={accountId} />
        ))}
      </div>
    </div>
  );
}