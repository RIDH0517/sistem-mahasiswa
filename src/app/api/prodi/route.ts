import { NextResponse } from 'next/server';
import type { ResultSetHeader } from 'mysql2';
import { db } from '@/lib/db';
import {
  badRequest,
  dbErrorCode,
  guardRequest,
  parseId,
  readBody,
  validateProdi,
} from '@/lib/api-validation';

function handleDbError(error: unknown, dupMessage: string) {
  if (dbErrorCode(error) === 'ER_DUP_ENTRY') return badRequest(dupMessage);
  console.error('[api/prodi]', error);
  return badRequest('Terjadi kesalahan pada server.', 500);
}

// CREATE Prodi Baru
export async function POST(request: Request) {
  const denied = await guardRequest(request);
  if (denied) return denied;

  const body = await readBody(request);
  if (!body) return badRequest('Body request tidak valid.');
  const parsed = validateProdi(body);
  if (!parsed.ok) return badRequest(parsed.error);
  const data = parsed.data;

  try {
    await db.query('INSERT INTO prodi (kode_prodi, nama_prodi, jenjang) VALUES (?, ?, ?)', [
      data.kode_prodi,
      data.nama_prodi,
      data.jenjang,
    ]);
    return NextResponse.json({ message: 'Program Studi berhasil ditambahkan!' });
  } catch (e) {
    return handleDbError(e, 'Kode Prodi sudah ada!');
  }
}

// UPDATE Prodi
export async function PUT(request: Request) {
  const denied = await guardRequest(request);
  if (denied) return denied;

  const body = await readBody(request);
  if (!body) return badRequest('Body request tidak valid.');
  const id = parseId(body);
  if (!id) return badRequest('ID program studi tidak valid.');
  const parsed = validateProdi(body);
  if (!parsed.ok) return badRequest(parsed.error);
  const data = parsed.data;

  try {
    const [result] = await db.query<ResultSetHeader>(
      'UPDATE prodi SET kode_prodi = ?, nama_prodi = ?, jenjang = ? WHERE id = ?',
      [data.kode_prodi, data.nama_prodi, data.jenjang, id]
    );
    if (result.affectedRows === 0) return badRequest('Program studi tidak ditemukan.', 404);
    return NextResponse.json({ message: 'Program Studi berhasil diperbarui!' });
  } catch (e) {
    return handleDbError(e, 'Kode Prodi sudah dipakai!');
  }
}

// DELETE Prodi
export async function DELETE(request: Request) {
  const denied = await guardRequest(request);
  if (denied) return denied;

  const body = await readBody(request);
  const id = body ? parseId(body) : null;
  if (!id) return badRequest('ID program studi tidak valid.');

  try {
    const [result] = await db.query<ResultSetHeader>('DELETE FROM prodi WHERE id = ?', [id]);
    if (result.affectedRows === 0) return badRequest('Program studi tidak ditemukan.', 404);
    return NextResponse.json({ message: 'Program Studi berhasil dihapus!' });
  } catch (e) {
    const code = dbErrorCode(e);
    if (code === 'ER_ROW_IS_REFERENCED_2' || code === 'ER_ROW_IS_REFERENCED') {
      return badRequest('Prodi tidak bisa dihapus karena masih memiliki mahasiswa aktif!');
    }
    console.error('[api/prodi]', e);
    return badRequest('Gagal menghapus program studi.', 500);
  }
}
