'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUi } from '@/components/ui/UiProvider';
import { logoutUser } from '@/lib/client-auth';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  User,
  KeyRound,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  isMini: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const mainMenuItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Data Mahasiswa', href: '/mahasiswa', icon: Users },
  { label: 'Data Prodi', href: '/prodi', icon: GraduationCap },
];

const accountMenuItems = [
  { label: 'Profil', href: '/profil', icon: User },
  { label: 'Ganti Password', href: '/ganti-password', icon: KeyRound },
];

export default function Sidebar({
  isMini,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { confirm: confirmDialog } = useUi();

  const handleLogout = async () => {
    if (
      await confirmDialog({
        title: 'Keluar dari aplikasi?',
        message: 'Sesi Anda akan diakhiri dan Anda perlu login kembali.',
        confirmText: 'Ya, Keluar',
      })
    ) {
      await logoutUser();
      onCloseMobile();
      router.replace('/login');
      router.refresh();
    }
  };

  const renderLink = (item: { label: string; href: string; icon: typeof LayoutDashboard }) => {
    const Icon = item.icon;
    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onCloseMobile}
        title={isMini ? item.label : undefined}
        className={`group flex min-h-[42px] items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? 'bg-blue-50 font-semibold text-blue-700'
            : 'font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
        } ${isMini ? 'md:justify-center md:px-0' : ''}`}
      >
        <Icon
          className={`h-5 w-5 shrink-0 ${
            isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'
          }`}
          aria-hidden="true"
        />
        <span className={`truncate ${isMini ? 'md:hidden' : 'block'}`}>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/80 bg-white text-slate-700 transition-all duration-300 ease-in-out md:static md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isMini ? 'md:w-20' : 'md:w-64'} w-64 shrink-0`}
      >
        {/* Header Logo */}
        <div
          className={`flex h-16 items-center justify-between border-b border-slate-200/80 px-4 ${
            isMini ? 'md:justify-center md:px-0' : ''
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              SM
            </div>
            <span
              className={`truncate text-base font-bold tracking-tight text-slate-900 ${
                isMini ? 'md:hidden' : 'block'
              }`}
            >
              SiAkademik
            </span>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup Menu Sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Daftar Menu Navigasi */}
        <nav className="flex-1 space-y-5 overflow-y-auto p-3">
          <div>
            <p
              className={`px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase ${
                isMini ? 'md:hidden' : 'block'
              }`}
            >
              Menu Utama
            </p>
            <div className="space-y-1">{mainMenuItems.map(renderLink)}</div>
          </div>

          <div>
            <p
              className={`px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase ${
                isMini ? 'md:hidden' : 'block'
              }`}
            >
              Akun
            </p>
            <div className="space-y-1">{accountMenuItems.map(renderLink)}</div>
          </div>
        </nav>

        {/* Tombol Logout */}
        <div className="border-t border-slate-200/80 p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={isMini ? 'Logout' : undefined}
            className={`flex min-h-[42px] w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 ${
              isMini ? 'md:justify-center md:px-0' : ''
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={`truncate ${isMini ? 'md:hidden' : 'block'}`}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
