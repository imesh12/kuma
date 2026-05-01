import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { AdminRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.JWT_SECRET || 'supersecret_jwt_key_for_local_dev';
const key = new TextEncoder().encode(secretKey);

type SessionPayload = {
  adminId: string;
  role: AdminRole;
  expires?: string | number | Date;
};

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as unknown as SessionPayload;
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('kuma_admin_session')?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('kuma_admin_session')?.value;
  if (!session) return;

  try {
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
      name: 'kuma_admin_session',
      value: await encrypt(parsed),
      httpOnly: true,
      expires: parsed.expires,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return res;
  } catch {
    return;
  }
}
