import { db } from '@/lib/db';
import { subDays, startOfDay, format } from 'date-fns';

/** Returns trend data for Money, Rating, Ranking charts. Optional accountId filter. */
export async function getMetricTrends(days: number, accountId?: string) {
  const startDate = startOfDay(subDays(new Date(), days));

  const reports = await db.shiftReport.findMany({
    where: {
      ...(accountId ? { accountId } : {}),
      reportDate: { gte: startDate },
    },
    include: {
      account: {
        select: { username: true, platform: true },
      },
    },
    orderBy: [{ reportDate: 'asc' }, { shift: 'asc' }],
  });

  const dateMap = new Map<
    string,
    {
      date: string;
      availableBalance: number;
      pendingBalance: number;
      totalMoney: number;
      ratingSum: number;
      ratingCount: number;
      rankingSum: number;
      rankingCount: number;
      reportCount: number;
    }
  >();

  reports.forEach((report) => {
    const dateKey = format(report.reportDate, 'yyyy-MM-dd');
    const existing = dateMap.get(dateKey) || {
      date: dateKey,
      availableBalance: 0,
      pendingBalance: 0,
      totalMoney: 0,
      ratingSum: 0,
      ratingCount: 0,
      rankingSum: 0,
      rankingCount: 0,
      reportCount: 0,
    };

    const avail = Number(report.availableBalance);
    const pend = Number(report.pendingBalance);
    existing.availableBalance += avail;
    existing.pendingBalance += pend;
    existing.totalMoney += avail + pend;
    existing.reportCount += 1;

    if (report.rating != null) {
      existing.ratingSum += Number(report.rating);
      existing.ratingCount += 1;
    }
    if (report.rankingPage != null) {
      existing.rankingSum += report.rankingPage;
      existing.rankingCount += 1;
    }

    dateMap.set(dateKey, existing);
  });

  return Array.from(dateMap.values()).map((d) => ({
    date: d.date,
    money: d.totalMoney,
    availableBalance: d.availableBalance,
    pendingBalance: d.pendingBalance,
    rating: d.ratingCount > 0 ? Math.round((d.ratingSum / d.ratingCount) * 100) / 100 : null,
    ranking: d.rankingCount > 0 ? Math.round(d.rankingSum / d.rankingCount) : null,
    reportCount: d.reportCount,
    ratingReportCount: d.ratingCount,
    rankingReportCount: d.rankingCount,
  }));
}

export async function getBalanceTrends(days = 14) {
  const startDate = startOfDay(subDays(new Date(), days));

  const reports = await db.shiftReport.findMany({
    where: {
      reportDate: {
        gte: startDate,
      },
    },
    include: {
      account: {
        select: {
          username: true,
          platform: true,
        },
      },
    },
    orderBy: [{ reportDate: 'asc' }, { shift: 'asc' }],
  });

  const dateMap = new Map<
    string,
    {
      date: string;
      totalAvailable: number;
      totalPending: number;
      accountCount: number;
    }
  >();

  reports.forEach((report) => {
    const dateKey = format(report.reportDate, 'yyyy-MM-dd');
    const existing = dateMap.get(dateKey) || {
      date: dateKey,
      totalAvailable: 0,
      totalPending: 0,
      accountCount: 0,
    };

    existing.totalAvailable += Number(report.availableBalance);
    existing.totalPending += Number(report.pendingBalance);
    existing.accountCount += 1;

    dateMap.set(dateKey, existing);
  });

  return Array.from(dateMap.values());
}

export async function getPendingOrdersTrend(days = 14) {
  const startDate = startOfDay(subDays(new Date(), days));

  const reports = await db.shiftReport.findMany({
    where: {
      reportDate: {
        gte: startDate,
      },
    },
    include: {
      account: {
        select: {
          username: true,
          platform: true,
        },
      },
    },
    orderBy: [{ reportDate: 'asc' }, { shift: 'asc' }],
  });

  const dateMap = new Map<
    string,
    {
      date: string;
      totalPending: number;
      totalCompleted: number;
    }
  >();

  reports.forEach((report) => {
    const dateKey = format(report.reportDate, 'yyyy-MM-dd');
    const existing = dateMap.get(dateKey) || {
      date: dateKey,
      totalPending: 0,
      totalCompleted: 0,
    };

    existing.totalPending += report.pendingOrders;
    existing.totalCompleted += report.ordersCompleted;

    dateMap.set(dateKey, existing);
  });

  return Array.from(dateMap.values());
}

export async function getOperatorPerformance(days = 30) {
  const startDate = startOfDay(subDays(new Date(), days));

  const reports = await db.shiftReport.groupBy({
    by: ['reportedByUserId'],
    where: {
      reportDate: {
        gte: startDate,
      },
    },
    _count: {
      id: true,
    },
  });

  const usersWithCounts = await Promise.all(
    reports.map(async (r) => {
      const user = await db.user.findUnique({
        where: { id: r.reportedByUserId },
        select: { name: true, email: true },
      });

      return {
        name: user?.name || 'Unknown',
        email: user?.email || '',
        reportsSubmitted: r._count.id,
      };
    })
  );

  return usersWithCounts.sort((a, b) => b.reportsSubmitted - a.reportsSubmitted);
}

export async function getAccountPerformanceMetrics(accountId: string, days = 30) {
  const startDate = startOfDay(subDays(new Date(), days));

  const reports = await db.shiftReport.findMany({
    where: {
      accountId,
      reportDate: {
        gte: startDate,
      },
    },
    orderBy: [{ reportDate: 'asc' }, { shift: 'asc' }],
  });

  const metrics = reports.map((r) => ({
    date: format(r.reportDate, 'MMM dd'),
    shift: r.shift,
    available: Number(r.availableBalance),
    pending: Number(r.pendingBalance),
    ordersCompleted: r.ordersCompleted,
    pendingOrders: r.pendingOrders,
    rankingPage: r.rankingPage,
  }));

  return {
    metrics,
    totalCompleted: reports.reduce((sum, r) => sum + r.ordersCompleted, 0),
    avgPendingOrders:
      reports.length > 0 ? Math.round(reports.reduce((sum, r) => sum + r.pendingOrders, 0) / reports.length) : 0,
    currentBalance: reports.length > 0 ? Number(reports[reports.length - 1].availableBalance) : 0,
  };
}

export async function getCompletionRateByPlatform(days = 30) {
  const startDate = startOfDay(subDays(new Date(), days));

  const accounts = await db.account.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      platform: true,
    },
  });

  const platformStats = new Map<
    string,
    {
      expectedReports: number;
      actualReports: number;
    }
  >();

  for (const account of accounts) {
    const reportCount = await db.shiftReport.count({
      where: {
        accountId: account.id,
        reportDate: {
          gte: startDate,
        },
      },
    });

    const existing = platformStats.get(account.platform) || {
      expectedReports: 0,
      actualReports: 0,
    };

    existing.expectedReports += days * 2;
    existing.actualReports += reportCount;

    platformStats.set(account.platform, existing);
  }

  return Array.from(platformStats.entries()).map(([platform, stats]) => ({
    platform,
    completionRate: stats.expectedReports > 0 ? Math.round((stats.actualReports / stats.expectedReports) * 100) : 0,
    submitted: stats.actualReports,
    expected: stats.expectedReports,
  }));
}
