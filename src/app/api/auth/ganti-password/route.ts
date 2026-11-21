import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { db } from '@/lib/db';
import { verifyCsrfToken, getSessionUser, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  // 1. Validasi CSRF
  const isCsrfValid = await verifyCsrfToken(request);
  if (!isCsrfValid) {
    return NextResponse.json(
      { error: 'Token keamanan CSRF tidak valid!' },
      { status: 403 }
    );
  }

  // 2. Cek Sesi Login
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json(
      { error: 'Sesi Anda telah berakhir. Silakan login kembali.' },
      { status: 401 }
    );
  }

  try {
    const { oldPassword, newPassword, confirmPassword } = await request.json();

    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Semua kolom password wajib diisi.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password baru minimal harus 6 karakter.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Konfirmasi password baru tidak cocok.' },
        { status: 400 }
      );
    }

    const oldHash = hashPassword(oldPassword);
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? AND password_hash = ? LIMIT 1',
      [sessionUser.userId, oldHash]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Password saat ini salah!' },
        { status: 400 }
      );
    }

    const newHash = hashPassword(newPassword);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      newHash,
      sessionUser.userId,
    ]);

    return NextResponse.json({ message: 'Password berhasil diperbarui!' });
  } catch (error: unknown) {
    console.error('[api/auth/ganti-password]', error);
    return NextResponse.json(
      { error: 'Gagal mengubah password. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
