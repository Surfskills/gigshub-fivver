'use server';

import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { format } from 'date-fns';

export async function exportReportsToCSV(startDate: string, endDate: string) {
  await requireUser();

  const reports = await db.shiftReport.findMany({
    where: {
      reportDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    include: {
      account: {
        select: {
          platform: true,
          username: true,
          email: true,
        },
      },
      reportedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: [{ reportDate: 'desc' }, { shift: 'asc' }],
  });

  type AccountCreated = { email: string; type: 'seller' | 'buyer' };
  type OrderInProgress = { account: string; deadline: string; handlerPhone: string };
  const formatAccountsCreated = (accounts: AccountCreated[] | null | undefined): string => {
    if (!accounts || accounts.length === 0) return '';
    return accounts.map((a) => `${a.email} (${a.type})`).join('; ');
  };
  const formatOrdersInProgress = (orders: OrderInProgress[] | null | undefined): string => {
    if (!orders || orders.length === 0) return '';
    return orders.map((o) => `${o.account} (${o.deadline}, ${o.handlerPhone})`).join('; ');
  };

  const csvData = reports.map((report) => ({
    Date: format(report.reportDate, 'yyyy-MM-dd'),
    Shift: report.shift,
    Platform: report.account.platform,
    Account: report.account.username,
    'Account Email': report.account.email,
    'Orders Completed': report.ordersCompleted,
    'Pending Orders': report.pendingOrders,
    'Available Balance': Number(report.availableBalance).toFixed(2),
    'Pending Balance': Number(report.pendingBalance).toFixed(2),
    'Ranking Page': report.rankingPage || '',
    Rating: report.rating != null ? Number(report.rating) : '',
    'Accounts Created': formatAccountsCreated(report.accountsCreated as AccountCreated[] | null),
    'Orders in Progress': formatOrdersInProgress(report.ordersInProgress as OrderInProgress[] | null),
    Notes: report.notes || '',
    'Reported By': report.reportedBy.name,
    'Reporter Email': report.reportedBy.email,
    'Submitted At': format(report.createdAt, 'yyyy-MM-dd HH:mm:ss'),
  }));

  return csvData;
}

export async function exportAccountsToCSV() {
  await requireUser();

  const accounts = await db.account.findMany({
    include: {
      gigs: true,
      _count: {
        select: {
          shiftReports: true,
        },
      },
    },
    orderBy: {
      platform: 'asc',
    },
  });

  const csvData = accounts.map((account) => ({
    Platform: account.platform,
    Username: account.username,
    Email: account.email,
    'Type of Gigs': account.typeOfGigs,
    Currency: account.currency,
    Status: account.status,
    'Active Gigs': account.gigs.filter((g) => g.status === 'active').length,
    'Total Reports': account._count.shiftReports,
    'Created At': format(account.createdAt, 'yyyy-MM-dd'),
  }));

  return csvData;
}
