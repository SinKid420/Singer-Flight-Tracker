if(typeof L==='undefined'){document.addEventListener('DOMContentLoaded',function(){document.getElementById('stat').textContent='Map library blocked. Reload with a connection.'})}
(function(){
  if(typeof L==='undefined') return;
  // Default: Grand Forks, BC. Replaced by your GPS position if the browser allows it.
  var me = {lat:49.0306, lon:-118.4448, label:'Grand Forks'};
  // Open where you were last time (saved to about 100 m on this phone only), then GPS updates it within seconds.
  try{var lp=JSON.parse(localStorage.getItem('sky-lastpos')||'null'); if(lp&&isFinite(lp.lat)&&isFinite(lp.lon)&&Math.abs(lp.lat)<=90&&Math.abs(lp.lon)<=180){me.lat=+lp.lat;me.lon=+lp.lon;me.label='you'}}catch(e){}
  var cfg2={fsrRdOp:'0.4',waterOp:'0.4',water:'1',fsrOp:'1',fsrWalk:'1',fsrBike:'1',fsrMotor:'1',fsrFsr:'1',fsrRoad:'1',fsrPlan:'1',fsrBcts:'1',fsrTh:'1',fsrCamp:'1',fsrClose:'1',fsrOsm:'1',arMax:'40',arDetail:'full',ovShow:'1',ovMins:'30',ovDist:'3',emShow:'1',starlink:'1',passAll:'0',aptOnlyBad:'0',dtab:'ov',adir:'1',atype:'all',fireAll:'0',firePer:'1',fireAc:'1',roadCams:'1',roadEvt:'all',camAuto:'0',roadCons:'1',roadPass:'1',roadWA:'1',ferryHome:'none',ferryN:'4',ferryFill:'car',ferryCam:'1',ferryJump:'1',hubKm:'100',hubAuto:'1',hubBadge:'1',v3Ex:'1',v3Fps:'smooth',declutter:'1',nearRef:'me',aMax:'all',wxMax:'auto',fireKm:'map',fireMax:'all',camMax:'all',evtMax:'all',ferryMax:'all',ltAge:'30',ltAlert:'off',mt:'auto',mtPins:'1',prepSolar:'off'};
  // ---- The same weather request asked twice at once (or within a minute) goes out only once ----
  (function(){ var of=window.fetch, memo={}, HOSTS=/^https:\/\/(api\.open-meteo\.com|api\.rainviewer\.com)\//;
    window.fetch=function(u,o){ if(typeof u!=='string'||(o&&o.method&&o.method!=='GET')||!HOSTS.test(u)) return of.apply(window,arguments);
      var now=Date.now(), x=memo[u]; if(x&&now-x.t<60000) return x.p.then(function(r){ return r.clone() });
      Object.keys(memo).forEach(function(k){ if(now-memo[k].t>60000) delete memo[k] });
      var p=of.call(window,u,o); memo[u]={t:now,p:p}; p.then(function(r){ if(!r.ok) delete memo[u] },function(){ delete memo[u] }); return p.then(function(r){ return r.clone() }) } })();
  // ---- Parts of the app that load a moment after the map opens (tools, roads, winter mountains, AR) ----
  var __mods={}, MODV=3;
  function __mod(n,ctx,ids){ __mods[n]={ctx:ctx,ids:ids,p:null,done:false} }
  function __load(n){ var m=__mods[n]; if(!m||m.done) return Promise.resolve(); if(m.p) return m.p;
    m.p=new Promise(function(res){ var s=document.createElement('script'); s.src=n+'.js?v='+MODV; s.onload=function(){ res() }; s.onerror=function(){ m.p=null; s.remove(); res() }; document.head.appendChild(s) }); return m.p }
  window.__awm=function(n,f){ var m=__mods[n]; if(!m||m.done) return; m.done=true; try{ f(m.ctx) }catch(e){ if(window.console) console.error(e) } };
  document.addEventListener('click',function(e){ var t0=e.target; if(!t0||!t0.closest) return; for(var n in __mods){ var m=__mods[n]; if(m.done) continue; var t=t0.closest(m.ids); if(t){ e.preventDefault(); e.stopPropagation(); __load(n).then(function(){ if(__mods[n].done) setTimeout(function(){ t.click() },0) }); return } } },true);
  function __later(){ ['tools','roads','winter','ar'].reduce(function(p,n){ return p.then(function(){ return __load(n) }) },Promise.resolve()) }
  if(document.readyState==='complete') setTimeout(__later,1200); else window.addEventListener('load',function(){ setTimeout(__later,1200) });
  function nearPt(){ if(cfg2.nearRef==='map'&&typeof map!=='undefined'){ var c=map.getCenter(); return [c.lat,c.lng] } return [me.lat,me.lon] }
  function capN(v,d){ return v==='all'?(d||1e9):(+v||d||1e9) }
  function byNear(p){ return function(a,b){ return distNm(p[0],p[1],a.lat,a.lon)-distNm(p[0],p[1],b.lat,b.lon) } }
  try{var c2=JSON.parse(localStorage.getItem('sky-cfg2')||'{}'); Object.keys(cfg2).forEach(function(k){ if(c2&&typeof c2[k]==='string'&&/^[a-z0-9.]{1,10}$/i.test(c2[k])) cfg2[k]=c2[k] })}catch(e){}
  function saveCfg2(){ try{localStorage.setItem('sky-cfg2',JSON.stringify(cfg2))}catch(e){} }
  var refreshMs = 5000, timer = null, busy = false, radiusNm = 100, selected = null, planes = {}, trails = {}, lastData = [], failCount = 0;
  // Independent volunteer ADS-B networks. Each returns the same readsb-style JSON; results are merged by aircraft id.
  // FlyItalyADSB allows web pages to read it (free personal key). The others work only through a relay.
  var SOURCES = [
    {id:'FlyItalyADSB',needsKey:true,url:function(a,b,r){return 'https://api.flyitalyadsb.com/api/aircraft/v2/lat/'+a+'/lon/'+b+'/dist/'+r}},
    {id:'adsb.lol',url:function(a,b,r){return 'https://api.adsb.lol/v2/point/'+a+'/'+b+'/'+r}},
  ];
  var src = 0;

  L.Popup.prototype.options.autoPanPaddingTopLeft=L.point(16,110); L.Popup.prototype.options.autoPanPaddingBottomRight=L.point(66,70); L.GridLayer.prototype.options.keepBuffer=1; L.GridLayer.prototype.options.updateInterval=100;
  (function(){ try{ var nv=navigator, v=nv.vibrate&&nv.vibrate.bind(nv); if(v) nv.vibrate=function(p){ try{ if(nv.userActivation&&!nv.userActivation.hasBeenActive) return false; return v(p) }catch(e){ return false } } }catch(e){} })();
var map = L.map('map',{zoomControl:false,attributionControl:true,maxZoom:19,minZoom:2,preferCanvas:true,rotate:true,bearing:0,touchRotate:true,shiftKeyRotate:true,rotateControl:false}).setView([me.lat,me.lon],8);
  map.attributionControl.setPrefix('<b>AwareBC</b> © Josh Singer');
  (function(){ var ac=map.attributionControl.getContainer(), t=null; ac.title='Tap to read all credits'; L.DomEvent.disableClickPropagation(ac); ac.addEventListener('click',function(e){ if(e.target.closest('a')&&ac.classList.contains('open')) return; e.preventDefault(); ac.classList.toggle('open'); clearTimeout(t); if(ac.classList.contains('open')) t=setTimeout(function(){ ac.classList.remove('open') },8000) }) })();
  var tempEl=null, tempC=null, tcfg='C';
  try{var lt=JSON.parse(localStorage.getItem('sky-lasttemp')||'null'); if(lt&&Date.now()-lt.t<10800000) tempC=lt.c}catch(e){} // last temperature shows at once, fresh one replaces it
  try{var tv=localStorage.getItem('sky-temp'); if(tv==='F'||tv==='off') tcfg=tv}catch(e){}
  var TempCtl=L.Control.extend({options:{position:'bottomright'},onAdd:function(){var d=L.DomUtil.create('div','tempctl');d.setAttribute('aria-label','Current temperature');d.innerHTML='<b id="tval">--°</b><span id="tcap">now</span>';L.DomEvent.disableClickPropagation(d);tempEl=d;d.hidden=tcfg==='off';return d}});
  new TempCtl().addTo(map);
  function showTemp(){var v=document.getElementById('tval'),c=document.getElementById('tcap'); if(!v||!tempEl) return; tempEl.hidden=tcfg==='off'; if(tempC==null){v.textContent='--°';c.textContent='now';return} var t=tcfg==='F'?tempC*9/5+32:tempC; v.textContent=Math.round(t)+'°'; c.textContent=tcfg==='F'?'°F now':'°C now'}
  function loadTemp(){ if(tcfg==='off') return; fetch('https://api.open-meteo.com/v1/forecast?latitude='+me.lat.toFixed(3)+'&longitude='+me.lon.toFixed(3)+'&current=temperature_2m').then(function(r){return r.json()}).then(function(j){ if(j&&j.current&&typeof j.current.temperature_2m==='number'){tempC=j.current.temperature_2m;try{localStorage.setItem('sky-lasttemp',JSON.stringify({c:tempC,t:Date.now()}))}catch(e){}showTemp()} }).catch(function(){}) }
  setTimeout(function(){var sel=document.getElementById('ctemp'); if(sel){sel.value=tcfg; sel.onchange=function(){tcfg=sel.value;try{localStorage.setItem('sky-temp',tcfg)}catch(e){} showTemp(); if(tempC==null) loadTemp()}} showTemp(); loadTemp()},0);
  setInterval(loadTemp,600000);
  (function(){
    var K='sky-keys', cfg={lgwx:'1',lgalt:'1'}, els={lgwx:document.getElementById('wxlegend'),lgalt:document.getElementById('altlegend')};
    try{var r=JSON.parse(localStorage.getItem(K)||'{}');for(var k in cfg) if(r[k]!=null) cfg[k]=String(r[k])}catch(e){}
    Object.keys(cfg).forEach(function(id){
      var sel=document.getElementById(id); els[id].hidden=cfg[id]==='0'; sel.value=cfg[id];
      sel.onchange=function(){cfg[id]=sel.value;els[id].hidden=sel.value==='0';try{localStorage.setItem(K,JSON.stringify(cfg))}catch(e){}};
    });
  })();
  L.control.zoom({position:'bottomright'}).addTo(map);

  // Free tile sets that look like Google Maps. Real Google tiles need a paid key and are not allowed here.
  var ESRI='https://server.arcgisonline.com/ArcGIS/rest/services/';
  // Satellite at the sharpest detail Esri has for each spot: asks Esri's coverage map which zoom levels exist there,
  // and where the finest level is missing it enlarges the closest sharper-than-default level instead of showing a blank tile.
  var esriAvail={};
  function esriHas(z,y,x){ var r0=Math.floor(y/32)*32, c0=Math.floor(x/32)*32, k=z+'/'+r0+'/'+c0;
    if(!esriAvail[k]) esriAvail[k]=fetch(ESRI+'World_Imagery/MapServer/tilemap/'+z+'/'+r0+'/'+c0+'/32/32').then(function(r){return r.ok?r.json():null}).then(function(j){return j&&j.data&&j.data.length===1024&&!j.adjusted?j.data:null}).catch(function(){return null});
    return esriAvail[k].then(function(d){ return d?d[(y-r0)*32+(x-c0)]===1:true }) }
  function esriBest(c){ if(c.z<=17) return Promise.resolve(c.z); var z=c.z;
    function tryZ(){ if(z<=17) return Promise.resolve(17); var f=Math.pow(2,c.z-z); return esriHas(z,Math.floor(c.y/f),Math.floor(c.x/f)).then(function(ok){ if(ok) return z; z--; return tryZ() }) }
    return tryZ() }
  var EsriSmart=L.TileLayer.extend({ createTile:function(c,done){ var tile=document.createElement('div'), self=this, px=this.getTileSize().x;
    esriBest(c).then(function(z){ var f=Math.pow(2,c.z-z), ax=Math.floor(c.x/f), ay=Math.floor(c.y/f), img=document.createElement('img');
      img.alt=''; img.setAttribute('role','presentation'); img.decoding='async';
      img.style.cssText='position:absolute;max-width:none;width:'+(px*f)+'px;height:'+(px*f)+'px;left:'+(-(c.x-ax*f)*px)+'px;top:'+(-(c.y-ay*f)*px)+'px';
      img.onload=function(){done(null,tile)}; img.onerror=function(e){done(e,tile)};
      img.src=ESRI+'World_Imagery/MapServer/tile/'+z+'/'+ay+'/'+ax; tile.appendChild(img) });
    tile.style.clipPath='inset(0 -1px -1px 0)'; return tile } });
  var BASES={
    map:{sat:false,layers:function(){return [L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {maxZoom:19,maxNativeZoom:19,attribution:'Map © OpenStreetMap contributors · ADS-B: FlyItalyADSB (CC BY-SA 4.0), adsb.lol · Photos: Planespotters.net'})]}},
    sat:{sat:true,layers:function(){return [
      new EsriSmart(ESRI+'World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,maxNativeZoom:19,attribution:'Imagery © Esri, Maxar, Earthstar · ADS-B: FlyItalyADSB (CC BY-SA 4.0), adsb.lol · Photos: Planespotters.net'}),
      L.tileLayer(ESRI+'Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,maxNativeZoom:19,attribution:'Roads © Esri, HERE, Garmin'}),
      L.tileLayer(ESRI+'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,maxNativeZoom:17})]}},
    fsr:{sat:true,layers:function(){ return BASES.sat.layers() }},
    terrain:{sat:false,layers:function(){return [L.tileLayer(ESRI+'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {maxZoom:19,maxNativeZoom:17,attribution:'Map © Esri, USGS, NOAA · ADS-B: FlyItalyADSB (CC BY-SA 4.0), adsb.lol · Photos: Planespotters.net'})]}}
  };
  var baseLayers=[], baseKey='sat';
  function setBase(key){
    if(key!=='sat'&&key!=='fsr') key='sat'; // only Satellite and FSR are offered
    baseLayers.forEach(function(l){map.removeLayer(l)});
    baseLayers=BASES[key].layers();
    baseLayers.forEach(function(l){l.addTo(map)});
    baseKey=key; if(window.__fsr){ window.__fsr.set(true); window.__fsr.mode(key==='fsr') } if(baseLayers[0]&&baseLayers[0].getContainer) baseLayers[0].getContainer().classList.add('basel');
    document.getElementById('map').classList.toggle('sat',BASES[key].sat);
    Array.prototype.forEach.call(document.querySelectorAll('.seg button'),function(b){
      b.setAttribute('aria-pressed',b.getAttribute('data-b')===key?'true':'false');
    });
    try{localStorage.setItem('sky-base',key)}catch(e){}
  }
  Array.prototype.forEach.call(document.querySelectorAll('.seg button'),function(b){
    b.onclick=function(){setBase(b.getAttribute('data-b'))};
  });
  var savedBase='sat'; try{savedBase=localStorage.getItem('sky-base')||'sat'}catch(e){}
  setBase('sat');
  // Rivers & creeks on every map: BC Freshwater Atlas (names, zoomed in) + USGS National Hydrography
  (function(){ var wp=map.createPane('water',map._rotatePane||map.getPane('mapPane')); wp.style.zIndex=350; wp.style.pointerEvents='none';
    var BCB=L.latLngBounds([[48.2,-139.6],[60.1,-114]]), USB=L.latLngBounds([[24,-125.5],[48.99,-66]]);
    var HY='https://basemap.nationalmap.gov/arcgis/rest/services/USGSHydroCached/MapServer/tile/{z}/{y}/{x}';
    var lays=[L.tileLayer(HY,{pane:'water',maxZoom:12,maxNativeZoom:12,opacity:.95,attribution:'Rivers: USGS National Hydrography'}),
      L.tileLayer.wms('https://hydro.nationalmap.gov/arcgis/services/nhd/MapServer/WMSServer',{pane:'water',layers:'6',styles:'',format:'image/png',transparent:true,opacity:.85,minZoom:13,maxZoom:19,bounds:USB,attribution:'Creeks: USGS NHD'}),
      L.tileLayer.wms('https://openmaps.gov.bc.ca/geo/pub/wms',{pane:'water',layers:'pub:WHSE_BASEMAPPING.FWA_STREAM_NETWORKS_SP,pub:WHSE_BASEMAPPING.FWA_STREAM_NETWORKS_SP',styles:'1853,698',format:'image/png',transparent:true,opacity:.8,minZoom:13,maxZoom:19,bounds:BCB,attribution:'Creeks: BC Freshwater Atlas'})];
    function apply(){ var on=cfg2.water!=='0', k=parseFloat(cfg2.waterOp); if(!(k>0&&k<=1)) k=1; lays.forEach(function(l){ l.setOpacity((l._baseOp||(l._baseOp=l.options.opacity||1))*k); if(on&&!map.hasLayer(l)) l.addTo(map); if(!on&&map.hasLayer(l)) map.removeLayer(l) }) }
    window.__water=apply; apply() })();
  (function(){ var pin=null, last=0, tt=null, t0=null;
    function drop(ll,title){ var now=Date.now(); if(now-last<800) return; last=now; if(pin) map.removeLayer(pin);
      var la=ll.lat.toFixed(5), lo=ll.lng.toFixed(5);
      pin=L.marker(ll,{icon:L.divIcon({className:'gpspin',html:'📍',iconSize:[30,30],iconAnchor:[15,28]}),keyboard:false}).addTo(map);
      var d=document.createElement('div'); d.className='gpsq'; d.innerHTML='<b>'+(title?esc(title):'Pinned spot')+'</b><br><small>'+la+', '+lo+'</small><div class="gpsb"><button type="button" data-a="go">Directions</button><button type="button" data-a="rep" class="trrep">Report trail</button></div><button type="button" class="gpsx" data-a="no">Cancel</button>';
      d.onclick=function(e){ var a=e.target&&e.target.getAttribute('data-a'); if(a==='go'){ if(window.__nav) window.__nav.to(ll,title||'Pinned spot'); else window.open('https://www.google.com/maps/dir/?api=1&destination='+la+','+lo+'&travelmode=driving','_blank','noopener') } if(a){ map.removeLayer(pin); pin=null } };
      pin.bindPopup(d,{closeButton:false,offset:[0,-24],autoPanPadding:[20,60]}).openPopup();
      pin.on('popupclose',function(){ var p=pin; if(Date.now()-last<900){ setTimeout(function(){ if(p&&pin===p) p.openPopup() },30); return } setTimeout(function(){ if(p&&pin===p&&!p.isPopupOpen()){ map.removeLayer(p); pin=null } },50) }) }
    window.__pin=drop; map.on('contextmenu',function(e){ drop(e.latlng) });
    var mc=map.getContainer();
    mc.addEventListener('touchstart',function(e){ clearTimeout(tt); if(e.touches.length!==1){ t0=null; return } var t=e.touches[0]; t0=[t.clientX,t.clientY];
      if(e.target.closest&&e.target.closest('.leaflet-marker-icon,.leaflet-popup,.leaflet-control')) { t0=null; return }
      tt=setTimeout(function(){ if(!t0) return; var r=mc.getBoundingClientRect(); drop(map.containerPointToLatLng([t0[0]-r.left,t0[1]-r.top])) },650) },{passive:true});
    mc.addEventListener('touchmove',function(e){ var t=e.touches[0]; if(t0&&t&&Math.abs(t.clientX-t0[0])+Math.abs(t.clientY-t0[1])>10){ t0=null; clearTimeout(tt) } },{passive:true});
    ['touchend','touchcancel'].forEach(function(n){ mc.addEventListener(n,function(){ t0=null; clearTimeout(tt) },{passive:true}) });
  })();

  // Weather overlays from Environment and Climate Change Canada (GeoMet WMS, no key). Without a TIME value the server returns the latest frame.
  var GEOMET='https://geo.weather.gc.ca/geomet';
  var WX={
    rain:{layer:'RADAR_1KM_RRAI',opacity:.75,z:6,label:'Rain, mm/h',legend:GEOMET+'?version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=RADAR_1KM_RRAI&format=image/png&STYLE=RADARURPPRECIPR14-LINEAR'},
    snow:{layer:'RADAR_1KM_RSNO',opacity:.75,z:7,label:'Snow, cm/h',legend:GEOMET+'?version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=RADAR_1KM_RSNO&format=image/png'},
    cloud:{layer:'GOES-West_1km_NaturalColor',boost:1.8,blend:true,z:5,label:'Clouds (daytime)',legend:''}
  };
  // Weather is always on and read-only: rain, snow and cloud layers update by themselves.
  var wxLayers={}, wxOpacity=.5;
  function wxOp(k){return Math.min(1,wxOpacity*(WX[k].boost||1))}
  ['cloud','rain','snow'].forEach(function(k){
    var w=WX[k];
    wxLayers[k]=L.tileLayer.wms(GEOMET,{layers:w.layer,format:'image/png',transparent:true,version:'1.3.0',tileSize:512,zoomOffset:-1,updateWhenIdle:true,opacity:wxOp(k),zIndex:w.z,className:w.blend?'cloudblend':'',attribution:'Weather © Environment and Climate Change Canada'}).addTo(map);
  });
  (function(){var img=document.getElementById('wxlegimg');img.onerror=function(){img.hidden=true};img.loading='lazy';img.src=WX.rain.legend})();
  // New frames arrive every 6 to 10 minutes. A changing parameter makes the browser fetch fresh tiles.
  function refreshWx(){Object.keys(wxLayers).forEach(function(k){wxLayers[k].setParams({_ts:Date.now()})})}
  setInterval(refreshWx,300000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden) refreshWx()});
  // ---- Wider radar: US (NEXRAD, Iowa Mesonet) + Canada/US/Mexico/world (RainViewer), animated, no keys
  var IEM='https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913';
  var RVHOST='https://tilecache.rainviewer.com', rvPaths=[], rvStamp=0;
  var rcfg={src:'auto',loop:'1',op:'0.1',v:2};
  try{var rr=JSON.parse(localStorage.getItem('sky-radar')||'{}'); if(rr.src) rcfg.src=rr.src; if(rr.loop!=null) rcfg.loop=String(rr.loop); if(rr.op&&rr.v===2) rcfg.op=String(rr.op)}catch(e){}
  var RSTEPS=5, frames=[], cur=0, tmr=null, radOp=(+rcfg.op>0&&+rcfg.op<=1)?+rcfg.op:.1, wxTxt=document.getElementById('wxlegtxt'), baseTxt=wxTxt?wxTxt.textContent:'';
  function want(k){ var v=rcfg.src; if(k==='mx'&&v==='auto'){ var c=map.getCenter(); if(c.lat>24&&c.lat<58&&c.lng>-135&&c.lng<-52) return false } return v==='auto'||v===k }
  var lazyT=null;
  function mk(url,z,nat,attr){ return L.tileLayer(url,{opacity:0,zIndex:z,maxNativeZoom:nat,maxZoom:19,keepBuffer:1,updateWhenIdle:true,attribution:attr}) }
  function clearFrames(){ frames.forEach(function(f){ ['rv','iem'].forEach(function(k){ if(f[k]) map.removeLayer(f[k]) }) }); frames=[] }
  function buildFrame(st){ // st = steps of 10 minutes back from now
    var f={st:st}, b=Math.floor(Date.now()/300000);
    if(want('mx')&&rvPaths.length>st){ f.rv=mk(RVHOST+rvPaths[rvPaths.length-1-st]+'/256/{z}/{x}/{y}/2/1_1.png',4,7,'Radar: RainViewer'); f.rv.addTo(map) }
    if(want('us')){ f.iem=mk(IEM+(st?'-m'+(st*10<10?'0':'')+(st*10)+'m':'')+'/{z}/{x}/{y}.png?b='+b,5,10,'NOAA/IEM'); f.iem.addTo(map) }
    return f }
  function setFrame(i){ cur=i; frames.forEach(function(f,j){ ['rv','iem'].forEach(function(k){ if(f[k]) f[k].setOpacity(j===i?radOp:0) }) });
    if(wxTxt){ var st=frames[i]?frames[i].st:0; wxTxt.textContent=(rcfg.loop==='1'&&frames.length>1&&st)?('Radar · '+(st*10)+' min ago'):baseTxt } }
  function step(){ if(document.hidden||document.body.classList.contains('moving')||frames.length<2) return;
    var n=cur+1; if(n>=frames.length) n=0; setFrame(n); clearTimeout(tmr); tmr=setTimeout(step,n===frames.length-1?1800:650) }
  function applyRadar(){
    clearTimeout(tmr); clearFrames(); parked=false;
    ['rain','snow'].forEach(function(k){ var on=want('ca'); if(on&&!map.hasLayer(wxLayers[k])) wxLayers[k].addTo(map); if(!on&&map.hasLayer(wxLayers[k])) map.removeLayer(wxLayers[k]) });
    if(rcfg.src==='off'){ setFrame(0); return }
    clearTimeout(lazyT); frames.push(buildFrame(0)); setFrame(0); if(rcfg.loop!=='1') return;
    var stp=1; (function more(){ if(stp>=RSTEPS){ tmr=setTimeout(function(){ setFrame(0); tmr=setTimeout(step,650) },1500); return }
      if(document.hidden||parked||document.body.classList.contains('moving')){ lazyT=setTimeout(more,2000); return }
      frames.unshift(buildFrame(stp)); cur++; stp++; lazyT=setTimeout(more,1200) })();
  }
  function loadRV(force){ fetch('https://api.rainviewer.com/public/weather-maps.json').then(function(r){return r.json()}).then(function(j){
      var p=(j&&j.radar&&j.radar.past)||[]; if(!p.length){ if(force) applyRadar(); return } var t=p[p.length-1].time;
      if(t===rvStamp){ if(force) applyRadar(); return } rvStamp=t; rvPaths=p.map(function(x){return x.path}); applyRadar();
    }).catch(function(){ if(force) applyRadar() }) }
  var rvPark=false, rvResume=null;
  map.on('movestart zoomstart',function(){ clearTimeout(rvResume); if(frames.length<2) return; clearTimeout(tmr); frames.forEach(function(f,j){ if(j!==cur) ['rv','iem'].forEach(function(k){ if(f[k]&&map.hasLayer(f[k])) map.removeLayer(f[k]) }) }); rvPark=true });
  map.on('moveend',function(){ clearTimeout(rvResume); if(!rvPark) return; rvResume=setTimeout(function(){ rvPark=false; frames.forEach(function(f){ ['rv','iem'].forEach(function(k){ if(f[k]&&!map.hasLayer(f[k])) f[k].addTo(map) }) }); setFrame(cur); clearTimeout(tmr); if(frames.length>1&&rcfg.loop==='1') tmr=setTimeout(step,2500) },1500) });
  function radarTick(){ if(!document.hidden) loadRV(want('us')) }
  (function(){ var a=document.getElementById('radsrc'), b=document.getElementById('radloop'); if(!a||!b) return;
    a.value=rcfg.src; b.value=rcfg.loop;
    function save(){ try{localStorage.setItem('sky-radar',JSON.stringify(rcfg))}catch(e){} }
    a.onchange=function(){ rcfg.src=a.value; save(); applyRadar() };
    b.onchange=function(){ rcfg.loop=b.value; save(); applyRadar() };
    var c=document.getElementById('radop'); if(c){ c.value=rcfg.op; c.onchange=function(){ rcfg.op=c.value; radOp=+c.value||.1; save(); setFrame(cur); rainOp() } }
  })();
  function rainOp(){ ['rain','snow'].forEach(function(k){ if(wxLayers[k]) wxLayers[k].setOpacity(Math.min(1,radOp*(WX[k].boost||1))) }) }
  rainOp();
  setTimeout(function(){ loadRV(true) },4000); setInterval(radarTick,300000);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden){ loadRV(); if(frames.length>1){ clearTimeout(tmr); tmr=setTimeout(step,650) } } });
  map.on('moveend zoomend',function(){ if(frames.length>1){ clearTimeout(tmr); tmr=setTimeout(step,900) } });
  // While you pan or zoom, keep only the visible radar frame loaded; the rest return when you stop
  var parked=false, parkT=null;
  function parkRadar(){ if(parked||frames.length<2) return; parked=true; clearTimeout(tmr); frames.forEach(function(f,j){ if(j!==cur) ['rv','iem'].forEach(function(k){ if(f[k]) map.removeLayer(f[k]) }) }) }
  function unparkRadar(){ if(!parked) return; parked=false; frames.forEach(function(f,j){ if(j!==cur) ['rv','iem'].forEach(function(k){ if(f[k]) f[k].addTo(map) }) }); clearTimeout(tmr); tmr=setTimeout(step,1200) }
  map.on('zoomstart movestart',function(){ clearTimeout(parkT); parkRadar(); });
  map.on('zoomstart',function(){ document.body.classList.add('zooming') });
  map.on('zoomend',function(){ document.body.classList.remove('zooming'); document.body.classList.toggle('far',map.getZoom()<6) });
  map.on('moveend zoomend',function(){ clearTimeout(parkT); parkT=setTimeout(unparkRadar,1500) });
  map.whenReady(function(){ document.body.classList.toggle('far',map.getZoom()<6) });
  [].forEach.call(document.querySelectorAll('#fsheet details.folder'),function(d){ d.addEventListener('toggle',function(){ document.querySelector('#fsheet .sheet').classList.toggle('fopen',!!document.querySelector('#fsheet details.folder[open]')) }) });
  // Day / night map theme (Auto follows the sun at your location)
  var themeMode='day';
  try{var tmv=localStorage.getItem('sky-theme'); if(tmv==='day'||tmv==='night'||tmv==='auto') themeMode=tmv}catch(e){}
  function sunAlt(lat,lon,t){var D=Math.PI/180,n=t/86400000+2440587.5-2451545.0,Lm=(280.46+0.9856474*n)%360,g=((357.528+0.9856003*n)%360)*D,lam=(Lm+1.915*Math.sin(g)+0.02*Math.sin(2*g))*D,eps=23.439*D,dec=Math.asin(Math.sin(eps)*Math.sin(lam)),ra=Math.atan2(Math.cos(eps)*Math.sin(lam),Math.cos(lam)),gm=(18.697374558+24.06570982441908*n)%24,ha=(gm*15+lon)*D-ra;return Math.asin(Math.sin(lat*D)*Math.sin(dec)+Math.cos(lat*D)*Math.cos(dec)*Math.cos(ha))/D}
  function applyTheme(){var night=themeMode==='night'||(themeMode==='auto'&&sunAlt(me.lat,me.lon,Date.now())<-1); document.getElementById('map').classList.toggle('night',night)}
  (function(){var sel=document.getElementById('maptheme'); if(sel){sel.value=themeMode; sel.onchange=function(){themeMode=sel.value;try{localStorage.setItem('sky-theme',themeMode)}catch(e){} applyTheme()}} })();
  applyTheme(); setInterval(applyTheme,300000);
  // one Settings folder open at a time so the sheet stays on one screen
  [].forEach.call(document.querySelectorAll('#fsheet details.folder'),function(d){ d.addEventListener('toggle',function(){ if(d.open) [].forEach.call(document.querySelectorAll('#fsheet details.folder'),function(o){ if(o!==d) o.open=false }) }) });

  // Location dot with a soft red halo
  var meMark = L.marker([me.lat,me.lon],{icon:L.divIcon({className:'me',html:'<i></i><b></b>',iconSize:[34,34],iconAnchor:[17,17]}),interactive:false,keyboard:false,zIndexOffset:-500}).addTo(map);
  // My spot icon: the red dot or a car, pickup, SUV or quad seen from above (it turns to face the way you're going), in your colour
  var ME_IC=(function(){ function w(y1,y2){ return '<rect x="-1.5" y="'+y1+'" width="3" height="7" rx="1.2" fill="#111"/><rect x="18.5" y="'+y1+'" width="3" height="7" rx="1.2" fill="#111"/><rect x="-1.5" y="'+y2+'" width="3" height="7" rx="1.2" fill="#111"/><rect x="18.5" y="'+y2+'" width="3" height="7" rx="1.2" fill="#111"/>' }
    var G='#1d2733', S=' stroke="#fff" stroke-width="1.6"';
    return { car:function(c){ return '<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="translate(10,3)">'+w(6,22)+'<rect width="20" height="34" rx="7" fill="'+c+'"'+S+'/><path d="M3 10Q10 6 17 10L16 14Q10 12 4 14Z" fill="'+G+'"/><path d="M4 25Q10 27 16 25L17 29Q10 31 3 29Z" fill="'+G+'"/><rect x="4" y="15" width="12" height="9" rx="2" fill="rgba(255,255,255,.25)"/></g></svg>' },
      truck:function(c){ return '<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="translate(10,1)">'+w(5,26)+'<rect width="20" height="38" rx="5" fill="'+c+'"'+S+'/><path d="M3 8Q10 5 17 8L16 12Q10 10.5 4 12Z" fill="'+G+'"/><rect x="3" y="13" width="14" height="5" rx="1.5" fill="rgba(255,255,255,.25)"/><rect x="2.5" y="20" width="15" height="16" rx="1.5" fill="rgba(0,0,0,.35)" stroke="rgba(255,255,255,.5)"/></g></svg>' },
      suv:function(c){ return '<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="translate(10,2)">'+w(5,24)+'<rect width="20" height="36" rx="5" fill="'+c+'"'+S+'/><path d="M3 8Q10 5 17 8L16 12Q10 10.5 4 12Z" fill="'+G+'"/><rect x="3.5" y="13" width="13" height="17" rx="2" fill="rgba(255,255,255,.22)"/><path d="M4 17H16M4 22H16M4 27H16" stroke="rgba(0,0,0,.4)" stroke-width="1.2"/><path d="M4 31.5H16L15 34H5Z" fill="'+G+'"/></g></svg>' },
      atv:function(c){ return '<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="translate(9,4)"><rect x="-2" y="2" width="5" height="9" rx="2" fill="#111"/><rect x="19" y="2" width="5" height="9" rx="2" fill="#111"/><rect x="-2" y="21" width="5" height="9" rx="2" fill="#111"/><rect x="19" y="21" width="5" height="9" rx="2" fill="#111"/><path d="M4 3H18L19 13L16 16V26L18 30H4L6 26V16L3 13Z" fill="'+c+'"'+S+'/><rect x="2" y="7" width="18" height="2" rx="1" fill="#222"/><ellipse cx="11" cy="20" rx="3.5" ry="6" fill="'+G+'"/></g></svg>' } } })();
  var ME_K=[['dot','Dot'],['car','Car'],['truck','Truck'],['suv','SUV'],['atv','Quad']], ME_C=['#ff3b30','#2f80ed','#27ae60','#f2c94c','#f2f2f2','#222222'], meSt={k:'dot',c:'#ff3b30'};
  try{ var ms=JSON.parse(localStorage.getItem('sky-meicon')||'null'); if(ms&&ME_K.some(function(x){ return x[0]===ms.k })) meSt.k=ms.k; if(ms&&ME_C.indexOf(ms.c)>=0) meSt.c=ms.c }catch(e){}
  function meDraw(){ var el=meMark.getElement(); if(!el) return; var v=meSt.k!=='dot'&&ME_IC[meSt.k], i=el.querySelector('i'); el.classList.toggle('veh',!!v); el.style.setProperty('--mc',meSt.c); if(i) i.innerHTML=v?v(meSt.c):'' }
  meDraw();
  (function(){ var bi=document.getElementById('meicons'), bc=document.getElementById('mecols'); if(!bi||!bc) return;
    function dotSvg(c){ return '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="15" fill="'+c+'" opacity=".25"/><circle cx="20" cy="20" r="8" fill="'+c+'"/><circle cx="20" cy="20" r="3.5" fill="#fff"/></svg>' }
    function paint(){ bi.innerHTML=ME_K.map(function(k){ return '<button type="button" data-k="'+k[0]+'" aria-label="'+k[1]+'" aria-pressed="'+(meSt.k===k[0])+'">'+(k[0]==='dot'?dotSvg(meSt.c):ME_IC[k[0]](meSt.c))+'</button>' }).join('');
      bc.innerHTML=ME_C.map(function(c){ return '<button type="button" class="mc" data-c="'+c+'" aria-label="Colour '+c+'" aria-pressed="'+(meSt.c===c)+'" style="background:'+c+'"></button>' }).join('') }
    function save(){ try{ localStorage.setItem('sky-meicon',JSON.stringify(meSt)) }catch(e){} paint(); meDraw() }
    bi.onclick=function(e){ var b=e.target.closest('button'); if(b){ meSt.k=b.getAttribute('data-k'); save() } };
    bc.onclick=function(e){ var b=e.target.closest('button'); if(b){ meSt.c=b.getAttribute('data-c'); save() } };
    paint() })();
  var meHalo = {setLatLng:function(){return meHalo}};
  var ring = L.circle([me.lat,me.lon],{radius:radiusNm*1852,color:'#ff3b30',weight:1.5,opacity:.6,fill:false,dashArray:'5 7',interactive:false}).addTo(map);

  function syncLabels(){document.getElementById('map').classList.toggle('nolabels',map.getZoom()<7)}
  map.on('zoomend',syncLabels);
  function syncRing(){var el=ring.getElement&&ring.getElement(); if(el) el.style.display=map.getZoom()>=10?'none':''}
  map.on('zoomend',syncRing); map.whenReady(syncRing);
  map.on('movestart zoomstart',function(){document.body.classList.add('moving')});
  map.on('moveend zoomend',function(){document.body.classList.remove('moving')});
  var pre={}, preT=0;
  function preloadNear(){
    if(navigator.connection&&navigator.connection.saveData) return;
    var z=map.getZoom(); if(z!==Math.round(z)) return;
    var bb=map.getBounds().pad(.3), n=0, cnt=0; for(var k in pre) cnt++; if(cnt>1500) pre={};
    [z+1,z-1].forEach(function(zz){
      n=0;
      if(zz<map.getMinZoom()||zz>map.getMaxZoom()) return;
      baseLayers.forEach(function(lay){
        if(!lay.getTileUrl||!map.hasLayer(lay)) return;
        var nz=Math.min(zz,lay.options.maxNativeZoom||zz), sz=1<<nz;
        var nw=map.project(bb.getNorthWest(),nz).divideBy(256).floor(), se=map.project(bb.getSouthEast(),nz).divideBy(256).floor();
        for(var x=nw.x;x<=se.x&&n<48;x++) for(var y=nw.y;y<=se.y&&n<48;y++){
          if(y<0||y>=sz) continue;
          var u=lay.getTileUrl({x:((x%sz)+sz)%sz,y:y,z:nz}); if(pre[u]) continue; pre[u]=1; n++; (new Image()).src=u;
        }
      });
    });
  }
  function schedulePreload(){clearTimeout(preT); preT=setTimeout(preloadNear,1800)}
  map.on('moveend zoomend',schedulePreload); map.whenReady(function(){setTimeout(preloadNear,1500)});
  // ---- Plain-English names ----
  var AIRLINES={ACA:'Air Canada',ROU:'Air Canada Rouge',JZA:'Jazz (Air Canada Express)',WJA:'WestJet',WEN:'WestJet Encore',WSW:'Swoop',POE:'Porter',FLE:'Flair',SWG:'Sunwing',TSC:'Air Transat',CJT:'Cargojet',PCO:'Pacific Coastal',KFA:'Kelowna Flightcraft',HAL:'Hawaiian',AAL:'American',DAL:'Delta',UAL:'United',SWA:'Southwest',ASA:'Alaska Airlines',QXE:'Horizon Air',SKW:'SkyWest',JBU:'JetBlue',NKS:'Spirit',FFT:'Frontier',AAY:'Allegiant',EDV:'Endeavor Air',RPA:'Republic',ENY:'Envoy',GJS:'GoJet',SCX:'Sun Country',FDX:'FedEx',UPS:'UPS',GTI:'Atlas Air',ABX:'ABX Air',KAL:'Korean Air',AAR:'Asiana',ANA:'All Nippon',JAL:'Japan Airlines',CPA:'Cathay Pacific',CAL:'China Airlines',EVA:'EVA Air',CCA:'Air China',CES:'China Eastern',CSN:'China Southern',UAE:'Emirates',QTR:'Qatar Airways',ETD:'Etihad',BAW:'British Airways',AFR:'Air France',DLH:'Lufthansa',KLM:'KLM',VIR:'Virgin Atlantic',SAS:'SAS',FIN:'Finnair',ICE:'Icelandair',THY:'Turkish Airlines',QFA:'Qantas',ANZ:'Air New Zealand',AMX:'Aeromexico',VOI:'Volaris',AVA:'Avianca',LAN:'LATAM',EJA:'NetJets',LXJ:'Flexjet',CFC:'Canadian Forces',RCH:'US Air Force Mobility'};
  var TYPES={B737:'Boeing 737',B738:'Boeing 737-800',B739:'Boeing 737-900',B37M:'Boeing 737 MAX 7',B38M:'Boeing 737 MAX 8',B39M:'Boeing 737 MAX 9',B752:'Boeing 757-200',B753:'Boeing 757-300',B762:'Boeing 767-200',B763:'Boeing 767-300',B764:'Boeing 767-400',B772:'Boeing 777-200',B77L:'Boeing 777-200LR',B77W:'Boeing 777-300ER',B788:'Boeing 787-8',B789:'Boeing 787-9',B78X:'Boeing 787-10',B744:'Boeing 747-400',B748:'Boeing 747-8',A318:'Airbus A318',A319:'Airbus A319',A320:'Airbus A320',A321:'Airbus A321',A19N:'Airbus A319neo',A20N:'Airbus A320neo',A21N:'Airbus A321neo',A332:'Airbus A330-200',A333:'Airbus A330-300',A339:'Airbus A330-900',A359:'Airbus A350-900',A35K:'Airbus A350-1000',A388:'Airbus A380',BCS1:'Airbus A220-100',BCS3:'Airbus A220-300',E170:'Embraer 170',E75L:'Embraer 175',E75S:'Embraer 175',E190:'Embraer 190',E195:'Embraer 195',CRJ2:'Bombardier CRJ-200',CRJ7:'Bombardier CRJ-700',CRJ9:'Bombardier CRJ-900',CRJX:'Bombardier CRJ-1000',DH8A:'Dash 8-100',DH8B:'Dash 8-200',DH8C:'Dash 8-300',DH8D:'Dash 8 Q400',AT72:'ATR 72',AT76:'ATR 72-600',DHC2:'DHC-2 Beaver',DHC3:'DHC-3 Otter',DHC6:'DHC-6 Twin Otter',C172:'Cessna 172',C182:'Cessna 182',C206:'Cessna 206',C208:'Cessna Caravan',PC12:'Pilatus PC-12',PA28:'Piper Cherokee',BE20:'King Air 200',B350:'King Air 350',GLF4:'Gulfstream IV',GLF5:'Gulfstream V',GLEX:'Bombardier Global Express',CL60:'Challenger 600',C56X:'Citation Excel',R44:'Robinson R44',B06:'Bell 206',C130:'Lockheed C-130 Hercules',C17:'Boeing C-17 Globemaster',K35R:'Boeing KC-135',P8:'Boeing P-8 Poseidon'};
  function airlineOf(p){var m=/^([A-Z]{3})\d/.exec((p.flight||'').trim()), r=(typeof routes==='object'&&routes)?routes[(p.flight||'').trim().toUpperCase()]:null;return (r&&r.al&&r.al.n)||(m&&AIRLINES[m[1]])||''}
  function typeName(p){
    if(p.t&&TYPES[p.t]) return TYPES[p.t];
    if(p.desc) return p.desc.split(' ').map(function(w){return /\d/.test(w)?w:w.charAt(0)+w.slice(1).toLowerCase()}).join(' ');
    return p.t||'';
  }

  // ---- Units: aviation (ft, kt, nm) or metric (m, km/h, km) ----
  var units='av', radiusIdx=2, RADII={av:[25,50,100,150],metric:[50,100,200,300]};
  try{units=localStorage.getItem('sky-units')==='metric'?'metric':'av'; var ri=parseInt(localStorage.getItem('sky-radius'),10); if(ri>=0&&ri<4) radiusIdx=ri}catch(e){}
  function altUnit(){return units==='av'?'ft':'m'}
  function spdUnit(){return units==='av'?'kt':'km/h'}
  function distUnit(){return units==='av'?'nm':'km'}
  function uAlt(a){if(a==='ground')return 'GND';if(a==null)return '—';return units==='av'?Math.round(a).toLocaleString():(Math.round(a*0.3048/10)*10).toLocaleString()}
  function uSpd(g){return g==null?'—':(units==='av'?Math.round(g):Math.round(g*1.852)).toLocaleString()}
  function uDist(nm,dec){var v=units==='av'?nm:nm*1.852;return dec?v.toFixed(dec):String(Math.round(v))}
  function uVs(f){return units==='av'?Math.abs(f).toLocaleString()+' ft/min':(Math.abs(f)*0.00508).toFixed(1)+' m/s'}
  function buildRadius(){
    var sel=document.getElementById('radius');
    sel.innerHTML=RADII[units].map(function(v,i){return '<option value="'+i+'">'+v+' '+distUnit()+'</option>'}).join('');
    sel.value=String(radiusIdx);
    radiusNm=units==='av'?RADII.av[radiusIdx]:RADII.metric[radiusIdx]/1.852;
  }
  function applyUnits(){
    document.getElementById('lgtitle').textContent='Altitude '+altUnit();
    document.getElementById('lgmax').textContent=units==='av'?'40k+':'12k+';
    document.getElementById('units').value=units;
    buildRadius();
  }

  // ---- Closest approach, worked out from position, speed and heading ----
  function cpaText(p){
    if(p.gs==null||p.track==null||p.gs<40||p.alt_baro==='ground') return '';
    var dx=(p.lon-me.lon)*60*Math.cos(me.lat*Math.PI/180), dy=(p.lat-me.lat)*60;
    var vx=p.gs*Math.sin(p.track*Math.PI/180), vy=p.gs*Math.cos(p.track*Math.PI/180);
    var t=-(dx*vx+dy*vy)/(vx*vx+vy*vy);
    if(t<=0) return 'Moving away from you';
    var mins=Math.round(t*60); if(mins>120) return '';
    var cx=dx+vx*t, cy=dy+vy*t, d=Math.sqrt(cx*cx+cy*cy);
    var when=mins<1?'under a minute':(mins===1?'1 min':mins+' min');
    return d>30?'Passes about '+uDist(d)+' '+distUnit()+' from you in '+when:'Closest to you in '+when+' · '+uDist(d,1)+' '+distUnit()+' away';
  }

  function altColor(alt){
    if(alt==='ground'||alt==null) return '#5f6368';
    var t=Math.max(0,Math.min(1,alt/40000));
    var stops=['#0f9d58','#f4b400','#f57c00','#d93025','#7b1fa2'];
    return stops[Math.min(4,Math.floor(t*4.999))];
  }
  function icon(p){
    var c=altColor(p.alt_baro), sel=p.hex===selected, s=sel?34:26, H=44, off=(H-s)/2;
    var svg='<svg class="plane" style="position:absolute;left:'+off+'px;top:'+off+'px;transform:rotate(calc('+(p.track||0)+'deg - var(--bearing,0deg)))" width="'+s+'" height="'+s+'" viewBox="0 0 24 24">'+
      (sel?'<circle cx="12" cy="12" r="11.2" fill="rgba(255,59,48,.2)" stroke="#ff3b30" stroke-width="1"/>':(fireTag(p)?'<circle cx="12" cy="12" r="11" fill="rgba(255,122,0,.18)" stroke="#ff7a00" stroke-width="1.6" stroke-dasharray="3 2"/>':''))+
      '<path transform="'+(sel?'translate(3.6 3.6) scale(.7)':'')+'" d="M12 2c.8 0 1.3.9 1.3 2v5.2l7.7 4.6v2l-7.7-2.3v4.4l2.2 1.7V21L12 20l-3.5 1v-1.4l2.2-1.7v-4.4L3 15.8v-2l7.7-4.6V4c0-1.1.5-2 1.3-2z" fill="'+c+'" stroke="'+pcol(p.hex)+'" stroke-width="'+(sel?2.2:2)+'" stroke-linejoin="round" paint-order="stroke"/></svg>';
    var alt=p.alt_baro==='ground'?'GND':(p.alt_baro==null?'':uAlt(p.alt_baro)+' '+altUnit());
    var lbl='<div class="lbl'+(sel?' sel':'')+'" style="left:'+(H/2+s/2+1)+'px"><b>'+esc(name(p))+'</b><i>'+alt+'</i></div>';
    return L.divIcon({html:svg+lbl,className:'mk',iconSize:[H,H],iconAnchor:[H/2,H/2]});
  }
  function distNm(a,b,c,d){
    var R=3440.065,toR=Math.PI/180,dLat=(c-a)*toR,dLon=(d-b)*toR;
    var h=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(a*toR)*Math.cos(c*toR)*Math.sin(dLon/2)*Math.sin(dLon/2);
    return 2*R*Math.asin(Math.sqrt(h));
  }
  function name(p){return (p.flight||'').trim()||p.r||p.hex.toUpperCase()}
  function fmtAlt(a){return uAlt(a)}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  // ---- Routes: where each plane came from and where it is going (adsbdb.com, no key), cached on this phone
  var routes={}, rpend={}, rq=[], rbusy=0, routeMode='sel', rl={}, rsave=null, rdraw=null;
  try{routes=JSON.parse(localStorage.getItem('sky-routes')||'{}')||{}}catch(e){routes={}}
  try{var rmv=localStorage.getItem('sky-routemode'); if(rmv==='sel'||rmv==='off') routeMode=rmv}catch(e){}
  var pc={}, pcn=0; function pcol(h){h=String(h||''); if(!pc[h]){ pc[h]='hsl('+Math.round((pcn++*137.508)%360)+',88%,50%)' } return pc[h]}
  function csOf(p){return (p.flight||'').trim().toUpperCase()}
  function routeOf(p){var r=routes[csOf(p)];return r&&r.v?r.v:null}
  function routeText(p){var r=routeOf(p);return r?r.o.c+' → '+r.d.c:''}
  function saveRoutes(){clearTimeout(rsave);rsave=setTimeout(function(){
    var k=Object.keys(routes); if(k.length>500){k.sort(function(x,y){return routes[x].t-routes[y].t}).slice(0,k.length-400).forEach(function(c){delete routes[c]})}
    try{localStorage.setItem('sky-routes',JSON.stringify(routes))}catch(e){}},3000)}
  function needRoute(p){var cs=csOf(p); if(!cs||rpend[cs]) return; var r=routes[cs]; if(r&&Date.now()-r.t<(r.v?28800000:1800000)) return;
    if(rq.length>60) return; rpend[cs]=1; if(p.hex===selected) rq.unshift(cs); else rq.push(cs); pumpRoutes()}
  function ap(a){return a&&a.latitude!=null&&a.longitude!=null?{c:a.iata_code||a.icao_code||'?',n:a.municipality||a.name||'',la:a.latitude,lo:a.longitude}:null}
  function pumpRoutes(){
    while(rbusy<2&&rq.length){
      (function(cs){ rbusy++;
        fetch('https://api.adsbdb.com/v0/callsign/'+encodeURIComponent(cs)).then(function(r){return r.ok?r.json():null}).then(function(j){
          var f=j&&j.response&&j.response.flightroute, o=f&&ap(f.origin), d=f&&ap(f.destination);
          var al=f&&f.airline; routes[cs]={t:Date.now(),v:(o&&d)?{o:o,d:d}:0,al:(al&&al.name)?{n:al.name,i:al.icao||'',a:al.iata||'',c:al.country||'',k:al.callsign||''}:0};
        }).catch(function(){routes[cs]={t:Date.now(),v:0}}).then(function(){
          rbusy--; delete rpend[cs]; saveRoutes(); clearTimeout(rdraw); rdraw=setTimeout(function(){render(lastData)},400); setTimeout(pumpRoutes,250);
        });
      })(rq.shift());
    }
  }
  function gc(a,b,n){var D=Math.PI/180,la1=a[0]*D,lo1=a[1]*D,la2=b[0]*D,lo2=b[1]*D,d=2*Math.asin(Math.sqrt(Math.pow(Math.sin((la2-la1)/2),2)+Math.cos(la1)*Math.cos(la2)*Math.pow(Math.sin((lo2-lo1)/2),2)));
    if(!(d>1e-6)) return [a,b]; var out=[];
    for(var i=0;i<=n;i++){var f=i/n,A=Math.sin((1-f)*d)/Math.sin(d),B=Math.sin(f*d)/Math.sin(d),
      x=A*Math.cos(la1)*Math.cos(lo1)+B*Math.cos(la2)*Math.cos(lo2),y=A*Math.cos(la1)*Math.sin(lo1)+B*Math.cos(la2)*Math.sin(lo2),z=A*Math.sin(la1)+B*Math.sin(la2);
      out.push([Math.atan2(z,Math.sqrt(x*x+y*y))/D,Math.atan2(y,x)/D])}
    return out}
  function chip(ll,txt,col){return L.marker(ll,{icon:L.divIcon({className:'',html:'<span class="apchip" style="background:'+col+'">'+esc(txt)+'</span>',iconSize:[0,0]}),interactive:false,keyboard:false,zIndexOffset:-200}).addTo(map)}
  function dropRoute(h){var x=rl[h]; if(!x) return; map.removeLayer(x.past); map.removeLayer(x.fut); if(x.cp){map.removeLayer(x.cp);map.removeLayer(x.cf)} if(x.chips) x.chips.forEach(function(c){map.removeLayer(c)}); delete rl[h]}
  // keep a route in one piece when it crosses the date line, on the same world copy as the plane
  function unwrapLL(a,i,lon){ for(var k=1;k<a.length;k++){ while(a[k][1]-a[k-1][1]>180) a[k][1]-=360; while(a[k][1]-a[k-1][1]<-180) a[k][1]+=360 } var sh=Math.round((lon-a[i][1])/360)*360; if(sh) a.forEach(function(q){ q[1]+=sh }); return a }
  function drawRoute(p,show,full){
    var h=p.hex, r=show&&p.alt_baro!=='ground'?routeOf(p):null;
    if(r){ var tot=distNm(r.o.la,r.o.lo,r.d.la,r.d.lo); if(distNm(r.o.la,r.o.lo,p.lat,p.lon)+distNm(p.lat,p.lon,r.d.la,r.d.lo)>tot*1.5+60) r=null }
    if(!r){dropRoute(h);return}
    var col=pcol(h), sel=h===selected, x=rl[h];
    if(!x) x=rl[h]={past:L.polyline([],{color:col,weight:2,opacity:.5,interactive:false}).addTo(map),fut:L.polyline([],{color:col,weight:2.6,opacity:.95,dashArray:'7 7',interactive:false}).addTo(map)};
    var fut=unwrapLL(gc([p.lat,p.lon],[r.d.la,r.d.lo],sel?64:20),0,p.lon), pst=full?unwrapLL(gc([r.o.la,r.o.lo],[p.lat,p.lon],sel?64:12),sel?64:12,p.lon):[];
    if(sel&&!x.cp){ x.cp=L.polyline([],{color:'#fff',weight:9,opacity:.85,lineCap:'round',lineJoin:'round',interactive:false}).addTo(map); x.cf=L.polyline([],{color:'#fff',weight:9,opacity:.6,lineCap:'round',lineJoin:'round',interactive:false}).addTo(map); x.cp.bringToBack(); x.cf.bringToBack(); x.past.bringToFront(); x.fut.bringToFront() }
    if(!sel&&x.cp){ map.removeLayer(x.cp); map.removeLayer(x.cf); x.cp=x.cf=null }
    if(x.cp){ x.cp.setLatLngs(pst); x.cf.setLatLngs(fut) }
    x.full=pst.concat(fut);
    if(full){ x.past.setLatLngs(pst); x.fut.setLatLngs(fut) }
    else { var rem=distNm(p.lat,p.lon,r.d.la,r.d.lo), k=Math.max(1,Math.min(20,Math.ceil(20*Math.min(1,25/Math.max(rem,1))))); x.past.setLatLngs([]); x.fut.setLatLngs(fut.slice(0,k+1)) }
    x.past.setStyle({weight:sel?5:2,opacity:sel?.95:.5,lineCap:'round'}); x.fut.setStyle({weight:sel?5:2.6,opacity:full?.95:.6,dashArray:sel?'10 8':'7 7'});
    if(sel&&!x.chips) x.chips=[chip([r.o.la,r.o.lo],r.o.c,col),chip([r.d.la,r.d.lo],r.d.c,col)];
    if(!sel&&x.chips){x.chips.forEach(function(c){map.removeLayer(c)});x.chips=null}
  }
  var lastKey={}, maxPlanes=10;
  try{var mpv=parseInt(localStorage.getItem('sky-maxplanes'),10); if(mpv>=5&&mpv<=300) maxPlanes=mpv}catch(e){}
  // Planes keep moving between feed updates: each one is carried forward along its heading at its real speed.
  var motion={}, mLast=0;
  function mPos(m,now){ if(!m||!m.gs||m.trk==null||m.gnd) return m?[m.lat,m.lon]:[0,0]; var dt=Math.min(60,Math.max(0,(now-m.t)/1000)), d=m.gs*0.5144*dt, t=m.trk*Math.PI/180;
    return [m.lat+d*Math.cos(t)/111320, m.lon+d*Math.sin(t)/(111320*Math.cos(m.lat*Math.PI/180))] }
  function motionTick(all){ var any=false; for(var q in motion){ any=true; break } if(!any) return; try{ motionTick0(all) }catch(e){} }
  function motionTick0(all){ if(document.hidden||document.body.classList.contains('zooming')||document.body.classList.contains('moving')) return; mLast++;
    var n=0; for(var k in planes) n++; if(all!==true&&n>60&&(mLast&1)) return;
    var t=Date.now(), vb=map.getBounds().pad(0.15); for(var h in planes){ var m=motion[h]; if(m&&m.gs&&!m.gnd){ var ll=mPos(m,t); if(all===true||h===selected||vb.contains(ll)) planes[h].setLatLng(ll) } } }
  setInterval(motionTick,100); map.on('moveend zoomend',function(){ motionTick(true) });
  function render(list){
    var seen={}, c=map.getCenter(), vb=map.getBounds().pad(0.25), arr=[];
    list.forEach(function(p){ if(p.lat==null||p.lon==null) return; p._d=(p.lat-c.lat)*(p.lat-c.lat)+(p.lon-c.lng)*(p.lon-c.lng)*0.45; arr.push(p) });
    arr.sort(function(a,b){return a._d-b._d}); if(arr.length>maxPlanes){ var keep=arr.slice(0,maxPlanes); if(selected&&!keep.some(function(q){return q.hex===selected})){ var sp=arr.filter(function(q){return q.hex===selected})[0]; if(sp) keep.push(sp) } arr=keep }
    arr.forEach(function(p,idx){
      seen[p.hex]=1; try{
      var ll=[p.lat,p.lon], inView=vb.contains(ll)||p.hex===selected;
      var ag=age(p); motion[p.hex]={lat:p.lat,lon:p.lon,t:Date.now()-(ag<60?ag*1000:0),gs:p.gs,trk:p.track,gnd:p.alt_baro==='ground'};
      var t=trails[p.hex]; if(!t) t=trails[p.hex]={pts:[],line:null,casing:null};
      var last=t.pts[t.pts.length-1];
      if(!last||last[0]!==p.lat||last[1]!==p.lon){t.pts.push(ll);if(t.pts.length>(p.hex===selected?1500:60))t.pts.shift();}
      var sel=p.hex===selected;
      if(inView&&t.pts.length>1){
        if(!t.line) t.line=L.polyline([],{color:pcol(p.hex),weight:3,opacity:.95,lineCap:'round',lineJoin:'round',interactive:false}).addTo(map);
        t.line.setLatLngs(t.pts).setStyle({weight:sel?5:3});
        if(sel&&!t.casing) t.casing=L.polyline([],{color:'#ffffff',weight:8,opacity:.85,lineCap:'round',lineJoin:'round',interactive:false}).addTo(map).bringToBack();
        if(t.casing){ if(sel) t.casing.setLatLngs(t.pts); else {map.removeLayer(t.casing);t.casing=null} }
      }else if(t.line&&!inView){map.removeLayer(t.line);t.line=null; if(t.casing){map.removeLayer(t.casing);t.casing=null}}
      if(sel&&routeMode!=='off') needRoute(p);
      drawRoute(p,routeMode==='off'?false:(routeMode==='sel'?sel:(inView&&(map.getZoom()>=6||sel))),sel||routeMode==='all'||(routeMode==='near'&&idx<5));
      var key=[Math.round((p.track||0)/3),altColor(p.alt_baro),sel?1:0,fireTag(p)?1:0,name(p),p.alt_baro==='ground'?'g':(p.alt_baro==null?'':uAlt(p.alt_baro)),units].join('|');
      if(planes[p.hex]){ planes[p.hex].setLatLng(mPos(motion[p.hex],Date.now())); if(lastKey[p.hex]!==key){planes[p.hex].setIcon(icon(p));lastKey[p.hex]=key} }
      else{
        planes[p.hex]=L.marker(mPos(motion[p.hex],Date.now()),{icon:icon(p),keyboard:true,title:name(p)}).addTo(map)
          .on('click',(function(h){return function(){select(h)}})(p.hex)); lastKey[p.hex]=key;
      }
      }catch(e){ try{console.warn('plane',p.hex,e)}catch(_){} }
    });
    Object.keys(planes).forEach(function(h){
      if(!seen[h]){map.removeLayer(planes[h]);delete planes[h];delete lastKey[h];delete motion[h];dropRoute(h);if(trails[h]){if(trails[h].line)map.removeLayer(trails[h].line);if(trails[h].casing)map.removeLayer(trails[h].casing);delete trails[h];}}
    });
    if(selected&&!seen[selected]) selected=null;
    renderDock();
  }
  (function(){var mp=document.getElementById('maxpl'); if(mp){ if(!mp.querySelector('[value="'+maxPlanes+'"]')){var o=document.createElement('option');o.value=maxPlanes;o.textContent='Closest '+maxPlanes;mp.appendChild(o)} mp.value=String(maxPlanes); mp.onchange=function(){maxPlanes=+mp.value;try{localStorage.setItem('sky-maxplanes',mp.value)}catch(e){} render(lastData); if(lastData.length) setStat('<em>'+Math.min(lastData.length,maxPlanes)+(Math.min(lastData.length,maxPlanes)===1?' plane':' planes')+'</em><br>'+new Date().toLocaleTimeString([], {hour12:true,hour:'numeric',minute:'2-digit',second:'2-digit'}))} }})();
  (function(){var sel=document.getElementById('routemode'); if(!sel) return; sel.value=routeMode; sel.onchange=function(){routeMode=sel.value;try{localStorage.setItem('sky-routemode',routeMode)}catch(e){} render(lastData)}})();

  var photos={};
  function getPhoto(p){
    var h=p.hex, c=photos[h];
    if(c!==undefined) return c||null;
    photos[h]=null;
    var look=function(u){return fetch(u).then(function(r){return r.ok?r.json():{}}).then(function(j){var x=j&&j.photos&&j.photos[0];return x?{src:(x.thumbnail_large||x.thumbnail||{}).src,link:x.link,by:x.photographer}:null}).catch(function(){return null})};
    look('https://api.planespotters.net/pub/photos/hex/'+encodeURIComponent(h)).then(function(a){return a&&a.src?a:(p.r?look('https://api.planespotters.net/pub/photos/reg/'+encodeURIComponent(p.r)):null)}).then(function(a){if(a&&a.src){photos[h]=a;if(selected===h)renderDock()}});
    return null;
  }
  // ---- Flight data helpers: phase, arrival estimate, cockpit and aircraft details ----
  var dtab='ov', dockHex=null;
  function vrate(p){return p.baro_rate!=null?p.baro_rate:(p.geom_rate!=null?p.geom_rate:null)}
  function phase(p){
    if(p.alt_baro==='ground') return (p.gs||0)>40?'Taking off / landing roll':'On the ground';
    var a=p.alt_baro, v=vrate(p)||0; if(a==null) return 'Airborne';
    if(v>400) return a<10000?'Departure climb':'Climbing';
    if(v<-400) return a<4000?'Final approach':(a<12000?'Approach':'Descending');
    return a>=18000?'Cruise':'Level flight';
  }
  function fmtDur(m){m=Math.max(1,Math.round(m));return m<60?m+' min':Math.floor(m/60)+' h '+(m%60)+' min'}
  function etaText(p){
    var r=routeOf(p); if(!r||p.alt_baro==='ground'||!p.gs||p.gs<80) return '';
    var tot=distNm(r.o.la,r.o.lo,r.d.la,r.d.lo), rem=distNm(p.lat,p.lon,r.d.la,r.d.lo);
    if(distNm(r.o.la,r.o.lo,p.lat,p.lon)+rem>tot*1.5+60) return '';
    var mins=rem/p.gs*60+(rem>60?9:(rem>15?4:1)), at=new Date(Date.now()+mins*60000);
    return 'Lands at '+r.d.c+' in about '+fmtDur(mins)+' · ~'+at.toLocaleTimeString([], {hour12:true,hour:'numeric',minute:'2-digit'})+' your time';
  }
  var CATS={A1:'Light plane',A2:'Small plane',A3:'Large jet',A4:'B757-size jet',A5:'Heavy jet',A6:'High performance',A7:'Helicopter',B1:'Glider',B2:'Balloon',B3:'Skydiver',B4:'Ultralight',B6:'Drone',B7:'Space vehicle',C1:'Emergency vehicle',C2:'Service vehicle',C3:'Obstacle'};
  var SQ={'7700':'Emergency','7600':'Radio failure','7500':'Hijack','1200':'VFR','7000':'VFR','2000':'No code assigned'};
  var EMG={general:'General emergency',lifeguard:'Medical flight',minfuel:'Low fuel',nordo:'Radio failure',unlawful:'Unlawful interference',downed:'Aircraft down'};
  var MODES={autopilot:'AP',vnav:'VNAV',lnav:'LNAV',althold:'ALT HOLD',approach:'APP',tcas:'TCAS'};
  var NACP={11:'±3 m',10:'±10 m',9:'±30 m',8:'±93 m',7:'±185 m',6:'±556 m',5:'±926 m'};
  function cell(l,v){return '<div><small>'+esc(l)+'</small><span>'+esc(v==null||v===''?'—':v)+'</span></div>'}
  function cockpitHtml(p){
    var v=vrate(p), cells=[
      ['Phase',phase(p).replace('Departure climb','Climb out')],
      ['Vert. speed',v==null?'—':(v>0?'▲':v<0?'▼':'')+uVs(v)],
      ['AP altitude',p.nav_altitude_mcp!=null?uAlt(Math.round(p.nav_altitude_mcp/100)*100)+' '+altUnit():(p.nav_altitude_fms!=null?uAlt(Math.round(p.nav_altitude_fms/100)*100)+' '+altUnit():'—')],
      ['AP heading',p.nav_heading!=null?Math.round(p.nav_heading)+'°':'—'],
      ['AP modes',p.nav_modes&&p.nav_modes.length?p.nav_modes.map(function(m){return MODES[m]||m}).join(' '):'—'],
      ['Altimeter',p.nav_qnh!=null?Math.round(p.nav_qnh)+' hPa':'—'],
      ['Squawk',p.squawk?p.squawk+(SQ[p.squawk]?' '+SQ[p.squawk]:''):'—'],
      ['Category',CATS[p.category]||p.category||'—']];
    if(p.ias!=null) cells.push(['Airspeed (IAS)',Math.round(p.ias)+' kt']); if(p.tas!=null) cells.push(['True airspeed',Math.round(p.tas)+' kt']);
    if(p.mach!=null) cells.push(['Mach',Number(p.mach).toFixed(2)]); if(p.oat!=null) cells.push(['Outside temp',Math.round(p.oat)+'°C']);
    if(p.ws!=null&&p.wd!=null) cells.push(['Wind aloft',Math.round(p.wd)+'° '+Math.round(p.ws)+' kt']);
    if(cells.length>8){ cells=cells.filter(function(c){return c[1]!=='—'}).slice(0,8) }
    while(cells.length%4) cells.push(['','']);
    var sig=[(p.seen!=null?'seen '+Math.round(p.seen)+'s ago':''),(p.messages?p.messages.toLocaleString()+' msgs':''),(NACP[p.nac_p]?'position '+NACP[p.nac_p]:''),(p.version!=null?'ADS-B v'+p.version:(p.type||'')),((p.dbFlags&1)?'military':''),(p.emergency&&p.emergency!=='none'?(EMG[p.emergency]||p.emergency):'')].filter(Boolean).join(' · ');
    return '<div class="grid g8">'+cells.map(function(c){return c[0]?cell(c[0],c[1]):'<div style="visibility:hidden"></div>'}).join('')+'</div><div class="meta">'+esc(sig||'Live broadcast data')+'</div>';
  }
  var acdb={}, acPend={}, acSave=null; try{acdb=JSON.parse(localStorage.getItem('sky-acdb')||'{}')||{}}catch(e){acdb={}}
  function acRec(h){ var r=acdb[h]; if(r&&Date.now()-r.t<(r.v?604800000:86400000)) return r.v; if(acPend[h]) return r?r.v:null; acPend[h]=1;
    fetch('https://api.adsbdb.com/v0/aircraft/'+encodeURIComponent(h)).then(function(x){return x.ok?x.json():null}).then(function(j){ var a=j&&j.response&&j.response.aircraft;
      acdb[h]={t:Date.now(),v:a?{ty:a.type||'',it:a.icao_type||'',mf:a.manufacturer||'',rg:a.registration||'',ow:a.registered_owner||'',cn:a.registered_owner_country_name||'',fl:a.registered_owner_operator_flag_code||''}:0} })
      .catch(function(){acdb[h]={t:Date.now(),v:0}}).then(function(){ delete acPend[h]; clearTimeout(acSave); acSave=setTimeout(function(){ var k=Object.keys(acdb); if(k.length>400) k.sort(function(x,y){return acdb[x].t-acdb[y].t}).slice(0,k.length-300).forEach(function(c){delete acdb[c]}); try{localStorage.setItem('sky-acdb',JSON.stringify(acdb))}catch(e){} },2000); if(selected===h) renderDock() });
    return r?r.v:null }
  function aircraftHtml(p){
    var a=acRec(p.hex), rt=routes[csOf(p)], al=rt&&rt.al;
    var html='<div class="grid g8">'+cell('Registration',p.r||(a&&a.rg)||'')+cell('Type code',p.t||(a&&a.it)||'')+cell('Maker',a?(a.mf||''):(a===0?((typeName(p)&&typeName(p)!==p.t)?typeName(p).split(' ')[0]:''):'…'))+cell('Mode-S hex',String(p.hex||'').toUpperCase())+'</div>';
    var lines=[];
    if(a){ if(a.ty) lines.push('Model: <b>'+esc([a.mf,a.ty].filter(Boolean).join(' '))+'</b>'+(typeName(p)?' ('+esc(typeName(p))+')':''));
      if(a.ow) lines.push('Owner / operator: <b>'+esc(a.ow)+'</b>'); if(a.cn) lines.push('Registered in: <b>'+esc(a.cn)+'</b>'+(a.fl?' · operator code '+esc(a.fl):'')); }
    else if(a===null) lines.push('Looking up the aircraft record…'); else { if(typeName(p)) lines.push('Model: <b>'+esc(typeName(p))+'</b>'); lines.push('Owner not listed in the free aircraft database'); }
    if(al) lines.push('Airline: <b>'+esc(al.n)+'</b>'+esc([al.i&&al.a?' ('+al.i+' / '+al.a+')':(al.i?' ('+al.i+')':''),al.c?' · '+al.c:'',al.k?' · radio "'+al.k+'"':''].join('')));
    else if(airlineOf(p)) lines.push('Airline: <b>'+esc(airlineOf(p))+'</b>');
    return html+lines.slice(0,4).map(function(l){return '<div class="meta">'+l+'</div>'}).join('');
  }
  // ---- Emergency alerts: squawk 7700/7600/7500 or an emergency flag anywhere in range ----
  var emSeen={}, emCur=null;
  function emOf(p){ if(p.emergency&&p.emergency!=='none'&&EMG[p.emergency]) return EMG[p.emergency]; return {'7700':'Emergency (7700)','7600':'Radio failure (7600)','7500':'Hijack code (7500)'}[p.squawk]||'' }
  function checkAlerts(){ var el=document.getElementById('emerg'); if(!el) return; if(cfg2.emShow==='0'){el.hidden=true;emCur=null;return} var hit=null;
    (lastData||[]).forEach(function(p){ var e=emOf(p); if(e&&!emSeen[p.hex]&&!hit) hit={p:p,e:e} });
    if(!hit){el.hidden=true;emCur=null;return}
    emCur=hit.p.hex; document.getElementById('emtxt').textContent='⚠ '+name(hit.p)+' · '+hit.e+' · '+uDist(distNm(me.lat,me.lon,hit.p.lat,hit.p.lon))+' '+distUnit()+' away';
    el.hidden=false; }
  (function(){ var el=document.getElementById('emerg'); if(!el) return; el.onclick=function(e){ if(e.target.id==='emx'){emSeen[emCur]=1;checkAlerts();return} if(emCur) select(emCur,true) } })();
  // ---- Sky right now: airlines, aircraft types and alerts around you ----
  function openSky(){
    var list=(lastData||[]).filter(function(p){return planes[p.hex]}), groups={}, types={}, nAir=0, nGa=0, nMil=0, nEm=0;
    list.forEach(function(p){ var cs=(p.flight||'').trim(), m=/^([A-Z]{3})\d/.exec(cs), al=airlineOf(p);
      if(p.dbFlags&1) nMil++; if(emOf(p)) nEm++;
      if(m){ nAir++; var k=al||m[1]; var g=groups[k]||(groups[k]={n:k,c:0,t:{},code:m[1]}); g.c++; if(p.t) g.t[p.t]=(g.t[p.t]||0)+1 } else nGa++;
      if(p.t) types[p.t]=(types[p.t]||0)+1 });
    var gl=Object.keys(groups).map(function(k){return groups[k]}).sort(function(x,y){return y.c-x.c});
    var top=function(o,n){return Object.keys(o).sort(function(x,y){return o[y]-o[x]}).slice(0,n)};
    var h='<div class="skysum"><span><b>'+list.length+'</b> planes</span><span><b>'+nAir+'</b> airline</span><span><b>'+nGa+'</b> private / other</span>'+(nMil?'<span><b>'+nMil+'</b> military</span>':'')+'<span'+(nEm?' style="background:#c62828;color:#fff"':'')+'><b'+(nEm?' style="color:#fff"':'')+'>'+nEm+'</b> emergencies</span></div>';
    h+=gl.slice(0,6).map(function(g){ return '<div class="alrow"><b>'+esc(g.n===g.code?g.code:g.n+' ('+g.code+')')+'</b><em>'+g.c+'</em><small>'+esc(top(g.t,3).map(function(t){return (TYPES[t]||t)+(g.t[t]>1?' ×'+g.t[t]:'')}).join(', ')||'type unknown')+'</small></div>' }).join('');
    if(gl.length>6) h+='<div class="skynote">+ '+(gl.length-6)+' more airlines</div>';
    if(!gl.length) h+='<div class="skynote">No airline flights on the map right now.</div>';
    var tt=top(types,4); if(tt.length) h+='<div class="skynote">Most common: '+esc(tt.map(function(t){return t+' ×'+types[t]}).join(' · '))+'</div>';
    h+='<div class="skynote">Counts the planes shown on your map. Tap Settings for feeds and limits.</div>';
    document.getElementById('skybody').innerHTML=h; document.getElementById('skysheet').hidden=false;
  }
  // ---- Next overhead: the plane that will pass closest to you in the next 30 minutes, with an optional buzz ----
  var nxAlert=false, nxBuzzed={}, nxCur=null, nxNone=false, nxHideT=null; try{nxAlert=localStorage.getItem('sky-ovalert')==='1'}catch(e){}
  function nextOver(){ var best=null, now=Date.now(), k=Math.cos(me.lat*Math.PI/180);
    (lastData||[]).forEach(function(p){ if(p.alt_baro==='ground'||p.gs==null||p.track==null||p.gs<60) return;
      var pos=mPos(motion[p.hex]||{lat:p.lat,lon:p.lon},now), dx=(pos[1]-me.lon)*60*k, dy=(pos[0]-me.lat)*60, vx=p.gs*Math.sin(p.track*Math.PI/180), vy=p.gs*Math.cos(p.track*Math.PI/180);
      var t=-(dx*vx+dy*vy)/(vx*vx+vy*vy), now0=Math.sqrt(dx*dx+dy*dy); if(t<0){ if(now0>3) return; t=0 }
      var mins=t*60; if(mins>(+cfg2.ovMins||30)) return; var cx=dx+vx*t, cy=dy+vy*t, d=Math.sqrt(cx*cx+cy*cy); if(d>15) return;
      var sc=d+mins*0.15; if(!best||sc<best.s) best={p:p,mins:mins,d:d,s:sc} });
    return best }
  function updateNext(){ var el=document.getElementById('nextov'); if(!el) return; if(cfg2.ovShow==='0'){el.hidden=true;nxCur=null;return} var em=document.getElementById('emerg');
    el.style.top=(em&&!em.hidden)?(em.offsetTop+em.offsetHeight+6)+'px':'';
    var b=nextOver(), tx=document.getElementById('nxtxt');
    if(!lastData||!lastData.length){el.hidden=true;return}
    if(!b){ nxCur=null; if(!nxNone){ nxNone=true; tx.innerHTML='<span class="l1">No planes heading over you soon</span><small>Checks the next '+cfg2.ovMins+' minutes</small>'; el.hidden=false; clearTimeout(nxHideT); nxHideT=setTimeout(function(){ if(nxNone) el.hidden=true },3000) } return }
    nxNone=false; clearTimeout(nxHideT); el.hidden=false;
    var p=b.p, alt=p.alt_baro!=null&&p.alt_baro!=='ground'?p.alt_baro:0, up=Math.round(Math.atan((alt/6076)/Math.max(b.d,0.05))*180/Math.PI);
    var when=b.mins<0.5?'over you now':'over you in '+(b.mins<1.5?'1 min':Math.round(b.mins)+' min');
    nxCur=p.hex;
    tx.innerHTML='<span class="l1"><b>'+esc(name(p))+'</b> '+esc(when)+'</span><small>'+esc([p.t||typeName(p),uDist(b.d,1)+' '+distUnit()+' away',alt?uAlt(alt)+' '+altUnit():'',up>0?up+'° up':''].filter(Boolean).join(' · '))+'</small>';
    if(nxAlert&&b.mins<=2&&b.d<=(+cfg2.ovDist||3)&&!nxBuzzed[p.hex]){ nxBuzzed[p.hex]=Date.now(); try{navigator.vibrate&&navigator.vibrate([250,120,250])}catch(e){} el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash') }
  }
  (function(){ var el=document.getElementById('nextov'), bell=document.getElementById('nxbell'); if(!el||!bell) return;
    function paint(){ bell.textContent=nxAlert?'🔔':'🔕'; bell.classList.toggle('on',nxAlert); bell.setAttribute('aria-pressed',String(nxAlert)) } paint();
    bell.onclick=function(e){ e.stopPropagation(); nxAlert=!nxAlert; try{localStorage.setItem('sky-ovalert',nxAlert?'1':'0')}catch(err){} if(nxAlert){try{navigator.vibrate&&navigator.vibrate(60)}catch(err){}} paint() };
    el.onclick=function(){ if(nxCur) select(nxCur,true) };
    el.onkeydown=function(e){ if((e.key==='Enter'||e.key===' ')&&nxCur){e.preventDefault();select(nxCur,true)} };
    setInterval(function(){ if(!document.hidden) updateNext() },5000);
  })();
  function renderDock(){
    checkAlerts(); updateNext(); if(aptSel&&aptTab==='board'&&!document.getElementById('aptsheet').hidden) aptRender();
    var body=document.getElementById('dbody'), dock=document.getElementById('dock');
    var p=lastData.filter(function(x){return x.hex===selected})[0];
    dock.hidden=!p;
    if(p){
      var d=distNm(me.lat,me.lon,p.lat,p.lon), cs=(p.flight||'').trim();
      var vs=p.baro_rate?(p.baro_rate>0?'▲ ':'▼ ')+uVs(p.baro_rate):'level';
      var who=[airlineOf(p),typeName(p)].filter(Boolean).join(' · ')||'Unknown aircraft';
      var rtx=routeText(p), more=[rtx,p.r,p.squawk?'squawk '+p.squawk:''].filter(Boolean).join(' · ');
      var near=cpaText(p), ph=getPhoto(p); if(ph&&!/^https:\/\//.test(ph.src||'')) ph=null; var phHtml=ph?'<a class="ph" href="'+esc(/^https:\/\//.test(ph.link||'')?ph.link:'https://www.planespotters.net/')+'" target="_blank" rel="noopener" aria-label="Photo on Planespotters.net"><img src="'+esc(ph.src)+'" alt="Photo of '+esc(name(p))+'" decoding="async" class="phimg"><i>'+esc(ph.by?'Photo: '+ph.by:'Planespotters.net')+'</i></a>':'';
      if(dockHex!==p.hex){dockHex=p.hex;dtab=cfg2.dtab;dock.classList.remove('dmin')}
      var tabs='<div class="dtabs" role="tablist">'+[['ov','Overview'],['ck','Cockpit'],['ac','Aircraft']].map(function(t){return '<button role="tab" data-t="'+t[0]+'" aria-selected="'+(dtab===t[0])+'"'+(dtab===t[0]?' class="on"':'')+'>'+t[1]+'</button>'}).join('')+'</div>';
      var head='<div class="card'+(ph?' hasph':'')+'"><div class="cs">'+esc(name(p))+'</div><span class="cbtns"><button class="close v3btn" id="rtb" aria-label="Show the whole route on the map" aria-pressed="'+(dock.classList.contains('dmin')?'true':'false')+'">'+(dock.classList.contains('dmin')?'▴':'🗺')+'</button><button class="close v3btn" id="v3b" aria-label="3D view from this plane">3D</button><button class="close" id="cl" aria-label="Close">✕</button></span>'+
        phHtml+'<div class="meta m1" style="color:var(--fg)">'+esc(who)+'</div>'+(function(){ var ft=fireTag(p); return ft?'<div class="meta m1 fireline">🔥 '+esc(ft.text)+'</div>':'' })()+(more?'<div class="meta m1">'+esc(more)+'</div>':'');
      var bodyHtml;
      if(dtab==='ck') bodyHtml=cockpitHtml(p);
      else if(dtab==='ac') bodyHtml=aircraftHtml(p);
      else { var eta=etaText(p);
        bodyHtml='<div class="grid"><div><small>Altitude '+altUnit()+'</small><span>'+uAlt(p.alt_baro)+'</span></div>'+
        '<div><small>Speed '+spdUnit()+'</small><span>'+uSpd(p.gs)+'</span></div>'+
        '<div><small>Heading</small><span>'+(p.track!=null?Math.round(p.track)+'°':'—')+'</span></div>'+
        '<div><small>From you</small><span>'+uDist(d,1)+' '+distUnit()+'</span></div></div>'+
        '<div class="meta">'+esc(phase(p))+' · '+vs+'</div>'+(eta?'<div class="meta" style="color:var(--fg)">'+esc(eta)+'</div>':'')+(near?'<div class="meta" style="color:var(--fg)">'+esc(near)+'</div>':''); }
      var html=head+tabs+bodyHtml+'</div>';
      if(body._h!==html||!body.firstChild){body.innerHTML=html;body._h=html}
      var clb=document.getElementById('cl'); if(clb) clb.onclick=function(){select(null)}; var v3b=document.getElementById('v3b'); if(v3b) v3b.onclick=function(){ V3D.open(p.hex) };
      var rtb=document.getElementById('rtb'); if(rtb) rtb.onclick=function(){ var mini=!dock.classList.contains('dmin'); dock.classList.toggle('dmin',mini); body._h=''; renderDock();
        if(mini){ var x=rl[p.hex], tr=trails[p.hex], pts=(x&&x.full&&x.full.length?x.full:[]).concat(tr&&tr.pts?tr.pts:[]); if(!pts.length&&planes[p.hex]) pts=[planes[p.hex].getLatLng()];
          if(pts.length){ var b=L.latLngBounds(pts); if(planes[p.hex]) b.extend(planes[p.hex].getLatLng()); var hgt=dock.getBoundingClientRect().height||140; map.fitBounds(b,{paddingTopLeft:[24,130],paddingBottomRight:[70,hgt+24],maxZoom:11}) } } };
      [].forEach.call(body.querySelectorAll('.dtabs button'),function(bt){bt.onclick=function(){dtab=bt.getAttribute('data-t');renderDock()}});
      if(dtab==='ac') acRec(p.hex);
      return;
    }
    body.innerHTML='';body._h='';
  }

  function select(h,pan){
    selected=h;
    render(lastData);
    if(h&&pan&&planes[h]) map.panTo(planes[h].getLatLng());
  }
  // Tapping near a plane picks the closest one within a thumb's width, tapping empty map clears the selection.
  map.on('click',function(e){
    var best=null,bd=36;
    Object.keys(planes).forEach(function(h){
      var d=map.latLngToContainerPoint(planes[h].getLatLng()).distanceTo(e.containerPoint);
      if(d<bd){bd=d;best=h}
    });
    select(best);
  });

  // Compass: the dial turns with the map. Smoothing keeps the needle steady while two fingers rotate the map.
  var dialEl=document.getElementById('dial'), hdgEl=document.getElementById('hdg'), mapEl=document.getElementById('map');
  var tau=55, shown=0, lastT=performance.now(), lastDeg=null, lastTxt='', resetting=false;
  function wrap(a){return ((a+180)%360+360)%360-180}
  function compassTick(){
    var b=map.getBearing?map.getBearing():0; if(typeof b!=='number'||b!==b) b=0;
    var now=performance.now(), dt=Math.min(100,now-lastT); lastT=now;
    var d=wrap(b-shown); shown=Math.abs(d)<0.05?b:shown+d*(1-Math.exp(-dt/tau));
    var deg=Math.round(shown*10)/10;
    if(deg!==lastDeg){lastDeg=deg;dialEl.setAttribute('transform','rotate('+(-deg)+' 36 36)')}
    var n=((Math.round(b)%360)+360)%360, t=('00'+n).slice(-3)+'°';
    if(t!==lastTxt){lastTxt=t;hdgEl.textContent=t;mapEl.style.setProperty('--bearing',b+'deg')}
    if(Math.abs(wrap(b-shown))>0.05) requestAnimationFrame(compassTick); else cRun=false;
  }
  var cRun=false; function cKick(){ if(cRun) return; cRun=true; lastT=performance.now(); requestAnimationFrame(compassTick) }
  function resetNorth(){
    if(!map.setBearing||resetting) return;
    var b0=wrap(map.getBearing()), t0=performance.now(), dur=350;
    if(Math.abs(b0)<0.5){map.setBearing(0);return}
    resetting=true; mapEl.parentNode.classList.remove('glide');
    (function step(now){
      var k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,3);
      map.setBearing(b0*(1-e));
      if(k<1) requestAnimationFrame(step); else {map.setBearing(0);resetting=false;mapEl.parentNode.classList.add('glide')}
    })(t0);
  }
  document.getElementById('compass').onclick=resetNorth;
  // planes keep pointing the way they fly: update the angle the instant the map turns (touch twist, tap-to-north, anything)
  function syncBearing(){var bb=map.getBearing?map.getBearing():0; if(typeof bb==='number'&&bb===bb) mapEl.style.setProperty('--bearing',bb+'deg')}
  map.on('rotate',syncBearing); syncBearing();
  (function(){
    var K='sky-compass', cfg={cread:'1',cshow:'1',cspin:'55'};
    try{var r=JSON.parse(localStorage.getItem(K)||'{}');for(var k in cfg) if(r[k]!=null) cfg[k]=String(r[k])}catch(e){}
    function apply(){
      document.getElementById('compass').hidden=cfg.cshow==='0';
      hdgEl.hidden=cfg.cread==='0';
      tau=+cfg.cspin||55;
    }
    ['cread','cshow','cspin'].forEach(function(id){
      var el=document.getElementById(id); el.value=cfg[id];
      el.onchange=function(){cfg[id]=el.value;try{localStorage.setItem(K,JSON.stringify(cfg))}catch(e){}apply()};
    });
    document.getElementById('cnorth').onclick=resetNorth;
    apply();
  })();
  cKick(); map.on('rotate',cKick); setInterval(cKick,1000);

  function setStat(text,err){
    var st=document.getElementById('stat'); st.innerHTML='<i class="live'+(err?' err':'')+'"></i>'+text; st.classList.toggle('bad',!!err);
  }

  function age(p){return p.seen_pos!=null?p.seen_pos:(p.seen!=null?p.seen:99)}
  function merge(lists){
    var byHex={};
    lists.forEach(function(list){
      list.forEach(function(p){
        if(!p||typeof p!=='object'||!/^~?[0-9a-f]{6}$/i.test(String(p.hex||''))) return;
        if(typeof p.lat!=='number'||typeof p.lon!=='number'||!isFinite(p.lat)||!isFinite(p.lon)||Math.abs(p.lat)>90||Math.abs(p.lon)>180) return;
        ['gs','track','baro_rate','geom_rate','alt_geom','nav_heading','nav_altitude_mcp','nav_altitude_fms','nav_qnh','ias','tas','mach','oat','wd','ws','seen','messages'].forEach(function(k){if(p[k]!=null&&(typeof p[k]!=='number'||!isFinite(p[k]))) delete p[k]});
        if(p.alt_baro!=null&&p.alt_baro!=='ground'&&(typeof p.alt_baro!=='number'||!isFinite(p.alt_baro))) delete p.alt_baro;
        ['flight','r','t','squawk','category','emergency','desc','type'].forEach(function(k){if(p[k]!=null) p[k]=String(p[k]).slice(0,40)});
        if(p.nav_modes!=null&&!Array.isArray(p.nav_modes)) delete p.nav_modes;
        var old=Object.prototype.hasOwnProperty.call(byHex,p.hex)?byHex[p.hex]:null;
        if(!old){byHex[p.hex]=p;return}
        var win=age(p)<age(old)?p:old, lose=win===p?old:p;
        Object.keys(lose).forEach(function(k){if(k!=='__proto__'&&k!=='constructor'&&k!=='prototype'&&win[k]==null&&lose[k]!=null)win[k]=lose[k]});
        byHex[p.hex]=win;
      });
    });
    return Object.keys(byHex).map(function(h){return byHex[h]});
  }
  // Optional relay: a small server you own that adds the permission header browsers require. Empty means call the feeds directly.
  var relay='', apiKey='';
  // Personal FlyItalyADSB key, used until you paste a different one on the Feeds screen. Empty in the website build.
  var DEFAULT_KEY='';
  try{relay=localStorage.getItem('sky-relay')||'';apiKey=localStorage.getItem('sky-key')||''}catch(e){}
  var DEFAULT_RELAY='https://skyrelay.aware-bc.workers.dev/'; if(relay&&/^https:\/\/skyrelay\.[a-z0-9-]+\.workers\.dev\/?$/i.test(relay)&&relay!==DEFAULT_RELAY){ relay=DEFAULT_RELAY; try{ localStorage.setItem('sky-relay',relay) }catch(e){} } // the server address moved
  if(!relay||!/^https:\/\//i.test(relay)) relay=DEFAULT_RELAY;
  try{var qrl=new URLSearchParams(location.search).get('relay'); if(qrl&&/^https:\/\/[a-z0-9.-]+(:\d+)?(\/[\w\-./]*)?$/i.test(qrl)&&qrl.length<200){ if(confirm('Use this relay for flight data?\n\n'+qrl+'\n\nOnly say OK if you set this relay up yourself. A relay sees which area of the map you are viewing.')){relay=qrl;localStorage.setItem('sky-relay',qrl)} history.replaceState(null,'',location.pathname) }}catch(e){}
  if(!apiKey) apiKey=DEFAULT_KEY;
  function active(){return SOURCES.filter(function(s){return s.needsKey?!!apiKey:!!relay})}
  function viaRelay(u){return relay?relay+(relay.indexOf('?')>-1?'&':'?')+'u='+encodeURIComponent(u):u}
  function query(){
    var c=map.getCenter(), b=map.getBounds(), view=distNm(c.lat,c.lng,b.getNorthEast().lat,b.getNorthEast().lng), home=distNm(me.lat,me.lon,c.lat,c.lng)<5;
    var r=Math.max(view,home?radiusNm:0); r=Math.max(25,Math.min(250,Math.ceil(r)));
    return {lat:(home?me.lat:c.lat).toFixed(4),lon:(home?me.lon:c.lng).toFixed(4),r:r};
  }
  function fetchSource(s){
    var Q=query(), u=s.url(Q.lat,Q.lon,Q.r);
    return fetch(s.needsKey?u:viaRelay(u),s.needsKey?{headers:{'X-Api-Key':apiKey}}:undefined)
      .then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
      .then(function(j){return {ok:true,ac:j.ac||j.aircraft||[]}})
      .catch(function(e){return {ok:false,err:e&&e.message}});
  }
  function showWelcome(mode){
    var w=document.getElementById('welcome'); if(!w) return;
    if(!mode){w.hidden=true;return}
    var T={setup:['Welcome to AwareBC','To see live planes the app needs a free flight-feed key. It takes about a minute.','Set up feeds'],
      error:['Can\u2019t reach the feeds','Check your connection, or open Settings to fix your key.','Open Settings'],
      empty:['No planes nearby','Nothing in range right now. Zoom out, or raise the search radius in Settings.','']}[mode];
    document.getElementById('wtitle').textContent=T[0]; document.getElementById('wtext').textContent=T[1];
    var b=document.getElementById('wbtn'); b.textContent=T[2]; b.onclick=function(){openSheet()};
    w.className='welcome'+(mode==='empty'?' soft':''); w.hidden=false;
  }
  function poll(){
    if(busy||document.hidden) return schedule();
    if(!planesOn){ if(lastData.length||Object.keys(planes).length){ lastData=[]; render([]) } showWelcome(false); setStat('<em>Planes off</em><br>'+new Date().toLocaleTimeString([], {hour12:true,hour:'numeric',minute:'2-digit',second:'2-digit'})); return schedule() }
    busy=true;
    var on=active();
    if(!on.length){busy=false;showWelcome('setup');setStat('Needs a feed<br>tap to set up',true);return schedule()}
    return Promise.all(on.map(fetchSource)).then(function(res){
      var good=res.filter(function(r){return r.ok});
      if(!good.length){
        if(res.every(function(r){return r.err==='429'})){ slow=Math.min(slow+1,4); slowUntil=Date.now()+refreshMs*Math.pow(2,slow); setStat('Feed busy<br>retrying…',true); return }
        failCount++; if(failCount>1) showWelcome('error');
        var code=res.map(function(r){return r.err}).filter(function(c){return /^\d+$/.test(c||'')})[0];
        setStat(!navigator.onLine?'No internet<br>check connection':(failCount>1?'Feed error<br>tap for fix':'Connecting…'),true);
        return;
      }
      failCount=0; slow=0; slowUntil=0; if(!planesOn) return;
      lastData=merge(good.map(function(r){return r.ac}));
      render(lastData); showWelcome(false);
      var t=new Date().toLocaleTimeString([], {hour12:true,hour:'numeric',minute:'2-digit',second:'2-digit'});
      var warn=good.length<on.length?' · '+good.length+'/'+on.length:'';
      setStat('<em>'+Math.min(lastData.length,maxPlanes)+((Math.min(lastData.length,maxPlanes))===1?' plane':' planes')+'</em><br>'+t+warn, good.length<on.length);
    }).catch(function(e){ try{console.warn('poll',e)}catch(_){} }).then(function(){busy=false;schedule()});
  }
  var slow=0, slowUntil=0, planesOn=false;
  function schedule(){clearTimeout(timer);timer=setTimeout(poll,slow?refreshMs*Math.pow(2,slow):refreshMs);
    document.getElementById('map').parentNode.style.setProperty('--glide','.12s');}
  document.addEventListener('visibilitychange',function(){if(!document.hidden){clearTimeout(timer);poll()}});
  var movT=null;
  map.on('moveend',function(){clearTimeout(movT);movT=setTimeout(function(){if(!busy&&!document.hidden&&Date.now()>=slowUntil){clearTimeout(timer);poll()}},700)});
  map.on('zoomstart movestart',function(){document.getElementById('map').parentNode.classList.remove('glide')});
  map.on('zoomend moveend',function(){document.getElementById('map').parentNode.classList.add('glide')});
  var rate=document.getElementById('rate');
  try{var saved=localStorage.getItem('sky-refresh');if(saved&&rate.querySelector('[value="'+saved+'"]'))refreshMs=+saved}catch(e){}
  rate.value=String(refreshMs);
  rate.onchange=function(){refreshMs=+rate.value;try{localStorage.setItem('sky-refresh',rate.value)}catch(e){}clearTimeout(timer);poll()};
  document.getElementById('map').parentNode.classList.add('glide');

  var touched=false;
  ['pointerdown','wheel','touchstart'].forEach(function(ev){document.getElementById('map').addEventListener(ev,function(){touched=true},{passive:true})});
  function recenter(keep){
    meMark.setLatLng([me.lat,me.lon]); meHalo.setLatLng([me.lat,me.lon]); loadTemp(); ring.setLatLng([me.lat,me.lon]).setRadius(radiusNm*1852);
    if(!keep) map.fitBounds(L.latLng(me.lat,me.lon).toBounds(radiusNm*1852*2),{padding:[10,10]});
    Object.keys(trails).forEach(function(h){trails[h].pts=[]});
    poll();
  }

  document.getElementById('radius').onchange=function(e){
    radiusIdx=+e.target.value;
    radiusNm=units==='av'?RADII.av[radiusIdx]:RADII.metric[radiusIdx]/1.852;
    try{localStorage.setItem('sky-radius',String(radiusIdx))}catch(err){}
    recenter();
  };
  document.getElementById('units').onchange=function(e){
    units=e.target.value==='metric'?'metric':'av';
    try{localStorage.setItem('sky-units',units)}catch(err){}
    applyUnits(); recenter(true); render(lastData);
  };
  function locate(auto){
    if(!navigator.geolocation){setStat('No location<br>using default');return}
    navigator.geolocation.getCurrentPosition(function(pos){
      var nl=pos.coords.latitude, nn=pos.coords.longitude, moved=distNm(me.lat,me.lon,nl,nn);
      me.lat=nl; me.lon=nn; me.label='you'; try{localStorage.setItem('sky-lastpos',JSON.stringify({lat:+nl.toFixed(3),lon:+nn.toFixed(3)}))}catch(e){}
      if(auto===true){ recenter(true); if(!touched) map.setView([nl,nn],Math.max(map.getZoom(),START_Z)) } else recenter(false);
    },function(){setStat('Location off<br>using default',true)},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
  }
  // Live GPS: your dot keeps moving as you travel. Phone GPS works with no cell service.
  var follow=false, wId=null, lastSave=0, gpsLost=null, locBtn=document.getElementById('locate'), lastFix=0, msgT=null;
  var NATIVE=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
  var locMsg=document.createElement('div'); locMsg.id='locmsg'; locMsg.setAttribute('role','status'); locMsg.hidden=true; document.body.appendChild(locMsg); locMsg.onclick=function(e){ var t=e.target; if(t&&t.id==='gpschk'){ gpsCheck(); return } if(t&&t.id==='gpsgo'){ locMsg.hidden=true; locBtn.click(); return } if(t&&t.id==='gpsset'){ locMsg.hidden=true; try{ window.__native.settings() }catch(x){} return } locMsg.hidden=true };
  var AWV=122, lastAcc=0, lastErr=null, CHK='<button type="button" id="gpschk">GPS check</button>';
  function gpsCheck(){ say('<b>GPS check</b>Reading GPS and compass…',5000); rotProbe(function(na,nr){ gpsCheck2(na,nr) }) }
  function gpsCheck2(na,nr){ var P=(navigator.permissions&&navigator.permissions.query)?navigator.permissions.query({name:'geolocation'}).then(function(r){ return r.state },function(){ return '' }):Promise.resolve('');
    P.then(function(ps){ var ago=lastFix?Math.round((Date.now()-lastFix)/1000):-1, E=['Error','Blocked','No GPS signal','Timed out'];
      var rows=[['Version','v'+AWV+(NATIVE?' · app':' · website')],['Permission',{granted:'Allowed ✅',denied:'Blocked ❌',prompt:'Not asked yet'}[ps]||'Unknown'],['Live GPS',wId!=null?'Running':'Off'],
        ['Last spot',ago<0?'None yet':(ago<90?ago+' s ago':Math.round(ago/60)+' min ago')+(lastAcc?' · ±'+Math.round(lastAcc)+' m':'')],['Last problem',lastErr?(E[lastErr.code]||'Error')+(lastErr.msg?' · '+esc(String(lastErr.msg).slice(0,60)):''):'None'],
        ['Compass',na?'Working ✅ · '+Math.round(sens.absV)+'°':'No reading ❌'],['Turning sensor',nr?'Working ✅':'No reading ❌'],['Rotate',(rotOn?'On':'Off')+(nr&&!na?(relOff!=null?' · north set by GPS ✅':' · drive to set north'):'')]];
      say('<b>GPS check</b><table class="gpst">'+rows.map(function(r){ return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td></tr>' }).join('')+'</table><button type="button" id="gpsgo">Try again</button>',40000) }) }
  function say(t,ms,chk){ clearTimeout(msgT); locMsg.innerHTML=(t||'')+(t&&chk?CHK:''); locMsg.hidden=!t; if(t) msgT=setTimeout(function(){ locMsg.hidden=true },ms||5000) }
  function why(err){ if(err&&err.code===1) return NATIVE?(window.__native&&window.__native.settings?'<b>Location is blocked for AwareBC</b>Tap Open settings ▸ Permissions ▸ Location ▸ Allow, then come back and tap My spot.<button type="button" id="gpsset">Open settings</button>':'<b>Location is blocked for AwareBC</b>Phone Settings ▸ Apps ▸ AwareBC ▸ Permissions ▸ Location ▸ Allow, then tap My spot again.'):'<b>Location is off for this site</b>Tap Try again and choose Allow. If no question pops up, tap the icon left of the web address ▸ Permissions ▸ Location ▸ Allow.<button type="button" id="gpsgo">Try again</button>';
    return '<b>Can\'t find you yet</b>Turn on Location in your phone\'s quick settings. Indoors, GPS can take a minute; step outside for a clear view of the sky.' }
  var accC=L.circle([me.lat,me.lon],{radius:1,color:'#ff3b30',weight:1,opacity:.45,fillColor:'#ff3b30',fillOpacity:.08,interactive:false});
  function onFix(pos){ var c=pos.coords, nl=c.latitude, nn=c.longitude; if(!isFinite(nl)||!isFinite(nn)) return; me.lat=nl; me.lon=nn; me.label='you'; lastFix=Date.now(); lastErr=null;
    meMark.setLatLng([nl,nn]); ring.setLatLng([nl,nn]); var ac=c.accuracy||0; lastAcc=ac; accC.setLatLng([nl,nn]).setRadius(Math.min(ac,3000)); if(ac>30){ accC.setStyle(ac>120?{fillOpacity:0,weight:1.5,opacity:.7,dashArray:'6 6'}:{fillOpacity:.08,weight:1,opacity:.45,dashArray:null}); if(!map.hasLayer(accC)) accC.addTo(map) } else if(map.hasLayer(accC)) map.removeLayer(accC);
    var el=meMark.getElement(); if(el) el.classList.remove('stale');
    // Driving: speed and direction from the GPS (or worked out from the last spot), arrow shows which way you're heading
    var t=pos.timestamp||Date.now(), sp=(c.speed!=null&&isFinite(c.speed))?c.speed:-1, hd=(c.heading!=null&&isFinite(c.heading))?c.heading:-1;
    if(prevFix){ var dm=distNm(prevFix[0],prevFix[1],nl,nn)*1852, dt=(t-prevFix[2])/1000;
      if(sp<0&&dt>0.5&&dt<30) sp=dm/dt;
      if(dm>8){ var y=Math.sin((nn-prevFix[1])*Math.PI/180)*Math.cos(nl*Math.PI/180), x=Math.cos(prevFix[0]*Math.PI/180)*Math.sin(nl*Math.PI/180)-Math.sin(prevFix[0]*Math.PI/180)*Math.cos(nl*Math.PI/180)*Math.cos((nn-prevFix[1])*Math.PI/180); if(hd<0||sp<3) hd=(Math.atan2(y,x)*180/Math.PI+360)%360 } }
    if(!prevFix||distNm(prevFix[0],prevFix[1],nl,nn)*1852>8||t-prevFix[2]>10000) prevFix=[nl,nn,t];
    moving=sp>1.5; if(moving){ stillT=0; if(hd>=0) lastHd=hd } else if(!stillT) stillT=t;
    var mvOn=moving||(stillT&&t-stillT<15000&&lastHd>=0&&!!el&&el.classList.contains('mv'));
    if(el){ el.classList.toggle('mv',mvOn&&lastHd>=0); arrow() }
    rotCal(); rotStep();
    if(locBtn.classList.contains('on')){ locBtn.classList.remove('on'); userZoom=false; say(ac>150?'<b>Rough spot found</b>±'+(ac>=1000?(ac/1000).toFixed(1)+' km':Math.round(ac)+' m')+' · sharpening with GPS…':moving?'Drive mode · following you up close':'Following you · drag the map to stop',ac>150?6000:3000); recenter(true); needZ=false; zoomTo([nl,nn],DRIVEZ) }
    else if(follow){ if(needZ&&ac<=150){ needZ=false; zoomTo([nl,nn],DRIVEZ) } else if(moving&&!userZoom&&map.getZoom()<DRIVEZ){ zoomTo([nl,nn],DRIVEZ); if(!drove){ drove=true; say('Drive mode · following you up close',2500) } } else map.panTo([nl,nn],{animate:true,duration:.8,easeLinearity:1}) }
    awake(follow);
    var now=Date.now(); if(now-lastSave>60000){ lastSave=now; try{localStorage.setItem('sky-lastpos',JSON.stringify({lat:+nl.toFixed(3),lon:+nn.toFixed(3)}))}catch(e){} }
    clearTimeout(gpsLost); gpsLost=setTimeout(function(){ var el=meMark.getElement(); if(el) el.classList.add('stale') },90000) }
  var needZ=false, prevFix=null, moving=false, stillT=0, lastHd=-1, userZoom=false, ourZoom=false, drove=false, DRIVEZ=18, wl=null;
  function zoomTo(ll,z){ ourZoom=true; map.setView(ll,z,{animate:true}); setTimeout(function(){ ourZoom=false },900) }
  var hdPrev=null; function arrow(){ var el=meMark.getElement(); if(!el||lastHd<0) return; var bb=map.getBearing?map.getBearing():0, a=lastHd+(bb||0); if(hdPrev!=null) a=hdPrev+(((a-hdPrev)%360)+540)%360-180; hdPrev=a; el.style.setProperty('--hd',a+'deg') }
  map.on('rotate',arrow);
  // Auto-rotate: the map turns so the way you drive (GPS) or face (phone compass) points up
  var rotOn=false, rotH=null, rotSm=null, rotLast=0, rotPause=0, rotOurs=false, rotGot=false, rotChk=null, rotBtn=document.getElementById('rotbtn');
  try{ rotOn=localStorage.getItem('sky-autorot')==='1' }catch(e){}
  function aDiff(a,b){ return ((a-b)%360+540)%360-180 }
  function compassHd(al,be,ga){ var r=Math.PI/180, x=be*r, y=ga*r, z=al*r, cY=Math.cos(y), cZ=Math.cos(z), sX=Math.sin(x), sY=Math.sin(y), sZ=Math.sin(z);
    if(Math.abs(be)<35) return (360-al)%360; var h=Math.atan2(-cZ*sY-sZ*sX*cY,-sZ*sY+cZ*sX*cY)/r; return (h+360)%360 }
  function rotStep(){ if(!rotOn||!map.setBearing) return;
    var t=(moving&&lastHd>=0)?lastHd:rotH; if(t==null) return;
    var now=Date.now(); if(now<rotPause||now-rotLast<70) return; rotLast=now;
    rotSm=rotSm==null?t:(rotSm+aDiff(t,rotSm)*0.2+360)%360;
    var want=(360-rotSm)%360, cur=map.getBearing?map.getBearing():0, d=aDiff(want,cur);
    if(Math.abs(d)<2) return;
    rotOurs=true; try{ map.setBearing((cur+d+360)%360) }catch(e){} rotOurs=false }
  map.on('rotate',function(){ if(!rotOurs) rotPause=Date.now()+6000 });
  // Compass when the phone gives one. If not, the turning sensor is used, and GPS tells it where north is while you drive.
  var sens={abs:0,rel:0,absV:null}, relH=null, relOff=null, absT=0, rotLis=false;
  function onOri(e){ var h=null, ab=false;
    if(e.webkitCompassHeading!=null&&isFinite(e.webkitCompassHeading)){ h=e.webkitCompassHeading; ab=true }
    else if(e.alpha!=null&&e.beta!=null&&e.gamma!=null){ h=compassHd(e.alpha,e.beta,e.gamma); ab=!!(e.absolute||e.type==='deviceorientationabsolute') }
    if(h==null||!isFinite(h)) return;
    if(ab){ sens.abs++; sens.absV=h; absT=Date.now(); rotGot=true; rotH=h }
    else { sens.rel++; relH=h; if(Date.now()-absT>2000&&relOff!=null){ rotGot=true; rotH=(h+relOff+360)%360 } }
    rotStep() }
  function rotCal(){ if(!moving||lastHd<0||relH==null) return; var d=(aDiff(lastHd,relH)+360)%360; relOff=relOff==null?d:(relOff+aDiff(d,relOff)*0.25+360)%360 }
  function rotProbe(cb){ var a0=sens.abs, r0=sens.rel, was=rotLis; if(!was) rotListen(true);
    setTimeout(function(){ if(!was&&!rotOn) rotListen(false); cb(sens.abs-a0, sens.rel-r0) },2000) }
  function rotListen(on){ rotLis=!!on; var f=on?'addEventListener':'removeEventListener'; try{ window[f]('deviceorientationabsolute',onOri,true); window[f]('deviceorientation',onOri,true) }catch(e){} }
  function setRot(on,quiet){ rotOn=!!on; rotBtn.setAttribute('aria-pressed',rotOn?'true':'false'); try{ localStorage.setItem('sky-autorot',rotOn?'1':'0') }catch(e){}
    clearTimeout(rotChk); rotListen(false); rotSm=null; rotPause=0;
    if(rotOn){ rotGot=false;
      rotListen(true); try{ if(window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission().then(function(r){ if(r==='denied') say('Compass blocked. Allow motion &amp; orientation in Settings.',6000) },function(){}) }catch(e){}
      rotChk=setTimeout(function(){ if(rotOn&&!sens.abs) say(sens.rel?'<b>No compass reading</b>The map turns with GPS while you drive, and keeps turning with your phone when you stop.':'<b>No compass or turning sensor found</b>The map turns with GPS while you drive.',7000) },3000);
      if(!quiet) say('Auto-rotate on · map turns to the way you face. Tap the compass for north.',4500) }
    else if(!quiet) say('Auto-rotate off',2000) }
  rotBtn.onclick=function(){ setRot(!rotOn) };
  document.getElementById('compass').addEventListener('click',function(){ if(rotOn) setRot(false,true) });
  if(rotOn) setRot(true,true);
  map.on('zoomstart',function(){ if(follow&&!ourZoom) userZoom=true });
  // keep the screen on while you're driving with My spot following
  function awake(on){ try{ if(on&&!wl&&navigator.wakeLock&&!document.hidden){ wl=1; navigator.wakeLock.request('screen').then(function(x){ wl=x; x.addEventListener('release',function(){ wl=null }) },function(){ wl=null }) } else if(!on&&wl&&wl.release){ wl.release(); wl=null } }catch(e){ wl=null } }
  function lost(err){ if(err) lastErr={code:err.code|0,msg:err.message||''}; if(err&&err.code===1){ stopWatch(); if(follow||locBtn.classList.contains('on')||!told){ told=true; follow=false; locBtn.classList.remove('follow','on'); say(why(err),20000,true) } } }
  var told=false;
  function startWatch(){ if(wId!=null||!navigator.geolocation) return; try{ wId=navigator.geolocation.watchPosition(onFix,lost,{enableHighAccuracy:true,maximumAge:1000,timeout:30000}) }catch(e){ wId=null } }
  function stopWatch(){ if(wId!=null&&navigator.geolocation) navigator.geolocation.clearWatch(wId); wId=null }
  document.addEventListener('visibilitychange',function(){ if(document.hidden) stopWatch(); else startWatch() });
  var resT=null;
  function resumeFollow(){ resT=null; if(follow||wId==null||!lastFix||Date.now()-lastFix>60000) return; follow=true; userZoom=false; locBtn.classList.add('follow'); zoomTo([me.lat,me.lon],DRIVEZ); say(moving?'Drive mode · back to following you':'Back to following you',2000) }
  function resumeLater(){ clearTimeout(resT); resT=setTimeout(resumeFollow,10000) }
  map.on('dragstart',function(){ if(follow){ follow=false; awake(false); locBtn.classList.remove('follow','on'); if(moving){ resumeLater(); say('Stopped following · back to you in 10 s',2500) } else say('Stopped following · tap My spot to follow again',2500) } else if(resT) resumeLater() });
  map.on('zoomstart',function(){ if(resT&&!ourZoom) resumeLater() });
  startWatch();
  // Location permission check: ask for it if it hasn't been asked, explain how to fix it if it's blocked, and restart GPS as soon as it's allowed
  if(navigator.permissions&&navigator.permissions.query) navigator.permissions.query({name:'geolocation'}).then(function(r){
    function chk(first){ if(r.state==='granted'){ if(!first){ startWatch(); say('<b>Location on ✅</b>Tap My spot to follow you.',4000) } return }
      if(told) return; told=true; setTimeout(function(){ if(r.state==='denied') say(why({code:1}),20000,true); else if(r.state==='prompt') say('<b>Turn on location</b>AwareBC needs your location for My spot, trail alerts and nearby planes.<button type="button" id="gpsgo">Allow location</button>',20000) },first?2500:0) }
    chk(true); r.onchange=function(){ told=r.state!=='denied'?told:false; chk(false) } }).catch(function(){});
  // My spot: centre on you and keep following as you move. Tries precise GPS first, then a rougher fix, and says why if it can't.
  (function(){ var t=null, held=false; locBtn.addEventListener('pointerdown',function(){ held=false; clearTimeout(t); t=setTimeout(function(){ held=true; gpsCheck() },650) });
    ['pointerup','pointercancel','pointerleave'].forEach(function(n){ locBtn.addEventListener(n,function(){ clearTimeout(t) }) });
    locBtn.addEventListener('click',function(e){ if(held){ held=false; e.stopImmediatePropagation(); e.preventDefault() } },true); locBtn.addEventListener('contextmenu',function(e){ e.preventDefault() }) })();
  locBtn.onclick=function(){ clearTimeout(resT); resT=null; var b=locBtn;
    if(!navigator.geolocation){ say('<b>No location on this device</b>This browser can\'t share your location.',8000); return }
    follow=true; userZoom=false; drove=false; needZ=true; b.classList.add('follow'); startWatch();
    if(lastFix&&Date.now()-lastFix<20000){ recenter(true); needZ=false; zoomTo([me.lat,me.lon],DRIVEZ); say(moving?'Drive mode · following you up close':'Following you · drag the map to stop',3000); return }
    b.classList.add('on'); say('Finding you…',31000,true); var tries=0;
    // quick rough spot from Wi-Fi and cell towers (a second or two, works indoors) while precise GPS locks on
    try{ navigator.geolocation.getCurrentPosition(function(p){ if(b.classList.contains('on')) onFix(p) },function(){},{enableHighAccuracy:false,timeout:8000,maximumAge:600000}) }catch(e){}
    setTimeout(function(){ if(b.classList.contains('on')){ b.classList.remove('on'); if(!lastErr) lastErr={code:3,msg:'No answer from the phone GPS'}; say(why({code:3}),20000,true) } },30000);
    function fail(err){ if(err) lastErr={code:err.code|0,msg:err.message||''}; if(!b.classList.contains('on')) return; if(err&&err.code===1){ lost(err); return }
      if(++tries<2){ navigator.geolocation.getCurrentPosition(onFix,fail,{enableHighAccuracy:false,timeout:15000,maximumAge:600000}); return }
      b.classList.remove('on'); say(why(err),20000,true) }
    navigator.geolocation.getCurrentPosition(onFix,fail,{enableHighAccuracy:true,timeout:12000,maximumAge:20000}) };

  // Feed check: calls every feed once and explains what happened in plain words.
  function probe(s){
    if(s.needsKey&&!apiKey) return Promise.resolve({ok:false,text:'Add your free key below to use this feed.'});
    var t0=performance.now(), u=s.needsKey?s.url(me.lat.toFixed(4),me.lon.toFixed(4),Math.round(radiusNm)):viaRelay(s.url(me.lat.toFixed(4),me.lon.toFixed(4),Math.round(radiusNm)));
    return fetch(u,s.needsKey?{headers:{'X-Api-Key':apiKey}}:undefined).then(function(r){
      var ms=Math.round(performance.now()-t0);
      if(r.status===401||r.status===403) return {ok:false,text:s.needsKey?'The key was not accepted. Check that you pasted it in full.':'The server refused the request (error '+r.status+').'};
      if(!r.ok) return {ok:false,text:'The server answered with error '+r.status+'.'};
      return r.json().then(function(j){return {ok:true,text:'Working · '+(j.ac||j.aircraft||[]).length+((j.ac||j.aircraft||[]).length===1?' plane':' planes')+' · '+ms+' ms'}});
    }).catch(function(){
      if(!navigator.onLine) return {ok:false,text:'No internet connection.'};
      return fetch(u,{mode:'no-cors'}).then(function(){
        return {ok:false,blocked:true,text:'Needs a relay to be read.'};
      }).catch(function(){return {ok:false,text:'Could not connect to this server.'}});
    });
  }
  function runTest(){
    var list=document.getElementById('flist'), help=document.getElementById('fhelp');
    list.innerHTML=SOURCES.map(function(s){return '<div class="frow" data-id="'+s.id+'"><b>'+s.id+'<em>Testing…</em></b></div>'}).join('');
    help.textContent='';
    Promise.all(SOURCES.map(probe)).then(function(res){
      var good=0,blocked=0;
      res.forEach(function(r,i){
        if(r.ok) good++; if(r.blocked) blocked++;
        list.children[i].innerHTML='<b>'+SOURCES[i].id+'<em class="'+(r.ok?'ok':'no')+'" style="font-style:normal">'+(r.ok?'OK':'Not working')+'</em></b><span'+(r.blocked?' class="rb"':'')+'>'+esc(r.text)+'</span>';
      });
      help.textContent=good?'At least one feed is working. adsb.lol need a relay because they do not let web pages read them.':
        (blocked||!apiKey?'Get a free FlyItalyADSB key (it is emailed to you, no approval) and paste it below. adsb.lol only work through a relay.':'Check your connection and try again.');
    });
  }
  function envLine(){
    var how=location.protocol==='file:'||location.protocol==='content:'?'saved file':(/^https?:$/.test(location.protocol)?'web page':'preview');
    document.getElementById('fenv').textContent='Opened as: '+how+' · Internet: '+(navigator.onLine?'connected':'offline')+(how==='preview'?' · Previews inside other apps often block the internet. Open the saved file in Chrome.':'');
  }
  function openSheet(){
    envLine();document.getElementById('relay').value=relay;document.getElementById('apikey').value=apiKey;document.getElementById('fsheet').hidden=false;
    var ff=document.getElementById('ffolder'), want=!active().length||failCount>0;
    if(want){ if(ff.open) runTest(); else ff.open=true } else ff.open=false;
  }
  document.getElementById('ffolder').addEventListener('toggle',function(){ if(this.open) runTest() });
  document.getElementById('stat').onclick=function(){ if(failCount>0||!active().length||!lastData.length) openSheet(); else openSky() };
  document.getElementById('skyx').onclick=function(){document.getElementById('skysheet').hidden=true};
  document.getElementById('skysheet').onclick=function(e){if(e.target===this) this.hidden=true};
  document.getElementById('gear').onclick=openSheet;
  document.getElementById('stat').onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();document.getElementById('stat').onclick()}};
  document.getElementById('fclose').onclick=function(){document.getElementById('fsheet').hidden=true};
  document.getElementById('ftest').onclick=function(e){e.preventDefault();runTest()};
  document.getElementById('fsave').onclick=function(e){
    e.preventDefault();
    relay=document.getElementById('relay').value.trim(); if(relay&&!/^https:\/\/[a-z0-9.-]+(:\d+)?(\/[\w\-./?=&]*)?$/i.test(relay)) relay=DEFAULT_RELAY;
    apiKey=document.getElementById('apikey').value.trim().replace(/[^\w\-.]/g,'').slice(0,200);
    try{localStorage.setItem('sky-relay',relay);localStorage.setItem('sky-key',apiKey)}catch(err){}
    runTest(); clearTimeout(timer); busy=false; poll();
  };
  // Opening the app: start zoomed in close around you (town and road level), not the whole 100 nm plane area
  var START_Z=13; applyUnits(); syncLabels(); recenter(true); map.setView([me.lat,me.lon],START_Z,{animate:false}); locate(true);
  // ---- Space & night sky: ISS and bright satellites (CelesTrak orbits + satellite.js), aurora (NOAA SWPC), meteor showers ----
  var SATJS='https://cdn.jsdelivr.net/npm/satellite.js@5.0.0/dist/satellite.min.js', SATSRI='sha384-e6V1JVpc+kVNTxT0gEOla7yL4c92Romsw7itPoipfzHbEjzUwPhTv6oeVDMHHzqT';
  var sats=[], satReady=null, spaceCfg={map:true,ar:true}, issMks={}, DEG=Math.PI/180, CMP=['N','NE','E','SE','S','SW','W','NW'];
  try{var scf=JSON.parse(localStorage.getItem('sky-space')||'{}'); if(scf.map===false) spaceCfg.map=false; if(scf.ar===false) spaceCfg.ar=false}catch(e){}
  function cmp(a){return CMP[Math.round(((a%360)+360)%360/45)%8]}
  function loadSatJs(){ return new Promise(function(res,rej){ if(window.satellite) return res(); var sc=document.createElement('script'); sc.src=SATJS; sc.integrity=SATSRI; sc.crossOrigin='anonymous'; sc.referrerPolicy='no-referrer'; sc.onload=res; sc.onerror=rej; document.head.appendChild(sc) }) }
  function tleGroup(g){ var K='sky-tle-'+g, c=null; try{c=JSON.parse(localStorage.getItem(K)||'null')}catch(e){}
    if(c&&Date.now()-c.t<6*3600000) return Promise.resolve(c.d);
    if(g==='last-30-days') return altTle(g,K).then(function(t){ return t||(c?c.d:'') });
    return fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP='+g+'&FORMAT=tle').then(function(r){if(!r.ok) throw new Error(r.status); return r.text()}).then(function(t){ if(t.length>400000) t=t.slice(0,400000); try{localStorage.setItem(K,JSON.stringify({t:Date.now(),d:t}))}catch(e){} return t }).catch(function(){ return c?c.d:altTle(g,K) }) }
  function altTle(g,K){ var u='https://tle.ivanstanojevic.me/api/tle/', ids=g==='stations'?[25544,48274]:g==='visual'?[20580,27386,25994,27424,28654,33591,25338,39084,43013,37849]:null;
    var ps=ids?ids.map(function(id){ return fetch(u+id).then(function(r){return r.ok?r.json():null}).catch(function(){return null}) }):[fetch(u+'?search=STARLINK&sort=id&sort-dir=desc&page-size=100').then(function(r){return r.ok?r.json():null}).catch(function(){return null})];
    return Promise.all(ps).then(function(a){ var t=''; a.forEach(function(j){ if(!j) return; (j.member||[j]).forEach(function(m){ if(m&&m.line1&&m.line2) t+=String(m.name||'SAT').slice(0,40)+'\n'+m.line1+'\n'+m.line2+'\n' }) }); if(t) try{localStorage.setItem(K,JSON.stringify({t:Date.now(),d:t}))}catch(e){} return t }) }
  function parseTle(t,tag){ var L=String(t||'').split(/\r?\n/).map(function(x){return x.trim()}).filter(Boolean), out=[], i=0;
    while(i+2<L.length){ if(L[i+1].charAt(0)==='1'&&L[i+2].charAt(0)==='2'){ try{ var rec=satellite.twoline2satrec(L[i+1],L[i+2]); var nm=L[i].replace(/\s+/g,' ').replace(/ R\/B$/,' rocket stage').slice(0,28); if(!rec.error&&!/\bDEB\b/.test(nm)) out.push({name:nm,id:L[i+1].slice(2,7).trim(),rec:rec,tag:tag}) }catch(e){} i+=3 } else i++ }
    return out }
  function loadSats(){ if(satReady) return satReady;
    satReady=loadSatJs().then(function(){ return Promise.all([tleGroup('stations'),tleGroup('visual'),tleGroup('last-30-days')]) }).then(function(r){ var seen={}, all=[];
      parseTle(r[0],'station').concat(parseTle(r[1],'bright'),parseTle(cfg2.starlink==='1'?r[2]:'','new').filter(function(x){return /^STARLINK/.test(x.name)})).forEach(function(x){ if(!seen[x.id]){seen[x.id]=1;all.push(x)} });
      sats=all; issTick(); return all }).catch(function(e){ satReady=null; throw e }); return satReady }
  function obsGd(){ return {latitude:me.lat*DEG, longitude:me.lon*DEG, height:0.5} }
  function sunEci(d){ var n=d.getTime()/86400000+2440587.5-2451545.0, Lm=(280.46+0.9856474*n)*DEG, g=(357.528+0.9856003*n)*DEG, lam=Lm+(1.915*Math.sin(g)+0.02*Math.sin(2*g))*DEG, eps=23.439*DEG;
    return [Math.cos(lam), Math.cos(eps)*Math.sin(lam), Math.sin(eps)*Math.sin(lam)] }
  function sunlit(p,sun){ var d=p.x*sun[0]+p.y*sun[1]+p.z*sun[2]; if(d>0) return true; var x=p.x-d*sun[0], y=p.y-d*sun[1], z=p.z-d*sun[2]; return Math.sqrt(x*x+y*y+z*z)>6371 }
  function look(sat,d,gmst,gd){ var pv=satellite.propagate(sat.rec,d); if(!pv||!pv.position||typeof pv.position!=='object') return null;
    var ecf=satellite.eciToEcf(pv.position,gmst), la=satellite.ecfToLookAngles(gd,ecf), geo=satellite.eciToGeodetic(pv.position,gmst);
    return {az:la.azimuth/DEG, el:la.elevation/DEG, range:la.rangeSat, h:geo.height, lat:geo.latitude/DEG, lon:geo.longitude/DEG, pos:pv.position, v:pv.velocity} }
  function upNow(){ if(!window.satellite||!sats.length) return []; var d=new Date(), g=satellite.gstime(d), gd=obsGd(), sun=sunEci(d), dark=sunAlt(me.lat,me.lon,d.getTime())<-6, out=[];
    sats.forEach(function(x){ var l=look(x,d,g,gd); if(l&&l.el>5){ l.s=x; l.lit=sunlit(l.pos,sun); l.vis=l.lit&&dark; out.push(l) } });
    return out.sort(function(a,b){ return (b.s.tag==='station')-(a.s.tag==='station')||b.el-a.el }) }
  function passes(x,hours,step,maxN){ var out=[], gd=obsGd(), t0=Date.now(), cur=null;
    for(var t=0;t<=hours*3600;t+=step){ var d=new Date(t0+t*1000), l=look(x,d,satellite.gstime(d),gd); if(!l) continue;
      if(l.el>10){ if(!cur) cur={s:x,start:d,az0:l.az,max:l.el,vis:false}; if(l.el>cur.max) cur.max=l.el;
        if(!cur.vis&&sunlit(l.pos,sunEci(d))&&sunAlt(me.lat,me.lon,d.getTime())<-6) cur.vis=true; cur.end=d; cur.az1=l.az }
      else if(cur){ out.push(cur); cur=null; if(out.length>=maxN) break } }
    if(cur) out.push(cur); return out }
  function issTick(){ var want=spaceCfg.map&&window.satellite&&sats.length; ['25544','48274'].forEach(function(id){ var x=sats.filter(function(q){return q.id===id})[0], mk=issMks[id];
      if(!want||!x){ if(mk){map.removeLayer(mk);delete issMks[id]} return } var d=new Date(), l=look(x,d,satellite.gstime(d),obsGd()); if(!l) return;
      var ll=[l.lat,l.lon], lbl=id==='25544'?'ISS':'Tiangong';
      if(!mk) mk=issMks[id]=L.marker(ll,{icon:L.divIcon({className:'',html:'<span class="aptmk" style="--c:#4fc3f7">🛰 '+lbl+'</span>',iconSize:[0,0]}),keyboard:false,interactive:true,bubblingMouseEvents:false,zIndexOffset:500}).on('click',openSpace).addTo(map);
      else mk.setLatLng(ll) }) }
  setInterval(function(){ if(!document.hidden&&sats.length) issTick() },3000);
  try{ if(localStorage.getItem('sky-space-used')==='1'&&spaceCfg.map) setTimeout(function(){loadSats().catch(function(){})},6000) }catch(e){}
  var kpCache=null;
  function loadKp(){ if(kpCache&&Date.now()-kpCache.t<1800000) return Promise.resolve(kpCache.d);
    return fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json').then(function(r){return r.ok?r.json():null}).then(function(j){ if(!Array.isArray(j)) return null;
      var rows=j.filter(function(r){return r&&typeof r==='object'&&r.time_tag&&typeof r.kp==='number'}).map(function(r){return {t:Date.parse(r.time_tag+'Z'),kp:r.kp,obs:r.observed}});
      kpCache={t:Date.now(),d:rows}; return rows }).catch(function(){return null}) }
  function magLat(){ var p=80.7*DEG, l=-72.7*DEG, a=me.lat*DEG, o=me.lon*DEG; return Math.asin(Math.sin(a)*Math.sin(p)+Math.cos(a)*Math.cos(p)*Math.cos(o-l))/DEG }
  var SHOWERS=[[0,3,'Quadrantids',110],[3,22,'Lyrids',18],[4,6,'Eta Aquariids',50],[6,30,'Delta Aquariids',25],[7,12,'Perseids',100],[9,8,'Draconids',10],[9,21,'Orionids',20],[10,17,'Leonids',15],[11,14,'Geminids',150],[11,22,'Ursids',10]];
  function nextShower(){ var now=new Date(), best=null; SHOWERS.forEach(function(s){ for(var y=now.getFullYear();y<=now.getFullYear()+1;y++){ var d=new Date(y,s[0],s[1],22); if(d.getTime()>now.getTime()-2*86400000){ if(!best||d<best.d) best={d:d,n:s[2],z:s[3]}; break } } }); return best }
  function fmtT(d){ var t=d.toLocaleTimeString([], {hour12:true,hour:'numeric',minute:'2-digit'}), day=new Date(); day.setHours(0,0,0,0); var dd=Math.floor((d-day)/86400000); return (dd===0?'Today ':dd===1?'Tmrw ':d.toLocaleDateString([], {weekday:'short'})+' ')+t }
  var spaceTok=0;
  function openSpace(){ try{localStorage.setItem('sky-space-used','1')}catch(e){} var body=document.getElementById('spacebody'), tok=++spaceTok; document.getElementById('spacesheet').hidden=false;
    body.innerHTML='<div class="ssec">Loading satellites and space weather…</div>';
    Promise.all([loadSats().catch(function(){return null}),loadKp()]).then(function(r){ if(tok!==spaceTok) return; renderSpace(r[1],null);
      setTimeout(function(){ if(tok!==spaceTok||!sats.length) return; var list=[], todo=sats.filter(function(x){return x.tag!=='new'}), i=0;
        (function chunk(){ if(tok!==spaceTok) return; var end=Math.min(i+15,todo.length); for(;i<end;i++){ var x=todo[i], ps=passes(x,x.tag==='station'?24:12,x.tag==='station'?30:60,4); ps.forEach(function(p){ if(x.tag==='station'||(p.vis&&p.max>=30)) list.push(p) }) }
          if(i<todo.length) setTimeout(chunk,0); else renderSpace(r[1],list) })() },50) }) }
  function renderSpace(kp,pl){ var body=document.getElementById('spacebody'); if(!body) return; var h='';
    var up=upNow(), iss=sats.filter(function(x){return x.id==='25544'})[0], issL=null;
    if(iss){ var d=new Date(); issL=look(iss,d,satellite.gstime(d),obsGd()) }
    h+='<div class="ssec"><h4>Right now</h4>';
    if(!sats.length) h+='Satellite data could not load. Check your connection and try again.';
    else { if(issL) h+='<div class="row2"><span>🛰 <b>ISS</b> '+(issL.el>0?'is <b class="good">above you</b>, '+cmp(issL.az)+' · '+Math.round(issL.el)+'° up':'is '+Math.round(distNm(me.lat,me.lon,issL.lat,issL.lon)*1.852).toLocaleString()+' km away')+'</span><span>'+Math.round(issL.h)+' km up</span></div>';
      h+='<div class="row2"><span><b>'+up.length+'</b> tracked satellites above you · <b>'+up.filter(function(x){return x.vis}).length+'</b> lit and visible</span><span></span></div>' }
    h+='</div><div class="ssec"><h4>Next passes you can see</h4>';
    if(pl==null) h+=sats.length?'Working out passes…':'—';
    else { var vis=pl.filter(function(p){return p.vis||(cfg2.passAll==='1'&&(p.s.id==='25544'||p.s.id==='48274'))}).sort(function(a,b){return a.start-b.start}).slice(0,4);
      if(!vis.length){ var nx=pl.filter(function(p){return p.s.id==='25544'}).sort(function(a,b){return a.start-b.start})[0]; h+='No bright passes in darkness soon.'+(nx?' Next ISS flyover: '+esc(fmtT(nx.start))+' (daylight or in shadow).':'') }
      vis.forEach(function(p){ var mins=Math.max(1,Math.round((p.end-p.start)/60000)); h+='<div class="row2"><span><b>'+esc(p.s.id==='25544'?'ISS':p.s.name)+'</b> '+cmp(p.az0)+'→'+cmp(p.az1)+' · '+Math.round(p.max)+'° up</span><span>'+esc(fmtT(p.start))+' · '+mins+'m</span></div>' }) }
    h+='</div><div class="ssec"><h4>Northern lights</h4>';
    if(!kp||!kp.length) h+='Space weather could not load.';
    else { var now=Date.now(), past=kp.filter(function(r){return r.t<=now}), cur=past.length?past[past.length-1].kp:0, mx=Math.max.apply(null,kp.filter(function(r){return r.t>now&&r.t<now+86400000}).map(function(r){return r.kp}).concat([cur]));
      var need=Math.max(0,Math.min(9,(66-magLat())/2)), ch=mx>=need?['Good chance','good']:(mx>=need-1.5?['Possible, look north','']:['Low chance','bad']);
      h+='<div class="row2"><span><b class="'+ch[1]+'">'+ch[0]+'</b> in the next 24 h</span><span>Kp '+cur.toFixed(1)+' now · up to '+mx.toFixed(1)+'</span></div><div>Your area needs about Kp '+Math.ceil(need)+'+ and a dark, clear sky.</div>' }
    var ms=nextShower(); if(ms){ var dd=Math.round((ms.d-Date.now())/86400000); h+='</div><div class="ssec"><h4>Next meteor shower</h4><div class="row2"><span><b>'+ms.n+'</b> · up to '+ms.z+' an hour</span><span>'+(dd<=1?'peaking now':'peak '+ms.d.toLocaleDateString([], {month:'short',day:'numeric'}))+'</span></div>' }
    h+='</div><div class="stog"><button data-k="map" class="'+(spaceCfg.map?'on':'')+'">ISS on map</button><button data-k="ar" class="'+(spaceCfg.ar?'on':'')+'">Satellites in AR</button></div>';
    h+='<div class="skynote">Orbits: CelesTrak · Space weather: NOAA SWPC</div>';
    body.innerHTML=h;
    [].forEach.call(body.querySelectorAll('.stog button'),function(b){ b.onclick=function(){ var k=b.getAttribute('data-k'); spaceCfg[k]=!spaceCfg[k]; b.classList.toggle('on',spaceCfg[k]); var e1=document.getElementById(k==='map'?'s_issmap':'s_satar'); if(e1) e1.value=spaceCfg[k]?'1':'0'; try{localStorage.setItem('sky-space',JSON.stringify(spaceCfg))}catch(e){} issTick() } }) }
  document.getElementById('spacebtn').onclick=openSpace;
  // ---- Lightning (Environment Canada CLDN, 10-minute flash density) ----
  (function(){
    var WMS='https://geo.weather.gc.ca/geomet?service=WMS&version=1.3.0', LYR='Lightning_2.5km_Density';
    var ltOn=false, layer=L.layerGroup().addTo(map), tLatest=null, tAt=0, gen=0, tmr=null, lastAlert=0, lastAlertKm=1e9, cache={};
    var btn=document.getElementById('ltbtn'), bar=document.getElementById('ltal');
    function paint(){ if(btn){ btn.classList.toggle('on',ltOn); btn.setAttribute('aria-pressed',ltOn?'true':'false') } }
    function latest(){ if(tLatest&&Date.now()-tAt<5*60000) return Promise.resolve(tLatest);
      return fetch(WMS+'&request=GetCapabilities&layer='+LYR).then(function(r){return r.text()}).then(function(x){ var m=/default="(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ)"/.exec(x.slice(x.indexOf(LYR))); if(m){ tLatest=m[1]; tAt=Date.now() } return tLatest }) }
    function iso(ms){ return new Date(ms).toISOString().replace(/\.\d+Z$/,'Z') }
    // one 10-minute frame for a box -> list of [lat,lon] cells with lightning
    function frame(s,w,n,e,time){ var W=Math.max(16,Math.min(640,Math.round((e-w)*111*Math.cos((s+n)/2*Math.PI/180)/2.5))), H=Math.max(16,Math.min(640,Math.round((n-s)*111/2.5)));
      var u=WMS+'&request=GetMap&layers='+LYR+'&styles=&crs=EPSG:4326&bbox='+[s,w,n,e].map(function(v){return v.toFixed(3)}).join(',')+'&width='+W+'&height='+H+'&format=image/png&transparent=true&time='+time;
      if(cache[u]) return Promise.resolve(cache[u]);
      return fetch(u).then(function(r){ return r.ok?r.blob():null }).then(function(b){ if(!b||!/png/.test(b.type)) return []; return createImageBitmap(b).then(function(im){
        var c=document.createElement('canvas'); c.width=W; c.height=H; var g=c.getContext('2d'); g.drawImage(im,0,0); var d=g.getImageData(0,0,W,H).data, out=[];
        for(var y=0;y<H;y++) for(var x=0;x<W;x++){ if(d[(y*W+x)*4+3]>0) out.push([n-(y+.5)*(n-s)/H, w+(x+.5)*(e-w)/W]) }
        var k=Object.keys(cache); if(k.length>40) delete cache[k[0]]; cache[u]=out; return out }) }).catch(function(){ return [] }) }
    function frames(s,w,n,e,count){ return latest().then(function(t){ if(!t) return []; var t0=Date.parse(t), jobs=[];
      for(var i=0;i<count;i++) jobs.push(frame(s,w,n,e,iso(t0-i*600000)));
      return Promise.all(jobs).then(function(rs){ return {t:t0,frames:rs} }) }) }
    function draw(){ var g=++gen; layer.clearLayers(); if(!ltOn) return; var z=map.getZoom(); if(z<4) return;
      var b=map.getBounds().pad(0.1), s=Math.max(31.6,b.getSouth()), n=Math.min(73.7,b.getNorth()), w=Math.max(-156,b.getWest()), e=Math.min(-38.7,b.getEast()); if(s>=n||w>=e) return;
      var cnt=cfg2.ltAge==='10'?1:cfg2.ltAge==='60'?6:3;
      frames(s,w,n,e,cnt).then(function(res){ if(g!==gen||!res||!res.frames) return; var bins={};
        res.frames.forEach(function(cells,age){ cells.forEach(function(c){ var p=map.latLngToContainerPoint(c), k=Math.floor(p.x/22)+'_'+Math.floor(p.y/22), o=bins[k];
          if(!o) bins[k]={lat:c[0],lon:c[1],age:age,n:1}; else { o.n++; if(age<o.age){ o.age=age; o.lat=c[0]; o.lon=c[1] } } }) });
        var list=Object.keys(bins).map(function(k){return bins[k]}).sort(function(a,b){return a.age-b.age}).slice(0,250), pt=[me.lat,me.lon];
        list.forEach(function(o){ var mins=(o.age+1)*10, km=Math.round(distNm(pt[0],pt[1],o.lat,o.lon)*1.852);
          L.marker([o.lat,o.lon],{icon:L.divIcon({className:'',html:'<span class="ltmk a'+Math.min(o.age,2)+'" role="img" aria-label="Lightning">⚡</span>',iconSize:[0,0]}),keyboard:false,zIndexOffset:-200,title:'Lightning'})
            .bindPopup('<b>⚡ Lightning</b><br>Within the last '+mins+' min<br>'+km+' km from you',{closeButton:false}).addTo(layer) });
        setStatLt(list.length) }) }
    function setStatLt(n){ var el=document.getElementById('ltnote'); if(!el) return; clearTimeout(setStatLt.t); el.hidden=!!n; if(!n) setStatLt.t=setTimeout(function(){ el.hidden=true },4000) }
    // alerts: only when turned on in Settings
    function check(){ var R=+cfg2.ltAlert; if(!R||document.hidden&&!('Notification' in window)) return;
      var dLat=R/111, dLon=R/(111*Math.cos(me.lat*Math.PI/180));
      frames(me.lat-dLat,me.lon-dLon,me.lat+dLat,me.lon+dLon,1).then(function(res){ if(!res||!res.frames) return; var best=1e9;
        (res.frames[0]||[]).forEach(function(c){ var km=distNm(me.lat,me.lon,c[0],c[1])*1.852; if(km<best) best=km });
        if(best>R) return; var now=Date.now(); if(now-lastAlert<30*60000&&best>lastAlertKm*0.6) return; lastAlert=now; lastAlertKm=best;
        var msg='Lightning '+Math.max(1,Math.round(best))+' km from you (last 10 min)';
        if(bar){ document.getElementById('lttxt').textContent='⚡ '+msg; bar.hidden=false }
        try{ if(navigator.vibrate) navigator.vibrate([200,100,200]) }catch(e){}
        try{ if(document.hidden&&'Notification' in window&&Notification.permission==='granted') new Notification('AwareBC',{body:'⚡ '+msg,tag:'lightning'}) }catch(e){} }) }
    function setLt(v){ ltOn=v; paint(); if(v){ map.attributionControl.addAttribution('Lightning © ECCC (CLDN)'); draw() } else { gen++; layer.clearLayers(); map.attributionControl.removeAttribution('Lightning © ECCC (CLDN)') } }
    if(btn) btn.onclick=function(){ setLt(!ltOn) };
    if(bar) bar.onclick=function(e){ if(e.target.id==='ltx'){ bar.hidden=true; return } bar.hidden=true; if(!ltOn) setLt(true); map.setView([me.lat,me.lon],Math.max(map.getZoom(),9)) };
    var mT=null; map.on('moveend',function(){ if(!ltOn) return; clearTimeout(mT); mT=setTimeout(draw,700) });
    setInterval(function(){ if(document.hidden) return; if(ltOn) draw(); check() },300000);
    setTimeout(check,6000);
    window.__lt={redraw:function(){ if(ltOn) draw() },alert:function(){ if(cfg2.ltAlert!=='off'&&'Notification' in window&&Notification.permission==='default'){ try{ Notification.requestPermission() }catch(e){} } check() },_frame:frame};
    paint();
  })();

  // ---- Winter mountains: avalanche forecast, mountain passes, ski hills ----
  __mod('winter',{get map(){return map},get cfg2(){return cfg2},get tcfg(){return tcfg},get me(){return me},get esc(){return esc}},'#mtbtn');
  // ---- Survival tools: mountain sledder, supply chain, planetary threats, off-grid comms ----
  __mod('tools',{get distNm(){return distNm},get tcfg(){return tcfg},get relay(){return relay},get map(){return map},get me(){return me},get viaRelay(){return viaRelay},get esc(){return esc},get cfg2(){return cfg2},get sunAlt(){return sunAlt}},'#toolbtn,#t_sled,#t_supply,#t_planet,#t_comms,#t_rescue,#pral');
  // ---- FSR map: forest service roads, back roads and trails from several free sources ----
  L.Popup.prototype.options.autoPanPaddingTopLeft=L.point(12,96); L.Popup.prototype.options.autoPanPaddingBottomRight=L.point(84,24);
  (function(){
    var on=false, R=(function(){ var r=map.getRenderer(L.polyline([[0,0],[0,0]])); r.options.tolerance=Math.max(r.options.tolerance||0,6); return r })(), drawn={}, data={}, dataKeys=[], busy={}, seen={}, vg=null, vgP=null, mvT=null, leg=document.getElementById('fsrleg'), hint=document.getElementById('fsrhint'), fsrMode=false;
    // road layers show only on the FSR map; trails, camping and creeks show on Satellite too
    var RG={fsr:1,road:1,motor:1,plan:1,bcts:1}, RSRC={frd:1,fom:1,bcts:1,fsr:1,usr:1};
    var C={walk:'#3ddc5a',bike:'#40a9ff',motor:'#ff3b30',fsr:'#ff1744'};
    function inBC(b){ return b.e>-139.5&&b.w<-114&&b.n>48.2&&b.s<60 }
    function inUS(b){ return b.s<49.05&&b.w<-104&&b.e>-125&&b.n>41 }
    function cap(s){ return String(s||'').toLowerCase().replace(/\b[a-z]/g,function(c){return c.toUpperCase()}) }
    function WFS(t,b,cql,props,gc){ gc=gc||'GEOMETRY'; var f='BBOX('+gc+','+[b.w,b.s,b.e,b.n].map(function(v){return v.toFixed(3)}).join(',')+",'EPSG:4326')"+(cql?' AND '+cql:'');
      return 'https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName='+t+'&outputFormat=json&srsName=EPSG:4326&count=3000&propertyName='+props+','+gc+'&CQL_FILTER='+encodeURIComponent(f) }
    // what each Recreation Sites & Trails BC trail is used for (hiking, biking, motorbike), loaded once
    var recInfo=null, recP=null, siteIds=null, siteP=null, picI={};
    var PT='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5h18v2.6H3z M1.5 12h21v2.2h-21z M7.2 9.1l-3.4 10.4h2.3l3.3-10.4z M16.8 9.1l3.4 10.4h-2.3l-3.3-10.4z"/></svg>';
    function picnic(closed,unl){ var k=(closed?'c':'o')+(unl?'u':''); return picI[k]||(picI[k]=L.divIcon({className:'',html:'<div class="ptc'+(closed?' ptx':'')+(unl?' ptu':'')+'">'+PT+'</div>',iconSize:[26,26],iconAnchor:[13,13],popupAnchor:[0,-12]})) }
    function toPts(j){ (j.features||[]).forEach(function(f){ var g=f.geometry; if(!g||g.type==='Point') return; var c=g.type==='Polygon'?g.coordinates[0]:g.type==='MultiPolygon'?g.coordinates[0][0]:null; if(!c||!c.length) return; var x=0,y=0; c.forEach(function(q){ x+=q[0]; y+=q[1] }); f.geometry={type:'Point',coordinates:[x/c.length,y/c.length]} }); return j }
    var SITES='https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_FOREST_TENURE.FTEN_REC_SITE_POINTS_SVW&outputFormat=json&count=5000&srsName=EPSG:4326&propertyName=FOREST_FILE_ID,PROJECT_NAME,SITE_LOCATION,GEOMETRY';
    function siteLoad(){ if(siteIds||siteP) return; siteP=fetch(SITES).then(function(r){return r.ok?r.json():null}).then(function(j){ if(!j||!j.features) throw 0; var m={}; j.features.forEach(function(f){ var i=f.properties&&f.properties.FOREST_FILE_ID; if(i) m[i]=1 }); siteIds=m;
      var s0=SRC.filter(function(x){return x.k==='rsu'})[0]; Object.keys(data).forEach(function(key){ if(/^rsu:/.test(key)&&wantNow[key]){ drop(key); draw(s0,key) } }) }).catch(function(){ siteP=null }) }
    function recLoad(){ if(recInfo||recP) return; recP=fetch('https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_FOREST_TENURE.FTEN_REC_TRAILS_SVW&outputFormat=json&count=5000&propertyName=FOREST_FILE_ID,ACTIVITY_DESC1,ACTIVITY_DESC2,ACTIVITY_DESC3,MAINTAIN_STD_DESC,OPERATOR_CLIENT_NAME').then(function(r){return r.ok?r.json():null}).then(function(j){ if(!j||!j.features) throw 0; var m={};
      j.features.forEach(function(f){ var p=f.properties||{}, a=[p.ACTIVITY_DESC1,p.ACTIVITY_DESC2,p.ACTIVITY_DESC3].filter(Boolean); if(p.FOREST_FILE_ID) m[p.FOREST_FILE_ID]={a:a,k:a.some(function(x){return /Motorized|Four Wheel/.test(x)})?'motor':a.indexOf('Mountain Biking')>=0?'bike':'walk',ms:p.MAINTAIN_STD_DESC,op:p.OPERATOR_CLIENT_NAME} });
      recInfo=m; Object.keys(drawn).forEach(function(key){ if(/^rec:/.test(key)){ var s0=SRC.filter(function(x){return x.k==='rec'})[0]; drop(key); draw(s0,key) } }) }).catch(function(){ recP=null }) }
    function recSt(p){ var i=recInfo&&recInfo[p.FOREST_FILE_ID], k=i?i.k:'walk'; return {color:C[k],weight:2.6,opacity:.95,dashArray:k==='walk'?'5,3':null} }
    var BCTS={PROP:'Planned road',MAIN:'Maintained road',NEBU:'Newly built road',DEAC:'Deactivated (may be impassable)',REHB:'Rehabilitated (closed off)',WILD:'Not maintained (wilderness)',UNKN:'Status unknown'};
    // Wildlife Act road rules: is this road open to vehicles today?
    function rNow(p){ var st=p.ACCESS_STATUS||'', open=/^Open/.test(st); if(/Year Round/.test(st)) return open; var re=/([A-Za-z]{3})[a-z]*\.? (\d{1,2}) ?(?:to|-|–) ?([A-Za-z]{3})[a-z]*\.? (\d{1,2})/g, m, any=false, inR=false, d=new Date(), v=d.getMonth()*100+d.getDate();
      while((m=re.exec(p.ACCESS_RANGE||''))){ var a=MONS[m[1].toLowerCase()], b=MONS[m[3].toLowerCase()]; if(a==null||b==null) continue; any=true; a=a*100+(+m[2]); b=b*100+(+m[4]); if(a<=b?(v>=a&&v<=b):(v>=a||v<=b)) inR=true }
      if(!any) return open; return open?inR:!inR }
    function dt(s){ var d=s?new Date(String(s).replace('Z','')):null; return d&&!isNaN(d)?d.toLocaleDateString([], {month:'short',year:'numeric'}):'' }
    function AGS(svc,b,where,fields){ return 'https://apps.fs.usda.gov/arcx/rest/services/EDW/'+svc+'/MapServer/0/query?where='+encodeURIComponent(where)+'&geometry='+[b.w,b.s,b.e,b.n].map(function(v){return v.toFixed(3)}).join(',')+'&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields='+fields+'&returnGeometry=true&outSR=4326&geometryPrecision=5&resultRecordCount=2000&f=geojson' }
    function usTrail(p){ return p.terra_motorized==='Y'?'motor':(p.bicycle_managed||p.bicycle_accpt)?'bike':'walk' }
    var KIND={walk:'Walking trail',bike:'Biking trail',motor:'Motor vehicles'};
    var SRC=[
      {k:'dra',z:14,g:0.05,area:inBC,src:'BC Digital Road Atlas',url:function(b){ return WFS('WHSE_BASEMAPPING.DRA_DGTL_ROAD_ATLAS_MPAR_SP',b,"ROAD_CLASS IN ('resource','unclassified','recreation','trail')",'DIGITAL_ROAD_ATLAS_LINE_ID,ROAD_CLASS,ROAD_NAME_FULL,ROAD_SURFACE') },
        id:function(f){ return f.properties.DIGITAL_ROAD_ATLAS_LINE_ID },
        st:function(p){ return p.ROAD_CLASS==='trail'?{color:C.walk,weight:2,opacity:.9,dashArray:'4,3'}:{color:C.motor,weight:1.8,opacity:.85} },
        pop:function(p){ return '<b>'+esc(p.ROAD_NAME_FULL||(p.ROAD_CLASS==='trail'?'Trail':'Back road'))+'</b><br>'+(p.ROAD_CLASS==='trail'?'Trail':cap(p.ROAD_CLASS)+' road')+(p.ROAD_SURFACE?' · '+esc(p.ROAD_SURFACE)+' surface':'') }},
      {k:'rec',z:12,g:0.1,area:inBC,src:'Recreation Sites & Trails BC',url:function(b){ return WFS('WHSE_FOREST_TENURE.FTEN_RECREATION_LINES_SVW',b,'RETIREMENT_DATE IS NULL','FOREST_FILE_ID,PROJECT_NAME,PROJECT_TYPE,SITE_LOCATION') },
        id:function(f){ return f.id }, st:recSt,
        pop:function(p){ var i=recInfo&&recInfo[p.FOREST_FILE_ID]; return '<b>'+esc(cap(p.PROJECT_NAME)||'Recreation trail')+'</b><br>'+esc(p.PROJECT_TYPE||'Recreation trail')+(p.SITE_LOCATION?' · near '+esc(cap(p.SITE_LOCATION)):'')+(i&&i.a.length?'<br>'+esc(i.a.join(', ')):'')+(i&&i.ms?'<br><small>'+esc(i.ms)+(i.op?' · '+esc(cap(i.op)):'')+'</small>':'') }},
      {k:'th',z:13,g:0.1,area:inBC,pt:1,src:'Recreation Sites & Trails BC',url:function(b){ return WFS('WHSE_FOREST_TENURE.FTEN_REC_TRAIL_HEADS_SVW',b,"LIFE_CYCLE_STATUS_CODE='ACTIVE'",'PROJECT_NAME,SITE_LOCATION,ACTIVITY_DESC1,ACTIVITY_DESC2,ACTIVITY_DESC3,PROJECT_DESCRIPTION') },
        id:function(f){ return f.id }, st:function(){ return {radius:6,color:'#fff',weight:2,opacity:1,fillColor:'#2e7d32',fillOpacity:1} },
        pop:function(p){ var a=[p.ACTIVITY_DESC1,p.ACTIVITY_DESC2,p.ACTIVITY_DESC3].filter(Boolean); return '<b>🥾 '+esc(cap(p.PROJECT_NAME)||'Trailhead')+'</b><br>Trailhead'+(p.SITE_LOCATION?' · near '+esc(cap(p.SITE_LOCATION)):'')+(a.length?'<br>'+esc(a.join(', ')):'')+(p.PROJECT_DESCRIPTION?'<br><small>'+esc(String(p.PROJECT_DESCRIPTION).trim().slice(0,160))+'…</small>':'') }},
      {k:'rs',z:11,g:0.2,area:inBC,pt:1,src:'Recreation Sites & Trails BC',url:function(b){ return WFS('WHSE_FOREST_TENURE.FTEN_REC_SITE_POINTS_SVW',b,'','FOREST_FILE_ID,PROJECT_NAME,SITE_LOCATION,NUM_CAMP_SITES,ACTIVITY_DESC1,ACTIVITY_DESC2,ACTIVITY_DESC3,SUB_ACCESS_DESC1,STRUCTURE_DESC1,CLOSURE_DESCRIPTION,PROJECT_DESCRIPTION') },
        id:function(f){ return f.properties.FOREST_FILE_ID||f.id }, st:function(){ return {} }, icon:function(p){ return picnic(!!p.CLOSURE_DESCRIPTION) },
        pop:function(p){ var a=[p.ACTIVITY_DESC1,p.ACTIVITY_DESC2,p.ACTIVITY_DESC3].filter(Boolean), n=+p.NUM_CAMP_SITES||0, x=[]; if(p.SUB_ACCESS_DESC1) x.push(esc(p.SUB_ACCESS_DESC1)+' access'); if(p.STRUCTURE_DESC1) x.push(esc(cap(p.STRUCTURE_DESC1)));
          return '<b>⛺ '+esc(cap(p.PROJECT_NAME)||'Recreation site')+'</b><br>Recreation site'+(n?' · '+n+' campsite'+(n>1?'s':''):'')+(p.SITE_LOCATION?' · near '+esc(cap(p.SITE_LOCATION)):'')+(p.CLOSURE_DESCRIPTION?'<br><b style="color:#ff3b30">Closed: '+esc(String(p.CLOSURE_DESCRIPTION).trim().slice(0,120))+'</b>':'')+(a.length?'<br>'+esc(a.join(', ')):'')+(x.length?'<br><small>'+x.join(' · ')+'</small>':'')+(p.PROJECT_DESCRIPTION?'<br><small>'+esc(String(p.PROJECT_DESCRIPTION).trim().slice(0,110))+'…</small>':'') }},
      {k:'rsu',dk:'rs',z:11,g:0.2,area:inBC,pt:1,src:'BC recreation site records',url:function(b){ return WFS('WHSE_FOREST_TENURE.FTEN_RECREATION_POLY_SVW',b,"PROJECT_TYPE='Recreation Site' AND LIFE_CYCLE_STATUS_CODE='ACTIVE'",'FOREST_FILE_ID,PROJECT_NAME,SITE_LOCATION,DEFINED_CAMPSITES') },
        tf:toPts, ok:function(p){ return !!siteIds&&!siteIds[p.FOREST_FILE_ID] }, id:function(f){ return f.properties.FOREST_FILE_ID||f.id }, st:function(){ return {} }, icon:function(){ return picnic(false,true) },
        pop:function(p){ var n=+p.DEFINED_CAMPSITES||0; return '<b>⛺ '+esc(cap(p.PROJECT_NAME)||'Recreation site')+'</b><br>Recreation site (unlisted)'+(n?' · '+n+' campsite'+(n>1?'s':''):'')+(p.SITE_LOCATION?' · near '+esc(cap(p.SITE_LOCATION)):'')+'<br><small>Government record only, no public details. It may not be maintained: check before you go.</small>' }},
      {k:'frd',z:13,g:0.05,area:inBC,src:'BC Forest Tenures (road permits)',url:function(b){ return WFS('WHSE_FOREST_TENURE.FTEN_ROAD_SECTION_LINES_SVW',b,"LIFE_CYCLE_STATUS_CODE='ACTIVE' AND FILE_TYPE_DESCRIPTION<>'Forest Service Road'",'FOREST_FILE_ID,ROAD_SECTION_ID,ROAD_SECTION_NAME,FILE_TYPE_DESCRIPTION,CLIENT_NAME,LOCATION') },
        id:function(f){ return f.id }, st:function(){ return {color:C.motor,weight:2.4,opacity:.9} },
        pop:function(p){ return '<b>'+esc(cap(p.LOCATION)||'Forest road')+'</b><br>Forest road · '+esc(p.FILE_TYPE_DESCRIPTION||'Road permit')+(p.CLIENT_NAME?'<br><small>'+esc(cap(p.CLIENT_NAME))+' · permit '+esc(p.FOREST_FILE_ID||'')+' '+esc(p.ROAD_SECTION_ID||'')+'</small>':'')+'<br><small>Industrial road: watch for logging trucks.</small>' }},
      {k:'fom',z:13,g:0.1,area:inBC,src:'Forest Operations Map (FOM)',url:function(b){ return WFS('WHSE_FOREST_TENURE.FOM_ROAD_SECTION_SP',b,'','FOM_ID,NAME,FSP_HOLDER_NAME,LIFECYCLE_STATUS,PLANNED_DEVELOPMENT_DATE','SHAPE') },
        id:function(f){ return f.id }, st:function(){ return {color:'#ff9800',weight:2.6,opacity:.95,dashArray:'6,5'} },
        pop:function(p){ return '<b>Planned forest road</b><br>'+esc(p.LIFECYCLE_STATUS==='Final'?'Final plan':'Proposed')+(dt(p.PLANNED_DEVELOPMENT_DATE)?' · build from '+esc(dt(p.PLANNED_DEVELOPMENT_DATE)):'')+'<br><small>'+esc(cap(p.FSP_HOLDER_NAME||''))+(p.NAME?' · '+esc(p.NAME):'')+' · FOM '+esc(p.FOM_ID||'')+'</small><br><small>May not exist yet.</small>' }},
      {k:'bcts',z:13,g:0.1,area:inBC,src:'BC Timber Sales',url:function(b){ return WFS('WHSE_FOREST_TENURE.BCTS_PLANNED_ROADS_SP',b,'','ROAD_NAME,ROAD_STATE,TIMBER_SALES_OFFICE_NAME,ROAD_LENGTH','SHAPE') },
        id:function(f){ return f.id }, st:function(p){ var s=p.ROAD_STATE; return s==='PROP'?{color:'#ff9800',weight:2.6,opacity:.95,dashArray:'2,5'}:/MAIN|NEBU/.test(s)?{color:C.motor,weight:2.4,opacity:.9}:{color:'#9e9e9e',weight:2.2,opacity:.9,dashArray:'3,4'} },
        pop:function(p){ return '<b>'+esc(BCTS[p.ROAD_STATE]||'Timber sale road')+'</b><br>BC Timber Sales · '+esc(p.TIMBER_SALES_OFFICE_NAME||'')+'<br><small>'+esc(p.ROAD_NAME||'')+(p.ROAD_LENGTH?' · '+Math.round(p.ROAD_LENGTH)+' m':'')+'</small>' }},
      {k:'mvr',z:10,g:0.25,area:inBC,src:'Wildlife Act (Motor Vehicle Prohibition Regulation)',url:function(b){ return WFS('WHSE_WILDLIFE_MANAGEMENT.WAA_MVPR_ROUTES_SP',b,'','ROAD_NAME,ACCESS_STATUS,ACCESS_RANGE,REGULATION_GEOGRAPHIC_NAME,PROHIBITION_TYPE,MAP_NUMBER','SHAPE') },
        id:function(f){ return f.id }, st:function(p){ return !rNow(p)?{color:'#fff',weight:6,opacity:.95,dashArray:'1,9',lineCap:'round'}:{color:'#00bfa5',weight:3.4,opacity:.95} },
        pop:function(p){ var cl=!rNow(p); return '<b>'+esc(p.ROAD_NAME||'Road')+'</b><br><span style="color:'+(cl?'#e53935':'#00897b')+';font-weight:600">'+(cl?'Closed to vehicles today':'Open today')+'</span><br><small>'+esc(p.ACCESS_STATUS||'')+'</small><br><small>'+esc(p.ACCESS_RANGE||'')+' · '+esc(p.REGULATION_GEOGRAPHIC_NAME||'')+'</small>'+(/Hunting/.test(p.PROHIBITION_TYPE||'')?'<br><small>Applies when hunting.</small>':'')+'<br><small>Map '+esc(p.MAP_NUMBER||'')+'</small>' }},
      {k:'fsr',z:10,g:0.25,area:inBC,src:'BC Forest Tenures (official FSR list)',url:function(b){ return WFS('WHSE_FOREST_TENURE.FTEN_ROAD_SECTION_LINES_SVW',b,"RETIREMENT_DATE IS NULL AND FILE_TYPE_DESCRIPTION='Forest Service Road'",'FOREST_FILE_ID,ROAD_SECTION_ID,ROAD_SECTION_NAME,FILE_TYPE_DESCRIPTION') },
        id:function(f){ return f.id }, st:function(){ return {color:C.fsr,weight:5,opacity:.95} },
        pop:function(p){ return '<b>'+esc(cap(p.ROAD_SECTION_NAME)||'Forest Service Road')+' FSR</b><br>Forest Service Road · file '+esc(p.FOREST_FILE_ID||'')+(p.ROAD_SECTION_ID?' section '+esc(p.ROAD_SECTION_ID):'') }},
      {k:'usr',z:13,g:0.1,area:inUS,src:'US Forest Service roads',url:function(b){ return AGS('EDW_RoadBasic_01',b,"oper_maint_level NOT LIKE '1%'",'objectid,id,name,oper_maint_level,surface_type') },
        id:function(f){ return 'r'+(f.properties.objectid||f.id) }, st:function(p){ return {color:C.motor,weight:/^2/.test(p.oper_maint_level||'')?1.8:2.6,opacity:.85} },
        pop:function(p){ return '<b>'+esc(p.name?cap(p.name):'Forest road '+(p.id||''))+'</b><br>'+esc(String(p.oper_maint_level||'').replace(/^\d+ - /,'').toLowerCase())+(p.surface_type?' · '+esc(String(p.surface_type).replace(/^\w+ - /,'').toLowerCase()):'') }},
      {k:'ust',z:12,g:0.1,area:inUS,src:'US Forest Service trails',url:function(b){ return AGS('EDW_TrailNFSPublish_01',b,"trail_type='TERRA'",'objectid,trail_name,terra_motorized,bicycle_managed,bicycle_accpt') },
        id:function(f){ return 't'+(f.properties.objectid||f.id) }, st:function(p){ var k=usTrail(p); return {color:C[k],weight:2.6,opacity:.95,dashArray:k==='walk'?'5,3':null} },
        pop:function(p){ return '<b>'+esc(cap(p.trail_name)||'Forest trail')+'</b><br>'+KIND[usTrail(p)] }}
    ];
    function keys(s,b){ var g=s.g, out=[]; for(var y=Math.floor(b.s/g);y<=Math.floor(b.n/g);y++) for(var x=Math.floor(b.w/g);x<=Math.floor(b.e/g);x++) out.push([x,y]); return out }
    // each map square is drawn as its own small layer, and squares that leave the screen are dropped, so zooming and panning stay smooth
    var GK={walk:'fsrWalk',bike:'fsrBike',motor:'fsrMotor',fsr:'fsrFsr',road:'fsrRoad',plan:'fsrPlan',th:'fsrTh',camp:'fsrCamp',close:'fsrClose'};
    function grp(s,p){ switch(s.k){ case 'dra': return p.ROAD_CLASS==='trail'?['walk']:['road']; case 'rec': var i=recInfo&&recInfo[p.FOREST_FILE_ID]; return [i?i.k:'walk']; case 'th': return ['th']; case 'rs': case 'rsu': return ['camp']; case 'frd': case 'usr': return ['road']; case 'fsr': return ['fsr']; case 'fom': return ['plan']; case 'bcts': return p.ROAD_STATE==='PROP'?['bcts','plan']:['bcts']; case 'mvr': return ['close']; case 'ust': return [usTrail(p)] } return [] }
    function shown(s,p){ return grp(s,p).every(function(g){ if(RG[g]&&!fsrMode) return false; return g==='bcts'?cfg2.fsrBcts!=='0':cfg2[GK[g]]!=='0' }) }
    function op(){ var v=parseFloat(cfg2.fsrOp); return v>0&&v<=1?v:1 }
    function kOf(v){ v=parseFloat(v); return v>0&&v<=1?v:1 }
    function isRoad(s,p){ var g=grp(s,p); return g.indexOf('fsr')>=0||g.indexOf('road')>=0||(s.k==='bcts'&&/MAIN|NEBU/.test(p.ROAD_STATE||'')) }
    function fadeK(o,k){ o=Object.assign({},o); if(o.opacity!=null) o.opacity*=k; if(o.fillOpacity!=null) o.fillOpacity*=k; return o }
    function fade(o){ var k=op(); o=Object.assign({},o); if(o.opacity!=null) o.opacity*=k; if(o.fillOpacity!=null) o.fillOpacity*=k; return o }
    function opts(s,key){ return {renderer:R,smoothFactor:2,interactive:true,style:function(f){ var p=f.properties||{}; return isRoad(s,p)?fadeK(s.st(p),kOf(cfg2.fsrRdOp)):fade(s.st(p)) },pointToLayer:function(f,ll){ return s.icon?L.marker(ll,{icon:s.icon(f.properties||{}),opacity:op(),keyboard:false}):L.circleMarker(ll,Object.assign({renderer:R},fade(s.st(f.properties||{})))) },
      filter:function(f){ if(!shown(s,f.properties||{})) return false; if(s.ok&&!s.ok(f.properties||{})) return false; var id=s.id(f); if(id==null) return true; var m=seen[s.dk||s.k]||(seen[s.dk||s.k]={}); if(m[id]) return false; m[id]=key; return true },
      onEachFeature:function(f,l){ l.bindPopup(function(){ return s.pop(f.properties||{})+'<br><small style="opacity:.7">'+esc(s.src)+'</small><button type="button" class="trrep trrepb">Report trail here</button>' },{closeButton:false}) }} }
    function draw(s,key){ if(drawn[key]||!data[key]) return; drawn[key]=L.geoJSON(data[key],opts(s,key)).addTo(map) }
    function drop(key){ var l=drawn[key]; if(!l) return; map.removeLayer(l); delete drawn[key]; var k=key.split(':')[0], s1=SRC.filter(function(x){return x.k===k})[0], m=seen[(s1&&s1.dk)||k]; if(m) Object.keys(m).forEach(function(id){ if(m[id]===key) delete m[id] }) }
    // thin out the line points (about 4 m accuracy) so redrawing on zoom stays quick
    function rdp(p,t){ if(p.length<3) return p; var keepI=new Uint8Array(p.length), st=[[0,p.length-1]]; keepI[0]=keepI[p.length-1]=1;
      while(st.length){ var r=st.pop(), a=p[r[0]], b=p[r[1]], dx=b[0]-a[0], dy=b[1]-a[1], d2=dx*dx+dy*dy, mx=0, mi=-1;
        for(var i=r[0]+1;i<r[1];i++){ var q=p[i], u=d2?((q[0]-a[0])*dx+(q[1]-a[1])*dy)/d2:0; u=u<0?0:u>1?1:u; var ex=a[0]+u*dx-q[0], ey=a[1]+u*dy-q[1], e=ex*ex+ey*ey; if(e>mx){ mx=e; mi=i } }
        if(mi>0&&mx>t*t){ keepI[mi]=1; st.push([r[0],mi],[mi,r[1]]) } }
      var o=[]; for(var k=0;k<p.length;k++) if(keepI[k]) o.push([Math.round(p[k][0]*1e5)/1e5,Math.round(p[k][1]*1e5)/1e5]); return o }
    function thin(j){ (j.features||[]).forEach(function(f){ var g=f.geometry; if(!g) return; if(g.type==='LineString') g.coordinates=rdp(g.coordinates,4e-5); else if(g.type==='MultiLineString') g.coordinates=g.coordinates.map(function(c){ return rdp(c,4e-5) }) }); return j }
    function keep(key,j){ j=thin(j); data[key]=j; dataKeys.push(key); if(dataKeys.length>120){ var old=dataKeys.shift(); if(!drawn[old]) delete data[old] } }
    function load(){ if(!on) return; var z=map.getZoom(), bb=map.getBounds().pad(.1), b={s:bb.getSouth(),n:bb.getNorth(),w:bb.getWest(),e:bb.getEast()}, want={};
      if(hint){ hint.hidden=z>=13||!fsrMode; hint.textContent=z<12?'Zoom in for trails':'Zoom in for all roads' }
      SRC.forEach(function(s){ if(z<s.z||(RSRC[s.k]&&!fsrMode)) return; var ks=keys(s,b); if(ks.length>24) return;
        ks.forEach(function(k){ var key=s.k+':'+k[0]+'_'+k[1], tb={w:k[0]*s.g,s:k[1]*s.g,e:(k[0]+1)*s.g,n:(k[1]+1)*s.g}; if(!s.area(tb)) return; want[key]=1;
          if(data[key]){ draw(s,key); return } if(busy[key]) return; busy[key]=1;
          fetch(s.url(tb)).then(function(r){ return r.ok?r.json():null }).then(function(j){ delete busy[key]; if(!j||!j.features) return; if(s.tf) j=s.tf(j); keep(key,j); if(on&&wantNow[key]) draw(s,key) }).catch(function(){ delete busy[key] }) }) });
      wantNow=want; Object.keys(drawn).forEach(function(key){ if(!want[key]) drop(key) }) }
    var wantNow={};
    // OpenStreetMap trails and tracks (vector tiles), drawn only when zoomed in
    function osm(){ if(vg||vgP) return; vgP=new Promise(function(res,rej){ if(L.vectorGrid) return res(); var s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/leaflet.vectorgrid@1.3.0/dist/Leaflet.VectorGrid.bundled.min.js'; s.integrity='sha384-QDTA8MXPewzk8Ryt7UyfUmk+WcHcVYLcxAydowJk1WPgwjdXOIlJIDz25ITLVwTl'; s.crossOrigin='anonymous'; s.onload=res; s.onerror=rej; document.head.appendChild(s) })
      .then(function(){ return fetch('https://tiles.openfreemap.org/planet').then(function(r){return r.json()}) }).then(function(tj){ var url=tj&&tj.tiles&&tj.tiles[0]; if(!url||!/^https:\/\/tiles\.openfreemap\.org\//.test(url)) throw 0;
        var hide=function(){return []}, st={}; ['water','landcover','landuse','mountain_peak','park','boundary','aeroway','building','water_name','transportation_name','place','housenumber','poi','aerodrome_label'].forEach(function(k){ st[k]=hide });
        st.waterway=function(p,z){ if(cfg2.water==='0'||z>=13||!/^(stream|river|brook|canal)$/.test(p.class||'')) return []; return fadeK({color:'#4dd0e1',weight:p.class==='river'?2.6:1.6,opacity:.9},kOf(cfg2.waterOp)) };
        st.transportation=function(p,z){ if(cfg2.fsrOsm==='0'||z<13) return []; if(p.class==='track') return cfg2.fsrMotor==='0'||!fsrMode?[]:fadeK({color:C.motor,weight:2,opacity:.9},kOf(cfg2.fsrRdOp)); if(p.class==='path'){ if(p.subclass==='cycleway') return cfg2.fsrBike==='0'?[]:fade({color:C.bike,weight:2.4,opacity:.95}); if(p.subclass==='steps'||p.subclass==='platform'||p.subclass==='corridor') return []; return cfg2.fsrWalk==='0'?[]:fade({color:C.walk,weight:2,opacity:.95,dashArray:'4,3'}) } return [] };
        vg=L.vectorGrid.protobuf(url,{vectorTileLayerStyles:st,maxNativeZoom:14,minZoom:12,interactive:false,rendererFactory:L.canvas.tile,attribution:'Trails © OpenStreetMap (OpenFreeMap)'}); if(on) vg.addTo(map) })
      .catch(function(){ vgP=null }) }
    var aD=null, aP=null, aG=L.layerGroup(), aLay={}, MONS={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11}, lastPop=0;
    function aToday(w){ var m=/([A-Za-z]{3})[a-z]*\.? (\d{1,2}) (?:to|-) ([A-Za-z]{3})[a-z]*\.? (\d{1,2})/.exec(String(w||'')); if(!m||MONS[m[1].toLowerCase()]==null||MONS[m[3].toLowerCase()]==null) return true; var d=new Date(), v=d.getMonth()*100+d.getDate(), a=MONS[m[1].toLowerCase()]*100+(+m[2]), b=MONS[m[3].toLowerCase()]*100+(+m[4]), inR=a<=b?(v>=a&&v<=b):(v>=a||v<=b); return /^open/i.test(w)?!inR:inR }
    function aDec(s){ var i=0, la=0, lo=0, out=[]; while(i<s.length){ var r=0, sh=0, b; do{ b=s.charCodeAt(i++)-63; r|=(b&31)<<sh; sh+=5 }while(b>=32); la+=(r&1)?~(r>>1):(r>>1); r=0; sh=0; do{ b=s.charCodeAt(i++)-63; r|=(b&31)<<sh; sh+=5 }while(b>=32); lo+=(r&1)?~(r>>1):(r>>1); out.push([la/1e4,lo/1e4]) } return out }
    function aIn(la,lo,r){ var c=false; for(var i=0,j=r.length-1;i<r.length;j=i++){ var yi=r[i][0], xi=r[i][1], yj=r[j][0], xj=r[j][1]; if(((yi>la)!==(yj>la))&&(lo<(xj-xi)*(la-yi)/(yj-yi)+xi)) c=!c } return c }
    function areas(){ if(!on) return; var z=map.getZoom(); if(z<9||cfg2.fsrClose==='0'){ aG.clearLayers(); aLay={}; return }
      if(!aD){ if(!aP) aP=fetch('sled-zones.json').then(function(r){ return r.ok?r.json():null }).then(function(j){ if(j&&j.f){ aD=j.f.filter(function(f){ return !f.l&&f.w!=='Road Closure'&&(f.k==='mv'||(f.k==='c'&&/ATV/.test(f.t||''))) }); areas() } else aP=null }).catch(function(){ aP=null }); return }
      var b=map.getBounds().pad(.2), w=b.getWest(), e=b.getEast(), so=b.getSouth(), n=b.getNorth();
      aD.forEach(function(f,i){ var vis=f.b[0]<e&&f.b[2]>w&&f.b[1]<n&&f.b[3]>so, l=aLay[i];
        if(vis&&!l){ if(!f._ll) f._ll=f.g.map(function(p){ return p.map(aDec) }); var act=aToday(f.w); l=aLay[i]=L.polygon(f._ll,fade({renderer:R,interactive:false,color:act?'#e65100':'#90a4ae',weight:2,opacity:.9,dashArray:'6,4',fillColor:act?'#ff6d00':'#90a4ae',fillOpacity:act?.12:.04})); l._af=f; l._act=act; aG.addLayer(l) }
        else if(!vis&&l){ aG.removeLayer(l); delete aLay[i] } }) }
    map.on('popupopen',function(){ lastPop=Date.now() });
    map.on('click',function(e){ if(!on||!aD) return; setTimeout(function(){ if(Date.now()-lastPop<400) return; var la=e.latlng.lat, lo=e.latlng.lng, hit=null;
      Object.keys(aLay).forEach(function(i){ var l=aLay[i], f=l._af; if(hit||la<f.b[1]||la>f.b[3]||lo<f.b[0]||lo>f.b[2]) return; if(f._ll.some(function(p){ return aIn(la,lo,p[0]) })) hit=l });
      if(hit){ var f=hit._af; L.popup({closeButton:false,maxWidth:250}).setLatLng(e.latlng).setContent('<b>'+esc(f.n||'Closed area')+'</b><br><span style="color:'+(hit._act?'#e65100':'#78909c')+';font-weight:600">'+(hit._act?'Closed to motor vehicles now':'Not in effect today')+'</span><br><small>'+esc(f.t||'')+(f.w?' · '+esc(f.w):'')+'</small><br><small>Wildlife Act closure'+(f.m?' · map '+esc(f.m):'')+'. Some entries allow certain vehicles: check the official map.</small><br><small><a href="https://www2.gov.bc.ca/gov/content/sports-culture/recreation/motor-vehicle-prohibitions" target="_blank" rel="noopener">Official maps ›</a></small>').openOn(map) } },40) });
    function mode(v){ v=!!v; if(v===fsrMode) return; fsrMode=v; if(leg) leg.hidden=!(on&&v); if(hint&&!v) hint.hidden=true; refresh() }
    function set(v){ if(v===on) return; on=v; if(leg) leg.hidden=!(v&&fsrMode); if(v){ recLoad(); siteLoad(); aG.addTo(map) } else { map.removeLayer(aG); aG.clearLayers(); aLay={} }
      if(v){ map.attributionControl.addAttribution('Roads & trails: BC Gov (DataBC: DRA, FTEN, FOM, BCTS, RSTBC, Wildlife Act), USDA Forest Service'); osm(); if(vg) vg.addTo(map); load(); areas() }
      else { map.attributionControl.removeAttribution('Roads & trails: BC Gov (DataBC: DRA, FTEN, FOM, BCTS, RSTBC, Wildlife Act), USDA Forest Service'); if(vg&&map.hasLayer(vg)) map.removeLayer(vg); Object.keys(drawn).forEach(drop); seen={}; wantNow={} } }
    map.on('moveend',function(){ if(!on) return; clearTimeout(mvT); mvT=setTimeout(function(){ load(); areas() },350) });
    function refresh(){ if(!on) return; Object.keys(drawn).forEach(drop); seen={}; aG.clearLayers(); aLay={}; load(); areas(); if(vg){ vg.redraw() } }
    window.__fsr={set:set,mode:mode,load:load,refresh:refresh,help:{rNow:rNow,aToday:aToday,aIn:aIn,aDec:aDec},urls:function(b){ var o=[]; SRC.forEach(function(s){ if(!s.url) return; keys(s,b).forEach(function(k){ var tb={w:k[0]*s.g,s:k[1]*s.g,e:(k[0]+1)*s.g,n:(k[1]+1)*s.g}; if(s.area(tb)) o.push(s.url(tb)) }) });
      o.push('https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_FOREST_TENURE.FTEN_REC_TRAILS_SVW&outputFormat=json&count=5000&propertyName=FOREST_FILE_ID,ACTIVITY_DESC1,ACTIVITY_DESC2,ACTIVITY_DESC3,MAINTAIN_STD_DESC,OPERATOR_CLIENT_NAME'); o.push(SITES); return o }};
    // Layer lists: tap Satellite or FSR again (when it is on) to show or hide its own layers.
    // On road: trails, camping, creeks, GPS traces, closures. Off road: forest service roads plus camping, creeks, OSM trails, GPS traces and closures (shared chips).
    (function(){ var fb=document.querySelector('.seg button[data-b=fsr]'), sb=document.querySelector('.seg button[data-b=sat]'); if(!fb||!sb) return; var bc=document.body.classList, all=[];
      function mk(btn,name,title,CH,SE){ var pn=document.createElement('div'); pn.className='lyrp'; pn.hidden=true; pn.setAttribute('role','dialog'); pn.setAttribute('aria-label',title);
        pn.innerHTML='<div class="fph"><span>'+title+'</span><button type="button" class="fpx" aria-label="Close '+title+'">✕</button></div><div class="fpc">'+CH.map(function(c){ return '<button type="button" data-s="'+c[0]+'"><i style="border-top:3px '+c[3]+' '+c[2]+'"></i>'+c[1]+'</button>' }).join('')+'</div>'+
          SE.map(function(x){ var o=document.getElementById(x[0]); return '<label class="fps">'+x[1]+'<select data-s="'+x[0]+'">'+(o?o.innerHTML:'')+'</select></label>' }).join('');
        document.getElementById('map').parentNode.appendChild(pn);
        function sync(){ [].forEach.call(pn.querySelectorAll('.fpc button'),function(b){ var o=document.getElementById(b.getAttribute('data-s')); b.setAttribute('aria-pressed',o&&o.value!=='0'?'true':'false') }); [].forEach.call(pn.querySelectorAll('select'),function(sl){ var o=document.getElementById(sl.getAttribute('data-s')); if(o) sl.value=o.value }) }
        function push(id,v){ var o=document.getElementById(id); if(!o) return; o.value=v; o.dispatchEvent(new Event('change')); sync() }
        [].forEach.call(pn.querySelectorAll('.fpc button'),function(b){ b.onclick=function(){ push(b.getAttribute('data-s'),b.getAttribute('aria-pressed')==='true'?'0':'1') } });
        [].forEach.call(pn.querySelectorAll('select'),function(sl){ sl.onchange=function(){ push(sl.getAttribute('data-s'),sl.value) } });
        function show(v){ if(v){ sync(); all.forEach(function(p){ if(p.pn!==pn) p.show(false) }) } pn.hidden=!v; btn.setAttribute('aria-expanded',v?'true':'false') }
        pn.querySelector('.fpx').onclick=function(){ show(false) };
        var was=false; btn.addEventListener('click',function(){ was=btn.getAttribute('aria-pressed')==='true' },true);
        btn.addEventListener('click',function(){ show(was?pn.hidden:true) });
        function lbl(){ var on=btn.getAttribute('aria-pressed')==='true'; btn.textContent=on?name+' ▾':name; if(!on) show(false) }
        if(window.MutationObserver){ new MutationObserver(lbl).observe(btn,{attributes:true,attributeFilter:['aria-pressed']});
          new MutationObserver(function(){ bc.toggle('fsrp',all.some(function(p){ return !p.pn.hidden })); if(!pn.hidden) bc.remove('menuon','toolon','keyon') }).observe(pn,{attributes:true,attributeFilter:['hidden']}) }
        lbl(); var o={pn:pn,show:show,sync:sync}; all.push(o); return o }
      var fp=mk(fb,'Off road','Off road layers',[['s_fsrFsr','FSRs','#ff1744','solid'],['s_fsrRoad','Back roads','#ff3b30','solid'],['s_fsrMotor','Motor & 4x4','#ff3b30','solid'],['s_fsrBcts','Timber sales','#9e9e9e','dashed'],['s_fsrPlan','Planned','#ff9800','dashed'],['s_fsrClose','Closures','#ffffff','dotted'],['s_fsrCamp','Camping','#ffb300','dotted'],['s_water','Creeks','#4dd0e1','solid'],['s_fsrOsm','OSM trails','#3ddc5a','dashed'],['s_gpsTr','GPS traces','#b388ff','solid']],[['s_fsrRdOp','Road lines see-through']]);
      var sp=mk(sb,'On road','On road layers',[['s_fsrWalk','Walking','#3ddc5a','dashed'],['s_fsrBike','Biking','#40a9ff','solid'],['s_fsrTh','Trailheads','#2e7d32','dotted'],['s_fsrCamp','Camping','#ffb300','dotted'],['s_water','Creeks','#4dd0e1','solid'],['s_fsrOsm','OSM trails','#3ddc5a','dashed'],['s_gpsTr','GPS traces','#b388ff','solid'],['s_fsrClose','Closures','#ffffff','dotted']],[['s_fsrOp','Trail lines see-through'],['s_waterOp','Creeks see-through']]);
      var pn=sp.pn; function show(v){ all.forEach(function(p){ p.show(v) }) } function sync(){ all.forEach(function(p){ p.sync() }) }
      map.on('click dragstart',function(){ show(false) });
      var ff=document.getElementById('fsfolder'); if(ff) ff.style.display='none';
      if(window.MutationObserver){ new MutationObserver(function(){ if(all.some(function(p){ return !p.pn.hidden })&&(bc.contains('menuon')||bc.contains('toolon')||bc.contains('keyon'))) show(false) }).observe(document.body,{attributes:true,attributeFilter:['class']});
        var dk=document.getElementById('dock'); if(dk) new MutationObserver(function(){ if(!dk.hidden){ bc.remove('toolon','keyon'); var t=document.getElementById('toolbtn'); if(t) t.setAttribute('aria-expanded','false'); show(false) } }).observe(dk,{attributes:true,attributeFilter:['hidden']}) }
      // GPS traces layer + your own GPX tracks (Satellite layers list, shown on both maps)
      (function(){ var KEY='sky-gpx', TK='sky-gpstr', files=[], G=L.layerGroup(), RR=map.getRenderer(L.polyline([[0,0],[0,0]])), COL=['#ff9800','#e040fb','#00e5ff','#ffeb3b','#ff4081','#76ff03'];
        try{ files=JSON.parse(localStorage.getItem(KEY)||'[]')||[] }catch(e){ files=[] } if(!Array.isArray(files)) files=[];
        var tr=L.tileLayer('https://gps.tile.openstreetmap.org/lines/{z}/{x}/{y}.png',{minZoom:9,maxZoom:19,maxNativeZoom:18,opacity:.8,zIndex:6,attribution:'GPS traces © OpenStreetMap contributors'});
        var hs=document.createElement('select'); hs.id='s_gpsTr'; hs.hidden=true; hs.innerHTML='<option value="1">1</option><option value="0">0</option>'; try{ hs.value=localStorage.getItem(TK)==='0'?'0':'1' }catch(e){ hs.value='1' } document.body.appendChild(hs);
        hs.onchange=function(){ try{ localStorage.setItem(TK,hs.value) }catch(e){} vis() };
        function vis(){ var on=true; if(on&&hs.value!=='0'){ if(!map.hasLayer(tr)) tr.addTo(map) } else if(map.hasLayer(tr)) map.removeLayer(tr); if(on&&files.length){ if(!map.hasLayer(G)) G.addTo(map) } else if(map.hasLayer(G)) map.removeLayer(G) }
        function draw(){ G.clearLayers(); files.forEach(function(f,i){ var c=COL[i%COL.length]; (f.l||[]).forEach(function(seg){ L.polyline(seg,{renderer:RR,color:'#000',weight:6,opacity:.35,interactive:false}).addTo(G); L.polyline(seg,{renderer:RR,color:c,weight:3.5,opacity:.95}).bindPopup('<b>'+esc(f.n)+'</b><br><small>Your GPX track · '+(f.k|0)+' km</small><button type="button" class="trrep trrepb">Report trail here</button>',{closeButton:false}).addTo(G) });
          (f.w||[]).forEach(function(w){ L.circleMarker([w[0],w[1]],{renderer:RR,radius:5,color:'#fff',weight:2,fillColor:c,fillOpacity:1}).bindPopup('<b>'+esc(w[2]||'Waypoint')+'</b><br><small>'+esc(f.n)+'</small>',{closeButton:false}).addTo(G) }) }); vis() }
        function save(){ try{ localStorage.setItem(KEY,JSON.stringify(files)); return true }catch(e){ return false } }
        var gv=document.createElement('div'); gv.className='gpxv'; gv.hidden=true; pn.appendChild(gv);
        var hd=pn.querySelector('.fph'), gb=document.createElement('button'); gb.type='button'; gb.className='gpxb'; hd.insertBefore(gb,hd.querySelector('.fpx'));
        var fi=document.createElement('input'); fi.type='file'; fi.accept='.gpx,application/gpx+xml,application/xml,text/xml'; fi.multiple=true; fi.hidden=true; pn.appendChild(fi);
        function lab(){ gb.textContent=gv.hidden?'GPX'+(files.length?' ('+files.length+')':'')+' ▾':'‹ Layers' }
        function mode(g){ gv.hidden=!g; [].forEach.call(pn.querySelectorAll('.fpc,.fps'),function(e){ e.style.display=g?'none':'' }); if(g) list(); lab() }
        gb.onclick=function(){ mode(gv.hidden) };
        function list(msg){ gv.innerHTML='<button type="button" class="gpxadd">＋ Add GPX file</button>'+(msg?'<div class="gpxmsg">'+esc(msg)+'</div>':'')+(files.length?files.map(function(f,i){ return '<div class="gpxr"><button type="button" data-z="'+i+'"><i style="background:'+COL[i%COL.length]+'"></i><span>'+esc(f.n)+'</span><small>'+(f.k|0)+' km</small></button><button type="button" class="gpxdel" data-d="'+i+'" aria-label="Remove '+esc(f.n)+'">✕</button></div>' }).join(''):'<div class="gpxmsg">Download a .gpx track (DualSportBC, Overland Bound, forums or your own rides), then add it here. Saved on this phone and works offline.</div>');
          gv.querySelector('.gpxadd').onclick=function(){ fi.value=''; fi.click() };
          [].forEach.call(gv.querySelectorAll('[data-z]'),function(b){ b.onclick=function(){ var f=files[+b.getAttribute('data-z')]; if(f&&f.b) map.fitBounds(f.b,{padding:[30,30]}); show(false) } });
          [].forEach.call(gv.querySelectorAll('[data-d]'),function(b){ b.onclick=function(){ files.splice(+b.getAttribute('data-d'),1); save(); draw(); list(); lab() } }) }
        function parse(txt,name){ var x=new DOMParser().parseFromString(txt,'application/xml'); if(x.getElementsByTagName('parsererror').length) throw new Error('bad');
          function pts(nodes){ var a=[]; for(var i=0;i<nodes.length;i++){ var la=parseFloat(nodes[i].getAttribute('lat')), lo=parseFloat(nodes[i].getAttribute('lon')); if(isFinite(la)&&isFinite(lo)&&Math.abs(la)<=90&&Math.abs(lo)<=180) a.push([la,lo]) } return a }
          var segs=[], ts=x.getElementsByTagName('trkseg'); for(var i=0;i<ts.length;i++){ var p=pts(ts[i].getElementsByTagName('trkpt')); if(p.length>1) segs.push(p) }
          var rs=x.getElementsByTagName('rte'); for(var j=0;j<rs.length;j++){ var q=pts(rs[j].getElementsByTagName('rtept')); if(q.length>1) segs.push(q) }
          var wn=x.getElementsByTagName('wpt'), w=[]; for(var k=0;k<wn.length&&w.length<300;k++){ var wa=parseFloat(wn[k].getAttribute('lat')), wo=parseFloat(wn[k].getAttribute('lon')), nm=wn[k].getElementsByTagName('name')[0]; if(isFinite(wa)&&isFinite(wo)) w.push([+wa.toFixed(5),+wo.toFixed(5),nm?String(nm.textContent).trim().slice(0,60):'']) }
          var tot=0; segs.forEach(function(s){ tot+=s.length }); var step=Math.max(1,Math.ceil(tot/6000)), km=0;
          segs=segs.map(function(s){ var o=[]; for(var i=0;i<s.length;i++){ if(i%step===0||i===s.length-1) o.push([+s[i][0].toFixed(5),+s[i][1].toFixed(5)]) } for(var m=1;m<s.length;m++) km+=map.distance(s[m-1],s[m])/1000; return o });
          var all=[]; segs.forEach(function(s){ all=all.concat(s) }); w.forEach(function(p){ all.push([p[0],p[1]]) }); if(!all.length) throw new Error('empty'); var b=L.latLngBounds(all);
          var mt=x.getElementsByTagName('metadata')[0], nmEl=(mt&&mt.getElementsByTagName('name')[0])||x.getElementsByTagName('trk')[0]&&x.getElementsByTagName('trk')[0].getElementsByTagName('name')[0];
          return {n:(String(nmEl&&nmEl.textContent||'').trim()||String(name||'').replace(/\.gpx$/i,'')).slice(0,50)||'Track',k:Math.round(km),l:segs,w:w,b:[[b.getSouth(),b.getWest()],[b.getNorth(),b.getEast()]]} }
        fi.onchange=function(){ var fl=[].slice.call(fi.files||[]); if(!fl.length) return; var done=0, bad=0, last=null, added=0;
          function fin(){ var ok=save(); if(!ok){ files.splice(files.length-added,added); last=null } draw(); lab(); list(!ok?'Phone storage is full: remove a track and try again.':bad?bad+' file'+(bad>1?'s':'')+' could not be read as GPX.':''); if(last){ map.fitBounds(last.b,{padding:[30,30]}); if(!bad) show(false) } }
          fl.forEach(function(f){ if(f.size>15e6){ bad++; if(++done===fl.length) fin(); return } var rd=new FileReader(); rd.onload=function(){ try{ var g=parse(String(rd.result),f.name); files.push(g); added++; last=g }catch(e){ bad++ } if(++done===fl.length) fin() }; rd.onerror=function(){ bad++; if(++done===fl.length) fin() }; rd.readAsText(f) }) };
        if(window.MutationObserver){ new MutationObserver(vis).observe(fb,{attributes:true,attributeFilter:['aria-pressed']}); new MutationObserver(function(){ if(pn.hidden&&!gv.hidden) mode(false) }).observe(pn,{attributes:true,attributeFilter:['hidden']}) }
        lab(); draw(); vis() })();
      document.addEventListener('error',function(e){ var t=e.target; if(t&&t.classList&&t.classList.contains('phimg')&&t.parentNode) t.parentNode.remove() },true);
window.__AW={map:map,base:function(){ return baseLayers },me:function(){ return me },esc:esc,fb:fb,pn:pn,show:show};
    })();
    set(true); mode(baseKey==='fsr');
  })();
  // ---- Planes on/off (off at start, so the app opens on a clean map) ----
  (function(){ var b=document.getElementById('planebtn'); if(!b) return;
    function paint(){ b.classList.toggle('on',planesOn); b.setAttribute('aria-pressed',planesOn?'true':'false') }
    b.onclick=function(){ planesOn=!planesOn; paint();
      if(planesOn){ if(!map.hasLayer(ring)) ring.addTo(map); slow=0; slowUntil=0 }
      else { map.removeLayer(ring); lastData=[]; render([]); var nx=document.getElementById('nextov'); if(nx) nx.hidden=true; var em=document.getElementById('emerg'); if(em) em.hidden=true }
      clearTimeout(timer); if(!busy) poll() };
    map.removeLayer(ring); paint() })();
  (function(){ var mb=document.getElementById('menubtn'), kb=document.getElementById('keybtn'), hub=document.getElementById('hubbtn'); if(!mb||!kb) return;
    function setMenu(v){ if(v){ var n=0, ORD=['roadbtn','firebtn','ltbtn','planebtn','spacebtn','aptbtn','mtbtn','ferrybtn','arbtn','hubbtn'], all=[].slice.call(document.querySelectorAll('.sidebtn.mi')); all.sort(function(a,b){ var i=ORD.indexOf(a.id), j=ORD.indexOf(b.id); return (i<0?50:i)-(j<0?50:j) }); all.forEach(function(b){ if(b.classList.contains('off')) return; b.style.top=(226+n*41)+'px'; n++ }) } document.body.classList.toggle('menuon',v); mb.setAttribute('aria-expanded',v?'true':'false') }
    function setKey(v){ document.body.classList.toggle('keyon',v); kb.setAttribute('aria-expanded',v?'true':'false'); if(v){ var any=[].some.call(document.querySelectorAll('.legends .legend'),function(e){return e.offsetParent!==null}); document.getElementById('knone').hidden=any } }
    mb.onclick=function(){ document.body.classList.remove('tuton'); setKey(false); setMenu(!document.body.classList.contains('menuon')) };
    kb.onclick=function(){ setMenu(false); setKey(!document.body.classList.contains('keyon')) };
    ['spacebtn','hubbtn','arbtn','mtbtn'].forEach(function(id){ var b=document.getElementById(id); if(b) b.addEventListener('click',function(){ setMenu(false) }) });
    map.on('click dragstart',function(){ setMenu(false); setKey(false) });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ setMenu(false); setKey(false) } });
    function mirror(){ mb.classList.toggle('alert1',hub.classList.contains('alert1')); mb.classList.toggle('alert2',hub.classList.contains('alert2')) }
    if(hub&&window.MutationObserver){ new MutationObserver(mirror).observe(hub,{attributes:true,attributeFilter:['class']}); mirror() }
  })();
  document.getElementById('spacex').onclick=function(){spaceTok++;document.getElementById('spacesheet').hidden=true};
  document.getElementById('spacesheet').onclick=function(e){if(e.target===this){spaceTok++;this.hidden=true}};

  // ---- Airports: live weather (aviationweather.gov through the relay) and an arrivals/departures board ----
  var aptOn=false, aptLayer=L.layerGroup().addTo(map), aptData={}, aptSel=null, aptTab='wx', aptT=null, tafCache={};
  aptOn=false;
  var CATC={VFR:'#34c759',MVFR:'#2f8cff',IFR:'#ff3b30',LIFR:'#d63bff'}, CATW={VFR:'Good flying weather',MVFR:'Marginal: low cloud or haze',IFR:'Poor: low cloud or fog',LIFR:'Very poor: very low cloud or fog'};
  function visMi(v){ if(v==null) return null; var n=parseFloat(String(v).replace('+','')); return isFinite(n)?n:null }
  function ceilFt(cl){ var c=null; (cl||[]).forEach(function(x){ if(x&&/^(BKN|OVC|OVX|VV)$/.test(x.cover)&&typeof x.base==='number'&&(c==null||x.base<c)) c=x.base }); return c }
  function fltCat(m){ if(m&&CATC[m.fltCat]) return m.fltCat; var c=ceilFt(m&&m.clouds), v=visMi(m&&m.visib); if(c==null) c=99999; if(v==null) v=10; return (c<500||v<1)?'LIFR':(c<1000||v<3)?'IFR':(c<=3000||v<=5)?'MVFR':'VFR' }
  function loadApts(){ if(!aptOn||map.getZoom()<(cfg2.declutter==='1'?8:6)){aptLayer.clearLayers();aptShown={};drawDir();return}
    var b=map.getBounds(), s0=Math.max(-90,b.getSouth()), n0=Math.min(90,b.getNorth()), w0=Math.max(-180,b.getWest()), e0=Math.min(180,b.getEast());
    if(n0-s0>11||e0-w0>19){aptLayer.clearLayers();return}
    fetch(viaRelay('https://aviationweather.gov/api/data/metar?bbox='+[s0,w0,n0,e0].map(function(v){return v.toFixed(2)}).join(',')+'&format=json')).then(function(r){return r.ok?r.json():null}).then(function(list){
      if(!Array.isArray(list)) return; aptLayer.clearLayers(); aptShown={};
      var wm=cfg2.wxMax==='auto'?(cfg2.declutter==='1'&&map.getZoom()<10?15:0):cfg2.wxMax==='all'?0:+cfg2.wxMax; if(wm){ var cc=cfg2.wxMax==='auto'?[map.getCenter().lat,map.getCenter().lng]:nearPt(); list=list.filter(function(m){return m&&typeof m.lat==='number'&&typeof m.lon==='number'}).sort(function(a,b){return distNm(cc[0],cc[1],a.lat,a.lon)-distNm(cc[0],cc[1],b.lat,b.lon)}).slice(0,wm) }
      list.forEach(function(m){ if(!m||typeof m.lat!=='number'||typeof m.lon!=='number'||!/^[A-Z0-9]{3,4}$/.test(m.icaoId||'')||(m.visib==null&&!m.fltCat)) return; aptData[m.icaoId]=m; var c=fltCat(m); if(cfg2.aptOnlyBad==='1'&&c==='VFR') return;
        aptShown[m.icaoId]=1; L.marker([m.lat,m.lon],{icon:L.divIcon({className:'',html:'<span class="aptmk" style="--c:'+CATC[c]+'">'+esc(m.icaoId)+'</span>',iconSize:[0,0]}),keyboard:false,bubblingMouseEvents:false,zIndexOffset:-300}).on('click',function(){openApt(m.icaoId)}).addTo(aptLayer) }); drawDir() }).catch(function(){}) }
  function zoomClass(){ document.body.classList.toggle('zout',cfg2.declutter==='1'&&map.getZoom()<7) }
  map.on('zoomend',zoomClass); setTimeout(zoomClass,0);
  map.on('moveend',function(){clearTimeout(aptT);aptT=setTimeout(function(){loadApts();loadDir()},800)});
  // ---- Airport directory: every airport and airstrip (OurAirports data, stored with the app in 10° tiles) ----
  var dirLayer=L.layerGroup().addTo(map), dirTiles={}, aptShown={}, aInfo=null, aExtra={}, ATYPE={L:'Large airport',M:'Medium airport',S:'Small airport',W:'Seaplane base'};
  function dirRec(r){ return {id:r[0],ty:r[1],name:r[2],lat:r[3],lon:r[4],elev:r[5],city:r[6],region:r[7],iata:r[8],sched:r[9],home:r[10],wiki:r[11],rws:r[12]||[],fqs:r[13]||[],icao:r[14],cc:r[15],tel:r[16]||''} }
  function tileKey(la,lo){ return Math.floor(la/10)+'_'+Math.floor(lo/10) }
  function getTile(k){ if(dirTiles[k]) return dirTiles[k]; if(!/^-?\d{1,2}_-?\d{1,2}$/.test(k)) return Promise.resolve([]);
    var p=fetch('apt/'+k+'.json').then(function(r){return r.ok?r.json():[]}).then(function(a){ a=Array.isArray(a)?a:[]; dirTiles[k]=Promise.resolve(a); return a }).catch(function(){ delete dirTiles[k]; return [] });
    dirTiles[k]=p; return p }
  var dirGen=0, dirList=[];
  function loadDir(){ var z=map.getZoom(), g=++dirGen; if(cfg2.adir!=='1'||z<(cfg2.declutter==='1'?7:6)){ dirList=[]; dirLayer.clearLayers(); return }
    var b=map.getBounds(), ks={}; for(var la=Math.floor(Math.max(-90,b.getSouth())/10);la<=Math.floor(Math.min(89.99,b.getNorth())/10);la++) for(var lo=Math.floor(Math.max(-180,b.getWest())/10);lo<=Math.floor(Math.min(179.99,b.getEast())/10);lo++) ks[la+'_'+lo]=1;
    var keys=Object.keys(ks); if(keys.length>6){ dirList=[]; dirLayer.clearLayers(); return }
    Promise.all(keys.map(getTile)).then(function(arrs){ if(g!==dirGen) return; dirList=[].concat.apply([],arrs); drawDir() }) }
  function drawDir(){ dirLayer.clearLayers(); if(cfg2.adir!=='1') return; var z=map.getZoom(); if(z<6) return; var b=map.getBounds().pad(0.1), n=0;
    var bigOnly=cfg2.atype==='big';
    var cand=[]; for(var i=0;i<dirList.length&&n<3000;i++){ var r=dirList[i]; var dc=cfg2.declutter==='1'?1:0, mz=r[1]==='L'?6+dc:(r[1]==='M'||r[9])?9+dc:11+dc; if(z<mz||(bigOnly&&mz>9)) continue; if(!b.contains([r[3],r[4]])) continue; if(aptShown[r[14]]||aptShown[r[0]]) continue; n++; cand.push(r) }
    var np=nearPt(); cand.sort(function(a,c){ return distNm(np[0],np[1],a[3],a[4])-distNm(np[0],np[1],c[3],c[4]) }); cand.slice(0,capN(cfg2.aMax,500)).forEach(function(r){
      (function(r){ var big=r[1]==='L'||r[1]==='M'; L.marker([r[3],r[4]],{icon:L.divIcon({className:'',html:'<span class="amk'+(big?' big':'')+'" role="button" aria-label="'+esc(r[2])+'">A</span>',iconSize:[0,0]}),keyboard:false,bubblingMouseEvents:false,zIndexOffset:big?-350:-400,title:r[2]}).on('click',function(){openDir(dirRec(r))}).addTo(dirLayer) })(r) }) }
  setTimeout(loadDir,1200);
  function findDir(icao,lat,lon){ return getTile(tileKey(lat,lon)).then(function(a){ var best=null, bd=1e9; a.forEach(function(r){ if(r[14]===icao||r[0]===icao){ var d=distNm(lat,lon,r[3],r[4]); if(d<bd){bd=d;best=r} } }); return best?dirRec(best):null }) }
  function openDir(rec){ aInfo=rec; aptSel=null; aptTab='info'; document.getElementById('aptsheet').hidden=false;
    var id=rec.icao||rec.id; if(aptData[id]) aptSel=id; aptHead(); aptRender(); moreInfo(rec);
    if(!aptData[id]&&/^[A-Z0-9]{4}$/.test(id)){ var d=0.3; fetch(viaRelay('https://aviationweather.gov/api/data/metar?bbox='+[rec.lat-d,rec.lon-d,rec.lat+d,rec.lon+d].map(function(v){return v.toFixed(2)}).join(',')+'&format=json')).then(function(r){return r.ok?r.json():null}).then(function(list){ (list||[]).forEach(function(m){ if(m&&m.icaoId===id&&(m.visib!=null||m.fltCat)){ aptData[id]=m; if(aInfo===rec){ aptSel=id; aptHead(); aptRender() } } }) }).catch(function(){}) } }
  function aptHead(){ var t=document.getElementById('apttitle'), m=aptSel&&aptData[aptSel], c=m?fltCat(m):null, nm=aInfo?aInfo.name:(m&&m.name)||aptSel||'Airport';
    t.innerHTML='<span style="display:inline-block;max-width:calc(100vw - 140px);font-size:16px;line-height:1.2;vertical-align:middle;overflow:hidden;max-height:2.4em">'+esc(nm)+'</span>'+(c?'<span class="catpill" style="background:'+CATC[c]+'">'+c+'</span>':'');
    [].forEach.call(document.querySelectorAll('#apttabs button'),function(b){ var t2=b.getAttribute('data-t'); b.hidden=(t2==='wx'&&!m)||(t2==='info'&&!aInfo) }) }
  function cleanTel(t){ t=String(t||'').split(/[;,]/)[0].trim(); return /^[+(\d][\d\s().\-]{5,24}$/.test(t)?t:'' }
  function cleanUrl(u){ u=String(u||'').trim(); return /^https?:\/\/[^\s"<>]{3,200}$/i.test(u)?u:'' }
  function moreInfo(rec){ var key=rec.id; if(aExtra[key]) return; var x=aExtra[key]={pend:2}, qDone={};
    function fin(){ x.pend--; trySite(); done() }
    function trySite(){ if(x.tel||rec.tel||x.siteDone||!relay) return; var w=x.web||cleanUrl(rec.home); if(!w){ return } x.siteDone=1; x.pend++;
      fetch(relay+(relay.indexOf('?')>-1?'&':'?')+'phone='+encodeURIComponent(w)).then(function(r){return r.ok?r.json():null}).then(function(j){ var p=j&&Array.isArray(j.phones)?j.phones:[]; for(var i=0;i<p.length&&!x.tel;i++) x.tel=cleanTel(p[i]); if(x.tel) x.telSrc='website' }).catch(function(){}).then(fin) }
    if(rec.home) setTimeout(trySite,0);
    function done(){ if(aInfo&&aInfo.id===key&&aptTab==='info') aptRender() }
    function wsum(t){ if(!t||x.ext) return Promise.resolve(null); return fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(t)).then(function(r){return r.ok?r.json():null}).then(function(j){ if(!j||j.type==='disambiguation'||x.ext) return null; x.ext=String(j.extract||'').slice(0,600); x.thumb=j.thumbnail&&/^https:\/\/upload\.wikimedia\.org\//.test(j.thumbnail.source)?j.thumbnail.source:''; x.wurl=j.content_urls&&j.content_urls.mobile&&cleanUrl(j.content_urls.mobile.page); done(); return j.wikibase_item }).catch(function(){return null}) }
    function wd(q){ if(!q||!/^Q\d+$/.test(q)||qDone[q]) return Promise.resolve(); qDone[q]=1; return fetch('https://www.wikidata.org/w/api.php?action=wbgetentities&ids='+q+'&props=claims|sitelinks|descriptions&languages=en&sitefilter=enwiki&format=json&origin=*').then(function(r){return r.ok?r.json():null}).then(function(j){ var e=j&&j.entities&&j.entities[q]; if(!e) return; var c=e.claims||{};
      function v(p){ var a=c[p]; return a&&a[0]&&a[0].mainsnak&&a[0].mainsnak.datavalue?a[0].mainsnak.datavalue.value:null }
      if(!x.tel) x.tel=cleanTel(v('P1329')); if(!x.web) x.web=cleanUrl(v('P856')); var de=e.descriptions&&e.descriptions.en&&e.descriptions.en.value; if(de&&!x.wdesc) x.wdesc=String(de).slice(0,160); done(); var sl=e.sitelinks&&e.sitelinks.enwiki; if(sl&&sl.title) return wsum(sl.title) }).catch(function(){}) }
    wsum(rec.wiki).then(wd).catch(function(){}).then(fin);
    var nd=0.08;
    fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&extratags=1&limit=3&bounded=1&viewbox='+[rec.lon-nd,rec.lat+nd,rec.lon+nd,rec.lat-nd].map(function(v){return v.toFixed(4)}).join(',')+'&q='+encodeURIComponent(rec.name)).then(function(r){return r.ok?r.json():null}).then(function(j){ var el=(Array.isArray(j)?j:[]).filter(function(e){return e&&e.category==='aeroway'})[0]; if(!el) return; var t=el.extratags||{};
      x.tel=cleanTel(t.phone||t['contact:phone'])||x.tel; x.web=x.web||cleanUrl(t.website||t['contact:website']); x.hours=String(t.opening_hours||'').slice(0,80); x.op=String(t.operator||'').slice(0,80); done();
      var wt=/^en:(.{1,100})$/.exec(t.wikipedia||''); return wsum(wt?wt[1]:'').then(function(){ return wd(t.wikidata) }) }).catch(function(){}).then(fin) }
  function infoHtml(a){ var x=aExtra[a.id]||{}, h='', d=distNm(me.lat,me.lon,a.lat,a.lon);
    var codes=[a.icao||a.id,a.iata].filter(Boolean).join(' · ');
    h+='<div class="ssec ainfo"><div class="ahd"><div style="flex:1;min-width:0"><b>'+esc(ATYPE[a.ty]||'Airport')+'</b> · '+esc(codes)+'<br>'+esc([a.city,(a.region||'').replace(/^[A-Z]{2}-/,'')].filter(Boolean).join(', '))+' · '+uDist(d)+' '+distUnit()+' away</div>'+(x.thumb?'<img src="'+esc(x.thumb)+'" alt="" referrerpolicy="no-referrer">':'')+'</div>';
    h+=x.ext?'<div class="ext">'+esc(x.ext)+'</div>':(x.pend>0?'<div class="ext">Loading description…</div>':'<div class="ext">'+esc(x.wdesc?x.wdesc.charAt(0).toUpperCase()+x.wdesc.slice(1)+'.':a.sched?'Airport with scheduled airline service.':(a.ty==='S'?'Small airfield for private and light aircraft.':a.ty==='W'?'Water landing area for floatplanes.':'Public airport.'))+'</div>');
    h+='</div>';
    var rw=a.rws[0], FQO=['TWR','CTAF','ATF','UNIC','MF','AFIS','GND','ATIS','AWOS','ASOS'], fq=a.fqs.slice().sort(function(p,q){ function o(f){ var i=FQO.indexOf(String(f[0]).toUpperCase()); return i<0?99:i } return o(p)-o(q) }).slice(0,1);
    h+='<div class="wxg">'+[['Elevation',a.elev!=null?ft(a.elev):'—'],['Runways',a.rws.length?String(a.rws.length):'—'],['Longest',rw&&rw[1]?ft(rw[1]):'—'],['Surface',rw?surf(rw[2])+(rw[3]?', lit':''):'—'],['Airline flights',a.sched?'Yes':'No'],['Radio',fq.length?fq.map(function(f){return f[0]+' '+f[1]}).join(', '):'—']].map(function(y){return '<div><small>'+y[0]+'</small><span>'+esc(y[1])+'</span></div>'}).join('')+'</div>';
    var tel=cleanTel(a.tel)||x.tel, web=x.web||cleanUrl(a.home), tsrc=cleanTel(a.tel)?'airport manager':x.telSrc?'from website':'';
    h+='<div class="ssec"><div class="row2"><span>Phone</span><span>'+(tel?'<a href="tel:'+esc(tel.replace(/[^\d+]/g,''))+'" style="color:var(--accent)">'+esc(tel)+'</a>'+(tsrc?' <small style="color:var(--dim)">'+tsrc+'</small>':''):(x.pend>0?'Looking up…':'Not listed'))+'</span></div>'+
      (x.hours?'<div class="row2"><span>Hours</span><span>'+esc(x.hours)+'</span></div>':'')+(x.op?'<div class="row2"><span>Operator</span><span style="white-space:normal">'+esc(x.op)+'</span></div>':'')+'</div>';
    var q=encodeURIComponent(a.name+(a.city?' '+a.city:''));
    h+='<div class="abtns">'+(tel?'<a class="pri" href="tel:'+esc(tel.replace(/[^\d+]/g,''))+'">📞 Call</a>':'<a class="pri" href="https://www.google.com/maps/search/?api=1&amp;query='+q+'" target="_blank" rel="noopener">📞 Find phone</a>')+
      '<a href="https://www.google.com/maps/dir/?api=1&amp;destination='+a.lat+','+a.lon+'" target="_blank" rel="noopener">🧭 Directions</a>'+
      (web?'<a href="'+esc(web)+'" target="_blank" rel="noopener noreferrer">🌐 Website</a>':(x.wurl?'<a href="'+esc(x.wurl)+'" target="_blank" rel="noopener noreferrer">📖 Wikipedia</a>':'<a href="https://www.google.com/search?q='+q+'+airport" target="_blank" rel="noopener noreferrer">🔎 Search</a>'))+'</div>';
    h+='<div class="skynote">Airport data: OurAirports · description: Wikipedia · phone: FAA, airport website, OpenStreetMap</div>';
    return h }
  var SURF={ASP:'Asphalt',ASPH:'Asphalt',CON:'Concrete',CONC:'Concrete',GRS:'Grass',GRVL:'Gravel',GRV:'Gravel',GRAVEL:'Gravel',TURF:'Grass',DIRT:'Dirt',WATER:'Water',SAND:'Sand',SNOW:'Snow',ICE:'Ice',PEM:'Paved',BIT:'Paved',UNK:'Unknown'};
  function surf(sv){ sv=String(sv||'').toUpperCase(); for(var k in SURF) if(sv.indexOf(k)===0) return SURF[k]; return sv?sv.charAt(0)+sv.slice(1).toLowerCase():'—' }
  function paintAptBtn(){ var s2=document.getElementById('s_apt'); if(s2) s2.value=aptOn?'1':'0'; var b=document.getElementById('aptbtn'); b.classList.toggle('on',aptOn); b.setAttribute('aria-pressed',String(aptOn)) }
  document.getElementById('aptbtn').onclick=function(){ aptOn=!aptOn; try{localStorage.setItem('sky-apt',aptOn?'1':'0')}catch(e){} paintAptBtn(); if(aptOn&&map.getZoom()<6) map.setZoom(7); else loadApts() };
  paintAptBtn(); if(aptOn) setTimeout(loadApts,1500);
  var WXC={TS:'thunderstorm',SH:'showers',FZ:'freezing',RA:'rain',SN:'snow',DZ:'drizzle',GR:'hail',GS:'small hail',PL:'ice pellets',SG:'snow grains',IC:'ice crystals',UP:'precipitation',FG:'fog',BR:'mist',HZ:'haze',FU:'smoke',DU:'dust',SA:'sand',VA:'volcanic ash',SQ:'squalls',FC:'funnel cloud',BL:'blowing',DR:'drifting',MI:'shallow',BC:'patches of',PR:'partial',VC:'nearby'};
  function wxWords(w){ if(!w) return ''; return String(w).split(/\s+/).slice(0,3).map(function(tok){ var pre=tok.charAt(0)==='-'?'light ':tok.charAt(0)==='+'?'heavy ':''; tok=tok.replace(/^[-+]/,''); var parts=[]; for(var i=0;i<tok.length;i+=2){ var c=tok.substr(i,2); if(WXC[c]) parts.push(WXC[c]) } return parts.length?pre+parts.join(' '):'' }).filter(Boolean).join(', ') }
  var COVER={FEW:'Few clouds',SCT:'Scattered clouds',BKN:'Broken clouds',OVC:'Overcast',OVX:'Sky hidden',VV:'Sky hidden'};
  function ft(v){ return units==='av'?Math.round(v).toLocaleString()+' ft':Math.round(v*0.3048/10*10).toLocaleString()+' m' }
  function skyWords(cl){ var c=(cl||[]).filter(function(x){return x&&COVER[x.cover]}); if(!c.length) return 'Clear'; var x=c[c.length-1]; return COVER[x.cover]+(typeof x.base==='number'?' '+ft(x.base):'') }
  function windWords(m){ var s=typeof m.wspd==='number'?m.wspd:null; if(s==null) return '—'; if(s===0) return 'Calm'; var u=units==='av'?Math.round(s)+' kt':Math.round(s*1.852)+' km/h', d=m.wdir==='VRB'||m.wdir==null?'variable':'from '+cmp(+m.wdir); return u+' '+d+(typeof m.wgst==='number'?', gusts '+(units==='av'?Math.round(m.wgst)+' kt':Math.round(m.wgst*1.852)+' km/h'):'') }
  function visWords(v){ var n=visMi(v); if(n==null) return '—'; var plus=String(v).indexOf('+')>-1; return units==='av'?(n+(plus?'+':'')+' mi'):((n*1.609).toFixed(n<3?1:0)+(plus?'+':'')+' km') }
  function tempWords(c){ if(typeof c!=='number') return '—'; return tcfg==='F'?Math.round(c*9/5+32)+'°F':Math.round(c)+'°C' }
  function loadTaf(id){ var c=tafCache[id]; if(c&&Date.now()-c.t<600000) return Promise.resolve(c.d);
    return fetch(viaRelay('https://aviationweather.gov/api/data/taf?ids='+id+'&format=json')).then(function(r){return r.ok?r.json():null}).then(function(j){ var d=Array.isArray(j)&&j[0]&&Array.isArray(j[0].fcsts)?j[0].fcsts:null; tafCache[id]={t:Date.now(),d:d}; return d }).catch(function(){return null}) }
  function openApt(id){ var m=aptData[id]; if(!m) return; aptSel=id; aptTab='wx'; aInfo=null; document.getElementById('aptsheet').hidden=false; aptHead();
    findDir(id,m.lat,m.lon).then(function(r){ if(!r||aptSel!==id||aInfo) return; aInfo=r; moreInfo(r); aptHead() });
    // ask for routes of planes near this airport so the board can fill in
    (lastData||[]).filter(function(p){return p.alt_baro!=='ground'}).map(function(p){return {p:p,d:distNm(m.lat,m.lon,p.lat,p.lon)}}).filter(function(x){return x.d<200}).sort(function(a,b){return a.d-b.d}).slice(0,15).forEach(function(x){needRoute(x.p)});
    aptRender(); loadTaf(id).then(function(){ if(aptSel===id&&aptTab==='wx') aptRender() }) }
  function aptRender(){ var m=aptData[aptSel], body=document.getElementById('aptbody'); if(!body) return; if(!m&&aInfo) m={lat:aInfo.lat,lon:aInfo.lon,name:aInfo.name}; if(!m) return;
    if(aptTab==='wx'&&!aptData[aptSel]) aptTab='info'; if(aptTab==='info'&&!aInfo) aptTab='wx';
    [].forEach.call(document.querySelectorAll('#apttabs button'),function(b){b.classList.toggle('on',b.getAttribute('data-t')===aptTab)});
    var h='', c=fltCat(m);
    if(aptTab==='info'){ h=infoHtml(aInfo) } else
    if(aptTab==='wx'){
      var age=typeof m.obsTime==='number'?Math.round((Date.now()/1000-m.obsTime)/60):null, wx=wxWords(m.wxString);
      h+='<div class="ssec" style="margin-bottom:6px"><b>'+esc(m.name||m.icaoId)+'</b><br>'+esc(CATW[c])+(age!=null&&age>=0?' · reported '+(age<1?'just now':age+' min ago'):'')+'</div>';
      h+='<div class="wxg">'+[['Wind',windWords(m)],['Visibility',visWords(m.visib)],['Sky',skyWords(m.clouds)],['Temperature',tempWords(m.temp)],['Pressure',typeof m.altim==='number'?Math.round(m.altim)+' hPa':'—'],['Weather',wx||'None']].map(function(x){return '<div><small>'+x[0]+'</small><span>'+esc(x[1])+'</span></div>'}).join('')+'</div>';
      var warn=[]; if(/TS/.test(m.wxString||'')) warn.push('Thunderstorm at the airport'); var cf=ceilFt(m.clouds); if(cf!=null&&cf<1000) warn.push('Very low cloud ('+ft(cf)+')'); if(typeof m.wgst==='number'&&m.wgst>=25) warn.push('Strong gusts'); var vm=visMi(m.visib); if(vm!=null&&vm<3) warn.push('Low visibility');
      var f=(tafCache[aptSel]||{}).d;
      if(f){ f.forEach(function(x){ if(/TS/.test(x.wxString||'')&&warn.indexOf('Thunderstorms in the forecast')<0) warn.push('Thunderstorms in the forecast') }) }
      if(warn.length) h+='<div class="ssec"><span class="bad">⚠ '+esc(warn.slice(0,3).join(' · '))+'</span><br>These can cause delays.</div>';
      h+='<div class="ssec"><h4>Forecast</h4>';
      if(f===undefined) h+='Loading forecast…'; else if(!f||!f.length) h+='No forecast issued for this airport.';
      else { var nowS=Date.now()/1000; f.filter(function(x){return typeof x.timeTo!=='number'||x.timeTo>nowS}).slice(0,4).forEach(function(x){ var fc=fltCat(x), t=typeof x.timeFrom==='number'?new Date(x.timeFrom*1000).toLocaleTimeString([], {hour12:true,hour:'numeric',minute:'2-digit'}):'';
          var bits=[x.fcstChange==='TEMPO'?'at times':(x.fcstChange==='PROB'?(x.probability||'')+'% chance':''),wxWords(x.wxString),skyWords(x.clouds),typeof x.wspd==='number'&&x.wspd>0?windWords(x):''].filter(Boolean).join(', ');
          h+='<div class="row2"><span><b style="color:'+CATC[fc]+'">●</b> '+esc(bits||'No change')+'</span><span>'+esc(t?'from '+t:'')+'</span></div>' }) }
      h+='</div><div class="skynote">Weather: aviationweather.gov (METAR/TAF)</div>';
    } else {
      var arr=[], dep=[];
      (lastData||[]).forEach(function(p){ var r=routeOf(p); if(!r||p.alt_baro==='ground') return;
        if(distNm(r.d.la,r.d.lo,m.lat,m.lon)<5){ var rem=distNm(p.lat,p.lon,r.d.la,r.d.lo); if(p.gs>60) arr.push({p:p,from:r.o.c,mins:rem/p.gs*60+(rem>60?9:(rem>15?4:1)),rem:rem}) }
        else if(distNm(r.o.la,r.o.lo,m.lat,m.lon)<5){ dep.push({p:p,to:r.d.c,gone:distNm(p.lat,p.lon,m.lat,m.lon)}) } });
      arr.sort(function(a,b){return a.mins-b.mins}); dep.sort(function(a,b){return a.gone-b.gone});
      function rows(list,fn){ return list.slice(0,5).map(fn).join('') }
      h+='<div class="ssec"><h4>Arriving</h4>'+(arr.length?rows(arr,function(x){ var t=new Date(Date.now()+x.mins*60000).toLocaleTimeString([], {hour12:true,hour:'numeric',minute:'2-digit'}); return '<div class="brow" data-h="'+esc(x.p.hex)+'"><span><b>'+esc(name(x.p))+'</b> from '+esc(x.from)+' · '+esc(x.p.t||'')+'</span><span>lands ~'+esc(t)+'</span></div>' }):'No arrivals found nearby yet.')+'</div>';
      h+='<div class="ssec"><h4>Departed</h4>'+(dep.length?rows(dep,function(x){ return '<div class="brow" data-h="'+esc(x.p.hex)+'"><span><b>'+esc(name(x.p))+'</b> to '+esc(x.to)+' · '+esc(x.p.t||'')+'</span><span>'+uDist(x.gone)+' '+distUnit()+' out</span></div>' }):'No recent departures found nearby.')+'</div>';
      h+='<div class="skynote">Built from live planes and their routes around the airport. Airline gate and delay times need a paid feed.</div>';
    }
    if(body._h!==h){ body.innerHTML=h; body._h=h; [].forEach.call(body.querySelectorAll('.brow'),function(r){ r.onclick=function(){ document.getElementById('aptsheet').hidden=true; aptSel=null; select(r.getAttribute('data-h'),true) } }) } }
  [].forEach.call(document.querySelectorAll('#apttabs button'),function(b){ b.onclick=function(){ aptTab=b.getAttribute('data-t'); aptRender() } });
  document.getElementById('aptx').onclick=function(){document.getElementById('aptsheet').hidden=true;aptSel=null;aInfo=null};
  document.getElementById('aptsheet').onclick=function(e){if(e.target===this){this.hidden=true;aptSel=null;aInfo=null}};

  // ---- Wildfires: BC Wildfire Service and US (NIFC WFIGS) fires and outlines, plus firefighting aircraft ----
  var fireOn=false, fireLayer=L.layerGroup().addTo(map), perLayer=L.layerGroup().addTo(map), fires=[], fireT=null, fireGen=0, fireKey='', fireSel=null;
  fireOn=false;
  var BCWS='https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/', WFIGS='https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/';
  var FSTAT={'Out of Control':'#e53935','Being Held':'#fb8c00','Under Control':'#fbc02d','Out':'#8d8d8d'};
  var FFT={CL2P:1,CL2T:1,CL4T:1,CL5T:1,AT8T:1,AT6T:1,AT5T:1,AT3T:1,S2P:1,S2T:1,S64:1,KMAX:1,DC10:0};
  function fireTag(p){ if(cfg2.fireAc!=='1'||!p||p.alt_baro==='ground') return null; if(FFT[p.t]) return {text:'Firefighting aircraft',kind:'type'};
    if(!fires.length||p.alt_baro==null||p.alt_baro>9000) return null; var best=null;
    for(var i=0;i<fires.length;i++){ var f=fires[i]; if(!f.active) continue; var d=distNm(p.lat,p.lon,f.lat,f.lon); if(d<6&&(!best||d<best.d)) best={f:f,d:d} }
    return best?{text:'Low over the '+best.f.name+' fire ('+uDist(best.d,1)+' '+distUnit()+')',kind:'near'}:null }
  function q(u){ return fetch(u).then(function(r){return r.ok?r.json():null}).catch(function(){return null}) }
  function envQ(b){ return '&geometry='+encodeURIComponent([b.w,b.s,b.e,b.n].map(function(v){return v.toFixed(3)}).join(','))+'&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json' }
  function loadFires(force){ var g=++fireGen; if(!fireOn||map.getZoom()<5){ fireLayer.clearLayers(); perLayer.clearLayers(); fires=[]; fireKey=''; return }
    var bb=map.getBounds().pad(0.2), b={s:Math.max(-89,bb.getSouth()),n:Math.min(89,bb.getNorth()),w:Math.max(-179.9,bb.getWest()),e:Math.min(179.9,bb.getEast())};
    var key=[b.s,b.n,b.w,b.e].map(function(v){return Math.round(v*4)/4}).join(',')+cfg2.fireAll+cfg2.firePer+map.getZoom(); if(!force&&key===fireKey) return; fireKey=key;
    var all=cfg2.fireAll==='1', yr=new Date().getFullYear(), inBC=b.e>-140&&b.w<-113.5&&b.n>48&&b.s<60.5, inUS=b.e>-180&&b.w<-65&&b.n>17&&b.s<72, jobs=[];
    if(inBC) jobs.push(q(BCWS+'BCWS_ActiveFires_PublicView/FeatureServer/0/query?where='+encodeURIComponent(all?'FIRE_YEAR='+yr:"FIRE_STATUS<>'Out'")+'&outFields=FIRE_NUMBER,INCIDENT_NAME,FIRE_STATUS,CURRENT_SIZE,FIRE_CAUSE,IGNITION_DATE,GEOGRAPHIC_DESCRIPTION,FIRE_URL,FIRE_OF_NOTE_IND,LATITUDE,LONGITUDE&resultRecordCount=1000'+envQ(b)).then(function(j){ return (j&&j.features||[]).map(function(f){ var a=f.attributes||{}, gm=f.geometry||{}; var nm=a.INCIDENT_NAME&&a.INCIDENT_NAME!==a.FIRE_NUMBER?a.INCIDENT_NAME:(a.GEOGRAPHIC_DESCRIPTION||a.FIRE_NUMBER);
        return {src:'bc',id:'bc'+a.FIRE_NUMBER,name:String(nm||'Wildfire').slice(0,80),num:a.FIRE_NUMBER,status:a.FIRE_STATUS,active:a.FIRE_STATUS!=='Out',ha:+a.CURRENT_SIZE||0,cause:a.FIRE_CAUSE,start:a.IGNITION_DATE,where:a.GEOGRAPHIC_DESCRIPTION,url:/^https:\/\/wildfiresituation\.nrs\.gov\.bc\.ca\//.test(a.FIRE_URL||'')?a.FIRE_URL:'',note:a.FIRE_OF_NOTE_IND==='Y',lat:typeof gm.y==='number'?gm.y:+a.LATITUDE,lon:typeof gm.x==='number'?gm.x:+a.LONGITUDE} }) }));
    if(inUS) jobs.push(q(WFIGS+'WFIGS_Incident_Locations_Current/FeatureServer/0/query?where='+encodeURIComponent("IncidentTypeCategory='WF' AND FireOutDateTime IS NULL"+(all?'':' AND (PercentContained IS NULL OR PercentContained<100)'))+'&outFields=IncidentName,IncidentSize,PercentContained,FireDiscoveryDateTime,POOState,POOCounty,FireCause,UniqueFireIdentifier&resultRecordCount=1000'+envQ(b)).then(function(j){ return (j&&j.features||[]).map(function(f){ var a=f.attributes||{}, gm=f.geometry||{}, pc=a.PercentContained;
        return {src:'us',id:'us'+a.UniqueFireIdentifier,name:String(a.IncidentName||'Wildfire').replace(/\b([A-Z])([A-Z]+)\b/g,function(m,x,y){return x+y.toLowerCase()}).slice(0,80),num:a.UniqueFireIdentifier,status:pc==null?'Not contained':pc>=100?'Contained':Math.round(pc)+'% contained',active:!(pc>=100),pc:pc,ha:(+a.IncidentSize||0)*0.404686,cause:a.FireCause,start:a.FireDiscoveryDateTime,where:[a.POOCounty?a.POOCounty+' County':'',(a.POOState||'').replace('US-','')].filter(Boolean).join(', '),lat:gm.y,lon:gm.x} }) }));
    Promise.all(jobs).then(function(rs){ if(g!==fireGen) return; fires=[].concat.apply([],rs).filter(function(f){return isFinite(f.lat)&&isFinite(f.lon)}); drawFires() });
    perLayer.clearLayers(); if(cfg2.firePer!=='1'||map.getZoom()<7) return;
    var tol=(b.e-b.w)/700, pj=[];
    if(inBC) pj.push(q(BCWS+'BCWS_FirePerimeters_PublicView/FeatureServer/0/query?where='+encodeURIComponent(all?'FIRE_YEAR='+yr:"FIRE_STATUS<>'Out'")+'&outFields=FIRE_NUMBER,FIRE_STATUS&maxAllowableOffset='+tol.toFixed(5)+'&geometryPrecision=4&resultRecordCount=300'+envQ(b)).then(function(j){ return (j&&j.features||[]).map(function(f){ return {rings:f.geometry&&f.geometry.rings,c:FSTAT[(f.attributes||{}).FIRE_STATUS]||'#e53935'} }) }));
    if(inUS) pj.push(q(WFIGS+'WFIGS_Interagency_Perimeters_Current/FeatureServer/0/query?where='+encodeURIComponent(all?'1=1':'attr_PercentContained IS NULL OR attr_PercentContained<100')+'&outFields=attr_PercentContained&maxAllowableOffset='+tol.toFixed(5)+'&geometryPrecision=4&resultRecordCount=300'+envQ(b)).then(function(j){ return (j&&j.features||[]).map(function(f){ var pc=(f.attributes||{}).attr_PercentContained; return {rings:f.geometry&&f.geometry.rings,c:pc>=100?'#fbc02d':'#e53935'} }) }));
    Promise.all(pj).then(function(rs){ if(g!==fireGen) return; perLayer.clearLayers(); [].concat.apply([],rs).forEach(function(p){ if(!Array.isArray(p.rings)) return; var rings=p.rings.map(function(r){return r.map(function(pt){return [pt[1],pt[0]]})});
      L.polygon(rings,{color:p.c,weight:1.5,fillColor:p.c,fillOpacity:.18,interactive:false}).addTo(perLayer) }) }) }
  function fireColor(f){ return f.src==='bc'?(FSTAT[f.status]||'#e53935'):(f.pc>=100?'#fbc02d':f.pc>=50?'#fb8c00':'#e53935') }
  function drawFires(){ fireLayer.clearLayers(); fires.filter(function(f){ var z=map.getZoom(); return cfg2.declutter!=='1'||z>=9||f.note||f.ha>=(z>=8?10:z>=7?100:1000) }).filter(function(f){ return cfg2.fireKm==='map'||distNm(me.lat,me.lon,f.lat,f.lon)<=(+cfg2.fireKm)/1.852 }).sort(cfg2.fireMax==='all'?function(a,b){return b.ha-a.ha}:byNear(nearPt())).slice(0,capN(cfg2.fireMax,300)).sort(function(a,b){return b.ha-a.ha}).reverse().forEach(function(f){ var sz=f.ha>10000?30:f.ha>1000?26:f.ha>100?22:18;
      L.marker([f.lat,f.lon],{icon:L.divIcon({className:'',html:'<span class="firemk" role="button" aria-label="'+esc(f.name)+' fire" style="--c:'+fireColor(f)+';--sz:'+sz+'px">🔥</span>',iconSize:[0,0]}),keyboard:false,bubblingMouseEvents:false,zIndexOffset:-200,title:f.name}).on('click',function(){openFire(f)}).addTo(fireLayer) });
    if(fireSel&&!document.getElementById('firesheet').hidden) fireRender() }
  function fmtArea(ha){ if(!ha) return '—'; var ac=ha*2.47105; return units==='av'?(ac<1?'Under 1 acre':ac<10?ac.toFixed(1)+' acres':Math.round(ac).toLocaleString()+' acres'):(ha<10?ha.toFixed(1):Math.round(ha).toLocaleString())+' ha' }
  function openFire(f){ fireSel=f; document.getElementById('firesheet').hidden=false; fireRender() }
  function fireRender(){ var f=fireSel, body=document.getElementById('firebody'); if(!f||!body) return; var d=distNm(me.lat,me.lon,f.lat,f.lon);
    document.getElementById('firetitle').innerHTML='<span style="display:inline-block;max-width:calc(100vw - 170px);font-size:16px;line-height:1.2;vertical-align:middle;overflow:hidden;max-height:2.4em">'+esc(f.name)+'</span><span class="firepill" style="background:'+fireColor(f)+'">'+esc(f.status||'')+'</span>';
    var started=f.start?new Date(f.start).toLocaleDateString([], {month:'short',day:'numeric',year:'numeric'}):'—';
    var h='<div class="ssec"><b>'+esc(f.src==='bc'?'BC Wildfire Service':'US wildfire')+'</b> · '+esc(f.num||'')+(f.note?' · <span class="bad">Wildfire of note</span>':'')+'<br>'+esc(f.where||'')+' · '+uDist(d)+' '+distUnit()+' away</div>';
    h+='<div class="wxg">'+[['Size',fmtArea(f.ha)],['Status',f.status||'—'],['Started',started],['Cause',f.cause||'—'],['From you',uDist(d)+' '+distUnit()],['Source',f.src==='bc'?'BCWS':'NIFC']].map(function(y){return '<div><small>'+y[0]+'</small><span>'+esc(y[1])+'</span></div>'}).join('')+'</div>';
    var ac=(lastData||[]).filter(function(p){return p.alt_baro!=='ground'&&p.lat!=null}).map(function(p){return {p:p,d:distNm(f.lat,f.lon,p.lat,p.lon)}}).filter(function(x){return x.d<10&&(FFT[x.p.t]||(x.p.alt_baro!=null&&x.p.alt_baro<12000))}).sort(function(a,b){return a.d-b.d}).slice(0,4);
    h+='<div class="ssec"><h4>Aircraft over this fire</h4>'+(ac.length?ac.map(function(x){ return '<div class="brow row2" data-h="'+esc(x.p.hex)+'" style="cursor:pointer"><span><b>'+esc(name(x.p))+'</b> '+esc(x.p.t||'')+(FFT[x.p.t]?' 🔥':'')+'</span><span>'+uAlt(x.p.alt_baro)+' '+altUnit()+' · '+uDist(x.d,1)+' '+distUnit()+'</span></div>' }).join(''):'None low over it right now.')+'</div>';
    if(f.url) h+='<div class="abtns" style="grid-template-columns:1fr"><a class="pri" href="'+esc(f.url)+'" target="_blank" rel="noopener noreferrer">Official BC Wildfire page</a></div>';
    h+='<div class="skynote">Fires: '+(f.src==='bc'?'BC Wildfire Service':'NIFC WFIGS')+' · updated by the agencies, can lag a few hours. Not for emergency decisions; follow local evacuation orders.</div>';
    body.innerHTML=h; [].forEach.call(body.querySelectorAll('.brow'),function(r){ r.onclick=function(){ document.getElementById('firesheet').hidden=true; fireSel=null; select(r.getAttribute('data-h'),true) } }) }
  document.getElementById('firex').onclick=function(){document.getElementById('firesheet').hidden=true;fireSel=null};
  document.getElementById('firesheet').onclick=function(e){if(e.target===this){this.hidden=true;fireSel=null}};
  function paintFireBtn(){ var b=document.getElementById('firebtn'), s2=document.getElementById('s_fire'); if(s2) s2.value=fireOn?'1':'0'; b.classList.toggle('on',fireOn); b.setAttribute('aria-pressed',String(fireOn)) }
  function setFire(v){ fireOn=v; try{localStorage.setItem('sky-fire',v?'1':'0')}catch(e){} paintFireBtn(); if(v&&map.getZoom()<5) map.setZoom(6); else loadFires(true); if(!v){ for(var h in lastKey) lastKey[h]='' } }
  document.getElementById('firebtn').onclick=function(){ setFire(!fireOn) };
  (function(){ var s2=document.getElementById('s_fire'); if(s2) s2.onchange=function(){ setFire(s2.value==='1') } })();
  map.on('moveend',function(){ clearTimeout(fireT); fireT=setTimeout(function(){loadFires(false)},900) });
  setInterval(function(){ if(fireOn&&!document.hidden) loadFires(true) },600000);
  paintFireBtn(); if(fireOn) setTimeout(function(){loadFires(true)},1500);

  // ---- Roads (DriveBC + WSDOT) and BC Ferries ----
  __mod('roads',{get map(){return map},get esc(){return esc},get cfg2(){return cfg2},get capN(){return capN},get byNear(){return byNear},get nearPt(){return nearPt},get distNm(){return distNm},get ft(){return ft},get uDist(){return uDist},get distUnit(){return distUnit}},'#roadbtn,#ferrybtn');

  // ---- Emergency hub: evacuations, weather warnings, nearby fires, air quality and road closures in one place ----
  (function(){
    var btn=document.getElementById('hubbtn'), sheetEl=document.getElementById('hubsheet'), body=document.getElementById('hubbody'); if(!btn||!sheetEl) return;
    var hubLayer=L.layerGroup().addTo(map), H={t:0}, open=-1, busy=false, evacPolys=[];
    var BCWS='https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/', WFIGS='https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/', WS='https://data.wsdot.wa.gov/arcgis/rest/services/TravelInformation/';
    var gjC={}; function o5b(b){ var cx=(b.w+b.e)/2, cy=(b.s+b.n)/2, hw=Math.max((b.e-b.w)/2,.75), hh=Math.max((b.n-b.s)/2,.5); return [cx-hw,cy-hh,cx+hw,cy+hh].map(function(v){return (Math.round(v*4)/4).toFixed(2)}).join(',') }
    function gj(u,o){ var hit=gjC[u]; if(hit&&Date.now()-hit.t<60000) return hit.p; var p=fetch(u,o).then(function(r){return r.ok?r.json():null}).catch(function(){return null}); gjC[u]={t:Date.now(),p:p}; return p }

    function kmBox(km){ var dl=km/111, dn=km/(111*Math.cos(me.lat*Math.PI/180)); return {s:me.lat-dl,n:me.lat+dl,w:me.lon-dn,e:me.lon+dn} }
    function env(b){ return '&geometry='+encodeURIComponent([b.w,b.s,b.e,b.n].map(function(v){return v.toFixed(3)}).join(','))+'&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json' }
    function bear(la,lo,la2,lo2){ var r=Math.PI/180, y=Math.sin((lo2-lo)*r)*Math.cos(la2*r), x=Math.cos(la*r)*Math.sin(la2*r)-Math.sin(la*r)*Math.cos(la2*r)*Math.cos((lo2-lo)*r); return (Math.atan2(y,x)/r+360)%360 }
    function where(la,lo){ var d=distNm(me.lat,me.lon,la,lo); return uDist(d)+' '+distUnit()+' '+cmp(bear(me.lat,me.lon,la,lo)) }
    function inRing(pt,ring){ var x=pt[0], y=pt[1], ins=false; for(var i=0,j=ring.length-1;i<ring.length;j=i++){ var xi=ring[i][0], yi=ring[i][1], xj=ring[j][0], yj=ring[j][1]; if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi)) ins=!ins } return ins }
    function km(){ return +cfg2.hubKm||100 }
    function gather(){ if(busy) return Promise.resolve(); busy=true; var R=km(), b=kmBox(R), bf=kmBox(Math.min(R,60)), inBC=b.e>-139.5&&b.w<-114&&b.n>48.2&&b.s<60, inUS=me.lat<48.99&&me.lat>18&&me.lon<-66&&!(me.lon<-123&&me.lat>48.25), jobs={};
      jobs.evac=inBC?gj(BCWS+'Evacuation_Orders_and_Alerts/FeatureServer/0/query?where=1%3D1&outFields=EVENT_NAME,EVENT_TYPE,ORDER_ALERT_NAME,ORDER_ALERT_STATUS,ISSUING_AGENCY,DATE_MODIFIED&maxAllowableOffset=0.002&geometryPrecision=4&resultRecordCount=200'+env(b)).then(function(j){ return (j&&j.features||[]).map(function(f){ var a=f.attributes||{}, rings=(f.geometry&&f.geometry.rings)||[], c=[0,0], n=0, inside=false;
          rings.forEach(function(rg){ rg.forEach(function(p){c[0]+=p[0];c[1]+=p[1];n++}); if(inRing([me.lon,me.lat],rg)) inside=!inside }); if(n){c[0]/=n;c[1]/=n}
          return {order:a.ORDER_ALERT_STATUS==='Order',name:a.ORDER_ALERT_NAME||a.EVENT_NAME||'Area',event:a.EVENT_NAME,type:a.EVENT_TYPE,agency:a.ISSUING_AGENCY,upd:a.DATE_MODIFIED,rings:rings,lat:c[1],lon:c[0],inside:inside} }) }):Promise.resolve([]);
      var pb=[me.lon-.05,me.lat-.05,me.lon+.05,me.lat+.05].map(function(v){return v.toFixed(3)}).join(',');
      jobs.wxc=gj('https://api.weather.gc.ca/collections/weather-alerts/items?f=json&lang=en&limit=20&bbox='+pb).then(function(j){ var seen={}; return (j&&j.features||[]).map(function(f){return f.properties||{}}).filter(function(p){ var k=p.alert_name_en; if(!k||seen[k]||/ended|cancel/i.test((p.status_en||'')+(p.alert_type||''))) return false; seen[k]=1; return true })
        .map(function(p){ return {name:String(p.alert_name_en||'').replace(/^./,function(c){return c.toUpperCase()}),level:/warning/i.test(p.alert_type||p.alert_name_en)?2:/watch/i.test(p.alert_type||'')?1:0,text:String(p.alert_text_en||'').slice(0,900),until:p.expiration_datetime,area:p.feature_name_en,src:'Environment Canada'} }) });
      jobs.wxu=inUS?gj('https://api.weather.gov/alerts/active?point='+me.lat.toFixed(4)+','+me.lon.toFixed(4),{headers:{'Accept':'application/geo+json'}}).then(function(j){ return (j&&j.features||[]).map(function(f){ var p=f.properties||{}; return {name:p.event||'Alert',level:/Extreme|Severe/.test(p.severity||'')||/Warning/.test(p.event||'')?2:/Watch/.test(p.event||'')?1:0,text:String((p.headline||'')+'\n\n'+(p.description||'')).slice(0,900),until:p.expires,area:p.areaDesc,src:'US National Weather Service'} }) }):Promise.resolve([]);
      jobs.fires=Promise.all([
        inBC?gj(BCWS+'BCWS_ActiveFires_PublicView/FeatureServer/0/query?where='+encodeURIComponent("FIRE_STATUS<>'Out'")+'&outFields=INCIDENT_NAME,FIRE_NUMBER,FIRE_STATUS,CURRENT_SIZE,GEOGRAPHIC_DESCRIPTION'+env(bf)).then(function(j){ return (j&&j.features||[]).map(function(f){ var a=f.attributes, g=f.geometry||{}; return {name:(a.INCIDENT_NAME&&a.INCIDENT_NAME!==a.FIRE_NUMBER?a.INCIDENT_NAME:a.GEOGRAPHIC_DESCRIPTION||a.FIRE_NUMBER),status:a.FIRE_STATUS,ha:+a.CURRENT_SIZE||0,lat:g.y,lon:g.x} }) }):[],
        inUS?gj(WFIGS+'WFIGS_Incident_Locations_Current/FeatureServer/0/query?where='+encodeURIComponent("IncidentTypeCategory='WF' AND FireOutDateTime IS NULL AND (PercentContained IS NULL OR PercentContained<100)")+'&outFields=IncidentName,IncidentSize,PercentContained'+env(bf)).then(function(j){ return (j&&j.features||[]).map(function(f){ var a=f.attributes, g=f.geometry||{}; return {name:a.IncidentName,status:a.PercentContained==null?'Not contained':Math.round(a.PercentContained)+'% contained',ha:(+a.IncidentSize||0)*.4047,lat:g.y,lon:g.x} }) }):[]
      ]).then(function(r){ return [].concat(r[0]||[],r[1]||[]).filter(function(f){return isFinite(f.lat)}).map(function(f){ f.d=distNm(me.lat,me.lon,f.lat,f.lon); return f }).sort(function(a,b){return a.d-b.d}) });
      jobs.air=gj('https://air-quality-api.open-meteo.com/v1/air-quality?latitude='+me.lat.toFixed(3)+'&longitude='+me.lon.toFixed(3)+'&current=us_aqi,pm2_5&hourly=us_aqi,pm2_5&forecast_hours=24&timezone=auto').then(function(j){ if(!j||!j.current) return null; var h=(j.hourly&&j.hourly.us_aqi)||[], mx=0, mt=null; h.forEach(function(v,i){ if(v>mx){mx=v;mt=j.hourly.time[i]} }); return {aqi:j.current.us_aqi,pm:j.current.pm2_5,max:mx,maxAt:mt} });
      jobs.roads=Promise.all([
        inBC?gj('https://api.open511.gov.bc.ca/events?format=json&status=ACTIVE&limit=500&bbox='+o5b(b)).then(function(j){ return (j&&j.events||[]).filter(function(e){ return (e.roads||[]).some(function(r){return /CLOSED/.test(r.state||'')}) }).map(function(e){ var g=e.geography||{}, c=g.type==='Point'?g.coordinates:(g.coordinates&&g.coordinates[0]); return {road:(e.roads||[]).map(function(r){return r.name}).filter(Boolean).slice(0,2).join(', '),text:String(e.description||'').slice(0,300),lat:c&&c[1],lon:c&&c[0]} }) }):[],
        inUS?gj(WS+'TravelInfoRoadAlerts/FeatureServer/0/query?where=RoadClosedFlag%3D1&outFields=Road,RoadDirection,HeadlineMessage'+env(b)).then(function(j){ return (j&&j.features||[]).map(function(f){ var a=f.attributes, g=f.geometry||{}; return {road:[a.Road,a.RoadDirection].filter(Boolean).join(' '),text:String(a.HeadlineMessage||'').slice(0,300),lat:g.y,lon:g.x} }) }):[]
      ]).then(function(r){ return [].concat(r[0]||[],r[1]||[]).filter(function(x){return isFinite(x.lat)}) });
      var keys=Object.keys(jobs);
      return Promise.all(keys.map(function(k){return jobs[k]})).then(function(r){ keys.forEach(function(k,i){ H[k]=r[i] }); H.wx=[].concat(H.wxc||[],H.wxu||[]).sort(function(a,b){return b.level-a.level}); H.t=Date.now(); busy=false; paint(); if(!sheetEl.hidden) render() }).catch(function(){ busy=false }) }
    function aqiWord(a){ return a==null?'—':a<=50?'Good':a<=100?'Moderate':a<=150?'Unhealthy for sensitive groups':a<=200?'Unhealthy':a<=300?'Very unhealthy':'Hazardous' }
    function aqiCol(a){ return a==null?'var(--dim)':a<=50?'#43a047':a<=100?'#fbc02d':a<=150?'#fb8c00':a<=200?'#e53935':'#8e24aa' }
    function level(){ var L=0, why='';
      var ev=H.evac||[], ins=ev.filter(function(e){return e.inside}); if(ins.some(function(e){return e.order})) return {L:3,why:'You are inside an EVACUATION ORDER area'}; if(ins.length){ L=2; why='You are inside an evacuation alert area' }
      if(L<2&&ev.some(function(e){return e.order})){ L=2; why='Evacuation order nearby' } else if(L<1&&ev.length){ L=1; why='Evacuation alert nearby' }
      var w=H.wx||[]; if(w.some(function(x){return x.level===2})&&L<2){ L=2; why=w.filter(function(x){return x.level===2})[0].name } else if(w.length&&L<1){ L=1; why=w[0].name }
      var f=(H.fires||[])[0]; if(f&&f.d<5.4&&L<2){ L=2; why='Wildfire within 10 km' } else if(f&&f.d<16.2&&L<1){ L=1; why='Wildfire within 30 km' }
      var a=H.air; if(a&&a.aqi>150&&L<2){ L=2; why='Unhealthy air' } else if(a&&a.aqi>100&&L<1){ L=1; why='Smoky or poor air' }
      if((H.roads||[]).length&&L<1){ L=1; why='Road closures nearby' }
      return {L:L,why:why||'No alerts near you right now'} }
    function paint(){ var lv=H.t?level().L:0; btn.classList.toggle('alert1',cfg2.hubBadge==='1'&&lv===1); btn.classList.toggle('alert2',cfg2.hubBadge==='1'&&lv>=2) }
    function row(i,icon,title,right,col,detail){ return '<div class="hubrow'+(open===i?' open':'')+'"><button class="hubhd" data-i="'+i+'" aria-expanded="'+(open===i)+'"><span>'+icon+' <b>'+title+'</b></span><span style="color:'+(col||'var(--dim)')+'">'+right+'</span></button>'+(open===i?'<div class="hubdt">'+detail+'</div>':'')+'</div>' }
    function render(){ if(!H.t){ body.innerHTML='<div class="ssec">Checking alerts near you…</div>'; return }
      var lv=level(), cols=['#43a047','#fbc02d','#fb8c00','#c62828'], h='<div class="hubban" style="background:'+cols[lv.L]+'">'+(lv.L?'⚠ ':'✓ ')+esc(lv.why)+'</div>';
      var ev=H.evac||[], ords=ev.filter(function(e){return e.order}).length;
      h+=row(0,'🏠','Evacuations',ev.length?(ords?ords+' order'+(ords>1?'s':''):'')+(ords&&ev.length-ords?', ':'')+(ev.length-ords?(ev.length-ords)+' alert'+(ev.length-ords>1?'s':''):''):'None',ev.length?(ords?'#e53935':'#fb8c00'):'#43a047',
        ev.length?ev.slice(0,6).map(function(e){ return '<div class="row2"><span><b style="color:'+(e.order?'#e53935':'#fb8c00')+'">'+(e.order?'ORDER':'Alert')+'</b> '+esc(e.name)+(e.inside?' <b>· you are inside</b>':'')+'<br><small>'+esc([e.type,e.agency].filter(Boolean).join(' · '))+'</small></span><span>'+(e.inside?'here':esc(where(e.lat,e.lon)))+'</span></div>' }).join(''):'No evacuation orders or alerts within '+km()+' km (BC only).');
      var w=H.wx||[];
      h+=row(1,'🌩','Weather alerts',w.length?w.length+' active':'None',w.some(function(x){return x.level===2})?'#e53935':w.length?'#fb8c00':'#43a047',
        w.length?w.slice(0,3).map(function(x){ return '<div style="margin-bottom:6px"><b>'+esc(x.name)+'</b>'+(x.until?' <small>until '+esc(new Date(x.until).toLocaleString([], {weekday:'short',hour:'numeric',minute:'2-digit'}))+'</small>':'')+'<div class="hubtx">'+esc(x.text)+'</div><small>'+esc(x.src)+'</small></div>' }).join(''):'No weather warnings, watches or statements for your location.');
      var f=H.fires||[];
      h+=row(2,'🔥','Wildfires',f.length?f.length+' · closest '+uDist(f[0].d)+' '+distUnit():'None near',f.length?(f[0].d<16.2?'#e53935':'#fb8c00'):'#43a047',
        f.length?f.slice(0,5).map(function(x){ return '<div class="row2"><span><b>'+esc(x.name||'Wildfire')+'</b><br><small>'+esc(x.status||'')+(x.ha?' · '+Math.round(x.ha).toLocaleString()+' ha':'')+'</small></span><span>'+esc(where(x.lat,x.lon))+'</span></div>' }).join(''):'No active wildfires within '+Math.min(km(),60)+' km.');
      var a=H.air, aqw=(H.wx||[]).some(function(x){return /air quality|smoke/i.test(x.name)});
      h+=row(3,'😷','Air quality',aqw?'Warning issued':a?Math.round(a.aqi)+' · '+aqiWord(a.aqi):'—',aqw?'#fb8c00':a?aqiCol(a.aqi):null,
        (aqw?'<div style="margin-bottom:6px"><b style="color:#fb8c00">Official air quality warning in effect.</b> See Weather alerts for details.</div>':'')+(a?'<div class="row2"><span>Now</span><span><b style="color:'+aqiCol(a.aqi)+'">'+Math.round(a.aqi)+' '+esc(aqiWord(a.aqi))+'</b></span></div><div class="row2"><span>Fine smoke particles (PM2.5)</span><span>'+Math.round(a.pm)+' µg/m³</span></div><div class="row2"><span>Worst in next 24 h</span><span><b style="color:'+aqiCol(a.max)+'">'+Math.round(a.max)+'</b> '+(a.maxAt?esc(new Date(a.maxAt).toLocaleTimeString([], {hour12:true,weekday:'short',hour:'numeric'})):'')+'</span></div><small>US AQI scale, forecast model (Open-Meteo/CAMS). Official readings: airhealth.ca</small>':'Air quality data unavailable.'));
      var rd=H.roads||[];
      h+=row(4,'🚧','Road closures',rd.length?rd.length+' closed':'None',rd.length?'#e53935':'#43a047',
        rd.length?rd.slice(0,5).map(function(x){ return '<div class="row2"><span><b>'+esc(x.road||'Road')+'</b><br><small>'+esc(String(x.text||'').slice(0,120))+'</small></span><span>'+esc(where(x.lat,x.lon))+'</span></div>' }).join(''):'No full road closures within '+km()+' km.');
      h+='<div class="abtns" style="margin-top:6px"><a href="#" id="hubmap" class="pri" role="button">🗺 Show on map</a><a href="https://www.emergencyinfobc.gov.bc.ca/" target="_blank" rel="noopener noreferrer">EmergencyInfoBC</a><a href="https://www.drivebc.ca/" target="_blank" rel="noopener noreferrer">DriveBC</a></div>';
      h+='<div class="skynote">In danger? Call 911. Always follow official orders. Checked '+esc(new Date(H.t).toLocaleTimeString([], {hour12:true,hour:'numeric',minute:'2-digit'}))+' · '+km()+' km around you</div>';
      body.innerHTML=h;
      [].forEach.call(body.querySelectorAll('.hubhd'),function(b){ b.onclick=function(){ var i=+b.getAttribute('data-i'); open=open===i?-1:i; render() } });
      var hm=document.getElementById('hubmap'); if(hm) hm.onclick=function(e){ e.preventDefault(); showOnMap() } }
    function showOnMap(){ hubLayer.clearLayers(); (H.evac||[]).forEach(function(e){ var c=e.order?'#e53935':'#fb8c00'; e.rings.forEach(function(rg){ L.polygon(rg.map(function(p){return [p[1],p[0]]}),{color:c,weight:2,fillColor:c,fillOpacity:.25}).bindTooltip(esc((e.order?'Evacuation ORDER: ':'Evacuation alert: ')+(e.name||''))).addTo(hubLayer) }) });
      var fb=document.getElementById('firebtn'); if(fb&&!fb.classList.contains('on')) fb.click();
      var rb=document.getElementById('roadbtn'); if(rb&&!rb.classList.contains('on')) rb.click();
      sheetEl.hidden=true; var b=kmBox(Math.min(km(),60)); map.fitBounds([[b.s,b.w],[b.n,b.e]]) }
    btn.onclick=function(){ sheetEl.hidden=false; render(); if(!H.t||Date.now()-H.t>120000) gather() };
    document.getElementById('hubx').onclick=function(){ sheetEl.hidden=true };
    sheetEl.onclick=function(e){ if(e.target===sheetEl) sheetEl.hidden=true };
    setTimeout(function(){ if(cfg2.hubAuto==='1') gather() },8000);
    setInterval(function(){ if(!document.hidden&&cfg2.hubAuto==='1') gather() },600000);
    window.__hub={refresh:function(){ H.t=0; gather() },paint:paint,clear:function(){ hubLayer.clearLayers() }};
  })();
  // ---- 3D ride-along: real terrain and satellite imagery seen from the plane (MapLibre, loaded only when opened) ----
  var V3D=(function(){
    var JS='https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl.js', JSSRI='sha384-SYKAG6cglRMN0RVvhNeBY0r3FYKNOJtznwA0v7B5Vp9tr31xAHsZC0DqkQ/pZDmj';
    var CSS='https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl.css', CSSSRI='sha384-MinO0mNliZ3vwppuPOUnGa+iq619pfMhLVUXfC4LHwSCvF9H+6P/KO4Q7qBOYV5V';
    var box=null, m3=null, hex=null, look=0, raf=0, tmr=null, loading=null, ready=false, lastT=0, lost=0;
    function lib(){ if(window.maplibregl) return Promise.resolve(); if(loading) return loading;
      loading=new Promise(function(res,rej){ var l=document.createElement('link'); l.rel='stylesheet'; l.href=CSS; l.integrity=CSSSRI; l.crossOrigin='anonymous'; l.referrerPolicy='no-referrer'; document.head.appendChild(l);
        var s=document.createElement('script'); s.src=JS; s.integrity=JSSRI; s.crossOrigin='anonymous'; s.referrerPolicy='no-referrer'; s.onload=function(){res()}; s.onerror=function(){ loading=null; rej(new Error('load')) }; document.head.appendChild(s) }); return loading }
    function build(){ box=document.createElement('div'); box.id='v3d'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','3D view from the plane');
      box.innerHTML='<div id="v3map"></div><div id="v3top"><div id="v3hud"><b id="v3cs">—</b><span id="v3st"></span></div><button class="close" id="v3x" aria-label="Close 3D view">✕</button></div>'+
        '<div id="v3msg" hidden></div><div id="v3bar"><button id="v3l" aria-label="Look left">◀ Left</button><button id="v3c" aria-label="Look ahead">Ahead</button><button id="v3r" aria-label="Look right">Right ▶</button></div>';
      document.body.appendChild(box);
      document.getElementById('v3x').onclick=close;
      document.getElementById('v3l').onclick=function(){ look=(look-60+360)%360; tick(true) };
      document.getElementById('v3r').onclick=function(){ look=(look+60)%360; tick(true) };
      document.getElementById('v3c').onclick=function(){ look=0; tick(true) } }
    function msg(t){ var m=document.getElementById('v3msg'); if(!m) return; m.textContent=t||''; m.hidden=!t }
    function dest(lat,lon,brg,dm){ var R=6371000, d=dm/R, b=brg*Math.PI/180, la=lat*Math.PI/180, lo=lon*Math.PI/180;
      var la2=Math.asin(Math.sin(la)*Math.cos(d)+Math.cos(la)*Math.sin(d)*Math.cos(b)), lo2=lo+Math.atan2(Math.sin(b)*Math.sin(d)*Math.cos(la),Math.cos(d)-Math.sin(la)*Math.sin(la2)); return [lo2*180/Math.PI,la2*180/Math.PI] }
    function plane(){ var p=(lastData||[]).filter(function(x){return x.hex===hex})[0]; return p }
    function tick(force){ if(!m3||!ready||!box||box.hidden) return; var now=performance.now(); if(!force&&cfg2.v3Fps==='save'&&now-lastT<250) return; lastT=now;
      var p=plane(); if(!p){ if(!lost) lost=Date.now(); msg(Date.now()-lost>15000?'Signal lost. This plane is out of range.':'Waiting for the plane…'); return } lost=0;
      var pos=mPos(motion[p.hex]||{lat:p.lat,lon:p.lon},Date.now()), lat=pos[0], lon=pos[1], ex=+cfg2.v3Ex||1;
      var gnd=p.alt_baro==='ground', altM=gnd?0:(typeof p.alt_geom==='number'?p.alt_geom:p.alt_baro||0)*0.3048;
      var terr=0; try{ terr=m3.queryTerrainElevation([lon,lat])||0 }catch(e){}
      var cam=gnd?terr+4:Math.max(altM*ex,terr+60), agl=Math.max(30,cam-terr), hdg=((p.track||0)+look)%360;
      var dist=Math.min(40000,Math.max(1500,agl*9)), tgt=dest(lat,lon,hdg,dist);
      try{ var fc=m3.getFreeCameraOptions(); fc.position=maplibregl.MercatorCoordinate.fromLngLat([lon,lat],cam); fc.lookAtPoint(tgt); m3.setFreeCameraOptions(fc) }catch(e){}
      msg(gnd?'On the ground':''); document.getElementById('v3cs').textContent=name(p)+(look?' · looking '+(look===60?'right':look===300?'left':look===120?'right-back':look===240?'left-back':'back'):'');
      document.getElementById('v3st').textContent=[gnd?'GND':uAlt(p.alt_baro)+' '+altUnit(),uSpd(p.gs)+' '+spdUnit(),Math.round(p.track||0)+'°',typeName(p)||p.t||''].filter(Boolean).join(' · ') }
    function loop(){ if(!box||box.hidden) return; tick(false); raf=requestAnimationFrame(loop) }
    function init(){ var p=plane()||{lat:me.lat,lon:me.lon};
      m3=new maplibregl.Map({container:'v3map',interactive:false,maxPitch:85,center:[p.lon,p.lat],zoom:11,pitch:75,attributionControl:{compact:true},
        style:{version:8,sources:{sat:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:18,attribution:'Imagery © Esri, Maxar, Earthstar Geographics'},
          dem:{type:'raster-dem',tiles:['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],tileSize:256,encoding:'terrarium',maxzoom:13,attribution:'Terrain: Mapzen, AWS Open Data'}},
          layers:[{id:'bg',type:'background',paint:{'background-color':'#a9c9e8'}},{id:'sat',type:'raster',source:'sat'}],terrain:{source:'dem',exaggeration:+cfg2.v3Ex||1}}});
      m3.on('load',function(){ ready=true; try{ m3.setSky({'sky-color':'#5b9be0','horizon-color':'#d6e7f6','fog-color':'#e3edf6','sky-horizon-blend':.5,'horizon-fog-blend':.6,'fog-ground-blend':.35}) }catch(e){} msg(''); tick(true) });
      m3.on('error',function(){}) }
    function openFor(h){ hex=h; look=0; lost=0; if(!box) build(); box.hidden=false; document.body.classList.add('v3on'); msg('Loading 3D terrain…');
      lib().then(function(){ if(typeof maplibregl.supported==='function'&&!maplibregl.supported()){ msg('Your phone’s browser cannot show 3D maps.'); return } if(!m3){ ready=false; try{ init() }catch(e){ m3=null; msg('Your phone’s browser cannot show 3D maps.'); return } } else { m3.setTerrain({source:'dem',exaggeration:+cfg2.v3Ex||1}); m3.resize() } cancelAnimationFrame(raf); loop() })
        .catch(function(){ msg('3D view could not load. Check your connection and try again.') }) }
    function close(){ if(box) box.hidden=true; document.body.classList.remove('v3on'); cancelAnimationFrame(raf); if(m3){ try{ m3.remove() }catch(e){} m3=null; ready=false } }
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&box&&!box.hidden) close() });
    return {open:openFor,close:close} })();

  // ---- AR: hold the phone up to the sky and the camera labels the planes you are looking at ----
  __mod('ar',{get me(){return me},get units(){return units},get distUnit(){return distUnit},get lastData(){return lastData},get cfg2(){return cfg2},get spaceCfg(){return spaceCfg},get sats(){return sats},get upNow(){return upNow},get uAlt(){return uAlt},get altUnit(){return altUnit},get typeName(){return typeName},get esc(){return esc},get name(){return name},get pcol(){return pcol},get routeText(){return routeText},get spdUnit(){return spdUnit},get select(){return select},get selected(){return selected},set selected(v){selected=v},get render(){return render},get loadSats(){return loadSats}},'#arbtn');
  (function(){ var B=[['s_fsrRdOp','fsrRdOp'],['s_waterOp','waterOp'],['s_water','water'],['s_fsrOp','fsrOp'],['s_fsrFsr','fsrFsr'],['s_fsrRoad','fsrRoad'],['s_fsrWalk','fsrWalk'],['s_fsrBike','fsrBike'],['s_fsrMotor','fsrMotor'],['s_fsrBcts','fsrBcts'],['s_fsrPlan','fsrPlan'],['s_fsrTh','fsrTh'],['s_fsrCamp','fsrCamp'],['s_fsrClose','fsrClose'],['s_fsrOsm','fsrOsm'],['s_arMax','arMax'],['s_arDetail','arDetail'],['s_ovShow','ovShow'],['s_ovMins','ovMins'],['s_ovDist','ovDist'],['s_emShow','emShow'],['s_starlink','starlink'],['s_passAll','passAll'],['s_aptBad','aptOnlyBad'],['s_dtab','dtab'],['s_adir','adir'],['s_atype','atype'],['s_fireAll','fireAll'],['s_firePer','firePer'],['s_fireAc','fireAc'],['s_roadCams','roadCams'],['s_roadEvt','roadEvt'],['s_camAuto','camAuto'],['s_roadCons','roadCons'],['s_roadPass','roadPass'],['s_roadWA','roadWA'],['s_ferryHome','ferryHome'],['s_ferryN','ferryN'],['s_ferryFill','ferryFill'],['s_ferryCam','ferryCam'],['s_ferryJump','ferryJump'],['s_hubKm','hubKm'],['s_hubAuto','hubAuto'],['s_hubBadge','hubBadge'],['s_v3Ex','v3Ex'],['s_v3Fps','v3Fps'],['s_declutter','declutter'],['s_nearRef','nearRef'],['s_aMax','aMax'],['s_wxMax','wxMax'],['s_fireKm','fireKm'],['s_fireMax','fireMax'],['s_camMax','camMax'],['s_evtMax','evtMax'],['s_ferryMax','ferryMax'],['s_ltAge','ltAge'],['s_ltAlert','ltAlert'],['s_mt','mt'],['s_mtPins','mtPins'],['s_prepSolar','prepSolar']];
    (function(){ var sh=document.querySelector('#fsheet .sheet'); if(!sh) return; var about=sh.querySelector('.about');
      var G=[['Map',[['gfolder','Basics'],['rfolder','Map look, weather & water'],['cfolder','Compass']]],
        ['Planes',[['pcfolder','Planes on the map & alerts'],['arfolder','AR sky camera'],['v3folder','3D view'],['apfolder','Airports'],['ffolder','Flight feeds & key']]],
        ['Outdoors',[['mtfolder','Winter mountains'],['ltfolder','Lightning'],['prfolder','Survival tools']]],
        ['BC info',[['rdfolder','DriveBC roads & cameras'],['wffolder','WildfireBC'],['bfolder','BC Ferries'],['hbfolder','Emergency hub (SOS)'],['spfolder','Space & night sky']]]];
      G.forEach(function(g){ var h=document.createElement('div'); h.className='sethd'; h.textContent=g[0]; sh.insertBefore(h,about); g[1].forEach(function(f){ var d=document.getElementById(f[0]); if(!d) return; var su=d.querySelector('summary'); if(su) su.textContent=f[1]; sh.insertBefore(d,about) }) });
      var ff=document.getElementById('fsfolder'); if(ff) sh.insertBefore(ff,about);
      // plane settings live with the planes
      var pc=document.getElementById('pcfolder'), su=pc&&pc.querySelector('summary'); ['lgalt','routemode','maxpl'].forEach(function(id){ var el=document.getElementById(id), row=el&&el.closest('.setrow'); if(row&&pc) pc.insertBefore(row,su.nextSibling) });
      var RN={lgwx:'Rain colour key',lgalt:'Altitude colour key',s_declutter:'When zoomed out',s_nearRef:'Measure "nearest" from',radloop:'Radar animation',routemode:'Flight route lines',maxpl:'Planes shown',s_apt:'Airport weather tags',s_atype:'Airport icons for',s_aMax:'Airport icons shown',s_aptBad:'Weather tags show',s_wxMax:'Weather tags shown',s_adir:'Airport icons',s_hubKm:'Area to check',s_ferryFill:'Car space shown as',s_road:'Road info on the map',s_ferry:'Ferry terminals on the map'};
      Object.keys(RN).forEach(function(id){ var row=document.querySelector('label.setrow[for="'+id+'"]'); if(row&&row.firstChild&&row.firstChild.nodeType===3) row.firstChild.textContent=RN[id] }) })();
    function changed(k){ if((k==='water'||k==='waterOp')&&window.__water){ window.__water(); if(window.__fsr&&window.__fsr.refresh) window.__fsr.refresh() } if(/^fsr/.test(k)&&window.__fsr&&window.__fsr.refresh) window.__fsr.refresh(); if(k==='ovShow'||k==='ovMins'||k==='ovDist'){ nxNone=false; updateNext() } if(k==='emShow') checkAlerts(); if(k==='starlink'){ satReady=null; sats=[]; issTick(); loadSats().catch(function(){}) } if(k==='aptOnlyBad') loadApts(); if(k==='adir'||k==='atype') loadDir(); if(k==='fireAll'||k==='firePer') loadFires(true); if(k==='fireAc'){ for(var h in lastKey) lastKey[h]=''; } if(/^(roadCams|roadEvt|roadCons|roadPass|roadWA)$/.test(k)&&window.__roads) window.__roads.reload(); if(/^ferry/.test(k)&&window.__roads) window.__roads.ferry(); if(/^hub/.test(k)&&window.__hub){ if(k==='hubBadge') window.__hub.paint(); else window.__hub.refresh() } if(k==='declutter'){ zoomClass(); loadDir(); loadApts(); loadFires(true); if(window.__roads) window.__roads.reload() }
      if(k==='nearRef'||k==='aMax') drawDir(); if(k==='nearRef'||k==='wxMax') loadApts(); if(k==='nearRef'||k==='fireKm'||k==='fireMax') drawFires();
      if((k==='nearRef'||k==='camMax'||k==='evtMax')&&window.__roads) window.__roads.reload(); if((k==='nearRef'||k==='ferryMax')&&window.__roads&&window.__roads.ferries) window.__roads.ferries();
      if(k==='ltAge'&&window.__lt) window.__lt.redraw(); if(k==='ltAlert'&&window.__lt) window.__lt.alert(); if((k==='mt'||k==='mtPins')&&window.__mtn) window.__mtn.update();
      if(k==='prepSolar'&&cfg2.prepSolar!=='off'){ try{ if('Notification' in window&&Notification.permission==='default') Notification.requestPermission() }catch(e){} if(window.__prep) window.__prep.check() } }
    B.forEach(function(b){ var el=document.getElementById(b[0]); if(!el) return; el.value=String(cfg2[b[1]]); el.onchange=function(){ cfg2[b[1]]=el.value; saveCfg2(); changed(b[1]) } });
    var sm=document.getElementById('s_issmap'), sa=document.getElementById('s_satar'), ap=document.getElementById('s_apt'), rb=document.getElementById('s_arreset');
    function saveSpace(){ try{localStorage.setItem('sky-space',JSON.stringify(spaceCfg))}catch(e){} }
    if(sm){ sm.value=spaceCfg.map?'1':'0'; sm.onchange=function(){ spaceCfg.map=sm.value==='1'; saveSpace(); if(spaceCfg.map) loadSats().then(issTick).catch(function(){}); else issTick() } }
    if(sa){ sa.value=spaceCfg.ar?'1':'0'; sa.onchange=function(){ spaceCfg.ar=sa.value==='1'; saveSpace() } }
    if(ap){ ap.value=aptOn?'1':'0'; ap.onchange=function(){ aptOn=ap.value==='1'; try{localStorage.setItem('sky-apt',aptOn?'1':'0')}catch(e){} paintAptBtn(); if(aptOn&&map.getZoom()<6) map.setZoom(7); else loadApts() } }
    if(rb) rb.onclick=function(){ if(window.__ar&&window.__ar.reset) window.__ar.reset(); rb.textContent='Alignment reset ✓'; setTimeout(function(){rb.textContent='Reset compass alignment'},2500) };
  })();
  if(!active().length) setTimeout(openSheet,600);
  // Works as an installable app once the page is hosted on https
  if('serviceWorker' in navigator && location.protocol==='https:'){ navigator.serviceWorker.register('sw.js').catch(function(){});
    // the app opens from the phone straight away; when a newer version has downloaded in the background, offer it
    navigator.serviceWorker.addEventListener('message',function(e){ if(!e.data||e.data.t!=='upd'||document.getElementById('updbar')) return;
      var b=document.createElement('button'); b.id='updbar'; b.type='button'; b.textContent='AwareBC was updated · tap to refresh';
      b.style.cssText='position:fixed;z-index:1500;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%);border:0;border-radius:18px;padding:9px 14px;background:#0a84ff;color:#fff;font:700 13px var(--font);box-shadow:0 4px 12px rgba(0,0,0,.45);white-space:nowrap';
      b.onclick=function(){ location.reload() }; document.body.appendChild(b); setTimeout(function(){ if(b.parentNode) b.remove() },20000) }) }
})();
