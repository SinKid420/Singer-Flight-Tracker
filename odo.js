/* AwareBC odometer (by Josh Singer): counts kilometres whenever the app is open and you're moving, On-road and Off-road.
   Only good GPS spots count (no jumps, no standing still). A small dash strip shows speed, trip km and total km while you move,
   and hides when you stop. Tap it for today's km and to reset the trip. Everything stays on this phone. */
(function(){
  var K='aw-odo', O={tot:0,trip:0,day:'',dkm:0,t0:Date.now()};
  try{ var o=JSON.parse(localStorage.getItem(K)||'null'); if(o&&isFinite(o.tot)) O=o }catch(e){}
  function today(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate() }
  var sT=null; function save(){ clearTimeout(sT); sT=setTimeout(function(){ try{ localStorage.setItem(K,JSON.stringify(O)) }catch(e){} },4000) }
  function hav(a,b,c,d){ var r=Math.PI/180, x=Math.sin((c-a)*r/2), y=Math.sin((d-b)*r/2), h=x*x+Math.cos(a*r)*Math.cos(c*r)*y*y; return 12742*Math.asin(Math.sqrt(h)) }
  var last=null, spd=0, movT=0;
  addEventListener('aw-fix',function(e){ var f=e.detail||{}; if(!(f.acc<=40)) return; var now=Date.now();
    if(f.sp>=0) spd=f.sp*3.6;
    if(!last){ last=f; return }
    var d=hav(last.lat,last.lon,f.lat,f.lon), dt=Math.max(0.5,((f.t||now)-(last.t||now))/1000);
    if(d<0.015){ if(f.sp<0&&dt>20) spd=0; return } /* under 15 m: wait for more movement (GPS wobble) */
    var v=d/dt*3600; if(f.sp<0) spd=v;
    if(v>250){ last=f; return } /* a jump, not driving */
    if(O.day!==today()){ O.day=today(); O.dkm=0 }
    O.tot+=d; O.trip+=d; O.dkm+=d; last=f; save();
    if(spd>=5){ movT=now; show() } paint() });
  function fmt(v,dec){ return v<1000?v.toFixed(dec):Math.round(v).toLocaleString() }
  var css=document.createElement('style'); css.textContent=
    '#awodo{position:fixed;z-index:1003;left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 84px);display:flex;background:rgba(18,21,26,.94);border:1px solid #2a2f36;border-radius:18px;overflow:hidden;box-shadow:0 8px 22px rgba(0,0,0,.55);color:#fff;font-family:var(--font,system-ui);padding:0;cursor:pointer;transition:opacity .3s,transform .3s}'+
    '#awodo[hidden]{display:none}#awodo div{padding:5px 9px;text-align:center;border-right:1px solid #2a2f36}#awodo div:last-child{border-right:0}'+
    '#awodo b{display:block;font:900 18px/1.1 var(--font,system-ui);font-variant-numeric:tabular-nums}#awodo small{display:block;font:600 10.5px/1.2 var(--font,system-ui);color:#9aa4b2}#awodo .tot b{color:#ffd54f}'+
    'body.fsron #awodo{bottom:calc(env(safe-area-inset-bottom,0px) + 140px)}'+'body.navon #awodo{bottom:calc(env(safe-area-inset-bottom,0px) + 154px)!important}body.navon:not(.awshell) #awodo{bottom:calc(env(safe-area-inset-bottom,0px) + 96px)!important}'+ /* directions: stays on, above the arrival bar */ /* Off-road: sits above the Ask Aware button */
    'body:not(.awshell) #awodo{bottom:calc(env(safe-area-inset-bottom,0px) + 30px)}body.menuon #awodo,body.toolon #awodo,body.srchon #awodo,body.trcard #awodo,body.fsrp #awodo,body.awon #awodo,body.keyon #awodo{display:none}'+
    '#awodosh{position:fixed;inset:0;z-index:6500;background:rgba(0,0,0,.45);display:flex;align-items:flex-end}#awodosh .in{width:100%;background:#15181d;border-radius:22px 22px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));color:#fff;font-family:var(--font,system-ui)}'+
    '#awodosh .g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}#awodosh .g div{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:10px}#awodosh .g b{display:block;font:900 22px/1.1 var(--font,system-ui)}#awodosh .g small{font:600 11.5px var(--font,system-ui);color:#9aa4b2}'+
    '#awodosh button.r{margin-top:12px;width:100%;height:46px;border:0;border-radius:14px;background:rgba(255,255,255,.09);color:#fff;font:700 15px var(--font,system-ui)}#awodosh .x{float:right;width:36px;height:36px;border:0;border-radius:50%;background:rgba(255,255,255,.1);color:#fff;font-size:15px}';
  document.head.appendChild(css);
  var el=null;
  function show(){ if(!el){ el=document.createElement('button'); el.type='button'; el.id='awodo'; el.setAttribute('aria-label','Odometer: tap for today and trip reset');
      el.innerHTML='<div><b class="s">0</b><small>km/h</small></div><div><b class="t">0</b><small>trip km</small></div><div class="tot"><b class="o">0</b><small>total km</small></div>'; el.onclick=card; document.body.appendChild(el) }
    el.hidden=false; paint() }
  function paint(){ if(!el) return; el.querySelector('.s').textContent=Math.round(spd); el.querySelector('.t').textContent=fmt(O.trip,1); el.querySelector('.o').textContent=fmt(O.tot,O.tot<100?1:0) }
  /* stopped for a minute: the strip tucks away (the km are still counted when you move again) */
  setInterval(function(){ var nv=document.body.classList.contains('navon'); if(nv&&O.tot>0) show(); if(el&&!el.hidden&&!nv&&Date.now()-movT>60000){ spd=0; el.hidden=true } if(nv&&Date.now()-movT>20000){ spd=0; paint() } },5000);
  function card(){ var o=document.createElement('div'); o.id='awodosh'; o.setAttribute('role','dialog'); o.setAttribute('aria-label','Odometer');
    if(O.day!==today()){ O.day=today(); O.dkm=0 }
    o.innerHTML='<div class="in"><button type="button" class="x" aria-label="Close">✕</button><b style="font:800 18px var(--font,system-ui)">🛻 Odometer</b><div style="font:500 12.5px var(--font,system-ui);color:#9aa4b2;margin-top:2px">Counts whenever AwareBC is open and you’re moving.</div>'+
      '<div class="g"><div><b>'+fmt(O.dkm,1)+'</b><small>today km</small></div><div><b>'+fmt(O.trip,1)+'</b><small>trip km</small></div><div><b style="color:#ffd54f">'+fmt(O.tot,1)+'</b><small>total km</small></div></div>'+
      '<button type="button" class="r">Reset trip</button></div>';
    o.onclick=function(e){ if(e.target===o||e.target.closest('.x')) o.remove() };
    o.querySelector('.r').onclick=function(){ O.trip=0; O.t0=Date.now(); save(); paint(); this.textContent='Trip reset ✓'; var b=this; setTimeout(function(){ o.remove() },700) };
    document.body.appendChild(o) }
  window.__odo={get:function(){ return O },show:show,card:card};
  function now(){ try{ localStorage.setItem(K,JSON.stringify(O)) }catch(e){} } addEventListener('pagehide',now); document.addEventListener('visibilitychange',function(){ if(document.hidden) now() }); /* phone locks or switches app: save right away */
})();
