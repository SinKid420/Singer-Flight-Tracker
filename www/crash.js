// AwareBC crash reports (by Josh Singer). Kept on this phone (Settings ▸ Crash reports) and, unless turned off, sent anonymously to the AwareBC server.
// Saves script errors, map graphics failures, the app closing unexpectedly (with what the map was doing just before),
// and the Android app's own crash notes. The copy sent has no rider name and no location.
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
    try{ s.tiles=document.querySelectorAll('.leaflet-tile').length }catch(e){}
    if(navigator.deviceMemory) s.ram=navigator.deviceMemory+' GB'; s.app=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
    try{ s.perf=(window.__awPerf||'auto')+(window.__awLow?'/low':'/fast'); s.sat=localStorage.getItem('aw-satsrc')||'esri'; var sn=window.__snow&&__snow.state(), rn=window.__rainfx&&__rainfx.state(); s.fx=(sn&&sn.running?'snow'+sn.flakes:'')+(rn&&rn.running?'rain'+rn.drops:'')||'none' }catch(e){}
    s.scr=screen.width+'x'+screen.height+'@'+(window.devicePixelRatio||1); return s }
  function add(kind,msg,extra){ var l=rd(K,[]), x={t:Date.now(),k:kind,m:String(msg||'').slice(0,600),s:extra||state()}; l.unshift(x); if(l.length>MAX) l.length=MAX; wr(K,l); badge(); queue(x) }
  /* anonymous copy to the AwareBC server so Josh can fix bugs (no rider name, no location): Settings > Crash reports can turn it off */
  var RS='https://awarebc.aware-bc.workers.dev', Q='aw-crq';
  function sendOn(){ try{ return localStorage.getItem('aw-crsend')!=='0' }catch(e){ return true } }
  function queue(x){ if(!sendOn()) return; var q=rd(Q,[]); q.push(x); if(q.length>10) q=q.slice(-10); wr(Q,q); clearTimeout(queue.t); queue.t=setTimeout(flush,4000) }
  function dev(){ var u=navigator.userAgent; return ((u.match(/Android [\d.]+|iPhone OS [\d_]+|Windows NT [\d.]+|Mac OS X [\d_]+|CrOS/)||['?'])[0]+' · '+((u.match(/(Chrome|Firefox|Version)\/[\d]+/)||[''])[0])+(navigator.deviceMemory?' · '+navigator.deviceMemory+'GB':'')).slice(0,80) }
  function flush(){ var q=rd(Q,[]), uid=''; if(!q.length||!sendOn()||navigator.onLine===false) return; try{ uid=localStorage.getItem('sky-uid')||'' }catch(e){} if(!uid) return;
    var part=q.slice(0,5); fetch(RS+'/s/crash',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:uid,v:String(window.__AWV||''),dev:dev(),r:part})}).then(function(r){ if(r.ok){ wr(Q,rd(Q,[]).slice(part.length)); if(rd(Q,[]).length) setTimeout(flush,3000) } }).catch(function(){}) }
  addEventListener('online',function(){ setTimeout(flush,2000) }); setTimeout(flush,12000);
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
    var acf=document.getElementById('acctfolder')||fold, acd=acf.querySelector('.acdel'); (acd?function(h){ acd.insertAdjacentHTML('beforebegin',h) }:function(h){ acf.insertAdjacentHTML('beforeend',h) })('<label class="setrow" for="crsend">Send crash reports<input type="checkbox" id="crsend"></label><p class="fhelp">Anonymous: only the error, app version and phone type. Never your name or location.</p><button class="setbtn" type="button" id="crall" style="color:#64d2ff" hidden>All riders\u2019 reports (owner)</button>');
    up.parentNode.insertBefore(fold,up.nextSibling); cnt=fold.querySelector('.crn'); badge(); ui();
    var cs=acf.querySelector('#crsend'); cs.checked=sendOn(); cs.onchange=function(){ try{ localStorage.setItem('aw-crsend',cs.checked?'1':'0') }catch(e){} if(!cs.checked) wr(Q,[]) };
    var ca=acf.querySelector('#crall'), asked=0; acf.addEventListener('toggle',function(){ if(!acf.open||asked) return; asked=1; var uid=''; try{ uid=localStorage.getItem('sky-uid')||'' }catch(e){} if(!uid) return;
      fetch(RS+'/s/myplaces',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:uid})}).then(function(r){ return r.json() }).then(function(j){ ca.hidden=!(j&&j.admin) }).catch(function(){}) });
    ca.onclick=function(){ owner() };
    fold.addEventListener('toggle',function(){ if(fold.open) ui(); var sh=document.querySelector('#fsheet .sheet'); if(sh) sh.classList.toggle('fopen',!!document.querySelector('#fsheet details.folder[open]')) });
    var ta=fold.querySelector('textarea');
    fold.querySelector('[data-a=sel]').onclick=function(){ ta.focus(); ta.select(); ta.setSelectionRange(0,ta.value.length) };
    fold.querySelector('[data-a=copy]').onclick=function(){ ta.focus(); ta.select(); ta.setSelectionRange(0,ta.value.length); var ok=false; try{ ok=document.execCommand('copy') }catch(e){} this.textContent=ok?'Copied ✓':'Now press and hold the text ▸ Copy'; var b=this; setTimeout(function(){ b.textContent='Copy' },2500) };
    fold.querySelector('[data-a=clr]').onclick=function(){ window.__crash.clear(); ui() } }
  /* owner view: every rider's anonymous reports, most common first */
  function owner(){ var uid=''; try{ uid=localStorage.getItem('sky-uid')||'' }catch(e){} var d=document.createElement('div'); d.id='awcr'; d.setAttribute('role','dialog'); d.setAttribute('aria-label','All crash reports');
    d.style.cssText='position:fixed;inset:0;z-index:6600;background:#0d1116;color:#fff;display:flex;flex-direction:column;padding:14px 14px calc(14px + env(safe-area-inset-bottom));font:14px/1.35 system-ui,sans-serif';
    d.innerHTML='<div style="display:flex;align-items:center;gap:10px"><b style="font-size:20px;flex:1">Crash reports <small style="display:block;font-size:12.5px;font-weight:400;color:#a9b4bf">All riders \u00b7 last 30 days \u00b7 anonymous</small></b><button type="button" aria-label="Close" style="width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;font-size:18px">\u2715</button></div>'+
      '<div class="crl" style="flex:1;overflow:auto;margin-top:10px;display:grid;gap:8px;align-content:start">Loading\u2026</div>'+
      '<div style="display:flex;gap:8px;margin-top:10px"><button type="button" data-a="cp" style="flex:1;height:46px;border-radius:12px;border:0;background:#64d2ff;color:#06202c;font-weight:700">Select all to copy</button><button type="button" data-a="cl" style="flex:1;height:46px;border-radius:12px;border:1px solid rgba(255,69,58,.4);background:rgba(255,69,58,.14);color:#ff6b61;font-weight:700">Clear all</button></div><textarea readonly style="position:absolute;left:-9999px;top:0;width:10px;height:10px"></textarea>';
    document.body.appendChild(d); d.querySelector('[aria-label=Close]').onclick=function(){ d.remove() };
    var list=d.querySelector('.crl'), ta=d.querySelector('textarea');
    function call(b){ return fetch(RS+'/s/crashes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({uid:uid},b||{}))}).then(function(r){ return r.json() }) }
    function esc(t){ return String(t).replace(/[&<>]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c] }) }
    function load(){ call().then(function(j){ if(j.error) throw j.error; var top=j.top||[];
      list.innerHTML=top.length?top.map(function(x){ return '<div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px 12px"><div style="display:flex;gap:8px;align-items:center"><b style="background:#ff453a;border-radius:9px;padding:1px 8px;font-size:13px">'+x.n+'\u00d7</b><b style="flex:1">'+esc(x.k)+'</b><small style="color:#a9b4bf">v'+esc(x.v||'?')+' \u00b7 '+new Date(x.t).toLocaleDateString([],{month:'short',day:'numeric'})+'</small></div><div style="margin-top:4px;color:#dfe5ea;font-size:13px;word-break:break-word">'+esc(x.m)+'</div></div>' }).join(''):'<p style="color:#a9b4bf;text-align:center;margin-top:40px">\u2713 No crash reports. Nice and stable.</p>';
      ta.value='AwareBC crash reports (all riders)\n\n'+(j.r||[]).map(function(x){ return new Date(x.t).toISOString().slice(0,16)+' v'+x.v+' '+x.k+' | '+x.dev+'\n'+x.m+'\n'+x.s }).join('\n\n') }).catch(function(e){ list.textContent=typeof e==='string'?e:'\ud83d\udcf6 Couldn\u2019t load reports. Check your signal.' }) }
    d.querySelector('[data-a=cp]').onclick=function(){ ta.style.cssText='width:100%;height:120px;margin-top:8px;background:#000;color:#fff;border-radius:10px'; ta.focus(); ta.select(); ta.setSelectionRange(0,ta.value.length); var ok=false; try{ ok=document.execCommand('copy') }catch(e){} this.textContent=ok?'Copied \u2713':'Press and hold the text \u25b8 Copy' };
    var clr=d.querySelector('[data-a=cl]'); clr.onclick=function(){ if(clr.textContent!=='Tap again to clear'){ clr.textContent='Tap again to clear'; return } call({op:'clear'}).then(load) };
    load() }
  function toast(){ var l=rd(K,[]); if(!l.length||Date.now()-l[0].t>20000||l[0].k!=='Closed unexpectedly') return; var d=document.createElement('div');
    d.style.cssText='position:fixed;left:16px;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 70px);z-index:3000;background:rgba(28,28,30,.96);color:#fff;border-radius:12px;padding:10px 12px;font:13px/1.35 system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.5);text-align:center';
    d.innerHTML='<b style="display:block;margin-bottom:2px">AwareBC closed unexpectedly</b>A crash report was saved in Settings ▸ Crash reports.'+(window.__glNote?'<br>'+window.__glNote:''); document.body.appendChild(d); setTimeout(function(){ d.remove() },window.__glNote?11000:7000) }
  function ready(){ mount(); toast(); setTimeout(nat,1500) }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready); else ready();
})();
