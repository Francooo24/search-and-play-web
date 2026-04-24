const CACHE = "snp-v1";
const OFFLINE_URL = "/offline";
const STATIC = ["/", "/offline", "/manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== "GET" || url.origin !== location.origin) return;

  // API routes: network-only
  if (url.pathname.startsWith("/api/")) return;

  // Static assets: cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(request).then(cached => cached ?? fetch(request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // Pages: network-first, fallback to cache, then offline page
  e.respondWith(
    fetch(request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(request, clone));
        return res;
      })
      .catch(() => caches.match(request).then(cached => cached ?? caches.match(OFFLINE_URL)))
  );
});
