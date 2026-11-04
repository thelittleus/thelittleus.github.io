/* little us · service worker
   Lets the free tools open without internet once they have been opened before.
   It never caches the admin page, the shop database or payments. */
const CACHE = 'littleus-v24';
const ASSETS = ['/', '/tools.js?v=18', '/lu-account.js?v=6', '/tools-calm.js?v=14', '/tools-talk.js?v=4', '/lu-app.js?v=9', '/lu-app.css?v=9', '/tools-art.js?v=17', '/tools-print.js?v=12', '/tools.css?v=16', '/articles.js?v=12', '/logo.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('littleus-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/admin')) return;
    // pages: always try the network first so the shop stays up to date
    if (req.mode === 'navigate') {
      e.respondWith(
        fetch(req).then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('/', copy)); }
          return res;
        }).catch(() => caches.match('/'))
      );
      return;
    }
    // static files: answer from the cache, refresh in the background
    if (/\.(js|css|png|webp|jpg|svg|woff2?)$/.test(url.pathname)) {
      e.respondWith(
        caches.open(CACHE).then((c) => c.match(req).then((hit) => {
          const net = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
          return hit || net;
        }))
      );
    }
    return;
  }

  // Google Fonts: cache once, reuse offline
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(CACHE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; })))
    );
  }
});
