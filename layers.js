/* AwareBC Layers page + bigger mode switch (by Josh Singer).
   Layers = only things drawn on the map, as glowing tiles in groups. Layers for the other mode stay listed but dimmed (tap to switch).
   A tip at the top reminds riders that lots of layers clutter the map; at 7 or more (11 in Off-road, where the light road lines start on) it turns into a red "map may get busy" warning. */
(function boot(){
  if(!document.body||!document.getElementById('menubtn')||!document.getElementById('awtop')){ return setTimeout(boot,300) }
  var F='var(--font,system-ui)';
  function $(i){ return document.getElementById(i) }
  function shell(){ return document.body.classList.contains('awshell') }
  function off(){ return document.body.classList.contains('fsron') }
  var SVG={road:'<path d="M8 21l2-18M16 21l-2-18M12 6v2M12 11v2M12 16v2"/>',mtn:'<path class="f" d="M3 20l5-11 4 6 3-4 6 9z"/><path d="M3 20l5-11 4 6 3-4 6 9z"/>',lyr:'<path class="f" d="M12 3l9 5-9 5-9-5z"/><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12.5l9 5 9-5M3 16.5l9 5 9-5"/>'};
  /* roads, trails, creeks etc. show the same coloured line as on the map (copied from the Off-road map list), so the tile matches what you see */
  function lineIc(t){ if(t[4]!=='sel') return t[1]; var g=document.querySelector('.lyrp .fpc button[data-s="'+t[5]+'"] .awln svg'); if(!g) return t[1];
    return g.outerHTML.replace(/width="22" height="22"/,'width="24" height="22" style="display:block;transform:scale(1.25)"') }
  function ic(n,s){ return '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:'+s+'px;height:'+s+'px">'+SVG[n]+'</svg>' }

  var css=
  /* ---- bigger On-road / Off-road switch in the search bar (option 1) ---- */
  'body.awshell #awtop{height:56px;border-radius:18px;padding:0 6px 0 14px;background:rgba(20,24,30,.94);border-color:rgba(255,255,255,.1)}'+
  'body.awshell #awtop .md{gap:4px;padding:4px;border-radius:14px;background:#0b0e12}body.awshell #awtop .md button{height:40px;padding:0 11px;border-radius:11px;font:800 13.5px '+F+';white-space:nowrap;color:#9aa3ad}'+
  'body.awshell #awtop .md button[data-m=sat].on{background:linear-gradient(180deg,#64d2ff,#2a8fb8);color:#04121a;box-shadow:0 4px 14px rgba(100,210,255,.45),inset 0 1px 0 rgba(255,255,255,.4)}'+
  'body.awshell #awtop .md button[data-m=fsr].on{background:linear-gradient(180deg,#ff6a5f,#d0281d);color:#fff;box-shadow:0 4px 14px rgba(255,69,58,.45),inset 0 1px 0 rgba(255,255,255,.35)}'+
  'body.awshell #awtop .sr svg{flex:none}@media (max-width:400px){body.awshell #awtop .sr span{display:none}}body.awshell #awchips{top:calc(env(safe-area-inset-top,0px) + 76px)}'+
  /* ---- Layers page ---- */
  '#awlyr{position:fixed;inset:0;z-index:6050;background:rgba(0,0,0,.35);display:flex;align-items:flex-end}#awlyr[hidden]{display:none}'+
  '#awlyr .in{width:100%;max-height:calc(100% - 70px);overflow-y:auto;box-sizing:border-box;border-radius:24px 24px 0 0;padding:10px 14px 10px;color:#eef1f5;font-family:'+F+';background:radial-gradient(80% 30% at 50% 0%,rgba(100,210,255,.12),transparent 70%),#0d1015;border-top:1px solid rgba(255,255,255,.08);box-shadow:0 -14px 30px rgba(0,0,0,.5)}'+
  'body.awshell #awlyr{bottom:calc(env(safe-area-inset-bottom,0px) + 62px)}body.awshell #awlyr .in{max-height:calc(100vh - 76px)}'+
  '#awlyr .hd{display:flex;gap:11px;align-items:center}#awlyr .bd{width:48px;height:48px;flex:none;border-radius:16px;display:grid;place-items:center;background:linear-gradient(145deg,#64d2ff,#2a8fb8);box-shadow:0 4px 14px rgba(100,210,255,.45),inset 0 1px 0 rgba(255,255,255,.4)}'+
  '#awlyr .bd svg{fill:none;stroke:#04121a;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}#awlyr .bd .f{fill:#04121a;fill-opacity:.28;stroke:none}'+
  '#awlyr .t{flex:1;min-width:0}#awlyr .t b{display:block;font:800 23px '+F+';letter-spacing:-.3px}#awlyr .t small{display:block;font:600 13.5px '+F+';color:#b8c2cc;margin-top:2px}'+
  '#awlyr .x{flex:none;width:34px;height:34px;border:0;border-radius:50%;background:rgba(255,255,255,.08);color:#c2c9d1;font-size:14px}'+
  '#awlyr .tip{display:flex;gap:8px;align-items:center;margin-top:8px;padding:5px 10px;border-radius:12px;background:rgba(255,179,64,.1);border:1px solid rgba(255,179,64,.28);font:500 11.5px/1.35 '+F+';color:#d5dbe3}#awlyr .tip b{color:#ffc966}'+
  '#awlyr small .tip,#awlyr small .tip.busy{display:inline;margin:0;padding:0;border:0;background:none;box-shadow:none;font:inherit;color:#ff9f0a}#awlyr .tip.busy{background:rgba(255,69,58,.12);border-color:rgba(255,69,58,.45);box-shadow:0 0 14px rgba(255,69,58,.18)}#awlyr .tip.busy b{color:#ff8a80}'+
  '#awlyr .gh{display:flex;justify-content:space-between;align-items:baseline;font:800 14px '+F+';color:#eef1f5;margin:5px 0 5px}#awlyr .gh a{font:700 11.5px '+F+';color:#64d2ff;text-decoration:none}'+
  '#awlyr .ly{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}#awlyr .ly.c3{grid-template-columns:repeat(3,minmax(0,1fr))}#awlyr .cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;align-items:start}#awlyr .cols .ly,#awlyr .cols .ly.c3{grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}#awlyr .ly button{position:relative;height:64px;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:0 2px;font:700 12px/1.1 '+F+';color:#d5dbe3;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}#awlyr .morerow{display:flex;align-items:center;width:100%;min-height:46px;margin-top:10px;padding:0 12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);color:#eef1f5;font:800 14px '+F+'}#awlyr .morerow span{margin-left:auto;font:600 12.5px '+F+';color:#64d2ff}#awlyr .morehint{display:block;color:#8b96a1;font:500 11.5px/1.3 '+F+';margin:4px 2px 2px}#awlyr .ly button{height:auto!important;min-height:64px;padding:8px 3px!important}#awlyr .ly button.hasage{gap:3px}#awlyr .ly button .age{display:block;font:600 10.5px/1.1 '+F+';color:#64d2ff}#awlyr .ly button span{white-space:normal;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;text-align:center;max-width:100%}#awlyr .ly button .age.old{color:#ffb340}'+
  '#awlyr .ly em{font-style:normal;font-size:22px;line-height:1}#awlyr .ly span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
  '#awlyr .ly .on{border-color:rgba(100,210,255,.55);background:linear-gradient(180deg,rgba(100,210,255,.22),rgba(100,210,255,.06));color:#fff;box-shadow:0 0 12px rgba(100,210,255,.25)}'+
  '#awlyr .ly .on:after{content:"";position:absolute;right:7px;top:7px;width:6px;height:6px;border-radius:50%;background:#32d74b;box-shadow:0 0 6px #32d74b}#awlyr .ly .dim{opacity:.38}'+
  '#awlyr .mo{display:flex;gap:6px}#awlyr .mo button{flex:1;min-width:0;height:48px;border-radius:13px;display:flex;align-items:center;justify-content:center;gap:5px;font:700 12.5px '+F+';color:#c2c9d1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);white-space:nowrap}'+
  '#awlyr .mo button.on{border-color:rgba(100,210,255,.55);color:#fff;background:rgba(100,210,255,.12)}#awlyr .mo small{font:600 10.5px '+F+';color:#64d2ff}#awlyr .mo button[data-a=look]{flex-direction:column;gap:1px}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  // ---- what each tile does ----
  function pressed(id){ var b=$(id); return !!b&&(b.getAttribute('aria-pressed')==='true'||b.classList.contains('on')) }
  function selOn(id){ var s=$(id); return !!s&&s.value!=='0' }
  function setSel(id,v){ var s=$(id); if(!s) return; s.value=v; s.dispatchEvent(new Event('change')) }
  function rainOn(){ var s=$('radop'); return !!s&&+s.value>=0.2 }
  var TL=[ // [key, emoji, name, mode on|off|both, kind, id]
    ['road','🚗','DriveBC','both','btn','roadbtn'],['stores','🛒','Stores','on','stores',''],['ferry','⛴️','Ferries','on','btn','ferrybtn'],['apt','🛫','Airports','on','btn','aptbtn'],
    ['fsr','<svg viewBox="0 0 24 24" style="width:1.15em;height:1.15em;vertical-align:-.2em"><path d="M2 13l5-7 4 5 3-3 8 5z" fill="#5d6b78"/><path d="M5 22c2-4 9-3 9-6s-4-3-2-5h1.5c-1.5 2 3 2.5 3 5 0 3.5-6 3-6.5 6z" fill="#a0703c"/><path d="M8 21.5c1.5-2.5 6-2.6 6.6-5" stroke="#6e4a24" stroke-width=".8" fill="none" stroke-dasharray="1 1"/></svg>','FSRs','off','sel','s_fsrFsr'],['back','<svg viewBox="0 0 24 24" style="width:1.15em;height:1.15em;vertical-align:-.2em"><path d="M2 16l3-8 3 8zM16 15l3-8 3 8z" fill="#3f7d3a"/><path d="M3 22c3-2 5-3 7-5s2.5-5 2.2-8h1.6c.3 3 .8 6 2.2 8s4 3 7 5z" fill="#a0703c"/><circle cx="7" cy="20" r=".6" fill="#c9a06a"/><circle cx="17" cy="20.5" r=".6" fill="#c9a06a"/><path d="M12.9 10v1.4M12.9 13.4v1.4M12.6 17v1.6" stroke="#6e4a24" stroke-width=".8"/></svg>','Back roads','off','sel','s_fsrRoad'],['motor','🛻','4×4 trails','off','sel','s_fsrMotor'],['close','🚧','Closures','both','sel','s_fsrClose'],
    ['camp','🏕️','Rec sites','both','sel','s_fsrCamp'],['creek','<svg viewBox="0 0 24 24" style="width:1.15em;height:1.15em;vertical-align:-.2em"><path d="M2 20c4-1 5-5 9-6s5-4 11-5" stroke="#3d8fd1" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M4 19.5c3-1 4.5-4 7-5M13 12.5c2.5-1.5 4-2.8 7-3.3" stroke="#a8d4f5" stroke-width=".8" fill="none"/><circle cx="6" cy="14" r="1.2" fill="#8a8f96"/><circle cx="17" cy="15" r="1.4" fill="#8a8f96"/><circle cx="19.5" cy="15.5" r=".8" fill="#8a8f96"/></svg>','Creeks','both','sel','s_water'],['trail','🥾','Trails','both','sel','s_fsrOsm'],['rep','🚩','Trail reports','off','btn','trbtn'],
    ['fire','🔥','Wildfires','both','btn','firebtn'],['lt','⚡','Lightning','both','btn','ltbtn'],['rain','🌧️','Rain radar','both','rain',''],['mt','❄️','Snow','both','btn','mtbtn'],
    ['bcts','🪵','Timber sales','off','sel','s_fsrBcts'],['plan','📐','Planned roads','off','sel','s_fsrPlan'],['gps','🛰️','GPS traces','both','sel','s_gpsTr'],['plane','✈️','Planes','both','btn','planebtn'],['smoke','🌫️','Smoke','both','sel','aw_smoke'],['cloud','☁️','Clouds','both','sel','cloudop'],['space','🛰️','Space','both','open','spacebtn']];
  var K={}; TL.forEach(function(t){ K[t[0]]=t });
  function isOn(t){ if(t[0]==='stores') return !!(window.__gl&&window.__gl.stores&&window.__gl.stores()); if(t[0]==='smoke') return selOn('aw_smoke')&&pressed('firebtn'); /* smoke only shows with Wildfires on */ return t[4]==='open'?false:t[4]==='btn'?pressed(t[5]):t[4]==='sel'?selOn(t[5]):rainOn() }
  function exists(t){ return t[4]==='stores'?!!(window.__gl&&window.__gl.setStores):t[4]==='rain'?!!$('radop'):!!$(t[5]) }
  function hereOk(t){ return t[3]==='both'||(t[3]==='off')===off() }
  function toggle(t){ if(t[0]==='stores'){ if(window.__gl&&window.__gl.setStores) window.__gl.setStores(!isOn(t)); return } if(t[0]==='smoke'){ var on=isOn(t); if(on) setSel('aw_smoke','0'); else { setSel('aw_smoke','1'); if(!pressed('firebtn')){ var fb=$('firebtn'); if(fb) fb.click() } } return } /* smoke on turns Wildfires on too */ if(t[0]==='cloud'){ setSel('cloudop',selOn('cloudop')?'0':'0.5'); return } /* clouds: off, or 50% */ if(t[4]==='btn'){ var b=$(t[5]); if(b) b.click() } else if(t[4]==='sel') setSel(t[5],selOn(t[5])?'0':'1'); else setSel('radop',rainOn()?'0.05':'0.6') }
  function groups(){ var o=off();
    /* two groups: what's happening now (live), and the roads and land (what was in the Off-road map list) */
    return [['Live',o?['fire','smoke','lt','rain','cloud','mt','plane','rep','road','space']:['fire','smoke','lt','rain','cloud','mt','plane','space']],[o?'Roads &amp; land':'Roads &amp; travel',o?['fsr','back','motor','bcts','plan','close','camp','creek','trail','gps']:['road','stores','ferry','apt','close','camp','creek','trail','fsr']]].map(function(g){ return [g[0],g[1].filter(function(k){ return exists(K[k]) }),g[2]] }) }
  function moreOpen(){ try{ return localStorage.getItem('aw-lyrmore')==='1' }catch(e){ return false } }

  var S=null;
  setInterval(function(){ if(S&&!S.hidden&&S.querySelector('.age')) paint() },30000); /* keep "4 min ago" current while Layers is open */
  /* big phone text (Android font size): when names don't fit in 4 columns, use 3 so nothing is cut off */
  function fitCols(){ var g=S&&S.querySelectorAll('.ly'); if(!g||!g.length) return; [].forEach.call(g,function(x){ x.classList.remove('c3') });
    var cut=[].some.call(S.querySelectorAll('.ly button span'),function(sp){ return sp.scrollWidth>sp.clientWidth+1 }); if(cut) [].forEach.call(g,function(x){ x.classList.add('c3') }) }
  function paint(){ if(!S||S.hidden) return; var G=groups(), n=0;
    G.forEach(function(g){ g[1].forEach(function(k){ if(hereOk(K[k])&&isOn(K[k])) n++ }) });
    var lk='classic'; try{ lk=localStorage.getItem('aw-look')==='new'?'new':'classic' }catch(e){}
    S.querySelector('.in').innerHTML='<div class="hd"><span class="bd">'+ic('lyr',27)+'</span><span class="t"><b>Layers</b><small>What shows on the map · '+n+' on'+(n>=(off()?11:7)?' <span class="tip busy" role="status">· may run slower</span>':'')+'</small></span><button type="button" class="x" data-a="x" aria-label="Close">✕</button></div>'+
      (function(P){ /* Live on the left, roads and land on the right: two columns side by side */ return '<div class="cols"><div class="col">'+P[0]+'</div><div class="col">'+(P[1]||'')+'</div></div>'+P.slice(2).join('') })(G.map(function(g,gi){ if(g[2]&&!g[1].length) return ''; if(g[2]&&!moreOpen()){ var mon=g[1].filter(function(k){ return hereOk(K[k])&&isOn(K[k]) }).length; /* "More": folded away until tapped */
          return '<button type="button" class="morerow" data-a="mtog"><b>'+g[0]+'</b><span>'+(mon?mon+' on · ':'')+'Show '+g[1].length+' ›</span></button><small class="morehint">'+g[2]+'</small>' }
        return '<div class="gh"><span>'+g[0]+'</span>'+(g[2]?'<a href="#" data-a="mtog">Hide ‹</a>':'')+'</div><div class="ly">'+g[1].map(function(k){ var t=K[k], ok=hereOk(t), on=ok&&isOn(t);
        var F=window.__fresh, dn=on&&F&&F.down&&F.down(k), age=on&&F&&F.get(k)?(dn?'Couldn\'t check':F.ago(k)):(dn?'Couldn\'t check':''), st=age&&(dn||F.stale(k)); /* how fresh this layer's data is; "Couldn't check" when its source isn't answering */
        return '<button type="button" data-k="'+k+'" class="'+(on?'on':'')+(ok?'':' dim')+(age?' hasage':'')+'" aria-pressed="'+on+'"'+(ok?'':' aria-label="'+t[2]+' ('+(t[3]==='off'?'Off-road':'On-road')+' only, tap to switch)"')+'><em aria-hidden="true">'+lineIc(t)+'</em><span>'+t[2]+'</span>'+(age?'<small class="age'+(st?' old':'')+'">'+age+'</small>':'')+'</button>' }).join('')+'</div>' }))+
      '<div class="gh"><span>Map options</span><a href="#" data-a="more">All map layers ›</a></div><div class="mo"><button type="button" data-a="key"'+(document.body.classList.contains('awkey')?' class="on"':'')+'>🗝️ Map key</button><button type="button" data-a="rot"'+(pressed('rotbtn')?' class="on"':'')+'>🧭 Auto-rotate</button><button type="button" data-a="look">🎨 Map look <small>'+(lk==='new'?'New':'Classic')+'</small></button></div>'; fitCols() }
  function open(){ if(!S){ S=document.createElement('div'); S.id='awlyr'; S.hidden=true; S.setAttribute('role','dialog'); S.setAttribute('aria-label','Layers'); S.innerHTML='<div class="in"></div>'; document.body.appendChild(S);
      S.addEventListener('click',function(e){ if(e.target===S){ close(); return } var b=e.target.closest&&e.target.closest('[data-k],[data-a]'); if(!b) return; e.preventDefault();
        var a=b.getAttribute('data-a');
        if(a==='x') return close();
        if(a==='mtog'){ try{ localStorage.setItem('aw-lyrmore',moreOpen()?'0':'1') }catch(x){} paint(); return }
        if(a==='more'){ close(); var sb=document.querySelector('.seg button[data-b='+(off()?'fsr':'sat')+']'); if(sb) sb.click(); return }
        if(a==='key'){ var k=document.body.classList.toggle('awkey'); if(document.body.classList.contains('keyon')!==k&&$('keybtn')) $('keybtn').click(); return paint() }
        if(a==='rot'){ if($('rotbtn')) $('rotbtn').click(); return setTimeout(paint,80) }
        if(a==='look'){ var cur='classic'; try{ cur=localStorage.getItem('aw-look')==='new'?'new':'classic'; localStorage.setItem('aw-look',cur==='new'?'classic':'new') }catch(x){} b.querySelector('small').textContent=cur==='new'?'Classic':'New'; setTimeout(function(){ location.reload() },400); return }
        var t=K[b.getAttribute('data-k')]; if(!t) return;
        if(!hereOk(t)){ var mb=document.querySelector('#awtop .md button[data-m='+(t[3]==='off'?'fsr':'sat')+']'); if(mb) mb.click(); setTimeout(function(){ if(!isOn(t)) toggle(t); setTimeout(paint,250) },700); return }
        if(t[4]==='open'){ close(); var ob=$(t[5]); if(ob) setTimeout(function(){ ob.click() },60); return }
        toggle(t); setTimeout(paint,120) }) }
    document.body.classList.remove('menuon','toolon','tuton'); S.hidden=false; paint() }
  function close(){ if(S) S.hidden=true }
  // in the new layout, the Layers button opens this page instead of the side list
  window.addEventListener('click',function(e){ var b=e.target&&e.target.closest&&e.target.closest('#menubtn'); if(!b||!shell()) return; e.stopPropagation(); e.preventDefault(); if(S&&!S.hidden) close(); else open() },true);
  // keep the page right when something else turns a layer on or off
  var pq=0; new MutationObserver(function(){ if(pq||!S||S.hidden) return; pq=1; setTimeout(function(){ pq=0; paint() },150) }).observe(document.body,{attributes:true,attributeFilter:['class']});
  window.__awLayers={open:open,close:close};
})();
