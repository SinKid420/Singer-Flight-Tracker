// AwareBC offline area + Home (by Josh Singer): first-start setup, saves the map, FSR data and trail reports
// around Home so they work with no service, plus a "Get me home" arrow and a track back.
(function(){
  var A=window.__AW; if(!A||!window.L) return; var map=A.map, esc=A.esc;
  var OC='awarebc-off-1', RS='https://awarebc.aware-bc.workers.dev';
  var BCR='https://maps.gov.bc.ca/arcserver/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}';
  var SIZES=[[50,'50'],[70,'70'],[100,'100'],[150,'Max']], ZMIN=5, ZMAX=14, TKB=13, CKB=30;
  var LIBS=['https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css','https://cdn.jsdelivr.net/npm/leaflet-rotate@0.2.8/dist/leaflet-rotate.js','./','./index.html','./fb.js?v=1','./crash.js?v=2','./app.js?v=18','./app2.js?v=3','./nav.js?v=8','./gl.js?v=5','./extras.js?v=3','./signin.js?v=2','./place.js?v=1','./osm.js?v=1','https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js','https://cdn.jsdelivr.net/npm/pmtiles@3.2.1/dist/pmtiles.js','./reports.js?v=6','./offline.js?v=10','./friends.js?v=4','./tools.js?v=4','./roads.js?v=4','./winter.js?v=4','./ar.js?v=4','./sled-zones.json','./manifest.webmanifest'];
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v) }catch(e){ return null } }
  function lj(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v }catch(e){ return d } }
  var ICO={home:'<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>',
    dl:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    chk:'<path d="m5 12 5 5 9-10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    clock:'<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    area:'<path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 18.5h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    arrow:'<path d="M12 2l7 19-7-4.5L5 21z" fill="currentColor"/>', x:'<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'};
  function I(n,s){ return '<svg width="'+(s||16)+'" height="'+(s||16)+'" viewBox="0 0 24 24" aria-hidden="true">'+ICO[n]+'</svg>' }
  function fmtMB(b){ return b>=1e9?(b/1e9).toFixed(1)+' GB':Math.max(1,Math.round(b/1e6))+' MB' }
  function km(a,b,c,d){ return map.distance([a,b],[c,d])/1000 }

  // ---------- area maths ----------
  function box(lat,lon,r){ var dl=r/111.32, dn=r/(111.32*Math.cos(lat*Math.PI/180)); return {s:lat-dl,n:lat+dl,w:lon-dn,e:lon+dn} }
  function tx(lon,z){ return Math.floor((lon+180)/360*Math.pow(2,z)) }
  function ty(lat,z){ var r=lat*Math.PI/180; return Math.floor((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*Math.pow(2,z)) }
  function tiles(b){ var o=[]; for(var z=ZMIN;z<=ZMAX;z++){ var x0=tx(b.w,z), x1=tx(b.e,z), y0=ty(b.n,z), y1=ty(b.s,z); for(var y=y0;y<=y1;y++) for(var x=x0;x<=x1;x++) o.push(BCR.replace('{z}',z).replace('{y}',y).replace('{x}',x)) } return o }
  // street map for the .pmtiles archive (OpenFreeMap vector tiles), packed after download
  var VKB=25; function vtpl(){ return window.__pm&&window.__pm.tpl&&window.__pm.tpl() }
  function vtiles(b){ var t=vtpl(), o=[]; if(!t) return o; for(var z=ZMIN;z<=ZMAX;z++){ var x0=tx(b.w,z), x1=tx(b.e,z), y0=ty(b.n,z), y1=ty(b.s,z); for(var y=y0;y<=y1;y++) for(var x=x0;x<=x1;x++) o.push(t.replace('{z}',z).replace('{x}',x).replace('{y}',y)) } return o }
  function vex(){ return window.__pm&&window.__pm.extras&&vtpl()?window.__pm.extras():[] }
  function tcount(b){ var n=0; for(var z=ZMIN;z<=ZMAX;z++) n+=(tx(b.e,z)-tx(b.w,z)+1)*(ty(b.s,z)-ty(b.n,z)+1); return n }
  // BC place names (lakes, peaks, FSRs, towns) in 0.25° squares, saved so search works with no signal
  var GNS='https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_BASEMAPPING.GNS_GEOGRAPHICAL_NAMES_SP&outputFormat=json&srsName=EPSG:4326&count=5000&propertyName=GEOGRAPHICAL_NAME,FEATURE_TYPE,FEATURE_CATEGORY,LATITUDE,LONGITUDE&CQL_FILTER=';
  function nameCell(i,j){ var w=j*0.25, s=i*0.25; return GNS+encodeURIComponent('BBOX(GEOMETRY,'+w.toFixed(2)+','+s.toFixed(2)+','+(w+0.25).toFixed(2)+','+(s+0.25).toFixed(2)+",'EPSG:4326')") }
  function nameUrls(b){ var o=[]; for(var i=Math.floor(b.s/0.25);i<=Math.floor(b.n/0.25);i++) for(var j=Math.floor(b.w/0.25);j<=Math.floor(b.e/0.25);j++) o.push(nameCell(i,j)); return o }
  function rememberNames(urls){ var l=lj('aw-names',[]); urls.forEach(function(u){ if(l.indexOf(u)<0) l.push(u) }); if(l.length>400) l=l.slice(-400); ls('aw-names',JSON.stringify(l)) }
  function cells(b){ return (window.__fsr&&window.__fsr.urls?window.__fsr.urls(b):[]).concat(window.__nav&&window.__nav.urls?window.__nav.urls(b):[],window.__osm&&window.__osm.urls?window.__osm.urls(b):[]) } // + OpenStreetMap places // map layers + road data for directions and upright street names
  function est(lat,lon,r){ var b=box(lat,lon,r), t=tcount(b), c=cells(b).length; var nv=vtpl()?t:0; return {t:t,c:c,bytes:(t*TKB+c*CKB+nv*VKB)*1024,min:Math.max(1,Math.round((t+c)/30/60)),km2:Math.round(4*r*r/100)*100} }

  // ---------- Home ----------
  var home=lj('sky-home',null), homeMk=null;
  function setHome(lat,lon){ home={lat:+lat.toFixed(5),lon:+lon.toFixed(5)}; ls('sky-home',JSON.stringify(home)); drawHome() }
  function drawHome(){ if(!home) return; var ll=[home.lat,home.lon];
    if(!homeMk){ homeMk=L.marker(ll,{icon:L.divIcon({className:'',html:'<span class="ofhome">'+I('home',18)+'</span>',iconSize:[0,0]}),zIndexOffset:900,keyboard:false,title:'Home'}).addTo(map); homeMk.on('click',openHomeCard) }
    else homeMk.setLatLng(ll) }

  // ---------- GPS: get me home arrow + track back ----------
  var fix=null, track=lj('sky-track',{t:0,p:[]}), wId=null, lineHome=null, pathLine=null, showLine=false, showPath=false;
  if(!track.p) track={t:0,p:[]};
  function brg(a,b,c,d){ var r=Math.PI/180, y=Math.sin((d-b)*r)*Math.cos(c*r), x=Math.cos(a*r)*Math.sin(c*r)-Math.sin(a*r)*Math.cos(c*r)*Math.cos((d-b)*r); return (Math.atan2(y,x)/r+360)%360 }
  function onFix(p){ var c=p.coords; fix=[c.latitude,c.longitude]; var now=Date.now();
    if(now-(track.t||0)>8*3600000) track={t:now,p:[]};
    var last=track.p[track.p.length-1]; if(!last||km(last[0],last[1],fix[0],fix[1])>0.03){ track.p.push([+fix[0].toFixed(5),+fix[1].toFixed(5)]); if(track.p.length>4000) track.p.splice(0,track.p.length-4000); track.t=now; if(track.p.length%5===0) ls('sky-track',JSON.stringify(track)) }
    track.t=now; updHome() }
  function watch(){ if(!navigator.geolocation) return; if(document.hidden){ if(wId!=null){ navigator.geolocation.clearWatch(wId); wId=null; ls('sky-track',JSON.stringify(track)) } return }
    if(wId==null) wId=navigator.geolocation.watchPosition(onFix,function(){},{enableHighAccuracy:true,maximumAge:10000,timeout:30000}) }
  document.addEventListener('visibilitychange',watch);
  function updHome(){ if(!home) return; var p=fix||(A.me()&&A.me().label==='you'?[A.me().lat,A.me().lon]:null);
    if(homeMk&&p) homeMk.setOpacity(km(p[0],p[1],home.lat,home.lon)<0.04?0:1); // at home: your vehicle shows, not the pin
    if(showLine&&p){ var ll=[p,[home.lat,home.lon]]; if(lineHome) lineHome.setLatLngs(ll); else lineHome=L.polyline(ll,{color:'#30b0c7',weight:4,opacity:.9,dashArray:'10 8',interactive:false}).addTo(map) }
    if(showPath&&track.p.length>1){ if(pathLine) pathLine.setLatLngs(track.p); else pathLine=L.polyline(track.p,{color:'#ffcc00',weight:4,opacity:.95,interactive:false}).addTo(map) }
    var el=document.getElementById('ofhc'); if(!el||el.hidden||!p) return; var d=km(p[0],p[1],home.lat,home.lon), b=brg(p[0],p[1],home.lat,home.lon), mb=map.getBearing?map.getBearing():0;
    el.querySelector('.ofarr').style.transform='rotate('+(b-mb)+'deg)'; el.querySelector('.ofdist').textContent=d<1?Math.round(d*1000)+' m':d.toFixed(d<10?1:0)+' km';
    el.querySelector('.ofsub').textContent=['N','NE','E','SE','S','SW','W','NW'][Math.round(b/45)%8]+' of you · straight-line distance' }
  map.on('rotate',updHome);
  var hc=document.createElement('div'); hc.id='ofhc'; hc.hidden=true; hc.setAttribute('role','dialog'); hc.setAttribute('aria-label','Get me home'); document.getElementById('map').parentNode.appendChild(hc);
  function openHomeCard(){ if(!home) return; hc.innerHTML='<button type="button" class="ofx" aria-label="Close">'+I('x',15)+'</button><div class="ofhrow"><span class="ofarr" style="color:#30b0c7">'+I('arrow',44)+'</span><div><b class="ofdist">…</b><small class="ofsub">Waiting for GPS…</small></div></div>'+
      '<div class="ofbtns"><button type="button" data-a="line" aria-pressed="'+showLine+'">Line to home</button><button type="button" data-a="path" aria-pressed="'+showPath+'">My path in</button><button type="button" data-a="set">Change</button></div>';
    hc.hidden=false; hc.querySelector('.ofx').onclick=function(){ hc.hidden=true };
    hc.querySelector('[data-a=line]').onclick=function(){ showLine=!showLine; this.setAttribute('aria-pressed',showLine); if(!showLine&&lineHome){ map.removeLayer(lineHome); lineHome=null } updHome() };
    hc.querySelector('[data-a=path]').onclick=function(){ showPath=!showPath; this.setAttribute('aria-pressed',showPath); if(!showPath&&pathLine){ map.removeLayer(pathLine); pathLine=null } if(showPath&&track.p.length<2) this.textContent='No path yet'; updHome() };
    hc.querySelector('[data-a=set]').onclick=function(){ hc.hidden=true; openSetup() };
    watch(); updHome() }
  map.on('click',function(){ hc.hidden=true });

  // ---------- offline map layer (shows under the normal map; fills in where the normal map can't load) ----------
  var area=lj('sky-offarea',null), offLay=null;
  function addLayer(){ if(offLay){ map.removeLayer(offLay); offLay=null } if(!area||!area.done) return; var b=box(area.lat,area.lon,area.r);
    offLay=L.tileLayer(BCR,{bounds:L.latLngBounds([b.s,b.w],[b.n,b.e]),minZoom:ZMIN,maxNativeZoom:ZMAX,maxZoom:19,zIndex:0,attribution:'Offline map © Government of British Columbia (DataBC)'}).addTo(map) }

  // ---------- downloader ----------
  var job=null;
  function saveReports(b){ return fetch(RS+'/list?s='+b.s.toFixed(3)+'&n='+b.n.toFixed(3)+'&w='+b.w.toFixed(3)+'&e='+b.e.toFixed(3)).then(function(r){ return r.json() }).then(function(j){ if(!j||!j.r) throw 0;
      var c=lj('sky-trcache',{r:[]}), keep=(c.r||[]).filter(function(x){ return !(x.lat>=b.s&&x.lat<=b.n&&x.lon>=b.w&&x.lon<=b.e) }); c={at:Date.now(),r:keep.concat(j.r).slice(-3000)}; ls('sky-trcache',JSON.stringify(c)); return true }) }
  function start(a){ var b=box(a.lat,a.lon,a.r), nm=nameUrls(b), fs=cells(b).concat(nm), ts=tiles(b), vs=vtiles(b), vx=vex();
    job={a:a,items:LIBS.concat(vx,fs,ts,vs),nl:LIBS.length+vx.length,nv:vs.length,vDone:0,pack:false,vurls:vs,b:b,nf:fs.length,nt:ts.length,i:0,ok:0,fail:0,bytes:0,fsDone:0,tDone:0,rep:false,paused:false,t0:Date.now(),run:0};
    ls('sky-offjob',JSON.stringify(a)); rememberNames(nm); try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persist() }catch(e){}
    saveReports(b).then(function(){ job&&(job.rep=true); ui() },function(){ job&&(job.rep='later'); ui() });
    caches.open(OC).then(function(c){ job.cache=c; for(var k=0;k<6;k++) worker() }); lock(true); ui() }
  function worker(){ if(!job||job.paused||job.i>=job.items.length){ if(job&&!job.paused&&!job.finished&&job.run===0&&job.i>=job.items.length) finish(); return } job.run++;
    var idx=job.i++, u=job.items[idx], kind=idx<job.nl?'l':idx<job.nl+job.nf?'f':idx<job.nl+job.nf+job.nt?'t':'v';
    job.cache.match(u).then(function(m){ if(m) return 'hit'; return get(u,2) }).then(function(r){ if(r==='hit'||r){ job.ok++; if(r&&r.size) job.bytes+=r.size; else job.bytes+=(kind==='t'?TKB:CKB)*1024 } else job.fail++;
        if(kind==='f') job.fsDone++; if(kind==='t') job.tDone++; if(kind==='v') job.vDone++ }).catch(function(){ job.fail++ }).then(function(){ job.run--; uiSoon(); if(!navigator.onLine&&job&&!job.paused){ job.paused='net'; ui() } worker() }) }
  function get(u,tries){ return fetch(u,{mode:'cors',credentials:'omit'}).then(function(r){ if(!r.ok) throw 0; if(u.indexOf('/tile/')>0&&!/image/.test(r.headers.get('content-type')||'')) throw 0; var c=r.clone(); return r.blob().then(function(bl){ return job.cache.put(u,c).then(function(){ return {size:bl.size} }) }) })
      .catch(function(){ if(tries>1) return new Promise(function(ok){ setTimeout(ok,1500) }).then(function(){ return get(u,tries-1) }); return null }) }
  function finish(){ if(job.nv&&!job.pack&&window.__pm&&window.__pm.save){ job.pack='run'; ui(); packV().then(function(){ job.pack=true },function(){ job.pack='fail' }).then(finish); return }
    if(job.pack==='run') return; var a=job.a; area={lat:a.lat,lon:a.lon,r:a.r,at:Date.now(),bytes:job.bytes,done:true,fail:job.fail}; ls('sky-offarea',JSON.stringify(area)); ls('sky-offjob',null); lock(false); addLayer(); job.finished=true; if(ov) ov.hidden=false; ui() }
  // pack the downloaded street tiles into one .pmtiles archive (IndexedDB), then drop the loose copies
  function packV(){ var re=/\/(\d+)\/(\d+)\/(\d+)\.pbf/, list=[], c=job.cache;
    return Promise.all(job.vurls.map(function(u){ var m=re.exec(u); return c.match(u).then(function(r){ return r?r.blob():null }).then(function(bl){ if(bl&&bl.size&&m) list.push({z:+m[1],x:+m[2],y:+m[3],blob:bl}) }) }))
      .then(function(){ if(!list.length) throw 0; var b=job.b; return window.__pm.save(list,{w:b.w,s:b.s,e:b.e,n:b.n,z0:ZMIN,z1:ZMAX}) })
      .then(function(sz){ return Promise.all(job.vurls.map(function(u){ return c.delete(u) })).then(function(){ return sz }) }) }
  function pause(p){ if(!job) return; job.paused=p?'user':false; if(!p){ for(var k=0;k<6;k++) worker() } ui() }
  addEventListener('online',function(){ if(job&&job.paused==='net'){ job.paused=false; for(var k=0;k<6;k++) worker(); ui() } });
  var wl=null; function lock(on){ try{ if(on&&navigator.wakeLock&&!wl) navigator.wakeLock.request('screen').then(function(x){ wl=x }).catch(function(){}); if(!on&&wl){ wl.release(); wl=null } }catch(e){} }
  document.addEventListener('visibilitychange',function(){ if(!document.hidden&&job&&!job.finished){ wl=null; lock(true) } });

  // ---------- save the map along a route (offered when directions go through low-service areas) ----------
  var RC='awarebc-off-route', rjob=null, rLays=[], DEMU='https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
  function inHome(lat,lon){ if(!area||!area.done) return false; var b=box(area.lat,area.lon,area.r); return lat>=b.s&&lat<=b.n&&lon>=b.w&&lon<=b.e }
  function corridor(pts){ var samp=[], last=null; pts.forEach(function(p){ if(!last||km(last[0],last[1],p[0],p[1])>0.25){ samp.push(p); last=p } }); if(pts.length) samp.push(pts[pts.length-1]);
    var T={}, V={}, D={}, C={}, N={}, tp=vtpl(), bb={s:90,n:-90,w:180,e:-180};
    samp.forEach(function(p){ var la=p[0], lo=p[1]; bb.s=Math.min(bb.s,la); bb.n=Math.max(bb.n,la); bb.w=Math.min(bb.w,lo); bb.e=Math.max(bb.e,lo);
      for(var z=ZMIN;z<=ZMAX;z++){ var x=tx(lo,z), y=ty(la,z), r=z>=13?1:0; for(var dx=-r;dx<=r;dx++) for(var dy=-r;dy<=r;dy++){ var k=z+'/'+(x+dx)+'/'+(y+dy); T[k]=1; if(tp) V[k]=1 } }
      var dx2=tx(lo,12), dy2=ty(la,12); for(var a=-1;a<=1;a++) for(var c=-1;c<=1;c++) D['12/'+(dx2+a)+'/'+(dy2+c)]=1;
      C[Math.floor(la*10)+':'+Math.floor(lo*10)]=1; N[Math.floor(la/0.25)+':'+Math.floor(lo/0.25)]=1 });
    var urls=[], seen={}; function add(u){ if(!seen[u]){ seen[u]=1; urls.push(u) } }
    Object.keys(T).forEach(function(k){ var q=k.split('/'); add(BCR.replace('{z}',q[0]).replace('{x}',q[1]).replace('{y}',q[2])) });
    Object.keys(C).forEach(function(k){ var q=k.split(':'), s=+q[0]/10, w=+q[1]/10; cells({s:s,n:s+0.1,w:w,e:w+0.1}).forEach(add) });
    if(window.__osm&&window.__osm.speedUrls) samp.forEach(function(p,ix){ if(ix%4===0) window.__osm.speedUrls({s:p[0],n:p[0],w:p[1],e:p[1]}).forEach(add) }); // speed limits along the route
    var nm=Object.keys(N).map(function(k){ var q=k.split(':'); return nameCell(+q[0],+q[1]) }); nm.forEach(add);
    Object.keys(D).forEach(function(k){ var q=k.split('/'); add(DEMU.replace('{z}',q[0]).replace('{x}',q[1]).replace('{y}',q[2])) });
    var vurls=Object.keys(V).map(function(k){ var q=k.split('/'); return tp.replace('{z}',q[0]).replace('{x}',q[1]).replace('{y}',q[2]) });
    var pad=0.02; bb={s:bb.s-pad,n:bb.n+pad,w:bb.w-pad,e:bb.e+pad};
    return {urls:urls,vurls:vurls,names:nm,b:bb,bytes:(Object.keys(T).length*TKB+(urls.length-Object.keys(T).length)*CKB+vurls.length*VKB)*1024} }
  // the last 3 saved routes are kept (each in its own cache and archive slot); older one is replaced
  function routes(){ var r=lj('sky-offroute',null); if(r&&!Array.isArray(r)) r=r.b?[{b:r.b,at:r.at,bytes:r.bytes,slot:'route',cache:RC}]:[]; return r||[] }
  function addRouteLayer(){ rLays.forEach(function(l){ map.removeLayer(l) }); rLays=[]; routes().forEach(function(r){ if(!r.b) return;
    rLays.push(L.tileLayer(BCR,{bounds:L.latLngBounds([r.b.s,r.b.w],[r.b.n,r.b.e]),minZoom:ZMIN,maxNativeZoom:ZMAX,maxZoom:19,zIndex:0,attribution:'Offline map © Government of British Columbia (DataBC)'}).addTo(map)) }) }
  function saveRoute(pts,cb){ if(rjob) return false; var c=corridor(pts), all=c.urls.concat(c.vurls), i=0, ok=0, bad=0, bytes=0, fin=false, nU=c.urls.length;
    rjob={n:all.length,c:c}; rememberNames(c.names);
    var list0=routes(), used=list0.map(function(r){ return r.slot }), slot=['r0','r1','r2'].filter(function(s){ return used.indexOf(s)<0 })[0], drop=null;
    if(!slot){ drop=list0.slice().sort(function(a,b){ return a.at-b.at })[0]; slot=drop.slot } var myC=RC+'-'+slot;
    function tell(x){ try{ cb&&cb(x) }catch(e){} }
    (drop?caches.delete(drop.cache||RC):Promise.resolve()).then(function(){ return caches.delete(myC) }).then(function(){ return caches.open(myC) }).then(function(ca){
      function end(){ if(fin) return; fin=true; var re=/\/(\d+)\/(\d+)\/(\d+)\.pbf/, list=[];
        var pk=c.vurls.length&&window.__pm&&window.__pm.save?Promise.all(c.vurls.map(function(u){ var m=re.exec(u); return ca.match(u).then(function(r){ return r?r.blob():null }).then(function(bl){ if(bl&&bl.size&&m) list.push({z:+m[1],x:+m[2],y:+m[3],blob:bl}) }) }))
          .then(function(){ return list.length?window.__pm.save(list,{w:c.b.w,s:c.b.s,e:c.b.e,n:c.b.n,z0:ZMIN,z1:ZMAX},slot):0 }).then(function(){ return Promise.all(c.vurls.map(function(u){ return ca.delete(u) })) }).catch(function(){}):Promise.resolve();
        pk.then(function(){ var L3=routes().filter(function(r){ return r.slot!==slot&&(!drop||r!==drop&&r.slot!==drop.slot) }); L3.push({b:c.b,at:Date.now(),bytes:bytes,fail:bad,slot:slot,cache:myC}); ls('sky-offroute',JSON.stringify(L3.slice(-3))); addRouteLayer(); rjob=null; tell({done:true,bytes:bytes,fail:bad}) }) }
      function w(){ if(i>=all.length){ if(ok+bad>=all.length) end(); return } var u=all[i++];
        fetch(u,{mode:'cors',credentials:'omit'}).then(function(r){ if(!r.ok) throw 0; if(u.indexOf('/tile/')>0&&!/image/.test(r.headers.get('content-type')||'')) throw 0; var cl=r.clone(); return r.blob().then(function(bl){ bytes+=bl.size; return ca.put(u,cl) }) })
          .then(function(){ ok++ },function(){ bad++ }).then(function(){ tell({pct:Math.floor((ok+bad)/all.length*100),bytes:bytes}); w() }) }
      for(var k=0;k<5;k++) w() }).catch(function(){ rjob=null; tell({error:true}) });
    return true }
  window.__off={inHome:inHome,corridor:corridor,saveRoute:saveRoute,busy:function(){ return !!rjob },saved:function(){ return routes() },names:function(){ return lj('aw-names',[]) }};
  addRouteLayer();

  // ---------- setup screen ----------
  var ov=null, mini=null, circ=null, R=70, moved=false, uiT=null;
  function uiSoon(){ if(uiT) return; uiT=setTimeout(function(){ uiT=null; ui() },350) }
  function openSetup(){ if(ov){ ov.hidden=false; ui(); return }
    ov=document.createElement('div'); ov.id='ofsetup'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-label','Set up AwareBC');
    ov.innerHTML='<div class="ofmap"><div id="ofmini"></div><span class="ofpin">'+I('home',19)+'</span><span class="ofkm"></span><div class="ofhd"><b>Set up AwareBC</b><span class="ofdrag">Drag map to move home</span></div></div><div class="ofsheet"></div>';
    document.body.appendChild(ov);
    var c=home||(A.me()&&A.me().label==='you'?{lat:A.me().lat,lon:A.me().lon}:null)||{lat:map.getCenter().lat,lon:map.getCenter().lng};
    mini=L.map('ofmini',{zoomControl:false,attributionControl:false,zoomSnap:0,keyboard:false,rotate:false,rotateControl:false,touchRotate:false,shiftKeyRotate:false}).setView([c.lat,c.lon],8);
    L.tileLayer(BCR,{maxNativeZoom:17,maxZoom:18}).addTo(mini);
    circ=L.circle([c.lat,c.lon],{radius:R*1000,color:'#ff3b30',weight:2.5,dashArray:'7 6',fillColor:'#ff3b30',fillOpacity:.1,interactive:false}).addTo(mini);
    mini.on('move',function(){ circ.setLatLng(mini.getCenter()) }); mini.on('dragstart',function(){ moved=true; ui() }); mini.on('moveend',function(){ if(!job) ui() });
    fit(); if(!home&&navigator.geolocation) navigator.geolocation.getCurrentPosition(function(p){ if(!moved&&!job){ mini.setView([p.coords.latitude,p.coords.longitude],mini.getZoom()); ui() } },function(){},{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
    var pend=lj('sky-offjob',null); if(pend&&!job){ R=pend.r; mini.setView([pend.lat,pend.lon],mini.getZoom()); fit(); start(pend) } ui() }
  function fit(){ if(!mini) return; var c=mini.getCenter(), mpp=R*1000/80, z=Math.log(156543.03*Math.cos(c.lat*Math.PI/180)/mpp)/Math.LN2; mini.setView(c,z,{animate:false}); circ.setRadius(R*1000); var k=ov.querySelector('.ofkm'); k.textContent=(R===150?'Max · ':'')+R+' km' }
  var freeTxt='…'; try{ navigator.storage.estimate().then(function(e){ var f=(e.quota||0)-(e.usage||0); freeTxt=f>0?fmtMB(f)+' free':'?'; ui() }) }catch(e){ freeTxt='?' }
  var INC=['Map &amp; road names','FSRs, trails, closures','Creeks &amp; rivers','Trail reports + alerts','Get me home arrow','Track back to camp'];
  function incl(){ return '<div class="ofinc">'+INC.map(function(t){ return '<span>'+I('chk',12)+t+'</span>' }).join('')+'</div>' }
  function ui(){ if(!ov||ov.hidden) return; var sh=ov.querySelector('.ofsheet'); ov.querySelector('.ofdrag').hidden=!!job;
    if(!job){ var c=mini.getCenter(), e=est(c.lat,c.lng,R);
      sh.innerHTML='<div class="ofhomec"><span>'+I('home',17)+'</span><div><b>'+(home&&!moved?'Home':'Home set here')+'</b><small>'+(moved?'Moved by you · drag to fine-tune':'Your GPS spot · or drag the map')+'</small></div></div>'+
        '<div class="oflab">Save offline around home</div><div class="ofchips">'+SIZES.map(function(s){ return '<button type="button" data-r="'+s[0]+'"'+(s[0]===R?' class="on"':'')+'>'+s[1]+'</button>' }).join('')+'</div>'+
        '<div class="ofstats"><div>'+I('dl',16)+'<span><b>~'+fmtMB(e.bytes)+'</b><small>download size</small></span></div><div>'+I('clock',16)+'<span><b>~'+e.min+' min</b><small>on Wi-Fi</small></span></div>'+
        '<div>'+I('area',16)+'<span><b>'+e.km2.toLocaleString()+' km²</b><small>area covered</small></span></div><div>'+I('phone',16)+'<span><b>'+freeTxt+'</b><small>space for maps</small></span></div></div>'+incl()+
        '<button type="button" class="ofcta">'+I('dl',18)+' Save &amp; download</button><button type="button" class="ofskip">Skip for now · change later from Home</button>';
      [].forEach.call(sh.querySelectorAll('[data-r]'),function(b){ b.onclick=function(){ R=+b.getAttribute('data-r'); fit(); ui() } });
      sh.querySelector('.ofcta').onclick=function(){ var c2=mini.getCenter(); setHome(c2.lat,c2.lng); ls('sky-setup','1'); start({lat:+c2.lat.toFixed(5),lon:+c2.lng.toFixed(5),r:R}) };
      sh.querySelector('.ofskip').onclick=function(){ var c2=mini.getCenter(); setHome(c2.lat,c2.lng); ls('sky-setup','1'); close() };
      return }
    if(job.finished){ var a=area;
      sh.innerHTML='<div class="ofdone">'+I('chk',32)+'</div><div class="ofbig" style="text-align:center">Offline area ready</div><div class="ofsm" style="text-align:center">'+a.r+' km around home · '+fmtMB(a.bytes)+' · saved '+new Date(a.at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+(a.fail?' · '+a.fail+' bits could not load':'')+'</div>'+incl()+
        '<div class="ofnote"><span style="color:#30b0c7">'+I('arrow',15)+'</span>No service? Tap the Home pin on the map for a big arrow and distance back, plus your path in.</div><button type="button" class="ofcta">Start riding</button>';
      sh.querySelector('.ofcta').onclick=function(){ job=null; close() }; return }
    var tot=job.items.length, done=job.ok+job.fail, pct=Math.floor(done/tot*100), el=(Date.now()-job.t0)/1000, left=done>20?Math.max(0,(tot-done)*el/done):0, estB=done?job.bytes/done*tot:0;
    sh.innerHTML='<div class="ofprog"><b class="ofbig">'+(job.paused?(job.paused==='net'?'Waiting for signal':'Paused'):'Saving your area')+'</b><b class="ofpct">'+pct+'%</b></div><div class="ofbar"><i style="width:'+pct+'%"></i></div>'+
      '<div class="ofsm">'+fmtMB(job.bytes)+' of ~'+fmtMB(Math.max(estB,job.bytes))+(left?' · about '+Math.max(1,Math.round(left/60))+' min left':'')+'</div>'+
      '<div class="ofrow">Home pin<span class="ok">'+I('chk',13)+'Saved</span></div>'+
      '<div class="ofrow">FSRs, trails &amp; closures'+(job.fsDone>=job.nf?'<span class="ok">'+I('chk',13)+'Done</span>':'<em>'+job.fsDone+' of '+job.nf+'</em>')+'</div>'+
      '<div class="ofrow">Trail reports'+(job.rep===true?'<span class="ok">'+I('chk',13)+'Done</span>':'<em>'+(job.rep==='later'?'saves when online':'…')+'</em>')+'</div>'+
      (job.nv?'<div class="ofrow">Street map (.pmtiles)'+(job.pack===true?'<span class="ok">'+I('chk',13)+'Done</span>':'<em>'+(job.pack==='run'?'packing…':job.pack==='fail'?'could not pack':job.vDone.toLocaleString()+' of '+job.nv.toLocaleString())+'</em>')+'</div>':'')+
      '<div class="ofrow">Map tiles'+(job.tDone>=job.nt?'<span class="ok">'+I('chk',13)+'Done</span>':'<em>'+job.tDone.toLocaleString()+' of '+job.nt.toLocaleString()+'</em>')+'</div>'+
      '<div class="ofnote"><span style="color:#ff9f0a">'+I('phone',15)+'</span>Keep AwareBC open until it finishes. If you lose signal it picks up where it left off.</div>'+
      '<button type="button" class="ofghost">'+(job.paused==='user'?'Resume':'Pause')+'</button><button type="button" class="ofskip" data-a="hide">Use the app while it saves</button>';
    sh.querySelector('.ofghost').onclick=function(){ pause(job.paused!=='user') }; sh.querySelector('[data-a=hide]').onclick=close }
  function close(){ if(ov){ ov.hidden=true } }
  window.__offline={open:openSetup,home:function(){ return home }};

  drawHome(); addLayer();
  if(ls('sky-setup')!=='1'||lj('sky-offjob',null)) setTimeout(openSetup,600);
  watch();
})();
