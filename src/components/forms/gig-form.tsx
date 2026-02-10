interface GigFormProps {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
}

export function GigForm({ action, submitLabel = 'Add Gig' }: GigFormProps) {
  return (
    <form action={action} className="space-y-3 rounded-lg border bg-white p-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Gig name *</label>
        <input type="text" name="name" required className="w-full rounded border px-3 py-2" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Gig type *</label>
        <input type="text" name="type" required placeholder="API, MVP, CICD, etc." className="w-full rounded border px-3 py-2" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="rated" value="true" />
        Rated gig
      </label>

      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        {submitLabel}
      </button>
    </form>
  );
}
