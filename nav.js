// AwareBC directions (by Josh Singer)
// On road: turn-by-turn on regular roads from OpenStreetMap (OSRM route service).
// Off road: routes built on the phone from BC Government road data (Digital Road Atlas + Forest Service and permit roads),
// with warnings for roads closed to vehicles today, closed areas, rough or overgrown roads and industrial roads.
// No signal: On road falls back to the same BC road data (saved when you save an area for offline).
// Street names: when the map is turned south-up, the upside-down map names are swapped for upright ones.
(function boot(){
  if(!window.__AW||!window.L){ setTimeout(boot,300); return }
  var A=window.__AW, map=A.map, esc=A.esc||function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] }) };
  var OSRM='https://router.project-osrm.org/route/v1/driving/', WFSU='https://openmaps.gov.bc.ca/geo/pub/wfs';
  var R=6371000, D2R=Math.PI/180;
  function hav(a,b,c,d){ var x=(c-a)*D2R, y=(d-b)*D2R, h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*D2R)*Math.cos(c*D2R)*Math.sin(y/2)*Math.sin(y/2); return 2*R*Math.asin(Math.min(1,Math.sqrt(h))) }
  function brg(a,b,c,d){ var y=Math.sin((d-b)*D2R)*Math.cos(c*D2R), x=Math.cos(a*D2R)*Math.sin(c*D2R)-Math.sin(a*D2R)*Math.cos(c*D2R)*Math.cos((d-b)*D2R); return (Math.atan2(y,x)/D2R+360)%360 }
  function dTxt(m){ if(m<950) return (m<100?Math.round(m/10)*10:Math.round(m/50)*50)+' m'; return (m<9500?(m/1000).toFixed(1):Math.round(m/1000))+' km' }
  function tTxt(s){ var m=Math.round(s/60); if(m<60) return Math.max(1,m)+' min'; return Math.floor(m/60)+' h '+(m%60)+' min' }
  function offMode(){ var b=document.querySelector('.seg button[data-b=fsr]'); return !!b&&b.getAttribute('aria-pressed')==='true' }
  function cap(s){ s=String(s||'').trim(); return s.toLowerCase().replace(/(^|[\s\-\/(])([a-z])/g,function(m,a,b){ return a+b.toUpperCase() }).replace(/\bFsr\b/g,'FSR').replace(/\b(\d+)([a-z])\b/g,function(m,a,b){ return a+b.toUpperCase() }) }

  // ---------- UI ----------
  var css=document.createElement('style');
  css.textContent='#navp{position:fixed;left:16px;right:70px;top:calc(env(safe-area-inset-top,0px) + 104px);z-index:1240;background:rgba(28,28,30,.97);color:#fff;border-radius:14px;padding:9px 11px;font:13px/1.35 var(--font,system-ui);box-shadow:0 4px 18px rgba(0,0,0,.55)}#navp[hidden]{display:none}'+
    '#navp .nh{display:flex;gap:8px;align-items:center}#navp .ni{flex:none;width:38px;height:38px;border-radius:10px;background:var(--accent,#ff3b30);display:grid;place-items:center;font-size:22px;line-height:1}#navp .nt{flex:1;min-width:0}#navp .nt b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#navp .nt span{color:#bbb}'+
    '#navp .nb{display:flex;gap:6px;margin-top:8px}#navp .nb button{flex:1;border:0;border-radius:9px;padding:8px 4px;font:700 13px var(--font,system-ui);background:rgba(255,255,255,.12);color:#fff;white-space:nowrap}#navp .nb .nx{flex:0 0 38px}#navp .nb .pri{background:var(--accent,#ff3b30)}'+
    '#navp .nw{margin-top:6px;color:#ffb74d;font-size:12px}#navp .nw div{margin-top:2px}#navp .nl{max-height:34vh;overflow:auto;margin-top:8px;border-top:1px solid rgba(255,255,255,.12)}#navp .nl div{display:flex;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.07)}#navp .nl i{font-style:normal;width:20px;text-align:center}#navp .nl small{color:#aaa;margin-left:auto;white-space:nowrap}'+
    'body.menuon #navp,body.toolon #navp,body.trcard #navp,body.fsrp #navp,body:has(.lyrp:not([hidden])) #navp,body:has(.sheet-bg:not([hidden])) #navp,body:has(#frsheet:not([hidden])) #navp{display:none!important}'+ // directions panel steps aside while a layers panel or sheet is open
    'body.navon #locmsg{top:calc(env(safe-area-inset-top,0px) + 232px)}.navdest{font-size:26px;line-height:1;filter:drop-shadow(0 1px 2px #000)}';
  document.head.appendChild(css);
  var P=document.createElement('div'); P.id='navp'; P.hidden=true; P.setAttribute('role','region'); P.setAttribute('aria-label','Directions'); document.body.appendChild(P);
  var lineB=null, lineF=null, destM=null, dest=null, rt=null, nav=false, showList=false, busy=0, wid=null, offN=0, lastRe=0, lastPos=null;

  function icon(t,m){ if(t==='arrive') return '🏁'; if(t==='depart') return '⬆'; if(/roundabout|rotary/.test(t)) return '⟳';
    if(m==='uturn') return '↩'; if(/sharp left|^left/.test(m)) return '⬅'; if(/sharp right|^right/.test(m)) return '➡'; if(m==='slight left') return '↖'; if(m==='slight right') return '↗'; return '⬆' }

  function draw(){ clear(true); if(!rt) return;
    lineB=L.polyline(rt.pts,{color:'#0b3d91',weight:9,opacity:.85,interactive:false}).addTo(map);
    lineF=L.polyline(rt.pts,{color:rt.mode==='off'?'#ffb300':'#40a9ff',weight:5,opacity:1,interactive:false}).addTo(map) }
  function clear(keepDest){ if(lineB) map.removeLayer(lineB); if(lineF) map.removeLayer(lineF); lineB=lineF=null; if(!keepDest&&destM){ map.removeLayer(destM); destM=null } }

  function panel(){ if(!dest){ P.hidden=true; document.body.classList.remove('navon'); return } P.hidden=false; document.body.classList.add('navon');
    var h='', mode=(rt?rt.mode:(offMode()?'off':'on'))==='off'?'Off road':'On road';
    if(busy){ h='<div class="nh"><span class="ni">🧭</span><span class="nt"><b>Finding a route…</b><span>'+mode+' · to '+esc(dest.n)+'</span></span></div><div class="nb"><button type="button" data-a="x">Cancel</button></div>' }
    else if(!rt){ h='<div class="nh"><span class="ni">⚠</span><span class="nt"><b>'+esc(dest.err||'No route found')+'</b><span>'+mode+' · to '+esc(dest.n)+'</span></span></div><div class="nb"><button type="button" data-a="sw">Try '+(mode==='On road'?'Off road':'On road')+'</button><button type="button" data-a="x">Close</button></div>' }
    else if(rt.arrived){ h='<div class="nh"><span class="ni">🏁</span><span class="nt"><b>You have arrived</b><span>'+esc(dest.n)+'</span></span></div><div class="nb"><button type="button" data-a="end">Done</button></div>' }
    else if(!nav){ h='<div class="nh"><span class="ni">🧭</span><span class="nt"><b>'+esc(dest.n)+'</b><span>'+dTxt(rt.dist)+' · '+tTxt(rt.dur)+' · '+mode+'</span></span></div>'+warnH()+
      '<div class="nb"><button type="button" class="pri" data-a="go">Start</button><button type="button" data-a="ls">'+(showList?'Hide':'Steps')+'</button><button type="button" data-a="sw">'+(mode==='On road'?'Off road':'On road')+'</button><button type="button" class="nx" data-a="x" aria-label="Close directions">✕</button></div>'+(showList?listH():'') }
    else { var s=rt.steps[rt.next]||rt.steps[rt.steps.length-1], left=Math.max(0,rt.dist-rt.prog), eta=new Date(Date.now()+left/Math.max(rt.dist,1)*rt.dur*1000);
      h='<div class="nh"><span class="ni">'+s.ic+'</span><span class="nt"><b>'+dTxt(Math.max(0,rt.cum[s.i]-rt.prog))+' · '+esc(s.tx)+'</b><span>'+dTxt(left)+' left · '+tTxt(left/Math.max(rt.dist,1)*rt.dur)+' · arrive '+eta.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+'</span></span></div>'+
        (rt.note?'<div class="nw">'+esc(rt.note)+'</div>':'')+'<div class="nb"><button type="button" data-a="ls">'+(showList?'Hide steps':'Steps')+'</button><button type="button" data-a="end">End</button></div>'+(showList?listH():'') }
    P.innerHTML=h }
  function warnH(){ return rt.warn&&rt.warn.length?'<div class="nw">'+rt.warn.slice(0,4).map(function(w){ return '<div>⚠ '+esc(w)+'</div>' }).join('')+'</div>':'' }
  function listH(){ return '<div class="nl">'+rt.steps.map(function(s,k){ var d=(rt.steps[k+1]?rt.cum[rt.steps[k+1].i]:rt.dist)-rt.cum[s.i]; return '<div><i>'+s.ic+'</i><span>'+esc(s.tx)+'</span>'+(d>0&&s.ic!=='🏁'?'<small>'+dTxt(d)+'</small>':'')+'</div>' }).join('')+'</div>' }
  P.onclick=function(e){ var b=e.target.closest('button'); if(!b) return; var a=b.getAttribute('data-a');
    if(a==='x'||a==='end'){ stop(); dest=null; rt=null; clear(); panel() }
    else if(a==='ls'){ showList=!showList; panel() }
    else if(a==='sw'){ route((rt?rt.mode:(offMode()?'off':'on'))==='off'?'on':'off') }
    else if(a==='go'){ start() } };

  // ---------- route requests ----------
  function from(){ var m=A.me&&A.me(); return lastPos||{lat:m.lat,lon:m.lon} }
  function to(ll,name){ dest={lat:ll.lat,lon:ll.lng!=null?ll.lng:ll.lon,n:name||'Pinned spot'}; showList=false; stop();
    if(destM) map.removeLayer(destM); destM=L.marker([dest.lat,dest.lon],{icon:L.divIcon({className:'navdest',html:'🏁',iconSize:[28,28],iconAnchor:[6,26]}),keyboard:false,interactive:false}).addTo(map);
    route(offMode()?'off':'on') }
  var seq=0;
  function route(mode,quiet){ if(!dest) return; var id=++seq, a=from(); busy=quiet?0:1; if(!quiet){ rt=null; clear(true) } panel();
    var p=mode==='off'?offRoute(a,dest):onRoute(a,dest).catch(function(e){ var d=dest;
      return offRoute(a,d,true).then(function(r){ (r.warn=r.warn||[]).unshift(navigator.onLine?'Route service not reachable · route from BC road data':'No signal · route from saved BC road data'); return r },
        function(e2){ throw new Error(navigator.onLine?((e&&e.message)||'Route service not reachable'):'No signal and no saved road data here. Save this area for offline when you have signal') }) });
    p.then(function(r){ if(id!==seq) return; busy=0; rt=r; r.mode=mode; r.prog=0; r.next=1; r.li=0; draw(); if(!quiet&&!nav) map.fitBounds(lineF.getBounds(),{paddingTopLeft:[30,240],paddingBottomRight:[90,90]}); if(nav) track(lastPos); panel() },
      function(err){ if(id!==seq) return; busy=0; if(quiet) return; rt=null; dest.err=err&&err.message||'No route found'; panel() }) }

  // On road: OSRM
  var MOD={'uturn':'Make a U-turn','sharp left':'Turn sharp left','left':'Turn left','slight left':'Bear left','straight':'Go straight','slight right':'Bear right','right':'Turn right','sharp right':'Turn sharp right'};
  function stepTx(s){ var m=s.maneuver, t=m.type, mo=m.modifier||'', n=s.name||s.ref||'', on=n?' onto '+n:'';
    switch(t){ case 'depart': return 'Head '+['north','northeast','east','southeast','south','southwest','west','northwest'][Math.round((m.bearing_after||0)/45)%8]+(n?' on '+n:'');
      case 'arrive': return 'Arrive at '+dest.n;
      case 'roundabout': case 'rotary': case 'roundabout turn': return 'At the roundabout, take exit '+(m.exit||1)+on;
      case 'merge': return 'Merge'+(mo?' '+mo.replace('slight ',''):'')+on;
      case 'on ramp': return 'Take the ramp'+on; case 'off ramp': return 'Take the exit'+on;
      case 'fork': return 'Keep '+(mo.indexOf('left')>=0?'left':'right')+on;
      case 'end of road': return 'At the end of the road, turn '+(mo.indexOf('left')>=0?'left':'right')+on;
      case 'new name': case 'continue': return (mo&&mo!=='straight'?(MOD[mo]||'Continue'):'Continue')+on;
      default: return (MOD[mo]||'Continue')+on } }
  function onRoute(a,b){ if(navigator.onLine===false) return Promise.reject(new Error('No signal')); var ac=window.AbortController?new AbortController():null, to=setTimeout(function(){ if(ac) ac.abort() },9000); var u=OSRM+a.lon.toFixed(6)+','+a.lat.toFixed(6)+';'+b.lon.toFixed(6)+','+b.lat.toFixed(6)+'?overview=full&geometries=geojson&steps=true';
    return fetch(u,ac?{signal:ac.signal}:{}).then(function(r){ clearTimeout(to); if(!r.ok) throw new Error(r.status===429?'Route service busy, try again in a minute':'Route service not reachable'); return r.json() },function(e){ clearTimeout(to); throw new Error('Route service not reachable') }).then(function(j){
      var r0=j&&j.routes&&j.routes[0]; if(!r0) throw new Error('No road route found');
      var pts=r0.geometry.coordinates.map(function(c){ return [c[1],c[0]] }), cum=cumul(pts), steps=[];
      r0.legs[0].steps.forEach(function(s){ var ml=s.maneuver.location, i=nearIdx(pts,ml[1],ml[0]); if(s.maneuver.type==='new name'&&steps.length&&!s.name) return; steps.push({i:i,tx:stepTx(s),ic:icon(s.maneuver.type,s.maneuver.modifier||'')}) });
      var w=[]; if(r0.legs[0].steps.some(function(s){ return /ferry/.test(s.mode||'') })) w.push('Route uses a ferry');
      return {pts:pts,cum:cum,steps:steps,dist:r0.distance,dur:r0.duration,warn:w} }) }
  function cumul(pts){ var c=[0]; for(var i=1;i<pts.length;i++) c.push(c[i-1]+hav(pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1])); return c }
  function nearIdx(pts,la,lo){ var bi=0, bd=1e18; for(var i=0;i<pts.length;i++){ var d=(pts[i][0]-la)*(pts[i][0]-la)+(pts[i][1]-lo)*(pts[i][1]-lo); if(d<bd){ bd=d; bi=i } } return bi }

  // ---------- Off road: build a road graph from BC Government data and find the quickest way ----------
  var cache={};
  var LAY={dra:['WHSE_BASEMAPPING.DRA_DGTL_ROAD_ATLAS_MPAR_SP',"ROAD_CLASS NOT IN ('trail','runway','driveway','proposed','water')",'DIGITAL_ROAD_ATLAS_LINE_ID,ROAD_CLASS,ROAD_NAME_FULL,ROAD_SURFACE'],
    ften:['WHSE_FOREST_TENURE.FTEN_ROAD_SECTION_LINES_SVW',"RETIREMENT_DATE IS NULL AND LIFE_CYCLE_STATUS_CODE='ACTIVE'",'FOREST_FILE_ID,ROAD_SECTION_ID,ROAD_SECTION_NAME,FILE_TYPE_DESCRIPTION,LOCATION'],
    mvr:['WHSE_WILDLIFE_MANAGEMENT.WAA_MVPR_ROUTES_SP','','ROAD_NAME,ACCESS_STATUS','SHAPE']};
  function job(k,c){ var q=LAY[k]; return cell(k,q[0],c,q[1],q[2],q[3]) }
  function wfs(t,b,cql,props,gc,start){ gc=gc||'GEOMETRY'; var f='BBOX('+gc+','+[b.w,b.s,b.e,b.n].map(function(v){ return v.toFixed(3) }).join(',')+",'EPSG:4326')"+(cql?' AND '+cql:'');
    return WFSU+'?service=WFS&version=2.0.0&request=GetFeature&typeName='+t+'&outputFormat=json&srsName=EPSG:4326&count=5000&startIndex='+(start||0)+'&sortBy=OBJECTID&propertyName='+props+','+gc+'&CQL_FILTER='+encodeURIComponent(f) }
  function getAll(t,b,cql,props,gc){ var out=[]; function page(s){ return fetch(wfs(t,b,cql,props,gc,s)).then(function(r){ if(!r.ok) throw new Error('BC road data not reachable'); return r.json() }).then(function(j){ var f=(j&&j.features)||[]; out=out.concat(f); if(f.length===5000&&s<15000) return page(s+5000).catch(function(){ return out }); return out }) } return page(0) }
  function cell(k,t,b,cql,props,gc){ var key=k+'|'+b.w+','+b.s; if(!cache[key]) cache[key]=getAll(t,b,cql,props,gc).catch(function(e){ delete cache[key]; throw e }); return cache[key] }
  function cells(bb){ var o=[], G=0.2; for(var x=Math.floor(bb.w/G)*G;x<bb.e;x+=G) for(var y=Math.floor(bb.s/G)*G;y<bb.n;y+=G) o.push({w:+x.toFixed(2),s:+y.toFixed(2),e:+(x+G).toFixed(2),n:+(y+G).toFixed(2)}); return o }
  var SPD={freeway:100,expressway:100,highway:90,arterial:70,ramp:60,collector:55,local:40,resource:35,unclassified:30,recreation:25,strata:20,lane:20,alleyway:15,service:20,yield:20,restricted:20,ferry:15,water:0,proposed:0,trail:0,runway:0,driveway:0,'private':15};
  var help=(window.__fsr&&window.__fsr.help)||{}, zones=null;
  function loadZones(){ if(zones) return zones; zones=fetch('sled-zones.json').then(function(r){ return r.ok?r.json():null }).then(function(j){ return j&&j.f?j.f.filter(function(f){ return !f.l&&f.w!=='Road Closure'&&(f.k==='mv'||(f.k==='c'&&/ATV/.test(f.t||''))) }):[] }).catch(function(){ zones=null; return [] }); return zones }
  function offRoute(a,b,on){
    var inBC=function(p){ return p.lat>48.2&&p.lat<60&&p.lon>-139.5&&p.lon<-114 };
    if(!inBC(a)||!inBC(b)) return Promise.reject(new Error(on?'No signal: routes without signal work inside BC only':'Off road routes work inside BC only'));
    var km=hav(a.lat,a.lon,b.lat,b.lon)/1000; if(km>90) return Promise.reject(new Error(on?'No signal: routes without signal reach up to 90 km ('+Math.round(km)+' km)':'Too far for Off road ('+Math.round(km)+' km). Use On road to get close, then switch'));
    var pad=Math.max(0.04,0.18*Math.max(Math.abs(a.lat-b.lat),Math.abs(a.lon-b.lon))), bb={w:Math.min(a.lon,b.lon)-pad*1.5,e:Math.max(a.lon,b.lon)+pad*1.5,s:Math.min(a.lat,b.lat)-pad,n:Math.max(a.lat,b.lat)+pad};
    var cs=cells(bb), jobs=[];
    cs.forEach(function(c){
      jobs.push(job('dra',c).then(function(f){ return {k:'dra',f:f} }));
      if(on) return;
      jobs.push(job('ften',c).then(function(f){ return {k:'ften',f:f} }));
      jobs.push(job('mvr',c).then(function(f){ return {k:'mvr',f:f} }).catch(function(){ return {k:'mvr',f:[]} })) });
    if(!on) jobs.push(loadZones().then(function(z){ return {k:'zones',f:z} }));
    return Promise.all(jobs).then(function(res){ return solve(a,b,res,on) }) }

  function solve(a,b,res,on){
    var nLa=[], nLo=[], adj=[], key={}, fe=[], seen={}, grid={}, GS=0.002;
    function node(la,lo){ var k=la.toFixed(5)+','+lo.toFixed(5), i=key[k]; if(i!=null) return i; i=nLa.length; key[k]=i; nLa.push(la); nLo.push(lo); adj.push([]); var g=Math.floor(la/GS)+':'+Math.floor(lo/GS); (grid[g]||(grid[g]=[])).push(i); return i }
    function near(la,lo,maxM,skip){ var gi=Math.floor(la/GS), gj=Math.floor(lo/GS), best=-1, bd=maxM, r=Math.ceil(maxM/180)+1;
      for(var x=gi-r;x<=gi+r;x++) for(var y=gj-r;y<=gj+r;y++){ var l=grid[x+':'+y]; if(!l) continue; for(var k=0;k<l.length;k++){ var i=l[k]; if(skip&&skip(i)) continue; var d=hav(la,lo,nLa[i],nLo[i]); if(d<bd){ bd=d; best=i } } } return best<0?null:{i:best,d:bd} }
    function edge(i,j,len,spd,e){ if(i===j||!spd) return; var c=len/(spd/3.6)*(e.pen||1); adj[i].push(j,c,len,e.ix); adj[j].push(i,c,len,e.ix) }
    var closedPts=[];
    res.forEach(function(r){ if(r.k!=='mvr') return; r.f.forEach(function(f){ var p=f.properties||{}; if(help.rNow&&help.rNow(p)) return; if(!help.rNow&&!/Closed/i.test(p.ACCESS_STATUS||'')) return; lines(f.geometry).forEach(function(l){ l.forEach(function(c){ closedPts.push([c[1],c[0],p.ROAD_NAME||'Road']) }) }) }) });
    var cg={}; closedPts.forEach(function(c,k){ var g=Math.floor(c[0]/GS)+':'+Math.floor(c[1]/GS); (cg[g]||(cg[g]=[])).push(k) });
    function closedNear(la,lo){ var gi=Math.floor(la/GS), gj=Math.floor(lo/GS); for(var x=gi-1;x<=gi+1;x++) for(var y=gj-1;y<=gj+1;y++){ var l=cg[x+':'+y]; if(!l) continue; for(var k=0;k<l.length;k++){ var c=closedPts[l[k]]; if(hav(la,lo,c[0],c[1])<30) return c[2] } } return null }
    var ften=[];
    res.forEach(function(r){ if(r.k==='dra') r.f.forEach(function(f){ var p=f.properties||{}, id='d'+(p.DIGITAL_ROAD_ATLAS_LINE_ID||f.id); if(seen[id]) return; seen[id]=1;
        var cl=p.ROAD_CLASS||'unclassified', sp=SPD[cl]!=null?SPD[cl]:25, sf=String(p.ROAD_SURFACE||'').toLowerCase(), pen=1;
        if(sf==='rough') sp=Math.min(sp,25); else if(sf==='loose'||sf==='unknown') sp=Math.min(sp,50); if(sf==='overgrown'){ sp=Math.min(sp,12); pen=2 } if(sf==='decommissioned'){ sp=Math.min(sp,8); pen=8 } if(cl==='restricted'||cl==='private') pen=Math.max(pen,4); if(on){ if(sf==='loose'||sf==='rough'||sf==='unknown') pen*=2; if(/^(resource|unclassified|recreation)$/.test(cl)) pen*=2.5 }
        var rn=String(p.ROAD_NAME_FULL||'').trim(); if(/^(unsigned|unnamed|unknown|no name)/i.test(rn)) rn='';
        var e={ix:fe.length,n:rn?cap(rn):'',c:cl,sf:sf,pen:pen,src:'dra'}; fe.push(e);
        lines(f.geometry).forEach(function(l){ var pv=null; l.forEach(function(c){ var i=node(c[1],c[0]); if(pv!=null) edge(pv,i,hav(nLa[pv],nLo[pv],nLa[i],nLo[i]),sp,e); pv=i }) }) });
      else if(r.k==='ften') r.f.forEach(function(f){ var id='f'+f.id; if(seen[id]) return; seen[id]=1; ften.push(f) }) });
    // forest roads: add their lines and join their loose ends to the nearest road (their lines don't share points with the road atlas)
    ften.forEach(function(f){ var p=f.properties||{}, fsr=/Forest Service Road/.test(p.FILE_TYPE_DESCRIPTION||''), nm=cap(p.ROAD_SECTION_NAME||p.LOCATION||'');
      if(fsr&&nm&&!/FSR|Forest Service/i.test(nm)) nm+=' FSR';
      var e={ix:fe.length,n:nm,c:fsr?'fsr':'permit',sf:'',pen:1,src:'ften'}; fe.push(e);
      lines(f.geometry).forEach(function(l){ var ids=[]; l.forEach(function(c){ var i=node(c[1],c[0]); if(ids.length) edge(ids[ids.length-1],i,hav(nLa[ids[ids.length-1]],nLo[ids[ids.length-1]],nLa[i],nLo[i]),fsr?40:30,e); ids.push(i) });
        if(ids.length<2) return; var mine={}; ids.forEach(function(i){ mine[i]=1 });
        [ids[0],ids[ids.length-1]].forEach(function(i){ var h=near(nLa[i],nLo[i],45,function(j){ return mine[j] }); if(h) edge(i,h.i,h.d,20,e) }) }) });
    // dead ends that almost touch another road (small gaps in the data)
    for(var i=0;i<nLa.length;i++){ if(adj[i].length!==4) continue; var own=adj[i][0]; var h=near(nLa[i],nLo[i],15,function(j){ return j===i||j===own }); if(h) edge(i,h.i,h.d,15,fe[adj[i][3]]) }
    // roads closed to vehicles today cost a lot so the route avoids them when there's another way
    for(i=0;i<nLa.length;i++){ if(!cg[Math.floor(nLa[i]/GS)+':'+Math.floor(nLo[i]/GS)]) continue; if(closedNear(nLa[i],nLo[i])){ var L2=adj[i]; for(var k=0;k<L2.length;k+=4) L2[k+1]*=40 } }
    if(!nLa.length) throw new Error('No BC road data here');
    var sN=near(a.lat,a.lon,3000), eN=near(b.lat,b.lon,3000);
    if(!sN) throw new Error('No road within 3 km of you'); if(!eN) throw new Error('No road within 3 km of that spot');
    // A* search
    var n=nLa.length, g=new Float64Array(n).fill(Infinity), prev=new Int32Array(n).fill(-1), pe=new Int32Array(n).fill(-1), done=new Uint8Array(n), hp=[], hk=[];
    function push(i,k){ hp.push(i); hk.push(k); var c=hp.length-1; while(c>0){ var p2=(c-1)>>1; if(hk[p2]<=hk[c]) break; var t=hp[p2]; hp[p2]=hp[c]; hp[c]=t; t=hk[p2]; hk[p2]=hk[c]; hk[c]=t; c=p2 } }
    function pop(){ var top=hp[0], li=hp.pop(), lk=hk.pop(); if(hp.length){ hp[0]=li; hk[0]=lk; var c=0; for(;;){ var l=2*c+1, r2=l+1, m=c; if(l<hp.length&&hk[l]<hk[m]) m=l; if(r2<hp.length&&hk[r2]<hk[m]) m=r2; if(m===c) break; var t=hp[m]; hp[m]=hp[c]; hp[c]=t; t=hk[m]; hk[m]=hk[c]; hk[c]=t; c=m } } return top }
    var tl=nLa[eN.i], tn=nLo[eN.i], VMAX=100/3.6;
    g[sN.i]=0; push(sN.i,0);
    while(hp.length){ var u=pop(); if(done[u]) continue; done[u]=1; if(u===eN.i) break; var L3=adj[u];
      for(k=0;k<L3.length;k+=4){ var v=L3[k], nc=g[u]+L3[k+1]; if(nc<g[v]){ g[v]=nc; prev[v]=u; pe[v]=L3[k+3]; push(v,nc+hav(nLa[v],nLo[v],tl,tn)/VMAX) } } }
    if(!isFinite(g[eN.i])) throw new Error('No connected road route found. Try On road');
    var path=[]; for(var x=eN.i;x>=0;x=prev[x]) path.push(x); path.reverse();
    var pts=path.map(function(i){ return [nLa[i],nLo[i]] }), eds=path.map(function(i){ return pe[i] }); eds[0]=eds[1];
    var cum=cumul(pts), dur=g[eN.i], warn=[], wk={};
    function W(t){ if(!wk[t]){ wk[t]=1; warn.push(t) } }
    if(sN.d>60) W('Start is '+dTxt(sN.d)+' from the nearest road');
    if(eN.d>60) W('Spot is '+dTxt(eN.d)+' from the nearest road');
    // steps: a new step when the road changes or there's a real turn
    var steps=[{i:0,tx:'Head '+['north','northeast','east','southeast','south','southwest','west','northwest'][Math.round(brg(pts[0][0],pts[0][1],pts[Math.min(3,pts.length-1)][0],pts[Math.min(3,pts.length-1)][1])/45)%8]+(nmOf(eds[1])?' on '+nmOf(eds[1]):''),ic:'⬆'}];
    function nmOf(ix){ var e=fe[ix]; if(!e) return ''; return e.n||({fsr:'forest service road',permit:'forest road',resource:'resource road',unclassified:'back road',recreation:'recreation road',local:'local road'}[e.c]||'') }
    function bAt(k,dir){ var j=k, d=0; while(j+dir>=0&&j+dir<pts.length&&d<40){ d+=hav(pts[j][0],pts[j][1],pts[j+dir][0],pts[j+dir][1]); j+=dir } return j }
    var GEN={'forest service road':1,'forest road':1,'resource road':1,'back road':1,'recreation road':1,'local road':1,'':1};
    var lastN=nmOf(eds[1]), lastReal=GEN[lastN]?'':lastN;
    for(k=1;k<pts.length-1;k++){ var nm2=nmOf(eds[k+1]), gen=!!GEN[nm2];
      var deg=adj[path[k]].length/4, b1=brg(pts[bAt(k,-1)][0],pts[bAt(k,-1)][1],pts[k][0],pts[k][1]), b2=brg(pts[k][0],pts[k][1],pts[bAt(k,1)][0],pts[bAt(k,1)][1]), t=((b2-b1)+540)%360-180, at=Math.abs(t);
      var gap=steps.length?cum[k]-cum[steps[steps.length-1].i]:1e9, mo=at<35?'straight':at<60?(t<0?'slight left':'slight right'):at<150?(t<0?'left':'right'):'uturn', tx='';
      // the road just bends if our way is the straightest way on at this junction: no instruction then
      var nd=path[k], aj=adj[nd], best=1e9, mine=1e9, bi1=brg(nLa[path[k-1]],nLo[path[k-1]],nLa[nd],nLo[nd]);
      for(var q=0;q<aj.length;q+=4){ var v=aj[q]; if(v===path[k-1]) continue; var dd=Math.abs((((brg(nLa[nd],nLo[nd],nLa[v],nLo[v])-bi1)%360)+540)%360-180); if(dd<best) best=dd; if(v===path[k+1]) mine=dd }
      var bend=mine<=best+15;
      if(deg>2&&at>=60&&!bend&&(gap>60||at>100)){ // a real turn at a junction
        tx=(mo==='uturn'?'Make a U-turn':MOD[mo])+(gen?(nm2!==lastN&&nm2?' onto '+nm2:''):(nm2===lastReal?' to stay on '+nm2:' onto '+nm2)) }
      else if(!gen&&nm2!==lastReal&&deg>2&&gap>80){ // a new named road
        tx=(mo==='straight'?'Continue':MOD[mo])+' onto '+nm2 }
      if(tx){ steps.push({i:k,tx:tx,ic:icon('turn',mo)}); lastN=nm2 }
      if(!gen&&(tx||nm2===lastReal)) lastReal=nm2 }
    steps.push({i:pts.length-1,tx:'Arrive at '+dest.n,ic:'🏁'});
    // warnings along the way
    var fsrM=0, permM=0, rough=0;
    for(k=1;k<pts.length;k++){ var e=fe[eds[k]], dl=cum[k]-cum[k-1]; if(!e) continue; if(e.c==='fsr') fsrM+=dl; if(e.c==='permit'||e.c==='resource') permM+=dl; if(e.sf==='rough'||e.sf==='overgrown'||e.sf==='decommissioned') rough+=dl; if(e.sf==='decommissioned') W('Uses a decommissioned road: may be impassable'); if(e.c==='restricted'||e.c==='private') W('Uses a restricted or private road') }
    for(k=0;k<pts.length;k+=3){ var cn=closedNear(pts[k][0],pts[k][1]); if(cn){ W('Closed to vehicles today: '+cap(cn)); break } }
    var zf=res.filter(function(r){ return r.k==='zones' })[0], zs=zf?zf.f:[];
    if(zs.length&&help.aDec&&help.aIn){ var hitZ=null; zs.forEach(function(z){ if(hitZ||!(help.aToday?help.aToday(z.w):true)) return; if(!z._ll) z._ll=z.g.map(function(p){ return p.map(help.aDec) }); for(var q=0;q<pts.length&&!hitZ;q+=5){ var la=pts[q][0], lo=pts[q][1]; if(la<z.b[1]||la>z.b[3]||lo<z.b[0]||lo>z.b[2]) continue; if(z._ll.some(function(r){ return help.aIn(la,lo,r[0]) })) hitZ=z } }); if(hitZ) W('Goes through a closed area: '+(hitZ.n||hitZ.t||'motor vehicle closure')) }
    if(rough>300) W(dTxt(rough)+' of rough or overgrown road');
    if(permM>500) W('Industrial forest roads: watch for logging trucks, use a radio where posted');
    var note=fsrM>500?'Forest service roads: drive with headlights on, yield to loaded trucks':'';
    return {pts:pts,cum:cum,steps:steps,dist:cum[cum.length-1],dur:dur,warn:warn,note:note} }
  function lines(g){ if(!g) return []; if(g.type==='LineString') return [g.coordinates]; if(g.type==='MultiLineString') return g.coordinates; return [] }

  // ---------- navigation: follow your GPS along the route ----------
  function start(){ if(!rt) return; nav=true; showList=false; var lb=document.getElementById('locate'); if(lb&&!lb.classList.contains('follow')) lb.click();
    if(wid==null&&navigator.geolocation) try{ wid=navigator.geolocation.watchPosition(function(p){ var c=p.coords; lastPos={lat:c.latitude,lon:c.longitude,acc:c.accuracy||0}; if(nav) track(lastPos) },function(){},{enableHighAccuracy:true,maximumAge:1000,timeout:30000}) }catch(e){}
    if(lastPos) track(lastPos); panel(); tiltUpd() }
  function stop(){ nav=false; offN=0; setTimeout(tiltUpd,0); if(wid!=null&&navigator.geolocation){ navigator.geolocation.clearWatch(wid); wid=null } }
  function track(p){ if(!rt||!p) return; var pts=rt.pts, lo=Math.max(0,rt.li-30), hi=Math.min(pts.length-1,rt.li+400), bi=rt.li, bd=1e18, bp=0;
    for(var i=lo;i<hi;i++){ var a=pts[i], b=pts[i+1], cx=Math.cos(a[0]*D2R), ax=(b[1]-a[1])*cx, ay=b[0]-a[0], px=(p.lon-a[1])*cx, py=p.lat-a[0], L2=ax*ax+ay*ay, t=L2?Math.max(0,Math.min(1,(px*ax+py*ay)/L2)):0, dx=px-t*ax, dy=py-t*ay, d=dx*dx+dy*dy;
      if(d<bd){ bd=d; bi=i; bp=t } }
    var off=Math.sqrt(bd)*111320; rt.li=bi;
    if(tilted){ var j=Math.min(pts.length-1,bi+4), hd=brg(pts[bi][0],pts[bi][1],pts[j][0],pts[j][1]), want=(360-hd)%360, cur=map.getBearing?map.getBearing():0; if(j>bi&&Math.abs(((want-cur)%360+540)%360-180)>4&&map.setBearing) map.setBearing(want) } rt.prog=rt.cum[bi]+bp*(rt.cum[bi+1]-rt.cum[bi]||0);
    if(hav(p.lat,p.lon,dest.lat,dest.lon)<35||rt.dist-rt.prog<20){ rt.arrived=true; stop(); panel(); return }
    var k=1; while(k<rt.steps.length-1&&rt.cum[rt.steps[k].i]<rt.prog+8) k++; rt.next=k;
    if(off>(rt.mode==='off'?80:60)&&(p.acc||0)<60){ if(++offN>=3&&Date.now()-lastRe>20000){ lastRe=Date.now(); offN=0; route(rt.mode,true); return } } else offN=0;
    panel() }

  // ---------- Street names stay readable when you head south ----------
  // The map's own names are part of its pictures and turn upside down with the map. Heading south, they're hidden and upright
  // names from BC road data are shown instead. Heading north, east or west, the map's own names stay.
  (function(){
    var css2=document.createElement('style'); css2.textContent='.snm{pointer-events:none}.snm span{position:absolute;left:0;top:0;white-space:nowrap;font:700 12px/1 var(--font,system-ui);color:#fff;letter-spacing:.02em;text-shadow:0 0 3px #000,0 0 2px #000,0 1px 2px #000;transform-origin:0 0}'; document.head.appendChild(css2);
    var on=false, grp=L.layerGroup(), feats=[], loadK='', tm=null, seqL=0;
    function brg0(){ var b=map.getBearing?map.getBearing():0; return ((b%360)+360)%360 }
    function inBC(c){ return c.lat>48.2&&c.lat<60&&c.lng>-139.5&&c.lng<-114 }
    function trans(){ var b=A.base&&A.base(); return b&&b[1] }
    function check(){ var b=brg0(), z=map.getZoom(), c=map.getCenter(), want=!window.__glLab&&z>=15&&inBC(c)&&(on?(b>120&&b<240):(b>135&&b<225));
      var t=trans(); if(t&&t.setOpacity) t.setOpacity(want||window.__glLab?0:1);
      if(want!==on){ on=want; if(on){ grp.addTo(map); load() } else { map.removeLayer(grp); grp.clearLayers() } }
      else if(on) soon() }
    function soon(){ clearTimeout(tm); tm=setTimeout(place,120) }
    // the part of a line that's on screen (so long straight roads with few points still get a name)
    function clipS(a,b,x0,y0,x1,y1){ var t0=0,t1=1,dx=b.x-a.x,dy=b.y-a.y,P=[-dx,dx,-dy,dy],Q=[a.x-x0,x1-a.x,a.y-y0,y1-a.y];
      for(var i=0;i<4;i++){ if(P[i]===0){ if(Q[i]<0) return null } else { var r=Q[i]/P[i]; if(P[i]<0){ if(r>t1) return null; if(r>t0) t0=r } else { if(r<t0) return null; if(r<t1) t1=r } } }
      return [L.point(a.x+t0*dx,a.y+t0*dy),L.point(a.x+t1*dx,a.y+t1*dy),t1<1] }
    function load(){ var bd=map.getBounds(), cs=cells({w:bd.getWest(),e:bd.getEast(),s:bd.getSouth(),n:bd.getNorth()}), k=cs.map(function(c){ return c.w+','+c.s }).join('|');
      if(k===loadK){ place(); return } var my=++seqL;
      Promise.all(cs.map(function(c){ return job('dra',c).catch(function(){ return [] }) })).then(function(r){ if(my!==seqL) return; loadK=k; feats=[];
        var seen={}; r.forEach(function(f){ f.forEach(function(x){ var p=x.properties||{}, n=String(p.ROAD_NAME_FULL||'').trim(); if(!n||/^(unsigned|unnamed|unknown|no name)/i.test(n)) return;
          var id=p.DIGITAL_ROAD_ATLAS_LINE_ID||x.id; if(seen[id]) return; seen[id]=1; lines(x.geometry).forEach(function(l){ if(l.length<2) return; var w=1e9,e=-1e9,s2=1e9,n2=-1e9; l.forEach(function(q){ if(q[0]<w)w=q[0]; if(q[0]>e)e=q[0]; if(q[1]<s2)s2=q[1]; if(q[1]>n2)n2=q[1] }); feats.push({n:cap(n),l:l,b:[w,s2,e,n2]}) }) }) }); place() }) }
    function place(){ if(!on) return; var bd=map.getBounds().pad(0.05), W0=bd.getWest(), E0=bd.getEast(), S0=bd.getSouth(), N0=bd.getNorth(), sz=map.getSize(), put=[], byName={};
      if(loadK&&!feats.length){ grp.clearLayers(); return }
      var cand=feats.filter(function(f){ return f.b[2]>=W0&&f.b[0]<=E0&&f.b[3]>=S0&&f.b[1]<=N0 });
      grp.clearLayers();
      cand.forEach(function(f){ if(put.length>=45) return; var pts=f.l.map(function(q){ return map.latLngToContainerPoint([q[1],q[0]]) }), run=[], best=[];
        var bl=0, rl=0; for(var i=1;i<pts.length;i++){ var cp=clipS(pts[i-1],pts[i],-20,-20,sz.x+20,sz.y+20);
          if(!cp){ if(rl>bl){ best=run; bl=rl } run=[]; rl=0; continue }
          if(!run.length) run.push(cp[0]); run.push(cp[1]); rl+=cp[0].distanceTo(cp[1]); if(cp[2]){ if(rl>bl){ best=run; bl=rl } run=[]; rl=0 } }
        if(rl>bl){ best=run; bl=rl }
        if(best.length<2) return; var len=bl; if(len<f.n.length*7) return;
        // middle of the road on screen, moved along the road if it would sit on top of your spot
        function at(fr){ var want=len*fr, acc=0; for(var j=1;j<best.length;j++){ var d=best[j].distanceTo(best[j-1]); if(acc+d>=want){ var t=d?(want-acc)/d:0; return {m:L.point(best[j-1].x+(best[j].x-best[j-1].x)*t,best[j-1].y+(best[j].y-best[j-1].y)*t),a:Math.atan2(best[j].y-best[j-1].y,best[j].x-best[j-1].x)*180/Math.PI} } acc+=d } return {m:best[best.length-1],a:0} }
        var ctr=L.point(sz.x/2,sz.y/2), pk=null; [0.5,0.3,0.7,0.15,0.85].some(function(fr){ var c=at(fr); if(c.m.distanceTo(ctr)>=55){ pk=c; return true } return false }); if(!pk) return;
        var mid=pk.m, ang=pk.a;
        if(ang>90) ang-=180; if(ang<-90) ang+=180;
        if(put.some(function(q){ return q.distanceTo(mid)<60 })) return; var mine=byName[f.n]||(byName[f.n]=[]); if(mine.some(function(q){ return q.distanceTo(mid)<240 })) return;
        put.push(mid); mine.push(mid);
        L.marker(map.containerPointToLatLng(mid),{interactive:false,keyboard:false,icon:L.divIcon({className:'snm',iconSize:[0,0],html:'<span style="transform:rotate('+ang.toFixed(1)+'deg) translate(-50%,-50%)">'+esc(f.n)+'</span>'})}).addTo(grp) }) }
    map.on('rotate',function(){ clearTimeout(tm); tm=setTimeout(check,150) });
    map.on('moveend zoomend',function(){ check(); if(on) load() });
    window.__navNamesChk=check;
    window.__navNames=function(){ return {on:on,n:grp.getLayers().length,feats:feats.length} };
  })();

  // ---------- 3D: the map tilts while directions are following you (buttons and panels stay flat) ----------
  var tilted=false, ctlBox=null, sky=null;
  (function(){ var c3=document.createElement('style'); c3.textContent='body.tilt3d .mapwrap{perspective:700px;background:#0b0e13}body.tilt3d #map{position:absolute!important;flex:none!important;left:-15%;width:130%;top:-25%;height:145%;transform:rotateX(42deg);transform-origin:50% 100%}#tiltsky{position:absolute;left:0;right:0;top:0;height:300px;z-index:450;pointer-events:none;background:linear-gradient(#0b0e13 0,#0b0e13 35%,rgba(11,14,19,0) 100%);display:none}body.tilt3d #tiltsky{display:block}'; document.head.appendChild(c3);
    var mc=map.getContainer(); sky=document.createElement('div'); sky.id='tiltsky'; mc.parentNode.insertBefore(sky,mc.nextSibling);
    var lb=document.getElementById('locate'); if(lb&&window.MutationObserver) new MutationObserver(tiltUpd).observe(lb,{attributes:true,attributeFilter:['class']});
    // if the app closed while in 3D last time (phone ran out of memory), 3D turns itself off
    var died=false; try{ died=localStorage.getItem('aw-3d-open')==='1'; localStorage.removeItem('aw-3d-open'); if(died) localStorage.setItem('aw-3d','0') }catch(e){}
    var g=document.getElementById('gfolder'); if(g){ var row=document.createElement('label'); row.className='setrow'; row.htmlFor='nav3d'; row.innerHTML='3D map in directions<select id="nav3d" aria-label="3D map in directions"><option value="1">On</option><option value="0">Off</option></select>';
      var sm=g.querySelector('summary'); g.insertBefore(row,sm?sm.nextSibling:g.firstChild); var sel=row.querySelector('select'); sel.value=on3d()?'1':'0';
      sel.onchange=function(){ try{ localStorage.setItem('aw-3d',sel.value) }catch(e){} tiltUpd() } }
    if(died) setTimeout(function(){ var m=document.getElementById('locmsg'); if(!m) return; m.innerHTML='<b>3D map turned off</b>AwareBC closed while the map was in 3D, so it now stays flat. Turn it back on in Settings ▸ Map ▸ Basics ▸ 3D map in directions.'; m.hidden=false; setTimeout(function(){ m.hidden=true },12000) },4000) })();
  function on3d(){ try{ return localStorage.getItem('aw-3d')!=='0' }catch(e){ return true } }
  function tiltUpd(){ var lb=document.getElementById('locate'); tilt(!!(on3d()&&nav&&rt&&!rt.arrived&&lb&&lb.classList.contains('follow'))) }
  function tilt(on){ if(on===tilted) return; tilted=on; var mc=map.getContainer(), wrap=mc.parentNode; try{ if(on) localStorage.setItem('aw-3d-open','1'); else localStorage.removeItem('aw-3d-open') }catch(e){}
    if(on){ ctlBox=mc.querySelector('.leaflet-control-container'); if(ctlBox) wrap.insertBefore(ctlBox,sky.nextSibling) } else if(ctlBox){ mc.appendChild(ctlBox); ctlBox=null }
    var ll=lastPos?[lastPos.lat,lastPos.lon]:map.getCenter(); document.body.classList.toggle('tilt3d',on);
    map.invalidateSize({pan:false}); map.setView(ll,map.getZoom(),{animate:false});
    if(!on&&map.setBearing){ var ro=false; try{ ro=localStorage.getItem('sky-autorot')==='1' }catch(e){} if(!ro) map.setBearing(0) } else if(on&&lastPos) track(lastPos) }

  // public: other parts of the app open directions with window.__nav.to(latlng, name)
  // urls(box) lists the road data to save for offline (used by "Save area for offline")
  window.__nav={to:to,clear:function(){ stop(); dest=null; rt=null; clear(); panel() },route:function(){ return rt },setFrom:function(p){ lastPos=p },
    urls:function(b){ var o=[]; cells(b).forEach(function(c){ ['dra','ften','mvr'].forEach(function(k){ var q=LAY[k]; o.push(wfs(q[0],c,q[1],q[2],q[3],0)) }) }); return o }};
})();
