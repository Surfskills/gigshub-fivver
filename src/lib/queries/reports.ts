import { db } from '@/lib/db';
import { startOfDay, endOfDay } from 'date-fns';

export async function getMissingReportsToday() {
  const today = new Date();
  const todayStart = startOfDay(today);

  const accounts = await db.account.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      platform: true,
      username: true,
      shiftReports: {
        where: {
          reportDate: todayStart,
        },
        select: {
          shift: true,
        },
      },
    },
  });

  return accounts
    .map((account) => {
      const submittedShifts = account.shiftReports.map((r) => r.shift);
      const missingShifts = ['AM', 'PM'].filter(
        (shift) => !submittedShifts.includes(shift as any)
      );

      return {
        id: account.id,
        platform: account.platform,
        username: account.username,
        missingShifts,
      };
    })
    .filter((a) => a.missingShifts.length > 0);
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
