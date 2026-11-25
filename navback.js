// AwareBC back button (by Josh Singer): the phone's back button / back swipe (and Esc on a computer) closes whatever is on top,
// one screen at a time, and takes you back to the screen you came from (Settings ▸ Blocked riders ▸ back = Settings).
// Works for every sheet, page and panel in the app without each one needing its own code. Back with nothing open leaves the app as usual.
(function(){
  function shown(e){ if(!e||e.hidden) return false; var s=getComputedStyle(e); if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0) return false; var r=e.getBoundingClientRect(); return r.width>20&&r.height>20 }
  function z(e){ var v=0; for(var n=e;n&&n!==document.body;n=n.parentElement){ var s=getComputedStyle(n), k=parseInt(s.zIndex,10); if(!isNaN(k)&&s.position!=='static') v=Math.max(v,k) } return v }
  var SEL='#srz,#srpost,#srx,#frsheet,#rlx,.aws,#srbox,#ar,#v3d,#ofsetup,#awwel,.sheet-bg,.lyrp,[role=dialog]';
  var OPEN={fsheet:'#gear',hubsheet:'#hubbtn',frsheet:'#frbtn',rlx:'#rlbtn',srx:null};
  // what's open right now, topmost first
  function stack(){ var L=[].filter.call(document.querySelectorAll(SEL),function(e){ return shown(e)&&!(e.parentElement&&e.parentElement.closest(SEL)&&e.parentElement.closest(SEL)!==e&&shown(e.parentElement.closest(SEL))) });
    L.sort(function(a,b){ return z(b)-z(a)||(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING?1:-1) });
    var b=document.body.classList; if(b.contains('awleg')) L.unshift({_k:'awleg'}); if(b.contains('toolon')) L.push({_k:'toolon'}); if(b.contains('menuon')) L.push({_k:'menuon'});
    return L }
  function key(e){ return e._k||e.id||(e.className&&String(e.className).split(' ')[0])||'x' }
  // the button that closes it: a Back button first (one step back inside the screen), then Close / Cancel / ✕
  function closer(e){ var bs=[].filter.call(e.querySelectorAll('button,[role=button]'),function(b){ return shown(b) });
    function f(t){ return bs.filter(t).pop() }
    return f(function(b){ return /^back$/i.test(b.getAttribute('aria-label')||'')||/^[‹←]$/.test(b.textContent.trim())||b.getAttribute('data-a')==='back' })||
      f(function(b){ return /^close\b/i.test(b.getAttribute('aria-label')||'') })||f(function(b){ return /^(✕|×|✖)$/.test(b.textContent.trim()) })||
      f(function(b){ return /^(cancel|close|done|not now)$/i.test(b.textContent.trim()) }) }
  function closeTop(){ var L=stack(); if(!L.length) return false; var t=L[0], k=t._k;
    if(k==='awleg'){ var lg=document.getElementById('fsrleg'); if(lg) lg.click(); document.body.classList.remove('awleg'); return true }
    if(k==='toolon'){ var tb=document.getElementById('toolbtn'); if(tb) tb.click(); else document.body.classList.remove('toolon'); return true }
    if(k==='menuon'){ var mb=document.getElementById('menubtn'); if(mb) mb.click(); else document.body.classList.remove('menuon'); return true }
    var c=closer(t); if(c){ c.click(); return true }
    if(t.classList&&t.classList.contains('sheet-bg')){ t.hidden=true; return true } t.hidden=true; return true }
  // remember where you came from: a screen that opens right as another closes is its "child"
  var prev=[], parent={}, lastClose={k:null,t:0}, backT=0;
  function watch(){ var now=stack().map(key), t=Date.now(), byBack=t-backT<700;
    var retTo=null;
    prev.forEach(function(k){ if(now.indexOf(k)<0){ if(parent[k]) retTo=parent[k]; if(byBack&&parent[k]){ var o=OPEN[parent[k]]; var p=parent[k]; delete parent[k]; if(o) setTimeout(function(){ var b=document.querySelector(o); if(b&&stack().map(key).indexOf(p)<0) b.click() },120) } else delete parent[k]; if(!byBack) lastClose={k:k,t:t,ret:retTo} } }); /* only a screen closed by tapping (not by back) can be a parent */
    now.forEach(function(k){ if(prev.indexOf(k)<0&&lastClose.k&&lastClose.k!==k&&lastClose.ret!==k&&k!==retTo&&t-lastClose.t<700&&OPEN[lastClose.k]) parent[k]=lastClose.k });
    if(now.length>depth){ for(var i=depth;i<now.length;i++) try{ history.pushState({awb:i+1},'') }catch(e){} depth=now.length }
    else if(now.length<depth&&!byBack){ var n=depth-now.length; depth=now.length; skip++; try{ history.go(-n) }catch(e){ skip-- } }
    prev=now }
  var depth=0, skip=0;
  /* some screens already close themselves on back / Esc: only step in if the same screen is still on top a moment later */
  function soon(){ var L=stack(); if(!L.length) return; var k0=key(L[0]); backT=Date.now(); setTimeout(function(){ var M=stack(); if(M.length&&key(M[0])===k0) closeTop(); setTimeout(watch,80) },60) }
  addEventListener('popstate',function(){ if(skip>0){ skip--; return } if(depth>0){ depth--; soon() } });
  addEventListener('keydown',function(e){ if(e.key!=='Escape') return; var a=document.activeElement; if(a&&/INPUT|TEXTAREA/.test(a.tagName)&&a.value) return; soon() });
  setInterval(watch,250);
  /* opening a main page (tab bar, Layers, Search) closes whatever page was open before, so screens never pile up behind each other */
  var KEEP='#awob,#awtour,#awupd,.legends,#tut,#locmsg,#navp';
  function closeAll(except){ for(var i=0;i<12;i++){ var L=stack().filter(function(e){ return !e._k&&!(e.matches&&(e.matches(KEEP)||(except&&e.matches(except)))) }).concat(stack().filter(function(e){ return e._k==='toolon'||e._k==='menuon' }));
      if(!L.length) return; var t=L[0]; if(t._k){ document.body.classList.remove(t._k); continue } var c=closer(t); if(c) c.click(); else t.hidden=true; if(shown(t)) t.hidden=true } }
  var MAINS=[['#awtabs [data-t=map]',''],['#awtabs [data-t=alerts]','#hubsheet'],['#awtabs [data-t=me]','#awme'],['#awtabs [data-t=tl2]','#awtools'],['#menubtn','#awlyr'],['#awtop .sr','#srbox']];
  addEventListener('click',function(e){ if(!e.isTrusted||!e.target.closest) return; var hit=null;
    MAINS.forEach(function(m){ if(!hit&&e.target.closest(m[0])) hit=m });
    if(!hit){ var mid=e.target.closest('#awtabs [data-t=mid]'); if(mid) hit=['',document.body.classList.contains('fsron')?'#rlx':'#awtools'] }
    if(!hit) return; closeAll(hit[1]||null) },true);
  window.__closeAll=closeAll;
  window.__navBack={depth:function(){ return depth+'/'+skip+'/'+history.length }, stack:function(){ return stack().map(key) }, back:function(){ if(depth>0) history.back(); else soon() }};
})();
