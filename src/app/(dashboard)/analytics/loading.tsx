export default function AnalyticsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 w-52 rounded bg-gray-200" />
          <div className="h-4 w-40 rounded bg-gray-200" />
        </div>
        <div className="h-10 w-48 rounded bg-gray-200" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 rounded-lg border bg-white" />
        ))}
      </div>
    </div>
  );
}
