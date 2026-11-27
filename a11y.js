/* Accessibility helpers (by Josh Singer): bigger tap areas for small chips and buttons, and pop-up messages read out by screen readers. */
(function(){
  var st=document.createElement('style');
  st.textContent='.awhit{position:relative}.awhit::after{content:"";position:absolute;left:-2px;right:-2px;top:50%;height:44px;min-height:100%;transform:translateY(-50%)}';
  document.head.appendChild(st);
  /* a small chip or ✕ gets an invisible 44 px tall touch area (Android and Apple both ask for about 44-48) without changing how it looks */
  function hit(root){ [].forEach.call((root||document).querySelectorAll('button,a[href],[role=button]'),function(e){ if(e.__aw11) return;
    if(e.closest('.leaflet-pane,.leaflet-control-container,#awtabs,#awtop')) { e.__aw11=1; return }
    var r=e.getBoundingClientRect(); if(!r.width||!r.height) return; e.__aw11=1; if(r.height>=40) return;
    var s=getComputedStyle(e), a=getComputedStyle(e,'::after'); if(a.content&&a.content!=='none'&&a.content!=='normal') return;
    if(s.position==='static') e.classList.add('awhit'); else if(s.position==='relative'||s.position==='absolute'||s.position==='fixed'){ e.classList.add('awhit'); e.style.position=s.position } }) }
  /* short messages that pop up (saved, sent, no signal...) are announced */
  function live(root){ [].forEach.call((root||document).querySelectorAll('[class*=toast],[id*=toast],#stat'),function(e){ if(!e.getAttribute('role')){ e.setAttribute('role','status'); e.setAttribute('aria-live','polite') } }) }
  /* changes inside the map itself (tiles, plane and rider markers) are skipped: nothing there needs these fixes, and it saves battery */
  var __offMap=function(rs){ for(var i=0;i<rs.length;i++){ var t=rs[i].target; t=t&&t.nodeType===1?t:t&&t.parentElement; if(!t||!t.closest||!t.closest('.leaflet-container')) return true } return false }; var q=0; new MutationObserver(function(rs){ if(!__offMap(rs)||q||document.body.classList.contains('moving')) return; q=1; setTimeout(function(){ q=0; hit(); live() },400) }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open','class']});
  setTimeout(function(){ hit(); live() },1500);
})();
