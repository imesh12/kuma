'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { PublicBearMap } from '@/components/map/PublicBearMap';
import { ReportFeed } from '@/components/reports/ReportFeed';

type PublicReport = {
  id: string;
  title: string;
  description: string;
  locationLabel: string;
  prefecture?: string | null;
  municipality?: string | null;
  publicLat: number;
  publicLng: number;
  status: string;
  statusLabel: string;
  sourceTypeLabel: string;
  severity: string;
  severityLabel: string;
  sightedAt: string;
  imageUrl?: string | null;
};

export default function PublicMapPage() {
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [search, setSearch] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/reports')
      .then((res) => res.json())
      .then((data) => {
        setReports(data.reports ?? []);
        setSelectedReportId(data.reports?.[0]?.id ?? null);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const filteredReports = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return reports;

    return reports.filter((report) =>
      [report.title, report.description, report.locationLabel, report.prefecture, report.municipality]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword))
    );
  }, [reports, search]);

  const recentCount = filteredReports.filter((report) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return new Date(report.sightedAt).getTime() >= thirtyDaysAgo;
  }).length;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#edf4ff_100%)] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xl font-bold tracking-tight">くまセーフティゾーン</p>
            <p className="text-xs text-slate-500">公開位置は安全のため補正されています</p>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            <Link href="/map">マップ</Link>
            <a href="#latest">最新情報</a>
            <a href="#guide">安全ガイド</a>
            <a href="#notifications">通知</a>
          </nav>
          <Link href="/admin/reports" className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            目撃情報を報告
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="relative min-h-[70vh]">
          <div className="absolute left-4 right-4 top-4 z-20 rounded-3xl bg-white/95 p-4 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">最新のクマ出没情報を確認</h1>
                <p className="mt-1 text-sm text-slate-500">公開マップは補正済み座標のみを表示します。危険の兆候をすばやく把握できます。</p>
              </div>
              <div className="w-full max-w-md">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="地域・市区町村を検索"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="h-[78vh] pt-24">
            {loading ? (
              <div className="flex h-full items-center justify-center rounded-[2rem] bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                公開マップを読み込んでいます...
              </div>
            ) : (
              <PublicBearMap reports={filteredReports} selectedReportId={selectedReportId} onSelectReport={setSelectedReportId} />
            )}
          </div>

          <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-lg ring-1 ring-slate-200">
            Heatmap = 最近の活動傾向 / Blue = 公開位置
          </div>
        </section>

        <aside className="hidden lg:block" id="latest">
          <div className="sticky top-24 h-[78vh]">
            <ReportFeed
              reports={filteredReports}
              selectedReportId={selectedReportId}
              onSelect={setSelectedReportId}
              title="最新の目撃情報"
              subtitle={`過去30日: ${recentCount}件 / 最終更新: ${new Date().toLocaleString('ja-JP')}`}
            />
          </div>
        </aside>
      </main>

      <section className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
        <ReportFeed
          reports={filteredReports}
          selectedReportId={selectedReportId}
          onSelect={setSelectedReportId}
          title="最新の目撃情報"
          subtitle={`過去30日: ${recentCount}件 / 最終更新: ${new Date().toLocaleString('ja-JP')}`}
        />
      </section>
    </div>
  );
}
