import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Freelance Operations Brain',
  description: 'Operations & Reporting Dashboard for Freelancing Accounts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <header className="flex h-16 items-center justify-end gap-4 border-b bg-white px-4">
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="rounded-full bg-[#6c47ff] px-5 py-2 text-sm font-medium text-white">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
