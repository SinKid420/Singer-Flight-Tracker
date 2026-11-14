// AwareBC aircraft and vehicle art (by Josh Singer). Shaded top-down icons in real-life colours:
//  - Airliners white, military grey, firefighting aircraft yellow/orange, helicopters white with red tail
//  - The outline of every aircraft still shows its altitude colour, so the altitude bar keeps working
//  - Extra "my spot" vehicles: snowplow, ambulance, police, tow truck, snowmobile
(function(){
  var FIRE={CL2P:1,CL2T:1,CL4T:1,CL5T:1,AT8T:1,AT6T:1,AT5T:1,AT3T:1,S2P:1,S2T:1,S64:1,KMAX:1};
  var HELI=/^(R22|R44|R66|EC\d\d|AS\d\d|H\d\d\d?|B06|B407|B412|B429|S76|S92|S61|S64|A109|A119|A139|A169|AW\d+|MD\d+|EXPL|HUEY|UH\d+|CH\d+|AH\d+|MI\d+|KA\d+|BK17|B105|B212|B214|B222|S58|S55|H500|H60|H47)$/;
  function kind(p){
    var t=String(p.t||'').toUpperCase(), c=String(p.category||'').toUpperCase(), mil=!!(p.dbFlags&1);
    if(FIRE[t]) return 'fire';
    if(c==='A7'||HELI.test(t)) return mil?'milheli':'heli';
    if(c==='B1') return 'glider';
    if(c==='B6') return 'drone';
    if(c==='A6'||(mil&&/^(F\d|FA\d|T38|T6|TEX2|HAWK|EUFI|TORN|F16|F18|F35|A10|HUNT)/.test(t))) return 'fighter';
    if(c==='A3'||c==='A4'||c==='A5') return mil?'milbig':'big';
    if(c==='A1') return 'light';
    return mil?'milmid':'mid';
  }
  var BODY={big:'#f4f6f8',mid:'#f4f6f8',light:'#f4f6f8',glider:'#f4f6f8',fire:'#ffb300',milbig:'#9aa3ad',milmid:'#9aa3ad',fighter:'#8e98a3',heli:'#f4f6f8',milheli:'#8e98a3',drone:'#3c4450'};
  var SH={big:'#bcc5d0',mid:'#bcc5d0',light:'#bcc5d0',glider:'#bcc5d0',fire:'#d97800',milbig:'#69727d',milmid:'#69727d',fighter:'#5f6973',heli:'#bcc5d0',milheli:'#5f6973',drone:'#1f252d'};
  var P={
    big:'M12 1.5c.9 0 1.4 1 1.4 2.4V9l8.6 6.2v1.8l-8.6-2.6v4.3l2.3 1.6V22L12 21l-3.7 1v-1.4l2.3-1.6v-4.3L2 17v-1.8L10.6 9V3.9c0-1.4.5-2.4 1.4-2.4z',
    mid:'M12 2c.8 0 1.2.9 1.2 2v5.5l5.8 3.7v1.7l-5.8-1.6v3.6l1.8 1.4V21L12 20.3 9 21v-1.2l1.8-1.4v-3.6L5 14.9v-1.7l5.8-3.7V4c0-1.1.4-2 1.2-2z',
    light:'M12 2.4c.6 0 1.1.8 1.1 1.8v5H22v3.4h-8.9v5l2.1 1.6V21H8.8v-1.8l2.1-1.6v-5H2V9.2h8.9v-5c0-1 .5-1.8 1.1-1.8z',
    fire:'M12 2.2c.7 0 1.2.9 1.2 2v4.6H23.5v3.8h-10.3v5.4l2.6 1.6V21.8H8.2v-2.2l2.6-1.6v-5.4H.5V8.8h10.3V4.2c0-1.1.5-2 1.2-2z',
    fighter:'M12 1.5l1.3 4.2 8 9.3v2.4l-6.8-1.4.5 3.4 1.8 1.8v.8L12 20.6l-4.8 1.4v-.8l1.8-1.8.5-3.4-6.8 1.4V15l8-9.3z',
    glider:'M12 3c.5 0 .8.6.8 1.4V10H23v1.8h-10.2v7l2 1.4V22H9.2v-1.8l2-1.4v-7H1V10h10.2V4.4c0-.8.3-1.4.8-1.4z'
  };
  P.milbig=P.big; P.milmid=P.mid;
  function extras(k){
    var hl='<path d="M11.2 3.6V19" stroke="#fff" stroke-opacity=".55" stroke-width="1" fill="none"/>', sd='<path d="M12.9 4V19.4" stroke="#000" stroke-opacity=".22" stroke-width="1.1" fill="none"/>',
        cp='<ellipse cx="12" cy="4.4" rx=".8" ry="1.2" fill="#243447"/>';
    if(k==='big'||k==='milbig') return hl+sd+'<circle cx="7.3" cy="12.4" r="1.2" fill="#6b7686"/><circle cx="16.7" cy="12.4" r="1.2" fill="#6b7686"/>'+cp;
    if(k==='mid'||k==='milmid') return hl+sd+'<ellipse cx="12" cy="4.2" rx=".8" ry="1.1" fill="#243447"/>';
    if(k==='light') return hl+'<path d="M10.2 2.4h3.6" stroke="#555d69" stroke-width="1.3" stroke-linecap="round"/><path d="M2.4 9.9h19.2" stroke="#e53935" stroke-opacity=".0" fill="none"/>';
    if(k==='fire') return '<rect x="8.2" y="19.8" width="7.6" height="2" fill="#d32f2f"/><rect x=".5" y="8.8" width="2" height="3.8" fill="#d32f2f"/><rect x="21.5" y="8.8" width="2" height="3.8" fill="#d32f2f"/><ellipse cx="7.4" cy="10.8" rx="1" ry="1.9" fill="#a45700"/><ellipse cx="16.6" cy="10.8" rx="1" ry="1.9" fill="#a45700"/><path d="M11.2 3.8V18" stroke="#fff" stroke-opacity=".5" stroke-width="1" fill="none"/><ellipse cx="12" cy="4.6" rx=".8" ry="1.1" fill="#243447"/>';
    if(k==='fighter') return '<path d="M12 4V17" stroke="#fff" stroke-opacity=".35" stroke-width="1" fill="none"/><ellipse cx="12" cy="6.4" rx=".9" ry="1.5" fill="#243447"/>';
    if(k==='glider') return '<path d="M11.2 4V18" stroke="#fff" stroke-opacity=".6" stroke-width="1" fill="none"/>';
    return '';
  }
  function heli(k,c){
    var b=BODY[k], tail=k==='milheli'?'#5f6973':'#d32f2f', st=' stroke="'+c+'" stroke-width="1.8" paint-order="stroke"';
    return '<rect x="11.1" y="14" width="1.8" height="8" rx=".9" fill="'+tail+'"'+st+'/><rect x="9.2" y="20.4" width="5.6" height="1.5" rx=".6" fill="'+tail+'"/>'
      +'<ellipse cx="12" cy="10.6" rx="3.3" ry="5.4" fill="'+b+'"'+st+'/><ellipse cx="12" cy="7.6" rx="1.9" ry="2.2" fill="#243447"/><path d="M13.6 8.5C14.2 11 14.2 13 13.4 15" stroke="#000" stroke-opacity=".18" stroke-width="1.2" fill="none"/>'
      +'<path d="M3.5 3.5L20.5 17.5M20.5 3.5L3.5 17.5" stroke="#4a5360" stroke-opacity=".75" stroke-width="1.1" stroke-linecap="round"/><circle cx="12" cy="10.6" r="1.4" fill="#4a5360"/>';
  }
  function drone(c){
    return '<path d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5" stroke="#3c4450" stroke-width="1.6" stroke-linecap="round"/>'
      +[[6.5,6.5],[17.5,6.5],[6.5,17.5],[17.5,17.5]].map(function(q){ return '<circle cx="'+q[0]+'" cy="'+q[1]+'" r="2.6" fill="#7b8590" stroke="'+c+'" stroke-width="1.2" paint-order="stroke"/>' }).join('')
      +'<circle cx="12" cy="12" r="2.8" fill="#3c4450" stroke="'+c+'" stroke-width="1.6" paint-order="stroke"/>';
  }
  // inner markup for a 24x24 aircraft icon, nose up. c = altitude colour (outline), sel = selected size
  function plane(p,c,sel){
    var k=kind(p), g;
    if(k==='heli'||k==='milheli') g=heli(k,c);
    else if(k==='drone') g=drone(c);
    else g='<path d="'+P[k]+'" fill="'+BODY[k]+'" stroke="'+c+'" stroke-width="1.8" stroke-linejoin="round" paint-order="stroke"/>'+extras(k);
    return '<g'+(sel?' transform="translate(3.6 3.6) scale(.7)"':'')+'>'+g+'</g>';
  }

  // ---- road vehicles for the "My spot icon" picker (40x40, seen from above) ----
  function w(y1,y2){ return '<rect x="-1.5" y="'+y1+'" width="3" height="7" rx="1.2" fill="#111"/><rect x="18.5" y="'+y1+'" width="3" height="7" rx="1.2" fill="#111"/><rect x="-1.5" y="'+y2+'" width="3" height="7" rx="1.2" fill="#111"/><rect x="18.5" y="'+y2+'" width="3" height="7" rx="1.2" fill="#111"/>' }
  var G='#1d2733', W=' stroke="#fff" stroke-width="1.6"', D=' stroke="#1d2733" stroke-width="1.4"';
  var veh={
    plow:function(){ return '<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="translate(10,3)">'+w(9,24)+'<path d="M-6 1H26L23 7H-3Z" fill="#ffd24a"'+W+' stroke-linejoin="round"/><rect y="6" width="20" height="30" rx="5" fill="#f28c28"'+W+'/><path d="M3 10Q10 7.5 17 10L16 14Q10 12.5 4 14Z" fill="'+G+'"/><rect x="5" y="16" width="10" height="2.2" rx="1" fill="#ffd24a"/><rect x="2.5" y="21" width="15" height="13" rx="1.5" fill="rgba(0,0,0,.35)" stroke="rgba(255,255,255,.5)"/></g></svg>' },
    ambo:function(){ return '<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="translate(10,2)">'+w(5,26)+'<rect width="20" height="37" rx="5" fill="#f7f9fa"'+D+'/><path d="M3 6Q10 3.5 17 6L16 10Q10 8.5 4 10Z" fill="#5d8fc2"/><rect x="3" y="12" width="6" height="2.4" rx="1" fill="#e53935"/><rect x="11" y="12" width="6" height="2.4" rx="1" fill="#2f80ed"/><rect x="8.6" y="19" width="2.8" height="9" fill="#e53935"/><rect x="5.5" y="22.1" width="9" height="2.8" fill="#e53935"/><rect x="2" y="31.5" width="16" height="2" rx="1" fill="#e53935"/></g></svg>' },
    rcmp:function(){ return '<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="translate(10,3)">'+w(6,22)+'<rect width="20" height="34" rx="7" fill="#f7f9fa"'+D+'/><rect x="0" y="16" width="20" height="4" fill="#1f4fa3"/><path d="M3 10Q10 6 17 10L16 14Q10 12 4 14Z" fill="'+G+'"/><path d="M4 25Q10 27 16 25L17 29Q10 31 3 29Z" fill="'+G+'"/><rect x="4" y="12.5" width="6" height="2.2" rx="1" fill="#e53935"/><rect x="10" y="12.5" width="6" height="2.2" rx="1" fill="#2f80ed"/></g></svg>' },
    tow:function(){ return '<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="translate(10,1)">'+w(5,26)+'<rect y="14" width="20" height="24" rx="3" fill="#4b5563"'+W+'/><path d="M3 18H17M3 23H17M3 28H17M3 33H17" stroke="rgba(255,255,255,.3)" stroke-width="1"/><rect width="20" height="15" rx="5" fill="#f5c400"'+W+'/><path d="M3 4Q10 1.5 17 4L16 8Q10 6.5 4 8Z" fill="'+G+'"/><rect x="7" y="9.5" width="6" height="2.4" rx="1" fill="#ff7a00"/><path d="M10 36V40" stroke="#ff7a00" stroke-width="2"/></g></svg>' },
    sled:function(c){ return '<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="translate(10,3)"><rect x="1" y="1" width="4" height="12" rx="2" fill="#222"/><rect x="15" y="1" width="4" height="12" rx="2" fill="#222"/><rect x="6" y="22" width="8" height="15" rx="2" fill="#2b2b2b"'+W+'/><path d="M6 25H14M6 28.5H14M6 32H14" stroke="#777" stroke-width="1"/><path d="M5.5 6H14.5L13.5 15 12 19V28H8V19L6.5 15Z" fill="'+c+'"'+W+' stroke-linejoin="round"/><rect x="1.5" y="14" width="17" height="2.4" rx="1.2" fill="#222"/><path d="M7 8.5Q10 6.5 13 8.5L12.5 11Q10 10 7.5 11Z" fill="'+G+'"/><rect x="7.6" y="20" width="4.8" height="7" rx="2" fill="#222"/></g></svg>' }
  };
  window.AWI={plane:plane,kind:kind,veh:veh,vehKinds:[['plow','Snowplow'],['ambo','Ambulance'],['rcmp','Police'],['tow','Tow truck'],['sled','Snowmobile']]};
})();
