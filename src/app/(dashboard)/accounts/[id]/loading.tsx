export default function AccountDetailLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="h-4 w-48 rounded bg-gray-200" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 rounded bg-gray-200" />
          <div className="h-10 w-24 rounded bg-gray-200" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg border bg-white" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-48 rounded-lg border bg-white" />
        <div className="h-48 rounded-lg border bg-white" />
      </div>
    </div>
  );
}
