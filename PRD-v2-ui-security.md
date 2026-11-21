# Product Requirements Document (PRD v2): Clean UI/UX, Responsiveness, CSRF Cleanup & Security Hardening

## 1. Informasi Dokumen

| Atribut | Detail |
| :--- | :--- |
| **Nama Proyek** | SiAkademik — Sistem Informasi Mahasiswa |
| **Versi / Cakupan** | PRD v2 — Clean UI/UX Redesign, Mobile Responsiveness, CSRF UI Cleanup, Security Hardening & Code Quality |
| **Tech Stack** | Next.js `16.4.6` (App Router), React `19.3.0`, TypeScript `5`, MySQL (`mysql2/promise`), Tailwind CSS `4.3.3`, Lucide React |
| **Status** | Draft / Siap Eksekusi Bertahap |

---

## 2. Ringkasan Masalah & Audit Kondisi Saat Ini

Berdasarkan pemeriksaan kode dan hasil `npm run lint`, terdapat beberapa aspek UI/UX, responsivitas, keamanan, dan kualitas kode yang perlu dibenahi:

### A. Teks Teknis, Potongan Token CSRF & Kredensial Demo Masih Terekspos di UI
1. **`src/app/login/page.tsx`**:
   - Baris 9–10: Nilai input `username` dan `password` diisi otomatis secara default (`'admin'` dan `'admin123'`).
   - Baris 72–82: Menampilkan `<input type="hidden" name="_csrf" />` serta badge `"Proteksi CSRF Aktif"` beserta potongan token (`{csrfToken.slice(0, 10)}...`).
   - Baris 107 & 128: Placeholder mencantumkan contoh kredensial (`(admin)` dan `(admin123)`).
   - Baris 142–145: Footer menampilkan informasi `Akun Demo: admin | Password: admin123`.
2. **`src/app/ganti-password/page.tsx`**:
   - Baris 55–57: Subtitle mencantumkan detail teknis (`"...di database MySQL dengan perlindungan token CSRF."`).
   - Baris 64–70: Menampilkan badge `"Dilindungi CSRF Token"` beserta potongan token (`{csrfToken.slice(0, 12)}...`).
3. **Label Teknis di Tabel**:
   - `src/app/mahasiswa/MahasiswaTableClient.tsx` (baris 337) dan `src/app/prodi/ProdiTableClient.tsx` (baris 232) menggunakan judul kolom `"Aksi CRUD"`, bukan bahasa pengguna yang bersih seperti `"Aksi"`.

### B. Tampilan Login & Sistem Desain Belum Rapi / Responsif Maksimal
1. **Halaman Login (`src/app/login/page.tsx`)**:
   - Masih berupa kartu polos di atas latar gelap `bg-slate-900` tanpa tata letak adaptif yang modern dan belum memiliki tombol *Show/Hide Password*.
2. **Tipografi & Global Styling (`src/app/globals.css`, `src/app/layout.tsx`)**:
   - `src/app/globals.css` saat ini hanya berisi `@import "tailwindcss";` tanpa konfigurasi font terstandar (seperti `Plus Jakarta Sans` atau `Inter` via `next/font/google`) maupun penyempurnaan scroll/focus ring global.
3. **App Shell & Navigasi (`AppShell.tsx`, `Sidebar.tsx`, `Navbar.tsx`, `BottomNav.tsx`)**:
   - `Navbar.tsx` menampilkan judul statis `"Sistem Informasi Mahasiswa"` di semua rute, sehingga orientasi halaman aktif kurang jelas di mobile.
   - Logika `handleLogout` terduplikasi di `Sidebar.tsx` dan `Navbar.tsx`.
   - `<main>` di `AppShell.tsx` belum membatasi lebar maksimum (`max-w-7xl`) pada layar sangat lebar.
4. **Responsivitas Mobile & State UI (`MahasiswaTableClient.tsx`, `ProdiTableClient.tsx`)**:
   - Pada layar ponsel (`< md`), tabel mahasiswa dan prodi hanya mengandalkan *horizontal scroll* sehingga pengguna harus menggeser tabel ke samping untuk melihat detail maupun tombol edit/hapus.
   - Belum tersedia tampilan *Empty State* + tombol **Reset Filter** saat hasil pencarian/filter berjumlah `0`.
   - Modal form tambah/edit belum membatasi tinggi layar (`max-h-[90vh] overflow-y-auto`) dan belum mendukung penutupan via tombol `Escape` atau klik *backdrop*.
   - Belum ada halaman fallback error (`src/app/error.tsx`) dan halaman 404 (`src/app/not-found.tsx`).

### C. Temuan Keamanan & Stabilitas
1. **`src/lib/auth.ts`**:
   - `verifyCsrfToken` (baris 40 & 48) membandingkan token dan signature memakai operator `!==` / `===` biasa, belum menggunakan perbandingan waktu konstan (`crypto.timingSafeEqual`).
2. **Konfigurasi Cookie (`src/app/api/auth/login/route.ts`, `src/app/api/auth/csrf/route.ts`)**:
   - Cookie sesi dan cookie CSRF belum menambahkan opsi `secure: process.env.NODE_ENV === 'production'`.
   - Token CSRF belum dirotasi ulang saat login berhasil.
3. **Kerahasiaan Secret (`.env.local`, `src/lib/session.ts`)**:
   - `AUTH_SECRET` belum diset di `.env.local` sehingga masih memakai nilai fallback hardcoded `'siakademik-secret-key-2026-unnes'`.
4. **Kebocoran Pesan Error Internal (`api/auth/login/route.ts`, `api/auth/ganti-password/route.ts`)**:
   - Blok `catch` mengembalikan `error.message` mentah ke client alih-alih mencatat di server dan menampilkan pesan ramah.

### D. Kualitas Kode (`npm run lint`)
Hasil eksekusi `npm run lint` saat ini gagal dengan **15 masalah (10 errors, 5 warnings)**:
- **9 error `@typescript-eslint/no-explicit-any`**:
  - `src/app/api/auth/ganti-password/route.ts` (2 error)
  - `src/app/api/auth/login/route.ts` (2 error)
  - `src/app/api/auth/profil/route.ts` (1 error)
  - `src/app/mahasiswa/page.tsx` (2 error)
  - `src/app/prodi/page.tsx` (1 error)
  - `src/lib/auth.ts` (1 error)
- **1 error `react-hooks/set-state-in-effect`**:
  - `src/components/layout/AppShell.tsx` baris 22 (`setIsMini(JSON.parse(savedState))` di dalam `useEffect`).
- **4 warning `@next/next/no-location-assign-relative-destination`**:
  - `src/app/login/page.tsx` baris 50
  - `src/components/layout/AppShell.tsx` baris 44
  - `src/components/layout/Navbar.tsx` baris 69
  - `src/components/layout/Sidebar.tsx` baris 55
- **1 warning `@typescript-eslint/no-unused-vars`**:
  - `src/app/mahasiswa/MahasiswaTableClient.tsx` baris 8 (unused import `Users`).

---

## 3. Tujuan (Objectives)

1. Menghilangkan seluruh tulisan, badge, potongan kode token CSRF, dan kredensial demo dari tampilan antarmuka pengguna sambil **memastikan proteksi CSRF tetap 100% aktif di balik layar**.
2. Menghadirkan tampilan halaman Login dan seluruh aplikasi yang lebih bersih (*clean*), modern, konsisten, serta nyaman digunakan di berbagai ukuran layar (mobile, tablet, desktop).
3. Memperkuat keamanan autentikasi, cookie, sanitasi error, serta menyediakan halaman fallback error/404.
4. Membersihkan seluruh error dan warning ESLint hingga `npm run lint`, `npx tsc --noEmit`, dan `npm run build` lulus tanpa kendala.

---

## 4. Kebutuhan Fungsional & UI/UX (Functional Requirements)

### FR-01: Penghapusan Teks/Badge CSRF & Kredensial Demo dari UI
| Target File | Perubahan yang Diwajibkan |
| :--- | :--- |
| `src/app/login/page.tsx` | - Hapus badge `"Proteksi CSRF Aktif"` dan potongan `{csrfToken.slice(0, 10)}...`.<br>- Hapus `<input type="hidden" name="_csrf" />` yang tidak terpakai oleh `fetch` JSON.<br>- Kosongkan nilai awal `useState('')` untuk `username` dan `password` (jangan isi `'admin'` / `'admin123'`).<br>- Hapus petunjuk kredensial di placeholder dan hapus teks footer `"Akun Demo: admin \| Password: admin123"`.<br>- Tetap ambil CSRF token dari `/api/auth/csrf` secara diam-diam di background dan kirim lewat header `'x-csrf-token'` saat submit login. |
| `src/app/ganti-password/page.tsx` | - Hapus badge `"Dilindungi CSRF Token"` beserta potongan token `{csrfToken.slice(0, 12)}...`.<br>- Ubah deskripsi menjadi teks non-teknis, misalnya: `"Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan akses."`.<br>- Tambahkan tombol *Show/Hide Password* pada ketiga kolom input (`oldPassword`, `newPassword`, `confirmPassword`).<br>- Gunakan notifikasi `toast` dari `UiProvider` sebagai tambahan/pengganti feedback inline agar konsisten dengan halaman lain, sambil tetap mengirim header `'x-csrf-token'`. |

### FR-02: Redesign Halaman Login (`src/app/login/page.tsx`)
- **Layout Responsif**:
  - **Desktop (`lg` ke atas)**: Gunakan tata letak *split-screen* dua kolom yang proporsional:
    - Panel kiri: Branding SiAkademik dengan latar gradien lembut (`slate-900` ke `blue-900`), deskripsi singkat fungsi portal akademik, dan tampilan bersih tanpa noise berlebihan.
    - Panel kanan: Area form login berlatar terang (`bg-white` / `bg-slate-50`) dengan ruang putih lega, tipografi jelas, dan fokus penuh ke form masuk.
  - **Mobile & Tablet (`< lg`)**: Tampil sebagai kartu login terpusat yang bersih dengan header logo ringkas di atasnya dan padding aman di layar sempit (`375px`).
- **Interaksi Form**:
  - Tambahkan tombol ikon mata (*Show/Hide Password*) yang aksesibel (`aria-label`).
  - Tambahkan atribut `autoComplete="username"` dan `autoComplete="current-password"`.
  - Pastikan pesan error tampil rapi dan tombol submit memiliki status loading yang jelas.

### FR-03: Clean Design System & Penyempurnaan App Shell
- **Tipografi (`src/app/layout.tsx` & `src/app/globals.css`)**:
  - Gunakan font `Plus Jakarta Sans` melalui `next/font/google` dengan CSS variable yang diterapkan ke `body` agar seluruh teks lebih tajam dan modern.
- **Container & Spacing (`src/components/layout/AppShell.tsx`)**:
  - Bungkus `{children}` di dalam `<main>` dengan `mx-auto w-full max-w-7xl` agar di monitor lebar konten tetap terstruktur rapi.
  - Gunakan `pb-24 md:pb-8` di `<main>` supaya konten terbawah di mobile tidak tertutup `BottomNav`.
- **Navbar Dinamis (`src/components/layout/Navbar.tsx`)**:
  - Tampilkan judul halaman aktif secara dinamis sesuai `usePathname()` (misal: `/` → `Dashboard`, `/mahasiswa` → `Data Mahasiswa`, `/prodi` → `Data Program Studi`, `/profil` → `Profil Pengguna`, `/ganti-password` → `Ganti Password`) sehingga navigasi di mobile dan desktop lebih jelas.
- **Konsistensi Navigasi (`Sidebar.tsx`, `Navbar.tsx`, `BottomNav.tsx`)**:
  - Ekstrak fungsi logout ke helper bersama (misalnya `src/lib/client-auth.ts`) agar `Sidebar.tsx` dan `Navbar.tsx` tidak menduplikasi logika `fetch('/api/auth/csrf')` + `fetch('/api/auth/logout')`.
  - Rapikan jarak, border tipis (`border-slate-200/80`), dan indikator item aktif di `Sidebar` maupun `BottomNav`.

### FR-04: Responsivitas Mobile, Empty State, Modal & Halaman Fallback
- **Tampilan Responsif Data Mahasiswa & Prodi (`MahasiswaTableClient.tsx` & `ProdiTableClient.tsx`)**:
  - **Mobile (`md:hidden`)**: Tampilkan daftar kartu ringkas (*Card View*) untuk tiap baris mahasiswa dan program studi (menampilkan informasi utama: NIM, Nama, Email, Badge Prodi, Gender, Angkatan, dan tombol Edit/Hapus berukuran sentuh minimal `44px`) sehingga tidak perlu geser tabel horizontal di HP.
  - **Desktop (`hidden md:block`)**: Pertahankan tampilan tabel terstruktur dengan kolom aksi berjudul `"Aksi"` (menggantikan `"Aksi CRUD"`).
- **Empty State & Reset Filter**:
  - Saat `filteredAndSortedData.length === 0` atau `filteredProdi.length === 0`, tampilkan pesan kosong yang rapi beserta tombol **"Reset Filter"** untuk mengembalikan pencarian dan filter ke nilai awal dalam 1 klik.
- **Peningkatan Aksesibilitas Modal CRUD**:
  - Semua modal form di `/mahasiswa` dan `/prodi` wajib memiliki batas tinggi `max-h-[90vh] overflow-y-auto` agar tidak terpotong di layar HP/landscape, mendukung penutupan via tombol `Escape`, serta klik pada area backdrop.
- **Halaman Fallback (`src/app/error.tsx` & `src/app/not-found.tsx`)**:
  - `src/app/error.tsx` (`'use client'`): Menampilkan pesan error ramah dengan tombol **"Coba Lagi"** (`reset()`) dan tautan ke Dashboard.
  - `src/app/not-found.tsx`: Menampilkan halaman 404 yang bersih dengan tautan kembali ke Dashboard (`/`).

---

## 5. Kebutuhan Teknis, Keamanan & Kualitas Kode

### SR-01: Timing-Safe Comparison untuk CSRF (`src/lib/auth.ts`)
- Pada `verifyCsrfToken`, ganti perbandingan string `!==` / `===` antara `headerToken` vs `rawCookieToken` dan `cookieSignature` vs `expectedSignature` menggunakan `crypto.timingSafeEqual` (dengan pengecekan panjang buffer terlebih dahulu, selaras dengan `verifySessionValue` di `src/lib/session.ts`).

### SR-02: Cookie Hardening & Rotasi Token CSRF
- Tambahkan `secure: process.env.NODE_ENV === 'production'` pada cookie `siakademik_session` di `src/app/api/auth/login/route.ts` dan cookie `siakademik_csrf_token` di `src/app/api/auth/csrf/route.ts`.
- Saat login berhasil di `src/app/api/auth/login/route.ts`, terbitkan token CSRF baru (`generateCsrfToken()`) agar token pra-autentikasi dirotasi.

### SR-03: Sanitasi Pesan Error di Auth API
- Pada `src/app/api/auth/login/route.ts` dan `src/app/api/auth/ganti-password/route.ts`, log error asli di server (`console.error(...)`) dan kembalikan pesan umum ke client (`"Terjadi kesalahan pada server."`) tanpa membocorkan `error.message` internal database.

### SR-04: Konfigurasi `AUTH_SECRET` & Catatan Hashing
- Tambahkan `AUTH_SECRET` yang kuat dan acak di `.env.local` (jangan hanya mengandalkan fallback hardcoded di `src/lib/session.ts`).
- *Catatan jangka panjang*: Untuk standar produksi yang lebih tinggi, pertimbangkan migrasi bertahap hashing password dari `SHA-256` ke `scrypt` atau `bcrypt` dengan mekanisme verifikasi ganda saat user login.

### CQ-01: Penyelesaian 100% Error & Warning ESLint
| Masalah | Lokasi | Solusi |
| :--- | :--- | :--- |
| `@typescript-eslint/no-explicit-any` (9 error) | `api/auth/ganti-password/route.ts`, `api/auth/login/route.ts`, `api/auth/profil/route.ts`, `mahasiswa/page.tsx`, `prodi/page.tsx`, `lib/auth.ts` | Ganti `db.query<any[]>` dengan `db.query<RowDataPacket[]>` dari `mysql2` dan blok `catch (error: unknown)` dengan helper tipe aman. |
| `react-hooks/set-state-in-effect` (1 error) | `src/components/layout/AppShell.tsx` (baris 22) | Baca `localStorage` dengan pola aman (misal sinkronisasi via `useSyncExternalStore` atau lazy state / event callback tanpa memanggil `setState` sinkron langsung di body `useEffect`, sambil tetap menjaga bebas hydration mismatch). |
| `@next/next/no-location-assign-relative-destination` (4 warning) | `login/page.tsx`, `AppShell.tsx`, `Navbar.tsx`, `Sidebar.tsx` | Gunakan `router.replace(...)` + `router.refresh()` dari `next/navigation` alih-alih `window.location.href = '...'`. |
| `@typescript-eslint/no-unused-vars` (1 warning) | `src/app/mahasiswa/MahasiswaTableClient.tsx` (baris 8) | Hapus import `Users` yang tidak terpakai. |

---

## 6. Rencana Implementasi Bertahap (Phased Roadmap)

| Fase | Fokus Pekerjaan | Target File Utama |
| :--- | :--- | :--- |
| **Fase 1** | **CSRF UI Cleanup & Redesign Login + Ganti Password** | `src/app/login/page.tsx`, `src/app/ganti-password/page.tsx` |
| **Fase 2** | **Clean Design System, Responsivitas Mobile & Halaman Fallback** | `src/app/layout.tsx`, `src/app/globals.css`, `src/lib/client-auth.ts`, `src/components/layout/*`, `src/app/mahasiswa/MahasiswaTableClient.tsx`, `src/app/prodi/ProdiTableClient.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx` |
| **Fase 3** | **Security Hardening & Zero ESLint Errors/Warnings** | `src/lib/auth.ts`, `src/app/api/auth/*`, `src/app/mahasiswa/page.tsx`, `src/app/prodi/page.tsx`, `.env.local` |

---

## 7. Kriteria Penerimaan (Acceptance Criteria)

### Keamanan & Privasi UI
- [ ] Tidak ada lagi tulisan/badge `"Proteksi CSRF Aktif"`, `"Dilindungi CSRF Token"`, potongan token CSRF, maupun teks `"Akun Demo"` / password default di halaman `/login` maupun `/ganti-password`.
- [ ] Pengujian request `POST`/`PUT`/`DELETE` tanpa header `x-csrf-token` atau dengan token palsu tetap ditolak dengan status `403`.
- [ ] `verifyCsrfToken` menggunakan `crypto.timingSafeEqual` dan cookie login/CSRF menerapkan `secure` saat `NODE_ENV === 'production'`.
- [ ] Pesan error `500` pada `/api/auth/login` dan `/api/auth/ganti-password` tidak membocorkan `error.message` internal.

### Tampilan Clean & Responsif
- [ ] Halaman `/login` tampil proporsional dengan layout *split-screen* di desktop (`>= 1024px`) dan kartu rapi di layar mobile (`375px`) dengan tombol *Show/Hide Password*.
- [ ] Halaman `/mahasiswa` dan `/prodi` menampilkan *Mobile Card View* pada lebar `< 768px` tanpa overflow horizontal, serta *Table View* di desktop (`>= 768px`) dengan label kolom `"Aksi"`.
- [ ] Empty state dan tombol `"Reset Filter"` muncul ketika pencarian/filter menghasilkan 0 baris.
- [ ] Semua modal form bisa discroll pada layar pendek, tertutup saat menekan `Escape` atau klik backdrop.
- [ ] Halaman `error.tsx` dan `not-found.tsx` tersedia dan berfungsi.

### Kualitas Build & Lint
- [ ] `npm run lint` selesai dengan **0 errors** dan **0 warnings**.
- [ ] `npx tsc --noEmit` selesai tanpa error.
- [ ] `npm run build` selesai dengan exit code `0`.
