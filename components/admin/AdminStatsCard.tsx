export function AdminStatsCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: 'slate' | 'amber' | 'red' | 'green';
}) {
  const toneMap = {
    slate: 'bg-slate-50 text-slate-900 ring-slate-200',
    amber: 'bg-amber-50 text-amber-900 ring-amber-200',
    red: 'bg-red-50 text-red-900 ring-red-200',
    green: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
  };

  return (
    <div className={`rounded-2xl p-5 shadow-sm ring-1 ${toneMap[tone]}`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}
