// AwareBC (by Josh Singer): saved places. Favourite or Want to go, kept on the phone (works with no service).
// On road and Off road each keep their own lists.
(function(){
  var A=window.__AW; if(!A||!A.map){ return } var map=A.map, K='aw-saved';
  var LS={fav:{n:'Favourites',ic:'⭐',one:'Favourite'},want:{n:'Want to go',ic:'🚩',one:'Want to go'}};
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] }) }
  function mode(){ return window.__awp&&window.__awp.onRoad&&!window.__awp.onRoad()?'off':'on' }
  function all(){ try{ var o=JSON.parse(localStorage.getItem(K)||'{}'); return {on:Array.isArray(o.on)?o.on:[],off:Array.isArray(o.off)?o.off:[]} }catch(e){ return {on:[],off:[]} } }
  function put(o){ try{ localStorage.setItem(K,JSON.stringify(o)) }catch(e){} draw();  }
  function near(a,la,lo){ return Math.abs(a.lat-la)<0.00025&&Math.abs(a.lon-lo)<0.00035 }
  function find(m,la,lo){ var L2=all()[m]; for(var i=0;i<L2.length;i++) if(near(L2[i],la,lo)) return L2[i]; return null }
  function toggle(m,ll,name,list){ var o=all(), L2=o[m], hit=null; for(var i=0;i<L2.length;i++) if(near(L2[i],ll.lat,ll.lng)){ hit=L2[i]; break }
    if(hit&&hit.l===list){ o[m]=L2.filter(function(x){ return x!==hit }); put(o); return null }
    if(hit){ hit.l=list; hit.n=name||hit.n; hit.t=Date.now() } else L2.unshift({lat:+ll.lat.toFixed(6),lon:+ll.lng.toFixed(6),n:String(name||'Pinned spot').slice(0,80),l:list,t:Date.now()});
    if(L2.length>300) L2.length=300; put(o); return list }
  window.__saveCard=function(box,ll,pin){ // the save row on a pin's card
    var row=document.createElement('div'); row.className='svrow'; var cx=box.querySelector('.gpsx'); box.insertBefore(row,cx);
    function nm(){ var b=box.querySelector('b'); return b?b.textContent:'' }
    function paint(){ var m=mode(), h=find(m,ll.lat,ll.lng);
      row.innerHTML=['fav','want'].map(function(k){ var on=h&&h.l===k; return '<button type="button" data-s="'+k+'" aria-pressed="'+(on?'true':'false')+'"'+(on?' class="on"':'')+'>'+LS[k].ic+' '+(on?'Saved':LS[k].one)+'</button>' }).join('') }
    row.onclick=function(e){ var t=e.target.closest&&e.target.closest('[data-s]'); if(!t) return; e.stopPropagation(); toggle(mode(),ll,nm(),t.getAttribute('data-s')); paint() };
    paint() };
  // saved spots on the map (only the lists for the side you are on)
  var lay=L.layerGroup().addTo(map);
  function draw(){ lay.clearLayers(); all()[mode()].forEach(function(a){
    L.marker([a.lat,a.lon],{icon:L.divIcon({className:'',html:'<span class="svmk" role="button" aria-label="'+esc(a.n)+'">'+LS[a.l==='want'?'want':'fav'].ic+'</span>',iconSize:[0,0]}),keyboard:false,zIndexOffset:500})
     .on('click',function(){ if(window.__pin) window.__pin(L.latLng(a.lat,a.lon),a.n) }).addTo(lay) }) }
  document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('.seg button')) setTimeout(function(){ draw(); if(P&&!P.hidden) list() },60) },true);
  // the Saved list (Tools ▸ Saved)
  var P=null, tab='fav';
  function km(a){ var me=A.me&&A.me(); if(!me||!me.lat||me.label==='none') return ''; var r=Math.PI/180, d=6371*2*Math.asin(Math.sqrt(Math.pow(Math.sin((a.lat-me.lat)*r/2),2)+Math.cos(me.lat*r)*Math.cos(a.lat*r)*Math.pow(Math.sin((a.lon-me.lon)*r/2),2))); return d<10?d.toFixed(1)+' km':Math.round(d)+' km' }
  function dirTo(a){ var me=A.me&&A.me(); if(!me||!me.lat||me.label==='none') return ''; var r=Math.PI/180, y=Math.sin((a.lon-me.lon)*r)*Math.cos(a.lat*r), x=Math.cos(me.lat*r)*Math.sin(a.lat*r)-Math.sin(me.lat*r)*Math.cos(a.lat*r)*Math.cos((a.lon-me.lon)*r); return ['N','NE','E','SE','S','SW','W','NW'][Math.round(((Math.atan2(y,x)/r+360)%360)/45)%8] }
  function ago(t){ if(!t) return ''; var d=Math.floor((Date.now()-t)/86400000); return d<1?'saved today':d===1?'saved yesterday':d<7?'saved '+d+' days ago':d<14?'saved last week':'saved '+new Date(t).toLocaleDateString([], {month:'short',day:'numeric'}) }
  var IC={star:'<path class="f" d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',flag:'<path class="f" d="M5 4h14l-3 4.5 3 4.5H5z"/><path d="M5 21V4h14l-3 4.5 3 4.5H5"/>',
    pin:'<path class="f" d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',go:'<path d="M12 2.5l9.5 9.5-9.5 9.5L2.5 12z"/><path d="M9 15v-3.5h6M13 9l2 2.5-2 2.5"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>'};
  function ic(n,z,c){ return '<svg class="svti" viewBox="0 0 24 24" aria-hidden="true" style="width:'+z+'px;height:'+z+'px'+(c?';color:'+c:'')+'">'+IC[n]+'</svg>' }
  var TC={fav:'#ffd60a',want:'#ff6a5f'};
  function list(){ var m=mode(), every=all()[m], L2=every.filter(function(a){ return (a.l==='want'?'want':'fav')===tab }), nf=every.filter(function(a){ return a.l!=='want' }).length, nw=every.length-nf;
    P.style.setProperty('--sc',TC[tab]);
    P.querySelector('.svh small').textContent=(m==='on'?'On-road':'Off-road')+' · works with no signal';
    P.querySelector('.svt').innerHTML=[['fav','star','Favourites',nf],['want','flag','Want to go',nw]].map(function(t){ var on=t[0]===tab; return '<button type="button" data-t="'+t[0]+'" aria-pressed="'+on+'"'+(on?' class="on"':'')+' style="--tc:'+TC[t[0]]+'">'+ic(t[1],15,on?TC[t[0]]:null)+t[2]+' · '+t[3]+'</button>' }).join('');
    P.querySelector('.svl').innerHTML=L2.length?L2.map(function(a,i){ return '<div class="svi"><button type="button" class="svgo" data-i="'+i+'"><span class="svb">'+ic('pin',19,'#0a0d10')+'</span><span class="svn"><b>'+esc(a.n)+'</b><small>'+esc([km(a)?km(a)+' '+dirTo(a):'',ago(a.t)].filter(Boolean).join(' · '))+'</small></span></button><button type="button" class="svx" data-x="'+i+'" aria-label="Remove '+esc(a.n)+'">'+ic('x',14)+'</button>'+(window.__nav?'<button type="button" class="svd" data-d="'+i+'" aria-label="Directions to '+esc(a.n)+'">'+ic('go',18,'#64d2ff')+'</button>':'')+'</div>' }).join('')
      :'<div class="sve">Nothing saved yet. Tap a spot on the map, then '+LS[tab].ic+' '+LS[tab].one+', or tap Save my spot below.</div>';
    P.querySelector('[data-a=all]').disabled=!L2.length; P._l=L2 }
  function open(){ if(!P){ P=document.createElement('div'); P.id='svp'; P.hidden=true; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Saved spots'); document.body.appendChild(P);
      P.innerHTML='<div class="sh"><div class="svh"><span class="svbg">'+ic('star',22,'#0a0d10')+'</span><div><h3>Saved spots</h3><small></small></div><button type="button" class="svc" aria-label="Close">'+ic('x',16)+'</button></div><div class="svt"></div><div class="svl"></div>'+
        '<div class="svbt"><button type="button" class="p" data-a="all">Show all on map</button><button type="button" data-a="me">Save my spot</button></div></div>';
      P.onclick=function(e){ var t=e.target; if(t===P||t.closest('.svc')){ P.hidden=true; return }
        var b=t.closest('[data-t]'); if(b){ tab=b.getAttribute('data-t'); list(); return }
        var x=t.closest('[data-x]'); if(x){ var a=P._l[+x.getAttribute('data-x')], o=all(); o[mode()]=o[mode()].filter(function(y){ return !(y.lat===a.lat&&y.lon===a.lon) }); put(o); list(); return }
        var dd=t.closest('[data-d]'); if(dd){ var c2=P._l[+dd.getAttribute('data-d')]; P.hidden=true; window.__nav.to(L.latLng(c2.lat,c2.lon),c2.n); return }
        var ab=t.closest('[data-a]'); if(ab){ var a2=ab.getAttribute('data-a');
          if(a2==='all'&&P._l.length){ P.hidden=true; if(P._l.length===1) map.setView([P._l[0].lat,P._l[0].lon],15); else map.fitBounds(L.latLngBounds(P._l.map(function(c){ return [c.lat,c.lon] })),{padding:[40,40],maxZoom:15}) }
          if(a2==='me'){ var me=A.me&&A.me(); if(!me||!isFinite(me.lat)||me.label==='none'){ ab.textContent='Turn on location first'; setTimeout(function(){ ab.textContent='Save my spot' },2500); return }
            var nm='My spot · '+new Date().toLocaleDateString([], {month:'short',day:'numeric'}); if(!find(mode(),me.lat,me.lon)) toggle(mode(),L.latLng(me.lat,me.lon),nm,tab); ab.textContent='Saved ✓'; setTimeout(function(){ ab.textContent='Save my spot' },2000); list() }
          return }
        var g=t.closest('[data-i]'); if(g){ var c=P._l[+g.getAttribute('data-i')]; P.hidden=true; if(window.__goTo) window.__goTo(L.latLng(c.lat,c.lon),Math.max(map.getZoom(),15)); else map.setView([c.lat,c.lon],Math.max(map.getZoom(),15),{animate:true}); setTimeout(function(){ if(window.__pin) window.__pin(L.latLng(c.lat,c.lon),c.n) },450) } } }
    list(); P.hidden=false }
  window.__saved={open:open,all:all};
  var st=document.createElement('style'); st.textContent=
    '.svrow{display:flex;gap:6px;margin-top:6px}.svrow button{flex:1;min-width:0;padding:7px 4px;border:0;border-radius:10px;font:600 12.5px var(--font,system-ui);background:#f1f3f4;color:#202124;white-space:nowrap}.svrow button.on{background:#fff4c2;box-shadow:inset 0 0 0 1.5px #f9ab00}'+
    '.svmk{display:inline-block;transform:translate(-50%,-50%);font-size:20px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.7));cursor:pointer}'+
    '#svp{position:fixed;inset:0;z-index:5500;background:rgba(0,0,0,.55);display:flex;align-items:flex-end}#svp[hidden]{display:none}'+
    '#svp .sh{width:100%;max-height:86vh;display:flex;flex-direction:column;border-radius:24px 24px 0 0;padding:14px 16px calc(env(safe-area-inset-bottom,0px) + 16px);background:radial-gradient(80% 30% at 20% 0%,color-mix(in srgb,var(--sc,#ffd60a) 16%,transparent),transparent 70%),#0b0e12;border-top:1px solid rgba(255,255,255,.08);color:#eef1f5;font:13px var(--font,system-ui);box-sizing:border-box}'+
    '#svp .svti{display:block;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:none}#svp .svti .f{fill:currentColor;fill-opacity:.28;stroke:none}'+
    '#svp .svh{display:flex;align-items:center;gap:10px}#svp .svh h3{margin:0;font:800 18px var(--font,system-ui)}#svp .svh small{display:block;font:500 11.5px var(--font,system-ui);color:#9aa3ad}'+
    '#svp .svbg{width:40px;height:40px;border-radius:13px;flex:none;display:grid;place-items:center;background:linear-gradient(145deg,#ffd60a,#c09a00);box-shadow:0 4px 14px rgba(255,214,10,.4),inset 0 1px 0 rgba(255,255,255,.45)}'+
    '#svp .svc{margin-left:auto;width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.08);color:#eef1f5;display:grid;place-items:center;flex:none}'+
    '#svp .svt{display:flex;gap:3px;padding:3px;border-radius:13px;background:rgba(255,255,255,.06);margin:12px 0 10px}#svp .svt button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;height:36px;border:0;border-radius:10px;background:none;color:#9aa3ad;font:700 12.5px var(--font,system-ui)}#svp .svt button.on{background:color-mix(in srgb,var(--tc) 20%,transparent);color:color-mix(in srgb,var(--tc) 55%,#fff)}'+
    '#svp .svl{overflow-y:auto;min-height:60px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:0 12px}#svp .svi{display:flex;gap:6px;align-items:center;padding:8px 0;border-top:1px solid rgba(255,255,255,.06)}#svp .svi:first-child{border-top:0}'+
    '#svp .svgo{flex:1;min-width:0;display:flex;align-items:center;gap:10px;text-align:left;border:0;background:none;color:#eef1f5;padding:0}#svp .svb{width:36px;height:36px;border-radius:12px;flex:none;display:grid;place-items:center;background:linear-gradient(145deg,var(--sc),color-mix(in srgb,var(--sc) 65%,#000));box-shadow:0 4px 12px color-mix(in srgb,var(--sc) 35%,transparent)}'+
    '#svp .svn{min-width:0}#svp .svn b{display:block;font:700 13.5px var(--font,system-ui);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#svp .svn small{display:block;color:#9aa3ad;font:500 11px var(--font,system-ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
    '#svp .svx{width:28px;height:28px;border:0;border-radius:9px;background:none;color:#6d7682;display:grid;place-items:center;flex:none}#svp .svd{width:36px;height:36px;border:0;border-radius:11px;background:rgba(100,210,255,.14);display:grid;place-items:center;flex:none}'+
    '#svp .sve{color:#9aa3ad;text-align:center;padding:18px 4px}#svp .svbt{display:flex;gap:8px;margin-top:10px}#svp .svbt button{flex:1;height:46px;border-radius:14px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.06);color:#eef1f5;font:700 13px var(--font,system-ui)}'+
    '#svp .svbt button.p{border:0;background:linear-gradient(180deg,#ffe36a,#c09a00);color:#1a1500;font-weight:800;box-shadow:0 6px 18px rgba(255,214,10,.35)}#svp .svbt button:disabled{opacity:.5}';
  document.head.appendChild(st);
  var tb=document.getElementById('t_saved'); if(tb) tb.onclick=function(){ document.body.classList.remove('toolon'); open() };
  draw();
})();
