/* Data sources check (by Josh Singer): tests every live feed AwareBC uses, from this phone, and says which are up, slow or down.
   Settings > App updates > Check data sources. Each feed already keeps its last good data on the phone, so a feed being down shows old data, not a blank map. */
(function(){
  var RS='https://awarebc.aware-bc.workers.dev/';
  function F(){ var c=(window.__AW&&window.__AW.me&&window.__AW.me())||{}, la=+(c.lat||50.67), lo=+(c.lon||-120.33), b=(lo-.5).toFixed(2)+','+(la-.5).toFixed(2)+','+(lo+.5).toFixed(2)+','+(la+.5).toFixed(2);
    return [
      ['✈️','Live planes',RS+'?u='+encodeURIComponent('https://api.adsb.lol/v2/point/'+la.toFixed(1)+'/'+lo.toFixed(1)+'/50'),1],
      ['🚧','DriveBC roads','https://api.open511.gov.bc.ca/events?format=json&status=ACTIVE&limit=1&bbox='+b],
      ['🔥','BC wildfires','https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0/query?where=1%3D1&returnCountOnly=true&f=json'],
      ['🚨','Evacuations','https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/Evacuation_Orders_and_Alerts/FeatureServer/0/query?where=1%3D1&returnCountOnly=true&f=json'],
      ['⛈️','Weather','https://api.open-meteo.com/v1/forecast?latitude='+la.toFixed(2)+'&longitude='+lo.toFixed(2)+'&current=temperature_2m'],
      ['⚠️','Weather alerts','https://api.weather.gc.ca/collections/weather-alerts/items?f=json&lang=en&limit=1&bbox='+b],
      ['🌫️','Air quality','https://api.weather.gc.ca/collections/aqhi-observations-realtime/items?f=json&latest=true&limit=1&bbox='+b],
      ['🌧️','Rain radar','https://api.rainviewer.com/public/weather-maps.json'],
      ['🏔️','Avalanche','https://api.avalanche.ca/forecasts/en/products/point?lat='+la.toFixed(2)+'&long='+lo.toFixed(2)],
      ['⛴️','BC Ferries','https://www.bcferriesapi.ca/v2/capacity/'],
      ['🌌','Space weather','https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json'],
      ['🌲','Trails & FSRs','https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_FOREST_TENURE.FTEN_REC_SITE_POINTS_SVW&outputFormat=json&count=1'],
      ['🔍','Place search','https://photon.komoot.io/api/?q=Kamloops&limit=1'],
      ['🛣️','Directions','https://router.project-osrm.org/route/v1/driving/'+lo.toFixed(3)+','+la.toFixed(3)+';'+(lo+.05).toFixed(3)+','+(la+.05).toFixed(3)+'?overview=false'],
      ['👥','AwareBC server',RS+'where']] }
  function one(f){ var t0=performance.now(), ctl=window.AbortController?new AbortController():null, to=setTimeout(function(){ if(ctl) ctl.abort() },9000);
    function go(u){ return fetch(u,{cache:'no-store',signal:ctl&&ctl.signal}).then(function(r){ return {ok:r.ok,st:r.status} }) }
    return go(f[2]).catch(function(e){ if(f[3]||(e&&e.name==='AbortError')) throw e; return go(RS+'?u='+encodeURIComponent(f[2])) /* some feeds only answer through the AwareBC relay */ })
      .then(function(r){ clearTimeout(to); var ms=Math.round(performance.now()-t0); return {f:f,ok:r.ok,ms:ms,why:r.ok?'':('answered '+r.st)} })
      .catch(function(e){ clearTimeout(to); return {f:f,ok:false,ms:Math.round(performance.now()-t0),why:e&&e.name==='AbortError'?'no answer in 9 s':'can’t reach it'} }) }
  function open(){ var old=document.getElementById('awfeeds'); if(old) old.remove();
    var d=document.createElement('div'); d.id='awfeeds'; d.setAttribute('role','dialog'); d.setAttribute('aria-label','Data sources');
    d.style.cssText='position:fixed;inset:0;z-index:6600;background:radial-gradient(120% 60% at 90% -10%,rgba(100,210,255,.18),transparent 60%),#0d1116;color:#fff;display:flex;flex-direction:column;padding:14px 14px calc(14px + env(safe-area-inset-bottom));font:14px/1.3 system-ui,sans-serif';
    d.innerHTML='<div style="display:flex;align-items:center;gap:10px"><b style="font-size:20px;flex:1">Data sources<small class="sum" style="display:block;font-size:12.5px;font-weight:400;color:#a9b4bf">Checking from this phone…</small></b><button type="button" aria-label="Close" style="width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;font-size:18px">✕</button></div>'+
      '<div class="fl" style="flex:1;overflow:auto;margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:6px;align-content:start"></div>'+
      '<p style="margin:8px 2px 0;font-size:12.5px;color:#a9b4bf">If a source is down, AwareBC keeps showing its last saved data until it’s back.</p>'+
      '<button type="button" class="again" style="margin-top:8px;height:48px;border-radius:14px;border:0;background:linear-gradient(180deg,#8fe0ff,#3bb4ea);color:#06202c;font-size:16px;font-weight:700">Check again</button>';
    document.body.appendChild(d); d.querySelector('[aria-label=Close]').onclick=function(){ d.remove() };
    var list=d.querySelector('.fl'), sum=d.querySelector('.sum');
    function run(){ var L=F(); list.innerHTML=L.map(function(f,i){ return '<div data-i="'+i+'" style="display:flex;align-items:center;gap:7px;min-width:0;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.075);border-radius:12px;padding:7px 8px"><span style="font-size:16px;width:20px;text-align:center">'+f[0]+'</span><span style="flex:1;min-width:0"><b style="display:block;font-size:12.5px;line-height:1.2">'+f[1]+'</b><small style="color:#a9b4bf;font-size:11.5px">Checking…</small></span><i style="width:12px;height:12px;border-radius:50%;background:#555"></i></div>' }).join('');
      sum.textContent='Checking from this phone…'; var up=0, done=0, down=[];
      L.forEach(function(f,i){ one(f).then(function(r){ var row=list.querySelector('[data-i="'+i+'"]'), slow=r.ok&&r.ms>4000, c=r.ok?(slow?'#ffb340':'#32d74b'):'#ff453a';
        row.querySelector('small').textContent=r.ok?(slow?'Slow '+(r.ms/1000).toFixed(1)+' s':'OK '+(r.ms<1000?r.ms+' ms':(r.ms/1000).toFixed(1)+' s')):'Down';
        row.querySelector('small').style.color=r.ok?(slow?'#ffb340':'#a9b4bf'):'#ff6b61'; row.querySelector('i').style.cssText='flex:none;width:10px;height:10px;border-radius:50%;background:'+c+';box-shadow:0 0 8px '+c;
        if(r.ok) up++; else down.push(f[1]+' ('+r.why+')'); if(++done===L.length){ sum.textContent=up===L.length?'✓ All '+L.length+' sources working':(L.length-up)+' of '+L.length+' sources down right now';
          if(down.length&&window.__crash) window.__crash.add('Data source down',down.join(', ')) /* so the owner sees it in crash reports too */ } }) }) }
    d.querySelector('.again').onclick=run; run() }
  window.__feeds={open:open};
  function mount(){ var up=document.getElementById('updfolder'); if(!up){ setTimeout(mount,600); return } if(document.getElementById('fdchk')) return;
    var b=document.createElement('button'); b.type='button'; b.className='setbtn'; b.id='fdchk'; b.textContent='Check data sources'; b.onclick=open; up.appendChild(b) }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
})();
