import { getMissingReportsToday } from '@/lib/queries/reports';
import { db } from '@/lib/db';
import { AlertButton } from '@/components/alert-button';
import { AccountHealthCard } from '@/components/dashboard/account-health-card';
import { MissingReportsCard } from '@/components/dashboard/missing-reports-card';

export default async function DashboardPage() {
  const missingReports = await getMissingReportsToday();

  const accountStats = await db.account.groupBy({
    by: ['status'],
    _count: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Operations Dashboard</h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        {missingReports.length > 0 && <AlertButton />}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {accountStats.map((stat) => (
          <AccountHealthCard key={stat.status} label={stat.status} value={stat._count} />
        ))}
      </div>

      <MissingReportsCard items={missingReports} />
    </div>
  );
}
