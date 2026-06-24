const CACHE = "inventory-v2";
const STATIC_URLS = ["/static/qr-scanner.umd.min.js", "/static/qr-scanner-worker.min.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});

self.addEventListener("push", (e) => {
  let data = { title: "Basement Inventory", body: "" };
  if (e.data) {
    try { data = e.data.json(); } catch (_) { data.body = e.data.text(); }
  }
  e.waitUntil(
    self.registration.showNotification(data.title || "Basement Inventory", {
      body: data.body,
      icon: "/static/icons/icon-192.png",
      badge: "/static/icons/icon-192.png",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(clients.openWindow(url));
});
