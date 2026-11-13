const C='sky-v38',T='sky-tiles-1',F=['./','./index.html','./manifest.webmanifest','./icon.svg','./awarebc-512.png','./sled-zones.json','./fb.js?v=1','./crash.js?v=2','./app.js?v=19','./app2.js?v=3','./reports.js?v=6','./friends.js?v=4','./offline.js?v=10','./tools.js?v=4','./roads.js?v=4','./winter.js?v=4','./ar.js?v=4','./nav.js?v=8','./gl.js?v=6','./extras.js?v=3','./signin.js?v=2','./place.js?v=1','./osm.js?v=1'];
// AwareBC (by Josh Singer). The app opens straight from the phone; new versions download in the background and show next time (with a "tap to refresh" note).
// Map pictures, trail data and map code are saved as you look at them, so areas you have viewed still work with no service.
// Your saved offline area (cache awarebc-off-*) is never cleared by updates.
const XH=/^(server\.arcgisonline\.com|services\.arcgisonline\.com|tile\.openstreetmap\.org|tiles\.openfreemap\.org|overpass-api\.de|basemaps\.arcgis\.com|s3\.amazonaws\.com|openmaps\.gov\.bc\.ca|apps\.fs\.usda\.gov|basemap\.nationalmap\.gov|hydro\.nationalmap\.gov|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)$/;
const LIB=/^(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)$/, DAY=864e5;
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==T&&x.indexOf('awarebc-off')!==0).map(x=>caches.delete(x)))));self.clients.claim()});
let puts=0;
function trim(c){if(++puts%60)return;c.keys().then(k=>{if(k.length>3500)return Promise.all(k.slice(0,k.length-3000).map(r=>c.delete(r)))})}
function age(r){const d=+r.headers.get('x-sw-t');return d?Date.now()-d:1e15}
// saved with the time it was saved, so the app knows how fresh it is
function keep(c,url,r){return r.blob().then(b=>{const h=new Headers(r.headers);h.set('x-sw-t',String(Date.now()));return c.put(url,new Response(b,{status:r.status,statusText:r.statusText,headers:h}))}).then(()=>trim(c))}
// Map tiles and libraries: a saved copy that is fresh enough opens at once (libraries never change; map pictures 7 days; map data 1 day).
// Otherwise the network is tried, and if it is slow (over 4 s) the saved copy opens instead.
function xNet(req){const url=req.url,u=new URL(url);return caches.open(T).then(c=>c.match(url).then(m=>{
const max=LIB.test(u.hostname)?1e16:/\/tile|GetMap|\/\d+\/\d+\/\d+(\.\w+)?$/i.test(url)?7*DAY:DAY;
if(m&&age(m)<max)return m;
const net=fetch(url,{mode:'cors',credentials:'omit'}).then(r=>{if(r.ok){keep(c,url,r.clone()).catch(()=>{})}return r}).catch(()=>null);
return Promise.race([net,new Promise(r=>setTimeout(()=>r('slow'),4000))]).then(r=>{if(r&&r!=='slow')return r;
return (m?Promise.resolve(m):caches.match(url)).then(x=>x||net.then(y=>y||fetch(req)))})}))}
// BC Government offline map: saved copy first, then the network
function bcTile(url){return caches.match(url).then(m=>m||fetch(url,{mode:'cors',credentials:'omit'}).then(r=>{if(r.ok){const rc=r.clone();caches.open(T).then(c=>c.put(url,rc).then(()=>trim(c))).catch(()=>{})}return r}))}
function tell(){return self.clients.matchAll({type:'window'}).then(l=>l.forEach(w=>w.postMessage({t:'upd'})))}
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET')return;const u=new URL(q.url);
if(u.origin!==location.origin){if(u.hostname==='maps.gov.bc.ca'&&u.pathname.indexOf('/tile/')>0){e.respondWith(bcTile(q.url));return}if(XH.test(u.hostname)&&!/request=GetCapabilities/i.test(u.search))e.respondWith(xNet(q));return}
const nav=q.mode==='navigate', page=nav||/\/(index\.html)?$/.test(u.pathname);
// a test link (…/?v=95) always asks the network first, so a fresh change shows straight away
if(nav&&u.searchParams.has('v')){const net=fetch(q,{cache:'no-cache'}).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put('./index.html',c))}return r});
e.respondWith(new Promise(res=>{let done=false;const t=setTimeout(()=>{caches.open(C).then(c=>c.match('./index.html')).then(m=>{if(m&&!done){done=true;res(m)}})},2500);
net.then(r=>{clearTimeout(t);if(!done){done=true;res(r)}}).catch(()=>{clearTimeout(t);caches.open(C).then(c=>c.match('./index.html')).then(m=>{if(!done){done=true;res(m||Response.error())}})})}));return}
const key=page?'./index.html':q;
e.respondWith(caches.open(C).then(c=>c.match(key).then(m=>{const mc=m&&page?m.clone():null;
const net=fetch(q,{cache:'no-cache'}).then(r=>{if(!r||!r.ok)return r;const r2=r.clone();
if(!m||!page)return c.put(key,r2).then(()=>r,()=>r);
return Promise.all([mc.text(),r2.clone().text()]).then(t=>c.put(key,r2).then(()=>{if(t[0]!==t[1])tell()})).then(()=>r,()=>r)}).catch(()=>null);
if(m){e.waitUntil(net);return m}
return net.then(r=>r||caches.match(q).then(x=>x||Response.error()))})))});
