// AwareBC trail reports (by Josh Singer): status + photo + note + exact spot, shared with other riders, with comments.
(function(){
  var A=window.__AW; if(!A||!window.L) return; var map=A.map, esc=A.esc, fb=A.fb;
  var RS=(function(){ try{ var u=localStorage.getItem('sky-rsurl'); if(u&&/^https:\/\/[a-z0-9.-]+\.workers\.dev$/.test(u)) return u }catch(e){} return 'https://awarebc.joshuasinger123.workers.dev' })();
  var ST={ok:['#34c759','Open','All good'],warn:['#ff9f0a','Caution','Go slow'],bad:['#ff3b30','Blocked',"Can't pass"]};
  var TG=[['snow','❄️','Snow'],['washout','🌊','Washout'],['tree','🌲','Tree down'],['mud','🟤','Mud'],['gate','🚧','Gate closed'],['fire','🔥','Fire'],['wildlife','🐻','Wildlife']];
  var ICO={chk:'<path d="m5 12 5 5 9-10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    warn:'<path d="M12 4 2.5 20h19z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M12 10v4.5M12 17.2v.3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    stop:'<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M6 6l12 12" stroke="currentColor" stroke-width="1.9"/>',
    cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    img:'<rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4 16 5-5 4 4 2-2 5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    users:'<circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 5.5a3 3 0 0 1 0 6M17.5 14c2 .6 3.5 2.4 3.5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    send:'<path d="M4 12 20 4l-6 16-3-7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    pin:'<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="9" r="2.5" fill="currentColor"/>',
    x:'<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'};
  function I(n,s){ return '<svg width="'+(s||16)+'" height="'+(s||16)+'" viewBox="0 0 24 24" aria-hidden="true">'+ICO[n]+'</svg>' }
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v) }catch(e){ return null } }
  function lj(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v }catch(e){ return d } }
  function ago(t){ var m=Math.round((Date.now()-t)/60000); return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago' }
  function km(a,b,c,d){ return map.distance([a,b],[c,d])/1000 }
  function api(path,o){ return fetch(RS+path,o).then(function(r){ return r.json().catch(function(){ return {error:'Server error ('+r.status+')'} }).then(function(j){ if(!r.ok) throw new Error(j&&j.error||('Server error '+r.status)); return j }) }) }

  // ---------- buttons on the map ----------
  var app=document.getElementById('map').parentNode;
  var tb=document.createElement('button'); tb.className='sidebtn'; tb.id='trbtn'; tb.type='button'; tb.setAttribute('aria-label','Trail reports: show other riders\' reports'); tb.innerHTML=I('users',21)+'<b id="trn" hidden></b>';
  app.appendChild(tb);
  var on=ls('sky-tr')!=='0', G=L.layerGroup(), data=[], sel=null, mk={}, mine=lj('sky-trmine',{}), lastErr='';
  function fsrOn(){ return fb.getAttribute('aria-pressed')==='true' }
  function vis(){ var f=fsrOn(); document.body.classList.toggle('fsron',f); tb.classList.toggle('on',on); tb.setAttribute('aria-pressed',on?'true':'false');
    if(f&&on){ if(!map.hasLayer(G)) G.addTo(map); load() } else { if(map.hasLayer(G)) map.removeLayer(G); closeCard() } }
  tb.onclick=function(){ on=!on; ls('sky-tr',on?'1':'0'); toast(on?'Reports on: tap a road or pin a spot to report':'Report pins hidden. Danger alerts stay on.'); vis() };
  // "Report trail" opens only from a picked spot: a tapped road/trail or a pinned spot
  window.__trReport=function(lat,lon){ if(!fsrOn()) fb.click(); if(!on){ on=true; ls('sky-tr','1'); vis() } openForm({lat:lat,lon:lon}) };
  map.on('popupopen',function(e){ var el=e.popup.getElement&&e.popup.getElement(), b=el&&el.querySelector('.trrep'); if(!b) return; b.onclick=function(ev){ var ll=e.popup.getLatLng(); setTimeout(function(){ map.closePopup() },0); window.__trReport(ll.lat,ll.lng) } });
  if(window.MutationObserver) new MutationObserver(vis).observe(fb,{attributes:true,attributeFilter:['aria-pressed']});
  var tt=null; function toast(t){ var el=document.getElementById('trtoast'); if(!el){ el=document.createElement('div'); el.id='trtoast'; app.appendChild(el) } el.textContent=t; el.classList.add('show'); clearTimeout(tt); tt=setTimeout(function(){ el.classList.remove('show') },2200) }

  // ---------- load + pins ----------
  var lt=null, lKey='', busy=false;
  function load(force){ if(!on||!fsrOn()) return; var b=map.getBounds().pad(.3), k=[b.getSouth(),b.getNorth(),b.getWest(),b.getEast()].map(function(v){return v.toFixed(2)}).join(',');
    if(!force&&(busy||k===lKey&&Date.now()-lt<30000)) return; busy=true; lKey=k; lt=Date.now();
    var bx={s:b.getSouth(),n:b.getNorth(),w:b.getWest(),e:b.getEast()};
    api('/list?s='+bx.s.toFixed(3)+'&n='+bx.n.toFixed(3)+'&w='+bx.w.toFixed(3)+'&e='+bx.e.toFixed(3)).then(function(j){ data=(j.r||[]); lastErr=''; tcPut(data,bx); pins() })
      .catch(function(e){ lastErr=navigator.onLine?String(e.message||e):'No signal'; var c=tcGet(bx); if(c.length){ data=c; pins() } badge() }).then(function(){ busy=false }); flush() }
  // saved copy of reports so pins and danger alerts still work with no service (the offline area download fills it too)
  function inBox(r,b){ return r&&r.lat>=b.s&&r.lat<=b.n&&r.lon>=b.w&&r.lon<=b.e }
  function tcGet(b){ var c=lj('sky-trcache',null); return c&&c.r?c.r.filter(function(r){ return inBox(r,b) }):[] }
  function tcPut(list,b){ var c=lj('sky-trcache',{r:[]}), keep=(c.r||[]).filter(function(r){ return !inBox(r,b) }); ls('sky-trcache',JSON.stringify({at:Date.now(),r:keep.concat(list).slice(-3000)})) }
  function badge(){ var n=document.getElementById('trn'); var c=data.length; n.hidden=!(c||lastErr); n.textContent=lastErr?'!':(c>99?'99+':c); n.classList.toggle('bad',!!lastErr) }
  function pins(){ var seen={}; data.forEach(function(r){ seen[r.id]=1; var html=icon(r); if(mk[r.id]){ if(mk[r.id]._h!==html){ mk[r.id].setIcon(L.divIcon({className:'',html:html,iconSize:[0,0]})); mk[r.id]._h=html } return }
      var m=L.marker([r.lat,r.lon],{icon:L.divIcon({className:'',html:html,iconSize:[0,0]}),keyboard:false,bubblingMouseEvents:false,zIndexOffset:400,title:ST[r.st][1]+' report'}); m._h=html;
      m.on('click',function(){ openCard(r.id) }); m.addTo(G); mk[r.id]=m });
    Object.keys(mk).forEach(function(id){ if(!seen[id]){ G.removeLayer(mk[id]); delete mk[id] } }); badge(); if(sel&&!seen[sel]) closeCard() }
  function icon(r){ if(r.cl) return '<span class="trdot'+(r.id===sel?' sel':'')+'" style="--c:#8e8e93;opacity:.85"></span>'; var c=ST[r.st][0]; if(r.id===sel&&r.ph) return '<span class="trpin" style="--c:'+c+'"><img src="'+RS+'/thumb/'+r.id+'" alt=""></span>'; return '<span class="trdot'+(r.id===sel?' sel':'')+'" style="--c:'+c+'"></span>' }
  map.on('moveend',function(){ clearTimeout(lt2); lt2=setTimeout(load,500) }); var lt2=null;
  setInterval(function(){ if(!document.hidden) load(true) },120000);

  // ---------- report card ----------
  var card=document.createElement('div'); card.id='trcard'; card.hidden=true; card.setAttribute('role','dialog'); card.setAttribute('aria-label','Trail report'); app.appendChild(card);
  var full=document.createElement('div'); full.id='trfull'; full.hidden=true; full.innerHTML='<img alt="Trail report photo"><button type="button" aria-label="Close photo">'+I('x',18)+'</button>'; document.body.appendChild(full);
  full.onclick=function(){ full.hidden=true; full.querySelector('img').removeAttribute('src') };
  function me(){ return A.me() }
  function openCard(id){ var r=all().filter(function(x){return x.id===id})[0]; if(!r) return; var prev=sel; sel=id; if(prev&&mk[prev]) pins(); pins(); if(A.show) A.show(false);
    var m=me(), d=km(m.lat,m.lon,r.lat,r.lon), s=ST[r.st];
    card.innerHTML='<div class="trgrab"></div><button type="button" class="trx" aria-label="Close report">'+I('x',15)+'</button>'+
      '<div class="trtop">'+(r.ph?'<button type="button" class="trph" aria-label="Open photo"><img src="'+RS+'/thumb/'+r.id+'" alt="Trail photo"></button>':'')+
      '<div class="trinfo">'+(r.cl?'<span class="trst" style="--c:#34c759"><i></i>Cleared</span> <span class="trst" style="--c:#8e8e93"><i></i>was '+s[1]+'</span>':'<span class="trst" style="--c:'+s[0]+'"><i></i>'+s[1]+'</span>')+(r.tg&&r.tg.length?'<span class="trtags">'+r.tg.map(function(t){ var g=TG.filter(function(x){return x[0]===t})[0]; return g?g[1]+' '+g[2]:'' }).join(' · ')+'</span>':'')+
      (r.n?'<p class="trnote">'+esc(r.n)+'</p>':'')+'<div class="trloc">'+I('pin',13)+r.lat.toFixed(5)+', '+r.lon.toFixed(5)+' · '+(d<1?Math.round(d*1000)+' m':d.toFixed(d<10?1:0)+' km')+' away</div></div></div>'+
      '<div class="trwho"><span class="trav" style="background:'+avc(r.by)+'">'+esc((r.by||'?').charAt(0).toUpperCase())+'</span><b>'+esc(r.by)+'</b><small>'+ago(r.t)+(r.cl?' · cleared by '+esc(r.cb||'a rider')+' '+ago(r.cl):'')+'</small></div>'+
      '<div class="tract"><button type="button" data-a="go">'+I('pin',14)+'Directions</button>'+(r.cl?'':'<button type="button" data-a="clr">'+I('chk',14)+'Cleared</button>')+(mine[r.id]?'<button type="button" data-a="del">Delete</button>':'<button type="button" data-a="flag">Flag</button>')+'</div>'+
      '<div class="trch">Comments'+(r.nc?' · '+r.nc:'')+'</div><div class="trcl">'+(r.nc?'<div class="trmsg">Loading…</div>':'<div class="trmsg">No comments yet. Be the first.</div>')+'</div>'+
      '<form class="trin"><input maxlength="300" placeholder="Add a comment…" aria-label="Add a comment" enterkeyhint="send"><button type="submit" aria-label="Send comment">'+I('send',15)+'</button></form>';
    card.hidden=false; document.body.classList.add('trcard');
    card.querySelector('.trx').onclick=closeCard;
    var ph=card.querySelector('.trph'); if(ph) ph.onclick=function(){ var im=full.querySelector('img'); im.src=RS+'/photo/'+r.id; full.hidden=false };
    card.querySelector('[data-a=go]').onclick=function(){ window.open('https://www.google.com/maps/dir/?api=1&destination='+r.lat+','+r.lon+'&travelmode=driving','_blank','noopener') };
    var fl=card.querySelector('[data-a=flag]'); if(fl) fl.onclick=function(){ fl.disabled=true; api('/flag/'+r.id,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(function(){ fl.textContent='Thanks, flagged' }).catch(function(e){ fl.disabled=false; toast(e.message) }) };
    var cl=card.querySelector('[data-a=clr]'); if(cl) cl.onclick=function(){ if(cl.getAttribute('data-sure')!=='1'){ cl.setAttribute('data-sure','1'); cl.textContent='Tap: it\'s gone'; return } cl.disabled=true;
      api('/clear/'+r.id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({by:name()})}).then(function(j){ r.cl=(j&&j.cl)||Date.now(); r.cb=name()||'you'; closeCard(); pins(); toast('Marked cleared. It stays on the map for a week.') }).catch(function(e){ cl.disabled=false; toast(e.message) }) };
    var dl=card.querySelector('[data-a=del]'); if(dl) dl.onclick=function(){ if(dl.getAttribute('data-sure')!=='1'){ dl.setAttribute('data-sure','1'); dl.textContent='Tap again to delete'; return } dl.disabled=true;
      api('/del/'+r.id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:mine[r.id]})}).then(function(){ delete mine[r.id]; ls('sky-trmine',JSON.stringify(mine)); data=data.filter(function(x){return x.id!==r.id}); closeCard(); pins(); toast('Report deleted') }).catch(function(e){ dl.disabled=false; toast(e.message) }) };
    var f=card.querySelector('.trin'), inp=f.querySelector('input');
    f.onsubmit=function(e){ e.preventDefault(); var t=inp.value.trim(); if(!t) return; var nm=name(); if(!nm){ askName(function(){ f.onsubmit(e) }); return } inp.disabled=true;
      api('/c/'+r.id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({by:nm,text:t})}).then(function(j){ r.nc=j.nc; inp.value=''; comments(r) }).catch(function(e){ toast(e.message) }).then(function(){ inp.disabled=false }) };
    if(r.nc) comments(r) }
  function comments(r){ api('/c/'+r.id).then(function(j){ if(sel!==r.id) return; var cl=card.querySelector('.trcl'), c=j.c||[]; card.querySelector('.trch').textContent='Comments'+(c.length?' · '+c.length:'');
      cl.innerHTML=c.length?c.map(function(x){ return '<div class="trc"><span class="trav" style="background:'+avc(x.by)+'">'+esc((x.by||'?').charAt(0).toUpperCase())+'</span><div><b>'+esc(x.by)+'</b> <small>'+ago(x.t)+'</small><p>'+esc(x.x)+'</p></div></div>' }).join(''):'<div class="trmsg">No comments yet. Be the first.</div>' })
      .catch(function(){ var cl=card.querySelector('.trcl'); if(cl&&sel===r.id) cl.innerHTML='<div class="trmsg">Comments need signal.</div>' }) }
  function avc(s){ var h=0; s=String(s||''); for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return ['#5856d6','#34c759','#ff9f0a','#30b0c7','#af52de','#ff2d55','#007aff'][Math.abs(h)%7] }
  function closeCard(){ if(card.hidden&&!sel) return; card.hidden=true; document.body.classList.remove('trcard'); var p=sel; sel=null; if(p&&mk[p]) pins() }
  map.on('click',function(){ closeCard() });
  var dk=document.getElementById('dock'); if(dk&&window.MutationObserver) new MutationObserver(function(){ if(!dk.hidden) closeCard() }).observe(dk,{attributes:true,attributeFilter:['hidden']});

  // ---------- name ----------
  function name(){ return ls('sky-trname')||'' }
  function askName(done){ var w=document.createElement('div'); w.className='trname'; w.innerHTML='<form><b>Your name to complete action</b><small>Shown on your reports and comments</small><input maxlength="24" placeholder="e.g. Josh" aria-label="Your name to complete action"><button type="submit">Save</button></form>'; document.body.appendChild(w);
    var i=w.querySelector('input'); i.focus(); w.querySelector('form').onsubmit=function(e){ e.preventDefault(); var v=i.value.trim().slice(0,24); if(!v) return; ls('sky-trname',v); w.remove(); var nf=document.getElementById('trnm'); if(nf) nf.value=v; done&&done() };
    w.onclick=function(e){ if(e.target===w) w.remove() } }

  // ---------- post form ----------
  var form=document.createElement('div'); form.id='trform'; form.hidden=true; form.setAttribute('role','dialog'); form.setAttribute('aria-label','Report trail'); document.body.appendChild(form);
  var F={st:null,tg:[],img:null,th:null,pos:null};
  function tile(k){ var s=ST[k], ic={ok:'chk',warn:'warn',bad:'stop'}[k]; return '<button type="button" class="trtile" data-st="'+k+'" style="--c:'+s[0]+'"><span>'+I(ic,20)+'</span><b>'+s[1]+'</b><small>'+s[2]+'</small></button>' }
  function openForm(spot){ if(!spot) return; if(A.show) A.show(false); closeCard(); F={st:null,tg:[],img:null,th:null,pos:{lat:spot.lat,lon:spot.lon}};
    form.innerHTML='<div class="trfin"><div class="trfh"><b>Report trail</b><button type="button" class="trx2" aria-label="Close">'+I('x',15)+'</button></div>'+
      '<div class="trq">How\'s the trail?</div><div class="trtiles">'+tile('ok')+tile('warn')+tile('bad')+'</div>'+
      '<div class="trq">What\'s out there? <small>tap any</small></div><div class="trtg">'+TG.map(function(t){ return '<button type="button" data-tg="'+t[0]+'">'+t[1]+' '+t[2]+'</button>' }).join('')+'</div>'+
      '<div class="trq">Add a photo <small>optional</small></div><div class="trpb"><button type="button" data-p="cam">'+I('cam',21)+'Take photo</button><button type="button" data-p="gal">'+I('img',21)+'From gallery</button></div><div class="trprev" hidden></div>'+
      '<div class="trq">Note <small>optional</small></div><textarea maxlength="200" rows="2" placeholder="e.g. Chains needed past the gate"></textarea>'+
      '<div class="trrow"><span class="trgps">'+I('pin',13)+'<span>Report spot: '+spot.lat.toFixed(5)+', '+spot.lon.toFixed(5)+'</span></span>'+(name()?'':'<input id="trnm" maxlength="24" placeholder="Your name to complete action" aria-label="Your name to complete action">')+'</div>'+
      '<input type="file" accept="image/*" capture="environment" hidden data-i="cam"><input type="file" accept="image/*" hidden data-i="gal"></div>'+
      '<div class="trfoot"><button type="button" class="trpost" disabled>Pick how the trail is</button></div>';
    form.hidden=false;
    form.querySelector('.trx2').onclick=function(){ form.hidden=true };
    [].forEach.call(form.querySelectorAll('[data-st]'),function(b){ b.onclick=function(){ F.st=b.getAttribute('data-st'); [].forEach.call(form.querySelectorAll('[data-st]'),function(x){ x.classList.toggle('on',x===b) }); ready() } });
    [].forEach.call(form.querySelectorAll('[data-tg]'),function(b){ b.onclick=function(){ var t=b.getAttribute('data-tg'), i=F.tg.indexOf(t); if(i<0) F.tg.push(t); else F.tg.splice(i,1); b.classList.toggle('on',i<0) } });
    [].forEach.call(form.querySelectorAll('[data-p]'),function(b){ b.onclick=function(){ var i=form.querySelector('[data-i='+b.getAttribute('data-p')+']'); i.value=''; i.click() } });
    [].forEach.call(form.querySelectorAll('input[type=file]'),function(i){ i.onchange=function(){ if(i.files&&i.files[0]) photo(i.files[0]) } });
    form.querySelector('.trpost').onclick=post; ready() }
  function ready(){ var b=form.querySelector('.trpost'); b.disabled=!F.st||!F.pos; b.textContent=!F.st?'Pick how the trail is':!F.pos?'Waiting for your spot…':'Post report' }
  // photos are redrawn on a canvas: that shrinks them and drops hidden data (phone model, the photo's own GPS tag)
  function photo(file){ var pv=form.querySelector('.trprev'); pv.hidden=false; pv.innerHTML='<div class="trmsg">Getting photo ready…</div>';
    (window.createImageBitmap?createImageBitmap(file,{imageOrientation:'from-image'}).catch(function(){ return createImageBitmap(file) }):Promise.reject()).catch(function(){ return new Promise(function(ok,no){ var im=new Image(); im.onload=function(){ ok(im) }; im.onerror=no; im.src=URL.createObjectURL(file) }) })
      .then(function(bm){ function enc(max,q){ var w=bm.width, h=bm.height, k=Math.min(1,max/Math.max(w,h)), c=document.createElement('canvas'); c.width=Math.round(w*k); c.height=Math.round(h*k); c.getContext('2d').drawImage(bm,0,0,c.width,c.height); return c.toDataURL('image/jpeg',q) }
        var d=enc(1280,.72); if(d.length>600000) d=enc(1024,.6); if(d.length>640000) d=enc(800,.55); F.img=d; F.th=enc(220,.7);
        pv.innerHTML='<img src="'+F.th+'" alt="Your photo"><span>'+I('chk',12)+' Ready · hidden photo data removed</span><button type="button" aria-label="Remove photo">'+I('x',13)+'</button>';
        pv.querySelector('button').onclick=function(){ F.img=F.th=null; pv.hidden=true; pv.innerHTML='' } })
      .catch(function(){ pv.innerHTML='<div class="trmsg">That photo could not be read. Try another.</div>'; F.img=F.th=null }) }
  function key(){ var a=new Uint8Array(16); crypto.getRandomValues(a); return [].map.call(a,function(b){ return ('0'+b.toString(16)).slice(-2) }).join('') }
  function post(){ var nf=document.getElementById('trnm'); if(nf&&nf.value.trim()) ls('sky-trname',nf.value.trim().slice(0,24)); var nm=name(); if(!nm){ askName(post); return }
    var b=form.querySelector('.trpost'); b.disabled=true; b.textContent='Posting…';
    var k=key(), body={lat:F.pos.lat,lon:F.pos.lon,st:F.st,tg:F.tg,note:form.querySelector('textarea').value.trim().slice(0,200),by:nm,key:k,img:F.img,th:F.th};
    send(body).then(function(j){ form.hidden=true; toast('Report posted. Thanks!'); load(true); setTimeout(function(){ openCard(j.id) },900) })
      .catch(function(e){ if(!navigator.onLine||/fetch|network/i.test(String(e.message))){ var q=lj('sky-trq',[]); q.push(body); while(q.length>3) q.shift(); ls('sky-trq',JSON.stringify(q)); form.hidden=true; toast(navigator.onLine?'Reports server not reachable yet. Saved on this phone, it will post by itself.':'No signal: saved, it will post when you\'re back online') }
        else { b.disabled=false; b.textContent='Post report'; toast(e.message) } }) }
  function send(body){ return api('/report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(j){ mine[j.id]=body.key; ls('sky-trmine',JSON.stringify(mine)); return j }) }
  var flushing=false; function flush(){ var q=lj('sky-trq',[]); if(!q.length||flushing||!navigator.onLine) return; flushing=true; var b=q[0];
    send(b).then(function(){ q.shift(); ls('sky-trq',JSON.stringify(q)); toast('Saved report posted'); flushing=false; load(true); if(q.length) flush() }).catch(function(e){ flushing=false; if(/not accepted|missing/.test(e.message)){ q.shift(); ls('sky-trq',JSON.stringify(q)) } }) }
  addEventListener('online',function(){ setTimeout(flush,3000) });
  // ---------- "ahead" alerts: buzz + banner for Caution/Blocked reports within 1 km in the direction you're heading ----------
  var AL={}, wId=null, lastFix=null, hdg=null, ab=null, abT=null, AHEAD=1000;
  function brg(a,b,c,d){ var r=Math.PI/180, y=Math.sin((d-b)*r)*Math.cos(c*r), x=Math.cos(a*r)*Math.sin(c*r)-Math.sin(a*r)*Math.cos(c*r)*Math.cos((d-b)*r); return (Math.atan2(y,x)/r+360)%360 }
  function adiff(a,b){ var d=Math.abs(a-b)%360; return d>180?360-d:d }
  function banner(r,d){ if(!ab){ ab=document.createElement('button'); ab.type='button'; ab.id='tralert'; app.appendChild(ab) } var s=ST[r.st], g=(r.tg||[]).map(function(t){ var x=TG.filter(function(q){return q[0]===t})[0]; return x?x[2]:'' }).filter(Boolean)[0];
    ab.style.setProperty('--c',s[0]); ab.innerHTML='<b>⚠ '+s[1]+' ahead'+(g?' · '+esc(g):'')+'</b><span>'+(d<150?'Right here':(d<1000?Math.round(d/10)*10+' m':(d/1000).toFixed(1)+' km'))+' · tap to see the report</span>';
    ab.onclick=function(){ hide(); openCard(r.id) }; ab.classList.add('show'); clearTimeout(abT); abT=setTimeout(hide,10000);
    try{ if(navigator.vibrate) navigator.vibrate(r.st==='bad'?[400,150,400,150,400]:[250,120,250]) }catch(e){} }
  function hide(){ if(ab) ab.classList.remove('show') }
  // danger alerts are mandatory: they run even with FSR or the reports button off, using reports around your GPS spot
  var near=[], nearAt=0, nearPos=null;
  function loadNear(la,lo){ if(nearPos&&Date.now()-nearAt<120000&&map.distance(nearPos,[la,lo])<1500) return; nearAt=Date.now(); nearPos=[la,lo];
    api('/list?s='+(la-.05).toFixed(3)+'&n='+(la+.05).toFixed(3)+'&w='+(lo-.08).toFixed(3)+'&e='+(lo+.08).toFixed(3)).then(function(j){ near=j.r||[]; tcPut(near,{s:la-.05,n:la+.05,w:lo-.08,e:lo+.08}); check(la,lo) }).catch(function(){ near=tcGet({s:la-.05,n:la+.05,w:lo-.08,e:lo+.08}); check(la,lo) }) }
  function all(){ var m={}, o=[]; data.concat(near||[]).forEach(function(r){ if(r&&!m[r.id]){ m[r.id]=1; o.push(r) } }); return o }
  function check(la,lo){ var A2=all(); if(!A2.length) return; var now=Date.now(), best=null, bd=1e9;
    A2.forEach(function(r){ if(r.st==='ok'||r.cl||mine[r.id]) return; if(AL[r.id]&&now-AL[r.id]<1800000) return; var d=map.distance([la,lo],[r.lat,r.lon]); if(d>AHEAD) return;
      var ahead=d<150||(hdg!=null&&adiff(hdg,brg(la,lo,r.lat,r.lon))<=50); if(ahead&&d<bd){ bd=d; best=r } });
    if(best){ AL[best.id]=now; banner(best,bd); if(card.hidden&&form.hidden&&!document.body.classList.contains('menuon')&&!document.body.classList.contains('toolon')) openCard(best.id) } }
  function onFix(p){ var c=p.coords, la=c.latitude, lo=c.longitude;
    if(c.heading!=null&&isFinite(c.heading)&&(c.speed||0)>1.5) hdg=c.heading;
    else if(lastFix&&map.distance([lastFix[0],lastFix[1]],[la,lo])>=25) hdg=brg(lastFix[0],lastFix[1],la,lo);
    if(!lastFix||map.distance([lastFix[0],lastFix[1]],[la,lo])>=25) lastFix=[la,lo]; loadNear(la,lo); check(la,lo) }
  function watch(){ var want=!!navigator.geolocation; if(want&&wId==null) wId=navigator.geolocation.watchPosition(onFix,function(){},{enableHighAccuracy:true,maximumAge:5000,timeout:20000});
    if(!want&&wId!=null){ navigator.geolocation.clearWatch(wId); wId=null; hide() } }
  if(window.MutationObserver) new MutationObserver(watch).observe(fb,{attributes:true,attributeFilter:['aria-pressed']});
  tb.addEventListener('click',function(){ setTimeout(watch,0) });
  document.addEventListener('visibilitychange',function(){ if(document.hidden&&wId!=null){ navigator.geolocation.clearWatch(wId); wId=null } else watch() });
  window.__trTest=function(la,lo,h){ hdg=h; check(la,lo) };
  watch();
  vis();
})();
