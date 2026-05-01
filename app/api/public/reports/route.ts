import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPublicSafeReport } from '@/lib/api/public-report-safe';

export async function GET() {
  const reports = await prisma.bearReport.findMany({
    where: {
      status: { in: ['APPROVED', 'DANGEROUS', 'CHECKING'] },
    },
    orderBy: [{ sightedAt: 'desc' }, { createdAt: 'desc' }],
    take: 200,
  });

  return NextResponse.json({
    reports: reports.map(toPublicSafeReport),
    meta: {
      count: reports.length,
      updatedAt: new Date().toISOString(),
      notice: '公開APIは位置情報をぼかして返します。',
    },
  });
}
