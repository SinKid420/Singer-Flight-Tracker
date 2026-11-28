/* AwareBC quick buttons (by Josh Singer): any layer can be pinned to the home map as a one-tap button.
   Layers ▸ hold a tile ▸ "Add to map", then drag it where you want it and tap Done.
   On the map: tap = turn that layer on/off · hold and drag = move it · hold and let go = remove it.
   Kept on this phone. */
(function boot(){
  if(!window.__awLayers||!window.__awLayers.K){ setTimeout(boot,400); return }
  var LY=window.__awLayers, K='aw-quick', Q=[];
  try{ Q=JSON.parse(localStorage.getItem(K)||'[]')||[] }catch(e){ Q=[] }
  Q=Q.filter(function(q){ return q&&LY.K[q.k] });
  function save(){ try{ localStorage.setItem(K,JSON.stringify(Q)) }catch(e){} }
  var css=document.createElement('style'); css.textContent=
    '.awqb{position:fixed;z-index:1002;width:48px;height:48px;margin:-24px 0 0 -24px;border-radius:50%;border:1px solid #2a2f36;background:rgba(18,21,26,.92);color:#fff;display:grid;place-items:center;padding:0;box-shadow:0 6px 16px rgba(0,0,0,.5);touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;transition:box-shadow .2s,transform .15s}'+
    '.awqb em{font-style:normal;font-size:22px;line-height:1;display:grid;place-items:center}.awqb em svg{display:block;transform:scale(1.15)}'+
    '.awqb small{position:absolute;top:50px;left:50%;transform:translateX(-50%);white-space:nowrap;font:700 10.5px/1.2 var(--font,system-ui);color:#fff;text-shadow:0 1px 3px #000,0 0 6px #000}'+
    '.awqb.on{border-color:rgba(100,210,255,.7);box-shadow:0 0 14px rgba(100,210,255,.45),0 6px 16px rgba(0,0,0,.5)}.awqb.on:after{content:"";position:absolute;right:3px;top:3px;width:8px;height:8px;border-radius:50%;background:#32d74b;box-shadow:0 0 6px #32d74b}'+
    '.awqb.dim{opacity:.55}.awqb.lift{transform:scale(1.15);box-shadow:0 0 0 3px #64d2ff,0 12px 26px rgba(0,0,0,.6);z-index:1010}'+
    'body.menuon .awqb,body.toolon .awqb,body.navon .awqb,body.srchon .awqb,body.trcard .awqb,body.fsrp .awqb,body.awon .awqb,body.keyon .awqb{display:none}'+
    '#awqbar{position:fixed;z-index:1011;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 10px);display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:16px;background:#1f242b;border:1px solid #3a414b;box-shadow:0 12px 30px rgba(0,0,0,.6);color:#fff;font:600 13px/1.3 var(--font,system-ui)}'+
    '#awqbar span{flex:1}#awqbar button{height:40px;padding:0 14px;border:0;border-radius:12px;font:800 14px var(--font,system-ui)}#awqbar .ok{background:linear-gradient(180deg,#8fe0ff,#3bb4ea);color:#06202c}#awqbar .rm{background:rgba(255,69,58,.18);color:#ff8a80}';
  document.head.appendChild(css);
  var els={};
  function limit(x,y){ var W=innerWidth, H=innerHeight; return [Math.max(30,Math.min(W-30,x)),Math.max(110,Math.min(H-120,y))] } /* stays clear of the top bar and the tab bar */
  function draw(){ Object.keys(els).forEach(function(k){ if(!Q.some(function(q){ return q.k===k })){ els[k].remove(); delete els[k] } });
    Q.forEach(function(q){ var t=LY.K[q.k], b=els[q.k]; if(!b){ b=els[q.k]=document.createElement('button'); b.type='button'; b.className='awqb'; b.setAttribute('data-q',q.k); b.innerHTML='<em aria-hidden="true">'+LY.icon(t)+'</em><small>'+t[2]+'</small>'; hook(b,q); document.body.appendChild(b) }
      var p=limit(q.x*innerWidth,q.y*innerHeight); b.style.left=p[0]+'px'; b.style.top=p[1]+'px' }); paint() }
  function paint(){ Q.forEach(function(q){ var b=els[q.k], t=LY.K[q.k]; if(!b||!t) return; var on=LY.ok(t)&&LY.isOn(t); b.classList.toggle('on',on); b.classList.toggle('dim',!LY.ok(t)); b.setAttribute('aria-pressed',on?'true':'false'); b.setAttribute('aria-label',t[2]+(on?' on':' off')+' (hold to move or remove)') }) }
  var bar=null, placing=null;
  function hideBar(){ if(bar){ bar.remove(); bar=null } if(placing&&els[placing]) els[placing].classList.remove('lift'); placing=null }
  function showBar(k,txt){ hideBar(); placing=k; if(els[k]) els[k].classList.add('lift'); bar=document.createElement('div'); bar.id='awqbar'; bar.setAttribute('role','dialog'); bar.setAttribute('aria-label','Place quick button');
    bar.innerHTML='<span>'+txt+'</span><button type="button" class="rm" aria-label="Remove from map">Remove</button><button type="button" class="ok" aria-label="Close">Done</button>'; document.body.appendChild(bar);
    bar.querySelector('.ok').onclick=hideBar; bar.querySelector('.rm').onclick=function(){ remove(k); hideBar() } }
  function hook(b,q){ var hold=null, sx=0, sy=0, drag=false, moved=false, noTap=0;
    b.addEventListener('pointerdown',function(e){ sx=e.clientX; sy=e.clientY; moved=false; try{ b.setPointerCapture(e.pointerId) }catch(x){}
      drag=placing===q.k; if(drag) b.classList.add('lift'); clearTimeout(hold); hold=setTimeout(function(){ drag=true; b.classList.add('lift'); try{ navigator.vibrate&&navigator.vibrate(25) }catch(x){} },450) });
    b.addEventListener('pointermove',function(e){ var dx=e.clientX-sx, dy=e.clientY-sy; if(!drag){ if(Math.abs(dx)>10||Math.abs(dy)>10){ clearTimeout(hold); hold=null } return }
      if(Math.abs(dx)>4||Math.abs(dy)>4) moved=true; var p=limit(e.clientX,e.clientY); b.style.left=p[0]+'px'; b.style.top=p[1]+'px'; e.preventDefault() });
    function up(){ clearTimeout(hold); hold=null; if(!drag) return; drag=false; noTap=Date.now(); var r=b.getBoundingClientRect(); q.x=(r.left+r.width/2)/innerWidth; q.y=(r.top+r.height/2)/innerHeight; save();
      if(placing===q.k) return; b.classList.remove('lift'); if(!moved) showBar(q.k,'Drag <b>'+LY.K[q.k][2]+'</b> to move it, or remove it.') }
    b.addEventListener('pointerup',up); b.addEventListener('pointercancel',up);
    b.addEventListener('contextmenu',function(e){ e.preventDefault() });
    b.addEventListener('click',function(e){ e.preventDefault(); if(Date.now()-noTap<400||placing===q.k) return; LY.tap(q.k); setTimeout(paint,250); setTimeout(paint,900) }) }
  function add(k){ if(Q.some(function(q){ return q.k===k })) return; /* starts just above the middle, then you drag it into place */ Q.push({k:k,x:.5,y:.42}); save(); draw();
    setTimeout(function(){ showBar(k,'Drag <b>'+LY.K[k][2]+'</b> where you want it, then tap Done.') },120) }
  function remove(k){ Q=Q.filter(function(q){ return q.k!==k }); save(); draw(); LY.refresh() }
  window.__quick={has:function(k){ return Q.some(function(q){ return q.k===k }) },add:add,remove:remove};
  draw(); addEventListener('resize',draw);
  new MutationObserver(function(){ paint() }).observe(document.body,{attributes:true,attributeFilter:['class']});
  setInterval(paint,2500);
})();
