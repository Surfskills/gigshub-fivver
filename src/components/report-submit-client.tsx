'use client';

import { useRouter } from 'next/navigation';
import { ShiftReportForm } from '@/components/forms/shift-report-form';
import { Shift } from '@prisma/client';
import type { LastReportData, UserOption } from '@/components/forms/shift-report-form';

interface ReportSubmitClientProps {
  accountId: string;
  accountName: string;
  existingShifts: Shift[];
  users: UserOption[];
  lastReport?: LastReportData;
}

export function ReportSubmitClient({
  accountId,
  accountName,
  existingShifts,
  users,
  lastReport,
}: ReportSubmitClientProps) {
  const router = useRouter();

  return (
    <ShiftReportForm
      key={accountId}
      accountId={accountId}
      accountName={accountName}
      existingShifts={existingShifts}
      users={users}
      lastReport={lastReport}
      onReportSubmitted={() => router.push('/reports')}
    />
  );
}
