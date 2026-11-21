import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { db } from '@/lib/db';
import { readBody } from '@/lib/api-validation';
import {
  CSRF_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  createSessionValue,
  generateCsrfToken,
  hashPassword,
  verifyCsrfToken,
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

  const body = await readBody(request);
  if (!body) {
    return NextResponse.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username dan password wajib diisi.' },
      { status: 400 }
    );
  }

  try {
    const hashedInput = hashPassword(password);

    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT id, username, nama_lengkap, email FROM users WHERE (username = ? OR email = ?) AND password_hash = ? LIMIT 1',
      [username, username, hashedInput]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Username/email atau password salah.' },
        { status: 401 }
      );
    }

    const user = rows[0] as { id: number; username: string; nama_lengkap: string };
    const sessionToken = createSessionValue(user.id, user.username);
    const { signedToken: rotatedCsrfCookie } = generateCsrfToken();

    const response = NextResponse.json({
      message: 'Login berhasil',
      user: { id: user.id, username: user.username, nama: user.nama_lengkap },
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 hari
    });

    response.cookies.set(CSRF_COOKIE_NAME, rotatedCsrfCookie, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('[api/auth/login]', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
