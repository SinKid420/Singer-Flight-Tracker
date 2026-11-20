// AwareBC glow theme for Search (by Josh Singer): full screen over a view of Earth from space (stars, city lights, a sunrise glow).
(function(){
  var box=document.getElementById('srbox'); if(!box) return;
  var LOW=!!window.__awLow;
  var css=
    '#srbox.awth{top:0!important;left:0!important;right:0!important;bottom:0;max-height:none!important;padding:calc(env(safe-area-inset-top,0px) + 12px) 16px 16px;gap:10px!important;z-index:1300;background:radial-gradient(80% 26% at 15% 0%,rgba(100,210,255,.16),transparent 70%),radial-gradient(90% 22% at 50% 100%,rgba(100,200,255,.2),transparent 75%),#07090c;color:#eef1f5;overflow:hidden}'+
    '#srbox.awth .awsky{position:absolute;inset:0;pointer-events:none;z-index:0}#srbox.awth .awsky svg{position:absolute;left:0;bottom:0;width:100%;height:100%}'+
    '#srbox.awth>*:not(.awsky){position:relative;z-index:1}'+
    '#srbox.awth .srbar{height:48px!important;border-radius:15px!important;background:rgba(255,255,255,.07)!important;border:1.5px solid rgba(100,210,255,.55);box-shadow:0 0 0 4px rgba(100,210,255,.12)!important;color:#64d2ff!important;padding:0 6px 0 12px!important}'+
    '#srbox.awth input{color:#eef1f5!important;font-size:15.5px!important}#srbox.awth input::placeholder{color:#8a93a0}'+
    '#srbox.awth .srx{order:-1;margin-left:-6px;width:36px!important;height:36px!important;border-radius:11px!important;background:rgba(255,255,255,.08)!important;color:#eef1f5!important;display:grid;place-items:center}'+
    '#srbox.awth .srx svg{width:18px!important;height:18px!important;stroke-width:2.2!important}'+
    '#srbox.awth .srres{background:none!important;box-shadow:none!important;border-radius:0!important;padding-bottom:40px}'+
    '#srbox.awth .srchips{padding:0 0 10px!important;gap:6px!important}#srbox.awth .srchips button{display:inline-flex;align-items:center;gap:6px;padding:7px 11px 7px 8px!important;border-radius:12px!important;background:rgba(255,255,255,.06)!important;border:1px solid rgba(255,255,255,.08)!important;color:#eef1f5!important;font:700 12px var(--font,system-ui)!important}'+
    '#srbox.awth .srchips button.on{background:color-mix(in srgb,var(--c) 22%,transparent)!important;border-color:color-mix(in srgb,var(--c) 50%,transparent)!important}'+
    '#srbox.awth .srchips svg{width:15px;height:15px;fill:none;stroke:var(--c);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}#srbox.awth .srchips svg .f{fill:var(--c);fill-opacity:.28;stroke:none}'+
    '#srbox.awth #srlist{border-radius:18px;background:rgba(14,17,22,.72);border:1px solid rgba(255,255,255,.08);overflow:hidden;backdrop-filter:blur(6px)}#srbox.awth #srlist:empty{display:none}'+
    '#srbox.awth .srr{border-top:1px solid rgba(255,255,255,.06)!important;color:#eef1f5!important;padding:10px 12px!important}#srbox.awth .srr:first-child{border-top:0!important}#srbox.awth .srr:active{background:rgba(255,255,255,.05)!important}'+
    '#srbox.awth .sri{width:36px!important;height:36px!important;border-radius:12px!important;background:linear-gradient(145deg,var(--k),color-mix(in srgb,var(--k) 70%,#000))!important;color:#fff!important;box-shadow:0 4px 12px color-mix(in srgb,var(--k) 40%,transparent),inset 0 1px 0 rgba(255,255,255,.4)}'+
    '#srbox.awth .srt b{font:700 13.5px var(--font,system-ui)!important}#srbox.awth .srt small{color:#9aa3ad!important;font-size:11.5px!important}#srbox.awth .srk{color:#eef1f5!important;font:700 12.5px var(--font,system-ui)!important}'+
    '#srbox.awth .srhint{border:0!important;color:#9aa3ad!important;padding:12px 14px!important}'+
    '#srbox.awth .awsrc{position:absolute;left:16px;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 58px);text-align:center;font:500 10.5px var(--font,system-ui);color:#9fc4e4;z-index:1;pointer-events:none}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  // the sky: stars, Earth's curve with a soft atmosphere, city lights, and a sunrise glow on one side
  function sky(){ var seed=7; function r(){ seed=(seed*16807)%2147483647; return seed/2147483647 } var W=360, H=640, CY=1212, RX=760, RY=620, s='', n=LOW?70:160;
    for(var i=0;i<n;i++){ var x=r()*W, y=r()*(H-25), z=r()<.12?1.3:r()<.4?.9:.6; s+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+z+'" fill="#fff" opacity="'+(.18+r()*.4).toFixed(2)+'"/>' }
    var lt=''; [[60,8],[140,5],[230,10],[305,6]].forEach(function(c){ for(var i=0;i<(LOW?18:40);i++){ var x=c[0]+(r()-.5)*c[1]*8, rx=x-180, yy=CY-Math.sqrt(Math.max(0,1-rx*rx/(RX*RX)))*RY, y=yy+3+Math.pow(r(),1.6)*32;
      lt+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(r()<.25?1.3:.75)+'" fill="'+(r()<.5?'#ffcf7a':'#ffe9b0')+'" opacity="'+(.45+r()*.5).toFixed(2)+'"/>' } });
    var E='<ellipse cx="180" cy="'+CY+'" rx="'+RX+'" ry="'+RY+'" ';
    return '<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><radialGradient id="awseg" cx="50%" cy="0%" r="75%"><stop offset="0" stop-color="#1a4270"/><stop offset=".5" stop-color="#0d2440"/><stop offset="1" stop-color="#060d18"/></radialGradient>'+
      '<linearGradient id="awslimb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a8e2ff"/><stop offset=".6" stop-color="#cfeaff"/><stop offset="1" stop-color="#ffb066"/></linearGradient>'+
      '<linearGradient id="awsog" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".45" stop-color="#333"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="awsom"><rect width="360" height="640" fill="url(#awsog)"/></mask>'+
      '<radialGradient id="awsog2" cx="100%" cy="100%" r="80%"><stop offset="0" stop-color="#ff8a2a" stop-opacity=".35"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient>'+
      (LOW?'':'<filter id="awssb" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter><filter id="awsgb" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>')+'</defs>'+s+
      (LOW?'':E+'fill="none" stroke="#7cc8ff" stroke-width="16" opacity=".35" filter="url(#awsgb)"/>'+E+'fill="none" stroke="#ff9a3c" stroke-width="24" opacity=".4" filter="url(#awsgb)" mask="url(#awsom)"/>')+
      E+'fill="url(#awseg)"/>'+lt+E+'fill="none" stroke="url(#awslimb)" stroke-width="3" opacity=".45"'+(LOW?'':' filter="url(#awssb)"')+'/><rect x="0" y="540" width="360" height="100" fill="url(#awsog2)"/></svg>' }
  var CH={hosp:['#ff453a','<rect class="f" x="4" y="4" width="16" height="16" rx="4"/><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/>'],
    gas:['#ff453a','<path class="f" d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h6A1.5 1.5 0 0 1 14 5.5V20z"/><path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h6A1.5 1.5 0 0 1 14 5.5V20zM3.5 20h12M7 8h5M14 10h2a1.5 1.5 0 0 1 1.5 1.5V16a1.5 1.5 0 0 0 3 0V9l-2.5-2.5"/>'],
    rec:['#32d74b','<path class="f" d="M12 4.5L3 19.5h18z"/><path d="M12 4.5L3 19.5h18zM12 4.5v15M9 19.5l3-5 3 5"/>']};
  var KC={'#5f6368':'#8a93a0','#188038':'#32d74b','#1a73e8':'#64d2ff','#795548':'#c08a5a','#e37400':'#ffb340','#d93025':'#ff453a','#c2185b':'#ff6fa8'};
  var BACK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  function deco(){ box.classList.add('awth');
    if(!box.querySelector('.awsky')){ var d=document.createElement('div'); d.className='awsky'; d.innerHTML=sky(); box.insertBefore(d,box.firstChild);
      var n=document.createElement('div'); n.className='awsrc'; n.textContent='Places from OpenStreetMap volunteers, BC rec sites and riders. Hours can change.'; box.appendChild(n) }
    var qi=box.querySelector('#srq'); if(qi&&!qi.__aw){ qi.__aw=1; qi.placeholder='Search places, creeks, rec sites…' }
    var x=box.querySelector('.srx'); if(x&&!x.querySelector('svg')){ x.innerHTML=BACK; x.setAttribute('aria-label','Back') }
    [].forEach.call(box.querySelectorAll('.srchips button[data-c]'),function(b){ if(b.querySelector('svg')) return; var c=CH[b.getAttribute('data-c')]; if(!c) return; b.style.setProperty('--c',c[0]); b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+c[1]+'</svg>'+b.textContent.replace(/^\S+\s/,'') });
    [].forEach.call(box.querySelectorAll('.sri'),function(i){ if(i.__aw) return; i.__aw=1; var c=(i.style.color||'').toLowerCase(), hex=c.indexOf('rgb')===0?'#'+c.match(/\d+/g).slice(0,3).map(function(v){ return ('0'+(+v).toString(16)).slice(-2) }).join(''):c; i.style.setProperty('--k',KC[hex]||'#64d2ff') }) }
  deco(); new MutationObserver(deco).observe(box,{childList:true,subtree:true});
  // mark the quick search that's showing
  box.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('.srchips button'); if(!b) return; [].forEach.call(box.querySelectorAll('.srchips button'),function(x){ x.classList.toggle('on',x===b) }) });
  box.addEventListener('input',function(){ [].forEach.call(box.querySelectorAll('.srchips button.on'),function(x){ x.classList.remove('on') }) });
})();
