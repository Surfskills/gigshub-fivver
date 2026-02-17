'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { FinancesData, WithdrawRecord, ExpenditureRecord, PayoutDetailRecord, RatingInformationRecord } from '@/lib/queries/finances';
import { WithdrawForm } from '@/app/(dashboard)/finances/withdraw-form';
import { ExpenditureForm } from '@/app/(dashboard)/finances/expenditure-form';
import { PayoutDetailForm } from '@/app/(dashboard)/finances/payout-detail-form';

const PAGE_SIZE = 10;

const PLATFORM_LABELS: Record<string, string> = {
  fiverr: 'Fiverr',
  upwork: 'Upwork',
  direct: 'Direct',
};

const PLATFORM_ORDER = ['fiverr', 'upwork', 'direct'] as const;

const PAYMENT_GATEWAY_LABELS: Record<string, string> = {
  bank: 'Bank',
  paypal: 'PayPal',
  payoneer: 'Payoneer',
};

const EXPENDITURE_TYPE_LABELS: Record<string, string> = {
  internet: 'Internet',
  rent: 'Rent',
  proxy: 'Proxy',
  electricity: 'Electricity',
  water: 'Water',
  meals: 'Meals',
  office_furniture: 'Office Furniture',
  electronics: 'Electronics',
};

const RATING_TYPE_LABELS: Record<string, string> = {
  client: 'Client',
  paypal: 'PayPal',
  cash: 'Cash',
};

function formatCurrency(n: number) {
  const rounded = Math.round(n * 100) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}

type TabType = 'balances' | 'withdraws' | 'expenditures' | 'payoutDetails' | 'ratingInformation';
type AccountOption = { id: string; label: string };

interface FinancesPageTabsProps {
  balancesData: FinancesData;
  withdraws: WithdrawRecord[];
  expenditures: ExpenditureRecord[];
  payoutDetails: PayoutDetailRecord[];
  ratingInformation: RatingInformationRecord[];
  accountOptions: AccountOption[];
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2.5 sm:px-6 sm:py-3">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          Page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </p>
        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  );
}

export function FinancesPageTabs({ balancesData, withdraws, expenditures, payoutDetails, ratingInformation, accountOptions }: FinancesPageTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('balances');
  const [balancesPage, setBalancesPage] = useState(1);
  const [withdrawsPage, setWithdrawsPage] = useState(1);
  const [expendituresPage, setExpendituresPage] = useState(1);
  const [payoutDetailsPage, setPayoutDetailsPage] = useState(1);
  const [ratingInfoPage, setRatingInfoPage] = useState(1);
  const [ratingInfoTypeFilter, setRatingInfoTypeFilter] = useState<string>('all');
  const [ratingInfoSearch, setRatingInfoSearch] = useState('');
  const [payoutSearch, setPayoutSearch] = useState('');
  const totalWithdrawn = Math.round(withdraws.reduce((s, w) => s + w.amount, 0) * 100) / 100;
  const totalExpenditure = Math.round(expenditures.reduce((s, e) => s + e.cost, 0) * 100) / 100;

  const flatAccounts = useMemo(
    () => PLATFORM_ORDER.flatMap((p) => balancesData.byPlatform[p] ?? []),
    [balancesData.byPlatform]
  );
  const balancesTotalPages = Math.max(1, Math.ceil(flatAccounts.length / PAGE_SIZE));
  const paginatedAccounts = useMemo(
    () =>
      flatAccounts.slice(
        (balancesPage - 1) * PAGE_SIZE,
        balancesPage * PAGE_SIZE
      ),
    [flatAccounts, balancesPage]
  );

  const withdrawsTotalPages = Math.max(1, Math.ceil(withdraws.length / PAGE_SIZE));
  const paginatedWithdraws = useMemo(
    () =>
      withdraws.slice(
        (withdrawsPage - 1) * PAGE_SIZE,
        withdrawsPage * PAGE_SIZE
      ),
    [withdraws, withdrawsPage]
  );

  const expendituresTotalPages = Math.max(1, Math.ceil(expenditures.length / PAGE_SIZE));
  const paginatedExpenditures = useMemo(
    () =>
      expenditures.slice(
        (expendituresPage - 1) * PAGE_SIZE,
        expendituresPage * PAGE_SIZE
      ),
    [expenditures, expendituresPage]
  );

  const filteredPayoutDetails = useMemo(() => {
    const q = payoutSearch.trim().toLowerCase();
    if (!q) return payoutDetails;
    return payoutDetails.filter(
      (p) =>
        p.email.toLowerCase().includes(q) || p.username.toLowerCase().includes(q)
    );
  }, [payoutDetails, payoutSearch]);

  const payoutDetailsTotalPages = Math.max(1, Math.ceil(filteredPayoutDetails.length / PAGE_SIZE));
  const paginatedPayoutDetails = useMemo(
    () =>
      filteredPayoutDetails.slice(
        (payoutDetailsPage - 1) * PAGE_SIZE,
        payoutDetailsPage * PAGE_SIZE
      ),
    [filteredPayoutDetails, payoutDetailsPage]
  );

  const filteredRatingInfo = useMemo(() => {
    const q = ratingInfoSearch.trim().toLowerCase();
    const typeFilter = ratingInfoTypeFilter === 'all' ? null : ratingInfoTypeFilter;
    return ratingInformation.filter((r) => {
      if (typeFilter && r.ratingType !== typeFilter) return false;
      if (q) {
        const matchEmail = r.accountEmail.toLowerCase().includes(q);
        const matchUsername = r.accountUsername.toLowerCase().includes(q);
        const matchLabel = r.accountLabel.toLowerCase().includes(q);
        if (!matchEmail && !matchUsername && !matchLabel) return false;
      }
      return true;
    });
  }, [ratingInformation, ratingInfoTypeFilter, ratingInfoSearch]);

  // Reset to page 1 when filter or search changes
  const handleRatingInfoFilterChange = (type: string) => {
    setRatingInfoTypeFilter(type);
    setRatingInfoPage(1);
  };
  const handleRatingInfoSearchChange = (value: string) => {
    setRatingInfoSearch(value);
    setRatingInfoPage(1);
  };

  const ratingInfoTotalPages = Math.max(1, Math.ceil(filteredRatingInfo.length / PAGE_SIZE));
  const paginatedRatingInfo = useMemo(
    () =>
      filteredRatingInfo.slice(
        (ratingInfoPage - 1) * PAGE_SIZE,
        ratingInfoPage * PAGE_SIZE
      ),
    [filteredRatingInfo, ratingInfoPage]
  );

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setBalancesPage(1);
    setWithdrawsPage(1);
    setExpendituresPage(1);
    setPayoutDetailsPage(1);
    setRatingInfoPage(1);
    setRatingInfoTypeFilter('all');
    setRatingInfoSearch('');
    setPayoutSearch('');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="border-b border-gray-200 -mx-4 overflow-x-auto sm:mx-0 sm:overflow-visible">
        <nav className="-mb-px flex min-w-max gap-2 px-4 sm:min-w-0 sm:flex-wrap sm:gap-6 sm:px-0" aria-label="Finances tabs">
          <button
            type="button"
            onClick={() => handleTabChange('balances')}
            className={`whitespace-nowrap border-b-2 py-2.5 text-xs font-medium sm:py-3 sm:text-sm ${
              activeTab === 'balances'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Balances
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('withdraws')}
            className={`whitespace-nowrap border-b-2 py-2.5 text-xs font-medium sm:py-3 sm:text-sm ${
              activeTab === 'withdraws'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Withdraws
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('expenditures')}
            className={`whitespace-nowrap border-b-2 py-2.5 text-xs font-medium sm:py-3 sm:text-sm ${
              activeTab === 'expenditures'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Expenditures
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('payoutDetails')}
            className={`whitespace-nowrap border-b-2 py-2.5 text-xs font-medium sm:py-3 sm:text-sm ${
              activeTab === 'payoutDetails'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Payout Details
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('ratingInformation')}
            className={`whitespace-nowrap border-b-2 py-2.5 text-xs font-medium sm:py-3 sm:text-sm ${
              activeTab === 'ratingInformation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Rating Information
          </button>
        </nav>
      </div>

      {activeTab === 'balances' && (
        <>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-6">
              <div className="text-xs font-medium text-emerald-800 sm:text-sm">Balance Available for Use</div>
              <div className="mt-1 text-xl font-bold text-emerald-900 sm:text-2xl">
                {formatCurrency(balancesData.totalAvailable)}
              </div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-6">
              <div className="text-xs font-medium text-amber-800 sm:text-sm">Payments being cleared</div>
              <div className="mt-1 text-xs text-amber-700">From completed orders awaiting platform clearance</div>
              <div className="mt-1 text-xl font-bold text-amber-900 sm:text-2xl">
                {formatCurrency(balancesData.totalPending)}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-6">
              <div className="text-xs font-medium text-gray-800 sm:text-sm">Payments for active orders</div>
              <div className="mt-1 text-xs text-gray-600">From orders currently in progress</div>
              <div className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                {formatCurrency(balancesData.totalOrdersInProgressValue)}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden sm:rounded-xl">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Balances by Account</h2>
              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                Available and pending balance per account (from most recent report)
              </p>
            </div>

            {/* Mobile: Stacked cards */}
            <div className="md:hidden">
              {paginatedAccounts.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">No accounts with balance data.</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {paginatedAccounts.map((acc) => (
                    <Link
                      key={acc.id}
                      href={`/accounts/${acc.id}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-blue-600 truncate">{acc.username}</p>
                          <p className="text-xs text-gray-500 truncate">{acc.email}</p>
                          <span className="mt-1 inline-block text-xs text-gray-600">
                            {PLATFORM_LABELS[acc.platform] ?? acc.platform}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-sm font-semibold text-emerald-700">
                            {formatCurrency(acc.availableBalance)}
                          </p>
                          <p className="text-xs text-amber-700">
                            {formatCurrency(acc.pendingBalance)} clearing
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatCurrency(acc.ordersInProgressValue)} active
                          </p>
                          {acc.lastReportDate && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {format(acc.lastReportDate, 'MMM d')}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-emerald-800">{formatCurrency(balancesData.totalAvailable)}</span>
                </div>
              </div>
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Account
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Platform
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                      Available
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                      Clearing
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                      Active orders
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Last Report
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        No accounts with balance data.
                      </td>
                    </tr>
                  ) : (
                    paginatedAccounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3">
                          <Link
                            href={`/accounts/${acc.id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {acc.username}
                          </Link>
                          <div className="text-xs text-gray-500">{acc.email}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {PLATFORM_LABELS[acc.platform] ?? acc.platform}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-emerald-700">
                          {formatCurrency(acc.availableBalance)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-amber-700">
                          {formatCurrency(acc.pendingBalance)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-700">
                          {formatCurrency(acc.ordersInProgressValue)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                          {acc.lastReportDate
                            ? format(acc.lastReportDate, 'MMM d, yyyy')
                            : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-100 font-semibold">
                  <tr>
                    <td colSpan={2} className="px-4 py-4 text-sm text-gray-900">
                      Total
                    </td>
                    <td className="px-4 py-4 text-right text-emerald-800">
                      {formatCurrency(balancesData.totalAvailable)}
                    </td>
                    <td className="px-4 py-4 text-right text-amber-800">
                      {formatCurrency(balancesData.totalPending)}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-800">
                      {formatCurrency(balancesData.totalOrdersInProgressValue)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
            <Pagination
              currentPage={balancesPage}
              totalPages={balancesTotalPages}
              onPageChange={setBalancesPage}
            />
          </div>
        </>
      )}

      {activeTab === 'withdraws' && (
        <>
          <WithdrawForm accounts={accountOptions} />
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden sm:rounded-xl">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Withdrawals</h2>
              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                Withdraw history by account, amount, date, and payment means
              </p>
              <div className="mt-3 text-sm font-medium text-gray-700">
                Total withdrawn: {formatCurrency(totalWithdrawn)}
              </div>
            </div>

            {/* Mobile: Stacked cards */}
            <div className="md:hidden">
              {paginatedWithdraws.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">No withdrawals recorded yet.</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {paginatedWithdraws.map((w) => (
                    <Link
                      key={w.id}
                      href={`/accounts/${w.accountId}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-blue-600 truncate">{w.username}</p>
                          <p className="text-xs text-gray-500 truncate">{w.email}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {format(w.withdrawDate, 'MMM d, yyyy')} · {w.paymentMeans}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(w.amount)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {withdraws.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span>{formatCurrency(totalWithdrawn)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Account
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                      Withdraw Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Withdraw Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Payment Means
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedWithdraws.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                        No withdrawals recorded yet.
                      </td>
                    </tr>
                  ) : (
                    paginatedWithdraws.map((w) => (
                      <tr key={w.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3">
                          <Link
                            href={`/accounts/${w.accountId}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {w.username}
                          </Link>
                          <div className="text-xs text-gray-500">
                            {PLATFORM_LABELS[w.platform] ?? w.platform} · {w.email}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(w.amount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {format(w.withdrawDate, 'MMM d, yyyy')}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {w.paymentMeans}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {withdraws.length > 0 && (
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td className="px-4 py-4 text-sm text-gray-900">Total</td>
                      <td className="px-4 py-4 text-right text-gray-900">
                        {formatCurrency(totalWithdrawn)}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <Pagination
              currentPage={withdrawsPage}
              totalPages={withdrawsTotalPages}
              onPageChange={setWithdrawsPage}
            />
          </div>
        </>
      )}

      {activeTab === 'expenditures' && (
        <>
          <ExpenditureForm />
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden sm:rounded-xl">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Expenditures</h2>
              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                Item name, type, cost, and transaction ID
              </p>
              <div className="mt-3 text-sm font-medium text-gray-700">
                Total expenditure: {formatCurrency(totalExpenditure)}
              </div>
            </div>

            {/* Mobile: Stacked cards */}
            <div className="md:hidden">
              {paginatedExpenditures.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">No expenditures recorded yet.</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {paginatedExpenditures.map((e) => (
                    <div key={e.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{e.itemName}</p>
                          <p className="text-xs text-gray-600">
                            {EXPENDITURE_TYPE_LABELS[e.typeOfExpenditure] ?? e.typeOfExpenditure}
                          </p>
                          {e.transactionId && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{e.transactionId}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(e.cost)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {expenditures.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span>{formatCurrency(totalExpenditure)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Item Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Type of Expenditure
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                      Cost
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Transaction ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedExpenditures.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                        No expenditures recorded yet.
                      </td>
                    </tr>
                  ) : (
                    paginatedExpenditures.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                          {e.itemName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {EXPENDITURE_TYPE_LABELS[e.typeOfExpenditure] ?? e.typeOfExpenditure}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(e.cost)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                          {e.transactionId ?? '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {expenditures.length > 0 && (
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td className="px-4 py-4 text-sm text-gray-900">Total</td>
                      <td />
                      <td className="px-4 py-4 text-right text-gray-900">
                        {formatCurrency(totalExpenditure)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <Pagination
              currentPage={expendituresPage}
              totalPages={expendituresTotalPages}
              onPageChange={setExpendituresPage}
            />
          </div>
        </>
      )}

      {activeTab === 'payoutDetails' && (
        <>
          <PayoutDetailForm accounts={accountOptions} />
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden sm:rounded-xl">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Payout Details</h2>
              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                Payment gateway and mobile number per account
              </p>
              <div className="mt-4">
                <label htmlFor="payout-search" className="sr-only">
                  Search by email or username
                </label>
                <input
                  id="payout-search"
                  type="search"
                  value={payoutSearch}
                  onChange={(e) => {
                    setPayoutSearch(e.target.value);
                    setPayoutDetailsPage(1);
                  }}
                  placeholder="Search by email or username..."
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:max-w-sm"
                />
              </div>
            </div>

            {/* Mobile: Stacked cards */}
            <div className="md:hidden">
              {paginatedPayoutDetails.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  {payoutSearch.trim() ? 'No accounts match your search.' : 'No payout details recorded yet.'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {paginatedPayoutDetails.map((p) => (
                    <Link
                      key={p.accountId}
                      href={`/accounts/${p.accountId}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-blue-600 truncate">{p.username}</p>
                          <p className="text-xs text-gray-500 truncate">{p.email}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {PLATFORM_LABELS[p.platform] ?? p.platform}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-gray-900">
                            {p.paymentGateway
                              ? PAYMENT_GATEWAY_LABELS[p.paymentGateway] ?? p.paymentGateway
                              : '—'}
                          </p>
                          {p.mobileNumber && (
                            <p className="text-xs text-gray-600 mt-0.5">{p.mobileNumber}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Account
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Payment Gateway
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Mobile Number
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedPayoutDetails.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">
                        {payoutSearch.trim()
                          ? 'No accounts match your search.'
                          : 'No payout details recorded yet.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedPayoutDetails.map((p) => (
                      <tr key={p.accountId} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3">
                          <Link
                            href={`/accounts/${p.accountId}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {p.username}
                          </Link>
                          <div className="text-xs text-gray-500">{p.email}</div>
                          <div className="text-xs text-gray-400">
                            {PLATFORM_LABELS[p.platform] ?? p.platform}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {p.paymentGateway
                            ? PAYMENT_GATEWAY_LABELS[p.paymentGateway] ?? p.paymentGateway
                            : '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {p.mobileNumber ?? '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={payoutDetailsPage}
              totalPages={payoutDetailsTotalPages}
              onPageChange={setPayoutDetailsPage}
            />
          </div>
        </>
      )}

      {activeTab === 'ratingInformation' && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden sm:rounded-xl">
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Rating Information</h2>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
              Rated gigs with last rating date. Next check date is 6 months from last rating for PayPal.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="w-full sm:w-auto sm:min-w-[140px]">
                <label htmlFor="rating-type-filter" className="sr-only">
                  Filter by rating type
                </label>
                <select
                  id="rating-type-filter"
                  value={ratingInfoTypeFilter}
                  onChange={(e) => handleRatingInfoFilterChange(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All types</option>
                  <option value="client">Client</option>
                  <option value="paypal">PayPal</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div className="w-full sm:flex-1 sm:max-w-xs">
                <label htmlFor="rating-search" className="sr-only">
                  Search by email or username
                </label>
                <input
                  id="rating-search"
                  type="search"
                  value={ratingInfoSearch}
                  onChange={(e) => handleRatingInfoSearchChange(e.target.value)}
                  placeholder="Search by email or username..."
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Mobile-first: Cards on small screens */}
          <div className="md:hidden divide-y divide-gray-200">
            {paginatedRatingInfo.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                {ratingInfoSearch.trim() || ratingInfoTypeFilter !== 'all'
                  ? 'No gigs match your filters.'
                  : 'No rated gigs. Add gigs with a last rating date.'}
              </div>
            ) : (
              paginatedRatingInfo.map((r) => (
                <Link
                  key={r.id}
                  href={`/accounts/${r.accountId}`}
                  className="block p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-blue-600 truncate flex-1">{r.accountLabel}</p>
                      {r.ratingType && (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {RATING_TYPE_LABELS[r.ratingType] ?? r.ratingType}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 truncate">{r.gigName}</p>
                    <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                      <span>Last rated: {format(r.lastRatedDate, 'MMM d, yyyy')}</span>
                      {r.ratingEmail && (
                        <span className="truncate">Email: {r.ratingEmail}</span>
                      )}
                      {r.nextCheckDate && (
                        <span className="font-medium text-emerald-700">
                          Next check: {format(r.nextCheckDate, 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Account
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Gig
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Last Rating Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    PayPal Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Next Check Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedRatingInfo.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      {ratingInfoSearch.trim() || ratingInfoTypeFilter !== 'all'
                        ? 'No gigs match your filters.'
                        : 'No rated gigs. Add gigs with a last rating date.'}
                    </td>
                  </tr>
                ) : (
                  paginatedRatingInfo.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3">
                        <Link
                          href={`/accounts/${r.accountId}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {r.accountLabel}
                        </Link>
                        <div className="text-xs text-gray-500">{r.accountEmail}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                        {r.gigName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {r.ratingType ? (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {RATING_TYPE_LABELS[r.ratingType] ?? r.ratingType}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {format(r.lastRatedDate, 'MMM d, yyyy')}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {r.ratingEmail ?? '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-emerald-700">
                        {r.nextCheckDate ? format(r.nextCheckDate, 'MMM d, yyyy') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={ratingInfoPage}
            totalPages={ratingInfoTotalPages}
            onPageChange={setRatingInfoPage}
          />
        </div>
      )}
    </div>
  );
}
