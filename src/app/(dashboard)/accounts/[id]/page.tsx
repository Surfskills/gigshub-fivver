import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAccountById } from '@/lib/queries/accounts';
import { createGig } from '@/lib/actions/gigs';
import { GigForm } from '@/components/forms/gig-form';
import { GigRatingEdit } from '@/components/gig-rating-edit';
import { AccountReportsSection } from '@/components/account-reports-section';
import { reportsHistoryUrl } from '@/lib/urls';
import { formatAccountLevel, getAccountLevelStyle } from '@/lib/account-level';
import { CopyableValue } from '@/components/ui/copyable-value';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface AccountDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const [user, account] = await Promise.all([
    getCurrentUser(),
    getAccountById(params.id),
  ]);
  const isAdmin = user?.role === 'admin';

  if (!account) {
    notFound();
  }

  async function createGigAction(formData: FormData) {
    'use server';

    const name = (formData.get('name') as string) ?? '';
    const type = (formData.get('type') as string) ?? '';
    const rated = formData.get('rated') === 'true';
    const lastRatedDate = formData.get('lastRatedDate') as string | null;
    const nextPossibleRateDate = formData.get('nextPossibleRateDate') as string | null;
    const ratingType = formData.get('ratingType') as string | null;
    const ratingEmail = formData.get('ratingEmail') as string | null;

    await createGig({
      accountId: params.id,
      name,
      type,
      rated,
      lastRatedDate: rated && lastRatedDate ? lastRatedDate : undefined,
      nextPossibleRateDate: rated && nextPossibleRateDate ? nextPossibleRateDate : undefined,
      ratingType: rated && ratingType ? ratingType : undefined,
      ratingEmail: rated && ratingType === 'paypal' && ratingEmail ? ratingEmail.trim() : undefined,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {account.platform} - {account.username}
          </h1>
          <p className="text-gray-600">{account.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={reportsHistoryUrl(account.id)}
            prefetch
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
          >
            View Reports
          </Link>
          {isAdmin && (
            <>
              <Link
                href={`/reports/${account.id}`}
                prefetch
                className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98]"
              >
                Submit Report
              </Link>
              <Link
                href={`/accounts/${account.id}/edit`}
                prefetch
                className="rounded border px-4 py-2 text-sm font-medium transition-all duration-150 hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-[0.98]"
              >
                Edit Account
              </Link>
            </>
          )}
          <Link
            href={`/analytics?accountId=${account.id}`}
            prefetch
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium transition-all duration-150 hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-[0.98]"
          >
            Analytics
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Level</div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium mt-1 ${getAccountLevelStyle(account.accountLevel)}`}>
            {formatAccountLevel(account.accountLevel)}
          </span>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Status</div>
          <div className="text-lg font-semibold">{account.status}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Total gigs</div>
          <div className="text-lg font-semibold">{account.gigs.length}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Total reports</div>
          <div className="text-lg font-semibold">{account._count.shiftReports}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Success rate</div>
          <div className="text-lg font-semibold">{account.successRate != null ? `${Number(account.successRate)}%` : '—'}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Browser</div>
          <div className="text-lg font-semibold">{account.browserType ?? '—'}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Proxy</div>
          <CopyableValue value={account.proxy ?? undefined} className="text-sm" />
        </div>
      </div>

      <AccountReportsSection accountId={account.id} reports={account.shiftReports} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Gigs</h2>
          {account.gigs.length === 0 && <p className="text-sm text-gray-500">No gigs yet.</p>}
          {account.gigs.map((gig) => (
            <GigRatingEdit key={gig.id} gig={gig} />
          ))}
        </div>

        {isAdmin ? (
          <div>
            <h2 className="mb-3 text-lg font-semibold">Add Gig</h2>
            <GigForm action={createGigAction} />
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
            <p className="text-sm text-amber-800">Only admins can add gigs. Contact an admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
