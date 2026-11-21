import { NextResponse } from 'next/server';
import type { ResultSetHeader } from 'mysql2';
import { db } from '@/lib/db';
import {
  badRequest,
  dbErrorCode,
  guardRequest,
  parseId,
  readBody,
  validateMahasiswa,
} from '@/lib/api-validation';

function handleDbError(error: unknown, dupMessage: string) {
  const code = dbErrorCode(error);
  if (code === 'ER_DUP_ENTRY') return badRequest(dupMessage);
  if (code === 'ER_NO_REFERENCED_ROW_2') return badRequest('Program studi tidak ditemukan.');
  console.error('[api/mahasiswa]', error);
  return badRequest('Terjadi kesalahan pada server.', 500);
}

// CREATE Mahasiswa Baru
export async function POST(request: Request) {
  const denied = await guardRequest(request);
  if (denied) return denied;

  const body = await readBody(request);
  if (!body) return badRequest('Body request tidak valid.');
  const parsed = validateMahasiswa(body);
  if (!parsed.ok) return badRequest(parsed.error);
  const data = parsed.data;

  try {
    await db.query(
      'INSERT INTO mahasiswa (nim, nama, email, jenis_kelamin, angkatan, prodi_id) VALUES (?, ?, ?, ?, ?, ?)',
      [data.nim, data.nama, data.email, data.jenis_kelamin, data.angkatan, data.prodi_id]
    );
    return NextResponse.json({ message: 'Data mahasiswa berhasil ditambahkan!' });
  } catch (e) {
    return handleDbError(e, 'NIM atau Email sudah terdaftar!');
  }
}

// UPDATE Mahasiswa
export async function PUT(request: Request) {
  const denied = await guardRequest(request);
  if (denied) return denied;

  const body = await readBody(request);
  if (!body) return badRequest('Body request tidak valid.');
  const id = parseId(body);
  if (!id) return badRequest('ID mahasiswa tidak valid.');
  const parsed = validateMahasiswa(body);
  if (!parsed.ok) return badRequest(parsed.error);
  const data = parsed.data;

  try {
    const [result] = await db.query<ResultSetHeader>(
      'UPDATE mahasiswa SET nim = ?, nama = ?, email = ?, jenis_kelamin = ?, angkatan = ?, prodi_id = ? WHERE id = ?',
      [data.nim, data.nama, data.email, data.jenis_kelamin, data.angkatan, data.prodi_id, id]
    );
    if (result.affectedRows === 0) return badRequest('Data mahasiswa tidak ditemukan.', 404);
    return NextResponse.json({ message: 'Data mahasiswa berhasil diperbarui!' });
  } catch (e) {
    return handleDbError(e, 'NIM atau Email sudah digunakan mahasiswa lain!');
  }
}

// DELETE Mahasiswa
export async function DELETE(request: Request) {
  const denied = await guardRequest(request);
  if (denied) return denied;

  const body = await readBody(request);
  const id = body ? parseId(body) : null;
  if (!id) return badRequest('ID mahasiswa tidak valid.');

  try {
    const [result] = await db.query<ResultSetHeader>('DELETE FROM mahasiswa WHERE id = ?', [id]);
    if (result.affectedRows === 0) return badRequest('Data mahasiswa tidak ditemukan.', 404);
    return NextResponse.json({ message: 'Data mahasiswa berhasil dihapus!' });
  } catch (e) {
    console.error('[api/mahasiswa]', e);
    return badRequest('Gagal menghapus data mahasiswa.', 500);
  }
}
