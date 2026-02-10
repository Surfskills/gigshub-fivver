import { db } from '@/lib/db';
import { ShiftReportForm } from '@/components/forms/shift-report-form';
import { startOfDay } from 'date-fns';

export default async function ReportsPage() {
  const today = startOfDay(new Date());

  const accounts = await db.account.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      platform: true,
      username: true,
      shiftReports: {
        where: {
          reportDate: today,
        },
        select: {
          shift: true,
        },
      },
    },
    orderBy: {
      platform: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Submit Shift Reports</h1>

      <div className="space-y-4">
        {accounts.map((account) => (
          <ShiftReportForm
            key={account.id}
            accountId={account.id}
            accountName={`${account.platform} - ${account.username}`}
            existingShifts={account.shiftReports.map((r) => r.shift)}
          />
        ))}
      </div>
    </div>
  );
}
