/* AwareBC speed limit sign (by Josh Singer): a BC-style "MAXIMUM / km/h" sign next to the odometer while you drive.
   Limits come from OpenStreetMap (free): the roads around you are downloaded about once every kilometre (not every few seconds)
   and kept on the phone, so roads you've driven still show their limit with no signal. Over the limit, the sign turns red.
   No limit on record for a road (common on back roads): no sign, rather than a guess. */
(function(){
  var OP='https://overpass-api.de/api/interpreter?data=', CELL=0.02, K='aw-spdc', MAXC=60;
  var C={}; try{ C=JSON.parse(localStorage.getItem(K)||'{}')||{} }catch(e){ C={} }
  var busy={}, sign=null, cur=null, spd=0, lastFix=null, lastLook=0, movT=0;
  function save(){ var ks=Object.keys(C); if(ks.length>MAXC){ ks.sort(function(a,b){ return C[a].t-C[b].t }).slice(0,ks.length-MAXC).forEach(function(k){ delete C[k] }) } try{ localStorage.setItem(K,JSON.stringify(C)) }catch(e){} }
  /* "100", "100 km/h", "60 mph", "CA:urban" → km/h */
  function kmh(v){ v=String(v||'').toLowerCase(); var n=parseFloat(v); if(/mph/.test(v)&&isFinite(n)) return Math.round(n*1.609/5)*5; if(isFinite(n)) return Math.round(n); if(/urban/.test(v)) return 50; if(/rural/.test(v)) return 80; return 0 }
  function cellKey(la,lo){ return Math.floor(la/CELL)+':'+Math.floor(lo/CELL) }
  function load(la,lo){ var k=cellKey(la,lo); if(C[k]||busy[k]||navigator.onLine===false) return; busy[k]=1;
    var s=Math.floor(la/CELL)*CELL, w=Math.floor(lo/CELL)*CELL, q='[out:json][timeout:20];way('+s.toFixed(3)+','+w.toFixed(3)+','+(s+CELL).toFixed(3)+','+(w+CELL).toFixed(3)+')[highway][maxspeed];out tags geom;';
    fetch(OP+encodeURIComponent(q)).then(function(r){ return r.ok?r.json():null }).then(function(j){ delete busy[k]; if(!j) return;
      var W=[]; (j.elements||[]).forEach(function(e){ var v=kmh(e.tags&&e.tags.maxspeed); if(!v||!e.geometry) return; W.push([v,e.geometry.map(function(g){ return [+g.lat.toFixed(5),+g.lon.toFixed(5)] })]) });
      C[k]={t:Date.now(),w:W}; save(); look(true) }).catch(function(){ delete busy[k] }) }
  /* distance in metres from a point to a road segment (good enough over a few hundred metres) */
  function segD(la,lo,a,b){ var kx=111320*Math.cos(la*Math.PI/180), ky=110540, ax=(a[1]-lo)*kx, ay=(a[0]-la)*ky, bx=(b[1]-lo)*kx, by=(b[0]-la)*ky, dx=bx-ax, dy=by-ay, L=dx*dx+dy*dy, t=L?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/L)):0, x=ax+t*dx, y=ay+t*dy; return Math.sqrt(x*x+y*y) }
  function look(force){ if(!lastFix) return; var now=Date.now(); if(!force&&now-lastLook<3000) return; lastLook=now;
    var la=lastFix.lat, lo=lastFix.lon, c=C[cellKey(la,lo)]; load(la,lo);
    /* also fetch the next cell ahead early, so the sign is ready before you get there */
    if(lastFix.pla!=null){ var dla=la-lastFix.pla, dlo=lo-lastFix.plo; load(la+dla*40,lo+dlo*40) }
    if(!c){ show(null); return } var best=null, bd=28;
    c.w.forEach(function(w){ for(var i=1;i<w[1].length;i++){ var d=segD(la,lo,w[1][i-1],w[1][i]); if(d<bd){ bd=d; best=w[0] } } });
    show(best) }
  var css=document.createElement('style'); css.textContent=
    '#awspd{position:fixed;z-index:1003;width:46px;padding:4px 0 3px;border-radius:6px;background:#fff;border:2.5px solid #111;box-shadow:0 0 0 2px #fff,0 6px 16px rgba(0,0,0,.55);text-align:center;color:#111;font-family:var(--font,system-ui);line-height:1;pointer-events:none;transition:background .3s,border-color .3s}'+
    '#awspd small{display:block;font:800 7.5px/1 var(--font,system-ui);letter-spacing:.3px}#awspd b{display:block;font:900 21px/1.05 var(--font,system-ui);letter-spacing:-.5px;margin:2px 0 1px}#awspd i{display:block;font:800 8px/1 var(--font,system-ui);font-style:normal}'+
    '#awspd.over{border-color:#d32f2f;box-shadow:0 0 0 2px #fff,0 0 14px rgba(255,59,48,.8)}#awspd.over b{color:#d32f2f}#awspd[hidden]{display:none}'+
    'body.menuon #awspd,body.toolon #awspd,body.srchon #awspd,body.trcard #awspd,body.fsrp #awspd,body.awon #awspd,body.keyon #awspd{display:none}';
  document.head.appendChild(css);
  function place(){ if(!sign) return; var o=document.getElementById('awodo'); if(!o||o.hidden||getComputedStyle(o).display==='none'||!cur){ sign.hidden=true; return } sign.hidden=false; var r=o.getBoundingClientRect(); sign.style.left=Math.round(r.right+8)+'px'; sign.style.top=Math.round(r.top+(r.height-sign.offsetHeight)/2)+'px' }
  function show(v){ cur=v; if(!v){ if(sign) sign.hidden=true; return }
    if(!sign){ sign=document.createElement('div'); sign.id='awspd'; sign.setAttribute('role','img'); sign.innerHTML='<small>MAXIMUM</small><b></b><i>km/h</i>'; document.body.appendChild(sign) }
    sign.querySelector('b').textContent=v; sign.setAttribute('aria-label','Speed limit '+v+' km/h'); sign.classList.toggle('over',spd>v+5); place() }
  addEventListener('aw-fix',function(e){ var f=e.detail||{}; if(!(f.acc<=50)) return; if(f.sp>=0) spd=f.sp*3.6; else if(lastFix){ var dt=Math.max(0.5,((f.t||Date.now())-(lastFix.t||Date.now()))/1000), dy=(f.lat-lastFix.lat)*110540, dx=(f.lon-lastFix.lon)*111320*Math.cos(f.lat*Math.PI/180); spd=Math.sqrt(dx*dx+dy*dy)/dt*3.6 }
    if(spd>=5) movT=Date.now(); lastFix={lat:f.lat,lon:f.lon,t:f.t||Date.now(),pla:lastFix?lastFix.lat:null,plo:lastFix?lastFix.lon:null}; look() });
  setInterval(function(){ if(sign) place(); if(sign&&Date.now()-movT>90000&&!document.body.classList.contains('navon')) sign.hidden=true },1000);
  window.__spd={get:function(){ return cur }};
})();
