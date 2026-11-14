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
    function sheet(title,html){ document.getElementById('roadtitle').innerHTML=title; var b=document.getElementById('roadbody'); b.innerHTML=html; document.getElementById('roadsheet').hidden=false; return b }
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
    function openCam(c){ sel=c; var near=camList.filter(function(x){return x!==c}).map(function(x){return {x:x,d:distNm(c.lat,c.lon,x.lat,x.lon)}}).sort(function(a,b){return a.d-b.d}).slice(0,3);
      var src=c.img+(c.img.indexOf('?')>-1?'&':'?')+'t='+Math.floor(Date.now()/60000);
      var dbc=c.src==='DriveBC', h='<img id="roadimg" src="'+esc(src)+'" alt="Camera view: '+esc(c.name)+'" style="width:100%;aspect-ratio:'+(dbc?'800/468':'4/3')+';object-fit:contain;border-radius:10px;background:#000;display:block" referrerpolicy="no-referrer">';
      if(dbc) h+='<div id="roadts" role="img" aria-label="Date and time the photo was taken" style="position:relative;width:100%;aspect-ratio:205/18;overflow:hidden;background:#000;border-radius:8px;margin-top:6px"><img src="'+esc(src)+'" alt="" style="position:absolute;right:0;bottom:0;width:390.24%;max-width:none;height:auto" referrerpolicy="no-referrer"></div>';
      h+='<div class="ssec" style="margin-top:6px"><b>'+esc([c.hwy?'Hwy '+c.hwy:'',c.dir?'looking '+c.dir:'',c.elev?ft(c.elev*3.28084):''].filter(Boolean).join(' · ')||c.src)+'</b>'+(c.cap?'<br>'+esc(c.cap):'')+'</div>';
      if(near.length) h+='<div class="ssec"><h4>Nearby cameras</h4>'+near.map(function(n,i){ return '<div class="brow row2" data-i="'+i+'" style="cursor:pointer"><span>📷 '+esc(n.x.name)+'</span><span>'+uDist(n.d,1)+' '+distUnit()+'</span></div>' }).join('')+'</div>';
      h+='<div class="skynote">Camera: '+(c.src==='DriveBC'?'DriveBC (BC Ministry of Transportation)':'WSDOT')+' · photos update every few minutes</div>';
      var b=sheet('<span style="font-size:16px">'+esc(c.name||'Highway camera')+'</span>',h);
      [].forEach.call(b.querySelectorAll('.brow'),function(r){ r.onclick=function(){ openCam(near[+r.getAttribute('data-i')].x) } });
      var im=document.getElementById('roadimg'); if(im) im.onerror=function(){ var ts=document.getElementById('roadts'); if(ts) ts.remove(); im.replaceWith(Object.assign(document.createElement('div'),{className:'ssec',textContent:'This camera is offline right now.'})) };
      clearInterval(camTmr); if(cfg2.camAuto==='1') camTmr=setInterval(function(){ var i2=document.getElementById('roadimg'); if(!i2||sel!==c||document.getElementById('roadsheet').hidden){ clearInterval(camTmr); return } if(!document.hidden){ i2.src=c.img+(c.img.indexOf('?')>-1?'&':'?')+'t='+Date.now(); var t2=document.querySelector('#roadts img'); if(t2) t2.src=i2.src } },60000) }
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
    function ferryRender(){ var k=fTerm, t=TERM[k]; if(!t) return; var routes=(fData||[]).filter(function(r){return r.fromTerminalCode===k});
      if(!fRoute||!routes.some(function(r){return r.routeCode===fRoute})) fRoute=routes[0]&&routes[0].routeCode;
      var r=routes.filter(function(x){return x.routeCode===fRoute})[0], h='';
      if(!fData) h='<div class="ssec">Loading sailings…</div>';
      else if(!routes.length) h='<div class="ssec">No live sailing info for this terminal. Check bcferries.com.</div>';
      else { h+='<div class="dtabs" role="tablist" style="overflow-x:auto">'+routes.map(function(x){ var to=(TERM[x.toTerminalCode]||[x.toTerminalCode])[0]; return '<button role="tab" data-r="'+esc(x.routeCode)+'"'+(x.routeCode===fRoute?' class="on"':'')+' style="flex:0 0 auto;padding:0 10px">'+esc(to.replace(/ \(.*\)/,''))+'</button>' }).join('')+'</div>';
        var up=(r.sailings||[]).filter(function(s){return s.sailingStatus!=='past'}).slice(0,+cfg2.ferryN||4);
        h+='<div class="ssec" style="margin-top:6px"><h4>'+esc(r.dataStatus==='no-service'?'No service today':'Next sailings · '+(r.sailingDuration||''))+'</h4>'+(up.length?up.map(function(s){ var right=s.sailingStatus==='current'?'<span class="good">Departed '+esc(s.time||'')+'</span>':(s.capacityKnown?(cfg2.ferryFill==='full'?'<b style="color:'+fillCol(s.fill||0)+'">'+(s.fill||0)+'% full</b>':'<b style="color:'+fillCol(s.carFill||s.fill||0)+'">'+(100-(s.carFill||s.fill||0))+'% car space left</b>'):esc(s.status||''));
          return '<div class="row2"><span><b>'+esc(s.scheduledTime||s.time||'')+'</b> '+esc(s.vesselName||'')+(s.vesselStatus?' · '+esc(s.vesselStatus):'')+'</span><span>'+right+'</span></div>' }).join(''):'No more sailings today.')+'</div>';
        var cams=(r.terminal&&r.terminal.webcams)||[], cam=cams[fCam%Math.max(1,cams.length)];
        if(cfg2.ferryCam==='1'&&cam&&https(cam.imageURL)) h+='<img id="fcam" src="'+esc(https(cam.imageURL)+'?t='+Math.floor(Date.now()/60000))+'" alt="'+esc(cam.label||'Terminal camera')+'" style="width:100%;max-height:28vh;object-fit:cover;border-radius:10px;display:block;cursor:pointer" referrerpolicy="no-referrer"><div class="skynote" style="margin-top:3px">📷 '+esc(cam.label||'')+(cams.length>1?' · tap photo for next camera':'')+'</div>';
        var su=/^https:\/\/www\.bcferries\.com\//.test(r.sourceURL||'')?r.sourceURL:'https://www.bcferries.com/current-conditions';
        var toN=(TERM[r.toTerminalCode]||[r.toTerminalCode])[0];
        h+='<div class="abtns" style="grid-template-columns:1fr 1fr;margin-top:6px"><a class="pri" href="https://www.bcferries.com/RouteSelectionPage" target="_blank" rel="noopener noreferrer">🎟 Buy tickets</a><a href="'+esc(su)+'" target="_blank" rel="noopener noreferrer">Current conditions</a></div>'+
          '<div class="skynote" style="margin-top:0">Opens BC Ferries booking. Choose '+esc(t[0])+' → '+esc(toN)+' and your sailing there; payment is on their secure site.</div>' }
      h+='<div class="skynote">Sailings: BC Ferries via bcferriesapi.ca (unofficial, updates every few minutes)</div>';
      var b=sheet('<span style="font-size:16px">⛴ '+esc(t[0])+'</span>',h);
      [].forEach.call(b.querySelectorAll('[data-r]'),function(x){ x.onclick=function(){ fRoute=x.getAttribute('data-r'); fCam=0; ferryRender() } });
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
