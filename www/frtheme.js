// AwareBC glow theme for Friends (by Josh Singer): glass cards, glowing toggles, icon badges and online dots.
(function(){
  var P={
    pin:'<path class="f" d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle class="s" cx="12" cy="10" r="2.4"/>',
    sound:'<path class="f" d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    mesh:'<circle class="s" cx="12" cy="12" r="2"/><path d="M8 8a5.5 5.5 0 0 0 0 8M16 8a5.5 5.5 0 0 1 0 8M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/>',
    msg:'<path class="f" d="M4.5 5.5h15v10h-9l-4 3.5v-3.5h-2z"/><path d="M4.5 5.5h15v10h-9l-4 3.5v-3.5h-2z"/>',
    share:'<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1"/>',
    mail:'<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>',
    book:'<rect x="5" y="3.5" width="14" height="17" rx="2"/><circle cx="12" cy="10" r="2.6"/><path d="M8.5 16.5c.6-1.8 2-2.7 3.5-2.7s2.9.9 3.5 2.7"/>',
    shield:'<path class="f" d="M12 3l8 3v6c0 4.6-3.4 8.2-8 9-4.6-.8-8-4.4-8-9V6z"/><path d="M12 3l8 3v6c0 4.6-3.4 8.2-8 9-4.6-.8-8-4.4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'};
  function svg(n,s,c){ return '<svg class="awti" viewBox="0 0 24 24" aria-hidden="true" style="width:'+s+'px;height:'+s+'px'+(c?';color:'+c:'')+'">'+P[n]+'</svg>' }
  var G='#32d74b',A='#ffb340',B='#64d2ff',V='#bf8bff', F='#frsheet.awth ';
  var css=
    F+'{background:radial-gradient(80% 26% at 15% 0%,rgba(50,215,75,.16),transparent 70%),radial-gradient(60% 22% at 100% 0%,rgba(100,210,255,.14),transparent 70%),#0b0e12!important;border-top:1px solid rgba(255,255,255,.08)}'+
    F+'.awti{display:block;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:none}'+F+'.awti .f{fill:currentColor;fill-opacity:.28;stroke:none}'+F+'.awti .s{fill:currentColor}'+
    F+'.frhd b{font:800 21px var(--font)!important}'+F+'.frhd small{color:#9aa3ad}'+F+'.frhd small span{color:#7dff9a!important;font-weight:800}'+F+'.frx,'+F+'.frbk{background:rgba(255,255,255,.08)!important;border:0!important}'+
    F+'.frnote{background:linear-gradient(150deg,rgba(50,215,75,.12),rgba(255,255,255,.03) 65%)!important;border:1px solid rgba(50,215,75,.24);border-radius:14px!important}'+
    F+'.frshare{--c:'+G+';background:rgba(255,255,255,.05)!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:16px!important;padding:9px 12px!important}'+
    F+'.frshare>span{display:flex;align-items:center;gap:10px;flex-wrap:wrap}'+F+'.frshare>span>small{flex-basis:100%;padding-left:44px;margin-top:-16px;color:#9aa3ad}'+
    F+'.awib{width:34px;height:34px;border-radius:11px;background:linear-gradient(145deg,var(--c),color-mix(in srgb,var(--c) 72%,#000));display:grid;place-items:center;box-shadow:0 4px 12px color-mix(in srgb,var(--c) 38%,transparent),inset 0 1px 0 rgba(255,255,255,.45);flex:none}'+
    F+'.frtg.on{background:#32d74b!important;box-shadow:0 0 10px rgba(50,215,75,.5)}'+F+'.frtg{background:#3a3f47!important}'+
    F+'.fradd input{background:rgba(255,255,255,.05)!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:14px!important}'+
    F+'.frbt.g{background:linear-gradient(145deg,#5df27a,#28b84a)!important;color:#05150a!important;box-shadow:0 6px 16px rgba(50,215,75,.3);border-radius:14px!important}'+
    F+'.frbt{background:rgba(255,255,255,.08)!important;border-radius:12px!important}'+F+'.frbt .awti{margin-right:5px}'+F+'.frbt.ic{width:36px;height:36px;padding:0!important;display:grid!important;place-items:center;flex:none!important}'+F+'.frbt.ic .awti{margin:0}'+
    F+'.frh{letter-spacing:0!important;font:700 12.5px var(--font)!important;color:#9aa3ad!important;text-transform:none}'+F+'.frh .frlink{color:'+B+'!important;font-weight:700}'+
    F+'.frrow{border-top:1px solid rgba(255,255,255,.07)!important}'+F+'.frav{width:38px!important;height:38px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.3)}'+F+'.frav i{width:11px!important;height:11px!important;background:#32d74b!important;border-color:#0b0e12!important;box-shadow:0 0 6px #32d74b}'+
    F+'.frrow small.awon{color:#7dff9a}'+F+'.frun{background:#ff453a!important;box-shadow:0 0 8px rgba(255,69,58,.5)}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  var SH={share:['pin',G],mesh:['mesh',B],sound:['sound',A]};
  var H={'GROUPS':'Groups','FRIENDS':'Friends','REQUESTS':'Requests','SAFETY & ACCOUNT':'Safety & account'};
  function deco(el){ el.classList.add('awth');
    [].forEach.call(el.querySelectorAll('.frshare[data-a]'),function(b){ var m=SH[b.getAttribute('data-a')], sp=b.querySelector(':scope>span'); if(!m||!sp||sp.querySelector('.awib')) return;
      var t=sp.firstChild; if(t&&t.nodeType===3) t.textContent=t.textContent.replace(/^\S+\s/,''); b.style.setProperty('--c',m[1]); var i=document.createElement('span'); i.className='awib'; i.innerHTML=svg(m[0],18,'#0a0d10'); sp.insertBefore(i,sp.firstChild) });
    [].forEach.call(el.querySelectorAll('.frbt'),function(b){ if(b.__aw) return; var a=b.getAttribute('data-a'), tx=b.textContent.trim();
      if(tx==='💬'&&(a==='chat'||a==='gchat')){ b.__aw=1; b.classList.add('ic'); b.setAttribute('aria-label','Chat'); b.innerHTML=svg('msg',18) }
      else if(tx==='📍'&&a==='see'){ b.__aw=1; b.classList.add('ic'); b.setAttribute('aria-label','Show on map'); b.innerHTML=svg('pin',18,G) }
      else if(a==='invs'){ b.__aw=1; b.innerHTML=svg('share',16,B)+'Share' } else if(a==='inve'){ b.__aw=1; b.innerHTML=svg('mail',16,B)+'Email' } else if(a==='invc'){ b.__aw=1; b.innerHTML=svg('book',16,B)+'Contacts' } });
    [].forEach.call(el.querySelectorAll('.frh'),function(h){ var t=h.firstChild; if(t&&t.nodeType===3){ var k=t.textContent.trim(); if(H[k]) t.textContent=H[k]+' ' } });
    [].forEach.call(el.querySelectorAll('.frrow>div>small'),function(s){ if(/^Online/.test(s.textContent)) s.classList.add('awon') });
    var n=el.querySelector('.frnote'); if(n&&!n.__aw&&/Ride safe/.test(n.textContent)){ n.__aw=1; var f=n.firstChild; if(f&&f.nodeType===3) f.textContent=''; n.insertAdjacentHTML('afterbegin',svg('shield',16,G).replace('style="','style="display:inline-block;vertical-align:-3px;margin-right:4px;')) } }
  function hook(){ var el=document.getElementById('frsheet'); if(!el) return false; deco(el); new MutationObserver(function(){ deco(el) }).observe(el,{childList:true,subtree:true}); return true }
  if(!hook()){ var mo=new MutationObserver(function(){ if(hook()) mo.disconnect() }); mo.observe(document.body,{childList:true}) }
})();
