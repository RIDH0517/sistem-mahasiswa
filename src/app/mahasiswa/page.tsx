import { connection } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { db } from '@/lib/db';
import MahasiswaTableClient, { MahasiswaRow, ProdiOption } from './MahasiswaTableClient';

interface MahasiswaQueryRow extends RowDataPacket {
  id: number;
  nim: string;
  nama: string;
  email: string;
  jenis_kelamin: 'L' | 'P';
  angkatan: number;
  prodi_id: number;
  created_at: Date | string | null;
  nama_prodi: string;
  kode_prodi: string;
  jenjang: string;
}

export default async function MahasiswaPage() {
  await connection();

  const [[mhsRows], [prodiRows]] = await Promise.all([
    db.query<MahasiswaQueryRow[]>(`
      SELECT m.id, m.nim, m.nama, m.email, m.jenis_kelamin, m.angkatan, m.prodi_id, m.created_at, p.nama_prodi, p.kode_prodi, p.jenjang
      FROM mahasiswa m
      INNER JOIN prodi p ON m.prodi_id = p.id
      ORDER BY m.nim ASC
    `),
    db.query<RowDataPacket[]>('SELECT id, kode_prodi, nama_prodi FROM prodi ORDER BY id ASC'),
  ]);

  const initialData: MahasiswaRow[] = mhsRows.map((row) => ({
    id: row.id,
    nim: row.nim,
    nama: row.nama,
    email: row.email,
    jenis_kelamin: row.jenis_kelamin,
    angkatan: row.angkatan,
    prodi_id: row.prodi_id,
    nama_prodi: row.nama_prodi,
    kode_prodi: row.kode_prodi,
    jenjang: row.jenjang,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
  }));

  return (
    <MahasiswaTableClient
      initialData={initialData}
      prodiOptions={prodiRows as unknown as ProdiOption[]}
    />
  );
}
