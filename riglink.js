// AwareBC Rig Link (by Josh Singer), Off road only: a regional off-road feed (trail conditions, rigs, trailhead help)
// with a live topo map on top, plus key-locked convoys (#884-BCR) for private posts and live rig spots.
(function(){
  var A=window.__AW; if(!A||!A.map) return; var MAP=A.map, esc=A.esc, RS='https://awarebc.aware-bc.workers.dev';
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v) }catch(e){ return null } }
  function lj(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v }catch(e){ return d } }
  function uid(){ var u=ls('sky-uid'); if(!u||u.length<20){ var a=new Uint8Array(18); crypto.getRandomValues(a); u=btoa(String.fromCharCode.apply(null,a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); ls('sky-uid',u) } return u }
  function name(){ return ls('sky-trname')||'' }
  function api(b){ return fetch(RS+'/s/rl',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({uid:uid(),name:name()},b))})
    .then(function(r){ return r.json().catch(function(){ return {error:'Server error ('+r.status+')'} }).then(function(j){ if(!r.ok||j.error) throw new Error(j.error||'Server error'); return j }) }) }
  function ago(t){ var m=Math.round((Date.now()-t)/60000); return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago' }
  function ini(n){ return esc(String(n||'?').trim().split(/\s+/).map(function(w){ return w[0] }).join('').slice(0,2).toUpperCase()) }
  function col(s){ var h=0; s=String(s||''); for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return 'hsl('+(Math.abs(h)%360)+',55%,32%)' }
  function km(a,b,c,d){ var r=Math.PI/180, x=Math.sin((c-a)*r/2), y=Math.sin((d-b)*r/2); return 12742*Math.asin(Math.sqrt(x*x+Math.cos(a*r)*Math.cos(c*r)*y*y)) }
  function me(){ var m=A.me&&A.me(); if(m&&m.label!=='none'&&isFinite(m.lat)) return {lat:m.lat,lon:m.lon,alt:m.alt,real:true}; var c=MAP.getCenter(); return {lat:c.lat,lon:c.lng,real:false} }
  function offRoad(){ return document.body.classList.contains('fsron') }
  var KIND={c:['TRAIL','#ef4444','#3b1515','#fca5a5'],r:['RIG','#3b82f6','#132341','#93c5fd'],h:['HELP','#f59e0b','#3a2a0d','#fcd34d']};
  var ST={hazard:'⚠️ Hazard',snow:'❄️ Snow',recovery:'🪝 Recovery needed',mud:'🟫 Mud',tree:'🌲 Tree down',ok:'✅ All clear'};


  // ---------- badges: metal shields (Bronze 3 · Silver 10 · Gold 25) ----------
  var BD=[['recovery','Recovery','Pulling stuck rigs out','#ff6b35','#b83a0e'],['sawyer','Sawyer','Clearing downed trees and rocks','#7bc96f','#2e7d32'],['scout','Scout','Verified trail, gate and snow reports','#5fb4ff','#1565c0'],['wrench','Wrench','Trailside fixes and lending tools or parts','#c0c6cf','#56606d'],['relay','Relay','Carrying trail posts through dead zones','#c792ea','#6a1b9a']];
  var BIC={recovery:'<g fill="none" stroke="#fff" stroke-linecap="round"><rect x="9.3" y="0.8" width="5.4" height="7.4" rx="2.7" stroke-width="2"/><rect x="9.3" y="10.4" width="5.4" height="6.4" rx="2.7" stroke-width="2"/><path d="M12 15.6v3.1a3.4 3.4 0 0 1-6.8 0v-1.3" stroke-width="2.4"/></g><rect x="11" y="6" width="2" height="6.2" rx="1" fill="#fff"/><path d="M3.3 18.6 5.2 14.6l2.3 3.3z" fill="#fff"/>',
    sawyer:'<path d="M3 10.2V7.8A2.3 2.3 0 0 1 5.3 5.5h3.4A2.3 2.3 0 0 1 11 7.8v2.4H9.3V7.9a.6.6 0 0 0-.6-.6H5.3a.6.6 0 0 0-.6.6v2.3z"/><rect x="1.8" y="10" width="8.8" height="7.6" rx="1.8"/><rect x="0.6" y="12" width="1.8" height="3.4" rx=".6"/><rect x="10.2" y="11.6" width="12.2" height="4.4" rx="2.2" fill-opacity=".9"/><rect x="9.9" y="10.8" width="13.1" height="6" rx="3" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="1.1 .9"/><circle cx="6.2" cy="13.8" r="1.6" fill="#000" fill-opacity=".3"/>',
    scout:'<path d="M4 9a3 3 0 0 1 6 0v1h4V9a3 3 0 0 1 6 0l1 7a3.5 3.5 0 0 1-7 .6V14h-4v2.6A3.5 3.5 0 0 1 3 16zm2.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>',
    wrench:'<path d="M14.7 3.3a5 5 0 0 0-5.9 6.5L3.5 15.1a2 2 0 1 0 2.8 2.8l5.3-5.3a5 5 0 0 0 6.5-5.9l-2.7 2.7-2.6-.7-.7-2.6z"/>',
    relay:'<path d="M11 10.5a1.5 1.5 0 1 1 2 1.4V21h-2v-9.1a1.5 1.5 0 0 1 0-1.4zM7.8 6.8l1.4 1.4a4 4 0 0 0 0 5.6l-1.4 1.4a6 6 0 0 1 0-8.4zm8.4 0a6 6 0 0 1 0 8.4l-1.4-1.4a4 4 0 0 0 0-5.6zM5 4l1.4 1.4a8 8 0 0 0 0 11.2L5 18A10 10 0 0 1 5 4zm14 0a10 10 0 0 1 0 14l-1.4-1.4a8 8 0 0 0 0-11.2z"/>'};
  var RIM={1:['#ffd2a6','#cd7f32','#5c3310'],2:['#ffffff','#b8c0c8','#4a525a'],3:['#fff1b8','#d4a017','#7a5a06'],0:['#8a8f96','#4b5058','#24272c']};
  function tier(n){ return n>=25?3:n>=10?2:n>=3?1:0 } var TN=['Not earned yet','Bronze','Silver','Gold'], gid=0;
  function shield(k,n,px){ var b=BD.filter(function(x){ return x[0]===k })[0], t=tier(n||0), r=RIM[t], g='rb'+(++gid), l=t?b[3]:'#6b7078', d=t?b[4]:'#3a3e44';
    return '<svg viewBox="0 0 64 64" width="'+px+'" height="'+px+'" aria-label="'+b[1]+' '+TN[t]+'" role="img"><defs><linearGradient id="'+g+'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+r[0]+'"/><stop offset=".45" stop-color="'+r[1]+'"/><stop offset="1" stop-color="'+r[2]+'"/></linearGradient><linearGradient id="'+g+'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+l+'"/><stop offset="1" stop-color="'+d+'"/></linearGradient><linearGradient id="'+g+'c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>'+
      '<path d="M32 3 56 11v19c0 15-10 25-24 31C18 55 8 45 8 30V11z" fill="url(#'+g+'a)"/><path d="M32 8 51 14.5V30c0 12-8 20.5-19 25.5C21 50.5 13 42 13 30V14.5z" fill="url(#'+g+'b)" stroke="#000" stroke-opacity=".3"/>'+
      '<g transform="translate(17 15) scale(1.25)" fill="#fff"'+(t?'':' opacity=".55"')+'>'+BIC[k]+'</g><path d="M32 8 51 14.5V24C40 21 24 21 13 24v-9.5z" fill="url(#'+g+'c)"/></svg>' }

  // the app builder's own badge (only Josh Singer's account): gold coin, rainbow rim, diamond, CREATOR
  function founder(px){ var g='fd'+(++gid), r=''; for(var i=0;i<36;i++) r+='<rect x="31" y="1.5" width="2" height="4" rx="1" fill="url(#'+g+'d)" transform="rotate('+(i*10)+' 32 32)"/>';
    return '<svg viewBox="0 0 64 64" width="'+px+'" height="'+px+'" role="img" aria-label="Founder of AwareBC" class="rlfd"><defs><linearGradient id="'+g+'h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset=".35" stop-color="#c084fc"/><stop offset=".7" stop-color="#f472b6"/><stop offset="1" stop-color="#fde047"/></linearGradient><linearGradient id="'+g+'m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0f9ff"/><stop offset=".55" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0284c7"/></linearGradient><linearGradient id="'+g+'d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c2"/><stop offset=".45" stop-color="#e3b021"/><stop offset="1" stop-color="#7a5306"/></linearGradient><radialGradient id="'+g+'f" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#22262c"/><stop offset="1" stop-color="#030304"/></radialGradient><path id="'+g+'a" d="M14.5 33a17.5 17.5 0 0 0 35 0"/></defs>'+r+
      '<circle cx="32" cy="32" r="27" fill="url(#'+g+'h)"/><circle cx="32" cy="32" r="24.5" fill="url(#'+g+'d)"/><circle cx="32" cy="32" r="22" fill="url(#'+g+'f)"/><g transform="translate(32 23) scale(.88)"><path d="M-12 -6h24l6 7-18 18-18-18z" fill="url(#'+g+'m)" stroke="#fff" stroke-width="1"/><path d="M-12 -6l6 7h12l6-7M-18 1h36M-6 1l6 18 6-18" fill="none" stroke="#fff" stroke-width=".8" opacity=".85"/><path d="M-9 -4l3 4" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".9"/></g>'+
      '<path d="M48 14l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#fff"/><path d="M15 21l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" fill="#fff" opacity=".85"/>'+(px>=40?'<text font-family="system-ui" font-weight="900" font-size="5.6" letter-spacing="1.3" fill="url(#'+g+'h)"><textPath href="#'+g+'a" startOffset="50%" text-anchor="middle">CREATOR</textPath></text>':'')+'</svg>' }

  // ---------- mini profile: tap any rider's vehicle (Rig Link rigs, friends on the map) ----------
  var MP=null, mpo=null;
  var mpj=null;
  function mini(tg,o){ o=o||{}; mpo=o; mpo.tg=tg; if(!MP){ MP=document.createElement('div'); MP.id='rlmp'; MP.hidden=true; MP.setAttribute('role','dialog'); MP.setAttribute('aria-label','Rider'); document.body.appendChild(MP);
      MP.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('[data-m]'); if(e.target===MP){ MP.hidden=true; return } if(!b) return; var a=b.getAttribute('data-m');
        if(a==='x'){ MP.hidden=true; return }
        if(a==='add'){ if(!needName()) return; var F2=window.__frApi; if(!F2||!F2.request) return; b.disabled=true; b.textContent='Sending…';
          F2.request(mpo.tg,(mpj&&mpj.n)||mpo.n||'').then(function(m){ b.textContent='⏳ Request sent'; b.className='rlbt'; toast(m) },function(err){ b.disabled=false; b.textContent='➕ Add friend'; toast(err.message) }); return }
        if(a==='chat'){ MP.hidden=true; if(window.__frApi) window.__frApi.chatTag(mpo.tg,''); return }
        if(a==='go'){ MP.hidden=true; if(X&&!X.hidden) close(); var ll=L.latLng(mpo.lat,mpo.lon); if(window.__nav) window.__nav.to(ll,mpo.n||'Rider'); else MAP.flyTo(ll,15); return }
        if(a==='full'){ MP.hidden=true; if(X&&!X.hidden) profile(mpo.tg); return } }) }
    paintMini(o.n?{n:o.n,t:tg,bd:{},tags:[],rig:o.rig||'',wait:1}:{n:'Rider',t:tg,bd:{},tags:[],rig:'',wait:1}); MP.hidden=false;
    if(navigator.onLine===false){ paintMini({n:o.n||'Rider',t:tg,bd:{},tags:[],rig:o.rig||'',off:1}); return }
    api({op:'prof',tg:tg}).then(function(j){ if(mpo.tg===tg) paintMini(j) }).catch(function(){ if(mpo.tg===tg) paintMini({n:o.n||'Rider',t:tg,bd:{},tags:[],rig:o.rig||'',off:1}) }) }
  function paintMini(j){ mpj=j; var o=mpo||{}, fr=window.__frApi&&window.__frApi.isFriend&&window.__frApi.isFriend(j.t), earned=BD.filter(function(b){ return tier((j.bd||{})[b[0]]||0) });
    var p=me(), d=isFinite(o.lat)&&p.real?kmT(km(p.lat,p.lon,o.lat,o.lon))+' away':'';
    var h='<div class="mpin"><div class="mphd">'+(j.fd?founder(60):'<span class="rlav big" style="background:'+col(j.n+j.t)+'">'+ini(j.n)+'</span>')+'<div class="mpt"><b>'+esc(j.n)+(j.t?' <small>#'+esc(j.t)+'</small>':'')+'</b>'+(j.fd?'<div class="rlfdt">FOUNDER OF AWAREBC</div>':'')+
      '<small>'+[o.rig||j.rig?'🚙 '+esc(o.rig||j.rig):'',o.sub?esc(o.sub):'',d].filter(Boolean).join(' · ')+'</small></div><button type="button" class="rlx" data-m="x" aria-label="Close">✕</button></div>';
    h+=earned.length?'<div class="mpbd">'+earned.map(function(b){ var n=j.bd[b[0]]; return '<div>'+shield(b[0],n,40)+'<small>'+b[1]+'<br>'+TN[tier(n)]+'</small></div>' }).join('')+'</div>':'<div class="rlsm" style="margin:6px 0">'+(j.wait?'Loading badges…':j.off?'No signal: badges show when you’re back online.':'No badges yet.')+'</div>';
    if(j.tags&&j.tags.length) h+='<div class="rltel" style="padding:0 0 4px">'+j.tags.slice(0,5).map(function(x){ return '<span>'+esc(x)+'</span>' }).join('')+'</div>';
    h+='<div class="rlact" style="padding:8px 0 0">'+(j.me?'':fr?'<button type="button" class="rlbt b" data-m="chat">💬 Chat</button>':window.__frApi&&window.__frApi.sent&&window.__frApi.sent(j.t)?'<button type="button" class="rlbt" disabled>⏳ Request sent</button>':'<button type="button" class="rlbt g" data-m="add">➕ Add friend</button>')+(isFinite(o.lat)&&!j.me?'<button type="button" class="rlbt" data-m="go">🧭 Directions</button>':'')+(X&&!X.hidden?'<button type="button" class="rlbt" data-m="full">Full profile</button>':'')+'</div></div>';
    MP.innerHTML=h }
  window.__rlMini=mini;

  // ---------- Nearby riders (Off-road, always on): see and be seen within about 60 km, approximate (about 1 km) or exact spot ----------
  (function(){ var NL=L.layerGroup().addTo(MAP), nT=null, NK='aw-near';
    function on(){ return true }
    function exact(){ return ls(NK)==='e' }
    // the first time, say so plainly and offer to turn it off
    function told(){ if(ls('aw-nearnote2')) return; ls('aw-nearnote2','1'); var d=document.createElement('div'); d.className='nrnote'; d.setAttribute('role','status');
      d.innerHTML='<b>🚙 Nearby riders</b><span>Riders within about 60 km see your rig on the Off-road map, and you see theirs. Pick how close: Approximate (about 1 km) or Exact.</span><div><button type="button" data-v="a" class="ok">Approximate</button><button type="button" data-v="e">Exact</button></div>';
      d.onclick=function(e){ var b=e.target.closest&&e.target.closest('[data-v]'); if(!b) return; window.__rlNear.set(b.getAttribute('data-v')); d.remove() }; document.body.appendChild(d) }
    function clear(){ NL.clearLayers() }
    // main map (Off-road): your convoy's rigs (exact spot when they share it) and nearby riders who chose to be seen (rough spot)
    function tick(){ clearTimeout(nT); nT=setTimeout(tick,60000); var ck=ls('aw-rlkey')||''; if((!on()&&!ck)||!offRoad()||document.hidden||navigator.onLine===false){ if(!offRoad()||(!on()&&!ck)) clear(); return }
      var p=me(); if(!p.real) return; var rig=ls('aw-rlrig')||''; if(on()) told();
      Promise.all([ck?api({op:'crigs',key:ck,lat:p.lat,lon:p.lon,share:ls('aw-rlshare')==='1'?1:0,rig:rig}).catch(function(){ return {r:[]} }):Promise.resolve({r:[]}),
        api({op:'near',lat:p.lat,lon:p.lon,share:1,ex:exact()?1:0,rig:rig}).catch(function(){ return {r:[]} })]).then(function(J){ clear(); if(!offRoad()) return; var shown={};
        function put(r,cv){ if(shown[r.tg]||(window.__frApi&&window.__frApi.isFriend(r.tg))) return; shown[r.tg]=1; // friends already show with their exact spot
          L.marker([r.lat,r.lon],{icon:L.divIcon({className:'',html:'<span class="nrmk'+(r.fd?' fd':'')+(cv?' cv':'')+'" role="button" aria-label="'+esc(r.by)+'">🚙<small>'+esc(r.by)+'</small></span>',iconSize:[0,0]}),zIndexOffset:850})
            .on('click',function(){ mini(r.tg,{n:r.by,rig:r.rig,lat:r.lat,lon:r.lon,sub:(cv?'Convoy '+ck+' · ':r.ex?'Nearby rider · ':'Nearby rider · about 1 km · ')+ago(r.at)}) }).addTo(NL) }
        (J[0].r||[]).forEach(function(r){ put(r,true) }); (J[1].r||[]).forEach(function(r){ put(r,false) }) }) }
    window.__rlNear={ tick:function(){ setTimeout(tick,50) }, on:on, exact:exact, set:function(v){ ls(NK,v==='e'?'e':'a'); var s=document.getElementById('s_near'); if(s) s.value=exact()?'e':'a'; tick() } };
    function stop(){ clear(); var p=me(); if(navigator.onLine!==false) api({op:'near',lat:p.lat,lon:p.lon,share:0}).catch(function(){}) }
    document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('.seg button')) setTimeout(function(){ if(offRoad()) tick(); else clear() },80) },true);
    setTimeout(tick,6000);
    // Settings ▸ Off-road ▸ Nearby riders
    var f=document.createElement('details'); f.className='folder'; f.id='nrfolder';
    f.innerHTML='<summary>Nearby riders</summary><label class="setrow">My spot<select id="s_near"><option value="a">Approximate</option><option value="e">Exact</option></select></label><div class="fhelp">Off-road only. Always on in Off-road. Riders within about 60 km show as 🚙, and you show to them. You see each other within about 60 km, and only a rough spot is shared. Friends show anywhere: Friends ▸ Share my spot.</div>';
    var host=document.getElementById('mtfolder'); if(host&&host.parentNode) host.parentNode.insertBefore(f,host.nextSibling);
    var sel=f.querySelector('select'); sel.value=exact()?'e':'a'; sel.onchange=function(){ window.__rlNear.set(sel.value); toast(sel.value==='e'?'Nearby riders see your exact spot':'Nearby riders see your spot to about 1 km') };
    var st=document.createElement('style'); st.textContent='.nrrow{display:flex;flex-direction:column;gap:6px;font-weight:700}.nrseg{display:flex;gap:6px;width:100%}.nrseg button{flex:1;height:36px;border:0;border-radius:18px;background:#2c2c2e;color:#fff;font:700 13.5px var(--font,system-ui)}.nrseg button.on{background:#fff;color:#000}.nrnote{position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 90px);z-index:5600;background:#1c1c1e;color:#fff;border-radius:16px;padding:12px 14px;box-shadow:0 6px 24px rgba(0,0,0,.5);font:13.5px var(--font,system-ui);display:flex;flex-direction:column;gap:6px}.nrnote b{font-size:15px}.nrnote span{color:#c7c7cc;line-height:1.35}.nrnote div{display:flex;gap:8px;margin-top:4px}.nrnote button{flex:1;height:38px;border:0;border-radius:19px;background:#2c2c2e;color:#fff;font:700 14px var(--font,system-ui)}.nrnote button.ok{background:#30d158;color:#000}.nrmk{display:inline-flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%);font-size:22px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,.8));cursor:pointer}.nrmk small{margin-top:2px;font:700 10px var(--font,system-ui);color:#fff;background:rgba(17,17,17,.85);padding:1px 5px;border-radius:7px;white-space:nowrap}.nrmk.fd small{color:#fcd34d}.nrmk.cv small{background:#14532d;color:#bbf7d0}'; document.head.appendChild(st) })();
  function minis(bd){ var a=BD.map(function(b){ return [b[0],(bd||{})[b[0]]||0] }).filter(function(x){ return tier(x[1]) }).sort(function(p,q){ return q[1]-p[1] }).slice(0,3);
    return a.length?'<span class="rlmini">'+a.map(function(x){ return shield(x[0],x[1],17) }).join('')+'</span>':'' }
  function profile(tg){ sheet('<div class="rlsm">Loading rider…</div>'+closeBt()); api({op:'prof',tg:tg||''}).then(function(j){
      var h='<div class="rlprof">'+(j.fd?founder(72):'<span class="rlav big" style="background:'+col(j.n+j.t)+'">'+ini(j.n)+'</span>')+'<div><h3>'+esc(j.n)+' <small>#'+esc(j.t)+'</small></h3>'+(j.fd?'<div class="rlfdt">FOUNDER OF AWAREBC</div>':'')+'<div class="rlsm">'+(j.rig?'🚙 '+esc(j.rig)+' · ':'')+j.posts+' post'+(j.posts===1?'':'s')+'</div></div></div>';
      if(j.tags&&j.tags.length) h+='<div class="rltel" style="padding:0 0 6px">'+j.tags.map(function(x){ return '<span>'+esc(x)+'</span>' }).join('')+'</div>';
      h+='<h4>Badges</h4><div class="rlbdg">'+BD.map(function(b){ var n=(j.bd||{})[b[0]]||0, t=tier(n), nx=t===3?0:[3,10,25][t];
        return '<div class="rlbd'+(t?'':' off')+'">'+shield(b[0],n,58)+'<b>'+b[1]+'</b><small>'+TN[t]+(j.me&&nx?' · '+n+'/'+nx:'')+'</small></div>' }).join('')+'</div>';
      if(j.me) h+='<div class="rlsm" style="margin-top:6px">'+BD.map(function(b){ return '<b>'+b[1]+':</b> '+b[2] }).join(' · ')+'. Bronze 3 · Silver 10 · Gold 25.</div>';
      if(j.me) checkNew(j.bd);
      sheet(h+closeBt()) }).catch(function(e){ sheet('<div class="rlsm">'+esc(e.message)+'</div>'+closeBt()) }) }
  function checkNew(bd){ var old=lj('aw-rlbd',null), now={}; BD.forEach(function(b){ now[b[0]]=tier((bd||{})[b[0]]||0) }); ls('aw-rlbd',JSON.stringify(now)); if(!old) return;
    BD.forEach(function(b){ if(now[b[0]]>(old[b[0]]||0)) toast('🏅 New badge: '+b[1]+' '+TN[now[b[0]]]+'!') }) }

  // ---------- the button (Off road only) ----------
  var btn=document.createElement('button'); btn.type='button'; btn.id='rlbtn'; btn.className='sidebtn'; btn.setAttribute('data-l','Rig Link'); btn.setAttribute('aria-label','Rig Link: off-road feed and convoys');
  btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" style="width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M9 7a4 4 0 0 1 6 0M6.5 4.5a8 8 0 0 1 11 0"/><circle cx="12" cy="10.5" r="1.4" fill="currentColor"/><path d="M12 12v4M4 20l3-4h10l3 4z"/></svg>';
  document.body.appendChild(btn); btn.onclick=function(){ open() };

  // ---------- state ----------
  var X=null, mm=null, pinL=null, rigL=null, posts=[], rigs=[], nRigs=0, filt='', key=ls('aw-rlkey')||'', pub=!key, big=false, refT=null, region='', busy=false, cmFor=null;
  function curKey(){ return pub?'':key }

  function open(){ if(!offRoad()) return; if(!X) build(); X.hidden=false; if(navigator.onLine!==false) api({op:'prof',tg:''}).then(function(j){ checkNew(j.bd) }).catch(function(){}); document.body.classList.add('rlon'); setTimeout(function(){ mm.invalidateSize(); centerMe() },60); paintTop(); load(); clearInterval(refT); refT=setInterval(function(){ if(!X.hidden&&!document.hidden) load(true) },30000); flushQ() }
  function close(){ if(!X) return; X.hidden=true; document.body.classList.remove('rlon'); clearInterval(refT); stopRec() }
  document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('.seg button')) setTimeout(function(){ if(!offRoad()) close() },50) },true);

  function build(){
    X=document.createElement('div'); X.id='rlx'; X.hidden=true; X.setAttribute('role','dialog'); X.setAttribute('aria-label','Rig Link');
    X.innerHTML='<div class="rlhd"><div class="rlt"><b id="rlreg">Off-road layer</b><small id="rlsub"></small></div><span class="rlrig" id="rlrig">● 0 rigs</span><button type="button" class="rlx" data-a="badges" aria-label="My badges">🛡️</button><button type="button" class="rlx rlfr" data-a="friends" aria-label="Friends and chat">👥<em id="rlun" hidden></em></button><button type="button" class="rlx" data-a="close" aria-label="Close Rig Link">✕</button></div>'+
      '<div class="rltog" role="tablist"><button type="button" data-a="pub" role="tab">🌍 Public Layer</button><button type="button" data-a="key" role="tab">🔒 Private Key Lobby</button></div>'+
      '<div id="rllobby"></div>'+
      '<div class="rlmap" id="rlmap"><div class="rlmb"><button type="button" data-a="me" aria-label="Center on me">◎</button><button type="button" data-a="big" aria-label="Bigger map">⤢</button></div></div>'+
      '<div class="rlchips" id="rlchips"></div>'+
      '<div class="rlfl"><button type="button" data-f="">All</button><button type="button" data-f="r">Rigs</button><button type="button" data-f="c">Trail Conditions</button><button type="button" data-f="h">Help</button></div>'+
      '<div class="rlfeed" id="rlfeed"></div>'+
      '<div class="rlbar"><button type="button" data-a="photo"><i>📷</i>Post Photo</button><button type="button" data-a="alert"><i>⚠️</i>Drop Alert</button><button type="button" class="ptt" id="rlptt"><i>🎙️</i>Hold to Talk</button><button type="button" data-a="note"><i>💬</i>Quick Note</button></div>'+
      '<div class="rlsheet" id="rlsh" hidden></div><div class="rlrec" id="rlrec" hidden><b>🎙️ Recording…</b><span id="rlrect">0:00</span><small>Let go to send · slide away to cancel</small></div>';
    document.body.appendChild(X);
    mm=L.map('rlmap',{zoomControl:false,rotate:false,rotateControl:false,touchRotate:false,attributionControl:true,minZoom:5,maxZoom:17}).setView([49.5,-120],10);
    // (no tiles: Rig Link's own map is hidden; rigs, posts and hazards show on the main map)
    pinL=L.layerGroup().addTo(mm); rigL=L.layerGroup().addTo(mm);
    X.addEventListener('click',click); X.addEventListener('submit',submit);
    var ptt=X.querySelector('#rlptt'); ptt.addEventListener('pointerdown',function(e){ e.preventDefault(); startRec() }); ptt.addEventListener('pointerup',function(){ stopRec(true) }); ptt.addEventListener('pointerleave',function(){ stopRec(false) }); ptt.addEventListener('contextmenu',function(e){ e.preventDefault() });
  }
  function centerMe(){ var p=me(); mm.setView([p.lat,p.lon],posts.length?10:11) }
  function paintTop(){ var t=X.querySelectorAll('.rltog button'); t[0].className=pub?'on':''; t[1].className=!pub?'lk':''; t[1].textContent=!pub?'🔒 '+key+' unlocked':'🔒 Private Key Lobby';
    X.querySelector('#rlsub').textContent=pub?'Off-road layer · public feed':'Off-road layer · 🔒 convoy '+key; X.querySelector('#rlrig').textContent='● '+nRigs+' rig'+(nRigs===1?'':'s');
    [].forEach.call(X.querySelectorAll('.rlfl button'),function(b){ b.className=b.getAttribute('data-f')===filt?'on':'' });
    X.querySelector('#rlmap').classList.toggle('big',big); lobby(); chips() }
  function lobby(){ var el=X.querySelector('#rllobby'), sh=ls('aw-rlshare')==='1';
    var nEx=window.__rlNear&&window.__rlNear.exact(), nr='<div class="rlrow nrrow"><span>My rig to riders within 60 km:</span><div class="nrseg"><button type="button" data-a="near" data-v="a"'+(nEx?'':' class="on"')+'>Approximate</button><button type="button" data-a="near" data-v="e"'+(nEx?' class="on"':'')+'>Exact</button></div></div>';
    if(pub){ el.innerHTML=nr; return }
    if(pub||!key){ el.innerHTML=!pub&&!key?'<form class="rlkey" data-f="join"><input maxlength="8" placeholder="#884-BCR" aria-label="Convoy key" autocapitalize="characters" autocomplete="off"><button type="submit" class="rlbt b">Unlock</button><button type="button" class="rlbt" data-a="mkkey">New convoy</button></form><div class="rlsm">A key unlocks a convoy’s private posts, hidden waypoints and live rig spots. Only share it with your crew.</div>':''; return }
    el.innerHTML='<div class="rlrow"><button type="button" class="rlsw'+(sh?' on':'')+'" data-a="share"><i></i>Share my rig’s spot with this convoy</button><button type="button" class="rllink" data-a="sendkey">Send to friend</button><button type="button" class="rllink" data-a="showkey">Key</button><button type="button" class="rllink red" data-a="leave">Leave</button></div>'+(X._showKey?'<input class="rlkeyshow" readonly value="'+esc(key)+'" aria-label="Convoy key to share">':'') }
  function chips(){ var el=X.querySelector('#rlchips'); if(pub||!rigs.length){ el.innerHTML=''; el.hidden=true; return } var p=me(); el.hidden=false;
    el.innerHTML=rigs.slice(0,8).map(function(r,i){ var old=Date.now()-r.at>10*60000; return '<button type="button" data-rig="'+i+'"><i style="background:'+(old?'#f59e0b':'#22c55e')+'"></i>'+esc(r.by)+' · '+(p.real?kmT(km(p.lat,p.lon,r.lat,r.lon)):ago(r.at))+'</button>' }).join('') }
  function kmT(k){ return k<10?k.toFixed(1)+' km':Math.round(k)+' km' }

  // ---------- feed ----------
  function load(quiet){ if(busy) return; busy=true; var p=me(), fe=X.querySelector('#rlfeed'); if(!quiet&&!posts.length) fe.innerHTML='<div class="rlnone">Loading the trail feed…</div>';
    regionName(p.lat,p.lon);
    var b={op:'feed',lat:p.lat,lon:p.lon,f:filt,here:1,rig:ls('aw-rlrig')||''}; if(curKey()){ b.key=curKey(); b.share=ls('aw-rlshare')==='1'&&p.real?1:0 }
    api(b).then(function(j){ posts=j.p||[]; rigs=j.rigs||[]; nRigs=j.n||0; try{ ls('aw-rlc-'+(curKey()||'pub'),JSON.stringify(posts.slice(0,30))) }catch(e){} draw() })
      .catch(function(e){ if(e.message==='No convoy with that key.'){ key=''; ls('aw-rlkey',null); pub=true; toast('That convoy key no longer works.') }
        posts=lj('aw-rlc-'+(curKey()||'pub'),[]); if(filt) posts=posts.filter(function(x){ return x.kind===filt }); draw(navigator.onLine===false?'📵 No signal: showing the last saved feed. Your posts wait on this phone and go out by themselves.':'Could not load the feed: '+e.message) })
      .then(function(){ busy=false; paintTop() }) }
  function draw(note){ var fe=X.querySelector('#rlfeed'), q=lj('aw-rlq',[]).filter(function(x){ return (x.key||'')===curKey() });
    var h=note?'<div class="rlnote">'+esc(note)+'</div>':'';
    h+=q.map(function(x){ return '<div class="rlcd pend"><div class="rltx">⏳ Waiting for signal: '+esc(x.x||ST[x.st]||(x.au?'voice clip':x.img?'photo':'post'))+'</div><div class="rlact"><button type="button" class="rlbt sm" data-a="qx" data-m="'+esc(x.mid||'')+'">↩ Unsend</button></div></div>' }).join('');
    h+=posts.length?posts.map(card).join(''):'<div class="rlnone">'+(pub?'No posts in this area yet. Be the first: drop an alert or post a photo.':'No convoy posts yet. Anything you post with Key-Only shows here.')+'</div>';
    fe.innerHTML=h; pins() }
  function card(p,i){ var k=KIND[p.kind]||KIND.h, h='<div class="rlcd" data-i="'+i+'"><div class="rltop"><span class="rlav" data-a="prof" style="background:'+col(p.by+p.tg)+'">'+ini(p.by)+'</span><div><b data-a="prof">'+esc(p.by)+' <small>#'+esc(p.tg)+'</small>'+(p.fd?founder(22):'')+minis(p.bd)+'</b><small>'+ago(p.t)+(p.st?' · '+esc(ST[p.st]||p.st):'')+(p.rb?' · 📡 relayed by '+esc(p.rb)+(p.uc?' · not yet confirmed by the poster':''):'')+'</small></div><span class="rltag" style="background:'+k[2]+';color:'+k[3]+'">'+k[0]+'</span></div>';
    if(p.img) h+='<img class="rlimg" loading="lazy" alt="" src="'+RS+'/rlm/'+esc(p.img)+'t" data-full="'+esc(p.img)+'">';
    if(p.kind==='r'&&p.rig) h+='<div class="rlbadge">🚙 '+esc(p.rig)+'</div>';
    var tel=[]; if(p.el!=null) tel.push('⛰ '+Math.round(p.el).toLocaleString()+' m'); if(p.tc!=null) tel.push('🌡 '+Math.round(p.tc)+' °C'); (p.tags||[]).forEach(function(t){ tel.push(esc(t)) }); if(p.radio&&!(p.tags||[]).some(function(t){ return t.toLowerCase()===p.radio.toLowerCase() })) tel.push('📻 '+esc(p.radio));
    if(tel.length) h+='<div class="rltel">'+tel.map(function(t){ return '<span>'+t+'</span>' }).join('')+'</div>';
    if(p.au) h+='<div class="rlau"><audio controls preload="none" src="'+RS+'/rlm/'+esc(p.au)+'"></audio><small>'+(p.aud?p.aud+' s':'')+'</small></div>';
    if(p.x) h+='<div class="rltx">'+esc(p.x)+'</div>';
    (p.cm||[]).forEach(function(c){ var q=c.q&&!c.ans; h+='<div class="rlcm'+(q?' q':'')+'">'+(q?'<b>? Question:</b> ':'<b>'+esc(c.by)+(c.fd?founder(16):'')+':</b> ')+esc(c.x)+(q?' <small>· unanswered</small>':'')+'</div>' });
    if(p.kind==='c'&&(p.st==='tree'||p.st==='hazard')) h+=p.cb?'<div class="rlclr">🪚 Cleared by '+esc(p.cb)+(p.cfm?' · confirmed by '+p.cfm:'')+(!p.cbme&&!p.cfmd?' <button type="button" class="rlbt g sm" data-a="cfm">✓ Confirm cleared</button>':'')+'</div>':'<div class="rlclr"><button type="button" class="rlbt sm" data-a="clear">🪚 I cleared it</button><small>Earns the Sawyer badge once another rider confirms.</small></div>';
    var acts=p.kind==='c'?'<button type="button" class="rlbt g" data-a="verify"'+(p.verd?' disabled':'')+'>✓ '+(p.verd?'Verified':'Verify')+(p.ver?' ('+p.ver+')':'')+'</button><button type="button" class="rlbt b" data-a="fly">🎯 Fly to Pin</button>'
      :p.kind==='r'?'<button type="button" class="rlbt" data-a="inspect">🔧 Inspect Rig</button><button type="button" class="rlbt y" data-a="reqkey">🔑 Request Key</button>'
      :'<button type="button" class="rlbt y" data-a="hail">📻 Hail on Radio</button><button type="button" class="rlbt b" data-a="fly">🎯 Fly to Pin</button>';
    h+='<div class="rlact">'+acts+'</div><div class="rlsoc"><button type="button" data-a="like" class="'+(p.liked?'on':'')+'">♥ '+(p.likes||0)+'</button><button type="button" data-a="cmts">💬 '+(p.nc||0)+'</button><button type="button" data-a="ask">? Question</button>'+(p.me?'<button type="button" data-a="del" class="rd">Delete</button>':'<button type="button" data-a="flag">⚑</button>')+'</div></div>';
    return h }
  function pins(){ pinL.clearLayers(); rigL.clearLayers();
    posts.forEach(function(p,i){ var k=KIND[p.kind]||KIND.h; L.marker([p.lat,p.lon],{icon:L.divIcon({className:'',html:'<span class="rlpin" style="background:'+k[1]+'">'+(p.kind==='c'?'⚠':p.kind==='r'?'🚙':p.au?'🎙':'💬')+'</span>',iconSize:[0,0]})}).on('click',function(){ focusCard(i) }).addTo(pinL) });
    rigs.forEach(function(r){ L.marker([r.lat,r.lon],{icon:L.divIcon({className:'',html:'<span class="rlpin rig" role="button" aria-label="'+esc(r.by)+'">🚙</span>',iconSize:[0,0]})}).on('click',function(){ mini(r.tg,{n:r.by,rig:r.rig,lat:r.lat,lon:r.lon,sub:'spot '+ago(r.at)}) }).addTo(rigL) });
    var p=me(); L.circleMarker([p.lat,p.lon],{radius:7,color:'#fff',weight:2,fillColor:'#ff3b30',fillOpacity:1}).addTo(rigL) }
  function focusCard(i){ var c=X.querySelector('.rlcd[data-i="'+i+'"]'); if(!c) return; c.scrollIntoView({behavior:'smooth',block:'start'}); c.classList.add('hi'); setTimeout(function(){ c.classList.remove('hi') },1500) }

  // ---------- taps ----------
  function click(e){ var t=e.target, b=t.closest&&t.closest('[data-a],[data-f],[data-rig],.rlcd,.rlimg'); if(!b) return;
    if(b.classList.contains('rlimg')){ sheet('<img src="'+RS+'/rlm/'+esc(b.getAttribute('data-full'))+'" alt="" style="width:100%;border-radius:12px">'+closeBt()); return }
    if(b.hasAttribute('data-f')&&b.closest('.rlfl')){ filt=b.getAttribute('data-f'); posts=[]; paintTop(); load(); return }
    if(b.hasAttribute('data-rig')){ var r=rigs[+b.getAttribute('data-rig')]; if(r){ close(); if(window.__goTo) window.__goTo(L.latLng(r.lat,r.lon),Math.max(MAP.getZoom(),14)); else MAP.flyTo([r.lat,r.lon],Math.max(MAP.getZoom(),14),{duration:1}); mini(r.tg,{n:r.by,rig:r.rig,lat:r.lat,lon:r.lon,sub:'spot '+ago(r.at)}) } return }
    var a=b.getAttribute('data-a'), cd=t.closest('.rlcd'), p=cd?posts[+cd.getAttribute('data-i')]:null;
    if(!a&&b.classList.contains('rlcd')) return;
    if(a==='qx'){ var mid=b.getAttribute('data-m'); var q=lj('aw-rlq',[]).filter(function(x){ return (x.mid||'')!==mid }); ls('aw-rlq',JSON.stringify(q)); if(mid&&window.__mesh) window.__mesh.recall(mid); toast('Unsent'); draw(); return }
    if(a==='close') return close();
    if(a==='badges') return profile('');
    if(a==='friends'){ if(window.__frApi) window.__frApi.send('',''); return }
    if(a==='sendkey'){ if(window.__frApi) window.__frApi.send('Join my Rig Link convoy: '+key+' (Off-road ▸ Rig Link ▸ Private Key Lobby)','Tap 💬 next to a friend to send convoy key '+key+'.'); return }
    if(a==='pub'){ pub=true; posts=[]; paintTop(); load(); return }
    if(a==='key'){ pub=false; posts=[]; paintTop(); if(key) load(); else { X.querySelector('#rlfeed').innerHTML=''; pins() } return }
    if(a==='mkkey'){ if(!needName()) return; api({op:'mkkey'}).then(function(j){ key=j.key; ls('aw-rlkey',key); X._showKey=true; posts=[]; paintTop(); load(); toast('Convoy '+key+' started. Share the key with your crew.') }).catch(function(e){ toast(e.message) }); return }
    if(a==='showkey'){ X._showKey=!X._showKey; lobby(); var ki=X.querySelector('.rlkeyshow'); if(ki){ ki.focus(); ki.select() } return }
    if(a==='leave'){ key=''; ls('aw-rlkey',null); pub=true; posts=[]; paintTop(); load(); if(window.__rlNear) window.__rlNear.tick(); return }
    if(a==='share'){ ls('aw-rlshare',ls('aw-rlshare')==='1'?'0':'1'); lobby(); load(true); if(window.__rlNear) window.__rlNear.tick(); return }
    if(a==='near'){ var nv=b.getAttribute('data-v'); window.__rlNear.set(nv); toast(nv==='e'?'Nearby riders see your exact spot':'Nearby riders see your spot to about 1 km'); lobby(); return }
    if(a==='me') return centerMe();
    if(a==='big'){ big=!big; paintTop(); setTimeout(function(){ mm.invalidateSize() },260); return }
    if(a==='photo') return compose('c');
    if(a==='alert') return alertSheet();
    if(a==='note') return noteSheet();
    if(a==='sx') return closeSheet();
    if(!p) return sheetClick(a,b);
    if(a==='fly'){ close(); var fz=Math.max(MAP.getZoom(),15); if(window.__goTo) window.__goTo(L.latLng(p.lat,p.lon),fz); else MAP.flyTo([p.lat,p.lon],fz,{duration:1.2}); MAP.once('moveend',function(){ if(window.__pin) window.__pin(L.latLng(p.lat,p.lon),(KIND[p.kind]||KIND.h)[0]==='TRAIL'?(ST[p.st]||'Trail condition'):p.by) }); return }
    if(a==='prof') return profile(p.tg);
    if(a==='clear'||a==='cfm'){ if(!needName()) return; api({op:a,id:p.id,key:curKey()||undefined}).then(function(){ toast(a==='clear'?'Marked cleared. When another rider confirms, you earn Sawyer.':'Confirmed. Thanks!'); load(true) }).catch(function(e){ toast(e.message) }); return }
    if(a==='verify'||a==='like'){ api({op:a,id:p.id,key:curKey()||undefined}).then(function(j){ if(a==='verify'){ p.ver=j.c; p.verd=true } else { p.likes=j.c; p.liked=j.on } draw() }).catch(function(e){ toast(e.message) }); return }
    if(a==='inspect'){ sheet('<h3>🚙 '+esc(p.rig||'Rig')+'</h3><div class="rlsm">'+esc(p.by)+' #'+esc(p.tg)+'</div>'+(p.tags&&p.tags.length?'<div class="rltel" style="padding:8px 0">'+p.tags.map(function(x){ return '<span>'+esc(x)+'</span>' }).join('')+'</div>':'')+
      '<h4>Gear & parts</h4><div class="rlparts">'+(p.parts?String(p.parts).split(/\s*[,;\n]\s*/).filter(Boolean).map(function(x){ return '<div>• '+esc(x)+'</div>' }).join(''):'<div class="rlsm">No parts list yet.</div>')+'</div>'+(p.radio?'<div class="rlsm" style="margin-top:8px">📻 Radio: '+esc(p.radio)+'</div>':'')+closeBt()); return }
    if(a==='reqkey'){ if(!needName()) return; if(p.me) return toast('That’s your own rig.'); if(window.__frApi&&window.__frApi.isFriend(p.tg)){ window.__frApi.chatTag(p.tg,'Hi '+p.by+', could I get your Rig Link convoy key?'); return }
      api({op:'cmt',id:p.id,x:'🔑 Would like your convoy key. '+(window.__frApi&&window.__frApi.tag()?'My Friends tag is #'+window.__frApi.tag()+': add me and send it in chat.':'Please send it to me in Friends chat.'),q:1,key:curKey()||undefined}).then(function(){ toast('Key request sent to '+p.by); load(true) }).catch(function(e){ toast(e.message) }); return }
    if(a==='hail'){ var ch=p.radio||'GMRS Ch. 16'; sheet('<h3>📻 Hail '+esc(p.by)+'</h3><div class="rlbig">'+esc(ch)+'</div><div class="rlsm">Say: “'+esc(p.by)+', '+esc(p.by)+', this is '+esc(name()||'your call sign')+' on Rig Link, over.” Listen first, keep it short. Backup: 2 m simplex 146.520 · CB Ch. 9 (emergency).</div>'+closeBt()); return }
    if(a==='cmts'||a==='ask'){ cmFor=p; comments(a==='ask'); return }
    if(a==='del'){ if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Tap again to delete'; return } api({op:'del',id:p.id,key:curKey()||undefined}).then(function(){ toast('Deleted'); load(true) }).catch(function(e){ toast(e.message) }); return }
    if(a==='flag'){ if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Tap again to report'; return } api({op:'flag',id:p.id,key:curKey()||undefined}).then(function(){ toast('Thanks. 3 reports hide a post.') }).catch(function(e){ toast(e.message) }); return } }
  function needName(){ if(name()) return true; toast('Add your name first (Friends ▸ your name).'); return false }

  // ---------- sheets: compose, alert, note, comments ----------
  function closeBt(){ return '<button type="button" class="rlbt wide" data-a="sx">Close</button>' }
  function sheet(h){ var s=X.querySelector('#rlsh'); s.innerHTML='<div class="rlsin">'+h+'</div>'; s.hidden=false }
  function closeSheet(){ var s=X.querySelector('#rlsh'); s.hidden=true; s.innerHTML=''; cmFor=null }
  var shot=null;
  function privacy(){ return '<div class="rlpriv"><button type="button" data-a="pv" data-v="pub" class="'+(curKey()?'':'on')+'">🌍 Public</button><button type="button" data-a="pv" data-v="key" class="'+(curKey()?'on':'')+'"'+(key?'':' disabled')+'>🔒 Key-Only'+(key?'':' (join a convoy)')+'</button></div><label class="rlchk"><input type="checkbox" id="rlhide"> Hide my exact GPS spot (rounds to about 1 km)</label>' }
  function compose(kind){ shot=null; sheet('<h3>📷 Post Photo</h3><div class="rlpriv"><button type="button" data-a="ck" data-v="c" class="'+(kind==='c'?'on':'')+'">Trail condition</button><button type="button" data-a="ck" data-v="r" class="'+(kind==='r'?'on':'')+'">Rig showcase</button></div>'+
      '<label class="rlpick"><input type="file" accept="image/*" capture="environment" id="rlfile" hidden><span id="rlprev">📷 Take or choose a photo</span></label>'+
      (kind==='r'?'<input id="rlveh" maxlength="40" placeholder="Vehicle, e.g. 2019 Tacoma" value="'+esc(ls('aw-rlrig')||'')+'"><input id="rltags" maxlength="160" placeholder="Build tags, e.g. 35&quot; Tires, Winch, Lift"><input id="rlradio" maxlength="40" placeholder="Radio, e.g. GMRS Ch. 16"><textarea id="rlparts" maxlength="1200" rows="2" placeholder="Full gear & parts list (comma separated)"></textarea>'
        :'<div class="rlpriv" id="rlsts">'+['hazard','snow','mud','tree','ok'].map(function(s){ return '<button type="button" data-a="pst" data-v="'+s+'">'+ST[s]+'</button>' }).join('')+'</div>')+
      '<textarea id="rltxt" maxlength="500" rows="2" placeholder="'+(kind==='r'?'Say something about your rig':'What’s the trail like?')+'"></textarea>'+privacy()+
      '<div class="rlact"><button type="button" class="rlbt" data-a="sx">Cancel</button><button type="button" class="rlbt b" data-a="send" data-k="'+kind+'">Post</button></div>');
    X._kind=kind; X._st=''; X.querySelector('#rlfile').onchange=function(){ var f=this.files&&this.files[0]; if(!f) return; X.querySelector('#rlprev').textContent='Shrinking photo…';
      shrink(f).then(function(s){ shot=s; X.querySelector('#rlprev').innerHTML='<img src="'+s.th+'" alt="" style="max-height:110px;border-radius:10px">' }).catch(function(){ X.querySelector('#rlprev').textContent='That photo could not be read.' }) } }
  function alertSheet(){ sheet('<h3>⚠️ Drop Alert</h3><div class="rlsm">Pins at your spot with elevation and temperature.</div><div class="rlgrid">'+['hazard','snow','recovery','tree','mud','ok'].map(function(s){ return '<button type="button" class="rlbig2" data-a="qa" data-v="'+s+'">'+ST[s]+'</button>' }).join('')+'</div><input id="rltxt" maxlength="200" placeholder="Short note (optional)">'+privacy()+closeBt()) }
  function noteSheet(){ sheet('<h3>💬 Quick Note</h3><textarea id="rltxt" maxlength="500" rows="3" placeholder="e.g. At the trailhead, anyone heading up the FSR?"></textarea>'+privacy()+'<div class="rlact"><button type="button" class="rlbt" data-a="sx">Cancel</button><button type="button" class="rlbt b" data-a="qn">Post</button></div>');
    setTimeout(function(){ var i=X.querySelector('#rltxt'); if(i) i.focus() },50) }
  function vis(){ if(!X.querySelector('.rlpriv [data-a=pv]')) return curKey(); var b=X.querySelector('.rlpriv [data-a=pv].on'); return b&&b.getAttribute('data-v')==='key'?key:'' }
  function sheetClick(a,b){
    if(a==='pv'||a==='ck'||a==='pst'){ if(b.disabled) return; if(a==='ck'){ compose(b.getAttribute('data-v')); return } [].forEach.call(b.parentNode.children,function(x){ x.classList.remove('on') }); b.classList.add('on'); if(a==='pst') X._st=b.getAttribute('data-v'); return }
    if(a==='send'){ if(!needName()) return; var kind=X._kind, x=val('#rltxt'); if(!shot&&!x&&!(kind==='r'&&val('#rlveh'))) return toast('Add a photo or a few words.');
      var o={kind:kind,x:x,st:X._st||'',img:shot&&shot.img,th:shot&&shot.th};
      if(kind==='r'){ o.rig=val('#rlveh'); o.tags=val('#rltags').split(',').map(function(s){ return s.trim() }).filter(Boolean); o.radio=val('#rlradio'); o.parts=val('#rlparts'); if(o.rig) ls('aw-rlrig',o.rig) }
      return send(o) }
    if(a==='qa'){ if(!needName()) return; var s=b.getAttribute('data-v'); return send({kind:s==='recovery'?'h':'c',st:s,x:val('#rltxt')}) }
    if(a==='qn'){ if(!needName()) return; var t=val('#rltxt'); if(!t) return toast('Type a note first.'); return send({kind:'h',x:t}) }
    if(a==='cq'){ b.classList.toggle('on'); return }
    if(a==='thank'){ if(!cmFor||b.disabled) return; api({op:'thank',id:cmFor.id,cid:+b.getAttribute('data-c'),b:b.getAttribute('data-b'),key:curKey()||undefined}).then(function(){ toast('Thanks given: it counts toward their '+(b.getAttribute('data-b')==='wrench'?'Wrench':'Recovery')+' badge.'); comments(false) }).catch(function(e){ toast(e.message) }); return }
    if(a==='ans'){ X._re=+b.getAttribute('data-c'); var i=X.querySelector('#rlcin'); i.placeholder='Your answer…'; i.focus(); return } }
  function val(s){ var e=X.querySelector(s); return e?e.value.trim():'' }

  // telemetry stamped on every post: elevation (GPS, or the terrain map) and air temperature (Open-Meteo)
  function telemetry(p){ var el=isFinite(p.alt)&&p.alt!=null?Promise.resolve(p.alt):(window.__elevAt?window.__elevAt(p.lat,p.lon).catch(function(){ return null }):Promise.resolve(null));
    var tc=navigator.onLine===false?Promise.resolve(null):fetch('https://api.open-meteo.com/v1/forecast?latitude='+p.lat.toFixed(3)+'&longitude='+p.lon.toFixed(3)+'&current=temperature_2m').then(function(r){ return r.json() }).then(function(j){ return j.current&&isFinite(j.current.temperature_2m)?j.current.temperature_2m:null }).catch(function(){ return null });
    return Promise.all([el,tc]) }
  function send(o){ o.mid=o.mid||(Date.now().toString(36)+Math.random().toString(36).slice(2,8)); var p=me(), k=vis(), hide=!!(X.querySelector('#rlhide')||{}).checked; closeSheet(); toast(p.real?'Posting…':'No GPS fix: posting at the map centre');
    telemetry(p).then(function(t){ var b=Object.assign({op:'post',lat:p.lat,lon:p.lon,hide:hide?1:0,el:t[0]!=null?Math.round(t[0]):undefined,tc:t[1]!=null?t[1]:undefined},o); if(k) b.key=k;
      return api(b).then(function(){ toast('Posted'); if((k||'')!==curKey()){ pub=!k; } posts=[]; load() }).catch(function(e){ if(navigator.onLine===false||/fetch|network|load failed/i.test(e.message)){ queue(b); if(!k&&!b.img&&!b.au&&window.__mesh&&window.__mesh.on()&&window.__frApi&&window.__frApi.tag()) window.__mesh.rlpost({mid:b.mid,kind:b.kind==='r'?'h':b.kind,st:b.st||'',x:b.x||'',lat:b.lat,lon:b.lon,el:b.el,tc:b.tc,by:name(),tg:window.__frApi.tag()}); toast('No signal: saved, it posts by itself'+(window.__mesh&&window.__mesh.on()?' (also passed to nearby phones)':'')) } else toast(e.message) }) }) }
  function queue(b){ var q=lj('aw-rlq',[]); q.push(b); while(q.length>5) q.shift(); try{ localStorage.setItem('aw-rlq',JSON.stringify(q)) }catch(e){ delete b.img; delete b.th; delete b.au; q[q.length-1]=b; try{ localStorage.setItem('aw-rlq',JSON.stringify(q)) }catch(x){} } if(X&&!X.hidden) draw() }
  var qb=false; function flushQ(){ var q=lj('aw-rlq',[]); if(!q.length||qb||navigator.onLine===false) return; qb=true; api(q[0]).then(function(){ q.shift(); ls('aw-rlq',JSON.stringify(q)); qb=false; toast('Saved Rig Link post sent'); if(X&&!X.hidden) load(true); flushQ() },function(e){ qb=false; if(!/fetch|network|load failed/i.test(e.message)){ q.shift(); ls('aw-rlq',JSON.stringify(q)) } }) }
  addEventListener('online',function(){ setTimeout(flushQ,3000) });

  function comments(ask){ var p=cmFor; sheet('<h3>💬 Comments</h3><div id="rlcl" class="rlcl"><div class="rlsm">Loading…</div></div><form class="rlkey" data-f="cmt"><input id="rlcin" maxlength="300" placeholder="'+(ask?'Ask a question…':'Add a comment…')+'" autocomplete="off"><button type="submit" class="rlbt b">Send</button></form><button type="button" class="rlqt'+(ask?' on':'')+'" data-a="cq">? Mark as a question (pins it to the top until answered)</button>'+closeBt());
    X._re=0; api({op:'cmts',id:p.id,key:curKey()||undefined}).then(function(j){ var el=X.querySelector('#rlcl'); if(!el) return; el.innerHTML=(j.c||[]).length?j.c.map(function(c){ var q=c.q&&!c.ans;
        var th=j.owner&&j.kind==='h'&&!c.me?'<div class="rlthk"><button type="button" class="rlbt sm'+(c.rec?' g':'')+'" data-a="thank" data-b="recovery" data-c="'+c.cid+'"'+(c.rec?' disabled':'')+'>🪝 '+(c.rec?'Thanked: pulled me out':'Pulled me out')+'</button><button type="button" class="rlbt sm'+(c.wr?' g':'')+'" data-a="thank" data-b="wrench" data-c="'+c.cid+'"'+(c.wr?' disabled':'')+'>🔧 '+(c.wr?'Thanked: fixed me':'Fixed me / lent a part')+'</button></div>':'';
        return '<div class="rlcm'+(q?' q':'')+'"><b>'+(c.q?(q?'? ':'✓ '):'')+esc(c.by)+' <small>#'+esc(c.tg)+' · '+ago(c.t)+'</small>'+(c.fd?founder(20):'')+minis(c.bd)+'</b><div>'+esc(c.x)+'</div>'+(q?'<button type="button" class="rllink" data-a="ans" data-c="'+c.cid+'">Answer</button>':'')+th+'</div>' }).join(''):'<div class="rlsm">No comments yet.</div>'; if(ask) X.querySelector('#rlcin').focus() }).catch(function(e){ var el=X.querySelector('#rlcl'); if(el) el.innerHTML='<div class="rlsm">'+esc(e.message)+'</div>' }) }
  function submit(e){ e.preventDefault(); var f=e.target, k=f.getAttribute('data-f'), i=f.querySelector('input');
    if(k==='join'){ var v=i.value.trim().toUpperCase(); if(!/^#?\d{3}-?[A-Z]{3}$/.test(v)) return toast('Keys look like #884-BCR'); api({op:'join',key:v}).then(function(j){ key=j.key; ls('aw-rlkey',key); pub=false; posts=[]; paintTop(); load(); if(window.__rlNear) window.__rlNear.tick(); toast('Convoy '+key+' unlocked') }).catch(function(e){ toast(e.message) }); return }
    if(k==='cmt'){ if(!needName()||!cmFor) return; var x=i.value.trim(); if(!x) return; var q=X.querySelector('.rlqt.on')&&!X._re?1:0;
      api({op:'cmt',id:cmFor.id,x:x,q:q,re:X._re||undefined,key:curKey()||undefined}).then(function(){ cmFor.nc=(cmFor.nc||0)+1; comments(false); load(true) }).catch(function(e){ toast(e.message) }) } }

  // ---------- photos (shrunk on the phone) and push-to-talk ----------
  function shrink(f){ return new Promise(function(res,rej){ var u=URL.createObjectURL(f), im=new Image(); im.onload=function(){ function at(max,q){ var s=Math.min(1,max/Math.max(im.width,im.height)), c=document.createElement('canvas'); c.width=Math.round(im.width*s); c.height=Math.round(im.height*s); c.getContext('2d').drawImage(im,0,0,c.width,c.height); return c.toDataURL('image/jpeg',q) }
      var big=at(1280,.72); if(big.length>420000) big=at(1024,.6); if(big.length>420000) big=at(800,.55); var th=at(420,.6); if(th.length>52000) th=at(320,.5); URL.revokeObjectURL(u); res({img:big,th:th}) }; im.onerror=rej; im.src=u }) }
  var rec=null, chunks=[], recT=null, recAt=0, recOk=false;
  function startRec(){ if(!needName()) return; if(!navigator.mediaDevices||!window.MediaRecorder) return toast('Voice notes are not supported on this phone.');
    navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){ var mt=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4'].filter(function(m){ return MediaRecorder.isTypeSupported(m) })[0];
      rec=new MediaRecorder(st,mt?{mimeType:mt,audioBitsPerSecond:24000}:{audioBitsPerSecond:24000}); chunks=[]; recOk=false; rec.ondataavailable=function(e){ if(e.data.size) chunks.push(e.data) };
      rec.onstop=function(){ st.getTracks().forEach(function(t){ t.stop() }); var secs=Math.round((Date.now()-recAt)/1000); X.querySelector('#rlrec').hidden=true; clearInterval(recT); if(!recOk||secs<1) return;
        var bl=new Blob(chunks,{type:(rec.mimeType||'audio/webm').split(';')[0]}), fr=new FileReader(); fr.onload=function(){ send({kind:'h',au:String(fr.result).replace(/^data:([^;,]+)(;[^,]*)?,/,'data:$1;base64,').replace(';base64;base64',';base64'),aud:secs,x:'',st:''}) }; fr.readAsDataURL(bl) };
      rec.start(); recAt=Date.now(); var rb=X.querySelector('#rlrec'); rb.hidden=false; recT=setInterval(function(){ var s=Math.round((Date.now()-recAt)/1000); X.querySelector('#rlrect').textContent='0:'+('0'+s).slice(-2); if(s>=20) stopRec(true) },250) })
      .catch(function(){ toast('Allow the microphone for AwareBC to record voice notes.') }) }
  function stopRec(ok){ if(!rec||rec.state==='inactive') return; recOk=!!ok; try{ rec.stop() }catch(e){} }

  // ---------- region name ("Boundary Offroad Layer") ----------
  var RG={};
  function regionName(lat,lon){ var k=lat.toFixed(1)+','+lon.toFixed(1); if(RG[k]){ set(RG[k]); return } if(navigator.onLine===false){ set(ls('aw-rlreg')||'BC'); return }
    fetch('https://photon.komoot.io/reverse?lat='+lat.toFixed(4)+'&lon='+lon.toFixed(4)+'&limit=1&lang=en').then(function(r){ return r.json() }).then(function(j){ var p=(j.features&&j.features[0]||{}).properties||{};
      var c=String(p.county||p.district||p.city||p.state||'BC').replace(/^Regional District of\s*/i,'').replace(/\s*Regional District$/i,'').replace(/^Area [A-Z]\s*\(([^)]+)\)$/,'$1').replace(/\s*\(.*\)$/,''); RG[k]=c; ls('aw-rlreg',c); set(c) }).catch(function(){}) ;
    function set(c){ var e=X.querySelector('#rlreg'); if(e) e.textContent=c } }
  function toast(t){ var d=document.createElement('div'); d.className='frtoast'; d.style.zIndex=6100; d.textContent=t; document.body.appendChild(d); setTimeout(function(){ d.classList.add('go') },2600); setTimeout(function(){ d.remove() },3200) }

  window.__rlRelay=function(it){ return api({op:'relay',mid:it.mid,kind:it.kind,st:it.st,x:it.x,lat:it.lat,lon:it.lon,el:it.el,tc:it.tc,by:it.by,tg:it.tg,t:it.t}).then(function(j){ if(j&&j.relay) toast('📡 You relayed '+(it.by||'a rider')+'’s trail post: +1 Relay'); return true }) };
  window.__rlBadge=function(n){ var e=X&&X.querySelector('#rlun'); if(!e) return; e.hidden=!n; e.textContent=n>9?'9+':n };
  var css='#rlbtn::after{content:"Rig Link";position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:1px;font:700 10px/12px var(--font);color:#fff;text-shadow:0 0 3px #000,0 0 2px #000,0 1px 2px #000;white-space:nowrap;pointer-events:none}#rlbtn{display:none;top:auto;right:auto;left:max(10px,env(safe-area-inset-left,0px));bottom:298px}body.fsron #rlbtn{display:grid}body.fsrp #rlbtn,body.menuon #rlbtn,body.toolon #rlbtn,body.fron #rlbtn,body.srchon #rlbtn{visibility:hidden}'+
  '#rlx{position:fixed;inset:0;z-index:6000;background:#0b0d10;color:#f2f4f7;display:flex;flex-direction:column;font-family:var(--font,system-ui);padding-top:env(safe-area-inset-top,0px)}#rlx[hidden]{display:none}#rlx button{font-family:inherit;cursor:pointer}'+
  '.rlhd{display:flex;align-items:center;gap:8px;padding:8px 10px 6px 12px;background:#111418;border-bottom:1px solid #232830;flex:none}.rlt{min-width:0}.rlt b{display:block;font:800 15.5px var(--font,system-ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rlt small{display:block;color:#9aa4b2;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '.rlrig{margin-left:auto;background:#12321f;color:#4ade80;font:800 12px var(--font,system-ui);padding:5px 9px;border-radius:10px;white-space:nowrap}.rlx{flex:none;width:40px;height:40px;border:0;border-radius:50%;background:#222932;color:#fff;font-size:17px}.rlfr{position:relative}.rlfd{vertical-align:-5px;margin-left:5px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.8))}.rlprof .rlfd{margin:0;flex:none}.rlfdt{font:900 12px var(--font,system-ui);letter-spacing:.06em;color:#fcd34d;margin:1px 0 2px}#rlmp{position:fixed;inset:0;z-index:6150;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;font-family:var(--font,system-ui);color:#f2f4f7}#rlmp[hidden]{display:none}#rlmp button{font-family:inherit;cursor:pointer}.mpin{width:100%;background:#151a20;border-radius:20px 20px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px));box-sizing:border-box;box-shadow:0 -6px 20px rgba(0,0,0,.6)}.mphd{display:flex;gap:12px;align-items:center}.mphd .rlfd{margin:0;flex:none}.mpt{flex:1;min-width:0}.mpt b{font:800 17px var(--font,system-ui);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mpt b small{color:#7d8896;font-size:13px}.mpt>small{display:block;color:#9aa4b2;font-size:12.5px;margin-top:2px}.mpbd{display:flex;gap:10px;margin:10px 0 4px;flex-wrap:wrap}.mpbd>div{display:flex;flex-direction:column;align-items:center;text-align:center;width:56px}.mpbd small{font:700 10.5px/1.25 var(--font,system-ui);color:#d5dbe3}.rlmini{display:inline-flex;gap:1px;vertical-align:-3px;margin-left:5px}.rlprof{display:flex;gap:12px;align-items:center;margin-bottom:6px}.rlprof h3{margin:0}.rlprof h3 small{color:#7d8896;font-size:13px}.rlav.big{width:52px;height:52px;font-size:18px}.rlbdg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.rlbd{display:flex;flex-direction:column;align-items:center;text-align:center;background:#0f1317;border:1px solid #262d36;border-radius:14px;padding:8px 4px}.rlbd b{font:800 13px var(--font,system-ui);margin-top:2px}.rlbd small{color:#9aa4b2;font-size:11.5px}.rlbd.off{opacity:.7}.rlclr{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 10px 0;padding:7px 9px;border-radius:10px;background:#12321f;color:#bbf7d0;font:700 12.5px var(--font,system-ui)}.rlclr small{color:#86efac;font-weight:500}.rlbt.sm{flex:none;min-height:36px;padding:7px 10px;font-size:12.5px}.rlthk{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.rltop [data-a=prof]{cursor:pointer}.rlfr em{position:absolute;right:-3px;top:-3px;min-width:18px;height:18px;padding:0 4px;box-sizing:border-box;border-radius:9px;background:#ff3b30;color:#fff;font:800 11px/18px var(--font,system-ui);font-style:normal;text-align:center}.rlfr em[hidden]{display:none}'+
  '.rltog{display:flex;background:#1b2027;border-radius:22px;padding:3px;margin:7px 10px 4px;flex:none}.rltog button{flex:1;border:0;background:none;color:#aab3bf;font:800 13px var(--font,system-ui);padding:9px 0;border-radius:19px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rltog .on{background:#f2f4f7;color:#0b0d10}.rltog .lk{background:#ffb020;color:#111}'+
  '#rllobby{flex:none;padding:0 10px}.rlkey{display:flex;gap:6px;margin:4px 0}.rlkey input{flex:1;min-width:0;height:44px;border:0;border-radius:12px;background:#1b2027;color:#fff;padding:0 12px;font:700 16px var(--font,system-ui);letter-spacing:.06em}'+
  '.rlsm{color:#9aa4b2;font-size:12.5px;line-height:1.4;margin:2px 0 6px}.rlrow{display:flex;align-items:center;gap:10px;margin:2px 0 4px}.rlsw{flex:1;display:flex;align-items:center;gap:8px;border:0;background:none;color:#e5e9ee;font:600 13px var(--font,system-ui);text-align:left;padding:4px 0}'+
  '.rlsw i{flex:none;width:40px;height:24px;border-radius:12px;background:#48484a;position:relative}.rlsw i:after{content:"";position:absolute;left:2px;top:2px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left .15s}.rlsw.on i{background:#22c55e}.rlsw.on i:after{left:18px}'+
  '.rllink{border:0;background:none;color:#60a5fa;font:800 13px var(--font,system-ui);padding:6px 2px}.rllink.red{color:#f87171}.rlkeyshow{width:100%;height:40px;border:1px solid #3a424d;border-radius:10px;background:#000;color:#ffd60a;font:800 18px ui-monospace,monospace;text-align:center;margin-bottom:6px;user-select:all;-webkit-user-select:all}'+
  '.rlmap{display:none!important;position:relative;isolation:isolate;z-index:0;flex:none;height:30vh;min-height:150px;transition:height .25s;background:#1d2a22}.rlmap.big{height:62vh}.rlmb{position:absolute;right:8px;top:8px;z-index:500;display:flex;flex-direction:column;gap:6px}.rlmb button{width:40px;height:40px;border:0;border-radius:12px;background:rgba(11,13,16,.88);color:#fff;font-size:17px}'+
  '.rlpin{display:grid;place-items:center;width:28px;height:28px;border-radius:50% 50% 50% 0;border:2px solid #fff;transform:translate(-50%,-100%) rotate(-45deg);box-shadow:0 2px 4px #000;font-size:13px;line-height:1}.rlpin>*{transform:rotate(45deg)}.rlpin.rig{background:#22c55e;border-radius:50%;transform:translate(-50%,-50%)}'+
  '.rlchips{display:flex;gap:6px;padding:6px 10px 0;overflow-x:auto;flex:none}.rlchips[hidden]{display:none}.rlchips button{flex:none;display:flex;align-items:center;gap:6px;background:#151a20;border:1px solid #262d36;border-radius:12px;padding:6px 10px;color:#f2f4f7;font:700 12.5px var(--font,system-ui)}.rlchips i{width:9px;height:9px;border-radius:50%;display:block}'+
  '.rlfl{display:flex;gap:6px;padding:8px 10px;overflow-x:auto;flex:none}.rlfl button{flex:none;border:1px solid #2a313b;background:#1b2027;color:#d5dbe3;font:800 13px var(--font,system-ui);padding:8px 13px;border-radius:18px}.rlfl .on{background:#f2f4f7;color:#0b0d10;border-color:#f2f4f7}'+
  '.rlfeed{flex:1;min-height:0;overflow-y:auto;padding:0 10px 8px;-webkit-overflow-scrolling:touch}.rlnone,.rlnote{color:#9aa4b2;font-size:13.5px;padding:14px 4px;text-align:center}.rlnote{background:#1b2027;border-radius:12px;margin-bottom:8px;text-align:left;padding:10px 12px}'+
  '.rlcd{background:#151a20;border:1px solid #262d36;border-radius:16px;margin-bottom:9px;overflow:hidden;transition:box-shadow .3s}.rlcd.hi{box-shadow:0 0 0 3px #60a5fa}.rlcd.pend{opacity:.75;border-style:dashed}'+
  '.rltop{display:flex;gap:10px;padding:10px 10px 6px;align-items:center}.rltop>div{min-width:0}.rlav{width:34px;height:34px;border-radius:50%;flex:none;display:grid;place-items:center;font:800 13px var(--font,system-ui)}.rltop b{font:700 14px var(--font,system-ui)}.rltop b small{color:#7d8896;font-weight:700}.rltop>div>small{display:block;color:#93a0b0;font-size:12px}'+
  '.rltag{margin-left:auto;flex:none;font:800 11px var(--font,system-ui);padding:3px 8px;border-radius:8px}.rlimg{display:block;width:100%;max-height:220px;object-fit:cover;background:#222932}.rlbadge{margin:8px 10px 0;display:inline-block;background:#132341;color:#bfdbfe;font:800 13px var(--font,system-ui);padding:5px 10px;border-radius:9px}'+
  '.rltel{display:flex;gap:6px;padding:8px 10px 0;flex-wrap:wrap}.rltel span{font:700 12px var(--font,system-ui);background:#0f1317;border:1px solid #2a313b;padding:4px 8px;border-radius:8px;color:#d5dbe3}.rlau{display:flex;align-items:center;gap:8px;padding:8px 10px 0}.rlau audio{flex:1;min-width:0;height:40px}.rlau small{color:#9aa4b2}'+
  '.rltx{padding:7px 10px 0;font-size:14px;line-height:1.4;color:#e5e9ee;overflow-wrap:anywhere}.rlcm{margin:7px 10px 0;padding:7px 9px;border-radius:10px;background:#1b2027;font-size:12.5px;color:#d5dbe3;overflow-wrap:anywhere}.rlcm.q{background:#2a2410;color:#fde68a}.rlcm small{opacity:.75}'+
  '.rlact{display:flex;gap:7px;padding:9px 10px 6px}.rlbt{flex:1;border:0;font:800 13.5px var(--font,system-ui);padding:12px 6px;border-radius:12px;background:#222932;color:#f2f4f7;min-height:46px}.rlbt.g{background:#16a34a}.rlbt.b{background:#2563eb}.rlbt.y{background:#f59e0b;color:#111}.rlbt[disabled]{opacity:.6}.rlbt.wide{width:100%;margin-top:10px;flex:none}'+
  '.rlsoc{display:flex;gap:4px;padding:0 6px 6px}.rlsoc button{border:0;background:none;color:#9aa4b2;font:800 13px var(--font,system-ui);padding:8px 8px;min-height:40px}.rlsoc .on{color:#f87171}.rlsoc .rd{margin-left:auto;color:#f87171}.rlsoc button:last-child:not(.rd){margin-left:auto}'+
  '.rlbar{flex:none;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:8px 8px calc(8px + env(safe-area-inset-bottom,0px));background:#111418;border-top:1px solid #232830}.rlbar button{display:flex;flex-direction:column;align-items:center;gap:2px;border:0;font:800 11px var(--font,system-ui);color:#d5dbe3;background:#1b2027;border-radius:14px;padding:9px 0 7px;min-height:58px;-webkit-user-select:none;user-select:none;touch-action:none}.rlbar i{font-style:normal;font-size:21px;line-height:23px}.rlbar .ptt{background:#dc2626;color:#fff}'+
  '.rlsheet{position:absolute;inset:0;z-index:1000;background:rgba(0,0,0,.6);display:flex;align-items:flex-end}.rlsheet[hidden]{display:none}.rlsin{width:100%;max-height:88%;overflow-y:auto;background:#151a20;border-radius:20px 20px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px));box-sizing:border-box}'+
  '.rlsin h3{margin:0 0 8px;font:800 18px var(--font,system-ui)}.rlsin h4{margin:12px 0 4px;font:800 13px var(--font,system-ui);color:#9aa4b2;text-transform:uppercase;letter-spacing:.06em}.rlsin input:not([type]),.rlsin textarea{display:block;width:100%;box-sizing:border-box;margin:6px 0;border:0;border-radius:12px;background:#0f1317;color:#fff;padding:11px 12px;font:15px var(--font,system-ui);resize:none}'+
  '.rlpriv{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.rlpriv button{flex:1 1 auto;border:1px solid #2a313b;background:#1b2027;color:#d5dbe3;font:800 13px var(--font,system-ui);padding:10px 8px;border-radius:12px;min-height:44px}.rlpriv .on{background:#f2f4f7;color:#0b0d10}.rlpriv button[disabled]{opacity:.45}'+
  '.rlchk{display:flex;gap:8px;align-items:center;font-size:13px;color:#d5dbe3;margin:4px 0}.rlchk input{width:22px;height:22px}.rlpick{display:block;text-align:center;border:2px dashed #3a424d;border-radius:14px;padding:16px;margin:6px 0;color:#d5dbe3;font-weight:700}'+
  '.rlgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}.rlbig2{border:0;border-radius:14px;background:#222932;color:#fff;font:800 15px var(--font,system-ui);padding:16px 6px;min-height:58px}.rlbig{font:800 28px var(--font,system-ui);color:#fcd34d;margin:6px 0}'+
  '.rlparts div{padding:4px 0;border-bottom:1px solid #222932;font-size:14px}.rlcl{max-height:42vh;overflow-y:auto}.rlcl .rlcm{margin:6px 0}.rlqt{border:0;background:#1b2027;color:#d5dbe3;border-radius:10px;padding:9px 10px;font:700 12.5px var(--font,system-ui);width:100%;text-align:left}.rlqt.on{background:#2a2410;color:#fde68a}'+
  '.rlrec{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);z-index:1001;background:rgba(220,38,38,.95);color:#fff;border-radius:18px;padding:18px 22px;text-align:center;display:flex;flex-direction:column;gap:4px;box-shadow:0 6px 24px #000}.rlrec[hidden]{display:none}.rlrec span{font:800 30px var(--font,system-ui)}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
})();
