import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { getMissingReportsToday } = await import('@/lib/queries/reports');
  const { sendMissingReportsAlert } = await import('@/lib/email/send');
  const { format } = await import('date-fns');

  const missingReports = await getMissingReportsToday();

  if (missingReports.length === 0) {
    return NextResponse.json({ message: 'No missing reports' });
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

  if (!result.success) {
    return NextResponse.json({ error: 'Failed to send alert', details: result.error }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Alert sent',
    reportCount: missingReports.length,
  });
}
