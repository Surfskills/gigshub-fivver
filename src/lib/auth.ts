import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from './db';
import { UserRole } from '@prisma/client';

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  // Sync Clerk user to DB
  let user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    const isFirstUser = (await db.user.count()) === 0;
    user = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
        role: isFirstUser ? UserRole.admin : UserRole.operator,
      },
    });
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== UserRole.admin) throw new Error('Forbidden');
  return user;
}
