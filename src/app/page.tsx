import HomePageClient from '@/components/home-client';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';


export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return <HomePageClient />;
}

export const metadata = {
  title: 'Mini Gigs Hub - The Space',
  description: 'Internal operations platform for freelance management',
};