/* AwareBC auto-update (by Josh Singer): checks for a newer version on open, when you come back to the app, and every 30 minutes.
   When one is ready it shows an "Update available" card: Update now reloads in about 2 seconds, Later hides it until the next check. */
(function(){
  var NAT=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()), last=0, snooze=0, shown=null, pend=null;
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v) }catch(e){ return null } }
  var css=document.createElement('style'); css.textContent=
    '#awupd{position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 16px);z-index:7200;max-width:420px;margin:0 auto;border-radius:22px;padding:14px;color:#eef1f5;font-family:var(--font,system-ui);background:linear-gradient(160deg,rgba(50,215,75,.14),rgba(18,22,28,0) 60%),#12161c;border:1px solid rgba(50,215,75,.32);box-shadow:0 18px 40px rgba(0,0,0,.6),0 0 30px rgba(50,215,75,.15);animation:awupin .35s ease-out}'+
    'body.awshell #awupd{bottom:calc(env(safe-area-inset-bottom,0px) + 74px)}@keyframes awupin{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}@media (prefers-reduced-motion:reduce){#awupd{animation:none}}'+
    '#awupd .h{display:flex;gap:12px;align-items:center}#awupd .bd{width:46px;height:46px;flex:none;border-radius:15px;display:grid;place-items:center;background:linear-gradient(145deg,#32d74b,#1e9e33);box-shadow:0 4px 14px rgba(50,215,75,.45),inset 0 1px 0 rgba(255,255,255,.4)}'+
    '#awupd .bd svg{width:25px;height:25px;fill:none;stroke:#04140a;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}#awupd .bd .f{fill:#04140a;fill-opacity:.28;stroke:none}'+
    '#awupd .t{flex:1;min-width:0}#awupd .t b{display:block;font:800 16.5px var(--font,system-ui)}#awupd .t small{display:block;font:500 12px/1.35 var(--font,system-ui);color:#9aa3ad;margin-top:2px}'+
    '#awupd .x{flex:none;align-self:flex-start;width:30px;height:30px;border:0;border-radius:50%;background:rgba(255,255,255,.08);color:#c2c9d1;font-size:13px}'+
    '#awupd .r{display:flex;gap:8px;margin-top:12px}#awupd .r button{height:44px;border-radius:13px;font:800 14px var(--font,system-ui)}#awupd .lt{flex:1;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.06);color:#c2c9d1}'+
    '#awupd .go{flex:2;border:0;background:linear-gradient(180deg,#5ee877,#24b23e);color:#04140a;box-shadow:0 6px 18px rgba(50,215,75,.35),inset 0 1px 0 rgba(255,255,255,.4)}#awupd .go:disabled{opacity:.75}';
  document.head.appendChild(css);

  // other first-run screens and driving come first: the card waits for a calm moment
  function busy(){ var b=document.body.classList; return !!document.querySelector('#awob,#awtour,.rlq:not([hidden]),#ofsetup:not([hidden])')||b.contains('navdrv')||document.hidden }
  addEventListener('pointerdown',function(){ window.__awTouched=1 },{once:true,capture:true});
  /* found in the first 45 seconds, before you've touched anything: switch to the new version straight away, no card */
  function show(apply){ pend=apply; if(!window.__awTouched&&performance.now()<45000&&!document.hidden&&Date.now()-(+ls('aw-autoupd')||0)>600000){ ls('aw-autoupd',String(Date.now())); try{ apply() }catch(x){ location.reload() } return } if(shown||Date.now()<snooze) return; if(busy()){ setTimeout(function(){ if(pend&&!shown) show(pend) },15000); return }
    var d=document.createElement('div'); d.id='awupd'; d.setAttribute('role','dialog'); d.setAttribute('aria-label','Update available');
    d.innerHTML='<div class="h"><span class="bd" aria-hidden="true"><svg viewBox="0 0 24 24"><circle class="f" cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="9"/><path d="M12 7.5v8M8.5 12l3.5 3.5 3.5-3.5"/></svg></span><span class="t"><b>Update available</b><small>A new version of AwareBC is ready. It takes about 2 seconds, and your settings and saved maps stay.</small></span><button type="button" class="x" data-u="later" aria-label="Close">✕</button></div>'+
      '<div class="r"><button type="button" class="lt" data-u="later">Later</button><button type="button" class="go" data-u="go">Update now</button></div>';
    d.onclick=function(e){ var b=e.target.closest&&e.target.closest('[data-u]'); if(!b) return;
      if(b.getAttribute('data-u')==='later'){ snooze=Date.now()+2*3600000; d.remove(); shown=null; return }
      b.disabled=true; b.textContent='Updating…'; ls('aw-updated',String(Date.now())); try{ pend() }catch(x){ location.reload() } };
    document.body.appendChild(d); shown=d }

  // website: the server's file list (sw.js) is compared with the files this copy is running
  function webApply(){ var u=function(){ location.replace(location.pathname+'?v='+Date.now()) }; try{ navigator.serviceWorker.getRegistration().then(function(g){ return g&&g.update() }).then(u,u) }catch(e){ u() } }
  function webCheck(){ if(!('fetch' in window)) return;
    var have=[].map.call(document.querySelectorAll('script[src]'),function(s){ return s.getAttribute('src') }).filter(function(s){ return !/^https?:/.test(s) });
    fetch('sw.js?check='+Date.now(),{cache:'no-store'}).then(function(r){ if(!r.ok) throw 0; return r.text() }).then(function(t){ var F=(/F=\[([^\]]*)\]/.exec(t)||[])[1]||''; if(!F) return;
      if(have.some(function(s){ return F.indexOf("'./"+s+"'")<0 })){ try{ navigator.serviceWorker&&navigator.serviceWorker.getRegistration().then(function(g){ g&&g.update() }) }catch(e){} show(webApply) } }).catch(function(){}) }
  // phone app: the app's own updater downloads in the background, then the card offers to restart with it
  function natCheck(){ var N=window.__native; if(!N||!N.update) return; N.update(function(){}).then(function(r){ if(r&&r.state==='ready') show(function(){ if(!N.applyUpdate()) location.reload() }) },function(){}) }
  function check(force){ if(navigator.onLine===false) return; var gap=NAT?6*3600000:10*60000; if(!force&&Date.now()-last<gap) return; last=Date.now(); if(NAT) natCheck(); else webCheck() }

  window.__updPop=function(){ show(NAT?function(){ location.reload() }:webApply) }; // the service worker says a new copy downloaded
  setTimeout(function(){ check(true) },3000);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) check(false) });
  addEventListener('online',function(){ check(false) });
  setInterval(function(){ if(!document.hidden) check(true) },30*60000);
  // after an update, a short "Updated ✓" note so riders know it worked
  var up=+ls('aw-updated')||0; if(up&&Date.now()-up<120000){ ls('aw-updated','0'); setTimeout(function(){ var n=document.createElement('div'); n.className='frtoast'; n.style.zIndex=7200; n.textContent='AwareBC is up to date ✓'; document.body.appendChild(n); setTimeout(function(){ n.classList.add('go') },2600); setTimeout(function(){ n.remove() },3200) },1500) }
})();
