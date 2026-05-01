import { cn } from '@/lib/utils';

export function TrustBadge({ level, label }: { level: string; label: string }) {
  const className =
    level === 'high'
      ? 'bg-emerald-100 text-emerald-700'
      : level === 'medium'
        ? 'bg-slate-100 text-slate-700'
        : 'bg-orange-100 text-orange-700';

  return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', className)}>{label}</span>;
}
