'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Platform, AccountStatus } from '@prisma/client';

export async function createAccount(data: {
  platform: Platform;
  email: string;
  username: string;
  typeOfGigs: string;
  currency?: string;
}) {
  await requireAdmin();

  try {
    const account = await db.account.create({
      data: {
        platform: data.platform,
        email: data.email,
        username: data.username,
        typeOfGigs: data.typeOfGigs,
        currency: data.currency || 'USD',
      },
    });

    revalidatePath('/accounts');
    return { success: true, account };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Account with this email already exists on this platform' };
    }
    return { success: false, error: 'Failed to create account' };
  }
}

export async function updateAccount(
  accountId: string,
  data: {
    username?: string;
    typeOfGigs?: string;
    currency?: string;
    status?: AccountStatus;
  }
) {
  await requireAdmin();

  try {
    const account = await db.account.update({
      where: { id: accountId },
      data,
    });

    revalidatePath('/accounts');
    revalidatePath(`/accounts/${accountId}`);
    return { success: true, account };
  } catch (error) {
    return { success: false, error: 'Failed to update account' };
  }
}

export async function deleteAccount(accountId: string) {
  await requireAdmin();

  try {
    await db.account.delete({
      where: { id: accountId },
    });

    revalidatePath('/accounts');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete account' };
  }
}
