'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, useSignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      window.location.href = '/dashboard';
    }
  }, [isSignedIn]);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setSuccessfulCreation(true);
    } catch (err: unknown) {
      const errObj = err as { errors?: Array<{ longMessage?: string }> };
      setError(errObj.errors?.[0]?.longMessage ?? 'Failed to send reset code. Check your email address.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });
      if (result?.status === 'needs_second_factor') {
        setSecondFactor(true);
      } else if (result?.status === 'complete' && result.createdSessionId) {
        await setActive?.({ session: result.createdSessionId });
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      const errObj = err as { errors?: Array<{ longMessage?: string }> };
      setError(errObj.errors?.[0]?.longMessage ?? 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg bg-white p-6 shadow-lg ring-1 ring-gray-900/5 sm:p-8">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Forgot password?</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email and we&apos;ll send you a code to reset your password.
        </p>

        <form
          onSubmit={successfulCreation ? handleReset : handleRequestCode}
          className="mt-6 space-y-4"
        >
          {!successfulCreation ? (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send reset code'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Reset code (check your email)
                </label>
                <input
                  id="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter the 6-digit code"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuccessfulCreation(false);
                  setCode('');
                  setPassword('');
                  setError('');
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                Use a different email
              </button>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {secondFactor && (
            <p className="text-sm text-amber-700">
              Two-factor authentication is required. Please sign in with another method first.
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
            ← Back to sign in
          </Link>
        </p>
      </div>
      <p className="mt-4 text-center text-xs text-gray-500">
        The reset code is sent via email. To use the same SMTP as this app, configure Custom SMTP in
        Clerk Dashboard → Configure → Email.
      </p>
    </div>
  );
}
