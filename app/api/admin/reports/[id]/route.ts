import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateReportStatusSchema } from '@/lib/types';
import { toAdminReport } from '@/lib/api/admin-report-transform';
import { createAuditLog } from '@/lib/server/audit';
import { requireAdminSession } from '@/lib/server/admin';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 });
  }

  const { id } = await params;
  const report = await prisma.bearReport.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          trustScore: true,
          maskedLineUserId: true,
          contactConsent: true,
          contactStatus: true,
        },
      },
      reporter: {
        select: {
          id: true,
          displayName: true,
          maskedLineUserId: true,
          contactConsent: true,
          contactStatus: true,
        },
      },
      alerts: {
        orderBy: { sentAt: 'desc' },
        take: 1,
        select: {
          id: true,
          sentAt: true,
          targetCount: true,
          successCount: true,
          failedCount: true,
        },
      },
      privateMessages: {
        select: {
          id: true,
          reportId: true,
          reporterId: true,
          senderAdminId: true,
          senderRole: true,
          channel: true,
          message: true,
          status: true,
          sentAt: true,
          deliveredAt: true,
          readAt: true,
          repliedAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ error: '通報が見つかりません。' }, { status: 404 });
  }

  return NextResponse.json({ report: toAdminReport(report) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateReportStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: '入力内容を確認してください。', details: parsed.error.flatten() }, { status: 400 });
  }

  const currentReport = await prisma.bearReport.findUnique({ where: { id } });
  if (!currentReport) {
    return NextResponse.json({ error: '通報が見つかりません。' }, { status: 404 });
  }

  const updateData: {
    status?: typeof currentReport.status;
    dangerLevel?: typeof currentReport.dangerLevel;
    adminNote?: string;
    followUpStatus?: typeof currentReport.followUpStatus;
    approvedAt?: Date;
    approvedByAdminId?: string;
  } = {};

  if (parsed.data.status) updateData.status = parsed.data.status;
  if (parsed.data.dangerLevel) updateData.dangerLevel = parsed.data.dangerLevel;
  if (parsed.data.followUpStatus) updateData.followUpStatus = parsed.data.followUpStatus;
  if (parsed.data.adminNote !== undefined) updateData.adminNote = parsed.data.adminNote;

  if (parsed.data.status === 'APPROVED' && currentReport.status !== 'APPROVED') {
    updateData.approvedAt = new Date();
    updateData.approvedByAdminId = session.adminId;
  }

  const report = await prisma.bearReport.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          trustScore: true,
          maskedLineUserId: true,
          contactConsent: true,
          contactStatus: true,
        },
      },
      reporter: {
        select: {
          id: true,
          displayName: true,
          maskedLineUserId: true,
          contactConsent: true,
          contactStatus: true,
        },
      },
      alerts: {
        orderBy: { sentAt: 'desc' },
        take: 1,
        select: {
          id: true,
          sentAt: true,
          targetCount: true,
          successCount: true,
          failedCount: true,
        },
      },
      privateMessages: {
        select: { id: true },
      },
    },
  });

  await createAuditLog({
    adminId: session.adminId,
    action: 'UPDATE_REPORT',
    targetType: 'BearReport',
    targetId: report.id,
    beforeData: currentReport,
    afterData: report,
  });

  return NextResponse.json({ report: toAdminReport(report) });
}
