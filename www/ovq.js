/* OpenStreetMap data line-up (by Josh Singer): every question the app asks the free OpenStreetMap data service (trails, peaks,
   gas, hospitals, nearby places) waits its turn in one line, 2 at a time, because the service turns away more than that.
   If one is turned away (busy) it waits a moment and asks a second free copy of the service.
   The same question asked twice at once is only sent once. */
(function(){
  if(!window.fetch) return;
  var F=window.fetch, MAIN='https://overpass-api.de/api/interpreter', ALT='https://overpass.kumi.systems/api/interpreter';
  /* two lines: things you asked for (Alerts, Aware, Tools, places) go first; the map's background trail downloads wait behind them */
  var run=0, HI=[], LO=[], same={};
  function next(){ while(run<2&&(HI.length||LO.length)){ var j=(HI.length?HI:LO).shift(); run++; j() } }
  function slot(fn,low){ return new Promise(function(ok,no){ (low?LO:HI).push(function(){ fn().then(ok,no).then(done,done) }); next() }) }
  function done(){ run--; next() }
  function wait(ms){ return new Promise(function(r){ setTimeout(r,ms) }) }
  function ask(url,opt,n,low){
    return slot(function(){ return F(n>=2?url.replace(MAIN,ALT):url,opt) },low).then(function(r){
      if((r.status===429||r.status===504||r.status===503)&&n<(low?2:1)) return wait(low?(n?6000:3000):2000).then(function(){ return ask(url,opt,low?n+1:2,low) });
      return r },
    /* no answer at all: background downloads try once more; things you're waiting on don't, so Alerts and Tools never hang */
    function(e){ if(low&&n<1&&navigator.onLine!==false) return wait(2500).then(function(){ return ask(url,opt,2,low) }); throw e }) }
  window.fetch=function(u,opt){
    var url=typeof u==='string'?u:(u&&u.url)||'';
    if(url.indexOf(MAIN)!==0||(opt&&opt.method&&opt.method!=='GET')) return F.apply(this,arguments);
    var low=!!window.__ovqLow; if(!same[url]) same[url]=ask(url,opt,0,low).then(function(r){ setTimeout(function(){ delete same[url] },1000); return r },function(e){ delete same[url]; throw e });
    return same[url].then(function(r){ return r.clone() }) };
})();
