/* Easy accounts (by Josh Singer): a rider name + password that bring your AwareBC account (friends, badges, rig) back on any phone.
   The password never leaves the phone: it's stretched here (PBKDF2), half becomes a check the server salts and stores,
   the other half locks your rider key before it's sent. The server can't read either. */
(function(){
  var RS='https://awarebc.aware-bc.workers.dev', te=new TextEncoder();
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v) }catch(e){ return null } }
  function uid(){ var u=ls('sky-uid'); if(!u||u.length<20){ var a=new Uint8Array(18); crypto.getRandomValues(a); u=btoa(String.fromCharCode.apply(null,a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); ls('sky-uid',u) } return u }
  function hex(b){ return [].map.call(b,function(x){ return ('0'+x.toString(16)).slice(-2) }).join('') }
  function b64(b){ return btoa(String.fromCharCode.apply(null,b)) }
  function ub64(s){ var t=atob(s), u=new Uint8Array(t.length); for(var i=0;i<t.length;i++) u[i]=t.charCodeAt(i); return u }
  function derive(un,pw){ return crypto.subtle.importKey('raw',te.encode(pw),'PBKDF2',false,['deriveBits']).then(function(k){
      return crypto.subtle.deriveBits({name:'PBKDF2',salt:te.encode('awarebc-login:'+un.toLowerCase()),iterations:150000,hash:'SHA-256'},k,512) }).then(function(bits){ var b=new Uint8Array(bits);
      return crypto.subtle.importKey('raw',b.slice(32),'AES-GCM',false,['encrypt','decrypt']).then(function(key){ return {auth:hex(b.slice(0,32)),key:key} }) }) }
  function api(b){ return fetch(RS+'/s/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({uid:uid(),name:ls('sky-trname')||''},b))}).then(function(r){ return r.json() }).then(function(j){ if(j.error) throw new Error(j.error); return j }) }
  function clean(s){ return String(s||'').trim().toLowerCase() }
  var css='#awlog{position:fixed;inset:0;z-index:7500;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}'+
    '#awlog .in{position:relative;width:100%;max-width:460px;background:radial-gradient(120% 70% at 85% -10%,rgba(100,210,255,.2),transparent 60%),#0d1116;color:#fff;border-radius:22px 22px 0 0;padding:20px 18px calc(18px + env(safe-area-inset-bottom));font:14px/1.4 var(--font,system-ui);border-top:1px solid rgba(255,255,255,.08)}'+
    '#awlog .x{position:absolute;top:12px;right:12px;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:#fff;font-size:18px}'+
    '#awlog h3{margin:0;display:flex;gap:14px;align-items:center;font-size:20px;padding-right:44px}#awlog h3 span.b{flex:none;width:52px;height:52px;border-radius:16px;display:grid;place-items:center;font-size:26px;background:linear-gradient(145deg,#8fe0ff,#2aa8e0);box-shadow:inset 0 1px 0 rgba(255,255,255,.5)}'+
    '#awlog h3 small{display:block;font-size:13px;font-weight:400;color:#a9b4bf}#awlog p{margin:10px 0 0;color:#dfe5ea}'+
    '#awlog label{display:block;margin-top:10px;font-size:13.5px;color:#cfd6dd}#awlog input{width:100%;box-sizing:border-box;margin-top:5px;height:48px;border-radius:13px;border:1.5px solid rgba(100,210,255,.35);background:rgba(0,0,0,.35);color:#fff;font-size:16px;padding:0 14px}'+
    '#awlog .pw{position:relative}#awlog .pw button{position:absolute;right:6px;top:10px;height:36px;padding:0 10px;border:0;background:none;color:#64d2ff;font:700 13px var(--font,system-ui)}'+
    '#awlog .go{width:100%;margin-top:14px;height:52px;border:0;border-radius:14px;font:800 16px var(--font,system-ui);color:#06202c;background:linear-gradient(180deg,#8fe0ff,#3bb4ea)}#awlog .go:disabled{opacity:.5}'+
    '#awlog .msg{min-height:18px;margin:8px 0 0;text-align:center;font-size:13.5px;color:#a9b4bf}#awlog .msg.bad{color:#ff6b61}#awlog .msg.ok{color:#32d74b}'+
    '.awlogrow{display:flex;align-items:center;gap:12px;width:100%;margin:10px 0 0;padding:11px 12px;border-radius:16px;color:#fff;text-align:left;font:inherit;border:1px solid rgba(255,179,64,.4);background:linear-gradient(90deg,rgba(255,179,64,.16),rgba(255,179,64,.03))}'+
    '.awlogrow.ok{border-color:rgba(50,215,75,.35);background:linear-gradient(90deg,rgba(50,215,75,.12),rgba(50,215,75,.02))}'+
    '.awlogrow .b{flex:none;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-size:19px;background:linear-gradient(145deg,#ffd27a,#ff9f0a)}.awlogrow.ok .b{background:linear-gradient(145deg,#5ee27a,#26b844)}'+
    '.awlogrow b{display:block;font-size:15px}.awlogrow small{display:block;font-size:12.5px;color:#ffb340}.awlogrow.ok small{color:#5ee27a}.awlogrow em{margin-left:auto;font-style:normal;font-weight:700;color:#ffb340}.awlogrow.ok em{color:#5ee27a}'+
    '.awoblog{display:block;margin:10px auto 0;background:none;border:0;color:#64d2ff;font:600 14px var(--font,system-ui);min-height:44px}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  function sheet(mode){ var old=document.getElementById('awlog'); if(old) old.remove(); var save=mode==='save', d=document.createElement('div'); d.id='awlog'; d.setAttribute('role','dialog'); d.setAttribute('aria-label',save?'Save your account':'Log in');
    var have=ls('aw-login');
    d.innerHTML='<div class="in"><button type="button" class="x" aria-label="Close">✕</button><h3><span class="b" aria-hidden="true">'+(save?'🛡️':'👋')+'</span><span>'+(save?'Save your account':'Log in')+'<small>'+(save?'So a new phone gets everything back':'Bring back your friends, badges and rig')+'</small></span></h3>'+
      (save?'<p>Pick a rider name and password. On a new phone, tap <b>Log in</b> on the welcome screen.</p>':'')+
      '<label for="lgun">Rider name</label><input id="lgun" autocomplete="username" autocapitalize="off" spellcheck="false" placeholder="like tyler_m" value="'+(save&&have?have:'')+'">'+
      '<label for="lgpw">Password'+(save?' (8 or more characters)':'')+'</label><div class="pw"><input id="lgpw" type="password" autocomplete="'+(save?'new-password':'current-password')+'"><button type="button" class="sh">Show</button></div>'+
      '<button type="button" class="go">'+(save?'Save my login':'Log in')+'</button><p class="msg" aria-live="polite">'+(save?'🔒 Write it down somewhere: we can’t see or reset your password.':'')+'</p></div>';
    document.body.appendChild(d);
    var un=d.querySelector('#lgun'), pw=d.querySelector('#lgpw'), go=d.querySelector('.go'), msg=d.querySelector('.msg');
    d.addEventListener('click',function(e){ if(e.target===d||e.target.closest('.x')) d.remove() });
    d.querySelector('.sh').onclick=function(){ pw.type=pw.type==='password'?'text':'password'; this.textContent=pw.type==='password'?'Show':'Hide' };
    function say(t,c){ msg.className='msg'+(c?' '+c:''); msg.textContent=t }
    go.onclick=function(){ var u=clean(un.value), p=pw.value;
      if(!/^[a-z0-9._]{3,20}$/.test(u)) return say('Rider names are 3–20 letters, numbers, dots or underscores.','bad');
      if(save&&p.length<8) return say('Use 8 or more characters for the password.','bad'); if(!p) return say('Type your password.','bad');
      if(navigator.onLine===false) return say('📶 No signal right now. Try again when you’re back online.','bad');
      go.disabled=true; say(save?'Saving…':'Logging in…');
      derive(u,p).then(function(k){
        if(save){ var iv=crypto.getRandomValues(new Uint8Array(12));
          return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k.key,te.encode(uid())).then(function(ct){ var all=new Uint8Array(12+ct.byteLength); all.set(iv); all.set(new Uint8Array(ct),12);
            return api({op:'create',un:u,auth:k.auth,enc:b64(all)}) }).then(function(){ ls('aw-login',u); ls('aw-loginT',String(Date.now())); say('✓ Saved. Log in on any phone as '+u+'.','ok'); paintRow(); setTimeout(function(){ d.remove() },1800) }) }
        return api({op:'get',un:u,auth:k.auth}).then(function(j){ var all=ub64(j.enc); return crypto.subtle.decrypt({name:'AES-GCM',iv:all.slice(0,12)},k.key,all.slice(12)) }).then(function(pt){ var key=new TextDecoder().decode(pt);
          if(!key||key.length<16) throw new Error('Couldn’t open your account.'); ls('sky-uid',key); ls('aw-login',u); ls('aw-loginT',String(Date.now())); ls('aw-ob','1');
          say('✓ Welcome back! Loading your account…','ok'); setTimeout(function(){ location.replace(location.pathname) },1200) }) })
      .catch(function(e){ go.disabled=false; say(e&&e.message&&!/fetch/i.test(e.message)?e.message:'📶 Couldn’t reach AwareBC. Try again.','bad') }) };
    setTimeout(function(){ (un.value?pw:un).focus() },250) }
  window.__login={save:function(){ sheet('save') },open:function(){ sheet('login') }};
  /* Profile: "Account backup" row (orange until saved, then green) */
  function paintRow(){ var r=document.querySelector('.awlogrow'); if(!r) return; var u=ls('aw-login'), t=+ls('aw-loginT')||0;
    r.className='awlogrow'+(u?' ok':''); r.innerHTML='<span class="b" aria-hidden="true">🛡️</span><span><b>'+(u?'Logged in as '+u:'Account backup')+'</b><small>'+(u?'Saved'+(t?' '+new Date(t).toLocaleDateString([],{month:'short',day:'numeric'}):'')+' · works on any phone':'Not saved yet · tap to save')+'</small></span><em>›</em>' }
  function row(){ var pc=document.querySelector('#awme .pcard'); if(pc&&!pc.parentNode.querySelector('.awlogrow')){ var b=document.createElement('button'); b.type='button'; b.className='awlogrow'; b.onclick=function(e){ e.stopPropagation(); sheet('save') }; var pk=pc.parentNode.querySelector('.awpkrow'); (pk||pc).after(b); paintRow() }
    var ob=document.getElementById('awob'); if(ob&&!ob.querySelector('.awoblog')){ var go=[].filter.call(ob.querySelectorAll('button'),function(x){ return /Start exploring/.test(x.textContent) })[0]; if(go){ var a=document.createElement('button'); a.type='button'; a.className='awoblog'; a.textContent='Already use AwareBC? Log in'; a.onclick=function(e){ e.stopPropagation(); sheet('login') }; go.after(a) } } }
  var __offMap=function(rs){ for(var i=0;i<rs.length;i++){ var t=rs[i].target; t=t&&t.nodeType===1?t:t&&t.parentElement; if(!t||!t.closest||!t.closest('.leaflet-container')) return true } return false }; var q=0; new MutationObserver(function(rs){ if(q||!__offMap(rs)) return; q=1; requestAnimationFrame(function(){ q=0; row() }) }).observe(document.documentElement,{childList:true,subtree:true});
  /* a reminder once there's something to lose (a friend), at most every 3 days until saved */
  setTimeout(function(){ if(ls('aw-login')) return; var last=+ls('aw-logask')||0; if(Date.now()-last<3*86400000) return;
    var fr=window.__frApi&&window.__frApi.list?window.__frApi.list().length:0; if(!fr) return; ls('aw-logask',String(Date.now())); sheet('save') },25000);
  /* check with the server once, so a login saved on another phone shows here too */
  setTimeout(function(){ if(!ls('sky-uid')||navigator.onLine===false) return; api({op:'status'}).then(function(j){ if(j.un){ ls('aw-login',j.un); if(j.t) ls('aw-loginT',String(j.t)) } else ls('aw-login',null); paintRow() }).catch(function(){}) },9000);
})();
