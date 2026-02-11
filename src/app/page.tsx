import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { LandingContent } from '@/components/landing-content';

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return <LandingContent />;
}

export const metadata = {
  title: 'Mini Gigs Hub - The Space',
  description: 'Internal operations platform for freelance management',
};
