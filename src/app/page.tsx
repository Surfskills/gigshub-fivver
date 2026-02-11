import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { LandingContent } from '@/components/landing-content';

export default async function HomePage() {
  try {
    const { userId } = await auth();
    if (userId) {
      redirect('/dashboard');
    }
  } catch {
    // Clerk may fail when env vars are missing - still show landing page
  }
  return <LandingContent />;
}

export const metadata = {
  title: 'Mini Gigs Hub - The Space',
  description: 'Internal operations platform for freelance management',
};
