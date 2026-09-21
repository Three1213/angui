// 安规刷题 离线缓存：优先联网取最新，3秒没响应或断网就用缓存
const CACHE='anguiv-v2';
const FILES=['./','./index.html','./icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url); if(url.origin!==location.origin)return;
  e.respondWith(new Promise(resolve=>{
    let done=false;
    const fromCache=()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'));
    const t=setTimeout(()=>{fromCache().then(r=>{if(r&&!done){done=true;resolve(r);}});},3000);
    fetch(e.request).then(res=>{
      if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
      if(!done){done=true;clearTimeout(t);resolve(res);}
    }).catch(()=>{fromCache().then(r=>{if(!done){done=true;clearTimeout(t);resolve(r||Response.error());}});});
  }));
});
