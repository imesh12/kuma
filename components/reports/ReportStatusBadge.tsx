import { cn } from '@/lib/utils';

export function ReportStatusBadge({ status, label }: { status: string; label: string }) {
  const className =
    status === 'APPROVED'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      : status === 'DANGEROUS'
        ? 'bg-red-50 text-red-700 ring-red-200'
        : status === 'CHECKING'
          ? 'bg-amber-50 text-amber-700 ring-amber-200'
          : 'bg-slate-100 text-slate-700 ring-slate-200';

  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset', className)}>
      {label}
    </span>
  );
}
