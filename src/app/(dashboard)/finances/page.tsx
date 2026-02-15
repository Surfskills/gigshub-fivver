import { db } from '@/lib/db';
import { getFinancesData, getWithdrawals, getExpenditures, getPayoutDetails } from '@/lib/queries/finances';
import { format } from 'date-fns';
import { FinancesPageTabs } from '@/components/finances-page-tabs';

export default async function FinancesPage() {
  let balancesData;
  let withdraws;
  let expendituresData: Awaited<ReturnType<typeof getExpenditures>> = [];
  let payoutDetailsData: Awaited<ReturnType<typeof getPayoutDetails>> = [];
  let accountOptions: { id: string; label: string }[] = [];
  try {
    const [balances, w, expenditures, payoutDetails, accounts] = await Promise.all([
      getFinancesData(),
      getWithdrawals(),
      getExpenditures(),
      getPayoutDetails(),
      db.account.findMany({
        where: { status: 'active' },
        select: { id: true, platform: true, username: true },
        orderBy: [{ platform: 'asc' }, { username: 'asc' }],
      }),
    ]);
    balancesData = balances;
    withdraws = w;
    expendituresData = expenditures;
    payoutDetailsData = payoutDetails;
    accountOptions = accounts.map((a) => ({
      id: a.id,
      label: `${a.platform} – ${a.username}`,
    }));
  } catch (err) {
    console.error('Finances error:', err);
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <h2 className="font-semibold">Could not load financial data</h2>
        <p className="mt-2 text-sm">Check your database connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Financial Records</h1>
        <p className="mt-1 text-gray-600">
          Account balances and withdrawal history ·{' '}
          <time dateTime={new Date().toISOString()}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </time>
        </p>
      </header>

      <FinancesPageTabs
        balancesData={balancesData}
        withdraws={withdraws}
        expenditures={expendituresData}
        payoutDetails={payoutDetailsData}
        accountOptions={accountOptions}
      />
    </div>
  );
}

export const metadata = {
  title: 'Financial Records | Freelance Manager',
  description: 'View account balances, available and pending totals across all accounts.',
};
