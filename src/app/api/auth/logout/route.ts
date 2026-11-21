import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifyCsrfToken } from '@/lib/auth';

export async function POST(request: Request) {
  const isCsrfValid = await verifyCsrfToken(request);
  if (!isCsrfValid) {
    return NextResponse.json({ error: 'Token CSRF tidak valid.' }, { status: 403 });
  }

  const response = NextResponse.json({ message: 'Berhasil logout' });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}