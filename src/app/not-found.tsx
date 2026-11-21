import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="ui-card mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center">
      <span className="rounded-md bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        404
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
        Halaman tidak ditemukan
      </h2>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
        Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        className="ui-btn-primary mt-6 inline-flex min-h-[42px] items-center gap-2 px-4 text-sm font-semibold"
      >
        <Home className="h-4 w-4" />
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
