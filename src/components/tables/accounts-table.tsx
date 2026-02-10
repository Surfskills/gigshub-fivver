import Link from 'next/link';
import { AccountStatus, Platform } from '@prisma/client';

interface AccountRow {
  id: string;
  platform: Platform;
  username: string;
  email: string;
  typeOfGigs: string;
  status: AccountStatus;
  gigsCount: number;
  reportsCount: number;
}

interface AccountsTableProps {
  rows: AccountRow[];
}

export function AccountsTable({ rows }: AccountsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-3 text-left font-medium">Platform</th>
            <th className="p-3 text-left font-medium">Username</th>
            <th className="p-3 text-left font-medium">Email</th>
            <th className="p-3 text-left font-medium">Type of gigs</th>
            <th className="p-3 text-left font-medium">Status</th>
            <th className="p-3 text-right font-medium">Gigs</th>
            <th className="p-3 text-right font-medium">Reports</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b hover:bg-gray-50">
              <td className="p-3 uppercase">{row.platform}</td>
              <td className="p-3">
                <Link href={`/accounts/${row.id}`} className="font-medium text-blue-700 hover:underline">
                  {row.username}
                </Link>
              </td>
              <td className="p-3 text-gray-600">{row.email}</td>
              <td className="p-3 text-gray-600">{row.typeOfGigs}</td>
              <td className="p-3">{row.status}</td>
              <td className="p-3 text-right">{row.gigsCount}</td>
              <td className="p-3 text-right">{row.reportsCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
