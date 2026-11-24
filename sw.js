const C='sky-v200',T='sky-tiles-1',F=['./','./index.html','./manifest.webmanifest?v=2','./icon.svg?v=2','./awarebc-512.png?v=2','./welcome-bg.jpg?v=1','./sled-zones.json','./fb.js?v=1','./crash.js?v=3','./icons3d.js?v=2','./onboard.js?v=14','./tour.js?v=2','./pins.js?v=4','./rigs.js?v=1','./app.js?v=160','./app2.js?v=8','./srtheme.js?v=1','./reports.js?v=9','./e2e.js?v=1','./friends.js?v=26','./frtheme.js?v=1','./sonic.js?v=1','./mesh.js?v=5','./riglink.js?v=39','./rltheme.js?v=1','./showroom.js?v=7','./navback.js?v=2','./shell.js?v=8','./menutheme.js?v=1','./toolsheet.js?v=1','./look.js?v=2','./offsafe.js?v=3','./offmore.js?v=1','./aware.js?v=3','./snow.js?v=7','./rain.js?v=3','./ui.js?v=17','./settheme.js?v=1','./lyrtheme.js?v=1','./push.js?v=1','./offline.js?v=14','./tools.js?v=9','./roads.js?v=9','./winter.js?v=9','./ar.js?v=9','./nav.js?v=9','./bizpins.js?v=4','./gl.js?v=26','./extras.js?v=12','./signin.js?v=11','./place.js?v=5','./osm.js?v=16','./awplaces.js?v=5','./saved.js?v=4'];
// AwareBC (by Josh Singer). The app opens straight from the phone; new versions download in the background and show next time (with a "tap to refresh" note).
// Map pictures, trail data and map code are saved as you look at them, so areas you have viewed still work with no service.
// Your saved offline area (cache awarebc-off-*) is never cleared by updates.
const XH=/^(server\.arcgisonline\.com|services\.arcgisonline\.com|tile\.openstreetmap\.org|tiles\.openfreemap\.org|overpass-api\.de|basemaps\.arcgis\.com|s3\.amazonaws\.com|openmaps\.gov\.bc\.ca|apps\.fs\.usda\.gov|basemap\.nationalmap\.gov|hydro\.nationalmap\.gov|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)$/;
const LIB=/^(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)$/, DAY=864e5;
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==T&&x.indexOf('awarebc-off')!==0).map(x=>caches.delete(x)))));self.clients.claim()});
let puts=0;
function trim(c){if(++puts%300)return;c.keys().then(k=>{if(k.length>3500)return Promise.all(k.slice(0,k.length-3000).map(r=>c.delete(r)))})}
function age(r){const d=+r.headers.get('x-sw-t');return d?Date.now()-d:1e15}
// saved with the time it was saved, so the app knows how fresh it is
function keep(c,url,r){return r.blob().then(b=>{const h=new Headers(r.headers);h.set('x-sw-t',String(Date.now()));return c.put(url,new Response(b,{status:r.status,statusText:r.statusText,headers:h}))}).then(()=>trim(c))}
// Map tiles and libraries: a saved copy that is fresh enough opens at once (libraries never change; map pictures 7 days; map data 1 day).
// Otherwise the network is tried, and if it is slow (over 4 s) the saved copy opens instead.
// Map pictures: ask the network straight away and use a saved copy only if it answers first, or when there is no signal.
// New pictures are saved one at a time in the background, so saving never slows the map down.
const WQ=[];let wq=false;function later(c,url,r){if(WQ.length>40)return;WQ.push([c,url,r]);if(!wq)pump()}
function pump(){const j=WQ.shift();if(!j){wq=false;return}wq=true;keep(j[0],j[1],j[2]).catch(()=>{}).then(()=>setTimeout(pump,25))}
function tNet(req,url){return caches.open(T).then(c=>{const net=fetch(req.url,{mode:'cors',credentials:'omit'}).then(r=>{if(r&&r.ok)later(c,url,r.clone());return r}).catch(()=>null);
const saved=c.match(url).then(m=>m||caches.match(url)).catch(()=>null);
return new Promise(res=>{let done=false;const go=r=>{if(!done&&r){done=true;res(r)}};
net.then(r=>{if(r&&r.ok)go(r);else saved.then(m=>go(m||r||Response.error()))});
saved.then(m=>{if(m&&age(m)<7*DAY)setTimeout(()=>go(m),navigator.onLine===false?0:60)});
net.then(r=>{if(!r)saved.then(m=>{if(!done){done=true;res(m||Response.error())}})})})})}
function xNet(req){const u=new URL(req.url),url=u.hostname==='services.arcgisonline.com'?req.url.replace('//services.','//server.'):req.url;if(/\/World_Imagery\/MapServer\/tile\//.test(url))return tNet(req,url);return caches.open(T).then(c=>c.match(url).then(m=>{
const max=LIB.test(u.hostname)?1e16:/\/tile|GetMap|\/\d+\/\d+\/\d+(\.\w+)?$/i.test(url)?7*DAY:DAY;
if(m&&age(m)<max)return m;
const net=fetch(req.url,{mode:'cors',credentials:'omit'}).then(r=>{if(r.ok){keep(c,url,r.clone()).catch(()=>{})}return r}).catch(()=>null);
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

// alerts when AwareBC is closed (sent encrypted by the AwareBC server)
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){}const t=d.title||'AwareBC';e.waitUntil(self.registration.showNotification(t,{body:d.body||'',icon:'./awarebc-512.png?v=2',badge:'./awarebc-512.png?v=2',tag:d.tag||'aw',renotify:true,requireInteraction:/^od/.test(d.tag||''),vibrate:/^od/.test(d.tag||'')?[400,150,400,150,400]:[200],data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if(c.url.indexOf(self.registration.scope)===0&&'focus' in c){c.navigate(u).catch(()=>{});return c.focus()}}return self.clients.openWindow(u)}))});
