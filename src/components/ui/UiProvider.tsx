'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

interface UiContextValue {
  toast: (type: ToastType, message: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const UiContext = createContext<UiContextValue | null>(null);

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi harus dipakai di dalam <UiProvider>');
  return ctx;
}

const TOAST_STYLES: Record<ToastType, { box: string; icon: React.ReactNode }> = {
  success: {
    box: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />,
  },
  error: {
    box: 'border-rose-200 bg-rose-50 text-rose-900',
    icon: <XCircle className="h-5 w-5 shrink-0 text-rose-600" />,
  },
  info: {
    box: 'border-blue-200 bg-blue-50 text-blue-900',
    icon: <Info className="h-5 w-5 shrink-0 text-blue-600" />,
  },
};

export default function UiProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const idRef = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, message: string) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
      setTimeout(() => dismissToast(id), type === 'error' ? 5000 : 3500);
    },
    [dismissToast]
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current?.(false);
      resolverRef.current = resolve;
      setDialog(options);
    });
  }, []);

  const closeDialog = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setDialog(null);
  }, []);

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDialog(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dialog, closeDialog]);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);
  const isDanger = dialog?.variant !== 'default';

  return (
    <UiContext.Provider value={value}>
      {children}

      {/* Toast */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-4 right-4 left-4 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:w-96"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-3.5 text-sm font-medium shadow-lg ${TOAST_STYLES[t.type].box}`}
          >
            {TOAST_STYLES[t.type].icon}
            <p className="flex-1 break-words">{t.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Tutup notifikasi"
              className="rounded p-0.5 opacity-60 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal Konfirmasi */}
      {dialog && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          onClick={() => closeDialog(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <div className="flex gap-4 p-6">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  isDanger ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                }`}
              >
                {isDanger ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
              </div>
              <div>
                <h3 id="confirm-title" className="text-base font-bold text-slate-900">
                  {dialog.title || 'Konfirmasi'}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{dialog.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 bg-slate-50 px-6 py-4">
              <button
                type="button"
                autoFocus
                onClick={() => closeDialog(false)}
                className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {dialog.cancelText || 'Batal'}
              </button>
              <button
                type="button"
                onClick={() => closeDialog(true)}
                className={`min-h-[40px] rounded-lg px-4 text-sm font-semibold text-white ${
                  isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {dialog.confirmText || 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UiContext.Provider>
  );
}
