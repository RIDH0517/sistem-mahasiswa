'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="ui-card mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
        Terjadi kesalahan
      </h2>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
        Halaman tidak dapat dimuat saat ini. Silakan coba muat ulang.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="ui-btn-primary inline-flex min-h-[42px] items-center gap-2 px-4 text-sm font-semibold"
        >
          <RotateCcw className="h-4 w-4" />
          Coba Lagi
        </button>
        <Link
          href="/"
          className="ui-btn-secondary inline-flex min-h-[42px] items-center gap-2 px-4 text-sm font-semibold"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
