const CACHE='little-routes-shell-v1.1.16';
const STATIC=['./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('little-routes-shell-')&&k!==CACHE).map(k=>caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{
      if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('./index.html',copy)))}
      return response;
    }).catch(()=>caches.match('./index.html').then(cached=>cached||Response.error())));
    return;
  }
  if(url.pathname.endsWith('/sw.js'))return;
  event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{
    if(response.ok&&STATIC.some(path=>url.pathname.endsWith(path.slice(1)))){
      const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));
    }
    return response;
  }).catch(()=>caches.match(request)));
});
