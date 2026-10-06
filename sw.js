const CACHE_NAME = "bjj-connections-v34";
const APP_SHELL = [
  "/", "/index.html", "/puzzles.html", "/techniques.html",
  "/competition.html", "/training.html", "/resources.html", "/about.html",
  "/style.css", "/theme.js", "/nav.js", "/app.js", "/data.js", "/daily-progress.js", "/game-core.js", "/techniques.js", "/technique-videos.js", "/glossary-videos.js", "/resource-catalog.js", "/training.js", "/round-timer.js",
  "/favicon.svg?v=gi2", "/favicon-32.png?v=gi2", "/apple-touch-icon.png?v=gi2",
  "/logo.svg", "/favicon.svg", "/favicon-32.png", "/apple-touch-icon.png",
  "/icon-192.png", "/icon-512.png", "/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME)
    .then(cache => cache.addAll(APP_SHELL))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  // Fetch fresh content online and keep the last successful response for offline use.
  event.respondWith(fetch(request, {cache: "no-cache"}).then(response => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      // Query links still belong to the same cached page (for example ?p=42).
      const page = await caches.match(new URL(request.url).pathname);
      if (page) return page;
      const fallback = await caches.match("/index.html");
      if (fallback) return fallback;
    }
    return Response.error();
  }));
});
