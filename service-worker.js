/* AgriFeed offline app shell for GitHub Pages /ARBambang/. */
const CACHE_NAME = 'agrifeed-pos-v1.4.0';
const APP_FILES = ['/ARBambang/','/ARBambang/index.html','/ARBambang/styles.css','/ARBambang/app.js','/ARBambang/manifest.json','/ARBambang/icon-192.png','/ARBambang/icon-512.png','/ARBambang/apple-touch-icon.png'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(APP_FILES.map(async url => {
      const response = await fetch(url, {cache:'reload'});
      if (response.ok) await cache.put(url, response);
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('agrifeed-pos-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/ARBambang/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        if (response.ok) await (await caches.open(CACHE_NAME)).put('/ARBambang/index.html', response.clone());
        return response;
      } catch {
        return (await caches.match('/ARBambang/index.html')) || (await caches.match('/ARBambang/'));
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) await (await caches.open(CACHE_NAME)).put(event.request, response.clone());
      return response;
    } catch {
      return new Response('Offline: this resource is not cached.', {status:503,statusText:'Offline'});
    }
  })());
});
