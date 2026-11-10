/* Little Us · service worker
   Lets the free tools open without internet once they have been opened before, and makes repeat visits fast.
   It never caches the admin page, the shop database or payments. */
const CACHE = 'littleus-v74';
const IMAGES = 'littleus-img-v1';
// the files every visit needs; tool scripts (calm, Conversation Starters, printing, articles, legal) are cached the first time they are used
const ASSETS = ['/', '/tools.js?v=30', '/lu-account.js?v=20', '/lu-app.js?v=33', '/lu-app.css?v=24', '/tools-art.js?v=28', '/tools.css?v=21', '/logo.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('littleus-') && k !== CACHE && k !== IMAGES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// answer from the cache straight away, and refresh the cached copy in the background
function fromCache(cacheName, req, max) {
  return caches.open(cacheName).then((c) => c.match(req).then((hit) => {
    const net = fetch(req).then((res) => {
      if (res.ok || res.type === 'opaque') {
        c.put(req, res.clone()).then(() => max && c.keys().then((keys) => { if (keys.length > max) c.delete(keys[0]); }));
      }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/admin')) return;
    // pages: the network first so the site stays up to date, but if it is slow (over 2.5 s) show the saved copy
    // the DTT page (/dtt) is a different page from the site, so it keeps its own saved copy
    if (req.mode === 'navigate') {
      const page = /^\/dtt(\.html|\/)?$/.test(url.pathname) ? '/dtt' : '/';
      e.respondWith(new Promise((resolve) => {
        let done = false;
        const fallback = () => caches.match(page).then((hit) => { if (!done && hit) { done = true; resolve(hit); } });
        const timer = setTimeout(fallback, 2500);
        fetch(req).then((res) => {
          clearTimeout(timer);
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(page, copy)); }
          if (!done) { done = true; resolve(res); }
        }).catch(() => { clearTimeout(timer); caches.match(page).then((hit) => { if (!done) { done = true; resolve(hit || Response.error()); } }); });
      }));
      return;
    }
    if (/\.(js|css|png|webp|jpg|svg|woff2?)$/.test(url.pathname)) e.respondWith(fromCache(CACHE, req));
    return;
  }

  // product covers and resource pictures from the shop's storage
  if (/\.supabase\.co$/.test(url.hostname) && url.pathname.indexOf('/storage/v1/object/public/') === 0) {
    e.respondWith(fromCache(IMAGES, req, 150));
    return;
  }

  // Google Fonts: cache once, reuse offline
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(CACHE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; })))
    );
  }
});
