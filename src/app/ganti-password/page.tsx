'use client';

import { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function GantiPasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/csrf')
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken || ''));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/ganti-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', msg: data.error || 'Gagal mengubah password' });
      } else {
        setStatus({ type: 'success', msg: data.message });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setStatus({ type: 'error', msg: 'Terjadi kesalahan jaringan.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Ganti Password</h2>
        <p className="text-sm text-slate-600">
          Perbarui kata sandi akun di database MySQL dengan perlindungan token CSRF.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-2xs"
      >
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-2 text-xs text-blue-800">
          <span className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            Dilindungi CSRF Token
          </span>
          <span className="font-mono text-[11px]">{csrfToken.slice(0, 12)}...</span>
        </div>

        {status && (
          <div
            className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium ${
              status.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{status.msg}</span>
          </div>
        )}

        <div>
          <label htmlFor="old-pass" className="block text-sm font-medium text-slate-700">
            Password Saat Ini
          </label>
          <input
            id="old-pass"
            type="password"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="new-pass" className="block text-sm font-medium text-slate-700">
            Password Baru (Min. 6 Karakter)
          </label>
          <input
            id="new-pass"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="confirm-pass" className="block text-sm font-medium text-slate-700">
            Konfirmasi Password Baru
          </label>
          <input
            id="confirm-pass"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          <KeyRound className="h-4 w-4" />
          <span>{loading ? 'Menyimpan...' : 'Simpan Password Baru'}</span>
        </button>
      </form>
    </div>
  );
}