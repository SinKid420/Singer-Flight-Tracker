// AwareBC alerts when the app is closed (by Josh Singer): overdue "Back by" check-ins, friend requests and new messages.
// Standard web push from the AwareBC server, free. Messages stay locked: an alert only says who wrote, never what.
// The Android app gets these through Google's push service later (needs a Firebase project); the website works now.
(function(){
  var RS='https://awarebc.aware-bc.workers.dev', NAT=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
  var OK=!NAT&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window&&location.protocol==='https:';
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v) }catch(e){ return null } }
  function post(p,b){ return fetch(RS+'/s/'+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({uid:ls('sky-uid')||'',name:ls('sky-trname')||''},b||{}))}).then(function(r){ return r.json() }).then(function(j){ if(j.error) throw new Error(j.error); return j }) }
  function ub(s){ s=String(s).replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; var b=atob(s), u=new Uint8Array(b.length); for(var i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u }
  function state(){ if(!OK) return 'no'; if(Notification.permission==='denied') return 'blocked'; return ls('aw-push')==='1'&&Notification.permission==='granted'?'on':'off' }
  function on(test){ if(!OK) return Promise.reject(new Error('This browser can’t show alerts when AwareBC is closed.'));
    return Notification.requestPermission().then(function(p){ if(p!=='granted') throw new Error(p==='denied'?'Alerts are blocked. Allow notifications for this site in your browser settings.':'Alerts were not turned on.');
      return Promise.all([navigator.serviceWorker.ready,post('pkey')]) }).then(function(r){ var reg=r[0];
      return reg.pushManager.getSubscription().then(function(s){ return s||reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:ub(r[1].k)}) }) })
    .then(function(s){ var j=s.toJSON(); return post('psub',{ep:j.endpoint,p256dh:j.keys.p256dh,auth:j.keys.auth}) }).then(function(){ ls('aw-push','1'); paint(); if(test) post('ptest').catch(function(){}) }) }
  function off(){ ls('aw-push','0'); paint(); if(!OK) return; navigator.serviceWorker.ready.then(function(reg){ return reg.pushManager.getSubscription() }).then(function(s){ if(!s) return; var ep=s.endpoint; return s.unsubscribe().then(function(){ return post('punsub',{ep:ep}) }) }).catch(function(){}) }
  // keep the server's copy fresh (phones sometimes renew their push address)
  if(state()==='on') setTimeout(function(){ on(false).catch(function(){}) },8000);

  // Settings ▸ Safety & survival ▸ Alerts when AwareBC is closed
  var row=null;
  function paint(){ if(!row) return; var s=state(); row.querySelector('b').textContent=s==='on'?'On':s==='blocked'?'Blocked':s==='no'?(NAT?'Coming to the app':'Not on this browser'):'Off';
    var bt=row.querySelector('button'); bt.hidden=s==='no'; bt.textContent=s==='on'?'Turn off':'Turn on' }
  function mount(){ var hb=document.getElementById('hbfolder'); if(!hb||row) return; row=document.createElement('div'); row.className='setrow'; row.id='pushrow';
    row.innerHTML='<span>Alerts when AwareBC is closed: <b></b></span><button type="button" class="setbtn" style="width:auto;padding:0 14px;margin:0">Turn on</button>';
    var help=document.createElement('div'); help.className='fhelp'; help.textContent='Overdue check-ins, friend requests and new messages, even with the app closed. Messages stay private: an alert only says who wrote.';
    var su=hb.querySelector('summary'); hb.insertBefore(help,su.nextSibling); hb.insertBefore(row,su.nextSibling);
    row.querySelector('button').onclick=function(){ var b=this; if(state()==='on') return off(); b.disabled=true; on(true).then(function(){ b.disabled=false },function(e){ b.disabled=false; say(e.message) }) }; paint() }
  if(document.readyState==='complete') setTimeout(mount,600); else addEventListener('load',function(){ setTimeout(mount,600) });

  // asked at the right moment: after starting a Back-by timer or adding a friend (once, never nagging)
  function say(t){ var d=document.createElement('div'); d.className='frtoast'; d.style.zIndex=6600; d.textContent=t; document.body.appendChild(d); setTimeout(function(){ d.classList.add('go') },3200); setTimeout(function(){ d.remove() },3800) }
  window.__pushAsk=function(why){ if(state()!=='off'||ls('aw-pushask')) return; ls('aw-pushask','1');
    var c=document.createElement('div'); c.className='pushask'; c.setAttribute('role','dialog');
    c.innerHTML='<b>🔔 Get alerts when AwareBC is closed?</b><small>'+(why||'So you hear about overdue friends, friend requests and messages.')+'</small><div><button type="button" data-p="no">Not now</button><button type="button" class="y" data-p="yes">Turn on</button></div>';
    document.body.appendChild(c); c.onclick=function(e){ var b=e.target.closest&&e.target.closest('[data-p]'); if(!b) return; c.remove(); if(b.getAttribute('data-p')==='yes') on(true).then(function(){ say('Alerts are on ✅') },function(err){ say(err.message) }) } };
  window.__push={state:state,on:on,off:off};
  var st=document.createElement('style'); st.textContent='#pushrow{display:flex;align-items:center;justify-content:space-between;gap:8px}'+
    '.pushask{position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 20px);z-index:6500;background:#1c1c1e;color:#fff;border-radius:16px;padding:12px 14px;box-shadow:0 10px 30px rgba(0,0,0,.6);font-family:var(--font,system-ui)}'+
    '.pushask b{display:block;font-size:15px}.pushask small{display:block;color:#aeb4bd;font-size:12.5px;margin-top:3px;line-height:1.35}.pushask div{display:flex;gap:8px;margin-top:10px}.pushask button{flex:1;height:40px;border:0;border-radius:20px;background:#2c2c2e;color:#fff;font:700 14px var(--font,system-ui)}.pushask .y{background:#30d158;color:#000}';
  document.head.appendChild(st);
})();
