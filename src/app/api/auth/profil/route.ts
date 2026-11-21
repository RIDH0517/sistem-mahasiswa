import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dbErrorCode } from '@/lib/api-validation';
import { verifyCsrfToken, getSessionUser } from '@/lib/auth';

export async function PUT(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return NextResponse.json({ error: 'Token CSRF tidak valid!' }, { status: 403 });
  }
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const nama = String(body.nama_lengkap ?? '').trim();
    const email = String(body.email ?? '').trim();

    if (!nama || nama.length > 100) {
      return NextResponse.json(
        { error: 'Nama lengkap wajib diisi (maks. 100 karakter).' },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
      return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
    }

    await db.query('UPDATE users SET nama_lengkap = ?, email = ? WHERE id = ?', [
      nama,
      email,
      session.userId,
    ]);
    return NextResponse.json({ message: 'Profil berhasil diperbarui!' });
  } catch (error: unknown) {
    if (dbErrorCode(error) === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Email sudah dipakai pengguna lain!' }, { status: 400 });
    }
    console.error('[api/auth/profil]', error);
    return NextResponse.json({ error: 'Gagal memperbarui profil.' }, { status: 500 });
  }
}
