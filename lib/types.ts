import {
  DangerLevel,
  FollowUpStatus,
  ReportStatus,
  ReporterContactStatus,
} from '@prisma/client';
import { z } from 'zod';

export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const UpdateReportStatusSchema = z.object({
  status: z.nativeEnum(ReportStatus).optional(),
  dangerLevel: z.nativeEnum(DangerLevel).optional(),
  adminNote: z.string().trim().max(1000).optional(),
  followUpStatus: z.nativeEnum(FollowUpStatus).optional(),
});

export const SendAlertSchema = z.object({
  radiusMeters: z.coerce.number().int().min(100).max(5000),
  message: z.string().trim().min(1).max(500),
}).or(
  z.object({
    radiusM: z.coerce.number().int().min(100).max(5000),
    message: z.string().trim().min(1).max(500),
  }).transform((value) => ({
    radiusMeters: value.radiusM,
    message: value.message,
  }))
);

export const PrivateMessageSchema = z.object({
  message: z.string().trim().min(1, 'メッセージを入力してください。').max(500, '500文字以内で入力してください。'),
});

export const ReporterSafeQuerySchema = z.object({
  includeFullLineId: z.coerce.boolean().optional(),
});

export const ReporterContactStatusSchema = z.nativeEnum(ReporterContactStatus);
