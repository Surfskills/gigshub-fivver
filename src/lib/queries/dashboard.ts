import { db } from '@/lib/db';
import { startOfMonth, endOfMonth, format, subDays } from 'date-fns';

const NEW_ACCOUNTS_DAYS = 7;

export async function getNewlyCreatedAccountsCount() {
  const since = subDays(new Date(), NEW_ACCOUNTS_DAYS);
  return db.account.count({
    where: { createdAt: { gte: since } },
  });
}

export type DashboardSummary = {
  generatedAt: string;
  period: string;
  accounts: {
    total: number;
    newLast7Days: number;
    byPlatform: Record<string, number>;
    byStatus: Record<string, number>;
    byLevel: Record<string, number>;
    active: number;
    paused: number;
    atRisk: number;
  };
  reports: {
    total: number;
    last30Days: number;
  };
  metrics: {
    totalAvailableBalance: number;
    totalPendingBalance: number;
    totalOrdersCompleted: number;
    totalPendingOrders: number;
    avgRating: number | null;
    accountsOnPage1: number;
    accountsOnPage2: number;
  };
  topAccounts: Array<{
    platform: string;
    username: string;
    email: string;
    status: string;
    level: string;
    rankingPage: number | null;
    availableBalance: number;
    pendingBalance: number;
    reportCount: number;
  }>;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const since30 = subDays(now, 30);

  const [accounts, reports, reportsLast30Days] = await Promise.all([
    db.account.findMany({
      include: {
        shiftReports: {
          orderBy: { reportDate: 'desc' },
          take: 1,
          select: {
            availableBalance: true,
            pendingBalance: true,
            ordersCompleted: true,
            pendingOrders: true,
            rankingPage: true,
            rating: true,
          },
        },
        _count: { select: { shiftReports: true } },
      },
    }),
    db.shiftReport.count(),
    db.shiftReport.count({ where: { reportDate: { gte: since30 } } }),
  ]);

  const byPlatform: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byLevel: Record<string, number> = {};
  let totalAvailable = 0;
  let totalPending = 0;
  let totalOrdersCompleted = 0;
  let totalPendingOrders = 0;
  let ratingSum = 0;
  let ratingCount = 0;
  let onPage1 = 0;
  let onPage2 = 0;

  const topAccounts: DashboardSummary['topAccounts'] = [];

  for (const a of accounts) {
    byPlatform[a.platform] = (byPlatform[a.platform] ?? 0) + 1;
    byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
    byLevel[a.accountLevel] = (byLevel[a.accountLevel] ?? 0) + 1;

    const latest = a.shiftReports[0];
    if (latest) {
      totalAvailable += Number(latest.availableBalance);
      totalPending += Number(latest.pendingBalance);
      totalOrdersCompleted += latest.ordersCompleted;
      totalPendingOrders += latest.pendingOrders;
      if (latest.rating != null) {
        ratingSum += Number(latest.rating);
        ratingCount++;
      }
      if (latest.rankingPage === 1) onPage1++;
      if (latest.rankingPage === 2) onPage2++;

      topAccounts.push({
        platform: a.platform,
        username: a.username,
        email: a.email,
        status: a.status,
        level: a.accountLevel,
        rankingPage: latest.rankingPage,
        availableBalance: Number(latest.availableBalance),
        pendingBalance: Number(latest.pendingBalance),
        reportCount: a._count.shiftReports,
      });
    } else {
      topAccounts.push({
        platform: a.platform,
        username: a.username,
        email: a.email,
        status: a.status,
        level: a.accountLevel,
        rankingPage: null,
        availableBalance: 0,
        pendingBalance: 0,
        reportCount: a._count.shiftReports,
      });
    }
  }

  const newCount = await getNewlyCreatedAccountsCount();

  return {
    generatedAt: now.toISOString(),
    period: `Last 30 days (since ${since30.toISOString().slice(0, 10)})`,
    accounts: {
      total: accounts.length,
      newLast7Days: newCount,
      byPlatform,
      byStatus,
      byLevel,
      active: byStatus.active ?? 0,
      paused: byStatus.paused ?? 0,
      atRisk: byStatus.risk ?? 0,
    },
    reports: {
      total: reports,
      last30Days: reportsLast30Days,
    },
    metrics: {
      totalAvailableBalance: totalAvailable,
      totalPendingBalance: totalPending,
      totalOrdersCompleted,
      totalPendingOrders,
      avgRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 100) / 100 : null,
      accountsOnPage1: onPage1,
      accountsOnPage2: onPage2,
    },
    topAccounts: topAccounts.sort((a, b) => (a.rankingPage ?? 99) - (b.rankingPage ?? 99)),
  };
}

export async function getDashboardStats() {
  const [totalGigs, totalReports, accountsByPlatform, earnings, accountsWithLatestReport] =
    await Promise.all([
      db.gig.count(),
      db.shiftReport.count(),
      db.account.groupBy({
        by: ['platform'],
        _count: { id: true },
      }),
      db.shiftReport.aggregate({
        _sum: {
          availableBalance: true,
          pendingBalance: true,
        },
      }),
      db.account.findMany({
        select: {
          shiftReports: {
            orderBy: { reportDate: 'desc' },
            take: 1,
            select: {
              ordersCompleted: true,
              pendingOrders: true,
            },
          },
        },
      }),
    ]);

  // Sum orders from latest report per account (avoids double-counting)
  let totalOrdersCompleted = 0;
  let totalOrdersInProgress = 0;
  for (const a of accountsWithLatestReport) {
    const latest = a.shiftReports[0];
    if (latest) {
      totalOrdersCompleted += latest.ordersCompleted;
      totalOrdersInProgress += latest.pendingOrders;
    }
  }

  return {
    totalGigs,
    totalReports,
    accountsByPlatform: accountsByPlatform.map((p) => ({
      platform: p.platform,
      count: p._count.id,
    })),
    totalAvailableEarnings: Number(earnings._sum.availableBalance || 0),
    totalPendingEarnings: Number(earnings._sum.pendingBalance || 0),
    totalOrdersCompleted,
    totalOrdersInProgress,
  };
}

export async function getMonthlyTrends(months: number = 12) {
  const now = new Date();
  const monthsData: Array<{
    month: string;
    moneyEarned: number;
    totalAccounts: number;
  }> = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = startOfMonth(
      new Date(now.getFullYear(), now.getMonth() - i, 1)
    );
    const monthEnd = endOfMonth(monthStart);

    const [reports, accounts] = await Promise.all([
      db.shiftReport.findMany({
        where: {
          reportDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: {
          availableBalance: true,
        },
      }),
      db.account.findMany({
        where: {
          createdAt: {
            lte: monthEnd,
          },
        },
        select: {
          id: true,
        },
      }),
    ]);

    const moneyEarned = reports.reduce(
      (sum, r) => sum + Number(r.availableBalance),
      0
    );

    monthsData.push({
      month: format(monthStart, 'MMM yyyy'),
      moneyEarned,
      totalAccounts: accounts.length,
    });
  }

  return monthsData;
}

export async function getITSupportAnalystLeaderboard() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const reports = await db.shiftReport.groupBy({
    by: ['reportedByUserId'],
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    _count: {
      id: true,
    },
  });

  const userIds = reports.map((r) => r.reportedByUserId);
  const users = await db.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const leaderboard = reports
    .map((r) => {
      const user = users.find((u) => u.id === r.reportedByUserId);
      return {
        userId: r.reportedByUserId,
        name: user?.name || 'Unknown',
        email: user?.email || '',
        reportsSubmitted: r._count.id,
      };
    })
    .sort((a, b) => b.reportsSubmitted - a.reportsSubmitted);

  return leaderboard;
}
