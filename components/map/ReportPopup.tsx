import { Popup } from 'react-map-gl/mapbox';
import { ReportStatusBadge } from '@/components/reports/ReportStatusBadge';
import { SeverityBadge } from '@/components/reports/SeverityBadge';

type PopupReport = {
  title: string;
  description: string;
  locationLabel: string;
  sightedAt: string | Date;
  severity: string;
  severityLabel: string;
  status: string;
  statusLabel: string;
  sourceTypeLabel: string;
  publicLat: number;
  publicLng: number;
};

export function ReportPopup({
  report,
  onClose,
}: {
  report: PopupReport;
  onClose: () => void;
}) {
  return (
    <Popup anchor="bottom" longitude={report.publicLng} latitude={report.publicLat} onClose={onClose} closeButton>
      <div className="max-w-xs space-y-3 p-1">
        <div className="flex flex-wrap gap-2">
          <ReportStatusBadge status={report.status} label={report.statusLabel} />
          <SeverityBadge severity={report.severity} label={report.severityLabel} />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{report.title}</p>
          <p className="mt-1 text-xs text-slate-500">{report.sourceTypeLabel}</p>
        </div>
        <p className="text-sm leading-6 text-slate-700">{report.description}</p>
        <p className="text-xs text-slate-500">{report.locationLabel}</p>
        <p className="text-xs text-slate-500">{new Date(report.sightedAt).toLocaleString('ja-JP')}</p>
        <button
          type="button"
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
        >
          詳細を見る
        </button>
      </div>
    </Popup>
  );
}
