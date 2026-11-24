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
    function txt(h){ var d; try{ d=new DOMParser().parseFromString(String(h||''),'text/html').body }catch(e){ return String(h||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim() } return ((d&&d.textContent)||'').replace(/\s+/g,' ').trim() } // read-only copy: pictures or code in the text never run
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
    // avalanche card (glow theme): danger by elevation in the official colours, the main problem in plain words, mountain weather
    var AVK={low:'#32d74b',moderate:'#ffd60a',considerable:'#ff8c1a',high:'#ff453a',extreme:'#e8e8e8'}, AVN={low:1,moderate:2,considerable:3,high:4,extreme:5};
    var MIC='<svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M2 20 9 7l4 7 2-3 7 9z"/><path d="M2 20 9 7l4 7 2-3 7 9z"/><path d="M7.5 10l1.5 1.5 1.5-1.5"/></svg>';
    var mw=null, mwAt=0, mtab='av';
    function getMw(){ if(mw&&Date.now()-mwAt<30*60000) return Promise.resolve(mw); if(navigator.onLine===false) return Promise.resolve(mw);
      return fetch('https://api.open-meteo.com/v1/forecast?latitude='+me.lat.toFixed(3)+'&longitude='+me.lon.toFixed(3)+'&hourly=snowfall,freezing_level_height,wind_speed_80m,wind_direction_80m&past_days=1&forecast_days=1&timezone=auto').then(function(r){ return r.ok?r.json():null }).then(function(j){ if(!j||!j.hourly) return mw; var h=j.hourly, now=Date.now(), off=(j.utc_offset_seconds||0)*1000, sn=0, k=-1;
        (h.time||[]).forEach(function(t,i){ var ms=Date.parse(t+'Z')-off; if(ms<=now&&ms>now-86400000) sn+=+h.snowfall[i]||0; if(ms<=now) k=i });
        mw={sn:sn,fz:k>=0?h.freezing_level_height[k]:null,w:k>=0?h.wind_speed_80m[k]:null,d:k>=0?h.wind_direction_80m[k]:null}; mwAt=Date.now(); return mw }).catch(function(){ return mw }) }
    var CMP8=['N','NE','E','SE','S','SW','W','NW'];
    function avHtml(j){ var head='<div class="awav">', r=j&&j.report;
      if(!r) return head+'<div class="awavh"><span class="awavb">'+MIC+'</span><div><b>Avalanche forecast</b><small>No forecast for your area right now</small></div></div></div>';
      var d=(r.dangerRatings||[])[0], top='low';
      var url=/^https:\/\/(www\.)?avalanche\.ca\/[^\s"<>]{0,200}$/.test(j.url||'')?j.url:'https://avalanche.ca/map', area=(j.area&&j.area.name)||r.title||'Your area';
      var h='<div class="awavh"><span class="awavb">'+MIC+'</span><div><b>'+esc(area)+'</b><small>'+esc([d&&d.date&&d.date.display?d.date.display:'Today','Avalanche Canada',r.dateIssued?'issued '+new Date(r.dateIssued).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}):''].filter(Boolean).join(' · '))+'</small></div></div>';
      if(d&&d.ratings){ h+='<div class="awavr">'; ['alp','tln','btl'].forEach(function(k){ var x=d.ratings[k]; if(!x) return; var v=String((x.rating&&x.rating.value)||'').toLowerCase(), c=AVK[v]||'#8a93a0'; if((AVN[v]||0)>(AVN[top]||0)) top=v;
        h+='<div style="--ac:'+c+'"><i></i><b>'+esc(x.display||k)+'</b><span>'+(AVN[v]?AVN[v]+' · ':'')+esc((x.rating&&x.rating.display)||'No rating')+'</span></div>' }); h+='</div>' }
      var pr=(r.problems||[])[0]; if(pr){ var ty=(pr.type&&pr.type.display)||'', asp=(pr.data&&pr.data.aspects||[]).map(function(a){ return a.display||a.value||'' }).filter(Boolean), cm2=txt(pr.comment);
        h+='<div class="awavp"><small>Main problem</small><b>'+esc(ty+(asp.length&&asp.length<8?' on '+asp.join(', ')+' slopes':''))+'</b>'+(cm2?'<div>'+esc(cm2.length>150?cm2.slice(0,147)+'…':cm2)+'</div>':'')+'</div>' }
      else { var hl=txt(r.highlights); if(hl) h+='<div class="awavp"><small>Today</small><div>'+esc(hl.length>150?hl.slice(0,147)+'…':hl)+'</div></div>' }
      h+='<div class="awavs"><div><small>New snow 24 h</small><b id="awmsn">…</b></div><div><small>Ridge wind</small><b id="awmw">…</b></div><div><small>Freezing level</small><b id="awmfz">…</b></div></div>';
      h+='<div class="awavbt"><button type="button" class="p" data-a="slope">Show slope angles</button><a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Full forecast ›</a></div>';
      sh.style.setProperty('--avc',AVK[top]||'#40e0c8'); return head+h+'</div>' }
    function paintMw(){ getMw().then(function(w){ var a=document.getElementById('awmsn'), b2=document.getElementById('awmw'), c=document.getElementById('awmfz'); if(!a) return;
      a.textContent=w?cm(w.sn):'—'; b2.textContent=w&&w.w!=null?Math.round(w.w)+' km/h '+CMP8[Math.round(((w.d||0)%360)/45)%8]:'—'; c.textContent=w&&w.fz!=null?(w.fz<=0?'Valley floor':Math.round(w.fz/100)*100+' m'):'—' }) }
    (function(){ var st=document.createElement('style'); st.textContent=
      '#mtnsheet .sheet{background:radial-gradient(80% 30% at 20% 0%,color-mix(in srgb,var(--avc,#40e0c8) 18%,transparent),transparent 70%),#0b0e12!important;color:#eef1f5;border-top:1px solid rgba(255,255,255,.08)}#mtnsheet .sheet-head .close{background:rgba(255,255,255,.08);color:#eef1f5}#mtnsheet .sheet-head b{font:800 19px var(--font)}'+
      '.awav{margin-bottom:10px}.awavh{display:flex;align-items:center;gap:10px}.awavh b{display:block;font:800 16px/1.2 var(--font)}.awavh small{display:block;font:500 11px var(--font);color:#9aa3ad;margin-top:1px}'+
      '.awavb{width:40px;height:40px;border-radius:13px;flex:none;display:grid;place-items:center;background:linear-gradient(145deg,#40e0c8,#1a9a88);box-shadow:0 4px 14px rgba(64,224,200,.4),inset 0 1px 0 rgba(255,255,255,.45)}.awavb svg{width:22px;height:22px;fill:none;stroke:#06131a;stroke-width:1.9;stroke-linejoin:round;stroke-linecap:round}.awavb svg .f{fill:#06131a;fill-opacity:.25;stroke:none}'+
      '.awavr{margin-top:10px;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.08)}.awavr>div{display:flex;align-items:center;gap:10px;padding:10px 12px;background:linear-gradient(90deg,color-mix(in srgb,var(--ac) 18%,transparent),rgba(255,255,255,.02) 70%);border-top:1px solid rgba(255,255,255,.06)}.awavr>div:first-child{border-top:0}'+
      '.awavr i{width:12px;height:28px;border-radius:4px;background:var(--ac);box-shadow:0 0 10px var(--ac);flex:none}.awavr b{font:700 13.5px var(--font)}.awavr span{margin-left:auto;font:800 13.5px var(--font);color:var(--ac)}'+
      '.awavp{margin-top:8px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}.awavp small{display:block;font:600 10.5px var(--font);color:#9aa3ad}.awavp b{display:block;font:700 14px var(--font);margin-top:2px}.awavp div{font:500 12px/1.4 var(--font);color:#c7ccd3;margin-top:3px}'+
      '.awavs{display:flex;gap:7px;margin-top:8px}.awavs>div{flex:1;min-width:0;border-radius:13px;padding:8px 10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}.awavs small{display:block;font:600 10.5px var(--font);color:#9aa3ad}.awavs b{display:block;font:800 14.5px var(--font);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
      '.awavbt{display:flex;gap:8px;margin-top:10px}.awavbt>*{flex:1;height:46px;border-radius:14px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.06);color:#eef1f5;font:700 13px var(--font);display:grid;place-items:center;text-decoration:none}.awavbt .p{border:0;background:linear-gradient(180deg,#5ff0d8,#1a9a88);color:#06131a;font-weight:800;box-shadow:0 6px 18px rgba(64,224,200,.35)}'+
      '.awmt{display:flex;gap:3px;padding:3px;border-radius:13px;background:rgba(255,255,255,.06);margin-bottom:10px}.awmt button{flex:1;border:0;padding:8px 0;border-radius:10px;background:none;color:#9aa3ad;font:700 12.5px var(--font)}.awmt button.on{background:rgba(255,255,255,.14);color:#fff}'+
      '#mtnbody .ssec{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:8px 12px;margin-top:8px}#mtnbody .ssec h4{font:700 12.5px var(--font);color:#9aa3ad;text-transform:none;letter-spacing:0;margin:2px 0 4px}#mtnbody .brow{border-top:1px solid rgba(255,255,255,.06);padding:8px 0;color:#eef1f5}#mtnbody .brow:first-of-type{border-top:0}#mtnbody .skynote{color:#7d8692}';
      document.head.appendChild(st) })();
    body.addEventListener('click',function(e){ var t=e.target.closest&&e.target.closest('[data-a=slope]'); if(!t) return; var sl=document.getElementById('aw_terr'); if(!sl){ return }
      var fb=document.querySelector('.seg button[data-b=fsr]'); if(fb&&!document.body.classList.contains('fsron')) fb.click(); setTimeout(function(){ var s2=document.getElementById('aw_terr'); if(s2){ s2.value='2'; s2.dispatchEvent(new Event('change')) } var fp=document.querySelector('.lyrp:not([hidden])'); if(fp){ var x=fp.querySelector('.fpx:not(.fpkey)'); if(x) x.click() } },250); sh.hidden=true });
    function rowP(p,i){ var w=(wx||[])[i]||{}; return '<div class="brow" data-k="p'+i+'"><span>🏔 '+esc(p[0])+' <small style="color:var(--dim)">Hwy '+esc(p[1])+'</small></span><span>'+tU(w.t)+(w.next>=1?' · ❄ '+cm(w.next)+' coming':'')+'</span></div>' }
    function rowH(hl,i){ var w=(wx||[])[PASS.length+i]||{}; return '<div class="brow" data-k="h'+i+'"><span>⛷ '+esc(hl[0])+'</span><span>'+(w.past>=1?'❄ '+cm(w.past)+' new · ':'')+(w.dep>=0.01?Math.round(w.dep*100)+' cm base':tU(w.t))+'</span></div>' }
    function bind(){ [].forEach.call(body.querySelectorAll('.brow'),function(r){ r.onclick=function(){ var k=r.getAttribute('data-k'); if(k[0]==='p') detailP(+k.slice(1)); else detailH(+k.slice(1)) } }); var bk=document.getElementById('mtback'); if(bk) bk.onclick=overview }
    function overview(){ ttl.textContent='Winter mountains'; sh.hidden=false; body.innerHTML='<div class="ssec">Loading mountain conditions…</div>';
      Promise.all([getAv(),getWx()]).then(function(){ var T=[['av','Avalanche'],['ps','Passes'],['sk','Ski hills']], h='<div class="awmt" role="tablist">'+T.map(function(t){ return '<button type="button" role="tab" data-t="'+t[0]+'"'+(mtab===t[0]?' class="on" aria-selected="true"':'')+'>'+t[1]+'</button>' }).join('')+'</div>';
        if(mtab==='av') h+=avHtml(av); if(mtab==='ps') h+='<div class="ssec">'+PASS.map(rowP).join('')+'</div>'; if(mtab==='sk') h+='<div class="ssec">'+HILL.map(rowH).join('')+'</div>';
        h+='<div class="skynote">© Avalanche Canada · Open-Meteo (model) · DriveBC</div>'; body.innerHTML=h; bind(); if(mtab==='av') paintMw();
        [].forEach.call(body.querySelectorAll('.awmt button'),function(b){ b.onclick=function(){ mtab=b.getAttribute('data-t'); overview() } }) }) }
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
