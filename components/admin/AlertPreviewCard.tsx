import { formatRadiusJapanese } from '@/lib/reporting';

export function AlertPreviewCard({
  radiusMeters,
  message,
}: {
  radiusMeters: number;
  message: string;
}) {
  return (
    <section className="rounded-2xl border border-red-100 bg-red-50/70 p-5">
      <h3 className="text-base font-semibold text-red-900">通知プレビュー</h3>
      <div className="mt-3 grid gap-3 text-sm text-red-900">
        <p>
          <span className="font-medium">通知範囲:</span> 半径 {formatRadiusJapanese(radiusMeters)}
        </p>
        <p>
          <span className="font-medium">想定エリア:</span> 正確な位置を中心に半径 {formatRadiusJapanese(radiusMeters)} の登録者
        </p>
        <p className="rounded-2xl bg-white/80 p-4 leading-7 text-slate-700">{message}</p>
        <p className="text-xs text-slate-500">この範囲内の登録者に通知されます</p>
      </div>
    </section>
  );
}
