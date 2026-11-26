/* Battery saver (by Josh Singer). When the battery drops to 20% (and the phone isn't charging), AwareBC offers to save power:
   planes every 30 s instead of 10 s, no snow or rain effects, and lower-power GPS. It turns itself off when you plug in. */
(function(){
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v) }catch(e){ return null } }
  window.__awSaver=ls('aw-saver')==='1';
  function toast(t){ var d=document.createElement('div'); d.className='frtoast'; d.style.zIndex=7100; d.textContent=t; document.body.appendChild(d); setTimeout(function(){ d.classList.add('go') },4800); setTimeout(function(){ d.remove() },5400) }
  function fx(on){ /* snow and rain effects: switch off, then put back the way you had them */
    [['__snow','aw-snow'],['__rainfx','aw-rainfx']].forEach(function(x){ var o=window[x[0]]; if(!o||!o.set) return;
      if(on){ if(ls('aw-saver-'+x[1])==null) ls('aw-saver-'+x[1],ls(x[1])||'auto'); o.set('off') } else { var prev=ls('aw-saver-'+x[1]); if(prev!=null){ o.set(prev); ls('aw-saver-'+x[1],null) } } }) }
  function set(on,why){ on=!!on; if(on===window.__awSaver) return; window.__awSaver=on; ls('aw-saver',on?'1':'0'); fx(on);
    try{ window.__awRegps&&window.__awRegps() }catch(e){}
    toast(on?'🔋 Battery saver on: planes every 30 s, no snow or rain effects. It turns off when you charge.':'🔋 Battery saver off'+(why?' ('+why+')':'')+'.') }
  window.__saver={on:function(){ return window.__awSaver },set:set};
  function offer(lvl){ if(document.getElementById('awbat')) return; var d=document.createElement('div'); d.id='awbat'; d.setAttribute('role','dialog'); d.setAttribute('aria-label','Battery saver');
    d.style.cssText='position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 84px);z-index:7000;background:radial-gradient(120% 80% at 90% 0%,rgba(255,179,64,.2),transparent 60%),#11161c;color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:14px;font:14px/1.35 var(--font,system-ui);box-shadow:0 12px 40px rgba(0,0,0,.5)';
    d.innerHTML='<div style="display:flex;gap:12px;align-items:center"><span style="flex:none;width:44px;height:44px;border-radius:13px;display:grid;place-items:center;font-size:22px;background:linear-gradient(145deg,#ffd27a,#ff9f0a)" aria-hidden="true">🪫</span><span><b style="display:block;font-size:16px">Battery at '+Math.round(lvl*100)+'%</b><small style="color:#a9b4bf;font-size:13px">Turn on Battery saver to get more hours out of it?</small></span></div>'+
      '<div style="display:flex;gap:8px;margin-top:12px"><button type="button" data-a="no" aria-label="Close" style="flex:1;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;font:700 14px var(--font,system-ui)">Not now</button><button type="button" data-a="on" style="flex:1.4;height:44px;border-radius:12px;border:0;background:linear-gradient(180deg,#5ee27a,#26b844);color:#04210c;font:800 14px var(--font,system-ui)">Turn on saver</button></div>';
    document.body.appendChild(d);
    d.addEventListener('click',function(e){ var b=e.target.closest('[data-a]'); if(!b) return; ls('aw-batask',String(Date.now())); d.remove(); if(b.getAttribute('data-a')==='on') set(true) }) }
  if(window.__awSaver) setTimeout(function(){ fx(true) },2500);
  if(!navigator.getBattery) return; /* iPhones and some browsers don't share battery level */
  navigator.getBattery().then(function(bt){
    function check(){ if(bt.charging){ if(window.__awSaver) set(false,'charging'); var o=document.getElementById('awbat'); if(o) o.remove(); return }
      var last=+ls('aw-batask')||0; if(!window.__awSaver&&bt.level<=0.2&&Date.now()-last>6*3600000) offer(bt.level) }
    bt.addEventListener('levelchange',check); bt.addEventListener('chargingchange',check); setTimeout(check,6000) }).catch(function(){});
})();
