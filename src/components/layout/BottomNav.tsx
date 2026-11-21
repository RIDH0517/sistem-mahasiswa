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
      className="fixed right-0 bottom-0 left-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-1 backdrop-blur-xs md:hidden"
    >
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors ${
              isActive
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                isActive ? 'stroke-[2.5px] text-blue-600' : 'text-slate-500'
              }`}
              aria-hidden="true"
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}