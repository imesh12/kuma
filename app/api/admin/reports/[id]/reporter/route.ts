import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { followUpStatusLabels, reporterContactStatusLabels } from '@/lib/reporting';
import { canViewFullLineUserId, requireAdminSession } from '@/lib/server/admin';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 });
  }

  const { id } = await params;
  const report = await prisma.bearReport.findUnique({
    where: { id },
    include: {
      reporter: true,
    },
  });

  if (!report || !report.reporter) {
    return NextResponse.json({ error: '通報者情報が見つかりません。' }, { status: 404 });
  }

  const includeFull = canViewFullLineUserId(session.role) && new URL(request.url).searchParams.get('includeFullLineId') === 'true';

  return NextResponse.json({
    reporter: {
      id: report.reporter.id,
      displayName: report.reporter.displayName || '匿名ユーザー',
      lineUserId: includeFull ? report.reporter.lineUserId : undefined,
      maskedLineUserId: report.reporter.maskedLineUserId,
      contactConsent: report.reporter.contactConsent,
      contactStatus: report.reporter.contactStatus,
      contactStatusLabel: reporterContactStatusLabels[report.reporter.contactStatus],
      followUpStatus: report.followUpStatus,
      followUpStatusLabel: followUpStatusLabels[report.followUpStatus],
      reporterContactAllowed: report.reporterContactAllowed,
    },
  });
}
