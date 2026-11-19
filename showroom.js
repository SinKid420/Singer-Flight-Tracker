// AwareBC Showroom (by Josh Singer): riders post photos of their machines for everyone nearby (about 60 km).
// Scroll the feed, like, and open the comments under each photo. Photos show whole (never cropped), on a 3D showroom stage.
(function(){
  var X=null, list=null, sort='hot', busy=false, pend=null;
  function R(){ return window.__rl }
  function esc(s){ return R().esc(s) }
  var css=
  '#srx{position:fixed;inset:0;z-index:6000;background:radial-gradient(ellipse at 50% -10%,#28344a,#0d0f12 60%);color:#fff;display:flex;flex-direction:column;font:500 13px var(--font,system-ui)}#srx[hidden]{display:none}'+
  '#srx .srhd{display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 12px) 14px 6px}#srx .srhd b{font:800 20px var(--font,system-ui);display:block}#srx .srhd small{color:#8e96a3;font:600 11.5px var(--font,system-ui)}'+
  '#srx .srx{margin-left:auto;width:40px;height:40px;border-radius:50%;border:0;background:#2c2c2e;color:#fff;font-size:18px}'+
  '#srx .srtb{display:flex;gap:8px;padding:4px 14px 10px}#srx .srtb button{border:0;padding:7px 14px;border-radius:15px;background:linear-gradient(180deg,#2c323a,#1b1f24);color:#c7ccd3;font:700 12.5px var(--font,system-ui);box-shadow:0 3px 0 #0a0c0f,0 6px 10px rgba(0,0,0,.4)}'+
  '#srx .srtb button.on{background:linear-gradient(180deg,#fff,#cfd3d8);color:#111;box-shadow:0 3px 0 #8d939b,0 6px 10px rgba(0,0,0,.4)}'+
  '#srx .srl{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 0 96px;overscroll-behavior:contain}'+
  '.srcd{padding:0 14px;margin-bottom:22px}.srcd .srwho{display:flex;align-items:center;gap:9px;margin-bottom:8px}.srcd .srav{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font:800 12px var(--font,system-ui);flex:none;box-shadow:0 3px 6px rgba(0,0,0,.6);overflow:hidden;background-size:cover;background-position:center}'+
  '.srcd .srwho small{display:block;color:#8e96a3;font:600 11px var(--font,system-ui)}.srcd .srmn{margin-left:auto;border:0;background:none;color:#8e96a3;font-size:20px;padding:4px 6px}'+
  /* the stage: whole photo, never cropped; blurred copy fills the sides; slight 3D tilt, spotlight, floor glow */
  '.srst{perspective:800px}.srph{position:relative;border-radius:16px;overflow:hidden;transform:rotateX(5deg);transform-origin:50% 100%;box-shadow:0 22px 30px -10px rgba(0,0,0,.85),0 0 0 1px rgba(255,255,255,.08);background:#11151c;display:flex;align-items:center;justify-content:center;min-height:140px;transition:transform .25s}'+
  '.srph .srbg{position:absolute;inset:-20px;width:calc(100% + 40px);height:calc(100% + 40px);object-fit:cover;filter:blur(18px) brightness(.45);transform:scale(1.1)}'+
  '.srph .srim{position:relative;display:block;max-width:100%;max-height:68vh;width:auto;height:auto;object-fit:contain}'+
  '.srph::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.14),transparent 35%);pointer-events:none}'+
  '.srcd .srx2{margin:8px 2px 0;color:#e6e9ee;font-size:13.5px;line-height:1.35;white-space:pre-wrap}.srcd .srrig{display:inline-block;margin:8px 4px 0 0;padding:3px 9px;border-radius:10px;background:#1e2228;color:#c7ccd3;font:700 11px var(--font,system-ui)}'+
  '.srac{display:flex;gap:8px;margin-top:12px;align-items:center}.srac button{border:0;display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:14px;color:#fff;font:800 13px var(--font,system-ui);background:linear-gradient(180deg,#3a4049,#1b1f24);box-shadow:0 4px 0 #0a0c0f,0 8px 14px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.2)}'+
  '.srac em{font-style:normal}.srac button:active{transform:translateY(3px);box-shadow:0 1px 0 #0a0c0f}.srac .srlk.on{background:linear-gradient(180deg,#ff5a7a,#c2133a);box-shadow:0 4px 0 #6b0618,0 8px 14px rgba(255,55,95,.35),inset 0 1px 0 rgba(255,255,255,.25)}.srac .srcb{margin-left:auto}'+
  '.srcm{margin-top:10px;background:#161a1f;border-radius:14px;padding:10px 12px}.srcm[hidden]{display:none}.srcm .c{font-size:13px;margin-bottom:8px;line-height:1.35}.srcm .c b{margin-right:4px}.srcm .c small{display:block;color:#8e96a3;font:600 10.5px var(--font,system-ui);margin-top:2px}'+
  '.srcm form{display:flex;gap:6px;margin-top:4px}.srcm input{flex:1;min-width:0;background:#23282f;border:0;border-radius:18px;padding:9px 13px;color:#fff;font:500 13px var(--font,system-ui)}.srcm form button{border:0;border-radius:18px;padding:0 15px;background:#30d158;color:#04110a;font:800 13px var(--font,system-ui)}'+
  '.srcm .none{color:#8e96a3;font-size:12.5px;margin-bottom:8px}'+
  '#srx .srfab{position:absolute;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);border:0;height:56px;padding:0 22px 0 18px;border-radius:28px;color:#fff;font:800 15px var(--font,system-ui);display:flex;align-items:center;gap:8px;background:radial-gradient(circle at 30% 25%,#ff8a80,#ff1f1f 45%,#a10000);box-shadow:0 5px 0 #6b0000,0 10px 18px rgba(255,40,40,.45)}#srx .srfab span{font-size:22px}'+
  '#srx .srmsg{text-align:center;color:#8e96a3;padding:40px 24px;font-size:14px;line-height:1.45}'+
  /* posting sheet */
  '#srpost{position:fixed;inset:0;z-index:6100;background:rgba(0,0,0,.6);display:flex;align-items:flex-end}#srpost[hidden]{display:none}#srpost .in{width:100%;max-height:92vh;overflow:auto;background:#15181d;border-radius:20px 20px 0 0;padding:14px 14px calc(env(safe-area-inset-bottom,0px) + 14px)}'+
  '#srpost h3{margin:0 0 10px;font:800 17px var(--font,system-ui);display:flex;align-items:center}#srpost h3 button{margin-left:auto;width:40px;height:40px;border-radius:50%;border:0;background:#2c2c2e;color:#fff;font-size:18px}'+
  '#srpost .pv{border-radius:14px;overflow:hidden;background:#0b0e13;display:flex;justify-content:center;max-height:46vh}#srpost .pv img{max-width:100%;max-height:46vh;object-fit:contain;display:block}'+
  '#srpost textarea{width:100%;box-sizing:border-box;margin-top:10px;background:#23282f;border:0;border-radius:12px;padding:10px 12px;color:#fff;font:500 14px var(--font,system-ui);min-height:64px;resize:none}'+
  '#srpost .go{width:100%;margin-top:10px;height:50px;border:0;border-radius:25px;background:#ff3b30;color:#fff;font:800 16px var(--font,system-ui)}#srpost .go:disabled{opacity:.6}#srpost .note{color:#8e96a3;font-size:11.5px;margin-top:8px;text-align:center}';
  css+=
  /* photo carousel: swipe sideways through up to 5 photos, each shown whole */
  '.srph{display:block}.srtr{display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch}.srtr::-webkit-scrollbar{display:none}'+
  '.srsl{flex:0 0 100%;scroll-snap-align:center;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;height:var(--h,240px)}.srsl .srim{max-height:100%}'+
  '.srcnt{position:absolute;right:10px;top:10px;z-index:2;background:rgba(0,0,0,.6);padding:3px 8px;border-radius:10px;font:800 11px var(--font,system-ui)}'+
  '.srdots{display:flex;justify-content:center;gap:5px;margin-top:9px}.srdots i{width:6px;height:6px;border-radius:3px;background:#4a505a;transition:width .2s,background .2s}.srdots i.on{background:#fff;width:16px}'+
  /* loading placeholders */
  '.srsk{padding:0 14px;margin-bottom:22px}.srsk .b{border-radius:10px;background:linear-gradient(90deg,#1b1f25 25%,#2b313a 37%,#1b1f25 63%);background-size:400% 100%;animation:srsh 1.3s ease infinite}@keyframes srsh{0%{background-position:100% 0}100%{background-position:0 0}}'+
  /* new posts pill */
  '#srx .srnew{position:absolute;left:50%;top:118px;transform:translateX(-50%);z-index:3;border:0;border-radius:18px;padding:8px 16px;background:#0a84ff;color:#fff;font:800 13px var(--font,system-ui);box-shadow:0 6px 16px rgba(10,132,255,.45)}#srx .srnew[hidden]{display:none}'+
  /* full-screen photo with pinch to zoom */
  '#srz{position:fixed;inset:0;z-index:6200;background:#000;touch-action:none;overflow:hidden}#srz[hidden]{display:none}#srz img{position:absolute;left:50%;top:50%;max-width:100vw;max-height:100vh;transform-origin:0 0;will-change:transform;user-select:none;-webkit-user-drag:none}'+
  '#srz .zx{position:absolute;right:14px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:2;width:42px;height:42px;border-radius:50%;border:0;background:rgba(40,40,44,.85);color:#fff;font-size:19px}#srz .zc{position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);text-align:center;color:#c7ccd3;font:700 12px var(--font,system-ui);z-index:2;text-shadow:0 1px 3px #000}'+
  /* posting: several photos */
  '#srpost .pvs{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}#srpost .pvi{position:relative;flex:none;height:30vh;border-radius:12px;overflow:hidden;background:#0b0e13}#srpost .pvi img{height:100%;width:auto;display:block}#srpost .pvi button{position:absolute;right:6px;top:6px;width:30px;height:30px;border-radius:50%;border:0;background:rgba(0,0,0,.7);color:#fff;font-size:14px}'+
  '#srpost .pva{flex:none;width:96px;height:30vh;border-radius:12px;border:2px dashed #3a3f47;background:none;color:#c7ccd3;font:800 13px var(--font,system-ui)}#srpost .cnt{color:#8e96a3;font:700 11.5px var(--font,system-ui);margin:6px 2px 0}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  function cl(n,o){ n=n||0; return '💬 '+n+(n===1?' comment ':' comments ')+(o?'▴':'▾') }
  function img(id){ return R().RS+'/rlm/'+encodeURIComponent(id) }
  function av(p){ var a=p.av?'style="background-image:url('+img(p.av)+')"':'style="background:'+R().col(p.tg||p.by)+'"'; return '<div class="srav" '+a+'>'+(p.av?'':R().ini(p.by))+'</div>' }
  function pics(p){ return (p.img?[p.img]:[]).concat(p.imgs||[]) }
  function card(p,i){ var rg=p.rig?'<span class="srrig">🚙 '+esc(p.rig)+'</span>':'', ph=pics(p);
    return '<div class="srcd" data-i="'+i+'" data-id="'+esc(p.id)+'"><div class="srwho">'+av(p)+'<div><b>'+esc(p.by||'Rider')+'</b><small>'+R().ago(p.t)+'</small></div><button type="button" class="srmn" data-a="menu" aria-label="More">⋯</button></div>'+
      '<div class="srst"><div class="srph">'+(ph.length>1?'<div class="srcnt">1 / '+ph.length+'</div>':'')+'<div class="srtr">'+ph.map(function(id,k){ return '<div class="srsl" data-a="zoom" data-k="'+k+'"><img class="srbg" alt="" src="'+img(id+'t')+'" loading="lazy"><img class="srim" alt="'+esc((p.by||'Rider')+'’s machine, photo '+(k+1))+'" src="'+img(id)+'" loading="lazy"'+(k?'':' data-first="1"')+'></div>' }).join('')+'</div></div></div>'+
      (ph.length>1?'<div class="srdots">'+ph.map(function(x,k){ return '<i'+(k?'':' class="on"')+'></i>' }).join('')+'</div>':'')+
      (p.x?'<div class="srx2">'+esc(p.x)+'</div>':'')+rg+
      '<div class="srac"><button type="button" class="srlk'+(p.liked?' on':'')+'" data-a="like">♥ <em>'+(p.likes||0)+'</em></button><button type="button" class="srcb" data-a="cm">'+cl(p.nc,0)+'</button></div>'+
      '<div class="srcm" hidden></div></div>' }
  // the photo box takes the first photo's shape (whole, up to about 2/3 of the screen); the others fit inside it
  function fit(root){ [].forEach.call(root.querySelectorAll('img[data-first]'),function(im){ function go(){ var ph=im.closest('.srph'); if(!ph||!im.naturalWidth) return; var w=ph.clientWidth, h=Math.min(innerHeight*.68,w*im.naturalHeight/im.naturalWidth); ph.style.setProperty('--h',Math.max(150,Math.round(h))+'px') }
      if(im.complete) go(); else im.addEventListener('load',go,{once:true}) });
    [].forEach.call(root.querySelectorAll('.srtr'),function(tr){ if(tr.__s) return; tr.__s=1; tr.addEventListener('scroll',function(){ var k=Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth)), cd=tr.closest('.srcd'), d=cd.querySelectorAll('.srdots i'), c=cd.querySelector('.srcnt');
      [].forEach.call(d,function(x,j){ x.classList.toggle('on',j===k) }); if(c) c.textContent=(k+1)+' / '+d.length },{passive:true}) }) }
  function skel(){ var o=''; for(var i=0;i<3;i++) o+='<div class="srsk"><div style="display:flex;gap:9px;align-items:center;margin-bottom:8px"><div class="b" style="width:34px;height:34px;border-radius:50%"></div><div><div class="b" style="width:110px;height:11px;margin-bottom:6px"></div><div class="b" style="width:60px;height:9px"></div></div></div><div class="b" style="height:230px;border-radius:16px"></div><div style="display:flex;gap:8px;margin-top:12px"><div class="b" style="width:70px;height:36px;border-radius:14px"></div><div class="b" style="width:130px;height:36px;border-radius:14px;margin-left:auto"></div></div></div>'; return o }
  var posts=[];
  function where(){ var m=R().me(); return m }
  function show(){ list.innerHTML=posts.length?posts.map(card).join(''):'<div class="srmsg">🏁 No machines posted near you yet.<br>Be the first: tap <b>Post my machine</b>.</div>'; fit(list) }
  function load(){ if(busy) return; busy=true; list.innerHTML=skel(); newPill(false); var m=where();
    R().api({op:'feed',f:'s',sort:sort,lat:m.lat,lon:m.lon}).then(function(j){ busy=false; posts=j.p||[]; try{ localStorage.setItem('aw-sr-c',JSON.stringify(posts.slice(0,20))) }catch(e){} show(); list.scrollTop=0 })
      .catch(function(){ busy=false; try{ posts=JSON.parse(localStorage.getItem('aw-sr-c')||'[]') }catch(e){ posts=[] }
        list.innerHTML=(navigator.onLine===false?'<div class="srmsg">📵 No signal. Showing the last saved showroom.</div>':'<div class="srmsg">📶 Weak signal. Showing the last saved showroom.</div>')+posts.map(card).join(''); fit(list) }) }
  // live: every 20 s while the Showroom is open, likes and comment counts update in place, and new posts show a "New posts" button
  var liveT=null;
  function newPill(on){ var b=X&&X.querySelector('.srnew'); if(b) b.hidden=!on }
  function live(){ clearTimeout(liveT); if(!X||X.hidden) return; liveT=setTimeout(live,20000); if(busy||document.hidden||navigator.onLine===false) return; var m=where();
    R().api({op:'feed',f:'s',sort:sort,lat:m.lat,lon:m.lon}).then(function(j){ var by={}; posts.forEach(function(p){ by[p.id]=p }); var fresh=false;
      (j.p||[]).forEach(function(q){ var p=by[q.id]; if(!p){ if(q.t>((posts[0]&&Math.max.apply(null,posts.map(function(x){ return x.t })))||0)) fresh=true; return }
        var cd=list.querySelector('.srcd[data-id="'+q.id+'"]'); if(!cd) return;
        if(q.likes!==p.likes){ p.likes=q.likes; p.liked=q.liked; var lb=cd.querySelector('[data-a=like]'); lb.classList.toggle('on',!!q.liked); lb.querySelector('em').textContent=q.likes||0 }
        if(q.nc!==p.nc){ p.nc=q.nc; var bx=cd.querySelector('.srcm'); cd.querySelector('[data-a=cm]').innerHTML=cl(p.nc,!bx.hidden) } });
      if(fresh) newPill(true) }).catch(function(){}) }
  function comments(cd,p){ var box=cd.querySelector('.srcm'), b=cd.querySelector('[data-a=cm]');
    if(!box.hidden){ box.hidden=true; b.innerHTML=cl(p.nc,0); return }
    box.hidden=false; b.innerHTML=cl(p.nc,1); box.innerHTML='<div class="none">Loading…</div>';
    R().api({op:'cmts',id:p.id}).then(function(j){ var c=j.c||[];
      box.innerHTML=(c.length?c.map(function(x){ return '<div class="c"><b>'+esc(x.by)+'</b>'+esc(x.x)+'<small>'+R().ago(x.t)+'</small></div>' }).join(''):'<div class="none">No comments yet.</div>')+
        '<form><input maxlength="300" placeholder="Add a comment" aria-label="Add a comment" enterkeyhint="send"><button type="submit">Post</button></form>' })
      .catch(function(e){ box.innerHTML='<div class="none">'+esc(navigator.onLine===false?'No signal. Comments load when you have service.':e.message)+'</div>' }) }
  function click(e){ var t=e.target.closest('[data-a]'); if(!t) return; var a=t.getAttribute('data-a');
    if(a==='close'){ X.hidden=true; clearTimeout(liveT); return } if(a==='new'||a==='hot'){ sort=a; [].forEach.call(X.querySelectorAll('.srtb button'),function(b){ b.classList.toggle('on',b.getAttribute('data-a')===a) }); load(); return }
    if(a==='post'){ pick(); return } if(a==='fresh'){ load(); return }
    if(a==='zoom'){ var c2=t.closest('.srcd'), p2=c2&&posts[+c2.getAttribute('data-i')]; if(p2) zoom(pics(p2),+t.getAttribute('data-k')); return }
    var cd=t.closest('.srcd'); if(!cd) return; var p=posts[+cd.getAttribute('data-i')]; if(!p) return;
    if(a==='like'){ if(navigator.onLine===false){ R().toast('No signal. Try again when you have service.'); return } p.liked=!p.liked; p.likes=(p.likes||0)+(p.liked?1:-1); t.classList.toggle('on',p.liked); t.querySelector('em').textContent=p.likes;
      R().api({op:'like',id:p.id}).then(function(j){ p.likes=j.c; p.liked=j.on; t.classList.toggle('on',j.on); t.querySelector('em').textContent=j.c }).catch(function(e){ R().toast(e.message) }); return }
    if(a==='cm'){ comments(cd,p); return }
    if(a==='menu'){ if(p.me){ if(confirmIn(t,'Delete this photo?')) R().api({op:'del',id:p.id}).then(function(){ R().toast('Photo deleted'); load() }).catch(function(e){ R().toast(e.message) }) }
      else if(confirmIn(t,'Report this photo?')) R().api({op:'flag',id:p.id}).then(function(){ R().toast('Thanks. We’ll take a look.') }).catch(function(e){ R().toast(e.message) }); return } }
  // two-tap confirm on the button itself (no pop-up dialogs)
  function confirmIn(b,q){ if(b.__ok&&Date.now()-b.__ok<4000){ b.__ok=0; b.textContent='⋯'; return true } b.__ok=Date.now(); var o=b.textContent; b.textContent=q+' Tap again'; b.style.fontSize='12px'; setTimeout(function(){ if(b.__ok){ b.__ok=0; b.textContent=o; b.style.fontSize='' } },4000); return false }
  function submit(e){ var f=e.target.closest('form'); if(!f||!X.contains(f)) return; e.preventDefault(); var cd=f.closest('.srcd'), p=posts[+cd.getAttribute('data-i')], inp=f.querySelector('input'), x=inp.value.trim(); if(!x||!p) return;
    if(navigator.onLine===false){ R().toast('No signal. Try again when you have service.'); return } inp.disabled=true;
    R().api({op:'cmt',id:p.id,x:x}).then(function(j){ p.nc=j.nc; var box=cd.querySelector('.srcm'); box.hidden=true; comments(cd,p) }).catch(function(e){ inp.disabled=false; R().toast(e.message) }) }
  // ---- posting: pick up to 5 photos, see them whole, add a few words, post ----
  var fi=null, P=null, MAXP=5;
  function pick(){ if(!fi){ fi=document.createElement('input'); fi.type='file'; fi.accept='image/*'; fi.multiple=true; fi.style.display='none'; document.body.appendChild(fi);
      fi.onchange=function(){ var fs=[].slice.call(fi.files||[]); fi.value=''; if(!fs.length) return; var have=pend?pend.length:0, room=MAXP-have; if(fs.length>room) R().toast('Up to '+MAXP+' photos. The first '+room+' were added.'); fs=fs.slice(0,room);
        var out=pend||[], i=0; (function nx(){ if(i>=fs.length){ pend=out; if(pend.length) sheet(); return } R().shrink(fs[i++]).then(function(o){ out.push(o); nx() }).catch(function(){ R().toast('A photo could not be opened and was skipped.'); nx() }) })() } }
    fi.click() }
  function sheet(){ if(!P){ P=document.createElement('div'); P.id='srpost'; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Post my machine'); document.body.appendChild(P);
      P.addEventListener('click',function(e){ if(e.target===P||e.target.closest('[data-a=pc]')){ P.hidden=true; pend=null; return } if(e.target.closest('.go')){ send(); return }
        var rm=e.target.closest('[data-rm]'); if(rm){ P.__x=P.querySelector('textarea').value; pend.splice(+rm.getAttribute('data-rm'),1); if(!pend.length){ P.hidden=true; pend=null } else sheet(); return }
        if(e.target.closest('.pva')){ P.__x=P.querySelector('textarea').value; pick() } }) }
    var rig=''; try{ rig=localStorage.getItem('aw-rlrig')||'' }catch(e){}
    P.innerHTML='<div class="in"><h3>📸 Post my machine<button type="button" data-a="pc" aria-label="Close">✕</button></h3><div class="pvs">'+pend.map(function(o,k){ return '<div class="pvi"><img alt="Photo '+(k+1)+'" src="'+o.img+'"><button type="button" data-rm="'+k+'" aria-label="Remove photo '+(k+1)+'">✕</button></div>' }).join('')+
      (pend.length<MAXP?'<button type="button" class="pva">＋ Add<br>photo</button>':'')+'</div><div class="cnt">'+pend.length+' of '+MAXP+' photos · swipe to see them all</div>'+
      '<textarea maxlength="500" placeholder="Say something about your machine (optional)" aria-label="Words with your photos"></textarea><button type="button" class="go">Post to the Showroom</button><div class="note">Everyone within about 60 km can see it. Your spot is only shown to about 1 km.</div></div>';
    P.querySelector('textarea').value=P.__x||''; P.hidden=false; P.__rig=rig }
  function send(){ if(!pend||!pend.length) return; if(navigator.onLine===false){ R().toast('No signal. Try again when you have service.'); return } var b=P.querySelector('.go'), m=where(); b.disabled=true; b.textContent='Posting '+pend.length+(pend.length>1?' photos…':' photo…');
    R().api({op:'post',kind:'s',lat:m.lat,lon:m.lon,img:pend[0].img,th:pend[0].th,imgs:pend.slice(1),x:P.querySelector('textarea').value.trim(),rig:P.__rig||''}).then(function(){ P.hidden=true; pend=null; P.__x=''; R().toast('Posted to the Showroom 🏁'); sort='new'; [].forEach.call(X.querySelectorAll('.srtb button'),function(x){ x.classList.toggle('on',x.getAttribute('data-a')==='new') }); load() })
      .catch(function(e){ b.disabled=false; b.textContent='Post to the Showroom'; R().toast(e.message) }) }
  // ---- full screen photo: pinch or double-tap to zoom, drag to look around, swipe for the next photo ----
  var Z=null, zs=[], zk=0, sc=1, tx=0, ty=0;
  function zoom(list2,k){ zs=list2; zk=k; if(!Z){ Z=document.createElement('div'); Z.id='srz'; Z.setAttribute('role','dialog'); Z.setAttribute('aria-label','Photo'); Z.innerHTML='<img alt=""><button type="button" class="zx" aria-label="Close">✕</button><div class="zc"></div>'; document.body.appendChild(Z); gest() } zset(); Z.hidden=false }
  function zset(){ var im=Z.querySelector('img'); sc=1; tx=0; ty=0; im.onload=zapply; im.src=img(zs[zk]); Z.querySelector('.zc').textContent=(zs.length>1?(zk+1)+' / '+zs.length+' · swipe for more · ':'')+'pinch or double-tap to zoom'; zapply() }
  function zapply(){ var im=Z.querySelector('img'), w=im.offsetWidth, h=im.offsetHeight; im.style.transform='translate('+(-w/2*sc+tx)+'px,'+(-h/2*sc+ty)+'px) scale('+sc+')' }
  function clampT(){ var im=Z.querySelector('img'), mx=Math.max(0,(im.offsetWidth*sc-innerWidth)/2), my=Math.max(0,(im.offsetHeight*sc-innerHeight)/2); tx=Math.max(-mx,Math.min(mx,tx)); ty=Math.max(-my,Math.min(my,ty)) }
  function gest(){ var pts={}, d0=0, s0=1, last=null, sx=0, lastTap=0, moved=false;
    Z.addEventListener('click',function(e){ if(e.target.closest('.zx')){ Z.hidden=true } });
    Z.addEventListener('pointerdown',function(e){ if(e.target.closest('.zx')) return; Z.setPointerCapture(e.pointerId); pts[e.pointerId]={x:e.clientX,y:e.clientY}; var k=Object.keys(pts); moved=false;
      if(k.length===2){ var a=pts[k[0]], b=pts[k[1]]; d0=Math.hypot(a.x-b.x,a.y-b.y); s0=sc } else { last={x:e.clientX,y:e.clientY}; sx=e.clientX } });
    Z.addEventListener('pointermove',function(e){ if(!pts[e.pointerId]) return; pts[e.pointerId]={x:e.clientX,y:e.clientY}; var k=Object.keys(pts);
      if(k.length===2){ var a=pts[k[0]], b=pts[k[1]], d=Math.hypot(a.x-b.x,a.y-b.y); sc=Math.max(1,Math.min(5,s0*d/Math.max(1,d0))); clampT(); zapply(); moved=true }
      else if(last&&sc>1){ tx+=e.clientX-last.x; ty+=e.clientY-last.y; last={x:e.clientX,y:e.clientY}; clampT(); zapply(); moved=true }
      else if(last&&Math.abs(e.clientX-sx)>8) moved=true });
    function up(e){ var k=Object.keys(pts); delete pts[e.pointerId]; if(k.length===1){ var dx=e.clientX-sx;
        if(sc===1&&Math.abs(dx)>60&&zs.length>1){ zk=(zk+(dx<0?1:-1)+zs.length)%zs.length; zset() }
        else if(!moved){ var n=Date.now(); if(n-lastTap<300){ sc=sc>1?1:2.5; tx=0; ty=0; zapply(); lastTap=0 } else lastTap=n } last=null } }
    Z.addEventListener('pointerup',up); Z.addEventListener('pointercancel',up);
    addEventListener('resize',function(){ if(Z&&!Z.hidden){ clampT(); zapply() } }) }
  function build(){ X=document.createElement('div'); X.id='srx'; X.hidden=true; X.setAttribute('role','dialog'); X.setAttribute('aria-label','Showroom');
    X.innerHTML='<div class="srhd"><div style="font-size:26px">🏁</div><div><b>Showroom</b><small>📍 Riders’ machines within about 60 km</small></div><button type="button" class="srx" data-a="close" aria-label="Close">✕</button></div>'+
      '<div class="srtb"><button type="button" class="on" data-a="hot">🔥 Hot</button><button type="button" data-a="new">New</button></div><div class="srl"></div>'+
      '<button type="button" class="srnew" data-a="fresh" hidden>↑ New posts</button><button type="button" class="srfab" data-a="post"><span>📸</span>Post my machine</button>';
    document.body.appendChild(X); list=X.querySelector('.srl'); X.addEventListener('click',click); X.addEventListener('submit',submit) }
  window.__showroom={open:function(){ if(!R()) return; if(!X) build(); X.hidden=false; load(); clearTimeout(liveT); liveT=setTimeout(live,20000) }, _live:function(){ live() }};
})();
