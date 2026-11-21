'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  User,
  KeyRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  isMini: boolean;
  onToggleMini: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const menuItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Data Mahasiswa', href: '/mahasiswa', icon: Users },
  { label: 'Data Prodi', href: '/prodi', icon: GraduationCap },
  { label: 'Profil', href: '/profil', icon: User },
  { label: 'Ganti Password', href: '/ganti-password', icon: KeyRound },
];

export default function Sidebar({
  isMini,
  onToggleMini,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
      const csrfRes = await fetch('/api/auth/csrf').then((r) => r.json());
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'x-csrf-token': csrfRes.csrfToken },
      });
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* Backdrop gelap saat sidebar dibuka di layar Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Kontainer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out md:static md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isMini ? 'md:w-20' : 'md:w-64'} w-64 shrink-0 border-r border-slate-800`}
      >
        {/* Header Logo & Tombol Toggle Mini Sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-xs">
              SM
            </div>
            {!isMini && (
              <span className="truncate text-lg font-bold tracking-tight text-white">
                SiAkademik
              </span>
            )}
          </div>

          {/* Tombol Toggle Mini (Hanya muncul di Desktop) */}
          <button
            onClick={onToggleMini}
            aria-label={isMini ? 'Perlebar Sidebar' : 'Perkecil Sidebar'}
            title={isMini ? 'Perlebar Sidebar' : 'Perkecil Sidebar'}
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:flex"
          >
            {isMini ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>

          {/* Tombol Tutup Drawer (Hanya muncul di Mobile) */}
          <button
            onClick={onCloseMobile}
            aria-label="Tutup Menu Sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Daftar Menu Navigasi (5 Menu Halaman) */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isMini ? item.label : undefined}
                className={`group flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                } ${isMini ? 'md:justify-center md:px-0' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className={`truncate ${isMini ? 'md:hidden' : 'block'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Menu ke-6: Tombol Logout di bagian bawah Sidebar */}
        <div className="border-t border-slate-800 p-3">
          <button
            onClick={handleLogout}
            title={isMini ? 'Logout' : undefined}
            className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 ${
              isMini ? 'md:justify-center md:px-0' : ''
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={`truncate ${isMini ? 'md:hidden' : 'block'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}