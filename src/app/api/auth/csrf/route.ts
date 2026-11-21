import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  CSRF_COOKIE_NAME,
  generateCsrfToken,
  getSessionUser,
} from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const sessionUser = await getSessionUser();

  if (existingCookie && existingCookie.includes('.')) {
    const [rawToken] = existingCookie.split('.');
    return NextResponse.json({
      csrfToken: rawToken,
      authenticated: !!sessionUser,
      user: sessionUser,
    });
  }

  const { rawToken, signedToken } = generateCsrfToken();
  const response = NextResponse.json({
    csrfToken: rawToken,
    authenticated: !!sessionUser,
    user: sessionUser,
  });

  response.cookies.set(CSRF_COOKIE_NAME, signedToken, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
  });

  return response;
}