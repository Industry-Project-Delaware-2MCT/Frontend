const cacheName = 'mediscan-v1';
const staticAssets = [
  './',
  '../Frontend/noNetwork.html',
  '../Frontend/css/screen.css',
  '../Frontend/css/normalize.css',
  '../Frontend/assets/no-wifi.png',
  '../Frontend/assets/home_ilustration_extended.webp'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async() => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(staticAssets);
  })());
  
});

/*self.addEventListener('activate', function(event) {
  var cacheWhitelist = ['../Frontend/noNetwork.html','../Frontend/index.html','../Frontend/assets/home_ilustration_extended.webp'];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});*/

self.addEventListener("activate", function(e) {
  console.log("[Service Worker]: activation");
  e.waitUntil(
      caches.keys().then(function(keyList) {
          return Promise.all(
              keyList.map(function(key) {
                  if (key !== cacheName) {
                      console.log("[Service Worker]: old cache removed", key);
                      return caches.delete(key);
                  }
              })
          );
      })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

