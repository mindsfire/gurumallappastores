import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // In a real production app, passwords should be hashed in a DB.
    // Since this is a simple 2-user setup, we use an env var in the format: "user1:pass1,user2:pass2"
    const adminUsersString = process.env.ADMIN_CREDENTIALS || "admin1:admin123,admin2:admin456";
    
    // Parse the credentials
    const validUsers = adminUsersString.split(',').map(pair => {
      const [u, p] = pair.split(':');
      return { username: u, password: p };
    });

    const isValidUser = validUsers.find(
      (user) => user.username === username && user.password === password
    );

    if (!isValidUser) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Create JWT token
    const token = await createSession(username);

    // Create the response and set the cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: 'gms_admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12 // 12 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to process login' }, { status: 500 });
  }
}
