// AwareBC extras (by Josh Singer):
//  1. Spoken directions (on/off button in the directions panel; phone's own voice, works with no signal)
//  2. Elevation: climb/descent profile and steep-grade warnings for routes, altitude, slope-angle shading off road (AWS Terrain Tiles)
//  5. Low-service routes: offers to save the map along the route when directions start
//  6. Smoke forecast map (ECCC FireWork) with the Fires layer
//  7. River and creek gauges (ECCC real-time hydrometric data) with the Creeks layer; BC flood warnings
//  8. Offline place search (BC Geographical Names saved with your offline areas)
(function boot(){
  var A=window.__AW; if(!A||!A.map||!window.L||!window.__nav){ setTimeout(boot,300); return }
  var map=A.map, esc=A.esc||function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] }) };
  var RELAY='https://awarebc.aware-bc.workers.dev/';
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v) }catch(e){ return null } }
  function hav(a,b,c,d){ var r=Math.PI/180, x=Math.sin((c-a)*r/2), y=Math.sin((d-b)*r/2), h=x*x+Math.cos(a*r)*Math.cos(c*r)*y*y; return 12742000*Math.asin(Math.min(1,Math.sqrt(h))) }
  function dTxt(m){ if(m<950) return (m<100?Math.round(m/10)*10:Math.round(m/50)*50)+' m'; return (m<9500?(m/1000).toFixed(1):Math.round(m/1000))+' km' }
  function css(t){ var s=document.createElement('style'); s.textContent=t; document.head.appendChild(s) }
  function toast(html,ms){ var d=document.createElement('div'); d.className='awtoast'; d.innerHTML=html; document.body.appendChild(d); setTimeout(function(){ d.remove() },ms||5000); return d }
  css('.awtoast{position:fixed;left:16px;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 74px);z-index:2600;background:rgba(28,28,30,.97);color:#fff;border-radius:12px;padding:10px 12px;font:13px/1.35 var(--font,system-ui);box-shadow:0 4px 16px rgba(0,0,0,.5);text-align:center}.awtoast b{display:block;font-size:14px;margin-bottom:2px}'+
    '.awtoast .awb{display:flex;gap:8px;margin-top:8px}.awtoast .awb button{flex:1;min-height:36px;border:0;border-radius:18px;font:700 13px var(--font,system-ui);background:#2c2c2e;color:#fff}.awtoast .awb .pri{background:var(--accent,#ff3b30)}'+
    '#navp .nelv{display:flex;align-items:center;gap:8px;margin:4px 0 2px;font-size:12px;color:var(--dim,#aaa)}#navp .nelv svg{flex:none;width:96px;height:30px}#navp .nelv b{color:var(--fg,#fff)}'+
    '#navp button[data-x=voice]{flex:0 0 40px;min-width:40px;padding:0}#navp .nsv{font-size:12px;color:var(--dim,#aaa);margin-top:3px}'+
    '.gaugemk{display:block;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:#0288d1;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.6);font:700 9px/12px system-ui;color:#fff;text-align:center}.gaugemk.up{background:#e65100}.gaugemk.dn{background:#2e7d32}'+
    '.gpop small{color:#666}.gpop svg{display:block;margin:4px 0}#fsrleg .slopeleg{grid-column:1/-1;width:0;min-width:100%;display:flex;gap:5px;align-items:center;white-space:nowrap;font:600 10px var(--font,system-ui);color:var(--dim,#aaa);margin-top:2px;overflow:hidden}#fsrleg .slopeleg span{display:inline-flex;align-items:center;gap:2px}#fsrleg .slopeleg b{display:inline-block;width:9px;height:9px;border-radius:2px}');

  // ============ 1. Spoken directions ============
  var voiceOn=ls('aw-voice')!=='0', NP=null;
  try{ var C=window.Capacitor; if(C&&C.isNativePlatform&&C.isNativePlatform()&&C.registerPlugin) NP=C.registerPlugin('AWSpeak') }catch(e){}
  function web(t){ var S=window.speechSynthesis; if(!S||!window.SpeechSynthesisUtterance) return; try{ S.cancel(); var u=new SpeechSynthesisUtterance(t); u.lang='en-CA'; u.rate=1; S.speak(u) }catch(e){} }
  function speak(t){ if(!voiceOn||!t) return; t=String(t).replace(/\bFSR\b/g,'F S R').replace(/\bRd\b/g,'Road').replace(/\bHwy\b/g,'Highway').replace(/\bSt\b/g,'Street').replace(/\bAve\b/g,'Avenue');
    if(NP) NP.speak({text:t}).catch(function(){ web(t) }); else web(t) }
  function hush(){ try{ if(NP) NP.stop().catch(function(){}); if(window.speechSynthesis) speechSynthesis.cancel() }catch(e){} }
  function spokenD(m){ if(m<950) return (m<100?Math.round(m/10)*10:Math.round(m/50)*50)+' metres'; var k=m/1000; return (k<9.5?k.toFixed(1).replace(/\.0$/,''):Math.round(k))+' kilometres' }
  var ann={}, annKey='', lastSpd=0, lastP=null;

  // ============ 2. Elevation (AWS Terrain Tiles, terrarium) ============
  var DEMU='https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png', demC={}, demK=[];
  function demTile(z,x,y){ var k=z+'/'+x+'/'+y; if(demC[k]) return demC[k];
    var p=new Promise(function(ok){ var im=new Image(); im.crossOrigin='anonymous'; im.decoding='async';
      im.onload=function(){ try{ var c=document.createElement('canvas'); c.width=c.height=256; var g=c.getContext('2d',{willReadFrequently:true}); g.drawImage(im,0,0); var d=g.getImageData(0,0,256,256).data, a=new Float32Array(65536);
          for(var i=0;i<65536;i++) a[i]=d[i*4]*256+d[i*4+1]+d[i*4+2]/256-32768; ok(a) }catch(e){ ok(null) } };
      im.onerror=function(){ ok(null) }; im.src=DEMU.replace('{z}',z).replace('{x}',x).replace('{y}',y) });
    demC[k]=p; demK.push(k); if(demK.length>80){ delete demC[demK.shift()] } return p }
  function wpx(lat,lon,z){ var n=Math.pow(2,z), r=lat*Math.PI/180; return [(lon+180)/360*n*256,(1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n*256] }
  function elevAt(lat,lon,z){ var p=wpx(lat,lon,z), X=p[0]-0.5, Y=p[1]-0.5, x0=Math.floor(X), y0=Math.floor(Y), fx=X-x0, fy=Y-y0, tx=Math.floor(x0/256), ty=Math.floor(y0/256);
    return demTile(z,tx,ty).then(function(a){ if(!a) return null; function e(x,y){ var lx=Math.min(255,Math.max(0,x-tx*256)), ly=Math.min(255,Math.max(0,y-ty*256)); return a[ly*256+lx] }
      return e(x0,y0)*(1-fx)*(1-fy)+e(x0+1,y0)*fx*(1-fy)+e(x0,y0+1)*(1-fx)*fy+e(x0+1,y0+1)*fx*fy }) }
  function profile(r){ var pts=r.pts, cum=r.cum, D=r.dist||cum[cum.length-1]; if(!pts||pts.length<2||!D) return Promise.resolve(null);
    var z=D<30000?12:D<120000?11:10, step=Math.max(40,D/500), S=[], j=0;
    for(var d=0;d<=D;d+=step){ while(j<cum.length-2&&cum[j+1]<d) j++; var seg=cum[j+1]-cum[j]||1, t=Math.min(1,Math.max(0,(d-cum[j])/seg)); S.push({d:d,la:pts[j][0]+(pts[j+1][0]-pts[j][0])*t,lo:pts[j][1]+(pts[j+1][1]-pts[j][1])*t}) }
    return Promise.all(S.map(function(s){ return elevAt(s.la,s.lo,z) })).then(function(E){ var ok=E.filter(function(v){ return v!=null }); if(ok.length<S.length*0.6) return null;
      for(var i=0;i<E.length;i++) if(E[i]==null) E[i]=i?E[i-1]:ok[0];
      var sm=E.map(function(v,i){ var a=E[Math.max(0,i-1)], b=E[Math.min(E.length-1,i+1)]; return (a+v+b)/3 });
      var up=0, dn=0, mx=-1e9, mn=1e9; for(i=0;i<sm.length;i++){ if(i){ var de=sm[i]-sm[i-1]; if(de>0) up+=de; else dn-=de } mx=Math.max(mx,sm[i]); mn=Math.min(mn,sm[i]) }
      // steep stretches: grade over ~200 m windows, joined while it stays steep
      var W=Math.max(1,Math.round(200/step)), steep=[], cur=null, top=0;
      for(i=0;i+W<sm.length;i++){ var g=(sm[i+W]-sm[i])/(S[i+W].d-S[i].d)*100, ag=Math.abs(g); if(ag>top) top=ag;
        if(ag>=10){ if(cur&&Math.sign(g)===Math.sign(cur.g)&&S[i].d<=cur.d1+step){ cur.d1=S[i+W].d; if(ag>Math.abs(cur.g)) cur.g=g } else { cur={d0:S[i].d,d1:S[i+W].d,g:g}; steep.push(cur) } } else cur=null }
      steep=steep.filter(function(s){ return s.d1-s.d0>=200 });
      return {d:S.map(function(s){ return s.d }),e:sm,up:up,dn:dn,mx:mx,mn:mn,top:top,steep:steep,z:z} }) }
  function spark(xs,ys,w,h,col){ var x0=xs[0], x1=xs[xs.length-1]||1, mn=Math.min.apply(null,ys), mx=Math.max.apply(null,ys), rg=Math.max(mx-mn,1);
    var pts=ys.map(function(y,i){ return ((xs[i]-x0)/((x1-x0)||1)*w).toFixed(1)+','+(h-2-(y-mn)/rg*(h-4)).toFixed(1) }).join(' ');
    return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" aria-hidden="true"><polyline points="0,'+h+' '+pts+' '+w+','+h+'" fill="'+col+'33" stroke="none"/><polyline points="'+pts+'" fill="none" stroke="'+col+'" stroke-width="1.6"/></svg>' }
  var altTxt=''; function altNow(lat,lon){ elevAt(lat,lon,12).then(function(e){ if(e==null) return; altTxt=Math.round(e).toLocaleString()+' m (terrain data)'; window.__altTxt=altTxt }) }
  setInterval(function(){ var m=A.me&&A.me(); if(m&&m.label==='you') altNow(m.lat,m.lon) },15000); setTimeout(function(){ var m=A.me&&A.me(); if(m&&m.label==='you') altNow(m.lat,m.lon) },4000);

  // slope-angle shading (avalanche terrain 27°+) from the same terrain tiles, Off road only
  var SL=[[27,[255,235,59]],[30,[255,152,0]],[35,[244,67,54]],[45,[156,39,176]]];
  var Slope=L.GridLayer.extend({ createTile:function(c,done){ var cv=document.createElement('canvas'); cv.width=cv.height=256; var sz=Math.min(c.z,13), dz=c.z-sz, f=Math.pow(2,dz), tx=Math.floor(c.x/f), ty=Math.floor(c.y/f);
      demTile(sz,tx,ty).then(function(a){ if(!a){ done(null,cv); return } var g=cv.getContext('2d'), im=g.createImageData(256,256), o=im.data, ox=(c.x-tx*f)*256/f, oy=(c.y-ty*f)*256/f, sc=1/f;
        var lat=(function(){ var n=Math.PI-2*Math.PI*(ty+0.5)/Math.pow(2,sz); return Math.atan(Math.sinh(n)) })(), cell=40075016.686*Math.cos(lat)/Math.pow(2,sz)/256;
        function E(x,y){ x=x<0?0:x>255?255:x; y=y<0?0:y>255?255:y; return a[y*256+x] }
        for(var py=0;py<256;py++) for(var px=0;px<256;px++){ var sx=Math.floor(ox+px*sc), sy=Math.floor(oy+py*sc), gx=(E(sx+1,sy)-E(sx-1,sy))/(2*cell), gy=(E(sx,sy+1)-E(sx,sy-1))/(2*cell), deg=Math.atan(Math.sqrt(gx*gx+gy*gy))*180/Math.PI;
          var col=null; for(var k=SL.length-1;k>=0;k--){ if(deg>=SL[k][0]){ col=SL[k][1]; break } } if(!col) continue; var q=(py*256+px)*4; o[q]=col[0]; o[q+1]=col[1]; o[q+2]=col[2]; o[q+3]=120 }
        g.putImageData(im,0,0); done(null,cv) }) ; return cv } });
  var slope=new Slope({minZoom:11,maxZoom:19,opacity:.75,zIndex:7,updateWhenIdle:true,keepBuffer:0,attribution:'Slope angle from AWS Terrain Tiles'}), slopeOn=ls('aw-slope')==='1';
  function offMode(){ var b=document.querySelector('.seg button[aria-pressed=true]'); return !!b&&b.getAttribute('data-b')==='fsr' }
  function slopeUpd(){ var want=slopeOn&&offMode(); if(want&&!map.hasLayer(slope)) slope.addTo(map); if(!want&&map.hasLayer(slope)) map.removeLayer(slope); legend() }
  function legend(){ var lg=document.getElementById('fsrleg'); if(!lg) return; var el=document.getElementById('slopeleg'); var want=slopeOn&&offMode();
    if(want&&!el){ el=document.createElement('small'); el.id='slopeleg'; el.className='slopeleg'; el.title='Slope angle (avalanche terrain)'; el.innerHTML=[['#ffeb3b','27°'],['#ff9800','30°'],['#f44336','35°'],['#9c27b0','45°+']].map(function(x){ return '<span><b style="background:'+x[0]+'"></b>'+x[1]+'</span>' }).join(''); lg.appendChild(el) }
    if(!want&&el) el.remove() }
  // Off road layers ▸ Terrain: Off · 3D hills · Slope · Both
  (function(){ var pn=document.querySelector('.lyrp[aria-label="Off road layers"]'); if(!pn||document.getElementById('aw_terr')) return; var h=pn.querySelector('.fph'), l=document.createElement('label'); l.className='fpt';
    var hill=window.__gl&&window.__gl.hill?window.__gl.hill():ls('aw-hill')==='1', canHill=!!(window.__gl&&window.__gl.setHill);
    l.innerHTML='Terrain<select id="aw_terr" aria-label="Terrain"><option value="0">Off</option>'+(canHill?'<option value="1">3D hills</option>':'')+'<option value="2">Slope</option>'+(canHill?'<option value="3">Both</option>':'')+'</select>';
    h.insertBefore(l,h.querySelector('.fpx')); var s=l.querySelector('select'); s.value=String((hill&&canHill?1:0)+(slopeOn?2:0));
    s.onchange=function(){ var v=+s.value; if(canHill) window.__gl.setHill(v===1||v===3); slopeOn=v>=2; ls('aw-slope',slopeOn?'1':'0'); slopeUpd() } })();
  [].forEach.call(document.querySelectorAll('.seg button'),function(b){ b.addEventListener('click',function(){ setTimeout(slopeUpd,50) }) }); setTimeout(slopeUpd,500);

  // ============ 5. Low-service routes: save the map along the way ============
  var GNSQ='https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_BASEMAPPING.GNS_GEOGRAPHICAL_NAMES_SP&outputFormat=json&srsName=EPSG:4326&count=3000&propertyName=GEOGRAPHICAL_NAME,FEATURE_TYPE,FEATURE_CATEGORY,LATITUDE,LONGITUDE&CQL_FILTER=';
  function towns(b){ var f="BBOX(GEOMETRY,"+[b.w,b.s,b.e,b.n].map(function(v){ return v.toFixed(3) }).join(',')+",'EPSG:4326') AND (FEATURE_CATEGORY ILIKE '%opulat%' OR FEATURE_TYPE ILIKE '%City%' OR FEATURE_TYPE ILIKE '%Town%' OR FEATURE_TYPE ILIKE '%Village%' OR FEATURE_TYPE ILIKE '%Community%' OR FEATURE_TYPE ILIKE '%Municipal%')";
    return fetch(GNSQ+encodeURIComponent(f)).then(function(r){ if(!r.ok) throw 0; return r.json() }).then(function(j){ return (j.features||[]).map(function(x){ var p=x.properties||{}; return [+p.LATITUDE,+p.LONGITUDE] }).filter(function(p){ return isFinite(p[0])&&isFinite(p[1]) }) }) }
  function inB(b,la,lo){ return b&&la>=b.s&&la<=b.n&&lo>=b.w&&lo<=b.e }
  function lowService(r){ var O=window.__off; if(!O||!r||!r.pts) return Promise.resolve(null); var pts=r.pts, sv=O.saved&&O.saved();
    if(pts.every(function(p){ return O.inHome(p[0],p[1])||(sv&&inB(sv.b,p[0],p[1])) })) return Promise.resolve(null); // already saved
    var why=null; if(r.mode==='off'&&r.dist>3000) why='Off road route'; else if(r.note||(r.warn||[]).some(function(w){ return /forest|rough|decommission|logging/i.test(w) })) why='Uses forest or back roads';
    if(why) return Promise.resolve(why); if(r.dist<15000) return Promise.resolve(null);
    var b={s:90,n:-90,w:180,e:-180}; pts.forEach(function(p){ b.s=Math.min(b.s,p[0]); b.n=Math.max(b.n,p[0]); b.w=Math.min(b.w,p[1]); b.e=Math.max(b.e,p[1]) }); b={s:b.s-.1,n:b.n+.1,w:b.w-.15,e:b.e+.15};
    return towns(b).then(function(T){ if(!T.length) return 'Far from towns'; var far=0, run=0, last=null;
      for(var i=0;i<pts.length;i++){ var p=pts[i]; if(last&&hav(last[0],last[1],p[0],p[1])<1500) continue; last=p; var near=T.some(function(t){ return hav(p[0],p[1],t[0],t[1])<10000 }); if(!near){ run++; if(run>=2) far++ } else run=0 }
      return far?'Goes 10+ km from towns, where phones often lose signal':null }).catch(function(){ return r.dist>=40000?'Long route outside town':null }) }
  var saving=null, offered='';
  function offer(r){ var k=r.pts.length+':'+Math.round(r.dist); if(offered===k||!window.__off||window.__off.busy()) return; offered=k;
    lowService(r).then(function(why){ if(!why||window.__nav.route()!==r) return; var c=window.__off.corridor(r.pts), mb=Math.max(1,Math.round(c.bytes/1e6));
      if(navigator.onLine===false) return;
      var d=toast('<b>📶 Low service ahead</b>'+esc(why)+'. Save the map along this route so it works with no signal? About '+mb+' MB.<div class="awb"><button type="button" class="pri" data-a="y">Save map</button><button type="button" data-a="n">Not now</button></div>',30000);
      d.onclick=function(e){ var b=e.target.closest('button'); if(!b) return; d.remove(); if(b.getAttribute('data-a')!=='y') return;
        saving={pct:0}; window.__nav.panel();
        window.__off.saveRoute(r.pts,function(x){ if(x.error){ saving=null; toast('<b>Could not save the route map</b>Try again with better signal.',5000); window.__nav.panel(); return }
          if(x.done){ saving=null; window.__nav.panel(); toast('<b>Route map saved ✓</b>'+Math.max(1,Math.round(x.bytes/1e6))+' MB · works with no signal along this route.',5000); speak('Route map saved'); return }
          var np=Math.floor(x.pct/5)*5; if(saving&&np!==saving.pct){ saving.pct=np; window.__nav.panel() } }) } }) }

  // ============ directions panel and navigation hooks ============
  window.__navHook=function(ev,r,p){
    if(ev==='route'){ r.elev=null; profile(r).then(function(e){ if(window.__nav.route()===r){ r.elev=e; window.__nav.panel() } }); if(window.__nav.isNav&&window.__nav.isNav()) speak('Route updated') }
    else if(ev==='start'){ ann={}; annKey=''; var s=r.steps&&r.steps[0]; speak('Starting route to '+((r.steps[r.steps.length-1]||{}).tx||'').replace(/^Arrive at /,'')+'. '+(s?s.tx:'')); offer(r) }
    else if(ev==='arrive'){ speak(((r.steps[r.steps.length-1]||{}).tx||'Arrived').replace(/^Arrive at/,'You have arrived at')) }
    else if(ev==='end'){ hush() }
    else if(ev==='track'){ if(p){ if(lastP){ var dt=(Date.now()-lastP.t)/1000; if(dt>0.5&&dt<20) lastSpd=lastSpd*0.6+hav(lastP.la,lastP.lo,p.lat,p.lon)/dt*0.4 } lastP={la:p.lat,lo:p.lon,t:Date.now()}; altNow(p.lat,p.lon) }
      var k=r.next, s=r.steps[k]; if(!s) return; var key=r.pts.length+':'+Math.round(r.dist); if(key!==annKey){ annKey=key; ann={} } var a=ann[k]||(ann[k]={}), d=r.cum[s.i]-r.prog, far=lastSpd>16?1000:lastSpd>9?500:250;
      if(s.ic==='🏁'){ if(d<300&&!a.n){ a.n=1; speak('Your destination is ahead in '+spokenD(d)) } }
      else if(d<=(lastSpd>16?160:90)&&!a.n){ a.n=a.f=1; speak('Now, '+s.tx.charAt(0).toLowerCase()+s.tx.slice(1)) }
      else if(d<=far&&d>(lastSpd>16?300:150)&&!a.f){ a.f=1; speak('In '+spokenD(d)+', '+s.tx.charAt(0).toLowerCase()+s.tx.slice(1)) }
      var e=r.elev; if(e&&e.steep) e.steep.forEach(function(st,i){ var ahead=st.d0-r.prog; if(ahead>0&&ahead<450&&!ann['st'+i]){ ann['st'+i]=1; speak('Steep '+(st.g<0?'downhill':'uphill')+' ahead, '+Math.round(Math.abs(st.g))+' percent for '+spokenD(st.d1-st.d0)) } }) } };
  window.__navPanel=function(P,o){ var r=o.rt; if(!r||o.busy) return; var nb=P.querySelector('.nb');
    if(nb&&!r.arrived&&!nb.querySelector('[data-x=voice]')){ var vb=document.createElement('button'); vb.type='button'; vb.setAttribute('data-x','voice'); vb.setAttribute('aria-pressed',voiceOn?'true':'false'); vb.setAttribute('aria-label',voiceOn?'Voice on (tap to mute)':'Voice off (tap to turn on)'); vb.textContent=voiceOn?'🔊':'🔇'; nb.insertBefore(vb,nb.querySelector('[data-a=x],[data-a=end]')) }
    var e=r.elev, nh=P.querySelector('.nh');
    if(!o.nav&&!r.arrived&&e&&nh){ var div=document.createElement('div'); div.className='nelv';
      div.innerHTML=spark(e.d,e.e,96,30,'#ff8a80')+'<span>↑ <b>'+Math.round(e.up).toLocaleString()+' m</b> ↓ <b>'+Math.round(e.dn).toLocaleString()+' m</b> · high '+Math.round(e.mx).toLocaleString()+' m'+(e.top>=6?' · steepest '+Math.round(e.top)+'%':'')+'</span>';
      var after=P.querySelector('.nw')||nh; after.parentNode.insertBefore(div,after.nextSibling);
      if(e.steep.length){ var nw=P.querySelector('.nw'); var s0=e.steep.slice().sort(function(a,b){ return Math.abs(b.g)-Math.abs(a.g) })[0], line='⛰ Steep '+(s0.g<0?'downhill':'uphill')+' '+Math.round(Math.abs(s0.g))+'% for '+dTxt(s0.d1-s0.d0)+' at km '+(s0.d0/1000).toFixed(1)+(e.steep.length>1?' (+'+(e.steep.length-1)+' more)':'');
        var w=document.createElement('div'); w.textContent=line; if(nw) nw.appendChild(w); else { var x=document.createElement('div'); x.className='nw'; x.appendChild(w); nh.parentNode.insertBefore(x,div) } } }
    if(o.nav&&!r.arrived){ var ex=[];
      if(e&&e.steep) e.steep.some(function(st){ var ah=st.d0-r.prog; if(ah>-(st.d1-st.d0)&&ah<1500){ ex.push(ah>0?'⛰ Steep '+(st.g<0?'downhill':'uphill')+' '+Math.round(Math.abs(st.g))+'% in '+dTxt(ah):'⛰ On a steep '+(st.g<0?'downhill':'uphill')+' · '+Math.round(Math.abs(st.g))+'%'); return true } return false });
      if(altTxt) ex.push('Elevation '+altTxt.replace(' (terrain data)',''));
      if(ex.length&&nh){ var sv=document.createElement('div'); sv.className='nsv'; sv.textContent=ex.join(' · '); nh.parentNode.insertBefore(sv,nh.nextSibling) } }
    if(saving&&nh){ var sp=document.createElement('div'); sp.className='nsv'; sp.textContent='💾 Saving route map '+saving.pct+'%'; nh.parentNode.insertBefore(sp,nh.nextSibling) } };
  document.getElementById('navp').addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('button[data-x=voice]'); if(!b) return; e.stopPropagation(); voiceOn=!voiceOn; ls('aw-voice',voiceOn?'1':'0'); if(!voiceOn) hush(); else speak('Voice directions on'); window.__nav.panel() },true);

  // ============ 6. Smoke forecast (with the Fires layer) ============
  var smoke=L.tileLayer.wms('https://geo.weather.gc.ca/geomet',{layers:'RAQDPS-FW.SFC_PM2.5-DIFF',format:'image/png',transparent:true,version:'1.3.0',tileSize:512,zoomOffset:-1,maxNativeZoom:9,maxZoom:19,opacity:.55,zIndex:8,updateWhenIdle:true,className:'smokel',attribution:'Smoke forecast © ECCC FireWork'}), smokeOn=ls('aw-smoke')!=='0';
  function fireOn(){ var b=document.getElementById('firebtn'); return !!b&&b.classList.contains('on') }
  function smokeUpd(){ var want=smokeOn&&fireOn(); if(want&&!map.hasLayer(smoke)) smoke.addTo(map); if(!want&&map.hasLayer(smoke)) map.removeLayer(smoke) }
  (function(){ var fp=document.getElementById('s_firePer'), row=fp&&fp.closest('label'); if(!row||document.getElementById('aw_smoke')) return; var l=document.createElement('label'); l.className='setrow'; l.htmlFor='aw_smoke';
    l.innerHTML='Smoke forecast<select id="aw_smoke"><option value="1">Show</option><option value="0">Hide</option></select>'; row.parentNode.insertBefore(l,row.nextSibling); var s=l.querySelector('select'); s.value=smokeOn?'1':'0'; s.onchange=function(){ smokeOn=s.value==='1'; ls('aw-smoke',s.value); smokeUpd() } })();
  var fb=document.getElementById('firebtn'); if(fb&&window.MutationObserver) new MutationObserver(smokeUpd).observe(fb,{attributes:true,attributeFilter:['class']}); smokeUpd();

  // ============ 7. River and creek gauges (with the Creeks layer) ============
  var HY='https://api.weather.gc.ca/collections/hydrometric-realtime/items?f=json', gLay=L.layerGroup(), gKey='', gT=null, flood=null, floodT=0;
  function creeksOn(){ var s=document.getElementById('s_water'); return !s||s.value!=='0' }
  function iso(ms){ return new Date(ms).toISOString().replace(/\.\d+Z$/,'Z') }
  function floods(){ if(flood&&Date.now()-floodT<900000) return Promise.resolve(flood); return fetch(RELAY+'?flood=bc').then(function(r){ return r.ok?r.json():null }).then(function(j){ flood=j&&j.items||[]; floodT=Date.now(); window.__floods=flood; return flood }).catch(function(){ return flood||[] }) }
  window.__floodsGet=floods;
  function gauges(){ clearTimeout(gT); gT=null; var on=creeksOn()&&map.getZoom()>=9; if(!on){ if(map.hasLayer(gLay)) map.removeLayer(gLay); gKey=''; return } if(!map.hasLayer(gLay)) gLay.addTo(map);
    var b=map.getBounds().pad(0.1), k=[b.getWest(),b.getSouth(),b.getEast(),b.getNorth()].map(function(v){ return (Math.round(v*10)/10).toFixed(1) }).join(','); if(k===gKey) return; gKey=k;
    fetch(HY+'&bbox='+k+'&datetime='+iso(Date.now()-45*60000)+'/..&sortby=-DATETIME&limit=1500').then(function(r){ return r.ok?r.json():null }).then(function(j){ if(!j||gKey!==k) return; var by={};
      (j.features||[]).forEach(function(f){ var p=f.properties||{}, id=p.STATION_NUMBER, g=f.geometry&&f.geometry.coordinates; if(!id||!g||by[id]) return; by[id]={id:id,n:p.STATION_NAME,lv:p.LEVEL,q:p.DISCHARGE,t:p.DATETIME,lat:g[1],lon:g[0]} });
      gLay.clearLayers(); Object.keys(by).slice(0,150).forEach(function(id){ var s=by[id];
        L.marker([s.lat,s.lon],{icon:L.divIcon({className:'',html:'<span class="gaugemk" role="button" aria-label="River gauge '+esc(s.n||id)+'">≈</span>',iconSize:[0,0]}),keyboard:false,zIndexOffset:-300,title:s.n}).on('click',function(){ openGauge(s,this) }).addTo(gLay) }) }).catch(function(){}) }
  function cap(t){ return String(t||'').toLowerCase().replace(/\b[a-z]/g,function(c){ return c.toUpperCase() }) }
  function openGauge(s,mk){ if(A.show) try{ A.show(false) }catch(e){} var pop=L.popup({maxWidth:270,closeButton:true}).setLatLng([s.lat,s.lon]).setContent('<div class="gpop"><b>'+esc(cap(s.n))+'</b><br><small>Loading the last 24 hours…</small></div>').openOn(map);
    Promise.all([fetch(HY+'&STATION_NUMBER='+encodeURIComponent(s.id)+'&datetime='+iso(Date.now()-24*3600000)+'/..&sortby=DATETIME&limit=400').then(function(r){ return r.ok?r.json():null }).catch(function(){ return null }),floods()]).then(function(R){
      var f=(R[0]&&R[0].features||[]).map(function(x){ return x.properties||{} }), useQ=f.some(function(p){ return p.DISCHARGE!=null }), key=useQ?'DISCHARGE':'LEVEL', v=f.filter(function(p){ return p[key]!=null });
      var h='<div class="gpop"><b>'+esc(cap(s.n))+'</b><br><small>Station '+esc(s.id)+' · Environment Canada</small><br>';
      if(v.length>1){ var xs=v.map(function(p){ return Date.parse(p.DATETIME) }), ys=v.map(function(p){ return +p[key] }), now=ys[ys.length-1], ch=now-ys[0], pct=ys[0]?ch/Math.abs(ys[0])*100:0, trend=Math.abs(pct)<3?'steady':ch>0?'rising':'falling';
        h+=spark(xs,ys,240,44,trend==='rising'?'#e65100':'#0288d1')+'<b>'+(useQ?now.toFixed(now<10?2:1)+' m³/s flow':now.toFixed(2)+' m level')+'</b> · <span style="color:'+(trend==='rising'?'#e65100':trend==='falling'?'#2e7d32':'inherit')+'">'+trend+(trend!=='steady'?' '+Math.abs(Math.round(pct))+'% in 24 h':'')+'</span>'+
          (useQ&&s.lv!=null?'<br><small>Level '+(+s.lv).toFixed(2)+' m</small>':'')+'<br><small>Updated '+new Date(xs[xs.length-1]).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+'</small>';
        var el=mk&&mk.getElement&&mk.getElement(), sp=el&&el.querySelector('.gaugemk'); if(sp){ sp.classList.toggle('up',trend==='rising'); sp.classList.toggle('dn',trend==='falling') } }
      else h+='<small>No readings in the last 24 hours.</small>';
      var fl=(R[1]||[]).filter(function(x){ return x.level>=2 }); if(fl.length) h+='<div style="margin-top:6px;color:#c62828"><b>BC flood warnings in effect</b><br><small>'+fl.slice(0,4).map(function(x){ return esc(x.title) }).join('<br>')+'</small></div>';
      h+='<br><a href="https://wateroffice.ec.gc.ca/report/real_time_e.html?stn='+encodeURIComponent(s.id)+'" target="_blank" rel="noopener">Full station page ›</a> · <a href="https://bcrfc.env.gov.bc.ca/warnings/index.htm" target="_blank" rel="noopener">Flood warnings ›</a></div>';
      pop.setContent(h) }) }
  map.on('moveend zoomend',function(){ clearTimeout(gT); gT=setTimeout(gauges,600) }); var sw=document.getElementById('s_water'); if(sw) sw.addEventListener('change',function(){ setTimeout(gauges,100) }); setTimeout(gauges,1500);

  // ============ 8. Offline place search ============
  var NM=null; function loadNames(){ if(NM) return NM; var urls=window.__off&&window.__off.names?window.__off.names():[];
    NM=Promise.all(urls.map(function(u){ return (window.caches?caches.match(u):Promise.resolve(null)).then(function(r){ return r?r.json():null }).catch(function(){ return null }) })).then(function(L2){ var out=[], seen={};
      L2.forEach(function(j){ (j&&j.features||[]).forEach(function(f){ var p=f.properties||{}, n=p.GEOGRAPHICAL_NAME, la=+p.LATITUDE, lo=+p.LONGITUDE; if(!n||!isFinite(la)) return; var k=n+la.toFixed(3); if(seen[k]) return; seen[k]=1; out.push({n:n,t:String(p.FEATURE_TYPE||'Place').replace(/\s*\(\d+\)$/,''),c:p.FEATURE_CATEGORY||'',lat:la,lon:lo}) }) });
      if(!out.length) NM=null; return out }); return NM }
  window.__offNames=function(q){ q=String(q||'').toLowerCase(); return loadNames().then(function(all){ var m=A.me&&A.me()||{lat:0,lon:0};
    return all.filter(function(x){ return x.n.toLowerCase().indexOf(q)>=0 }).sort(function(a,b){ var sa=a.n.toLowerCase().indexOf(q)===0?0:1, sb=b.n.toLowerCase().indexOf(q)===0?0:1; return sa-sb||hav(m.lat,m.lon,a.lat,a.lon)-hav(m.lat,m.lon,b.lat,b.lon) }).slice(0,20).map(function(x){
      var w=/water|lake|river|creek/i.test(x.c+x.t), mt=/Mountain|Peak|Ridge|Range/i.test(x.t), town=/Populat|Municipal|City|Town|Village|Community/i.test(x.c+x.t);
      return {n:x.n,t:x.t+' · saved offline',lat:x.lat,lon:x.lon,ic:w?'💧':mt?'⛰':town?'🏘':'📍',bg:w?'#e0f7fa':mt?'#eceff1':town?'#e8f0fe':'#f1f3f4',z:town?12:13} }) }) };
  addEventListener('online',function(){ NM=null });
})();
