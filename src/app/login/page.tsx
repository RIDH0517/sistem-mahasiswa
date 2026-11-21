'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ShieldCheck, AlertCircle, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Ambil CSRF Token saat halaman dimuat
  useEffect(() => {
    fetch('/api/auth/csrf')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace('/');
        } else {
          setCsrfToken(data.csrfToken || '');
        }
      });
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

      window.location.href = '/';
    } catch {
      setError('Gagal menghubungi server.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-white shadow-2xl">
        <div className="bg-blue-600 px-6 py-8 text-center text-white">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur-xs">
            SM
          </div>
          <h1 className="mt-4 text-xl font-bold">Login SiAkademik</h1>
          <p className="mt-1 text-xs text-blue-100">
            Sistem Informasi Mahasiswa & Program Studi
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 p-6">
          {/* Hidden Input & Badge Indikator CSRF */}
          <input type="hidden" name="_csrf" value={csrfToken} />

          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            <span className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Proteksi CSRF Aktif
            </span>
            <span className="font-mono text-[11px] text-emerald-600">
              {csrfToken ? `${csrfToken.slice(0, 10)}...` : 'Memuat...'}
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              Username / Email
            </label>
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="min-h-[44px] w-full rounded-lg border border-slate-300 pr-4 pl-10 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                placeholder="Masukkan username (admin)"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-[44px] w-full rounded-lg border border-slate-300 pr-4 pl-10 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                placeholder="Masukkan password (admin123)"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !csrfToken}
            className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            <span>{loading ? 'Memverifikasi...' : 'Masuk ke Aplikasi'}</span>
          </button>

          <p className="pt-2 text-center text-xs text-slate-500">
            Akun Demo: <strong className="text-slate-700">admin</strong> | Password:{' '}
            <strong className="text-slate-700">admin123</strong>
          </p>
        </form>
      </div>
    </div>
  );
}