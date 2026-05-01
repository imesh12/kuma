'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertPreviewCard } from '@/components/admin/AlertPreviewCard';
import { SendAlertConfirmDialog } from '@/components/admin/SendAlertConfirmDialog';
import { AdminReportMap } from '@/components/map/AdminReportMap';
import { ReportDetailCard } from '@/components/reports/ReportDetailCard';
import { ReportStatusBadge } from '@/components/reports/ReportStatusBadge';
import { SeverityBadge } from '@/components/reports/SeverityBadge';
import { TrustBadge } from '@/components/reports/TrustBadge';
import { formatRadiusJapanese } from '@/lib/reporting';

const radiusOptions = [100, 300, 500, 1000, 2000, 3000, 5000];

const messageTemplates = [
  '目撃場所について、可能であれば建物名・道路名・目印などを追加で教えてください。',
  'クマの大きさ、頭数、移動方向について追加情報があれば教えてください。',
  '写真または動画がある場合、安全な範囲で追加提供をお願いします。',
  'けが人や現在も危険が続いている状況がある場合は教えてください。',
];

type AdminReport = {
  id: string;
  title: string;
  description: string;
  prefecture?: string | null;
  municipality?: string | null;
  address?: string | null;
  realLat: number;
  realLng: number;
  publicLat: number;
  publicLng: number;
  status: string;
  statusLabel: string;
  sourceTypeLabel: string;
  trustLevel: string;
  trustLevelLabel: string;
  severity: string;
  severityLabel: string;
  sightedAt: string;
  imageUrl?: string | null;
  adminNote?: string | null;
  reporterContactAllowed: boolean;
  followUpStatus: string;
  followUpStatusLabel: string;
};

type ReporterInfo = {
  displayName: string;
  maskedLineUserId?: string | null;
  lineUserId?: string;
  contactConsent: boolean;
  contactStatus: string;
  contactStatusLabel: string;
  followUpStatusLabel: string;
  reporterContactAllowed: boolean;
};

type PrivateMessage = {
  id: string;
  message: string;
  status: string;
  sentAt?: string | null;
  createdAt: string;
  sender: {
    name: string;
    role: string;
  };
};

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [report, setReport] = useState<AdminReport | null>(null);
  const [reporter, setReporter] = useState<ReporterInfo | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertRadius, setAlertRadius] = useState(1000);
  const [alertMessage, setAlertMessage] = useState('');
  const [followUpMessage, setFollowUpMessage] = useState(messageTemplates[0]);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [alertStatus, setAlertStatus] = useState<string | null>(null);
  const [messageStatus, setMessageStatus] = useState<string | null>(null);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const [reportRes, reporterRes, messagesRes] = await Promise.all([
        fetch(`/api/admin/reports/${id}`),
        fetch(`/api/admin/reports/${id}/reporter`),
        fetch(`/api/admin/reports/${id}/private-messages`),
      ]);

      if (!reportRes.ok) {
        throw new Error('通報データの取得に失敗しました。');
      }

      const reportData = await reportRes.json();
      const reporterData = reporterRes.ok ? await reporterRes.json() : { reporter: null };
      const messagesData = messagesRes.ok ? await messagesRes.json() : { messages: [] };

      setReport(reportData.report);
      setReporter(reporterData.reporter);
      setMessages(messagesData.messages);
      setAlertMessage(
        `クマ注意情報: ${reportData.report.title}。半径${formatRadiusJapanese(alertRadius)}の範囲で注意してください。`
      );
    } catch (fetchError) {
      console.error(fetchError);
      setError('通報詳細を表示できませんでした。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!report) return;
    setAlertMessage(`クマ注意情報: ${report.title}。半径${formatRadiusJapanese(alertRadius)}の範囲で注意してください。`);
  }, [alertRadius, report]);

  const canContactReporter = Boolean(
    reporter?.reporterContactAllowed && reporter.contactConsent && reporter.contactStatus === 'CONTACTABLE'
  );

  const latestMessage = useMemo(() => messages[0], [messages]);

  const updateStatus = async (status: string) => {
    await fetch(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await fetchAll();
  };

  const sendAlert = async () => {
    setSendingAlert(true);
    try {
      const res = await fetch(`/api/admin/reports/${id}/send-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ radiusMeters: alertRadius, message: alertMessage }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '通知送信に失敗しました。');
      }
      setAlertStatus(`通知を送信しました。対象者数: ${data.recipientCount ?? 0}`);
      setAlertDialogOpen(false);
      await fetchAll();
    } catch (sendError) {
      console.error(sendError);
      setAlertStatus(sendError instanceof Error ? sendError.message : '通知送信に失敗しました。');
    } finally {
      setSendingAlert(false);
    }
  };

  const sendPrivateMessage = async () => {
    setSendingMessage(true);
    try {
      const res = await fetch(`/api/admin/reports/${id}/private-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: followUpMessage }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '確認メッセージの送信に失敗しました。');
      }
      setMessageStatus('確認メッセージを記録し、LINE送信キューに登録しました。');
      setMessageDialogOpen(false);
      await fetchAll();
    } catch (sendError) {
      console.error(sendError);
      setMessageStatus(sendError instanceof Error ? sendError.message : '確認メッセージの送信に失敗しました。');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 shadow-sm">通報詳細を読み込んでいます...</div>;
  }

  if (error || !report) {
    return <div className="rounded-2xl bg-white p-8 text-red-700 shadow-sm">{error || '通報が見つかりません。'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Link href="/admin/reports" className="inline-flex text-sm font-medium text-slate-500 hover:text-slate-800">
            ← 一覧へ戻る
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{report.title}</h1>
            <p className="mt-2 text-sm text-slate-500">管理者向け詳細確認と通知操作</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ReportStatusBadge status={report.status} label={report.statusLabel} />
            <TrustBadge level={report.trustLevel} label={report.trustLevelLabel} />
            <SeverityBadge severity={report.severity} label={report.severityLabel} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => updateStatus('APPROVED')} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            確認済みにする
          </button>
          <button onClick={() => updateStatus('CHECKING')} className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white">
            審査中にする
          </button>
          <button onClick={() => router.push('/map')} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
            公開マップを見る
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-6">
          <ReportDetailCard report={report} />

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">通報者情報</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">表示名</p>
                <p className="mt-1 font-semibold text-slate-900">{reporter?.displayName || '匿名ユーザー'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Masked LINE ID</p>
                <p className="mt-1 font-semibold text-slate-900">{reporter?.maskedLineUserId || '未連携'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">連絡可否</p>
                <p className="mt-1 font-semibold text-slate-900">{reporter?.contactStatusLabel || '不明'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Follow-up status</p>
                <p className="mt-1 font-semibold text-slate-900">{reporter?.followUpStatusLabel || report.followUpStatusLabel}</p>
              </div>
            </div>
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
              通報者の個人情報は安全管理の目的以外で使用しないでください。
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">通報者への確認メッセージ</h3>
              <button
                type="button"
                onClick={() => setMessageDialogOpen(true)}
                disabled={!canContactReporter}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                通報者に確認メッセージを送信
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {messageTemplates.map((template, index) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => setFollowUpMessage(template)}
                  className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-slate-300"
                >
                  {index + 1}. {['目撃場所の詳細を確認', 'クマの大きさ・頭数を確認', '写真や動画の追加提供を依頼', 'けが人・危険状況を確認'][index]}
                </button>
              ))}
            </div>
            <textarea
              value={followUpMessage}
              onChange={(event) => setFollowUpMessage(event.target.value)}
              placeholder="追加確認したい内容を入力してください"
              rows={5}
              className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-slate-400 focus:outline-none"
            />
            {latestMessage ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-medium text-slate-900">最新送信履歴</p>
                <p className="mt-2 leading-7">{latestMessage.message}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {latestMessage.sender.name} / {latestMessage.sender.role} / {new Date(latestMessage.createdAt).toLocaleString('ja-JP')}
                </p>
              </div>
            ) : null}
            {messageStatus ? <p className="mt-3 text-sm text-slate-600">{messageStatus}</p> : null}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Location Map (Red: Exact, Blue: Public, Circle: Alert Radius)</h3>
            <div className="mt-4">
              <AdminReportMap report={report} radiusMeters={alertRadius} />
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p>正確な位置: 赤 / 公開位置: 青 / 通知範囲: 赤い円</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">通知範囲</h3>
              <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">半径 {formatRadiusJapanese(alertRadius)}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">この範囲内の登録者に通知されます</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {radiusOptions.map((radius) => (
                <button
                  key={radius}
                  type="button"
                  onClick={() => setAlertRadius(radius)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    alertRadius === radius ? 'bg-red-600 text-white' : 'border border-slate-200 text-slate-700'
                  }`}
                >
                  {formatRadiusJapanese(radius)}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">半径</label>
              <input
                type="number"
                value={alertRadius}
                onChange={(event) => setAlertRadius(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">This radius controls which registered users receive the alert.</p>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">通知メッセージ</label>
              <textarea
                value={alertMessage}
                onChange={(event) => setAlertMessage(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              />
            </div>
            <div className="mt-4">
              <AlertPreviewCard radiusMeters={alertRadius} message={alertMessage} />
            </div>
            <button
              type="button"
              onClick={() => setAlertDialogOpen(true)}
              className="mt-4 w-full rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white"
            >
              LINE通知を送信
            </button>
            {alertStatus ? <p className="mt-3 text-sm text-slate-600">{alertStatus}</p> : null}
          </section>
        </div>
      </div>

      <SendAlertConfirmDialog
        open={alertDialogOpen}
        title="LINE通知を送信"
        description={`半径 ${formatRadiusJapanese(alertRadius)} の範囲に通知を送信します。よろしいですか。`}
        confirmLabel="通知を送信"
        onCancel={() => setAlertDialogOpen(false)}
        onConfirm={sendAlert}
        loading={sendingAlert}
      />

      <SendAlertConfirmDialog
        open={messageDialogOpen}
        title="通報者へ確認メッセージを送信"
        description="確認メッセージは監査ログに記録されます。内容を確認して送信してください。"
        confirmLabel="LINEで送信"
        onCancel={() => setMessageDialogOpen(false)}
        onConfirm={sendPrivateMessage}
        loading={sendingMessage}
      />
    </div>
  );
}
