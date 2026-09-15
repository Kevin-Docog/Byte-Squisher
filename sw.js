// Service worker for the Compressor app.
// Goal: after one successful online visit, the whole site — including the
// CDN helper libraries used by Audio/PDF/DOCX — works with zero internet.
//
// Bump CACHE_VERSION whenever you update index.html/compressor.html so
// visitors pick up the new file instead of an old cached copy.
const CACHE_VERSION = 'v2';
const CACHE_NAME = 'compressor-cache-' + CACHE_VERSION;

// Everything worth having ready before the visitor even clicks a tool.
// Unreachable/renamed files are ignored individually (see install handler)
// so this list is deliberately over-inclusive.
const PRECACHE_URLS = [
  './',
  './index.html',
  './compressor.html',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
  'https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js',
  'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js',
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
  'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        PRECACHE_URLS.map(url =>
          fetch(url, { mode: 'cors' })
            .then(res => { if (res && res.ok) return cache.put(url, res); })
            .catch(() => {}) // e.g. compressor.html doesn't exist if you renamed it — fine, skip it
        )
      )
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first: instant + offline-proof once something has been fetched once.
// Anything not precached (e.g. the actual Google Fonts .woff2 files, which
// have hashed URLs) gets caught and stored the first time it's requested.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached); // offline and nothing cached — let it fail quietly
    })
  );
});
