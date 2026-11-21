# SiAkademik — Sistem Informasi Mahasiswa & Program Studi

Aplikasi web manajemen data akademik (mahasiswa dan program studi) berbasis **Next.js App Router**, **TypeScript**, **Tailwind CSS**, dan **MySQL**, dilengkapi autentikasi internal, proteksi CSRF, dukungan PWA, serta kustomisasi **5 Gaya UI × 5 Tema Warna × Mode Terang/Gelap**.

## Fitur Utama

- **Dashboard Dinamis (`/`)**
  Menampilkan KPI total mahasiswa (beserta rasio Laki-laki/Perempuan), total program studi dan daftar kode prodi, kartu distribusi per program studi, grafik jumlah mahasiswa per angkatan, serta 5 mahasiswa terbaru langsung dari MySQL.
- **Manajemen Mahasiswa (`/mahasiswa`)**
  CRUD lengkap data mahasiswa, pencarian real-time, filter Program Studi / Jenis Kelamin / Angkatan, sorting, pagination, tampilan **Mobile Card View**, dan **Export CSV** (UTF-8 BOM dengan pemisah `;`, siap dibuka di Microsoft Excel, disertai proteksi formula injection).
- **Manajemen Program Studi (`/prodi`)**
  CRUD program studi, ringkasan statistik jumlah & proporsi mahasiswa per prodi, serta proteksi penghapusan apabila program studi masih memiliki mahasiswa terdaftar.
- **Akun & Keamanan (`/login`, `/profil`, `/ganti-password`)**
  - Autentikasi sesi berbasis cookie `HttpOnly` bertanda tangan HMAC (`src/lib/session.ts` & `src/lib/auth.ts`).
  - Server-side auth guard menggunakan konvensi Next.js 16 di `src/proxy.ts`.
  - Proteksi CSRF Double-Submit Cookie dengan perbandingan timing-safe dan rotasi token saat login.
  - Validasi payload API terstruktur di `src/lib/api-validation.ts`.
  - Pembaruan profil akun dan kata sandi secara dinamis.
- **UX & PWA**
  Modal konfirmasi dan notifikasi toast modern (`UiProvider`), skeleton loading (`src/app/loading.tsx`), halaman fallback `src/app/error.tsx` & `src/app/not-found.tsx`, navigasi responsif (collapsible `Sidebar` desktop + `BottomNav` mobile), serta manifest dan Service Worker PWA (`public/manifest.json` & `public/sw.js`).

## Kustomisasi Tampilan

Pengguna dapat memilih kombinasi tampilan langsung dari halaman `/login` maupun navbar dashboard tanpa flicker sebelum render awal (disimpan di `localStorage`):

- **5 Gaya Desain UI**:
  - `Modern Flat` (`modern`) — bersih & minimalis
  - `Glassmorphism` (`glass`) — permukaan kaca buram transparan
  - `Neo-Brutalism` (`brutal`) — garis tepi tegas & bayangan keras kontras tinggi
  - `Neumorphism` (`neumorph`) — efek timbul/tenggelam lembut monokrom
  - `Claymorphism` (`clay`) — elemen 3D membulat dengan bayangan dalam yang empuk
- **5 Tema Warna Aksen**: `Biru` (`blue`), `Emerald` (`emerald`), `Indigo` (`indigo`), `Amber` (`amber`), dan `Rose` (`rose`).
- **Mode Terang / Gelap**: Toggle 1 klik yang menyelaraskan seluruh komponen, form, modal, hingga grafik di semua gaya UI.

## Teknologi

- **Framework**: Next.js `16.4.6` (App Router) & React `19.3.0`
- **Bahasa**: TypeScript `5`
- **Styling**: Tailwind CSS `4.3.3` (`@tailwindcss/turbopack`), CSS Variables & Custom UI Style Layer (`src/app/ui-styles.css`)
- **Database**: MySQL / MariaDB (`mysql2`)
- **Ikon & Font**: Lucide React, `Plus Jakarta Sans`, dan `JetBrains Mono`

## Struktur Proyek

```text
sistem-mahasiswa/
├── database/
│   └── migration_seeder.sql     # Skema database db_akademik & data awal
├── docs/
│   ├── PRD.md                   # Spesifikasi awal aplikasi & API
│   ├── PRD-v2-ui-security.md    # Pembaruan UI, keamanan & responsivitas
│   └── PRD-v3-ui-styles.md      # Spesifikasi 5 gaya UI & tema warna
├── public/
│   ├── icons/                   # Ikon PWA (192x192 & 512x512)
│   ├── manifest.json            # Manifest PWA
│   └── sw.js                    # Service Worker (cache aset statis)
├── src/
│   ├── app/                     # Halaman App Router, API routes, globals.css & ui-styles.css
│   ├── components/              # Komponen layout (AppShell, Sidebar, Navbar, BottomNav) & UI
│   ├── lib/                     # Koneksi DB, auth/session, validasi API, helper tema
│   └── proxy.ts                 # Server-side route protection (Next.js 16)
├── .env.example                 # Template variabel environment
└── package.json
```

## Panduan Instalasi & Menjalankan Lokal

### 1. Prasyarat
- **Node.js** versi 20 atau lebih baru
- **MySQL** atau **MariaDB** (misalnya melalui XAMPP)

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment
Salin `.env.example` menjadi `.env.local`:
```bash
# macOS / Linux / Git Bash
cp .env.example .env.local
```
```powershell
# Windows PowerShell
Copy-Item .env.example .env.local
```

Buka `.env.local`, sesuaikan `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, dan isi `AUTH_SECRET` dengan string acak minimal 32 karakter:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Import Database (`database/migration_seeder.sql`)
File `database/migration_seeder.sql` otomatis membuat database `db_akademik`, tabel `users`, `prodi`, dan `mahasiswa`, serta mengisi data awal (1 akun admin, 4 program studi, dan 100 data mahasiswa).

- **Opsi A — MySQL CLI**:
  ```bash
  mysql -u root < database/migration_seeder.sql
  ```
  Atau di Windows PowerShell:
  ```powershell
  Get-Content database/migration_seeder.sql | mysql -u root
  ```
- **Opsi B — phpMyAdmin**:
  Buka phpMyAdmin, pilih tab **Import**, pilih file `database/migration_seeder.sql`, lalu klik **Import / Go**.

> **Akun Demo Seeder**: username `admin`, password `admin123`. Demi keamanan, segera ubah kata sandi setelah login melalui menu **Ganti Password**.

### 5. Jalankan Aplikasi
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser.

### Script Tersedia
- `npm run dev` — Menjalankan server pengembangan Next.js (`next dev`)
- `npm run lint` — Memeriksa kualitas kode dengan ESLint
- `npx tsc --noEmit` — Memeriksa tipe TypeScript
- `npm run build` — Membangun aplikasi untuk produksi (`next build`)
- `npm run start` — Menjalankan hasil build produksi (`next start`)

## Dokumentasi PRD

- [PRD Awal](docs/PRD.md)
- [PRD v2 — UI & Security](docs/PRD-v2-ui-security.md)
- [PRD v3 — UI Design Styles](docs/PRD-v3-ui-styles.md)
