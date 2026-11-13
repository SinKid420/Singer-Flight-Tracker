// AwareBC OpenStreetMap places (by Josh Singer). Free data from OpenStreetMap contributors through Overpass:
//  gates and barriers (and warnings when a route goes through one), gas and EV charging, emergency help (ER hospitals,
//  defibrillators, emergency phones, helipads, ranger stations, backcountry huts and shelters), drinking water, springs,
//  washrooms, rest areas and RV dump stations, peaks, passes and viewpoints with elevations, cell towers (for the
//  low-service check) and the posted speed limit while you drive. Saved with offline areas and saved routes.
(function boot(){
  var A=window.__AW; if(!A||!A.map||!window.L){ setTimeout(boot,300); return }
  var map=A.map, esc=A.esc||function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] }) };
  var OP='https://overpass-api.de/api/interpreter?data=', CS=0.1, SS=0.05;
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v) }catch(e){ return null } }
  function hav(a,b,c,d){ var r=Math.PI/180, x=Math.sin((c-a)*r/2), y=Math.sin((d-b)*r/2), h=x*x+Math.cos(a*r)*Math.cos(c*r)*y*y; return 12742000*Math.asin(Math.min(1,Math.sqrt(h))) }
  function cap(s){ s=String(s||'').replace(/_/g,' '); return s.charAt(0).toUpperCase()+s.slice(1) }
  var GT={gates:1,fuel:1,help:1,water:1,peaks:1,speed:1}; Object.keys(GT).forEach(function(k){ GT[k]=ls('aw-osm-'+k)!=='0' });

  // ---------- data: one Overpass request per 0.1° square (about 7 × 11 km), saved by the phone ----------
  function bb(i,j,s){ var S=i*s, W=j*s; return [S.toFixed(3),W.toFixed(3),(S+s).toFixed(3),(W+s).toFixed(3)].join(',') }
  function cellQ(i,j){ var b=bb(i,j,CS); return '[out:json][timeout:25];('+
    'node('+b+')[barrier~"^(gate|lift_gate|swing_gate|chain|bar|block)$"];'+
    'nwr('+b+')[amenity~"^(fuel|charging_station|hospital|ranger_station|drinking_water|toilets|sanitary_dump_station)$"];'+
    'nwr('+b+')[amenity=shelter][shelter_type~"^(basic_hut|lean_to|weather_shelter)$"];'+
    'node('+b+')[emergency~"^(defibrillator|phone)$"];nwr('+b+')[aeroway=helipad];'+
    'nwr('+b+')[tourism~"^(wilderness_hut|alpine_hut|viewpoint)$"];nwr('+b+')[highway~"^(rest_area|services)$"];'+
    'node('+b+')[natural~"^(peak|saddle|spring|volcano)$"];node('+b+')[mountain_pass=yes];'+
    'nwr('+b+')["communication:mobile_phone"];nwr('+b+')[man_made~"^(mast|tower)$"]["tower:type"="communication"];'+
    ');out tags center;' }
  function cellU(i,j){ return OP+encodeURIComponent(cellQ(i,j)) }
  function speedU(i,j){ var b=bb(i,j,SS); return OP+encodeURIComponent('[out:json][timeout:25];way('+b+')[highway~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service|track|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link)$"][maxspeed];out tags geom;') }
  var CC={}, ck=[];
  var run=0, Q=[]; function slot(fn){ return new Promise(function(ok){ Q.push(function(){ run++; fn().then(ok,function(){ ok(null) }).then(function(){ run--; if(Q.length) Q.shift()() }) }); if(run<2) Q.shift()() }) } // Overpass allows about 2 at once
  function get(u){ if(CC[u]) return CC[u]; var p=slot(function(){ return fetch(u).then(function(r){ if(!r.ok) throw 0; return r.json() }).then(function(j){ return j.elements||[] }) }).then(function(x){ if(!x) delete CC[u]; return x }); CC[u]=p; ck.push(u); if(ck.length>80) delete CC[ck.shift()]; return p }
  function cellsFor(b,s){ var o=[]; for(var i=Math.floor(b.s/s);i<=Math.floor(b.n/s);i++) for(var j=Math.floor(b.w/s);j<=Math.floor(b.e/s);j++) o.push([i,j]); return o }
  function kindOf(t){ if(t.barrier) return 'gate'; var a=t.amenity;
    if(a==='fuel'||a==='charging_station') return 'fuel'; if(a==='hospital'||a==='ranger_station'||t.emergency||t.aeroway==='helipad'||t.tourism==='wilderness_hut'||t.tourism==='alpine_hut'||a==='shelter') return 'help';
    if(a==='drinking_water'||a==='toilets'||a==='sanitary_dump_station'||t.highway==='rest_area'||t.highway==='services'||t.natural==='spring') return 'water';
    if(t.natural==='peak'||t.natural==='saddle'||t.natural==='volcano'||t.mountain_pass==='yes'||t.tourism==='viewpoint') return 'peaks';
    if(t['communication:mobile_phone']||t.man_made) return 'tower'; return '' }
  function pts(L2){ return (L2||[]).map(function(e){ var c=e.center||e; return {id:e.type+e.id,lat:c.lat,lon:c.lon,t:e.tags||{},k:kindOf(e.tags||{})} }).filter(function(p){ return p.k&&isFinite(p.lat) }) }
  function inArea(b){ return Promise.all(cellsFor(b,CS).slice(0,60).map(function(c){ return get(cellU(c[0],c[1])) })).then(function(R){ var o=[]; R.forEach(function(x){ o=o.concat(pts(x)) }); return o }) }

  // ---------- map markers ----------
  var IC={gate:'🚧',fuel:'⛽',help:'🆘',water:'🚰',peaks:'⛰'}, MINZ={gate:13,fuel:11,help:11,water:13,peaks:11}, lay=L.layerGroup().addTo(map), seen={};
  function label(p){ var t=p.t, a=t.amenity;
    if(p.k==='gate') return cap(t.barrier==='lift_gate'?'Gate (lift)':t.barrier==='chain'?'Chain across road':t.barrier==='block'?'Road blocks':'Gate')+(t.locked==='yes'||/^(private|no)$/.test(t.access||'')?' · may be locked':'');
    if(a==='fuel') return t.name||t.brand||'Gas station'; if(a==='charging_station') return t.name||'EV charging';
    if(a==='hospital') return (t.name||'Hospital')+(t.emergency==='yes'?' · ER':''); if(t.emergency==='defibrillator') return 'Defibrillator (AED)'+(t['defibrillator:location']?' · '+t['defibrillator:location']:'');
    if(t.emergency==='phone') return 'Emergency phone'; if(t.aeroway==='helipad') return t.name||'Helipad'; if(a==='ranger_station') return t.name||'Ranger station';
    if(t.tourism==='wilderness_hut'||t.tourism==='alpine_hut') return t.name||'Backcountry hut'; if(a==='shelter') return t.name||'Shelter';
    if(a==='drinking_water') return 'Drinking water'; if(t.natural==='spring') return t.name||'Spring'; if(a==='toilets') return t.name||'Washrooms'; if(a==='sanitary_dump_station') return 'RV dump station'; if(t.highway) return t.name||'Rest area';
    if(t.tourism==='viewpoint') return t.name||'Viewpoint'; if(t.mountain_pass==='yes'||t.natural==='saddle') return (t.name||'Pass')+(t.ele?' · '+Math.round(+t.ele).toLocaleString()+' m':'');
    return (t.name||'Peak')+(t.ele?' · '+Math.round(+t.ele).toLocaleString()+' m':'') }
  function icon(p){ var t=p.t, ic=IC[p.k]; if(t.amenity==='charging_station') ic='🔌'; if(t.amenity==='hospital') ic='🏥'; if(t.emergency==='defibrillator') ic='❤️'; if(t.emergency==='phone') ic='☎️'; if(t.aeroway==='helipad') ic='🚁'; if(t.amenity==='toilets') ic='🚻'; if(t.tourism==='viewpoint') ic='👁';
    if(t.tourism==='wilderness_hut'||t.tourism==='alpine_hut'||t.amenity==='shelter') ic='🛖'; if(t.amenity==='sanitary_dump_station') ic='🚐'; if(t.natural==='spring') ic='💧';
    var ele=p.k==='peaks'&&t.ele&&map.getZoom()>=12?'<small>'+Math.round(+t.ele).toLocaleString()+' m</small>':'';
    return L.divIcon({className:'',html:'<span class="osmk osm-'+p.k+'" role="button" aria-label="'+esc(label(p))+'">'+ic+ele+'</span>',iconSize:[0,0]}) }
  var css=document.createElement('style'); css.textContent='.osmk{display:inline-flex;align-items:center;gap:2px;transform:translate(-50%,-50%);font-size:15px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.8));white-space:nowrap}.osmk small{font:700 10px system-ui;color:#fff;text-shadow:0 0 3px #000,0 0 2px #000}.osm-gate{font-size:14px}.osm-help{font-size:16px}'+
    '#spdlim{position:fixed;z-index:1150;right:calc(max(16px,env(safe-area-inset-right,0px)) + 2px);bottom:calc(env(safe-area-inset-bottom,0px) + 150px);width:44px;height:44px;border-radius:50%;background:#fff;border:4px solid #d50000;color:#111;display:grid;place-items:center;font:800 16px/1 system-ui;box-shadow:0 2px 8px rgba(0,0,0,.6)}#spdlim[hidden]{display:none}#spdlim small{position:absolute;bottom:-14px;font:700 9px system-ui;color:#fff;text-shadow:0 0 3px #000}#spdlim.mph{border-radius:6px;border:3px solid #111}';
  document.head.appendChild(css);
  var drawT=null, gen=0;
  function draw(){ clearTimeout(drawT); drawT=null; var z=map.getZoom(), my=++gen; if(z<11||navigator.onLine===false&&!Object.keys(CC).length){ lay.clearLayers(); seen={}; return }
    var bd=map.getBounds(), b={s:bd.getSouth(),n:bd.getNorth(),w:bd.getWest(),e:bd.getEast()}; if(cellsFor(b,CS).length>16){ return }
    inArea(b).then(function(P){ if(my!==gen) return; var keep={}, n=0;
      var AW=window.__awp; P.forEach(function(p){ if(AW&&AW.isGone&&AW.isGone(p.lat,p.lon,p.t.name||p.t.brand||'')) return; if(p.k==='tower'||!GT[p.k==='gate'?'gates':p.k]||z<MINZ[p.k]||n>400) return; if(!bd.pad(0.1).contains([p.lat,p.lon])) return; n++; keep[p.id]=1; if(seen[p.id]) return;
        seen[p.id]=L.marker([p.lat,p.lon],{icon:icon(p),keyboard:false,zIndexOffset:p.k==='help'?-100:-450,title:label(p)}).on('click',function(){ if(window.__pin) window.__pin(L.latLng(p.lat,p.lon),label(p)) }).addTo(lay) });
      Object.keys(seen).forEach(function(id){ if(!keep[id]){ lay.removeLayer(seen[id]); delete seen[id] } }) }) }
  map.on('moveend zoomend',function(){ clearTimeout(drawT); drawT=setTimeout(draw,700) }); setTimeout(draw,2500); window.__osmRedraw=function(){ lay.clearLayers(); seen={}; draw() };

  // ---------- gates on a route (warning in the directions panel, spoken ahead) ----------
  function segD(p,a,b){ var cx=Math.cos(a[0]*Math.PI/180), ax=(b[1]-a[1])*cx, ay=b[0]-a[0], px=(p.lon-a[1])*cx, py=p.lat-a[0], L2=ax*ax+ay*ay, t=L2?Math.max(0,Math.min(1,(px*ax+py*ay)/L2)):0; return {d:Math.hypot(px-t*ax,py-t*ay)*111320,t:t} }
  function gatesOn(r){ var P=r.pts; if(!P||P.length<2) return Promise.resolve([]); var b={s:90,n:-90,w:180,e:-180}; P.forEach(function(p){ b.s=Math.min(b.s,p[0]); b.n=Math.max(b.n,p[0]); b.w=Math.min(b.w,p[1]); b.e=Math.max(b.e,p[1]) });
    var cs={}; for(var i=0;i<P.length;i++) cs[Math.floor(P[i][0]/CS)+':'+Math.floor(P[i][1]/CS)]=1;
    return Promise.all(Object.keys(cs).slice(0,80).map(function(k){ var q=k.split(':'); return get(cellU(+q[0],+q[1])) })).then(function(R){ var G=[]; R.forEach(function(x){ pts(x).forEach(function(p){ if(p.k==='gate') G.push(p) }) });
      var out=[]; G.forEach(function(g){ if(g.lat<b.s-.01||g.lat>b.n+.01||g.lon<b.w-.01||g.lon>b.e+.01) return; for(var i=0;i<P.length-1;i++){ var s=segD(g,P[i],P[i+1]); if(s.d<12){ out.push({g:g,at:r.cum[i]+s.t*(r.cum[i+1]-r.cum[i])}); return } } });
      return out.sort(function(a,b){ return a.at-b.at }) }) }
  window.__osm={ gatesOn:gatesOn, inArea:inArea,
    towers:function(b){ return inArea(b).then(function(P){ return P.filter(function(p){ return p.k==='tower' }) }) },
    towersAlong:function(P){ var cs={}; for(var i=0;i<P.length;i+=3) cs[Math.floor(P[i][0]/CS)+':'+Math.floor(P[i][1]/CS)]=1;
      return Promise.all(Object.keys(cs).slice(0,120).map(function(k){ var q=k.split(':'); return get(cellU(+q[0],+q[1])) })).then(function(R){ var o=[], ok=0; R.forEach(function(x){ if(x) ok++; pts(x).forEach(function(p){ if(p.k==='tower') o.push([p.lat,p.lon]) }) }); return ok?o:null }) },
    urls:function(b){ return cellsFor(b,CS).map(function(c){ return cellU(c[0],c[1]) }) },
    speedUrls:function(b){ return cellsFor(b,SS).map(function(c){ return speedU(c[0],c[1]) }) },
    nearest:function(lat,lon,km){ var la=(Math.round(lat*20)/20).toFixed(2), lo=(Math.round(lon*20)/20).toFixed(2), a='(around:'+Math.round(km*1000)+','+la+','+lo+')';
      var u=OP+encodeURIComponent('[out:json][timeout:25];(nwr'+a+'[amenity~"^(hospital|ranger_station)$"];node'+a+'[emergency~"^(defibrillator|phone)$"];nwr'+a+'[aeroway=helipad];nwr'+a+'[tourism~"^(wilderness_hut|alpine_hut)$"];nwr'+a+'[amenity=shelter][shelter_type~"^(basic_hut|lean_to)$"];);out tags center 150;');
      var c2=Math.min(km,15)/111, cl=Math.cos(lat*Math.PI/180); // no signal: the saved squares around you
      return get(u).then(function(L2){ return L2?pts(L2):inArea({s:lat-c2,n:lat+c2,w:lon-c2/cl,e:lon+c2/cl}) }).then(function(P){ return P.filter(function(p){ return p.k==='help' }).map(function(p){ p.d=hav(lat,lon,p.lat,p.lon); p.label=label(p); return p }).sort(function(a,b){ return a.d-b.d }) }) },
    nearestUrl:null,
    label:label, set:GT };

  // ---------- posted speed limit while you drive ----------
  var sign=document.createElement('div'); sign.id='spdlim'; sign.hidden=true; sign.setAttribute('role','img'); document.body.appendChild(sign);
  var lastMe=null, spd=0, wayT=0;
  function upSpeed(){ var me=A.me&&A.me(); if(!me||me.label!=='you'||!GT.speed){ sign.hidden=true; return } var now=Date.now();
    if(lastMe){ var dt=(now-lastMe.t)/1000; if(dt>0.5) spd=spd*0.5+hav(lastMe.la,lastMe.lo,me.lat,me.lon)/dt*0.5 } lastMe={la:me.lat,lo:me.lon,t:now};
    var nav=window.__nav&&window.__nav.isNav&&window.__nav.isNav(); if(spd<4&&!nav){ sign.hidden=true; return }
    var i=Math.floor(me.lat/SS), j=Math.floor(me.lon/SS);
    get(speedU(i,j)).then(function(W){ if(!W){ sign.hidden=true; return } var best=null, bd=25;
      W.forEach(function(w){ var g=w.geometry||[]; for(var k=0;k<g.length-1;k++){ var s=segD({lat:me.lat,lon:me.lon},[g[k].lat,g[k].lon],[g[k+1].lat,g[k+1].lon]); if(s.d<bd){ bd=s.d; best=w } } });
      if(!best){ sign.hidden=true; return } var ms=String(best.tags.maxspeed||''), m=/^(\d{1,3})\s*(mph)?$/.exec(ms); if(!m){ sign.hidden=true; return }
      sign.classList.toggle('mph',!!m[2]); sign.innerHTML=m[1]+(m[2]?'<small>mph</small>':''); sign.setAttribute('aria-label','Speed limit '+m[1]+(m[2]?' mph':' km/h')); sign.title='Posted speed limit (OpenStreetMap)'; sign.hidden=false }) }
  setInterval(upSpeed,3000);

  // ---------- Settings ▸ Map places (OpenStreetMap) ----------
  (function(){ var after=document.getElementById('rfolder'); if(!after) return; var f=document.createElement('details'); f.className='folder'; f.id='osmfolder';
    var R=[['gates','Gates & barriers'],['fuel','Gas & EV charging'],['help','Emergency help'],['water','Water & rest stops'],['peaks','Peaks, passes & views'],['speed','Speed limit while driving']];
    f.innerHTML='<summary>Map places (OpenStreetMap)</summary>'+R.map(function(r){ return '<label class="setrow">'+r[1]+'<select data-k="'+r[0]+'"><option value="1">Show</option><option value="0">Hide</option></select></label>' }).join('')+'<div class="fhelp">Free data from OpenStreetMap volunteers: some places may be missing or out of date. Directions warn about gates on your route.</div>';
    after.parentNode.insertBefore(f,after.nextSibling);
    [].forEach.call(f.querySelectorAll('select'),function(s){ var k=s.getAttribute('data-k'); s.value=GT[k]?'1':'0'; s.onchange=function(){ GT[k]=s.value==='1'; ls('aw-osm-'+k,s.value); lay.clearLayers(); seen={}; draw(); if(k==='speed') upSpeed() } });
    f.addEventListener('toggle',function(){ var sh=document.querySelector('#fsheet .sheet'); if(sh) sh.classList.toggle('fopen',!!document.querySelector('#fsheet details.folder[open]')) }) })();
})();
