// AwareBC first run (by Josh Singer): Welcome → why we use location → the phone asks → the map → make a profile or skip → save maps tip.
// Only for brand-new users. People who already use the app never see it. Nothing here waits for signal.
(function(){
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v) }catch(e){ return null } }
  // names only the app's creator and helpers may use (the server enforces this too)
  var RES=/\b(admin|administrator|moderator|mod|awarebc|aware bc|support|staff|official|founder|creator|developer)\b|josh\W*singer/i;
  window.__nameOk=function(n){ if(!RES.test(String(n||''))||ls('aw-admin')==='1') return true;
    var d=document.createElement('div'); d.className='frtoast'; d.style.zIndex=6600; d.textContent='That name is reserved. Please choose another.'; document.body.appendChild(d); setTimeout(function(){ d.classList.add('go') },2800); setTimeout(function(){ d.remove() },3400); return false };
  // the "tap here for layers" hint shows until it's been used once, not on every open; tapping the shade also closes it
  if(ls('aw-tut')==='1') document.body.classList.remove('tuton');
  document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('#menubtn,#toolbtn,#tut')&&document.body.classList.contains('tuton')){ ls('aw-tut','1'); document.body.classList.remove('tuton') } },true);
  var NEW=!ls('aw-ob')&&ls('sky-setup')!=='1'&&!ls('sky-lastpos');
  if(!NEW&&!ls('aw-ob')) ls('aw-ob','1'); // already using AwareBC: never shown
  var waiters=[], active=NEW, allowed=false;
  var MIC=!!((window.SpeechRecognition||window.webkitSpeechRecognition)&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()));
  window.__awOb={ isNew:NEW, active:function(){ return active }, onDone:function(f){ if(active) waiters.push(f); else f(allowed) } };
  var LATER=!NEW&&ls('aw-obtip')==='1'; // the save-maps tip waits for a calm moment (or the next open)
  if(!NEW&&!LATER) return;
  if(NEW){ ls('sky-setup','1'); // the big map download is offered later, not forced at the start
    document.body.classList.remove('tuton') } // the "tap here for layers" tip waits until the end

  var st=document.createElement('style'); st.textContent=
    '#awob{position:fixed;inset:0;z-index:6500;background:#0b0d10;color:#fff;font-family:var(--font,system-ui);display:flex;flex-direction:column;align-items:center;padding:calc(env(safe-area-inset-top,0px) + 20px) 22px calc(env(safe-area-inset-bottom,0px) + 34px);box-sizing:border-box;overflow-y:auto}'+
    '#awob .bg{position:fixed;inset:0;background:radial-gradient(120% 80% at 70% 15%,#2a1b1b,#0b0d10 60%);z-index:-1}'+
    '#awob img{width:156px;height:156px;border-radius:34px;margin-top:8vh;box-shadow:0 0 40px rgba(255,59,48,.35)}#awob h1{font:800 28px var(--font,system-ui);margin:16px 0 0}#awob .by{color:#ff453a;font:700 14px var(--font,system-ui);margin-top:10px}'+
    '#awob .tl{color:#c7cbd1;text-align:center;font-size:15.5px;line-height:1.4;margin-top:12px}#awob .sp{flex:1;min-height:14px}'+
    '#awob .ic{font-size:40px;margin-top:5vh}#awob h2{font:800 23px/1.2 var(--font,system-ui);margin:12px 0 4px;text-align:center}#awob .sub{color:#aeb4bd;text-align:center;line-height:1.4;font-size:14px;max-width:330px}'+
    '#awob .li{width:100%;max-width:340px;margin-top:16px;display:flex;flex-direction:column;gap:9px}#awob .li>div{display:flex;gap:11px;align-items:flex-start;background:#15191e;border-radius:14px;padding:10px 12px}'+
    '#awob .li b{display:block;font-size:14px}#awob .li small{color:#9aa4b2;font-size:12.5px;line-height:1.35}#awob .li span{font-size:20px;line-height:1.2}'+
    '#awob .dots{display:flex;gap:6px;justify-content:center;margin-bottom:12px}#awob .dots i{width:7px;height:7px;border-radius:4px;background:#3a3f47}#awob .dots i.on{width:20px;background:#ff3b30}'+
    '#awob .pri{width:100%;max-width:340px;height:50px;border-radius:25px;border:0;background:#ff3b30;color:#fff;font:800 16px var(--font,system-ui)}'+
    '#awob .lnk{margin-top:12px;color:#9aa4b2;font:600 13.5px var(--font,system-ui);text-align:center}#awob .lnk button,#awob .lnk a{background:none;border:0;color:#9aa4b2;font:inherit;padding:6px 4px}#awob .lnk a{text-decoration:underline}'+
    '#awob.cmp .ic{font-size:32px;margin-top:1vh}#awob.cmp h2{margin:6px 0 2px}#awob.cmp .li{gap:7px;margin-top:12px}#awob.cmp .li>div{padding:8px 11px}#awob.cmp .li small{font-size:12px;line-height:1.3}#awob.cmp .dots{margin-bottom:10px}'+
    '#awob .tl{font-size:19px;font-weight:700;color:#f2f4f7}#awob .ft100{margin-top:6px;padding:4px 12px;border-radius:12px;background:rgba(255,59,48,.16);border:1px solid rgba(255,59,48,.45);color:#ffb3ad;font:800 12.5px var(--font,system-ui);letter-spacing:.4px}'+
    '#awob .cpy{position:fixed;right:calc(env(safe-area-inset-right,0px) + 12px);bottom:calc(env(safe-area-inset-bottom,0px) + 8px);color:#8a929c;font:500 10.5px var(--font,system-ui)}'+
    '#awob .gb{width:100%;max-width:340px;margin-top:10px;display:flex;justify-content:center}#awob .gb:empty{display:none}'+
    '.awobc{position:fixed;left:0;right:0;bottom:0;z-index:5200;background:#1c1c1e;color:#fff;border-radius:22px 22px 0 0;padding:14px 18px calc(env(safe-area-inset-bottom,0px) + 20px);box-shadow:0 -10px 30px rgba(0,0,0,.5);font-family:var(--font,system-ui)}'+
    '.awobc .grab{width:40px;height:5px;border-radius:3px;background:#48484a;margin:0 auto 10px}.awobc b.t{font-size:17px}.awobc p{color:#aeb4bd;margin:4px 0 12px;line-height:1.4;font-size:14px}'+
    '.awobc .row{display:flex;gap:8px}.awobc .row button{height:48px;border-radius:24px;font:800 15px var(--font,system-ui)}.awobc .p{flex:1.4;border:0;background:#ff3b30;color:#fff}.awobc .s{flex:1;background:none;border:1.5px solid #3a3f47;color:#fff}'+
    '.awobc .n{color:#9aa4b2;font:600 13px var(--font,system-ui);text-align:center;margin-top:10px}'+
    '.awobt{position:fixed;left:62px;right:62px;bottom:calc(env(safe-area-inset-bottom,0px) + 30px);z-index:5200;background:#1c1c1e;color:#fff;border-radius:16px;padding:10px 12px;display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center;box-shadow:0 8px 24px rgba(0,0,0,.5);font-family:var(--font,system-ui)}'+
    '.awobt>div{flex:1;min-width:0}.awobt b{font-size:14px}.awobt .bt{flex-basis:100%;display:flex;gap:8px}.awobt .bt button{flex:1}.awobt small{display:block;color:#9aa4b2;font-size:12.5px;margin-top:2px}.awobt button{flex:none;border:0;border-radius:14px;padding:8px 11px;font:700 12.5px var(--font,system-ui);background:#2c2c2e;color:#fff}.awobt button.p{background:#ff3b30}';
  document.head.appendChild(st);

  var O=document.createElement('div'); O.id='awob'; O.setAttribute('role','dialog'); O.setAttribute('aria-label','Welcome to AwareBC'); if(NEW) document.body.appendChild(O);
  function welcome(){ O.innerHTML='<div class="bg"></div><img src="awarebc-512.png?v=2" alt=""><h1>AwareBC</h1><div class="tl">Every alert. Everywhere.</div><div class="ft100">100+ features</div><div class="by">by Josh Singer</div><div class="sp"></div>'+
      '<div class="dots"><i class="on"></i><i></i><i></i></div><button type="button" class="pri" data-a="go">Get started</button><div class="gb"></div><div class="cpy">© 2027 AwareBC. All rights reserved.</div>';
    var G=window.__gsi; if(G&&G.client()&&window.__siButton) try{ window.__siButton(O.querySelector('.gb')) }catch(e){} } // Google sign-in, once it is set up
  function consent(){ O.classList.toggle('cmp',MIC); O.innerHTML='<div class="bg"></div><div class="ic">📍</div><h2>Use your location?</h2><div class="sub">AwareBC needs your location to work. It stays on your phone unless you choose to share it.</div>'+
      '<div class="li"><div><span>🗺️</span><div><b>Show where you are</b><small>Centre the map, guide you home, and warn about trouble ahead.</small></div></div>'+
      '<div><span>🚙</span><div><b>Nearby riders (Off-road)</b><small>Riders within about 60 km see your rig at about 1 km, unless you pick Exact.</small></div></div>'+
      '<div><span>🆘</span><div><b>Help when there’s no signal</b><small>Your spot goes in help calls only when you send one.</small></div></div>'+
      (MIC?'<div><span>🎙️</span><div><b>Microphone for Aware (Off-road)</b><small>Ask out loud for gas, hospitals and more. Used only when you tap the mic.</small></div></div>':'')+'</div><div class="sp"></div>'+
      '<div class="dots"><i></i><i class="on"></i><i></i></div><button type="button" class="pri" data-a="allow">'+(MIC?'Allow location &amp; mic':'Allow location')+'</button><div class="lnk"><button type="button" data-a="later">Not now</button> · <a href="privacy.html" target="_blank" rel="noopener">Privacy</a></div>' }
  O.onclick=function(e){ var b=e.target.closest&&e.target.closest('[data-a]'); if(!b) return; var a=b.getAttribute('data-a');
    if(a==='go') return consent();
    if(a==='later') return finish(false);
    if(a==='allow'){ b.disabled=true; b.textContent='Waiting for your phone…';
      if(!navigator.geolocation) return finish(false);
      // location first, then the phone asks about the microphone (for Aware), then the map
      var mic=function(ok){ if(!MIC) return finish(ok); var d=false, go=function(){ if(!d){ d=true; finish(ok) } }; setTimeout(go,25000);
        try{ navigator.mediaDevices.getUserMedia({audio:true}).then(function(sm){ try{ sm.getTracks().forEach(function(t){ t.stop() }) }catch(e){} go() },go) }catch(e){ go() } };
      try{ navigator.geolocation.getCurrentPosition(function(){ mic(true) },function(er){ mic(!(er&&er.code===1)) },{enableHighAccuracy:false,timeout:20000,maximumAge:600000}) }catch(x){ mic(false) } } };
  function finish(ok){ if(!active) return; active=false; allowed=ok; ls('aw-ob','1'); O.remove(); var w=waiters; waiters=[]; w.forEach(function(f){ try{ f(ok) }catch(e){} }); setTimeout(offer,1400) }

  // on the map: make a profile now, or skip
  function card(html){ var d=document.createElement('div'); d.className='awobc'; d.setAttribute('role','dialog'); d.innerHTML='<div class="grab"></div>'+html; document.body.appendChild(d); return d }
  function offer(){ var d=card('<b class="t">Welcome to AwareBC 👋</b><p>Make a rider profile so friends and riders nearby know who you are. Takes 30 seconds.</p><div class="row"><button type="button" class="p" data-a="mk">Make my profile</button><button type="button" class="s" data-a="sk">Skip</button></div><div class="n">You can do it later in Friends or Rig Link.</div>');
    d.onclick=function(e){ var b=e.target.closest&&e.target.closest('[data-a]'); if(!b) return; d.remove();
      if(b.getAttribute('data-a')==='mk'&&window.__rlQuick) window.__rlQuick(later); else later() } }
  // one thing at a time: the layers hint first, the save-maps tip a few minutes later (or next open)
  function later(){ ls('aw-obtip','1'); setTimeout(function(){ document.body.classList.add('tuton') },800); setTimeout(calm,180000) }
  function calm(){ if(ls('aw-obtip')!=='1') return; var bc=document.body.classList;
    if(document.querySelector('#awob,.awobc,.rlq,.pushask')||bc.contains('menuon')||bc.contains('toolon')||bc.contains('fsrp')||bc.contains('tuton')||document.hidden) return setTimeout(calm,20000);
    ls('aw-obtip',null); tip() }
  function tip(){ var t=document.createElement('div'); t.className='awobt'; t.setAttribute('role','status');
    t.innerHTML='<span style="font-size:24px">📥</span><div><b>Save maps for no signal</b><small>Download your area on Wi-Fi when you’re ready.</small></div><div class="bt"><button type="button" class="p" data-a="sv">Save</button><button type="button" data-a="lt">Later</button></div>';
    document.body.appendChild(t); var tm=setTimeout(end,15000);
    function out(e){ if(!t.contains(e.target)) end() } // any tap elsewhere puts it away
    document.addEventListener('pointerdown',out,true);
    function end(){ clearTimeout(tm); document.removeEventListener('pointerdown',out,true); if(t.parentNode) t.remove() }
    t.onclick=function(e){ var b=e.target.closest&&e.target.closest('[data-a]'); if(!b) return; end(); if(b.getAttribute('data-a')==='sv'&&window.__offSetup){ document.body.classList.remove('tuton'); window.__offSetup() } } }
  if(NEW) welcome(); else setTimeout(calm,8000);
})();
