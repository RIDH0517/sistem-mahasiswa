'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

const STORAGE_KEY = 'sidebar_mini';
const SIDEBAR_EVENT = 'sidebar-mini-change';

function subscribeSidebar(callback: () => void) {
  window.addEventListener(SIDEBAR_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(SIDEBAR_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getSidebarSnapshot(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMini = useSyncExternalStore(subscribeSidebar, getSidebarSnapshot, () => false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [user, setUser] = useState<{ nama_lengkap: string; email: string } | null>(null);

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
          } else {
            router.replace('/login');
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
  }, [pathname, router]);

  const handleToggleMini = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(!isMini));
      window.dispatchEvent(new Event(SIDEBAR_EVENT));
    } catch (error) {
      console.error('Gagal menyimpan ke localStorage:', error);
    }
  };

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        isMini={isMini}
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
        <main className="flex-1 px-4 py-5 pb-24 sm:px-6 md:py-7 md:pb-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
