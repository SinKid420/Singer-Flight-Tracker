// AwareBC by Josh Singer: survival tools (mountain sledder, supply chain, planetary threats, off-grid comms, rescue & signal).
// Loaded a moment after the map opens, so the map itself shows up faster.
window.__awm&&window.__awm('tools',function(X){with(X){
(function(){
    var REP=[["Local club",49.03,-118.44,"Grand Forks",147.28,0.6,"","FM"],["VE7CAQ",49.1,-117.75,"Granite (Trail)",146.84,-0.6,"","FM"],["VE7RCT",49.49,-117.29,"Nelson",146.64,-0.6,"","FM"],["VE7RBD",49.15,-119.23,"Mt Baldy (Oliver)",147.16,0.6,"","FM"],["VE7OKN",49.39,-119.9,"Apex Mtn",146.92,-0.6,"","FM"],["K7JAR",48.55,-117.9,"Colville",146.62,-0.6,"","FM"],["VE7RCA",49.1,-116.51,"Creston",146.8,-0.6,"","FM"],["VE7RPC",49.5053,-119.5464,"Penticton",147.12,0.6,"123","FM"],["VE7RVN",50.3589,-119.0587,"Vernon (SIRG)",444.275,5,"","FM"],["W7UPS",47.6524,-117.2066,"Spokane",145.39,-0.6,"100.0","FM"],["KE7PG",47.6331,-117.2333,"Spokane Valley",444.425,5,"100.0","FM"],["N7FM",47.5922,-117.2313,"Spokane",146.66,-0.6,"107.2","FM"],["N7MOT",47.6622,-116.9498,"Coeur dAlene, ID",147.28,0.6,"100.0","FM"],["NK7I",48.6167,-116.3746,"Naples - EchoIRLP 352588, ID",147.32,0.6,"167.9","FM"],["KC7TIG",47.9541,-116.861,"Spirit Lake, ID",444.25,5,"110.9","FM"],["VE7ATT",49.8733,-119.4932,"Kelowna",442.6,5,"CC1","DMR"],["VE7DCX",49.635,-115.9609,"Kimberley",443.75,5,"CC1","DMR"],["VE7KHZ",50.2683,-119.2676,"Vernon",145.05,0.6,"CC1","DMR"],["VA7NBC",49.7967,-119.4774,"Kelowna",444.8,5,"CC1","DMR"],["VA7VTV",50.2786,-119.3156,"Vernon",449.6,-5,"CC1","DMR"],["VE7EQN",49.903,-119.3809,"Kelowna",444.175,5,"CC1","DMR"],["VE7BDY",49.4949,-117.29,"Nelson",147.04,0.6,"CC1","DMR"],["VE7BTU",49.4949,-117.29,"Nelson",147.06,0.6,"CC1","DMR"],["WA7DMR",47.6588,-117.426,"Spokane",147.4125,-1,"CC1","DMR"],["KC7AAD",47.6579,-117.4212,"Spokane",444.1375,5,"CC1","DMR"],["KC7AAD",47.7768,-117.4961,"Spokane",434.125,0.6,"CC1","DMR"],["KC7AAD",47.8128,-117.5089,"Spokane",444.125,0.6,"CC1","DMR"],["N7FM",47.5921,-117.2313,"Spokane",145.33,-0.6,"88.5","FM"],["N7FM",47.5916,-117.2317,"Spokane",444.425,5,"100.0","FM"],["N7GWW",47.9684,-118.971,"Coulee Dam",449.8,-5,"141.3","FM"],["N7ISP",47.5943,-117.2974,"Spokane",441.775,5,"114.8","FM"],["W7IF",47.664,-117.1876,"Spokane Valley",441.175,5,"114.8","FM"],["W6SPY",48.1367,-117.1742,"Diamond Lake",146.9,0.6,"100","FM"],["W6SPY",48.1367,-117.1742,"Diamond Lake",442.275,5,"100.0","FM"],["W7UPS",47.7967,-117.546,"Nine Mile Falls",448.7,-5,"123.0","FM"],["KI7NOO",47.6588,-117.426,"Spokane",444.675,5,"100.0","FM"],["VA7NBC",49.7968,-119.4774,"Kelowna",147.1,0.6,"88.5","FM"],["W6SPY",48.1367,-117.1742,"Diamond Lake",444.575,5,"100","FM"],["VE7TYN",49.7022,-120.9242,"Coquihalla Highway",146.98,-0.6,"123.0","FM"],["N7WRQ",47.5734,-117.0817,"Spokane",147.38,0.6,"100.0","FM"],["N7WRR",48.1813,-117.99,"Chewelah",147.36,0.6,"","FM"],["VE7KTV",49.9671,-119.5308,"Kelowna",147.3,0.6,"88.5","FM"],["W7BFI",48.6104,-116.258,"Bonners Ferry, ID",146.96,-0.6,"123.0","FM"],["K7ID",47.6219,-116.9883,"Post Falls, ID",146.98,-0.6,"127.3","FM"],["KC7ODP",47.621,-116.9886,"Post Falls, ID",147.08,0.6,"100.0","FM"],["KB6UMY",47.6596,-116.9623,"Post Falls, ID",147.28,0.6,"100.0","FM"],["W7POC",48.2091,-117.0837,"Newport",145.47,-0.6,"100.0","FM"],["K7JEP",48.0788,-116.9535,"Sandpoint, ID",145.49,-0.6,"136.5","FM"],["N7KAM",48.5148,-116.8025,"Bonners Ferry",145.41,-0.6,"77.0","FM"],["W7P0C",48.3531,-117.3601,"Cusick",147.14,0.6,"100.0","FM"],["W7P0C",48.7456,-117.3676,"Ione",145.63,-0.6,"100.0","FM"],["W7P0C",48.1521,-117.2004,"Newport",146.9,-0.6,"100.0","FM"],["W7P0C",48.1473,-117.1997,"Newport",442.275,5,"100.0","D-STAR/FM"],["K7BNR",48.3343,-116.6892,"Sandpoint, ID",442.5,5,"131.8","FM"],["WR7VHF",47.9213,-117.1141,"Spokane",444.6,5,"123.0","FM"],["K7JEP",48.0788,-116.9535,"Priest River, ID",444.55,5,"100.0","FM"],["N7IRG",47.6602,-116.963,"Post Falls, ID",442.95,5,"100.0","FM"],["VE7RSS",50.3519,-119.0614,"Vernon",146.88,-0.6,"123.0","FM"],["VE7EGO",50.2586,-119.3033,"Vernon",147.38,0.6,"123.0","YSF/FM"],["VE7EGO",50.2519,-119.283,"Vernon",442.5,5,"123.0","YSF/FM"],["VE7SMT",49.8749,-118.368,"Edgewood",146.74,-0.6,"123.0","FM"],["VE7SMT",49.8749,-118.368,"Edgewood",449.25,-5,"110.9","FM"],["W7TRF",47.6066,-117.2023,"Spokane Valley",443.475,5,"100.0","FM"],["W7TRF",47.6205,-117.1805,"Spokane Valley",145.21,-0.6,"100.0","FM"],["VE7ROW",49.7122,-119.5308,"Kelowna",147,0.6,"88.5","FM"],["KB7ARA",48.1813,-117.99,"Chewelah",223.9,0.6,"","FM"],["WA7DRE B",47.6949,-117.3349,"Spokane",443.125,5,"","D-STAR"],["WA7DRE",47.6817,-117.3955,"Spokane",145.15,-0.6,"","YSF"],["W7CDP",47.7432,-117.8316,"Reardan",442.575,5,"100.0","D-STAR/FM"],["N7GWW",47.9683,-118.9711,"Coulee Dam",449.25,-5,"136.5","FM"],["VA7CNN",49.8765,-119.3074,"Kelowna",147.36,0.6,"88.5","FM"],["VA7JPL",49.7122,-119.6084,"Kelowna",447.3,-5,"88.5","FM"],["WA7FUN",47.7882,-117.348,"Mead",147.26,0.6,"91.5","FM"],["WA7FUN",47.6205,-117.5983,"West Plains-Airway Heights",146.97,-0.6,"91.5","FM"]];
    var ASWS=[["2B08P","St. Leon Creek",50.434,-117.701,1800],["2B10P","Fauquier Water Treatment Pla",49.864,-118.074,519],["2C09Q","Morrissey Ridge",49.447,-114.975,1860],["2C10P","Moyie Mountain",49.252,-115.774,1835],["2C14P","Floe Lake",51.06,-116.137,2090],["2C17AP","Thunder Creek",50.161,-115.267,1599],["2C21P","Fernie",49.488,-115.073,988],["2C23P","Flathead 2",49.079,-114.537,1317],["2C24P","Marion",51.042,-116.364,1300],["2D05P","Gray Creek Lower",49.611,-116.679,1650],["2D07AP","Duncan Lake Dam 2",50.239,-116.971,559],["2D08P","East Creek",50.64,-116.93,2030],["2D10P","Gray Creek Upper",49.617,-116.659,1930],["2D14P","Redfish Creek",49.69,-117.087,2100],["2D15P","Kaslo Airport",49.904,-116.928,717],["2D16P","New Denver East",49.997,-117.358,653],["2E07P","Grano Creek",49.552,-118.677,1870],["2E08P","Beaverdell",49.456,-119.089,807],["2F01AP","Trout Creek West",49.74,-120.189,1420],["2F03AP","McCulloch",49.767,-119.124,1245],["2F05P","Mission Creek",49.945,-118.95,1780],["2F08P","Greyback Reservoir",49.616,-119.423,1550],["2F09P","Whiterocks Mountain",50.017,-119.746,1800],["2F10P","Silver Star Mountain",50.371,-119.062,1840],["2F18P","Brenda Mine",49.862,-119.982,1460],["2F19P","Oyama Lake",50.116,-119.279,1360],["2F26P","Ellis Creek",49.413,-119.383,1540],["2G03P","Blackwall Peak",49.094,-120.772,1940],["2G06P","Hamilton Hill",49.499,-120.794,1480],["1C29P","Shovelnose Mountain",49.856,-120.863,1460],["1C44P","Paradise Lake",49.949,-120.282,1640],["1C45P","July Mountain",49.708,-121.085,1860],["1D09P","Wahleach Lake",49.233,-121.58,1480],["1D17P","Chilliwack River",49.032,-121.712,1620],["1F03P","Park Mountain",50.45,-118.619,1890],["1F04P","Enderby",50.653,-118.927,1950],["2A06P","Mount Revelstoke",51.036,-118.152,1850],["2A33P","Conrad Glacier",50.812,-116.94,2599],["2A36P","Toby Hub",50.513,-116.055,894],["2B02AP","Farron",49.27,-118.13,1230],["2B06P","Barnes Creek",50.069,-118.351,1620]];
    var BCST=[['CBC Radio One','CBTK-FM-2','107.3 FM','Grand Forks',49.03,-118.44],['CBC Radio One','CBRO-FM','88.5 FM','Christina Lake',49.04,-118.21],['CBC Radio One','CBYR-FM','94.1 FM','Rock Creek',49.05,-119.0],['CBC Radio One','CBTA-FM','94.9 FM','Trail',49.1,-117.71],['CBC Radio One','CBYN-FM','98.7 FM','Nelson',49.49,-117.29],['CBC Radio One','CBUB-FM','95.3 FM','Osoyoos',49.03,-119.47],['CBC Radio One','CBTP-FM','93.7 FM','Penticton',49.49,-119.59],['CBC Radio One','CBTK-FM','88.9 FM','Kelowna',49.89,-119.5],['CBC Radio One','CBRG-FM','93.1 FM','Princeton',49.46,-120.51],['NOAA Weather Radio','WXL86','162.400 MHz','Spokane, WA',47.66,-117.43],['NOAA Weather Radio','WWF49','162.525 MHz','Tunk Mtn (Okanogan), WA',48.56,-119.47],['NOAA Weather Radio','WXM48','162.475 MHz','Wenatchee, WA',47.42,-120.31]];
    var SDR=[['Methow Valley ARC · Winthrop, WA',48.519,-120.223,'http://mvarc.proxy.kiwisdr.com'],['Methow Valley Radio #2 · Twisp, WA',48.36,-120.116,'http://mvr2.proxy.kiwisdr.com'],['K7LEN · Worley, ID',47.37,-116.89,'http://k7len.proxy.kiwisdr.com'],['EurekaSDR · NW Montana',48.874,-114.933,'http://sdr.eurekasdr.org:8073'],['Lake Chelan ARC · McNeil',47.85,-119.87,'http://k7abj.proxy.kiwisdr.com'],['Burnaby, BC',49.22,-123.0,'http://21264.proxy.kiwisdr.com'],['College Place, WA',46.031,-118.373,'http://22959.proxy.kiwisdr.com'],['Univ. of Twente WebSDR · Netherlands',52.24,6.85,'http://websdr.ewi.utwente.nl:8901/']];
    var sh=document.getElementById('prepsheet'), ttl=document.getElementById('preptitle'), tabsEl=document.getElementById('preptabs'), body=document.getElementById('prepbody'), tb=document.getElementById('toolbtn');
    var vt=0, cur=null, curTab=0;
    function km(a,b,c,d){ return distNm(a,b,c,d)*1.852 }
    function kmTxt(k){ return k<10?k.toFixed(1)+' km':Math.round(k)+' km' }
    function ago(ms){ var m=Math.round((Date.now()-ms)/60000); return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago' }
    function tC(c){ if(typeof c!=='number'||!isFinite(c)) return '—'; return (typeof tcfg!=='undefined'&&tcfg==='F')?Math.round(c*9/5+32)+'°F':Math.round(c)+'°C' }
    function link(u){ u=String(u||''); return /^https?:\/\/[^\s"<>]{3,400}$/.test(u)?u:'' }
    function J(u){ return fetch(u).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json() }) }
    var relayOld=false; function T(u){ return fetch(u).then(function(r){ if(!r.ok){ if(r.status===403&&relay&&u.indexOf(relay)===0) relayOld=true; throw new Error(r.status) } return r.text() }) }
    // small saved copies so each screen still shows the last data with no signal
    function cached(k,ttlMin,fn){ var c=null; try{ c=JSON.parse(localStorage.getItem('sky-p-'+k)||'null') }catch(e){}
      if(c&&Date.now()-c.at<ttlMin*60000) return Promise.resolve({d:c.d,at:c.at});
      return Promise.resolve().then(fn).then(function(d){ if(d==null) throw new Error('empty'); try{ localStorage.setItem('sky-p-'+k,JSON.stringify({at:Date.now(),d:d})) }catch(e){} return {d:d,at:Date.now()} })
        .catch(function(){ return c?{d:c.d,at:c.at,stale:true}:null }) }
    function tile(lbl,val,sub,col){ return '<div class="ptile"'+(col?' style="box-shadow:inset 0 -3px 0 '+col+'"':'')+'><small>'+lbl+'</small><b>'+val+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div>' }
    function sec(h,inner){ return '<div class="ssec"><h4>'+h+'</h4>'+inner+'</div>' }
    function when(r){ return r?(r.stale?'<span style="color:#fb8c00">Offline copy · '+ago(r.at)+'</span>':'Updated '+ago(r.at)):'' }
    function spark(vals,col){ vals=(vals||[]).filter(function(v){return typeof v==='number'&&isFinite(v)}); if(vals.length<2) return ''; var mn=Math.min.apply(null,vals), mx=Math.max.apply(null,vals), w=100, h=22, rg=(mx-mn)||1;
      return '<svg class="pspark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" aria-hidden="true"><polyline fill="none" stroke="'+(col||'var(--accent)')+'" stroke-width="1.6" vector-effect="non-scaling-stroke" points="'+vals.map(function(v,i){return (i*w/(vals.length-1)).toFixed(1)+','+(h-1-(v-mn)/rg*(h-2)).toFixed(1)}).join(' ')+'"/></svg>' }
    function lvl(txt,col){ return '<span class="firepill" style="margin:0;background:'+col+'">'+txt+'</span>' }
    function needRelay(){ return sec('Needs your relay update','This part reads data that only your relay can fetch. Update the relay to version 6 (one copy and paste in Cloudflare), then come back.') }
    var GREEN='#43a047', AMBER='#fb8c00', RED='#e53935', PURPLE='#8e24aa';

    // ---------- tools menu ----------
    function setTools(v){ document.body.classList.toggle('toolon',v); tb.setAttribute('aria-expanded',v?'true':'false'); if(v) document.body.classList.remove('menuon','keyon') }
    tb.onclick=function(){ document.body.classList.remove('tuton'); setTools(!document.body.classList.contains('toolon')) };
    var mbx=document.getElementById('menubtn'); if(mbx) mbx.addEventListener('click',function(){ setTools(false) });
    map.on('click dragstart',function(){ setTools(false) });
    document.getElementById('t_sled').onclick=function(){ setTools(false); open('sled',0) };
    document.getElementById('t_supply').onclick=function(){ setTools(false); open('supply',0) };
    document.getElementById('t_planet').onclick=function(){ setTools(false); open('planet',0) };
    document.getElementById('t_comms').onclick=function(){ setTools(false); open('comms',0) };
    var trs=document.getElementById('t_rescue'); if(trs) trs.onclick=function(){ setTools(false); open('rescue',0) };
    document.getElementById('prepx').onclick=function(){ sh.hidden=true; vt++ };
    sh.onclick=function(e){ if(e.target===sh){ sh.hidden=true; vt++ } };
    var MODS={
      sled:{t:'🛷 Mountain sledder',tabs:['Snow','Slopes','Zones','Safety'],r:[sledSnow,sledSlopes,sledZones,sledSafety]},
      supply:{t:'🚢 Supply chain',tabs:['Ports','Fuel','Closures'],r:[supPorts,supFuel,supClose]},
      planet:{t:'☄️ Planetary threats',tabs:['Solar','Radiation','Asteroids'],r:[plSolar,plRad,plNeo]},
      comms:{t:'📻 Off-grid comms',tabs:['HF bands','Broadcast','Repeaters','SDR'],r:[cmHF,cmBcst,cmRep,cmSdr]},
      rescue:{t:'🆘 Rescue & signal',tabs:['Rescue card','Signal','First aid'],r:[rsCard,rsSignal,rsAid]}};
    function open(k,tab){ var m=MODS[k]; cur=k; curTab=tab||0; vt++; ttl.textContent=m.t;
      tabsEl.innerHTML=m.tabs.map(function(t,i){ return '<button class="ptab'+(i===curTab?' on':'')+'" data-i="'+i+'" aria-pressed="'+(i===curTab)+'">'+t+'</button>' }).join('');
      [].forEach.call(tabsEl.children,function(b){ b.onclick=function(){ open(k,+b.getAttribute('data-i')) } });
      sh.hidden=false; body.innerHTML='<div class="ssec">Loading…</div>'; m.r[curTab](vt) }
    function put(t,h){ if(t===vt&&!sh.hidden) body.innerHTML=h; return t===vt }

    // ================= 1. MOUNTAIN SLEDDER =================
    function alpine(){ var u='https://api.open-meteo.com/v1/forecast?latitude='+me.lat.toFixed(2)+'&longitude='+me.lon.toFixed(2)+'&hourly=temperature_2m,temperature_850hPa,wind_speed_700hPa,wind_direction_700hPa,snowfall&past_days=1&forecast_days=1&timezone=auto';
      return cached('alp'+me.lat.toFixed(1)+me.lon.toFixed(1),30,function(){ return J(u).then(function(j){ var h=j.hourly||{}, off=(j.utc_offset_seconds||0)*1000, now=Date.now(), i0=0;
        (h.time||[]).forEach(function(s,i){ if(Date.parse(s+'Z')-off<=now) i0=i });
        var wmax=0, wdir=0, sn=0; for(var i=Math.max(0,i0-24);i<=Math.min((h.time||[]).length-1,i0+12);i++){ var w=+h.wind_speed_700hPa[i]||0; if(w>wmax){ wmax=w; wdir=+h.wind_direction_700hPa[i]||0 } if(i<=i0&&i>i0-24) sn+=+h.snowfall[i]||0 }
        return {wmax:Math.round(wmax),wdir:Math.round(wdir),t2:h.temperature_2m[i0],t850:h.temperature_850hPa[i0],sn:Math.round(sn)} }) }) }
    function dirTxt(d){ return ['N','NE','E','SE','S','SW','W','NW'][Math.round(d/45)%8] }
    function snotel(){ return cached('snst',7*1440,function(){ return J('https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/stations?stationTriplets=*:WA:SNTL,*:ID:SNTL,*:MT:SNTL&returnForecastPointMetadata=false&returnReservoirMetadata=false&returnStationElements=false').then(function(a){
        return a.filter(function(s){ return s.latitude&&(!s.endDate||s.endDate>'2100') }).map(function(s){ return [s.stationTriplet,s.name,+s.latitude.toFixed(3),+s.longitude.toFixed(3),Math.round((s.elevation||0)*0.3048)] }) }) })
      .then(function(r){ if(!r) return []; var near=r.d.map(function(s){ return s.concat([km(me.lat,me.lon,s[2],s[3])]) }).filter(function(s){ return s[5]<250 }).sort(function(a,b){return a[5]-b[5]}).slice(0,4); if(!near.length) return [];
        var d0=new Date(Date.now()-2*86400000).toISOString().slice(0,10), d1=new Date(Date.now()+86400000).toISOString().slice(0,10);
        return cached('sntl'+near.map(function(s){return s[0]}).join('').slice(0,40),30,function(){ return J('https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?stationTriplets='+near.map(function(s){return s[0]}).join(',')+'&elements=SNWD,TOBS&duration=HOURLY&beginDate='+d0+'&endDate='+d1).then(function(a){
          return near.map(function(s){ var st=(a||[]).filter(function(x){return x.stationTriplet===s[0]})[0]||{}, out={n:s[1],src:'US',el:s[4],k:s[5]};
            (st.data||[]).forEach(function(e){ var v=(e.values||[]).filter(function(x){return typeof x.value==='number'}); if(!v.length) return; var last=v[v.length-1].value, prev=v.length>24?v[v.length-25].value:null;
              if(e.stationElement.elementCode==='SNWD'){ out.d=Math.round(last*2.54); if(prev!=null) out.dd=Math.round((last-prev)*2.54) } else if(e.stationElement.elementCode==='TOBS') out.t=(last-32)*5/9 }); return out }) }) }) .then(function(x){ return x?{list:x.d,at:x.at,stale:x.stale}:[] }) }) }
    function aswsBC(){ if(!relay) return Promise.resolve({relay:false});
      var near=ASWS.map(function(s){ return s.concat([km(me.lat,me.lon,s[2],s[3])]) }).filter(function(s){ return s[5]<250 }).sort(function(a,b){return a[5]-b[5]}).slice(0,4); if(!near.length) return Promise.resolve({list:[]});
      return cached('asws'+near.map(function(s){return s[0]}).join(''),30,function(){ var B='https://www.env.gov.bc.ca/wsd/data_searches/snow/asws/data/';
        return Promise.all([T(viaRelay(B+'SD.csv')),T(viaRelay(B+'TA.csv')).catch(function(){return ''})]).then(function(rs){
          function grab(txt){ var L=String(txt||'').split(/\r?\n/).filter(Boolean); if(L.length<3) return {}; var hd=L[0].split(','), o={};
            near.forEach(function(s){ var ci=-1; hd.forEach(function(h,i){ if(h.trim().split(' ')[0]===s[0]) ci=i }); if(ci<0) return; var last=null, li=-1;
              for(var i=L.length-1;i>0&&i>L.length-80;i--){ var v=parseFloat(L[i].split(',')[ci]); if(isFinite(v)){ last=v; li=i; break } }
              var prev=null; if(li>25){ for(var k=li-24;k>li-34&&k>0;k--){ var p=parseFloat(L[k].split(',')[ci]); if(isFinite(p)){ prev=p; break } } }
              o[s[0]]={v:last,p:prev} }); return o }
          var sd=grab(rs[0]), ta=grab(rs[1]); if(!Object.keys(sd).length) return null;
          return near.map(function(s){ var a=sd[s[0]]||{}, b=ta[s[0]]||{}; return {n:s[1],src:'BC',el:s[4],k:s[5],d:a.v!=null?Math.round(a.v):null,dd:(a.v!=null&&a.p!=null)?Math.round(a.v-a.p):null,t:b.v} }) }) })
        .then(function(x){ return x?{list:x.d,at:x.at,stale:x.stale}:{list:[],fail:true} }) }
    // ski hills: snow depth, new snow and coming snow from the Open-Meteo model at each hill (hills don't share their own reports)
    var SKI=[["Phoenix Mountain",49.109,-118.587],["Baldy Mountain",49.151,-119.235],["RED Mountain",49.106,-117.846],["Whitewater",49.441,-117.163],["Big White",49.738,-118.946],["Apex Mountain",49.384,-119.911],["Salmo Ski Hill",49.186,-117.299],["Silver Star",50.369,-119.049],["Sun Peaks",50.878,-119.88],["Harper Mountain",50.722,-120.132],["Summit Lake",50.143,-117.615],["Kimberley",49.688,-116.029],["Fernie",49.456,-115.102],["Panorama",50.442,-116.212],["Fairmont",50.33,-115.83],["Kicking Horse",51.298,-117.05],["Revelstoke",50.969,-118.109],["Castle Mountain",49.309,-114.425],["Pass Powderkeg",49.602,-114.449],["Whistler Blackcomb",50.081,-122.963],["Manning Park",49.08,-120.917],["Sasquatch Mountain",49.384,-121.939],["Mount Seymour",49.393,-122.944],["Cypress Mountain",49.398,-123.201],["Grouse Mountain",49.379,-123.077],["Mount Washington",49.751,-125.302],["Mount Cain",50.229,-126.326],["Mount Timothy",51.904,-121.261],["Troll Resort",53.066,-121.942],["Hart Highland",53.975,-122.775],["Tabor Mountain",53.913,-122.453],["Purden",53.9,-121.885],["Powder King",55.37,-122.628],["Murray Ridge",54.517,-124.21],["Hudson Bay Mountain",54.775,-127.251],["Shames Mountain",54.493,-128.966],["Bear Mtn (Dawson Cr)",55.712,-120.263],["Marmot Basin",52.795,-118.106],["Lake Louise",51.442,-116.162],["Sunshine Village",51.09,-115.762],["Mt Norquay",51.201,-115.634],["Nakiska",50.942,-115.151],["49 Degrees North",48.302,-117.565],["Mt Spokane",47.922,-117.095],["Schweitzer",48.379,-116.613],["Silver Mountain",47.521,-116.126],["Lookout Pass",47.456,-115.698],["Loup Loup",48.392,-119.918],["Mission Ridge",47.293,-120.399],["Mt Baker",48.862,-121.654]];
    function skiHills(){ var near=SKI.map(function(s){ return s.concat([km(me.lat,me.lon,s[1],s[2])]) }).filter(function(s){ return s[3]<250 }).sort(function(a,b){return a[3]-b[3]}).slice(0,5); if(!near.length) return Promise.resolve([]);
      return cached('ski'+near.map(function(s){return s[0].slice(0,3)}).join(''),60,function(){ return J('https://api.open-meteo.com/v1/forecast?latitude='+near.map(function(s){return s[1]}).join(',')+'&longitude='+near.map(function(s){return s[2]}).join(',')+'&hourly=snow_depth,snowfall&past_days=1&forecast_days=3&timezone=GMT').then(function(j){ var a=Array.isArray(j)?j:[j];
        return near.map(function(s,i){ var h=(a[i]||{}).hourly||{}, tt=h.time||[], now=Date.now(), i0=0, p=0, f=0, k; tt.forEach(function(x,q){ if(Date.parse(x+'Z')<=now) i0=q });
          for(k=Math.max(0,i0-23);k<=i0;k++) p+=+(h.snowfall||[])[k]||0; for(k=i0+1;k<=Math.min(tt.length-1,i0+48);k++) f+=+(h.snowfall||[])[k]||0; var d=(h.snow_depth||[])[i0];
          return {n:s[0],k:s[3],d:typeof d==='number'?Math.round(d*100):null,p:Math.round(p),f:Math.round(f)} }) }) }).then(function(x){ return (x&&x.d)||[] }) }
    function sledSnow(t){ Promise.all([alpine(),snotel().catch(function(){return []}),aswsBC().catch(function(){return {list:[],fail:true}}),skiHills().catch(function(){return []})]).then(function(rs){
        var a=rs[0]&&rs[0].d, h='<div class="ptiles">';
        if(a){ var sc=a.wmax>=50?['High',RED,'Strong winds strip ridges & load lee slopes']:a.wmax>=25?['Moderate',AMBER,'Wind loading likely on lee slopes']:['Low',GREEN,'Light winds up high'];
          var inv=(typeof a.t850==='number'&&typeof a.t2==='number'&&a.t850-a.t2>=1);
          h+=tile('Ridge wind (~3,000 m)',a.wmax+' <small>km/h</small>','from '+dirTxt(a.wdir)+' · max, ±12 h')+tile('Wind scour',sc[0],sc[2],sc[1])+tile('Inversion',inv?'Yes':'No',tC(a.t850)+' at 1,500 m vs '+tC(a.t2)+' here',inv?AMBER:GREEN);
        } else h+=tile('Mountain weather','—','No data yet');
        h+='</div>';
        var list=[].concat((rs[1]&&rs[1].list)||[],(rs[2]&&rs[2].list)||[]).sort(function(x,y){return x.k-y.k}).slice(0,6);
        var rows=list.map(function(s){ return '<div class="row2 prow2"><span><b>'+esc(s.n)+'</b> <small>'+s.src+' · '+s.el.toLocaleString()+' m · '+kmTxt(s.k)+'</small></span><span>'+(s.d!=null?'<b>'+s.d+' cm</b>':'—')+(s.dd?' <small style="color:'+(s.dd>0?'#42a5f5':AMBER)+'">'+(s.dd>0?'▲':'▼')+Math.abs(s.dd)+' cm/24h</small>':'')+(typeof s.t==='number'?' · '+tC(s.t):'')+'</span></div>' }).join('');
        var miss=(rs[2]&&rs[2].relay===false)?'<small style="display:block;margin-top:4px">BC stations need your relay update (v6).</small>':(rs[2]&&rs[2].fail?'<small style="display:block;margin-top:4px">'+(relayOld?'BC stations need your relay update (v6).':'BC stations unavailable right now.')+'</small>':'');
        h+=sec('Snow stations near you',(rows||'No stations within 250 km.')+miss);
        var sk=rs[3]||[]; if(sk.length) h+=sec('Ski hills near you',sk.map(function(s){ return '<div class="row2 prow2"><span><b>'+esc(s.n)+'</b> <small>'+kmTxt(s.k)+'</small></span><span>'+(s.d!=null?'<b>~'+s.d+' cm</b>':'—')+' <small>'+(s.p?'<span style="color:#42a5f5">+'+s.p+' new</span>':'0 new')+(s.f?' · +'+s.f+' coming':'')+'</small></span></div>' }).join('')+'<small style="display:block;margin-top:4px">Model estimate (Open-Meteo), not the hill\'s own report. New = last 24 h, coming = next 48 h.</small>');
        h+='<div class="skynote">Stations: BC River Forecast Centre & USDA SNOTEL · Ridge wind & inversion: Open-Meteo model'+(rs[0]?' · '+when(rs[0]):'')+'</div>';
        put(t,h) }) }
    // slope-angle overlay computed on the phone from free terrain tiles
    var slopeLayer=null, slopeCache={}, slopeKeys=[];
    function slopeCanvas(z,x,y){ var k=z+'/'+x+'/'+y; if(slopeCache[k]) return slopeCache[k];
      var p=fetch('https://s3.amazonaws.com/elevation-tiles-prod/terrarium/'+k+'.png').then(function(r){ return r.ok?r.blob():null }).then(function(b){ return b?createImageBitmap(b):null }).then(function(im){ if(!im) return null;
        var c=document.createElement('canvas'); c.width=c.height=256; var g=c.getContext('2d'); g.drawImage(im,0,0); var src=g.getImageData(0,0,256,256), d=src.data, E=new Float32Array(65536);
        for(var i=0;i<65536;i++) E[i]=d[i*4]*256+d[i*4+1]+d[i*4+2]/256-32768;
        var lat=Math.atan(Math.sinh(Math.PI*(1-2*(y+.5)/Math.pow(2,z))))*180/Math.PI, res=156543.03*Math.cos(lat*Math.PI/180)/Math.pow(2,z), out=g.createImageData(256,256), o=out.data;
        for(var yy=0;yy<256;yy++) for(var xx=0;xx<256;xx++){ var xl=xx?xx-1:0, xr=xx<255?xx+1:255, yu=yy?yy-1:0, yd=yy<255?yy+1:255;
          var dx=(E[yy*256+xr]-E[yy*256+xl])/((xr-xl)*res), dy=(E[yd*256+xx]-E[yu*256+xx])/((yd-yu)*res), s=Math.atan(Math.sqrt(dx*dx+dy*dy))*57.2958, j=(yy*256+xx)*4, c3=null;
          if(s>=45) c3=[142,36,170,150]; else if(s>=35) c3=[229,57,53,155]; else if(s>=30) c3=[251,140,0,145]; else if(s>=27) c3=[253,216,53,110];
          if(c3){ o[j]=c3[0]; o[j+1]=c3[1]; o[j+2]=c3[2]; o[j+3]=c3[3] } }
        g.putImageData(out,0,0); return c }).catch(function(){ return null });
      slopeCache[k]=p; slopeKeys.push(k); if(slopeKeys.length>60) delete slopeCache[slopeKeys.shift()]; return p }
    var SlopeLayer=L.GridLayer.extend({createTile:function(c,done){ var tile=document.createElement('canvas'); tile.width=tile.height=256; var z=c.z, s=Math.min(z,14), f=Math.pow(2,z-s), sx=Math.floor(c.x/f), sy=Math.floor(c.y/f);
      slopeCanvas(s,sx,sy).then(function(cv){ if(cv){ var g=tile.getContext('2d'); g.imageSmoothingEnabled=false; var w=256/f; g.drawImage(cv,(c.x-sx*f)*w,(c.y-sy*f)*w,w,w,0,0,256,256) } done(null,tile) }); return tile }});
    function setSlope(v){ if(v&&!slopeLayer){ slopeLayer=new SlopeLayer({minZoom:11,maxZoom:19,opacity:.85,zIndex:450,attribution:'Slopes from terrain tiles (Mapzen/AWS)'}).addTo(map) } else if(!v&&slopeLayer){ map.removeLayer(slopeLayer); slopeLayer=null } }
    function sledSlopes(t){ var on=!!slopeLayer;
      put(t,sec('Avalanche slope angles','Colours every slope that is steep enough to avalanche. Most slab avalanches start on <b>30–45°</b> slopes, and you can trigger them from flatter ground below.'+
        '<div class="plegend"><span style="background:#fdd835">27–30°</span><span style="background:#fb8c00">30–35°</span><span style="background:#e53935;color:#fff">35–45°</span><span style="background:#8e24aa;color:#fff">45°+</span></div>')+
        '<button class="ltbtn2 pacc" id="slbtn">'+(on?'Hide slope colours':'Show slope colours on the map')+'</button>'+
        sec('Good to know','Works when zoomed in close (zoom 11+). Made on your phone from 30 m terrain data, so small rolls and cornices won’t show. It knows nothing about the snowpack: check the avalanche forecast before you ride.'));
      document.getElementById('slbtn').onclick=function(){ setSlope(!slopeLayer); if(slopeLayer){ sh.hidden=true; vt++; if(map.getZoom()<12) map.setZoom(12) } else sledSlopes(vt) } }
    // riding zones & closures: BC government (DataBC) data saved in sled-zones.json
    var zD=null, zP=null, zR=(function(){ var r=map.getRenderer(L.polyline([[0,0],[0,0]])); r.options.tolerance=Math.max(r.options.tolerance||0,6); return r })(), zG=L.layerGroup(), zPts=L.layerGroup(), zLay={}, zOn=false, zAlert=true, zIn={}, zNear={}, zMv=null, zWarnEl=null;
    try{ zAlert=localStorage.getItem('sky-zalert')!=='0' }catch(e){}
    var ZST={c:['Snowmobile closure',RED,1],c2:['Closed to sleds (club agreement)',RED,1],mv:['Motor vehicle closure',AMBER,1],s58:['Motorized closure (rec order)','#f4511e',1],s58deep:['Sleds only on 0.5 m+ snow','#fdd835',0],o:['Open riding area',GREEN,0],l:['Open, limited','#c0ca33',0],a:['ATES-rated avalanche terrain',PURPLE,0],t:['Sled access trail','#1e88e5',0]};
    var MON={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
    function zDec(s){ var i=0, la=0, lo=0, out=[]; while(i<s.length){ var r=0, sh=0, b; do{ b=s.charCodeAt(i++)-63; r|=(b&31)<<sh; sh+=5 }while(b>=32); la+=(r&1)?~(r>>1):(r>>1); r=0; sh=0; do{ b=s.charCodeAt(i++)-63; r|=(b&31)<<sh; sh+=5 }while(b>=32); lo+=(r&1)?~(r>>1):(r>>1); out.push([la/1e4,lo/1e4]) } return out }
    // is the rule in force today? returns true (closed now), false (not today), null (no dates given)
    function zToday(w){ w=String(w||''); var m=/([A-Za-z]{3})[a-z]*\.? (\d{1,2}) (?:to|-) ([A-Za-z]{3})[a-z]*\.? (\d{1,2})/.exec(w); if(!m||MON[m[1].toLowerCase()]==null||MON[m[3].toLowerCase()]==null) return null;
      var d=new Date(), v=d.getMonth()*100+d.getDate(), a=MON[m[1].toLowerCase()]*100+(+m[2]), b=MON[m[3].toLowerCase()]*100+(+m[4]), inR=a<=b?(v>=a&&v<=b):(v>=a||v<=b);
      return /^(open|snowmobiles allowed)/i.test(w)?!inR:inR }
    function zClosed(f){ if(!ZST[f.k][2]&&f.k!=='s58deep') return false; var t=zToday(f.w); return t==null?true:t }
    function zStatus(f){ var s=ZST[f.k]; if(f.k==='o') return ['Open riding area',GREEN]; if(f.k==='l') return ['Open, with limits',s[1]]; if(f.k==='a') return ['Avalanche terrain rated (ATES)',PURPLE]; if(f.k==='t') return ['Sled access trail',s[1]];
      if(f.k==='s58deep') return zClosed(f)?['Sleds only on 0.5 m+ of snow',s[1]]:['Not in effect today',GREEN]; return zClosed(f)?['Closed to snowmobiles now',s[1]]:['Not in effect today','#78909c'] }
    function zLoad(){ if(zD) return Promise.resolve(zD); if(zP) return zP; zP=fetch('sled-zones.json').then(function(r){ if(!r.ok) throw new Error(r.status); return r.json() }).then(function(j){ if(!j||!Array.isArray(j.f)) throw new Error('bad'); zD=j; return j }).catch(function(e){ zP=null; throw e }); return zP }
    function zPolys(f){ if(f._ll) return f._ll; f._ll=f.l?f.g.map(zDec):f.g.map(function(p){ return p.map(zDec) }); return f._ll }
    function zPop(f){ var st=zStatus(f), h='<b>'+esc(f.n||ZST[f.k][0])+'</b><br><span style="color:'+st[1]+';font-weight:600">'+esc(st[0])+'</span>';
      if(f.t) h+='<br><small>'+esc(f.t)+'</small>'; if(f.w&&f.w!=='Open') h+='<br><small>'+esc(f.w)+'</small>'; if(f.x) h+='<br><small>Allowed: '+esc(f.x)+'</small>';
      if(f.k==='mv') h+='<br><small>Includes snowmobiles unless the official entry allows them.</small>'; if(f.k==='a') h+='<br><small>Terrain ratings: <a href="https://avalanche.ca/ates" target="_blank" rel="noopener">avalanche.ca</a></small>';
      if(f.m) h+='<br><small>Map '+esc(f.m)+'</small>'; return h+'<br><small><a href="https://www2.gov.bc.ca/gov/content/sports-culture/recreation/motor-vehicle-prohibitions/snowmobiling-in-bc/snowmobile-closures" target="_blank" rel="noopener">Official closure maps ›</a></small>' }
    function zStyle(f){ var c=ZST[f.k][1], on=zClosed(f); if(f.k==='t') return {color:c,weight:3,opacity:.9,dashArray:'6,4',renderer:zR,interactive:false};
      if(f.k==='a') return {color:c,weight:2,opacity:.9,fill:true,fillOpacity:.06,dashArray:'2,5',renderer:zR,interactive:false};
      if(ZST[f.k][2]&&!on) return {color:'#90a4ae',weight:1.5,opacity:.9,dashArray:'5,5',fillOpacity:.05,renderer:zR,interactive:false};
      return {color:c,weight:2,opacity:.95,fillColor:c,fillOpacity:ZST[f.k][2]?.28:.16,renderer:zR,interactive:false} }
    function zDraw(){ if(!zOn||!zD) return; var z=map.getZoom(), b=map.getBounds().pad(.25), w=b.getWest(), e=b.getEast(), s=b.getSouth(), n=b.getNorth();
      zD.f.forEach(function(f,i){ var vis=z>=7&&f.b[0]<e&&f.b[2]>w&&f.b[1]<n&&f.b[3]>s, l=zLay[i];
        if(vis&&!l){ var ll=zPolys(f); l=zLay[i]=(f.l?L.polyline(ll,zStyle(f)):L.polygon(ll,zStyle(f))); l._zf=f; zG.addLayer(l) }
        else if(!vis&&l){ zG.removeLayer(l); delete zLay[i] } });
      zPts.clearLayers(); if(z>=9) (zD.p||[]).forEach(function(p){ if(p[0]<s||p[0]>n||p[1]<w||p[1]>e) return; var ic=p[2]==='h'?['🛖','Cabin / warming hut','#6d4c41']:p[2]==='p'?['🅿️','Sled staging & parking','#1565c0']:['❄️','Snowmobile rec site','#0277bd'];
        L.marker([p[0],p[1]],{icon:L.divIcon({className:'',html:'<span class="firemk" role="img" aria-label="'+esc(ic[1])+'" style="--c:'+ic[2]+';--sz:24px">'+ic[0]+'</span>',iconSize:[0,0]}),keyboard:false,zIndexOffset:-160,title:p[3]})
          .bindPopup('<b>'+esc(p[3])+'</b><br>'+esc(ic[1])+(p[4]?'<br><small>Near '+esc(p[4].toLowerCase().replace(/\b[a-z]/g,function(c){return c.toUpperCase()}))+'</small>':'')+(p[5]?'<br><small style="color:#fb8c00">'+esc(p[5])+'</small>':'')+'<br><small>Recreation Sites and Trails BC</small>',{closeButton:false}).addTo(zPts) }) }
    function setZones(v){ zOn=v; if(v){ zG.addTo(map); zPts.addTo(map); map.attributionControl.addAttribution('Sled zones: BC Gov (DataBC)'); zLoad().then(function(){ zDraw(); zCheck() }).catch(function(){}) }
      else { map.removeLayer(zG); map.removeLayer(zPts); zG.clearLayers(); zLay={}; map.attributionControl.removeAttribution('Sled zones: BC Gov (DataBC)') }
      try{ localStorage.setItem('sky-zones',v?'1':'0') }catch(e){} }
    map.on('moveend',function(){ if(!zOn) return; clearTimeout(zMv); zMv=setTimeout(zDraw,250) });
    // tap a zone: find what is under the finger (works on touch screens and a turned map)
    function zSeg(la,lo,pts){ var kx=111.32*Math.cos(la*Math.PI/180), ky=110.57, best=1e9; for(var i=1;i<pts.length;i++){ var ax=(pts[i-1][1]-lo)*kx, ay=(pts[i-1][0]-la)*ky, bx=(pts[i][1]-lo)*kx, by=(pts[i][0]-la)*ky, dx=bx-ax, dy=by-ay, L2=dx*dx+dy*dy, t=L2?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/L2)):0, ex=ax+t*dx, ey=ay+t*dy, d=Math.sqrt(ex*ex+ey*ey); if(d<best) best=d } return best }
    map.on('click',function(e){ if(!zOn||!zD||map.getZoom()<7) return; var la=e.latlng.lat, lo=e.latlng.lng, tol=16*40075*Math.cos(la*Math.PI/180)/(256*Math.pow(2,map.getZoom())), PR={t:0,c:1,c2:1,mv:2,s58:2,s58deep:3,l:4,o:4,a:5}, best=null, bp=99;
      Object.keys(zLay).forEach(function(i){ var f=zLay[i]._zf, m=tol/80; if(!f||PR[f.k]>=bp||la<f.b[1]-m||la>f.b[3]+m||lo<f.b[0]-m*1.6||lo>f.b[2]+m*1.6) return; var ll=zPolys(f), hit=false;
        if(f.l) hit=ll.some(function(p){ return zSeg(la,lo,p)<tol }); else hit=ll.some(function(p){ if(!zInRing(la,lo,p[0])) return false; for(var h=1;h<p.length;h++) if(zInRing(la,lo,p[h])) return false; return true });
        if(hit){ best=f; bp=PR[f.k] } });
      if(best) L.popup({closeButton:false,maxWidth:250,autoPanPadding:[20,70]}).setLatLng(e.latlng).setContent(zPop(best)).openOn(map) });
    // point in polygon + distance to edge (km)
    function zInRing(la,lo,r){ var c=false; for(var i=0,j=r.length-1;i<r.length;j=i++){ var yi=r[i][0], xi=r[i][1], yj=r[j][0], xj=r[j][1]; if(((yi>la)!==(yj>la))&&(lo<(xj-xi)*(la-yi)/(yj-yi)+xi)) c=!c } return c }
    function zEdge(la,lo,r){ var kx=111.32*Math.cos(la*Math.PI/180), ky=110.57, best=1e9; for(var i=0,j=r.length-1;i<r.length;j=i++){ var ax=(r[j][1]-lo)*kx, ay=(r[j][0]-la)*ky, bx=(r[i][1]-lo)*kx, by=(r[i][0]-la)*ky, dx=bx-ax, dy=by-ay, L2=dx*dx+dy*dy, t=L2?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/L2)):0, ex=ax+t*dx, ey=ay+t*dy, d=Math.sqrt(ex*ex+ey*ey); if(d<best) best=d } return best }
    function zWhere(la,lo){ var res=[]; if(!zD) return res; var m=0.02;
      zD.f.forEach(function(f){ if(f.l||!zClosed(f)||f.k==='s58deep') return; if(la<f.b[1]-m||la>f.b[3]+m||lo<f.b[0]-m*1.5||lo>f.b[2]+m*1.5) return;
        var ll=zPolys(f), inside=false, edge=1e9; ll.forEach(function(p){ var inP=zInRing(la,lo,p[0]); for(var h=1;h<p.length;h++) if(zInRing(la,lo,p[h])) inP=false; if(inP) inside=true; edge=Math.min(edge,zEdge(la,lo,p[0])) });
        if(inside||edge<0.5) res.push({f:f,inside:inside,km:edge}) }); return res }
    function zWarn(f,inside,kmv){ if(!zWarnEl){ zWarnEl=document.createElement('div'); zWarnEl.className='zwarn'; zWarnEl.setAttribute('role','alert'); document.body.appendChild(zWarnEl) }
      zWarnEl.innerHTML='<b>'+(inside?'⛔ You are in a snowmobile closure':'⚠️ Closure ahead, '+Math.max(50,Math.round(kmv*1000/50)*50)+' m away')+'</b><span>'+esc(f.n||'Closed area')+' · '+esc(zStatus(f)[0])+'</span><small>Fines apply under the Wildlife Act. Turn back the way you came.</small><button type="button">OK</button>';
      zWarnEl.hidden=false; zWarnEl.querySelector('button').onclick=function(){ zWarnEl.hidden=true };
      try{ if(navigator.vibrate) navigator.vibrate(inside?[300,120,300,120,300]:[200,100,200]) }catch(e){} }
    function zCheck(){ if(!zOn||!zAlert||!zD||me.label==='Grand Forks') return; var hits=zWhere(me.lat,me.lon), nowIn={}, nowNear={};
      hits.forEach(function(h){ var id=h.f.n+h.f.b.join(); if(h.inside){ nowIn[id]=1; if(!zIn[id]) zWarn(h.f,true,0) } else { nowNear[id]=1; if(!zNear[id]&&!zIn[id]) zWarn(h.f,false,h.km) } });
      zIn=nowIn; zNear=nowNear }
    setInterval(function(){ if(!document.hidden) zCheck() },15000);
    function sledZones(t){ put(t,'<div class="ssec">Loading BC closure maps…</div>');
      zLoad().then(function(){ var near=[], seen={}, la=me.lat, lo=me.lon;
        zD.f.forEach(function(f){ if(f.l||f.k==='a') return; var cx=(f.b[0]+f.b[2])/2, cy=(f.b[1]+f.b[3])/2; if(Math.abs(cy-la)>1.2||Math.abs(cx-lo)>1.8) return;
          var ll=zPolys(f), d=1e9, inside=false; ll.forEach(function(p){ if(zInRing(la,lo,p[0])) inside=true; d=Math.min(d,zEdge(la,lo,p[0])) }); var key=f.n+f.k; if(seen[key]&&seen[key].d<=d) return; seen[key]={f:f,d:inside?0:d} });
        Object.keys(seen).forEach(function(k){ if(seen[k].d<=100) near.push(seen[k]) }); near.sort(function(a,b){ return a.d-b.d });
        var here=zWhere(la,lo).filter(function(h){return h.inside}), h='';
        h+='<div class="ptiles">'+tile('Where you are',here.length?'In a closure':'Not in a closure',here.length?esc(here[0].f.n||''):(me.label==='Grand Forks'?'Turn on location for alerts':'Checked against '+zD.f.length+' areas'),here.length?RED:GREEN)+'</div>';
        h+='<button class="ltbtn2 pacc" id="zbtn">'+(zOn?'Hide zones on the map':'Show zones on the map')+'</button>';
        h+='<div class="row2" style="margin-top:6px"><span>Warn me when I ride into a closure</span><select id="zal" class="psel"><option value="1"'+(zAlert?' selected':'')+'>On</option><option value="0"'+(zAlert?'':' selected')+'>Off</option></select></div>';
        h+=sec('Nearest to you',near.length?near.slice(0,6).map(function(x){ var st=zStatus(x.f); return '<div class="row2 prow2"><span><b>'+esc(x.f.n||ZST[x.f.k][0])+'</b> <small style="color:'+st[1]+'">'+esc(st[0])+'</small></span><span>'+(x.d===0?'Here':kmTxt(x.d))+'</span></div>' }).join(''):'No sled closures or riding areas within 100 km.');
        h+=sec('Map key','<div class="zkey">'+['c','mv','s58','s58deep','o','l','t','a'].map(function(k){ return '<span><i style="background:'+ZST[k][1]+'"></i>'+ZST[k][0]+'</span>' }).join('')+'<span><i style="background:#90a4ae"></i>Closure not in effect today</span><span>🛖 Cabin · 🅿️ Staging · ❄️ Sled site</span></div>');
        h+='<div class="skynote">BC Government (DataBC): Wildlife Act closures, snowmobile management areas & trails, recreation orders, ATES areas, recreation sites · saved '+esc(zD.at||'')+'. Rules can change: check the <a href="https://www2.gov.bc.ca/gov/content/sports-culture/recreation/motor-vehicle-prohibitions/snowmobiling-in-bc/snowmobile-closures" target="_blank" rel="noopener">official closure maps</a> before you ride.</div>';
        if(!put(t,h)) return;
        document.getElementById('zbtn').onclick=function(){ setZones(!zOn); if(zOn){ sh.hidden=true; vt++; if(map.getZoom()<9) map.setZoom(9) } else sledZones(vt) };
        document.getElementById('zal').onchange=function(){ zAlert=this.value==='1'; try{ localStorage.setItem('sky-zalert',zAlert?'1':'0') }catch(e){} if(zAlert){ zIn={}; zNear={}; zCheck() } }
      }).catch(function(){ put(t,sec('Riding zones','Could not load the closure maps. Check your connection and try again.')) }) }
    try{ if(localStorage.getItem('sky-zones')==='1') setTimeout(function(){ setZones(true) },3000) }catch(e){}
    // offline spots: saved on the phone only
    var spotLayer=L.layerGroup().addTo(map), spotsOn=false, SPK={nosig:['📵','No signal','#546e7a'],sig:['📶','Had signal','#2e7d32'],cache:['🆘','Rescue cache','#e53935'],shelter:['🏠','Shelter / cabin','#6d4c41']};
    function spots(){ try{ var a=JSON.parse(localStorage.getItem('sky-spots')||'[]'); return Array.isArray(a)?a.filter(function(s){return s&&SPK[s.k]&&isFinite(s.lat)&&isFinite(s.lon)}):[] }catch(e){ return [] } }
    function saveSpots(a){ try{ localStorage.setItem('sky-spots',JSON.stringify(a.slice(-300))) }catch(e){} drawSpots() }
    function drawSpots(){ spotLayer.clearLayers(); if(!spotsOn) return; spots().forEach(function(s){ var k=SPK[s.k];
      L.marker([s.lat,s.lon],{icon:L.divIcon({className:'',html:'<span class="firemk" role="img" aria-label="'+esc(k[1])+'" style="--c:'+k[2]+';--sz:24px">'+k[0]+'</span>',iconSize:[0,0]}),keyboard:false,zIndexOffset:-150,title:k[1]}).bindPopup('<b>'+k[0]+' '+esc(k[1])+'</b><br>Saved '+esc(new Date(s.t).toLocaleDateString([], {month:'short',day:'numeric',year:'numeric'})),{closeButton:false}).addTo(spotLayer) }) }
    function sledSafety(t){ var all=spots().map(function(s,i){ return {s:s,i:i,k:km(me.lat,me.lon,s.lat,s.lon)} }).sort(function(a,b){return a.k-b.k});
      var h=sec('Save a spot <small style="text-transform:none;letter-spacing:0;font-weight:400">· kept on this phone, works with no signal</small>','<div class="pbtns"><button data-k="nosig">📵 No signal</button><button data-k="cache">🆘 Rescue cache</button><button data-k="shelter">🏠 Shelter</button></div>'+
        '<div class="row2" style="margin-top:6px"><span>Place it</span><select id="spwhere" class="psel"><option value="me">At my location</option><option value="map">At the map centre</option></select></div>');
      h+=sec('Your spots ('+all.length+')',all.length?all.slice(0,5).map(function(x){ var k=SPK[x.s.k]; return '<div class="row2 prow2"><span>'+k[0]+' '+esc(k[1])+' <small>'+esc(new Date(x.s.t).toLocaleDateString([], {month:'short',day:'numeric'}))+'</small></span><span>'+kmTxt(x.k)+' <button class="pdel" data-i="'+x.i+'" aria-label="Delete spot">✕</button></span></div>' }).join(''):'None yet. Mark dead zones and cache spots as you ride.');
      h+='<button class="ltbtn2" id="spshow">'+(spotsOn?'Hide my spots on the map':'Show my spots on the map')+'</button>';
      h+=sec('If something goes wrong','Call <b>911</b>. With no cell signal, many newer phones can text emergency services by satellite: learn how yours does it before you go. Always leave a trip plan with someone.');
      if(!put(t,h)) return;
      [].forEach.call(body.querySelectorAll('.pbtns button'),function(b){ b.onclick=function(){ var w=document.getElementById('spwhere').value, c=w==='map'?map.getCenter():{lat:me.lat,lng:me.lon}, a=spots(); a.push({k:b.getAttribute('data-k'),lat:+c.lat.toFixed(5),lon:+c.lng.toFixed(5),t:Date.now()}); spotsOn=true; saveSpots(a); try{ if(navigator.vibrate) navigator.vibrate(40) }catch(e){} sledSafety(vt) } });
      [].forEach.call(body.querySelectorAll('.pdel'),function(b){ b.onclick=function(){ var a=spots(); a.splice(+b.getAttribute('data-i'),1); saveSpots(a); sledSafety(vt) } });
      document.getElementById('spshow').onclick=function(){ spotsOn=!spotsOn; drawSpots(); sledSafety(vt) } }

    // ================= 2. SUPPLY CHAIN =================
    function gdelt(k,q,span,n){ if(!relay) return Promise.resolve({relay:false});
      var u='https://api.gdeltproject.org/api/v2/doc/doc?query='+encodeURIComponent(q)+'&mode=artlist&format=json&sort=datedesc&timespan='+span+'&maxrecords='+n;
      var REL={port:/\b(port|ports|terminal|ship|ships|shipping|vessel|vessels|cargo|container|rail|freight|grain|tanker|longshore|dock|deltaport|rupert|roberts bank)/i,close:/airspace|border|no-fly|clos/i}[k];
      function tidy(t){ return String(t||'').replace(/\s+([,.;:!?%)\]'’])/g,'$1').replace(/([(\[$])\s+/g,'$1').replace(/(['’])\s(?=(s|t|re|ll|ve|d|m)\b)/g,'$1').replace(/\b([A-Z])\.\s(?=[A-Z]\.)/g,'$1.').replace(/(\w) - (?=\w)/g,'$1-').slice(0,160) }
      return cached('gd2'+k,20,function(){ var tries=0; function go(){ return T(viaRelay(u)).catch(function(e){ if(++tries>1) throw e; return new Promise(function(r){ setTimeout(r,3500) }).then(go) }) } return go().then(function(x){ var j; try{ j=JSON.parse(x) }catch(e){ j={articles:[]} } return (j.articles||[]).filter(function(a){ return !REL||REL.test(a.title||'') }).map(function(a){ return [tidy(a.title),link(a.url),String(a.domain||'').slice(0,40),String(a.seendate||'')] }) }) }) }
    function gTime(s){ var m=/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)/.exec(s||''); return m?Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5]):0 }
    function heads(r,max){ return (r.d||[]).slice(0,max).map(function(a){ return '<a class="phead" href="'+esc(a[1]||'#')+'" target="_blank" rel="noopener noreferrer">'+esc(a[0]||'(no title)')+'<small>'+esc(a[2])+(gTime(a[3])?' · '+ago(gTime(a[3])):'')+'</small></a>' }).join('') }
    function supPorts(t){ gdelt('port','("Port of Vancouver" OR "Prince Rupert" OR Deltaport OR "Roberts Bank") (port OR terminal OR vessels OR ships OR cargo)','72h',8).then(function(r){
      var h='';
      if((r&&r.relay===false)||(!r&&relayOld)) h+=needRelay();
      else if(!r) h+=sec('Port news','Could not load port news right now.');
      else { var bad=(r.d||[]).filter(function(a){ return /strike|lockout|congest|backlog|anchor|delay|closed|closure|shut|disrupt|stoppage|derail|fire|blockade/i.test(a[0]) }).length, lv=bad>=3?['High',RED]:bad>=1?['Elevated',AMBER]:['Normal',GREEN];
        h+='<div class="ptiles">'+tile('Port stress (news)',lv[0],bad+' warning headline'+(bad===1?'':'s')+', 3 days',lv[1])+tile('Port stories',''+(r.d||[]).length,'Vancouver & Prince Rupert, 3 days')+'</div>';
        h+=sec('Latest port headlines',heads(r,4)||'No port stories in the last 3 days.') }
      h+=sec('Ship counts (AIS)','Live counts of ships waiting at anchor need a paid or registered ship-tracking feed, so they are not built in. Check the official line-up instead: <a href="https://www.portvancouver.com/" target="_blank" rel="noopener">Port of Vancouver</a> · <a href="https://www.rupertport.com/" target="_blank" rel="noopener">Port of Prince Rupert</a>.');
      h+='<div class="skynote">Headlines: GDELT news search'+(r&&r.at?' · '+when(r):'')+'</div>'; put(t,h) }) }
    var EIA=[['EER_EPMRR_PF4_Y05LA_DPG','Gasoline','West Coast wholesale (LA)','$/gal'],['EER_EPD2DC_PF4_Y05LA_DPG','Diesel','West Coast wholesale (LA)','$/gal'],['RWTC','Crude oil','WTI benchmark','$/bbl']];
    function supFuel(t){ cached('eia',360,function(){ return J('https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=DEMO_KEY&frequency=daily&data[0]=value&'+EIA.map(function(e){return 'facets[series][]='+e[0]}).join('&')+'&sort[0][column]=period&sort[0][direction]=desc&length=250').then(function(j){
        var by={}; ((j.response&&j.response.data)||[]).forEach(function(x){ (by[x.series]=by[x.series]||[]).push([x.period,+x.value]) }); return Object.keys(by).length?by:null }) }).then(function(r){
      var h='';
      if(!r) h+=sec('Fuel prices','Could not load fuel prices right now.');
      else { var pr='Steady', pc=GREEN, tiles='';
        EIA.forEach(function(e){ var a=(r.d[e[0]]||[]).filter(function(x){return isFinite(x[1])}); if(a.length<2){ return } var now=a[0][1], wk=a[Math.min(5,a.length-1)][1], mo=a[Math.min(21,a.length-1)][1], cw=(now-wk)/wk*100, cm=(now-mo)/mo*100;
          if(e[3]==='$/gal'){ if(cm>=10){ pr='Rising fast'; pc=RED } else if(cm>=4&&pc!==RED){ pr='Rising'; pc=AMBER } else if(cm<=-4&&pc===GREEN) pr='Falling' }
          tiles+='<div class="pfuel"><span><b>'+e[1]+'</b><small>'+e[2]+'</small></span>'+spark(a.slice(0,60).map(function(x){return x[1]}).reverse(),cm>=0?AMBER:GREEN)+'<span class="pfv"><b>$'+now.toFixed(e[3]==='$/bbl'?2:3)+'</b><small>'+e[3]+' · '+(cw>=0?'▲':'▼')+Math.abs(cw).toFixed(1)+'% wk · '+(cm>=0?'▲':'▼')+Math.abs(cm).toFixed(1)+'% mo</small></span></div>' });
        h+='<div class="ptiles">'+tile('Wholesale fuel pressure',pr,'Based on the last month',pc)+'</div>'+sec('Prices (US dollars)',tiles||'No price data.') }
      h+=sec('About Canadian prices','Rack (wholesale) prices for Burnaby and Edmonton aren’t published as free live data. US West Coast wholesale moves closely with BC pump prices, usually leading them by 1–2 weeks.');
      h+='<div class="skynote">Prices: US Energy Information Administration'+(r?' · '+when(r):'')+'</div>'; put(t,h) }) }
    function supClose(t){ gdelt('close','("airspace closed" OR "airspace closure" OR "closes airspace" OR "closed its airspace" OR "border closed" OR "border closure" OR "closes border" OR "no-fly zone")','24h',10).then(function(r){
      var h='';
      if((r&&r.relay===false)||(!r&&relayOld)) h+=needRelay();
      else if(!r) h+=sec('Closures','Could not load the news scan right now.');
      else h+='<div class="ptiles">'+tile('Closure reports, 24 h',''+(r.d||[]).length,(r.d||[]).length>=6?'Busy news day':'',(r.d||[]).length>=6?AMBER:GREEN)+'</div>'+sec('Latest reports',heads(r,5)||'No airspace or border closure stories in the last 24 hours.');
      h+=sec('Official sources','<a href="https://tfr.faa.gov/" target="_blank" rel="noopener">FAA flight restrictions</a> · <a href="https://plan.navcanada.ca/" target="_blank" rel="noopener">NAV CANADA NOTAMs</a> · <a href="https://www.cbsa-asfc.gc.ca/bwt-taf/menu-eng.html" target="_blank" rel="noopener">CBSA border wait times</a>');
      h+='<div class="skynote">News scan: GDELT (worldwide, automatic, can include false alarms)'+(r&&r.at?' · '+when(r):'')+'</div>'; put(t,h) }) }

    // ================= 3. PLANETARY THREATS =================
    function space(){ return cached('swx',10,function(){ var S='https://services.swpc.noaa.gov/';
      var end=new Date(), st=new Date(Date.now()-24*3600000);
      return Promise.all([J(S+'products/noaa-scales.json').catch(function(){return null}),J(S+'json/planetary_k_index_1m.json').catch(function(){return null}),J(S+'products/kyoto-dst.json').catch(function(){return null}),
        J('https://geomag.usgs.gov/ws/data/?id=NEW&elements=H&sampling_period=60&format=json&starttime='+st.toISOString().slice(0,19)+'Z&endtime='+end.toISOString().slice(0,19)+'Z').catch(function(){return null})]).then(function(a){
        var sc=a[0]&&a[0]['0']||{}, kp=a[1]&&a[1].length?a[1][a[1].length-1]:null, dst=null;
        if(Array.isArray(a[2])&&a[2].length){ var L2=a[2][a[2].length-1]; dst=Array.isArray(L2)?+L2[1]:+L2.dst }
        var H=null; if(a[3]&&a[3].values&&a[3].values[0]){ var v=a[3].values[0].values.filter(function(x){return typeof x==='number'}); if(v.length>30){ var sorted=v.slice().sort(function(p,q){return p-q}), med=sorted[Math.floor(sorted.length/2)], rate=0;
          for(var i=Math.max(1,v.length-60);i<v.length;i++) rate=Math.max(rate,Math.abs(v[i]-v[i-1]));
          var step=Math.max(1,Math.floor(v.length/80)), sp=[]; for(var j=0;j<v.length;j+=step) sp.push(Math.round(v[j]));
          H={dev:Math.round(v[v.length-1]-med),rate:Math.round(rate*10)/10,sp:sp} } }
        if(!kp&&!H&&dst==null) return null;
        return {g:sc.G&&+sc.G.Scale||0,r:sc.R&&+sc.R.Scale||0,s:sc.S&&+sc.S.Scale||0,kp:kp?+(kp.estimated_kp!=null?kp.estimated_kp:kp.kp_index):null,dst:isFinite(dst)?dst:null,H:H} }) }) }
    function threat(d){ var kp=d.kp||0, dst=d.dst==null?0:d.dst, dev=d.H?Math.abs(d.H.dev):0, rt=d.H?d.H.rate:0;
      if(dst<=-600||dev>=1500||rt>=500) return ['EXTREME · Carrington-class',PURPLE,'Grid and satellite damage possible. Expect GPS, radio and power problems.'];
      if(kp>=8||dst<=-250||dev>=600) return ['Severe storm',RED,'Power-grid alerts, GPS errors, HF radio blackouts. Auroras far south.'];
      if(kp>=5||dst<=-50||dev>=200) return ['Geomagnetic storm',AMBER,'Possible auroras, minor GPS and radio effects.'];
      if(kp>=4) return ['Active',AMBER,'Unsettled field. Nothing to worry about.'];
      return ['Quiet',GREEN,'Normal conditions.'] }
    function plSolar(t){ space().then(function(r){ if(!r){ put(t,sec('Space weather','Could not load space weather right now.')); return } var d=r.d, th=threat(d);
      var h='<div class="pbanner" style="background:'+th[1]+'"><b>'+th[0]+'</b><span>'+th[2]+'</span></div>';
      h+='<div class="ptiles">'+tile('Kp index',d.kp!=null?d.kp.toFixed(1):'—','G'+d.g+' storm scale',d.g>=3?RED:d.g>=1?AMBER:GREEN)+tile('Dst (world)',d.dst!=null?d.dst+' <small>nT</small>':'—','Carrington ≈ −850 or worse',d.dst!=null&&d.dst<=-250?RED:d.dst!=null&&d.dst<=-50?AMBER:GREEN)+tile('Radio / radiation','R'+d.r+' · S'+d.s,'Blackout · proton storm',d.r>=3||d.s>=3?RED:d.r||d.s?AMBER:GREEN)+'</div>';
      if(d.H) h+=sec('Ground magnetometer · Newport, WA','<div class="row2"><span>Field shift from normal</span><b>'+(d.H.dev>0?'+':'')+d.H.dev+' nT</b></div><div class="row2"><span>Fastest change, last hour</span><b>'+d.H.rate+' nT/min</b></div>'+spark(d.H.sp,th[1])+'<small>Last 24 hours. Big storms shift the field by hundreds of nT; Carrington-class by well over 1,000.</small>');
      else h+=sec('Ground magnetometer','Newport, WA readings unavailable right now.');
      h+='<div class="skynote">NOAA SWPC · USGS Geomagnetism, Newport observatory ('+kmTxt(km(me.lat,me.lon,48.265,-117.122))+' from you) · '+when(r)+'</div>'; put(t,h) }) }
    var radLayer=null;
    function plRad(t){ var on=!!radLayer, h=sec('Radiation map','Shows background gamma radiation measured by Safecast volunteers with handheld and fixed sensors. Blue and green are normal; yellow, orange and red are higher than usual.')+
      '<button class="ltbtn2 pacc" id="radbtn">'+(on?'Hide radiation map':'Show radiation map')+'</button>';
      h+='<div id="radnear">'+sec('Nearest readings',relay?'Loading…':'Needs your relay update (v6).')+'</div>';
      h+=sec('What’s normal','Natural background is about <b>0.05–0.20 µSv/h</b>. A chest X-ray is about 100 µSv. Official monitors: <a href="https://www.canada.ca/en/health-canada/services/health-risks-safety/radiation/understanding/measurements.html" target="_blank" rel="noopener">Health Canada</a> · <a href="https://www.epa.gov/radnet" target="_blank" rel="noopener">EPA RadNet</a>');
      if(!put(t,h)) return;
      document.getElementById('radbtn').onclick=function(){ if(radLayer){ map.removeLayer(radLayer); radLayer=null; plRad(vt) } else { radLayer=L.tileLayer('https://s3.amazonaws.com/te512.safecast.org/{z}/{x}/{y}.png',{maxNativeZoom:15,maxZoom:19,opacity:.7,zIndex:440,attribution:'Radiation © Safecast (CC BY-NC)'}).addTo(map); sh.hidden=true; vt++ } };
      if(!relay) return;
      cached('sc'+me.lat.toFixed(1)+me.lon.toFixed(1),720,function(){ return T(viaRelay('https://api.safecast.org/measurements.json?latitude='+me.lat.toFixed(2)+'&longitude='+me.lon.toFixed(2)+'&distance=300000&per_page=50&order=captured_at desc')).then(function(x){ var a=JSON.parse(x);
        return a.filter(function(m){ return m&&(m.unit==='cpm'||m.unit==='usv')&&isFinite(m.value)&&isFinite(m.latitude) }).map(function(m){ return [m.unit==='cpm'?m.value/334:m.value,+(+m.latitude).toFixed(3),+(+m.longitude).toFixed(3),Date.parse(m.captured_at)||0] }) }) }).then(function(r){
        var el=document.getElementById('radnear'); if(!el||t!==vt) return;
        if(!r||!r.d.length){ el.innerHTML=sec('Nearest readings',!r&&relayOld?'Needs your relay update (v6).':!r?'Could not load readings right now.':'No volunteer readings within 300 km.'); return }
        var a=r.d.map(function(m){ return m.concat([km(me.lat,me.lon,m[1],m[2])]) }).sort(function(p,q){return q[3]-p[3]}).slice(0,3);
        el.innerHTML=sec('Latest volunteer readings near you',a.map(function(m){ var hi=m[0]>0.3; return '<div class="row2"><span>'+kmTxt(m[4])+' away · '+esc(new Date(m[3]).toLocaleDateString([], {month:'short',year:'numeric'}))+'</span><b style="color:'+(hi?AMBER:'inherit')+'">'+m[0].toFixed(2)+' µSv/h</b></div>' }).join('')+'<small>Volunteer readings here are sparse and can be years old.</small>') }) }
    function plNeo(t){ var d0=new Date().toISOString().slice(0,10), d1=new Date(Date.now()+6*86400000).toISOString().slice(0,10);
      cached('neo'+d0,360,function(){ return J('https://api.nasa.gov/neo/rest/v1/feed?start_date='+d0+'&end_date='+d1+'&api_key=DEMO_KEY').then(function(j){ var out=[];
        Object.keys(j.near_earth_objects||{}).forEach(function(k){ (j.near_earth_objects[k]||[]).forEach(function(o){ var ca=(o.close_approach_data||[])[0]; if(!ca) return; var dm=o.estimated_diameter&&o.estimated_diameter.meters;
          out.push([String(o.name||'').replace(/[()]/g,'').slice(0,24),+ca.miss_distance.lunar,Date.parse(ca.close_approach_date_full||ca.close_approach_date)||0,dm?Math.round((dm.estimated_diameter_min+dm.estimated_diameter_max)/2):null,+(+ca.relative_velocity.kilometers_per_second).toFixed(1),o.is_potentially_hazardous_asteroid?1:0]) }) });
        return out.sort(function(a,b){return a[1]-b[1]}) }) }).then(function(r){
        if(!r){ put(t,sec('Asteroids','Could not load asteroid data right now (the free NASA service allows only a few look-ups an hour).')); return }
        var a=r.d, close=a[0], haz=a.filter(function(x){return x[5]}).length, h='<div class="ptiles">'+tile('Passing this week',''+a.length,'near-Earth objects')+tile('Closest pass',close?close[1].toFixed(1)+' <small>LD</small>':'—',close?esc(close[0]):'',close&&close[1]<1?AMBER:GREEN)+tile('“Potentially hazardous”',''+haz,'big & on crossing orbits',haz?AMBER:GREEN)+'</div>';
        h+=sec('Closest approaches',a.slice(0,5).map(function(x){ return '<div class="row2 prow2"><span><b>'+esc(x[0])+'</b>'+(x[5]?' ⚠':'')+' <small>'+(x[3]?'~'+x[3].toLocaleString()+' m · ':'')+x[4]+' km/s · '+esc(new Date(x[2]).toLocaleDateString([], {weekday:'short',month:'short',day:'numeric'}))+'</small></span><b>'+x[1].toFixed(1)+' LD</b></div>' }).join('')||'None this week.');
        h+='<div class="skynote">1 LD = distance to the Moon (384,400 km). “Potentially hazardous” is a size-and-orbit label, not an impact warning. Data: NASA/JPL · '+when(r)+'</div>'; put(t,h) }) }
    // solar storm alerts (only when turned on in Settings)
    var lastSolar=0, lastSolarLvl=0;
    function solarCheck(){ var need={g3:3,g4:4,g5:5}[cfg2.prepSolar]; if(!need) return; space().then(function(r){ if(!r) return; var d=r.d, th=threat(d), ext=th[1]===PURPLE, lv=ext?9:d.g;
      if(lv<need) return; if(Date.now()-lastSolar<3*3600000&&lv<=lastSolarLvl) return; lastSolar=Date.now(); lastSolarLvl=lv;
      var msg=ext?'Carrington-class solar storm detected':'G'+d.g+' geomagnetic storm in progress (Kp '+(d.kp!=null?d.kp.toFixed(1):'?')+')', bar=document.getElementById('pral');
      if(bar){ document.getElementById('praltxt').textContent='☀️ '+msg; bar.hidden=false }
      try{ if(navigator.vibrate) navigator.vibrate([300,120,300,120,300]) }catch(e){}
      try{ if(document.hidden&&'Notification' in window&&Notification.permission==='granted') new Notification('AwareBC',{body:'☀️ '+msg,tag:'solar'}) }catch(e){} }) }
    (function(){ var bar=document.getElementById('pral'); if(bar) bar.onclick=function(e){ bar.hidden=true; if(e.target.id!=='pralx') open('planet',0) } })();
    setInterval(function(){ if(!document.hidden) solarCheck() },15*60000); setTimeout(solarCheck,9000);

    // ================= 4. OFF-GRID COMMS =================
    function xclass(f){ if(!(f>0)) return '—'; var L2=f<1e-7?['A',1e-8]:f<1e-6?['B',1e-7]:f<1e-5?['C',1e-6]:f<1e-4?['M',1e-5]:['X',1e-4]; return L2[0]+(f/L2[1]).toFixed(1) }
    function hfData(){ return cached('hf',15,function(){ var S='https://services.swpc.noaa.gov/';
      return Promise.all([J(S+'products/summary/10cm-flux.json').catch(function(){return null}),J(S+'json/planetary_k_index_1m.json').catch(function(){return null}),J(S+'json/predicted_fredericksburg_a_index.json').catch(function(){return null}),J(S+'json/goes/primary/xrays-6-hour.json').catch(function(){return null}),J(S+'products/noaa-scales.json').catch(function(){return null})]).then(function(a){
        var sfi=a[0]&&(Array.isArray(a[0])?a[0][0]:a[0]); sfi=sfi?+sfi.flux:null; var kp=a[1]&&a[1].length?+a[1][a[1].length-1].estimated_kp:null, A=a[2]&&a[2][0]?+a[2][0].afred_1_day:null, xr=null;
        if(Array.isArray(a[3])){ for(var i=a[3].length-1;i>=0;i--){ if(a[3][i].energy==='0.1-0.8nm'){ xr=+a[3][i].flux; break } } }
        var R=a[4]&&a[4]['0']&&a[4]['0'].R?+a[4]['0'].R.Scale:0; if(sfi==null&&kp==null) return null; return {sfi:sfi,kp:kp,a:A,xr:xr,r:R} }) }) }
    function bands(d){ var s=d.sfi||70, k=d.kp||2, R=d.r||0;
      function q(x){ return x===2?['Good',GREEN]:x===1?['Fair',AMBER]:['Poor',RED] }
      var rows=[['80m–40m', k<4?1:0, k<=3?2:k<=5?1:0],['30m–20m', s>=90&&k<=4?2:s>=70?1:0, s>=120&&k<=3?2:s>=90?1:0],['17m–15m', s>=120&&k<=4?2:s>=90?1:0, s>=170&&k<=3?1:0],['12m–10m', s>=150&&k<=4?2:s>=110?1:0, s>=200?1:0]];
      return rows.map(function(r){ var day=r[1], night=r[2]; if(R>=3) day=0; if(k>=7){ day=Math.min(day,0); night=Math.min(night,0) } return [r[0],q(day),q(night)] }) }
    function cmHF(t){ hfData().then(function(r){ if(!r){ put(t,sec('HF conditions','Could not load solar data right now.')); return } var d=r.d, bd=bands(d), isDay=(typeof sunAlt==='function')?sunAlt(me.lat,me.lon,Date.now())>-6:true;
      var h='<div class="ptiles">'+tile('Solar flux (SFI)',d.sfi!=null?Math.round(d.sfi):'—',d.sfi>=150?'Great for high bands':d.sfi>=100?'Decent':'Low',d.sfi>=100?GREEN:AMBER)+tile('Kp / A index',(d.kp!=null?d.kp.toFixed(1):'—')+' / '+(d.a!=null?d.a:'—'),d.kp>=5?'Storm: noisy bands':'Calm field',d.kp>=5?RED:d.kp>=4?AMBER:GREEN)+tile('X-ray flare',xclass(d.xr),d.r>=1?'R'+d.r+' radio blackout':'No blackout',d.r>=3?RED:d.r?AMBER:GREEN)+'</div>';
      h+=sec('Band conditions · now: '+(isDay?'day':'night')+' at your location','<div class="pband"><span></span><small>Day</small><small>Night</small>'+bd.map(function(b){ return '<b>'+b[0]+'</b><span class="pq'+(isDay?' now':'')+'" style="background:'+b[1][1]+'">'+b[1][0]+'</span><span class="pq'+(!isDay?' now':'')+'" style="background:'+b[2][1]+'">'+b[2][0]+'</span>' }).join('')+'</div>');
      h+=sec('Local fallback channels','2 m simplex calling <b>146.520</b> · 70 cm simplex <b>446.000</b> · Marine VHF distress <b>Ch 16 (156.800)</b> · CB emergency <b>Ch 9</b>');
      h+='<div class="skynote">Band estimate from NOAA SWPC solar data (the same inputs ham band charts use) · '+when(r)+'</div>'; put(t,h) }) }
    function cmBcst(t){ var a=BCST.map(function(b){ return b.concat([km(me.lat,me.lon,b[4],b[5])]) }).sort(function(x,y){return x[6]-y[6]}).slice(0,7);
      put(t,sec('Emergency info on the radio',a.map(function(b){ return '<div class="row2 prow2"><span>'+(b[0][0]==='N'?'🌦':'📻')+' <b>'+esc(b[2])+'</b> <small>'+esc(b[1])+' · '+esc(b[3])+'</small></span><small>'+kmTxt(b[6])+'</small></div>' }).join('')+'<small style="display:block;margin-top:4px">CBC Radio One carries emergency updates during disasters. NOAA Weather Radio (US) needs a weather-band radio.</small>')+
        sec('Alerts that reach you anyway','<b>Alert Ready</b> sends emergency alerts over every Canadian radio and TV station and to compatible cell phones. Weatheradio Canada transmitters were shut down in March 2026.')+
        '<div class="skynote">Saved in the app, works offline · Frequencies: CBC, NOAA</div>') }
    var repLayer=L.layerGroup().addTo(map), repOn=false;
    function drawRep(){ repLayer.clearLayers(); if(!repOn) return; REP.forEach(function(r){ L.marker([r[1],r[2]],{icon:L.divIcon({className:'',html:'<span class="firemk" role="img" aria-label="Repeater" style="--c:#00897b;--sz:22px">📡</span>',iconSize:[0,0]}),keyboard:false,zIndexOffset:-160,title:r[0]}).bindPopup('<b>'+esc(r[0])+'</b> · '+esc(r[3])+'<br>'+r[4].toFixed(3)+' MHz '+(r[5]>0?'+':'−')+Math.abs(r[5])+(r[6]?' · tone '+esc(r[6]):'')+' · '+esc(r[7]),{closeButton:false}).addTo(repLayer) }) }
    function cmRep(t){ var a=REP.map(function(r){ return r.concat([km(me.lat,me.lon,r[1],r[2])]) }).sort(function(x,y){return x[8]-y[8]}).slice(0,7);
      var h=sec('Nearest ham repeaters',a.map(function(r){ return '<div class="row2 prow2"><span><b>'+r[4].toFixed(3)+'</b> '+(r[5]>0?'+':'−')+Math.abs(r[5])+(r[6]?' · '+esc(/^CC/.test(r[6])?r[6]:'T '+r[6]):'')+' · '+esc(r[7])+' <small>'+esc(r[0])+' · '+esc(r[3])+'</small></span><small>'+kmTxt(r[8])+'</small></div>' }).join(''));
      h+='<button class="ltbtn2 pacc" id="repbtn">'+(repOn?'Hide repeaters on the map':'Show repeaters on the map')+'</button>';
      h+='<div class="skynote">Listen first, then call. Needs an amateur licence to transmit (except in a real emergency). Saved in the app, works offline. Data: HearHam, local clubs · verify before you rely on it · <a href="https://www.repeaterbook.com/" target="_blank" rel="noopener">RepeaterBook</a></div>';
      if(!put(t,h)) return; document.getElementById('repbtn').onclick=function(){ repOn=!repOn; drawRep(); if(repOn){ sh.hidden=true; vt++ } else cmRep(vt) } }
    function cmSdr(t){ var a=SDR.map(function(s){ return s.concat([km(me.lat,me.lon,s[1],s[2])]) }).sort(function(x,y){return x[4]-y[4]});
      put(t,sec('Online radio receivers (WebSDR / KiwiSDR)','Listen to shortwave and ham bands through someone else’s receiver over the internet. Handy for checking what is getting through.')+
        sec('Nearest to you',a.slice(0,6).map(function(s){ return '<a class="phead" href="'+esc(link(s[3]))+'" target="_blank" rel="noopener">'+esc(s[0])+'<small>'+kmTxt(s[4])+'</small></a>' }).join(''))+
        '<div class="skynote">These need internet. Live list of all receivers: <a href="http://rx.kiwisdr.com/" target="_blank" rel="noopener">rx.kiwisdr.com</a> · <a href="http://websdr.org/" target="_blank" rel="noopener">websdr.org</a></div>') }

    // ================= 5. RESCUE & SIGNAL =================
    // Rescue card: your exact spot in every format Search and Rescue asks for. Signal: where you are most likely to get a bar. First aid: offline guides.
    function pad2(n){ return (n<10?'0':'')+n }
    function utm(lat,lon){ var a=6378137, f=1/298.257223563, k0=0.9996, e2=f*(2-f), ep=e2/(1-e2), zn=Math.floor((lon+180)/6)+1, l0=((zn-1)*6-177)*Math.PI/180, p=lat*Math.PI/180, l=lon*Math.PI/180;
      var sp=Math.sin(p), cp=Math.cos(p), tp=Math.tan(p), N=a/Math.sqrt(1-e2*sp*sp), T=tp*tp, Cc=ep*cp*cp, A=cp*(l-l0);
      var M=a*((1-e2/4-3*e2*e2/64-5*e2*e2*e2/256)*p-(3*e2/8+3*e2*e2/32+45*e2*e2*e2/1024)*Math.sin(2*p)+(15*e2*e2/256+45*e2*e2*e2/1024)*Math.sin(4*p)-(35*e2*e2*e2/3072)*Math.sin(6*p));
      var E=k0*N*(A+(1-T+Cc)*A*A*A/6+(5-18*T+T*T+72*Cc-58*ep)*Math.pow(A,5)/120)+500000;
      var Nn=k0*(M+N*tp*(A*A/2+(5-T+9*Cc+4*Cc*Cc)*Math.pow(A,4)/24+(61-58*T+T*T+600*Cc-330*ep)*Math.pow(A,6)/720)); if(lat<0) Nn+=10000000;
      return {z:zn,b:'CDEFGHJKLMNPQRSTUVWXX'.charAt(Math.max(0,Math.min(20,Math.floor((lat+80)/8)))),e:Math.round(E),n:Math.round(Nn)} }
    function dms(v,P,Q){ var a=Math.abs(v), d=Math.floor(a), mf=(a-d)*60, m=Math.floor(mf), s=((mf-m)*60).toFixed(1); if(s==='60.0'){ s='0.0'; m++ } if(m===60){ m=0; d++ } return d+'° '+m+'′ '+s+'″ '+(v<0?Q:P) }
    function ddm(v,P,Q){ var a=Math.abs(v), d=Math.floor(a), m=((a-d)*60).toFixed(3); if(m==='60.000'){ m='0.000'; d++ } return d+'° '+m+'′ '+(v<0?Q:P) }
    function brg(a,b,c,d){ var p1=a*Math.PI/180, p2=c*Math.PI/180, dl=(d-b)*Math.PI/180, y=Math.sin(dl)*Math.cos(p2), x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl); return (Math.atan2(y,x)*180/Math.PI+360)%360 }
    function nearTown(lat,lon){ var best=null; BCST.forEach(function(b){ var k=km(lat,lon,b[4],b[5]); if(!best||k<best.k) best={n:b[3],k:k,d:dirTxt(brg(b[4],b[5],lat,lon))} }); return best }
    var rFix=null; try{ rFix=JSON.parse(localStorage.getItem('sky-rfix')||'null') }catch(e){}
    function getFix(){ return new Promise(function(res){ var G=navigator.geolocation, done=false; if(!G) return res(null);
      var to=setTimeout(function(){ if(!done){ done=true; res(null) } },16000);
      G.getCurrentPosition(function(p){ if(done) return; done=true; clearTimeout(to); rFix={lat:p.coords.latitude,lon:p.coords.longitude,acc:p.coords.accuracy,alt:p.coords.altitude,t:p.timestamp||Date.now()}; try{ localStorage.setItem('sky-rfix',JSON.stringify(rFix)) }catch(e){} res(rFix) },
        function(){ if(!done){ done=true; clearTimeout(to); res(null) } },{enableHighAccuracy:true,maximumAge:15000,timeout:15000}) }) }
    var rPlace={};
    function placeName(lat,lon){ var k=lat.toFixed(3)+','+lon.toFixed(3); if(rPlace[k]) return rPlace[k];
      return rPlace[k]=cached('rev'+k,1440,function(){ return J('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&lat='+lat.toFixed(5)+'&lon='+lon.toFixed(5)).then(function(j){ var a=(j&&j.address)||{}; var road=a.road||a.track||a.path||'', town=a.village||a.town||a.city||a.hamlet||a.locality||a.county||''; return (road||town)?{road:road,town:town}:null }) }) }
    function rsText(f,u,town,place,el){ var la=f.lat.toFixed(5), lo=f.lon.toFixed(5);
      return 'My location (AwareBC):\nLat/Lon: '+la+', '+lo+'\nDMS: '+dms(f.lat,'N','S')+', '+dms(f.lon,'E','W')+'\nUTM: '+u.z+u.b+' '+u.e+'E '+u.n+'N (NAD83/WGS84)'+(el!=null?'\nElevation: about '+Math.round(el)+' m':'')+(f.acc?'\nGPS accuracy: ±'+Math.round(f.acc)+' m':'')+(place&&place.road?'\nNear: '+place.road+(place.town?', '+place.town:''):'')+(town?(town.k<1?'\nIn '+town.n:'\nAbout '+kmTxt(town.k)+' '+town.d+' of '+town.n):'')+'\nTime: '+new Date(f.t||Date.now()).toLocaleString()+'\nhttps://maps.google.com/?q='+la+','+lo }
    function rsCard(t){ var f=rFix&&Date.now()-rFix.t<6*3600000?rFix:{lat:me.lat,lon:me.lon,t:0,old:true}, fresh=false;
      function draw(place,el){ if(t!==vt) return; var u=utm(f.lat,f.lon), town=nearTown(f.lat,f.lon), la=f.lat.toFixed(5), lo=f.lon.toFixed(5);
        var row=function(k,v){ return '<div class="row2 prow2"><span>'+k+'</span><span><b style="font-weight:700;user-select:all;-webkit-user-select:all">'+v+'</b></span></div>' };
        var h='<div class="ssec" style="border:2px solid #e53935"><h4>📞 Call 911 · ask for police</h4>In BC the RCMP call out Search and Rescue. Read them this:</div>';
        h+=sec('Your location'+(fresh?' · <span class="good">GPS ✓</span>':f.old?' · <span style="color:#fb8c00">no GPS fix yet</span>':' · <span style="color:#fb8c00">saved '+ago(f.t)+'</span>'),
          row('Latitude',Math.abs(f.lat).toFixed(5)+(f.lat<0?' S':' N'))+row('Longitude',Math.abs(f.lon).toFixed(5)+(f.lon<0?' W':' E'))+row('As numbers',la+', '+lo)+row('Deg · min · sec',dms(f.lat,'N','S')+'<br>'+dms(f.lon,'E','W'))+row('Degrees · minutes',ddm(f.lat,'N','S')+'<br>'+ddm(f.lon,'E','W'))+
          row('UTM (NAD83)',u.z+u.b+' '+u.e+' E<br>'+u.n+' N')+(el!=null?row('Elevation','~'+Math.round(el).toLocaleString()+' m'):'')+(f.acc?row('GPS accuracy','± '+Math.round(f.acc)+' m'):'')+
          (place&&place.road?row('Near',esc(place.road)+(place.town?'<br>'+esc(place.town):'')):'')+(town?row('Closest town',town.k<1?'In '+esc(town.n):kmTxt(town.k)+' '+town.d+' of '+esc(town.n)):''));
        h+='<div class="pbtns"><button id="rsfix">📍 Refresh GPS</button><button id="rscopy">📋 Copy</button><a id="rssms" style="min-height:40px;border-radius:10px;background:var(--bg);color:var(--fg);font:600 12px var(--font);display:flex;align-items:center;justify-content:center;text-decoration:none" href="sms:?&body='+encodeURIComponent(rsText(f,u,town,place,el))+'">💬 Text it</a></div><div id="rsbox"></div>';
        h+=sec('No signal?','<b>Texts get through when calls can’t.</b> Text this card to someone who can call 911 for you. Phones with satellite SOS (newer iPhones, some Androids, inReach, SPOT) work with no cell signal. Climb to open high ground (see the Signal tab) and try again.');
        h+=sec('Once help is coming','Stay where you are. Keep your phone warm (inside pocket) and on low-power mode. Stay off the phone except to check in. Make yourself easy to see: bright gear spread out, a fire only if it’s safe.');
        h+='<div class="skynote">Works with no signal (except the road name). Coordinates are WGS84, the same as NAD83 for rescue use.</div>';
        if(!put(t,h)) return;
        document.getElementById('rsfix').onclick=function(){ this.textContent='Getting GPS…'; getFix().then(function(x){ if(x){ f=x; fresh=true; go() } else if(t===vt){ var b=document.getElementById('rsfix'); if(b) b.textContent='No GPS fix · try outside' } }) };
        document.getElementById('rscopy').onclick=function(){ var bx=document.getElementById('rsbox'); bx.innerHTML='<textarea readonly rows="9" style="width:100%;box-sizing:border-box;margin-top:6px;background:#000;color:#fff;border:1px solid #555;border-radius:8px;padding:8px;font:12px/1.35 ui-monospace,monospace">'+esc(rsText(f,u,town,place,el))+'</textarea><small style="display:block;color:var(--dim)">Selected: press and hold, then Copy.</small>'; var ta=bx.querySelector('textarea'); ta.focus(); ta.select() } }
      function go(){ var el=f.alt!=null&&isFinite(f.alt)?f.alt:null; draw(null,el); var p=placeName(f.lat,f.lon);
        var ep=el!=null?Promise.resolve(el):cached('el'+f.lat.toFixed(3)+f.lon.toFixed(3),100000,function(){ return J('https://api.open-meteo.com/v1/elevation?latitude='+f.lat.toFixed(4)+'&longitude='+f.lon.toFixed(4)).then(function(j){ return j&&j.elevation?j.elevation[0]:null }) }).then(function(r){ return r?(typeof r.d==='number'?r.d:null):null });
        Promise.all([p,ep]).then(function(a){ draw(a[0]&&a[0].d,a[1]) }) }
      go(); getFix().then(function(x){ if(x&&t===vt){ f=x; fresh=true; go() } }) }

    // ---------- Signal finder: high ground with a clear line to cell towers ----------
    var demP={}, demA={}, sigLayer=L.layerGroup().addTo(map), sigRes=null;
    function dem(z,x,y){ var k=z+'/'+x+'/'+y; if(demP[k]) return demP[k];
      return demP[k]=fetch('https://s3.amazonaws.com/elevation-tiles-prod/terrarium/'+k+'.png').then(function(r){ return r.ok?r.blob():null }).then(function(b){ return b?createImageBitmap(b):null }).then(function(im){ if(!im){ delete demP[k]; return null }
        var c=document.createElement('canvas'); c.width=c.height=256; var g=c.getContext('2d'); g.drawImage(im,0,0); var d=g.getImageData(0,0,256,256).data, E=new Float32Array(65536);
        for(var i=0;i<65536;i++) E[i]=d[i*4]*256+d[i*4+1]+d[i*4+2]/256-32768; demA[k]=E; return E }).catch(function(){ delete demP[k]; return null }) }
    function tpx(lat,lon,z){ var n=Math.pow(2,z), r=lat*Math.PI/180; return [(lon+180)/360*n,(1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n] }
    // loads the terrain for a box, then gives back a quick "height at this spot" function
    function demLoad(s,w,n,e,z){ var a=tpx(n,w,z), b=tpx(s,e,z), jobs=[];
      for(var x=Math.floor(a[0]);x<=Math.floor(b[0]);x++) for(var y=Math.floor(a[1]);y<=Math.floor(b[1]);y++) jobs.push(dem(z,x,y));
      return Promise.all(jobs).then(function(){ return function(lat,lon){ var t=tpx(lat,lon,z), tx=Math.floor(t[0]), ty=Math.floor(t[1]), E=demA[z+'/'+tx+'/'+ty]; if(!E) return null;
        return E[Math.min(255,Math.floor((t[1]-ty)*256))*256+Math.min(255,Math.floor((t[0]-tx)*256))] } }) }
    function towers(lat,lon){ var k='tw'+lat.toFixed(1)+lon.toFixed(1);
      return cached(k,7*1440,function(){ var q='[out:json][timeout:25];(node["tower:type"="communication"](around:45000,'+lat.toFixed(3)+','+lon.toFixed(3)+');node["communication:mobile_phone"](around:45000,'+lat.toFixed(3)+','+lon.toFixed(3)+');way["tower:type"="communication"](around:45000,'+lat.toFixed(3)+','+lon.toFixed(3)+'););out center 300;';
        return J('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(q)).then(function(j){ var seen={}; return (j.elements||[]).map(function(x){ var la=x.lat!=null?x.lat:(x.center&&x.center.lat), lo=x.lon!=null?x.lon:(x.center&&x.center.lon), g=x.tags||{}; return {lat:la,lon:lo,h:parseFloat(g.height)||30,n:g.operator||g.name||''} })
          .filter(function(t){ if(!isFinite(t.lat)||!isFinite(t.lon)) return false; var s=t.lat.toFixed(3)+t.lon.toFixed(3); if(seen[s]) return false; seen[s]=1; return true }) }) }) }
    function losOk(el,a,b,ha,hb){ // clear line from a (ha m up) to b (hb m up)? earth curve with normal radio bending (k=4/3)
      var d=km(a[0],a[1],b[0],b[1])*1000, za=el(a[0],a[1]), zb=el(b[0],b[1]); if(za==null||zb==null) return false; za+=ha; zb+=hb;
      var n=Math.max(8,Math.min(120,Math.round(d/250))), R=6371000*4/3;
      for(var i=1;i<n;i++){ var f=i/n, z=el(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f); if(z==null) continue; var d1=d*f, bulge=d1*(d-d1)/(2*R); if(z+bulge>za+(zb-za)*f) return false }
      return true }
    function sigFind(f){ var dLat=4/111, dLon=4/(111*Math.cos(f.lat*Math.PI/180)), W=45/111, WL=45/(111*Math.cos(f.lat*Math.PI/180));
      return towers(f.lat,f.lon).then(function(tr){ var tw=(tr&&tr.d||[]).map(function(t){ return {lat:t.lat,lon:t.lon,h:Math.min(Math.max(t.h,10),120),n:t.n,k:km(f.lat,f.lon,t.lat,t.lon)} }).filter(function(t){ return t.k<=45 }).sort(function(a,b){ return a.k-b.k }).slice(0,12);
        return Promise.all([demLoad(f.lat-dLat,f.lon-dLon,f.lat+dLat,f.lon+dLon,12),tw.length?demLoad(f.lat-W,f.lon-WL,f.lat+W,f.lon+WL,9):null]).then(function(fs){ var near=fs[0], far=fs[1], here=near(f.lat,f.lon);
          if(here==null) throw new Error('no terrain');
          // the highest ground in each of 8 directions, out to 1.5 km and to 4 km
          var best={}; for(var dy=-dLat;dy<=dLat;dy+=dLat/26) for(var dx=-dLon;dx<=dLon;dx+=dLon/26){ var la=f.lat+dy, lo=f.lon+dx, k=km(f.lat,f.lon,la,lo); if(k<0.25||k>4) continue; var z=near(la,lo); if(z==null) continue;
            var key=Math.round(brg(f.lat,f.lon,la,lo)/45)%8+(k>1.5?'f':'n'); if(!best[key]||z>best[key].z) best[key]={lat:la,lon:lo,z:z,k:k} }
          var cands=Object.keys(best).map(function(k){ return best[k] }).filter(function(c){ return c.z>here+25 });
          function sees(p,pz){ if(!far) return []; return tw.filter(function(t){ return km(p.lat,p.lon,t.lat,t.lon)<=40&&losOk(far,[p.lat,p.lon],[t.lat,t.lon],3,t.h) }) }
          var hs=sees(f,here); cands.forEach(function(c){ c.s=sees(c,c.z); c.up=Math.round(c.z-here); c.d=dirTxt(brg(f.lat,f.lon,c.lat,c.lon)) });
          cands.sort(function(a,b){ return (b.s.length>0)-(a.s.length>0)||(b.s.length-a.s.length)||(a.k-b.k) });
          return {f:f,here:Math.round(here),hs:hs,tw:tw,c:cands.slice(0,4),at:Date.now()} }) }) }
    function sigDraw(){ sigLayer.clearLayers(); if(!sigRes) return;
      sigRes.tw.forEach(function(t){ L.marker([t.lat,t.lon],{icon:L.divIcon({className:'',html:'<span class="firemk" role="img" aria-label="Cell tower" style="--c:#546e7a;--sz:20px">🗼</span>',iconSize:[0,0]}),keyboard:false,zIndexOffset:-170,title:'Tower'}).bindPopup('<b>🗼 Tower</b>'+(t.n?'<br>'+esc(t.n):'')+'<br><small>From OpenStreetMap</small>',{closeButton:false}).addTo(sigLayer) });
      sigRes.c.forEach(function(c,i){ L.marker([c.lat,c.lon],{icon:L.divIcon({className:'',html:'<span class="firemk" role="img" aria-label="Signal spot" style="--c:'+(c.s.length?'#2e7d32':'#8d6e63')+';--sz:26px">'+(c.s.length?'📶':'⛰')+'</span>',iconSize:[0,0]}),keyboard:false,zIndexOffset:-140,title:'Signal spot'})
        .bindPopup('<b>'+(c.s.length?'📶 Likely signal':'⛰ High ground')+'</b><br>'+kmTxt(c.k)+' '+c.d+' · '+c.up+' m higher<br>'+(c.s.length?'Clear line to '+c.s.length+' tower'+(c.s.length>1?'s':''):'No mapped tower in clear view')+'<div class="gpsb"><a href="https://www.google.com/maps/dir/?api=1&destination='+c.lat.toFixed(5)+','+c.lon.toFixed(5)+'&travelmode=walking" target="_blank" rel="noopener" style="flex:1;padding:8px 6px;border-radius:10px;font:600 13px var(--font);background:#1a73e8;color:#fff;text-align:center;text-decoration:none">Directions</a></div>',{closeButton:false}).addTo(sigLayer) }) }
    function rsSignal(t){ var f=rFix&&Date.now()-rFix.t<3600000?rFix:{lat:me.lat,lon:me.lon,t:Date.now()}, c=navigator.connection||{}, on=navigator.onLine;
      var mine=spots().filter(function(s){ return s.k==='sig' }).map(function(s){ return {s:s,k:km(f.lat,f.lon,s.lat,s.lon)} }).sort(function(a,b){ return a.k-b.k });
      var h='<div class="ptiles">'+tile('Your connection',on?(c.effectiveType?String(c.effectiveType).toUpperCase():'Online'):'No signal',on&&c.downlink?'~'+c.downlink+' Mbit/s':on?'':'Texts may still send',on?GREEN:RED)+tile('Saved signal spots',String(mine.length),mine.length?'Closest '+kmTxt(mine[0].k):'Save one when you have a bar',mine.length?GREEN:null)+'</div>';
      h+='<div class="pbtns" style="margin-bottom:6px"><button id="sgsave" style="grid-column:1/-1">📶 I have signal here · save it</button></div>';
      if(mine.length) h+=sec('Your signal spots',mine.slice(0,4).map(function(x){ return '<div class="row2 prow2"><span>📶 '+esc(new Date(x.s.t).toLocaleDateString([], {month:'short',day:'numeric'}))+'</span><span>'+kmTxt(x.k)+' '+dirTxt(brg(f.lat,f.lon,x.s.lat,x.s.lon))+'</span></div>' }).join(''));
      if(sigRes&&km(sigRes.f.lat,sigRes.f.lon,f.lat,f.lon)<1){ var r=sigRes;
        h+=sec('Where you are now',(r.tw.length?(r.hs.length?'<span class="good">Clear line to '+r.hs.length+' tower'+(r.hs.length>1?'s':'')+'</span> from here. If you still have no bar, try a few metres higher or away from trees.':'<span style="color:#fb8c00">Hills block every mapped tower from here.</span>'):'No mapped cell towers within 45 km.')+' Elevation ~'+r.here+' m.');
        h+=sec('Best spots to try',r.c.length?r.c.map(function(c){ return '<div class="row2 prow2"><span>'+(c.s.length?'📶':'⛰')+' <b>'+kmTxt(c.k)+' '+c.d+'</b> <small>+'+c.up+' m · '+(c.s.length?'sees '+c.s.length+' tower'+(c.s.length>1?'s':'')+' (closest '+kmTxt(Math.min.apply(null,c.s.map(function(s){ return km(c.lat,c.lon,s.lat,s.lon) })))+')':'high ground')+'</small></span></div>' }).join('')+'<button class="ltbtn2 pacc" id="sgmap">Show spots & towers on the map</button>':'You are already on the highest ground close by.');
      } else h+=sec('Find signal spots','Looks for higher ground within 4 km that has a clear line to cell towers. Uses about 1 MB of data, so run it while you still have a bar.<button class="ltbtn2 pacc" id="sgfind">🔎 Find signal spots near me</button>');
      h+=sec('Tips for a bar','Get high and in the open: ridges and clearings beat valleys and thick trees. Hold the phone up, stay still for a minute. A text needs far less signal than a call. Turn airplane mode on and off to make the phone search again. Keep it warm: cold batteries die fast.');
      h+='<div class="skynote">Towers: OpenStreetMap (not every tower is mapped) · Terrain: Mapzen/AWS. A clear line is a good sign, not a promise.</div>';
      if(!put(t,h)) return;
      document.getElementById('sgsave').onclick=function(){ var b=this; b.textContent='Getting GPS…'; getFix().then(function(x){ var p=x||f; var a=spots(); a.push({k:'sig',lat:+p.lat.toFixed(5),lon:+p.lon.toFixed(5),t:Date.now()}); try{ localStorage.setItem('sky-spots',JSON.stringify(a.slice(-200))) }catch(e){} if(typeof drawSpots==='function') drawSpots(); rsSignal(vt) }) };
      var fb=document.getElementById('sgfind'); if(fb) fb.onclick=function(){ fb.textContent='Looking… (10–30 s)'; fb.disabled=true; var tt=vt; getFix().then(function(x){ return sigFind(x||f) }).then(function(r){ sigRes=r; sigDraw(); rsSignal(tt) }).catch(function(){ if(tt===vt){ fb.disabled=false; fb.textContent='Couldn’t load terrain · tap to try again' } }) };
      var mb=document.getElementById('sgmap'); if(mb) mb.onclick=function(){ sigDraw(); sh.hidden=true; vt++; var b=L.latLngBounds([[sigRes.f.lat,sigRes.f.lon]]); sigRes.c.forEach(function(c){ b.extend([c.lat,c.lon]) }); sigRes.hs.concat(sigRes.c.length?sigRes.c[0].s:[]).forEach(function(s){ b.extend([s.lat,s.lon]) }); map.fitBounds(b.pad(.2),{maxZoom:14}) } }

    // ---------- First aid: short offline guides ----------
    var AID=[
      ['🚨','First: check & call','Make sure it’s safe for you first (traffic, avalanche slope, fire). Talk to them and tap their shoulders. Call 911 (or send someone / text someone to call). Check breathing for up to 10 seconds. Not breathing normally → start CPR. Breathing → treat the worst problem first: heavy bleeding, then everything else.'],
      ['❤️','CPR (adult)','Call 911 and get an AED if one is near. Kneel beside them, heel of your hand in the centre of the chest, other hand on top. Push hard and fast: at least 5 cm (2 in) deep, 100 to 120 a minute, let the chest come all the way back up. If you are trained, give 2 breaths after every 30 pushes; if not, keep pushing without breaths. Don’t stop until help takes over, an AED tells you to, or they start breathing. Do CPR on a cold person too: they may still recover.'],
      ['🩸','Heavy bleeding','Press hard right on the wound with a cloth, glove or your hand, and keep pressing. Don’t lift it to look; if blood soaks through, add more on top. Bleeding from an arm or leg that won’t stop with pressure: put a tourniquet (or a belt/strap twisted tight with a stick) 5 to 7 cm (2–3 in) above the wound, not on a joint, and tighten until the bleeding stops. Note the time. Keep them warm and lying down.'],
      ['🥶','Hypothermia','Signs: hard shivering, clumsy hands, slurred speech, confusion, wanting to sleep. Get them out of wind and wet, off the cold ground (pad, pack, branches). Swap wet clothes for dry, cover the head and neck, wrap in everything you have. Warm (not hot) packs on the chest, armpits and groin, over clothing. Warm sweet drinks only if fully awake. If shivering has stopped and they are very drowsy, move them very gently and keep them lying flat: this is an emergency. No alcohol, no rubbing arms and legs.'],
      ['🧊','Frostbite','Signs: white, grey or waxy skin that feels numb or hard. Get to shelter. Don’t rub it or rub snow on it. Only thaw it if it won’t freeze again. Thaw in warm water you can comfortably hold your hand in (about 37–39 °C) for 20–30 minutes, or with body heat (hands in armpits). Never use a fire, heater or engine. It will hurt and may blister; don’t break blisters. Cover loosely and get medical care.'],
      ['🦴','Broken bone or sprain','Don’t try to straighten it. Support it in the position you found it. Splint with anything stiff (branch, ski pole, rolled foam pad), padded, reaching past the joints above and below the break. Check fingers or toes stay warm and pink after you tie it. A cold pack wrapped in cloth, 20 minutes at a time. Bone through the skin: cover the wound, don’t push the bone back.'],
      ['🛷','Head, neck or back injury','After a crash, if they hit their head or have neck or back pain, numbness or tingling: keep them still. Hold the head in line with the body. Don’t take the helmet off unless you must to clear the airway. Only move them to get out of danger. If they throw up or pass out and are breathing, roll them onto their side as one unit, keeping the head in line. Confusion, repeated vomiting, or getting sleepier: emergency.'],
      ['⚠️','Shock','Signs: pale, cold, clammy skin, fast weak pulse, fast breathing, anxious or confused. Lay them down, keep them warm and off the cold ground. Raise the legs a little only if it doesn’t hurt and no leg, hip or back injury. Nothing to eat or drink. Stay with them and call 911.'],
      ['🏔','Avalanche burial','Watch where they were last seen. Check for more slides, then search fast: the first 15 minutes matter most. Switch beacons to search, look for gear on the surface, probe. Call 911 if you have signal, but don’t stop searching to do it. When you hit them, dig from downhill of the probe, get to the face and clear the airway first. Then treat for hypothermia.'],
      ['🔥','Burns','Cool the burn under cool running water for 20 minutes (only the burn, to avoid chilling them). Take off rings, watches and tight clothing near it. Cover loosely with plastic wrap or a clean non-stick dressing. No ice, butter or creams, and don’t break blisters. Large burns, burns on the face, hands or groin, or deep burns: get medical help.'],
      ['😮','Choking (adult)','Coughing hard: let them keep coughing. Can’t breathe, cough or speak: stand behind them, give 5 firm back blows between the shoulder blades, then 5 abdominal thrusts (fist just above the belly button, pull in and up). Repeat until it comes out. If they pass out, lower them down, call 911 and start CPR.'],
      ['💓','Chest pain / heart attack','Chest pressure or pain, often spreading to the arm, jaw or back, with sweating, sickness or shortness of breath. Call 911 right away. Have them rest sitting up. If they are not allergic and can swallow, have them chew 1 regular aspirin (325 mg) or 2 low-dose (81 mg). Be ready to do CPR.'],
      ['🐝','Severe allergic reaction','Signs: swelling of the face or throat, trouble breathing, hives, feeling faint. Use their epinephrine auto-injector (EpiPen) in the outer thigh, through clothing if needed. Call 911. Lay them down (sit up if breathing is easier). If no better after 5 minutes and they have a second one, give it.']];
    function rsAid(t){ var h='<div class="ssec" style="border:2px solid #e53935"><h4>Call 911 first if you can</h4>Short reminders that work with no signal. Not a replacement for training: a first aid course makes all of this easier.</div>';
      h+=AID.map(function(a,i){ return '<details class="ssec" style="padding:0"><summary style="padding:9px 10px;cursor:pointer;font:600 13px var(--font);color:var(--fg);list-style-position:inside">'+a[0]+' '+a[1]+'</summary><div style="padding:0 10px 10px;font-size:13px;line-height:1.45;color:var(--fg)">'+a[2]+'</div></details>' }).join('');
      h+='<div class="skynote">Based on Canadian Red Cross and Heart & Stroke first aid guidance. Saved in the app, works offline.</div>'; put(t,h) }

    window.__prep={open:open,slope:setSlope,check:solarCheck,_bands:bands,_threat:threat};
  })();
}});
