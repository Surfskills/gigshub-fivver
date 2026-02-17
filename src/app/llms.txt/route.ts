import { NextResponse } from 'next/server';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://yourdomain.com');

const llmsTxt = `## Core

- [Mini Gigs Hub - Home](${baseUrl}/): Operations and reporting dashboard for freelancing accounts
- [Sign In](${baseUrl}/sign-in): User authentication
- [Sign Up](${baseUrl}/sign-up): Create an account

---

Mini Gigs Hub is an operations and reporting dashboard for managing multiple freelancing accounts across Fiverr, Upwork, and direct clients. It provides shift-based reporting, earnings tracking, analytics, and automated email alerts for missing reports. Built with Next.js, Prisma, and Clerk.

# Mini Gigs Hub
`;

export async function GET() {
  return new NextResponse(llmsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
