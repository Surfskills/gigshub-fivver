'use server';

import { getMissingReportsToday } from '@/lib/queries/reports';
import { sendMissingReportsAlert } from '@/lib/email/send';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { format } from 'date-fns';

export async function sendMissingReportsEmail() {
  await requireAdmin();

  const missingReports = await getMissingReportsToday();

  if (missingReports.length === 0) {
    return { success: true, message: 'No missing reports to alert about' };
  }

  const admins = await db.user.findMany({
    where: { role: 'admin' },
    select: { email: true },
  });

  const adminEmails = admins.map((a) => a.email);

  if (adminEmails.length === 0) {
    return { success: false, error: 'No admin emails configured' };
  }

  const today = format(new Date(), 'MMMM dd, yyyy');

  const result = await sendMissingReportsAlert(
    adminEmails,
    missingReports.map((r) => ({
      platform: r.platform,
      username: r.username,
      missingShifts: r.missingShifts,
    })),
    today
  );

  return result;
}
