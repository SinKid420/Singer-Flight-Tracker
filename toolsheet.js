// AwareBC Survival tools sheet (by Josh Singer): with the new main screen, the Tools button opens glow tiles instead of a column of buttons.
(function(){
  var P={
    buoy:'<circle class="f" cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M6 6l3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5"/>',
    radio:'<rect class="f" x="4" y="9" width="16" height="11.5" rx="2.5"/><rect x="4" y="9" width="16" height="11.5" rx="2.5"/><path d="M7 9l9-5"/><circle cx="9" cy="14.7" r="2.2"/><path d="M14 13h3M14 16.5h3"/>',
    sled:'<path class="f" d="M4 15h11l3-3h2.5v3H19l-2 2H4z"/><path d="M4 15h11l3-3h2.5v3H19l-2 2H4zM8 15l2-5h4l1.5 2.5"/><path d="M2.5 19.5h17l2-2"/>',
    box:'<path class="f" d="M12 3.5l8 4v9l-8 4-8-4v-9z"/><path d="M12 3.5l8 4v9l-8 4-8-4v-9zM4 7.5l8 4 8-4M12 11.5v9"/>',
    planet:'<circle class="f" cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="6"/><path d="M3 15.5c3 1.5 15-4 18-7.5"/><path d="M17.5 3.5h3M19 2v3"/>',
    mark:'<path class="f" d="M6.5 3.5h11v17l-5.5-4-5.5 4z"/><path d="M6.5 3.5h11v17l-5.5-4-5.5 4z"/>',
    cam:'<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path class="f" d="M12 7l4 2.5v5L12 17l-4-2.5v-5z"/><path d="M12 7l4 2.5v5L12 17l-4-2.5v-5z"/>',
    x:'<path d="M6 6l12 12M18 6L6 18"/>'};
  function svg(n,s,c){ return '<svg class="awti" viewBox="0 0 24 24" aria-hidden="true" style="width:'+s+'px;height:'+s+'px'+(c?';color:'+c:'')+'">'+P[n]+'</svg>' }
  var T=[['t_rescue','buoy','Rescue & signal','Rescue card and signal spots','#ff453a'],['t_comms','radio','Off-grid comms','Repeaters and radio channels','#64d2ff'],['t_sled','sled','Mountain sledder','Riding zones, slopes, snow','#40e0c8',1],
    ['t_supply','box','Supply chain','Fuel prices and port news','#ffb340'],['t_planet','planet','Planetary threats','Space weather, radiation','#bf8bff'],['t_saved','mark','Saved','Your saved spots','#32d74b'],['arbtn','cam','AR sky camera','Point at the sky to name planes','#64d2ff']];
  var css='#awtools{position:fixed;inset:0;z-index:6060;background:rgba(0,0,0,.5);display:flex;align-items:flex-end}#awtools[hidden]{display:none}'+
    '#awtools .in{width:100%;max-height:92vh;overflow:auto;border-radius:24px 24px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));background:radial-gradient(80% 36% at 20% 0%,rgba(255,179,64,.18),transparent 70%),radial-gradient(60% 30% at 100% 0%,rgba(64,224,200,.14),transparent 70%),#0b0e12;border-top:1px solid rgba(255,255,255,.08);color:#eef1f5;font-family:var(--font,system-ui)}'+
    '#awtools .awti{display:block;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:none}#awtools .awti .f{fill:currentColor;fill-opacity:.28;stroke:none}'+
    '#awtools .hd{display:flex;align-items:center;gap:10px}#awtools .hd b{display:block;font:800 21px var(--font,system-ui)}#awtools .hd small{display:block;font:500 11.5px var(--font,system-ui);color:#9aa3ad;margin-top:2px}'+
    '#awtools .hd button{margin-left:auto;width:38px;height:38px;border-radius:50%;border:0;background:rgba(255,255,255,.08);color:#eef1f5;display:grid;place-items:center}'+
    '#awtools .gr{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}#awtools .gr button{--c:#64d2ff;text-align:left;border-radius:16px;padding:11px 12px;background:linear-gradient(150deg,color-mix(in srgb,var(--c) 14%,transparent),rgba(255,255,255,.03) 62%);border:1px solid color-mix(in srgb,var(--c) 24%,transparent);color:#eef1f5;min-width:0}'+
    '#awtools .gr button:active{transform:scale(.97)}#awtools .gr b{display:block;font:700 13.5px var(--font,system-ui);margin-top:8px}#awtools .gr small{display:block;font:500 11.5px/1.3 var(--font,system-ui);color:#9aa3ad;margin-top:2px}'+
    '#awtools .ib{width:38px;height:38px;border-radius:12px;background:linear-gradient(145deg,var(--c),color-mix(in srgb,var(--c) 72%,#000));display:grid;place-items:center;box-shadow:0 4px 12px color-mix(in srgb,var(--c) 38%,transparent),inset 0 1px 0 rgba(255,255,255,.45)}'+
    '#awtools .sos{display:flex;align-items:center;gap:10px;margin-top:10px;padding:10px 12px;border-radius:14px;background:linear-gradient(150deg,rgba(255,69,58,.16),rgba(255,255,255,.03) 65%);border:1px solid rgba(255,69,58,.3)}#awtools .sos .ib{--c:#ff453a;width:32px;height:32px;border-radius:10px}#awtools .sos b{display:block;font:700 13px var(--font,system-ui)}#awtools .sos small{font:500 11px var(--font,system-ui);color:#9aa3ad}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  var S=null;
  function off(){ return document.body.classList.contains('fsron') }
  function open(){ if(!S){ S=document.createElement('div'); S.id='awtools'; S.setAttribute('role','dialog'); S.setAttribute('aria-label','Survival tools'); document.body.appendChild(S);
      S.addEventListener('click',function(e){ if(e.target===S||e.target.closest('[data-a=x]')){ S.hidden=true; return } var b=e.target.closest('[data-t]'); if(!b) return; S.hidden=true; var t=document.getElementById(b.getAttribute('data-t')); if(t) setTimeout(function(){ t.click() },60) }) }
    var list=T.filter(function(t){ return (!t[5]||off())&&document.getElementById(t[0]) });
    S.innerHTML='<div class="in"><div class="hd"><div><b>Survival tools</b><small>Help for the backcountry</small></div><button type="button" data-a="x" aria-label="Close">'+svg('x',17)+'</button></div>'+
      '<div class="gr">'+list.map(function(t){ return '<button type="button" data-t="'+t[0]+'" style="--c:'+t[4]+'"><span class="ib">'+svg(t[1],22,'#0a0d10')+'</span><b>'+t[2]+'</b><small>'+t[3]+'</small></button>' }).join('')+'</div>'+
      '<button type="button" class="sos" data-t="t_rescue" style="width:100%;text-align:left;color:#eef1f5"><span class="ib">'+svg('buoy',18,'#0a0d10')+'</span><span><b>In danger? Call 911</b><small>Rescue card shows your exact spot</small></span></button></div>';
    S.hidden=false }
  window.addEventListener('click',function(e){ var b=e.target&&e.target.closest&&e.target.closest('#toolbtn'); if(!b||!document.body.classList.contains('awshell')) return;
    e.stopPropagation(); e.preventDefault(); document.body.classList.remove('toolon'); open() },true);
  window.__awTools={open:open};
})();
