'use server';

import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Shift, Prisma } from '@prisma/client';

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
  rankingPage?: number;
  notes?: string;
  accountsCreated?: AccountCreated[];
  rating?: number;
  ordersInProgress?: OrderInProgress[];
}) {
  const user = await requireUser();

  try {
    const report = await db.shiftReport.create({
      data: {
        accountId: data.accountId,
        reportDate: new Date(data.reportDate),
        shift: data.shift,
        ordersCompleted: data.ordersCompleted,
        pendingOrders: data.pendingOrders,
        availableBalance: data.availableBalance,
        pendingBalance: data.pendingBalance,
        rankingPage: data.rankingPage,
        notes: data.notes,
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

    revalidatePath('/reports');
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
    rankingPage?: number | null;
    notes?: string | null;
    accountsCreated?: AccountCreated[] | null;
    rating?: number | null;
    ordersInProgress?: OrderInProgress[] | null;
  }
) {
  await requireUser();

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