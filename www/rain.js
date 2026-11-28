// AwareBC falling rain (by Josh Singer): fine rain streaks at different depths over the map pictures, under trails, FSR lines and pins,
// with small splashes. Auto: only while it's actually raining where you are (live weather). Realistic amount: a few drops in drizzle up to
// 1,000 in heavy rain (older phones up to 700, at 30 frames a second). No downloads, keeps raining offline on the last known weather (12 h).
(function(){
  var A=window.__AW; if(!A||!A.map) return; var map=A.map;
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v) }catch(e){ return null } }
  var LOW=!!window.__awLow, MAX=LOW?700:1000, FPS=LOW?30:60, RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  var mode=ls('aw-rainfx')||'auto', wx={rain:false,rate:0,code:0,wind:0,dir:0,at:0,ll:null};
  try{ var sv=JSON.parse(ls('aw-rainwx')||'null'); if(sv&&Date.now()-sv.t<12*3600000){ wx.rain=!!sv.rain; wx.rate=+sv.rate||0; wx.code=+sv.code||0; wx.wind=+sv.wind||0; wx.dir=+sv.dir||0; wx.ll=sv.ll||null } }catch(e){}
  function keep(){ ls('aw-rainwx',JSON.stringify({t:Date.now(),rain:wx.rain,rate:wx.rate,code:wx.code,wind:wx.wind,dir:wx.dir,ll:wx.ll})) }

  // ---- screen-fixed canvas in its own map pane (same place as the snow) ----
  var pane=map.createPane('awrain',map._rotatePane||map.getPane('mapPane')); pane.style.zIndex=381; pane.style.pointerEvents='none';
  var cv=document.createElement('canvas'); cv.setAttribute('aria-hidden','true'); cv.style.cssText='position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none;display:none'; pane.appendChild(cv);
  var cx=cv.getContext('2d'), W=0, H=0, DPR=LOW?1:Math.min(window.devicePixelRatio||1,1.5);
  function size(){ var s=map.getSize(); W=s.x; H=s.y; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); cv.style.width=W+'px'; cv.style.height=H+'px'; cx.setTransform(DPR,0,0,DPR,0,0) }
  function place(){ var p=map.containerPointToLayerPoint([0,0]), b=map.getBearing?map.getBearing():0; cv.style.transform='translate3d('+p.x+'px,'+p.y+'px,0) rotate('+(-b)+'deg)' }

  // ---- drops: depth z sets speed, streak length, thickness and brightness; each lands somewhere on screen with a small splash ----
  var RAW=0, P=[], N=0, SPL=[];
  function mk(p,top){ var z=Math.pow(Math.random(),1.6)*.75+.25; p.z=z; p.x=Math.random()*(W+120)-60; p.y=top?-30-Math.random()*60:Math.random()*H;
    p.v=(620+780*z)*(.85+Math.random()*.3); p.l=p.v*(.018+.012*z); p.ly=H*(.25+Math.random()*.8); p.b=z<.5?0:z<.78?1:2; return p }
  function fill(nb){ var want=Math.floor(MAX*amount()); while(P.length<want) P.push(mk({},false)); N=want; if(LOW&&!nb&&window.__snow&&__snow._refit) __snow._refit() }
  function amount(){ // realistic: a few drops in drizzle, the full 1,000 only in heavy rain (rate in mm/h)
    var c=wx.code||0, r=wx.rate||0,
      byCode={51:60,53:120,55:200,56:100,57:180,61:150,63:450,65:1000,66:300,67:800,80:180,81:500,82:1000,95:700,96:1000,99:1000}[c]||0,
      byRate=r<=0?0:r<.5?60+r/.5*90:r<2.5?150+(r-.5)/2*300:r<7.6?450+(r-2.5)/5.1*550:1000;
    var n=Math.max(byCode,byRate); if(!wx.rain) n=mode==='on'?200:0; if(wx.rain&&n<40) n=40;
    n=Math.min(1000,n)*(LOW?.7:1); RAW=n; if(LOW){ var o=window.__snow&&__snow.state().running?__snow.state().raw:0; if(n+o>700) n=n*700/(n+o) } /* older phones: snow and rain share one budget of 700, split fairly */
    return n/MAX }

  var last=null;
  function moved(){ var w=map.project(map.getCenter()); if(last){ var dx=last.x-w.x, dy=last.y-w.y; if(Math.abs(dx)<400&&Math.abs(dy)<400) for(var i=0;i<N;i++){ var p=P[i]; p.x+=dx*p.z*.55; p.y+=dy*p.z*.55 } } last=w; place() }

  // ---- animation: streaks drawn in 3 depth groups (one stroke each, fast), splashes as quick fading rings ----
  var BK=[{w:.8,a:.22},{w:1.1,a:.34},{w:1.5,a:.48}];
  var run=false, raf=0, t0=0, acc=0;
  var rest=false, restT=null; if(LOW){ map.on('movestart zoomstart',function(){ rest=true; clearTimeout(restT) }); map.on('moveend zoomend',function(){ clearTimeout(restT); restT=setTimeout(function(){ rest=false; t0=0 },180) }) }
  function frame(t){ if(!run) return; raf=requestAnimationFrame(frame); var dt=t0?(t-t0)/1000:0; t0=t; acc+=dt; if(rest){ acc=0; return } if(acc<1/FPS-.002) return; dt=Math.min(acc,.1); acc=0;
    if(document.hidden) return; cx.clearRect(0,0,W,H);
    var wind=(wx.wind||0)*Math.sin((wx.dir+180)*Math.PI/180)*9, sl=Math.max(-.45,Math.min(.45,wind/900));
    for(var i=0;i<N;i++){ var p=P[i]; p.y+=p.v*dt; p.x+=p.v*sl*dt;
      if(p.y>=p.ly){ if(p.z>.45&&SPL.length<90) SPL.push({x:p.x,y:p.ly,t:0,r:1.5+p.z*3.5}); mk(p,true) } else if(p.x<-80||p.x>W+80) mk(p,true) }
    cx.lineCap='round'; cx.strokeStyle='rgb(206,222,240)';
    for(var b=0;b<3;b++){ cx.beginPath();
      for(i=0;i<N;i++){ p=P[i]; if(p.b!==b) continue; cx.moveTo(p.x,p.y); cx.lineTo(p.x-p.l*sl,p.y-p.l) }
      cx.globalAlpha=BK[b].a; cx.lineWidth=BK[b].w; cx.stroke() }
    cx.lineWidth=.9;
    for(i=SPL.length-1;i>=0;i--){ var s=SPL[i]; s.t+=dt; var k=s.t/.22; if(k>=1){ SPL.splice(i,1); continue }
      cx.globalAlpha=.42*(1-k); cx.beginPath(); cx.ellipse(s.x,s.y,s.r*(.4+k*1.2),s.r*(.2+k*.55),0,0,6.283); cx.stroke() }
    cx.globalAlpha=1 }
  function start(){ if(run) return; run=true; size(); place(); fill(); cv.style.display=""; t0=0; raf=requestAnimationFrame(frame) }
  function stop(){ run=false; RAW=0; setTimeout(function(){ if(LOW&&window.__snow&&__snow._refit) __snow._refit() },0); cancelAnimationFrame(raf); cv.style.display='none'; P.length=0; N=0; SPL.length=0 }
  function want(){ return mode==='on'||(mode==='auto'&&wx.rain&&!RM) }
  function apply(){ if(want()){ if(run) fill(); else start() } else if(run) stop(); paint() }

  // ---- live weather where you are (Open-Meteo, free): raining now, how hard, and the wind ----
  function me(){ var m=A.me&&A.me(); return m&&isFinite(m.lat)?m:null }
  function far(a,b){ return !a||!b||Math.abs(a[0]-b[0])>.2||Math.abs(a[1]-b[1])>.3 }
  var RAINC=[51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99];
  function check(force){ if(mode!=='auto'&&!force) return; var m=me(); if(!m||navigator.onLine===false) return; var ll=[m.lat,m.lon];
    if(!force&&Date.now()-wx.at<15*60000&&!far(ll,wx.ll)) return; wx.at=Date.now(); wx.ll=ll;
    fetch('https://api.open-meteo.com/v1/forecast?latitude='+m.lat.toFixed(2)+'&longitude='+m.lon.toFixed(2)+'&current=weather_code,rain,showers,wind_speed_10m,wind_direction_10m').then(function(r){ return r.json() }).then(function(j){
      var c=j&&j.current||{}, code=+c.weather_code||0, mm=(+c.rain||0)+(+c.showers||0); wx.rain=RAINC.indexOf(code)>=0||mm>0; wx.rate=mm; wx.code=code; wx.wind=+c.wind_speed_10m||0; wx.dir=+c.wind_direction_10m||0; keep(); apply() }).catch(function(){}) }
  setTimeout(function(){ check(true) },5200); setInterval(check,60000); document.addEventListener('visibilitychange',function(){ if(!document.hidden) check() });
  map.on('move zoom rotate viewreset',moved); map.on('resize',function(){ if(run){ size(); place() } });

  // ---- Settings ▸ Weather, fire & lightning ▸ Falling rain ----
  var sel=null;
  function paint(){ if(!sel) return; sel.value=mode; var h=sel.closest('label')&&sel.closest('label').nextSibling; if(h&&h.classList&&h.classList.contains('fhelp')) h.textContent=mode==='auto'?(wx.rain?'🌧️ It’s raining where you are now.':'Shows only while it’s raining where you are.'):mode==='on'?'Always on, heavier when it’s really raining.':'Off.' }
  function mount(){ var F=document.getElementById('wffolder'); if(!F||sel) return; var l=document.createElement('label'); l.className='setrow'; l.setAttribute('for','s_rainfx');
    l.innerHTML='Falling rain<select id="s_rainfx" aria-label="Falling rain on the map"><option value="auto">Auto (when raining)</option><option value="on">On</option><option value="off">Off</option></select>';
    var h=document.createElement('div'); h.className='fhelp'; F.appendChild(l); F.appendChild(h); sel=l.querySelector('select'); sel.onchange=function(){ set(sel.value) }; paint() }
  function set(v){ mode=v==='on'||v==='off'?v:'auto'; ls('aw-rainfx',mode); if(mode==='auto') check(true); apply() }
  window.toggleRainParticles=function(enabled){ set(enabled===true?'on':enabled===false?'off':'auto') };
  window.__rainfx={set:set, _refit:function(){ if(run) fill(true) }, state:function(){ return {mode:mode,running:run,raw:RAW,drops:N,max:MAX,raining:wx.rain,rate:wx.rate} }, _wx:function(o){ for(var k in o) wx[k]=o[k]; apply() }};
  if(document.readyState==='complete') setTimeout(mount,750); else addEventListener('load',function(){ setTimeout(mount,750) });
  apply();
})();
