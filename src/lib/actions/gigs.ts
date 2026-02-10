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
}) {
  await requireAdmin();

  try {
    const gig = await db.gig.create({
      data: {
        accountId: data.accountId,
        name: data.name,
        type: data.type,
        rated: data.rated || false,
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
    status?: GigStatus;
  }
) {
  await requireAdmin();

  try {
    const gig = await db.gig.update({
      where: { id: gigId },
      data,
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
