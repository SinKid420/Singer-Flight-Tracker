// AwareBC main screen (by Josh Singer): the clean layout. More map, fewer buttons.
// Top: one search bar with the On-road / Off-road switch, two status chips, the compass (kept). Right: Layers. Bottom: Ask Aware (Off-road), My spot,
// and a tab bar: Map · Alerts · Tools (On-road) / Rig Link (Off-road) · Me. Every old button still exists and still works; this only re-arranges them.
// Set localStorage aw-oldui=1 to get the old layout back.
(function(){
  var OLD=false; try{ OLD=localStorage.getItem('aw-oldui')==='1' }catch(e){} if(OLD) return;
  var A=window.__AW; if(!A||!A.map) return;
  document.body.classList.add('awshell');
  function $(i){ return document.getElementById(i) }
  function click(i){ var e=typeof i==='string'?$(i):i; if(e) e.click() }
  function off(){ return document.body.classList.contains('fsron') }
  var IC={search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',map:'<path d="M9 4.5L3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z"/><path d="M9 4.5v13M15 6.5v13"/>',bell:'<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    radio:'<rect x="4" y="9" width="16" height="11.5" rx="2.5"/><path d="M7 9l9-5"/><circle cx="9" cy="14.7" r="2.2"/><path d="M14 13h3M14 16.5h3"/>',tool:'<path d="M14.5 5.5a4 4 0 0 0 4.8 4.8L11 18.6a2 2 0 0 1-2.8-2.8l8.3-8.3"/>',me:'<circle cx="12" cy="8" r="3.6"/><path d="M5 20c1-3.6 3.8-5.6 7-5.6s6 2 7 5.6"/>',
    temp:'<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/>',ok:'<circle cx="12" cy="12" r="8.5"/><path d="M8 12.3l2.8 2.8L16.3 9.6"/>',warn:'<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.2v.1"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.4 1a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.6A7.6 7.6 0 0 0 7 6.6l-2.4-1-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.4-1a7.6 7.6 0 0 0 2.6 1.5l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 2.6-1.5l2.4 1 2-3.4z"/>',
    friends:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.8-3.2 3-5 5.5-5s4.7 1.8 5.5 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c2.2.2 4 1.8 4.6 4.8"/>',key:'<rect x="4" y="5" width="16" height="14" rx="2.5"/><path d="M8 10h8M8 14h5"/>',
    rot:'<path d="M12 3l6.5 17L12 16l-6.5 4z"/>',flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',chev:'<path d="M9 6l6 6-6 6"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>'};
  function ic(n,s){ return '<svg viewBox="0 0 24 24" width="'+(s||22)+'" height="'+(s||22)+'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>' }

  var css=
  /* old pieces that moved: title, clock, mode pills, search, settings, friends, reports, rig link, rotate, tools, map key, zoom, temperature dial, back by */
  'body.awshell .pill,body.awshell .chips,body.awshell #srch,body.awshell #gear,body.awshell #frbtn,body.awshell #trbtn,body.awshell #rlbtn,body.awshell #rotbtn,body.awshell #toolbtn,body.awshell #keybtn,body.awshell .leaflet-control-zoom,body.awshell .tempctl,body.awshell #bbbtn{display:none!important}'+
  'body.awshell .legends{display:none!important}body.awshell.awkey .legends{display:block!important;bottom:150px!important;top:auto!important}'+
  /* stays: compass (top right), Layers (right), My spot (bottom right, above the tabs), Ask Aware (bottom left) */
  'body.awshell #menubtn{top:calc(env(safe-area-inset-top,0px) + 128px)!important;right:14px!important}'+
  'body.awshell #locate{top:auto!important;left:auto!important;right:14px!important;bottom:calc(env(safe-area-inset-bottom,0px) + 108px)!important}'+
  'body.awshell #awbtn{bottom:calc(env(safe-area-inset-bottom,0px) + 92px)!important}'+
  'body.awshell.fsron:not(.awkey):not(.fsrp):not(.navon):not(.srchon):not(.trcard):not(.awon) #awbtn{display:flex!important}'+
  'body.awshell .leaflet-bottom{bottom:calc(env(safe-area-inset-bottom,0px) + 64px)}'+
  'body.awshell.menuon #locate,body.awshell.menuon #awbtn{visibility:hidden}'+
  'body.awshell #tutarrow{top:calc(env(safe-area-inset-top,0px) + 128px)!important}'+
  /* top bar */
  '#awtop{position:fixed;z-index:1005;left:12px;top:calc(env(safe-area-inset-top,0px) + 12px);right:96px;height:46px;display:flex;align-items:center;gap:8px;padding:0 4px 0 12px;border-radius:16px;background:rgba(23,26,30,.94);border:1px solid #2a2f36;box-shadow:0 4px 14px rgba(0,0,0,.45);color:#8b929c}'+
  '#awtop .sr{flex:1;min-width:0;display:flex;align-items:center;gap:8px;height:100%;border:0;background:none;color:#8b929c;font:500 14px var(--font,system-ui);padding:0}'+
  '#awtop .md{display:flex;background:#0a0b0d;border-radius:11px;padding:3px;flex:none}#awtop .md button{border:0;background:none;color:#8b929c;padding:7px 8px;border-radius:8px;font:700 11.5px var(--font,system-ui)}#awtop .md button.on{background:#ff453a;color:#fff}'+
  '#awchips{position:fixed;z-index:1004;left:12px;right:96px;top:calc(env(safe-area-inset-top,0px) + 66px);display:flex;gap:6px;flex-wrap:wrap;pointer-events:none}'+
  '#awchips button{pointer-events:auto;display:inline-flex;align-items:center;gap:5px;max-width:100%;padding:6px 10px;border-radius:12px;border:1px solid #2a2f36;background:rgba(23,26,30,.9);color:#eef0f3;font:650 11.5px var(--font,system-ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '#awchips button[hidden]{display:none}#awchips .c1 svg{color:#64d2ff}#awchips .ok svg{color:#32d74b}#awchips .w1 svg{color:#ffb340}#awchips .w2 svg{color:#ff453a}'+
  /* tab bar */
  '#awtabs{position:fixed;z-index:1005;left:0;right:0;bottom:0;height:calc(env(safe-area-inset-bottom,0px) + 64px);padding-bottom:env(safe-area-inset-bottom,0px);display:flex;background:#14171b;border-top:1px solid #23272d}'+
  '#awtabs button{flex:1;border:0;background:none;color:#8b929c;display:grid;justify-items:center;align-content:center;gap:3px;font:600 11px var(--font,system-ui);position:relative}#awtabs button.on{color:#ff453a;font-weight:700}'+
  '#awtabs .bd{position:absolute;top:8px;left:50%;margin-left:6px;width:10px;height:10px;border-radius:50%;background:#ff453a;border:2px solid #14171b}#awtabs .bd[hidden]{display:none}'+
  'body.navon #awtabs,body.navon #awtop,body.navon #awchips{display:none}'+
  'body.srchon #awtop,body.srchon #awchips{visibility:hidden}'+
  /* Me sheet */
  '#awme{position:fixed;inset:0;z-index:5900;background:rgba(0,0,0,.45);display:flex;align-items:flex-end}#awme[hidden]{display:none}'+
  '#awme .in{width:100%;background:#15181d;border-radius:20px 20px 0 0;padding:10px 14px calc(env(safe-area-inset-bottom,0px) + 14px);max-height:85vh;overflow:auto}'+
  '#awme .gr{width:40px;height:4px;border-radius:2px;background:#3a3f47;margin:0 auto 10px}#awme h3{display:flex;align-items:center;font:800 19px var(--font,system-ui);color:#fff;margin:0 2px 10px}'+
  '#awme h3 button{margin-left:auto;width:40px;height:40px;border-radius:50%;border:0;background:#2c2c2e;color:#fff;display:grid;place-items:center}'+
  '#awme .ls{background:#1e2227;border-radius:16px;overflow:hidden}#awme .ls button{width:100%;display:flex;align-items:center;gap:12px;padding:0 14px;height:54px;border:0;background:none;color:#eef0f3;font:600 15px var(--font,system-ui);text-align:left;border-top:1px solid #2a2f36}'+
  '#awme .ls button:first-child{border-top:0}#awme .ls button span{flex:1}#awme .ls button em{font-style:normal;color:#8b929c;font:500 13px var(--font,system-ui)}#awme .ls button>svg:last-child{color:#5b626c}'+
  '#awme .ft{text-align:center;color:#8b929c;font:500 12px var(--font,system-ui);margin-top:12px}#awme .ft b{color:#fff}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  // ---- top bar: search + mode switch ----
  var top=document.createElement('div'); top.id='awtop';
  top.innerHTML='<button type="button" class="sr" aria-label="Search places, trails and roads">'+ic('search',20)+'<span>Search</span></button><div class="md" role="group" aria-label="Map mode"><button type="button" data-m="sat">On-road</button><button type="button" data-m="fsr">Off-road</button></div>';
  document.body.appendChild(top);
  top.querySelector('.sr').onclick=function(){ click('srch') };
  top.querySelector('.md').onclick=function(e){ var b=e.target.closest('button'); if(!b) return; var s=document.querySelector('.seg button[data-b="'+b.getAttribute('data-m')+'"]'); if(s) s.click(); setTimeout(paint,60) };

  // ---- status chips: temperature now, and alerts near you (from the Emergency hub) ----
  var chips=document.createElement('div'); chips.id='awchips';
  chips.innerHTML='<button type="button" class="c1" hidden aria-label="Temperature now"></button><button type="button" class="c2" hidden aria-label="Alerts near you"></button>';
  document.body.appendChild(chips);
  chips.querySelector('.c2').onclick=function(){ click('hubbtn') };

  // ---- tab bar ----
  var tabs=document.createElement('nav'); tabs.id='awtabs'; tabs.setAttribute('aria-label','Main');
  tabs.innerHTML='<button type="button" class="on" data-t="map">'+ic('map',23)+'Map</button><button type="button" data-t="alerts">'+ic('bell',23)+'Alerts<i class="bd" hidden></i></button><button type="button" data-t="mid"></button><button type="button" data-t="me">'+ic('me',23)+'Me</button>';
  document.body.appendChild(tabs);
  tabs.onclick=function(e){ var b=e.target.closest('button'); if(!b) return; var t=b.getAttribute('data-t');
    if(t==='map'){ if(M) M.hidden=true; return }
    if(t==='alerts'){ click('hubbtn'); return }
    if(t==='mid'){ if(off()) click('rlbtn'); else click('toolbtn'); return }
    if(t==='me'){ me(true) } };

  // ---- Me: settings, friends and the rest of the old buttons ----
  var M=null;
  function me(show){ if(!M){ M=document.createElement('div'); M.id='awme'; M.setAttribute('role','dialog'); M.setAttribute('aria-label','Me'); document.body.appendChild(M);
      M.addEventListener('click',function(e){ if(e.target===M||e.target.closest('[data-a=x]')){ M.hidden=true; return } var b=e.target.closest('[data-g]'); if(!b) return; var g=b.getAttribute('data-g');
        if(g==='rot'||g==='key'||g==='rep'){ if(g==='rot') click('rotbtn'); if(g==='key'){ var k=document.body.classList.toggle('awkey'); if(document.body.classList.contains('keyon')!==k) click('keybtn') } if(g==='rep') click('trbtn'); setTimeout(fill,120); return }
        M.hidden=true; setTimeout(function(){ click(g) },60) }) }
    fill(); M.hidden=!show }
  function fill(){ if(!M) return; var name=''; try{ name=localStorage.getItem('sky-trname')||'' }catch(e){}
    var rot=$('rotbtn'), rp=$('trbtn');
    var rows=[['gear','gear','Settings',''],['frbtn','friends','Friends','']];
    if(off()) rows.push(['bbbtn','clock','Back by','']);
    rows.push(['rot','rot','Turn map with me',rot&&rot.getAttribute('aria-pressed')==='true'?'On':'Off']);
    rows.push(['key','key','Map key',document.body.classList.contains('awkey')?'Shown':'Hidden']);
    if(off()&&rp) rows.push(['rep','flag','Trail reports on the map',rp.classList.contains('off')?'Hidden':'Shown']);
    M.innerHTML='<div class="in"><div class="gr"></div><h3>'+(name?esc(name):'Me')+'<button type="button" data-a="x" aria-label="Close">'+ic('x',18)+'</button></h3><div class="ls">'+
      rows.map(function(r){ return '<button type="button" data-g="'+r[0]+'">'+ic(r[1],22)+'<span>'+r[2]+'</span>'+(r[3]?'<em>'+r[3]+'</em>':ic('chev',18))+'</button>' }).join('')+
      '</div><div class="ft"><b>AwareBC</b> · created by Josh Singer</div></div>' }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] }) }

  // ---- keep everything in step with the app ----
  function paint(){ var o=off();
    [].forEach.call(top.querySelectorAll('.md button'),function(b){ b.classList.toggle('on',(b.getAttribute('data-m')==='fsr')===o) });
    var mid=tabs.querySelector('[data-t=mid]'), want=o?'rl':'tl'; if(mid.__k!==want){ mid.__k=want; mid.innerHTML=o?ic('radio',23)+'Rig Link':ic('tool',23)+'Tools' }
    var tv=$('tval'), c1=chips.querySelector('.c1'); if(tv&&/\d/.test(tv.textContent)){ c1.hidden=false; c1.innerHTML=ic('temp',14)+tv.textContent+($('tcap')&&/F/.test($('tcap').textContent)?'F':'C')+' now' } else c1.hidden=true;
    var lv=window.__hub&&window.__hub.level&&window.__hub.level(), c2=chips.querySelector('.c2'), bd=tabs.querySelector('.bd');
    if(lv){ c2.hidden=false; c2.className='c2 '+(lv.L>=2?'w2':lv.L===1?'w1':'ok'); c2.innerHTML=ic(lv.L?'warn':'ok',14)+(lv.L?esc(lv.why):'No alerts near you'); bd.hidden=!lv.L } else { c2.hidden=true; bd.hidden=true }
    if(M&&!M.hidden) fill() }
  try{ new MutationObserver(paint).observe(document.body,{attributes:true,attributeFilter:['class']}) }catch(e){}
  setInterval(paint,4000); setTimeout(paint,300); setTimeout(paint,2500);
  window.__shell={paint:paint, me:me};
})();
