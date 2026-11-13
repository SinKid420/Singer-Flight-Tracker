// AwareBC sign-in (by Josh Singer). Optional: maps, GPS, alerts and getting home never wait for it.
// A Google account only brings your friends, chat, trail reports, home pin and map choices back on a new phone.
// The server keeps a fingerprint of your Google account id (never your email or name). Sign-in itself is Google's own button.
(function(){
  var GCLIENT=''; // Google OAuth Web client ID (public). Empty = sign-in hidden (preview with ?signin=1)
  var RS='https://awarebc.aware-bc.workers.dev', SITE='https://sinkid420.github.io/Singer-Flight-Tracker/';
  var NAT=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()), PREVIEW=/[?&]signin=1/.test(location.search);
  var BK=['sky-home','sky-meicon','sky-trname','aw-style','aw-voice','aw-hill','aw-slope','aw-smoke','sky-units','sky-autorot','aw-3d','sky-gpx'];
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v) }catch(e){ return null } }
  function ss(k,v){ try{ if(v===undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k,v) }catch(e){ return null } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] }) }
  function uid(){ var u=ls('sky-uid'); if(!u||u.length<20){ var a=new Uint8Array(18); crypto.getRandomValues(a); u=btoa(String.fromCharCode.apply(null,a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); ls('sky-uid',u) } return u }
  function acct(){ try{ return JSON.parse(ls('aw-gacct')||'null') }catch(e){ return null } }
  function post(p,b){ return fetch(RS+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){ return r.json().catch(function(){ return {error:'Server error ('+r.status+')'} }).then(function(j){ if(!r.ok||j.error) throw new Error(j.error||'Server error'); return j }) }) }
  function note(t,ms){ var d=document.createElement('div'); d.className='awtoast'; d.innerHTML=t; d.style.cssText='position:fixed;left:16px;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 74px);z-index:6100;background:rgba(28,28,30,.97);color:#fff;border-radius:12px;padding:10px 12px;font:13px/1.35 system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.5);text-align:center'; document.body.appendChild(d); setTimeout(function(){ d.remove() },ms||5000) }

  // ---------- backup of small settings (home pin, map choices, rider name, GPX tracks) ----------
  function backupNow(){ if(!acct()) return Promise.resolve(); var o={}; BK.forEach(function(k){ var v=ls(k); if(v!=null) o[k]=v }); var v=JSON.stringify(o);
    if(v.length>60000){ delete o['sky-gpx']; v=JSON.stringify(o) }
    return post('/s/backup',{uid:uid(),op:'put',v:v}).then(function(){ var a=acct(); if(a){ a.bk=Date.now(); ls('aw-gacct',JSON.stringify(a)) } }) }
  function restore(){ return post('/s/backup',{uid:uid(),op:'get'}).then(function(j){ if(!j.v) return false; var o=JSON.parse(j.v); BK.forEach(function(k){ if(o[k]!=null) ls(k,o[k]) }); return true }).catch(function(){ return false }) }

  // ---------- after Google says who you are ----------
  function done(r){ var mine=ls('sky-uid'); ls('aw-gacct',JSON.stringify({first:r.first||'',at:Date.now()})); ls('aw-acct',null); hide();
    if(r.existing&&r.key&&r.key!==mine){ ls('sky-uid',r.key); restore().then(function(){ note('<b>Welcome back'+(r.first?', '+esc(r.first):'')+'</b>Your friends, reports and settings are back. Reloading…',3000); setTimeout(function(){ location.reload() },2200) }) }
    else { note('<b>Signed in'+(r.first?' · '+esc(r.first):'')+'</b>Your friends, reports and settings are backed up.',4500); backupNow().catch(function(){}) } paintSet() }
  function fail(e){ note('<b>Sign-in didn\'t finish</b>'+esc(e&&e.message||'Try again with signal.'),5000) }
  function onCred(resp){ if(!resp||!resp.credential) return; post('/auth/google',{cred:resp.credential,uid:uid()}).then(done,fail) }

  // Google's own sign-in button (website). In the Android app, Google doesn't allow sign-in inside the app's web view,
  // so it opens in the phone's browser and comes back with a one-time code.
  var gisP=null; function gis(){ if(gisP) return gisP; gisP=new Promise(function(ok,no){ if(window.google&&google.accounts&&google.accounts.id) return ok(); var s=document.createElement('script'); s.src='https://accounts.google.com/gsi/client'; s.async=true; s.onload=function(){ ok() }; s.onerror=function(){ gisP=null; no(new Error('Google sign-in could not load. Check your signal.')) }; document.head.appendChild(s) }); return gisP }
  function gButton(el){ if(!GCLIENT){ el.innerHTML='<button type="button" class="aw-gfake" disabled>Continue with Google<small>being set up</small></button>'; return }
    if(NAT){ el.innerHTML='<button type="button" class="aw-gbtn">Continue with Google</button>'; el.firstChild.onclick=function(){ location.href=SITE+'signin.html?app=1' }; return }
    el.innerHTML='<div class="aw-gwait">Loading Google sign-in…</div>';
    gis().then(function(){ google.accounts.id.initialize({client_id:GCLIENT,callback:onCred,ux_mode:'popup',auto_select:false,itp_support:true,context:'signin'}); el.innerHTML=''; google.accounts.id.renderButton(el,{type:'standard',theme:'outline',size:'large',shape:'pill',text:'continue_with',logo_alignment:'center',width:Math.min(308,el.clientWidth||308)}) },function(e){ el.innerHTML='<div class="aw-gwait">'+esc(e.message)+'</div>' }) }
  if(NAT){ try{ var AP=Capacitor.registerPlugin('App'); AP.addListener('appUrlOpen',function(ev){ var m=/^awarebc:\/\/signin\?code=([A-Za-z0-9]{8,40})(?:&first=([^&]*))?/.exec(ev&&ev.url||''); if(!m) return;
      post('/auth/redeem',{code:m[1],uid:uid()}).then(function(r){ r.first=r.first||decodeURIComponent(m[2]||''); done(r) },fail) }) }catch(e){} }

  // ---------- welcome screen (option 1) ----------
  var css=document.createElement('style'); css.textContent='#awwel{position:fixed;inset:0;z-index:6000;background:#0e0e10;color:#fff;font-family:var(--font,system-ui);display:flex;flex-direction:column;align-items:center;padding:calc(env(safe-area-inset-top,0px) + 48px) 26px calc(env(safe-area-inset-bottom,0px) + 22px);overflow:hidden}'+
    '#awwel[hidden]{display:none}#awwel .bg{position:absolute;inset:0;background:radial-gradient(120% 80% at 70% 20%,#2a1b1b,#0e0e10 60%);z-index:-1}#awwel .bg svg{position:absolute;inset:0;width:100%;height:100%;opacity:.22}'+
    '#awwel img{width:84px;height:84px;border-radius:22px;box-shadow:0 8px 30px rgba(255,59,48,.35)}#awwel h1{font:800 30px var(--font,system-ui);margin:14px 0 0}#awwel .by{color:#ff3b30;font:600 13px var(--font,system-ui)}'+
    '#awwel .tl{margin-top:12px;text-align:center;color:#c9c9cf;font-size:14px;line-height:1.4}#awwel .sp{flex:1;min-height:12px}#awwel .gb{width:100%;max-width:308px;min-height:44px;display:flex;justify-content:center}'+
    '#awwel .aw-gbtn,#awwel .aw-gfake{width:100%;height:46px;border-radius:23px;border:0;background:#fff;color:#1f1f1f;font:600 15px var(--font,system-ui)}#awwel .aw-gfake{opacity:.7;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1}#awwel .aw-gfake small{font-size:10px;color:#666}'+
    '#awwel .aw-gwait{color:#9a9aa2;font-size:12px;align-self:center}#awwel .b2{width:100%;max-width:308px;height:44px;border-radius:22px;border:1.5px solid #3a3a3e;background:transparent;color:#fff;font:600 14px var(--font,system-ui);margin-top:10px}'+
    '#awwel .b3{background:none;border:0;color:#9a9aa2;font:600 13px var(--font,system-ui);margin-top:8px;padding:6px 10px}#awwel .nt{font-size:11.5px;color:#9a9aa2;line-height:1.45;text-align:center;margin-top:10px}';
  document.head.appendChild(css);
  var W=null;
  function show(){ if(!W){ W=document.createElement('div'); W.id='awwel'; W.setAttribute('role','dialog'); W.setAttribute('aria-label','Welcome to AwareBC');
      W.innerHTML='<div class="bg"><svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="#ff3b30" stroke-width="1"><path d="M-20 120 C80 60 160 180 380 90"/><path d="M-20 160 C90 100 170 220 380 130"/><path d="M-20 200 C100 140 180 260 380 170"/><path d="M-20 420 C60 380 220 470 380 400"/><path d="M-20 460 C70 420 230 510 380 440"/><path d="M-20 500 C80 460 240 550 380 480"/><circle cx="250" cy="300" r="40"/><circle cx="250" cy="300" r="70"/><circle cx="250" cy="300" r="100"/></g></svg></div>'+
        '<img src="awarebc-512.png" alt=""><h1>AwareBC</h1><div class="by">by Josh Singer</div><div class="tl">Get there and get home safely,<br>with or without signal.</div><div class="sp"></div>'+
        '<div class="gb"></div><button type="button" class="b2" data-a="skip">Skip for now</button><button type="button" class="b3" data-a="none">Use without an account</button>'+
        '<div class="nt">An account only saves your friends, reports and settings for a new phone.<br>Your location stays on your phone.</div>';
      document.body.appendChild(W);
      W.querySelector('[data-a=skip]').onclick=function(){ ss('aw-skip','1'); hide() }; // asks again next time the app opens
      W.querySelector('[data-a=none]').onclick=function(){ ls('aw-acct','none'); hide(); note('<b>No account</b>Everything stays on this phone. You can sign in any time in Settings ▸ Account.',5000) } }
    W.hidden=false; gButton(W.querySelector('.gb')) }
  function hide(){ if(W) W.hidden=true }
  function want(){ if(PREVIEW) return true; if(!GCLIENT||acct()||ls('aw-acct')==='none'||ss('aw-skip')) return false; return navigator.onLine!==false }
  if(want()) show();

  // ---------- Settings ▸ Account ----------
  var F=null;
  function paintSet(){ if(!F) return; var a=acct(), body=F.querySelector('.acb');
    if(a){ body.innerHTML='<div class="setrow">Signed in with Google'+(a.first?' · '+esc(a.first):'')+'</div><div class="fhelp">Backed up '+(a.bk?new Date(a.bk).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'soon')+' · friends, reports, home pin and map choices.</div><button class="setbtn" type="button" data-a="bk">Back up now</button><button class="setbtn" type="button" data-a="out">Sign out on this phone</button>';
      body.querySelector('[data-a=bk]').onclick=function(){ var b=this; b.textContent='Backing up…'; backupNow().then(function(){ paintSet() },function(e){ b.textContent='Back up now'; fail(e) }) };
      body.querySelector('[data-a=out]').onclick=function(){ ls('aw-gacct',null); ls('aw-acct','none'); try{ if(window.google&&google.accounts&&google.accounts.id) google.accounts.id.disableAutoSelect() }catch(e){} paintSet(); note('<b>Signed out</b>This phone keeps working as before.',3500) } }
    else { body.innerHTML='<div class="fhelp">Optional. Sign in to get your friends, chat, trail reports and settings back on a new phone. Maps, GPS and alerts work without it.</div><div class="acg" style="margin:8px 0;display:flex;justify-content:center;min-height:44px"></div>';
      var g=body.querySelector('.acg'); if(F.open) gButton(g); } }
  function mount(){ var up=document.getElementById('updfolder'); if(!up){ setTimeout(mount,500); return } if(!GCLIENT&&!PREVIEW) return;
    F=document.createElement('details'); F.className='folder'; F.id='acctfolder'; F.innerHTML='<summary>Account</summary><div class="acb"></div>'; up.parentNode.insertBefore(F,up);
    F.addEventListener('toggle',function(){ paintSet(); var sh=document.querySelector('#fsheet .sheet'); if(sh) sh.classList.toggle('fopen',!!document.querySelector('#fsheet details.folder[open]')) }); paintSet() }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
  // keep the backup fresh (twice a day while signed in)
  setTimeout(function(){ var a=acct(); if(a&&navigator.onLine!==false&&(!a.bk||Date.now()-a.bk>12*3600000)) backupNow().catch(function(){}) },20000);
  window.__acct={show:show,backup:backupNow,state:acct};
})();
