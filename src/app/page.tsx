import Link from 'next/link';
import { connection } from 'next/server';
import { Users, GraduationCap, ArrowRight, BarChart3, CalendarDays, UserPlus } from 'lucide-react';
import type { RowDataPacket } from 'mysql2';
import { db } from '@/lib/db';

interface AngkatanRow {
  angkatan: number;
  total: number;
}

interface TerbaruRow {
  id: number;
  nim: string;
  nama: string;
  angkatan: number;
  created_at: Date;
  kode_prodi: string;
}

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

  const [rows] = await db.query<RowDataPacket[]>(`
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

  const [[angkatanRows], [terbaruRows]] = await Promise.all([
    db.query<RowDataPacket[]>(
      'SELECT angkatan, COUNT(*) AS total FROM mahasiswa GROUP BY angkatan ORDER BY angkatan ASC'
    ),
    db.query<RowDataPacket[]>(`
      SELECT m.id, m.nim, m.nama, m.angkatan, m.created_at, p.kode_prodi
      FROM mahasiswa m
      INNER JOIN prodi p ON m.prodi_id = p.id
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT 5
    `),
  ]);

  const angkatanStats = angkatanRows as unknown as AngkatanRow[];
  const mahasiswaTerbaru = terbaruRows as unknown as TerbaruRow[];
  const maxAngkatan = Math.max(1, ...angkatanStats.map((a) => Number(a.total)));
  const formatTanggal = (d: Date) =>
    new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Dashboard Akademik
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Ringkasan data mahasiswa dan program studi terkini.
        </p>
      </div>

      {/* Kartu Ringkasan Utama */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/mahasiswa"
          className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-blue-300 sm:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Mahasiswa</p>
              <h3 className="mt-0.5 text-xl font-bold text-slate-900 tabular-nums">
                {totalMahasiswa} Mahasiswa
              </h3>
              <p className="mt-1 text-xs text-slate-500 tabular-nums">
                Laki-laki: <strong className="font-semibold text-slate-700">{totalLaki}</strong> •
                Perempuan:{' '}
                <strong className="font-semibold text-slate-700">{totalPerempuan}</strong>
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-700" />
        </Link>

        <Link
          href="/prodi"
          className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-blue-300 sm:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">Program Studi</p>
              <h3 className="mt-0.5 text-xl font-bold text-slate-900 tabular-nums">
                {totalProdi} Prodi
              </h3>
              <p className="mt-1 truncate text-xs text-slate-500">{daftarKodeProdi}</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-700" />
        </Link>
      </div>

      {/* Distribusi Mahasiswa per Prodi */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-700" />
          <h3 className="text-base font-bold text-slate-900">Distribusi Mahasiswa per Prodi</h3>
        </div>

        {prodiStats.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada program studi terdaftar.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {prodiStats.map((prodi) => {
              const pct =
                totalMahasiswa > 0
                  ? Math.round((Number(prodi.total_mahasiswa) / totalMahasiswa) * 100)
                  : 0;

              return (
                <div
                  key={prodi.id}
                  className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-blue-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-blue-700">
                      {prodi.kode_prodi}
                    </span>
                    <span className="text-xs font-medium text-slate-500 tabular-nums">
                      {prodi.jenjang} • {pct}%
                    </span>
                  </div>
                  <p className="mt-2.5 truncate text-sm font-semibold text-slate-800">
                    {prodi.nama_prodi}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
                    {prodi.total_mahasiswa}{' '}
                    <span className="text-xs font-normal text-slate-500">Mahasiswa</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Distribusi per Angkatan */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">Mahasiswa per Angkatan</h3>
          </div>

          {angkatanStats.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada data mahasiswa.</p>
          ) : (
            <ul className="space-y-3">
              {angkatanStats.map((a) => {
                const width = Math.max(4, Math.round((Number(a.total) / maxAngkatan) * 100));
                const pct =
                  totalMahasiswa > 0 ? Math.round((Number(a.total) / totalMahasiswa) * 100) : 0;
                return (
                  <li key={a.angkatan} className="flex items-center gap-3 text-sm">
                    <span className="w-12 shrink-0 font-mono text-xs font-semibold text-slate-700 tabular-nums">
                      {a.angkatan}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${width}%` }}
                        role="img"
                        aria-label={`Angkatan ${a.angkatan}: ${a.total} mahasiswa`}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs font-semibold text-slate-900 tabular-nums">
                      {a.total} <span className="font-normal text-slate-500">({pct}%)</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 5 Mahasiswa Terbaru */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-700" />
              <h3 className="text-base font-bold text-slate-900">Mahasiswa Terbaru</h3>
            </div>
            <Link href="/mahasiswa" className="text-xs font-semibold text-blue-700 hover:underline">
              Lihat semua
            </Link>
          </div>

          {mahasiswaTerbaru.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada data mahasiswa.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {mahasiswaTerbaru.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{m.nama}</p>
                    <p className="font-mono text-xs text-slate-500 tabular-nums">
                      {m.nim} • Angkatan {m.angkatan}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700">
                      {m.kode_prodi}
                    </span>
                    <p className="mt-1 text-[11px] text-slate-500">{formatTanggal(m.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
