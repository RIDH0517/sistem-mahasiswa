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
  const [user, setUser] = useState<{ nama_lengkap: string; email: string } | null>(null);

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
    let cancelled = false;

    const loadUser = () =>
      fetch('/api/auth/me', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (cancelled) return;
          if (data?.authenticated) {
            setUser(data.user);
          } else if (data) {
            router.replace('/login');
          } else {
            window.location.href = '/login';
          }
        })
        .catch(() => {
          // Abaikan error jaringan agar tidak memicu loop pengalihan
        });

    loadUser();
    window.addEventListener('profile-updated', loadUser);
    return () => {
      cancelled = true;
      window.removeEventListener('profile-updated', loadUser);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
          user={user}
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