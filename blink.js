/* Page blink (by Josh Singer): a page opens and closes like a slow eye blink, while the map behind stays as it is.
   Opening: the page waits a moment (so it's fully drawn), then appears through an eye-shaped opening that widens from the middle.
   Closing: the page narrows to an eye-shaped slit and is gone. Skipped with "reduce motion"; quicker on older phones. */
(function(){
  try{ if(matchMedia('(prefers-reduced-motion: reduce)').matches) return }catch(e){}
  var LOW=!!window.__awLow, SHUT=LOW?170:260, HOLD=LOW?60:120, OPEN=LOW?260:420;
  /* eye-shaped opening over an element: pointed at both corners, widest in the middle. o = 0 shut … 1 wide open */
  function eye(el,o){ var W=el.offsetWidth, H=el.offsetHeight, cy=H/2, x0=-W*0.45, x1=W*1.45, k=o*H*1.45, cx=W/2;
    el.style.clipPath=o>=1?'':'path("M'+x0.toFixed(1)+' '+cy.toFixed(1)+' Q'+cx.toFixed(1)+' '+(cy-k).toFixed(1)+' '+x1.toFixed(1)+' '+cy.toFixed(1)+' Q'+cx.toFixed(1)+' '+(cy+k).toFixed(1)+' '+x0.toFixed(1)+' '+cy.toFixed(1)+' Z")' }
  function anim(el,from,to,ms,ease,done){ var t0=performance.now(); (function step(now){ var p=Math.min(1,(now-t0)/ms); eye(el,from+(to-from)*ease(p)); if(p<1) requestAnimationFrame(step); else done&&done() })(t0) }
  var easeIn=function(p){ return p*p*p }, easeOut=function(p){ return 1-Math.pow(1-p,3) };
  function topPage(){ var nb=window.__navBack, k=nb&&nb.stack&&nb.stack()[0]; var el=k&&document.getElementById(k); if(el) return el;
    var all=[].filter.call(document.querySelectorAll('[role=dialog]'),function(d){ return !d.hidden&&d.offsetParent!==null&&!d.closest('#awperm,#awscore,#awbat,#ofwhat,#awlog,#awdel,#awpk') }); return all[all.length-1]||null }
  function openEye(before){ var tries=0; (function find(){ var el=topPage(); if(el&&el!==before){ eye(el,0); setTimeout(function(){ anim(el,0,1,OPEN,easeOut,function(){ el.style.clipPath='' }) },HOLD); return } if(++tries<6) requestAnimationFrame(find) })() }
  function fire(t){ var ev=new MouseEvent('click',{bubbles:true,cancelable:true,view:window}); ev.__awBlink=true; t.dispatchEvent(ev) }
  window.__blink={open:openEye};
  var OPENERS='#awtabs button,#menubtn,#awtop .sr,#awme [data-g],#awtools .tt button';
  var CLOSERS='[role=dialog] [aria-label=Close],[role=dialog] [aria-label=Back],[role=dialog] .x,[role=dialog] [data-a=x]';
  var SMALL='#awperm,#awscore,#awbat,#ofwhat,#awlog,#awdel,#awpk'; /* small cards just close */
  document.addEventListener('click',function(e){ if(e.__awBlink||!e.isTrusted) return; var t=e.target&&e.target.closest&&e.target.closest(OPENERS+','+CLOSERS); if(!t||t.closest(SMALL)) return;
    var page=t.closest('[role=dialog]'), closing=!!page&&t.matches(CLOSERS);
    if(closing){ e.preventDefault(); e.stopImmediatePropagation(); /* the page shuts like an eye, then closes for real */
      anim(page,1,0,SHUT,easeIn,function(){ fire(t); setTimeout(function(){ page.style.clipPath='' },60) }); return }
    e.preventDefault(); e.stopImmediatePropagation(); var before=topPage(); fire(t); openEye(before) /* the tap goes through, and the new page is hidden before it's ever drawn, then opens like an eye */ },true);
})();
