export default function ReportsHistoryLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded bg-gray-200" />
          <div className="h-4 w-56 rounded bg-gray-200" />
        </div>
        <div className="h-10 w-36 rounded bg-gray-200" />
      </div>
      <div className="h-16 rounded-lg border bg-gray-100" />
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="h-12 border-b bg-gray-50" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-12 border-b last:border-0" />
        ))}
      </div>
    </div>
  );
}
