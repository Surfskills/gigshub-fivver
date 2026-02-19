'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Shift, Prisma } from '@prisma/client';
import { format } from 'date-fns';
import { sendReportSubmittedNotification } from '@/lib/email/send';

export type AccountCreated = { email: string; type: 'seller' | 'buyer' };
export type OrderInProgress = { account: string; deadline: string; handlerPhone: string };

export async function submitShiftReport(data: {
  accountId: string;
  reportDate: string;
  shift: Shift;
  ordersCompleted: number;
  pendingOrders: number;
  availableBalance: number;
  pendingBalance: number;
  ordersInProgressValue?: number;
  rankingPage?: number;
  successRate?: number;
  responseRate?: number;
  earningsToDate?: number;
  notes?: string;
  accountsCreated?: AccountCreated[];
  rating?: number;
  handedOverToUserId?: string | null;
  ordersInProgress?: OrderInProgress[];
}) {
  const user = await requireAdmin();

  try {
    const [account, adminUsers] = await Promise.all([
      db.account.findUnique({
        where: { id: data.accountId },
        select: { platform: true, username: true },
      }),
      db.user.findMany({
        where: { role: 'admin' },
        select: { email: true },
      }),
    ]);

    const report = await db.shiftReport.create({
      data: {
        accountId: data.accountId,
        reportDate: new Date(data.reportDate),
        shift: data.shift,
        ordersCompleted: data.ordersCompleted,
        pendingOrders: data.pendingOrders,
        availableBalance: data.availableBalance,
        pendingBalance: data.pendingBalance,
        ordersInProgressValue: data.ordersInProgressValue ?? 0,
        rankingPage: data.rankingPage,
        successRate: data.successRate != null ? data.successRate : undefined,
        responseRate: data.responseRate != null ? data.responseRate : undefined,
        earningsToDate: data.earningsToDate != null ? data.earningsToDate : undefined,
        notes: data.notes,
        handedOverToUserId: data.handedOverToUserId || undefined,
        accountsCreated:
          data.accountsCreated && data.accountsCreated.length > 0
            ? (data.accountsCreated as Prisma.InputJsonValue)
            : undefined,
        rating: data.rating != null ? data.rating : undefined,
        ordersInProgress:
          data.ordersInProgress && data.ordersInProgress.length > 0
            ? (data.ordersInProgress as Prisma.InputJsonValue)
            : undefined,
        reportedByUserId: user.id,
      },
    });

    const adminEmails = adminUsers.map((a) => a.email).filter(Boolean);
    if (adminEmails.length > 0) {
      sendReportSubmittedNotification(adminEmails, {
        accountName: account ? `${account.platform} – ${account.username}` : data.accountId,
        reportDate: format(new Date(data.reportDate), 'MMMM d, yyyy'),
        shift: data.shift,
        submittedBy: user.name || user.email,
      }).catch((err) => console.error('Failed to send report notification:', err));
    }

    revalidatePath('/reports');
    revalidatePath(`/reports/${data.accountId}`);
    revalidatePath('/dashboard');
    revalidatePath('/');

    return { success: true, report };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return {
        success: false,
        error: `${data.shift} report already submitted for this account on ${data.reportDate}`,
      };
    }
    return { success: false, error: 'Failed to submit report' };
  }
}

export async function updateShiftReport(
  reportId: string,
  data: {
    ordersCompleted?: number;
    pendingOrders?: number;
    availableBalance?: number;
    pendingBalance?: number;
    ordersInProgressValue?: number;
    rankingPage?: number | null;
    successRate?: number | null;
    responseRate?: number | null;
    earningsToDate?: number | null;
    notes?: string | null;
    accountsCreated?: AccountCreated[] | null;
    rating?: number | null;
    handedOverToUserId?: string | null;
    ordersInProgress?: OrderInProgress[] | null;
  }
) {
  await requireAdmin();

  const report = await db.shiftReport.update({
    where: { id: reportId },
    data: {
      ...data,
      accountsCreated:
        data.accountsCreated !== undefined
          ? data.accountsCreated && data.accountsCreated.length > 0
            ? (data.accountsCreated as Prisma.InputJsonValue)
            : Prisma.DbNull
          : undefined,
      ordersInProgress:
        data.ordersInProgress !== undefined
          ? data.ordersInProgress && data.ordersInProgress.length > 0
            ? (data.ordersInProgress as Prisma.InputJsonValue)
            : Prisma.DbNull
          : undefined,
    },
  });

  revalidatePath('/reports');
  revalidatePath('/reports/history');
  revalidatePath('/dashboard');
  revalidatePath(`/accounts/${report.accountId}`);
  revalidatePath('/');
  return { success: true, report };
}

export async function getReportById(reportId: string) {
  return db.shiftReport.findUnique({
    where: { id: reportId },
    include: {
      account: { select: { id: true, platform: true, username: true } },
      reportedBy: { select: { name: true } },
      handedOverTo: { select: { id: true, name: true } },
    },
  });
}

export async function getAccountReportsForDate(accountId: string, date: string) {
  return db.shiftReport.findMany({
    where: {
      accountId,
      reportDate: new Date(date),
    },
    include: {
      reportedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      shift: 'asc',
    },
  });
}