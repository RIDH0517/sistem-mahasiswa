'use client';

import { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { fetchCsrfToken } from '@/lib/client-auth';
import { useUi } from '@/components/ui/UiProvider';

export default function GantiPasswordPage() {
  const { toast } = useUi();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCsrfToken()
      .then(setCsrfToken)
      .catch(() => {
        // Token akan dimuat ulang jika diperlukan
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const token = csrfToken || (await fetchCsrfToken());
      const res = await fetch('/api/auth/ganti-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': token,
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || 'Gagal mengubah password.';
        setStatus({ type: 'error', msg });
        toast('error', msg);
      } else {
        setStatus({ type: 'success', msg: data.message });
        toast('success', data.message);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      const msg = 'Terjadi kesalahan jaringan.';
      setStatus({ type: 'error', msg });
      toast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
          Ganti Password
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan akses.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="ui-card space-y-4 p-6"
      >
        {status && (
          <div
            role="alert"
            className={`flex items-center gap-2.5 rounded-lg border p-3 text-sm font-medium ${
              status.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-200'
                : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/60 dark:text-rose-200'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{status.msg}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="old-pass"
            className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            Password Saat Ini
          </label>
          <div className="relative mt-1.5">
            <input
              id="old-pass"
              type={showOld ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Masukkan password saat ini"
              className="ui-input min-h-[44px] w-full pr-11 pl-3.5 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowOld((prev) => !prev)}
              aria-label={showOld ? 'Sembunyikan password saat ini' : 'Tampilkan password saat ini'}
              className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="new-pass"
            className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            Password Baru
          </label>
          <div className="relative mt-1.5">
            <input
              id="new-pass"
              type={showNew ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan password baru"
              className="ui-input min-h-[44px] w-full pr-11 pl-3.5 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowNew((prev) => !prev)}
              aria-label={showNew ? 'Sembunyikan password baru' : 'Tampilkan password baru'}
              className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Minimal 6 karakter.</p>
        </div>

        <div>
          <label
            htmlFor="confirm-pass"
            className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            Konfirmasi Password Baru
          </label>
          <div className="relative mt-1.5">
            <input
              id="confirm-pass"
              type={showConfirm ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="ui-input min-h-[44px] w-full pr-11 pl-3.5 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              aria-label={
                showConfirm
                  ? 'Sembunyikan konfirmasi password'
                  : 'Tampilkan konfirmasi password'
              }
              className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="ui-btn-primary inline-flex min-h-[44px] w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <KeyRound className="h-4 w-4" />
          <span>{loading ? 'Menyimpan...' : 'Simpan Password Baru'}</span>
        </button>
      </form>
    </div>
  );
}
