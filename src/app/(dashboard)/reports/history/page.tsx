import { db } from '@/lib/db';
import { ExportButton } from '@/components/export-button';
import { ReportsTable } from '@/components/tables/reports-table';

export default async function ReportsHistoryPage() {
  const recentReports = await db.shiftReport.findMany({
    take: 50,
    include: {
      account: {
        select: {
          platform: true,
          username: true,
        },
      },
      reportedBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ reportDate: 'desc' }, { shift: 'asc' }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Report History</h1>
          <p className="text-gray-600">View all submitted shift reports</p>
        </div>
        <ExportButton type="reports" />
      </div>

      <ReportsTable
        rows={recentReports.map((report) => ({
          id: report.id,
          reportDate: report.reportDate,
          shift: report.shift,
          ordersCompleted: report.ordersCompleted,
          pendingOrders: report.pendingOrders,
          availableBalance: Number(report.availableBalance),
          pendingBalance: Number(report.pendingBalance),
          accountName: `${report.account.platform} - ${report.account.username}`,
          reportedByName: report.reportedBy.name,
        }))}
      />
    </div>
  );
}
