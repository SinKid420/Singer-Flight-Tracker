/* AwareBC quick tour: a 4-step spotlight walk-through shown once, after the welcome screens. */
(function(){
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v) }catch(e){ return null } }
  if(ls('aw-tut')==='1') return;
  var B='#64d2ff';
  var IC={
    lyr:'<path class="f" d="M12 3l9 5-9 5-9-5z"/><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12.5l9 5 9-5M3 16.5l9 5 9-5"/>',
    mode:'<path class="f" d="M3 20l5-11 4 6 3-4 6 9z"/><path d="M3 20l5-11 4 6 3-4 6 9z"/>',
    srch:'<circle class="f" cx="11" cy="11" r="7"/><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    bell:'<path class="f" d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>'
  };
  function tabBtn(name){ var r=null; [].forEach.call(document.querySelectorAll('button'),function(b){ if(!r&&b.innerText&&b.innerText.trim()===name){ var q=b.getBoundingClientRect(); if(q.top>innerHeight-110&&q.width>0) r=b } }); return r }
  var S=[
    {t:'Layers and tools',ic:'lyr',el:function(){ return document.getElementById('menubtn') },p:'Tap here to turn on what you want to see on the map. Your picks are saved for next time.',ex:[['🔥','Wildfires'],['📷','Cameras'],['✈️','Planes']]},
    {t:'On-road or Off-road',ic:'mode',el:function(){ var m=document.querySelector('#awtop .md'); return m&&m.offsetWidth?m:document.querySelector('.seg') },p:'Switch anytime. Off-road adds FSRs, trails, Rig Link and the safety timer.'},
    {t:'Search',ic:'srch',el:function(){ return document.querySelector('#awtop .sr')||document.getElementById('sr') },p:'Find towns, trails, FSRs and campsites.'},
    {t:'Alerts',ic:'bell',el:function(){ return tabBtn('Alerts') },p:'Fires, evacuations and closures near you, all in one place.'}
  ];
  var st=document.createElement('style'); st.textContent=
    '#tut{display:none!important}body.awtour #menubtn{animation:none!important}'+
    '#awtour{position:fixed;inset:0;z-index:7000;font-family:var(--font,system-ui);color:#eef1f5}#awtour .ring{position:fixed;border-radius:22px;border:2px solid '+B+';box-shadow:0 0 0 6px rgba(100,210,255,.14),0 0 28px rgba(100,210,255,.55);transition:all .3s ease;pointer-events:none}#awtour .dm{position:fixed;left:0;top:0;width:100%;height:100%}#awtour .dm path{fill:rgba(4,6,9,.86);fill-rule:evenodd}'+
    '#awtour .cd{position:fixed;left:16px;right:16px;max-width:400px;margin:0 auto;border-radius:22px;padding:18px;background:linear-gradient(160deg,rgba(100,210,255,.12),rgba(20,24,30,.96) 55%);border:1px solid rgba(100,210,255,.28);box-shadow:0 18px 40px rgba(0,0,0,.5);transition:top .3s ease}'+
    '#awtour .ar{position:absolute;width:16px;height:16px;transform:rotate(45deg);background:#1a2a36;border:1px solid rgba(100,210,255,.28)}#awtour .ar.up{top:-9px;border-right:0;border-bottom:0}#awtour .ar.dn{bottom:-9px;border-left:0;border-top:0;background:#151b22}'+
    '#awtour .hd{display:flex;gap:12px;align-items:center}#awtour .bd{width:46px;height:46px;flex:none;border-radius:14px;display:grid;place-items:center;background:linear-gradient(145deg,#64d2ff,#2a8fb8);box-shadow:0 4px 14px rgba(100,210,255,.45),inset 0 1px 0 rgba(255,255,255,.4)}'+
    '#awtour .bd svg{width:24px;height:24px;fill:none;stroke:#0a0d10;stroke-width:1.9;stroke-linejoin:round;stroke-linecap:round}#awtour .bd .f{fill:#0a0d10;fill-opacity:.28;stroke:none}'+
    '#awtour .sn{font:700 11.5px var(--font,system-ui);color:'+B+'}#awtour h2{font:800 19px var(--font,system-ui);margin:2px 0 0}#awtour p{color:#c2c9d1;font-size:14px;line-height:1.45;margin:12px 0 0}'+
    '#awtour .ex{display:flex;gap:8px;margin-top:14px}#awtour .ex span{flex:1;border-radius:12px;padding:9px 6px;text-align:center;font:600 11.5px var(--font,system-ui);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}#awtour .ex i{display:block;font-style:normal;font-size:18px;margin-bottom:3px}'+
    '#awtour .ft{display:flex;align-items:center;margin-top:16px}#awtour .dots{display:flex;gap:5px}#awtour .dots i{width:6px;height:6px;border-radius:3px;background:#3a414a}#awtour .dots i.on{width:18px;background:'+B+'}'+
    '#awtour .sk{margin-left:auto;background:none;border:0;color:#9aa3ad;font:600 14px var(--font,system-ui);padding:0 14px;height:42px}#awtour .nx{height:42px;padding:0 22px;border:0;border-radius:13px;background:linear-gradient(180deg,#7fdcff,#3aa9d6);color:#05121a;font:800 14.5px var(--font,system-ui);box-shadow:0 6px 18px rgba(100,210,255,.4)}';
  document.head.appendChild(st);
  var O=null, i=0, steps=[];
  function vis(e){ if(!e) return false; var r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0 }
  function done(){ ls('aw-tut','1'); document.body.classList.remove('tuton','awtour'); if(O) O.remove(); O=null; removeEventListener('resize',paint) }
  function paint(){ if(!O) return; var s=steps[i], e=s.el(); if(!vis(e)){ steps.splice(i,1); if(i>=steps.length) return done(); return paint() }
    var r=e.getBoundingClientRect(), pad=8, ring=O.querySelector('.ring'), cd=O.querySelector('.cd');
    ring.style.left=(r.left-pad)+'px'; ring.style.top=(r.top-pad)+'px'; ring.style.width=(r.width+pad*2)+'px'; ring.style.height=(r.height+pad*2)+'px'; var rr=r.height>50?18:Math.round((r.height+pad*2)/2); ring.style.borderRadius=rr+'px'; var x=r.left-pad,y=r.top-pad,w=r.width+pad*2,h=r.height+pad*2; rr=Math.min(rr,w/2,h/2);
    O.querySelector('.dm path').setAttribute('d','M0 0H'+innerWidth+'V'+innerHeight+'H0Z M'+(x+rr)+' '+y+'H'+(x+w-rr)+'A'+rr+' '+rr+' 0 0 1 '+(x+w)+' '+(y+rr)+'V'+(y+h-rr)+'A'+rr+' '+rr+' 0 0 1 '+(x+w-rr)+' '+(y+h)+'H'+(x+rr)+'A'+rr+' '+rr+' 0 0 1 '+x+' '+(y+h-rr)+'V'+(y+rr)+'A'+rr+' '+rr+' 0 0 1 '+(x+rr)+' '+y+'Z');
    cd.innerHTML='<div class="ar"></div><div class="hd"><div class="bd"><svg viewBox="0 0 24 24" aria-hidden="true">'+IC[s.ic]+'</svg></div><div><div class="sn">Step '+(i+1)+' of '+steps.length+'</div><h2>'+s.t+'</h2></div></div><p>'+s.p+'</p>'+
      (s.ex?'<div class="ex">'+s.ex.map(function(x){ return '<span><i aria-hidden="true">'+x[0]+'</i>'+x[1]+'</span>' }).join('')+'</div>':'')+
      '<div class="ft"><div class="dots">'+steps.map(function(_,k){ return '<i'+(k===i?' class="on"':'')+'></i>' }).join('')+'</div>'+(i<steps.length-1?'<button type="button" class="sk" data-a="sk" aria-label="Close">Skip</button><button type="button" class="nx" data-a="nx">Next</button>':'<button type="button" class="sk" data-a="sk" aria-label="Close" style="visibility:hidden">Skip</button><button type="button" class="nx" data-a="nx">Got it</button>')+'</div>';
    var below=r.bottom<innerHeight*.5, ch=cd.offsetHeight, top=below?r.bottom+pad+18:r.top-pad-18-ch;
    top=Math.max(8,Math.min(innerHeight-ch-8,top)); cd.style.top=top+'px';
    var ar=cd.querySelector('.ar'), cr=cd.getBoundingClientRect(); ar.className='ar '+(below?'up':'dn'); ar.style.left=Math.max(18,Math.min(cr.width-34,r.left+r.width/2-cr.left-8))+'px';
    var nx=cd.querySelector('.nx'); if(nx) try{ nx.focus({preventScroll:true}) }catch(x){} }
  function start(){ steps=S.slice(); i=0; document.body.classList.add('awtour');
    O=document.createElement('div'); O.id='awtour'; O.setAttribute('role','dialog'); O.setAttribute('aria-label','Quick tour'); O.innerHTML='<svg class="dm" aria-hidden="true"><path/></svg><div class="ring"></div><div class="cd"></div>';
    O.onclick=function(e){ var b=e.target.closest&&e.target.closest('[data-a]'); if(!b) return; if(b.getAttribute('data-a')==='sk') return done(); i++; if(i>=steps.length) return done(); paint() };
    var mo=new MutationObserver(function(){ if(O&&!O.isConnected){ mo.disconnect(); if(ls('aw-tut')!=='1') done() } }); mo.observe(document.body,{childList:true});
    document.body.appendChild(O); addEventListener('resize',paint); paint() }
  /* wait until the welcome screens and any first-run sheets are gone */
  function busy(){ if(document.querySelector('#awob,.awobc,.rlq,.pushask,.awobt,#awperm')) return true; /* wait for the "why we ask" card too */ var c=document.querySelector('#ofsetup:not([hidden]) .ofcta'); if(vis(c)) return true; return !!document.querySelector('.awsheet.on,[role=dialog][aria-modal=true]:not(#awtour)') }
  var n=0, t=setInterval(function(){ n++; if(ls('aw-tut')==='1'){ clearInterval(t); return } if(!document.body.classList.contains('tuton')) return; if(busy()||!vis(document.getElementById('menubtn'))) return; clearInterval(t); setTimeout(function(){ if(!busy()&&ls('aw-tut')!=='1') start(); else { t=null; wait() } },600) },700);
  function wait(){ var t2=setInterval(function(){ if(ls('aw-tut')==='1') return clearInterval(t2); if(!busy()){ clearInterval(t2); start() } },900) }
  window.__tour={ start:function(){ ls('aw-tut','0'); if(!O) start() } };
})();
