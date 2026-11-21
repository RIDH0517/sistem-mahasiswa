import { connection } from 'next/server';
import { db } from '@/lib/db';
import MahasiswaTableClient, { MahasiswaRow, ProdiOption } from './MahasiswaTableClient';

export default async function MahasiswaPage() {
  await connection();

  const [mhsRows] = await db.query<any[]>(`
    SELECT m.id, m.nim, m.nama, m.email, m.jenis_kelamin, m.angkatan, m.prodi_id, p.nama_prodi, p.kode_prodi
    FROM mahasiswa m
    INNER JOIN prodi p ON m.prodi_id = p.id
    ORDER BY m.nim ASC
  `);

  const [prodiRows] = await db.query<any[]>(
    'SELECT id, kode_prodi, nama_prodi FROM prodi ORDER BY id ASC'
  );

  return (
    <MahasiswaTableClient
      initialData={mhsRows as MahasiswaRow[]}
      prodiOptions={prodiRows as ProdiOption[]}
    />
  );
}