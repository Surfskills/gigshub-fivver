import { db } from '@/lib/db';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export async function getDashboardStats() {
  const [totalGigs, totalReports, accountsByPlatform, earnings] = await Promise.all([
    db.gig.count(),
    db.shiftReport.count(),
    db.account.groupBy({
      by: ['platform'],
      _count: true,
    }),
    db.shiftReport.aggregate({
      _sum: {
        availableBalance: true,
        pendingBalance: true,
      },
    }),
  ]);

  return {
    totalGigs,
    totalReports,
    accountsByPlatform: accountsByPlatform.map((p) => ({
      platform: p.platform,
      count: p._count,
    })),
    totalAvailableEarnings: Number(earnings._sum.availableBalance || 0),
    totalPendingEarnings: Number(earnings._sum.pendingBalance || 0),
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
