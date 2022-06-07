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
// get the ServiceWorkerRegistration instance
const registration = await navigator.serviceWorker.getRegistration();
// (it is also returned from navigator.serviceWorker.register() function)

function invokeServiceWorkerUpdateFlow(registration) {
  // TODO implement your own UI notification element
  notification.show("New version of the app is available. Refresh now?");
  notification.addEventListener('click', () => {
      if (registration.waiting) {
          // let waiting Service Worker know it should became active
          registration.waiting.postMessage('SKIP_WAITING')
      }
  })
  registration.waiting.postMessage('SKIP_WAITING')
}

if (registration) { // if there is a SW active
  registration.addEventListener('updatefound', () => {
    if (registration.installing) {
        // wait until the new Service worker is actually installed (ready to take over)
        registration.installing.addEventListener('statechange', () => {
            if (registration.waiting) {
                // if there's an existing controller (previous Service Worker), show the prompt
                if (navigator.serviceWorker.controller) {
                    invokeServiceWorkerUpdateFlow(registration)
                } else {
                    // otherwise it's the first install, nothing to do
                    console.log('Service Worker initialized for the first time')
                }
            }
        })
    }
})
}

let refreshing = false;

// detect controller change and refresh the page
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (!refreshing) {
      window.location.reload()
      refreshing = true
  }
})

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
      self.skipWaiting();
  }
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

