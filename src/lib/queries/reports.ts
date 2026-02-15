import { db } from '@/lib/db';

/** Report interval in hours - a report is due when 48+ hours have passed since the last one. */
export const REPORT_INTERVAL_HOURS = 48;

export async function getMissingReportsToday() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - REPORT_INTERVAL_HOURS * 60 * 60 * 1000);

  const accounts = await db.account.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      platform: true,
      username: true,
      shiftReports: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  return accounts
    .filter((account) => {
      const lastReport = account.shiftReports[0];
      if (!lastReport) return true;
      return new Date(lastReport.createdAt) < cutoff;
    })
    .map((account) => ({
      id: account.id,
      platform: account.platform,
      username: account.username,
      missingShifts: ['Report overdue (48+ hours)'],
    }));
}

export async function getAccountHealthMetrics(accountId: string, days = 7) {
  const reports = await db.shiftReport.findMany({
    where: {
      accountId,
      reportDate: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: {
      reportDate: 'desc',
    },
  });

  const pendingOrdersTrend = reports.map((r) => ({
    date: r.reportDate,
    shift: r.shift,
    pendingOrders: r.pendingOrders,
  }));

  const balanceTrend = reports.map((r) => ({
    date: r.reportDate,
    shift: r.shift,
    available: Number(r.availableBalance),
    pending: Number(r.pendingBalance),
  }));

  return { pendingOrdersTrend, balanceTrend };
}
