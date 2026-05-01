import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SendAlertSchema } from '@/lib/types';
import { calculateDistance, getDirectionJapanese } from '@/lib/utils';
import { buildReportTitle, severityLabels } from '@/lib/reporting';
import { createAuditLog } from '@/lib/server/audit';
import { requireAdminSession } from '@/lib/server/admin';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = SendAlertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: '入力内容を確認してください。', details: parsed.error.flatten() }, { status: 400 });
  }

  const report = await prisma.bearReport.findUnique({
    where: { id },
  });

  if (!report) {
    return NextResponse.json({ error: '通報が見つかりません。' }, { status: 404 });
  }

  const users = await prisma.user.findMany({
    where: {
      registeredLat: { not: null },
      registeredLng: { not: null },
      accountStatus: 'ACTIVE',
    },
  });

  const nearbyUsers = users.filter((user) => {
    if (user.registeredLat === null || user.registeredLng === null) {
      return false;
    }

    return calculateDistance(report.realLat, report.realLng, user.registeredLat, user.registeredLng) <= parsed.data.radiusMeters;
  });

  const alert = await prisma.alert.create({
    data: {
      reportId: report.id,
      title: `${buildReportTitle(report)}の注意情報`,
      message: parsed.data.message,
      radiusMeters: parsed.data.radiusMeters,
      sentByAdminId: session.adminId,
      targetCount: nearbyUsers.length,
      successCount: nearbyUsers.length,
      failedCount: 0,
      alertLevel: report.dangerLevel,
    },
  });

  if (nearbyUsers.length > 0) {
    await prisma.alertRecipient.createMany({
      data: nearbyUsers.map((user) => ({
        alertId: alert.id,
        userId: user.id,
        distanceM: calculateDistance(report.realLat, report.realLng, user.registeredLat!, user.registeredLng!),
        direction: getDirectionJapanese(user.registeredLat!, user.registeredLng!, report.realLat, report.realLng),
        lineDeliveryStatus: 'READY_FOR_LINE',
        sentAt: new Date(),
      })),
    });
  }

  await createAuditLog({
    adminId: session.adminId,
    action: 'SEND_ALERT',
    targetType: 'Alert',
    targetId: alert.id,
    afterData: {
      reportId: report.id,
      radiusMeters: parsed.data.radiusMeters,
      targetCount: nearbyUsers.length,
      severity: severityLabels[report.dangerLevel],
    },
  });

  return NextResponse.json({
    success: true,
    alert: {
      id: alert.id,
      sentAt: alert.sentAt,
      radiusMeters: alert.radiusMeters,
      targetCount: alert.targetCount,
      successCount: alert.successCount,
      failedCount: alert.failedCount,
    },
    recipientCount: nearbyUsers.length,
    message: 'LINE通知キューを登録しました。',
  });
}
