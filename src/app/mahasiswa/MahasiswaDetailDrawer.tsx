'use client';

import { useEffect, useRef, useState } from 'react';
import {
  X,
  Copy,
  Check,
  Mail,
  Pencil,
  Trash2,
  GraduationCap,
  CalendarDays,
  User,
  Hash,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useUi } from '@/components/ui/UiProvider';
import type { MahasiswaRow } from './MahasiswaTableClient';

interface MahasiswaDetailDrawerProps {
  mahasiswa: MahasiswaRow | null;
  prodiBadgeClass: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onEdit: (mhs: MahasiswaRow) => void;
  onDelete: (mhs: MahasiswaRow) => void;
  onFilterProdi: (kodeProdi: string) => void;
  onFilterAngkatan: (angkatan: number) => void;
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback ke execCommand
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.remove();
    return ok;
  } catch {
    return false;
  }
}

function formatTanggalTerdaftar(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
}

export default function MahasiswaDetailDrawer({
  mahasiswa,
  prodiBadgeClass,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
  onEdit,
  onDelete,
  onFilterProdi,
  onFilterAngkatan,
}: MahasiswaDetailDrawerProps) {
  const { toast } = useUi();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mahasiswa) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        Boolean(target?.isContentEditable);

      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (isInputFocused) return;
      if (e.key === 'ArrowLeft' && hasPrev) {
        onPrev();
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mahasiswa, hasPrev, hasNext, onClose, onPrev, onNext]);

  if (!mahasiswa) return null;

  const initials =
    mahasiswa.nama
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'M';

  const nimKey = `${mahasiswa.id}:nim`;
  const emailKey = `${mahasiswa.id}:email`;
  const isNimCopied = copiedKey === nimKey;
  const isEmailCopied = copiedKey === emailKey;

  const handleCopy = async (text: string, key: string, label: string) => {
    const ok = await copyTextToClipboard(text);
    if (!ok) {
      toast('error', `Gagal menyalin ${label}.`);
      return;
    }
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    setCopiedKey(key);
    copyTimerRef.current = setTimeout(() => {
      copyTimerRef.current = null;
      setCopiedKey(null);
    }, 1800);
    toast('success', `${label} (${text}) disalin ke clipboard.`);
  };

  return (
    <div
      className="ui-drawer-backdrop fixed inset-0 z-50 flex justify-end bg-slate-900/50 p-0 backdrop-blur-xs sm:p-3 dark:bg-black/70"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="mhs-drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="ui-modal ui-drawer-panel flex h-full w-full max-w-md flex-col overflow-hidden"
      >
        {/* Header Drawer */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
              Quick View
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Detail Mahasiswa
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPrev}
              disabled={!hasPrev}
              aria-label="Mahasiswa sebelumnya"
              title="Mahasiswa sebelumnya (Panah Kiri)"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              aria-label="Mahasiswa berikutnya"
              title="Mahasiswa berikutnya (Panah Kanan)"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup panel detail"
              title="Tutup (Esc)"
              className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Konten Detail */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {/* Kartu Profil Ringkas */}
          <div className="ui-card-subtle p-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-accent-solid text-base font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <h4
                  id="mhs-drawer-title"
                  className="text-base leading-snug font-bold text-slate-900 dark:text-slate-100"
                >
                  {mahasiswa.nama}
                </h4>
                <p className="mt-0.5 font-mono text-xs font-semibold text-slate-500 tabular-nums dark:text-slate-400">
                  NIM {mahasiswa.nim}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold ${prodiBadgeClass}`}
                  >
                    {mahasiswa.kode_prodi}
                  </span>
                  {mahasiswa.jenjang && (
                    <span className="inline-flex items-center rounded-md bg-slate-200/70 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-700/70 dark:text-slate-200">
                      {mahasiswa.jenjang}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                      mahasiswa.jenis_kelamin === 'L'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                    }`}
                  >
                    {mahasiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-text tabular-nums">
                    Angkatan {mahasiswa.angkatan}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Aksi Cepat: Salin NIM & Kirim Email */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleCopy(mahasiswa.nim, nimKey, 'NIM')}
              className="ui-btn-secondary inline-flex min-h-[42px] items-center justify-center gap-2 px-3 text-xs font-semibold"
            >
              {isNimCopied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>NIM Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Salin NIM</span>
                </>
              )}
            </button>

            <a
              href={`mailto:${mahasiswa.email}`}
              className="ui-btn-secondary inline-flex min-h-[42px] items-center justify-center gap-2 px-3 text-xs font-semibold"
            >
              <Mail className="h-4 w-4" />
              <span>Kirim Email</span>
            </a>
          </div>

          {/* Daftar Atribut Akademik */}
          <div className="space-y-2.5">
            <div className="ui-card-subtle flex items-center justify-between gap-3 p-3.5">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  <Hash className="h-3.5 w-3.5 text-accent-text" /> NIM
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {mahasiswa.nim}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(mahasiswa.nim, nimKey, 'NIM')}
                aria-label="Salin NIM"
                title="Salin NIM"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                {isNimCopied ? (
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="ui-card-subtle flex items-center justify-between gap-3 p-3.5">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5 text-accent-text" /> Email Mahasiswa
                </p>
                <p className="mt-1 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {mahasiswa.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(mahasiswa.email, emailKey, 'Email')}
                aria-label="Salin email"
                title="Salin email"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                {isEmailCopied ? (
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="ui-card-subtle flex items-center justify-between gap-3 p-3.5">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  <GraduationCap className="h-3.5 w-3.5 text-accent-text" /> Program Studi
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {mahasiswa.nama_prodi}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kode {mahasiswa.kode_prodi}
                  {mahasiswa.jenjang ? ` • Jenjang ${mahasiswa.jenjang}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onFilterProdi(mahasiswa.kode_prodi)}
                title={`Filter prodi ${mahasiswa.kode_prodi}`}
                className="inline-flex shrink-0 items-center gap-1 rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-text hover:underline"
              >
                <Filter className="h-3 w-3" />
                <span>Filter</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="ui-card-subtle p-3.5">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  <User className="h-3.5 w-3.5 text-accent-text" /> Gender
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {mahasiswa.jenis_kelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                </p>
              </div>

              <div className="ui-card-subtle flex items-start justify-between gap-2 p-3.5">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5 text-accent-text" /> Angkatan
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {mahasiswa.angkatan}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onFilterAngkatan(mahasiswa.angkatan)}
                  title={`Filter angkatan ${mahasiswa.angkatan}`}
                  aria-label={`Filter angkatan ${mahasiswa.angkatan}`}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-text hover:opacity-85"
                >
                  <Filter className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="ui-card-subtle p-3.5">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                <Clock className="h-3.5 w-3.5 text-accent-text" /> Terdaftar Sejak
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {formatTanggalTerdaftar(mahasiswa.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Aksi Edit & Hapus */}
        <div className="flex shrink-0 items-center gap-2.5 border-t border-slate-200/80 px-5 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onEdit(mahasiswa)}
            className="ui-btn-primary inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 px-4 text-sm font-semibold"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit Data</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(mahasiswa)}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
          >
            <Trash2 className="h-4 w-4" />
            <span>Hapus</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
