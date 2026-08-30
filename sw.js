// KOBI 75 - Service Worker בסיסי (cache-first) לתמיכה אמינה באופליין
// כשהאפליקציה מותקנת למסך הבית מ-URL מאובטח (https).
//
// חשוב: בכל פעם שמעדכנים את index.html יש להעלות את המספר ב-CACHE_NAME למטה
// (למשל v1 -> v2). אחרת מכשירים שכבר התקינו את האפליקציה ימשיכו לקבל את
// הגרסה הישנה מהמטמון ולא יראו את השינוי, גם אחרי רענון.
const CACHE_NAME = "kobi75-cache-v1";
const APP_SHELL = ["./", "./index.html"];

self.addEventListener("install", function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(APP_SHELL);
    })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){ return key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(event){
  if(event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      var network = fetch(event.request).then(function(response){
        if(response && response.ok){
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        }
        return response;
      }).catch(function(){ return cached; });
      return cached || network;
    })
  );
});
