# Product Requirements Document (PRD v3): Multi-Style UI Design Switcher

## 1. Informasi Dokumen

| Atribut | Detail |
| :--- | :--- |
| **Nama Proyek** | SiAkademik — Sistem Informasi Mahasiswa |
| **Versi / Cakupan** | PRD v3 — Multi-Style UI Design Switcher (`data-style`) |
| **Tech Stack** | Next.js `16.4.6` (App Router), React `19.3.0`, TypeScript `5`, Tailwind CSS `4.3.3`, Lucide React |
| **Status** | Draft / Menunggu Persetujuan |

---

## 2. Latar Belakang & Tujuan

Saat ini aplikasi SiAkademik sudah memiliki fondasi **5 Tema Warna** (`Biru`, `Emerald`, `Indigo`, `Amber`, `Rose` lewat `data-theme`) dan **Mode Terang / Gelap** (`.dark`) yang disimpan di `localStorage` dan langsung aktif sejak halaman `/login` tanpa kedipan.

Untuk memberikan pengalaman visual yang lebih fleksibel, pengguna menginginkan kemampuan mengubah **gaya estetika desain antarmuka (UI Design Style)** secara menyeluruh — meliputi karakter permukaan kartu, border, bayangan, sudut (*border-radius*), efek blur/kedalaman, input form, tombol, modal, hingga tampilan `/login`.

### Tujuan (Objectives)
1. Menghadirkan **5 Gaya Estetika UI** yang dapat dipilih langsung oleh pengguna dan langsung mengubah tampilan seluruh aplikasi termasuk `/login`, `Sidebar`, `Navbar`, `BottomNav`, `Dashboard`, `Data Mahasiswa`, `Data Program Studi`, `Profil`, `Ganti Password`, serta `Modal` dan `Toast`.
2. Membuat sistem gaya UI bersifat **ortogonal (saling melengkapi)** dengan 5 tema warna (`data-theme`) dan mode Terang/Gelap (`.dark`), sehingga menghasilkan `5 Gaya UI × 5 Tema Warna × 2 Mode = 50 kombinasi` dari satu basis kode komponen yang sama.
3. Menjaga keterbacaan tabel data, kontras teks, responsivitas mobile (`375px`), dan performa tanpa menduplikasi komponen React.

---

## 3. Cakupan Gaya UI (Design Styles Scope)

### A. 5 Gaya UI Utama (`Color + Mode Compatible`)

| ID (`data-style`) | Nama Gaya | Karakteristik Visual | Perilaku di Mode Terang & Gelap |
| :--- | :--- | :--- | :--- |
| `modern` | **Modern Flat** *(Default)* | Border tipis `1px`, bayangan mikro halus (`0 1px 2px`), radius `12px`, tampilan rapi dan bersih berorientasi keterbacaan data. | Terang: latar `#f8fafc` + kartu putih.<br>Gelap: latar `#020617` + kartu `#0f172a`. |
| `glass` | **Glassmorphism** | Latar belakang dengan gradasi ambient lembut mengikuti warna aksen, permukaan semi-transparan dengan `backdrop-filter: blur(16px)`, serta border berkilau tipis (`1px`). | Terang: panel `rgba(255,255,255,0.72)` + border putih semi-transparan.<br>Gelap: panel `rgba(15,23,42,0.72)` + border `rgba(255,255,255,0.10)`. |
| `brutal` | **Neo-Brutalism** | Border tegas `2px` kontras tinggi (`#0f172a` di terang, `#e2e8f0` atau border terang kontras di gelap), *hard offset shadow* tanpa blur (`4px 4px 0`), sudut tegas (`6px–8px`), dan efek tekan mekanik (`translate(2px, 2px)` saat `:active`). | Terang: kartu putih cerah dengan border & bayangan solid hitam.<br>Gelap: kartu gelap kontras dengan border & bayangan solid terang/aksen. |
| `neumorph` | **Neumorphism (Soft UI)** | Kanvas dan kartu memakai warna dasar monokrom lembut yang hampir menyatu; kartu & tombol tampak **timbul** dengan dual *soft shadow* (highlight di kiri-atas + bayangan di kanan-bawah), sedangkan `<input>`/`<select>` tampak **cekung** (*inset shadow*). | Terang: latar abu-sejuk `#e8edf3` dengan shadow `#ffffff` & `#c5ceda`.<br>Gelap: latar `#161d2b` dengan shadow `#1f293d` & `#0b0f17`. |
| `clay` | **Claymorphism** | Sudut sangat membulat (`20px–24px`), permukaan tampak **empuk 3D seperti tanah liat** berkat kombinasi *outer drop shadow* dan *inner highlight + inner shadow* pada kartu, tombol, dan modal. | Terang: kartu pastel lembut dengan inner glow putih + drop shadow.<br>Gelap: kartu gelap empuk dengan inner highlight halus + shadow dalam. |

### B. Catatan Khusus: Bento Grid
- **Bento Grid** merupakan gaya *tata letak struktural* (susunan kotak modular asimetris), bukan sekadar gaya kulit CSS seperti 5 gaya di atas.
- **Opsi Implementasi**: Jika disetujui, Bento Grid dapat ditambahkan sebagai **tata letak khusus Dashboard** (`src/app/page.tsx`) — baik menjadi layout default Dashboard yang modular maupun opsi toggle tambahan — sementara halaman tabel data (`/mahasiswa` dan `/prodi`) tetap menjaga struktur tabel/kartu agar mudah dipindai.

### C. Out of Scope (Tidak Disertakan pada Versi Ini)
- **Skeuomorphism**: Meniru tekstur objek fisik nyata (kulit, kertas bertekstur, logam, tombol mekanik realistis) memerlukan aset tekstur khusus, berisiko membengkakkan CSS/gambar, dan menurunkan keterbacaan tabel CRUD data akademik (100+ baris).

---

## 4. Arsitektur Teknis (`data-style` + Kelas Semantik UI)

Alih-alih membuat komponen terpisah untuk tiap gaya, seluruh gaya UI dikendalikan dari atribut `data-style` pada elemen `<html>` yang dikombinasikan dengan kelas utilitas semantik di `src/app/globals.css`.

### A. Penyimpanan & Anti-Kedip (`src/lib/theme.ts` & `src/app/layout.tsx`)
1. Tambahkan konstanta dan tipe baru di `src/lib/theme.ts`:
   - `THEME_STYLE_KEY = 'siakademik_style'`
   - `THEME_STYLE_EVENT = 'siakademik-style-change'`
   - `type UiStyleId = 'modern' | 'glass' | 'brutal' | 'neumorph' | 'clay'`
   - `UI_STYLES`: daftar `{ id, label, description }` + helper `isValidUiStyle()` dan `applyUiStyle()`.
2. Perbarui script sinkron di `<head>` pada `src/app/layout.tsx` agar membaca `localStorage.getItem('siakademik_style')` (default `'modern'`) dan langsung memasang `document.documentElement.dataset.style = style` sebelum render pertama.
3. Sinkronisasi antar tab melalui listener event `storage` untuk key `siakademik_style`.

### B. Kelas Semantik UI di `src/app/globals.css`
Definisikan sekumpulan kelas semantik UI di `src/app/globals.css` yang otomatis berubah perilaku sesuai `[data-style="..."]` dan `.dark`:

| Kelas Semantik | Komponen Pengguna | Perilaku yang Dikendalikan |
| :--- | :--- | :--- |
| `.ui-canvas` | `AppShell.tsx`, `login/page.tsx` | Warna latar utama halaman; menambahkan pola ambient gradient lembut pada mode `glass` dan kanvas monokrom pada mode `neumorph`. |
| `.ui-surface` | `Sidebar.tsx`, `Navbar.tsx`, `BottomNav.tsx` | Latar, border, efek `backdrop-filter`, dan bayangan bar navigasi. |
| `.ui-card` | Kartu Dashboard, Panel Filter, Wrapper Tabel, Kartu Mobile, Kartu Profil, Form Ganti Password, Kartu Login, Error/404 | `background`, `border`, `border-radius`, dan `box-shadow` kartu utama. |
| `.ui-card-subtle` | Tile distribusi prodi di Dashboard, tile info di Profil | Permukaan sub-kartu di dalam `.ui-card` agar hierarki visual tetap terjaga di semua gaya (termasuk `neumorph` dan `clay`). |
| `.ui-modal` | Modal tambah/edit di `/mahasiswa`, `/prodi`, dan Modal Konfirmasi di `UiProvider.tsx` | Latar, radius, border, dan elevasi modal dialog agar tetap jelas di atas backdrop. |
| `.ui-input` | Seluruh `<input>` dan `<select>` (Search, Filter, Login, Ganti Password, Edit Profil, Modal Form) | Border, radius, background, `inset` shadow (untuk `neumorph`), border tebal (untuk `brutal`), dan focus ring aksen. |
| `.ui-btn-primary` | Tombol utama (`Masuk`, `Tambah`, `Simpan`, `Coba Lagi`, dsb.) | Warna aksen `--theme-accent`, border/shadow khas gaya aktif, dan animasi tekan (misal efek offset `brutal` atau highlight `clay`). |
| `.ui-btn-secondary` | Tombol sekunder (`Export CSV`, `Edit Profil`, `Batal`, `Pagination`, tombol toggle tema) | Border, background, shadow, dan state hover yang serasi dengan tiap gaya. |

> **Catatan Kompatibilitas:** Ke-50 kombinasi (`5 Gaya UI × 5 Tema Warna × 2 Mode`) tetap berjalan otomatis karena warna aksen tetap membaca CSS variables `--theme-accent*` dari `[data-theme]`, sedangkan geometri, border, blur, dan shadow membaca `[data-style]`.

---

## 5. Desain UX Pemilih Gaya (`src/components/ui/ThemeToggle.tsx`)

Komponen `ThemeToggle.tsx` yang sudah terpasang di `Navbar.tsx` dan `src/app/login/page.tsx` diperluas tanpa menambah keramaian di header:

1. **Tombol Pemicu Tetap Ringkas**:
   - Ikon palet + titik warna tema aktif (opsional: label gaya singkat di desktop atau tooltip), didampingi tombol Mode Terang/Gelap 1-klik.
2. **Popover Terpadu (2 Bagian dalam 1 Panel)**:
   - **Bagian 1 — Gaya Tampilan** (5 opsi vertical list: `Modern Flat`, `Glassmorphism`, `Neo-Brutalism`, `Neumorphism`, `Claymorphism`) lengkap dengan keterangan singkat 2–3 kata dan ikon centang pada opsi aktif.
   - **Bagian 2 — Tema Warna** (5 swatch bulat `Biru`, `Emerald`, `Indigo`, `Amber`, `Rose` dalam 1 baris ringkas dengan ring indikator aktif & `title`/`aria-label`), sehingga tinggi popover tetap nyaman di layar HP (`375px`).
3. **Aksesibilitas & Interaksi**:
   - Membaca `activeStyle` dan `activeAccent` melalui `useSyncExternalStore` (bebas hydration mismatch).
   - Menutup popover otomatis saat klik di luar area atau menekan tombol `Escape`.

---

## 6. Guardrails Keterbacaan, Responsivitas & Kualitas Visual

1. **Kontras & Aksesibilitas**:
   - Semua teks utama dan sekunder pada mode `glass` dan `neumorph` wajib mempertahankan rasio kontras yang jelas baik di mode Terang maupun Gelap (tidak menggunakan teks pudar di atas permukaan transparan).
   - Input pada mode `neumorph` tetap menampilkan indikator batas/focus ring yang jelas saat difokuskan keyboard (`:focus-visible`).
2. **Keterbacaan Tabel Padat (100+ Baris)**:
   - Pada mode `brutal` dan `clay`, pembulatan ekstrem dan bayangan tebal hanya diterapkan pada `.ui-card` luar dan kontrol tombol, **bukan** pada setiap `<tr>` baris tabel agar tabel tetap bersih dan mudah dipindai.
3. **Responsivitas Mobile (`375px`)**:
   - Pada mode `brutal`, offset shadow tidak boleh menyebabkan *horizontal overflow* di kartu mobile atau modal.
   - Popover `ThemeToggle` pada layar kecil tetap berada di dalam batas viewport (`max-w-[calc(100vw-2rem)]`).
4. **Reduced Motion**:
   - Transisi perubahan gaya dan efek tekan tombol menghormati `@media (prefers-reduced-motion: reduce)`.

---

## 7. Rencana Implementasi Bertahap

| Fase | Fokus Pekerjaan | Target File Utama |
| :--- | :--- | :--- |
| **Fase 1** | **Definisi Gaya, Kelas Semantik CSS & Upgrade `ThemeToggle`** | `src/lib/theme.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/components/ui/ThemeToggle.tsx` |
| **Fase 2** | **Migrasi Layout Shell, Login, Modal & Toast ke Kelas `.ui-*`** | `src/components/layout/AppShell.tsx`, `Sidebar.tsx`, `Navbar.tsx`, `BottomNav.tsx`, `src/components/ui/UiProvider.tsx`, `src/app/login/page.tsx` |
| **Fase 3** | **Migrasi Seluruh Halaman Konten & Verifikasi Build** | `src/app/page.tsx`, `src/app/mahasiswa/MahasiswaTableClient.tsx`, `src/app/prodi/ProdiTableClient.tsx`, `src/app/profil/ProfilClient.tsx`, `src/app/ganti-password/page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` |

---

## 8. Kriteria Penerimaan (Acceptance Criteria)

- [ ] Pengguna dapat memilih 5 Gaya UI (`Modern Flat`, `Glassmorphism`, `Neo-Brutalism`, `Neumorphism`, `Claymorphism`) dari `Navbar` maupun halaman `/login`.
- [ ] Perubahan gaya langsung terlihat di seluruh elemen utama (`/login`, `Sidebar`, `Navbar`, `BottomNav`, `Dashboard`, `/mahasiswa`, `/prodi`, `/profil`, `/ganti-password`, modal, dan toast).
- [ ] Seluruh 5 Gaya UI tetap harmonis saat dipadukan dengan 5 Tema Warna (`Biru`, `Emerald`, `Indigo`, `Amber`, `Rose`) dan Mode Terang / Gelap.
- [ ] Pilihan gaya tersimpan di `localStorage` (`siakademik_style`) dan tidak menimbulkan kedipan (*flash*) maupun *hydration warning* saat halaman di-refresh.
- [ ] Tampilan mobile (`375px`) bebas *horizontal overflow* di semua gaya UI.
- [ ] `npm run lint`, `npx tsc --noEmit`, dan `npm run build` lulus dengan exit code `0`.
