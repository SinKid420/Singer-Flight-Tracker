// AwareBC crash reports (by Josh Singer). Kept on this phone only: Settings ▸ Crash reports.
// Saves script errors, map graphics failures, the app closing unexpectedly (with what the map was doing just before),
// and the Android app's own crash notes. Nothing is sent anywhere.
(function(){
  var K='aw-crash', AL='aw-alive', MAX=30, t0=Date.now(), nErr=0;
  function rd(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v }catch(e){ return d } }
  function wr(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)) }catch(e){} }
  function state(){ var s={v:window.__AWV||'?',up:Math.round((Date.now()-t0)/1000)};
    try{ var A=window.__AW, m=A&&A.map; if(m){ s.z=Math.round(m.getZoom()*10)/10; s.brg=Math.round(m.getBearing?m.getBearing():0) } }catch(e){}
    try{ var g=window.__gl&&window.__gl.state(); if(g) s.gl=(g.key||'off')+(g.dead?' (stopped)':'') }catch(e){}
    try{ var bc=document.body&&document.body.classList; if(bc){ s.d3=bc.contains('tilt3d'); s.nav=bc.contains('navon') } }catch(e){}
    try{ var b=document.querySelector('.seg button[aria-pressed=true]'); if(b) s.map=b.getAttribute('data-b') }catch(e){}
    try{ var pm=performance.memory; if(pm) s.mem=Math.round(pm.usedJSHeapSize/1e6)+'/'+Math.round(pm.jsHeapSizeLimit/1e6)+' MB' }catch(e){}
    if(navigator.deviceMemory) s.ram=navigator.deviceMemory+' GB'; s.app=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
    s.scr=screen.width+'x'+screen.height+'@'+(window.devicePixelRatio||1); return s }
  function add(kind,msg,extra){ var l=rd(K,[]); l.unshift({t:Date.now(),k:kind,m:String(msg||'').slice(0,600),s:extra||state()}); if(l.length>MAX) l.length=MAX; wr(K,l); badge() }
  window.__crash={add:function(k,m){ add(k,m) },list:function(){ return rd(K,[]) },clear:function(){ wr(K,[]); badge() }};

  // script errors (first few per session, so one repeating error doesn't fill the log)
  addEventListener('error',function(e){ if(!e||(e.target&&e.target!==window)||!e.message) return; if(++nErr>8) return; add('Script error',(e.message||'error')+(e.filename?' @ '+String(e.filename).split('/').pop()+':'+e.lineno+':'+e.colno:'')+(e.error&&e.error.stack?'\n'+String(e.error.stack).slice(0,400):'')) },true);
  addEventListener('unhandledrejection',function(e){ if(++nErr>8) return; var r=e&&e.reason; if(!r||r===0||/abort/i.test(String(r&&r.name||r))) return; add('Script error','Unhandled: '+String(r&&r.message||r).slice(0,300)) });

  // closed unexpectedly: the last heartbeat never got a clean goodbye
  var prev=rd(AL,null); if(prev&&!prev.clean&&Date.now()-prev.t<15*60000) add('Closed unexpectedly','The app stopped without closing normally (often the map running out of memory). Last seen '+Math.round((Date.now()-prev.t)/1000)+' s before reopening.',prev.s);
  function beat(clean){ wr(AL,{t:Date.now(),clean:!!clean,s:state()}) }
  beat(false); setInterval(function(){ if(!document.hidden) beat(false) },4000);
  addEventListener('pagehide',function(){ beat(true) }); document.addEventListener('visibilitychange',function(){ beat(document.hidden) });

  // Android app's own notes (map drawing process gone, app errors), read once and merged in
  function nat(){ try{ var C=window.Capacitor; if(!C||!(C.isNativePlatform&&C.isNativePlatform())) return; var P=C.registerPlugin?C.registerPlugin('AWCrash'):C.Plugins&&C.Plugins.AWCrash; if(!P) return;
    P.getLog().then(function(r){ var txt=r&&r.log; if(!txt) return; var lines=String(txt).split('\n').filter(Boolean), l=rd(K,[]);
      lines.forEach(function(ln){ var p=ln.split('\t'), t=+p[0]; if(!t||l.some(function(x){ return x.t===t })) return; l.push({t:t,k:p[1]==='map-memory'?'Map ran out of memory (Android)':p[1]==='map-crash'?'Map drawing crashed (Android)':'App error (Android)',m:(p[2]||'').replace(/\\n/g,'\n').slice(0,1500),s:{dev:r.device||''}}) });
      l.sort(function(a,b){ return b.t-a.t }); if(l.length>MAX) l.length=MAX; wr(K,l); P.clear(); badge(); ui() }).catch(function(){}) }catch(e){} }

  // ---------- Settings ▸ Crash reports ----------
  function fmt(x){ var d=new Date(x.t), s=x.s||{}, o=d.toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' · '+x.k+'\n'+x.m;
    var bits=[]; for(var k in s) bits.push(k+'='+(typeof s[k]==='object'?JSON.stringify(s[k]):s[k])); return o+(bits.length?'\n['+bits.join(' ')+']':'') }
  var fold=null, cnt=null;
  function badge(){ if(cnt){ var n=rd(K,[]).length; cnt.textContent=n?' ('+n+')':'' } }
  function ui(){ if(!fold) return; var l=rd(K,[]), ta=fold.querySelector('textarea'), em=fold.querySelector('.fhelp');
    ta.value=l.length?'AwareBC crash reports · '+(navigator.userAgent.match(/Android [\d.]+|iPhone OS [\d_]+|Windows NT [\d.]+|Mac OS X [\d_]+/)||[''])[0]+'\n\n'+l.map(fmt).join('\n\n'):''; ta.hidden=!l.length; em.textContent=l.length?'Tap Select all, then Copy, and paste it to Claude to get it fixed.':'No crashes saved. If AwareBC closes or freezes, it is saved here.';
    [].forEach.call(fold.querySelectorAll('.crb'),function(b){ b.hidden=!l.length }) }
  function mount(){ var up=document.getElementById('updfolder'); if(!up){ setTimeout(mount,500); return }
    fold=document.createElement('details'); fold.className='folder'; fold.id='crashfolder';
    fold.innerHTML='<summary>Crash reports<span class="crn"></span></summary><div class="fhelp" role="status"></div><textarea readonly rows="7" style="width:100%;box-sizing:border-box;background:var(--chip);color:var(--fg);border:0;border-radius:10px;padding:8px;font:11px/1.35 ui-monospace,monospace" aria-label="Crash reports"></textarea>'+
      '<button class="setbtn crb" type="button" data-a="sel">Select all</button><button class="setbtn crb" type="button" data-a="copy">Copy</button><button class="setbtn crb" type="button" data-a="clr">Clear reports</button>';
    up.parentNode.insertBefore(fold,up.nextSibling); cnt=fold.querySelector('.crn'); badge(); ui();
    fold.addEventListener('toggle',function(){ if(fold.open) ui(); var sh=document.querySelector('#fsheet .sheet'); if(sh) sh.classList.toggle('fopen',!!document.querySelector('#fsheet details.folder[open]')) });
    var ta=fold.querySelector('textarea');
    fold.querySelector('[data-a=sel]').onclick=function(){ ta.focus(); ta.select(); ta.setSelectionRange(0,ta.value.length) };
    fold.querySelector('[data-a=copy]').onclick=function(){ ta.focus(); ta.select(); ta.setSelectionRange(0,ta.value.length); var ok=false; try{ ok=document.execCommand('copy') }catch(e){} this.textContent=ok?'Copied ✓':'Now press and hold the text ▸ Copy'; var b=this; setTimeout(function(){ b.textContent='Copy' },2500) };
    fold.querySelector('[data-a=clr]').onclick=function(){ window.__crash.clear(); ui() } }
  function toast(){ var l=rd(K,[]); if(!l.length||Date.now()-l[0].t>20000||l[0].k!=='Closed unexpectedly') return; var d=document.createElement('div');
    d.style.cssText='position:fixed;left:16px;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 70px);z-index:3000;background:rgba(28,28,30,.96);color:#fff;border-radius:12px;padding:10px 12px;font:13px/1.35 system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.5);text-align:center';
    d.innerHTML='<b style="display:block;margin-bottom:2px">AwareBC closed unexpectedly</b>A crash report was saved in Settings ▸ Crash reports.'; document.body.appendChild(d); setTimeout(function(){ d.remove() },7000) }
  function ready(){ mount(); toast(); setTimeout(nat,1500) }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready); else ready();
})();
