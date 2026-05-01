import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';
import { AdminLoginSchema } from '@/lib/types';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = AdminLoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, password } = result.data;
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || admin.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ adminId: admin.id, role: admin.role, expires });

    const cookieStore = await cookies();
    cookieStore.set('kuma_admin_session', session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return NextResponse.json({ success: true, admin: { id: admin.id, name: admin.name, role: admin.role } });
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
