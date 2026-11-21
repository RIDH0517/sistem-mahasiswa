'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

const STORAGE_KEY = 'sidebar_mini';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMini, setIsMini] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState !== null) {
        setIsMini(JSON.parse(savedState));
      }
    } catch (error) {
      console.error('Gagal membaca localStorage:', error);
    }
  }, []);

  // Cek sesi login setiap berpindah halaman
  useEffect(() => {
    if (pathname === '/login') return;
    fetch('/api/auth/csrf')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.replace('/login');
        }
      });
  }, [pathname, router]);

  const handleToggleMini = () => {
    setIsMini((prev) => {
      const nextValue = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextValue));
      } catch (error) {
        console.error('Gagal menyimpan ke localStorage:', error);
      }
      return nextValue;
    });
  };

  // Jika sedang di halaman /login, tampilkan halaman penuh tanpa Sidebar/Navbar
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        isMini={isMini}
        onToggleMini={handleToggleMini}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          isMini={isMini}
          onToggleMini={handleToggleMini}
          onOpenMobile={() => setIsMobileOpen(true)}
        />
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}