import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <span className="rounded-md bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-700">
        404
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-900">Halaman tidak ditemukan</h2>
      <p className="mt-1.5 text-sm text-slate-600">
        Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
      >
        <Home className="h-4 w-4" />
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
