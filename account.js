/* Delete my account (by Josh Singer): removes the rider from the AwareBC server and clears this phone. Required by Google Play and the App Store. */
(function(){
  var RS='https://awarebc.aware-bc.workers.dev';
  function ls(k){ try{ return localStorage.getItem(k)||'' }catch(e){ return '' } }
  function css(){ if(document.getElementById('adcss')) return; var s=document.createElement('style'); s.id='adcss';
    s.textContent='#fsheet .acdelbtn{background:rgba(255,69,58,.14)!important;color:#ff6b61!important;border:1px solid rgba(255,69,58,.4)!important;font-weight:700}'+
    '#awdel{position:fixed;inset:0;z-index:6600;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center}'+
    '#awdel .in{position:relative;width:100%;max-width:460px;background:radial-gradient(120% 70% at 85% -10%,rgba(255,69,58,.2),transparent 60%),#0d1116;color:#fff;border-radius:22px 22px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom));border-top:1px solid rgba(255,255,255,.08)}'+
    '#awdel h3{margin:0;display:flex;align-items:center;gap:12px;font-size:21px}'+
    '#awdel .bd{width:46px;height:46px;border-radius:14px;flex:none;display:grid;place-items:center;font-size:22px;background:linear-gradient(145deg,#ff8a80,#e0352b);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 6px 18px rgba(255,69,58,.3)}'+
    '#awdel h3 small{display:block;font-size:13px;font-weight:400;color:#a9b4bf;margin-top:2px}'+
    '#awdel .x{position:absolute;top:12px;right:12px;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:#fff;font-size:18px}'+
    '#awdel ul{list-style:none;margin:14px 0 0;padding:12px 14px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.075);border-radius:14px;display:grid;gap:7px;font-size:14.5px}'+
    '#awdel li::before{content:"\\2715";color:#ff6b61;font-weight:700;margin-right:10px}'+
    '#awdel p{margin:10px 2px 0;font-size:13.5px;color:#a9b4bf;line-height:1.35}'+
    '#awdel label{display:block;margin-top:12px;font-size:14px;color:#dfe5ea}'+
    '#awdel input{width:100%;box-sizing:border-box;margin-top:6px;height:48px;border-radius:14px;border:1.5px solid rgba(255,69,58,.45);background:rgba(0,0,0,.35);color:#fff;font-size:16px;padding:0 14px;text-transform:uppercase}'+
    '#awdel .adrow{display:flex;gap:10px;margin-top:12px}#awdel .adrow button{flex:1;height:52px;border-radius:14px;font-size:16px;font-weight:700;border:0}'+
    '#awdel .keep{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.12)!important}'+
    '#awdel .go{color:#fff;background:linear-gradient(180deg,#ff6b61,#d92d22);box-shadow:inset 0 1px 0 rgba(255,255,255,.4)}#awdel .go:disabled{opacity:.4}'+
    '#awdel .msg{min-height:18px;text-align:center;font-size:14px;margin-top:8px}#awdel .msg.bad{color:#ff6b61}';
    document.head.appendChild(s) }
  function close(){ var e=document.getElementById('awdel'); if(e) e.remove() }
  function open(){ css(); close(); var d=document.createElement('div'); d.id='awdel'; d.setAttribute('role','dialog'); d.setAttribute('aria-label','Delete my account');
    d.innerHTML='<div class="in"><button type="button" class="x" aria-label="Close">✕</button>'+
      '<h3><span class="bd">🗑️</span><span>Delete my account<small>This can’t be undone</small></span></h3>'+
      '<ul><li>Rider profile, rig, badges and photos</li><li>Friends, groups and chats</li><li>Showroom posts, comments and places you added</li><li>Push alerts and settings on this phone</li></ul>'+
      '<p>Anonymous trail reports stay up until they expire (7 days). You can start fresh any time.</p>'+
      '<label for="adin">Type DELETE to confirm</label><input id="adin" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="DELETE">'+
      '<div class="adrow"><button type="button" class="keep">Keep account</button><button type="button" class="go" disabled>Delete</button></div><p class="msg" aria-live="polite"></p></div>';
    document.body.appendChild(d);
    var inp=d.querySelector('#adin'), go=d.querySelector('.go'), msg=d.querySelector('.msg');
    d.addEventListener('click',function(e){ if(e.target===d||e.target.closest('.x,.keep')) close() });
    inp.addEventListener('input',function(){ go.disabled=inp.value.trim().toUpperCase()!=='DELETE' });
    go.onclick=function(){ go.disabled=true; msg.className='msg'; msg.textContent='Deleting…';
      var uid=ls('sky-uid'), p=uid?fetch(RS+'/s/wipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:uid,name:ls('sky-trname')})}).then(function(r){ if(!r.ok) throw 0 }):Promise.resolve();
      p.then(function(){ return Promise.resolve(window.__push&&window.__push.off&&window.__push.off()).catch(function(){}) }).then(clearPhone).then(function(){
        msg.textContent='✓ Your account is deleted'; setTimeout(function(){ location.replace(location.pathname) },1200) })
      .catch(function(){ go.disabled=false; msg.className='msg bad'; msg.textContent='📶 No signal right now. Nothing was deleted — try again when you’re back online.' }) } }
  function clearPhone(){ try{ localStorage.clear(); sessionStorage.clear() }catch(e){}
    var jobs=[]; try{ if(window.caches) jobs.push(caches.keys().then(function(k){ return Promise.all(k.map(function(n){ return caches.delete(n) })) })) }catch(e){}
    try{ if(indexedDB.databases) jobs.push(indexedDB.databases().then(function(a){ a.forEach(function(x){ if(x.name) indexedDB.deleteDatabase(x.name) }) })) }catch(e){}
    return Promise.all(jobs).catch(function(){}) }
  window.__delAcct={open:open};
  document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('#acdel')){ e.preventDefault(); open() } });
  css();
})();
