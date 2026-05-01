import { cn } from '@/lib/utils';

export function SeverityBadge({ severity, label }: { severity: string; label: string }) {
  const className =
    severity === 'LEVEL_4'
      ? 'bg-red-600 text-white'
      : severity === 'LEVEL_3'
        ? 'bg-red-100 text-red-700'
        : severity === 'LEVEL_2'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-sky-100 text-sky-700';

  return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', className)}>{label}</span>;
}
