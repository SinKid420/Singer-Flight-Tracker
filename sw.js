const C='sky-v266',T='sky-tiles-1',F=['./','./index.html','./manifest.webmanifest?v=2','./icon.svg?v=2','./awarebc-512.png?v=2','./welcome-bg.jpg?v=1','./sled-zones.json','./fb.js?v=1','./crash.js?v=4','./perm.js?v=1','./awrotate.js?v=1','./icons3d.js?v=2','./onboard.js?v=18','./tour.js?v=4','./glow2.js?v=7','./update.js?v=2','./layers.js?v=12','./pins.js?v=4','./rigs.js?v=2','./fresh.js?v=3','./ovq.js?v=3','./trust.js?v=2','./app.js?v=215','./planekey.js?v=3','./account.js?v=2','./feeds.js?v=1','./a11y.js?v=2','./saver.js?v=1','./login.js?v=2','./blink.js?v=1','./app2.js?v=8','./srtheme.js?v=1','./reports.js?v=10','./e2e.js?v=1','./friends.js?v=28','./frtheme.js?v=1','./sonic.js?v=1','./mesh.js?v=5','./riglink.js?v=44','./rltheme.js?v=1','./showroom.js?v=7','./navback.js?v=5','./shell.js?v=11','./menutheme.js?v=2','./toolsheet.js?v=7','./look.js?v=2','./offsafe.js?v=4','./offmore.js?v=2','./aware.js?v=5','./snow.js?v=7','./rain.js?v=3','./ui.js?v=18','./settheme.js?v=2','./lyrtheme.js?v=1','./push.js?v=1','./offline.js?v=19','./tools.js?v=13','./roads.js?v=13','./winter.js?v=13','./ar.js?v=13','./nav.js?v=10','./bizpins.js?v=4','./gl.js?v=26','./extras.js?v=13','./signin.js?v=13','./place.js?v=6','./osm.js?v=18','./awplaces.js?v=6','./saved.js?v=4'];
// AwareBC (by Josh Singer). The app opens straight from the phone; new versions download in the background and show next time (with a "tap to refresh" note).
// Map pictures, trail data and map code are saved as you look at them, so areas you have viewed still work with no service.
// Your saved offline area (cache awarebc-off-*) is never cleared by updates.
const XH=/^(server\.arcgisonline\.com|services\.arcgisonline\.com|tile\.openstreetmap\.org|tiles\.openfreemap\.org|overpass-api\.de|basemaps\.arcgis\.com|s3\.amazonaws\.com|openmaps\.gov\.bc\.ca|apps\.fs\.usda\.gov|basemap\.nationalmap\.gov|hydro\.nationalmap\.gov|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)$/;
const LIB=/^(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)$/, DAY=864e5;
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==T&&x!==LC&&x.indexOf('awarebc-off')!==0).map(x=>caches.delete(x)))));self.clients.claim()});
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
// Live data (road events, wildfires, weather alerts, avalanche, ferries, trail reports): always asks the source first.
// Every good answer is saved on the phone. If the source is down, slow (10 s) or there's no signal, the last saved answer is used instead,
// even after the app was closed, marked with the time it was saved so the app can say "showing what we had at 2:15 PM".
const LIVE=/^(api\.open511\.gov\.bc\.ca|services6\.arcgis\.com|services3\.arcgis\.com|api\.weather\.gc\.ca|api\.avalanche\.ca|www\.bcferriesapi\.ca|api\.open-meteo\.com|air-quality-api\.open-meteo\.com|services\.swpc\.noaa\.gov)$/, LC='awarebc-live';
function lkey(u){const x=new URL(u);return x.origin+x.pathname+'?latest'} // newest answer from the same source, for when this exact area was never saved
function saved(c,url){return c.match(url).then(m=>m||c.match(lkey(url))).then(m=>{if(!m)return null;const h=new Headers(m.headers);h.set('x-aw-saved',m.headers.get('x-sw-t')||'1');h.set('access-control-expose-headers','x-aw-saved');return m.blob().then(b=>new Response(b,{status:200,headers:h}))})}
function liveNet(req){const url=req.url;return caches.open(LC).then(c=>{
  const net=fetch(req).then(r=>{if(r&&r.ok&&r.type!=='opaque'){const r2=r.clone();r2.blob().then(b=>{const h=new Headers(r.headers);h.set('x-sw-t',String(Date.now()));const put=(k)=>c.put(k,new Response(b,{status:200,headers:h}));return put(url).then(()=>put(lkey(url)))}).then(()=>trimL(c)).catch(()=>{})}return r});
  return new Promise(res=>{let done=false;const fall=()=>saved(c,url).then(m=>{if(done)return;if(m){done=true;res(m)}});
    const t=setTimeout(fall,10000);
    net.then(r=>{if(done)return;if(r&&r.ok){clearTimeout(t);done=true;res(r)}else saved(c,url).then(m=>{if(!done){clearTimeout(t);done=true;res(m||r)}})},
      ()=>saved(c,url).then(m=>{if(!done){clearTimeout(t);done=true;res(m||Response.error())}}))})})}
let lputs=0;function trimL(c){if(++lputs%40)return;c.keys().then(k=>{if(k.length>400)return Promise.all(k.slice(0,k.length-300).map(r=>c.delete(r)))})}
function tell(a){return self.clients.matchAll({type:'window'}).then(l=>l.forEach(w=>w.postMessage({t:'upd',auto:!!a})))}
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET')return;const u=new URL(q.url);
if(u.origin!==location.origin){if((LIVE.test(u.hostname)&&!/returnCountOnly/.test(u.search))||(u.hostname==='awarebc.aware-bc.workers.dev'&&u.pathname==='/list')){e.respondWith(liveNet(q));return}if(u.hostname==='maps.gov.bc.ca'&&u.pathname.indexOf('/tile/')>0){e.respondWith(bcTile(q.url));return}if(XH.test(u.hostname)&&!/request=GetCapabilities/i.test(u.search))e.respondWith(xNet(q));return}
const nav=q.mode==='navigate', page=nav||/\/(index\.html)?$/.test(u.pathname);
// opening AwareBC always asks the network first (newest version every time); the saved copy is used when there's no signal or it takes over 3 s
if(nav){const net=fetch(q,{cache:'no-cache'}).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put('./index.html',c))}return r});
e.respondWith(new Promise(res=>{let done=false;let old=null;const t=setTimeout(()=>{caches.open(C).then(c=>c.match('./index.html')).then(m=>{if(m&&!done){done=true;old=m.clone();res(m)}})},3000);
// slow signal: the saved copy opened first. When the new one arrives and it's different, the app swaps to it straight away
net.then(r=>r&&r.ok&&old?Promise.all([old.text(),r.clone().text()]).then(x=>{if(x[0]!==x[1])setTimeout(()=>tell(1),800)}):0).catch(()=>{});
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
