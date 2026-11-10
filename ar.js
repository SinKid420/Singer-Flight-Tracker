// AwareBC by Josh Singer: AR plane finder.
// Loaded a moment after the map opens, so the map itself shows up faster.
window.__awm&&window.__awm('ar',function(X){with(X){
(function(){
    var btn=document.getElementById('arbtn'); if(!btn) return;
    var box=document.createElement('div'); box.id='ar'; box.hidden=true; box.setAttribute('role','dialog'); box.setAttribute('aria-label','AR plane finder');
    box.innerHTML='<video id="arvid" playsinline muted autoplay></video><div id="arlay"></div>'+
      '<div id="arhud"><div><b id="arhead">--°</b> <span id="arcount"></span><br><span id="armsg">Point your phone at the sky</span></div><button id="arclose" aria-label="Close AR">✕</button></div>'+
      '<div id="aredges"></div><div id="arhint">Tap a label for details · drag sideways to line labels up with a plane you can see</div><div id="arcard" hidden></div>';
    document.body.appendChild(box);
    var vid=box.querySelector('#arvid'), lay=box.querySelector('#arlay'), card=box.querySelector('#arcard'), hint=box.querySelector('#arhint'), edgeBox=box.querySelector('#aredges'), camErr='';
    var headEl=box.querySelector('#arhead'), cntEl=box.querySelector('#arcount'), msgEl=box.querySelector('#armsg');
    var stream=null, raf=0, on=false, gotOri=false, absOri=false, basis=null, tags={}, edges=[], pick=null, elev=null, dataRef=null, dataT=0;
    var off=0; try{off=parseFloat(localStorage.getItem('sky-aroff'))||0}catch(e){}
    var VFOV=62*Math.PI/180, D=Math.PI/180;
    function norm(v){var l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l]}
    function onOri(e,abs){
      if(e.alpha==null&&e.webkitCompassHeading==null) return;
      var a=e.alpha, b=e.beta||0, g=e.gamma||0;
      if(e.webkitCompassHeading!=null){a=360-e.webkitCompassHeading; abs=true}
      if(abs) absOri=true; else if(absOri) return;
      gotOri=true; a*=D; b*=D; g*=D;
      var cA=Math.cos(a),sA=Math.sin(a),cB=Math.cos(b),sB=Math.sin(b),cG=Math.cos(g),sG=Math.sin(g);
      var right=[cA*cG-sA*sB*sG, cG*sA+cA*sB*sG, -cB*sG], up=[-cB*sA, cA*cB, sB], out=[cA*sG+cG*sA*sB, sA*sG-cA*cG*sB, cB*cG];
      var ang=((screen.orientation&&screen.orientation.angle)||window.orientation||0)*D, c=Math.cos(ang), s2=Math.sin(ang);
      var rS=[c*right[0]-s2*up[0],c*right[1]-s2*up[1],c*right[2]-s2*up[2]], uS=[s2*right[0]+c*up[0],s2*right[1]+c*up[1],s2*right[2]+c*up[2]], f=[-out[0],-out[1],-out[2]];
      if(!basis) basis={r:rS,u:uS,f:f}; else { var k=.3; ['r','u','f'].forEach(function(n,i){var src=[rS,uS,f][i]; basis[n]=norm([basis[n][0]+(src[0]-basis[n][0])*k,basis[n][1]+(src[1]-basis[n][1])*k,basis[n][2]+(src[2]-basis[n][2])*k])}) }
    }
    function oriAbs(e){onOri(e,true)} function oriRel(e){onOri(e,!!e.absolute)}
    function enu(p,now){
      var lat=p.lat, lon=p.lon, dt=Math.min(30,(now-dataT)/1000);
      if(p.gs&&p.track!=null&&p.alt_baro!=='ground'){var m=p.gs*0.5144*dt, t=p.track*D; lat+=m*Math.cos(t)/111320; lon+=m*Math.sin(t)/(111320*Math.cos(lat*D))}
      var dN=(lat-me.lat)*111320, dE=(lon-me.lon)*111320*Math.cos(me.lat*D), d=Math.hypot(dN,dE);
      var ft=p.alt_baro==='ground'?0:(p.alt_geom!=null?p.alt_geom:p.alt_baro); if(ft==null) return null;
      var up=ft*0.3048-(elev||0)-d*d/(2*6371000)*0.87, o=off*D, e2=dE*Math.cos(o)-dN*Math.sin(o), n2=dE*Math.sin(o)+dN*Math.cos(o);
      return {v:[e2,n2,up],d:d};
    }
    function fmtD(m){var x=units==='av'?m/1852:m/1000;return (x<10?x.toFixed(1):Math.round(x))+' '+distUnit()}
    var DIRS=['N','NE','E','SE','S','SW','W','NW'];
    function frame(){
      if(!on) return; raf=requestAnimationFrame(frame);
      if(lastData!==dataRef){dataRef=lastData;dataT=Date.now()}
      var W=box.clientWidth, H=box.clientHeight, fpx=(H/2)/Math.tan(VFOV/2), now=Date.now(), seen={}, placed=[], vis=0, offs=[];
      if(!basis){ msgEl.textContent=gotOri?'Hold steady…':'No motion sensor found – AR needs a phone with a compass'; return }
      var hd=(Math.atan2(basis.f[0],basis.f[1])/D+off+360)%360, el=Math.asin(Math.max(-1,Math.min(1,basis.f[2])))/D;
      headEl.textContent='Facing '+Math.round(hd)+'° '+DIRS[Math.round(hd/45)%8];
      msgEl.textContent=camErr||(el<-5?'Tilt up toward the sky':(absOri?'Tilt '+(el>=0?'up ':'down ')+Math.abs(Math.round(el))+'°':'Compass not absolute – drag sideways to align'));
      var list=(lastData||[]).map(function(p){var q=enu(p,now);return q?{p:p,q:q}:null}).filter(Boolean).sort(function(a,b){return a.q.d-b.q.d}).slice(0,+cfg2.arMax||40);
      if(spaceCfg.ar&&window.satellite&&sats.length){ if(!frame._st||now-frame._st>2000){frame._st=now;frame._su=upNow()} var o2=off*D;
        frame._su.slice(0,12).forEach(function(l){ var E=Math.sin(l.az*D)*Math.cos(l.el*D), N=Math.cos(l.az*D)*Math.cos(l.el*D); list.push({p:{hex:'sat'+l.s.id,_sat:l},q:{v:[E*Math.cos(o2)-N*Math.sin(o2),E*Math.sin(o2)+N*Math.cos(o2),Math.sin(l.el*D)],d:l.range*1000}}) }) }
      list.forEach(function(it,idx){
        var p=it.p, v=it.q.v, l=Math.hypot(v[0],v[1],v[2])||1, x=(v[0]*basis.r[0]+v[1]*basis.r[1]+v[2]*basis.r[2])/l, y=(v[0]*basis.u[0]+v[1]*basis.u[1]+v[2]*basis.u[2])/l, z=(v[0]*basis.f[0]+v[1]*basis.f[1]+v[2]*basis.f[2])/l;
        var sx=W/2+x/z*fpx, sy=H/2-y/z*fpx;
        if(z>0.05&&sx>-40&&sx<W+40&&sy>-20&&sy<H+80){
          var t=tags[p.hex]; if(!t){t=tags[p.hex]=document.createElement('div');t.className='artag';t.innerHTML='<div class="box"></div><div class="stem"></div><div class="ring"></div>';lay.appendChild(t);(function(h){t.onclick=function(ev){ev.stopPropagation();showCard(h)}})(p.hex)}
          var far=p._sat?(p._sat.s.tag!=='station'):idx>(cfg2.arDetail==='compact'?-1:7), alt=p._sat?'':(p.alt_baro==='ground'?'GND':uAlt(p.alt_baro)+' '+altUnit()), ty=p._sat?'':typeName(p);
          var html=p._sat?('<b>🛰 '+esc(p._sat.s.name)+'</b>'+Math.round(p._sat.h)+' km up · '+(p._sat.vis?'visible now':'not lit')):('<b>'+esc(name(p))+'</b>'+(far?'':esc(ty?ty+' · ':'')) +alt+' · '+fmtD(it.q.d));
          if(t._h!==html){t.firstChild.innerHTML=html;t._h=html;t._w=0}
          t.className='artag'+(far?' far':'')+(p.hex===pick?' sel':''); t.style.setProperty('--c',p._sat?'#4fc3f7':pcol(p.hex));
          if(!t._w){t._w=t.firstChild.offsetWidth||(far?96:150);t._bh=t.firstChild.offsetHeight||(far?30:42)}
          var bw=t._w, bh=t._bh, bx=Math.max(bw/2+4,Math.min(W-bw/2-4,sx)), ty2=sy-22-bh/2;
          var hit=false; for(var k=0;k<4;k++){hit=placed.some(function(r){return Math.abs(r.x-bx)<(r.w+bw)/2+4&&Math.abs(r.y-ty2)<(r.h+bh)/2+3});if(!hit)break;ty2-=bh+5} t.classList.toggle('nobox',hit); t.style.zIndex=100-idx;
          if(!hit) placed.push({x:bx,y:ty2,w:bw,h:bh}); t.lastChild.previousSibling.style.height=Math.max(6,sy-ty2-bh/2-8)+'px'; t.firstChild.style.transform='translateX('+Math.round(bx-sx)+'px)';
          t.style.transform='translate('+Math.round(sx)+'px,'+Math.round(sy+8)+'px) translate(-50%,-100%)'; t.style.display=''; seen[p.hex]=1; vis++;
        } else if(!p._sat&&offs.length<3&&idx<10) offs.push({p:p,x:x,y:y,d:it.q.d});
      });
      Object.keys(tags).forEach(function(h){if(!seen[h]){tags[h].remove();delete tags[h]}});
      edges.forEach(function(e){e.remove()}); edges=[]; edgeBox.hidden=!!pick;
      offs.forEach(function(o){var a=Math.atan2(-o.y,o.x), e=document.createElement('div');
        var ar=['→','↘','↓','↙','←','↖','↑','↗'][(Math.round(a/(Math.PI/4))+8)%8];
        e.className='aredge'; e.textContent=ar+' '+name(o.p)+' · '+fmtD(o.d); edgeBox.appendChild(e); edges.push(e)});
      cntEl.textContent=vis?'· '+vis+' in view':'';
      if(pick) fillCard();
    }
    function findP(h){ if(/^sat/.test(h)){ var l=(frame._su||[]).filter(function(x){return 'sat'+x.s.id===h})[0]; return l?{hex:h,_sat:l}:null } return (lastData||[]).filter(function(p){return p.hex===h})[0]}
    function fillCard(){var p=findP(pick); if(!p){card.hidden=true;pick=null;hint.hidden=false;return}
      if(p._sat){ var L2=p._sat, sp=L2.v?Math.round(Math.hypot(L2.v.x,L2.v.y,L2.v.z)*3600):0, h2='<h3>🛰 '+esc(L2.s.name)+'</h3><div>'+esc(({station:'Space station',bright:'Bright satellite','new':'Starlink, recent launch'})[L2.s.tag]||'Satellite')+' · '+(L2.vis?'lit by the sun: look for a moving star':'in shadow or daylight: hard to see')+'</div><div class="g">'+
        '<span>Height <b>'+Math.round(L2.h).toLocaleString()+' km</b></span><span>Speed <b>'+sp.toLocaleString()+' km/h</b></span><span>Look <b>'+DIRS[Math.round(L2.az/45)%8]+' · '+Math.round(L2.el)+'° up</b></span><span>Distance <b>'+Math.round(L2.range).toLocaleString()+' km</b></span></div><div class="acts"><button id="arx">Close</button></div>';
        if(card._h!==h2){card.innerHTML=h2;card._h=h2;card.querySelector('#arx').onclick=function(){pick=null;card.hidden=true;hint.hidden=false}} return }
      var q=enu(p,Date.now()), rt=routeText(p), ty=typeName(p), html='<h3>'+esc(name(p))+'</h3><div>'+esc([ty,rt].filter(Boolean).join(' · ')||'Details loading…')+'</div><div class="g">'+
        '<span>Altitude <b>'+(p.alt_baro==='ground'?'GND':uAlt(p.alt_baro)+' '+altUnit())+'</b></span><span>Speed <b>'+(p.gs!=null?Math.round(units==='av'?p.gs:p.gs*1.852)+' '+spdUnit():'—')+'</b></span>'+
        '<span>Distance <b>'+(q?fmtD(q.d):'—')+'</b></span><span>Heading <b>'+(p.track!=null?Math.round(p.track)+'°':'—')+'</b></span></div><div class="acts"><button id="armap">Show on map</button><button id="arx">Close</button></div>';
      if(card._h!==html){card.innerHTML=html;card._h=html;
        card.querySelector('#armap').onclick=function(){var h=pick;stop();select(h,true)};
        card.querySelector('#arx').onclick=function(){pick=null;card.hidden=true;hint.hidden=false;select(null)}}
    }
    function showCard(h){pick=h; selected=h; render(lastData); card._h=''; card.hidden=false; hint.hidden=true; fillCard()}
    // drag sideways to fix compass error (saved on this phone)
    var dx0=null, off0=0;
    box.addEventListener('pointerdown',function(e){if(e.target.closest('#arcard,#arhud,.artag'))return;dx0=e.clientX;off0=off});
    box.addEventListener('pointermove',function(e){if(dx0==null)return;var W=box.clientWidth, hf=2*Math.atan(Math.tan(VFOV/2)*W/box.clientHeight)/D; off=off0-(e.clientX-dx0)/W*hf});
    function endDrag(){if(dx0==null)return;dx0=null;off=((off+540)%360)-180;try{localStorage.setItem('sky-aroff',off.toFixed(1))}catch(e){}}
    box.addEventListener('pointerup',endDrag); box.addEventListener('pointercancel',endDrag);
    function start(){
      on=true; box.hidden=false; basis=null; camErr=''; if(spaceCfg.ar) loadSats().catch(function(){}); gotOri=false; absOri=false; pick=null; card.hidden=true; hint.hidden=false; msgEl.textContent='Starting camera…';
      if(elev==null) fetch('https://api.open-meteo.com/v1/elevation?latitude='+me.lat.toFixed(4)+'&longitude='+me.lon.toFixed(4)).then(function(r){return r.json()}).then(function(j){if(j&&j.elevation) elev=j.elevation[0]+1.5}).catch(function(){});
      var perm=(window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission)?DeviceOrientationEvent.requestPermission().catch(function(){}):Promise.resolve();
      perm.then(function(){ window.addEventListener('deviceorientationabsolute',oriAbs); window.addEventListener('deviceorientation',oriRel) });
      if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){
        navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false}).then(function(st){ if(!on){st.getTracks().forEach(function(t){t.stop()});return} stream=st; vid.srcObject=st; vid.play().catch(function(){}) })
          .catch(function(){ camErr='Camera blocked – allow it to see the sky (labels still work)' });
      }
      raf=requestAnimationFrame(frame);
      if(history.pushState) history.pushState({ar:1},'');
    }
    function stop(fromPop){
      if(!on) return; on=false; cancelAnimationFrame(raf); box.hidden=true;
      window.removeEventListener('deviceorientationabsolute',oriAbs); window.removeEventListener('deviceorientation',oriRel);
      if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null} vid.srcObject=null;
      Object.keys(tags).forEach(function(h){tags[h].remove()}); tags={}; edges.forEach(function(e){e.remove()}); edges=[];
      if(!fromPop&&history.state&&history.state.ar) history.back();
    }
    window.addEventListener('popstate',function(){stop(true)});
    document.addEventListener('visibilitychange',function(){if(document.hidden&&on) stop()});
    btn.onclick=start; box.querySelector('#arclose').onclick=function(){stop()};
    window.__ar={start:start,stop:stop,reset:function(){off=0;try{localStorage.setItem('sky-aroff','0')}catch(e){}},ori:function(a,b,g){onOri({alpha:a,beta:b,gamma:g},true)}};
  })();
}});
