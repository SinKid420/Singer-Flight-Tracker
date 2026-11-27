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
  var MIC=false&&!!((window.SpeechRecognition||window.webkitSpeechRecognition)&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()));
  window.__awOb={ isNew:NEW, active:function(){ return active }, onDone:function(f){ if(active) waiters.push(f); else f(allowed) } };
  var LATER=!NEW&&ls('aw-obtip')==='1'; // the save-maps tip waits for a calm moment (or the next open)
  if(!NEW&&!LATER) return;
  if(NEW){ ls('sky-setup','1'); // the big map download is offered later, not forced at the start
    document.body.classList.remove('tuton') } // the "tap here for layers" tip waits until the end

  var st=document.createElement('style'); st.textContent=
    '#awob{position:fixed;inset:0;z-index:6500;background:#0b0d10;color:#fff;font-family:var(--font,system-ui);display:flex;flex-direction:column;align-items:center;padding:calc(env(safe-area-inset-top,0px) + 20px) 22px calc(env(safe-area-inset-bottom,0px) + 34px);box-sizing:border-box;overflow-y:auto}'+
    '#awob .bg{position:fixed;inset:0;background:radial-gradient(80% 30% at 50% 22%,rgba(255,69,58,.14),transparent 70%),#05070c;z-index:-2}#awob .sky{position:fixed;left:0;top:0;width:100%;height:100%;z-index:-1;pointer-events:none}'+
    '#awob .q{color:#9aa3ad;font:700 12.5px var(--font,system-ui);margin:5vh 0 8px}#awob .md{display:flex;gap:10px;width:100%;max-width:340px}#awob .md button{flex:1;display:flex;flex-direction:column;justify-content:flex-start;border-radius:18px;padding:14px 10px;text-align:center;color:#eef1f5;background:linear-gradient(160deg,color-mix(in srgb,var(--mc) 15%,transparent),rgba(255,255,255,.03) 65%);border:1px solid color-mix(in srgb,var(--mc) 25%,transparent)}'+
    '#awob .md button.on{border-color:color-mix(in srgb,var(--mc) 60%,transparent);box-shadow:0 0 0 3px color-mix(in srgb,var(--mc) 14%,transparent),0 8px 24px color-mix(in srgb,var(--mc) 22%,transparent)}#awob .md b{display:block;font:800 15px var(--font,system-ui);margin-top:8px}#awob .md small{display:block;font:500 11px var(--font,system-ui);color:#9aa3ad;margin-top:2px}'+
    '#awob .mb{width:44px;height:44px;margin:0 auto;border-radius:14px;display:grid;place-items:center;background:linear-gradient(145deg,var(--mc),color-mix(in srgb,var(--mc) 65%,#000));box-shadow:0 4px 14px color-mix(in srgb,var(--mc) 40%,transparent)}#awob .mb svg{width:24px;height:24px;fill:none;stroke:#0a0d10;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}#awob .mb svg .f{fill:#0a0d10;fill-opacity:.25;stroke:none}'+
    '#awob .by2{color:#9aa3ad;font:500 11.5px var(--font,system-ui);margin-top:12px}#awob .lnk,#awob .cpy{text-shadow:0 1px 6px #000,0 0 2px #000}#awob .lnk button,#awob .lnk a{color:#c7d2dc!important}'+
    /* welcome: spread out evenly between the top and the Earth's horizon */
    '#awob.wel{padding-bottom:calc(env(safe-area-inset-bottom,0px) + 12vh)}#awob.wel .spc{flex:1 1 0;min-height:10px}#awob.wel .s0{max-height:7vh}#awob.wel .s1{max-height:8vh}#awob.wel .s2{max-height:5vh}#awob.wel .gb:empty,#awob.wel .sp{display:none}'+
    '#awob.wel img{margin-top:0;width:104px;height:104px;border-radius:30px}#awob.wel h1{font-size:32px;margin-top:20px;letter-spacing:-.3px;text-shadow:0 0 24px rgba(255,69,58,.35)}#awob.wel .tl{font-size:15px;margin-top:8px;color:#d5dbe3}'+
    '#awob.wel .q{margin:0 0 12px;font-size:13px}#awob.wel .md button{padding:18px 10px 16px}#awob.wel .mb{width:50px;height:50px;border-radius:16px}#awob.wel .mb svg{width:26px;height:26px}#awob.wel .md b{font-size:16px;margin-top:10px}#awob.wel .md small{font-size:11.5px;line-height:1.35;margin-top:4px}'+
    '#awob.wel .pri{margin-top:0;height:56px;font-size:16px}#awob.wel .by2{margin-top:16px}'+
    '#awob img{width:96px;height:96px;border-radius:28px;margin-top:6vh;box-shadow:0 0 0 6px rgba(255,69,58,.12),0 12px 34px rgba(255,69,58,.45)}#awob h1{font:800 28px var(--font,system-ui);margin:16px 0 0}#awob .by{color:#ff453a;font:700 14px var(--font,system-ui);margin-top:10px}'+
    '#awob .tl{color:#c7cbd1;text-align:center;font-size:14px;line-height:1.45;margin-top:8px;max-width:290px}#awob .sp{flex:1;min-height:14px}'+
    '#awob .ic{font-size:40px;margin-top:5vh}#awob h2{font:800 23px/1.2 var(--font,system-ui);margin:12px 0 4px;text-align:center}#awob .sub{color:#aeb4bd;text-align:center;line-height:1.4;font-size:14px;max-width:330px}'+
    '#awob .li{width:100%;max-width:340px;margin-top:16px;display:flex;flex-direction:column;gap:9px}#awob .li>div{display:flex;gap:11px;align-items:flex-start;background:rgba(20,24,30,.8);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:10px 12px}'+
    '#awob .li b{display:block;font-size:14px}#awob .li small{color:#9aa4b2;font-size:12.5px;line-height:1.35}#awob .li span{font-size:20px;line-height:1.2}'+
    '#awob .dots{display:flex;gap:6px;justify-content:center;margin-bottom:12px}#awob .dots i{width:7px;height:7px;border-radius:4px;background:#3a3f47}#awob .dots i.on{width:20px;background:#ff3b30}'+
    '#awob .pri{width:100%;max-width:340px;height:54px;border-radius:16px;border:0;margin-top:16px;background:linear-gradient(180deg,#ff6a5f,#e0281d);color:#fff;font:800 15.5px var(--font,system-ui);box-shadow:0 8px 22px rgba(255,69,58,.45),inset 0 1px 0 rgba(255,255,255,.35)}#awob .sp+.dots+.pri{margin-top:0}'+
    '#awob .lnk{margin-top:12px;color:#9aa4b2;font:600 13.5px var(--font,system-ui);text-align:center}#awob .lnk button,#awob .lnk a{background:none;border:0;color:#9aa4b2;font:inherit;padding:6px 4px}#awob .lnk a{text-decoration:underline}'+
    '#awob.cmp .ic{font-size:32px;margin-top:1vh}#awob.cmp h2{margin:6px 0 2px}#awob.cmp .li{gap:7px;margin-top:12px}#awob.cmp .li>div{padding:8px 11px}#awob.cmp .li small{font-size:12px;line-height:1.3}#awob.cmp .dots{margin-bottom:10px}'+
    '#awob .cpy{position:fixed;right:calc(env(safe-area-inset-right,0px) + 12px);bottom:calc(env(safe-area-inset-bottom,0px) + 6px);color:rgba(200,215,230,.55);font:500 10.5px var(--font,system-ui)}'+
    '#awob .gb{width:100%;max-width:340px;margin-top:10px;display:flex;justify-content:center}#awob .gb:empty{display:none}'+
    '.awobc{position:fixed;left:0;right:0;bottom:0;z-index:5200;background:#1c1c1e;color:#fff;border-radius:22px 22px 0 0;padding:14px 18px calc(env(safe-area-inset-bottom,0px) + 20px);box-shadow:0 -10px 30px rgba(0,0,0,.5);font-family:var(--font,system-ui)}'+
    '.awobc .grab{width:40px;height:5px;border-radius:3px;background:#48484a;margin:0 auto 10px}.awobc b.t{font-size:17px}.awobc p{color:#aeb4bd;margin:4px 0 12px;line-height:1.4;font-size:14px}'+
    '.awobc .row{display:flex;gap:8px}.awobc .row button{height:48px;border-radius:24px;font:800 15px var(--font,system-ui)}.awobc .p{flex:1.4;border:0;background:#ff3b30;color:#fff}.awobc .s{flex:1;background:none;border:1.5px solid #3a3f47;color:#fff}'+
    '.awobc .n{color:#9aa4b2;font:600 13px var(--font,system-ui);text-align:center;margin-top:10px}'+
    '.awobt{position:fixed;left:62px;right:62px;bottom:calc(env(safe-area-inset-bottom,0px) + 30px);z-index:5200;background:#1c1c1e;color:#fff;border-radius:16px;padding:10px 12px;display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center;box-shadow:0 8px 24px rgba(0,0,0,.5);font-family:var(--font,system-ui)}'+
    '.awobt>div{flex:1;min-width:0}.awobt b{font-size:14px}.awobt .bt{flex-basis:100%;display:flex;gap:8px}.awobt .bt button{flex:1}.awobt small{display:block;color:#9aa4b2;font-size:12.5px;margin-top:2px}.awobt button{flex:none;border:0;border-radius:14px;padding:8px 11px;font:700 12.5px var(--font,system-ui);background:#2c2c2e;color:#fff}.awobt button.p{background:#ff3b30}';
  document.head.appendChild(st);

  var O=document.createElement('div'); O.id='awob'; O.setAttribute('role','dialog'); O.setAttribute('aria-label','Welcome to AwareBC'); if(NEW) document.body.appendChild(O);
  // the space sky: stars, and Earth's horizon with city lights and a sunrise glow along the bottom
  function sky(){ var sd=5; function r(){ sd=(sd*16807)%2147483647; return sd/2147483647 } var low=!!window.__awLow, st='', lt='', CY=1212, RX=760, RY=620;
    for(var i=0;i<(low?60:120);i++){ var sx=r()*360, sy=r()*560, sr=r()<.15?1.2:.6, so=.2+r()*.45; if(sx>40&&sx<320&&(sy>165&&sy<250||sy>540)) continue; /* keep stars out from behind the title, slogan and bottom line */ st+='<circle cx="'+sx.toFixed(1)+'" cy="'+sy.toFixed(1)+'" r="'+sr+'" fill="#fff" opacity="'+so.toFixed(2)+'"/>' }
    [[60,8],[140,5],[230,10],[305,6]].forEach(function(c){ for(var i=0;i<(low?18:40);i++){ var x=c[0]+(r()-.5)*c[1]*8, rx=x-180, yy=CY-Math.sqrt(Math.max(0,1-rx*rx/(RX*RX)))*RY, y=yy+3+Math.pow(r(),1.6)*32; lt+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(r()<.25?1.3:.75)+'" fill="'+(r()<.5?'#ffcf7a':'#ffe9b0')+'" opacity="'+(.45+r()*.5).toFixed(2)+'"/>' } });
    var E='<ellipse cx="180" cy="'+CY+'" rx="'+RX+'" ry="'+RY+'" ';
    return '<svg class="sky" viewBox="0 0 360 640" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><radialGradient id="obeg" cx="50%" cy="0%" r="75%"><stop offset="0" stop-color="#1a4270"/><stop offset=".5" stop-color="#0d2440"/><stop offset="1" stop-color="#060d18"/></radialGradient><linearGradient id="obl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a8e2ff"/><stop offset=".6" stop-color="#cfeaff"/><stop offset="1" stop-color="#ffb066"/></linearGradient><linearGradient id="obo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".45" stop-color="#333"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="obm"><rect width="360" height="640" fill="url(#obo)"/></mask><radialGradient id="obo2" cx="100%" cy="100%" r="80%"><stop offset="0" stop-color="#ff8a2a" stop-opacity=".35"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient>'+(low?'':'<filter id="obs" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter><filter id="obg" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>')+'</defs>'+st+
      (low?'':E+'fill="none" stroke="#7cc8ff" stroke-width="16" opacity=".35" filter="url(#obg)"/>'+E+'fill="none" stroke="#ff9a3c" stroke-width="24" opacity=".4" filter="url(#obg)" mask="url(#obm)"/>')+E+'fill="url(#obeg)"/>'+lt+E+'fill="none" stroke="url(#obl)" stroke-width="3" opacity=".45"'+(low?'':' filter="url(#obs)"')+'/><rect x="0" y="540" width="360" height="100" fill="url(#obo2)"/></svg>' }
  var pickMode=ls('aw-obmode')||'on';
  function mi(n){ return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(n==='on'?'<rect class="f" x="2.5" y="6.5" width="19" height="6" rx="1.2"/><path d="M8 21l2-18M16 21l-2-18M12 6v2M12 11v2M12 16v2"/>':'<path class="f" d="M3 20l5-11 4 6 3-4 6 9z"/><path d="M3 20l5-11 4 6 3-4 6 9z"/>')+'</svg>' }
  function welcome(){ O.classList.add('wel'); O.innerHTML='<div class="bg"></div>'+sky()+'<div class="spc s0"></div><img src="awarebc-512.png?v=2" alt=""><h1>AwareBC</h1><div class="tl">Everything &amp; more in one live map.</div>'+
      '<div class="spc s1"></div><div class="q">Where are you heading?</div><div class="md">'+[['on','On-road','City, highways, cameras, ferries','#64d2ff'],['off','Off-road','FSRs, trails, Rig Link, safety timer','#ff6a5f']].map(function(m){ return '<button type="button" data-m="'+m[0]+'" aria-pressed="'+(pickMode===m[0])+'"'+(pickMode===m[0]?' class="on"':'')+' style="--mc:'+m[3]+'"><span class="mb">'+mi(m[0])+'</span><b>'+m[1]+'</b><small>'+m[2]+'</small></button>' }).join('')+'</div>'+
      '<div class="spc s2"></div><button type="button" class="pri" data-a="go">Start exploring</button><div class="by2">Made for BC by Josh Singer</div><div class="gb"></div><div class="sp"></div><div class="cpy">© 2026 AwareBC. All rights reserved.</div>';
    var G=window.__gsi; if(G&&G.client()&&window.__siButton) try{ window.__siButton(O.querySelector('.gb')) }catch(e){} } // Google sign-in, once it is set up
  function consent(){ O.classList.remove('wel'); O.classList.toggle('cmp',MIC); O.innerHTML='<div class="bg"></div>'+sky()+'<div class="ic">📍</div><h2>Use your location?</h2><div class="sub">AwareBC needs your location to work. It stays on your phone unless you choose to share it.</div>'+
      '<div class="li"><div><span>🗺️</span><div><b>Show where you are</b><small>Centre the map, guide you home, and warn about trouble ahead.</small></div></div>'+
      '<div><span>🚙</span><div><b>Nearby riders (Off-road)</b><small>Riders within about 60 km see your rig at about 1 km, unless you pick Exact.</small></div></div>'+
      '<div><span>🆘</span><div><b>Help when there’s no signal</b><small>Your spot goes in help calls only when you send one.</small></div></div>'+
      (MIC?'<div><span>🎙️</span><div><b>Microphone for Aware (Off-road)</b><small>Ask out loud for gas, hospitals and more. Used only when you tap the mic.</small></div></div>':'')+'</div><div class="sp"></div>'+
      '<div class="dots"><i></i><i class="on"></i><i></i></div><button type="button" class="pri" data-a="allow">'+(MIC?'Allow location &amp; mic':'Allow location')+'</button><div class="lnk"><button type="button" data-a="later">Not now</button> · <a href="privacy.html" target="_blank" rel="noopener">Privacy</a></div>' }
  O.onclick=function(e){ var mb=e.target.closest&&e.target.closest('[data-m]'); if(mb){ pickMode=mb.getAttribute('data-m'); [].forEach.call(O.querySelectorAll('[data-m]'),function(x){ var on=x===mb; x.classList.toggle('on',on); x.setAttribute('aria-pressed',String(on)) }); return }
    var b=e.target.closest&&e.target.closest('[data-a]'); if(!b) return; var a=b.getAttribute('data-a');
    if(a==='go'){ ls('aw-obmode',pickMode); return consent() }
    if(a==='later') return finish(false);
    if(a==='allow'){ b.disabled=true; b.textContent='Waiting for your phone…';
      if(!navigator.geolocation) return finish(false);
      // location first, then the phone asks about the microphone (for Aware), then the map
      var mic=function(ok){ if(!MIC) return finish(ok); var d=false, go=function(){ if(!d){ d=true; finish(ok) } }; setTimeout(go,25000);
        try{ navigator.mediaDevices.getUserMedia({audio:true}).then(function(sm){ try{ sm.getTracks().forEach(function(t){ t.stop() }) }catch(e){} go() },go) }catch(e){ go() } };
      try{ navigator.geolocation.getCurrentPosition(function(){ mic(true) },function(er){ mic(!(er&&er.code===1)) },{enableHighAccuracy:false,timeout:20000,maximumAge:600000}) }catch(x){ mic(false) } } };
  function finish(ok){ if(!active) return; active=false; allowed=ok; ls('aw-ob','1'); O.remove(); if(ls('aw-obmode')==='off'){ var fb=document.querySelector('.seg button[data-b=fsr]'); if(fb&&!document.body.classList.contains('fsron')) setTimeout(function(){ fb.click(); setTimeout(function(){ [].forEach.call(document.querySelectorAll('.lyrp'),function(p){ p.hidden=true }) },120) },300) } /* switch to Off-road without popping open its layer list */ var w=waiters; waiters=[]; w.forEach(function(f){ try{ f(ok) }catch(e){} }); setTimeout(offer,1400) }

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
