// AwareBC vector maps (by Josh Singer). MapLibre GL draws inside the Leaflet map:
//  - On road ▸ Map style: Satellite, Liberty or Dark (OpenFreeMap vector tiles)
//  - Upright labels on every map: OpenFreeMap road names + Esri place labels (stay readable when the map turns)
//  - Off road ▸ 3D hillshade: AWS Terrain Tiles (elevation-tiles-prod) shaded live
//  - Offline: a .pmtiles vector archive (Protomaps format) saved in IndexedDB by the offline-area download
// If anything here can't start (no WebGL, library missing), the map keeps working exactly as before.
(function boot(){
  var A=window.__AW; if(!A||!A.map||!window.L){ setTimeout(boot,300); return }
  var map=A.map, ML=window.maplibregl, PM=window.pmtiles;
  var OFM='https://tiles.openfreemap.org/', ESRIV='https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/';
  var DEM='https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v) }catch(e){ return null } }

  // ---------- saved .pmtiles archive (IndexedDB) ----------
  var arch=null, archM=null;
  function db(){ return new Promise(function(ok,no){ try{ var r=indexedDB.open('awarebc-pm',1); r.onupgradeneeded=function(){ r.result.createObjectStore('a') }; r.onsuccess=function(){ ok(r.result) }; r.onerror=function(){ no(r.error) } }catch(e){ no(e) } }) }
  function idb(mode,fn){ return db().then(function(d){ return new Promise(function(ok,no){ var t=d.transaction('a',mode), s=t.objectStore('a'), q=fn(s); t.oncomplete=function(){ ok(q&&q.result) }; t.onerror=function(){ no(t.error) } }) }) }
  function openArch(){ return idb('readonly',function(s){ return s.get('bc') }).then(function(v){ arch=null; archM=null; if(!v||!v.blob||!PM) return;
      var bl=v.blob; archM=v.meta; arch=new PM.PMTiles({getKey:function(){ return 'awarebc-bc' },getBytes:function(o,l){ return bl.slice(o,o+l).arrayBuffer().then(function(d){ return {data:d} }) }}) }).catch(function(){}) }
  function tx(lon,z){ return Math.floor((lon+180)/360*Math.pow(2,z)) }
  function ty(lat,z){ var r=lat*Math.PI/180; return Math.floor((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*Math.pow(2,z)) }
  function inArch(z,x,y){ var m=archM; if(!m||z<m.z0||z>m.z1) return false; return x>=tx(m.w,z)&&x<=tx(m.e,z)&&y>=ty(m.n,z)&&y<=ty(m.s,z) }

  // PMTiles v3 writer: Hilbert tile ids, varint directories, leaf directories, no compression
  function tid(z,x,y){ var acc=(Math.pow(4,z)-1)/3, d=0, s, rx, ry, t; for(s=Math.pow(2,z)/2;s>=1;s/=2){ rx=(x&s)>0?1:0; ry=(y&s)>0?1:0; d+=s*s*((3*rx)^ry); if(ry===0){ if(rx===1){ x=s-1-x; y=s-1-y } t=x; x=y; y=t } } return acc+d }
  function vput(a,n){ while(n>=128){ a.push((n%128)|128); n=Math.floor(n/128) } a.push(n) }
  function dir(es){ var a=[], i; vput(a,es.length); var last=0; for(i=0;i<es.length;i++){ vput(a,es[i].id-last); last=es[i].id } for(i=0;i<es.length;i++) vput(a,es[i].run);
    for(i=0;i<es.length;i++) vput(a,es[i].len); for(i=0;i<es.length;i++){ if(i>0&&es[i].off===es[i-1].off+es[i-1].len) vput(a,0); else vput(a,es[i].off+1) } return new Uint8Array(a) }
  function u64(v,o,n){ for(var i=0;i<8;i++){ v.setUint8(o+i,n%256); n=Math.floor(n/256) } }
  function pack(list,meta){ // list: [{z,x,y,blob}] → Blob (.pmtiles)
    list.forEach(function(t){ t.id=tid(t.z,t.x,t.y) }); list.sort(function(a,b){ return a.id-b.id });
    var es=[], off=0; list.forEach(function(t){ es.push({id:t.id,off:off,len:t.blob.size,run:1}); off+=t.blob.size });
    var root, leaves=[], leafLen=0, LEAF=4096;
    if(dir(es).length<=16000) root=dir(es);
    else { var re=[]; for(var i=0;i<es.length;i+=LEAF){ var d=dir(es.slice(i,i+LEAF)); re.push({id:es[i].id,off:leafLen,len:d.length,run:0}); leaves.push(d); leafLen+=d.length } root=dir(re) }
    var md=new TextEncoder().encode(JSON.stringify({name:'AwareBC offline streets',attribution:'© OpenFreeMap © OpenMapTiles © OpenStreetMap contributors',vector_layers:meta.layers||[]}));
    var H=new ArrayBuffer(127), v=new DataView(H), p=127; 'PMTiles'.split('').forEach(function(c,i){ v.setUint8(i,c.charCodeAt(0)) }); v.setUint8(7,3);
    u64(v,8,p); u64(v,16,root.length); p+=root.length; u64(v,24,p); u64(v,32,md.length); p+=md.length; u64(v,40,p); u64(v,48,leafLen); p+=leafLen; u64(v,56,p); u64(v,64,off);
    u64(v,72,es.length); u64(v,80,es.length); u64(v,88,es.length); v.setUint8(96,1); v.setUint8(97,1); v.setUint8(98,1); v.setUint8(99,1); v.setUint8(100,meta.z0); v.setUint8(101,meta.z1);
    v.setInt32(102,Math.round(meta.w*1e7),true); v.setInt32(106,Math.round(meta.s*1e7),true); v.setInt32(110,Math.round(meta.e*1e7),true); v.setInt32(114,Math.round(meta.n*1e7),true);
    v.setUint8(118,meta.z0); v.setInt32(119,Math.round((meta.w+meta.e)/2*1e7),true); v.setInt32(123,Math.round((meta.s+meta.n)/2*1e7),true);
    return new Blob([H,root,md].concat(leaves,list.map(function(t){ return t.blob })),{type:'application/vnd.pmtiles'}) }

  // OpenFreeMap tile address (changes with each weekly build), saved so it also works offline
  var J={}; function getJ(u){ if(!J[u]) J[u]=fetch(u).then(function(r){ if(!r.ok) throw new Error(u); return r.json() }).catch(function(e){ delete J[u]; throw e }); return J[u] }
  function tpl(){ return getJ(OFM+'planet').then(function(j){ var t=j&&j.tiles&&j.tiles[0]; if(!t) throw 0; ls('aw-ofm-tpl',t); return t }).catch(function(){ var t=ls('aw-ofm-tpl'); if(t) return t; throw new Error('no tile address') }) }
  tpl().catch(function(){});
  window.__pm={ tpl:function(){ return ls('aw-ofm-tpl') },
    extras:function(){ return [OFM+'planet',OFM+'styles/liberty',OFM+'styles/dark'].concat(['Noto Sans Regular','Noto Sans Bold','Noto Sans Italic'].reduce(function(o,f){ return o.concat(['0-255','256-511','8192-8447'].map(function(r){ return OFM+'fonts/'+encodeURIComponent(f)+'/'+r+'.pbf' })) },[])) },
    save:function(list,meta){ var b=pack(list,meta); return idb('readwrite',function(s){ return s.put({blob:b,meta:{w:meta.w,s:meta.s,e:meta.e,n:meta.n,z0:meta.z0,z1:meta.z1,at:Date.now(),bytes:b.size}},'bc') }).then(openArch).then(function(){ return b.size }) },
    clear:function(){ return idb('readwrite',function(s){ return s.delete('bc') }).then(function(){ arch=null; archM=null }) },
    info:function(){ return archM }, _pack:pack, _tid:tid };
  openArch();
  if(!ML) return; // no MapLibre: picture maps and labels stay as they were

  // tiles come from the saved archive first, then the network
  try{ ML.addProtocol('ofm',function(p,ac){ var m=/^ofm:\/\/(\d+)\/(\d+)\/(\d+)/.exec(p.url); if(!m) return Promise.reject(new Error('bad tile')); var z=+m[1], x=+m[2], y=+m[3];
    function net(){ return tpl().then(function(t){ return fetch(t.replace('{z}',z).replace('{x}',x).replace('{y}',y),{signal:ac&&ac.signal}) }).then(function(r){ if(!r.ok) throw new Error('tile '+r.status); return r.arrayBuffer() }).then(function(d){ return {data:d} }) }
    if(arch&&inArch(z,x,y)) return arch.getZxy(z,x,y,ac&&ac.signal).then(function(t){ return t&&t.data?{data:t.data}:net() },net);
    return net() }) }catch(e){ return }

  // ---------- settings ----------
  var style=ls('aw-style')||'sat', hill=ls('aw-hill')==='1', labOn=ls('aw-gllab')!=='0', dead=false;
  function baseKey(){ var b=document.querySelector('.seg button[aria-pressed=true]'); return b?b.getAttribute('data-b'):'sat' }
  function want(){ var k=baseKey(), vec=k==='sat'&&style!=='sat'; return {kind:vec?style:'sat',hill:k==='fsr'&&hill,lab:vec||labOn} }

  // ---------- the GL map lives in its own pane, held upright and screen-sized while Leaflet moves and turns ----------
  var pane=map.createPane('glmap',map._rotatePane||map.getPane('mapPane')); pane.style.zIndex=250; pane.style.pointerEvents='none';
  var box=document.createElement('div'); box.style.cssText='position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none;display:none'; pane.appendChild(box);
  var gl=null, anim=false, curKey='', loaded=false, attr='';
  function size(){ var s=map.getSize(); box.style.width=s.x+'px'; box.style.height=s.y+'px'; return s }
  function place(){ var p=map.containerPointToLayerPoint([0,0]), b=map.getBearing?map.getBearing():0; box.style.transform='translate3d('+p.x+'px,'+p.y+'px,0) rotate('+(-b)+'deg)' }
  function cam(){ var s=map.getSize(), c=map.containerPointToLatLng([s.x/2,s.y/2]); return {center:[c.lng,c.lat],zoom:Math.max(0,map.getZoom()-1),bearing:-(map.getBearing?map.getBearing():0)} }
  function sync(){ if(!gl||anim||box.style.display==='none') return; place(); try{ gl.jumpTo(cam()) }catch(e){} }
  map.on('move zoom rotate viewreset',sync);
  map.on('resize',function(){ if(!gl) return; size(); try{ gl.resize() }catch(e){} sync() });
  map.on('zoomanim',function(e){ if(!gl||box.style.display==='none') return; anim=true; try{ gl.easeTo({center:[e.center.lng,e.center.lat],zoom:Math.max(0,e.zoom-1),bearing:-(map.getBearing?map.getBearing():0),duration:250,easing:function(t){ return 1-Math.pow(1-t,3) }}) }catch(x){} });
  map.on('zoomend',function(){ anim=false; sync() });

  // ---------- styles ----------
  var WHITE={'text-color':'#ffffff','text-halo-color':'rgba(0,0,0,0.85)','text-halo-width':1.4,'text-halo-blur':0.3};
  function font(f){ var s=JSON.stringify(f||''); return [/bold|black|heavy|semibold/i.test(s)?'Noto Sans Bold':/italic/i.test(s)?'Noto Sans Italic':'Noto Sans Regular'] }
  function ofmSrc(st){ var s=st.sources&&st.sources.openmaptiles; if(s){ delete s.url; s.tiles=['ofm://{z}/{x}/{y}']; s.minzoom=0; s.maxzoom=14; s.attribution='© OpenFreeMap © OpenMapTiles © OpenStreetMap' } return st }
  function hillL(){ return {id:'aw-hill',type:'hillshade',source:'aw-dem',paint:{'hillshade-exaggeration':0.6,'hillshade-shadow-color':'rgba(0,0,0,0.6)','hillshade-highlight-color':'rgba(255,255,255,0.22)','hillshade-accent-color':'rgba(0,0,0,0.35)','hillshade-illumination-anchor':'map'}} }
  function addHill(st){ st.sources['aw-dem']={type:'raster-dem',tiles:[DEM],encoding:'terrarium',tileSize:256,maxzoom:15,attribution:'Terrain: AWS Terrain Tiles (Mapzen)'};
    var i=st.layers.findIndex(function(l){ return l.type==='symbol' }); st.layers.splice(i<0?st.layers.length:i,0,hillL()); return st }
  function esriLabels(){ return getJ(ESRIV+'resources/styles/root.json').then(function(r){ var out=[];
      (r.layers||[]).forEach(function(l){ if(l.type!=='symbol'||/^(Road|Railroad|Ferry|Trail|Exit|Building)/i.test(l['source-layer']||'')) return;
        var lay={}, k; for(k in (l.layout||{})) if(k.indexOf('icon-')!==0) lay[k]=l.layout[k]; if(!lay['text-field']) return; lay['text-font']=font(lay['text-font']);
        var wat=/water|marine|ocean|river|lake|stream|bay|sea/i.test(l['source-layer']||''), pt={}; for(k in WHITE) pt[k]=WHITE[k]; if(wat) pt['text-color']='#bfe9ff';
        var o={id:'esri-'+l.id,type:'symbol',source:'esri','source-layer':l['source-layer'],layout:lay,paint:pt}; if(l.filter) o.filter=l.filter; if(l.minzoom!=null) o.minzoom=l.minzoom; if(l.maxzoom!=null) o.maxzoom=l.maxzoom; out.push(o) });
      return out }) }
  function build(w){
    if(w.kind!=='sat') return getJ(OFM+'styles/'+w.kind).then(function(s){ var st=ofmSrc(JSON.parse(JSON.stringify(s))); return w.hill?addHill(st):st });
    // over the satellite picture: transparent map, upright labels (OpenFreeMap roads + Esri places), optional hillshade
    return getJ(OFM+'styles/liberty').then(function(s0){ var s=JSON.parse(JSON.stringify(s0)), st={version:8,glyphs:s.glyphs,sprite:s.sprite,sources:{},layers:[]};
      if(w.lab){ st.sources.openmaptiles=ofmSrc(s).sources.openmaptiles; }
      return (w.lab?esriLabels().catch(function(){ return null }):Promise.resolve([])).then(function(E){
        if(w.lab){ s.layers.forEach(function(l){ if(l.type!=='symbol') return; var sl=l['source-layer']; if(sl!=='transportation_name'&&!(E===null&&/^(place|water_name|mountain_peak|poi)$/.test(sl||''))) return;
            var o=JSON.parse(JSON.stringify(l)), p=o.paint||{}; if(!(o.layout&&o.layout['icon-image'])){ for(var k in WHITE) p[k]=WHITE[k] } o.paint=p; st.layers.push(o) });
          if(E&&E.length){ st.sources.esri={type:'vector',tiles:[ESRIV+'tile/{z}/{y}/{x}.pbf'],maxzoom:15,attribution:'Labels © Esri'}; st.layers=st.layers.concat(E) } }
        if(w.hill) addHill(st); return st }) }) }

  // ---------- switching ----------
  function rasterLabels(show){ var b=A.base&&A.base(); if(!b) return; window.__glLab=!show; if(b[2]&&b[2].setOpacity) b[2].setOpacity(show?1:0); if(b[1]&&b[1].setOpacity) b[1].setOpacity(show?1:0); if(window.__navNamesChk) window.__navNamesChk() }
  function leafletBase(show){ var b=A.base&&A.base(); if(!b) return; b.forEach(function(l){ if(show&&!map.hasLayer(l)) l.addTo(map); if(!show&&map.hasLayer(l)) map.removeLayer(l) }) }
  function setAttr(t){ var c=map.attributionControl; if(!c||t===attr) return; if(attr) c.removeAttribution(attr); attr=t; if(t) c.addAttribution(t) }
  function off(){ box.style.display='none'; curKey=''; leafletBase(true); rasterLabels(true); setAttr(''); map.eachLayer(function(l){ if(l.setOpacity&&l.options&&/Offline map/.test(l.options.attribution||'')) l.setOpacity(1) }) }
  var seq=0;
  function apply(){ if(dead) return off(); var w=want(), key=w.kind+'|'+w.hill+'|'+w.lab, my=++seq;
    if(w.kind==='sat'&&!w.lab&&!w.hill){ off(); return }
    if(key===curKey){ after(w); return }
    build(w).then(function(st){ if(my!==seq) return; curKey=key; loaded=false; box.style.display=''; pane.style.zIndex=w.kind==='sat'?250:150; size(); place();
      if(!gl){ try{ gl=new ML.Map(L.extend({container:box,style:st,interactive:false,attributionControl:false,fadeDuration:200,trackResize:false,renderWorldCopies:false,maxPitch:0,pixelRatio:Math.min(window.devicePixelRatio||1,2)},cam()));
          gl.on('load',function(){ loaded=true; after(want()) }); gl.on('styledata',function(){ if(gl.isStyleLoaded&&gl.isStyleLoaded()){ loaded=true; after(want()) } });
          var nE=0; gl.on('error',function(e){ var m=e&&e.error&&e.error.message||''; if(window.console) console.warn('[gl]',m); if(!/tile|fetch|404|403|Failed to fetch|abort/i.test(m)&&++nE<=3&&window.__crash) window.__crash.add('Map graphics error',m) });
          gl.getCanvas().addEventListener('webglcontextlost',function(ev){ ev.preventDefault(); if(window.__crash) window.__crash.add('Map graphics stopped','WebGL context lost (phone graphics memory full). Vector map switched off for this session.'); dead=true; off(); A.say&&A.say('Vector map paused (low memory) · picture map back',3000) });
        }catch(e){ if(window.__crash) window.__crash.add('Map graphics could not start',String(e&&e.message||e)); dead=true; off(); return } }
      else { gl.setStyle(st,{diff:false}); sync() }
      setTimeout(function(){ if(my===seq&&!loaded&&w.kind!=='sat'){ curKey=''; leafletBase(true) } },15000) }).catch(function(){ if(my!==seq) return; off() }) }
  function after(w){ if(!loaded||dead) return; var vec=w.kind!=='sat'; leafletBase(!vec); rasterLabels(!w.lab);
    map.eachLayer(function(l){ if(l.setOpacity&&l.options&&/Offline map/.test(l.options.attribution||'')) l.setOpacity(vec?0:1) }); // the saved picture map would cover the street map
    setAttr((vec||w.lab?'© OpenFreeMap © OpenMapTiles':'')+(w.lab&&!vec?' · Labels © Esri':'')+(w.hill?' · Terrain: AWS Terrain Tiles':'')); sync() }
  window.__glBase=function(){ setTimeout(apply,0) };
  window.__gl={ apply:apply, state:function(){ return {style:style,hill:hill,lab:labOn,key:curKey,loaded:loaded,dead:dead,arch:archM} } };

  // ---------- controls in the layer panels ----------
  function row(pn,id,lab,opts,val,fn,top){ if(!pn||document.getElementById(id)) return; var l=document.createElement('label'); l.className=top?'fpt':'fps';
    l.innerHTML=lab+'<select id="'+id+'" aria-label="'+lab+'">'+opts.map(function(o){ return '<option value="'+o[0]+'">'+o[1]+'</option>' }).join('')+'</select>';
    if(top){ var h=pn.querySelector('.fph'); h.insertBefore(l,h.querySelector('.fpx')) } else { var gv=pn.querySelector('.gpxv'); pn.insertBefore(l,gv||null) }
    var s=l.querySelector('select'); s.value=val; s.onchange=function(){ fn(s.value) } }
  row(document.querySelector('.lyrp[aria-label="On road layers"]'),'aw_style','Map style',[['sat','Satellite'],['liberty','Liberty'],['dark','Dark']],style,function(v){ style=v; ls('aw-style',v); apply() });
  row(document.querySelector('.lyrp[aria-label="Off road layers"]'),'aw_hill','3D hills',[['0','Off'],['1','On']],hill?'1':'0',function(v){ hill=v==='1'; ls('aw-hill',v); apply() },true);
  apply();
})();
