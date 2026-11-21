# Product Requirements Document (PRD): Dynamic Academic Dashboard

## 1. Informasi Dokumen

| Atribut | Detail |
| :--- | :--- |
| **Nama Proyek** | SiAkademik - Sistem Informasi Mahasiswa |
| **Modul / Fitur** | Dynamic Academic Dashboard |
| **Target File** | `src/app/page.tsx` |
| **Tech Stack** | Next.js 16.4.6 (App Router), React 19.3.0, TypeScript, MySQL (`mysql2/promise`), Tailwind CSS v4, Lucide React |
| **Status** | Draft / Siap Implementasi |

---

## 2. Latar Belakang & Permasalahan

Saat ini halaman utama Dashboard pada `src/app/page.tsx` masih menggunakan nilai statis (*hardcoded*):
- Kartu Total Terdaftar menampilkan teks statis `"100 Mahasiswa"`.
- Kartu Program Studi menampilkan teks statis `"4 Prodi (PTE, PTIK, TE, TEKKOM)"`.

Kondisi ini menyebabkan data pada Dashboard tidak sinkron dengan perubahan data yang dilakukan melalui fitur CRUD di halaman `/mahasiswa` (`src/app/mahasiswa/page.tsx`) dan `/prodi` (`src/app/prodi/page.tsx`). Jika admin menambah, mengubah, atau menghapus mahasiswa maupun program studi pada database MySQL (`db_akademik`), angka pada Dashboard tidak ikut berubah.

---

## 3. Tujuan (Objectives)

1. Mengubah halaman Dashboard (`src/app/page.tsx`) agar menampilkan statistik akademik secara **real-time** langsung dari database MySQL (`db_akademik`).
2. Menyajikan ringkasan statistik jumlah mahasiswa (termasuk rasio jenis kelamin) dan jumlah program studi beserta distribusinya tanpa memerlukan proses refresh manual atau hardcode ulang.
3. Menjaga konsistensi arsitektur Server Component dengan halaman `/mahasiswa` dan `/prodi` di Next.js 16 (`cacheComponents: true`).

---

## 4. Kebutuhan Fungsional (Functional Requirements)

| ID | Komponen / Fitur | Deskripsi Kebutuhan | Sumber Data Database |
| :--- | :--- | :--- | :--- |
| **FR-01** | **Kartu Total Mahasiswa Terdaftar** | Menampilkan total seluruh mahasiswa aktif beserta rincian jumlah mahasiswa Laki-laki (`L`) dan Perempuan (`P`). Kartu tetap dapat diklik menuju rute `/mahasiswa`. | Agregasi `COUNT(m.id)` serta `SUM(CASE WHEN m.jenis_kelamin = 'L'/'P' ...)` dari tabel `mahasiswa`. |
| **FR-02** | **Kartu Total Program Studi** | Menampilkan jumlah total program studi yang terdaftar beserta daftar kode prodi aktif secara dinamis (contoh: `4 Prodi (PTE, PTIK, TE, TEKKOM)`). Kartu tetap dapat diklik menuju rute `/prodi`. | Daftar baris `kode_prodi` dari tabel `prodi`. |
| **FR-03** | **Ringkasan Distribusi Mahasiswa per Prodi** | Menampilkan daftar/grid kartu ringkasan tiap program studi yang berisi kode prodi, nama prodi, jenjang, jumlah mahasiswa terdaftar di prodi tersebut, dan persentasenya terhadap total seluruh mahasiswa. | Query `LEFT JOIN` antara tabel `prodi` dan `mahasiswa` dengan `GROUP BY p.id`. |
| **FR-04** | **Penanganan Data Kosong (*Empty State* & *Zero Division Guard*)** | Jika tabel `prodi` atau `mahasiswa` kosong (`0` data):<br>- Perhitungan persentase tidak menghasilkan `NaN%` (mengembalikan `0%`).<br>- Daftar kode prodi menampilkan fallback teks seperti `"Belum ada prodi"`.<br>- Nilai `SUM` yang bernilai `NULL` ditangani menggunakan `COALESCE(..., 0)` dan konversi `Number(...)`. | Guard pada SQL (`COALESCE`) dan logika TypeScript. |

---

## 5. Kebutuhan Teknis (Technical Requirements)

1. **Server Component & Dynamic Rendering (Next.js 16)**
   - Mengubah `DashboardPage` menjadi `async function DashboardPage()`.
   - Karena `next.config.ts` mengaktifkan `cacheComponents: true`, komponen wajib memanggil `await connection()` dari `next/server` sebelum mengeksekusi query database agar halaman dirender secara dinamis pada setiap request (selaras dengan `src/app/mahasiswa/page.tsx` dan `src/app/prodi/page.tsx`).
2. **Efisiensi Query Database**
   - Menggunakan connection pool `db` dari `src/lib/db.ts`.
   - Menggunakan **1 query agregasi tunggal** (`prodi` `LEFT JOIN` `mahasiswa`) untuk mendapatkan seluruh metrik sekaligus:
     - Jumlah program studi (`prodiStats.length`).
     - Daftar kode prodi (`prodiStats.map((p) => p.kode_prodi).join(', ')`).
     - Total seluruh mahasiswa, total laki-laki, dan total perempuan dengan `.reduce()`.
     - Rincian jumlah mahasiswa dan persentase per program studi.
3. **Skema Tabel Terkait**
   - Tabel `prodi`: `id`, `kode_prodi`, `nama_prodi`, `jenjang`.
   - Tabel `mahasiswa`: `id`, `prodi_id`, `jenis_kelamin` (`'L'` / `'P'`).

---

## 6. Panduan & Kode Implementasi (`src/app/page.tsx`)

### Langkah Implementasi
1. Import `connection` dari `next/server` dan `db` dari `@/lib/db` di `src/app/page.tsx`.
2. Ubah fungsi `DashboardPage` menjadi `async` dan panggil `await connection()` di baris awal.
3. Jalankan query SQL agregasi `LEFT JOIN` dari tabel `prodi` ke `mahasiswa` menggunakan `db.query(...)`.
4. Hitung total mahasiswa, total laki-laki, total perempuan, jumlah prodi, dan daftar kode prodi dengan penanganan nilai kosong (`0` / `COALESCE`).
5. Tampilkan hasil perhitungan pada dua kartu ringkasan utama serta bagian distribusi mahasiswa per prodi.

### Referensi Kode Lengkap (`src/app/page.tsx`)

```tsx
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

      {/* Kartu Ringkasan Utama */}
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

      {/* Ringkasan Distribusi Mahasiswa per Prodi */}
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
              <div
                key={prodi.id}
                className="rounded-lg border border-slate-100 bg-slate-50/70 p-4"
              >
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
```

---

## 7. Kriteria Penerimaan (Acceptance Criteria)

- [ ] Penambahan, pengeditan, atau penghapusan data mahasiswa di `/mahasiswa` langsung memperbarui angka total mahasiswa dan rincian gender (`L` / `P`) di Dashboard (`/`).
- [ ] Penambahan, pengeditan, atau penghapusan program studi di `/prodi` langsung memperbarui jumlah prodi, daftar kode prodi, dan kartu distribusi di Dashboard (`/`).
- [ ] Ketika tabel `prodi` atau `mahasiswa` dalam kondisi kosong (`0` baris), halaman Dashboard tetap tampil tanpa error runtime maupun nilai `NaN%`.
- [ ] Proses `npm run lint` dan `npm run build` berjalan sukses tanpa error terkait `cacheComponents` atau tipe TypeScript.
