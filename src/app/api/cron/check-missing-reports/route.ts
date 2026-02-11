import { NextResponse } from 'next/server';
import { getMissingReportsToday } from '@/lib/queries/reports';
import { sendMissingReportsAlert } from '@/lib/email/send';
import { db } from '@/lib/db';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const missingReports = await getMissingReportsToday();

  if (missingReports.length === 0) {
    return NextResponse.json({ message: 'No missing reports' });
  }

  const admins = await db.user.findMany({
    where: { role: 'admin' },
    select: { email: true },
  });

  const adminEmails = admins.map((a) => a.email);

  if (adminEmails.length === 0) {
    return NextResponse.json({ error: 'No admin emails' }, { status: 500 });
  }

  const today = format(new Date(), 'MMMM dd, yyyy');

  await sendMissingReportsAlert(
    adminEmails,
    missingReports.map((r) => ({
      platform: r.platform,
      username: r.username,
      missingShifts: r.missingShifts,
    })),
    today
  );

  return NextResponse.json({
    message: 'Alert sent',
    reportCount: missingReports.length,
  });
}
