import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';
import UiProvider from '@/components/ui/UiProvider';

export const metadata: Metadata = {
  title: 'SiAkademik - Sistem Informasi Mahasiswa',
  description: 'Aplikasi Manajemen Data Mahasiswa & Program Studi',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <UiProvider>
          <AppShell>{children}</AppShell>
        </UiProvider>
        <script
          dangerouslySetInnerHTML={{
            __html:
              process.env.NODE_ENV === 'production'
                ? `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration failed: ', err);
                  });
                });
              }
            `
                : `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  regs.forEach(function(r) { r.unregister(); });
                });
                if (window.caches) {
                  caches.keys().then(function(keys) {
                    keys.forEach(function(k) { caches.delete(k); });
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}