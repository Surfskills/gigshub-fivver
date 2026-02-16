import { db } from '@/lib/db';

function roundCurrency(n: number): number {
  return Math.round(n * 100) / 100;
}

export type AccountBalance = {
  id: string;
  platform: string;
  username: string;
  email: string;
  availableBalance: number;
  pendingBalance: number;
  lastReportDate: Date | null;
};

export type FinancesData = {
  accounts: AccountBalance[];
  byPlatform: Record<string, AccountBalance[]>;
  totalAvailable: number;
  totalPending: number;
};

/** Get all accounts with their latest available and pending balance from most recent shift report. */
export async function getFinancesData(): Promise<FinancesData> {
  const accounts = await db.account.findMany({
    where: { status: 'active' },
    include: {
      shiftReports: {
        orderBy: [{ reportDate: 'desc' }, { shift: 'desc' }],
        take: 1,
        select: {
          availableBalance: true,
          pendingBalance: true,
          reportDate: true,
        },
      },
    },
    orderBy: [{ platform: 'asc' }, { username: 'asc' }],
  });

  const result: AccountBalance[] = [];
  let totalAvailable = 0;
  let totalPending = 0;

  for (const a of accounts) {
    const latest = a.shiftReports[0];
    const available = latest ? Number(latest.availableBalance) : 0;
    const pending = latest ? Number(latest.pendingBalance) : 0;
    totalAvailable += available;
    totalPending += pending;
    result.push({
      id: a.id,
      platform: a.platform,
      username: a.username,
      email: a.email,
      availableBalance: available,
      pendingBalance: pending,
      lastReportDate: latest?.reportDate ?? null,
    });
  }

  const byPlatform: Record<string, AccountBalance[]> = {};
  for (const acc of result) {
    if (!byPlatform[acc.platform]) byPlatform[acc.platform] = [];
    byPlatform[acc.platform].push(acc);
  }

  return {
    accounts: result,
    byPlatform,
    totalAvailable: roundCurrency(totalAvailable),
    totalPending: roundCurrency(totalPending),
  };
}

export type WithdrawRecord = {
  id: string;
  accountId: string;
  platform: string;
  username: string;
  email: string;
  amount: number;
  withdrawDate: Date;
  paymentMeans: string;
  notes: string | null;
};

export type ExpenditureRecord = {
  id: string;
  itemName: string;
  typeOfExpenditure: string;
  cost: number;
  transactionId: string | null;
  createdAt: Date;
};

/** Get all expenditures ordered by date desc. */
export async function getExpenditures(): Promise<ExpenditureRecord[]> {
  const items = await db.expenditure.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return items.map((e) => ({
    id: e.id,
    itemName: e.itemName,
    typeOfExpenditure: e.typeOfExpenditure,
    cost: Number(e.cost),
    transactionId: e.transactionId,
    createdAt: e.createdAt,
  }));
}

/** Get all withdrawals with account info, ordered by date desc. */
export async function getWithdrawals(): Promise<WithdrawRecord[]> {
  const withdraws = await db.withdraw.findMany({
    include: {
      account: {
        select: { id: true, platform: true, username: true, email: true },
      },
    },
    orderBy: { withdrawDate: 'desc' },
  });

  return withdraws.map((w) => ({
    id: w.id,
    accountId: w.account.id,
    platform: w.account.platform,
    username: w.account.username,
    email: w.account.email,
    amount: Number(w.amount),
    withdrawDate: w.withdrawDate,
    paymentMeans: w.paymentMeans,
    notes: w.notes,
  }));
}

export type PayoutDetailRecord = {
  payoutDetailId: string | null;
  accountId: string;
  platform: string;
  username: string;
  email: string;
  paymentGateway: string | null;
  mobileNumber: string | null;
};

/** Get all accounts with their payout details. */
export async function getPayoutDetails(): Promise<PayoutDetailRecord[]> {
  const accounts = await db.account.findMany({
    where: { status: 'active' },
    include: {
      payoutDetail: {
        select: { id: true, paymentGateway: true, mobileNumber: true },
      },
    },
    orderBy: [{ platform: 'asc' }, { username: 'asc' }],
  });

  return accounts.map((a) => ({
    payoutDetailId: a.payoutDetail?.id ?? null,
    accountId: a.id,
    platform: a.platform,
    username: a.username,
    email: a.email,
    paymentGateway: a.payoutDetail?.paymentGateway ?? null,
    mobileNumber: a.payoutDetail?.mobileNumber ?? null,
  }));
}

/** Total available balance across all active accounts (from latest report each). For dashboard card. */
export async function getTotalAvailableBalance(): Promise<number> {
  const accounts = await db.account.findMany({
    where: { status: 'active' },
    include: {
      shiftReports: {
        orderBy: [{ reportDate: 'desc' }, { shift: 'desc' }],
        take: 1,
        select: { availableBalance: true },
      },
    },
  });

  const total = accounts.reduce((sum, a) => {
    const latest = a.shiftReports[0];
    return sum + (latest ? Number(latest.availableBalance) : 0);
  }, 0);
  return roundCurrency(total);
}
