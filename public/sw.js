const CACHE_NAME = 'siakademik-pwa-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

// Hapus semua cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
      )
      .then(() => self.clients.claim())
  );
});

// Network-first: data dari database selalu terbaru.
// Request non-GET, /api, dan /_next tidak pernah di-cache/dicegat.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next')) return;
  if (request.mode === 'navigate') return; // halaman selalu dari server

  // Hanya aset statis (ikon, gambar) yang di-cache
  if (!/\.(png|jpg|jpeg|svg|ico|webp)$/.test(url.pathname)) return;

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(request, copy));
        return res;
      })
      .catch(() => caches.match(request))
  );
});
