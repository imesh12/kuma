import { ReportStatusBadge } from '@/components/reports/ReportStatusBadge';
import { SeverityBadge } from '@/components/reports/SeverityBadge';

type FeedReport = {
  id: string;
  title: string;
  locationLabel: string;
  sightedAt: string | Date;
  sourceTypeLabel: string;
  severity: string;
  severityLabel: string;
  status: string;
  statusLabel: string;
  imageUrl?: string | null;
};

export function ReportFeedCard({
  report,
  selected,
  onSelect,
}: {
  report: FeedReport;
  selected: boolean;
  onSelect: (reportId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(report.id)}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected ? 'border-red-300 bg-red-50/70 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{report.title}</p>
          <p className="mt-1 text-sm text-slate-500">{report.locationLabel}</p>
        </div>
        {report.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={report.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-200" />
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SeverityBadge severity={report.severity} label={report.severityLabel} />
        <ReportStatusBadge status={report.status} label={report.statusLabel} />
        <span className="text-xs text-slate-500">{report.sourceTypeLabel}</span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{new Date(report.sightedAt).toLocaleString('ja-JP')}</p>
    </button>
  );
}
