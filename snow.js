// AwareBC falling snow (by Josh Singer): soft 3D snowflakes drifting over the map pictures, under trails, FSR lines and pins.
// Auto: only while it's actually snowing where you are (live weather), and heavier snow means more flakes.
// Older phone mode: 1,500 flakes at 30 frames a second. Normal: 8,000 flakes. No downloads, works offline once the weather is known.
(function(){
  var A=window.__AW; if(!A||!A.map) return; var map=A.map;
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v) }catch(e){ return null } }
  var LOW=!!window.__awLow, MAX=LOW?1500:8000, FPS=LOW?30:60, RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  var mode=ls('aw-snow')||'auto', wx={snow:false,rate:0,wind:0,dir:0,at:0,ll:null};
  // last known weather is kept on the phone: with no signal the snow keeps falling as it was (up to 12 hours), then clears
  try{ var sv=JSON.parse(ls('aw-snowwx')||'null'); if(sv&&Date.now()-sv.t<12*3600000){ wx.snow=!!sv.snow; wx.rate=+sv.rate||0; wx.wind=+sv.wind||0; wx.dir=+sv.dir||0; wx.ll=sv.ll||null } }catch(e){}
  function keep(){ ls('aw-snowwx',JSON.stringify({t:Date.now(),snow:wx.snow,rate:wx.rate,wind:wx.wind,dir:wx.dir,ll:wx.ll})) }

  // ---- screen-fixed canvas in its own map pane: above the map pictures and labels (MapLibre), below lines and pins ----
  var pane=map.createPane('awsnow',map._rotatePane||map.getPane('mapPane')); pane.style.zIndex=380; pane.style.pointerEvents='none';
  var cv=document.createElement('canvas'); cv.setAttribute('aria-hidden','true'); cv.style.cssText='position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none;display:none'; pane.appendChild(cv);
  var cx=cv.getContext('2d'), W=0, H=0, DPR=LOW?1:Math.min(window.devicePixelRatio||1,1.5);
  function size(){ var s=map.getSize(); W=s.x; H=s.y; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); cv.style.width=W+'px'; cv.style.height=H+'px'; cx.setTransform(DPR,0,0,DPR,0,0) }
  function place(){ var p=map.containerPointToLayerPoint([0,0]), b=map.getBearing?map.getBearing():0; cv.style.transform='translate3d('+p.x+'px,'+p.y+'px,0) rotate('+(-b)+'deg)' }

  // ---- soft round flakes, drawn once at a few sizes ----
  var SP=[2,3,5,7,10].map(function(r){ var c=document.createElement('canvas'), d=r*2+2; c.width=c.height=d; var g=c.getContext('2d'), gr=g.createRadialGradient(d/2,d/2,0,d/2,d/2,r);
    gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.62,'rgba(255,255,255,.95)'); gr.addColorStop(.82,'rgba(255,255,255,.45)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.beginPath(); g.arc(d/2,d/2,r,0,7); g.fill(); return {c:c,r:r+1} });

  // ---- particles: depth z (0 far … 1 near) sets size, speed, brightness and how much they shift when the map moves ----
  var P=[], N=0;
  function mk(p,top){ var z=Math.pow(Math.random(),1.8)*.75+.25; p.z=z; p.x=Math.random()*(W+80)-40; p.y=top?-12-Math.random()*40:Math.random()*H;
    p.v=(18+70*z)*(.8+Math.random()*.4); p.s=Math.random()*6.28; p.sw=(.4+Math.random()*1.4)*(4+10*z); p.f=.5+Math.random()*1.2;
    var sz=1.2+z*3.4; p.i=sz<1.6?0:sz<2.6?1:sz<3.6?2:sz<4.6?3:4; p.k=sz/SP[p.i].r; p.a=.3+.5*z; return p }
  function fill(){ var want=Math.round(MAX*amount()); while(P.length<want) P.push(mk({},false)); N=want }
  function amount(){ var a=mode==='on'&&!wx.snow?.2:Math.min(.3,.08+wx.rate*.24); return Math.max(.1,a) } // rate in cm/h

  // ---- map movement: near flakes shift more than far ones (depth) ----
  var last=null;
  function moved(){ var c=map.latLngToContainerPoint(map.getCenter()), w=map.project(map.getCenter()); if(last){ var dx=last.x-w.x, dy=last.y-w.y; if(Math.abs(dx)<400&&Math.abs(dy)<400) for(var i=0;i<N;i++){ var p=P[i]; p.x+=dx*p.z*.55; p.y+=dy*p.z*.55 } } last=w; place() }

  // ---- animation ----
  var run=false, raf=0, t0=0, acc=0;
  function frame(t){ if(!run) return; raf=requestAnimationFrame(frame); var dt=t0?(t-t0)/1000:0; t0=t; acc+=dt; if(acc<1/FPS-.002) return; dt=Math.min(acc,.1); acc=0;
    if(document.hidden) return; cx.clearRect(0,0,W,H); var wind=(wx.wind||0)*Math.sin((wx.dir+180)*Math.PI/180)*1.6, tt=t/1000;
    for(var i=0;i<N;i++){ var p=P[i]; p.y+=p.v*dt; p.x+=(wind*p.z+Math.sin(tt*p.f+p.s)*p.sw*.5)*dt;
      if(p.y>H+12||p.x<-50||p.x>W+50) mk(p,true);
      var S=SP[p.i], d=S.c.width*p.k; cx.globalAlpha=p.a; cx.drawImage(S.c,p.x-d/2,p.y-d/2,d,d) }
    cx.globalAlpha=1 }
  function start(){ if(run) return; size(); place(); fill(); cv.style.display=''; run=true; t0=0; raf=requestAnimationFrame(frame) }
  function stop(){ run=false; cancelAnimationFrame(raf); cv.style.display='none'; P.length=0; N=0 }
  function want(){ return mode==='on'||(mode==='auto'&&wx.snow&&!RM) }
  function apply(){ if(want()){ if(run) fill(); else start() } else if(run) stop(); paint() }

  // ---- live weather where you are (Open-Meteo, free): snowing now, how hard, and the wind ----
  function me(){ var m=A.me&&A.me(); return m&&isFinite(m.lat)?m:null }
  function far(a,b){ return !a||!b||Math.abs(a[0]-b[0])>.2||Math.abs(a[1]-b[1])>.3 }
  function check(force){ if(mode!=='auto'&&!force) return; var m=me(); if(!m||navigator.onLine===false) return; var ll=[m.lat,m.lon];
    if(!force&&Date.now()-wx.at<15*60000&&!far(ll,wx.ll)) return; wx.at=Date.now(); wx.ll=ll;
    fetch('https://api.open-meteo.com/v1/forecast?latitude='+m.lat.toFixed(2)+'&longitude='+m.lon.toFixed(2)+'&current=weather_code,snowfall,wind_speed_10m,wind_direction_10m').then(function(r){ return r.json() }).then(function(j){
      var c=j&&j.current||{}, code=+c.weather_code||0, sf=+c.snowfall||0; wx.snow=(code>=71&&code<=77)||code===85||code===86||sf>0; wx.rate=sf; wx.wind=+c.wind_speed_10m||0; wx.dir=+c.wind_direction_10m||0; keep(); apply() }).catch(function(){}) }
  setTimeout(function(){ check(true) },5000); setInterval(check,60000); document.addEventListener('visibilitychange',function(){ if(!document.hidden) check() });

  map.on('move zoom rotate viewreset',moved); map.on('resize',function(){ if(run){ size(); place() } });

  // ---- Settings ▸ Weather, fire & lightning ▸ Falling snow ----
  var sel=null;
  function paint(){ if(!sel) return; sel.value=mode; var h=sel.closest('label')&&sel.closest('label').nextSibling; if(h&&h.classList&&h.classList.contains('fhelp')) h.textContent=mode==='auto'?(wx.snow?'❄️ It’s snowing where you are now.':'Shows only while it’s snowing where you are.'):mode==='on'?'Always on, heavier when it’s really snowing.':'Off.' }
  function mount(){ var F=document.getElementById('wffolder'); if(!F||sel) return; var l=document.createElement('label'); l.className='setrow'; l.setAttribute('for','s_snow');
    l.innerHTML='Falling snow<select id="s_snow" aria-label="Falling snow on the map"><option value="auto">Auto (when snowing)</option><option value="on">On</option><option value="off">Off</option></select>';
    var h=document.createElement('div'); h.className='fhelp'; F.appendChild(l); F.appendChild(h); sel=l.querySelector('select'); sel.onchange=function(){ set(sel.value) }; paint() }
  function set(v){ mode=v==='on'||v==='off'?v:'auto'; ls('aw-snow',mode); if(mode==='auto') check(true); apply() }
  // call from app.js or anywhere: toggleSnowParticles(true) / toggleSnowParticles(false); no argument = back to Auto
  window.toggleSnowParticles=function(enabled){ set(enabled===true?'on':enabled===false?'off':'auto') };
  window.__snow={set:set, state:function(){ return {mode:mode,running:run,flakes:N,max:MAX,snowing:wx.snow,rate:wx.rate} }, _wx:function(o){ for(var k in o) wx[k]=o[k]; apply() }};
  if(document.readyState==='complete') setTimeout(mount,700); else addEventListener('load',function(){ setTimeout(mount,700) });
  apply();
})();
