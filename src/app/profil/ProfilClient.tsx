'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, AtSign, Pencil, Save, X } from 'lucide-react';
import { useUi } from '@/components/ui/UiProvider';
import { fetchCsrfToken } from '@/lib/client-auth';

export interface ProfilData {
  username: string;
  nama_lengkap: string;
  email: string;
}

export default function ProfilClient({ profil }: { profil: ProfilData }) {
  const router = useRouter();
  const { toast } = useUi();
  const [csrfToken, setCsrfToken] = useState('');
  const [editing, setEditing] = useState(false);
  const [nama, setNama] = useState(profil.nama_lengkap);
  const [email, setEmail] = useState(profil.email);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCsrfToken()
      .then(setCsrfToken)
      .catch(() => {
        // Token akan dimuat ulang saat menyimpan
      });
  }, []);

  const initials =
    profil.nama_lengkap
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') || 'U';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setSaving(true);
    try {
      const token = csrfToken || (await fetchCsrfToken());
      const res = await fetch('/api/auth/profil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': token },
        body: JSON.stringify({ nama_lengkap: nama, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || 'Gagal menyimpan profil.';
        setStatus({ type: 'error', msg });
        toast('error', msg);
      } else {
        setStatus({ type: 'success', msg: data.message });
        toast('success', data.message);
        setEditing(false);
        window.dispatchEvent(new Event('profile-updated'));
        router.refresh();
      }
    } catch {
      const msg = 'Terjadi kesalahan jaringan.';
      setStatus({ type: 'error', msg });
      toast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setNama(profil.nama_lengkap);
    setEmail(profil.email);
    setStatus(null);
    setEditing(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
          Profil Pengguna
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Informasi akun yang sedang login.
        </p>
      </div>

      <div className="ui-card overflow-hidden p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-solid text-xl font-bold text-white sm:h-20 sm:w-20 sm:text-2xl">
            {initials}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {profil.nama_lengkap}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{profil.username}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              <Shield className="h-3.5 w-3.5" /> Akun Aktif
            </span>
          </div>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="ui-btn-secondary inline-flex min-h-[40px] items-center gap-2 px-3.5 text-sm font-semibold"
            >
              <Pencil className="h-4 w-4" /> Edit Profil
            </button>
          )}
        </div>

        {status && (
          <div
            role="alert"
            className={`mt-4 rounded-lg border p-3 text-sm font-medium ${
              status.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-200'
                : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/60 dark:text-rose-200'
            }`}
          >
            {status.msg}
          </div>
        )}

        {editing ? (
          <form
            onSubmit={handleSave}
            className="mt-6 space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800"
          >
            <div>
              <label
                htmlFor="nama"
                className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
              >
                Nama Lengkap
              </label>
              <input
                id="nama"
                type="text"
                required
                maxLength={100}
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="ui-input mt-1.5 min-h-[44px] w-full px-3.5 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                maxLength={100}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ui-input mt-1.5 min-h-[44px] w-full px-3.5 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="ui-btn-secondary inline-flex min-h-[42px] items-center gap-2 px-4 text-sm font-semibold"
              >
                <X className="h-4 w-4" /> Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="ui-btn-primary inline-flex min-h-[42px] items-center gap-2 px-5 text-sm font-semibold disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 dark:border-slate-800">
            <div className="ui-card-subtle p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">
                <User className="h-4 w-4 text-accent-text" /> Nama Lengkap
              </div>
              <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                {profil.nama_lengkap}
              </p>
            </div>
            <div className="ui-card-subtle p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">
                <AtSign className="h-4 w-4 text-accent-text" /> Username
              </div>
              <p className="mt-1 font-mono font-semibold text-slate-900 dark:text-slate-100">
                {profil.username}
              </p>
            </div>
            <div className="ui-card-subtle p-4 sm:col-span-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">
                <Mail className="h-4 w-4 text-accent-text" /> Email
              </div>
              <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{profil.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
