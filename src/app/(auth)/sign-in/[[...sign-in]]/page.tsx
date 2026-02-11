import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex w-full max-w-md items-center justify-center py-8">
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
    </div>
  );
}
