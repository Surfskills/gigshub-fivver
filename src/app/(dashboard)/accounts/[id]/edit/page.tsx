import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import type { AccountLevel, AccountStatus } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { AccountForm } from '@/components/forms/account-form';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export const metadata = {
  title: 'Edit Account',
  description: 'Edit account details',
};

interface EditAccountPageProps {
  params: { id: string };
}

function BuildPlaceholder() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded-md" />
            </div>
          ))}
          <div className="h-10 w-32 bg-gray-300 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default async function EditAccountPage({ params }: EditAccountPageProps) {
  // Skip DB access during build - Vercel build fails when DB is unavailable
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return <BuildPlaceholder />;
  }

  const user = await getCurrentUser();
  if (user?.role !== 'admin') {
    redirect(`/accounts/${params.id}`);
  }

  let account;
  try {
    const { getAccountById } = await import('@/lib/queries/accounts');
    account = await getAccountById(params.id);
  } catch {
    // DB unavailable during build - return placeholder so build succeeds
    return <BuildPlaceholder />;
  }

  if (!account) {
    notFound();
  }

  const { updateAccount } = await import('@/lib/actions/accounts');

  const acc = account;

  async function updateAccountAction(formData: FormData) {
    'use server';

    const username = (formData.get('username') as string) ?? acc.username;
    const typeOfGigs = (formData.get('typeOfGigs') as string) ?? acc.typeOfGigs;
    const currency = (formData.get('currency') as string) ?? acc.currency;
    const status = (formData.get('status') as AccountStatus) ?? acc.status;
    const accountLevel = (formData.get('accountLevel') as AccountLevel) ?? acc.accountLevel;
    const successRateVal = formData.get('successRate') as string | null;
    const successRate = successRateVal && successRateVal.trim() ? Number(successRateVal) : null;
    const browserType = (formData.get('browserType') as string)?.trim() || null;
    const proxy = (formData.get('proxy') as string)?.trim() || null;

    const result = await updateAccount(params.id, {
      username,
      typeOfGigs,
      currency,
      status,
      accountLevel,
      successRate,
      browserType,
      proxy,
    });

    if (result.success) {
      redirect(`/accounts/${params.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile-first container with responsive padding */}
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Header section - optimized for mobile readability */}
        <header className="mb-6 space-y-2 sm:mb-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
            Edit Account
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            <span className="font-medium">{account.platform}</span>
            {' • '}
            <span className="break-all">{account.username}</span>
          </p>
        </header>

        {/* Form container - responsive card design */}
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <div className="px-4 py-5 sm:p-6 lg:p-8">
            <Suspense fallback={<FormSkeleton />}>
              <AccountForm
                action={updateAccountAction}
                isEdit
                submitLabel="Save Changes"
                defaultValues={{
                  platform: account.platform,
                  email: account.email,
                  username: account.username,
                  typeOfGigs: account.typeOfGigs,
                  currency: account.currency,
                  status: account.status,
                  accountLevel: account.accountLevel,
                  successRate: account.successRate != null ? Number(account.successRate) : null,
                  browserType: account.browserType,
                  proxy: account.proxy,
                }}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

// Form loading skeleton for better UX
function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Simulate form fields */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded-md sm:h-11" />
        </div>
      ))}
      {/* Simulate button */}
      <div className="h-10 w-full bg-gray-300 rounded-md sm:h-11 sm:w-32" />
    </div>
  );
}
