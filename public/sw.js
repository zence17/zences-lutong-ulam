const CACHE_NAME = 'zences-lutong-ulam-v1';
const CORE_ASSETS = [
  '/',
  '/presyo',
  '/meal-plan',
  '/negosyo',
  '/recipes/custom',
  '/icon.svg',
  '/manifest.webmanifest',
  '/recipes/pork-adobo',
  '/recipes/sinigang-na-baboy',
  '/recipes/tortang-talong',
  '/recipes/chicken-tinola',
  '/recipes/ginisang-monggo',
  '/recipes/bistek-tagalog',
  '/recipes/adobong-kangkong',
  '/recipes/ginataang-kalabasa-at-sitaw',
  '/recipes/lumpiang-shanghai',
  '/recipes/chicken-arroz-caldo',
  '/recipes/classic-tablea-champorado',
  '/recipes/ginisang-sardinas-with-misua',
  '/recipes/pork-menudo',
  '/recipes/ginisang-ampalaya-with-egg'
];

const scopeUrl = new URL(self.registration.scope);
const withBase = (path) => new URL(path.replace(/^\//, ''), scopeUrl).toString();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS.map(withBase))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

const isStaticAsset = (url) => {
  if (url.origin !== self.location.origin) return false;
  const pathname = url.pathname;
  return (
    pathname.includes('/_next/static/') ||
    pathname.includes('/images/') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.woff2')
  );
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(withBase('/'))))
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request)
            .then((response) => {
              if (response && response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) =>
      cached ||
      fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
    )
  );
});
