import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isApiRoute = path.startsWith('/api/admin');
  const isAdminPage = path.startsWith('/admin') && !isApiRoute;

  if (isApiRoute || isAdminPage) {
    if (path === '/admin/login') {
      return NextResponse.next();
    }

    const cookie = request.cookies.get('gms_admin_session');
    const isAuthenticated = cookie?.value ? await verifySession(cookie.value) : null;

    if (!isAuthenticated) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
