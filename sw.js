const CACHE_NAME = "tastiera-parlante-shell-v1";
const RUNTIME_CACHE = "tastiera-parlante-runtime-v1";
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/app-icon.svg",
  "./assets/famiglia/generico.svg",
  "./assets/sounds/musichetta_gioco_1.mp3",
  "./js/app.js",
  "./js/config/game-config.js",
  "./js/model/game-model.js",
  "./js/view/game-view.js",
  "./js/controller/game-controller.js",
  "./js/services/image-service.js",
  "./js/services/speech-service.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(key => ![CACHE_NAME, RUNTIME_CACHE].includes(key))
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if(request.method !== "GET"){
    return;
  }

  const url = new URL(request.url);
  const isLocalAsset = url.origin === self.location.origin;
  const isRemoteImage = request.destination === "image" && url.origin !== self.location.origin;

  if(isLocalAsset){
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        const clone = response.clone();
        caches.open(RUNTIME_CACHE).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => {
        if(request.mode === "navigate"){
          return caches.match("./index.html");
        }
        if(request.destination === "image"){
          return caches.match("./assets/famiglia/generico.svg");
        }
        return caches.match(request);
      }))
    );
    return;
  }

  if(isRemoteImage){
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        const clone = response.clone();
        caches.open(RUNTIME_CACHE).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => caches.match("./assets/famiglia/generico.svg")))
    );
  }
});
