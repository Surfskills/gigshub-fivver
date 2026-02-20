import HomePageClient from '@/components/home-client';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Head from 'next/head';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Mini Gigs Hub?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mini Gigs Hub is an operations and reporting dashboard for managing multiple freelancing accounts across Fiverr, Upwork, and direct clients. It provides shift-based reporting, earnings tracking, analytics, and automated email alerts for missing reports.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which platforms does Mini Gigs Hub support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mini Gigs Hub supports Fiverr, Upwork, and direct client accounts. You can track gigs, earnings, and performance across all platforms in one place.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does shift reporting work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Users submit AM and PM shift reports for each account daily. The system tracks earnings, orders completed, and available balance per shift. Automated alerts notify you when reports are missing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Mini Gigs Hub free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, the platform is not free. Contact admin to discuss your account setup.',
      },
    },
    {
      '@type': 'Question',
      name: 'What features does Mini Gigs Hub include?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Features include an analytics dashboard with balance trends, account management, shift reporting, financial records, CSV exports, and automated email alerts for missing reports. Role-based access (Admin and Operator) is supported.',
      },
    },
  ],
};

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <>
      <Head>
        <link rel="canonical" href="https://mini-gigs-hub.space/" />
      </Head>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomePageClient />
    </>
  );
}

export const metadata = {
  title: 'Mini Gigs Hub - The Space',
  description: 'Operations and reporting dashboard for freelancing accounts. Track gigs, shift reports, earnings, and analytics across Fiverr, Upwork, and direct clients. Contact admin for account setup.',
  openGraph: {
    title: 'Mini Gigs Hub - The Space',
    description: 'Operations and reporting dashboard for freelancing accounts. Track gigs, shift reports, earnings, and analytics across Fiverr, Upwork, and direct clients.',
  },
};
