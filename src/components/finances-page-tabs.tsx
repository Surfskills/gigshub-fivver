'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { FinancesData, WithdrawRecord, ExpenditureRecord, PayoutDetailRecord } from '@/lib/queries/finances';
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

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

type TabType = 'balances' | 'withdraws' | 'expenditures' | 'payoutDetails';
type AccountOption = { id: string; label: string };

interface FinancesPageTabsProps {
  balancesData: FinancesData;
  withdraws: WithdrawRecord[];
  expenditures: ExpenditureRecord[];
  payoutDetails: PayoutDetailRecord[];
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
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
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

export function FinancesPageTabs({ balancesData, withdraws, expenditures, payoutDetails, accountOptions }: FinancesPageTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('balances');
  const [balancesPage, setBalancesPage] = useState(1);
  const [withdrawsPage, setWithdrawsPage] = useState(1);
  const [expendituresPage, setExpendituresPage] = useState(1);
  const [payoutDetailsPage, setPayoutDetailsPage] = useState(1);
  const [payoutSearch, setPayoutSearch] = useState('');
  const totalWithdrawn = withdraws.reduce((s, w) => s + w.amount, 0);
  const totalExpenditure = expenditures.reduce((s, e) => s + e.cost, 0);

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

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setBalancesPage(1);
    setWithdrawsPage(1);
    setExpendituresPage(1);
    setPayoutDetailsPage(1);
    setPayoutSearch('');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="Finances tabs">
          <button
            type="button"
            onClick={() => handleTabChange('balances')}
            className={`border-b-2 py-3 text-sm font-medium ${
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
            className={`border-b-2 py-3 text-sm font-medium ${
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
            className={`border-b-2 py-3 text-sm font-medium ${
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
            className={`border-b-2 py-3 text-sm font-medium ${
              activeTab === 'payoutDetails'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Payout Details
          </button>
        </nav>
      </div>

      {activeTab === 'balances' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-6">
              <div className="text-sm font-medium text-emerald-800">Total Available Balance</div>
              <div className="mt-1 text-2xl font-bold text-emerald-900">
                {formatCurrency(balancesData.totalAvailable)}
              </div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-6">
              <div className="text-sm font-medium text-amber-800">Total Pending Balance</div>
              <div className="mt-1 text-2xl font-bold text-amber-900">
                {formatCurrency(balancesData.totalPending)}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-gray-900">Balances by Account</h2>
              <p className="mt-1 text-sm text-gray-600">
                Available and pending balance per account (from most recent report)
              </p>
            </div>
            <div className="overflow-x-auto">
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
                      Pending
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Last Report
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
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
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-gray-900">Withdrawals</h2>
              <p className="mt-1 text-sm text-gray-600">
                Withdraw history by account, amount, date, and payment means
              </p>
              <div className="mt-3 text-sm font-medium text-gray-700">
                Total withdrawn: {formatCurrency(totalWithdrawn)}
              </div>
            </div>
            <div className="overflow-x-auto">
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
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-gray-900">Expenditures</h2>
              <p className="mt-1 text-sm text-gray-600">
                Item name, type, cost, and transaction ID
              </p>
              <div className="mt-3 text-sm font-medium text-gray-700">
                Total expenditure: {formatCurrency(totalExpenditure)}
              </div>
            </div>
            <div className="overflow-x-auto">
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
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-gray-900">Payout Details</h2>
              <p className="mt-1 text-sm text-gray-600">
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
                  className="block w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
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
    </div>
  );
}
