/* Live planes key: one easy screen to paste the free FlyItalyADSB key (kept only on this device) */
(function(){
  var URL_KEY='https://flyitalyadsb.com/en/dati/api/';
  function has(){ try{ return !!(localStorage.getItem('sky-key')||'').trim() }catch(e){ return false } }
  function css(){ if(document.getElementById('pkcss')) return; var s=document.createElement('style'); s.id='pkcss';
    s.textContent='#awpk{position:fixed;inset:0;z-index:6500;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;font-family:inherit}'+
    '#awpk .in{position:relative;width:100%;max-width:460px;background:radial-gradient(120% 70% at 85% -10%,rgba(100,210,255,.22),transparent 60%),radial-gradient(90% 60% at 0% 110%,rgba(191,139,255,.16),transparent 60%),#0d1116;color:#fff;border-radius:22px 22px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px rgba(0,0,0,.5);border-top:1px solid rgba(255,255,255,.08)}'+
    '#awpk h3{margin:0 0 4px;display:flex;align-items:center;gap:12px;font-size:21px}'+
    '#awpk .bd{width:46px;height:46px;border-radius:14px;flex:none;display:grid;place-items:center;font-size:24px;background:linear-gradient(145deg,#8fe0ff,#2aa8e0);box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 6px 18px rgba(100,210,255,.35)}'+
    '#awpk h3 small{display:block;font-size:13px;font-weight:400;color:#a9b4bf;margin-top:2px}'+
    '#awpk .x{position:absolute;top:12px;right:12px;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:#fff;font-size:18px}'+
    '#awpk ol{list-style:none;margin:14px 0 0;padding:0;display:grid;gap:8px}'+
    '#awpk li{display:flex;gap:12px;align-items:center;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.075);border-radius:14px;padding:11px 12px;font-size:15px;line-height:1.3}'+
    '#awpk li i{font-style:normal;flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:14px;background:rgba(100,210,255,.16);color:#64d2ff}'+
    '#awpk li small{display:block;color:#a9b4bf;font-size:12.5px}'+
    '#awpk a.get{display:block;margin-top:2px;color:#64d2ff;font-weight:700;text-decoration:none}'+
    '#awpk input{width:100%;box-sizing:border-box;margin-top:12px;height:50px;border-radius:14px;border:1.5px solid rgba(100,210,255,.45);background:rgba(0,0,0,.35);color:#fff;font-size:16px;padding:0 14px}'+
    '#awpk .sv{width:100%;margin-top:10px;height:52px;border:0;border-radius:14px;font-size:17px;font-weight:700;color:#06202c;background:linear-gradient(180deg,#8fe0ff,#3bb4ea);box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 8px 20px rgba(100,210,255,.3)}'+
    '#awpk .sv:disabled{opacity:.5}'+
    '#awpk .msg{min-height:20px;margin:8px 2px 0;font-size:14px;color:#a9b4bf;text-align:center}'+
    '#awpk .msg.ok{color:#32d74b}#awpk .msg.bad{color:#ff6b61}'+
    '#awpk .pv{margin:8px 2px 0;font-size:12px;color:#7f8a95;text-align:center}'+
    '.awpkrow{display:flex;align-items:center;gap:12px;width:100%;margin:10px 0 0;padding:12px;border-radius:16px;border:1px solid rgba(100,210,255,.35);background:linear-gradient(90deg,rgba(100,210,255,.16),rgba(100,210,255,.04));color:#fff;text-align:left;font:inherit}'+
    '.awpkrow .bd{width:38px;height:38px;border-radius:12px;flex:none;display:grid;place-items:center;font-size:20px;background:linear-gradient(145deg,#8fe0ff,#2aa8e0);box-shadow:inset 0 1px 0 rgba(255,255,255,.55)}'+
    '.awpkrow b{display:block;font-size:15px}.awpkrow small{display:block;font-size:12.5px;color:#a9b4bf}.awpkrow em{margin-left:auto;font-style:normal;font-weight:700;color:#64d2ff;font-size:14px}';
    document.head.appendChild(s) }
  function close(){ var e=document.getElementById('awpk'); if(e) e.remove() }
  function open(){ css(); close();
    var d=document.createElement('div'); d.id='awpk'; d.setAttribute('role','dialog'); d.setAttribute('aria-label','Turn on live planes');
    d.innerHTML='<div class="in"><button type="button" class="x" aria-label="Close">✕</button>'+
      '<h3><span class="bd">✈️</span><span>Turn on live planes<small>Free, takes about a minute</small></span></h3>'+
      '<ol><li><i>1</i><span>Get your free key<small>Enter your email, open the link they send, copy the key.</small><a class="get" href="'+URL_KEY+'" target="_blank" rel="noopener">Get a free key ↗</a></span></li>'+
      '<li><i>2</i><span>Paste it below and tap Save<small>Long-press the box, then Paste.</small></span></li></ol>'+
      '<input id="pkin" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Paste your key here" aria-label="Plane key">'+
      '<button type="button" class="sv" disabled>Save</button><p class="msg" aria-live="polite"></p>'+
      '<p class="pv">Your key stays on this device only.</p></div>';
    document.body.appendChild(d);
    var inp=d.querySelector('#pkin'), sv=d.querySelector('.sv'), msg=d.querySelector('.msg');
    try{ inp.value=localStorage.getItem('sky-key')||'' }catch(e){} sv.disabled=!inp.value.trim();
    d.addEventListener('click',function(e){ if(e.target===d||e.target.closest('.x')) close() });
    inp.addEventListener('input',function(){ sv.disabled=!inp.value.trim(); msg.textContent=''; msg.className='msg' });
    sv.onclick=function(){ var k=inp.value.trim().replace(/[^\w\-.]/g,'').slice(0,200); if(!k) return;
      sv.disabled=true; msg.className='msg'; msg.textContent='Checking your key…';
      var c=(window.__AW&&window.__AW.me&&window.__AW.me())||{}, la=+(c.lat||49.25), lo=+(c.lon||-123.1);
      fetch('https://api.flyitalyadsb.com/v2/lat/'+la.toFixed(2)+'/lon/'+lo.toFixed(2)+'/dist/150',{headers:{'X-Api-Key':k}}).then(function(r){
        if(r.status===401||r.status===403) throw 'key'; if(!r.ok) throw 'net'; return r.json() }).then(function(j){ save(k);
        var n=(j.ac||[]).length; msg.className='msg ok'; msg.textContent='✓ Live planes on'+(n?' — '+n+' nearby':'');
        setTimeout(close,1600) }).catch(function(e){ sv.disabled=false;
        if(e==='key'){ msg.className='msg bad'; msg.textContent='That key didn’t work. Check you copied all of it.' }
        else { save(k); msg.className='msg'; msg.textContent='📶 Saved. Couldn’t check it right now (weak signal) — planes will load when you’re back online.' } }) };
    setTimeout(function(){ if(!inp.value) inp.focus() },250) }
  function save(k){ try{ localStorage.setItem('sky-key',k) }catch(e){}
    var a=document.getElementById('apikey'), b=document.getElementById('fsave'); if(a&&b){ a.value=k; b.click() } }
  window.__planeKey={open:open,has:has};
  /* Profile: a clear "Turn on live planes" row while no key is saved */
  function row(){ if(has()) return; var pc=document.querySelector('.pcard'); if(!pc||pc.parentNode.querySelector('.awpkrow')) return; css();
    var b=document.createElement('button'); b.type='button'; b.className='awpkrow';
    b.innerHTML='<span class="bd">✈️</span><span><b>Turn on live planes</b><small>Paste your free key</small></span><em>Set up</em>';
    b.onclick=function(e){ e.stopPropagation(); open() }; pc.parentNode.insertBefore(b,pc.nextSibling) }
  var rq=0; new MutationObserver(function(){ if(rq) return; rq=1; requestAnimationFrame(function(){ rq=0; row() }) }).observe(document.documentElement,{childList:true,subtree:true});
  /* Plane messages ("Needs a feed", "Can't reach the feeds", "Feed busy") open this screen when there's no key */
  document.addEventListener('click',function(e){ if(has()) return; var t=e.target.closest&&e.target.closest('#wbtn,#stat'); if(!t) return;
    if(t.id==='stat'&&!t.classList.contains('bad')) return; e.preventDefault(); e.stopImmediatePropagation(); open() },true);
})();
