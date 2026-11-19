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
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  function cl(n,o){ n=n||0; return '💬 '+n+(n===1?' comment ':' comments ')+(o?'▴':'▾') }
  function img(id){ return R().RS+'/rlm/'+encodeURIComponent(id) }
  function av(p){ var a=p.av?'style="background-image:url('+img(p.av)+')"':'style="background:'+R().col(p.tg||p.by)+'"'; return '<div class="srav" '+a+'>'+(p.av?'':R().ini(p.by))+'</div>' }
  function card(p,i){ var rg=p.rig?'<span class="srrig">🚙 '+esc(p.rig)+'</span>':'';
    return '<div class="srcd" data-i="'+i+'"><div class="srwho">'+av(p)+'<div><b>'+esc(p.by||'Rider')+'</b><small>'+R().ago(p.t)+'</small></div><button type="button" class="srmn" data-a="menu" aria-label="More">⋯</button></div>'+
      '<div class="srst"><div class="srph">'+(p.img?'<img class="srbg" alt="" src="'+img(p.img+'t')+'" loading="lazy"><img class="srim" alt="'+esc((p.by||'Rider')+'’s machine')+'" src="'+img(p.img)+'" loading="lazy">':'')+'</div></div>'+
      (p.x?'<div class="srx2">'+esc(p.x)+'</div>':'')+rg+
      '<div class="srac"><button type="button" class="srlk'+(p.liked?' on':'')+'" data-a="like">♥ <em>'+(p.likes||0)+'</em></button><button type="button" class="srcb" data-a="cm">💬 '+(p.nc||0)+' comments ▾</button></div>'+
      '<div class="srcm" hidden></div></div>' }
  var posts=[];
  function where(){ var m=R().me(); return m }
  function load(){ if(busy) return; busy=true; list.innerHTML='<div class="srmsg">Loading the showroom…</div>'; var m=where();
    R().api({op:'feed',f:'s',sort:sort,lat:m.lat,lon:m.lon}).then(function(j){ busy=false; posts=j.p||[]; try{ localStorage.setItem('aw-sr-c',JSON.stringify(posts.slice(0,20))) }catch(e){}
      list.innerHTML=posts.length?posts.map(card).join(''):'<div class="srmsg">🏁 No machines posted near you yet.<br>Be the first: tap <b>Post my machine</b>.</div>' })
      .catch(function(){ busy=false; try{ posts=JSON.parse(localStorage.getItem('aw-sr-c')||'[]') }catch(e){ posts=[] }
        list.innerHTML=(navigator.onLine===false?'<div class="srmsg">📵 No signal. Showing the last saved showroom.</div>':'<div class="srmsg">📶 Weak signal. Showing the last saved showroom.</div>')+posts.map(card).join('') }) }
  function comments(cd,p){ var box=cd.querySelector('.srcm'), b=cd.querySelector('[data-a=cm]');
    if(!box.hidden){ box.hidden=true; b.innerHTML=cl(p.nc,0); return }
    box.hidden=false; b.innerHTML=cl(p.nc,1); box.innerHTML='<div class="none">Loading…</div>';
    R().api({op:'cmts',id:p.id}).then(function(j){ var c=j.c||[];
      box.innerHTML=(c.length?c.map(function(x){ return '<div class="c"><b>'+esc(x.by)+'</b>'+esc(x.x)+'<small>'+R().ago(x.t)+'</small></div>' }).join(''):'<div class="none">No comments yet.</div>')+
        '<form><input maxlength="300" placeholder="Add a comment" aria-label="Add a comment" enterkeyhint="send"><button type="submit">Post</button></form>' })
      .catch(function(e){ box.innerHTML='<div class="none">'+esc(navigator.onLine===false?'No signal. Comments load when you have service.':e.message)+'</div>' }) }
  function click(e){ var t=e.target.closest('[data-a]'); if(!t) return; var a=t.getAttribute('data-a');
    if(a==='close'){ X.hidden=true; return } if(a==='new'||a==='hot'){ sort=a; [].forEach.call(X.querySelectorAll('.srtb button'),function(b){ b.classList.toggle('on',b.getAttribute('data-a')===a) }); load(); return }
    if(a==='post'){ pick(); return }
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
  // ---- posting: pick a photo, see it whole, add a few words, post ----
  var fi=null, P=null;
  function pick(){ if(!fi){ fi=document.createElement('input'); fi.type='file'; fi.accept='image/*'; fi.style.display='none'; document.body.appendChild(fi);
      fi.onchange=function(){ var f=fi.files&&fi.files[0]; fi.value=''; if(!f) return; R().shrink(f).then(function(o){ pend=o; sheet() }).catch(function(){ R().toast('That photo could not be opened. Try another one.') }) } }
    fi.click() }
  function sheet(){ if(!P){ P=document.createElement('div'); P.id='srpost'; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Post my machine'); document.body.appendChild(P);
      P.addEventListener('click',function(e){ if(e.target===P||e.target.closest('[data-a=pc]')){ P.hidden=true; pend=null } if(e.target.closest('.go')) send() }) }
    var rig=''; try{ rig=localStorage.getItem('aw-rlrig')||'' }catch(e){}
    P.innerHTML='<div class="in"><h3>📸 Post my machine<button type="button" data-a="pc" aria-label="Close">✕</button></h3><div class="pv"><img alt="Your photo" src="'+pend.img+'"></div>'+
      '<textarea maxlength="500" placeholder="Say something about your machine (optional)" aria-label="Words with your photo">'+'</textarea><button type="button" class="go">Post to the Showroom</button><div class="note">Everyone within about 60 km can see it. Your spot is only shown to about 1 km.</div></div>'; P.hidden=false; P.__rig=rig }
  function send(){ if(!pend) return; if(navigator.onLine===false){ R().toast('No signal. Try again when you have service.'); return } var b=P.querySelector('.go'), m=where(); b.disabled=true; b.textContent='Posting…';
    R().api({op:'post',kind:'s',lat:m.lat,lon:m.lon,img:pend.img,th:pend.th,x:P.querySelector('textarea').value.trim(),rig:P.__rig||''}).then(function(){ P.hidden=true; pend=null; R().toast('Posted to the Showroom 🏁'); sort='new'; [].forEach.call(X.querySelectorAll('.srtb button'),function(x){ x.classList.toggle('on',x.getAttribute('data-a')==='new') }); load() })
      .catch(function(e){ b.disabled=false; b.textContent='Post to the Showroom'; R().toast(e.message) }) }
  function build(){ X=document.createElement('div'); X.id='srx'; X.hidden=true; X.setAttribute('role','dialog'); X.setAttribute('aria-label','Showroom');
    X.innerHTML='<div class="srhd"><div style="font-size:26px">🏁</div><div><b>Showroom</b><small>📍 Riders’ machines within about 60 km</small></div><button type="button" class="srx" data-a="close" aria-label="Close">✕</button></div>'+
      '<div class="srtb"><button type="button" class="on" data-a="hot">🔥 Hot</button><button type="button" data-a="new">New</button></div><div class="srl"></div>'+
      '<button type="button" class="srfab" data-a="post"><span>📸</span>Post my machine</button>';
    document.body.appendChild(X); list=X.querySelector('.srl'); X.addEventListener('click',click); X.addEventListener('submit',submit) }
  window.__showroom={open:function(){ if(!R()) return; if(!X) build(); X.hidden=false; load() }};
})();
