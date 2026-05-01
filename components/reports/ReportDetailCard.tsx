type DetailReport = {
  description: string;
  address?: string | null;
  prefecture?: string | null;
  municipality?: string | null;
  sightedAt: string | Date;
  sourceTypeLabel: string;
  trustLevelLabel: string;
  statusLabel: string;
  imageUrl?: string | null;
  adminNote?: string | null;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-800">{value}</dd>
    </div>
  );
}

export function ReportDetailCard({ report }: { report: DetailReport }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">通報詳細</h3>
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-500">内容</p>
          <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-800">{report.description}</p>
        </div>
        <dl className="space-y-3">
          <DetailRow label="住所" value={report.address || '確認中'} />
          <DetailRow label="都道府県 / 市区町村" value={[report.prefecture, report.municipality].filter(Boolean).join(' / ') || '確認中'} />
          <DetailRow label="目撃日時" value={new Date(report.sightedAt).toLocaleString('ja-JP')} />
          <DetailRow label="情報ソース" value={report.sourceTypeLabel} />
          <DetailRow label="信頼レベル" value={report.trustLevelLabel} />
          <DetailRow label="審査状態" value={report.statusLabel} />
          <DetailRow label="管理メモ" value={report.adminNote || '未入力'} />
        </dl>
        {report.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.imageUrl}
            alt="通報画像"
            className="h-64 w-full rounded-2xl object-cover ring-1 ring-slate-200"
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            画像は登録されていません。
          </div>
        )}
      </div>
    </section>
  );
}
