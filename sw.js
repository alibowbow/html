// Network-first service worker.
// Goal: a plain refresh always shows the latest deploy on GitHub Pages, where we
// can't set HTTP cache headers. Same-origin GET requests are fetched fresh from
// the network (bypassing the HTTP cache); cross-origin requests (CDN fonts,
// icons, libraries) keep their normal browser caching.

self.addEventListener('install', function () {
  // Activate this worker immediately instead of waiting for old tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  // Take control of open pages as soon as the new worker activates.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }

  // Only manage our own files; let cross-origin (CDN) requests pass through.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req, { cache: 'no-store' }).catch(function () {
      // Offline fallback: nothing precached, so this just surfaces the network error.
      return caches.match(req);
    })
  );
});
