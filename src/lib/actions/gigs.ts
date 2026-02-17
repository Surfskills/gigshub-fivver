'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { GigStatus } from '@prisma/client';

export async function createGig(data: {
  accountId: string;
  name: string;
  type: string;
  rated?: boolean;
  lastRatedDate?: string;
  nextPossibleRateDate?: string;
  ratingType?: string;
  ratingEmail?: string;
}) {
  await requireAdmin();

  try {
    const gig = await db.gig.create({
      data: {
        accountId: data.accountId,
        name: data.name,
        type: data.type,
        rated: data.rated || false,
        lastRatedDate: data.lastRatedDate ? new Date(data.lastRatedDate) : undefined,
        nextPossibleRateDate: data.nextPossibleRateDate ? new Date(data.nextPossibleRateDate) : undefined,
        ratingType: data.ratingType as 'client' | 'paypal' | 'cash' | undefined,
        ratingEmail: data.ratingEmail?.trim() || undefined,
      },
    });

    revalidatePath(`/accounts/${data.accountId}`);
    return { success: true, gig };
  } catch (error) {
    return { success: false, error: 'Failed to create gig' };
  }
}

export async function updateGig(
  gigId: string,
  data: {
    name?: string;
    type?: string;
    rated?: boolean;
    lastRatedDate?: string | null;
    nextPossibleRateDate?: string | null;
    ratingType?: string | null;
    ratingEmail?: string | null;
    status?: GigStatus;
  }
) {
  await requireAdmin();

  try {
    const { lastRatedDate, nextPossibleRateDate, ratingType, ratingEmail, ...rest } = data;
    const gig = await db.gig.update({
      where: { id: gigId },
      data: {
        ...rest,
        ...(lastRatedDate !== undefined && {
          lastRatedDate: lastRatedDate ? new Date(lastRatedDate) : null,
        }),
        ...(nextPossibleRateDate !== undefined && {
          nextPossibleRateDate: nextPossibleRateDate ? new Date(nextPossibleRateDate) : null,
        }),
        ...(ratingType !== undefined && {
          ratingType: ratingType ? (ratingType as 'client' | 'paypal' | 'cash') : null,
        }),
        ...(ratingEmail !== undefined && {
          ratingEmail: ratingEmail?.trim() || null,
        }),
      },
    });

    revalidatePath(`/accounts/${gig.accountId}`);
    return { success: true, gig };
  } catch (error) {
    return { success: false, error: 'Failed to update gig' };
  }
}

export async function deleteGig(gigId: string) {
  await requireAdmin();

  try {
    const gig = await db.gig.findUnique({
      where: { id: gigId },
      select: { accountId: true },
    });

    if (!gig) {
      return { success: false, error: 'Gig not found' };
    }

    await db.gig.delete({
      where: { id: gigId },
    });

    revalidatePath(`/accounts/${gig.accountId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete gig' };
  }
}
