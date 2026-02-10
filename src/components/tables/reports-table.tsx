import { Shift } from '@prisma/client';

interface ReportRow {
  id: string;
  reportDate: Date;
  shift: Shift;
  ordersCompleted: number;
  pendingOrders: number;
  availableBalance: number;
  pendingBalance: number;
  accountName: string;
  reportedByName: string;
}

interface ReportsTableProps {
  rows: ReportRow[];
}

export function ReportsTable({ rows }: ReportsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-3 text-left font-medium">Date</th>
            <th className="p-3 text-left font-medium">Shift</th>
            <th className="p-3 text-left font-medium">Account</th>
            <th className="p-3 text-right font-medium">Completed</th>
            <th className="p-3 text-right font-medium">Pending</th>
            <th className="p-3 text-right font-medium">Available</th>
            <th className="p-3 text-right font-medium">Pending Bal.</th>
            <th className="p-3 text-left font-medium">Reported By</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{new Date(row.reportDate).toLocaleDateString()}</td>
              <td className="p-3">{row.shift}</td>
              <td className="p-3">{row.accountName}</td>
              <td className="p-3 text-right">{row.ordersCompleted}</td>
              <td className="p-3 text-right">{row.pendingOrders}</td>
              <td className="p-3 text-right">${row.availableBalance.toFixed(2)}</td>
              <td className="p-3 text-right">${row.pendingBalance.toFixed(2)}</td>
              <td className="p-3">{row.reportedByName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
