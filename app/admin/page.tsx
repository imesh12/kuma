'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';

type DashboardReport = {
  id: string;
  title: string;
  statusLabel: string;
  severityLabel: string;
  prefecture?: string | null;
  municipality?: string | null;
  createdAt: string;
};

type DashboardResponse = {
  stats: {
    totalReports: number;
    todayReports: number;
    pendingReview: number;
    highRisk: number;
    alertsSent: number;
  };
  reports: DashboardReport[];
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reports?limit=6')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 shadow-sm">ダッシュボードを読み込んでいます...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">管理ダッシュボード</h1>
        <p className="mt-2 text-sm text-slate-500">自治体・警察向けの確認、公開、通知運用をまとめて管理します。</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard label="今日の報告数" value={data?.stats.todayReports ?? 0} tone="slate" />
        <AdminStatsCard label="審査待ち" value={data?.stats.pendingReview ?? 0} tone="amber" />
        <AdminStatsCard label="高リスク" value={data?.stats.highRisk ?? 0} tone="red" />
        <AdminStatsCard label="送信済み通知" value={data?.stats.alertsSent ?? 0} tone="green" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">最新報告</h2>
            <Link href="/admin/reports" className="text-sm font-medium text-slate-500 hover:text-slate-900">
              レポート一覧
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data?.reports?.map((report) => (
              <Link
                key={report.id}
                href={`/admin/reports/${report.id}`}
                className="block rounded-2xl border border-slate-200 p-4 hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{report.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {[report.prefecture, report.municipality].filter(Boolean).join(' / ') || '地域情報確認中'}
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{report.statusLabel}</p>
                    <p>{report.severityLabel}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">{new Date(report.createdAt).toLocaleString('ja-JP')}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">クイックアクション</h2>
            <div className="mt-4 grid gap-3">
              <Link href="/admin/reports" className="rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white">
                新規報告を登録
              </Link>
              <Link href="/map" className="rounded-2xl border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700">
                公開マップを見る
              </Link>
              <div className="rounded-2xl border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-500">LINE通知設定</div>
              <Link href="/admin/reports" className="rounded-2xl border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700">
                レポート一覧
              </Link>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">地域別リスク</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-700">
              {(data?.reports ?? []).slice(0, 4).map((report) => (
                <div key={report.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>{[report.prefecture, report.municipality].filter(Boolean).join(' / ') || '地域確認中'}</span>
                  <span className="font-semibold text-red-700">{report.severityLabel}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
