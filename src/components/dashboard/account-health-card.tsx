interface AccountHealthCardProps {
  label: string;
  value: number;
}

export function AccountHealthCard({ label, value }: AccountHealthCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="text-sm uppercase text-gray-600">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
