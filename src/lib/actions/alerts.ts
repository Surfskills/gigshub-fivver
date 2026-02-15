'use server';

import { getMissingReportsToday } from '@/lib/queries/reports';
import { sendMissingReportsAlert } from '@/lib/email/send';
import { requireUser } from '@/lib/auth';
import { format } from 'date-fns';

export async function sendMissingReportsEmail() {
  await requireUser();

  const missingReports = await getMissingReportsToday();

  if (missingReports.length === 0) {
    return { success: true, message: 'No missing reports to alert about' };
  }

  const today = format(new Date(), 'MMMM dd, yyyy');

  const result = await sendMissingReportsAlert(
    [],
    missingReports.map((r) => ({
      platform: r.platform,
      username: r.username,
      missingShifts: r.missingShifts,
    })),
    today
  );

  return result;
}
