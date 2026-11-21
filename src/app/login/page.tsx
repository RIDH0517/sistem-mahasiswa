'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        setLoading(false);
        return;
      }

      router.replace('/');
      router.refresh();
    } catch {
      setError('Gagal menghubungi server.');
      setLoading(false);
    }
  };

  return (
    <div className="ui-canvas grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Panel Branding Desktop */}
      <aside
        className="hidden flex-col justify-between bg-brand-panel p-12 text-white transition-colors lg:flex lg:border-r lg:border-white/10"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-solid text-sm font-bold text-white">
            SM
          </div>
          <span className="text-lg font-bold tracking-tight text-white">SiAkademik</span>
        </div>

        <div className="max-w-md space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Portal Administrasi Akademik
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Pengelolaan data mahasiswa dan program studi terpusat.
          </p>
        </div>

        <p className="text-xs text-slate-400">
          Fakultas Teknik • Sistem Informasi Mahasiswa
        </p>
      </aside>

      {/* Panel Form Login */}
      <main className="ui-canvas relative flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* Header Ringkas Mobile */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-solid text-sm font-bold text-white">
              SM
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                SiAkademik
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sistem Informasi Mahasiswa
              </p>
            </div>
          </div>

          <div className="ui-card p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Masuk ke akun
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Masukkan username atau email yang terdaftar.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/60 dark:text-rose-200"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{error}</span>
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
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <button
                type="submit"
                disabled={loading || !csrfToken}
                className="ui-btn-primary mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogIn className="h-4 w-4" />
                <span>{loading ? 'Memverifikasi...' : 'Masuk'}</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
