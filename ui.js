// AwareBC tidy controls (by Josh Singer): the On-road and Off-road layer panels get tabs (Layers · Opacity · Map) with a neat
// switch list, and every Show/Hide or On/Off choice in the app becomes the same slick on/off switch.
(function(){
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v) }catch(e){ return null } }
  var st=document.createElement('style'); st.textContent=
    /* every drop-down arrow one size bigger, same look and spacing everywhere */
    'select:is(#aw_a#aw_b#aw_c,select){-webkit-appearance:none!important;appearance:none!important;background-image:url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 12 8%22%3E%3Cpath d=%22M1.5 1.5 6 6l4.5-4.5%22 fill=%22none%22 stroke=%22%23c7ccd3%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E")!important;background-repeat:no-repeat!important;background-position:right 11px center!important;background-size:13px 9px!important;padding-right:32px!important}'+
    'select::-ms-expand{display:none}'+
    '.folder summary::after{content:""!important;width:13px;height:9px;flex:none;margin-right:4px;background:url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 12 8%22%3E%3Cpath d=%22M1.5 1.5 6 6l4.5-4.5%22 fill=%22none%22 stroke=%22%23c7ccd3%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E") center/13px 9px no-repeat;transform:none!important;transition:transform .2s}.folder[open]>summary::after{transform:rotate(180deg)!important}'+
    '.awar{display:inline-block;font-size:1.17em;line-height:1;margin-left:5px;vertical-align:-.04em}'+

    // the switch
    '.awsw{position:relative;flex:none;width:40px;height:24px;border-radius:12px;border:0;padding:0;background:#4a505a;transition:background .18s;cursor:pointer;margin-left:auto}'+
    '.awsw::after{content:"";position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.4);transition:transform .18s}'+
    '.awsw[aria-checked=true]{background:#30d158}.awsw[aria-checked=true]::after{transform:translateX(16px)}.awsw:disabled{opacity:.4}'+
    'select.awswsel{display:none!important}.awswrow{display:flex!important;align-items:center;justify-content:space-between;gap:10px}.awswrow>.awsw{margin-left:auto}.setrow .awsw{margin-top:9px;margin-bottom:9px}'+
    // layer panel tabs
    '.lyrp.tidy{max-height:calc(100vh - 112px);overflow-y:auto;overscroll-behavior:contain;padding:10px 10px 10px}'+
    '.lyrp .awtabs{display:flex;background:var(--chip,#22262c);border-radius:12px;padding:3px;margin:2px 0 8px}'+
    '.lyrp .awtabs button{flex:1;border:0;background:none;padding:7px 4px;border-radius:10px;font:700 13px var(--font,system-ui);color:var(--dim,#9aa4b2)}'+
    '.lyrp .awtabs button[aria-selected=true]{background:#3a3f47;color:#fff}'+
    '.lyrp.tidy .fpc{display:flex!important;flex-direction:column;gap:0;background:var(--chip,#22262c);border-radius:14px;padding:2px 10px}'+
    '.lyrp.tidy .fpc button{min-height:42px;border-radius:0;background:none;box-shadow:none!important;opacity:1;color:var(--fg,#fff);font:600 14px var(--font,system-ui);padding:0 2px;gap:10px;border-top:1px solid rgba(255,255,255,.07)}'+
    '.lyrp.tidy .fpc button:first-child{border-top:0}.lyrp.tidy .fpc i{width:18px}'+
    '.lyrp.tidy .fpc button::after{content:"";margin-left:auto;flex:none;width:40px;height:24px;border-radius:12px;background:#3a3f47 radial-gradient(circle at 12px 12px,#fff 8.5px,transparent 9.5px);transition:background .18s}'+
    '.lyrp.tidy .fpc button[aria-pressed=true]::after{background:#30d158 radial-gradient(circle at 28px 12px,#fff 8.5px,transparent 9.5px)}'+
    '.lyrp.tidy .fpc.fold button:nth-child(n+7){display:none}'+
    '.lyrp.tidy .fpc.hasmore{border-radius:14px 14px 0 0}.lyrp .awmore{display:block;width:100%;border:0;border-top:1px solid rgba(255,255,255,.07);background:var(--chip,#22262c);border-radius:0 0 14px 14px;color:var(--dim,#9aa4b2);font:700 13.5px var(--font,system-ui);min-height:40px}'+
    '.lyrp .awmap{display:flex;flex-direction:column;gap:2px;background:var(--chip,#22262c);border-radius:14px;padding:4px 10px}'+
    '.lyrp .awmap>*{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:40px;font:600 14px var(--font,system-ui);color:var(--fg,#fff);border-top:1px solid rgba(255,255,255,.07)}.lyrp .awmap>*:first-child{border-top:0}'+
    '.lyrp .awmap .gpxb{width:100%;height:40px;background:none;border-radius:0;padding:0;font:600 14px var(--font,system-ui);text-align:left}'+
    '.lyrp.tidy .fps{min-height:40px;margin:0;padding:0 10px;background:var(--chip,#22262c);border-radius:0;font:600 13.5px var(--font,system-ui);border-top:1px solid rgba(255,255,255,.07)}'+
    '.lyrp.tidy .fps select,.lyrp .awmap select{background:#3a3f47}'+
    '.lyrp.tidy .fps2{display:flex;align-items:center;gap:8px}.lyrp .awmap .fps{padding:0;background:none;border-radius:0;margin:0}'+
    '.lyrp.tL .fps,.lyrp.tL .awmap,.lyrp.tL .gpxv,.lyrp.tO .fpc,.lyrp.tO .awmore,.lyrp.tO .awmap,.lyrp.tO .gpxv,.lyrp.tO .fpm,.lyrp.tM .fpc,.lyrp.tM .awmore,.lyrp.tM .fps:not(.fpm){display:none!important}'+
    '.lyrp.tO .fps.f1{border-radius:14px 14px 0 0;border-top:0}.lyrp.tO .fps.fz{border-radius:0 0 14px 14px}.lyrp.tO .fps.f1.fz{border-radius:14px}'+
    '.lyrp.tM .fpm{border-radius:14px;margin-top:8px;border-top:0}.lyrp.tM .gpxv{margin-top:8px}';
  st.textContent+=':root{--aw-sheet:#15181d;--aw-card:#22262c;--aw-line:rgba(255,255,255,.07);--aw-r:16px}.sheet{background:var(--aw-sheet)!important;border-radius:22px 22px 0 0!important;position:relative;padding-top:20px!important}.sheet::before{content:"";position:absolute;left:50%;top:8px;transform:translateX(-50%);width:40px;height:5px;border-radius:3px;background:#3a3f47}#fsheet .sheet:not(.fopen){display:block!important}#fsheet .sheet:not(.fopen) .sethd{margin:16px 6px 6px!important;color:#ff6a5f!important}#fsheet .sheet:not(.fopen) details.folder{background:var(--aw-card)!important;border-radius:0!important;margin:0!important;border-top:1px solid var(--aw-line)}#fsheet .sheet:not(.fopen) .sethd+details.folder{border-radius:var(--aw-r) var(--aw-r) 0 0!important;border-top:0}#fsheet .sheet:not(.fopen) details.folder:has(+ .sethd),#fsheet .sheet:not(.fopen) details.folder:last-of-type{border-radius:0 0 var(--aw-r) var(--aw-r)!important}#fsheet .sheet:not(.fopen) .sethd+details.folder:has(+ .sethd){border-radius:var(--aw-r)!important}#fsheet .sheet:not(.fopen) .folder summary{font-size:15px!important;min-height:50px;padding:0 14px!important}#fsheet .folder summary::before{content:var(--ic,"⚙️");margin-right:12px;font-size:18px}#gfolder{--ic:"🧭"}#mefolder{--ic:"📍"}#wffolder{--ic:"⛈️"}#cfolder{--ic:"🧲"}#dirfolder{--ic:"🛣️"}#osmfolder{--ic:"⛽"}#rdfolder{--ic:"📷"}#bfolder{--ic:"⛴️"}#mtfolder{--ic:"🏔️"}#nrfolder{--ic:"🚙"}#pcfolder{--ic:"✈️"}#hbfolder{--ic:"🆘"}#acctfolder,#blkfolder{--ic:"👤"}#updfolder{--ic:"⬇️"}#crashfolder{--ic:"🧾"}#fsheet .folder summary{justify-content:flex-start!important}#fsheet .folder summary::after{margin-left:auto}.hubrow{background:var(--aw-card)!important;border-radius:0!important;margin:0!important;border-top:1px solid var(--aw-line)}.hubrow:not(.hubrow + .hubrow){border-radius:var(--aw-r) var(--aw-r) 0 0!important;border-top:0;margin-top:8px!important}.hubrow:not(:has(+ .hubrow)){border-radius:0 0 var(--aw-r) var(--aw-r)!important;margin-bottom:8px!important}#frsheet{background:var(--aw-sheet)!important;border-radius:22px 22px 0 0!important}#frsheet .frgrab{width:40px!important;height:5px!important;background:#3a3f47!important}#frsheet .frshare,#frsheet .frnote{background:var(--aw-card)!important;border-radius:var(--aw-r)!important}#frsheet .fradd input{background:var(--aw-card)!important;border-radius:var(--aw-r)!important}.sidebtn.ti::before{background:#1f242b!important;border:1px solid #2c323a;border-radius:14px!important;padding:9px 12px!important;font-weight:600!important}#fsheet details.folder[open]{background:var(--aw-card)!important;border-radius:var(--aw-r)!important}#fsheet details.folder[open] .setrow{background:#2b3038!important;border-radius:12px!important}#fsheet details.folder[open] .setrow select{background:#3a3f47!important}'; // one look: same cards, groups and pull handle as the Aware panel
  document.head.appendChild(st);

  // ---------- every two-way Show/Hide, On/Off, Yes/No choice becomes a switch ----------
  var PAIRS=[['show','hide'],['on','off'],['yes','no']], SW=[];
  function onIdx(sel){ if(sel.options.length!==2||sel.multiple) return -1; var a=sel.options[0].text.trim().toLowerCase(), b=sel.options[1].text.trim().toLowerCase();
    for(var i=0;i<PAIRS.length;i++){ if(a===PAIRS[i][0]&&b===PAIRS[i][1]) return 0; if(a===PAIRS[i][1]&&b===PAIRS[i][0]) return 1 } return -1 }
  function paint(o){ o.b.setAttribute('aria-checked',o.s.selectedIndex===o.i?'true':'false'); o.b.disabled=o.s.disabled }
  function wrap(sel){ if(sel.__awsw) return; var i=onIdx(sel); if(i<0) return;
    var b=document.createElement('button'); b.type='button'; b.className='awsw'; b.setAttribute('role','switch');
    var lab=sel.getAttribute('aria-label')||(sel.closest('label')&&sel.closest('label').textContent.replace(sel.textContent,'').trim())||''; if(lab) b.setAttribute('aria-label',lab);
    sel.parentNode.insertBefore(b,sel.nextSibling); sel.classList.add('awswsel'); var pr=sel.parentNode; if(pr&&pr.querySelectorAll('select').length===1&&!pr.classList.contains('fps2')) pr.classList.add('awswrow'); var o={s:sel,b:b,i:i}; sel.__awsw=o; SW.push(o); paint(o);
    b.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); if(sel.disabled) return; sel.selectedIndex=sel.selectedIndex===i?1-i:i; sel.dispatchEvent(new Event('input',{bubbles:true})); sel.dispatchEvent(new Event('change',{bubbles:true})); paint(o) });
    sel.addEventListener('change',function(){ paint(o) });
    var row=sel.closest('label'); if(row&&!row.__awsw){ row.__awsw=1; row.addEventListener('click',function(e){ if(e.target===b||e.target.closest('select,button,a,input')) return; var w=row.querySelector('.awsw'); if(w&&row.querySelectorAll('select').length===1){ e.preventDefault(); w.click() } }) } }
  function scan(root){ [].forEach.call((root||document).querySelectorAll('select'),wrap) }
  // other code sometimes changes a setting without telling the page: keep visible switches honest
  setInterval(function(){ SW.forEach(function(o){ if(o.b.offsetParent) paint(o) }) },1200);
  document.addEventListener('click',function(){ setTimeout(function(){ SW.forEach(function(o){ if(o.b.offsetParent) paint(o) }) },60) },true);

  // ---------- layer panels: Layers · Opacity · Map ----------
  function tidy(pn){ if(pn.__tidy) return; var hd=pn.querySelector('.fph'), fpc=pn.querySelector('.fpc'); if(!hd||!fpc) return; pn.__tidy=1; pn.classList.add('tidy');
    var key='aw-lt-'+(pn.getAttribute('aria-label')||'').slice(0,3);
    var tabs=document.createElement('div'); tabs.className='awtabs'; tabs.setAttribute('role','tablist');
    tabs.innerHTML='<button type="button" role="tab" data-t="L">Layers</button><button type="button" role="tab" data-t="O">Opacity</button><button type="button" role="tab" data-t="M">Map</button>';
    hd.parentNode.insertBefore(tabs,hd.nextSibling);
    var mp=document.createElement('div'); mp.className='awmap'; tabs.parentNode.insertBefore(mp,tabs.nextSibling);
    // header keeps the title, key and close; theme, terrain and GPX move to the Map tab
    function move(){ [].forEach.call(hd.querySelectorAll('.fpt,.gpxb'),function(e){ if(e.classList.contains('fpt')&&!e.__lab){ e.__lab=1; var s=e.querySelector('select'), t=s&&(s.id==='aw_terr'?'Terrain':s.classList.contains('awtheme')?'Day / night':s.getAttribute('aria-label')||''); if(t&&!e.querySelector('.awml')){ var sp=document.createElement('span'); sp.className='awml'; sp.textContent=t; e.insertBefore(sp,e.firstChild) } }
        if(e.classList.contains('gpxb')) gpxLab(e); mp.appendChild(e) });
      [].forEach.call(pn.querySelectorAll(':scope>.fps'),function(l){ if(l.querySelector('#aw_style')) l.classList.add('fpm') }); ends() }
    function gpxLab(g){ if(g.__ob) return; g.__ob=1; var fix=function(){ var t=g.textContent; if(/^‹/.test(t)) g.textContent='GPX tracks ▴'; else if(/^GPX ?(\(\d+\))? ?▾$/.test(t)) g.textContent=t.replace(/^GPX/,'GPX tracks').replace('▾','▸') }; fix(); new MutationObserver(fix).observe(g,{childList:true,characterData:true,subtree:true}) }
    function ends(){ var L=[].slice.call(pn.querySelectorAll(':scope>.fps:not(.fpm)')); L.forEach(function(l,i){ l.classList.toggle('f1',i===0); l.classList.toggle('fz',i===L.length-1) }) }
    // long lists show 6 with "Show more"
    var n=fpc.querySelectorAll('button').length, more=null;
    if(n>6){ fpc.classList.add('fold'); more=document.createElement('button'); more.type='button'; more.className='awmore'; fpc.classList.add('hasmore'); fpc.parentNode.insertBefore(more,fpc.nextSibling);
      var paintMore=function(){ more.textContent=fpc.classList.contains('fold')?'Show '+(n-6)+' more ▾':'Show less ▴' }; paintMore();
      more.onclick=function(e){ e.stopPropagation(); fpc.classList.toggle('fold'); paintMore() } }
    function tab(t){ var g=mp.querySelector('.gpxb'), gv=pn.querySelector('.gpxv'); if(t!=='M'&&g&&gv&&!gv.hidden) g.click();
      pn.classList.remove('tL','tO','tM'); pn.classList.add('t'+t); [].forEach.call(tabs.children,function(b){ b.setAttribute('aria-selected',b.getAttribute('data-t')===t?'true':'false') }); ls(key,t) }
    tabs.onclick=function(e){ var b=e.target.closest&&e.target.closest('[data-t]'); if(b){ e.stopPropagation(); tab(b.getAttribute('data-t')) } };
    move(); tab(ls(key)||'L'); scan(pn);
    new MutationObserver(function(){ move(); scan(pn) }).observe(hd,{childList:true});
    new MutationObserver(function(){ move(); scan(pn) }).observe(pn,{childList:true}) }

  // any Settings folder (including ones added later) opens full width, with the others tucked away
  document.addEventListener('toggle',function(e){ var d=e.target; if(!d||!d.matches||!d.matches('#fsheet details.folder')) return; var sh=document.querySelector('#fsheet .sheet'); if(sh) sh.classList.toggle('fopen',!!document.querySelector('#fsheet details.folder[open]')) },true);
  // ---------- pick up where you left off: On-road / Off-road and the map layers come back the way you left them ----------
  var LY=['firebtn','roadbtn','ferrybtn','aptbtn','planebtn','ltbtn'], restoring=true;
  function saved(){ try{ return JSON.parse(localStorage.getItem('aw-lyr')||'{}')||{} }catch(e){ return {} } }
  function keep(){ if(restoring) return; var o=saved(); LY.forEach(function(id){ var b=document.getElementById(id); if(b) o[id]=b.getAttribute('aria-pressed')==='true' }); try{ localStorage.setItem('aw-lyr',JSON.stringify(o)) }catch(e){} }
  function restore(){ var M=window.__AW&&__AW.map; if(!M) return done(); var c=M.getCenter(), z=M.getZoom(), o=saved(), moved=false;
    // mode first (the Off-road panel that opens with it is closed again)
    var mode=ls('aw-mode'), fb=document.querySelector('.seg button[data-b=fsr]'), sb=document.querySelector('.seg button[data-b=sat]'), isOff=document.body.classList.contains('fsron');
    if(mode==='off'&&!isOff&&fb){ fb.click(); moved=true } else if(mode==='on'&&isOff&&sb){ sb.click(); moved=true }
    if(moved) setTimeout(function(){ [].forEach.call(document.querySelectorAll('.lyrp:not([hidden]) .fpx:not(.fpkey)'),function(x){ x.click() }) },60);
    LY.forEach(function(id){ if(!(id in o)) return; var b=document.getElementById(id); if(!b) return; var on=b.getAttribute('aria-pressed')==='true'; if(on!==!!o[id]){ b.click(); moved=true } });
    // turning a layer back on must not move the map (airports and ferries like to jump)
    if(moved) setTimeout(function(){ try{ M.setView(c,z,{animate:false}) }catch(e){} [].forEach.call(document.querySelectorAll('.sheet-bg:not([hidden])'),function(x){ if(x.id!=='fsheet') x.hidden=true }) },120);
    setTimeout(done,400) }
  function done(){ restoring=false; keep() }
  document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('.seg button[data-b]'); if(b&&!restoring) setTimeout(function(){ ls('aw-mode',document.body.classList.contains('fsron')?'off':'on') },120) },true);
  if(window.MutationObserver) setTimeout(function(){ LY.forEach(function(id){ var b=document.getElementById(id); if(b) new MutationObserver(keep).observe(b,{attributes:true,attributeFilter:['aria-pressed']}) }) },500);
  function waitMap(){ var ob=window.__awOb; if(ob&&ob.active&&ob.active()) return setTimeout(waitMap,1000); setTimeout(restore,1800) }

  // TEST row: Satellite photos source (only when a Mapbox token is set in app.js)
  function satRow(){ var M=window.__mbx, pn=document.querySelector('.lyrp[aria-label="On road layers"]'); if(!M||!M.has()||!pn||pn.querySelector('#aw_satsrc')) return; var mp=pn.querySelector('.awmap'); if(!mp) return;
    var l=document.createElement('label'); l.className='fps fpm'; l.innerHTML='<span class="awml">Satellite photos (test)</span><select id="aw_satsrc"><option value="esri">Esri</option><option value="mapbox">Mapbox</option></select>';
    mp.appendChild(l); var sel=l.querySelector('select'); sel.value=M.on()?'mapbox':'esri'; try{ if(localStorage.getItem('aw-mbxoff')===new Date().toISOString().slice(0,7)){ var o=sel.querySelector('[value=mapbox]'); o.textContent='Mapbox (paused this month)'; o.disabled=true } }catch(e){} sel.onchange=function(){ M.set(sel.value==='mapbox') } }
  /* Off-road layers ▸ Map: the trail colour index (moved here from Rig Link) */
  function legRow(){ var pn=document.querySelector('.lyrp[aria-label="Off road layers"]'); if(!pn||pn.querySelector('#aw_legrow')) return; var mp=pn.querySelector('.awmap'); if(!mp) return;
    var l=document.createElement('div'); l.className='fps fpm'; l.id='aw_legrow'; l.innerHTML='<span class="awml">🎨 Trail colour index</span><button type="button" class="awlegb" style="background:#3a3f47;border:0;border-radius:14px;padding:7px 14px;color:#fff;font:700 13px var(--font,system-ui)">Show</button>';
    mp.appendChild(l); l.querySelector('button').onclick=function(){ if(window.__showLeg) window.__showLeg() } }
  /* back and close buttons on every page and sheet: one text size bigger (+2 px), once each */
  function bigX(){ [].forEach.call(document.querySelectorAll('button[aria-label^="Close"],button[aria-label="Back"],#mtback,button.close'),function(b){ if(b.__bx) return; b.__bx=1;
      var fs=parseFloat(getComputedStyle(b).fontSize)||13; b.style.fontSize=(fs+2)+'px';
      [].forEach.call(b.querySelectorAll('svg'),function(g){ var w=parseFloat(g.getAttribute('width')), h=parseFloat(g.getAttribute('height')); if(w) g.setAttribute('width',w+2); if(h) g.setAttribute('height',h+2) }) }) }
  /* ▾ ▴ arrows inside button text get their own slightly bigger span (re-done when the text changes) */
  function bigArr(){ [].forEach.call(document.querySelectorAll('button,.awmore,.seg button'),function(b){ if(b.querySelector('.awar')) return;
      for(var n=b.firstChild;n;n=n.nextSibling){ if(n.nodeType!==3) continue; var m=/^(.*?)\s*([▾▴▸])\s*$/.exec(n.nodeValue); if(!m) continue;
        n.nodeValue=m[1]; var sp=document.createElement('span'); sp.className='awar'; sp.textContent=m[2]; b.insertBefore(sp,n.nextSibling); break } }) }
  /* behind-the-scenes settings (flight-feed key, test buttons, crash reports, phone speed, Mapbox test) are only for Josh:
     tap the "AwareBC · Created by Josh Singer" line at the bottom of Settings 7 times to show or hide them */
  var DEV=false; try{ DEV=localStorage.getItem('aw-dev')==='1' }catch(e){} document.body.classList.toggle('awdev',DEV);
  var dst=document.createElement('style'); dst.textContent='body:not(.awdev) .awdevonly{display:none!important}'; document.head.appendChild(dst);
  function devMark(){ function m(e){ if(e) e.classList.add('awdevonly') }
    m(document.getElementById('crashfolder')); var sp=document.getElementById('s_perf'); if(sp){ m(sp.closest('label')); m(document.getElementById('s_perfh')) }
    var ss=document.getElementById('aw_satsrc'); if(ss) m(ss.closest('label'));
    [].forEach.call(document.querySelectorAll('#fsheet .subh'),function(h){ if(/Flight feeds/.test(h.textContent)&&!h.classList.contains('awdevonly')){ for(var n=h;n;n=n.nextElementSibling) m(n) } });
    var ab=document.querySelector('#fsheet .about'); if(ab&&!ab.__dev){ ab.__dev=1; var c=0,t=0; ab.addEventListener('click',function(){ var now=Date.now(); c=now-t<900?c+1:1; t=now; if(c>=7){ c=0; DEV=!DEV; try{ localStorage.setItem('aw-dev',DEV?'1':'0') }catch(e){} document.body.classList.toggle('awdev',DEV);
        var d=document.createElement('div'); d.className='frtoast'; d.style.zIndex=6400; d.textContent=DEV?'Developer settings shown':'Developer settings hidden'; document.body.appendChild(d); setTimeout(function(){ d.remove() },2200) } }) } }
  function all(){ [].forEach.call(document.querySelectorAll('.lyrp'),tidy); satRow(); legRow(); scan(document); bigX(); bigArr(); devMark() }
  function start(){ all(); waitMap(); setTimeout(all,1500); setTimeout(all,5000);
    // new screens and sheets built later get switches too
    if(window.MutationObserver){ var q=false; new MutationObserver(function(){ if(q) return; q=true; setTimeout(function(){ q=false; all() },250) }).observe(document.body,{childList:true,subtree:true}) } }
  if(document.readyState==='complete') setTimeout(start,200); else addEventListener('load',function(){ setTimeout(start,200) });
})();
