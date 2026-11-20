// AwareBC glow theme for the Off-road / On-road map panels (by Josh Singer): each layer shows a small line drawn in its real map colour,
// a short description and a glowing switch; the header counts how many layers are on.
(function(){
  var D={s_fsrFsr:['Forest service roads',4.5],s_fsrRoad:['Gravel and dirt roads',1.8],s_fsrMotor:['Motorized trails',2.6],s_fsrBcts:['Active logging roads',2.6],s_fsrPlan:['Roads not built yet',2.6],
    s_fsrClose:['Closed areas',2.8],s_fsrCamp:['Rec sites and camping',3],s_water:['Rivers and creeks',2.6],s_fsrOsm:['Community trails',2.6],s_gpsTr:['Your recorded tracks',2.6],
    s_fsrWalk:['Hiking trails',2.6],s_fsrBike:['Bike trails',2.6],s_fsrTh:['Where trails start',3]};
  var DA={dashed:'5 3',dotted:'1 4'};
  var L='.lyrp.awth ';
  var css=
    L+'{left:12px!important;right:12px!important;border-radius:22px!important;padding:14px!important;background:radial-gradient(80% 30% at 15% 0%,rgba(255,45,45,.16),transparent 70%),rgba(11,14,18,.97)!important;border:1px solid rgba(255,255,255,.09);box-shadow:0 18px 40px rgba(0,0,0,.6)!important;color:#eef1f5!important}'+
    L+'.fph{align-items:flex-start!important;margin-bottom:10px!important}'+L+'.fph>span:first-child{font:800 19px var(--font,system-ui)!important}'+L+'.fph>span:first-child small{display:block;font:500 11.5px var(--font,system-ui);color:#9aa3ad;margin-top:1px}'+
    L+'.fph .fpx{width:36px!important;height:36px!important;border-radius:50%!important;border:0!important;background:rgba(255,255,255,.08)!important;color:#eef1f5!important;display:grid;place-items:center;flex:none}'+
    L+'.fph .fpkey{border-radius:11px!important;background:linear-gradient(145deg,#ffb340,#c07a10)!important;box-shadow:0 4px 12px rgba(255,179,64,.35);color:#0a0d10!important}'+
    L+'.awti{display:block;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}'+L+'.awti .f{fill:currentColor;fill-opacity:.28;stroke:none}'+
    L+'.awtabs{background:rgba(255,255,255,.06)!important;border-radius:13px!important}'+L+'.awtabs button{border-radius:10px!important;font:700 12.5px var(--font,system-ui)!important}'+L+'.awtabs button[aria-selected=true]{background:rgba(255,255,255,.14)!important;color:#fff!important}'+
    L+'.fpc{background:rgba(255,255,255,.04)!important;border:1px solid rgba(255,255,255,.07);border-radius:16px!important;padding:0 12px!important}'+L+'.fpc.hasmore{border-radius:16px 16px 0 0!important;border-bottom:0}'+
    L+'.fpc button{min-height:46px!important;gap:10px!important;border-top:1px solid rgba(255,255,255,.06)!important;text-align:left}'+L+'.fpc button:first-child{border-top:0!important}'+
    L+'.fpc button .awln{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;flex:none;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}'+
    L+'.fpc button .awlt{display:flex;flex-direction:column;min-width:0;font:700 13.5px var(--font,system-ui)}'+L+'.fpc button .awlt small{font:500 11px var(--font,system-ui);color:#9aa3ad;margin-top:1px}'+
    L+'.fpc button[aria-pressed=false]{opacity:.78}'+
    L+'.fpc button::after{background:#3a3f47 radial-gradient(circle at 12px 12px,#fff 8.5px,transparent 9.5px)!important}'+L+'.fpc button[aria-pressed=true]::after{background:#32d74b radial-gradient(circle at 28px 12px,#fff 8.5px,transparent 9.5px)!important;box-shadow:0 0 10px rgba(50,215,75,.5)}'+
    L+'.awmore{background:rgba(255,255,255,.04)!important;border:1px solid rgba(255,255,255,.07)!important;border-top:1px solid rgba(255,255,255,.06)!important;border-radius:0 0 16px 16px!important;color:#c7ccd3!important}'+
    L+'.fps,'+L+'.awmap{background:rgba(255,255,255,.04)!important}'+L+'.awmap{border:1px solid rgba(255,255,255,.07);border-radius:16px!important}'+L+'.awsw[aria-checked=true]{background:#32d74b!important;box-shadow:0 0 10px rgba(50,215,75,.5)}'+
    L+'select{background-color:rgba(255,255,255,.08)!important;border:0!important;border-radius:10px!important;color:#eef1f5!important}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  var KEY='<svg class="awti" viewBox="0 0 24 24" aria-hidden="true" style="width:18px;height:18px"><circle class="f" cx="8" cy="15" r="4.5"/><circle cx="8" cy="15" r="4.5"/><path d="M11.3 11.7L20 3M16.5 6.5l2.5 2.5M14 9l2 2"/></svg>';
  var X='<svg class="awti" viewBox="0 0 24 24" aria-hidden="true" style="width:16px;height:16px"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  function sample(c,dash,w){ return '<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M2 16 C7 6 13 18 20 6" stroke="'+c+'" stroke-width="'+w+'" fill="none" stroke-linecap="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+' style="filter:drop-shadow(0 0 3px '+c+')"/></svg>' }
  function deco(pn){ pn.classList.add('awth');
    [].forEach.call(pn.querySelectorAll('.fpc button[data-s]'),function(b){ if(b.querySelector('.awln')) return; var i=b.querySelector('i'), k=b.getAttribute('data-s'), d=D[k]||['',2.6], bt=i?i.style.borderTop||'':'', m=/(solid|dashed|dotted)\s+(#[0-9a-f]{3,6}|rgb[^)]*\))/i.exec(bt);
      var col=m?m[2]:'#9aa3ad', dash=m?DA[m[1]]:'', name=b.textContent.trim();
      if(k==='s_fsrFsr'||k==='s_fsrRoad'){ var C=window.__awC||{}; col=C.fsr||col }
      if(k==='s_fsrClose'){ col=(window.__awC&&window.__awC.close)||'#ffd60a'; dash='3.5 2.5' }
      b.innerHTML='<span class="awln">'+sample(col,dash,d[1])+'</span><span class="awlt">'+name.replace(/&/g,'&amp;').replace(/</g,'&lt;')+(d[0]?'<small>'+d[0]+'</small>':'')+'</span>' });
    var hd=pn.querySelector('.fph>span:first-child'), all=pn.querySelectorAll('.fpc button[data-s]'), on=[].filter.call(all,function(b){ return b.getAttribute('aria-pressed')==='true' }).length;
    if(hd){ var t=hd.getAttribute('data-t')||hd.textContent.trim(); if(!hd.getAttribute('data-t')) hd.setAttribute('data-t',t); var txt=(/off/i.test(t)?'Off-road map':/on/i.test(t)?'On-road map':t), sub=on+' of '+all.length+' layers on';
      if(hd.getAttribute('data-sub')!==sub){ hd.setAttribute('data-sub',sub); hd.innerHTML=txt+'<small>'+sub+'</small>' } }
    var k=pn.querySelector('.fpkey'); if(k&&!k.querySelector('svg')) k.innerHTML=KEY;
    [].forEach.call(pn.querySelectorAll('.fph .fpx:not(.fpkey)'),function(x){ if(!x.querySelector('svg')) x.innerHTML=X }) }
  function run(){ [].forEach.call(document.querySelectorAll('.lyrp'),function(pn){ if(pn.__awt) return; if(!pn.querySelector('.fpc')) return; pn.__awt=1; deco(pn);
      new MutationObserver(function(){ deco(pn) }).observe(pn,{subtree:true,attributes:true,attributeFilter:['aria-pressed'],childList:true}) }) }
  run(); setInterval(run,2000);
})();
