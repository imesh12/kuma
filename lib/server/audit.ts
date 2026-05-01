import { prisma } from '@/lib/prisma';

export async function createAuditLog(input: {
  adminId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  beforeData?: unknown;
  afterData?: unknown;
}) {
  return prisma.auditLog.create({
    data: {
      adminId: input.adminId ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      beforeData: input.beforeData === undefined ? null : JSON.stringify(input.beforeData),
      afterData: input.afterData === undefined ? null : JSON.stringify(input.afterData),
    },
  });
}
