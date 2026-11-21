export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" role="status" aria-label="Memuat halaman">
      <div className="space-y-2">
        <div className="h-7 w-56 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-80 max-w-full rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="ui-card flex items-center gap-4 p-6"
          >
            <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>

      <div className="ui-card overflow-hidden">
        <div className="h-12 border-b border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/60" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 dark:border-slate-800"
          >
            <div className="h-4 w-8 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 flex-1 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
      <span className="sr-only">Memuat...</span>
    </div>
  );
}
