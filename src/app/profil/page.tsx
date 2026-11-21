import { User, Mail, Shield, MapPin } from 'lucide-react';

export default function ProfilPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Profil Pengguna</h2>
        <p className="text-sm text-slate-600">Informasi akun administrator Sistem Informasi Mahasiswa.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
            AD
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Administrator Akademik</h3>
            <p className="text-sm text-slate-500">Fakultas Teknik • Universitas Negeri Semarang</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <Shield className="h-3.5 w-3.5" /> Akun Aktif
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
              <User className="h-4 w-4 text-blue-600" /> Nama Lengkap
            </div>
            <p className="mt-1 font-semibold text-slate-900">Administrator SiAkademik</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
              <Mail className="h-4 w-4 text-blue-600" /> Email Institusi
            </div>
            <p className="mt-1 font-semibold text-slate-900">admin@akademik.ac.id</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 sm:col-span-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
              <MapPin className="h-4 w-4 text-blue-600" /> Lokasi Kampus
            </div>
            <p className="mt-1 font-semibold text-slate-900">Kampus Sekaran, Gunungpati, Kota Semarang</p>
          </div>
        </div>
      </div>
    </div>
  );
}