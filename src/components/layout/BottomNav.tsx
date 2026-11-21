'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  User,
  KeyRound,
} from 'lucide-react';

const mobileNavItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Mahasiswa', href: '/mahasiswa', icon: Users },
  { label: 'Prodi', href: '/prodi', icon: GraduationCap },
  { label: 'Profil', href: '/profil', icon: User },
  { label: 'Password', href: '/ganti-password', icon: KeyRound },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed right-0 bottom-0 left-0 z-30 flex min-h-16 items-center justify-around border-t border-slate-200/80 bg-white/95 px-1 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden"
    >
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[11px] transition-colors ${
              isActive
                ? 'font-semibold text-blue-700'
                : 'font-medium text-slate-500 hover:text-slate-900'
            }`}
          >
            <span
              className={`inline-flex items-center justify-center rounded-full px-3 py-1 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500'
              }`}
            >
              <Icon
                className={`h-4 w-4 ${isActive ? 'stroke-[2.25px]' : ''}`}
                aria-hidden="true"
              />
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
