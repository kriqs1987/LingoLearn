
const CACHE_NAME = 'lingolearn-v1';

// Libraries to cache immediately on install
const PRECACHE_URLS = [
  'https://cdn.tailwindcss.com'
];

// Domains that store our libraries (React, Tailwind, Gemini SDK)
const CDN_DOMAINS = [
  'cdn.tailwindcss.com',
  'aistudiocdn.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Ignore API calls to Google Gemini (they must be online)
  if (url.hostname.includes('generativelanguage.googleapis.com')) {
    return; // Go directly to network
  }

  // 2. Strategy for External Libraries (CDN): Cache First, Fallback to Network
  // If we have React/Tailwind in memory, use it. If not, download and save it.
  if (CDN_DOMAINS.some(domain => url.hostname.includes(domain))) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          // Don't cache bad responses
          if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }

  // 3. Strategy for Local App Files: Network First, Fallback to Cache
  // We try to get the latest version of your code. If offline, we use the cached version.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If network fetch succeeds, cache this fresh version
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // If network fails (Offline), try to serve from cache
        return caches.match(event.request);
      })
  );
});
