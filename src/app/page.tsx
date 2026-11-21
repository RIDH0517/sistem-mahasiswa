import Link from 'next/link';
import { connection } from 'next/server';
import { Users, GraduationCap, ArrowRight, BarChart3 } from 'lucide-react';
import { db } from '@/lib/db';

interface ProdiStatRow {
  id: number;
  kode_prodi: string;
  nama_prodi: string;
  jenjang: string;
  total_mahasiswa: number;
  total_laki: number;
  total_perempuan: number;
}

export default async function DashboardPage() {
  await connection();

  const [rows] = await db.query<any[]>(`
    SELECT
      p.id,
      p.kode_prodi,
      p.nama_prodi,
      p.jenjang,
      COUNT(m.id) AS total_mahasiswa,
      COALESCE(SUM(CASE WHEN m.jenis_kelamin = 'L' THEN 1 ELSE 0 END), 0) AS total_laki,
      COALESCE(SUM(CASE WHEN m.jenis_kelamin = 'P' THEN 1 ELSE 0 END), 0) AS total_perempuan
    FROM prodi p
    LEFT JOIN mahasiswa m ON p.id = m.prodi_id
    GROUP BY p.id, p.kode_prodi, p.nama_prodi, p.jenjang
    ORDER BY p.id ASC
  `);

  const prodiStats = rows as ProdiStatRow[];
  const totalProdi = prodiStats.length;
  const daftarKodeProdi =
    totalProdi > 0 ? prodiStats.map((p) => p.kode_prodi).join(', ') : 'Belum ada prodi';

  const totalMahasiswa = prodiStats.reduce((acc, cur) => acc + Number(cur.total_mahasiswa), 0);
  const totalLaki = prodiStats.reduce((acc, cur) => acc + Number(cur.total_laki), 0);
  const totalPerempuan = prodiStats.reduce((acc, cur) => acc + Number(cur.total_perempuan), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Dashboard Akademik</h2>
        <p className="text-sm text-slate-600">
          Selamat datang di Sistem Informasi Mahasiswa & Program Studi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/mahasiswa"
          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Terdaftar</p>
              <h3 className="text-xl font-bold text-slate-900">{totalMahasiswa} Mahasiswa</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Laki-laki: <strong className="text-slate-700">{totalLaki}</strong> • Perempuan:{' '}
                <strong className="text-slate-700">{totalPerempuan}</strong>
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
        </Link>

        <Link
          href="/prodi"
          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Program Studi</p>
              <h3 className="text-xl font-bold text-slate-900">
                {totalProdi} Prodi ({daftarKodeProdi})
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">Klik untuk kelola data program studi</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Distribusi Mahasiswa per Prodi</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {prodiStats.map((prodi) => {
            const pct =
              totalMahasiswa > 0
                ? Math.round((Number(prodi.total_mahasiswa) / totalMahasiswa) * 100)
                : 0;

            return (
              <div key={prodi.id} className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    {prodi.kode_prodi}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {prodi.jenjang} • {pct}%
                  </span>
                </div>
                <p className="mt-2 truncate text-sm font-semibold text-slate-800">
                  {prodi.nama_prodi}
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {prodi.total_mahasiswa}{' '}
                  <span className="text-xs font-normal text-slate-500">Mahasiswa</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
