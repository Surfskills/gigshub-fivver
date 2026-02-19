'use server';

import { db } from '@/lib/db';
import { requireAdmin, requireUser } from '@/lib/auth';
import { PAGE_SIZE } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import { Platform, AccountStatus, AccountLevel } from '@prisma/client';

export type AccountCreatedInput = { email: string; type: 'seller' | 'buyer' };

/** Report newly created accounts - creates Account records. Admin only. */
export async function reportAccountsCreated(data: {
  platform: Platform;
  accounts: AccountCreatedInput[];
}) {
  const user = await requireAdmin();

  if (!data.accounts.length) {
    return { success: false, error: 'Add at least one account' };
  }

  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const acc of data.accounts) {
    if (!acc.email?.trim()) continue;

    const username = acc.email.split('@')[0] || acc.email;
    const typeOfGigs = acc.type === 'seller' ? 'Seller' : 'Buyer';

    try {
      await db.account.create({
        data: {
          platform: data.platform,
          email: acc.email.trim(),
          username,
          typeOfGigs,
          currency: 'USD',
          accountLevel: 'starter',
          createdByUserId: user.id,
        },
      });
      results.push({ email: acc.email, success: true });
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === 'P2002') {
        results.push({ email: acc.email, success: false, error: 'Already exists on this platform' });
      } else {
        results.push({ email: acc.email, success: false, error: 'Failed to create' });
      }
    }
  }

  revalidatePath('/accounts');
  revalidatePath('/reports');

  const failed = results.filter((r) => !r.success);
  if (failed.length === results.length) {
    return { success: false, error: failed[0]?.error || 'All accounts failed' };
  }

  return {
    success: true,
    created: results.filter((r) => r.success).length,
    failed: failed.length > 0 ? failed.map((f) => ({ email: f.email, error: f.error! })) : undefined,
  };
}

export async function createAccount(data: {
  platform: Platform;
  email: string;
  username: string;
  typeOfGigs: string;
  currency?: string;
  accountLevel?: AccountLevel;
  successRate?: number | null;
  browserType?: string | null;
  proxy?: string | null;
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
        accountLevel: data.accountLevel || 'starter',
        successRate: data.successRate != null ? data.successRate : undefined,
        browserType: data.browserType || undefined,
        proxy: data.proxy || undefined,
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
    accountLevel?: AccountLevel;
    successRate?: number | null;
    browserType?: string | null;
    proxy?: string | null;
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

/** Get paginated list of accounts created via the Reports form (email, type, created by). */
export async function getAccountsCreatedList(page = 1, search = '') {
  await requireUser();

  const skip = (page - 1) * PAGE_SIZE;
  const searchLower = search.trim().toLowerCase();

  const where = {
    createdByUserId: { not: null },
    ...(searchLower
      ? {
          OR: [
            { email: { contains: searchLower, mode: 'insensitive' as const } },
            { username: { contains: searchLower, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [accounts, total] = await Promise.all([
    db.account.findMany({
      where,
      select: {
        id: true,
        email: true,
        platform: true,
        typeOfGigs: true,
        createdAt: true,
        createdBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    db.account.count({ where }),
  ]);

  return {
    accounts: accounts.map((a) => ({
      id: a.id,
      email: a.email,
      platform: a.platform,
      type: a.typeOfGigs.toLowerCase().includes('seller') ? 'seller' : 'buyer',
      createdAt: a.createdAt,
      createdBy: a.createdBy?.name ?? a.createdBy?.email ?? 'Unknown',
    })),
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
    pageSize: PAGE_SIZE,
  };
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
