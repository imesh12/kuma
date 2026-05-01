import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrivateMessageSchema } from '@/lib/types';
import { sendLineMessageToReporter } from '@/lib/line/send-line-message-to-reporter';
import { createAuditLog } from '@/lib/server/audit';
import { canSendReporterMessage, requireAdminSession } from '@/lib/server/admin';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 });
  }

  if (!canSendReporterMessage(session.role)) {
    return NextResponse.json({ error: 'この操作を実行する権限がありません。' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = PrivateMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: '入力内容を確認してください。', details: parsed.error.flatten() }, { status: 400 });
  }

  const report = await prisma.bearReport.findUnique({
    where: { id },
    include: {
      reporter: true,
    },
  });

  if (!report || !report.reporter) {
    return NextResponse.json({ error: '通報者情報が見つかりません。' }, { status: 404 });
  }

  if (!report.reporterContactAllowed || !report.reporter.contactConsent || report.reporter.contactStatus !== 'CONTACTABLE') {
    return NextResponse.json({ error: '通報者へ連絡できる状態ではありません。' }, { status: 400 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.privateMessage.count({
    where: {
      reportId: report.id,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (recentCount >= 3) {
    return NextResponse.json({ error: '1時間あたり3件までに制限されています。' }, { status: 429 });
  }

  const delivery = await sendLineMessageToReporter(report.reporter.lineUserId, parsed.data.message);
  const sentAt = delivery.sentAt ?? new Date();

  const [message] = await prisma.$transaction([
    prisma.privateMessage.create({
      data: {
        reportId: report.id,
        reporterId: report.reporter.id,
        senderAdminId: session.adminId,
        senderRole: session.role,
        channel: 'LINE',
        message: parsed.data.message,
        status: delivery.ok ? 'SENT' : 'FAILED',
        sentAt: delivery.ok ? sentAt : null,
      },
    }),
    prisma.bearReport.update({
      where: { id: report.id },
      data: {
        followUpStatus: 'MESSAGE_SENT',
      },
    }),
  ]);

  await createAuditLog({
    adminId: session.adminId,
    action: 'SEND_PRIVATE_MESSAGE',
    targetType: 'PrivateMessage',
    targetId: message.id,
    afterData: {
      reportId: report.id,
      status: message.status,
    },
  });

  return NextResponse.json({
    success: true,
    message: {
      id: message.id,
      status: message.status,
      sentAt: message.sentAt,
      createdAt: message.createdAt,
      body: message.message,
    },
  });
}
