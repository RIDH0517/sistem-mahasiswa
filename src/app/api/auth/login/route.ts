import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  verifyCsrfToken,
  hashPassword,
  createSessionValue,
  SESSION_COOKIE_NAME,
} from '@/lib/auth';

export async function POST(request: Request) {
  // 1. Validasi Keamanan CSRF
  const isCsrfValid = await verifyCsrfToken(request);
  if (!isCsrfValid) {
    return NextResponse.json(
      { error: 'Token CSRF tidak valid atau kadaluarsa. Silakan muat ulang halaman.' },
      { status: 403 }
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const hashedInput = hashPassword(password);

    const [rows] = await db.query<any[]>(
      'SELECT id, username, nama_lengkap, email FROM users WHERE (username = ? OR email = ?) AND password_hash = ? LIMIT 1',
      [username, username, hashedInput]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Username/email atau password salah.' },
        { status: 401 }
      );
    }

    const user = rows[0];
    const sessionToken = createSessionValue(user.id, user.username);

    const response = NextResponse.json({
      message: 'Login berhasil',
      user: { id: user.id, username: user.username, nama: user.nama_lengkap },
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 hari
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan server: ' + error.message },
      { status: 500 }
    );
  }
}