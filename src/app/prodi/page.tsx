import { connection } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { db } from '@/lib/db';
import ProdiTableClient, { ProdiRow } from './ProdiTableClient';

export default async function ProdiPage() {
  await connection();

  const [rows] = await db.query<RowDataPacket[]>(`
    SELECT
      p.id,
      p.kode_prodi,
      p.nama_prodi,
      p.jenjang,
      COUNT(m.id) AS total_mahasiswa,
      SUM(CASE WHEN m.jenis_kelamin = 'L' THEN 1 ELSE 0 END) AS total_laki,
      SUM(CASE WHEN m.jenis_kelamin = 'P' THEN 1 ELSE 0 END) AS total_perempuan
    FROM prodi p
    LEFT JOIN mahasiswa m ON p.id = m.prodi_id
    GROUP BY p.id, p.kode_prodi, p.nama_prodi, p.jenjang
    ORDER BY p.id ASC
  `);

  const prodiList = rows as unknown as ProdiRow[];

  return <ProdiTableClient initialProdi={prodiList} />;
}
