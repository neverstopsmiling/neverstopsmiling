/* Frostspire service worker v3 — network-first for HTML. */
const CACHE = "frostspire-v3";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isHTML = req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/");
  if (isHTML) {
    event.respondWith(
      fetch(req).then((r) => {
        if (r && r.status === 200) { const c = r.clone(); caches.open(CACHE).then((ch) => ch.put(req, c)).catch(() => {}); }
        return r;
      }).catch(() => caches.match(req))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => {
      const f = fetch(req).then((r) => {
        if (r && r.status === 200 && (r.type === "basic" || r.type === "cors")) { const c = r.clone(); caches.open(CACHE).then((ch) => ch.put(req, c)).catch(() => {}); }
        return r;
      }).catch(() => cached);
      return cached || f;
    })
  );
});
