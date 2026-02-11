import { db } from '@/lib/db';

/** Accounts whose most recent report has ranking page 1 or 2. Sorted by best rank first. */
export async function getTopPerformingAccounts() {
  const accounts = await db.account.findMany({
    where: { status: 'active' },
    include: {
      shiftReports: {
        orderBy: { reportDate: 'desc' },
        take: 1,
        select: { rankingPage: true, reportDate: true },
      },
      _count: { select: { gigs: true, shiftReports: true } },
    },
  });
  return accounts
    .filter((a) => {
      const r = a.shiftReports[0];
      return r && r.rankingPage != null && r.rankingPage <= 2;
    })
    .sort((a, b) => (a.shiftReports[0]!.rankingPage ?? 99) - (b.shiftReports[0]!.rankingPage ?? 99));
}

/** All accounts sorted by page rank (best first: page 1, then 2, then 3…, null last). */
export async function getAccountsRankedByPage() {
  const accounts = await db.account.findMany({
    include: {
      _count: { select: { gigs: true, shiftReports: true } },
      shiftReports: {
        orderBy: { reportDate: 'desc' },
        take: 1,
        select: { rankingPage: true },
      },
    },
  });
  return accounts.sort((a, b) => {
    const rankA = a.shiftReports[0]?.rankingPage ?? 999;
    const rankB = b.shiftReports[0]?.rankingPage ?? 999;
    return rankA - rankB;
  });
}

export async function getAccountById(accountId: string) {
  return db.account.findUnique({
    where: { id: accountId },
    include: {
      gigs: { orderBy: { createdAt: 'desc' } },
      _count: { select: { shiftReports: true } },
      shiftReports: {
        take: 25,
        orderBy: [{ reportDate: 'desc' }, { shift: 'asc' }],
        include: { reportedBy: { select: { name: true } } },
      },
    },
  });
}

export async function getAllAccounts() {
  return db.account.findMany({
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
}
