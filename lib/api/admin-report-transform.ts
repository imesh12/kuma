import { BearReport, User } from '@prisma/client';
import {
  buildReportDescription,
  buildReportTitle,
  followUpStatusLabels,
  formatTrustLevel,
  reportStatusLabels,
  reportTypeLabels,
  reporterContactStatusLabels,
  severityLabels,
  sourceTypeLabels,
} from '@/lib/reporting';

type ReportWithRelations = BearReport & {
  user?: Pick<User, 'id' | 'displayName' | 'trustScore' | 'maskedLineUserId' | 'contactConsent' | 'contactStatus'> | null;
  reporter?: Pick<User, 'id' | 'displayName' | 'maskedLineUserId' | 'contactConsent' | 'contactStatus'> | null;
  alerts?: Array<{ id: string; sentAt: Date; targetCount: number; successCount: number; failedCount: number }>;
  privateMessages?: Array<{ id: string }>;
};

export function toAdminReport(report: ReportWithRelations) {
  const trust = formatTrustLevel(report.user?.trustScore ?? 0);

  return {
    id: report.id,
    title: buildReportTitle(report),
    description: buildReportDescription(report),
    prefecture: report.prefecture,
    municipality: report.municipality,
    address: report.address,
    realLat: report.realLat,
    realLng: report.realLng,
    publicLat: report.publicLat,
    publicLng: report.publicLng,
    status: report.status,
    statusLabel: reportStatusLabels[report.status],
    sourceType: report.sourceType,
    sourceTypeLabel: sourceTypeLabels[report.sourceType],
    trustLevel: trust.value,
    trustLevelLabel: trust.label,
    trustScore: report.user?.trustScore ?? 0,
    severity: report.dangerLevel,
    severityLabel: severityLabels[report.dangerLevel],
    sightedAt: report.sightedAt ?? report.createdAt,
    imageUrl: report.imageUrl ?? report.photoUrl,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    type: report.type,
    typeLabel: reportTypeLabels[report.type],
    adminNote: report.adminNote,
    reporterContactAllowed: report.reporterContactAllowed,
    followUpStatus: report.followUpStatus,
    followUpStatusLabel: followUpStatusLabels[report.followUpStatus],
    reporter: report.reporter
      ? {
          id: report.reporter.id,
          displayName: report.reporter.displayName || '匿名ユーザー',
          maskedLineUserId: report.reporter.maskedLineUserId,
          contactConsent: report.reporter.contactConsent,
          contactStatus: report.reporter.contactStatus,
          contactStatusLabel: reporterContactStatusLabels[report.reporter.contactStatus],
        }
      : null,
    latestAlert: report.alerts?.[0] ?? null,
    privateMessageCount: report.privateMessages?.length ?? 0,
  };
}
