import {
  DangerLevel,
  FollowUpStatus,
  ReportStatus,
  ReportType,
  ReporterContactStatus,
  SourceType,
} from '@prisma/client';

export const reportTypeLabels: Record<ReportType, string> = {
  BEAR_SEEN: 'クマ目撃',
  FOOTPRINT: '足跡',
  DROPPING: 'ふん・痕跡',
  CROP_DAMAGE: '農作物被害',
  ROAD_NEARBY: '道路付近',
  SCHOOL_OR_HOUSE_NEARBY: '住宅・学校付近',
  OTHER_DANGER: 'その他の危険',
};

export const reportStatusLabels: Record<ReportStatus, string> = {
  UNVERIFIED: '未確認',
  CHECKING: '審査中',
  APPROVED: '確認済み',
  MISTAKEN: '誤認',
  FALSE_REPORT: '虚偽報告',
  DANGEROUS: '緊急対応',
  RESOLVED: '対応完了',
};

export const severityLabels: Record<DangerLevel, string> = {
  LEVEL_1: '低',
  LEVEL_2: '注意',
  LEVEL_3: '高',
  LEVEL_4: '重大',
};

export const sourceTypeLabels: Record<SourceType, string> = {
  LINE: 'LINE通報',
  PHONE: '電話',
  WEB: 'Webフォーム',
  CITY: '自治体',
  POLICE: '警察',
  SENSOR: 'センサー',
  OTHER: 'その他',
};

export const trustLevelLabels = {
  high: '高信頼',
  medium: '通常',
  low: '要確認',
} as const;

export const reporterContactStatusLabels: Record<ReporterContactStatus, string> = {
  CONTACTABLE: '連絡可能',
  NO_CONSENT: '同意なし',
  BLOCKED: '連絡停止',
  UNKNOWN: '不明',
};

export const followUpStatusLabels: Record<FollowUpStatus, string> = {
  NOT_NEEDED: '不要',
  NEEDS_CONTACT: '要確認',
  MESSAGE_SENT: '送信済み',
  REPLIED: '返信あり',
  RESOLVED: '完了',
};

export function formatTrustLevel(trustScore: number) {
  if (trustScore >= 15) {
    return { value: 'high', label: trustLevelLabels.high };
  }

  if (trustScore >= 5) {
    return { value: 'medium', label: trustLevelLabels.medium };
  }

  return { value: 'low', label: trustLevelLabels.low };
}

export function buildReportTitle(input: { title?: string | null; type: ReportType }) {
  return input.title?.trim() || reportTypeLabels[input.type];
}

export function buildReportDescription(input: { description?: string | null; memo?: string | null }) {
  return input.description?.trim() || input.memo?.trim() || '詳細情報は確認中です。';
}

export function formatRadiusJapanese(radiusMeters: number) {
  if (radiusMeters >= 1000) {
    const km = radiusMeters / 1000;
    return `${Number.isInteger(km) ? km : km.toFixed(1)}km`;
  }

  return `${radiusMeters}m`;
}

export function maskLineUserId(lineUserId: string) {
  if (lineUserId.length <= 8) {
    return lineUserId;
  }

  return `${lineUserId.slice(0, 5)}...${lineUserId.slice(-4)}`;
}
