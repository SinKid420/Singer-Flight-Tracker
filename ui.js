// AwareBC tidy controls (by Josh Singer): the On-road and Off-road layer panels get tabs (Layers · Opacity · Map) with a neat
// switch list, and every Show/Hide or On/Off choice in the app becomes the same slick on/off switch.
(function(){
  function ls(k,v){ try{ if(v===undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k,v) }catch(e){ return null } }
  var st=document.createElement('style'); st.textContent=
    // the switch
    '.awsw{position:relative;flex:none;width:40px;height:24px;border-radius:12px;border:0;padding:0;background:#3a3f47;transition:background .18s;cursor:pointer;margin-left:auto}'+
    '.awsw::after{content:"";position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.4);transition:transform .18s}'+
    '.awsw[aria-checked=true]{background:#30d158}.awsw[aria-checked=true]::after{transform:translateX(16px)}.awsw:disabled{opacity:.4}'+
    'select.awswsel{display:none!important}.setrow .awsw{margin-top:9px;margin-bottom:9px}'+
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
    '.lyrp.tidy .fps2{display:flex;align-items:center;gap:8px}'+
    '.lyrp.tL .fps,.lyrp.tL .awmap,.lyrp.tL .gpxv,.lyrp.tO .fpc,.lyrp.tO .awmore,.lyrp.tO .awmap,.lyrp.tO .gpxv,.lyrp.tO .fpm,.lyrp.tM .fpc,.lyrp.tM .awmore,.lyrp.tM .fps:not(.fpm){display:none!important}'+
    '.lyrp.tO .fps.f1{border-radius:14px 14px 0 0;border-top:0}.lyrp.tO .fps.fz{border-radius:0 0 14px 14px}.lyrp.tO .fps.f1.fz{border-radius:14px}'+
    '.lyrp.tM .fpm{border-radius:14px;margin-top:8px;border-top:0}.lyrp.tM .gpxv{margin-top:8px}';
  document.head.appendChild(st);

  // ---------- every two-way Show/Hide, On/Off, Yes/No choice becomes a switch ----------
  var PAIRS=[['show','hide'],['on','off'],['yes','no']], SW=[];
  function onIdx(sel){ if(sel.options.length!==2||sel.multiple) return -1; var a=sel.options[0].text.trim().toLowerCase(), b=sel.options[1].text.trim().toLowerCase();
    for(var i=0;i<PAIRS.length;i++){ if(a===PAIRS[i][0]&&b===PAIRS[i][1]) return 0; if(a===PAIRS[i][1]&&b===PAIRS[i][0]) return 1 } return -1 }
  function paint(o){ o.b.setAttribute('aria-checked',o.s.selectedIndex===o.i?'true':'false'); o.b.disabled=o.s.disabled }
  function wrap(sel){ if(sel.__awsw) return; var i=onIdx(sel); if(i<0) return;
    var b=document.createElement('button'); b.type='button'; b.className='awsw'; b.setAttribute('role','switch');
    var lab=sel.getAttribute('aria-label')||(sel.closest('label')&&sel.closest('label').textContent.replace(sel.textContent,'').trim())||''; if(lab) b.setAttribute('aria-label',lab);
    sel.parentNode.insertBefore(b,sel.nextSibling); sel.classList.add('awswsel'); var o={s:sel,b:b,i:i}; sel.__awsw=o; SW.push(o); paint(o);
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

  function all(){ [].forEach.call(document.querySelectorAll('.lyrp'),tidy); scan(document) }
  function start(){ all(); setTimeout(all,1500); setTimeout(all,5000);
    // new screens and sheets built later get switches too
    if(window.MutationObserver){ var q=false; new MutationObserver(function(){ if(q) return; q=true; setTimeout(function(){ q=false; all() },250) }).observe(document.body,{childList:true,subtree:true}) } }
  if(document.readyState==='complete') setTimeout(start,200); else addEventListener('load',function(){ setTimeout(start,200) });
})();
