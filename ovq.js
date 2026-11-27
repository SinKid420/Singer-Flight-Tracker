/* OpenStreetMap data line-up (by Josh Singer): every question the app asks the free OpenStreetMap data service (trails, peaks,
   gas, hospitals, nearby places) waits its turn in one line, 2 at a time, because the service turns away more than that.
   If one is still turned away (busy) it waits a few seconds and asks again, and the last try goes to a second free copy of the service.
   The same question asked twice at once is only sent once. */
(function(){
  if(!window.fetch) return;
  var F=window.fetch, MAIN='https://overpass-api.de/api/interpreter', ALT='https://overpass.kumi.systems/api/interpreter';
  var run=0, Q=[], same={};
  function next(){ while(run<2&&Q.length){ var j=Q.shift(); run++; j() } }
  function slot(fn){ return new Promise(function(ok,no){ Q.push(function(){ fn().then(ok,no).then(done,done) }); next() }) }
  function done(){ run--; next() }
  function wait(ms){ return new Promise(function(r){ setTimeout(r,ms) }) }
  function ask(url,opt,n){
    return slot(function(){ return F(n>=2?url.replace(MAIN,ALT):url,opt) }).then(function(r){
      if((r.status===429||r.status===504||r.status===503)&&n<2) return wait(n?6000:3000).then(function(){ return ask(url,opt,n+1) });
      return r },
    function(e){ if(n<2&&navigator.onLine!==false) return wait(n?6000:3000).then(function(){ return ask(url,opt,n+1) }); throw e }) }
  window.fetch=function(u,opt){
    var url=typeof u==='string'?u:(u&&u.url)||'';
    if(url.indexOf(MAIN)!==0||(opt&&opt.method&&opt.method!=='GET')) return F.apply(this,arguments);
    if(!same[url]) same[url]=ask(url,opt,0).then(function(r){ setTimeout(function(){ delete same[url] },1000); return r },function(e){ delete same[url]; throw e });
    return same[url].then(function(r){ return r.clone() }) };
})();
