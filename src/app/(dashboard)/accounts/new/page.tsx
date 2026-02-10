import { redirect } from 'next/navigation';
import { createAccount } from '@/lib/actions/accounts';
import { AccountForm } from '@/components/forms/account-form';
import { Platform } from '@prisma/client';

export default function NewAccountPage() {
  async function createAccountAction(formData: FormData) {
    'use server';

    const platform = formData.get('platform') as Platform;
    const email = (formData.get('email') as string) ?? '';
    const username = (formData.get('username') as string) ?? '';
    const typeOfGigs = (formData.get('typeOfGigs') as string) ?? '';
    const currency = (formData.get('currency') as string) ?? 'USD';

    const result = await createAccount({
      platform,
      email,
      username,
      typeOfGigs,
      currency,
    });

    if (result.success) {
      redirect('/accounts');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-gray-600">Add a new freelancing account</p>
      </div>
      <AccountForm action={createAccountAction} submitLabel="Create Account" />
    </div>
  );
}
