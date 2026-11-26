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
  var of=window.fetch; window.fetch=function(u,o){ var p=of.apply(window,arguments); try{ var url=typeof u==='string'?u:(u&&u.url)||''; if(url) p.then(function(r){ if(r&&r.ok) mark(url) },function(){}) }catch(e){} return p };
  function ago(t){ var m=Math.round((Date.now()-t)/60000); return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago' }
  /* stale = older than this many minutes for that layer (planes move fast; trails barely change) */
  var OLD={plane:3,rain:20,lt:20,road:30,fire:60,apt:60,ferry:30,space:180,mt:720,rep:120};
  window.__fresh={get:function(k){ return T[k]||0 },ago:function(k){ return T[k]?ago(T[k]):'' },stale:function(k){ return !!T[k]&&(Date.now()-T[k])/60000>(OLD[k]||1440) },mark:mark};
})();
