import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Freelance Operations Brain
        </h1>
        <p className="mt-4 text-lg text-gray-600 sm:text-xl">
          Operations & reporting dashboard for your freelancing accounts. Track gigs, reports, and earnings in one place.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Freelance Operations Brain',
  description: 'Operations & reporting dashboard for freelancing accounts',
};
