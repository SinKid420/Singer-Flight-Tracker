// AwareBC place info (by Josh Singer): when you drop a pin or pick a search result, show what's there like a map app would:
// name, what it is, address, open now, phone, website and a small photo. Free sources only:
// OpenStreetMap (Overpass) for the place, Wikidata/Wikimedia Commons or the place's own website for the photo, Photon for the address.
(function boot(){
  var A=window.__AW; if(!A||!A.map){ setTimeout(boot,300); return }
  var RELAY='https://awarebc.aware-bc.workers.dev/';
  var esc=A.esc||function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] }) };
  var css=document.createElement('style'); css.textContent='.pinpop .leaflet-popup-content{margin:12px 14px}.plc{display:flex;gap:10px;margin:6px 0 2px;text-align:left;min-height:20px}.plc .pim{flex:none;width:52px;height:52px;border-radius:10px;background:#eee center/cover no-repeat;display:none}.plc .pim.on{display:block}'+
    '.plc .ptx{flex:1;min-width:0;font-size:12.5px;line-height:1.35;color:#333}.plc .pty{color:#555;font-weight:600}.plc .pad{color:#555;overflow:hidden;text-overflow:ellipsis}.plc .popn{color:#188038;font-weight:700}.plc .pcl{color:#c5221f;font-weight:700}'+
    '.plc a{color:#1a73e8;text-decoration:none;font-weight:600}.plc .pln{display:flex;gap:12px;flex-wrap:wrap;margin-top:2px}.plc .pwait{color:#888;font-size:12px}.plc small.psrc{display:block;color:#999;font-size:10px;margin-top:2px}';
  document.head.appendChild(css);
  function J(u,o){ var ac=window.AbortController?new AbortController():null, t=setTimeout(function(){ if(ac) ac.abort() },10000);
    return fetch(u,Object.assign({signal:ac&&ac.signal},o||{})).then(function(r){ clearTimeout(t); if(!r.ok) throw 0; return r.json() },function(e){ clearTimeout(t); throw e }) }
  function hav(a,b,c,d){ var r=Math.PI/180, x=Math.sin((c-a)*r/2), y=Math.sin((d-b)*r/2), h=x*x+Math.cos(a*r)*Math.cos(c*r)*y*y; return 12742000*Math.asin(Math.min(1,Math.sqrt(h))) }
  function cap(s){ s=String(s||'').replace(/_/g,' '); return s.charAt(0).toUpperCase()+s.slice(1) }
  function tel(t){ t=String(t||'').split(/[;,]/)[0].trim(); return /^[+(\d][\d\s().\-]{5,24}$/.test(t)?t:'' }
  function web(u){ u=String(u||'').trim(); if(u&&!/^https?:\/\//i.test(u)&&/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) u='https://'+u; return /^https?:\/\/[^\s"<>]{3,200}$/i.test(u)?u:'' }
  var NICE={fuel:'Gas station',fast_food:'Fast food',cafe:'Café',pub:'Pub',bar:'Bar',restaurant:'Restaurant',pharmacy:'Pharmacy',hospital:'Hospital',clinic:'Clinic',doctors:'Doctor',dentist:'Dentist',bank:'Bank',atm:'ATM',post_office:'Post office',police:'Police',fire_station:'Fire station',school:'School',library:'Library',place_of_worship:'Place of worship',townhall:'Town hall',supermarket:'Grocery store',convenience:'Convenience store',hardware:'Hardware store',car_repair:'Auto repair',motel:'Motel',hotel:'Hotel',camp_site:'Campground',picnic_site:'Picnic site',viewpoint:'Viewpoint',park:'Park',playground:'Playground',museum:'Museum',toilets:'Washrooms',parking:'Parking',charging_station:'EV charging',veterinary:'Vet',liquor:'Liquor store',alcohol:'Liquor store',department_store:'Department store',car:'Car dealer',tyres:'Tire shop',outdoor:'Outdoor store',sports:'Sports store',hairdresser:'Hair salon'};
  var KEYS=['amenity','shop','tourism','leisure','office','craft','healthcare','club','sport','historic','man_made'];
  function kind(t){ for(var i=0;i<KEYS.length;i++){ var v=t[KEYS[i]]; if(v&&v!=='yes') return NICE[v]||cap(v) } return '' }
  // opening hours: the common forms (Mo-Fr 08:00-17:00; Sa 09:00-14:00; Su off; 24/7). Anything else is shown as written.
  var DN=['Su','Mo','Tu','We','Th','Fr','Sa'];
  function openNow(oh){ oh=String(oh||'').trim(); if(!oh) return null; if(/^24\/7$/.test(oh)) return {open:true,txt:'Open 24 hours'};
    var now=new Date(), d=now.getDay(), mins=now.getHours()*60+now.getMinutes(), res=null, ok=true;
    oh.split(';').forEach(function(rule){ rule=rule.trim(); if(!rule) return; var m=/^((?:(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?,?\s*)+)?\s*(.*)$/.exec(rule); if(!m){ ok=false; return }
      var days=m[1]?m[1].replace(/\s/g,'').split(',').filter(Boolean):['Mo-Su'], hit=days.some(function(r){ var p=r.split('-'), a=DN.indexOf(p[0]), b=DN.indexOf(p[1]||p[0]); if(a<0||b<0){ ok=false; return false } return a<=b?(d>=a&&d<=b):(d>=a||d<=b) });
      if(!hit) return; var tm=m[2].trim(); if(/^(off|closed)$/i.test(tm)){ res={open:false,txt:'Closed today'}; return }
      var spans=tm.split(','), any=false, until=null, next=null; spans.forEach(function(s){ var q=/^(\d\d):(\d\d)-(\d\d):(\d\d)$/.exec(s.trim()); if(!q){ ok=false; return } var o=+q[1]*60+ +q[2], c=+q[3]*60+ +q[4]; if(c<=o) c+=1440; if(mins>=o&&mins<c){ any=true; until=q[3]+':'+q[4] } else if(mins<o&&(!next||o<next.o)) next={o:o,t:q[1]+':'+q[2]} });
      res=any?{open:true,txt:'Open · closes '+hm(until)}:{open:false,txt:next?'Closed · opens '+hm(next.t):'Closed now'} });
    if(!ok) return {raw:oh}; return res||{open:false,txt:'Closed today'} }
  function hm(t){ var p=t.split(':'), d=new Date(); d.setHours(+p[0]%24,+p[1],0,0); return d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}) }
  function fp(name){ return 'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(String(name).replace(/^File:/i,'').replace(/ /g,'_'))+'?width=240' }

  window.__placeInfo=function(ll,title,box,pin){ if(navigator.onLine===false||!box) return; var el=document.createElement('div'); el.className='plc'; el.innerHTML='<div class="pim"></div><div class="ptx"><span class="pwait">Looking up this spot…</span></div>';
    var b=box.querySelector('b'); box.insertBefore(el,b?b.nextSibling:box.firstChild); upd();
    var panT=null; function upd(){ try{ var pp=pin&&pin.getPopup&&pin.getPopup(); if(pp&&pp.isOpen()){ pp.update(); clearTimeout(panT); panT=setTimeout(function(){ var w=pp.getElement&&pp.getElement(); if(!w||!pp.isOpen()) return; var r=w.getBoundingClientRect(), top=110, bot=window.innerHeight-70; // keep the bigger card on screen
          var dx=r.right>window.innerWidth-62?r.right-(window.innerWidth-62):r.left<58?r.left-58:0, dy=r.top<top?r.top-top:r.bottom>bot?r.bottom-bot:0; if(dx||dy) A.map.panBy([dx,dy],{animate:true}) },60) } }catch(e){} } // the card sits between the side buttons
    function photo(u){ if(!u) return; var im=new Image(); im.referrerPolicy='no-referrer'; im.onload=function(){ if(im.naturalWidth<40) return; var d=el.querySelector('.pim'); if(d&&!d.classList.contains('on')){ d.style.backgroundImage='url("'+u.replace(/"/g,'%22')+'")'; d.classList.add('on'); upd() } }; im.src=u }
    var la=ll.lat, lo=ll.lng, q='[out:json][timeout:9];nwr(around:45,'+la.toFixed(6)+','+lo.toFixed(6)+')[name][~"^('+KEYS.join('|')+')$"~"."];out tags center 20;';
    J('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(q)).then(function(j){ var L2=(j.elements||[]).map(function(e){ var c=e.center||e; return {t:e.tags||{},d:hav(la,lo,c.lat,c.lon)} });
        var tl=String(title||'').toLowerCase(); L2.sort(function(a,b){ var ma=tl&&String(a.t.name).toLowerCase().indexOf(tl)>=0?0:1, mb=tl&&String(b.t.name).toLowerCase().indexOf(tl)>=0?0:1; return ma-mb||a.d-b.d });
        return L2[0]||null }).catch(function(){ return null }).then(function(hit){
      if(!hit) return J('https://photon.komoot.io/reverse?lat='+la.toFixed(6)+'&lon='+lo.toFixed(6)+'&limit=1&lang=en').then(function(j){ var p=(j.features&&j.features[0]||{}).properties||{};
          var ad=[[p.housenumber,p.street].filter(Boolean).join(' '),p.city||p.town||p.village||p.county].filter(Boolean).join(', ');
          el.querySelector('.ptx').innerHTML=(p.name&&p.name!==title?'<div><b>'+esc(p.name)+'</b></div>':'')+(p.osm_value?'<div class="pty">'+esc(NICE[p.osm_value]||cap(p.osm_value))+'</div>':'')+(ad?'<div class="pad">'+esc(ad)+'</div>':'')+'<small class="psrc">Address © OpenStreetMap (Photon)</small>'; upd() }).catch(function(){ el.remove(); upd() });
      var t=hit.t, k=kind(t), sub=t.cuisine?cap(String(t.cuisine).split(';')[0]):(t.brand&&t.brand!==t.name?t.brand:''), ad=[[t['addr:housenumber'],t['addr:street']].filter(Boolean).join(' '),t['addr:city']].filter(Boolean).join(', ');
      var ph=tel(t.phone||t['contact:phone']||t['phone:mobile']), ws=web(t.website||t['contact:website']||t.url), oh=openNow(t.opening_hours);
      if(!title||title==='Pinned spot'){ if(b) b.textContent=t.name }
      function paint(){ var h=(title&&String(title).toLowerCase()!==String(t.name).toLowerCase()?'<div><b>'+esc(t.name)+'</b></div>':'')+(k?'<div class="pty">'+esc(k)+(sub?' · '+esc(sub):'')+'</div>':'')+(ad?'<div class="pad">'+esc(ad)+'</div>':'');
        if(oh) h+=oh.raw?'<div class="pad">Hours: '+esc(oh.raw)+'</div>':'<div class="'+(oh.open?'popn':'pcl')+'">'+esc(oh.txt)+'</div>';
        var ln=[]; if(ph) ln.push('<a href="tel:'+esc(ph.replace(/[^\d+]/g,''))+'">📞 '+esc(ph)+'</a>'); if(ws) ln.push('<a href="'+esc(ws)+'" target="_blank" rel="noopener noreferrer">Website ›</a>'); if(ln.length) h+='<div class="pln">'+ln.join('')+'</div>';
        h+='<small class="psrc">© OpenStreetMap</small>'; el.querySelector('.ptx').innerHTML=h; upd() }
      paint();
      // photo: the place's own tagged picture, then Wikidata, then its website's preview photo (through the AwareBC server)
      var im=String(t.image||''); if(/^https:\/\/[^\s"<>]+\.(jpe?g|png|webp)(\?|$)/i.test(im)) photo(im); else if(/^File:/i.test(im)) photo(fp(im));
      if(t.wikimedia_commons&&/^File:/i.test(t.wikimedia_commons)) photo(fp(t.wikimedia_commons));
      if(/^Q\d+$/.test(t.wikidata||'')) J('https://www.wikidata.org/w/api.php?action=wbgetentities&ids='+t.wikidata+'&props=claims&format=json&origin=*').then(function(j){ var c=j.entities[t.wikidata].claims||{}, p=c.P18&&c.P18[0]&&c.P18[0].mainsnak.datavalue; if(p) photo(fp(p.value)) }).catch(function(){});
      if(ws) J(RELAY+'?phone='+encodeURIComponent(ws)).then(function(j){ if(!ph&&j&&Array.isArray(j.phones)){ for(var i=0;i<j.phones.length&&!ph;i++) ph=tel(j.phones[i]); if(ph) paint() } if(j&&j.image&&/^https:\/\//.test(j.image)) photo(j.image) }).catch(function(){}) }) };
})();
