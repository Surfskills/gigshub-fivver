import { db } from '@/lib/db';
import { ExportButton } from '@/components/export-button';
import Link from 'next/link';
import { AccountsTable } from '@/components/tables/accounts-table';

export default async function AccountsPage() {
  const accounts = await db.account.findMany({
    include: {
      _count: {
        select: {
          gigs: true,
          shiftReports: true,
        },
      },
    },
    orderBy: {
      platform: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-gray-600">Manage freelancing accounts</p>
        </div>
        <div className="flex gap-3">
          <ExportButton type="accounts" />
          <Link
            href="/accounts/new"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Account
          </Link>
        </div>
      </div>

      <AccountsTable
        rows={accounts.map((account) => ({
          id: account.id,
          platform: account.platform,
          username: account.username,
          email: account.email,
          typeOfGigs: account.typeOfGigs,
          status: account.status,
          gigsCount: account._count.gigs,
          reportsCount: account._count.shiftReports,
        }))}
      />
    </div>
  );
}
