import { db } from '@/lib/db';
import { PAGE_SIZE } from '@/lib/constants';
import type { AccountLevel, AccountStatus, Platform } from '@prisma/client';

/** Accounts whose most recent report has ranking page 1 or 2. Sorted by best rank first. Limited to PAGE_SIZE. */
export async function getTopPerformingAccounts() {
  const accounts = await db.account.findMany({
    where: { status: 'active' },
    include: {
      shiftReports: {
        orderBy: [{ reportDate: 'desc' }, { shift: 'desc' }],
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
    .sort((a, b) => (a.shiftReports[0]!.rankingPage ?? 99) - (b.shiftReports[0]!.rankingPage ?? 99))
    .slice(0, PAGE_SIZE);
}

export type AccountsFilter = {
  search?: string;
  level?: AccountLevel;
  status?: AccountStatus;
  platform?: Platform;
};

/** All accounts sorted by page rank (best first). Paginated with PAGE_SIZE. Supports search and filters. */
export async function getAccountsRankedByPage(page = 1, filter?: AccountsFilter) {
  const searchLower = filter?.search?.trim().toLowerCase();
  const where = {
    ...(filter?.level && { accountLevel: filter.level }),
    ...(filter?.status && { status: filter.status }),
    ...(filter?.platform && { platform: filter.platform }),
    ...(searchLower && {
      OR: [
        { username: { contains: searchLower, mode: 'insensitive' as const } },
        { email: { contains: searchLower, mode: 'insensitive' as const } },
      ],
    }),
  };

  const all = await db.account.findMany({
    where,
    include: {
      _count: { select: { gigs: true, shiftReports: true } },
      shiftReports: {
        orderBy: [{ reportDate: 'desc' }, { shift: 'desc' }],
        take: 1,
        select: { rankingPage: true },
      },
    },
  });
  const sorted = all.sort((a, b) => {
    const rankA = a.shiftReports[0]?.rankingPage ?? 999;
    const rankB = b.shiftReports[0]?.rankingPage ?? 999;
    return rankA - rankB;
  });
  const total = sorted.length;
  const start = (page - 1) * PAGE_SIZE;
  const accounts = sorted.slice(start, start + PAGE_SIZE);
  return { accounts, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getAccountById(accountId: string) {
  return db.account.findUnique({
    where: { id: accountId },
    include: {
      gigs: { orderBy: { createdAt: 'desc' } },
      _count: { select: { shiftReports: true } },
      shiftReports: {
        take: PAGE_SIZE,
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
