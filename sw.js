const C='sky-v8',F=['./','./index.html','./manifest.webmanifest','./icon.svg','./awarebc-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
// Network first so updates show straight away, but if the network is slow (over 2.5 s) the saved copy opens instead.
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin||e.request.method!=='GET')return;
const net=fetch(e.request,{cache:'no-cache'}).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}return r});
e.respondWith(new Promise(res=>{let done=false;const t=setTimeout(()=>{caches.match(e.request).then(m=>{if(m&&!done){done=true;res(m)}})},2500);
net.then(r=>{clearTimeout(t);if(!done){done=true;res(r)}}).catch(()=>{clearTimeout(t);caches.match(e.request).then(m=>{if(!done){done=true;res(m||Response.error())}})})}))});
