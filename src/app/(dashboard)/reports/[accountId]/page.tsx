import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { startOfDay } from 'date-fns';
import { ReportSubmitClient } from '@/components/report-submit-client';
import { Shift } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface ReportSubmitPageProps {
  params: Promise<{ accountId: string }>;
}

/** Submit report page — fetches lastReport on server (like edit report page). */
export default async function ReportSubmitPage({ params }: ReportSubmitPageProps) {
  const { accountId } = await params;

  const account = await db.account.findFirst({
    where: { id: accountId, status: 'active' },
    select: { id: true, platform: true, username: true },
  });

  if (!account) {
    notFound();
  }

  const today = startOfDay(new Date());
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const [latestReport, todayReports, users] = await Promise.all([
    db.shiftReport.findFirst({
      where: { accountId },
      orderBy: [{ reportDate: 'desc' }, { createdAt: 'desc' }],
    }),
    db.shiftReport.findMany({
      where: {
        accountId,
        reportDate: { gte: todayStart, lte: todayEnd },
      },
      select: { shift: true },
    }),
    db.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  let lastReport: {
    id: string;
    reportDate: Date;
    ordersCompleted: number;
    pendingOrders: number;
    availableBalance: number;
    pendingBalance: number;
    ordersInProgressValue?: number;
    rankingPage?: number;
    successRate?: number;
    responseRate?: number;
    earningsToDate?: number;
    notes?: string;
    rating?: number;
    handedOverToUserId?: string | null;
    ordersInProgress?: { account: string; deadline: string; handlerPhone: string }[];
  } | null = null;

  if (latestReport) {
    lastReport = {
      id: latestReport.id,
      reportDate: latestReport.reportDate,
      ordersCompleted: latestReport.ordersCompleted,
      pendingOrders: latestReport.pendingOrders,
      availableBalance: Number(latestReport.availableBalance),
      pendingBalance: Number(latestReport.pendingBalance),
      ordersInProgressValue: Number(latestReport.ordersInProgressValue ?? 0),
      rankingPage: latestReport.rankingPage ?? undefined,
      successRate: latestReport.successRate != null ? Number(latestReport.successRate) : undefined,
      responseRate: latestReport.responseRate != null ? Number(latestReport.responseRate) : undefined,
      earningsToDate: latestReport.earningsToDate != null ? Number(latestReport.earningsToDate) : undefined,
      notes: latestReport.notes ?? undefined,
      rating: latestReport.rating != null ? Number(latestReport.rating) : undefined,
      handedOverToUserId: latestReport.handedOverToUserId ?? undefined,
      ordersInProgress: ((latestReport.ordersInProgress as { account: string; deadline: string; handlerPhone: string }[] | null) ?? []).map(
        (o) => ({ ...o, deadline: o.deadline ? String(o.deadline).slice(0, 10) : today.toISOString().slice(0, 10) })
      ),
    };
  }

  const existingShifts = todayReports.map((r) => r.shift) as Shift[];
  const accountName = `${account.platform} – ${account.username}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports" prefetch className="text-sm text-gray-500 hover:text-gray-700">
          ← Submit Reports
        </Link>
      </div>
      <h1 className="text-2xl font-bold">Submit Report</h1>
      <ReportSubmitClient
        accountId={account.id}
        accountName={accountName}
        existingShifts={existingShifts}
        users={users.map((u) => ({ id: u.id, name: u.name }))}
        lastReport={lastReport ?? undefined}
      />
    </div>
  );
}
