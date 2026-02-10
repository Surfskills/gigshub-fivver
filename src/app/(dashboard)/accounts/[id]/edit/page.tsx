import { notFound, redirect } from 'next/navigation';
import { AccountStatus } from '@prisma/client';
import { getAccountById } from '@/lib/queries/accounts';
import { updateAccount } from '@/lib/actions/accounts';
import { AccountForm } from '@/components/forms/account-form';

interface EditAccountPageProps {
  params: {
    id: string;
  };
}

export default async function EditAccountPage({ params }: EditAccountPageProps) {
  const account = await getAccountById(params.id);

  if (!account) {
    notFound();
  }

  async function updateAccountAction(formData: FormData) {
    'use server';

    const username = (formData.get('username') as string) ?? account.username;
    const typeOfGigs = (formData.get('typeOfGigs') as string) ?? account.typeOfGigs;
    const currency = (formData.get('currency') as string) ?? account.currency;
    const status = (formData.get('status') as AccountStatus) ?? account.status;

    const result = await updateAccount(params.id, {
      username,
      typeOfGigs,
      currency,
      status,
    });

    if (result.success) {
      redirect(`/accounts/${params.id}`);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Account</h1>
        <p className="text-gray-600">
          {account.platform} - {account.username}
        </p>
      </div>
      <AccountForm
        action={updateAccountAction}
        isEdit
        submitLabel="Save Changes"
        defaultValues={{
          platform: account.platform,
          email: account.email,
          username: account.username,
          typeOfGigs: account.typeOfGigs,
          currency: account.currency,
          status: account.status,
        }}
      />
    </div>
  );
}
