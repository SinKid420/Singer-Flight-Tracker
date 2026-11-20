// AwareBC glow theme for Rig Link (by Josh Singer): glow tiles, two-tone icons, glass cards and a glowing Hold to Talk button.
(function(){
  var P={
    clock:'<circle class="f" cx="12" cy="13" r="8"/><circle cx="12" cy="13" r="8"/><path d="M12 9v4.5l3 1.8M9.5 2.5h5"/>',
    riders:'<circle class="f" cx="9" cy="8.5" r="3.3"/><circle cx="9" cy="8.5" r="3.3"/><path d="M3 19.5c.8-3.3 3.2-5 6-5s5.2 1.7 6 5"/><path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.8c1.8.6 3 2.2 3.5 4.7"/>',
    tools:'<rect class="f" x="3" y="8.5" width="18" height="11.5" rx="2"/><rect x="3" y="8.5" width="18" height="11.5" rx="2"/><path d="M9 8.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2.5M3 13.5h18M10.5 12.5v2.5M13.5 12.5v2.5"/>',
    flag:'<path class="f" d="M5 4h14l-3 4.5 3 4.5H5z"/><path d="M5 21V4h14l-3 4.5 3 4.5H5"/>',
    cam:'<rect class="f" x="3" y="7" width="18" height="12.5" rx="2.5"/><rect x="3" y="7" width="18" height="12.5" rx="2.5"/><path d="M8.5 7l1.5-2.5h4L15.5 7"/><circle cx="12" cy="13" r="3.2"/>',
    warn:'<path class="f" d="M12 3.5l9.5 16.5h-19z"/><path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.3v.1"/>',
    mic:'<rect class="f" x="9" y="3.5" width="6" height="11" rx="3"/><rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
    note:'<path class="f" d="M4.5 5.5h15v10h-9l-4 3.5v-3.5h-2z"/><path d="M4.5 5.5h15v10h-9l-4 3.5v-3.5h-2z"/><path d="M8 9.5h8M8 12.5h5"/>',
    shield:'<path class="f" d="M12 3l8 3v6c0 4.6-3.4 8.2-8 9-4.6-.8-8-4.4-8-9V6z"/><path d="M12 3l8 3v6c0 4.6-3.4 8.2-8 9-4.6-.8-8-4.4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    pin:'<path class="f" d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle class="s" cx="12" cy="10" r="2.4"/>',
    globe:'<circle class="f" cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>',
    lock:'<rect class="f" x="5" y="10.5" width="14" height="10" rx="2.5"/><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'};
  function svg(n,s,c){ return '<svg class="awti" viewBox="0 0 24 24" aria-hidden="true" style="width:'+s+'px;height:'+s+'px'+(c?';color:'+c:'')+'">'+P[n]+'</svg>' }
  var B='#64d2ff',G='#32d74b',A='#ffb340',R='#ff453a',V='#bf8bff';
  var css=
    '#rlx.awth{background:radial-gradient(70% 30% at 20% 4%,rgba(50,215,75,.18),transparent 72%),radial-gradient(60% 28% at 95% 0%,rgba(255,179,64,.12),transparent 70%),#07090c!important}'+
    '#rlx.awth .awti{display:block;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:none}#rlx.awth .awti .f{fill:currentColor;fill-opacity:.28;stroke:none}#rlx.awth .awti .s{fill:currentColor}'+
    '#rlx.awth .rlhd{background:none!important;border:0!important;padding:12px 14px 4px 16px!important}#rlx.awth .rlt b{font:800 20px var(--font,system-ui)!important}#rlx.awth .rlt small{color:#9aa3ad!important}'+
    '#rlx.awth .rlrig{background:rgba(50,215,75,.16)!important;color:#7dff9a!important;border-radius:12px!important;padding:6px 10px!important;font:700 12px var(--font,system-ui)!important;box-shadow:0 0 14px rgba(50,215,75,.18)}'+
    '#rlx.awth .rlhd .rlx{background:rgba(255,255,255,.08)!important;border:0!important;border-radius:50%!important;width:38px;height:38px;display:grid;place-items:center;color:#eef1f5}'+
    '#rlx.awth .rltog{background:rgba(255,255,255,.06)!important;border-radius:13px!important;margin:8px 14px 4px!important}#rlx.awth .rltog button{display:flex;align-items:center;justify-content:center;gap:6px;border-radius:10px!important;font:700 12.5px var(--font,system-ui)!important}'+
    '#rlx.awth .rltog .on{background:rgba(255,255,255,.14)!important;color:#fff!important}#rlx.awth .rltog .lk{background:rgba(255,179,64,.22)!important;color:#ffd28a!important}'+
    '#rlx.awth .rlqk{margin:10px 14px 10px!important}#rlx.awth .rlqk button{--c:'+B+';background:linear-gradient(160deg,color-mix(in srgb,var(--c) 14%,transparent),rgba(255,255,255,.03) 65%)!important;border:1px solid color-mix(in srgb,var(--c) 24%,transparent)!important;border-radius:14px!important;font:650 11.5px var(--font,system-ui)!important;min-height:70px!important}'+
    '#rlx.awth .awtib{width:36px;height:36px;border-radius:12px;background:linear-gradient(145deg,var(--c),color-mix(in srgb,var(--c) 72%,#000));display:grid;place-items:center;box-shadow:0 4px 12px color-mix(in srgb,var(--c) 38%,transparent),inset 0 1px 0 rgba(255,255,255,.45)}'+
    '#rlx.awth #rllobby:not(:empty){margin:0 14px 4px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}'+
    '#rlx.awth .nrrow{flex-direction:row!important;align-items:center;justify-content:space-between;gap:8px!important;margin:0!important;font:700 12.5px var(--font,system-ui)}#rlx.awth .nrrow>span{display:flex;align-items:center;gap:7px;white-space:nowrap}'+
    '#rlx.awth .nrseg{width:auto!important;gap:3px!important;background:rgba(255,255,255,.06);border-radius:11px;padding:2px}#rlx.awth .nrseg button{height:28px!important;padding:0 10px;border-radius:9px!important;background:none!important;color:#9aa3ad!important;font:700 12px var(--font,system-ui)!important}#rlx.awth .nrseg button.on{background:#32d74b!important;color:#0a0d10!important;box-shadow:0 0 10px rgba(50,215,75,.4)}'+
    '#rlx.awth .nrsee{margin-top:8px!important;font:600 12.5px var(--font,system-ui);color:#c7ccd3}#rlx.awth .nrsee select{background-color:rgba(255,255,255,.08)!important;border:0!important;border-radius:10px!important;color:#eef1f5}'+
    '#rlx.awth .rlfl{padding:8px 14px!important}#rlx.awth .rlfl button{background:rgba(255,255,255,.06)!important;border:1px solid rgba(255,255,255,.08)!important;color:#c7ccd3!important;font:650 12.5px var(--font,system-ui)!important;padding:7px 12px!important;border-radius:12px!important}#rlx.awth .rlfl .on{background:#eef1f5!important;color:#0a0d10!important}'+
    '#rlx.awth .rlcd{background:linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.02) 60%)!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:16px!important}'+
    '#rlx.awth .rlbar{background:none!important;border:0!important;gap:7px!important;padding:8px 14px calc(12px + env(safe-area-inset-bottom,0px))!important;grid-template-columns:1fr 1fr 1.35fr 1fr!important}'+
    '#rlx.awth .rlbar button{background:rgba(255,255,255,.06)!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:18px!important;min-height:60px!important;gap:4px!important;font:700 11.5px var(--font,system-ui)!important;color:#eef1f5!important;justify-content:center}'+
    '#rlx.awth .rlbar .ptt{background:linear-gradient(180deg,#ff6a5f,#e0281d)!important;border-color:#ff8a80!important;box-shadow:0 8px 22px rgba(255,69,58,.45),inset 0 1px 0 rgba(255,255,255,.35);font-weight:800!important}';
  css+='#rlx.awth #rllobby .rlrow{flex-wrap:wrap;gap:6px 14px;margin:0}#rlx.awth #rllobby .rlsw{flex:1 1 100%;text-align:left;font:700 12.5px var(--font,system-ui)}#rlx.awth #rllobby .rllink{font:700 12.5px var(--font,system-ui)}#rlx.awth .rlchips{padding:0 14px}#rlx.awth .rlchips button{background:rgba(255,255,255,.06)!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:12px!important}'+
  '.nrnote{background:linear-gradient(160deg,rgba(50,215,75,.14),rgba(20,24,30,.97) 55%)!important;border:1px solid rgba(50,215,75,.28);backdrop-filter:blur(10px)}.nrnote button{border-radius:14px!important;background:rgba(255,255,255,.08)!important}.nrnote button.ok{background:linear-gradient(180deg,#5df27a,#28b84a)!important;color:#05150a!important;box-shadow:0 6px 18px rgba(50,215,75,.35)}.nrnote .nrlater{background:none!important;box-shadow:none}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  var QK={bb:['clock',A],fr:['riders',B],tl:['tools',V],sr:['flag',R]}, BAR={photo:['cam',B],alert:['warn',A],note:['note',G]};
  var LBL={photo:'Photo',alert:'Alert',note:'Note'};
  function deco(X){ X.classList.add('awth');
    [].forEach.call(X.querySelectorAll('.rlqk button[data-q]'),function(b){ var m=QK[b.getAttribute('data-q')], i=b.querySelector('i'); if(!m||!i||b.__aw) return; b.__aw=1; b.style.setProperty('--c',m[1]); var s=document.createElement('span'); s.className='awtib'; s.innerHTML=svg(m[0],21,'#0a0d10'); i.replaceWith(s) });
    [].forEach.call(X.querySelectorAll('.rlbar button'),function(b){ if(b.__aw) return; var a=b.getAttribute('data-a'), m=b.classList.contains('ptt')?['mic','#fff']:BAR[a], i=b.querySelector('i'); if(!m||!i) return; b.__aw=1;
      var s=document.createElement('span'); s.innerHTML=svg(m[0],b.classList.contains('ptt')?24:22,m[1]); i.replaceWith(s.firstChild); if(LBL[a]) [].forEach.call(b.childNodes,function(n){ if(n.nodeType===3&&n.textContent.trim()) n.textContent=LBL[a] }) });
    [].forEach.call(X.querySelectorAll('.rltog button'),function(b){ if(b.querySelector('svg')) return; var pub=b.getAttribute('data-a')==='pub', t=b.textContent.replace(/^[^A-Za-z#0-9]+/,''); t=pub?'Public':/Private Key Lobby/.test(t)?'Private lobby':t; b.innerHTML=svg(pub?'globe':'lock',16,pub?B:null)+'<span>'+t.replace(/[<&]/g,'')+'</span>' });
    var bd=X.querySelector('.rlhd [data-a=badges]'); if(bd&&!bd.__aw){ bd.__aw=1; bd.innerHTML=svg('shield',20,G) }
    var nr=X.querySelector('#rllobby .nrrow>span'); if(nr&&!nr.__aw){ nr.__aw=1; nr.innerHTML=svg('pin',17,G)+'<span>Share my spot</span>' } }
  function hook(){ var X=document.getElementById('rlx'); if(!X) return false; deco(X); new MutationObserver(function(){ deco(X) }).observe(X,{childList:true,subtree:true}); return true }
  if(!hook()){ var mo=new MutationObserver(function(){ if(hook()) mo.disconnect() }); mo.observe(document.body,{childList:true}) }
})();
