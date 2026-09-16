// Byte Squisher service worker
// Everything the app needs is already baked into index.html as a single
// file, so all this worker has to do is cache that one file (plus the
// manifest/icons) and serve it back when offline.
//
// Update flow: a new service worker installs in the background and then
// waits (it does NOT self.skipWaiting() automatically) so an update never
// yanks the rug out from under someone mid-task. index.html listens for
// that waiting worker and shows an "update available" banner; only when
// the person taps it do we post {type:'SKIP_WAITING'} here, which lets
// this worker activate and take over.

const CACHE_NAME = 'byte-squisher-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  './favicon-16.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  // Intentionally no self.skipWaiting() here — see note above.
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Cache-first: this app is meant to work fully offline, so once a file is
// cached we serve it straight away instead of hitting the network.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
