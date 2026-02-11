import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex w-full max-w-md items-center justify-center py-8">
      <SignUp
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
