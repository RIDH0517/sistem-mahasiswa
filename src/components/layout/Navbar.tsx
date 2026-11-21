'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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
  isMini: boolean;
  onToggleMini: () => void;
  onOpenMobile: () => void;
}

export default function Navbar({
  isMini,
  onToggleMini,
  onOpenMobile,
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown otomatis jika klik di luar komponen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs md:px-6">
      {/* Sisi Kiri: Toggle Drawer (Mobile) & Toggle Mini Sidebar (Desktop) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          aria-label="Buka Menu Navigasi"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <button
          onClick={onToggleMini}
          aria-label="Toggle Mini Sidebar"
          title={isMini ? 'Perlebar Sidebar' : 'Perkecil Sidebar'}
          className="hidden h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 md:flex"
        >
          {isMini ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        <h1 className="text-base font-semibold text-slate-800 sm:text-lg">
          Sistem Informasi Mahasiswa
        </h1>
      </div>

      {/* Sisi Kanan: Profile Menu Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
          className="flex min-h-[44px] items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            AD
          </div>
          <span className="hidden sm:inline-block">Administrator</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Panel Dropdown (Profil, Ganti Password, Logout) */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg ring-1 ring-black/5">
            <div className="border-b border-slate-100 px-4 py-2.5">
              <p className="text-sm font-semibold text-slate-800">Administrator</p>
              <p className="truncate text-xs text-slate-500">admin@akademik.ac.id</p>
            </div>

            <div className="py-1">
              <Link
                href="/profil"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
              >
                <User className="h-4 w-4 text-slate-500" />
                Profil
              </Link>
              <Link
                href="/ganti-password"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
              >
                <KeyRound className="h-4 w-4 text-slate-500" />
                Ganti Password
              </Link>
            </div>

            <div className="border-t border-slate-100 pt-1">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
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