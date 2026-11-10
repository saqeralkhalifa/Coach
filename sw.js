// Arabian Method service worker: shows coach notifications and opens the Coach page when tapped.
self.addEventListener("install", function(){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(self.clients.claim()); });
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
