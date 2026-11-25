// Arabian Method service worker: keeps a copy of the pages so the Home Screen app opens without a connection,
// always asking the network first, and shows coach notifications, opening the Coach page when one is tapped.
var CACHE = "am-shell-20261125";
self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(["/", "/manifest.webmanifest", "/icon-192.png"]); }).catch(function(){}));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k.indexOf("am-shell-") === 0 && k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var r = e.request;
  if(r.method !== "GET") return;
  var u = new URL(r.url);
  if(u.origin !== self.location.origin || u.pathname === "/sw.js") return;
  e.respondWith(fetch(r).then(function(res){
    if(res && res.ok && res.type === "basic"){ var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(r, copy); }); }
    return res;
  }).catch(function(){
    return caches.match(r, { ignoreSearch: r.mode === "navigate" }).then(function(m){
      return m || (r.mode === "navigate" ? caches.match("/") : Response.error());
    });
  }));
});
self.addEventListener("push", function(e){
  var d = {};
  try{ d = e.data ? e.data.json() : {}; }catch(err){ d = {}; }
  e.waitUntil(self.registration.showNotification(d.title || "Arabian Method", {
    body: d.body || "", icon: "/icon-192.png", badge: "/icon-192.png", data: { url: d.url || "/#coach" }
  }));
});
self.addEventListener("notificationclick", function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || "/#coach";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(list){
    for(var i = 0; i < list.length; i++){ if("focus" in list[i]){ list[i].navigate(url); return list[i].focus(); } }
    return self.clients.openWindow(url);
  }));
});
