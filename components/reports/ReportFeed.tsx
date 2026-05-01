'use client';

import { useEffect, useState } from 'react';
import { ReportFeedCard } from '@/components/reports/ReportFeedCard';

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

export function ReportFeed({
  reports,
  selectedReportId,
  onSelect,
  title,
  showLastUpdated = true,
}: {
  reports: FeedReport[];
  selectedReportId?: string | null;
  onSelect: (reportId: string) => void;
  title: string;
  showLastUpdated?: boolean;
}) {
  const [lastUpdated, setLastUpdated] = useState<string>('...');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString('ja-JP'));
  }, []);

  return (
    <section className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-200/50 backdrop-blur">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">
          過去30日: {reports.length}件
          {showLastUpdated && <> / 最終更新: {lastUpdated}</>}
        </p>
      </div>

      <div className="mt-4 space-y-3 overflow-y-auto pr-1">
        {reports.length > 0 ? (
          reports.map((report) => (
            <ReportFeedCard
              key={report.id}
              report={report}
              selected={selectedReportId === report.id}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            表示できる通報はありません。
          </div>
        )}
      </div>
    </section>
  );
}