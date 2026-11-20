// AwareBC map pins (by Josh Singer): one look for every pin. Places are squares, cautions are triangles, people are round.
// Dark glossy chips with a colour ring so they stand out on satellite photos, Neon and the street map alike.
// Loads right after Leaflet: every map pin made later passes through here and gets its shape.
(function(){
  if(!window.L||!L.divIcon) return;
  var CAUTION=/[🔥⚠⛔🚧🌊🌲🪨❄🦌🐻🐺🦬🫎🐗🐾⚡]/u, SOS=/🆘/u;
  var OSMC={gate:'#ff9f0a',fuel:'#e3001b',help:'#ff3b30',water:'#32ade6',peaks:'#a2845e',tower:'#8e8e93'};
  function first(el){ for(var n=el.firstChild;n;n=n.nextSibling) if(n.nodeType===1) return n; return null }
  function textOf(el){ var t=''; for(var n=el.firstChild;n;n=n.nextSibling) if(n.nodeType===3) t+=n.nodeValue; return t.trim() }
  // the icon part and the label part of a pin, so only the icon gets the shape and the label sits underneath
  function split(e){ var sm=e.querySelector('small'); if(sm) sm.parentNode.removeChild(sm); var w=document.createElement('span'); w.className='awpw';
    e.parentNode.insertBefore(w,e); w.appendChild(e); if(sm){ sm.className=(sm.className?sm.className+' ':'')+'awpl'; w.appendChild(sm) } return w }
  function shape(e){ var c=e.className||'', t=textOf(e), s='';
    if(/\b(trdot|wlmk)\b/.test(c)) s='tri';
    else if(/\bmshmk\b/.test(c)) s=/\bsos\b/.test(c)||SOS.test(t)?'tri':t.indexOf('🚙')>=0?'rd':'tri';
    else if(/\b(nrmk)\b/.test(c)) s='rd';
    else if(/\bfiremk\b/.test(c)) s=CAUTION.test(t)?'tri':'sq';
    else if(/\bosmk\b/.test(c)) s=/\bosm-gate\b/.test(c)?'tri':/\bosm-fuel\b/.test(c)?'':'sq';
    else if(/\bsvmk\b/.test(c)) s='sq';
    if(!s) return;
    if(/\bosmk\b/.test(c)&&!e.style.getPropertyValue('--c')){ var k=(/\bosm-(\w+)/.exec(c)||[])[1]; e.style.setProperty('--c',OSMC[k]||'#8e8e93') }
    if(/\bsvmk\b/.test(c)) e.style.setProperty('--c','#ffd60a');
    if(/\bnrmk\b/.test(c)) e.style.setProperty('--c',/\bfd\b/.test(c)?'#ffd60a':/\bcv\b/.test(c)?'#0a84ff':'#30d158');
    if(/\bwlmk\b/.test(c)) e.style.setProperty('--c','#ffd60a');
    if(/\bmshmk\b/.test(c)) e.style.setProperty('--c',s==='rd'?'#0a84ff':SOS.test(t)?'#ff3b30':'#ffd60a');
    if(/\btrdot\b/.test(c)&&!/\bsel\b/.test(c)) e.setAttribute('data-ic','!');
    var w=split(e); w.classList.add('awp-'+s); e.classList.add('awpi') }
  var _div=L.divIcon;
  L.divIcon=function(o){ if(o&&typeof o.html==='string'&&o.html.charAt(0)==='<'){ try{
      var b=document.createElement('div'); b.innerHTML=o.html; var e=first(b); if(e){ shape(e); o.html=b.innerHTML } }catch(x){} } return _div.call(L,o) };

  var css=
    // label under every shaped pin
    '.awpw{position:absolute;left:0;top:0;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;pointer-events:auto;cursor:pointer}'+
    '.awpw>.awpi{position:relative!important;transform:none!important;left:auto!important;top:auto!important;margin:0!important;filter:none!important}'+
    '.awpw>.awpl{position:absolute;top:100%;margin-top:3px;font:700 10.5px var(--font,system-ui)!important;color:#fff!important;background:none!important;padding:0!important;text-shadow:0 0 3px #000,0 0 2px #000,0 1px 2px #000;white-space:nowrap}'+
    // places: square chip
    '.awp-sq>.awpi{width:30px!important;height:30px!important;border-radius:9px!important;background:linear-gradient(180deg,#2c3138,#111317)!important;border:2.5px solid var(--c,#8e8e93)!important;box-sizing:border-box;display:grid!important;place-items:center;font-size:16px!important;line-height:1!important;box-shadow:0 3px 8px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.14)!important;overflow:hidden}'+
    '.awp-sq>.awpi::before{content:"";position:absolute;left:2px;right:2px;top:1px;height:40%;border-radius:7px 7px 50% 50%/7px 7px 6px 6px;background:linear-gradient(rgba(255,255,255,.16),rgba(255,255,255,0));pointer-events:none}'+
    '.awp-sq>.awpi::after{display:none!important}'+
    // cautions: road-sign triangle (coloured, dark outline, gloss), works for any colour
    '.awp-tri{filter:drop-shadow(0 3px 4px rgba(0,0,0,.6))}'+
    '.awp-tri>.awpi{width:var(--sz,34px)!important;height:calc(var(--sz,34px)*.9)!important;min-width:30px;min-height:27px;border:0!important;border-radius:0!important;box-shadow:none!important;background:#15181d!important;clip-path:polygon(50% 0,100% 100%,0 100%);display:grid!important;place-items:center;padding-top:28%;box-sizing:border-box;font-size:14px!important;line-height:1!important;color:#15181d;font-weight:900}'+
    '.awp-tri>.awpi::before{content:"";position:absolute;inset:3px 3px 2px;clip-path:polygon(50% 0,100% 100%,0 100%);background:linear-gradient(180deg,color-mix(in srgb,var(--c,#ffd60a) 78%,#fff),var(--c,#ffd60a) 55%,color-mix(in srgb,var(--c,#ffd60a) 82%,#000));z-index:-1}'+
    '.awp-tri>.awpi{isolation:isolate}.awp-tri>.awpi::after{display:none!important}'+
    '.awp-tri>.awpi[data-ic]::after{content:attr(data-ic);display:block!important;position:static;font:900 14px var(--font,system-ui);color:#15181d}'+
    '.awp-tri>.trdot.sel{--sz:42px}.awp-tri>.trdot{margin:0!important;--sz:30px}'+
    // people: round
    '.awp-rd>.awpi{width:32px!important;height:32px!important;border-radius:50%!important;background:radial-gradient(circle at 35% 30%,#3a4049,#14171b 70%)!important;border:2.5px solid var(--c,#30d158)!important;box-sizing:border-box;display:grid!important;place-items:center;font-size:16px!important;line-height:1!important;box-shadow:0 3px 8px rgba(0,0,0,.55)!important}'+
    '.awp-rd>.awpi svg.awrig{width:27px;height:27px;display:block}'+
    // friends (already round): same depth and gloss
    '.frmk b{border-width:2.5px!important;box-shadow:0 3px 8px rgba(0,0,0,.55),inset 0 -6px 10px rgba(0,0,0,.18),inset 0 4px 8px rgba(255,255,255,.22)!important}'+
    '.frmk span{font:700 10.5px var(--font,system-ui);text-shadow:0 0 3px #000,0 0 2px #000}'+
    // Rig Link feed pins
    '.rlpin.rig{border-radius:50%!important;border:2.5px solid #30d158!important;background:radial-gradient(circle at 35% 30%,#3a4049,#14171b 70%)!important}'+
    // gentle pop-in for new pins
    '@media (prefers-reduced-motion:no-preference){.awpw{animation:awpin .22s ease-out}@keyframes awpin{from{opacity:0;transform:translate(-50%,-40%) scale(.85)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}}'+
    '.mshmk.sos.awpi{animation:none}.awp-tri:has(.sos){animation:awsos 1.2s infinite}@keyframes awsos{50%{filter:drop-shadow(0 0 8px #ff3b30)}}';
  var st=document.createElement('style'); st.textContent=css; (document.head||document.documentElement).appendChild(st);
})();
