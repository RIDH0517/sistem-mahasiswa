import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyCsrfToken, getSessionUser } from '@/lib/auth';

// CREATE Prodi Baru
export async function POST(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return NextResponse.json({ error: 'Token CSRF tidak valid!' }, { status: 403 });
  }
  if (!(await getSessionUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { kode_prodi, nama_prodi, jenjang } = await request.json();
    await db.query(
      'INSERT INTO prodi (kode_prodi, nama_prodi, jenjang) VALUES (?, ?, ?)',
      [kode_prodi.toUpperCase().trim(), nama_prodi.trim(), jenjang || 'S1']
    );
    return NextResponse.json({ message: 'Program Studi berhasil ditambahkan!' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.code === 'ER_DUP_ENTRY' ? 'Kode Prodi sudah ada!' : error.message },
      { status: 400 }
    );
  }
}

// UPDATE Prodi
export async function PUT(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return NextResponse.json({ error: 'Token CSRF tidak valid!' }, { status: 403 });
  }
  if (!(await getSessionUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, kode_prodi, nama_prodi, jenjang } = await request.json();
    await db.query(
      'UPDATE prodi SET kode_prodi = ?, nama_prodi = ?, jenjang = ? WHERE id = ?',
      [kode_prodi.toUpperCase().trim(), nama_prodi.trim(), jenjang, Number(id)]
    );
    return NextResponse.json({ message: 'Program Studi berhasil diperbarui!' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.code === 'ER_DUP_ENTRY' ? 'Kode Prodi sudah dipakai!' : error.message },
      { status: 400 }
    );
  }
}

// DELETE Prodi
export async function DELETE(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return NextResponse.json({ error: 'Token CSRF tidak valid!' }, { status: 403 });
  }
  if (!(await getSessionUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    await db.query('DELETE FROM prodi WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'Program Studi berhasil dihapus!' });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.code === 'ER_ROW_IS_REFERENCED_2'
            ? 'Prodi tidak bisa dihapus karena masih memiliki mahasiswa aktif!'
            : error.message,
      },
      { status: 400 }
    );
  }
}