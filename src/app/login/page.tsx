'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Unlock,
  User,
  AlertCircle,
  LogIn,
  Eye,
  EyeOff,
  GraduationCap,
  BarChart3,
  Users,
  ShieldCheck,
  ArrowRight,
  Loader2,
  RefreshCw,
  BookOpen,
  Award,
  Database,
  Layers,
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [csrfRetrying, setCsrfRetrying] = useState(false);

  const isFormReady = Boolean(username.trim() && password.length > 0 && csrfToken && !loading);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/csrf', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.authenticated) {
          router.replace('/');
        } else {
          setCsrfToken(data.csrfToken || '');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Gagal memuat sesi keamanan. Muat ulang halaman.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleRetryCsrf = async () => {
    setError('');
    setCsrfRetrying(true);
    try {
      const res = await fetch('/api/auth/csrf', { cache: 'no-store' });
      const data = await res.json();
      if (data.authenticated) {
        router.replace('/');
      } else {
        setCsrfToken(data.csrfToken || '');
      }
    } catch {
      setError('Gagal memuat sesi keamanan. Muat ulang halaman.');
    } finally {
      setCsrfRetrying(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal login');
        setErrorCount((c) => c + 1);
        setLoading(false);
        return;
      }

      router.replace('/');
      router.refresh();
    } catch {
      setError('Gagal menghubungi server.');
      setErrorCount((c) => c + 1);
      setLoading(false);
    }
  };

  return (
    <div className="ui-canvas grid min-h-screen lg:grid-cols-[1.08fr_1fr]">
      {/* Panel Branding Desktop */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden bg-brand-panel p-10 text-white transition-colors lg:flex lg:border-r lg:border-white/10 xl:p-12"
        style={{
          backgroundImage: [
            'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px)',
            'linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '40px 40px',
        }}
      >
        {/* Ambient Animated Orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="login-orb-a absolute -top-24 -left-20 h-96 w-96 rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, color-mix(in srgb, var(--theme-accent-solid) 34%, transparent) 0%, transparent 70%)',
            }}
          />
          <div
            className="login-orb-b absolute -right-24 -bottom-24 h-[26rem] w-[26rem] rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, transparent 70%)',
            }}
          />

          {/* Elemen Akademik Melayang (Ikon, Shape & Teks) */}
          <span className="login-drift-d absolute top-[23%] left-6 text-6xl font-extrabold tracking-tight text-white/[0.035] select-none xl:text-7xl">
            SiAkademik
          </span>

          <div className="login-spin-slow absolute top-[14%] -right-12 h-64 w-64 rounded-full border border-dashed border-white/[0.09]">
            <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-accent-solid shadow-[0_0_14px_var(--theme-accent-solid)]" />
            <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white/40" />
          </div>

          <div className="login-drift-c absolute top-[38%] right-[14%] h-14 w-14 rounded-2xl border border-white/[0.08] bg-white/[0.02]" />

          <div className="login-drift-b absolute top-[18%] right-12 rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-white/35 select-none backdrop-blur-xs">
            PTIK • PTE • TE
          </div>
          <div className="login-drift-d absolute right-10 bottom-[13%] rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-white/35 select-none backdrop-blur-xs">
            AKADEMIK • S1
          </div>

          <div className="login-drift-a absolute top-[26%] right-[18%] flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04] text-white/45 backdrop-blur-xs">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="login-drift-b absolute top-[33%] left-7 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/40 backdrop-blur-xs">
            <Award className="h-5 w-5" />
          </div>
          <div className="login-drift-c absolute top-[49%] right-8 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04] text-white/45 backdrop-blur-xs">
            <Database className="h-5 w-5" />
          </div>
          <div className="login-drift-a absolute bottom-[12%] left-12 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/35 backdrop-blur-xs">
            <Layers className="h-4 w-4" />
          </div>
        </div>

        {/* Header Brand */}
        <div className="login-enter relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-solid text-white shadow-sm">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="block text-base font-bold tracking-tight text-white">
                SiAkademik
              </span>
              <span className="block text-[11px] font-medium text-slate-400">
                Sistem Informasi Mahasiswa
              </span>
            </div>
          </div>

          <span className="login-badge-shimmer inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span>Portal Akademik</span>
          </span>
        </div>

        {/* Konten Tengah */}
        <div className="relative z-10 my-8 max-w-lg space-y-6">
          <div className="login-enter login-delay-1 space-y-3">
            <h2 className="text-3xl leading-tight font-extrabold tracking-tight text-white xl:text-4xl">
              Kelola Data Akademik Lebih Cepat &amp; Terstruktur.
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Satu portal terpadu untuk manajemen mahasiswa, program studi, statistik angkatan, dan
              laporan siap ekspor.
            </p>
          </div>

          {/* Bento Highlights Ringkas dengan Animasi */}
          <div className="grid grid-cols-2 gap-3">
            <div className="login-enter login-delay-2 group rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08]">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-solid/20 text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="flex h-5 items-end gap-1" aria-hidden="true">
                  <span className="login-bar login-bar-1 h-2.5 w-1 rounded-full bg-accent-solid" />
                  <span className="login-bar login-bar-2 h-4 w-1 rounded-full bg-accent-solid" />
                  <span className="login-bar login-bar-3 h-3 w-1 rounded-full bg-accent-solid" />
                  <span className="login-bar login-bar-4 h-5 w-1 rounded-full bg-accent-solid" />
                  <span className="login-bar login-bar-5 h-3.5 w-1 rounded-full bg-accent-solid" />
                </div>
              </div>
              <p className="text-xs font-bold text-white">Dashboard Bento Real-Time</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                Ringkasan rasio gender, prodi, dan angkatan langsung dari MySQL.
              </p>
            </div>

            <div className="login-enter login-delay-3 group rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08]">
              <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-accent-solid/20 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Users className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="text-xs font-bold text-white">Filter Cepat &amp; Export CSV</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                Pencarian instan, seleksi aksi massal, dan ekspor siap Excel.
              </p>
            </div>

            <div className="login-enter login-delay-4 group col-span-2 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 transition-transform duration-300 group-hover:scale-110">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Keamanan Sesi &amp; Proteksi CSRF</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-300">
                  Cookie sesi HttpOnly bertanda tangan HMAC dengan rotasi token otomatis di setiap
                  login.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="login-enter login-delay-5 relative z-10 text-xs text-slate-400">
          Fakultas Teknik • Sistem Informasi Mahasiswa &amp; Program Studi
        </p>
      </aside>

      {/* Panel Form Login */}
      <main className="ui-canvas relative flex min-h-screen flex-col justify-between px-5 py-6 sm:px-10 sm:py-8">
        {/* Glow Ambient Halus di Belakang Form */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="login-orb-a absolute -top-20 -right-24 h-80 w-80 rounded-full opacity-45 blur-3xl dark:opacity-30"
            style={{
              background:
                'radial-gradient(circle, color-mix(in srgb, var(--theme-accent-solid) 24%, transparent) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Header Bar */}
        <div className="login-enter relative z-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-solid text-white">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                SiAkademik
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Portal Akademik</p>
            </div>
          </div>

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Kartu Form Login */}
        <div className="login-enter login-delay-2 relative z-10 mx-auto my-auto w-full max-w-md py-6">
          <div className="ui-card p-6 sm:p-8">
            <div className="mb-6">
              <div
                className={`login-emblem relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-text transition-transform duration-300 ${
                  isFormReady ? 'scale-105' : ''
                }`}
              >
                {isFormReady && (
                  <span
                    className="absolute inset-0 animate-ping rounded-xl bg-accent-solid opacity-20"
                    aria-hidden="true"
                  />
                )}
                {isFormReady ? (
                  <Unlock className="relative h-5 w-5 transition-transform duration-200" aria-hidden="true" />
                ) : (
                  <Lock className="relative h-5 w-5 transition-transform duration-200" aria-hidden="true" />
                )}
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Selamat Datang Kembali
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Masuk menggunakan username atau email akun terdaftar.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div
                  key={errorCount}
                  role="alert"
                  className="login-shake flex items-start justify-between gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/60 dark:text-rose-200"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{error}</span>
                  </div>
                  {!csrfToken && (
                    <button
                      type="button"
                      onClick={handleRetryCsrf}
                      disabled={csrfRetrying}
                      className="inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold text-rose-700 underline hover:text-rose-900 dark:text-rose-200"
                    >
                      <RefreshCw className={`h-3 w-3 ${csrfRetrying ? 'animate-spin' : ''}`} />
                      Muat Ulang
                    </button>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                >
                  Username / Email
                </label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    id="username"
                    type="text"
                    required
                    autoFocus
                    autoComplete="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError('');
                    }}
                    className="ui-input min-h-[44px] w-full pr-3.5 pl-10 text-sm"
                    placeholder="Username atau email"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                >
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    onKeyDown={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                    onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                    className="ui-input min-h-[44px] w-full pr-11 pl-10 text-sm"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {capsLockOn && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Caps Lock sedang aktif
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !csrfToken}
                className="ui-btn-primary login-btn-shine group mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : !csrfToken ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menyiapkan sesi...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-2 border-t border-slate-200/70 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Sesi terenkripsi HttpOnly &amp; terlindungi proteksi CSRF.</span>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Coba 5 gaya UI &amp; tema warna melalui tombol palet di kanan atas.
          </p>
        </div>

        <div className="hidden h-4 lg:block" aria-hidden="true" />
      </main>
    </div>
  );
}
