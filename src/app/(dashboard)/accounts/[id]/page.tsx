import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAccountById } from '@/lib/queries/accounts';
import { createGig } from '@/lib/actions/gigs';
import { GigForm } from '@/components/forms/gig-form';

interface AccountDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const account = await getAccountById(params.id);

  if (!account) {
    notFound();
  }

  async function createGigAction(formData: FormData) {
    'use server';

    const name = (formData.get('name') as string) ?? '';
    const type = (formData.get('type') as string) ?? '';
    const rated = formData.get('rated') === 'true';

    await createGig({
      accountId: params.id,
      name,
      type,
      rated,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {account.platform} - {account.username}
          </h1>
          <p className="text-gray-600">{account.email}</p>
        </div>
        <Link href={`/accounts/${account.id}/edit`} className="rounded border px-4 py-2 text-sm hover:bg-gray-50">
          Edit Account
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Status</div>
          <div className="text-lg font-semibold">{account.status}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Total gigs</div>
          <div className="text-lg font-semibold">{account.gigs.length}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Total reports</div>
          <div className="text-lg font-semibold">{account._count.shiftReports}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Gigs</h2>
          {account.gigs.length === 0 && <p className="text-sm text-gray-500">No gigs yet.</p>}
          {account.gigs.map((gig) => (
            <div key={gig.id} className="rounded border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{gig.name}</div>
                <span className="text-xs uppercase text-gray-500">{gig.status}</span>
              </div>
              <div className="text-sm text-gray-600">{gig.type}</div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Add Gig</h2>
          <GigForm action={createGigAction} />
        </div>
      </div>
    </div>
  );
}
