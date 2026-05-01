import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toAdminReport } from '@/lib/api/admin-report-transform';
import { requireAdminSession } from '@/lib/server/admin';

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const limit = Number.parseInt(searchParams.get('limit') || '20', 10);
  const skip = (page - 1) * limit;

  const [reports, total, alertCount] = await Promise.all([
    prisma.bearReport.findMany({
      skip,
      take: limit,
      orderBy: [{ createdAt: 'desc' }],
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
    }),
    prisma.bearReport.count(),
    prisma.alert.count(),
  ]);

  const stats = {
    totalReports: total,
    todayReports: reports.filter((report) => {
      const createdAt = new Date(report.createdAt);
      const now = new Date();
      return createdAt.toDateString() === now.toDateString();
    }).length,
    pendingReview: reports.filter((report) => report.status === 'UNVERIFIED' || report.status === 'CHECKING').length,
    highRisk: reports.filter((report) => report.dangerLevel === 'LEVEL_3' || report.dangerLevel === 'LEVEL_4').length,
    alertsSent: alertCount,
  };

  return NextResponse.json({
    reports: reports.map(toAdminReport),
    stats,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
