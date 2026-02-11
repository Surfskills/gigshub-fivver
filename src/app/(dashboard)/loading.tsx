export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="h-4 w-72 rounded bg-gray-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg border bg-white" />
        ))}
      </div>
      <div className="h-64 rounded-lg border bg-white" />
    </div>
  );
}
