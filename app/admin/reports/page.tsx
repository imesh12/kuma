'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ReportStatusBadge } from '@/components/reports/ReportStatusBadge';
import { SeverityBadge } from '@/components/reports/SeverityBadge';
import { TrustBadge } from '@/components/reports/TrustBadge';

type ReportRow = {
  id: string;
  title: string;
  createdAt: string;
  status: string;
  statusLabel: string;
  trustLevel: string;
  trustLevelLabel: string;
  severity: string;
  severityLabel: string;
  prefecture?: string | null;
  municipality?: string | null;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports?limit=100');
      const data = await res.json();
      setReports(data.reports ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 shadow-sm">レポート一覧を読み込んでいます...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">レポート一覧</h1>
        <p className="mt-2 text-sm text-slate-500">正確な位置は詳細ページでのみ確認できます。</p>
      </section>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-6 py-4">日時</th>
              <th className="px-6 py-4">タイトル</th>
              <th className="px-6 py-4">地域</th>
              <th className="px-6 py-4">状態</th>
              <th className="px-6 py-4">信頼</th>
              <th className="px-6 py-4">危険度</th>
              <th className="px-6 py-4">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr key={report.id} className="align-top">
                <td className="px-6 py-4 text-sm text-slate-600">{new Date(report.createdAt).toLocaleString('ja-JP')}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{report.title}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {[report.prefecture, report.municipality].filter(Boolean).join(' / ') || '確認中'}
                </td>
                <td className="px-6 py-4">
                  <ReportStatusBadge status={report.status} label={report.statusLabel} />
                </td>
                <td className="px-6 py-4">
                  <TrustBadge level={report.trustLevel} label={report.trustLevelLabel} />
                </td>
                <td className="px-6 py-4">
                  <SeverityBadge severity={report.severity} label={report.severityLabel} />
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <Link href={`/admin/reports/${report.id}`} className="text-blue-700 hover:text-blue-900">
                    詳細を見る
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
