// AwareBC glow theme for Settings (by Josh Singer): folders become icon tiles in four groups; tap a tile to open it.
(function(){
  var fs=document.getElementById('fsheet'), sh=fs&&fs.querySelector('.sheet'); if(!sh) return;
  var P={
    gear:'<path class="f" d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/><path d="M12 3.5l1.6 2.2 2.7-.5.6 2.7 2.4 1.3-1.1 2.5 1.1 2.5-2.4 1.3-.6 2.7-2.7-.5L12 20.5l-1.6-2.2-2.7.5-.6-2.7-2.4-1.3L5.8 12 4.7 9.5l2.4-1.3.6-2.7 2.7.5z"/><circle cx="12" cy="12" r="3.2"/>',
    spot:'<circle class="f" cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="7.5"/><circle class="s" cx="12" cy="12" r="2.8"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
    storm:'<path class="f" d="M7 15.5a4.3 4.3 0 1 1 .9-8.5A5.4 5.4 0 0 1 18.4 8.6 3.5 3.5 0 0 1 17.8 15.5z"/><path d="M7 15.5a4.3 4.3 0 1 1 .9-8.5A5.4 5.4 0 0 1 18.4 8.6 3.5 3.5 0 0 1 17.8 15.5"/><path class="s" d="M13 12.5l-2.8 4.3h3.3l-2.3 4.4"/>',
    comp:'<circle class="f" cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="8.5"/><path class="s" d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    turn:'<path class="f" d="M12 2.5l9.5 9.5-9.5 9.5L2.5 12z"/><path d="M12 2.5l9.5 9.5-9.5 9.5L2.5 12z"/><path d="M9 15v-3.5h6M13 9l2 2.5-2 2.5"/>',
    pin:'<path class="f" d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle class="s" cx="12" cy="10" r="2.4"/>',
    road:'<rect class="f" x="2.5" y="6.5" width="19" height="6" rx="1.2"/><rect x="2.5" y="6.5" width="19" height="6" rx="1.2"/><path d="M6.5 6.5l-3.5 6M12 6.5l-3.5 6M17.5 6.5l-3.5 6M5.5 12.5v8M18.5 12.5v8"/>',
    ferry:'<path class="f" d="M4 15.5h16l-2 4H6z"/><path d="M4 15.5h16l-2 4H6zM7 15.5V11h10v4.5M10 11V8h4v3"/><path d="M2.5 21.5c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1"/>',
    snow:'<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M9.5 4.5L12 6.5l2.5-2M9.5 19.5L12 17.5l2.5 2"/><circle class="s" cx="12" cy="12" r="2"/>',
    riders:'<circle class="f" cx="9" cy="8.5" r="3.3"/><circle cx="9" cy="8.5" r="3.3"/><path d="M3 19.5c.8-3.3 3.2-5 6-5s5.2 1.7 6 5"/><path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.8c1.8.6 3 2.2 3.5 4.7"/>',
    plane:'<path class="f" d="M10.5 3.5h3v6.5l7 4v2l-7-2v4l2 1.5v1.5l-3.5-1-3.5 1V19.5l2-1.5v-4l-7 2v-2l7-4z"/><path d="M10.5 3.5h3v6.5l7 4v2l-7-2v4l2 1.5v1.5l-3.5-1-3.5 1V19.5l2-1.5v-4l-7 2v-2l7-4z"/>',
    sos:'<path class="f" d="M12 3l8 3v6c0 4.6-3.4 8.2-8 9-4.6-.8-8-4.4-8-9V6z"/><path d="M12 3l8 3v6c0 4.6-3.4 8.2-8 9-4.6-.8-8-4.4-8-9V6z"/><path d="M12 8.5v7M8.5 12h7"/>',
    block:'<circle class="f" cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
    upd:'<circle class="f" cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v8M8.5 12l3.5 3.5 3.5-3.5"/>',
    cam:'<rect class="f" x="3" y="7" width="18" height="12.5" rx="2.5"/><rect x="3" y="7" width="18" height="12.5" rx="2.5"/><path d="M8.5 7l1.5-2.5h4L15.5 7"/><circle cx="12" cy="13" r="3.2"/>',
    cube:'<path class="f" d="M12 3.5l8 4.5v8l-8 4.5-8-4.5V8z"/><path d="M12 3.5l8 4.5v8l-8 4.5-8-4.5V8z"/><path d="M4 8l8 4.5L20 8M12 12.5v8"/>',
    apt:'<path class="f" d="M4 20.5h16V14H4z"/><path d="M4 20.5h16V14H4zM8 14V8h8v6M12 8V4M10 4h4"/>',
    feed:'<path d="M5 19a14 14 0 0 1 14-14"/><path d="M5 19a9 9 0 0 1 9-9"/><circle class="s" cx="6" cy="18" r="1.8"/>',
    tent:'<path class="f" d="M12 4.5L3 19.5h18z"/><path d="M12 4.5L3 19.5h18zM12 4.5v15M9 19.5l3-5 3 5"/>',
    sat:'<rect class="f" x="9" y="9" width="6" height="6" rx="1" transform="rotate(45 12 12)"/><rect x="9" y="9" width="6" height="6" rx="1" transform="rotate(45 12 12)"/><path d="M6.5 6.5L3.5 9.5l3 3M17.5 17.5l3-3-3-3"/>',
    bug:'<rect class="f" x="7" y="7.5" width="10" height="12" rx="5"/><rect x="7" y="7.5" width="10" height="12" rx="5"/><path d="M12 11v8M9.5 5l1 2.5M14.5 5l-1 2.5M3.5 12H7M17 12h3.5M4.5 18l2.8-1.5M19.5 18l-2.8-1.5"/>',
    map:'<path class="f" d="M9 4.5L3.5 6.5v13L9 17.5z"/><path d="M9 4.5L3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z"/><path d="M9 4.5v13M15 6.5v13"/>',
    trail:'<path class="f" d="M3 20l5-11 4 6 3-4 6 9z"/><path d="M3 20l5-11 4 6 3-4 6 9z"/>',
    bolt:'<path class="f" d="M13.5 2.5L5 13.5h6l-1.5 8 8.5-11h-6z"/><path d="M13.5 2.5L5 13.5h6l-1.5 8 8.5-11h-6z"/>',
    user:'<circle class="f" cx="12" cy="8" r="3.8"/><circle cx="12" cy="8" r="3.8"/><path d="M4.5 20c1-3.8 4-5.8 7.5-5.8s6.5 2 7.5 5.8"/>'};
  var B='#64d2ff',G='#32d74b',A='#ffb340',R='#ff453a',V='#bf8bff',T='#40e0c8';
  var M={gfolder:['gear','Basics',B],mefolder:['spot','My spot',R],wffolder:['storm','Weather',A],cfolder:['comp','Compass',B],
    dirfolder:['turn','Directions',A],osmfolder:['pin','Places',G],rdfolder:['road','DriveBC',A],bfolder:['ferry','BC Ferries',T],
    mtfolder:['snow','Winter',T],nrfolder:['riders','Riders',G],pcfolder:['plane','Planes',B],hbfolder:['sos','Safety',R],blkfolder:['block','Blocked',V],updfolder:['upd','Updates',G],
    arfolder:['cam','AR camera',V],v3folder:['cube','3D view',V],apfolder:['apt','Airports',B],ffolder:['feed','Flight feeds',B],prfolder:['tent','Survival',G],spfolder:['sat','Space',V],
    crashfolder:['bug','Crashes',R],rfolder:['map','Map look',G],fsfolder:['trail','FSR map',A],ltfolder:['bolt','Lightning',A],acctfolder:['user','Account',B]};
  function svg(n){ return '<svg class="awti" viewBox="0 0 24 24" aria-hidden="true" style="width:22px;height:22px;color:#0a0d10">'+(P[n]||P.gear)+'</svg>' }
  var css=
    '#fsheet.awth .sheet{background:radial-gradient(70% 34% at 22% 8%,rgba(100,210,255,.2),transparent 72%),radial-gradient(60% 32% at 92% 0%,rgba(50,215,75,.12),transparent 70%),#07090c!important;color:#eef1f5;border-radius:0!important;height:100%;padding-top:calc(14px + env(safe-area-inset-top,0px))!important}'+
    '#fsheet.awth .sheet::before{display:none!important}#fsheet.awth .sheet-head{font:800 21px var(--font)!important;margin-bottom:8px}#fsheet.awth .sheet-head .close{background:rgba(255,255,255,.08)!important;color:#eef1f5!important;width:38px;height:38px}'+
    '#fsheet.awth .setsrch input{height:40px;border-radius:12px!important;background:rgba(255,255,255,.06)!important;border:1px solid rgba(255,255,255,.07)!important;color:#eef1f5;padding-left:36px!important;background-image:url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%238a93a0%22 stroke-width=%222%22 stroke-linecap=%22round%22%3E%3Ccircle cx=%2211%22 cy=%2211%22 r=%226.5%22/%3E%3Cpath d=%22M16 16l4.5 4.5%22/%3E%3C/svg%3E")!important;background-repeat:no-repeat!important;background-position:11px center!important;background-size:17px!important}'+
    '#fsheet.awth .sheet:not(.fopen){display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));column-gap:7px;row-gap:6px;align-content:start}'+
    '#fsheet.awth .sheet:not(.fopen)>:not(details){grid-column:1/-1}'+
    '#fsheet.awth .sheet:not(.fopen) .sethd{margin:4px 2px 0!important;color:#9aa3ad!important;font:700 12.5px var(--font)!important;text-transform:none!important;letter-spacing:0!important}'+
    '#fsheet.awth .sheet:not(.fopen) details.folder{--c:#64d2ff;margin:0!important;border:1px solid color-mix(in srgb,var(--c) 24%,transparent)!important;border-radius:14px!important;background:linear-gradient(160deg,color-mix(in srgb,var(--c) 14%,transparent),rgba(255,255,255,.03) 65%)!important;min-width:0}'+
    '#fsheet.awth .sheet:not(.fopen) details.folder>summary{display:grid!important;justify-items:center;align-content:center;gap:6px;min-height:68px!important;padding:7px 2px!important;font:650 11px/1.15 var(--font)!important;text-align:center;color:#eef1f5}'+
    '#fsheet.awth details.folder>summary::before{display:none!important;content:none!important}#fsheet.awth .sheet:not(.fopen) details.folder>summary>*{justify-self:center!important;margin-left:auto!important;margin-right:auto!important}#fsheet.awth .sheet:not(.fopen) details.folder>summary{width:100%!important;box-sizing:border-box;margin:0!important;grid-template-columns:minmax(0,1fr)!important;grid-auto-flow:row!important}#fsheet.awth .sheet:not(.fopen) details.folder>summary::after{display:none!important}#fsheet.awth .sheet:not(.fopen) .awlong{display:none}#fsheet.awth .sheet.fopen .awshort{display:none}'+
    '#fsheet.awth .awshort{text-align:center!important;display:block;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
    '#fsheet.awth .awtib{width:36px;height:36px;border-radius:12px;background:linear-gradient(145deg,var(--c),color-mix(in srgb,var(--c) 72%,#000));display:grid;place-items:center;box-shadow:0 4px 12px color-mix(in srgb,var(--c) 38%,transparent),inset 0 1px 0 rgba(255,255,255,.45);flex:none}'+
    '#fsheet.awth .awti{display:block;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}#fsheet.awth .awti .f{fill:currentColor;fill-opacity:.28;stroke:none}#fsheet.awth .awti .s{fill:currentColor}'+
    '#fsheet.awth .sheet.fopen details.folder[open]>summary{display:flex!important;align-items:center;gap:10px;font:800 17px var(--font)!important;min-height:52px}'+
    '#fsheet.awth .sheet.fopen details.folder[open]{--c:#64d2ff;background:none!important;border:0!important}'+
    '#fsheet.awth .sheet:not(.fopen) details.awacct{grid-column:1/-1}#fsheet.awth .sheet:not(.fopen) details.awacct>summary{display:flex!important;justify-items:start;min-height:58px!important;padding:8px 12px!important;gap:12px;font:700 14px var(--font)!important;text-align:left}#fsheet.awth .sheet:not(.fopen) details.awacct .awshort::after{content:" \\00b7  sign in & backup";color:#9aa3ad;font-weight:500;font-size:12px}'+
    '#fsheet.awth .sheet:not(.fopen) .about{margin:4px 0 0!important;font-size:11px;text-align:center;color:#7d8692}';
  css+='#fsheet.awth .awfback{display:none;align-items:center;gap:2px;padding:7px 12px 7px 8px;border-radius:12px;background:rgba(255,255,255,.08);color:#eef1f5;font:700 13px var(--font);justify-self:start;width:max-content;margin:0 0 6px}#fsheet.awth .sheet.fopen .awfback{display:inline-flex}#fsheet.awth .sheet.fopen .setsrch{display:none}'+
    '#fsheet.awth .sheet.fopen details.folder[open]>summary::after{display:none!important}#fsheet.awth .sheet.fopen .setrow,#fsheet.awth .sheet.fopen details[open] .fps{background:rgba(255,255,255,.06)!important}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  function deco(){ [].forEach.call(sh.querySelectorAll(':scope>details.folder'),function(d){ var m=M[d.id], s=d.querySelector(':scope>summary'); if(!m||!s||s.querySelector('.awtib')) return;
      d.style.setProperty('--c',m[2]); var full=s.textContent; s.innerHTML='<span class="awtib">'+svg(m[0])+'</span><span class="awshort">'+m[1]+'</span><span class="awlong">'+full+'</span>'; s.setAttribute('aria-label',full) }) }
  function group(){ if(!sh.getAttribute('data-rg')) return false; var hds=[].slice.call(sh.querySelectorAll(':scope>.sethd')), find=function(t){ return hds.filter(function(h){ return h.textContent.trim()===t })[0] };
    var sky=find('Sky & planes'); if(!sky) return true; sky.textContent='More';
    var anchor=document.getElementById('pcfolder'); ['hbfolder','blkfolder','updfolder','crashfolder'].forEach(function(id){ var d=document.getElementById(id); if(d&&anchor){ anchor.parentNode.insertBefore(d,anchor.nextSibling); anchor=d } });
    var ac=document.getElementById('acctfolder'), hd=sh.querySelector(':scope>.sheet-head'); if(ac&&hd){ hd.parentNode.insertBefore(ac,hd.nextSibling); ac.classList.add('awacct') }
    ['Safety','App & account'].forEach(function(t){ var h=find(t); if(h) h.style.display='none' }); return true }
  var done=false; function tick(){ if(!done) done=group(); deco() }
  var bk=document.createElement('button'); bk.type='button'; bk.className='awfback'; bk.setAttribute('aria-label','Back'); bk.innerHTML='<svg class="awti" viewBox="0 0 24 24" style="width:18px;height:18px"><path d="M15 6l-6 6 6 6"/></svg>Back';
  bk.onclick=function(){ var d=sh.querySelector('details.folder[open]'); if(d) d.open=false; sh.classList.remove('fopen'); sh.scrollTop=0 };
  var hd0=sh.querySelector('.sheet-head'); if(hd0) hd0.parentNode.insertBefore(bk,hd0.nextSibling);
  fs.classList.add('awth'); tick(); var iv=setInterval(function(){ tick(); if(done) clearInterval(iv) },400); setTimeout(function(){ clearInterval(iv) },20000);
  new MutationObserver(function(){ deco() }).observe(sh,{childList:true,subtree:true});
})();
