const CACHE_NAME = "bjj-connections-v49";
const APP_SHELL = [
  "/", "/index.html", "/puzzles.html", "/techniques.html",
  "/404.html", "/competition.html", "/training.html", "/resources.html", "/about.html",
  "/style.css", "/visual.css", "/theme.js", "/nav.js", "/app.js", "/data.js", "/daily-progress.js", "/game-core.js", "/techniques.js", "/technique-videos.js", "/glossary-videos.js", "/resource-catalog.js", "/training.js", "/round-timer.js", "/resources-page.js", "/techniques-page.js", "/questions.js", "/competition-event.js", "/home-desk.js",
  "/favicon.svg?v=gi2", "/favicon-32.png?v=gi2", "/apple-touch-icon.png?v=gi2",
  "/logo.svg", "/favicon.svg", "/favicon-32.png", "/apple-touch-icon.png",
  "/icon-192.png", "/icon-512.png", "/manifest.json", "/game/", "/game/index.html", "/game/style.css", "/game/app.js", "/game/audio.js", "/game/data.js", "/game/engine.js", "/game/render.js", "/game/save.js"
];

// Only cache our finite app shell. Search filters never create extra cache entries.
const SHELL_PATHS = new Set(APP_SHELL.map(path => new URL(path, self.location.origin).pathname));

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME)
    .then(cache => cache.addAll(APP_SHELL.map(path => new Request(path, {cache:"reload"}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith("bjj-connections-") && key !== CACHE_NAME).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  const known = SHELL_PATHS.has(url.pathname);
  if (!known && request.mode !== "navigate") return;
  const cachePromise = caches.open(CACHE_NAME);
  const cached = known ? cachePromise.then(cache => cache.match(url.pathname)) : Promise.resolve(undefined);
  const network = fetch(request, {cache:"no-cache"}).catch(() => undefined);
  // Extend the event before async cache work, even when the cached response wins.
  event.waitUntil(network.then(async response => {
    if (known && response?.ok) {
      const copy = response.clone();
      try { await (await cachePromise).put(url.pathname, copy); } catch (_) {}
    }
  }));
  event.respondWith((async () => {
    const saved = await cached;
    if (request.mode !== "navigate") return saved || await network || Response.error();
    // Give fresh HTML a short head start; a slow connection cannot hold cached pages hostage.
    let timeout;
    const response = saved ? await Promise.race([
      network,
      new Promise(resolve => { timeout = setTimeout(() => resolve(undefined), 2500); })
    ]) : await network;
    if (timeout) clearTimeout(timeout);
    if (response?.ok) return response;
    if (saved) return saved;
    if (response) return response;
    const fallback = await (await cachePromise).match("/404.html");
    return fallback ? new Response(fallback.body, {status:503, headers:fallback.headers}) : Response.error();
  })());
});
