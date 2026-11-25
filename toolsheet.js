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
  // the Tools page: everything you DO, in four groups. Off-road-only tools are dimmed in On-road; tapping one switches mode first.
  function me(){ var m=window.__AW&&__AW.me&&__AW.me(); return m&&isFinite(m.lat)?m:null }
  function id(x){ return function(){ var e=document.getElementById(x); if(e) e.click() } }
  var G=[['Get around',[['🧭','Directions','#64d2ff','both',function(){ var e=document.getElementById('srch')||document.querySelector('#awtop .sr'); if(e) e.click() }],
      ['⭐','Saved spots','#ffd60a','both',function(){ window.__saved&&__saved.open() }],['📍','Add a place','#64d2ff','both',function(){ window.__awp&&__awp.form({}) }],['📥','Save maps','#40e0c8','both',function(){ window.__offline&&__offline.open() }]]],
    ['On the trail',[['⏱️','Back by','#ffb340','off',id('bbbtn')],['🧰','Trip tools','#40e0c8','off',function(){ window.__trip&&__trip.open() }],
      ['🚩','Report trail','#ffb340','off',function(){ var m=me(); if(window.__trReport) __trReport(m?m.lat:__AW.map.getCenter().lat,m?m.lon:__AW.map.getCenter().lng) }],['🎙️','Aware','#ff453a','off',function(){ window.__aware&&__aware.open(true) }]]],
    ['Look up',[['📷','AR sky camera','#64d2ff','both',id('arbtn')],['🌌',"Tonight's sky",'#bf8bff','both',id('spacebtn')],['🛰️','GPS check','#32d74b','both',function(){ window.__gpsCheck&&__gpsCheck() }],['✈️','Around you now','#c2c9d1','both',function(){ window.__openSky&&__openSky() }]]],
    ['Survival',[['🆘','Rescue &amp; signal','#ff453a','both',id('t_rescue')],['📻','Off-grid comms','#64d2ff','both',id('t_comms')],['📦','Supply chain','#ffb340','both',id('t_supply')],['☄️','Planet threats','#bf8bff','both',id('t_planet')],['🛷','Mountain sledder','#40e0c8','off',id('t_sled')]]]];
  var css2='#awtools .in.tg2{padding:10px 14px 12px;background:radial-gradient(80% 30% at 50% 0%,rgba(64,224,200,.12),transparent 70%),#0d1015;border-top:1px solid rgba(255,255,255,.08)}body.awshell #awtools{bottom:calc(env(safe-area-inset-bottom,0px) + 62px)}body.awshell #awtools .in.tg2{max-height:calc(100vh - 66px)}'+
    '#awtools .tg2 .hd{gap:11px}#awtools .tg2 .tbd{width:48px;height:48px;flex:none;border-radius:16px;display:grid;place-items:center;background:linear-gradient(145deg,#40e0c8,#1f9e8b);box-shadow:0 4px 14px rgba(64,224,200,.45),inset 0 1px 0 rgba(255,255,255,.4)}'+
    '#awtools .tg2 .tbd svg{width:26px;height:26px;fill:none;stroke:#05110f;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}#awtools .tg2 .tbd .f{fill:#05110f;fill-opacity:.28;stroke:none}'+
    '#awtools .tg2 .hd b{font:800 23px var(--font,system-ui);letter-spacing:-.3px}#awtools .tg2 .hd small{font:600 13.5px var(--font,system-ui);color:#b8c2cc}#awtools .tg2 .hd button{width:34px;height:34px}'+
    '#awtools .tg2 .gh{font:800 14px var(--font,system-ui);color:#eef1f5;margin:6px 0 5px}#awtools .tg2 .tt{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}'+
    '#awtools .tg2 .tt button{height:64px;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:0 2px;font:700 12px/1.12 var(--font,system-ui);color:#e6e9ee;text-align:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}'+
    '#awtools .tg2 .tt em{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;font-style:normal;font-size:17px;background:color-mix(in srgb,var(--c) 16%,transparent)}#awtools .tg2 .tt span{max-width:100%;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:11.5px;line-height:1.12}#awtools .tg2 .tt .dim{opacity:.38}'+
    '#awtools .tg2 .sos{margin-top:10px}';
  var st2=document.createElement('style'); st2.textContent=css2; document.head.appendChild(st2);
  var ACT=[];
  function open(){ if(!S){ S=document.createElement('div'); S.id='awtools'; S.setAttribute('role','dialog'); S.setAttribute('aria-label','Tools'); document.body.appendChild(S);
      S.addEventListener('click',function(e){ if(e.target===S||e.target.closest('[data-a=x]')){ S.hidden=true; return } var b=e.target.closest('[data-i],[data-t]'); if(!b) return; S.hidden=true;
        if(b.hasAttribute('data-t')){ var t=document.getElementById(b.getAttribute('data-t')); if(t) setTimeout(function(){ t.click() },60); return }
        var x=ACT[+b.getAttribute('data-i')]; if(!x) return;
        if(x[3]==='off'&&!off()){ var mb=document.querySelector('#awtop .md button[data-m=fsr]')||document.querySelector('.seg button[data-b=fsr]'); if(mb) mb.click(); setTimeout(function(){ document.querySelectorAll('.lyrp').forEach(function(p){ p.hidden=true }); try{ x[4]() }catch(er){} },700); return }
        setTimeout(function(){ try{ x[4]() }catch(er){} },60) }) }
    ACT=[]; var o=off();
    S.innerHTML='<div class="in tg2"><div class="hd"><span class="tbd" aria-hidden="true"><svg viewBox="0 0 24 24"><path class="f" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></span><div style="flex:1;min-width:0"><b>Tools</b><small>Things you do · '+(o?'Off-road':'On-road')+'</small></div><button type="button" data-a="x" aria-label="Close">'+svg('x',17)+'</button></div>'+
      G.map(function(g){ var L2=g[1].filter(function(x){ return x[3]!=='off'||o||x[1]!=='Mountain sledder' }); return '<div class="gh">'+g[0]+'</div><div class="tt">'+L2.map(function(x){ var i=ACT.push(x)-1, dim=x[3]==='off'&&!o;
        return '<button type="button" data-i="'+i+'" style="--c:'+x[2]+'"'+(dim?' class="dim" aria-label="'+x[1]+' (Off-road, tap to switch)"':'')+'><em aria-hidden="true">'+x[0]+'</em><span>'+x[1]+'</span></button>' }).join('')+'</div>' }).join('')+
      '<button type="button" class="sos" data-t="t_rescue" style="width:100%;text-align:left;color:#eef1f5"><span class="ib">'+svg('buoy',18,'#0a0d10')+'</span><span><b>In danger? Call 911</b><small>Rescue card shows your exact spot</small></span></button></div>';
    S.hidden=false }
  window.addEventListener('click',function(e){ var b=e.target&&e.target.closest&&e.target.closest('#toolbtn'); if(!b||!document.body.classList.contains('awshell')) return;
    e.stopPropagation(); e.preventDefault(); document.body.classList.remove('toolon'); open() },true);
  window.__awTools={open:open};
})();
