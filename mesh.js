// AwareBC nearby mesh (by Josh Singer): phones pass messages, help calls and trail hazards to each other
// over Bluetooth and Wi-Fi with no cell service (Android app). Each phone passes what it hears on to the next, up to 8 hops.
// Chat messages are locked so only the people in that chat can read them; help calls and hazards are open to everyone nearby.
(function(){
  var A=window.__AW; if(!A||!A.map) return; var map=A.map, esc=A.esc;
  var P=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.AWMesh, can=!!(P&&window.Capacitor.isPluginAvailable&&window.Capacitor.isPluginAvailable('AWMesh'));
  var K='aw-mesh', MAXH=8, KEEP=48*3600000, peers=0, on=false, err='';
  function lj(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v }catch(e){ return d } }
  function sj(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)) }catch(e){} }
  function store(){ var a=lj(K,[]); if(!Array.isArray(a)) a=[]; var now=Date.now(); return a.filter(function(x){ return x&&x.i&&now-x.t<KEEP }) }
  function save(a){ sj(K,a.slice(-200)) }
  function rid(){ var a=new Uint8Array(9); crypto.getRandomValues(a); return Array.prototype.map.call(a,function(b){ return ('0'+b.toString(16)).slice(-2) }).join('') }
  function b64(u){ return btoa(String.fromCharCode.apply(null,new Uint8Array(u))) } function ub(s){ var b=atob(s), u=new Uint8Array(b.length); for(var i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u }
  var enc=new TextEncoder(), dec=new TextDecoder();
  // a chat's mesh tag and lock key both come from its private chat id (only its members have it)
  var TG={}, KY={};
  function tagOf(chat){ if(TG[chat]) return Promise.resolve(TG[chat]); return crypto.subtle.digest('SHA-256',enc.encode('awarebc-mesh-tag:'+chat)).then(function(h){ return TG[chat]=b64(h).slice(0,16) }) }
  function keyOf(chat){ if(KY[chat]) return Promise.resolve(KY[chat]); return crypto.subtle.digest('SHA-256',enc.encode('awarebc-mesh-key:'+chat)).then(function(h){ return crypto.subtle.importKey('raw',h,'AES-GCM',false,['encrypt','decrypt']) }).then(function(k){ return KY[chat]=k }) }
  function F(){ return window.__frMesh||null }
  function myName(){ var f=F(); return f&&f.name()||'AwareBC rider' }

  // ---------- sending ----------
  function push(items){ if(!on||!peers||!items.length) return; for(var i=0;i<items.length;i+=30) P.send({data:JSON.stringify({aw:1,it:items.slice(i,i+30)})}).catch(function(){}) }
  function add(it){ var a=store(); if(a.some(function(x){ return x.i===it.i })) return false; a.push(it); save(a); return true }
  function post(it){ it.i=it.i||rid(); it.t=it.t||Date.now(); it.h=0; add(it); push([it]); paint() }
  window.__mesh={ can:function(){ return can }, on:function(){ return on }, peers:function(){ return peers }, err:function(){ return err },
    chat:function(chat,text,lat,lon){ if(!can) return; var body={n:myName(),x:String(text||'').slice(0,500),t:Date.now()}; if(lat!=null){ body.lat=lat; body.lon=lon }
      Promise.all([tagOf(chat),keyOf(chat)]).then(function(r){ var iv=crypto.getRandomValues(new Uint8Array(12));
        return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},r[1],enc.encode(JSON.stringify(body))).then(function(ct){ post({k:'m',c:r[0],v:b64(iv),e:b64(ct)}) }) }).catch(function(){}) },
    help:function(lat,lon,note){ if(!can) return; post({k:'s',n:myName(),lat:lat,lon:lon,x:String(note||'Needs help').slice(0,200)}) },
    rlpost:function(o){ if(!can) return; post(Object.assign({k:'p'},o)) },
    hazard:function(b){ if(!can||!b) return; post({k:'r',n:myName(),lat:b.lat,lon:b.lon,st:b.st,tg:b.tg,x:String(b.note||'').slice(0,200)}) },
    set:set, inbox:inbox };

  // ---------- receiving ----------
  var seenMsg={};
  function inbox(chat){ var a=lj('aw-meshin-'+chat,[]); return Array.isArray(a)?a:[] }
  function handle(it){
    if(it.k==='m'){ var f=F(); if(!f) return; f.chats().forEach(function(c){ tagOf(c.chat).then(function(tg){ if(tg!==it.c) return;
        return keyOf(c.chat).then(function(k){ return crypto.subtle.decrypt({name:'AES-GCM',iv:ub(it.v)},k,ub(it.e)) }).then(function(pt){ var m=JSON.parse(dec.decode(pt)); if(m.n===myName()) return;
          var a=inbox(c.chat); if(a.some(function(x){ return x.i===it.i })) return; a.push({i:it.i,n:String(m.n||'Rider').slice(0,24),x:String(m.x||'').slice(0,500),lat:m.lat,lon:m.lon,t:+m.t||it.t}); sj('aw-meshin-'+c.chat,a.slice(-60));
          f.got(c.chat,c.n,m) }) }).catch(function(){}) }) }
    else if(it.k==='s'){ alarm('🆘 '+String(it.n||'A rider')+' needs help nearby',it); mark(it) }
    else if(it.k==='r'){ mark(it); toast('⚠️ Trail hazard reported nearby by '+String(it.n||'a rider')) }
    else if(it.k==='p'){ relayUp() } }
  // Rig Link posts carried through a dead zone: the first phone back in service uploads them (and earns Relay)
  var upBusy=false;
  function relayUp(){ if(upBusy||navigator.onLine===false||!window.__rlRelay) return; var done=lj('aw-meshup',[]), mine=window.__frApi&&window.__frApi.tag(); var it=store().filter(function(x){ return x.k==='p'&&done.indexOf(x.i)<0&&x.tg!==mine })[0]; if(!it) return;
    upBusy=true; window.__rlRelay(it).then(function(){ done.push(it.i); sj('aw-meshup',done.slice(-300)); upBusy=false; relayUp() },function(e){ upBusy=false; if(!/fetch|network|load failed/i.test(String(e&&e.message))){ done.push(it.i); sj('aw-meshup',done.slice(-300)) } }) }
  addEventListener('online',function(){ setTimeout(relayUp,4000) }); setTimeout(relayUp,8000);
  function onData(d){ var j; try{ j=JSON.parse(d.data) }catch(e){ return } if(!j||j.aw!==1||!Array.isArray(j.it)) return; var fwd=[];
    j.it.slice(0,60).forEach(function(it){ if(!it||typeof it.i!=='string'||it.i.length>40||!/^[msrp]$/.test(it.k)) return; if(Date.now()-(+it.t||0)>KEEP) return;
      if(JSON.stringify(it).length>3000) return; it.h=(+it.h||0)+1; if(!add(it)) return; handle(it); if(it.h<MAXH) fwd.push(it) });
    if(fwd.length) push(fwd); paint() }

  // ---------- help calls and hazards on the map ----------
  var lay=L.layerGroup().addTo(map), drawn={};
  function mark(it){ if(drawn[it.i]||!isFinite(it.lat)||!isFinite(it.lon)) return; drawn[it.i]=1; var sos=it.k==='s';
    L.marker([it.lat,it.lon],{icon:L.divIcon({className:'',html:'<span class="mshmk'+(sos?' sos':'')+'" role="img" aria-label="'+(sos?'Help call':'Trail hazard')+'">'+(sos?'🆘':'⚠️')+'</span>',iconSize:[0,0]}),zIndexOffset:900})
      .bindPopup('<b>'+(sos?'🆘 '+esc(it.n)+' needs help':'⚠️ Trail hazard')+'</b><br>'+(it.x?esc(it.x)+'<br>':'')+'<small>'+(sos?'':'From '+esc(it.n)+' · ')+'via nearby phones · '+new Date(it.t).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})+'</small><br><button type="button" class="mshgo" data-lat="'+it.lat+'" data-lon="'+it.lon+'">Directions</button>',{closeButton:false,maxWidth:200,minWidth:200,className:'pinpop'}).addTo(lay) }
  map.on('popupopen',function(e){ var b=e.popup.getElement()&&e.popup.getElement().querySelector('.mshgo'); if(b) b.onclick=function(){ map.closePopup(); var ll=L.latLng(+b.getAttribute('data-lat'),+b.getAttribute('data-lon')); if(window.__nav) window.__nav.to(ll,'Help call'); } });
  function alarm(t,it){ try{ if(navigator.vibrate) navigator.vibrate([400,150,400,150,400]) }catch(e){} toast(t); if(window.__native&&window.__native.notify) window.__native.notify('AwareBC',t+(it.x?': '+it.x:'')) }
  function toast(t){ var d=document.createElement('div'); d.className='frtoast'; d.textContent=t; document.body.appendChild(d); setTimeout(function(){ d.classList.add('go') },3500); setTimeout(function(){ d.remove() },4200) }

  // ---------- turning it on and off ----------
  function paint(){ var f=F(); if(f&&f.refresh) f.refresh() }
  function set(v){ if(!can) return Promise.resolve(false); sj('aw-meshon',v?1:0); err='';
    if(!v){ on=false; peers=0; paint(); return P.stop().catch(function(){}).then(function(){ return false }) }
    return P.start({name:myName().slice(0,24)}).then(function(r){ if(r&&r.perm===false){ err='Allow "Nearby devices" (and Location) for AwareBC, then turn this on again.'; on=false; sj('aw-meshon',0); paint(); return false } on=true; paint(); return true })
      .catch(function(e){ err=String(e&&e.message||e); on=false; paint(); return false }) }
  if(can){
    P.addListener('msg',onData); P.addListener('peer',function(e){ peers=+e.peers||0; if(e.up){ push(store()); } paint() });
    P.addListener('error',function(e){ err=String(e.error||'Nearby mesh problem'); paint() });
    lj('aw-meshon',0)&&setTimeout(function(){ set(true) },4000);
    store().forEach(function(it){ if(it.k!=='m') mark(it) });
  }
  var st=document.createElement('style'); st.textContent='.mshmk{display:inline-block;transform:translate(-50%,-50%);font-size:24px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,.8))}.mshmk.sos{animation:mshp 1.2s infinite}@keyframes mshp{50%{transform:translate(-50%,-50%) scale(1.25)}}.mshgo{margin-top:6px;width:100%;padding:8px;border:0;border-radius:10px;background:#1a73e8;color:#fff;font:600 13px var(--font,system-ui)}';
  document.head.appendChild(st);
})();
