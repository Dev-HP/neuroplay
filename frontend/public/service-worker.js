const CACHE_NAME = 'neuroplay-v4';
const APP_ROOT = new URL('./', self.location).pathname;
const SHELL_FILES = [
  APP_ROOT,
  `${APP_ROOT}index.html`,
  `${APP_ROOT}favicon.svg`,
  `${APP_ROOT}404.html`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const isNavigation = event.request.mode === 'navigate';

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        }

        if (isNavigation) {
          return caches.match(`${APP_ROOT}index.html`).then((shell) => shell || response);
        }
        return response;
      })
      .catch(() => caches.match(event.request)
        .then((cached) => cached || (isNavigation
          ? caches.match(`${APP_ROOT}index.html`).then((shell) => shell || Response.error())
          : Response.error()))),
  );
});
