import { AccountStatus, Platform } from '@prisma/client';

interface AccountFormProps {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: {
    platform?: Platform;
    email?: string;
    username?: string;
    typeOfGigs?: string;
    currency?: string;
    status?: AccountStatus;
  };
  submitLabel?: string;
  isEdit?: boolean;
}

export function AccountForm({ action, defaultValues, submitLabel = 'Save Account', isEdit = false }: AccountFormProps) {
  const platforms: Platform[] = ['fiverr', 'upwork', 'direct'];
  const statuses: AccountStatus[] = ['active', 'paused', 'risk'];

  return (
    <form action={action} className="space-y-4 rounded-lg border bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Platform *</label>
          <select
            name="platform"
            defaultValue={defaultValues?.platform ?? 'fiverr'}
            className="w-full rounded border px-3 py-2"
            disabled={isEdit}
          >
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email *</label>
          <input
            type="email"
            name="email"
            defaultValue={defaultValues?.email}
            required
            disabled={isEdit}
            className="w-full rounded border px-3 py-2 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Username *</label>
          <input
            type="text"
            name="username"
            defaultValue={defaultValues?.username}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Currency *</label>
          <input
            type="text"
            name="currency"
            defaultValue={defaultValues?.currency ?? 'USD'}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Type of gigs *</label>
        <input
          type="text"
          name="typeOfGigs"
          defaultValue={defaultValues?.typeOfGigs}
          required
          placeholder="API Development, MVP Building"
          className="w-full rounded border px-3 py-2"
        />
      </div>

      {isEdit && (
        <div>
          <label className="mb-1 block text-sm font-medium">Status *</label>
          <select
            name="status"
            defaultValue={defaultValues?.status ?? 'active'}
            className="w-full rounded border px-3 py-2"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      )}

      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        {submitLabel}
      </button>
    </form>
  );
}
