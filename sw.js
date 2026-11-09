const C='sky-v11',T='sky-tiles-1',F=['./','./index.html','./manifest.webmanifest','./icon.svg','./awarebc-512.png','./sled-zones.json'];
// Map pictures, trail data and map code are saved as you look at them, so areas you have viewed still work with no service.
// Your saved offline area (cache awarebc-off-*) is never cleared by updates.
const XH=/^(server\.arcgisonline\.com|services\.arcgisonline\.com|tile\.openstreetmap\.org|tiles\.openfreemap\.org|openmaps\.gov\.bc\.ca|apps\.fs\.usda\.gov|basemap\.nationalmap\.gov|hydro\.nationalmap\.gov|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)$/;
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==T&&x.indexOf('awarebc-off')!==0).map(x=>caches.delete(x)))));self.clients.claim()});
let puts=0;
function trim(c){if(++puts%60)return;c.keys().then(k=>{if(k.length>3500)return Promise.all(k.slice(0,k.length-3000).map(r=>c.delete(r)))})}
function xNet(req){const url=req.url;return caches.open(T).then(c=>{
const net=fetch(url,{mode:'cors',credentials:'omit'}).then(r=>{if(r.ok){c.put(url,r.clone()).then(()=>trim(c)).catch(()=>{})}return r}).catch(()=>null);
return Promise.race([net,new Promise(r=>setTimeout(()=>r('slow'),4000))]).then(r=>{if(r&&r!=='slow')return r;
return c.match(url).then(m=>m||caches.match(url)).then(m=>m||net.then(x=>x||fetch(req)))})})}
// BC Government offline map: saved copy first, then the network
function bcTile(url){return caches.match(url).then(m=>m||fetch(url,{mode:'cors',credentials:'omit'}).then(r=>{if(r.ok){const rc=r.clone();caches.open(T).then(c=>c.put(url,rc).then(()=>trim(c))).catch(()=>{})}return r}))}
// Network first so updates show straight away, but if the network is slow (over 2.5 s) the saved copy opens instead.
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
if(u.origin!==location.origin){if(u.hostname==='maps.gov.bc.ca'&&u.pathname.indexOf('/tile/')>0){e.respondWith(bcTile(e.request.url));return}if(XH.test(u.hostname)&&!/request=GetCapabilities/i.test(u.search))e.respondWith(xNet(e.request));return}
const net=fetch(e.request,{cache:'no-cache'}).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}return r});
e.respondWith(new Promise(res=>{let done=false;const t=setTimeout(()=>{caches.match(e.request).then(m=>{if(m&&!done){done=true;res(m)}})},2500);
net.then(r=>{clearTimeout(t);if(!done){done=true;res(r)}}).catch(()=>{clearTimeout(t);caches.match(e.request).then(m=>{if(!done){done=true;res(m||Response.error())}})})}))});
