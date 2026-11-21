'use strict';
const cacheName='moonletter-static-v2.1.0';
const assets=['./index.html','./month.css','./dates.js','./pair.js','./month.js','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(cacheName);
  for(const path of assets){
    const url=new URL(path,self.registration.scope);
    const response=await fetch(new Request(url,{cache:'reload',credentials:'same-origin'}));
    const mime=response.headers.get('Content-Type') || '';
    if(!response.ok || response.redirected || (path.endsWith('js')&&!/javascript|ecmascript/.test(mime)) || (path.endsWith('css')&&!/css/.test(mime)) || (path.endsWith('png')&&!/image/.test(mime)))throw Error('Incomplete app cache');
    await cache.put(url,response);
  }
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('moonletter-static-')&&k!==cacheName)await caches.delete(k);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url),base=new URL(self.registration.scope);
  if(request.method!=='GET'||url.origin!==base.origin || !url.pathname.startsWith(base.pathname))return;
  const local=url.pathname.slice(base.pathname.length);
  if(request.mode==='navigate' && (local==='' || local==='index.html')){
    event.respondWith((async()=>{const installed=await (await caches.open(cacheName)).match(new URL('index.html',base));return installed || fetch(request);})());
  }else if(assets.includes('./'+local)){
    event.respondWith((async()=>await (await caches.open(cacheName)).match(new URL(local,base)) || fetch(request))());
  }
});
