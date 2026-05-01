import { AdminRole } from '@prisma/client';
import { getSession } from '@/lib/auth';

export type AdminSession = {
  adminId: string;
  role: AdminRole;
  expires?: string | number | Date;
};

export async function requireAdminSession() {
  const session = await getSession();
  if (!session?.adminId || !session?.role) {
    return null;
  }

  return session as AdminSession;
}

export function canViewFullLineUserId(role: AdminRole) {
  return role === 'SUPER_ADMIN';
}

export function canSendReporterMessage(role: AdminRole) {
  return role === 'SUPER_ADMIN' || role === 'CITY_ADMIN' || role === 'POLICE_ADMIN';
}
