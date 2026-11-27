/* Data freshness (by Josh Singer): remembers when each map layer last got new data, so Layers can show "4 min ago".
   It watches the app's own data requests; nothing is sent anywhere. */
(function(){
  var K='aw-fresh', T={}; try{ T=JSON.parse(localStorage.getItem(K)||'{}')||{} }catch(e){ T={} }
  var P=[ // [layer key(s), what the request looks like]
    [['road'],/open511\.gov\.bc\.ca|drivebc\.ca/i],
    [['ferry'],/bcferries/i],
    [['apt'],/aviationweather\.gov/i],
    [['fsr','back','motor','close','camp','trail'],/openmaps\.gov\.bc\.ca\/geo\/pub\/wfs|overpass-api\.de/i],
    [['rep'],/workers\.dev\/list\b/i],
    [['fire'],/BCWS_ActiveFires|BCWS_FirePerimeters|WFIGS|firms/i],
    [['lt'],/layers?=[^&]*Lightning/i],
    [['rain'],/rainviewer|layers?=[^&]*RADAR|mesonet\.agron/i],
    [['mt'],/avalanche\.ca/i],
    [['plane'],/adsb\.lol|flyitalyadsb|airplanes\.live|adsb\.fi/i],
    [['space'],/swpc\.noaa\.gov/i]];
  var saveT=null; function save(){ clearTimeout(saveT); saveT=setTimeout(function(){ try{ localStorage.setItem(K,JSON.stringify(T)) }catch(e){} },2000) }
  function mark(u){ var s=String(u||''); if(/workers\.dev\/\?u=/.test(s)) try{ s+=' '+decodeURIComponent(s.split('?u=')[1]||'') }catch(e){}
    var now=Date.now(); P.forEach(function(p){ if(p[1].test(s)) p[0].forEach(function(k){ T[k]=now }) }); save() }
  /* when a source fails (no answer, or an error answer): remembered per source, so the map can say "DriveBC didn't answer · showing 2:15 PM" */
  var SRC=[['road','DriveBC',/open511\.gov\.bc\.ca|drivebc\.ca/i],['ferry','BC Ferries',/bcferries/i],['apt','Airport weather',/aviationweather\.gov/i],
    ['fsr','BC map data',/openmaps\.gov\.bc\.ca\/geo\/pub\/wfs/i],['trail','OpenStreetMap',/overpass-api\.de|overpass\.kumi/i],['rep','AwareBC server',/workers\.dev\/list\b/i],
    ['fire','BC Wildfire',/BCWS_ActiveFires|BCWS_FirePerimeters|WFIGS/i],['lt','Lightning data',/layers?=[^&]*Lightning/i],['rain','Rain radar',/rainviewer|layers?=[^&]*RADAR|mesonet\.agron/i],
    ['mt','Avalanche Canada',/avalanche\.ca/i],['space','Space weather',/swpc\.noaa\.gov/i]];
  var BAD={};
  function fail(u,why){ var s=String(u||''); if(/workers\.dev\/\?u=/.test(s)) try{ s+=' '+decodeURIComponent(s.split('?u=')[1]||'') }catch(e){}
    if(navigator.onLine===false) return; /* no signal at all is shown elsewhere; this is for a source that's down */
    SRC.forEach(function(x){ if(!x[2].test(s)) return; var k=x[0]; if(BAD[k]&&Date.now()-BAD[k].t<5000) return; BAD[k]={t:Date.now(),why:why};
      try{ window.dispatchEvent(new CustomEvent('aw-srcdown',{detail:{k:k,name:x[1],last:T[k]||0}})) }catch(e){} }) }
  function okSrc(u){ var s=String(u||''); SRC.forEach(function(x){ if(x[2].test(s)) delete BAD[x[0]] }) }
  var of=window.fetch; window.fetch=function(u,o){ var p=of.apply(window,arguments); try{ var url=typeof u==='string'?u:(u&&u.url)||''; if(url) p.then(function(r){ if(r&&r.ok){ mark(url); okSrc(url) } else if(r&&r.status>=500) fail(url,'error') },function(e){ if(!(e&&e.name==='AbortError')) fail(url,'no answer') }) }catch(e){} return p };
  function ago(t){ var m=Math.round((Date.now()-t)/60000); return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago' }
  /* stale = older than this many minutes for that layer (planes move fast; trails barely change) */
  var OLD={plane:3,rain:20,lt:20,road:30,fire:60,apt:60,ferry:30,space:180,mt:720,rep:120};
  window.__fresh={down:function(k){ var keys=k==='back'||k==='motor'||k==='close'||k==='camp'?['fsr']:[k]; return keys.some(function(x){ return BAD[x]&&(!T[x]||BAD[x].t>T[x])&&Date.now()-BAD[x].t<1800000 }) },get:function(k){ return T[k]||0 },ago:function(k){ return T[k]?ago(T[k]):'' },stale:function(k){ return !!T[k]&&(Date.now()-T[k])/60000>(OLD[k]||1440) },mark:mark};
})();
