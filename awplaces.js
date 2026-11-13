// AwareBC places (by Josh Singer): AwareBC's own list of businesses and places that riders add when a map is missing them.
// Shows in AwareBC right away (On road), with the address first and the phone number second, and who added it.
// Saved by the AwareBC server; the list near you is kept on the phone for when there's no signal.
(function boot(){
  var A=window.__AW; if(!A||!A.map||!window.L){ setTimeout(boot,300); return }
  var map=A.map, RS='https://awarebc.aware-bc.workers.dev', esc=A.esc||function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] }) };
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v) }catch(e){ return null } }
  function uid(){ var u=ls('sky-uid'); if(!u||u.length<20){ var a=new Uint8Array(18); crypto.getRandomValues(a); u=btoa(String.fromCharCode.apply(null,a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); ls('sky-uid',u) } return u }
  function hav(a,b,c,d){ var r=Math.PI/180, x=Math.sin((c-a)*r/2), y=Math.sin((d-b)*r/2), h=x*x+Math.cos(a*r)*Math.cos(c*r)*y*y; return 12742000*Math.asin(Math.min(1,Math.sqrt(h))) }
  function onRoad(){ var b=document.querySelector('.seg button[aria-pressed=true]'); return !b||b.getAttribute('data-b')==='sat' }
  var TY=[['Auto parts','🔧'],['Tire shop','🛞'],['Gas station','⛽'],['Restaurant','🍽'],['Café','☕'],['Grocery store','🛒'],['Store','🏪'],['Hardware store','🔨'],['Auto repair','🛠'],['Hotel / motel','🏨'],['Bank','🏦'],['Pharmacy','💊'],['Medical','🩺'],['Office','🏢'],['Service','🧰'],['Other','📍']];
  function ic(t){ for(var i=0;i<TY.length;i++) if(TY[i][0]===t) return TY[i][1]; return '📍' }
  var CELL=0.25, cache={}, all={}, lay=L.layerGroup().addTo(map), mk={}, mine=null;
  function cellU(i,j){ var s=i*CELL, w=j*CELL; return RS+'/places?s='+s.toFixed(2)+'&n='+(s+CELL).toFixed(2)+'&w='+w.toFixed(2)+'&e='+(w+CELL).toFixed(2) }
  // read a square: network first, the saved copy when there's no signal
  function cell(i,j,force){ var u=cellU(i,j); if(cache[u]&&!force&&Date.now()-cache[u].t<60000) return cache[u].p;
    var p=fetch(u).then(function(r){ if(!r.ok) throw 0; var c=r.clone(); if(window.caches) caches.open('awarebc-places').then(function(x){ x.put(u,c) }).catch(function(){}); return r.json() })
      .catch(function(){ return window.caches?caches.match(u).then(function(r){ return r?r.json():{p:[]} }):{p:[]} })
      .then(function(j){ (j.p||[]).forEach(function(x){ all[x.id]=x }); return j.p||[] }).catch(function(){ return [] });
    cache[u]={t:Date.now(),p:p}; return p }
  function draw(){ var z=map.getZoom(); if(!onRoad()||z<13){ lay.clearLayers(); mk={}; return }
    var bd=map.getBounds(), cs=[]; for(var i=Math.floor(bd.getSouth()/CELL);i<=Math.floor(bd.getNorth()/CELL);i++) for(var j=Math.floor(bd.getWest()/CELL);j<=Math.floor(bd.getEast()/CELL);j++) cs.push([i,j]); if(cs.length>6) return;
    Promise.all(cs.map(function(c){ return cell(c[0],c[1]) })).then(function(){ var keep={};
      Object.keys(all).forEach(function(id){ var p=all[id]; if(!bd.pad(0.2).contains([p.lat,p.lon])) return; keep[id]=1; if(mk[id]) return;
        mk[id]=L.marker([p.lat,p.lon],{icon:L.divIcon({className:'',html:'<span class="awpk" role="button" aria-label="'+esc(p.n)+'">'+ic(p.ty)+'</span>',iconSize:[0,0]}),keyboard:false,zIndexOffset:-150,title:p.n}).on('click',function(){ if(window.__pin) window.__pin(L.latLng(p.lat,p.lon),p.n) }).addTo(lay) });
      Object.keys(mk).forEach(function(id){ if(!keep[id]){ lay.removeLayer(mk[id]); delete mk[id] } }) }) }
  var dT=null; map.on('moveend zoomend',function(){ clearTimeout(dT); dT=setTimeout(draw,500) }); setTimeout(draw,2000);
  [].forEach.call(document.querySelectorAll('.seg button'),function(b){ b.addEventListener('click',function(){ setTimeout(draw,60) }) });
  var css=document.createElement('style'); css.textContent='.awpk{display:inline-block;transform:translate(-50%,-50%);font-size:16px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.85))}'+
    '#awpf{position:fixed;inset:0;z-index:5500;background:rgba(0,0,0,.55);display:flex;align-items:flex-end}#awpf[hidden]{display:none}#awpf .sh{width:100%;background:var(--bg,#1c1c1e);color:var(--fg,#fff);border-radius:18px 18px 0 0;padding:12px 16px calc(env(safe-area-inset-bottom,0px) + 12px);font:13px var(--font,system-ui)}'+
    '#awpf h3{margin:0 0 8px;font:800 17px var(--font,system-ui)}#awpf label{display:block;font-size:11px;color:var(--dim,#aaa);margin-top:6px}#awpf input,#awpf select{width:100%;box-sizing:border-box;height:36px;margin-top:2px;border:0;border-radius:10px;background:var(--chip,#2c2c2e);color:var(--fg,#fff);padding:0 10px;font:15px var(--font,system-ui)}'+
    '#awpf .two{display:flex;gap:8px}#awpf .two>div{flex:1;min-width:0}#awpf .bt{display:flex;gap:8px;margin-top:12px}#awpf .bt button{flex:1;height:42px;border:0;border-radius:21px;font:700 14px var(--font,system-ui);background:var(--chip,#2c2c2e);color:var(--fg,#fff)}#awpf .bt .pri{background:var(--accent,#ff3b30);color:#fff}'+
    '#awpf .nt{font-size:11px;color:var(--dim,#aaa);margin-top:8px;text-align:center}#awpf .er{color:#ff8a80;font-size:12px;margin-top:6px;min-height:14px}';
  document.head.appendChild(css);

  // ---------- add or fix a place ----------
  var F=null;
  function form(o){ o=o||{}; if(!F){ F=document.createElement('div'); F.id='awpf'; F.hidden=true; F.setAttribute('role','dialog'); F.setAttribute('aria-label','Add a place'); document.body.appendChild(F);
      F.addEventListener('click',function(e){ if(e.target===F) F.hidden=true }) }
    var me=ls('sky-trname')||'';
    F.innerHTML='<div class="sh"><h3>'+(o.id?'Fix this place':o.n?'Fix info for this place':'Add a place')+'</h3>'+
      '<label>Name *<input id="awpn" maxlength="80" autocomplete="off" value="'+esc(o.n||'')+'"></label>'+
      '<label>Address<input id="awpa" maxlength="120" autocomplete="off" value="'+esc(o.ad||'')+'" placeholder="Street and town"></label>'+
      '<label>Phone<input id="awpp" type="tel" maxlength="30" autocomplete="off" value="'+esc(o.ph||'')+'" placeholder="(250) 555-0123"></label>'+
      '<div class="two"><div><label>Type<select id="awpt">'+TY.map(function(t){ return '<option'+(t[0]===o.ty?' selected':'')+'>'+t[0]+'</option>' }).join('')+'</select></label></div><div><label>Hours<input id="awph" maxlength="120" autocomplete="off" value="'+esc(o.hr||'')+'" placeholder="Mon–Fri 8–5"></label></div></div>'+
      '<label>Website<input id="awpw" type="url" maxlength="200" autocomplete="off" value="'+esc(o.ws||'')+'" placeholder="https://"></label><div class="er" role="status"></div>'+
      '<div class="bt"><button type="button" data-a="no">Cancel</button><button type="button" class="pri" data-a="ok">Save</button></div>'+
      '<div class="nt">Shows in AwareBC right away · Added by '+esc(me||'you')+'. Only add real places.</div></div>';
    F.hidden=false; var er=F.querySelector('.er');
    F.querySelector('[data-a=no]').onclick=function(){ F.hidden=true };
    F.querySelector('[data-a=ok]').onclick=function(){ var btn=this, v=function(id){ return F.querySelector('#'+id).value.trim() }, ws=v('awpw');
      if(v('awpn').length<2){ er.textContent='Add the name.'; return } if(ws&&!/^https?:\/\//i.test(ws)) ws='https://'+ws;
      btn.disabled=true; btn.textContent='Saving…';
      fetch(RS+'/s/place',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:uid(),name:me||'AwareBC rider',op:o.id?'edit':'add',id:o.id,lat:o.lat,lon:o.lon,n:v('awpn'),ad:v('awpa'),ph:v('awpp'),ty:v('awpt'),hr:v('awph'),ws:ws})})
        .then(function(r){ return r.json().then(function(j){ if(!r.ok||j.error) throw new Error(j.error||'Could not save'); return j }) })
        .then(function(j){ F.hidden=true; mine=null; var i=Math.floor(o.lat/CELL), k=Math.floor(o.lon/CELL); if(o.id) delete all[o.id];
          cell(i,k,true).then(function(){ draw(); if(window.__pin){ A.map.closePopup(); setTimeout(function(){ window.__pin(L.latLng(o.lat,o.lon),v('awpn')) },900) } }) })
        .catch(function(e){ btn.disabled=false; btn.textContent='Save'; er.textContent=navigator.onLine===false?'No signal: try again when you have service.':e.message }) };
    setTimeout(function(){ var n=F.querySelector('#awpn'); if(n&&!o.n) n.focus() },50) }
  function myIds(){ if(mine) return mine; mine=fetch(RS+'/s/myplaces',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:uid(),name:ls('sky-trname')||''})}).then(function(r){ return r.json() }).catch(function(){ return {ids:[]} }); return mine }

  // ---------- the card: address first, phone second ----------
  function card(p,box,upd){ var h='';
    if(p.ad) h+='<div class="pad" style="color:#333">'+esc(p.ad)+'</div>';
    if(p.ph) h+='<div class="pln"><a href="tel:'+esc(p.ph.replace(/[^\d+]/g,''))+'">📞 '+esc(p.ph)+'</a></div>';
    if(p.ty) h+='<div class="pty">'+esc(p.ty)+'</div>'; if(p.hr) h+='<div class="pad">Hours: '+esc(p.hr)+'</div>';
    if(p.ws&&/^https?:\/\//i.test(p.ws)) h+='<div class="pln"><a href="'+esc(p.ws)+'" target="_blank" rel="noopener noreferrer">Website ›</a></div>';
    h+='<small class="psrc">Added by '+esc(p.by||'an AwareBC rider')+' · AwareBC <span class="awpx"></span></small>';
    box.innerHTML=h; upd&&upd();
    myIds().then(function(m){ var x=box.querySelector('.awpx'); if(!x) return; var can=m.admin||(m.ids||[]).indexOf(p.id)>=0;
      x.innerHTML=' · <a href="#" data-x="fix">'+(can?'Edit':'Report wrong')+'</a>'; x.querySelector('a').onclick=function(e){ e.preventDefault(); e.stopPropagation();
        if(can){ A.map.closePopup(); form(p); return } var a=this; fetch(RS+'/s/place',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:uid(),name:ls('sky-trname')||'',op:'flag',id:p.id})}).then(function(){ a.textContent='Reported, thanks' }).catch(function(){}) }; upd&&upd() }) }
  function at(lat,lon,title){ var best=null, bd=35, tl=String(title||'').toLowerCase(); Object.keys(all).forEach(function(id){ var p=all[id], d=hav(lat,lon,p.lat,p.lon); if(tl&&p.n.toLowerCase()===tl) d-=20; if(d<bd){ bd=d; best=p } }); return best }
  function search(q){ q=String(q||'').toLowerCase(); var m=A.me&&A.me()||{lat:0,lon:0};
    return Object.keys(all).map(function(id){ return all[id] }).filter(function(p){ return p.n.toLowerCase().indexOf(q)>=0||String(p.ty).toLowerCase().indexOf(q)>=0 }).sort(function(a,b){ return hav(m.lat,m.lon,a.lat,a.lon)-hav(m.lat,m.lon,b.lat,b.lon) }).slice(0,8)
      .map(function(p){ return {n:p.n,t:(p.ty||'Place')+(p.ad?' · '+p.ad:'')+' · AwareBC',lat:p.lat,lon:p.lon,ic:ic(p.ty),bg:'#fde2e1',z:17,rank:-1} }) }
  // places near home are saved with the offline area
  window.__awp={form:form,card:card,at:at,search:search,onRoad:onRoad,urls:function(b){ var o=[]; for(var i=Math.floor(b.s/CELL);i<=Math.floor(b.n/CELL);i++) for(var j=Math.floor(b.w/CELL);j<=Math.floor(b.e/CELL);j++) o.push(cellU(i,j)); return o },
    loadAround:function(lat,lon){ return cell(Math.floor(lat/CELL),Math.floor(lon/CELL)) }};
})();
