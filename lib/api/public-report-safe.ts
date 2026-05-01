import { BearReport } from '@prisma/client';
import {
  buildReportDescription,
  buildReportTitle,
  reportStatusLabels,
  reportTypeLabels,
  severityLabels,
  sourceTypeLabels,
} from '@/lib/reporting';

export function toPublicSafeReport(report: BearReport) {
  return {
    id: report.id,
    title: buildReportTitle(report),
    description: buildReportDescription(report),
    prefecture: report.prefecture,
    municipality: report.municipality,
    address: report.address,
    publicLat: report.publicLat,
    publicLng: report.publicLng,
    status: report.status,
    statusLabel: reportStatusLabels[report.status],
    sourceType: report.sourceType,
    sourceTypeLabel: sourceTypeLabels[report.sourceType],
    severity: report.dangerLevel,
    severityLabel: severityLabels[report.dangerLevel],
    sightedAt: report.sightedAt ?? report.createdAt,
    imageUrl: report.imageUrl ?? report.photoUrl,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    type: report.type,
    typeLabel: reportTypeLabels[report.type],
    locationLabel: [report.prefecture, report.municipality].filter(Boolean).join(' / ') || '位置情報調整済み',
  };
}
