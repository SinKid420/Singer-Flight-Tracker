/* AwareBC 3D drive view (by Josh Singer): at night, while driving with directions, the map tilts into a 3D view:
   dark teal streets (Aurora), buildings standing up, your route glowing, a night sky with mountains, stars and northern lights.
   The turn banner, odometer and arrival bar stay on top. Tap "2D" to go back to the flat map (remembered), "3D" to return.
   Free sources only: OpenFreeMap street map and building heights, drawn by MapLibre (already in the app). */
(function boot(){
  if(!window.__nav||!window.__gl||!window.__gl.aurora||!window.maplibregl||!window.__AW||!window.__AW.map){ setTimeout(boot,600); return }
  var ML=window.maplibregl, LOW=!!window.__awLow, gl=null, box=null, ui=null, on=false, last=null, hd=0, rtKey='';
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v) }catch(e){ return null } }
  function want(){ var b=document.body.classList; return b.contains('navdrv')&&b.contains('awnight')&&ls('aw-d3')!=='0' }
  var css=document.createElement('style'); css.textContent=
    '#awd3{position:fixed;inset:0;z-index:450;background:#11191c;overflow:hidden}#awd3 .gl{position:absolute;inset:0}'+
    '#awd3 .sky{position:absolute;left:0;top:0;width:100%;height:34%;pointer-events:none;-webkit-mask-image:linear-gradient(#000 50%,transparent);mask-image:linear-gradient(#000 50%,transparent)}' /* stars and northern lights over the sky, fading out over the town */+
    '#awd3 .you{position:absolute;left:50%;top:calc(58% - 30px);width:60px;height:60px;margin-left:-30px;pointer-events:none;filter:drop-shadow(0 4px 8px rgba(0,0,0,.6))}'+
    '#awd3t{position:fixed;z-index:1310;right:12px;top:calc(env(safe-area-inset-top,0px) + 230px);width:48px;height:48px;border-radius:50%;border:1px solid rgba(79,240,192,.35);background:rgba(14,21,23,.92);color:#4ff0c0;font:900 14px var(--font,system-ui);box-shadow:0 6px 16px rgba(0,0,0,.5);display:none}'+
    'body.navdrv.awnight #awd3t{display:block}';
  document.head.appendChild(css);
  function ll(p){ return p&&p.lat!=null?[p.lng!=null?p.lng:p.lon,p.lat]:[p[1],p[0]] }
  function sky(){ /* stars, northern lights and mountains along the horizon */
    var st='', r=11; function rnd(){ r=(r*9301+49297)%233280; return r/233280 }
    for(var i=0;i<70;i++) st+='<circle cx="'+(rnd()*360).toFixed(1)+'" cy="'+(rnd()*150).toFixed(1)+'" r="'+[0.5,0.7,0.9,1.2][Math.floor(rnd()*4)]+'" fill="#fff" opacity="'+(0.3+rnd()*0.7).toFixed(2)+'"/>';
    return '<svg class="sky" viewBox="0 0 360 260" preserveAspectRatio="none"><defs><linearGradient id="d3au" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5dffb0" stop-opacity="0"/><stop offset=".6" stop-color="#3dffa0" stop-opacity=".45"/><stop offset="1" stop-color="#2be08a" stop-opacity="0"/></linearGradient><filter id="d3bl"><feGaussianBlur stdDeviation="7"/></filter></defs>'+st+
      '<path d="M-20 120 C60 70 130 140 210 90 S330 70 380 100 L380 170 C300 150 220 180 140 150 S20 160 -20 170Z" fill="url(#d3au)" filter="url(#d3bl)"/>'+
      '</svg>' }
  function route(){ var r=window.__nav.route&&window.__nav.route(); if(!r||!r.pts||!r.pts.length) return {type:'FeatureCollection',features:[]};
    return {type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:r.pts.map(ll)}}]} }
  function start(){ if(on) return; on=true;
    box=document.createElement('div'); box.id='awd3'; box.innerHTML='<div class="gl"></div>'+sky()+'<svg class="you" viewBox="0 0 60 60"><ellipse cx="30" cy="42" rx="24" ry="9" fill="#4ff0c0" opacity=".3"/><path d="M30 8 L46 46 L30 37 L14 46Z" fill="#fff" stroke="#4ff0c0" stroke-width="4" stroke-linejoin="round"/></svg>';
    document.body.appendChild(box);
    var me=window.__AW.me&&window.__AW.me()||{lat:50.67,lon:-120.33};
    window.__gl.aurora().then(function(st){ if(!on) return;
      st.sources.rt={type:'geojson',data:route()};
      st.layers.push({id:'d3-bld',type:'fill-extrusion',source:'openmaptiles','source-layer':'building',minzoom:LOW?15:14,filter:['!=',['get','hide_3d'],true],
        paint:{'fill-extrusion-color':['case',['==',['%',['round',['coalesce',['get','render_height'],6]],7],0],'#2f6a5a',['>',['coalesce',['get','render_height'],0],14],'#24333b','#1b262c'],'fill-extrusion-height':['coalesce',['get','render_height'],6],'fill-extrusion-base':['coalesce',['get','render_min_height'],0],'fill-extrusion-opacity':0.95}});
      st.layers.push({id:'d3-rtg',type:'line',source:'rt',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#4ff0c0','line-opacity':.25,'line-blur':8,'line-width':['interpolate',['exponential',2],['zoom'],14,10,18,90]}});
      st.layers.push({id:'d3-rtc',type:'line',source:'rt',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#0b4a3a','line-width':['interpolate',['exponential',2],['zoom'],14,7,18,56]}});
      st.layers.push({id:'d3-rt',type:'line',source:'rt',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#4ff0c0','line-width':['interpolate',['exponential',2],['zoom'],14,5,18,42]}});
      st.sky={'sky-color':'#03080b','horizon-color':'#0f3a35','sky-horizon-blend':0.6,'horizon-fog-blend':0.6,'fog-color':'#11191c','fog-ground-blend':0.4};
      try{ gl=new ML.Map({container:box.querySelector('.gl'),style:st,interactive:false,attributionControl:false,center:[me.lon,me.lat],zoom:16.8,pitch:66,bearing:hd,maxPitch:75,
        pixelRatio:LOW?1:Math.min(window.devicePixelRatio||1,2),antialias:!LOW,maxTileCacheSize:LOW?12:50,fadeDuration:0,refreshExpiredTiles:false}); gl.setPadding({top:Math.round(innerHeight*0.32),bottom:0,left:0,right:0}) }catch(e){ stop(); return }

    }).catch(function(){ stop() }) }
  function stop(){ if(!on) return; on=false; try{ gl&&gl.remove() }catch(e){} gl=null; if(box) box.remove(); box=null }
  function follow(f){ if(!gl) return; if(last){ var dy=f.lat-last.lat, dx=(f.lon-last.lon)*Math.cos(f.lat*Math.PI/180); if(Math.hypot(dx,dy)*111000>6) hd=(Math.atan2(dx,dy)*180/Math.PI+360)%360 } if(f.hd>=0) hd=f.hd; last=f;
    var sp=f.sp>=0?f.sp*3.6:0; gl.easeTo({center:[f.lon,f.lat],bearing:hd,zoom:sp>80?16.2:sp>40?16.6:17,duration:900,easing:function(t){ return t }}) }
  addEventListener('aw-fix',function(e){ var f=e.detail||{}; if(on) follow({lat:f.lat,lon:f.lon,sp:f.sp,hd:-1}) });
  /* keep the route line current (it changes when the route is worked out again) */
  setInterval(function(){ if(!gl||!gl.getSource||!gl.getSource('rt')) return; var r=window.__nav.route&&window.__nav.route(), k=r&&r.pts?r.pts.length+':'+JSON.stringify(r.pts[0]):''; if(k!==rtKey){ rtKey=k; try{ gl.getSource('rt').setData(route()) }catch(e){} } },3000);
  /* 2D / 3D switch */
  ui=document.createElement('button'); ui.type='button'; ui.id='awd3t'; ui.setAttribute('aria-label','Switch between 3D and flat map'); document.body.appendChild(ui);
  function label(){ ui.textContent=ls('aw-d3')==='0'?'3D':'2D' }
  ui.onclick=function(){ ls('aw-d3',ls('aw-d3')==='0'?'1':'0'); label(); check() };
  function check(){ label(); if(want()) start(); else stop() }
  new MutationObserver(check).observe(document.body,{attributes:true,attributeFilter:['class']}); check();
  window.__drive3d={on:function(){ return on },map:function(){ return gl }};
})();
