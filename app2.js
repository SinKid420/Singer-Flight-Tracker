  // ---- Search: find a place (hospital, gas, rec site, creek, lake, town, FSR) and go there ----
  (function(){ var A=window.__AW; if(!A||!A.map) return; var map=A.map, esc=A.esc, seg=document.querySelector('.seg'); if(!seg) return;
    var MAG='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>';
    var SITES='https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_FOREST_TENURE.FTEN_REC_SITE_POINTS_SVW&outputFormat=json&count=5000&srsName=EPSG:4326&propertyName=FOREST_FILE_ID,PROJECT_NAME,SITE_LOCATION,GEOMETRY';
    var btn=document.createElement('button'); btn.type='button'; btn.id='srch'; btn.setAttribute('aria-label','Search places'); btn.innerHTML=MAG; document.body.appendChild(btn);
    var box=document.createElement('div'); box.id='srbox'; box.hidden=true; box.setAttribute('role','dialog'); box.setAttribute('aria-label','Search places');
    box.innerHTML='<div class="srbar">'+MAG+'<input id="srq" type="search" placeholder="Search places, rec sites, creeks…" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" aria-label="Search"><button type="button" class="srx" aria-label="Close search">✕</button></div>'+
      '<div class="srres"><div class="srchips"><button type="button" data-c="hosp">🏥 Hospital</button><button type="button" data-c="gas">⛽ Gas</button><button type="button" data-c="rec">⛺ Rec sites</button></div><div id="srlist"></div></div>';
    document.body.appendChild(box);
    var q=box.querySelector('#srq'), list=box.querySelector('#srlist'), res=[], seq=0, tmr=null, sites=null, sitesP=null;
    // the button sits just right of the map styles (Map / Satellite / Terrain / FSR)
    function place(){ var r=seg.getBoundingClientRect(); if(!r.width){ btn.style.display='none'; return } btn.style.display=''; btn.style.left=Math.round(r.right+16)+'px'; btn.style.top=Math.round(r.top+(r.height-40)/2)+'px' }
    place(); window.addEventListener('resize',place); if(window.ResizeObserver) new ResizeObserver(place).observe(seg); seg.addEventListener('click',function(){ setTimeout(place,50) });
    function ref(){ var m=A.me&&A.me(); if(m&&isFinite(m.lat)&&isFinite(m.lon)&&(m.lat||m.lon)) return {lat:m.lat,lon:m.lon}; var c=map.getCenter(); return {lat:c.lat,lon:c.lng} }
    function km(a,b,c,d){ var r=Math.PI/180, x=Math.sin((c-a)*r/2), y=Math.sin((d-b)*r/2), h=x*x+Math.cos(a*r)*Math.cos(c*r)*y*y; return 12742*Math.asin(Math.sqrt(h)) }
    function kmT(k){ return k<10?k.toFixed(1)+' km':Math.round(k)+' km' }
    function cap(s){ return String(s||'').toLowerCase().replace(/\b[a-z]/g,function(c){return c.toUpperCase()}) }
    function open(){ box.hidden=false; document.body.classList.add('srchon'); loadSites(); setTimeout(function(){ q.focus() },30); if(!q.value) chipsOnly() }
    function close(){ box.hidden=true; document.body.classList.remove('srchon'); q.blur() }
    btn.onclick=open; box.querySelector('.srx').onclick=close;
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!box.hidden) close() });
    map.on('click',function(){ if(!box.hidden) close() });
    function loadSites(){ if(sites||sitesP) return sitesP; sitesP=fetch(SITES).then(function(r){ return r.ok?r.json():null }).then(function(j){ if(!j||!j.features) throw 0;
      sites=j.features.filter(function(f){ return f.geometry&&f.geometry.coordinates }).map(function(f){ var p=f.properties||{}, c=f.geometry.coordinates; return {n:p.PROJECT_NAME||'Recreation site', loc:p.SITE_LOCATION, lat:c[1], lon:c[0]} }); return sites }).catch(function(){ sitesP=null; return null }); return sitesP }
    function chipsOnly(){ res=[]; list.innerHTML='<div class="srhint">Type a place, or tap a quick search.</div>' }
    // results: newest list is drawn as soon as any source answers, nearest first
    function add(id,items){ if(id!==seq) return; var R=ref(); items.forEach(function(it){ it.d=km(R.lat,R.lon,it.lat,it.lon); var k=(it.n+'|'+it.t).toLowerCase(); if(!res.some(function(x){ return (x.n+'|'+x.t).toLowerCase()===k&&Math.abs(x.lat-it.lat)<.02&&Math.abs(x.lon-it.lon)<.02 })) res.push(it) }); draw(id) }
    var pend=0;
    function draw(id){ if(id!==seq) return; var s=String(q.value||'').trim().toLowerCase();
      res.sort(function(a,b){ var sa=s&&a.n.toLowerCase().indexOf(s)===0?0:1, sb=s&&b.n.toLowerCase().indexOf(s)===0?0:1; return (a.rank||0)-(b.rank||0)||sa-sb||a.d-b.d });
      var h=res.slice(0,14).map(function(it,i){ return '<button type="button" class="srr" data-i="'+i+'"><span class="sri" style="background:'+it.bg+'">'+it.ic+'</span><span class="srt"><b>'+esc(it.n)+'</b><small>'+esc(it.t)+'</small></span><span class="srk">'+kmT(it.d)+'</span></button>' }).join('');
      if(!h) h='<div class="srhint">'+(pend?'Searching…':(navigator.onLine?'No places found.':'No signal: searching saved places and rec sites.'))+'</div>';
      else if(pend) h+='<div class="srhint">Searching…</div>';
      list.innerHTML=h }
    list.onclick=function(e){ var b=e.target.closest&&e.target.closest('.srr'); if(!b) return; var it=res[+b.getAttribute('data-i')]; if(!it) return; close();
      var ll=L.latLng(it.lat,it.lon), z=it.z||13; map.once('moveend',function(){ setTimeout(function(){ if(window.__pin) window.__pin(ll,it.n) },60) }); map.flyTo(ll,Math.max(z,Math.min(map.getZoom(),17)),{duration:1.2}) };
    function run(src,id,fn){ pend++; draw(id); fn().then(function(items){ pend--; add(id,items||[]) },function(){ pend--; draw(id) }) }
    function J(u){ return fetch(u).then(function(r){ if(!r.ok) throw 0; return r.json() }) }
    function bbox(R,dx,dy){ return [R.lon-dx,R.lat-dy,R.lon+dx,R.lat+dy] }
    function recSites(s){ return loadSites().then(function(a){ return (a||[]).filter(function(x){ return !s||x.n.toLowerCase().indexOf(s)>=0 }).map(function(x){ return {n:x.n===x.n.toUpperCase()?cap(x.n):x.n, t:'Rec site'+(x.loc?' · near '+cap(x.loc):''), lat:x.lat, lon:x.lon, ic:'⛺', bg:'#fff3cd', z:14} }) }) }
    function names(s){ return J('https://apps.gov.bc.ca/pub/bcgnws/names/search?outputFormat=json&name='+encodeURIComponent(s)+'&itemsPerPage=20&outputSRS=4326&embed=0').then(function(j){
      return (j.features||[]).filter(function(f){ var n=f.properties&&f.properties.name; return n&&n.toLowerCase().indexOf(s)>=0&&f.geometry&&f.geometry.coordinates }).map(function(f){ var p=f.properties, c=p.featureCategoryDescription||'', t=String(p.featureType||'').replace(/\s*\(\d+\)$/,'');
        var w=/water/i.test(c), m=/Mountain|Peak|Ridge|Range/i.test(t), town=/Populated|Municipal|Unincorporated|Rural/i.test(c);
        return {n:p.name, t:t||'Place', lat:f.geometry.coordinates[1], lon:f.geometry.coordinates[0], ic:w?'💧':m?'⛰':town?'🏘':'📍', bg:w?'#e0f7fa':m?'#eceff1':town?'#e8f0fe':'#f1f3f4', z:town?12:13} }) }) }
    function photon(s,tag,R,dx,dy,rank){ return J('https://photon.komoot.io/api/?q='+encodeURIComponent(s)+'&limit=10&lang=en&lat='+R.lat.toFixed(3)+'&lon='+R.lon.toFixed(3)+'&bbox='+bbox(R,dx,dy).map(function(v){return v.toFixed(3)}).join(',')+(tag?'&osm_tag='+tag:'')).then(function(j){
      return (j.features||[]).filter(function(f){ var p=f.properties||{}; return p.name&&p.osm_key!=='waterway' }).map(function(f){ var p=f.properties, v=p.osm_value||'', k=p.osm_key||'', c=f.geometry.coordinates, hosp=v==='hospital'||v==='clinic', fuel=v==='fuel', town=k==='place';
        var where=p.city||p.town||p.village||p.county||''; if(where===p.name) where='';
        return {n:p.name, t:(hosp?'Hospital':fuel?'Gas station':town?cap(v):cap(v.replace(/_/g,' ')))+(where?' · '+where:''), lat:c[1], lon:c[0], ic:hosp?'🏥':fuel?'⛽':town?'🏘':'📍', bg:hosp?'#fde2e1':fuel?'#fde2e1':town?'#e8f0fe':'#f1f3f4', z:hosp||fuel?16:town?12:15, rank:rank||0} }) }) }
    function fsr(s,R){ var t=s.replace(/[^a-z0-9 \-]/gi,'').toUpperCase(); if(t.length<2) return Promise.resolve([]); var b=bbox(R,2.5,1.8);
      var u='https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_FOREST_TENURE.FTEN_ROAD_SECTION_LINES_SVW&outputFormat=json&srsName=EPSG:4326&count=40&propertyName=ROAD_SECTION_NAME,GEOMETRY&CQL_FILTER='+encodeURIComponent("RETIREMENT_DATE IS NULL AND FILE_TYPE_DESCRIPTION='Forest Service Road' AND ROAD_SECTION_NAME ILIKE '%"+t+"%' AND BBOX(GEOMETRY,"+b.map(function(v){return v.toFixed(3)}).join(',')+",'EPSG:4326')");
      return J(u).then(function(j){ var seen={}, o=[]; (j.features||[]).forEach(function(f){ var n=f.properties&&f.properties.ROAD_SECTION_NAME, g=f.geometry; if(!n||!g||seen[n]) return; var c=g.type==='MultiLineString'?g.coordinates[0]:g.coordinates; if(!c||!c.length) return; seen[n]=1; var m=c[Math.floor(c.length/2)];
        o.push({n:(cap(n)+(/FSR|ROAD|RD$/i.test(n)?'':' FSR')).replace(/\bFsr\b/,'FSR'), t:'Forest Service Road', lat:m[1], lon:m[0], ic:'🛣', bg:'#fde2e1', z:14, rank:/\d{3,}/.test(n)?2:1}) });
        return o.sort(function(a,b){ return a.rank-b.rank }).slice(0,5) }) }
    function go(kind){ var id=++seq, R=ref(); res=[]; pend=0;
      if(kind==='hosp'){ q.value='Hospital'; run('h',id,function(){ return photon('hospital','amenity:hospital',R,3,2) }) }
      else if(kind==='gas'){ q.value='Gas'; ['gas station','petro','esso','shell','co-op','husky','chevron','mobil','canco'].forEach(function(w){ run('g',id,function(){ return photon(w,'amenity:fuel',R,1.5,1) }) }) }
      else if(kind==='rec'){ q.value='Rec sites'; run('r',id,function(){ return recSites('').then(function(a){ return a.sort(function(x,y){ return km(R.lat,R.lon,x.lat,x.lon)-km(R.lat,R.lon,y.lat,y.lon) }).slice(0,25) }) }) } }
    box.querySelector('.srchips').onclick=function(e){ var b=e.target.closest&&e.target.closest('button[data-c]'); if(b) go(b.getAttribute('data-c')) };
    function search(){ var s=String(q.value||'').trim(), l=s.toLowerCase(); if(s.length<2){ seq++; chipsOnly(); return }
      if(/^(hospitals?|er|emergency|clinic)$/.test(l)) return go('hosp'); if(/^(gas|fuel|gas stations?)$/.test(l)) return go('gas'); if(/^(rec|rec sites?|camping|campgrounds?|camps?)$/.test(l)) return go('rec');
      var id=++seq, R=ref(); res=[]; pend=0;
      run('r',id,function(){ return recSites(l) });
      var off=function(){ return window.__offNames?window.__offNames(l):Promise.resolve([]) };
      if(navigator.onLine===false) run('o',id,off);
      if(navigator.onLine!==false){ run('n',id,function(){ return names(l).catch(off) }); run('p',id,function(){ return photon(s,'',R,4,3) }); run('f',id,function(){ return fsr(l,R) }) } }
    q.addEventListener('input',function(){ clearTimeout(tmr); tmr=setTimeout(search,350) });
    q.addEventListener('keydown',function(e){ if(e.key==='Enter'){ clearTimeout(tmr); search(); q.blur() } });
  })();
