import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession, getSession } from './lib/auth';

export async function proxy(request: NextRequest) {
  // Update session expiration if valid
  await updateSession(request);

  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
