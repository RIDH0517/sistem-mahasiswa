import Link from 'next/link';
import { Users, GraduationCap, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Dashboard Akademik</h2>
        <p className="text-sm text-slate-600">Selamat datang di Sistem Informasi Mahasiswa & Program Studi.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/mahasiswa"
          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Terdaftar</p>
              <h3 className="text-xl font-bold text-slate-900">100 Mahasiswa</h3>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
        </Link>

        <Link
          href="/prodi"
          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Program Studi</p>
              <h3 className="text-xl font-bold text-slate-900">4 Prodi (PTE, PTIK, TE, TEKKOM)</h3>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
        </Link>
      </div>
    </div>
  );
}