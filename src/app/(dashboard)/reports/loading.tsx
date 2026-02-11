export default function ReportsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-56 rounded bg-gray-200" />
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 rounded-lg border bg-white" />
        ))}
      </div>
    </div>
  );
}
