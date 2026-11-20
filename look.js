// AwareBC "New map look" (by Josh Singer). Preview: switch it on in Layers ▸ Map ▸ Map look.
// Moonlit night (sun-timed, not too dark), direction cone + today's breadcrumb trail for your rig, soft cloud shadows, smoke as haze,
// smooth pin fades while zooming, and a soft shimmer where map pictures are still loading. Cleaner labels, 3D hills, road colours
// and pin bubbles live in gl.js, app.js and osm.js (they read the same switch).
(function(){
  var A=window.__AW; if(!A||!A.map) return; var map=A.map;
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v) }catch(e){ return null } }
  var NEW=ls('aw-look')==='new', LOW=!!window.__awLow;

  // ---- the switch (Layers ▸ Map tab, On-road and Off-road) ----
  function row(){ [].forEach.call(document.querySelectorAll('.lyrp .awmap'),function(mp){ if(mp.querySelector('.awlookrow')) return;
    var l=document.createElement('label'); l.className='fps fpm awlookrow'; l.innerHTML='<span class="awml">Map look</span><select aria-label="Map look"><option value="classic">Classic</option><option value="new">New (preview)</option></select>';
    mp.insertBefore(l,mp.firstChild); var s=l.querySelector('select'); s.value=NEW?'new':'classic';
    s.onchange=function(){ ls('aw-look',s.value); var d=document.createElement('div'); d.className='frtoast'; d.style.zIndex=6400; d.textContent='Switching map look…'; document.body.appendChild(d); setTimeout(function(){ location.reload() },400) } }) }
  setInterval(row,1500); setTimeout(row,600);
  if(!NEW) return;
  document.body.classList.add('awnew');

  var css=
  /* moonlit night: the ground stays readable, cooler and dimmer; roads, trails, pins and labels stay bright */
  'body.awmoon .basel{filter:brightness(.74) saturate(.7) contrast(1.06)!important}'+
  'body.awmoon #map.night:not(.sat) .basel{filter:invert(1) hue-rotate(180deg) brightness(.92) contrast(.9) saturate(.85)!important}'+
  '.awmoonpane{pointer-events:none}.awmoonpane div{position:absolute;inset:-50%;background:radial-gradient(ellipse at 50% 35%,rgba(60,90,170,.10),rgba(18,28,70,.26) 70%)}body:not(.awmoon) .awmoonpane{display:none}'+
  (LOW?'':'body.awmoon .leaflet-overlay-pane canvas,body.awmoon .leaflet-overlay-pane svg{filter:drop-shadow(0 0 2.5px rgba(255,255,255,.22))}')+
  /* your rig: a soft cone showing which way you are heading while you move */
  'body.awnew .leaflet-marker-icon.me.mv::before{content:"";position:absolute;left:50%;top:50%;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;pointer-events:none;'+
    'background:conic-gradient(from -24deg,rgba(255,80,60,.42) 0deg 48deg,transparent 48deg);-webkit-mask:radial-gradient(circle,#000 18%,transparent 70%);mask:radial-gradient(circle,#000 18%,transparent 70%);transform:rotate(var(--hd,0deg));transition:transform .5s}'+
  /* smoke forecast as a soft haze, not blobs */
  'body.awnew .smokel{filter:blur(6px) saturate(.65)}'+
  /* pins fade a little while you zoom and come back smoothly */
  'body.awnew .leaflet-marker-pane,body.awnew .leaflet-overlay-pane{transition:opacity .28s ease}body.awnew.zooming .leaflet-marker-pane{opacity:.55}'+
  /* map pictures still loading: a slow, soft shimmer instead of flat black */
  '@keyframes awshim{0%{background-position:-200% 0}100%{background-position:200% 0}}'+
  'body.awnew.awtload #map{background-image:linear-gradient(100deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.05) 50%,rgba(255,255,255,0) 70%);background-size:200% 100%;animation:awshim 1.6s linear infinite}'+
  '@media (prefers-reduced-motion:reduce){body.awnew.awtload #map{animation:none}}'+
  /* legend colours follow the new road colours */
  'body.awnew #fsrleg .lm{border-top-color:#c86bff!important;opacity:1!important}body.awnew #fsrleg .lf,body.awnew #fsrleg .lrd{border-top-color:#ff2d2d!important}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  // ---- moonlit night by the sun at your spot ----
  var mp=map.createPane('awmoon',map._rotatePane||map.getPane('mapPane')); mp.style.zIndex=205; mp.className+=' awmoonpane'; mp.appendChild(document.createElement('div'));
  function sunAlt(lat,lon,t){ var D=Math.PI/180, n=t/86400000-10957.5, L0=(280.46+0.9856474*n)%360, g=((357.528+0.9856003*n)%360)*D, lam=(L0+1.915*Math.sin(g)+0.02*Math.sin(2*g))*D, eps=23.439*D,
      dec=Math.asin(Math.sin(eps)*Math.sin(lam)), ra=Math.atan2(Math.cos(eps)*Math.sin(lam),Math.cos(lam)), gmst=(280.46061837+360.98564736629*n)%360, ha=(gmst+lon)*D-ra;
    return Math.asin(Math.sin(lat*D)*Math.sin(dec)+Math.cos(lat*D)*Math.cos(dec)*Math.cos(ha))/D }
  function moon(){ var m=A.me&&A.me(), c=map.getCenter(), lat=m&&isFinite(m.lat)?m.lat:c.lat, lon=m&&isFinite(m.lon)?m.lon:c.lng, th=ls('sky-theme')||'day';
    var night=th==='night'||sunAlt(lat,lon,Date.now())<-2; document.body.classList.toggle('awmoon',night) }
  moon(); setInterval(moon,120000);

  // ---- today's breadcrumb trail (kept on this phone, cleared each new day) ----
  var day=new Date().toDateString(), K='aw-crumbs', crumbs=[];
  try{ var cv=JSON.parse(ls(K)||'null'); if(cv&&cv.d===day) crumbs=cv.p||[] }catch(e){}
  var line=L.polyline(crumbs,{color:'#ffffff',weight:3,opacity:.55,dashArray:'1 6',lineCap:'round',interactive:false}).addTo(map), last=crumbs[crumbs.length-1]||null;
  function crumb(){ var m=A.me&&A.me(); if(!m||!isFinite(m.lat)||m.label==='none') return; var p=[+m.lat.toFixed(5),+m.lon.toFixed(5)];
    if(new Date().toDateString()!==day){ day=new Date().toDateString(); crumbs=[]; line.setLatLngs([]) }
    if(last&&map.distance(last,p)<25) return; last=p; crumbs.push(p); if(crumbs.length>3000) crumbs.splice(0,crumbs.length-3000); line.addLatLng(p); try{ ls(K,JSON.stringify({d:day,p:crumbs})) }catch(e){} }
  setInterval(crumb,6000);

  // ---- soft cloud shadows drifting with the wind (live cloud cover) ----
  if(!LOW){ var cp=map.createPane('awcloud',map._rotatePane||map.getPane('mapPane')); cp.style.zIndex=378; cp.style.pointerEvents='none';
    var cv2=document.createElement('canvas'); cv2.setAttribute('aria-hidden','true'); cv2.style.cssText='position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none'; cp.appendChild(cv2);
    var cx=cv2.getContext('2d'), W=0, H=0, cover=0, wind=0, dir=0, blobs=[], run=false, t0=0, lastP=null;
    function size(){ var s=map.getSize(); W=s.x; H=s.y; cv2.width=Math.round(W/2); cv2.height=Math.round(H/2); cv2.style.width=W+'px'; cv2.style.height=H+'px' }
    function place(){ var p=map.containerPointToLayerPoint([0,0]); cv2.style.transform='translate3d('+p.x+'px,'+p.y+'px,0)' }
    function seed(){ blobs=[]; var n=Math.round(4+cover/12); for(var i=0;i<n;i++) blobs.push({x:Math.random()*W,y:Math.random()*H,r:120+Math.random()*220,a:.5+Math.random()*.5}) }
    function moved(){ var w=map.project(map.getCenter()); if(lastP){ var dx=lastP.x-w.x, dy=lastP.y-w.y; if(Math.abs(dx)<600&&Math.abs(dy)<600) blobs.forEach(function(b){ b.x+=dx; b.y+=dy }) } lastP=w; place() }
    function frame(t){ if(!run) return; requestAnimationFrame(frame); if(document.hidden) return; var dt=t0?Math.min(.1,(t-t0)/1000):0; t0=t; if(dt<.05&&t0) {}
      var sp=Math.min(30,wind)*.6, rad=(dir+180)*Math.PI/180, vx=Math.sin(rad)*sp, vy=-Math.cos(rad)*sp;
      cx.setTransform(.5,0,0,.5,0,0); cx.clearRect(0,0,W,H); var op=Math.min(.24,cover/400);
      blobs.forEach(function(b){ b.x+=vx*dt; b.y+=vy*dt; if(b.x<-b.r) b.x=W+b.r; if(b.x>W+b.r) b.x=-b.r; if(b.y<-b.r) b.y=H+b.r; if(b.y>H+b.r) b.y=-b.r;
        var g=cx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r); g.addColorStop(0,'rgba(8,12,20,'+(op*b.a)+')'); g.addColorStop(1,'rgba(8,12,20,0)'); cx.fillStyle=g; cx.fillRect(b.x-b.r,b.y-b.r,b.r*2,b.r*2) }) }
    function apply(){ var on=cover>=30; if(on&&!run){ size(); place(); seed(); run=true; t0=0; cv2.style.display=''; requestAnimationFrame(frame) } else if(!on&&run){ run=false; cv2.style.display='none' } }
    try{ var sv=JSON.parse(ls('aw-cloudwx')||'null'); if(sv&&Date.now()-sv.t<6*3600000){ cover=sv.c; wind=sv.w; dir=sv.d } }catch(e){}
    function check(){ var m=A.me&&A.me(); if(!m||!isFinite(m.lat)||navigator.onLine===false) return;
      fetch('https://api.open-meteo.com/v1/forecast?latitude='+m.lat.toFixed(2)+'&longitude='+m.lon.toFixed(2)+'&current=cloud_cover,wind_speed_10m,wind_direction_10m').then(function(r){ return r.json() }).then(function(j){ var c=j&&j.current||{};
        cover=+c.cloud_cover||0; wind=+c.wind_speed_10m||0; dir=+c.wind_direction_10m||0; ls('aw-cloudwx',JSON.stringify({t:Date.now(),c:cover,w:wind,d:dir})); apply() }).catch(function(){}) }
    map.on('move zoom viewreset',moved); map.on('resize',function(){ if(run){ size(); place(); seed() } }); map.on('zoomend',function(){ if(run) seed() });
    apply(); setTimeout(check,6000); setInterval(check,1800000);
    window.__clouds={state:function(){ return {cover:cover,running:run,blobs:blobs.length} }, _set:function(c){ cover=c; apply() }} }

  // ---- shimmer while map pictures load ----
  var loading=0, lt=null;
  function hook(l){ if(!(l instanceof L.GridLayer)||l.__awl) return; l.__awl=1;
    l.on('loading',function(){ loading++; clearTimeout(lt); lt=setTimeout(function(){ document.body.classList.toggle('awtload',loading>0) },250) });
    l.on('load',function(){ loading=Math.max(0,loading-1); if(!loading){ clearTimeout(lt); document.body.classList.remove('awtload') } }) }
  map.eachLayer(hook); map.on('layeradd',function(e){ hook(e.layer) });
  setInterval(function(){ if(loading&&!document.querySelector('.leaflet-tile-loading')){ loading=0; document.body.classList.remove('awtload') } },4000);
  window.__look={moon:moon,crumbs:function(){ return crumbs.length }};
})();
