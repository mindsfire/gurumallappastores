import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only protect /admin routes
  if (path.startsWith('/admin')) {
    // Allow the login page to be accessed publicly
    if (path === '/admin/login') {
      return NextResponse.next();
    }

    const cookie = request.cookies.get('gms_admin_session');
    
    // If no cookie, redirect to login
    if (!cookie?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Verify the JWT token
    const payload = await verifySession(cookie.value);
    
    // If invalid token, redirect to login
    if (!payload) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
