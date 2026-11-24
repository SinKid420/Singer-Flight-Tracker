// AwareBC by Josh Singer: roads (DriveBC, WSDOT) and BC Ferries.
// Loaded a moment after the map opens, so the map itself shows up faster.
window.__awm&&window.__awm('roads',function(X){with(X){
(function(){
    var roadOn=false, ferryOn=false;
    var roadLayer=L.layerGroup().addTo(map), camLayer=L.layerGroup().addTo(map), ferryLayer=L.layerGroup().addTo(map), dbcCams=null, rGen=0, rT=null, rKey='', sel=null, camList=[], camTmr=null;
    var WS='https://data.wsdot.wa.gov/arcgis/rest/services/TravelInformation/';
    var gjC={}; function o5b(b){ var cx=(b.w+b.e)/2, cy=(b.s+b.n)/2, hw=Math.max((b.e-b.w)/2,.75), hh=Math.max((b.n-b.s)/2,.5); return [cx-hw,cy-hh,cx+hw,cy+hh].map(function(v){return (Math.round(v*4)/4).toFixed(2)}).join(',') }
    function gj(u,o){ var hit=gjC[u]; if(hit&&Date.now()-hit.t<60000) return hit.p; var p=fetch(u,o).then(function(r){return r.ok?r.json():null}).catch(function(){return null}); gjC[u]={t:Date.now(),p:p}; return p }

    function env(b){ return '&geometry='+encodeURIComponent([b.w,b.s,b.e,b.n].map(function(v){return v.toFixed(3)}).join(','))+'&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json' }
    function https(u){ u=String(u||''); return /^https:\/\/[^\s"<>]{4,300}$/.test(u)?u:'' }
    function pin(lat,lon,c,emo,sz,label,fn,z){ L.marker([lat,lon],{icon:L.divIcon({className:'',html:'<span class="firemk" role="button" aria-label="'+esc(label)+'" style="--c:'+c+';--sz:'+sz+'px">'+emo+'</span>',iconSize:[0,0]}),keyboard:false,bubblingMouseEvents:false,zIndexOffset:z||-250,title:label}).on('click',fn).addTo(this) }
    function sheet(title,html,cls){ var rs=document.getElementById('roadsheet'); rs.classList.toggle('awcam',cls==='cam'||cls==='ferry'); rs.classList.toggle('awfer',cls==='ferry'); document.getElementById('roadtitle').innerHTML=title; var b=document.getElementById('roadbody'); b.innerHTML=html; document.getElementById('roadsheet').hidden=false; return b }
    function when(t){ if(!t) return ''; var d=new Date(t); if(isNaN(d)) return ''; var m=Math.round((Date.now()-d)/60000); return m<60?(m<1?'just now':m+' min ago'):m<1440?Math.round(m/60)+' h ago':d.toLocaleDateString([], {month:'short',day:'numeric'}) }
    // ----- road data -----
    function loadRoads(force){ var g=++rGen, z=map.getZoom(); if(!roadOn||z<7){ roadLayer.clearLayers(); camLayer.clearLayers(); rKey=''; return }
      var bb=map.getBounds().pad(.15), b={s:bb.getSouth(),n:bb.getNorth(),w:bb.getWest(),e:bb.getEast()};
      var key=[b.s,b.n,b.w,b.e].map(function(v){return Math.round(v*10)/10}).join(',')+z+cfg2.roadEvt+cfg2.roadCams+cfg2.roadCons+cfg2.roadPass+cfg2.roadWA; if(!force&&key===rKey) return; rKey=key;
      var inBC=b.e>-139.5&&b.w<-114&&b.n>48.2&&b.s<60, inWA=b.e>-124.9&&b.w<-116.9&&b.n>45.5&&b.s<49.1, jobs=[]; if(cfg2.roadWA!=='1') inWA=false;
      if(inBC) jobs.push(gj('https://api.open511.gov.bc.ca/events?format=json&status=ACTIVE&limit=500&bbox='+o5b(b)).then(function(j){ return (j&&j.events||[]).map(function(e){ var gm=e.geography||{}, c=gm.type==='Point'?gm.coordinates:(gm.type==='LineString'&&gm.coordinates?gm.coordinates[Math.floor(gm.coordinates.length/2)]:null); if(!c) return null;
        var closed=(e.roads||[]).some(function(r){return /CLOSED/.test(r.state||'')})||(e.event_subtypes||[]).some(function(s){return /CLOSED|CLOSURE/.test(s)});
        return {k:'ev',src:'DriveBC',lat:c[1],lon:c[0],closed:closed,major:e.severity==='MAJOR',type:String(e.event_type||'').replace(/_/g,' ').toLowerCase(),road:(e.roads||[]).map(function(r){return r.name}).filter(Boolean).slice(0,2).join(', '),desc:String(e.description||'').slice(0,600),upd:e.updated} }).filter(Boolean) }));
      if(inWA) jobs.push(gj(WS+'TravelInfoRoadAlerts/FeatureServer/0/query?where=1%3D1&outFields=EventCategoryDescription,EventCategoryTypeDescription,EventPriorityID,Road,RoadDirection,HeadlineMessage,LastModifiedDate,RoadClosedFlag&resultRecordCount=500'+env(b)).then(function(j){ return (j&&j.features||[]).map(function(f){ var a=f.attributes||{}, gm=f.geometry||{}; if(typeof gm.x!=='number') return null;
        return {k:'ev',src:'WSDOT',lat:gm.y,lon:gm.x,closed:a.RoadClosedFlag===1,major:a.EventPriorityID<=2,type:String(a.EventCategoryDescription||'alert').toLowerCase(),road:[a.Road,a.RoadDirection].filter(Boolean).join(' '),desc:String(a.HeadlineMessage||'').slice(0,600),upd:a.LastModifiedDate} }).filter(Boolean) }));
      if(inWA&&cfg2.roadPass==='1') jobs.push(gj(WS+'TravelInfoMtPassReports/FeatureServer/0/query?where=1%3D1&outFields=*&resultRecordCount=50'+env(b)).then(function(j){ return (j&&j.features||[]).map(function(f){ var a=f.attributes||{}, gm=f.geometry||{}; if(typeof gm.x!=='number') return null; return {k:'pass',lat:gm.y,lon:gm.x,a:a} }).filter(Boolean) }));
      var camJobs=[]; if(cfg2.roadCams==='1'&&z>=(cfg2.declutter==='1'?8:7)){
        if(inBC) camJobs.push((dbcCams?Promise.resolve(dbcCams):gj('drivebc-cams.json').then(function(a){ dbcCams=Array.isArray(a)?a:[]; return dbcCams })).then(function(a){ return a.filter(function(c){return c[2]>b.s&&c[2]<b.n&&c[3]>b.w&&c[3]<b.e}).map(function(c){ return {src:'DriveBC',lat:c[2],lon:c[3],name:c[1],hwy:c[4],dir:c[5],elev:c[6],cap:c[7],img:'https://www.drivebc.ca/images/'+(+c[0])+'.jpg'} }) }));
        if(inWA) camJobs.push(gj(WS+'TravelInfoCamerasWeather/FeatureServer/0/query?where=1%3D1&outFields=CameraTitle,ImageURL,CompassDirection&resultRecordCount=400'+env(b)).then(function(j){ return (j&&j.features||[]).map(function(f){ var a=f.attributes||{}, gm=f.geometry||{}, u=https(a.ImageURL); if(!u||typeof gm.x!=='number') return null; return {src:'WSDOT',lat:gm.y,lon:gm.x,name:a.CameraTitle,dir:a.CompassDirection,img:u} }).filter(Boolean) })) }
      Promise.all(jobs).then(function(rs){ if(g!==rGen) return; roadLayer.clearLayers(); var all=[].concat.apply([],rs), en=0, em=capN(cfg2.evtMax); if(em<1e9) all.sort(byNear(nearPt()));
        all.forEach(function(it){ if(it.k==='pass'){ if(cfg2.declutter==='1'&&map.getZoom()<8) return; var bad=/snow|ice|chain|closed|compact/i.test((it.a.RoadCondition||'')+' '+(it.a.PublicMessage1||'')+' '+(it.a.PublicMessage2||'')); pin.call(roadLayer,it.lat,it.lon,bad?'#fb8c00':'#43a047','🏔',22,it.a.PassName||'Mountain pass',function(){openPass(it.a)},-240); return }
          if(cfg2.roadEvt==='major'&&!it.closed&&!it.major) return; var zz=map.getZoom(); if(cfg2.declutter==='1'&&((zz<8&&!it.closed)||(zz<10&&!it.closed&&!it.major))) return; if(cfg2.roadCons==='0'&&!it.closed&&/construct|maint/.test(it.type)) return; if(++en>em) return;
          pin.call(roadLayer,it.lat,it.lon,it.closed?'#e53935':it.major?'#fb8c00':'#fbc02d',it.closed?'⛔':/construct|maint/.test(it.type)?'🚧':'⚠️',it.closed?22:18,(it.road||'Road')+' '+it.type,function(){openEvent(it)},it.closed?-230:-260) }) });
      Promise.all(camJobs).then(function(rs){ if(g!==rGen) return; camLayer.clearLayers(); camList=[].concat.apply([],rs).filter(function(c){return isFinite(c.lat)&&isFinite(c.lon)}).sort(byNear(nearPt())).slice(0,Math.min(capN(cfg2.camMax,300),cfg2.declutter==='1'&&z<10?(z<9?15:30):300));
        camList.forEach(function(c){ pin.call(camLayer,c.lat,c.lon,'#37474f','📷',20,c.name||'Highway camera',function(){openCam(c)},-270) }) }) }
    // camera card (glow theme): the photo with arrows to the next camera, other views from the same spot, weather there now
    var CAMI='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="12.5" rx="2.5"/><path d="M8.5 7l1.5-2.5h4L15.5 7"/><circle cx="12" cy="13" r="3.2"/></svg>', camWx={};
    function wxWord(c){ return c==null?'':c>=95?'Thunderstorm':c>=85?'Snow showers':c>=71?'Snow':c>=66?'Freezing rain':c>=61?'Rain':c>=56?'Freezing drizzle':c>=51?'Drizzle':c>=45?'Fog':c>=3?'Cloudy':c>=1?'Partly cloudy':'Clear' }
    function camWeather(c){ var k=c.lat.toFixed(2)+','+c.lon.toFixed(2), hit=camWx[k]; if(hit&&Date.now()-hit.t<900000) return Promise.resolve(hit.v); if(navigator.onLine===false) return Promise.resolve(null);
      return fetch('https://api.open-meteo.com/v1/forecast?latitude='+c.lat.toFixed(3)+'&longitude='+c.lon.toFixed(3)+'&current=temperature_2m,weather_code&hourly=snowfall&past_hours=24&forecast_hours=1&timezone=auto').then(function(r){ return r.ok?r.json():null }).then(function(j){ if(!j||!j.current) return null;
        var sn=(j.hourly&&j.hourly.snowfall||[]).slice(0,24).reduce(function(a,v){ return a+(+v||0) },0), v={t:j.current.temperature_2m,c:j.current.weather_code,sn:sn}; camWx[k]={t:Date.now(),v:v}; return v }).catch(function(){ return null }) }
    var DIRW={N:'North',S:'South',E:'East',W:'West',NE:'Northeast',NW:'Northwest',SE:'Southeast',SW:'Southwest'}; function dirW(d){ d=String(d||'').toUpperCase(); return DIRW[d]||cap(d.toLowerCase()) }
    function openCam(c){ sel=c; var others=camList.filter(function(x){return x!==c}).map(function(x){return {x:x,d:distNm(c.lat,c.lon,x.lat,x.lon)}}).sort(function(a,b){return a.d-b.d});
      var views=[c].concat(others.filter(function(n){ return n.d<0.12&&n.x.dir&&n.x.dir!==c.dir }).map(function(n){ return n.x })).slice(0,4).sort(function(a,b){ return String(a.dir).localeCompare(String(b.dir)) }), far=others.filter(function(n){ return n.d>=0.12 });
      var nextC=far[0]&&far[0].x, prevC=far[1]&&far[1].x;
      var src=c.img+(c.img.indexOf('?')>-1?'&':'?')+'t='+Math.floor(Date.now()/60000);
      var dbc=c.src==='DriveBC', sub=[c.hwy?'Hwy '+c.hwy:'',c.elev?ft(c.elev*3.28084):'',c.dir?'looking '+dirW(c.dir).toLowerCase():''].filter(Boolean).join(' · ')||'Highway camera';
      var h='<div class="awcph"><img id="roadimg" src="'+esc(src)+'" alt="Camera view: '+esc(c.name)+'" style="aspect-ratio:'+(dbc?'800/468':'4/3')+'" referrerpolicy="no-referrer"><span class="awlv">● Live camera</span>'+
        (prevC?'<button type="button" class="awar l" data-c="p" aria-label="Previous camera: '+esc(prevC.name)+'"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button>':'')+(nextC?'<button type="button" class="awar r" data-c="n" aria-label="Next camera: '+esc(nextC.name)+'"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>':'')+
        (views.length>1?'<div class="awvw">'+views.map(function(v,i){ return '<button type="button" data-v="'+i+'"'+(v===c?' class="on"':'')+'>'+esc(v.dir?dirW(v.dir):'View')+'</button>' }).join('')+'</div>':'')+'</div>';
      if(dbc) h+='<div id="roadts" role="img" aria-label="Date and time the photo was taken"><img src="'+esc(src)+'" alt="" referrerpolicy="no-referrer"></div>';
      h+='<div class="awst"><div><small>Elevation</small><b>'+(c.elev?esc(ft(c.elev*3.28084)):'—')+'</b></div><div><small>Air now</small><b id="awct">…</b></div><div><small>Snow 24 h</small><b id="awcs">…</b></div></div>';
      h+='<div class="awcd" id="awcd" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.3v.1"/></svg><div><b id="awcw"></b><small>Weather at this camera now (Open-Meteo)</small></div></div>';
      h+='<div class="awcap">'+(c.cap?esc(c.cap)+'<br>':'')+(dbc?'DriveBC':'WSDOT')+' camera · photos update every few minutes</div>';
      h+='<div class="awbt">'+(window.__nav?'<button type="button" class="p" data-c="go">Directions</button>':'')+(nextC?'<button type="button" data-c="n">Next camera ›</button>':'')+'</div>';
      var b=sheet('<span class="awct"><span class="awcb">'+CAMI+'</span><span><b>'+esc(c.name||'Highway camera')+'</b><small>'+esc(sub)+'</small></span></span>',h,'cam');
      b.onclick=function(e){ var t=e.target.closest&&e.target.closest('[data-c],[data-v]'); if(!t) return; if(t.hasAttribute('data-v')){ var v=views[+t.getAttribute('data-v')]; if(v&&v!==c) openCam(v); return }
        var a=t.getAttribute('data-c'); if(a==='n'&&nextC) openCam(nextC); if(a==='p'&&prevC) openCam(prevC); if(a==='go'&&window.__nav){ document.getElementById('roadsheet').hidden=true; window.__nav.to(L.latLng(c.lat,c.lon),c.name||'Highway camera') } };
      camWeather(c).then(function(w){ if(sel!==c) return; var t=document.getElementById('awct'), sn=document.getElementById('awcs'), cd=document.getElementById('awcd'), cw=document.getElementById('awcw');
        if(t) t.textContent=w&&w.t!=null?Math.round(w.t)+' °C':'—'; if(sn) sn.textContent=w?(w.sn>=0.5?Math.round(w.sn)+' cm':'None'):'—';
        if(w&&cd&&cw){ var wd=wxWord(w.c); if(wd){ cw.textContent=wd+(w.sn>=2?' · fresh snow on the road is likely':''); cd.hidden=false; cd.classList.toggle('ok',!/snow|freez|thunder|fog/i.test(wd)) } } });
      var im=document.getElementById('roadimg'); if(im) im.onerror=function(){ var ts=document.getElementById('roadts'); if(ts) ts.remove(); im.replaceWith(Object.assign(document.createElement('div'),{className:'awoff',textContent:'This camera is offline right now.'})) };
      clearInterval(camTmr); if(cfg2.camAuto==='1') camTmr=setInterval(function(){ var i2=document.getElementById('roadimg'); if(!i2||sel!==c||document.getElementById('roadsheet').hidden){ clearInterval(camTmr); return } if(!document.hidden){ i2.src=c.img+(c.img.indexOf('?')>-1?'&':'?')+'t='+Date.now(); var t2=document.querySelector('#roadts img'); if(t2) t2.src=i2.src } },60000) }
    function cap(s){ return String(s||'').replace(/^./,function(x){ return x.toUpperCase() }) }
    function openEvent(e){ var tag=e.closed?'<span class="firepill" style="background:#e53935">Closed</span>':e.major?'<span class="firepill" style="background:#fb8c00">Major</span>':'';
      var h='<div class="ssec"><b>'+esc(e.road||'Road')+'</b> · '+esc(e.type)+(e.upd?'<br>Updated '+esc(when(e.upd)):'')+'</div><div class="ssec" style="max-height:38vh;overflow:auto;color:var(--fg)">'+esc(e.desc||'No details given.')+'</div>';
      h+='<div class="abtns" style="grid-template-columns:1fr"><a class="pri" href="'+(e.src==='DriveBC'?'https://www.drivebc.ca/':'https://wsdot.com/travel/real-time/map/')+'" target="_blank" rel="noopener noreferrer">Open '+e.src+'</a></div><div class="skynote">Source: '+(e.src==='DriveBC'?'DriveBC Open511':'WSDOT')+'. Check before you drive; conditions change fast.</div>';
      sheet('<span style="font-size:16px">'+esc(e.closed?'Road closed':e.type.charAt(0).toUpperCase()+e.type.slice(1))+'</span>'+tag,h) }
    function openPass(a){ var h='<div class="wxg">'+[['Elevation',a.Elevation?Math.round(a.Elevation).toLocaleString()+' ft':'—'],['Weather',a.Weather||'—'],['Road',a.RoadCondition||'—']].map(function(y){return '<div><small>'+y[0]+'</small><span>'+esc(y[1])+'</span></div>'}).join('')+'</div>';
      h+='<div class="ssec">'+[[a.TravelDirection1,a.PublicMessage1],[a.TravelDirection2,a.PublicMessage2]].filter(function(x){return x[0]||x[1]}).map(function(x){return '<div class="row2"><span><b>'+esc(x[0]||'')+'</b></span><span style="white-space:normal">'+esc(x[1]||'—')+'</span></div>'}).join('')+'</div>';
      h+='<div class="ssec" style="color:var(--fg)">'+esc([a.RoadCondition].filter(Boolean).join(' '))+'</div><div class="skynote">Mountain pass report: WSDOT</div>';
      sheet('<span style="font-size:16px">'+esc(a.PassName||'Mountain pass')+'</span>',h) }
    // ----- BC Ferries -----
    var TERM={TSA:['Tsawwassen',49.0068,-123.1300],SWB:['Swartz Bay',48.6890,-123.4110],HSB:['Horseshoe Bay',49.3740,-123.2720],DUK:['Duke Point',49.1630,-123.8910],NAN:['Departure Bay (Nanaimo)',49.1930,-123.9540],LNG:['Langdale',49.4345,-123.4722],BOW:['Bowen Island',49.3790,-123.3340],FUL:['Fulford Harbour',48.7690,-123.4510],SGI:['Southern Gulf Islands']};
    var fData=null, fT=0, fTerm=null, fRoute=null, fCam=0;
    function loadFerries(){ if(!ferryOn){ ferryLayer.clearLayers(); return Promise.resolve() } if(fData&&Date.now()-fT<180000) return Promise.resolve(fData);
      return gj('https://www.bcferriesapi.ca/v2/capacity/').then(function(j){ if(j&&Array.isArray(j.routes)){ fData=j.routes; fT=Date.now() } drawFerries(); if(fTerm&&!document.getElementById('roadsheet').hidden) ferryRender(); return fData }) }
    function drawFerries(){ ferryLayer.clearLayers(); if(!ferryOn) return; var fp=nearPt(), ks=Object.keys(TERM).filter(function(k){return TERM[k].length>=3}).sort(function(a,b){ return distNm(fp[0],fp[1],TERM[a][1],TERM[a][2])-distNm(fp[0],fp[1],TERM[b][1],TERM[b][2]) });
      if(cfg2.ferryMax==='home') ks=TERM[cfg2.ferryHome]?[cfg2.ferryHome]:ks.slice(0,1); else ks=ks.slice(0,capN(cfg2.ferryMax));
      ks.forEach(function(k){ var t=TERM[k]; pin.call(ferryLayer,t[1],t[2],'#1565c0','⛴',24,t[0]+' ferry terminal',function(){ fTerm=k; fRoute=null; fCam=0; ferryRender(); loadFerries() },-150) }) }
    function fillCol(p){ return p>=90?'#e53935':p>=60?'#fb8c00':'#43a047' }
    // ferry card (glow theme, sea green): the next sailing you can still make, car space bars, drive there, return trip
    var FIC='<svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M4 15.5h16l-2 4H6z"/><path d="M4 15.5h16l-2 4H6zM7 15.5V11h10v4.5M10 11V8h4v3"/><path d="M2.5 21.5c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1"/></svg>';
    function fCol(free){ return free<=10?'#ff453a':free<=40?'#ffb340':'#32d74b' }
    function fTime(s){ var m=/(\d{1,2}):(\d{2})\s*([ap])\.?m/i.exec(String(s||'')); if(!m) return null; var h=+m[1]%12+(/p/i.test(m[3])?12:0), d=new Date(); d.setHours(h,+m[2],0,0); return d.getTime() }
    function hm(t){ return new Date(t).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}) }
    function ferryRender(){ var k=fTerm, t=TERM[k]; if(!t) return; var routes=(fData||[]).filter(function(r){return r.fromTerminalCode===k});
      if(!fRoute||!routes.some(function(r){return r.routeCode===fRoute})) fRoute=routes[0]&&routes[0].routeCode;
      var r=routes.filter(function(x){return x.routeCode===fRoute})[0], h='', toN=r?(TERM[r.toTerminalCode]||[r.toTerminalCode])[0]:'', fp=nearPt(), dK=t[1]?distNm(fp[0],fp[1],t[1],t[2])*1.852:0;
      var drive=dK>1?Math.round(dK*1.3/70*60):0; /* rough drive time: road is about 1.3 x straight line at 70 km/h */
      if(!fData) h='<div class="awfl">Loading sailings…</div>';
      else if(!routes.length) h='<div class="awfl">No live sailing info for this terminal. Check bcferries.com.</div>';
      else { if(routes.length>1) h+='<div class="awfr" role="tablist">'+routes.map(function(x){ var to=(TERM[x.toTerminalCode]||[x.toTerminalCode])[0]; return '<button role="tab" data-r="'+esc(x.routeCode)+'"'+(x.routeCode===fRoute?' class="on"':'')+'>'+esc(to.replace(/ \(.*\)/,''))+'</button>' }).join('')+'</div>';
        var up=(r.sailings||[]).filter(function(s){return s.sailingStatus!=='past'&&s.sailingStatus!=='current'}), now=Date.now();
        var mk=up.filter(function(s){ var tt=fTime(s.scheduledTime||s.time); var free=s.capacityKnown?100-(s.carFill||s.fill||0):50; return free>0&&(!tt||tt-now>(drive+30)*60000) })[0];
        if(r.dataStatus==='no-service') h+='<div class="awfl">No service on this route today.</div>';
        else if(mk){ var tt=fTime(mk.scheduledTime||mk.time), used=mk.capacityKnown?(mk.carFill||mk.fill||0):null, free=used==null?null:100-used;
          h+='<div class="awfn"><small>Next sailing you can make</small><div class="t"><b>'+esc(mk.scheduledTime||mk.time||'')+'</b><span>'+(free==null?'<b>Space not known</b>':'<b style="color:'+fCol(free)+'">'+free+'% car space</b>')+(tt&&drive?'<small>leave by ~'+esc(hm(tt-(drive+30)*60000))+'</small>':'')+'</span></div>'+
            (used!=null?'<div class="bar"><i style="width:'+used+'%;--bc:'+fCol(free)+'"></i></div><small>'+used+'% full'+(free<=40?' · filling fast':'')+'</small>':'')+'</div>' }
        h+='<div class="awfls">'+(up.length?up.slice(0,Math.max(4,+cfg2.ferryN||4)).map(function(s){ var used=s.capacityKnown?(s.carFill||s.fill||0):null, free=used==null?null:100-used, full=free!=null&&free<=0;
            return '<div class="r'+(full?' full':'')+'"><b>'+esc(s.scheduledTime||s.time||'')+'</b><div><small>'+esc(s.vesselName||'')+(s.vesselStatus?' · '+esc(s.vesselStatus):'')+'</small>'+(used!=null?'<div class="bar"><i style="width:'+used+'%;--bc:'+fCol(free)+'"></i></div>':'')+'</div><span style="color:'+(free==null?'#9aa3ad':fCol(free))+'">'+(free==null?esc(s.status||''):full?'Full':free+'% space')+'</span></div>' }).join(''):'<div class="r"><span style="color:#9aa3ad">No more sailings today.</span></div>')+'</div>';
        var cams=(r.terminal&&r.terminal.webcams)||[], cam=cams[fCam%Math.max(1,cams.length)];
        if(cfg2.ferryCam==='1'&&cam&&https(cam.imageURL)) h+='<img id="fcam" src="'+esc(https(cam.imageURL)+'?t='+Math.floor(Date.now()/60000))+'" alt="'+esc(cam.label||'Terminal camera')+'" referrerpolicy="no-referrer"><div class="skynote" style="margin-top:3px">'+esc(cam.label||'Terminal camera')+(cams.length>1?' · tap photo for next camera':'')+'</div>';
        var back=TERM[r.toTerminalCode]&&(fData||[]).some(function(x){ return x.fromTerminalCode===r.toTerminalCode&&x.toTerminalCode===k });
        h+='<div class="awfb2">'+(window.__nav&&t[1]?'<button type="button" class="p" data-x="go">Drive to terminal</button>':'')+(back?'<button type="button" data-x="back">Return trip ⇄</button>':'')+'</div>'+
          '<div class="awfk"><a href="https://www.bcferries.com/RouteSelectionPage" target="_blank" rel="noopener noreferrer">Buy tickets ›</a><a href="'+esc(/^https:\/\/www\.bcferries\.com\//.test(r.sourceURL||'')?r.sourceURL:'https://www.bcferries.com/current-conditions')+'" target="_blank" rel="noopener noreferrer">Current conditions ›</a></div>' }
      h+='<div class="skynote">Sailings: BC Ferries via bcferriesapi.ca (unofficial, updates every few minutes). Leave-by time is a rough guess and allows 30 min at the terminal.</div>';
      var b=sheet('<span class="awct"><span class="awcb">'+FIC+'</span><span><b>'+esc(t[0].replace(/ \(.*\)/,''))+(toN?' → '+esc(toN.replace(/ \(.*\)/,'')):'')+'</b><small>'+esc([r&&r.sailingDuration?r.sailingDuration+' crossing':'',dK>1?Math.round(dK)+' km from you':''].filter(Boolean).join(' · ')||'Ferry terminal')+'</small></span></span>',h,'ferry');
      [].forEach.call(b.querySelectorAll('[data-r]'),function(x){ x.onclick=function(){ fRoute=x.getAttribute('data-r'); fCam=0; ferryRender() } });
      b.onclick=function(e){ var x=e.target.closest&&e.target.closest('[data-x]'); if(!x) return; var a=x.getAttribute('data-x');
        if(a==='go'&&window.__nav){ document.getElementById('roadsheet').hidden=true; window.__nav.to(L.latLng(t[1],t[2]),t[0]+' ferry terminal') }
        if(a==='back'&&r){ var from=k; fTerm=r.toTerminalCode; fRoute=((fData||[]).filter(function(y){ return y.fromTerminalCode===fTerm&&y.toTerminalCode===from })[0]||{}).routeCode||null; fCam=0; ferryRender() } };
      var fc=document.getElementById('fcam'); if(fc){ fc.onclick=function(){ fCam++; ferryRender() }; fc.onerror=function(){ fc.remove() } } }
    // ----- buttons, settings, refresh -----
    function paint(){ var a=document.getElementById('roadbtn'), f=document.getElementById('ferrybtn'), s1=document.getElementById('s_road'), s2=document.getElementById('s_ferry');
      a.classList.toggle('on',roadOn); a.setAttribute('aria-pressed',String(roadOn)); f.classList.toggle('on',ferryOn); f.setAttribute('aria-pressed',String(ferryOn)); if(s1) s1.value=roadOn?'1':'0'; if(s2) s2.value=ferryOn?'1':'0' }
    function setRoad(v){ roadOn=v; try{localStorage.setItem('sky-road',v?'1':'0')}catch(e){} paint(); if(v&&map.getZoom()<7) map.setZoom(8); else loadRoads(true) }
    function setFerry(v){ ferryOn=v; try{localStorage.setItem('sky-ferry',v?'1':'0')}catch(e){} paint(); if(v){ drawFerries(); loadFerries(); var ht=TERM[cfg2.ferryHome], hp=ht&&ht[1]?[ht[1],ht[2]]:null; if(cfg2.ferryJump==='1'&&!map.getBounds().contains(hp||[49.2,-123.4])) map.setView(hp||[49.15,-123.45],hp?11:9); if(hp){ fTerm=cfg2.ferryHome; fRoute=null; fCam=0; ferryRender() } } else ferryLayer.clearLayers() }
    document.getElementById('roadbtn').onclick=function(){ setRoad(!roadOn) };
    document.getElementById('ferrybtn').onclick=function(){ setFerry(!ferryOn) };
    var s1=document.getElementById('s_road'), s2=document.getElementById('s_ferry'); if(s1) s1.onchange=function(){ setRoad(s1.value==='1') }; if(s2) s2.onchange=function(){ setFerry(s2.value==='1') };
    document.getElementById('roadx').onclick=function(){ document.getElementById('roadsheet').hidden=true; fTerm=null; clearInterval(camTmr) };
    document.getElementById('roadsheet').onclick=function(e){ if(e.target===this){ this.hidden=true; fTerm=null } };
    map.on('moveend',function(){ clearTimeout(rT); rT=setTimeout(function(){ loadRoads(false) },900) });
    setInterval(function(){ if(document.hidden) return; if(roadOn) loadRoads(true); if(ferryOn) loadFerries() },180000);
    window.__roads={reload:function(){ loadRoads(true) },ferries:function(){ drawFerries() },ferry:function(){ if(fTerm&&!document.getElementById('roadsheet').hidden) ferryRender() }};
    paint(); if(roadOn) setTimeout(function(){ loadRoads(true) },1800); if(ferryOn) setTimeout(function(){ drawFerries(); loadFerries() },1800);
  })();
}});
