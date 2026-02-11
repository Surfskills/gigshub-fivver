'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardLayoutClient } from '@/components/dashboard-layout-client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in?redirect_url=/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User';

  return (
    <DashboardLayoutClient user={{ name: displayName }}>
      {children}
    </DashboardLayoutClient>
  );
}
