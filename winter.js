// AwareBC by Josh Singer: winter mountains (avalanche forecast, passes, ski hills).
// Loaded a moment after the map opens, so the map itself shows up faster.
window.__awm&&window.__awm('winter',function(X){with(X){
(function(){
    var PASS=[['Eholt Summit','3',49.1452,-118.5346,1000,247],['Paulson Summit','3',49.2416,-118.053,1529,174],['Anarchist Summit','3',49.0051,-119.3147,1139,64],['Strawberry Pass','3B',49.1763,-117.8611,1539,1159],['Kootenay Pass','3',49.0587,-117.0408,1781,5],['McCulloch','33',49.7577,-119.1261,1200,249]];
    var HILL=[['Phoenix Mountain',49.098,-118.594,1500],['Red Mountain',49.104,-117.846,1700],['Big White',49.7317,-118.9431,1850],['Baldy Mountain',49.149,-119.23,1750]];
    var btn=document.getElementById('mtbtn'), sh=document.getElementById('mtnsheet'), body=document.getElementById('mtnbody'), ttl=document.getElementById('mtntitle');
    var on=false, layer=L.layerGroup().addTo(map), wx=null, wxAt=0, av=null, avAt=0;
    function season(){ var m=new Date().getMonth(); return m>=10||m<=3 }
    function active(){ return cfg2.mt==='on'||(cfg2.mt==='auto'&&season()) }
    function show(){ if(btn) btn.classList.toggle('off',!active()); if(!active()&&on) setOn(false) }
    function tU(c){ if(typeof c!=='number') return '—'; return (typeof tcfg!=='undefined'&&tcfg==='F')?Math.round(c*9/5+32)+'°F':Math.round(c)+'°C' }
    function cm(v){ return v<0.5?'0 cm':Math.round(v)+' cm' }
    function txt(h){ var d=document.createElement('div'); d.innerHTML=String(h||''); return (d.textContent||'').replace(/\s+/g,' ').trim() }
    var AVC={low:'#52ba4a',moderate:'#e6c700',considerable:'#f79218',high:'#ef1c29',extreme:'#111'};
    function getWx(){ if(wx&&Date.now()-wxAt<20*60000) return Promise.resolve(wx); var all=PASS.map(function(p){return [p[2],p[3],p[4]]}).concat(HILL.map(function(h){return [h[1],h[2],h[3]]}));
      var u='https://api.open-meteo.com/v1/forecast?latitude='+all.map(function(a){return a[0]}).join(',')+'&longitude='+all.map(function(a){return a[1]}).join(',')+'&elevation='+all.map(function(a){return a[2]}).join(',')+
        '&current=temperature_2m,wind_speed_10m&hourly=snowfall,snow_depth&past_days=1&forecast_days=3&timezone=auto';
      return fetch(u).then(function(r){return r.ok?r.json():null}).then(function(j){ if(!j) return wx; var arr=Array.isArray(j)?j:[j], now=Date.now();
        wx=arr.map(function(x){ var h=x.hourly||{}, past=0, next=0, dep=null;
          (h.time||[]).forEach(function(s,i){ var ms=Date.parse(s+'Z')-(x.utc_offset_seconds||0)*1000, sf=+h.snowfall[i]||0; if(ms<=now&&ms>now-86400000) past+=sf; if(ms>now&&ms<=now+172800000) next+=sf; if(ms<=now&&h.snow_depth&&h.snow_depth[i]!=null) dep=h.snow_depth[i] });
          return {t:x.current&&x.current.temperature_2m,w:x.current&&x.current.wind_speed_10m,past:past,next:next,dep:dep} }); wxAt=Date.now(); return wx }).catch(function(){ return wx }) }
    function getAv(){ if(av&&Date.now()-avAt<60*60000) return Promise.resolve(av);
      return fetch('https://api.avalanche.ca/forecasts/en/products/point?lat='+me.lat.toFixed(3)+'&long='+me.lon.toFixed(3)).then(function(r){return r.ok?r.json():null}).then(function(j){ if(j){ av=j; avAt=Date.now() } return av }).catch(function(){ return av }) }
    function avHtml(j){ if(!j||!j.report) return '<div class="ssec"><h4>Avalanche danger</h4>No forecast for your area right now.</div>'; var r=j.report, d=(r.dangerRatings||[])[0], h='<div class="ssec"><h4>Avalanche danger</h4>';
      if(d&&d.ratings){ ['alp','tln','btl'].forEach(function(k){ var x=d.ratings[k]; if(!x) return; var v=(x.rating&&x.rating.value)||'', c=AVC[v]||'#757575';
        h+='<div class="row2"><span>'+esc(x.display||k)+'</span><span class="firepill" style="background:'+c+';color:'+(v==='moderate'?'#111':'#fff')+'">'+esc((x.rating&&x.rating.display)||'—')+'</span></div>' }) }
      var hl=txt(r.highlights); if(hl) h+='<div style="margin-top:4px">'+esc(hl.length>120?hl.slice(0,117)+'…':hl)+'</div>';
      var url=/^https:\/\/(www\.)?avalanche\.ca\/[^\s"<>]{0,200}$/.test(j.url||'')?j.url:'https://avalanche.ca/map';
      h+='<div class="row2" style="margin-top:4px"><span>'+(r.dateIssued?'Issued '+esc(new Date(r.dateIssued).toLocaleDateString([], {month:'short',day:'numeric'})):'')+'</span><a href="'+esc(url)+'" target="_blank" rel="noopener" style="color:var(--accent)">Full forecast ›</a></div></div>'; return h }
    function rowP(p,i){ var w=(wx||[])[i]||{}; return '<div class="brow" data-k="p'+i+'"><span>🏔 '+esc(p[0])+' <small style="color:var(--dim)">Hwy '+esc(p[1])+'</small></span><span>'+tU(w.t)+(w.next>=1?' · ❄ '+cm(w.next)+' coming':'')+'</span></div>' }
    function rowH(hl,i){ var w=(wx||[])[PASS.length+i]||{}; return '<div class="brow" data-k="h'+i+'"><span>⛷ '+esc(hl[0])+'</span><span>'+(w.past>=1?'❄ '+cm(w.past)+' new · ':'')+(w.dep>=0.01?Math.round(w.dep*100)+' cm base':tU(w.t))+'</span></div>' }
    function bind(){ [].forEach.call(body.querySelectorAll('.brow'),function(r){ r.onclick=function(){ var k=r.getAttribute('data-k'); if(k[0]==='p') detailP(+k.slice(1)); else detailH(+k.slice(1)) } }); var bk=document.getElementById('mtback'); if(bk) bk.onclick=overview }
    function overview(){ ttl.textContent='Winter mountains'; sh.hidden=false; body.innerHTML='<div class="ssec">Loading mountain conditions…</div>';
      Promise.all([getAv(),getWx()]).then(function(){ var h=avHtml(av);
        h+='<div class="ssec"><h4>Mountain passes</h4>'+PASS.map(rowP).join('')+'</div>';
        h+='<div class="ssec"><h4>Ski hills</h4>'+HILL.map(rowH).join('')+'</div>';
        h+='<div class="skynote">© Avalanche Canada · Open-Meteo (model) · DriveBC</div>'; body.innerHTML=h; bind() }) }
    function detailP(i){ var p=PASS[i], w=(wx||[])[i]||{}; ttl.textContent=p[0]; var src='https://www.drivebc.ca/images/'+p[5]+'.jpg?t='+Math.floor(Date.now()/60000);
      body.innerHTML='<img src="'+esc(src)+'" alt="Camera at '+esc(p[0])+'" style="width:100%;aspect-ratio:800/468;object-fit:contain;border-radius:10px;background:#000;display:block" referrerpolicy="no-referrer">'+
        '<div id="mtts" style="position:relative;width:100%;aspect-ratio:205/18;overflow:hidden;background:#000;border-radius:8px;margin-top:6px"><img src="'+esc(src)+'" alt="" style="position:absolute;right:0;bottom:0;width:390.24%;max-width:none;height:auto" referrerpolicy="no-referrer"></div>'+
        '<div class="ssec" style="margin-top:6px"><b>Hwy '+esc(p[1])+' · '+Math.round(p[4]*3.28084).toLocaleString()+' ft</b><br>Now '+tU(w.t)+(typeof w.w==='number'?' · wind '+Math.round(w.w)+' km/h':'')+'<br>Snow last 24 h: '+cm(w.past||0)+' · next 48 h: '+cm(w.next||0)+'</div>'+
        '<button class="ltbtn2" id="mtback">‹ All mountains</button><div class="skynote">Weather is a model estimate for the summit. Check DriveBC before you go.</div>'; bind() }
    function detailH(i){ var hl=HILL[i], w=(wx||[])[PASS.length+i]||{}; ttl.textContent=hl[0];
      body.innerHTML='<div class="ssec"><h4>Snow (model estimate)</h4><div class="row2"><span>New snow, last 24 h</span><b>'+cm(w.past||0)+'</b></div><div class="row2"><span>Coming, next 48 h</span><b>'+cm(w.next||0)+'</b></div><div class="row2"><span>Snow on the ground</span><b>'+(w.dep!=null?Math.round(w.dep*100)+' cm':'—')+'</b></div><div class="row2"><span>Temperature now</span><b>'+tU(w.t)+'</b></div></div>'+
        '<a class="ltbtn2" href="https://www.google.com/search?q='+encodeURIComponent(hl[0]+' BC snow report')+'" target="_blank" rel="noopener">Official snow report ›</a>'+
        '<button class="ltbtn2" id="mtback">‹ All mountains</button><div class="skynote">Numbers come from a weather model for the upper mountain and can differ from the hill’s own report.</div>'; bind() }
    function pins(){ layer.clearLayers(); if(!on||cfg2.mtPins!=='1') return;
      PASS.forEach(function(p,i){ L.marker([p[2],p[3]],{icon:L.divIcon({className:'',html:'<span class="firemk" role="button" aria-label="'+esc(p[0])+'" style="--c:#546e7a;--sz:24px">🏔</span>',iconSize:[0,0]}),keyboard:false,bubblingMouseEvents:false,zIndexOffset:-240,title:p[0]}).on('click',function(){ sh.hidden=false; getWx().then(function(){ detailP(i) }) }).addTo(layer) });
      HILL.forEach(function(hl,i){ L.marker([hl[1],hl[2]],{icon:L.divIcon({className:'',html:'<span class="firemk" role="button" aria-label="'+esc(hl[0])+'" style="--c:#1e88e5;--sz:24px">⛷</span>',iconSize:[0,0]}),keyboard:false,bubblingMouseEvents:false,zIndexOffset:-240,title:hl[0]}).on('click',function(){ sh.hidden=false; getWx().then(function(){ detailH(i) }) }).addTo(layer) }) }
    function setOn(v){ on=v; if(btn){ btn.classList.toggle('on',v); btn.setAttribute('aria-pressed',v?'true':'false') } pins() }
    if(btn) btn.onclick=function(){ if(on){ setOn(false); return } setOn(true); overview() };
    document.getElementById('mtnx').onclick=function(){ sh.hidden=true };
    sh.onclick=function(e){ if(e.target===sh) sh.hidden=true };
    window.__mtn={update:function(){ show(); pins() }};
    show();
  })();
}});
