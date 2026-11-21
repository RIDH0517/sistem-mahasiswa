import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyCsrfToken, getSessionUser } from '@/lib/auth';

// CREATE Mahasiswa Baru
export async function POST(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return NextResponse.json({ error: 'Token CSRF tidak valid!' }, { status: 403 });
  }
  if (!(await getSessionUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { nim, nama, email, jenis_kelamin, angkatan, prodi_id } = await request.json();
    await db.query(
      'INSERT INTO mahasiswa (nim, nama, email, jenis_kelamin, angkatan, prodi_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nim, nama, email, jenis_kelamin, Number(angkatan), Number(prodi_id)]
    );
    return NextResponse.json({ message: 'Data mahasiswa berhasil ditambahkan!' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.code === 'ER_DUP_ENTRY' ? 'NIM atau Email sudah terdaftar!' : error.message },
      { status: 400 }
    );
  }
}

// UPDATE Mahasiswa
export async function PUT(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return NextResponse.json({ error: 'Token CSRF tidak valid!' }, { status: 403 });
  }
  if (!(await getSessionUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, nim, nama, email, jenis_kelamin, angkatan, prodi_id } = await request.json();
    await db.query(
      'UPDATE mahasiswa SET nim = ?, nama = ?, email = ?, jenis_kelamin = ?, angkatan = ?, prodi_id = ? WHERE id = ?',
      [nim, nama, email, jenis_kelamin, Number(angkatan), Number(prodi_id), Number(id)]
    );
    return NextResponse.json({ message: 'Data mahasiswa berhasil diperbarui!' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.code === 'ER_DUP_ENTRY' ? 'NIM atau Email sudah digunakan mahasiswa lain!' : error.message },
      { status: 400 }
    );
  }
}

// DELETE Mahasiswa
export async function DELETE(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return NextResponse.json({ error: 'Token CSRF tidak valid!' }, { status: 403 });
  }
  if (!(await getSessionUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    await db.query('DELETE FROM mahasiswa WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'Data mahasiswa berhasil dihapus!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}