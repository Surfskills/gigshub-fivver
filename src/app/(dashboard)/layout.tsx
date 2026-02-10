import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Ops Brain
              </Link>
              <div className="flex gap-4">
                <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/accounts" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Accounts
                </Link>
                <Link href="/reports" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Submit Reports
                </Link>
                <Link href="/reports/history" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  History
                </Link>
                <Link href="/analytics" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Analytics
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.name}</span>
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
