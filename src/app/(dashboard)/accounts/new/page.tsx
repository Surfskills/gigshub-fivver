import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { createAccount } from '@/lib/actions/accounts';
import { AccountForm } from '@/components/forms/account-form';
import { Platform } from '@prisma/client';

// Form loading skeleton
function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded-md sm:h-11" />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <div className="h-11 flex-1 bg-gray-300 rounded-md sm:flex-none sm:w-40" />
        <div className="h-11 flex-1 bg-gray-200 rounded-md sm:flex-none sm:w-32" />
      </div>
    </div>
  );
}

export default function NewAccountPage() {
  async function createAccountAction(formData: FormData) {
    'use server';

    const platform = formData.get('platform') as Platform;
    const email = (formData.get('email') as string) ?? '';
    const username = (formData.get('username') as string) ?? '';
    const typeOfGigs = (formData.get('typeOfGigs') as string) ?? '';
    const currency = (formData.get('currency') as string) ?? 'USD';

    const result = await createAccount({
      platform,
      email,
      username,
      typeOfGigs,
      currency,
    });

    if (result.success) {
      redirect('/accounts');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile-first container with proper spacing */}
      <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Back navigation - mobile optimized */}
        <nav className="mb-4 sm:mb-6" aria-label="Breadcrumb">
          <Link
            href="/accounts"
            prefetch
            className="group inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-gray-200 sm:px-4 sm:text-base"
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 sm:h-5 sm:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Accounts</span>
          </Link>
        </nav>

        {/* Page header - mobile optimized typography */}
        <header className="mb-6 space-y-1 sm:mb-8 sm:space-y-2">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
            Create Account
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Add a new freelancing account to track your gigs and earnings
          </p>
        </header>

        {/* Form container - responsive card with proper mobile padding */}
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <div className="px-4 py-5 sm:p-6 lg:p-8">
            <Suspense fallback={<FormSkeleton />}>
              <AccountForm 
                action={createAccountAction} 
                submitLabel="Create Account" 
              />
            </Suspense>
          </div>
        </div>

        {/* Optional: Helper text for mobile users */}
        <div className="mt-4 rounded-md bg-blue-50 p-4 sm:mt-6">
          <div className="flex gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 sm:text-base">
                Getting Started
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                Make sure to use the exact username from your freelancing platform 
                for accurate tracking and reporting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metadata for SEO
export const metadata = {
  title: 'Create New Account | Freelance Manager',
  description: 'Add a new freelancing platform account to track your gigs, earnings, and performance.',
};