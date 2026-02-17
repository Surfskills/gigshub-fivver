'use client';

import { useCallback } from 'react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import type { DashboardSummary } from '@/lib/queries/dashboard';

interface SummaryReportViewProps {
  summary: DashboardSummary & {
    topAccounts: Array<DashboardSummary['topAccounts'][0] & { level: string }>;
  };
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export function SummaryReportView({ summary }: SummaryReportViewProps) {
  const exportCSV = useCallback(() => {
    const rows: Record<string, string | number>[] = [
      { Metric: 'Total Accounts', Value: summary.accounts.total },
      { Metric: 'New Accounts (7 days)', Value: summary.accounts.newLast7Days },
      { Metric: 'Active Accounts', Value: summary.accounts.active },
      { Metric: 'Paused Accounts', Value: summary.accounts.paused },
      { Metric: 'At Risk', Value: summary.accounts.atRisk },
      { Metric: 'Total Reports', Value: summary.reports.total },
      { Metric: 'Reports (30 days)', Value: summary.reports.last30Days },
      { Metric: 'Total Available Balance', Value: formatCurrency(summary.metrics.totalAvailableBalance) },
      { Metric: 'Payments being cleared', Value: formatCurrency(summary.metrics.totalPendingBalance) },
      { Metric: 'Payments for active orders', Value: formatCurrency(summary.metrics.totalPaymentsForActiveOrders) },
      { Metric: 'Total Orders Completed', Value: summary.metrics.totalOrdersCompleted },
      { Metric: 'Total Pending Orders', Value: summary.metrics.totalPendingOrders },
      { Metric: 'Avg Rating', Value: summary.metrics.avgRating ?? 'N/A' },
      { Metric: 'Accounts on Page 1', Value: summary.metrics.accountsOnPage1 },
      { Metric: 'Accounts on Page 2', Value: summary.metrics.accountsOnPage2 },
    ];

    Object.entries(summary.accounts.byPlatform).forEach(([platform, count]) => {
      rows.push({ Metric: `By Platform: ${platform}`, Value: count });
    });
    Object.entries(summary.accounts.byLevel).forEach(([level, count]) => {
      rows.push({ Metric: `By Level: ${level}`, Value: count });
    });

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [summary]);

  const exportPDF = useCallback(() => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text('Business Summary Report', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date(summary.generatedAt).toLocaleString()}`, 20, y);
    y += 12;

    doc.setFontSize(14);
    doc.text('Key Metrics', 20, y);
    y += 8;

    doc.setFontSize(10);
    const metrics = [
      ['Total Accounts', String(summary.accounts.total)],
      ['New Accounts (7 days)', String(summary.accounts.newLast7Days)],
      ['Active', String(summary.accounts.active)],
      ['Paused', String(summary.accounts.paused)],
      ['At Risk', String(summary.accounts.atRisk)],
      ['Total Reports', String(summary.reports.total)],
      ['Reports (30 days)', String(summary.reports.last30Days)],
      ['Total Available Balance', formatCurrency(summary.metrics.totalAvailableBalance)],
      ['Payments being cleared', formatCurrency(summary.metrics.totalPendingBalance)],
      ['Payments for active orders', formatCurrency(summary.metrics.totalPaymentsForActiveOrders)],
      ['Total Orders Completed', String(summary.metrics.totalOrdersCompleted)],
      ['Total Pending Orders', String(summary.metrics.totalPendingOrders)],
      ['Avg Rating', summary.metrics.avgRating != null ? String(summary.metrics.avgRating) : 'N/A'],
      ['Accounts on Page 1', String(summary.metrics.accountsOnPage1)],
      ['Accounts on Page 2', String(summary.metrics.accountsOnPage2)],
    ];

    metrics.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 20, y);
      y += 6;
    });

    y += 8;
    doc.setFontSize(12);
    doc.text('By Platform', 20, y);
    y += 6;
    doc.setFontSize(10);
    Object.entries(summary.accounts.byPlatform).forEach(([platform, count]) => {
      doc.text(`  ${platform}: ${count}`, 20, y);
      y += 5;
    });

    y += 5;
    doc.setFontSize(12);
    doc.text('By Level', 20, y);
    y += 6;
    doc.setFontSize(10);
    Object.entries(summary.accounts.byLevel).forEach(([level, count]) => {
      doc.text(`  ${level}: ${count}`, 20, y);
      y += 5;
    });

    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    y += 8;
    doc.setFontSize(12);
    doc.text('Top Accounts (sample)', 20, y);
    y += 8;

    summary.topAccounts.slice(0, 15).forEach((a) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(9);
      doc.text(`${a.platform} – ${a.username} | Page ${a.rankingPage ?? 'N/A'} | Bal: ${formatCurrency(a.availableBalance)}`, 20, y);
      y += 5;
    });

    doc.save(`summary-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [summary]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={exportCSV}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={exportPDF}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500"
        >
          Export PDF
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Total Accounts" value={summary.accounts.total} />
            <MetricCard label="New (7 days)" value={summary.accounts.newLast7Days} />
            <MetricCard label="Active" value={summary.accounts.active} />
            <MetricCard label="Total Reports" value={summary.reports.total} />
            <MetricCard label="Available Balance" value={formatCurrency(summary.metrics.totalAvailableBalance)} />
            <MetricCard label="Payments being cleared" value={formatCurrency(summary.metrics.totalPendingBalance)} />
            <MetricCard label="Payments for active orders" value={formatCurrency(summary.metrics.totalPaymentsForActiveOrders)} />
            <MetricCard label="Orders Completed" value={summary.metrics.totalOrdersCompleted} />
            <MetricCard label="Pending Orders" value={summary.metrics.totalPendingOrders} />
            <MetricCard label="Avg Rating" value={summary.metrics.avgRating != null ? summary.metrics.avgRating.toFixed(2) : 'N/A'} />
            <MetricCard label="On Page 1" value={summary.metrics.accountsOnPage1} />
            <MetricCard label="On Page 2" value={summary.metrics.accountsOnPage2} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
            <h3 className="font-semibold text-gray-900">By Platform</h3>
          </div>
          <div className="p-4 sm:p-6">
            <ul className="space-y-2">
              {Object.entries(summary.accounts.byPlatform).map(([platform, count]) => (
                <li key={platform} className="flex justify-between text-sm">
                  <span className="capitalize text-gray-700">{platform}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
            <h3 className="font-semibold text-gray-900">By Account Level</h3>
          </div>
          <div className="p-4 sm:p-6">
            <ul className="space-y-2">
              {Object.entries(summary.accounts.byLevel).map(([level, count]) => (
                <li key={level} className="flex justify-between text-sm">
                  <span className="capitalize text-gray-700">{level.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
          <h3 className="font-semibold text-gray-900">All Accounts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Platform</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Username</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Level</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">Page</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">Available</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">Reports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {summary.topAccounts.map((a) => (
                <tr key={`${a.platform}-${a.username}`}>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{a.platform}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{a.username}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">{a.status}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">{a.level}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-600">
                    {a.rankingPage ?? '–'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-600">
                    {formatCurrency(a.availableBalance)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-600">
                    {a.reportCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}
