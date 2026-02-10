interface MissingAccount {
  id: string;
  username: string;
  platform: string;
  missingShifts: string[];
}

interface MissingReportsCardProps {
  items: MissingAccount[];
}

export function MissingReportsCard({ items }: MissingReportsCardProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <p className="font-medium text-green-800">All shift reports submitted for today.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-6">
      <h2 className="mb-4 text-lg font-semibold text-orange-900">Missing Reports ({items.length})</h2>
      <div className="space-y-2">
        {items.map((account) => (
          <div key={account.id} className="flex items-center justify-between rounded bg-white p-3">
            <div>
              <div className="font-medium">{account.username}</div>
              <div className="text-sm text-gray-600">{account.platform}</div>
            </div>
            <div className="flex gap-2">
              {account.missingShifts.map((shift) => (
                <span key={shift} className="rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                  {shift}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
