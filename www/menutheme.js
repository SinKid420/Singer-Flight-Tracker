// AwareBC glow theme for the Layers menu (by Josh Singer): matching two-tone icons; layers that are on glow solid with an "On" tag, layers that are off are outlines.
(function(){
  var P={
    car:'<path class="f" d="M3.5 12.5h17v4.5h-17z"/><path d="M5 16.5v-4l2-5h10l2 5v4"/><path d="M3.5 12.5h17v4.5h-17z"/><circle cx="8" cy="17" r="1.7"/><circle cx="16" cy="17" r="1.7"/>',
    fire:'<path class="f" d="M12 21.5c-3.9 0-6.5-2.6-6.5-6 0-3.7 3.2-5.4 3.2-9.6 2.6 1.3 3.7 3.2 3.9 5 1.1-.9 1.7-2.2 1.7-3.7 2.8 2 4.2 5 4.2 8.3 0 3.4-2.6 6-6.5 6z"/><path d="M12 21.5c-3.9 0-6.5-2.6-6.5-6 0-3.7 3.2-5.4 3.2-9.6 2.6 1.3 3.7 3.2 3.9 5 1.1-.9 1.7-2.2 1.7-3.7 2.8 2 4.2 5 4.2 8.3 0 3.4-2.6 6-6.5 6z"/>',
    bolt:'<path class="f" d="M13.5 2.5L5 13.5h6l-1.5 8 8.5-11h-6z"/><path d="M13.5 2.5L5 13.5h6l-1.5 8 8.5-11h-6z"/>',
    plane:'<path class="f" d="M10.5 3.5h3v6.5l7 4v2l-7-2v4l2 1.5v1.5l-3.5-1-3.5 1V19.5l2-1.5v-4l-7 2v-2l7-4z"/><path d="M10.5 3.5h3v6.5l7 4v2l-7-2v4l2 1.5v1.5l-3.5-1-3.5 1V19.5l2-1.5v-4l-7 2v-2l7-4z"/>',
    sat:'<rect class="f" x="9" y="9" width="6" height="6" rx="1" transform="rotate(45 12 12)"/><rect x="9" y="9" width="6" height="6" rx="1" transform="rotate(45 12 12)"/><path d="M6.5 6.5L3.5 9.5l3 3M17.5 17.5l3-3-3-3"/>',
    apt:'<path class="f" d="M4 20.5h16V14H4z"/><path d="M4 20.5h16V14H4zM8 14V8h8v6M12 8V4M10 4h4"/>',
    snow:'<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M9.5 4.5L12 6.5l2.5-2M9.5 19.5L12 17.5l2.5 2"/><circle class="s" cx="12" cy="12" r="2"/>',
    ferry:'<path class="f" d="M4 15.5h16l-2 4H6z"/><path d="M4 15.5h16l-2 4H6zM7 15.5V11h10v4.5M10 11V8h4v3"/><path d="M2.5 21.5c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1"/>',
    ar:'<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path class="f" d="M12 7l4 2.5v5L12 17l-4-2.5v-5z"/><path d="M12 7l4 2.5v5L12 17l-4-2.5v-5zM8 9.5l4 2.5 4-2.5M12 12v5"/>',
    sos:'<path class="f" d="M12 3l8 3v6c0 4.6-3.4 8.2-8 9-4.6-.8-8-4.4-8-9V6z"/><path d="M12 3l8 3v6c0 4.6-3.4 8.2-8 9-4.6-.8-8-4.4-8-9V6z"/><path d="M12 8.5v7M8.5 12h7"/>'};
  var B='#64d2ff',A='#ffb340',R='#ff453a',V='#bf8bff',T='#40e0c8';
  var M={roadbtn:['car',A],firebtn:['fire',R],ltbtn:['bolt',A],planebtn:['plane',B],spacebtn:['sat',V],aptbtn:['apt',B],mtbtn:['snow',T],ferrybtn:['ferry',T],arbtn:['ar',V],hubbtn:['sos',R]};
  var S='body.awshell ';
  var css=
    S+'.sidebtn.mi{--c:#64d2ff;border-radius:13px!important;background:rgba(14,17,21,.88)!important;border:1.5px solid color-mix(in srgb,var(--c) 58%,transparent)!important;color:var(--c)!important;box-shadow:0 3px 10px rgba(0,0,0,.45)!important;font-size:0!important}'+
    S+'.sidebtn.mi .awmi{width:22px;height:22px;display:block;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}'+S+'.sidebtn.mi .awmi .f{fill:currentColor;fill-opacity:.28;stroke:none}'+S+'.sidebtn.mi .awmi .s{fill:currentColor}'+
    S+'.sidebtn.mi::before{background:rgba(14,17,21,.86)!important;color:#eef1f5!important;border:1px solid rgba(255,255,255,.09);font:650 13px/1 var(--font,system-ui)!important;padding:8px 12px!important;border-radius:12px!important;box-shadow:0 3px 10px rgba(0,0,0,.4)!important}'+
    S+'.sidebtn.mi.on{background:linear-gradient(145deg,var(--c),color-mix(in srgb,var(--c) 72%,#000))!important;border-color:transparent!important;color:#0a0d10!important;box-shadow:0 0 0 2px rgba(255,255,255,.9),0 4px 16px color-mix(in srgb,var(--c) 60%,transparent),inset 0 1px 0 rgba(255,255,255,.45)!important}'+
    S+'.sidebtn.mi.on::before{border-color:color-mix(in srgb,var(--c) 50%,transparent);padding-right:42px!important}'+
    S+'.sidebtn.mi.on::after{content:"On";position:absolute;right:60px;top:50%;transform:translateY(-50%);padding:2px 6px;border-radius:7px;background:var(--c);color:#0a0d10;font:800 10px/1.1 var(--font,system-ui);pointer-events:none}'+
    S+'#hubbtn.mi.alert2{background:linear-gradient(145deg,#ff453a,#b3261e)!important;color:#fff!important}'+
    S+'.sidebtn.mi.on::after{display:none}body.awshell.menuon .sidebtn.mi.on::after{display:block}'+
    'body.awshell.menuon #menubtn{background:linear-gradient(145deg,#ff6a5f,#e0281d)!important;color:#fff!important;border-color:transparent!important;box-shadow:0 6px 18px rgba(255,69,58,.45)!important}'+
    'body.awshell #menubtn .awmx{display:none}body.awshell.menuon #menubtn svg:not(.awmx){display:none}body.awshell.menuon #menubtn .awmx{display:block;width:20px;height:20px}'+
    'body.awshell.menuon #menubtn::before{content:"Layers   " attr(data-n);position:absolute;right:56px;top:50%;transform:translateY(-50%);white-space:pre;font:800 16px var(--font,system-ui);color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.8);pointer-events:none}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  function deco(){ var n=0; Object.keys(M).forEach(function(id){ var b=document.getElementById(id); if(!b) return; var m=M[id]; b.style.setProperty('--c',m[1]);
      if(!b.querySelector('.awmi')){ b.innerHTML='<svg class="awmi" viewBox="0 0 24 24" aria-hidden="true">'+P[m[0]]+'</svg>' }
      if(b.classList.contains('on')&&!b.classList.contains('off')&&!b.classList.contains('offmode')) n++ });
    var mb=document.getElementById('menubtn'); if(mb&&!mb.querySelector('.awmx')) mb.insertAdjacentHTML('beforeend','<svg class="awmx" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'); if(mb){ var t=n?n+' on':''; if(mb.getAttribute('data-n')!==t) mb.setAttribute('data-n',t) } }
  deco(); setInterval(deco,1500);
  var mo=new MutationObserver(function(){ deco() }); Object.keys(M).forEach(function(id){ var b=document.getElementById(id); if(b) mo.observe(b,{attributes:true,attributeFilter:['class'],childList:true}) });
})();
