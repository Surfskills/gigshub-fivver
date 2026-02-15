import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getReportById } from '@/lib/actions/reports';
import { ReportEditForm } from '@/components/forms/report-edit-form';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface ReportEditPageProps {
  params: Promise<{ id: string; reportId: string }>;
}

export default async function ReportEditPage({ params }: ReportEditPageProps) {
  const { id: accountId, reportId } = await params;
  const [report, users] = await Promise.all([
    getReportById(reportId),
    db.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!report || report.accountId !== accountId) {
    notFound();
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/* Mobile-first navigation with better touch target */}
      <nav className="mb-4 sm:mb-6" aria-label="Breadcrumb">
        <Link
          href={`/accounts/${accountId}`}
          prefetch={false}
          className="inline-flex items-center gap-2 text-sm sm:text-base 
                     text-gray-600 hover:text-gray-900 active:text-gray-700
                     py-2 px-3 -ml-3 rounded-lg hover:bg-gray-50
                     transition-colors duration-150 ease-in-out
                     touch-manipulation"
        >
          <svg 
            className="w-4 h-4 sm:w-5 sm:h-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Account</span>
        </Link>
      </nav>

      {/* Mobile-optimized heading */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 
                     text-gray-900 leading-tight">
        Edit Report
      </h1>

      {/* Form container with max width for readability */}
      <div className="w-full max-w-4xl">
        <ReportEditForm report={report} users={users.map((u) => ({ id: u.id, name: u.name }))} />
      </div>
    </div>
  );
}