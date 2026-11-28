/* Why we ask (by Josh Singer): a short card explains location, microphone, camera and alerts in plain words
   just before the phone's own permission pop-up. Allow -> the phone asks. Not now -> nothing is asked, and the card
   comes back only when you use that feature again. Once allowed, it never shows again. */
(function(){
  var C={
    loc:['📍','#64d2ff','#2aa8e0','Allow location?','Shows your spot on the map and checks for fires, closures and alerts near you.','Your spot is never shared unless you turn on Share my spot.'],
    mic:['🎙️','#ff8a80','#e0352b','Allow the microphone?','Used only while you hold the Talk button, to send a voice note or ask Aware.','Nothing is recorded when you’re not holding the button.'],
    cam:['📷','#bf8bff','#8e5cf0','Allow the camera?','Used by the AR sky camera to label planes, stars and peaks you point at.','Nothing is recorded or sent anywhere.'],
    notif:['🔔','#5ee27a','#26b844','Allow alerts?','Get told about overdue check-ins, friend requests and messages, even when AwareBC is closed.','No ads or marketing, ever. Turn them off any time in Settings.']};
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v) }catch(e){ return null } }
  var later={}, busy={};
  function user(){ try{ return !navigator.userActivation||navigator.userActivation.isActive }catch(e){ return true } }
  function card(kind){ return new Promise(function(res){ var c=C[kind];
      function show(){ var d=document.createElement('div'); d.id='awperm'; d.setAttribute('role','dialog'); d.setAttribute('aria-label',c[3]);
        d.style.cssText='position:fixed;inset:0;z-index:7600;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center';
        d.innerHTML='<div style="width:100%;max-width:460px;background:radial-gradient(120% 70% at 85% -10%,'+c[1]+'33,transparent 60%),#0d1116;color:#fff;border-radius:22px 22px 0 0;padding:20px 18px calc(18px + env(safe-area-inset-bottom));font:14px/1.4 var(--font,system-ui);border-top:1px solid rgba(255,255,255,.08)">'+
          '<div style="display:flex;gap:14px;align-items:center"><span aria-hidden="true" style="flex:none;width:52px;height:52px;border-radius:16px;display:grid;place-items:center;font-size:26px;background:linear-gradient(145deg,'+c[1]+','+c[2]+');box-shadow:inset 0 1px 0 rgba(255,255,255,.5)">'+c[0]+'</span><b style="font-size:21px">'+c[3]+'</b></div>'+
          '<p style="margin:14px 0 0;font-size:15.5px;color:#e6eaee">'+c[4]+'</p><p style="margin:8px 0 0;font-size:13.5px;color:#a9b4bf">🔒 '+c[5]+'</p>'+
          '<div style="display:flex;gap:8px;margin-top:16px"><button type="button" data-a="no" aria-label="Close" style="flex:1;height:50px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;font:700 15px var(--font,system-ui)">Not now</button><button type="button" data-a="yes" style="flex:1.5;height:50px;border-radius:14px;border:0;background:linear-gradient(180deg,'+c[1]+','+c[2]+');color:#06141a;font:800 15px var(--font,system-ui)">Allow</button></div>'+
          '<p style="margin:10px 0 0;text-align:center;font-size:12px;color:#7f8a95">Your phone will ask next. You can change it later.</p></div>';
        d.addEventListener('click',function(e){ var b=e.target.closest('[data-a]'); if(!b&&e.target!==d) return; var yes=!!b&&b.getAttribute('data-a')==='yes'; d.remove(); if(yes) ls('aw-pre-'+kind,'1'); else later[kind]=1; res(yes) });
        document.body.appendChild(d) }
      /* wait until the welcome screens are done, so the card isn't hidden behind them */
      (function wait(){ if(!document.body||document.getElementById('awob')) return setTimeout(wait,500); show() })() }) }
  /* ask(kind, state): true = go ahead and let the phone ask */
  function ask(kind,state){ if(state==='granted'||state==='denied'||ls('aw-pre-'+kind)==='1') return Promise.resolve(true);
    if(later[kind]&&!user()) return Promise.resolve(false);
    if(busy[kind]) return busy[kind]; busy[kind]=card(kind).then(function(v){ busy[kind]=null; return v }); return busy[kind] }
  function state(name){ try{ return navigator.permissions&&navigator.permissions.query?navigator.permissions.query({name:name}).then(function(s){ return s.state },function(){ return '' }):Promise.resolve('') }catch(e){ return Promise.resolve('') } }
  window.__permAsk=function(kind,st){ return ask(kind,st||'') };
  var NO={code:1,PERMISSION_DENIED:1,message:'Not now'};

  // ---- location (website) ----
  var G=navigator.geolocation;
  if(G&&G.getCurrentPosition){ var gcp=G.getCurrentPosition.bind(G), wp=G.watchPosition.bind(G), cw=G.clearWatch.bind(G), ids={}, nid=90000;
    function gate(fn){ return state('geolocation').then(function(s){ return ask('loc',s) }).then(function(ok){ fn(ok) }) }
    G.getCurrentPosition=function(ok,err,o){ if(ls('aw-pre-loc')==='1') return gcp(ok,err,o); gate(function(y){ if(y) gcp(ok,err,o); else if(err) err(NO) }) };
    G.watchPosition=function(ok,err,o){ if(ls('aw-pre-loc')==='1') return wp(ok,err,o); var id=++nid; ids[id]=null; gate(function(y){ if(!(id in ids)) return; if(y) ids[id]=wp(ok,err,o); else{ delete ids[id]; if(err) err(NO) } }); return id };
    G.clearWatch=function(id){ if(id in ids){ if(ids[id]!=null) cw(ids[id]); delete ids[id] } else cw(id) } }

  // ---- microphone and camera ----
  var MD=navigator.mediaDevices;
  if(MD&&MD.getUserMedia){ var gum=MD.getUserMedia.bind(MD);
    MD.getUserMedia=function(c){ var kind=c&&c.video?'cam':'mic';
      return state(kind==='cam'?'camera':'microphone').then(function(s){ return ask(kind,s) }).then(function(y){ if(!y){ var e=new Error('Not now'); e.name='NotAllowedError'; throw e } return gum(c) }) } }

  // ---- alerts (website notifications) ----
  if(window.Notification&&Notification.requestPermission){ var rp=Notification.requestPermission.bind(Notification);
    Notification.requestPermission=function(cb){ if(Notification.permission!=='default') return rp(cb);
      return ask('notif','').then(function(y){ if(!y){ if(cb) cb('default'); return 'default' } return rp(cb) }) } }
})();
