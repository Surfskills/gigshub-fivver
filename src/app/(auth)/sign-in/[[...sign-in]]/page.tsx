import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center gap-4 py-8">
      <SignIn
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'w-full shadow-lg',
          },
        }}
      />
      <p className="text-sm text-gray-600">
        <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
          Forgot password?
        </Link>
      </p>
    </div>
  );
}
