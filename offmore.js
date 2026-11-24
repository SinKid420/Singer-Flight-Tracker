// AwareBC Off-road trip tools (by Josh Singer): fuel range, trip recap card, campfire rules, wildlife sightings,
// rider photos on the map, Explorer badge (summits, passes, lookouts), convoy lead & sweep alerts, weekend planner.
// Everything here is Off-road only and works from free sources: your own GPS, OpenStreetMap, BC Wildfire Service, Open-Meteo.
(function(){
  var A=window.__AW; if(!A||!A.map) return; var MAP=A.map, esc=A.esc, RS='https://awarebc.aware-bc.workers.dev';
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v) }catch(e){ return null } }
  function lj(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v }catch(e){ return d } }
  function sj(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)) }catch(e){} }
  function rl(b){ return fetch(RS+'/s/rl',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({uid:ls('sky-uid')||'',name:ls('sky-trname')||''},b))})
    .then(function(r){ return r.json() }).then(function(j){ if(j.error) throw new Error(j.error); return j }) }
  function off(){ return document.body.classList.contains('fsron') }
  function me(){ var m=A.me&&A.me(); return m&&m.label!=='none'&&isFinite(m.lat)?m:null }
  function km(a,b,c,d){ var r=Math.PI/180, x=Math.sin((c-a)*r/2), y=Math.sin((d-b)*r/2); return 12742*Math.asin(Math.sqrt(x*x+Math.cos(a*r)*Math.cos(c*r)*y*y)) }
  function toast(t){ var d=document.createElement('div'); d.className='frtoast'; d.style.zIndex=6600; d.textContent=t; document.body.appendChild(d); setTimeout(function(){ d.classList.add('go') },3200); setTimeout(function(){ d.remove() },3800) }
  function buzz(){ try{ if(navigator.vibrate) navigator.vibrate([250,100,250]) }catch(e){} }
  function sheet(html){ var o=document.createElement('div'); o.className='osbg'; o.innerHTML='<div class="ossh omsh" role="dialog"><div class="grab"></div>'+html+'</div>'; document.body.appendChild(o); o.addEventListener('click',function(e){ if(e.target===o) o.remove() }); return o }

  // ================= background: fuel, trip, explorer (every 15 s while Off-road) =================
  var F=lj('aw-fuel',{tank:0,use:0,km:0}), T=lj('aw-trip',null), V=lj('aw-visited',{}), lastPos=null;
  function tick(){ if(!off()) return; var m=me(); if(!m) return; var now=Date.now();
    if(lastPos){ var d=km(lastPos.lat,lastPos.lon,m.lat,m.lon), dt=(now-lastPos.t)/3600000; if(d>0.03&&d/Math.max(dt,1e-4)<200){ F.km=(F.km||0)+d; sj('aw-fuel',F); trip(m,d,now); fuelWarn() } else if(d>0.03) trip(m,0,now) } else trip(m,0,now);
    lastPos={lat:m.lat,lon:m.lon,t:now} }
  function trip(m,d,now){ if(!T||now-T.last>6*3600000) T={t0:now,last:now,km:0,pts:[[+m.lat.toFixed(5),+m.lon.toFixed(5)]],top:0,ph:0};
    T.last=now; T.km+=d; var p=T.pts[T.pts.length-1]; if(km(p[0],p[1],m.lat,m.lon)>0.15){ T.pts.push([+m.lat.toFixed(5),+m.lon.toFixed(5)]); if(T.pts.length>2500) T.pts=T.pts.filter(function(x,i){ return i%2===0 }) }
    if(isFinite(m.alt)&&m.alt>T.top) T.top=Math.round(m.alt); sj('aw-trip',T) }
  var warned=0;
  function range(){ return F.tank&&F.use?Math.max(0,F.tank/F.use*100-(F.km||0)):null }
  function fuelWarn(){ var r=range(); if(r==null) return; if(r<60&&Date.now()-warned>1800000){ warned=Date.now(); buzz(); toast('⛽ About '+Math.round(r)+' km of fuel left. Head toward gas.') } }
  // Explorer: summits, passes and lookouts from OpenStreetMap, counted when you get within 150 m
  function explore(){ var m=me(); if(!off()||!m||!window.__osm||!__osm.inArea) return;
    __osm.inArea({s:m.lat-0.01,n:m.lat+0.01,w:m.lon-0.015,e:m.lon+0.015}).then(function(P){ (P||[]).forEach(function(p){ if(p.k!=='peaks'||V[p.id]) return; if(km(m.lat,m.lon,p.lat,p.lon)>0.15) return;
      var t=p.t||{}, nm=t.name||(t.tourism==='viewpoint'?'a lookout':t.mountain_pass==='yes'||t.natural==='saddle'?'a pass':'a summit'); V[p.id]=Date.now(); sj('aw-visited',V);
      buzz(); toast('🏅 Explorer: you reached '+nm+'!'); if(navigator.onLine!==false) rl({op:'visit',pid:String(p.id).replace(/[^a-z0-9:_-]/gi,'').slice(0,24)}).then(function(j){ if(j.given&&window.__rlMini){} }).catch(function(){}) }) }).catch(function(){}) }
  setInterval(tick,15000); setInterval(explore,60000); setTimeout(explore,8000);

  // ================= convoy lead & sweep alerts =================
  var cvSeen={}, cvT={};
  function convoy(){ var role=ls('aw-cvrole')||'', C=window.__cvRigs, m=me(); if(!role||!off()||!C||!m||Date.now()-C.t>180000) return;
    (C.r||[]).forEach(function(r){ var k=r.tg, prev=cvSeen[k], now=Date.now(), dist=km(m.lat,m.lon,r.lat,r.lon);
      if(!prev||km(prev.lat,prev.lon,r.lat,r.lon)>0.1){ cvSeen[k]={lat:r.lat,lon:r.lon,t:now}; return }
      var still=now-prev.t; if(still>10*60000&&!(cvT[k+'s']>prev.t)){ cvT[k+'s']=now; buzz(); toast('🚙 '+r.by+' hasn’t moved for '+Math.round(still/60000)+' min. Check on them?') }
      if(dist>(role==='sweep'?3:5)&&now-(cvT[k+'d']||0)>15*60000){ cvT[k+'d']=now; buzz(); toast('🚙 '+r.by+' is '+dist.toFixed(1)+' km '+(role==='lead'?'behind you':'away')+'.') } }) }
  setInterval(convoy,60000);

  // ================= wildlife sightings + rider photos on the map =================
  var WL={bear:'🐻',moose:'🫎',elk:'🦌',deer:'🦌',cougar:'🐆',wolf:'🐺',other:'🐾'}, NAMES={bear:'Bear',moose:'Moose',elk:'Elk',deer:'Deer',cougar:'Cougar',wolf:'Wolf',other:'Other wildlife'};
  var lay=L.layerGroup().addTo(MAP), feedT=0;
  function feed(){ var m=me(), c=MAP.getCenter(); if(!off()){ lay.clearLayers(); return } if(navigator.onLine===false||Date.now()-feedT<240000) return; feedT=Date.now();
    rl({op:'feed',lat:m?m.lat:c.lat,lon:m?m.lon:c.lng}).then(function(j){ lay.clearLayers(); var now=Date.now();
      (j.p||[]).forEach(function(p){ var age=now-p.t;
        if(/^wl-/.test(p.st||'')&&age<24*3600000){ var k=p.st.slice(3), op=Math.max(.35,1-age/(24*3600000));
          L.marker([p.lat,p.lon],{icon:L.divIcon({className:'',html:'<span class="wlmk" style="opacity:'+op.toFixed(2)+'">'+(WL[k]||'🐾')+'</span>',iconSize:[0,0]}),zIndexOffset:700})
            .bindPopup('<b>'+(WL[k]||'🐾')+' '+esc(NAMES[k]||'Wildlife')+' seen</b><br><small>'+esc(p.by)+' · '+Math.max(1,Math.round(age/60000))+' min ago</small>'+(p.x?'<br>'+esc(p.x):''),{className:'pinpop',closeButton:false}).addTo(lay); return }
        if(p.img&&age<14*86400000) L.marker([p.lat,p.lon],{icon:L.divIcon({className:'',html:'<span class="phmk"><img alt="" src="'+RS+'/rlm/'+esc(p.img)+'t"></span>',iconSize:[0,0]}),zIndexOffset:600})
          .bindPopup('<img alt="" src="'+RS+'/rlm/'+esc(p.img)+'t" style="width:100%;border-radius:10px;display:block"><small>'+esc(p.by)+(p.x?' · '+esc(p.x):'')+'</small>',{className:'pinpop',closeButton:false,minWidth:200,maxWidth:200}).addTo(lay) }) }).catch(function(){ feedT=0 }) }
  setInterval(feed,60000); MAP.on('moveend',function(){ if(off()) setTimeout(feed,500) });
  document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('.seg button')) setTimeout(function(){ feedT=0; feed() },300) },true);

  // ================= campfire rules here (BC Wildfire Service bans and prohibitions) =================
  function fireRules(lat,lon){ var f="BBOX(SHAPE,"+(lon-.002).toFixed(4)+','+(lat-.002).toFixed(4)+','+(lon+.002).toFixed(4)+','+(lat+.002).toFixed(4)+",'EPSG:4326')";
    return fetch('https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP&outputFormat=json&count=20&propertyName=TYPE,CATEGORY,ACCESS_PROHIBITION_DESCRIPTION,BULLETIN_URL,FIRE_CENTRE_NAME&CQL_FILTER='+encodeURIComponent(f))
      .then(function(r){ if(!r.ok) throw new Error(r.status); return r.json() }).then(function(j){ return (j.features||[]).map(function(x){ return x.properties||{} }) }) }

  // ================= trip recap card (a picture you can share) =================
  function recap(){ if(!T||T.pts.length<2){ toast('Drive a little in Off-road first, then make your recap.'); return }
    var W=1080, H=1350, c=document.createElement('canvas'); c.width=W; c.height=H; var g=c.getContext('2d');
    var gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#1d2633'); gr.addColorStop(1,'#0b0d10'); g.fillStyle=gr; g.fillRect(0,0,W,H);
    var la=T.pts.map(function(p){ return p[0] }), lo=T.pts.map(function(p){ return p[1] }), s=Math.min.apply(null,la), n=Math.max.apply(null,la), w=Math.min.apply(null,lo), e=Math.max.apply(null,lo), kx=Math.cos((s+n)/2*Math.PI/180);
    var bw=Math.max((e-w)*kx,1e-4), bh=Math.max(n-s,1e-4), sc=Math.min(860/bw,640/bh), ox=(W-bw*sc)/2, oy=170+(700-bh*sc)/2;
    g.strokeStyle='rgba(255,255,255,.06)'; g.lineWidth=2; for(var i=0;i<8;i++){ g.beginPath(); g.moveTo(0,170+i*100); g.lineTo(W,170+i*100); g.stroke() }
    g.lineJoin='round'; g.lineCap='round'; g.strokeStyle='#ff3b30'; g.lineWidth=12; g.beginPath();
    T.pts.forEach(function(p,i){ var x=ox+(p[1]-w)*kx*sc, y=oy+(n-p[0])*sc; if(i) g.lineTo(x,y); else g.moveTo(x,y) }); g.stroke();
    var a=T.pts[0], b=T.pts[T.pts.length-1]; [[a,'#30d158'],[b,'#fff']].forEach(function(q){ g.fillStyle=q[1]; g.beginPath(); g.arc(ox+(q[0][1]-w)*kx*sc,oy+(n-q[0][0])*sc,18,0,7); g.fill() });
    g.fillStyle='#fff'; g.font='800 64px system-ui,sans-serif'; g.fillText('My trip',60,110); g.font='600 34px system-ui,sans-serif'; g.fillStyle='#9aa4b2'; g.fillText(new Date(T.t0).toLocaleDateString([], {weekday:'long',month:'long',day:'numeric'}),60,155);
    var hrs=(T.last-T.t0)/3600000, st=[[(T.km||0).toFixed(T.km<10?1:0)+' km','distance'],[Math.floor(hrs)+'h '+Math.round(hrs%1*60)+'m','time out'],[T.top?T.top.toLocaleString()+' m':'–','highest point']];
    st.forEach(function(x,i){ var X=60+i*330; g.fillStyle='#15191e'; g.beginPath(); g.roundRect?g.roundRect(X,920,300,170,28):g.rect(X,920,300,170); g.fill(); g.fillStyle='#fff'; g.font='800 54px system-ui,sans-serif'; g.fillText(x[0],X+28,1000); g.fillStyle='#9aa4b2'; g.font='600 30px system-ui,sans-serif'; g.fillText(x[1],X+28,1050) });
    var vis=Object.keys(V).filter(function(k){ return V[k]>=T.t0 }).length; g.fillStyle='#ffd54f'; g.font='700 36px system-ui,sans-serif'; g.fillText(vis?'🏅 '+vis+' summit'+(vis>1?'s, passes or lookouts':', pass or lookout')+' reached':'',60,1160);
    g.fillStyle='#fff'; g.font='800 40px system-ui,sans-serif'; g.fillText('AwareBC',60,1280); g.fillStyle='#ff453a'; g.font='700 30px system-ui,sans-serif'; g.fillText('by Josh Singer',250,1280);
    c.toBlob(function(bl){ if(!bl) return; var f=new File([bl],'awarebc-trip.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]})) navigator.share({files:[f],title:'My AwareBC trip',text:(T.km||0).toFixed(1)+' km on AwareBC'}).catch(function(){});
      else { var u=URL.createObjectURL(bl), o=sheet('<h3>📸 Your trip recap</h3><img alt="Trip recap" src="'+u+'" style="width:100%;border-radius:14px;margin-top:8px"><a class="omb p" href="'+u+'" download="awarebc-trip.png">Save picture</a>') } },'image/png') }

  // ================= weekend planner =================
  function nextWeekend(days){ var out=[]; days.forEach(function(d,i){ var w=new Date(d+'T12:00').getDay(); if((w===6||w===0)&&out.length<2) out.push(i) }); return out }
  function planner(box){ var m=me(), c=m||{lat:MAP.getCenter().lat,lon:MAP.getCenter().lng}; box.innerHTML='<div class="sub">Checking the forecast for spots near you…</div>';
    var saved=(window.__saved&&__saved.all?__saved.all().off||[]:[]).filter(function(s){ return s.l==='want' }).map(function(s){ return {n:s.n,lat:s.lat,lon:s.lon,w:'🚩 Want to go'} });
    var get=window.__osm&&__osm.inArea?__osm.inArea({s:c.lat-0.6,n:c.lat+0.6,w:c.lon-0.9,e:c.lon+0.9}).catch(function(){ return [] }):Promise.resolve([]);
    get.then(function(P){ var cand=saved.concat((P||[]).filter(function(p){ return p.k==='peaks'&&p.t&&p.t.name }).map(function(p){ return {n:p.t.name,lat:p.lat,lon:p.lon,w:p.t.tourism==='viewpoint'?'👀 Lookout':p.t.mountain_pass==='yes'?'⛰ Pass':'⛰ Summit'} }));
      var pick=[], seen={}; cand.sort(function(a,b){ return km(c.lat,c.lon,a.lat,a.lon)-km(c.lat,c.lon,b.lat,b.lon) });
      for(var i=0;i<cand.length&&pick.length<12;i++){ var k=cand[i].lat.toFixed(2)+','+cand[i].lon.toFixed(2); if(seen[k]) continue; seen[k]=1; pick.push(cand[i]) }
      if(!pick.length){ box.innerHTML='<div class="sub">No spots found nearby yet. Zoom the map to an area or save some 🚩 Want to go places.</div>'; return }
      return fetch('https://api.open-meteo.com/v1/forecast?latitude='+pick.map(function(p){ return p.lat.toFixed(3) }).join(',')+'&longitude='+pick.map(function(p){ return p.lon.toFixed(3) }).join(',')+'&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max,snowfall_sum,weather_code&timezone=America%2FVancouver&forecast_days=8')
        .then(function(r){ return r.json() }).then(function(j){ var L2=Array.isArray(j)?j:[j];
          var rows=pick.map(function(p,i){ var d=L2[i]&&L2[i].daily; if(!d) return null; var wk=nextWeekend(d.time); if(!wk.length) return null; var sc=0, t=0, pr=0, wn=0, sn=0;
            wk.forEach(function(x){ t+=d.temperature_2m_max[x]; pr+=d.precipitation_sum[x]; wn=Math.max(wn,d.wind_speed_10m_max[x]); sn+=d.snowfall_sum[x] }); t/=wk.length;
            sc=100-pr*8-Math.max(0,wn-20)*1.2-sn*6-Math.abs(t-18)*1.5; return {p:p,sc:sc,t:t,pr:pr,wn:wn,sn:sn,d:km(c.lat,c.lon,p.lat,p.lon)} }).filter(Boolean).sort(function(a,b){ return b.sc-a.sc }).slice(0,5);
          box.innerHTML=rows.length?rows.map(function(r,i){ var ic=r.sn>1?'🌨️':r.pr>4?'🌧️':r.pr>0.5?'🌦️':'☀️'; return '<button type="button" class="omr" data-g="'+i+'"><span class="omn">'+(i+1)+'</span><div><b>'+esc(r.p.n)+'</b><small>'+r.p.w+' · '+Math.round(r.d)+' km away</small></div><em>'+ic+' '+Math.round(r.t)+'°<small>'+(r.sn>1?Math.round(r.sn)+' cm snow':r.pr.toFixed(0)+' mm')+'</small></em></button>' }).join('')+'<div class="sub">Weekend forecast from Open-Meteo. Check roads and fire rules before you go.</div>':'<div class="sub">Forecast not available right now.</div>';
          [].forEach.call(box.querySelectorAll('[data-g]'),function(b){ b.onclick=function(){ var r=rows[+b.getAttribute('data-g')]; var o=box.closest('.osbg'); if(o) o.remove(); if(window.__goTo) window.__goTo(L.latLng(r.p.lat,r.p.lon),13,function(){ if(window.__pin) window.__pin(L.latLng(r.p.lat,r.p.lon),r.p.n) }) } }) }) })
      .catch(function(){ box.innerHTML='<div class="sub">Couldn’t get the forecast. Check your signal and try again.</div>' }) }

  // ================= the Trip tools sheet =================
  function open(){ var r=range(), hrs=T?(T.last-T.t0)/3600000:0, role=ls('aw-cvrole')||'', inCv=!!ls('aw-rlkey'), m=me();
    var pct=r==null?0:Math.max(3,Math.min(100,r/(F.tank/F.use*100)*100)), nWl=0; try{ nWl=(window.__omWlN&&window.__omWlN())||0 }catch(e){}
    function tl(k,ic,col,t,sub,pill){ return '<button type="button" class="omt" data-t="'+k+'" style="--c:'+col+'" aria-expanded="false"><span class="ic" aria-hidden="true">'+ic+'</span><b>'+t+'</b><small>'+sub+'</small><span class="pl">'+pill+'</span></button>' }
    var o=sheet('<div class="omhd"><span class="ombd" aria-hidden="true"><svg viewBox="0 0 24 24"><path class="f" d="M3 7h18v12H3z"/><path d="M3 7h18v12H3zM8 7V4h8v3M3 12h18"/></svg></span><span><b>Trip tools</b><small>Off-road · works from your own GPS</small></span><button type="button" class="omx" data-a="close" aria-label="Close">✕</button></div>'+
      '<button type="button" class="omfu" data-t="fuel"><span class="r"><span><b>'+(r==null?'Set your tank':'About '+Math.round(r)+' km')+'</b><small>'+(r==null?'to see your fuel range':'fuel range left')+'</small></span><em>⛽ '+(r==null?'Set up':'Tank')+'</em></span><span class="fb"><i style="width:'+pct.toFixed(0)+'%;background:linear-gradient(90deg,'+(r!=null&&r<60?'#ff453a,#ff6a5f':r!=null&&r<120?'#ffb340,#ffd60a':'#ffb340,#40e0c8')+')"></i></span><span class="fl"><span>Empty</span><span>'+(r==null?'Counts km from your GPS':Math.round(F.km||0)+' km since you filled up')+'</span><span>Full</span></span></button>'+
      '<div class="omgd">'+tl('fire','🔥','#ff453a','Campfires','BC Wildfire Service','<span class="omfp">'+(m?'Checking…':'Needs location')+'</span>')+tl('wl','🐻','#ffb340','Wildlife','Shows for 24 hours','+ Report one')+
        tl('plan','🗓️','#64d2ff','Weekend planner','Best spots by forecast','Find spots')+tl('recap','🏁','#bf8bff','Trip recap',(T?(T.km||0).toFixed(1):'0')+' km · '+(T?Math.floor(hrs)+' h '+Math.round(hrs%1*60)+' min':'–'),'Make card')+
        tl('exp','⛰️','#40e0c8','Explorer badge','Summits, passes, lookouts',Object.keys(V).length+' found')+(inCv?tl('cv','🚙','#c2c9d1','Convoy role','Lead & sweep alerts',role?role.charAt(0).toUpperCase()+role.slice(1):'Member'):'')+'</div>'+
      '<div class="omsec" data-s="fuel" hidden><div class="lab">⛽ Fuel range</div><div class="omc"><div class="omrow"><label>Tank (L)<input type="number" inputmode="decimal" min="10" max="400" data-f="tank" value="'+(F.tank||'')+'" placeholder="80"></label><label>Uses (L/100 km)<input type="number" inputmode="decimal" min="3" max="60" data-f="use" value="'+(F.use||'')+'" placeholder="14"></label></div>'+
        '<div class="omrow"><button type="button" class="omb" data-a="fsave">Save</button><button type="button" class="omb p" data-a="fill">⛽ Filled up</button></div></div></div>'+
      '<div class="omsec" data-s="recap" hidden><div class="lab">🏁 Trip recap</div><div class="omc"><div class="omstats"><div><b>'+(T?(T.km||0).toFixed(1):'0')+'</b><small>km</small></div><div><b>'+(T?Math.floor(hrs)+'h '+Math.round(hrs%1*60)+'m':'–')+'</b><small>out</small></div><div><b>'+(T&&T.top?T.top.toLocaleString()+' m':'–')+'</b><small>highest</small></div></div><button type="button" class="omb p wide" data-a="recap">Make my recap card</button></div></div>'+
      '<div class="omsec" data-s="fire" hidden><div class="lab">🔥 Campfires here</div><div class="omc omfire"><div class="sub">'+(m?'Checking BC Wildfire Service…':'Turn on your location to check.')+'</div></div></div>'+
      '<div class="omsec" data-s="wl" hidden><div class="lab">🐻 Report wildlife</div><div class="omc"><div class="omchips">'+Object.keys(WL).map(function(k){ return '<button type="button" data-w="'+k+'">'+WL[k]+' '+NAMES[k].replace(' wildlife','')+'</button>' }).join('')+'</div><div class="sub">Shows on the Off-road map for 24 hours, fading as it gets older.</div></div></div>'+
      '<div class="omsec" data-s="exp" hidden><div class="lab">⛰️ Explorer</div><div class="omc"><div class="omexp"><b>'+Object.keys(V).length+'</b><div><b>summits, passes & lookouts</b><small>Get within 150 m of one to count it. Bronze 3 · Silver 10 · Gold 25</small></div></div></div></div>'+
      (inCv?'<div class="omsec" data-s="cv" hidden><div class="lab">🚙 My convoy role</div><div class="omc"><div class="omchips">'+[['','Member'],['lead','Lead'],['sweep','Sweep']].map(function(x){ return '<button type="button" data-r="'+x[0]+'"'+(role===x[0]?' class="on"':'')+'>'+x[1]+'</button>' }).join('')+'</div><div class="sub">Lead and Sweep get a buzz when someone falls behind or stops for 10 minutes.</div></div></div>':'')+
      '<div class="omsec" data-s="plan" hidden><div class="lab">🗓️ Best spots this weekend</div><div class="omc omplan"><button type="button" class="omb p wide" data-a="plan">Find the best spots near me</button></div></div>');
    o.querySelector('.ossh').classList.add('omg');
    if(m) fireRules(m.lat,m.lon).then(function(L2){ var b=o.querySelector('.omfire'); if(!b) return; var fp=o.querySelector('.omfp'); if(fp){ fp.textContent=L2.length?'Restricted':'Allowed'; fp.parentNode.parentNode.style.setProperty('--c',L2.length?'#ff453a':'#32d74b') }
      b.innerHTML=L2.length?L2.slice(0,4).map(function(x){ return '<div class="omban"><b>🚫 '+esc(x.CATEGORY||x.TYPE||'Fire restriction')+'</b><small>'+esc(x.ACCESS_PROHIBITION_DESCRIPTION||x.TYPE||'')+(x.FIRE_CENTRE_NAME?' · '+esc(x.FIRE_CENTRE_NAME):'')+'</small>'+(/^https:\/\//.test(x.BULLETIN_URL||'')?'<a href="'+esc(x.BULLETIN_URL)+'" target="_blank" rel="noopener">Read the bulletin ›</a>':'')+'</div>' }).join(''):'<div class="omok">✅ No fire ban or restriction listed here right now.</div><div class="sub">From BC Wildfire Service. Rules change fast in summer: check again before you light one.</div>' },
      function(){ var fp=o.querySelector('.omfp'); if(fp) fp.textContent='Check again'; var b=o.querySelector('.omfire'); if(b) b.innerHTML='<div class="sub">Couldn’t check right now. See <a href="https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions" target="_blank" rel="noopener">BC fire bans and restrictions</a>.</div>' });
    o.onclick=function(e){ if(e.target===o){ o.remove(); return } var tb=e.target.closest&&e.target.closest('[data-t]');
      if(tb){ var k=tb.getAttribute('data-t'), sec=o.querySelector('.omsec[data-s="'+k+'"]'), was=sec&&!sec.hidden; [].forEach.call(o.querySelectorAll('.omsec'),function(x){ x.hidden=true }); [].forEach.call(o.querySelectorAll('[data-t]'),function(x){ x.classList.remove('on'); x.setAttribute('aria-expanded','false') });
        if(sec&&!was){ sec.hidden=false; tb.classList.add('on'); tb.setAttribute('aria-expanded','true'); o.querySelector('.omg').classList.add('open'); setTimeout(function(){ try{ sec.scrollIntoView({block:'nearest',behavior:'smooth'}) }catch(x){} },30); if(k==='plan'){ var pb=sec.querySelector('[data-a=plan]'); if(pb) planner(sec.querySelector('.omplan')) } } else o.querySelector('.omg').classList.remove('open'); return }
      var b=e.target.closest&&e.target.closest('[data-a],[data-w],[data-r]'); if(!b) return; if(b.getAttribute('data-a')==='close'){ o.remove(); return }
      if(b.hasAttribute('data-w')){ var w=b.getAttribute('data-w'), mm=me(); if(!mm) return toast('Turn on your location to report wildlife.'); b.disabled=true;
        rl({op:'post',kind:'c',st:'wl-'+w,lat:mm.lat,lon:mm.lon,x:NAMES[w]+' seen'}).then(function(){ toast('Thanks! '+WL[w]+' '+NAMES[w]+' added to the map.'); feedT=0; feed(); b.disabled=false },function(err){ b.disabled=false; toast(/fetch|network/i.test(err.message)?'No signal. Try again when you have service.':err.message) }); return }
      if(b.hasAttribute('data-r')){ ls('aw-cvrole',b.getAttribute('data-r')||null); [].forEach.call(o.querySelectorAll('[data-r]'),function(x){ x.classList.toggle('on',x===b) }); toast(b.textContent+' role set.'); return }
      var a=b.getAttribute('data-a');
      if(a==='fsave'||a==='fill'){ var t=+o.querySelector('[data-f=tank]').value, u=+o.querySelector('[data-f=use]').value; if(!(t>=10&&t<=400&&u>=3&&u<=60)) return toast('Enter your tank size (L) and fuel use (L/100 km).');
        F.tank=t; F.use=u; if(a==='fill'){ F.km=0; F.at=Date.now(); warned=0 } sj('aw-fuel',F); o.remove(); open(); toast(a==='fill'?'⛽ Tank full: about '+Math.round(t/u*100)+' km.':'Saved.'); return }
      if(a==='recap') return recap();
      if(a==='plan') return planner(o.querySelector('.omplan')) } }

  // the button: Off-road Tools ▸ Trip tools
  var btn=document.createElement('button'); btn.type='button'; btn.className='sidebtn ti'; btn.id='t_trip'; btn.setAttribute('data-l','Trip tools'); btn.setAttribute('aria-label','Trip tools: fuel, recap, campfires, wildlife, weekend planner');
  btn.innerHTML='<span style="font-size:19px;line-height:1" aria-hidden="true">🧭</span>'; document.body.appendChild(btn);
  btn.onclick=function(){ document.body.classList.remove('toolon'); open() };
  window.__trip={open:open,recap:recap};
  var st=document.createElement('style'); st.textContent='#t_trip{bottom:518px}body:not(.fsron) #t_trip{display:none!important}body.toolon.fsron .seg,body.toolon.fsron #srbtn,body.toolon.fsron #searchbtn{visibility:hidden}'+
    '.wlmk{display:inline-block;transform:translate(-50%,-50%);font-size:24px;filter:drop-shadow(0 1px 3px rgba(0,0,0,.8))}.phmk{display:block;width:38px;height:38px;transform:translate(-50%,-50%);border-radius:10px;overflow:hidden;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.6)}.phmk img{width:100%;height:100%;object-fit:cover;display:block}'+
    '.omsh .omc{background:#15191e;border-radius:14px;padding:10px 12px}.omsh .omrow{display:flex;gap:8px;margin-top:8px}.omsh .omrow label{flex:1;display:flex;flex-direction:column;gap:4px;font-size:11.5px;color:#9aa4b2}.omsh .omrow input{height:40px;border-radius:10px;border:1px solid #2b333d;background:#0f1317;color:#fff;padding:0 10px;font:15px var(--font,system-ui);min-width:0}'+
    '.omsh .omb{flex:1;display:block;text-align:center;height:42px;line-height:42px;border:0;border-radius:21px;background:#2c2c2e;color:#fff;font:700 14px var(--font,system-ui);text-decoration:none}.omsh .omb.p{background:#ff3b30}.omsh .omb.wide{width:100%;margin-top:8px}'+
    '.omsh .omfuel b{font-size:17px}.omsh .omfuel i{display:block;height:10px;border-radius:5px;background:#2c2c2e;margin:6px 0 4px;overflow:hidden}.omsh .omfuel i span{display:block;height:100%}.omsh .omfuel small,.omsh .omexp small{color:#9aa4b2;font-size:12px}'+
    '.omsh .omstats{display:flex;gap:6px}.omsh .omstats div{flex:1;background:#0f1317;border-radius:10px;padding:7px 9px}.omsh .omstats b{display:block;font:800 16px var(--font,system-ui)}.omsh .omstats small{color:#9aa4b2;font-size:11px}'+
    '.omsh .omchips{display:flex;gap:6px;flex-wrap:wrap}.omsh .omchips button{border:0;background:#2c2c2e;color:#fff;border-radius:16px;padding:8px 11px;font:700 13px var(--font,system-ui)}.omsh .omchips button.on{background:#ff3b30}.omsh .omchips+.sub{margin-top:7px}'+
    '.omsh .omexp{display:flex;align-items:center;gap:12px}.omsh .omexp>b{font:900 30px var(--font,system-ui);color:#ffd54f}.omsh .omexp div b{display:block;font-size:14px}'+
    '.omsh .omban{border-left:3px solid #ff3b30;padding:2px 0 2px 10px;margin:4px 0}.omsh .omban b{display:block;font-size:13.5px}.omsh .omban small{display:block;color:#cbd5e1;font-size:12px}.omsh .omban a,.omsh .omfire a{color:#8ab4f8;font:700 12.5px var(--font,system-ui)}.omsh .omok{font:700 14px var(--font,system-ui);color:#86efac;margin-bottom:3px}'+
    '.omsh .omr{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:0;background:#0f1317;color:#fff;border-radius:12px;padding:9px 10px;margin-bottom:6px;font-family:var(--font,system-ui)}.omsh .omr .omn{width:24px;height:24px;border-radius:50%;background:#ff3b30;display:grid;place-items:center;font:800 12px var(--font,system-ui);flex:none}.omsh .omr div{flex:1;min-width:0}.omsh .omr b{display:block;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.omsh .omr small{color:#9aa4b2;font-size:11.5px}.omsh .omr em{font:800 15px var(--font,system-ui);font-style:normal;text-align:right}.omsh .omr em small{display:block;font-weight:600}';
  document.head.appendChild(st);
})();
