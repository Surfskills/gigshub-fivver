'use server';

import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Shift } from '@prisma/client';

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
