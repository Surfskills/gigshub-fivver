import { db } from '@/lib/db';

export async function getAccountById(accountId: string) {
  return db.account.findUnique({
    where: { id: accountId },
    include: {
      gigs: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          shiftReports: true,
        },
      },
    },
  });
}

export async function getAllAccounts() {
  return db.account.findMany({
    include: {
      _count: {
        select: {
          gigs: true,
          shiftReports: true,
        },
      },
    },
    orderBy: {
      platform: 'asc',
    },
  });
}
