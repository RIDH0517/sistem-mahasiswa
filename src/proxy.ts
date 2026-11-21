import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionValue } from '@/lib/session';

// Guard sisi server: semua halaman (kecuali /login) butuh sesi valid.
// Request tanpa sesi dialihkan ke /login sebelum menyentuh database.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = verifySessionValue(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (pathname === '/login') {
    if (session) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Kecualikan API (sudah dicek di route masing-masing), aset Next.js, dan file publik/PWA
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)',
  ],
};
