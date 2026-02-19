import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getFinancesData, getWithdrawals, getExpenditures, getPayoutDetails, getRatingInformation } from '@/lib/queries/finances';
import { format } from 'date-fns';
import { FinancesPageTabs } from '@/components/finances-page-tabs';

export default async function FinancesPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'admin';
  let balancesData;
  let withdraws;
  let expendituresData: Awaited<ReturnType<typeof getExpenditures>> = [];
  let payoutDetailsData: Awaited<ReturnType<typeof getPayoutDetails>> = [];
  let ratingInformationData: Awaited<ReturnType<typeof getRatingInformation>> = [];
  let accountOptions: { id: string; label: string }[] = [];
  try {
    const [balances, w, expenditures, payoutDetails, ratingInformation, accounts] = await Promise.all([
      getFinancesData(),
      getWithdrawals(),
      getExpenditures(),
      getPayoutDetails(),
      getRatingInformation(),
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
    ratingInformationData = ratingInformation;
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                Financial Records
              </h1>
              <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
                Account balances, withdrawals, expenditures, and payout details ·{' '}
                <time dateTime={new Date().toISOString()}>
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </time>
              </p>
            </div>
          </div>
        </header>

        <FinancesPageTabs
        balancesData={balancesData}
        withdraws={withdraws}
        expenditures={expendituresData}
        payoutDetails={payoutDetailsData}
        ratingInformation={ratingInformationData}
        accountOptions={accountOptions}
        isAdmin={isAdmin}
      />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Financial Records | Mini Gigs Hub',
  description: 'View account balances, available and pending totals across all accounts.',
};
