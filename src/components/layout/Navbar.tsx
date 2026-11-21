'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUi } from '@/components/ui/UiProvider';
import { logoutUser } from '@/lib/client-auth';
import {
  Menu,
  User,
  KeyRound,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface NavbarProps {
  user: { nama_lengkap: string; email: string } | null;
  isMini: boolean;
  onToggleMini: () => void;
  onOpenMobile: () => void;
}

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/mahasiswa')) return 'Data Mahasiswa';
  if (pathname.startsWith('/prodi')) return 'Data Program Studi';
  if (pathname.startsWith('/profil')) return 'Profil Pengguna';
  if (pathname.startsWith('/ganti-password')) return 'Ganti Password';
  return 'SiAkademik';
}

export default function Navbar({
  user,
  isMini,
  onToggleMini,
  onOpenMobile,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { confirm: confirmDialog } = useUi();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageTitle = getPageTitle(pathname);
  const displayName = user?.nama_lengkap || 'Memuat...';
  const displayEmail = user?.email || '';
  const initials =
    user?.nama_lengkap
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') || '..';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    if (
      await confirmDialog({
        title: 'Keluar dari aplikasi?',
        message: 'Sesi Anda akan diakhiri dan Anda perlu login kembali.',
        confirmText: 'Ya, Keluar',
      })
    ) {
      await logoutUser();
      router.replace('/login');
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-sm md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Buka Menu Navigasi"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onToggleMini}
          aria-label="Toggle Mini Sidebar"
          title={isMini ? 'Perlebar Sidebar' : 'Perkecil Sidebar'}
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:flex"
        >
          {isMini ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
          {pageTitle}
        </h1>
      </div>

      {/* Profile Menu Dropdown */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
          className="flex min-h-[40px] items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 py-1 pr-2.5 pl-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {initials}
          </div>
          <span className="hidden max-w-[160px] truncate sm:inline-block">{displayName}</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-lg">
            <div className="border-b border-slate-100 px-4 py-2.5">
              <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="truncate text-xs text-slate-500">{displayEmail}</p>
            </div>

            <div className="py-1">
              <Link
                href="/profil"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <User className="h-4 w-4 text-slate-400" />
                Profil
              </Link>
              <Link
                href="/ganti-password"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <KeyRound className="h-4 w-4 text-slate-400" />
                Ganti Password
              </Link>
            </div>

            <div className="border-t border-slate-100 pt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
