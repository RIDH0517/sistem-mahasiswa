import Link from 'next/link';
import { connection } from 'next/server';
import {
  Users,
  GraduationCap,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  UserPlus,
} from 'lucide-react';
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

  const [[prodiRows], [angkatanRows], [terbaruRows]] = await Promise.all([
    db.query<RowDataPacket[]>(`
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
    `),
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

  const prodiStats = prodiRows as ProdiStatRow[];
  const angkatanStats = angkatanRows as unknown as AngkatanRow[];
  const mahasiswaTerbaru = terbaruRows as unknown as TerbaruRow[];

  const totalProdi = prodiStats.length;
  const totalMahasiswa = prodiStats.reduce((acc, cur) => acc + Number(cur.total_mahasiswa), 0);
  const totalLaki = prodiStats.reduce((acc, cur) => acc + Number(cur.total_laki), 0);
  const totalPerempuan = prodiStats.reduce((acc, cur) => acc + Number(cur.total_perempuan), 0);

  const pctLaki = totalMahasiswa > 0 ? Math.round((totalLaki / totalMahasiswa) * 100) : 0;
  const pctPerempuan = totalMahasiswa > 0 ? 100 - pctLaki : 0;

  const topProdi =
    prodiStats.length > 0
      ? prodiStats.reduce((best, cur) =>
          Number(cur.total_mahasiswa) > Number(best.total_mahasiswa) ? cur : best
        )
      : null;

  const maxAngkatan = Math.max(1, ...angkatanStats.map((a) => Number(a.total)));
  const topAngkatan =
    angkatanStats.length > 0
      ? angkatanStats.reduce((best, cur) => (Number(cur.total) > Number(best.total) ? cur : best))
      : null;

  const angkatanRange =
    angkatanStats.length === 0
      ? '-'
      : angkatanStats.length === 1
        ? String(angkatanStats[0].angkatan)
        : `${angkatanStats[0].angkatan}–${angkatanStats[angkatanStats.length - 1].angkatan}`;

  const formatTanggal = (d: Date) =>
    new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
          Dashboard Akademik
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Ringkasan data mahasiswa dan program studi terkini.
        </p>
      </div>

      {/* Modular Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6 xl:grid-cols-12 lg:gap-5">
        {/* Tile 1: Hero Metric Total Mahasiswa & Rasio Gender */}
        <div className="ui-card flex flex-col justify-between p-5 md:col-span-6 xl:col-span-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Total Mahasiswa
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Terdaftar aktif di sistem
                </p>
              </div>
            </div>
            <Link
              href="/mahasiswa"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent-text hover:underline"
            >
              Kelola <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="my-4">
            <h3 className="text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums dark:text-slate-100">
              {totalMahasiswa}
            </h3>
          </div>

          <div className="space-y-2">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
              role="img"
              aria-label={`Rasio gender: ${pctLaki}% Laki-laki, ${pctPerempuan}% Perempuan`}
            >
              {totalMahasiswa > 0 && (
                <>
                  <div className="h-full bg-blue-500" style={{ width: `${pctLaki}%` }} />
                  <div className="h-full bg-rose-500" style={{ width: `${pctPerempuan}%` }} />
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 tabular-nums dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Laki-laki:{' '}
                <strong className="font-semibold text-slate-800 dark:text-slate-200">
                  {totalLaki} ({pctLaki}%)
                </strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Perempuan:{' '}
                <strong className="font-semibold text-slate-800 dark:text-slate-200">
                  {totalPerempuan} ({pctPerempuan}%)
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tile 2: Program Studi Aktif */}
        <Link
          href="/prodi"
          className="ui-card group flex flex-col justify-between p-5 hover:border-accent-border md:col-span-3 xl:col-span-4 sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <GraduationCap className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-text dark:text-slate-500" />
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums dark:text-slate-100">
                {totalProdi}
              </h3>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Program Studi
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
              {topProdi
                ? `Terbanyak: ${topProdi.kode_prodi} (${topProdi.total_mahasiswa} mhs)`
                : 'Belum ada program studi'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {prodiStats.length === 0 ? (
              <span className="text-xs text-slate-400 dark:text-slate-500">-</span>
            ) : (
              <>
                {prodiStats.slice(0, 6).map((p) => (
                  <span
                    key={p.id}
                    className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-[11px] font-semibold text-accent-text"
                  >
                    {p.kode_prodi}
                  </span>
                ))}
                {prodiStats.length > 6 && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    +{prodiStats.length - 6}
                  </span>
                )}
              </>
            )}
          </div>
        </Link>

        {/* Tile 3: Ringkasan Angkatan */}
        <div className="ui-card flex flex-col justify-between p-5 md:col-span-3 xl:col-span-3 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
              <CalendarDays className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Rentang Angkatan
            </span>
          </div>

          <div className="my-4">
            <h3 className="font-mono text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums sm:text-3xl dark:text-slate-100">
              {angkatanRange}
            </h3>
            <p className="mt-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
              {angkatanStats.length} angkatan aktif
            </p>
          </div>

          <div className="ui-card-subtle px-3 py-2">
            <p className="truncate text-xs font-medium text-slate-600 tabular-nums dark:text-slate-300">
              {topAngkatan
                ? `Terbesar: Angkatan ${topAngkatan.angkatan} (${topAngkatan.total} mhs)`
                : 'Belum ada data angkatan'}
            </p>
          </div>
        </div>

        {/* Left Bento Stack (Tiles 4 & 5) */}
        <div className="flex flex-col gap-4 md:col-span-6 xl:col-span-7 lg:gap-5">
          {/* Tile 4: Distribusi per Program Studi */}
          <div className="ui-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent-text" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Distribusi per Program Studi
                </h3>
              </div>
              <Link
                href="/prodi"
                className="text-xs font-semibold text-accent-text hover:underline"
              >
                Kelola Prodi
              </Link>
            </div>

            {prodiStats.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Belum ada program studi terdaftar.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {prodiStats.map((prodi) => {
                  const totalProdiMhs = Number(prodi.total_mahasiswa);
                  const pct =
                    totalMahasiswa > 0 ? Math.round((totalProdiMhs / totalMahasiswa) * 100) : 0;

                  return (
                    <Link
                      key={prodi.id}
                      href={`/mahasiswa?prodi=${encodeURIComponent(prodi.kode_prodi)}`}
                      className="ui-card-subtle group block p-4 transition-all hover:border-accent-border"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-accent-soft px-2.5 py-0.5 font-mono text-xs font-semibold text-accent-text">
                          {prodi.kode_prodi}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 tabular-nums dark:text-slate-400">
                          <span>
                            {prodi.jenjang} • {pct}%
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-text dark:text-slate-500" />
                        </span>
                      </div>
                      <p className="mt-2.5 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {prodi.nama_prodi}
                      </p>
                      <p className="mt-1.5 flex items-baseline justify-between gap-2">
                        <span className="text-lg font-bold text-slate-900 tabular-nums dark:text-slate-100">
                          {totalProdiMhs}{' '}
                          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                            Mahasiswa
                          </span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 tabular-nums dark:text-slate-400">
                          L: {Number(prodi.total_laki)} • P: {Number(prodi.total_perempuan)}
                        </span>
                      </p>
                      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/70">
                        <div
                          className="h-full rounded-full bg-accent-solid"
                          style={{ width: `${pct > 0 ? Math.max(4, pct) : 0}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tile 5: Mahasiswa per Angkatan */}
          <div className="ui-card p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Mahasiswa per Angkatan
              </h3>
            </div>

            {angkatanStats.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Belum ada data mahasiswa.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {angkatanStats.map((a) => {
                  const width = Math.max(4, Math.round((Number(a.total) / maxAngkatan) * 100));
                  const pct =
                    totalMahasiswa > 0 ? Math.round((Number(a.total) / totalMahasiswa) * 100) : 0;
                  return (
                    <li key={a.angkatan}>
                      <Link
                        href={`/mahasiswa?angkatan=${a.angkatan}`}
                        className="group flex items-center gap-3 rounded-lg px-1.5 py-1 text-sm transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                      >
                        <span className="w-12 shrink-0 font-mono text-xs font-semibold text-slate-700 tabular-nums transition-colors group-hover:text-accent-text dark:text-slate-300">
                          {a.angkatan}
                        </span>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-accent-solid"
                            style={{ width: `${width}%` }}
                            role="img"
                            aria-label={`Angkatan ${a.angkatan}: ${a.total} mahasiswa`}
                          />
                        </div>
                        <span className="w-16 shrink-0 text-right text-xs font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                          {a.total}{' '}
                          <span className="font-normal text-slate-500 dark:text-slate-400">
                            ({pct}%)
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Tile 6: Tall Right Bento Feed — 5 Mahasiswa Terbaru */}
        <div className="ui-card flex h-full flex-col p-5 md:col-span-6 xl:col-span-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-accent-text" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Mahasiswa Terbaru
              </h3>
            </div>
            <Link
              href="/mahasiswa"
              className="text-xs font-semibold text-accent-text hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {mahasiswaTerbaru.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Belum ada data mahasiswa.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {mahasiswaTerbaru.map((m) => {
                const initial = m.nama.trim().charAt(0).toUpperCase() || 'M';
                return (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-xs font-bold text-accent-text">
                        {initial}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {m.nama}
                        </p>
                        <p className="truncate font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                          {m.nim} • Angkatan {m.angkatan}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-xs font-semibold text-accent-text">
                        {m.kode_prodi}
                      </span>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {formatTanggal(m.created_at)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-auto pt-4">
            <Link
              href="/mahasiswa"
              className="ui-btn-secondary inline-flex min-h-[40px] w-full items-center justify-center gap-2 px-4 text-xs font-semibold"
            >
              <span>Kelola Semua Mahasiswa</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
